from fastapi import APIRouter, Depends
from models import User, TravelEntry
from auth import get_current_user
from mock_data import MOCK_TRAVEL_DATA

router = APIRouter(prefix="/travel", tags=["travel"])

# Mock data storage (in production, use a database)
mock_travel_data = {}

@router.get("/entries")
async def get_travel_entries(current_user: User = Depends(get_current_user)):
    """Get all travel entries for the current user"""
    user_email = current_user.email
    if user_email not in mock_travel_data:
        # Return mock data
        mock_travel_data[user_email] = MOCK_TRAVEL_DATA.copy()
    return mock_travel_data[user_email]

@router.post("/entries")
async def create_travel_entry(
    entry: TravelEntry,
    current_user: User = Depends(get_current_user)
):
    """Create a new travel entry"""
    user_email = current_user.email
    if user_email not in mock_travel_data:
        mock_travel_data[user_email] = []
    
    entry.id = len(mock_travel_data[user_email]) + 1
    mock_travel_data[user_email].append(entry.dict())
    return entry 