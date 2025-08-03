import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DbSession
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
import datetime
from zoneinfo import ZoneInfo
from google.adk.sessions import InMemorySessionService, Session as AgentSession
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.genai.types import Blob, Content, Part

from config import MODEL_NAME_GENAI

# Configure Google Generative AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


def create_system_prompt(db: DbSession) -> str:
    """Create the system prompt for AI processing"""
	try:
		categories = db.query(DBSpendingCategory).all()
        category_names = [cat.category_name for cat in categories]
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return f"""
        You are an AI assistant that extracts expense information from credit card statements and receipts.
        
        IMPORTANT: You must use ONLY these exact category names from the database:
        {', '.join(category_names)}
        
        If an expense doesn't match any of these categories, categorize it as "Others".
        
        Analyze the provided text and images to identify expense entries. For each expense found, extract:
        - Category (MUST be one of the exact categories listed above, or "Others" if no match)
        - Amount (as a number)
        - Year and month if mentioned in the text/image
        - Notes explaining how the amount was calculated from the user input

        Aggregate the "Others" category into one entry. In the notes field, explain how you calculated
        the amount from the input.
        
        Return your response as a valid JSON array with this exact structure:
        [
            {{
                "category": "string (must be one of the exact categories listed above)",
                "amount": number,
                "year": number (optional),
                "month": number (optional, 1-12),
                "notes": "string explaining how this amount was calculated from the input"
            }}
        ]
        
        Guidelines:
        - If no year/month is mentioned, omit those fields
        - Categories MUST be exact matches from the provided list, or "Others"
        - Amounts can be positive or negative numbers (negative for credits/refunds)
        - Include both expenses (positive) and credits/refunds (negative)
        - In the notes field, explain how you calculated the amount from the input
        - If you're unsure about any field, omit it rather than guess
        - Sum up multiple small expenses into single entries when appropriate
        - Notes should be short, but concise and to the point

        Example Notes:
        - Bad note: Extracted from the 'Shopping' row in the provided spending breakdown.
        - Bad note: Calculated by summing 'Personal' ($13.42) and 'Home' ($11.67) expenses, as these categories are not in the allowed list.
        - Good note: From 'Shopping' row.
        - Good note: Sum: 'Personal' ($13.42) + 'Home' ($11.67) = $25.09.
   """


# Define Agent
accounting_agent = Agent(
    name="Accounter",
    model=MODEL_NAME_GENAI,
    description=("Agent to generate Ledger entries from user input."),
	instruction = create_system_prompt(db)   # TODO: add db
    # output_key="last_greeting" # Save response to state['last_greeting']
)

# --- Initialized Parameters TODO: get from caller ---
app_name, user_id, session_id = "ledger_app", "user1", "session1"

# --- Setup Runner and Session ---
session_service = InMemorySessionService()
runner = Runner(
    agent=accounting_agent,
    app_name=app_name,
    session_service=session_service
)
session = await session_service.create_session(
    app_name=app_name,
    user_id=user_id,
    session_id=session_id
)
print(f"Initial state: {session.state}")

# --- Run the Agent ---
# Runner handles calling append_event, which uses the output_key
# to automatically create the state_delta.
user_message = Content(parts=[Part(text="Hello")])
response = runner.run(user_id=user_id, session_id=session_id, new_message=user_message)
for event in reponse
    print(f"Agent responded: {event}")
    if event.is_final_response():
        return {"response": agent_response_text}


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
    @staticmethod
    def create_system_prompt(db: DbSession) -> str:
        """Create the system prompt for AI processing"""

        # First Fetch available categories from database
        try:
            categories = db.query(DBSpendingCategory).all()
            return [cat.category_name for cat in categories]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

        category_names = AIAssistantService.get_available_categories(db)

        return f"""
        You are an AI assistant that extracts expense information from credit card statements and receipts.
        
        IMPORTANT: You must use ONLY these exact category names from the database:
        {', '.join(category_names)}
        
        If an expense doesn't match any of these categories, categorize it as "Others".
        
        Analyze the provided text and images to identify expense entries. For each expense found, extract:
        - Category (MUST be one of the exact categories listed above, or "Others" if no match)
        - Amount (as a number)
        - Year and month if mentioned in the text/image
        - Notes explaining how the amount was calculated from the user input

        Aggregate the "Others" category into one entry. In the notes field, explain how you calculated
        the amount from the input.
        
        Return your response as a valid JSON array with this exact structure:
        [
            {{
                "category": "string (must be one of the exact categories listed above)",
                "amount": number,
                "year": number (optional),
                "month": number (optional, 1-12),
                "notes": "string explaining how this amount was calculated from the input"
            }}
        ]
        
        Guidelines:
        - If no year/month is mentioned, omit those fields
        - Categories MUST be exact matches from the provided list, or "Others"
        - Amounts can be positive or negative numbers (negative for credits/refunds)
        - Include both expenses (positive) and credits/refunds (negative)
        - In the notes field, explain how you calculated the amount from the input
        - If you're unsure about any field, omit it rather than guess
        - Sum up multiple small expenses into single entries when appropriate
        - Notes should be short, but concise and to the point

        Example Notes:
        - Bad note: Extracted from the 'Shopping' row in the provided spending breakdown.
        - Bad note: Calculated by summing 'Personal' ($13.42) and 'Home' ($11.67) expenses, as these categories are not in the allowed list.
        - Good note: From 'Shopping' row.
        - Good note: Sum: 'Personal' ($13.42) + 'Home' ($11.67) = $25.09.
        """

    @staticmethod
    def upload_and_chat_multi(
        image_files: Annotated[List[UploadFile], File()],
        user_id: Annotated[str, Form()],
        query: Annotated[str, Form(default="")]
    ):
        """
        Endpoint to upload multiple images and a text query to the ADK agent.
        """
        try:
            user_message_parts = []
            
            # Create the text part from the user's query
            if query:
                user_message_parts.append(Part.from_text(query))

            # Process each uploaded image file
            for image_file in images:
                if image_file.content_type.startswith('image/'):
                    # Read and process the image
                    image_data = image_file.file.read()

                    image = Image.open(io.BytesIO(image_data))
                    # Convert to RGB if necessary
                    if image.mode != 'RGB':
                        image = image.convert('RGB')
                    
                    # Resize if too large (Gemini has size limits)
                    max_size = 1024
                    if max(image.size) > max_size:
                        ratio = max_size / max(image.size)
                        new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
                        image = image.resize(new_size, Image.Resampling.LANCZOS)

                    # Save the processed image back to bytes
                    processed_image_bytes = io.BytesIO()
                    image.save(processed_image_bytes, format='JPEG') # Re-save as JPEG
                    processed_image_bytes.seek(0)

                    # Create a Blob and Part for the processed image
                    image_blob = Blob(data=processed_image_bytes.getvalue(), mime_type='image/jpeg')
                    user_message_parts.append(Part.from_blob(image_blob))
                    


            # Pass the multimodal message (text + all images) to the ADK Runner
            response_messages = await adk_runner.run_async(
                user_content=user_message_parts,
                session_id=user_id
            )

            # Extract and return the agent's response text
            if response_messages:
                agent_response_text = response_messages[-1].text
                return {"response": agent_response_text}
            else:
                return {"response": "The agent did not return a response."}

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


    @staticmethod
    def process_expense_with_ai(db: DbSession, prompt: str, images: List[UploadFile] = None) -> AIAssistantResponse:
        """Process text and images to extract expense information using AI"""
        
        if not client:
            raise HTTPException(
                status_code=500, 
                detail="AI service not configured. Please set GOOGLE_API_KEY environment variable."
            )
        
        try:
            
            # Prepare the prompt for the AI
            system_prompt = AIAssistantService.create_system_prompt(db)
            
            # Prepare contents for AI
            contents = Content(parts=[Part(text=prompt)])
            
            # Add images if provided
            if images:
                for image_file in images:
                    if image_file.content_type.startswith('image/'):
                        # Read and process the image
                        image_data = image_file.file.read()
                        image = Image.open(io.BytesIO(image_data))
                        
                        # Convert to RGB if necessary
                        if image.mode != 'RGB':
                            image = image.convert('RGB')
                        
                        # Resize if too large (Gemini has size limits)
                        max_size = 1024
                        if max(image.size) > max_size:
                            ratio = max_size / max(image.size)
                            new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
                            image = image.resize(new_size, Image.Resampling.LANCZOS)
                        
                        contents.append(image)
                        contents = Content(parts=[Part(text=prompt)])

            # ====== Call the LLM:  approach 2 ==========
            response_text = ""

            # --- Run the Agent ---
            # Runner handles calling append_event, which uses the output_key
            # to automatically create the state_delta.
            user_message = Content(parts=[Part(text="Hello")])
            response = runner.run(user_id=user_id, session_id=session_id, new_message=user_message)
            for event in reponse
                print(f"Agent responded: {event}")
                if event.is_final_response():
                    print(f"Response Completed.\n")
                    response_text = event.content.strip()
            # ====== call the LLM:  end ==========
            

            # Try to parse JSON from the response
            try:
                # Look for JSON in the response (it might be wrapped in markdown)
                if '```json' in response_text:
                    # Extract JSON from markdown code block
                    start = response_text.find('```json') + 7
                    end = response_text.find('```', start)
                    json_str = response_text[start:end].strip()
                elif '```' in response_text:
                    # Extract JSON from code block
                    start = response_text.find('```') + 3
                    end = response_text.find('```', start)
                    json_str = response_text[start:end].strip()
                else:
                    # Try to find JSON array in the response
                    start = response_text.find('[')
                    end = response_text.rfind(']') + 1
                    if start != -1 and end != 0:
                        json_str = response_text[start:end]
                    else:
                        json_str = response_text
                
                # Parse the JSON
                parsed_data = json.loads(json_str)
                
                # Validate the structure
                if not isinstance(parsed_data, list):
                    raise ValueError("Response is not a list")
                
                entries = []
                for item in parsed_data:
                    if not isinstance(item, dict):
                        continue
                    
                    # Validate required fields
                    if 'category' not in item or 'amount' not in item:
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
                
                # Calculate confidence based on response quality
                confidence = 0.8 if entries else 0.0
                
                return AIAssistantResponse(
                    entries=entries,
                    confidence=confidence,
                    raw_response=response_text,
                    full_prompt=full_prompt
                )
                
            except (json.JSONDecodeError, ValueError, KeyError) as e:
                # If JSON parsing fails, return the raw response for debugging
                return AIAssistantResponse(
                    entries=[],
                    confidence=0.0,
                    raw_response=f"Failed to parse AI response as JSON: {str(e)}\n\nRaw response:\n{response_text}",
                    full_prompt=full_prompt
                )
                
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"AI processing failed: {str(e)}"
            )

    @staticmethod
    def get_health_status() -> Dict[str, Any]:
        """Get AI assistant health status"""
        return {
            "status": "healthy" if client else "unconfigured",
            "model_available": client is not None,
            "api_key_configured": GOOGLE_API_KEY is not None
        } 

