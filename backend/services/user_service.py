from sqlalchemy.orm import Session
from db_models import User, UserRole
from models import User as UserSchema
from typing import Optional, List
import json
from config import DATABASE_URL

class UserService:
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        try:
            print(f"🔍 Looking up user by email: {email}")
            user = db.query(User).filter(User.email == email).first()
            if user:
                print(f"✅ User found: {user.email} (ID: {user.id}, Role: {user.role.value})")
            else:
                print(f"❌ User not found: {email}")
            return user
        except Exception as e:
            print(f"❌ Error in get_user_by_email: {e}")
            print(f"🔗 Database URL: {DATABASE_URL}")
            raise
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        try:
            print(f"🔍 Looking up user by ID: {user_id}")
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                print(f"✅ User found by ID: {user.email} (ID: {user.id}, Role: {user.role.value})")
            else:
                print(f"❌ User not found by ID: {user_id}")
            return user
        except Exception as e:
            print(f"❌ Error in get_user_by_id: {e}")
            print(f"🔗 Database URL: {DATABASE_URL}")
            raise
    
    @staticmethod
    def create_user(db: Session, user_data: dict) -> User:
        """Create a new user"""
        try:
            # Set admin role for specific email
            role = UserRole.ADMIN if user_data["email"] == "thucuibo@gmail.com" else UserRole.REGULAR
            
            print(f"Creating user: {user_data['email']} with role: {role.value}")
            
            db_user = User(
                email=user_data["email"],
                name=user_data["name"],
                picture_url=user_data.get("picture"),
                role=role
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            print(f"User created successfully: {db_user.email} (ID: {db_user.id})")
            return db_user
        except Exception as e:
            print(f"Error creating user: {e}")
            print(f"🔗 Database URL: {DATABASE_URL}")
            db.rollback()
            raise
    
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
        try:
            print(f"Getting or creating user: {user_data['email']}")
            user = UserService.get_user_by_email(db, user_data["email"])
            if user:
                print(f"User found: {user.email} (ID: {user.id})")
                return user
            print(f"User not found, creating new user: {user_data['email']}")
            return UserService.create_user(db, user_data)
        except Exception as e:
            print(f"Error in get_or_create_user: {e}")
            print(f"🔗 Database URL: {DATABASE_URL}")
            raise
    
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
            "role": user.role.value,
            "created_at": user.created_at,
            "stats": {
                "fitness_entries": fitness_count,
                "travel_entries": travel_count,
                "ledger_entries": ledger_count,
                "total_expenses": total_expenses
            }
        }
    
    @staticmethod
    def get_all_users(db: Session) -> List[User]:
        """Get all users (admin only)"""
        return db.query(User).order_by(User.created_at.desc()).all()
    
    @staticmethod
    def create_user_with_role(db: Session, user_data: dict, role: UserRole) -> User:
        """Create a new user with specified role"""
        db_user = User(
            email=user_data["email"],
            name=user_data["name"],
            picture_url=user_data.get("picture"),
            role=role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def update_user_with_role(db: Session, user_id: int, user_data: dict) -> Optional[User]:
        """Update user with role"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return None
        
        # Update fields
        if "name" in user_data:
            db_user.name = user_data["name"]
        if "role" in user_data:
            db_user.role = user_data["role"]
        
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        """Delete user (admin only)"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return False
        
        db.delete(db_user)
        db.commit()
        return True 