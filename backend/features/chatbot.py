from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database.models import User
from auth import get_current_user
from database.database import get_db
from services.chatbot_service import ChatbotService
import json
import asyncio

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

class ChatMessage(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: str

class StreamingChatMessage(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = None

@router.post("/send-message")
async def send_chat_message(
    chat_message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to the chatbot and get a response"""
    return ChatbotService.send_message(
        chat_message.message, 
        chat_message.conversation_history
    )

@router.post("/send-message-stream")
async def send_chat_message_stream(
    chat_message: StreamingChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to the chatbot and get a streaming response"""
    
    async def generate_stream():
        try:
            # Get streaming response from chatbot service
            async for chunk in ChatbotService.send_message_stream(
                chat_message.message, 
                chat_message.conversation_history
            ):
                yield chunk
            
        except Exception as e:
            # For errors, we'll let the service handle them
            raise e
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )

@router.get("/health")
async def chatbot_health():
    """Check if chatbot is properly configured"""
    return ChatbotService.get_health_status()

@router.post("/reset-chat")
async def reset_chat(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reset the chat session"""
    return ChatbotService.reset_chat() 