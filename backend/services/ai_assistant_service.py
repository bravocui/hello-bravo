import asyncio
import logging
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from database.db_models import SpendingCategory as DBSpendingCategory
from pydantic import BaseModel
from google import genai
from google.genai import types
import json
import base64
from PIL import Image
import io
import os
from fastapi import HTTPException, UploadFile
from config import MODEL_NAME_GENAI
from google.adk.agents import Agent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai.types import Blob, Content, Part

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Google Generative AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    logger.error("GOOGLE_API_KEY environment variable is required for ADK")
    raise ValueError("GOOGLE_API_KEY environment variable is required for ADK")
else:
    logger.info("✅ Google API key configured successfully")

class AIAssistantRequest(BaseModel):
    prompt: str
    images: Optional[List[str]] = []  # Base64 encoded images

class ExpenseEntry(BaseModel):
    category: str
    amount: float
    year: Optional[int] = None
    month: Optional[int] = None
    notes: Optional[str] = ""

class AIAssistantResponse(BaseModel):
    entries: List[ExpenseEntry]
    confidence: float
    raw_response: str
    full_prompt: str

class AIAssistantService:
    def __init__(self):
        """Initialize the ADK service with session management"""
        logger.info("🚀 Initializing AI Assistant Service with ADK")
        self.session_service = InMemorySessionService()
        self.app_name = "ledger_app"
        self.agent = None
        self.runner = None
        logger.info("✅ AI Assistant Service initialized")
    
    def _get_available_categories(self, db: Session) -> List[str]:
        """Get available spending categories from database"""
        logger.info("📊 Fetching available spending categories from database")
        try:
            categories = db.query(DBSpendingCategory).all()
            category_names = [cat.category_name for cat in categories]
            logger.info(f"✅ Found {len(category_names)} categories: {category_names}")
            return category_names
        except Exception as e:
            logger.error(f"❌ Database error while fetching categories: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    def _create_system_prompt(self, category_names: List[str]) -> str:
        """Create the system prompt for AI processing"""
        category_names_str = ', '.join(category_names)
        logger.info(f"📝 Creating system prompt with categories: {category_names_str}")
        
        prompt = f"""
You are an AI assistant that extracts expense information from user input or images.

Extract expense information and return ONLY this JSON format:
[
    {{
        "category": "exact_category_name",
        "amount": number,
        "year": number (optional),
        "month": number (optional),
        "notes": "brief explanation"
    }}
]

IMPORTANT: You must use ONLY these exact category names from the database:
{', '.join(category_names)}. If no match, use "Others". 

Rules:
- Use ONLY the exact category names in this list: {', '.join(category_names)}
- If no match, use "Others". Merge all "Others" into one entry, with short note explaining how you calculated the amount from the input.
- Respond with ONLY the JSON array - no other text
- No explanations, no conversation, no markdown
- Just the raw JSON array

Example input: "I spent $25 on lunch today"
Example output: [{{"category": "Food", "amount": 25, "notes": "Lunch expense"}}]

Example Bad Notes of "Others" category: Extracted from the 'Shopping' row in the provided spending breakdown.
Example Bad Notes of "Others" category: Calculated by summing 'Personal' ($13.42) and 'Home' ($11.67) expenses, as these categories are not in the allowed list.
Example Good Notes of "Others" category: From 'Shopping' row.
Example Good Notes of "Others" category: Sum: 'Personal' ($13.42) + 'Home' ($11.67) = $25.09.
        """

        logger.info("✅ System prompt created successfully")
        logger.debug(f"📋 System prompt length: {len(prompt)} characters")
        logger.debug(f"📋 System prompt preview: {prompt[:200]}...")
        return prompt

    def _initialize_agent_and_runner(self, db: Session):
        """Initialize the ADK agent and runner with database context"""
        logger.info("🤖 Initializing ADK agent and runner")
        category_names = self._get_available_categories(db)
        system_prompt = self._create_system_prompt(category_names)
        
        logger.info(f"🤖 Creating agent with prompt length: {len(system_prompt)}")
        
        # Create the agent
        self.agent = Agent(
            name="ExpenseProcessor",
            model=MODEL_NAME_GENAI,
            description="Agent to extract and process expense information from text and images",
            instruction=system_prompt
        )
        
        logger.info(f"🤖 Agent created with instruction length: {len(self.agent.instruction)}")
        
        # Create the runner
        self.runner = Runner(
            agent=self.agent,
            app_name=self.app_name,
            session_service=self.session_service
        )
        
        logger.info(f"✅ ADK Agent initialized: {self.agent.name} using model {self.agent.model}")
        logger.info(f"✅ ADK Runner initialized with app_name: {self.app_name}")

    async def _get_or_create_session(self, user_id: str = "default_user"):
        """Get an existing session if it exists, otherwise create a new one."""
		# WARNING: This is vulnerable to race conditions!
		# This is provided solely as an example for demonstration purposes.
		# DO NOT USE THIS PATTERN IN PRODUCTION.
        logging.info("Checking existing session")

        existing_sessions = self.session_service.list_sessions(
			app_name=self.app_name, user_id=user_id
		)
        if existing_sessions.sessions:
            logging.info("Reusing existing session")
            return existing_sessions.sessions[0]

        logging.info("Creating new session with no context")
        return self.session_service.create_session(
            app_name=self.app_name, user_id=user_id
        )

    def _process_image(self, image_file: UploadFile) -> Part:
        """Process an uploaded image file and return a Part for ADK"""
        logger.info(f"🖼️ Processing image: {image_file.filename} ({image_file.content_type})")
        
        if not image_file.content_type.startswith('image/'):
            logger.error(f"❌ Invalid file type: {image_file.content_type}")
            raise HTTPException(status_code=400, detail=f"Invalid file type: {image_file.content_type}")
        
        try:
            # Read and process the image
            image_data = image_file.file.read()
            image = Image.open(io.BytesIO(image_data))
            logger.info(f"📏 Original image size: {image.size}")
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                logger.info(f"🔄 Converting image from {image.mode} to RGB")
                image = image.convert('RGB')
            
            # Resize if too large (Gemini has size limits)
            max_size = 1024
            if max(image.size) > max_size:
                ratio = max_size / max(image.size)
                new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
                image = image.resize(new_size, Image.Resampling.LANCZOS)
                logger.info(f"📐 Resized image to: {new_size}")
            
            # Save the processed image back to bytes
            processed_image_bytes = io.BytesIO()
            image.save(processed_image_bytes, format='JPEG')
            processed_image_bytes.seek(0)
            
            # Create a Blob and Part for the processed image
            image_blob = Blob(data=processed_image_bytes.getvalue(), mime_type='image/jpeg')
            image_part = Part.from_blob(image_blob)
            logger.info("✅ Image processed successfully")
            return image_part
            
        except Exception as e:
            logger.error(f"❌ Error processing image: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")

    async def process_expense_with_ai(self, db: Session, prompt: str, images: List[UploadFile] = None, user_id: str = "default_user", session_id: str = "default_session") -> AIAssistantResponse:
        """Process text and images to extract expense information using ADK"""
        logger.info(f"🔄 Starting expense processing for user {user_id}, session {session_id}")
        logger.info(f"📝 Prompt: {prompt[:100]}{'...' if len(prompt) > 100 else ''}")
        logger.info(f"🖼️ Number of images: {len(images) if images else 0}")
        
        try:
            # Initialize agent and runner if not already done
            if not self.agent or not self.runner:
                logger.info("🤖 Agent or runner not initialized, creating new agent and runner")
                self._initialize_agent_and_runner(db)
            else:
                logger.info("✅ Using existing agent and runner")
            
            # Create session before using runner
            logger.info(f"📋 Creating session for user {user_id}, session {session_id}")
            session = await self._get_or_create_session(user_id)
            logger.info(f"✅ Session created successfully {str(session.id)}")
           
            # Prepare message parts
            logger.info("📦 Preparing message parts")
            message_parts = [Part(text=prompt)]
            
            # Add images if provided
            if images:
                logger.info(f"🖼️ Processing {len(images)} images")
                for i, image_file in enumerate(images):
                    logger.info(f"🖼️ Processing image {i+1}/{len(images)}: {image_file.filename}")
                    image_part = self._process_image(image_file)
                    message_parts.append(image_part)
            
            # Create the user message
            user_message = Content(role="user", parts=message_parts)
            logger.info(f"📨 Created user message with {len(message_parts)} parts")
            
            # Use the runner to process the message (runner handles sessions internally)
            logger.info("🤖 Using ADK runner to process message")
            try:
                response_events = self.runner.run(
                    user_id=user_id,
                    session_id=session.id,
                    new_message=user_message
                )
                
                # Extract response from events
                response_text = ""
                all_events = []
                
                logger.info("📨 Processing response events")
                for event in response_events:
                    all_events.append(event)
                    logger.info(f"📨 Received event: {type(event).__name__}")
                    
                    # Try to extract text from the event
                    if hasattr(event, 'content') and event.content:
                        if hasattr(event.content, 'parts') and event.content.parts:
                            # Extract text from Content object
                            text_parts = []
                            for part in event.content.parts:
                                if hasattr(part, 'text') and part.text:
                                    text_parts.append(part.text)
                            response_text = ' '.join(text_parts).strip()
                            logger.info(f"✅ Found content in event: {response_text[:100]}...")
                            break
                        else:
                            response_text = str(event.content).strip()
                            logger.info(f"✅ Found content in event: {response_text[:100]}...")
                            break
                    elif hasattr(event, 'text') and event.text:
                        response_text = event.text.strip()
                        logger.info(f"✅ Found text in event: {response_text[:100]}...")
                        break
                    elif hasattr(event, 'message') and event.message:
                        if hasattr(event.message, 'content') and event.message.content:
                            if hasattr(event.message.content, 'parts') and event.message.content.parts:
                                # Extract text from Content object
                                text_parts = []
                                for part in event.message.content.parts:
                                    if hasattr(part, 'text') and part.text:
                                        text_parts.append(part.text)
                                response_text = ' '.join(text_parts).strip()
                                logger.info(f"✅ Found message content: {response_text[:100]}...")
                                break
                            else:
                                response_text = str(event.message.content).strip()
                                logger.info(f"✅ Found message content: {response_text[:100]}...")
                                break
                        elif hasattr(event.message, 'text') and event.message.text:
                            response_text = event.message.text.strip()
                            logger.info(f"✅ Found message text: {response_text[:100]}...")
                            break
                
                logger.info(f"📊 Collected {len(all_events)} events from runner")
                
                # If no response text found, try to extract from all events
                if not response_text and all_events:
                    logger.info("🔍 No direct response found, analyzing all events")
                    for i, event in enumerate(all_events):
                        logger.info(f"📋 Event {i}: {type(event).__name__} - {str(event)[:100]}...")
                        # Try to get any text content from the event
                        if hasattr(event, '__str__'):
                            event_str = str(event)
                            if event_str and event_str != "None":
                                response_text = event_str.strip()
                                logger.info(f"✅ Using event string as response: {response_text[:100]}...")
                                break
                
                if not response_text:
                    logger.warning("⚠️ No response text found from runner events")
                    response_text = "No response from agent"
                    
                logger.info("✅ Runner processing completed successfully")
                
            except Exception as e:
                logger.error(f"❌ Runner processing failed: {str(e)}")
                response_text = f"Runner Error: {str(e)}"
                
            logger.info(f"📄 Raw response length: {len(response_text)} characters")
            logger.debug(f"📄 Raw response: {response_text[:200]}{'...' if len(response_text) > 200 else ''}")
            
            # Try to parse JSON from the response
            logger.info("🔍 Attempting to parse JSON response")
            try:
                # Look for JSON in the response (it might be wrapped in markdown)
                if '```json' in response_text:
                    logger.info("📋 Found JSON in markdown code block")
                    # Extract JSON from markdown code block
                    start = response_text.find('```json') + 7
                    end = response_text.find('```', start)
                    json_str = response_text[start:end].strip()
                elif '```' in response_text:
                    logger.info("📋 Found JSON in code block")
                    # Extract JSON from code block
                    start = response_text.find('```') + 3
                    end = response_text.find('```', start)
                    json_str = response_text[start:end].strip()
                else:
                    logger.info("📋 Looking for JSON array in response")
                    # Try to find JSON array in the response
                    start = response_text.find('[')
                    end = response_text.rfind(']') + 1
                    if start != -1 and end != 0:
                        json_str = response_text[start:end]
                        logger.info("✅ Found JSON array in response")
                    else:
                        json_str = response_text
                        logger.warning("⚠️ No JSON array found, using full response")
                
                # Parse the JSON
                parsed_data = json.loads(json_str)
                logger.info("✅ JSON parsed successfully")
                
                entries = []

                # Validate the structure
                if not isinstance(parsed_data, list):
                    logger.error("❌ Response is not a list")
                    # raise ValueError("Response is not a list")
                
                for i, item in enumerate(parsed_data):
                    if not isinstance(item, dict):
                        logger.warning(f"⚠️ Skipping non-dict item {i}")
                        continue
                    
                    # Validate required fields
                    if 'category' not in item or 'amount' not in item:
                        logger.warning(f"⚠️ Skipping item {i} with missing required fields")
                        continue
                    
                    # Create expense entry
                    entry = ExpenseEntry(
                        category=item['category'],
                        amount=float(item['amount']),
                        year=item.get('year'),
                        month=item.get('month'),
                        notes=item.get('notes', '')
                    )
                    entries.append(entry)
                    logger.info(f"✅ Created entry {i+1}: {entry.category} - ${entry.amount}")
                
                # Calculate confidence based on response quality
                confidence = 0.8 if entries else 0.0
                logger.info(f"📊 Processed {len(entries)} entries with confidence {confidence}")
                
                return AIAssistantResponse(
                    entries=entries,
                    confidence=confidence,
                    raw_response=response_text,
                    full_prompt=f"System prompt + User input: {prompt}"
                )
                
            except (json.JSONDecodeError, ValueError, KeyError) as e:
                logger.error(f"❌ JSON parsing failed: {str(e)}")
                # If JSON parsing fails, return the raw response for debugging
                return AIAssistantResponse(
                    entries=[],
                    confidence=0.0,
                    raw_response=f"Failed to parse AI response as JSON: {str(e)}\n\nRaw response:\n{response_text}",
                    full_prompt=f"System prompt + User input: {prompt}"
                )
                
        except Exception as e:
            logger.error(f"❌ AI processing failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"AI processing failed: {str(e)}"
            )

    def get_health_status(self) -> Dict[str, Any]:
        """Get AI assistant health status"""
        logger.info("🏥 Checking AI assistant health status")
        status = {
            "status": "healthy" if GOOGLE_API_KEY else "unconfigured",
            "model_available": GOOGLE_API_KEY is not None,
            "api_key_configured": GOOGLE_API_KEY is not None,
            "adk_initialized": self.agent is not None,
            "runner_initialized": self.runner is not None,
            "session_service_available": self.session_service is not None
        }
        logger.info(f"🏥 Health status: {status}")
        return status

# Create a singleton instance
logger.info("🏗️ Creating AI Assistant Service singleton")
ai_assistant_service = AIAssistantService() 
