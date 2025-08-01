from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from database.models import User
from auth import get_current_user
from database.database import get_db
from services.ai_assistant_service import AIAssistantService

router = APIRouter(prefix="/ai-assistant", tags=["ai-assistant"])

@router.post("/process-expense")
async def process_expense_with_ai(
    prompt: str = Form(...),
    images: List[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process text and images to extract expense information using AI"""
    return AIAssistantService.process_expense_with_ai(db, prompt, images)

@router.get("/health")
async def ai_assistant_health():
    """Check if AI assistant is properly configured"""
    return AIAssistantService.get_health_status() 