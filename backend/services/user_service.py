from sqlalchemy.orm import Session
from db_models import User
from models import User as UserSchema
from typing import Optional, List
import json

class UserService:
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def create_user(db: Session, user_data: dict) -> User:
        """Create a new user"""
        db_user = User(
            email=user_data["email"],
            name=user_data["name"],
            picture_url=user_data.get("picture")
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_data: dict) -> Optional[User]:
        """Update user profile"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return None
        
        # Update fields
        if "name" in user_data:
            db_user.name = user_data["name"]
        if "picture_url" in user_data:
            db_user.picture_url = user_data["picture_url"]
        
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def get_or_create_user(db: Session, user_data: dict) -> User:
        """Get existing user or create new one"""
        user = UserService.get_user_by_email(db, user_data["email"])
        if user:
            return user
        return UserService.create_user(db, user_data)
    
    @staticmethod
    def get_user_profile(db: Session, user_id: int) -> Optional[dict]:
        """Get user profile with statistics"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        # Get basic stats
        fitness_count = len(user.fitness_entries)
        travel_count = len(user.travel_entries)
        ledger_count = len(user.ledger_entries)
        
        # Calculate total expenses
        total_expenses = sum(entry.amount for entry in user.ledger_entries)
        
        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "picture_url": user.picture_url,
            "created_at": user.created_at,
            "stats": {
                "fitness_entries": fitness_count,
                "travel_entries": travel_count,
                "ledger_entries": ledger_count,
                "total_expenses": total_expenses
            }
        } 