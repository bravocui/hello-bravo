from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict, Any
from database.db_models import CreditCard as DBCreditCard, User as DBUser, LedgerEntry as DBLedgerEntry
from database.models import CreateCreditCardRequest, UpdateCreditCardRequest
from fastapi import HTTPException

class CreditCardService:
    @staticmethod
    def get_credit_cards(db: Session, current_user_id: int, is_admin: bool = False) -> List[Dict[str, Any]]:
        """Get all credit cards - admin can see all, others see only their own"""
        try:
            if is_admin:
                credit_cards = db.query(DBCreditCard).options(joinedload(DBCreditCard.user)).all()
            else:
                credit_cards = db.query(DBCreditCard).options(joinedload(DBCreditCard.user)).filter(
                    DBCreditCard.user_id == current_user_id
                ).all()
            
            # Convert to response format with user information
            cards = []
            for card in credit_cards:
                user_info = {
                    "id": card.user.id,
                    "name": card.user.name,
                    "email": card.user.email
                } if card.user else None
                
                cards.append({
                    "id": card.id,
                    "user_id": card.user_id,
                    "name": card.name,
                    "opening_time": card.opening_time,
                    "created_at": card.created_at,
                    "updated_at": card.updated_at,
                    "user": user_info
                })
            
            return cards
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    @staticmethod
    def create_credit_card(db: Session, card_data: CreateCreditCardRequest) -> Dict[str, Any]:
        """Create a new credit card"""
        try:
            # Verify the user exists
            db_user = db.query(DBUser).filter(DBUser.id == card_data.user_id).first()
            if not db_user:
                raise HTTPException(status_code=400, detail=f"User with ID {card_data.user_id} not found")
            
            # Create new database entry
            db_card = DBCreditCard(
                user_id=card_data.user_id,
                name=card_data.name,
                opening_time=card_data.opening_time
            )
            
            db.add(db_card)
            db.commit()
            db.refresh(db_card)
            
            # Return the created card with user information
            user_info = {
                "id": db_user.id,
                "name": db_user.name,
                "email": db_user.email
            }
            
            return {
                "id": db_card.id,
                "user_id": db_card.user_id,
                "name": db_card.name,
                "opening_time": db_card.opening_time,
                "created_at": db_card.created_at,
                "updated_at": db_card.updated_at,
                "user": user_info
            }
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to create credit card: {str(e)}")

    @staticmethod
    def get_credit_card(db: Session, card_id: int, current_user_id: int, is_admin: bool = False) -> Optional[Dict[str, Any]]:
        """Get a specific credit card"""
        try:
            # Find the card - allow admin users to access any card
            query = db.query(DBCreditCard).options(joinedload(DBCreditCard.user)).filter(DBCreditCard.id == card_id)
            
            # If user is not admin, filter by user_id
            if not is_admin:
                query = query.filter(DBCreditCard.user_id == current_user_id)
            
            db_card = query.first()
            
            if not db_card:
                raise HTTPException(status_code=404, detail="Credit card not found")
            
            # Return the card with user information
            user_info = {
                "id": db_card.user.id,
                "name": db_card.user.name,
                "email": db_card.user.email
            } if db_card.user else None
            
            return {
                "id": db_card.id,
                "user_id": db_card.user_id,
                "name": db_card.name,
                "opening_time": db_card.opening_time,
                "created_at": db_card.created_at,
                "updated_at": db_card.updated_at,
                "user": user_info
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    @staticmethod
    def update_credit_card(db: Session, card_id: int, card_update: UpdateCreditCardRequest, current_user_id: int, is_admin: bool = False) -> Dict[str, Any]:
        """Update a credit card"""
        try:
            # Find the card - allow admin users to update any card
            query = db.query(DBCreditCard).options(joinedload(DBCreditCard.user)).filter(DBCreditCard.id == card_id)
            
            # If user is not admin, filter by user_id
            if not is_admin:
                query = query.filter(DBCreditCard.user_id == current_user_id)
            
            db_card = query.first()
            
            if not db_card:
                raise HTTPException(status_code=404, detail="Credit card not found")
            
            # Store the old card name for updating ledger entries
            old_card_name = db_card.name
            
            # Verify the new user exists if user_id is being changed
            if card_update.user_id != db_card.user_id:
                db_user = db.query(DBUser).filter(DBUser.id == card_update.user_id).first()
                if not db_user:
                    raise HTTPException(status_code=400, detail=f"User with ID {card_update.user_id} not found")
            
            # Update the card
            db_card.name = card_update.name
            db_card.user_id = card_update.user_id
            db_card.opening_time = card_update.opening_time
            
            # Update all related ledger entries if card name changed
            updated_count = 0
            if old_card_name != card_update.name:
                # Use a single UPDATE query instead of iterating
                result = db.query(DBLedgerEntry).filter(
                    DBLedgerEntry.credit_card == old_card_name
                ).update(
                    {DBLedgerEntry.credit_card: card_update.name},
                    synchronize_session=False
                )
                updated_count = result
            
            db.commit()
            db.refresh(db_card)
            
            # Get user information from the joined load
            user_info = {
                "id": db_card.user.id,
                "name": db_card.user.name,
                "email": db_card.user.email
            } if db_card.user else None
            
            return {
                "card": {
                    "id": db_card.id,
                    "user_id": db_card.user_id,
                    "name": db_card.name,
                    "opening_time": db_card.opening_time,
                    "created_at": db_card.created_at,
                    "updated_at": db_card.updated_at,
                    "user": user_info
                },
                "message": f"Credit card updated successfully. {updated_count} ledger entries were also updated." if updated_count > 0 else "Credit card updated successfully."
            }
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            print(f"❌ Error updating credit card: {e}")
            print(f"🔍 Error type: {type(e).__name__}")
            raise HTTPException(status_code=500, detail=f"Failed to update credit card: {str(e)}")

    @staticmethod
    def delete_credit_card(db: Session, card_id: int, current_user_id: int, is_admin: bool = False) -> Dict[str, str]:
        """Delete a credit card - prevents deletion if related ledger entries exist"""
        try:
            # Find the card - allow admin users to delete any card
            query = db.query(DBCreditCard).filter(DBCreditCard.id == card_id)
            
            # If user is not admin, filter by user_id
            if not is_admin:
                query = query.filter(DBCreditCard.user_id == current_user_id)
            
            db_card = query.first()
            
            if not db_card:
                raise HTTPException(status_code=404, detail="Credit card not found")
            
            # Check for related ledger entries
            related_entries = db.query(DBLedgerEntry).filter(
                DBLedgerEntry.credit_card == db_card.name
            ).count()
            
            if related_entries > 0:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Cannot delete credit card '{db_card.name}' because it has {related_entries} related ledger entries. Please rename the card instead of deleting it."
                )
            
            db.delete(db_card)
            db.commit()
            
            return {"message": "Credit card deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to delete credit card: {str(e)}") 