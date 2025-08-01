from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.models import User, CreditCard, CreateCreditCardRequest, UpdateCreditCardRequest
from auth import get_current_user
from database.database import get_db
from services.credit_card_service import CreditCardService

router = APIRouter(prefix="/credit-cards", tags=["credit-cards"])

@router.get("/")
async def get_credit_cards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all credit cards - admin can see all, others see only their own"""
    is_admin = current_user.role == "ADMIN"
    return CreditCardService.get_credit_cards(db, current_user.id, is_admin)

@router.post("/")
async def create_credit_card(
    card: CreateCreditCardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new credit card"""
    return CreditCardService.create_credit_card(db, card)

@router.get("/{card_id}")
async def get_credit_card(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific credit card"""
    is_admin = current_user.role == "ADMIN"
    return CreditCardService.get_credit_card(db, card_id, current_user.id, is_admin)

@router.put("/{card_id}")
async def update_credit_card(
    card_id: int,
    card_update: UpdateCreditCardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a credit card and update all related ledger entries"""
    is_admin = current_user.role == "ADMIN"
    return CreditCardService.update_credit_card(db, card_id, card_update, current_user.id, is_admin)

@router.delete("/{card_id}")
async def delete_credit_card(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a credit card - prevents deletion if related ledger entries exist"""
    is_admin = current_user.role == "ADMIN"
    return CreditCardService.delete_credit_card(db, card_id, current_user.id, is_admin) 