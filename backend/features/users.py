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

# Admin-only decorator
def require_admin(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Check if current user is admin"""
    if not current_user.role or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get the full user object from database to get the ID
    db_user = UserService.get_user_by_email(db, current_user.email)
    if not db_user:
        raise HTTPException(status_code=401, detail="User not found in database")
    
    # Add the ID to the user object
    current_user.id = db_user.id
    return current_user

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

# Admin-only endpoints
@router.get("/admin/list", response_model=List[UserResponse])
async def list_users(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> List[UserResponse]:
    """List all users (admin only)"""
    users = UserService.get_all_users(db)
    return [
        UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            picture_url=user.picture_url or "",
            role=user.role.value,
            is_active=user.is_active,
            created_at=user.created_at.isoformat() if user.created_at else ""
        )
        for user in users
    ]

@router.post("/admin/create", response_model=UserResponse)
async def create_user(
    user_data: CreateUserRequest,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> UserResponse:
    """Create a new user (admin only)"""
    # Check if user already exists by email
    existing_user = UserService.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Create user data dict
    user_dict = {
        "email": user_data.email,
        "name": user_data.name,
        "picture": None
    }
    
    try:
        # Create user with specified role
        db_user = UserService.create_user_with_role(db, user_dict, user_data.role)
        
        return UserResponse(
            id=db_user.id,
            email=db_user.email,
            name=db_user.name,
            picture_url=db_user.picture_url or "",
            role=db_user.role.value,
            is_active=db_user.is_active,
            created_at=db_user.created_at.isoformat() if db_user.created_at else ""
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@router.put("/admin/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UpdateUserRequest,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> UserResponse:
    """Update user (admin only)"""
    db_user = UserService.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Update user
        update_data = {
            "name": user_data.name,
            "role": user_data.role
        }
        
        updated_user = UserService.update_user_with_role(db, user_id, update_data)
        
        if not updated_user:
            raise HTTPException(status_code=404, detail="Failed to update user")
        
        return UserResponse(
            id=updated_user.id,
            email=updated_user.email,
            name=updated_user.name,
            picture_url=updated_user.picture_url or "",
            role=updated_user.role.value,
            is_active=updated_user.is_active,
            created_at=updated_user.created_at.isoformat() if updated_user.created_at else ""
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")

@router.delete("/admin/{user_id}")
async def delete_user(
    user_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Delete user (admin only)"""
    # Prevent admin from deleting themselves
    if admin_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    db_user = UserService.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = UserService.delete_user(db, user_id)
    if not result["success"]:
        if "related_data" in result:
            # User has related data - return detailed error
            related_data = result["related_data"]
            error_message = f"Cannot delete user. User has: {related_data['credit_cards']} credit cards, {related_data['ledger_entries']} expenses, {related_data['fitness_entries']} fitness entries, and {related_data['travel_entries']} travel entries."
            raise HTTPException(status_code=400, detail=error_message)
        else:
            # Other error
            raise HTTPException(status_code=500, detail=result["error"])
    
    return {"message": "User deleted successfully"} 

@router.get("/list-names")
async def list_user_names(
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """List all user names for dropdown (no auth required)"""
    users = UserService.get_all_users(db)
    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
        for user in users
    ]