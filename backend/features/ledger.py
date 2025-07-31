from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import User, LedgerEntry
from auth import get_current_user
from database import get_db
from db_models import LedgerEntry as DBLedgerEntry

from pydantic import BaseModel

router = APIRouter(prefix="/ledger", tags=["ledger"])

class BatchLedgerEntryRequest(BaseModel):
    entries: List[LedgerEntry]

@router.get("/entries")
async def get_ledger_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all ledger entries for the current user"""
    try:
        # If user is admin, get all entries; otherwise, filter by user_id
        if current_user.role == "ADMIN":
            ledger_entries = db.query(DBLedgerEntry).all()
        else:
            ledger_entries = db.query(DBLedgerEntry).filter(
                DBLedgerEntry.user_id == current_user.id
            ).all()
        
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
        # Find the user by name to get the correct user_id
        from services.user_service import UserService
        db_user = UserService.get_user_by_name(db, entry.user_name)
        
        if not db_user:
            raise HTTPException(status_code=400, detail=f"User '{entry.user_name}' not found")
        
        # Check for existing entry with same key tuple
        existing_entry = db.query(DBLedgerEntry).filter(
            DBLedgerEntry.year == entry.year,
            DBLedgerEntry.month == entry.month,
            DBLedgerEntry.user_name == entry.user_name,
            DBLedgerEntry.credit_card == entry.credit_card,
            DBLedgerEntry.category == entry.category
        ).first()
        
        if existing_entry:
            raise HTTPException(
                status_code=409, 
                detail=f"An entry for {entry.category} already exists for {entry.year}/{entry.month:02d}, {entry.user_name}, {entry.credit_card} (existing amount: ${existing_entry.amount:.2f}). Please edit the existing entry instead."
            )
        
        # Create new database entry
        db_entry = DBLedgerEntry(
            user_id=db_user.id,
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
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create ledger entry: {str(e)}")

@router.post("/entries/batch")
async def create_ledger_entries_batch(
    batch_request: BatchLedgerEntryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create multiple ledger entries in a single transaction"""
    try:
        from services.user_service import UserService
        
        # Log the entries being attempted
        print(f"🔍 Attempting to create {len(batch_request.entries)} entries:")
        for entry in batch_request.entries:
            print(f"  - {entry.category}: ${entry.amount:.2f}")
        
        # Validate all entries first and check for duplicates
        created_entries = []
        duplicate_entries = []
        
        for entry in batch_request.entries:
            # Find the user by name to get the correct user_id
            db_user = UserService.get_user_by_name(db, entry.user_name)
            
            if not db_user:
                raise HTTPException(status_code=400, detail=f"User '{entry.user_name}' not found")
            
            # Check for existing entry with same key tuple
            existing_entry = db.query(DBLedgerEntry).filter(
                DBLedgerEntry.year == entry.year,
                DBLedgerEntry.month == entry.month,
                DBLedgerEntry.user_name == entry.user_name,
                DBLedgerEntry.credit_card == entry.credit_card,
                DBLedgerEntry.category == entry.category
            ).first()
            
            if existing_entry:
                duplicate_entries.append({
                    "year": entry.year,
                    "month": entry.month,
                    "user_name": entry.user_name,
                    "credit_card": entry.credit_card,
                    "category": entry.category,
                    "existing_amount": existing_entry.amount
                })
            else:
                # Create new database entry
                db_entry = DBLedgerEntry(
                    user_id=db_user.id,
                    year=entry.year,
                    month=entry.month,
                    category=entry.category,
                    amount=entry.amount,
                    credit_card=entry.credit_card,
                    user_name=entry.user_name,
                    notes=entry.notes
                )
                
                db.add(db_entry)
                created_entries.append(db_entry)
        
        # If there are duplicates, return error with details
        if duplicate_entries:
            # Get the categories that were actually being attempted
            attempted_categories = [entry.category for entry in batch_request.entries]
            duplicate_categories = [dup['category'] for dup in duplicate_entries]
            
            print(f"❌ Found {len(duplicate_entries)} duplicate entries:")
            for dup in duplicate_entries:
                print(f"  - {dup['category']}: existing amount ${dup['existing_amount']:.2f}")
            
            duplicate_details = []
            for dup in duplicate_entries:
                duplicate_details.append(
                    f"{dup['year']}/{dup['month']:02d}, {dup['user_name']}, {dup['credit_card']}, {dup['category']} (existing amount: ${dup['existing_amount']:.2f})"
                )
            
            # Create a more helpful error message
            error_message = f"The following categories already have entries for {batch_request.entries[0].year}/{batch_request.entries[0].month:02d}, {batch_request.entries[0].user_name}, {batch_request.entries[0].credit_card}: {', '.join(duplicate_categories)}. Please edit the existing entries instead."
            
            raise HTTPException(
                status_code=409,
                detail=error_message
            )
        
        # Commit all entries in a single transaction
        db.commit()
        
        # Refresh all entries and return them
        result_entries = []
        for db_entry in created_entries:
            db.refresh(db_entry)
            result_entries.append(LedgerEntry(
                id=db_entry.id,
                year=db_entry.year,
                month=db_entry.month,
                category=db_entry.category,
                amount=db_entry.amount,
                credit_card=db_entry.credit_card,
                user_name=db_entry.user_name,
                notes=db_entry.notes
            ))
        
        return result_entries
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create ledger entries: {str(e)}")

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
        # Find the entry - allow admin users to edit any entry
        query = db.query(DBLedgerEntry).filter(DBLedgerEntry.id == entry_id)
        
        # If user is admin, don't filter by user_id
        if current_user.role != "ADMIN":
            query = query.filter(DBLedgerEntry.user_id == current_user.id)
        
        db_entry = query.first()
        
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
        # Find the entry - allow admin users to delete any entry
        query = db.query(DBLedgerEntry).filter(DBLedgerEntry.id == entry_id)
        
        # If user is admin, don't filter by user_id
        if current_user.role != "ADMIN":
            query = query.filter(DBLedgerEntry.user_id == current_user.id)
        
        db_entry = query.first()
        
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

 