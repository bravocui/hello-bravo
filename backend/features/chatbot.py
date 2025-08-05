from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from auth import get_current_user
from database.models import User
from services.chatbot_service import chatbot_service

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


class ChatMessage(BaseModel):
    message: str


@router.post("/send-message")
async def send_chat_message(
    chat_message: ChatMessage,
    current_user: User = Depends(get_current_user),
):
    """Send a message to the chatbot and get a response"""
    return await chatbot_service.send_message(
        message=chat_message.message, user_id=str(current_user.id)
    )


@router.post("/send-message-stream")
async def send_chat_message_stream(
    chat_message: ChatMessage,
    current_user: User = Depends(get_current_user),
):
    """Send a message to the chatbot and get a streaming response"""
    return StreamingResponse(
        chatbot_service.send_message_stream(
            message=chat_message.message, user_id=str(current_user.id)
        ),
        media_type="text/event-stream",
    )


@router.get("/health")
async def chatbot_health():
    """Check if chatbot is properly configured"""
    return chatbot_service.get_health_status()