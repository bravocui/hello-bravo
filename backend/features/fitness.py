from fastapi import APIRouter, Depends
from models import User, FitnessEntry
from auth import get_current_user
from mock_data import MOCK_FITNESS_DATA

router = APIRouter(prefix="/fitness", tags=["fitness"])

# Mock data storage (in production, use a database)
mock_fitness_data = {}

@router.get("/entries")
async def get_fitness_entries(current_user: User = Depends(get_current_user)):
    """Get all fitness entries for the current user"""
    user_email = current_user.email
    if user_email not in mock_fitness_data:
        # Return mock data
        mock_fitness_data[user_email] = MOCK_FITNESS_DATA.copy()
    return mock_fitness_data[user_email]

@router.post("/entries")
async def create_fitness_entry(
    entry: FitnessEntry,
    current_user: User = Depends(get_current_user)
):
    """Create a new fitness entry"""
    user_email = current_user.email
    if user_email not in mock_fitness_data:
        mock_fitness_data[user_email] = []
    
    entry.id = len(mock_fitness_data[user_email]) + 1
    mock_fitness_data[user_email].append(entry.dict())
    return entry 