from fastapi import APIRouter, Depends
from models import User, LedgerEntry
from auth import get_current_user
from mock_data import MOCK_LEDGER_DATA

router = APIRouter(prefix="/ledger", tags=["ledger"])

# Mock data storage (in production, use a database)
mock_ledger_data = {}

@router.get("/entries")
async def get_ledger_entries(current_user: User = Depends(get_current_user)):
    """Get all ledger entries for the current user"""
    user_email = current_user.email
    if user_email not in mock_ledger_data:
        # Return mock data
        mock_ledger_data[user_email] = MOCK_LEDGER_DATA.copy()
    return mock_ledger_data[user_email]

@router.post("/entries")
async def create_ledger_entry(
    entry: LedgerEntry,
    current_user: User = Depends(get_current_user)
):
    """Create a new ledger entry"""
    user_email = current_user.email
    if user_email not in mock_ledger_data:
        mock_ledger_data[user_email] = []
    
    entry.id = len(mock_ledger_data[user_email]) + 1
    mock_ledger_data[user_email].append(entry.dict())
    return entry 