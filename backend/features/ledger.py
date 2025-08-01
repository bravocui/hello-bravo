from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from database.models import User, LedgerEntry, CreateLedgerEntryRequest, UpdateLedgerEntryRequest
from auth import get_current_user
from database.database import get_db
from services.ledger_service import LedgerService

from pydantic import BaseModel

router = APIRouter(prefix="/ledger", tags=["ledger"])

class BatchLedgerEntryRequest(BaseModel):
    entries: List[CreateLedgerEntryRequest]

@router.get("/entries")
async def get_ledger_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all ledger entries for the current user"""
    is_admin = current_user.role == "ADMIN"
    return LedgerService.get_ledger_entries(db, current_user.id, is_admin)

@router.post("/entries")
async def create_ledger_entry(
    entry: CreateLedgerEntryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new ledger entry"""
    return LedgerService.create_ledger_entry(db, entry, current_user.id)

@router.post("/entries/batch")
async def create_ledger_entries_batch(
    batch_request: BatchLedgerEntryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create multiple ledger entries in a single transaction"""
    return LedgerService.create_ledger_entries_batch(db, batch_request.entries, current_user.id)

@router.get("/entries/{entry_id}")
async def get_ledger_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific ledger entry by ID"""
    is_admin = current_user.role == "ADMIN"
    return LedgerService.get_ledger_entry(db, entry_id, current_user.id, is_admin)

@router.put("/entries/{entry_id}")
async def update_ledger_entry(
    entry_id: int,
    entry_update: UpdateLedgerEntryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a ledger entry"""
    is_admin = current_user.role == "ADMIN"
    return LedgerService.update_ledger_entry(db, entry_id, entry_update, current_user.id, is_admin)

@router.delete("/entries/{entry_id}")
async def delete_ledger_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a ledger entry"""
    is_admin = current_user.role == "ADMIN"
    return LedgerService.delete_ledger_entry(db, entry_id, current_user.id, is_admin)

 