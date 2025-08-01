from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.models import User, UserRole
from auth import get_current_user
from database.database import get_db
from services.user_service import UserService
from typing import Dict, Any, List
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["users"])

# Pydantic models for user management
class CreateUserRequest(BaseModel):
    email: str
    name: str
    role: UserRole = UserRole.REGULAR

class UpdateUserRequest(BaseModel):
    name: str
    role: UserRole

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    picture_url: str
    role: str
    is_active: bool
    created_at: str

# Helper functions to reduce code duplication
def _get_current_db_user(current_user: User, db: Session) -> User:
    """Get the full user object from database"""
    db_user = UserService.get_user_by_email(db, current_user.email)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

def _require_admin(current_user: User, db: Session) -> User:
    """Check if current user is admin and return full user object"""
    if not current_user.role or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db_user = _get_current_db_user(current_user, db)
    db_user.id = db_user.id  # Ensure ID is set
    return db_user

def _user_to_response(user: User) -> UserResponse:
    """Convert user object to response model"""
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        picture_url=user.picture_url or "",
        role=user.role.value,
        is_active=user.is_active,
        created_at=user.created_at.isoformat() if user.created_at else ""
    )

def _handle_service_error(e: Exception, operation: str) -> None:
    """Handle service errors consistently"""
    if isinstance(e, ValueError):
        raise HTTPException(status_code=400, detail=str(e))
    else:
        raise HTTPException(status_code=500, detail=f"Failed to {operation}: {str(e)}")

# Regular user endpoints
@router.get("/profile")
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get current user's profile with statistics"""
    db_user = _get_current_db_user(current_user, db)
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
    db_user = _get_current_db_user(current_user, db)
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

# Admin endpoints
@router.get("/admin/list", response_model=List[UserResponse])
async def list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[UserResponse]:
    """List all users (admin only)"""
    admin_user = _require_admin(current_user, db)
    users = UserService.get_all_users(db)
    return [_user_to_response(user) for user in users]

@router.post("/admin/create", response_model=UserResponse)
async def create_user(
    user_data: CreateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserResponse:
    """Create a new user (admin only)"""
    admin_user = _require_admin(current_user, db)
    # Check if user already exists
    existing_user = UserService.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    try:
        user_dict = {
            "email": user_data.email,
            "name": user_data.name,
            "picture": None
        }
        db_user = UserService.create_user_with_role(db, user_dict, user_data.role)
        return _user_to_response(db_user)
    except Exception as e:
        _handle_service_error(e, "create user")

@router.put("/admin/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserResponse:
    """Update user (admin only)"""
    admin_user = _require_admin(current_user, db)
    db_user = UserService.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        update_data = {"name": user_data.name, "role": user_data.role}
        updated_user = UserService.update_user_with_role(db, user_id, update_data)
        if not updated_user:
            raise HTTPException(status_code=404, detail="Failed to update user")
        return _user_to_response(updated_user)
    except Exception as e:
        _handle_service_error(e, "update user")

@router.delete("/admin/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Delete user (admin only)"""
    admin_user = _require_admin(current_user, db)
    # Prevent admin from deleting themselves
    if admin_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    db_user = UserService.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = UserService.delete_user(db, user_id)
    if not result["success"]:
        if "related_data" in result:
            related_data = result["related_data"]
            error_message = f"Cannot delete user. User has: {related_data['credit_cards']} credit cards, {related_data['ledger_entries']} expenses, {related_data['fitness_entries']} fitness entries, and {related_data['travel_entries']} travel entries."
            raise HTTPException(status_code=400, detail=error_message)
        else:
            raise HTTPException(status_code=500, detail=result["error"])
    
    return {"message": "User deleted successfully"}

@router.get("/list-names")
async def list_user_names(
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """List all user names for dropdown (no auth required)"""
    users = UserService.get_all_users(db)
    return [
        {"id": user.id, "name": user.name, "email": user.email}
        for user in users
    ]