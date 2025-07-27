from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import User
from auth import get_current_user
from database import get_db
from services.user_service import UserService
from typing import Dict, Any

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/profile")
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get current user's profile with statistics"""
    # Get user ID from JWT payload (we'll need to modify auth to include user ID)
    # For now, get by email
    db_user = UserService.get_user_by_email(db, current_user.email)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = UserService.get_user_profile(db, db_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    return profile

@router.put("/profile")
async def update_user_profile(
    profile_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Update current user's profile"""
    db_user = UserService.get_user_by_email(db, current_user.email)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = UserService.update_user(db, db_user.id, profile_data)
    if not updated_user:
        raise HTTPException(status_code=404, detail="Failed to update user")
    
    return {
        "id": updated_user.id,
        "email": updated_user.email,
        "name": updated_user.name,
        "picture_url": updated_user.picture_url,
        "message": "Profile updated successfully"
    } 