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
from fastapi import HTTPException, UploadFile
from config import MODEL_NAME_GENAI, GOOGLE_API_KEY
from google.adk.agents import Agent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai.types import Blob, Content, Part
from llm.utils import process_image
from llm.adk_runtime import adk_runtime
from llm.expense_processor_agent import expense_processor_agent

# Global constants
LEDGER_APP_NAME = "ledger_app"

# Configure logging
logger = logging.getLogger(__name__)

# Validate Google API key
assert GOOGLE_API_KEY, "GOOGLE_API_KEY environment variable is required for ADK"


class ExpenseEntry(BaseModel):
    category: str
    amount: float
    notes: Optional[str] = ""


class AIAssistantResponse(BaseModel):
    year: Optional[int] = None
    month: Optional[int] = None
    entries: List[ExpenseEntry]
    raw_response: str


class AIAssistantService:
    def __init__(self):
        """Initialize the ADK service with session management"""
        self.app_name = LEDGER_APP_NAME
        
        # Initialize agent and runner
        self.agent = expense_processor_agent
        self.runner = adk_runtime.get_or_create_runner(self.app_name, self.agent)
        logger.info("[OK] AI Assistant Service initialized")

    def _parse_and_validate_response(self, response_text: str, prompt: str) -> tuple[List[ExpenseEntry], int, int]:
        """Parse and validate the AI response to extract expense entries, year, and month"""
        logger.info("[PARSE] Attempting to parse JSON response")
        try:
            # Look for JSON in the response (it might be wrapped in markdown)
            if "```json" in response_text:
                logger.info("[JSON] Found JSON in markdown code block")
                # Extract JSON from markdown code block
                start = response_text.find("```json") + 7
                end = response_text.find("```", start)
                json_str = response_text[start:end].strip()
            elif "```" in response_text:
                # Extract JSON from code block
                start = response_text.find("```") + 3
                end = response_text.find("```", start)
                json_str = response_text[start:end].strip()
            else:
                # Try to find JSON object in the response
                start = response_text.find("{")
                end = response_text.rfind("}") + 1
                if start != -1 and end != 0:
                    json_str = response_text[start:end]
                else:
                    logger.warning(f"[WARN] No JSON object found. Full response {response_text}.")
                    return [], None, None

            # Parse the JSON
            parsed_data = json.loads(json_str)

            # Extract year and month from the response (leave as None if not found)
            year = parsed_data.get("year")
            month = parsed_data.get("month")
            
            # Extract entries array
            entries_data = parsed_data.get("entries", [])
            if not isinstance(entries_data, list):
                logger.warning("[WARN] No entries array found, using empty array")
                entries_data = []

            # Validate with pydantic
            entries = []
            for item in entries_data:
                entry = ExpenseEntry(
                    category=item["category"],
                    amount=float(item["amount"]),
                    notes=item.get("notes", ""),
                )
                entries.append(entry)

            return entries, year, month

        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"[ERROR] JSON parsing failed: {str(e)}")
            # If JSON parsing fails, return empty entries with no year/month
            return [], None, None


    async def process_expense_with_ai(
        self,
        prompt: str,
        images: List[UploadFile] = None,
        user_id: str = "default_user",
    ) -> AIAssistantResponse:
        """Process text and images to extract expense information using ADK"""
        logger.info(f"[START] Starting expense processing for user {user_id}")

        try:
            # Create session before using runner
            session = adk_runtime.get_or_create_session(self.app_name, user_id)
            logger.info(f"[OK] Session created successfully {str(session.id)}")

            # Compose user message :  add parts for prompt and images, if any.
            message_parts = [Part(text=prompt)]
            for image_file in (images or []):
                message_parts.append(process_image(image_file))
            user_message = Content(role="user", parts=message_parts)

            # Use the runner to process the message (runner handles sessions internally)
            response_events = self.runner.run(
                user_id=user_id, session_id=session.id, new_message=user_message
            )
            # Extract response from events
            response_text = ""
            for event in response_events:
                if event.is_final_response() and event.content and event.content.parts:
                    response_text = ''.join(
                        [part.text if part.text else '' for part in event.content.parts]
                    )
                    break

            if not response_text:
                logger.warning("[WARN] No response text found from runner events")
                response_text = "No response from agent"
            
            entries, year, month = self._parse_and_validate_response(response_text, prompt)
            return AIAssistantResponse(
                year=year,
                month=month,
                entries=entries,
                raw_response=response_text,
            )

        except Exception as e:
            logger.error(f"[ERROR] AI processing failed: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"AI processing failed: {str(e)}"
            )

    def get_health_status(self) -> Dict[str, Any]:
        """Get AI assistant health status"""
        status = {
            "status": "healthy" if GOOGLE_API_KEY else "unconfigured",
            "model_available": GOOGLE_API_KEY is not None,
            "api_key_configured": GOOGLE_API_KEY is not None,
            "adk_initialized": self.agent is not None,
            "runner_initialized": self.runner is not None,
            "adk_runtime_available": adk_runtime is not None,
            "expense_processor_agent_available": True,
        }
        return status


# Create a singleton instance
logger.info("[BUILD] Creating AI Assistant Service singleton")
ai_assistant_service = AIAssistantService()
