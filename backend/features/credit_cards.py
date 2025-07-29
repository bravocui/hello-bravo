from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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
            credit_cards = db.query(DBCreditCard).all()
        else:
            credit_cards = db.query(DBCreditCard).filter(
                DBCreditCard.user_id == current_user.id
            ).all()
        
        # Convert to Pydantic models for response
        cards = []
        for card in credit_cards:
            cards.append(CreditCard(
                id=card.id,
                user_id=card.user_id,
                name=card.name,
                owner=card.owner,
                opening_time=card.opening_time,
                created_at=card.created_at,
                updated_at=card.updated_at
            ))
        
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
        # Find the user by name (owner)
        db_user = db.query(DBUser).filter(DBUser.name == card.owner).first()
        if not db_user:
            raise HTTPException(status_code=400, detail=f"User '{card.owner}' not found")
        
        # Create new database entry
        db_card = DBCreditCard(
            user_id=db_user.id,
            name=card.name,
            owner=card.owner,
            opening_time=card.opening_time
        )
        
        db.add(db_card)
        db.commit()
        db.refresh(db_card)
        
        # Return the created card
        return CreditCard(
            id=db_card.id,
            user_id=db_card.user_id,
            name=db_card.name,
            owner=db_card.owner,
            opening_time=db_card.opening_time,
            created_at=db_card.created_at,
            updated_at=db_card.updated_at
        )
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
        query = db.query(DBCreditCard).filter(DBCreditCard.id == card_id)
        
        # If user is admin, don't filter by user_id
        if current_user.role != "ADMIN":
            query = query.filter(DBCreditCard.user_id == current_user.id)
        
        card = query.first()
        
        if not card:
            raise HTTPException(status_code=404, detail="Credit card not found")
        
        return CreditCard(
            id=card.id,
            user_id=card.user_id,
            name=card.name,
            owner=card.owner,
            opening_time=card.opening_time,
            created_at=card.created_at,
            updated_at=card.updated_at
        )
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
    """Update a credit card"""
    try:
        # Find the card - allow admin users to edit any card
        query = db.query(DBCreditCard).filter(DBCreditCard.id == card_id)
        
        # If user is admin, don't filter by user_id
        if current_user.role != "ADMIN":
            query = query.filter(DBCreditCard.user_id == current_user.id)
        
        db_card = query.first()
        
        if not db_card:
            raise HTTPException(status_code=404, detail="Credit card not found")
        
        # Find the user by name (owner) if owner is being changed
        if card_update.owner != db_card.owner:
            db_user = db.query(DBUser).filter(DBUser.name == card_update.owner).first()
            if not db_user:
                raise HTTPException(status_code=400, detail=f"User '{card_update.owner}' not found")
            db_card.user_id = db_user.id
        
        # Update the card
        db_card.name = card_update.name
        db_card.owner = card_update.owner
        db_card.opening_time = card_update.opening_time
        
        db.commit()
        db.refresh(db_card)
        
        return CreditCard(
            id=db_card.id,
            user_id=db_card.user_id,
            name=db_card.name,
            owner=db_card.owner,
            opening_time=db_card.opening_time,
            created_at=db_card.created_at,
            updated_at=db_card.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update credit card: {str(e)}")

@router.delete("/{card_id}")
async def delete_credit_card(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a credit card"""
    try:
        # Find the card - allow admin users to delete any card
        query = db.query(DBCreditCard).filter(DBCreditCard.id == card_id)
        
        # If user is admin, don't filter by user_id
        if current_user.role != "ADMIN":
            query = query.filter(DBCreditCard.user_id == current_user.id)
        
        db_card = query.first()
        
        if not db_card:
            raise HTTPException(status_code=404, detail="Credit card not found")
        
        db.delete(db_card)
        db.commit()
        
        return {"message": "Credit card deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete credit card: {str(e)}") 