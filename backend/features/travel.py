from fastapi import APIRouter, Depends
from models import User, TravelEntry
from auth import get_current_user


router = APIRouter(prefix="/travel", tags=["travel"])



@router.get("/entries")
async def get_travel_entries(current_user: User = Depends(get_current_user)):
    """Get all travel entries for the current user"""
    # TODO: Implement database storage
    return []

@router.post("/entries")
async def create_travel_entry(
    entry: TravelEntry,
    current_user: User = Depends(get_current_user)
):
    """Create a new travel entry"""
    # TODO: Implement database storage
    return entry 