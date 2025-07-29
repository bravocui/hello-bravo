from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import User, LedgerEntry
from auth import get_current_user
from database import get_db
from db_models import LedgerEntry as DBLedgerEntry
from mock_data import MOCK_LEDGER_DATA

router = APIRouter(prefix="/ledger", tags=["ledger"])

@router.get("/entries")
async def get_ledger_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all ledger entries for the current user"""
    try:
        ledger_entries = db.query(DBLedgerEntry).all()
        
        # Convert to Pydantic models for response
        entries = []
        for entry in ledger_entries:
            entries.append(LedgerEntry(
                id=entry.id,
                year=entry.year,
                month=entry.month,
                category=entry.category,
                amount=entry.amount,
                credit_card=entry.credit_card,
                user_name=entry.user_name,
                notes=entry.notes
            ))
        
        return entries
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/entries")
async def create_ledger_entry(
    entry: LedgerEntry,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new ledger entry"""
    try:
        # Create new database entry
        db_entry = DBLedgerEntry(
            user_id=current_user.id,
            year=entry.year,
            month=entry.month,
            category=entry.category,
            amount=entry.amount,
            credit_card=entry.credit_card,
            user_name=entry.user_name,
            notes=entry.notes
        )
        
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)
        
        # Return the created entry
        return LedgerEntry(
            id=db_entry.id,
            year=db_entry.year,
            month=db_entry.month,
            category=db_entry.category,
            amount=db_entry.amount,
            credit_card=db_entry.credit_card,
            user_name=db_entry.user_name,
            notes=db_entry.notes
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create ledger entry: {str(e)}")

@router.get("/entries/{entry_id}")
async def get_ledger_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific ledger entry by ID"""
    try:
        entry = db.query(DBLedgerEntry).filter(
            DBLedgerEntry.id == entry_id,
            DBLedgerEntry.user_id == current_user.id
        ).first()
        
        if not entry:
            raise HTTPException(status_code=404, detail="Ledger entry not found")
        
        return LedgerEntry(
            id=entry.id,
            year=entry.year,
            month=entry.month,
            category=entry.category,
            amount=entry.amount,
            credit_card=entry.credit_card,
            user_name=entry.user_name,
            notes=entry.notes
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.put("/entries/{entry_id}")
async def update_ledger_entry(
    entry_id: int,
    entry_update: LedgerEntry,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a ledger entry"""
    try:
        # Find the entry
        db_entry = db.query(DBLedgerEntry).filter(
            DBLedgerEntry.id == entry_id,
            DBLedgerEntry.user_id == current_user.id
        ).first()
        
        if not db_entry:
            raise HTTPException(status_code=404, detail="Ledger entry not found")
        
        # Update the entry
        db_entry.year = entry_update.year
        db_entry.month = entry_update.month
        db_entry.category = entry_update.category
        db_entry.amount = entry_update.amount
        db_entry.credit_card = entry_update.credit_card
        db_entry.user_name = entry_update.user_name
        db_entry.notes = entry_update.notes
        
        db.commit()
        db.refresh(db_entry)
        
        return LedgerEntry(
            id=db_entry.id,
            year=db_entry.year,
            month=db_entry.month,
            category=db_entry.category,
            amount=db_entry.amount,
            credit_card=db_entry.credit_card,
            user_name=db_entry.user_name,
            notes=db_entry.notes
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update ledger entry: {str(e)}")

@router.delete("/entries/{entry_id}")
async def delete_ledger_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a ledger entry"""
    try:
        # Find the entry
        db_entry = db.query(DBLedgerEntry).filter(
            DBLedgerEntry.id == entry_id,
            DBLedgerEntry.user_id == current_user.id
        ).first()
        
        if not db_entry:
            raise HTTPException(status_code=404, detail="Ledger entry not found")
        
        # Delete the entry
        db.delete(db_entry)
        db.commit()
        
        return {"message": "Ledger entry deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete ledger entry: {str(e)}")

@router.get("/mock-entries")
async def get_mock_ledger_entries(
    current_user: User = Depends(get_current_user)
):
    """Get mock ledger entries for development/testing"""
    try:
        # Convert mock data to LedgerEntry models
        entries = []
        for entry_data in MOCK_LEDGER_DATA:
            entries.append(LedgerEntry(
                id=entry_data["id"],
                year=entry_data["year"],
                month=entry_data["month"],
                category=entry_data["category"],
                amount=entry_data["amount"],
                credit_card=entry_data["credit_card"],
                user_name=entry_data["user_name"],
                notes=entry_data.get("notes")
            ))
        
        return entries
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load mock data: {str(e)}") 