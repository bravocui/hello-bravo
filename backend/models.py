from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    REGULAR = "regular"
    READONLY = "readonly"

class User(BaseModel):
    id: Optional[int] = None
    email: str
    name: str
    picture: Optional[str] = None
    role: UserRole = UserRole.REGULAR

class FitnessEntry(BaseModel):
    id: Optional[int] = None
    date: date
    activity: str
    duration: int  # minutes
    calories: Optional[int] = None
    notes: Optional[str] = None

class TravelEntry(BaseModel):
    id: Optional[int] = None
    destination: str
    start_date: date
    end_date: date
    description: str
    photos: List[str] = []
    rating: Optional[int] = None

class WeatherData(BaseModel):
    location: str
    temperature: float
    description: str
    humidity: int
    wind_speed: float
    icon: str

class LedgerEntry(BaseModel):
    id: Optional[int] = None
    year: int
    month: int
    category: str
    amount: float
    credit_card: str
    owner: str
    notes: Optional[str] = None 