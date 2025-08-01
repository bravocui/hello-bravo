from typing import Dict, Any, Optional
from google import genai
from google.genai import types
import os
from fastapi import HTTPException
import asyncio
import logging
from config import MODEL_NAME_GENAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Google Generative AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def create_system_prompt() -> str:
    """Create the system prompt for the chatbot"""
    return """You are a helpful AI assistant for a personal life tracking application. 
    
    Your role is to help users with:
    - General questions about their personal data
    - Guidance on using the application features
    - Simple calculations and analysis
    - Friendly conversation and support
    
    Keep your responses:
    - Helpful and informative
    - Conversational and friendly
    - Concise but thorough (aim for 2-3 sentences)
    - Focused on personal life tracking topics when relevant
    
    You can help with questions about expenses, fitness tracking, travel, weather, and general life management topics.

    ALWAYS add [eom] at the end of your response, in a new line.
    
    IMPORTANT: Keep responses concise and complete. Avoid long, rambling responses.
    """

def _raise_service_not_configured_error() -> None:
    """Raise HTTPException for unconfigured chatbot service"""
    raise HTTPException(
        status_code=500, 
        detail="Chatbot service not configured. Please set GOOGLE_API_KEY environment variable."
    )

def _raise_processing_error(error_message: str) -> None:
    """Raise HTTPException for chatbot processing errors"""
    raise HTTPException(
        status_code=500,
        detail=f"Chatbot processing failed: {error_message}"
    )

def _raise_reset_error(error_message: str) -> None:
    """Raise HTTPException for chat reset errors"""
    raise HTTPException(
        status_code=500,
        detail=f"Failed to reset chat session: {error_message}"
    )

# Initialize client and chat session
if GOOGLE_API_KEY:
    client = genai.Client(api_key=GOOGLE_API_KEY)
    chat = client.chats.create(
        model=MODEL_NAME_GENAI,
        config=types.GenerateContentConfig(
            system_instruction=create_system_prompt(),
            # max_output_tokens=50,
            temperature=0.3,
            top_p=0.8,
            top_k=20,
        ),
        history=[]
    )
else:
    logger.warning("GOOGLE_API_KEY not found, chatbot service will be unavailable")
    client = None
    chat = None

class ChatMessage:
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content

class ChatbotService:
    @staticmethod
    def send_message(message: str, conversation_history: list = None) -> Dict[str, Any]:
        """Send a message to the chatbot and get a response"""
        
        if not chat:
            logger.error("Chat session not available")
            _raise_service_not_configured_error()
        
        try:
            # Send the message and get response
            response = chat.send_message(message)
            
            result = {
                "response": response.text.strip(),
                "timestamp": "2024-01-01T00:00:00Z"  # You could add actual timestamp logic
            }
            return result
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}", exc_info=True)
            _raise_processing_error(str(e))

    @staticmethod
    async def send_message_stream(message: str, conversation_history: list = None):
        """Send a message to the chatbot and get a streaming response"""
        
        if not chat:
            logger.error("Chat session not available for streaming")
            _raise_service_not_configured_error()
        
        try:
            # Send the message and get streaming response
            response_stream = chat.send_message_stream(message)
            
            # Stream the response chunks as simple text
            for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
                    
        except Exception as e:
            logger.error(f"Error during streaming: {str(e)}", exc_info=True)
            _raise_processing_error(str(e))

    @staticmethod
    def get_health_status() -> Dict[str, Any]:
        """Get chatbot health status"""
        status = "healthy" if chat else "unconfigured"
        
        return {
            "status": status,
            "model": MODEL_NAME_GENAI if chat else None,
            "api_key_configured": bool(GOOGLE_API_KEY)
        }

    @staticmethod
    def reset_chat() -> Dict[str, Any]:
        """Reset the chat session by recreating it"""
        global chat
        
        if not GOOGLE_API_KEY:
            logger.error("Cannot reset chat: GOOGLE_API_KEY not found")
            _raise_service_not_configured_error()
        
        try:
            # Recreate the chat session
            chat = client.chats.create(
                model=MODEL_NAME_GENAI,
                config=types.GenerateContentConfig(
                    system_instruction=create_system_prompt(),
                    temperature=0.3,
                    top_p=0.8,
                    top_k=20,
                ),
                history=[]
            )
            
            return {
                "status": "success",
                "message": "Chat session reset successfully"
            }
            
        except Exception as e:
            logger.error(f"Error resetting chat session: {str(e)}", exc_info=True)
            _raise_reset_error(str(e)) 