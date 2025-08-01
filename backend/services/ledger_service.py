from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict, Any
from database.db_models import LedgerEntry as DBLedgerEntry, User as DBUser
from database.models import CreateLedgerEntryRequest, UpdateLedgerEntryRequest
from fastapi import HTTPException

class LedgerService:
    @staticmethod
    def get_ledger_entries(db: Session, current_user_id: int, is_admin: bool = False) -> List[Dict[str, Any]]:
        """Get all ledger entries - admin can see all, others see only their own"""
        try:
            if is_admin:
                entries = db.query(DBLedgerEntry).options(joinedload(DBLedgerEntry.user)).all()
            else:
                entries = db.query(DBLedgerEntry).options(joinedload(DBLedgerEntry.user)).filter(
                    DBLedgerEntry.user_id == current_user_id
                ).all()
            
            # Convert to response format
            result = []
            for entry in entries:
                user_info = {
                    "id": entry.user.id,
                    "name": entry.user.name,
                    "email": entry.user.email
                } if entry.user else None
                
                result.append({
                    "id": entry.id,
                    "user_id": entry.user_id,
                    "year": entry.year,
                    "month": entry.month,
                    "category": entry.category,
                    "amount": entry.amount,
                    "credit_card": entry.credit_card,
                    "notes": entry.notes,
                    "created_at": entry.created_at,
                    "updated_at": entry.updated_at,
                    "user": user_info
                })
            
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    @staticmethod
    def create_ledger_entry(db: Session, entry_data: CreateLedgerEntryRequest, current_user_id: int) -> Dict[str, Any]:
        """Create a new ledger entry"""
        try:
            # Verify the user exists
            db_user = db.query(DBUser).filter(DBUser.id == entry_data.user_id).first()
            if not db_user:
                raise HTTPException(status_code=400, detail=f"User with ID {entry_data.user_id} not found")
            
            # Check for existing entry with same key tuple
            existing_entry = db.query(DBLedgerEntry).filter(
                DBLedgerEntry.year == entry_data.year,
                DBLedgerEntry.month == entry_data.month,
                DBLedgerEntry.user_id == entry_data.user_id,
                DBLedgerEntry.credit_card == entry_data.credit_card,
                DBLedgerEntry.category == entry_data.category
            ).first()
            
            if existing_entry:
                raise HTTPException(
                    status_code=409, 
                    detail=f"An entry for {entry_data.category} already exists for {entry_data.year}/{entry_data.month:02d}, user {db_user.name}, {entry_data.credit_card} (existing amount: ${existing_entry.amount:.2f}). Please edit the existing entry instead."
                )
            
            # Create new database entry
            db_entry = DBLedgerEntry(
                user_id=entry_data.user_id,
                year=entry_data.year,
                month=entry_data.month,
                category=entry_data.category,
                amount=entry_data.amount,
                credit_card=entry_data.credit_card,
                notes=entry_data.notes
            )
            
            db.add(db_entry)
            db.commit()
            db.refresh(db_entry)
            
            # Return the created entry with user information
            user_info = {
                "id": db_user.id,
                "name": db_user.name,
                "email": db_user.email
            }
            
            return {
                "id": db_entry.id,
                "user_id": db_entry.user_id,
                "year": db_entry.year,
                "month": db_entry.month,
                "category": db_entry.category,
                "amount": db_entry.amount,
                "credit_card": db_entry.credit_card,
                "notes": db_entry.notes,
                "created_at": db_entry.created_at,
                "updated_at": db_entry.updated_at,
                "user": user_info
            }
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to create ledger entry: {str(e)}")

    @staticmethod
    def get_ledger_entry(db: Session, entry_id: int, current_user_id: int, is_admin: bool = False) -> Optional[Dict[str, Any]]:
        """Get a specific ledger entry"""
        try:
            # Find the entry - allow admin users to access any entry
            query = db.query(DBLedgerEntry).options(joinedload(DBLedgerEntry.user)).filter(DBLedgerEntry.id == entry_id)
            
            # If user is not admin, filter by user_id
            if not is_admin:
                query = query.filter(DBLedgerEntry.user_id == current_user_id)
            
            db_entry = query.first()
            
            if not db_entry:
                raise HTTPException(status_code=404, detail="Ledger entry not found")
            
            # Return the entry with user information
            user_info = {
                "id": db_entry.user.id,
                "name": db_entry.user.name,
                "email": db_entry.user.email
            } if db_entry.user else None
            
            return {
                "id": db_entry.id,
                "user_id": db_entry.user_id,
                "year": db_entry.year,
                "month": db_entry.month,
                "category": db_entry.category,
                "amount": db_entry.amount,
                "credit_card": db_entry.credit_card,
                "notes": db_entry.notes,
                "created_at": db_entry.created_at,
                "updated_at": db_entry.updated_at,
                "user": user_info
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    @staticmethod
    def update_ledger_entry(db: Session, entry_id: int, entry_update: UpdateLedgerEntryRequest, current_user_id: int, is_admin: bool = False) -> Dict[str, Any]:
        """Update a ledger entry"""
        try:
            # Find the entry - allow admin users to update any entry
            query = db.query(DBLedgerEntry).options(joinedload(DBLedgerEntry.user)).filter(DBLedgerEntry.id == entry_id)
            
            # If user is not admin, filter by user_id
            if not is_admin:
                query = query.filter(DBLedgerEntry.user_id == current_user_id)
            
            db_entry = query.first()
            
            if not db_entry:
                raise HTTPException(status_code=404, detail="Ledger entry not found")
            
            # Verify the new user exists if user_id is being changed
            if entry_update.user_id != db_entry.user_id:
                db_user = db.query(DBUser).filter(DBUser.id == entry_update.user_id).first()
                if not db_user:
                    raise HTTPException(status_code=400, detail=f"User with ID {entry_update.user_id} not found")
            
            # Update the entry
            db_entry.user_id = entry_update.user_id
            db_entry.year = entry_update.year
            db_entry.month = entry_update.month
            db_entry.category = entry_update.category
            db_entry.amount = entry_update.amount
            db_entry.credit_card = entry_update.credit_card
            db_entry.notes = entry_update.notes
            
            db.commit()
            db.refresh(db_entry)
            
            # Get user information from the joined load
            user_info = {
                "id": db_entry.user.id,
                "name": db_entry.user.name,
                "email": db_entry.user.email
            } if db_entry.user else None
            
            return {
                "id": db_entry.id,
                "user_id": db_entry.user_id,
                "year": db_entry.year,
                "month": db_entry.month,
                "category": db_entry.category,
                "amount": db_entry.amount,
                "credit_card": db_entry.credit_card,
                "notes": db_entry.notes,
                "created_at": db_entry.created_at,
                "updated_at": db_entry.updated_at,
                "user": user_info
            }
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to update ledger entry: {str(e)}")

    @staticmethod
    def delete_ledger_entry(db: Session, entry_id: int, current_user_id: int, is_admin: bool = False) -> Dict[str, str]:
        """Delete a ledger entry"""
        try:
            # Find the entry - allow admin users to delete any entry
            query = db.query(DBLedgerEntry).filter(DBLedgerEntry.id == entry_id)
            
            # If user is not admin, filter by user_id
            if not is_admin:
                query = query.filter(DBLedgerEntry.user_id == current_user_id)
            
            db_entry = query.first()
            
            if not db_entry:
                raise HTTPException(status_code=404, detail="Ledger entry not found")
            
            db.delete(db_entry)
            db.commit()
            
            return {"message": "Ledger entry deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to delete ledger entry: {str(e)}")

    @staticmethod
    def create_ledger_entries_batch(db: Session, entries_data: List[CreateLedgerEntryRequest], current_user_id: int) -> List[Dict[str, Any]]:
        """Create multiple ledger entries in a batch"""
        try:
            created_entries = []
            
            for entry_data in entries_data:
                # Verify the user exists
                db_user = db.query(DBUser).filter(DBUser.id == entry_data.user_id).first()
                if not db_user:
                    raise HTTPException(status_code=400, detail=f"User with ID {entry_data.user_id} not found")
                
                # Check for existing entry with same key tuple
                existing_entry = db.query(DBLedgerEntry).filter(
                    DBLedgerEntry.year == entry_data.year,
                    DBLedgerEntry.month == entry_data.month,
                    DBLedgerEntry.user_id == entry_data.user_id,
                    DBLedgerEntry.credit_card == entry_data.credit_card,
                    DBLedgerEntry.category == entry_data.category
                ).first()
                
                if existing_entry:
                    raise HTTPException(
                        status_code=409, 
                        detail=f"An entry for {entry_data.category} already exists for {entry_data.year}/{entry_data.month:02d}, user {db_user.name}, {entry_data.credit_card} (existing amount: ${existing_entry.amount:.2f}). Please edit the existing entry instead."
                    )
                
                # Create new database entry
                db_entry = DBLedgerEntry(
                    user_id=entry_data.user_id,
                    year=entry_data.year,
                    month=entry_data.month,
                    category=entry_data.category,
                    amount=entry_data.amount,
                    credit_card=entry_data.credit_card,
                    notes=entry_data.notes
                )
                
                db.add(db_entry)
                created_entries.append(db_entry)
            
            db.commit()
            
            # Return the created entries with user information
            result = []
            for db_entry in created_entries:
                db.refresh(db_entry)
                user_info = {
                    "id": db_entry.user.id,
                    "name": db_entry.user.name,
                    "email": db_entry.user.email
                } if db_entry.user else None
                
                result.append({
                    "id": db_entry.id,
                    "user_id": db_entry.user_id,
                    "year": db_entry.year,
                    "month": db_entry.month,
                    "category": db_entry.category,
                    "amount": db_entry.amount,
                    "credit_card": db_entry.credit_card,
                    "notes": db_entry.notes,
                    "created_at": db_entry.created_at,
                    "updated_at": db_entry.updated_at,
                    "user": user_info
                })
            
            return result
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to create ledger entries batch: {str(e)}") 