from fastapi import APIRouter, Depends
from models import User, FitnessEntry
from auth import get_current_user


router = APIRouter(prefix="/fitness", tags=["fitness"])



@router.get("/entries")
async def get_fitness_entries(current_user: User = Depends(get_current_user)):
    """Get all fitness entries for the current user"""
    # TODO: Implement database storage
    return []

@router.post("/entries")
async def create_fitness_entry(
    entry: FitnessEntry,
    current_user: User = Depends(get_current_user)
):
    """Create a new fitness entry"""
    # TODO: Implement database storage
    return entry 