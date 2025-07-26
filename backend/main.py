from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import httpx
import os
from dotenv import load_dotenv
import json
from datetime import datetime, date

load_dotenv()

app = FastAPI(title="Personal Life Tracking API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Pydantic models
class User(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None

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

# Mock data storage (in production, use a database)
mock_users = {}
mock_fitness_data = {}
mock_travel_data = {}

# Authentication helper
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    # In a real app, you would verify the JWT token here
    # For now, we'll use a simple mock authentication
    token = credentials.credentials
    if token not in mock_users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return mock_users[token]

@app.post("/auth/google")
async def google_auth(token: dict):
    """Mock Google authentication endpoint"""
    # Extract token from request body
    token_value = token.get("token", "")
    print(f"Received token: {token_value}")  # Debug log
    
    # In a real app, you would verify the Google token here
    # For demo login, create a mock user for Bravo C
    if token_value.startswith('demo-token-'):
        print("Creating demo user for Bravo C")  # Debug log
        mock_user = User(
            email="bravocui@gmail.com",
            name="Bravo C",
            picture="https://via.placeholder.com/150"
        )
    else:
        print("Creating default user")  # Debug log
        # Default mock user for other cases
        mock_user = User(
            email="user@example.com",
            name="John Doe",
            picture="https://via.placeholder.com/150"
        )
    
    mock_users[token_value] = mock_user
    return {"access_token": token_value, "user": mock_user}

@app.get("/user/profile")
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

# Fitness endpoints
@app.get("/fitness/entries")
async def get_fitness_entries(current_user: User = Depends(get_current_user)):
    """Get all fitness entries for the current user"""
    user_email = current_user.email
    if user_email not in mock_fitness_data:
        # Return mock data
        mock_fitness_data[user_email] = [
            {
                "id": 1,
                "date": "2024-01-15",
                "activity": "Running",
                "duration": 30,
                "calories": 300,
                "notes": "Morning run in the park"
            },
            {
                "id": 2,
                "date": "2024-01-14",
                "activity": "Weight Training",
                "duration": 45,
                "calories": 200,
                "notes": "Upper body workout"
            },
            {
                "id": 3,
                "date": "2024-01-13",
                "activity": "Cycling",
                "duration": 60,
                "calories": 500,
                "notes": "Mountain biking trail"
            }
        ]
    return mock_fitness_data[user_email]

@app.post("/fitness/entries")
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

# Travel endpoints
@app.get("/travel/entries")
async def get_travel_entries(current_user: User = Depends(get_current_user)):
    """Get all travel entries for the current user"""
    user_email = current_user.email
    if user_email not in mock_travel_data:
        # Return mock data
        mock_travel_data[user_email] = [
            {
                "id": 1,
                "destination": "Zurich, Switzerland",
                "start_date": "2024-01-10",
                "end_date": "2024-01-15",
                "description": "Business trip to Zurich with some sightseeing",
                "photos": [
                    "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Zurich+Lake",
                    "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Old+Town"
                ],
                "rating": 5
            },
            {
                "id": 2,
                "destination": "Geneva, Switzerland",
                "start_date": "2023-12-20",
                "end_date": "2023-12-25",
                "description": "Christmas vacation in Geneva",
                "photos": [
                    "https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Jet+d'Eau",
                    "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Christmas+Market"
                ],
                "rating": 4
            }
        ]
    return mock_travel_data[user_email]

@app.post("/travel/entries")
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

# Weather endpoints
@app.get("/weather/switzerland")
async def get_switzerland_weather():
    """Get weather forecast for major Swiss cities"""
    # Mock weather data for Swiss cities
    swiss_cities = [
        {
            "location": "Zurich",
            "temperature": 12.5,
            "description": "Partly cloudy",
            "humidity": 65,
            "wind_speed": 8.2,
            "icon": "cloudy"
        },
        {
            "location": "Geneva",
            "temperature": 14.2,
            "description": "Sunny",
            "humidity": 58,
            "wind_speed": 5.1,
            "icon": "sunny"
        },
        {
            "location": "Bern",
            "temperature": 11.8,
            "description": "Light rain",
            "humidity": 72,
            "wind_speed": 6.8,
            "icon": "rainy"
        },
        {
            "location": "Basel",
            "temperature": 13.1,
            "description": "Overcast",
            "humidity": 68,
            "wind_speed": 7.3,
            "icon": "cloudy"
        }
    ]
    return swiss_cities

@app.get("/weather/{city}")
async def get_city_weather(city: str):
    """Get weather for a specific Swiss city"""
    # In a real app, you would call a weather API here
    # For now, return mock data
    weather_data = {
        "location": city.capitalize(),
        "temperature": 12.5,
        "description": "Partly cloudy",
        "humidity": 65,
        "wind_speed": 8.2,
        "icon": "cloudy"
    }
    return weather_data

@app.get("/")
async def root():
    return {"message": "Personal Life Tracking API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 