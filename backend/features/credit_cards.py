from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from models import User, CreditCard, CreateCreditCardRequest, UpdateCreditCardRequest
from auth import get_current_user
from database import get_db
from db_models import CreditCard as DBCreditCard, User as DBUser

router = APIRouter(prefix="/credit-cards", tags=["credit-cards"])

@router.get("/")
async def get_credit_cards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all credit cards - admin can see all, others see only their own"""
    try:
        if current_user.role == "ADMIN":
            credit_cards = db.query(DBCreditCard).options(joinedload(DBCreditCard.user)).all()
        else:
            credit_cards = db.query(DBCreditCard).options(joinedload(DBCreditCard.user)).filter(
                DBCreditCard.user_id == current_user.id
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

@router.post("/")
async def create_credit_card(
    card: CreateCreditCardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new credit card"""
    try:
        # Verify the user exists
        db_user = db.query(DBUser).filter(DBUser.id == card.user_id).first()
        if not db_user:
            raise HTTPException(status_code=400, detail=f"User with ID {card.user_id} not found")
        
        # Create new database entry
        db_card = DBCreditCard(
            user_id=card.user_id,
            name=card.name,
            opening_time=card.opening_time
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

@router.get("/{card_id}")
async def get_credit_card(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific credit card"""
    try:
        query = db.query(DBCreditCard).options(joinedload(DBCreditCard.user)).filter(DBCreditCard.id == card_id)
        
        # If user is admin, don't filter by user_id
        if current_user.role != "ADMIN":
            query = query.filter(DBCreditCard.user_id == current_user.id)
        
        card = query.first()
        
        if not card:
            raise HTTPException(status_code=404, detail="Credit card not found")
        
        # Get user information from the joined load
        user_info = {
            "id": card.user.id,
            "name": card.user.name,
            "email": card.user.email
        } if card.user else None
        
        return {
            "id": card.id,
            "user_id": card.user_id,
            "name": card.name,
            "opening_time": card.opening_time,
            "created_at": card.created_at,
            "updated_at": card.updated_at,
            "user": user_info
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.put("/{card_id}")
async def update_credit_card(
    card_id: int,
    card_update: UpdateCreditCardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a credit card and update all related ledger entries"""
    try:
        # Find the card - allow admin users to edit any card
        query = db.query(DBCreditCard).options(joinedload(DBCreditCard.user)).filter(DBCreditCard.id == card_id)
        
        # If user is admin, don't filter by user_id
        if current_user.role != "ADMIN":
            query = query.filter(DBCreditCard.user_id == current_user.id)
        
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
            from db_models import LedgerEntry as DBLedgerEntry
            
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

@router.delete("/{card_id}")
async def delete_credit_card(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a credit card - prevents deletion if related ledger entries exist"""
    try:
        # Find the card - allow admin users to delete any card
        query = db.query(DBCreditCard).filter(DBCreditCard.id == card_id)
        
        # If user is admin, don't filter by user_id
        if current_user.role != "ADMIN":
            query = query.filter(DBCreditCard.user_id == current_user.id)
        
        db_card = query.first()
        
        if not db_card:
            raise HTTPException(status_code=404, detail="Credit card not found")
        
        # Check for related ledger entries
        from db_models import LedgerEntry as DBLedgerEntry
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