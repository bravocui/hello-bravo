import asyncio
import logging
from typing import Dict, Any, AsyncGenerator

from fastapi import HTTPException
from google.genai.types import Content, Part

from config import GOOGLE_API_KEY, MODEL_NAME_GENAI
from llm.adk_runtime import adk_runtime
from llm.chatbot_agent import chatbot_agent

# Configure logging
logger = logging.getLogger(__name__)

# Validate Google API key
assert GOOGLE_API_KEY, "GOOGLE_API_KEY environment variable is required for ADK"

# App name for ADK
CHATBOT_APP_NAME = "chatbot_app"


class ChatbotService:
    """Service for handling chatbot interactions using ADK"""

    def __init__(self):
        """Initialize the ChatbotService with ADK runner"""
        self.app_name = CHATBOT_APP_NAME
        self.agent = chatbot_agent
        self.runner = adk_runtime.get_or_create_runner(self.app_name, self.agent)
        logger.info("[OK] Chatbot Service initialized")

    def _parse_response(self, response_text: str) -> str:
        """Parse the response to remove the [eom] tag"""
        return response_text.replace("[eom]", "").strip()

    async def send_message(
        self, message: str, user_id: str = "default_user"
    ) -> Dict[str, Any]:
        """Send a message to the chatbot and get a response"""
        logger.info(f"[START] Processing chat message for user {user_id}")

        try:
            # Get or create a session for the user
            session = adk_runtime.get_or_create_session(self.app_name, user_id)

            # Create the user message
            user_message = Content(role="user", parts=[Part(text=message)])

            # Use the runner to process the message
            response_events = self.runner.run(
                user_id=user_id, session_id=session.id, new_message=user_message
            )

            # Extract the final response text
            response_text = ""
            for event in response_events:
                if event.is_final_response() and event.content and event.content.parts:
                    response_text = "".join(
                        [part.text if part.text else "" for part in event.content.parts]
                    )
                    break
            
            if not response_text:
                logger.warning("[WARN] No response text found from runner events")
                response_text = "Sorry, I could not process your request."

            # Parse the response to clean it up
            cleaned_response = self._parse_response(response_text)

            return {
                "response": cleaned_response,
                "timestamp": "2024-01-01T00:00:00Z",  # Placeholder timestamp
            }

        except Exception as e:
            logger.error(f"[ERROR] Chatbot processing failed: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Chatbot processing failed: {str(e)}"
            )

    async def send_message_stream(
        self, message: str, user_id: str = "default_user"
    ) -> AsyncGenerator[str, None]:
        """Send a message and get a streaming response"""
        logger.info(f"[START] Processing chat stream for user {user_id}")

        try:
            # Get or create a session for the user
            session = adk_runtime.get_or_create_session(self.app_name, user_id)

            # Create the user message
            user_message = Content(role="user", parts=[Part(text=message)])

            # Use the runner to process the message in a streaming fashion
            response_events = self.runner.run(
                user_id=user_id, session_id=session.id, new_message=user_message, stream=True
            )

            # Yield response chunks
            async for event in response_events:
                if event.is_content_delta() and event.content_delta and event.content_delta.parts:
                    chunk_text = "".join(
                        [part.text if part.text else "" for part in event.content_delta.parts]
                    )
                    # Clean the chunk before yielding
                    cleaned_chunk = self._parse_response(chunk_text)
                    if cleaned_chunk:
                        yield cleaned_chunk

        except Exception as e:
            logger.error(f"[ERROR] Chatbot streaming failed: {str(e)}")
            # This is a generator, so we can't raise an HTTPException directly.
            # The calling endpoint should handle this.
            yield f"Error: {str(e)}"


    def get_health_status(self) -> Dict[str, Any]:
        """Get chatbot health status"""
        return {
            "status": "healthy" if self.runner else "unconfigured",
            "model_available": GOOGLE_API_KEY is not None,
            "adk_initialized": self.agent is not None,
            "runner_initialized": self.runner is not None,
            "adk_runtime_available": adk_runtime is not None,
            "chatbot_agent_available": True,
            "model": MODEL_NAME_GENAI
        }


# Create a singleton instance
logger.info("[BUILD] Creating Chatbot Service singleton")
chatbot_service = ChatbotService()