from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    REGULAR = "REGULAR"
    READONLY = "READONLY"
    GUEST = "GUEST"

class User(BaseModel):
    id: int
    email: str
    name: str
    picture: Optional[str] = None
    role: str
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CreateUserRequest(BaseModel):
    email: str
    name: str
    role: str = "REGULAR"

class UpdateUserRequest(BaseModel):
    name: str
    role: str

class FitnessEntry(BaseModel):
    id: Optional[int] = None
    user_id: int
    date: str
    activity: str
    duration_minutes: int
    calories: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class TravelEntry(BaseModel):
    id: Optional[int] = None
    user_id: int
    destination: str
    start_date: str
    end_date: str
    description: Optional[str] = None
    rating: Optional[int] = None
    photos: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class WeatherData(BaseModel):
    city: str
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
    user_name: str
    notes: Optional[str] = None

class CreditCard(BaseModel):
    id: Optional[int] = None
    user_id: int
    name: str
    owner: str
    opening_time: datetime
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CreateCreditCardRequest(BaseModel):
    name: str
    owner: str
    opening_time: str  # Accept date string like "2019-06-13"
    
    def __init__(self, **data):
        super().__init__(**data)
        # Convert date string to datetime at midnight
        if isinstance(self.opening_time, str):
            from datetime import datetime
            self.opening_time = datetime.fromisoformat(self.opening_time + "T00:00:00")

class UpdateCreditCardRequest(BaseModel):
    name: str
    owner: str
    opening_time: str  # Accept date string like "2019-06-13"
    
    def __init__(self, **data):
        super().__init__(**data)
        # Convert date string to datetime at midnight
        if isinstance(self.opening_time, str):
            from datetime import datetime
            self.opening_time = datetime.fromisoformat(self.opening_time + "T00:00:00")

class SpendingCategory(BaseModel):
    id: Optional[int] = None
    category_name: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CreateSpendingCategoryRequest(BaseModel):
    category_name: str

class UpdateSpendingCategoryRequest(BaseModel):
    category_name: str 