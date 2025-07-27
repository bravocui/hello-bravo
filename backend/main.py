from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import httpx
import os
from dotenv import load_dotenv
import json
from datetime import datetime, date
from mock_data import (
    MOCK_FITNESS_DATA,
    MOCK_TRAVEL_DATA,
    MOCK_WEATHER_DATA,
    MOCK_LEDGER_DATA,
    MOCK_USERS
)
from jose import jwt, JWTError
import requests
from fastapi import Response, Cookie
from datetime import timedelta

load_dotenv()

app = FastAPI(title="Bravo Cui's Life Tracking", version="1.0.0")

# CORS middleware
origins = os.getenv("ALLOWED_ORIGINS")
if origins:
    origins = [o.strip() for o in origins.split(",") if o.strip()]
else:
    origins = [
        "https://bravocui.github.io",
        "http://localhost:3000", # For local development
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

class LedgerEntry(BaseModel):
    id: Optional[int] = None
    year: int
    month: int
    category: str
    amount: float
    credit_card: str
    owner: str
    notes: Optional[str] = None

# Mock data storage (in production, use a database)
mock_users = MOCK_USERS.copy()
mock_fitness_data = {}
mock_travel_data = {}
mock_ledger_data = {}

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
JWT_SECRET = os.getenv("JWT_SECRET", "supersecret")
JWT_ALGORITHM = "HS256"
JWT_COOKIE_NAME = "session_token"
JWT_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week

# Helper to verify Google ID token
async def verify_google_token(id_token: str):
    # For demo tokens, skip verification
    if id_token.startswith('demo-token-'):
        return MOCK_USERS["demo-token"]
    # Real Google token verification
    try:
        # Get Google's public keys
        resp = requests.get('https://www.googleapis.com/oauth2/v3/certs')
        jwks = resp.json()
        # Decode and verify
        unverified_header = jwt.get_unverified_header(id_token)
        key = next((k for k in jwks['keys'] if k['kid'] == unverified_header['kid']), None)
        if not key:
            raise HTTPException(status_code=401, detail="Invalid Google token (no key)")
        public_key = jwt.construct_rsa_public_key(key)
        payload = jwt.decode(id_token, public_key, algorithms=['RS256'], audience=GOOGLE_CLIENT_ID)
        # Extract user info
        return {
            "email": payload["email"],
            "name": payload.get("name", payload["email"]),
            "picture": payload.get("picture")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")

# Issue JWT
from datetime import datetime, timedelta

def create_jwt(user: dict):
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode = {"sub": user["email"], "exp": expire, "user": user}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

# Auth dependency: read JWT from cookie
async def get_current_user(session_token: str = Cookie(None)) -> User:
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated (no cookie)")
    try:
        payload = jwt.decode(session_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = payload["user"]
        return User(**user)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid session token")

@app.post("/auth/google")
async def google_auth(token: dict, response: Response):
    token_value = token.get("token", "")
    # Demo login
    if token_value.startswith('demo-token-'):
        user = MOCK_USERS["demo-token"]
    else:
        user = await verify_google_token(token_value)
    jwt_token = create_jwt(user)
    # Set secure, HTTP-only cookie
    response.set_cookie(
        key=JWT_COOKIE_NAME,
        value=jwt_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=JWT_EXPIRE_MINUTES*60
    )
    return {"user": user}

@app.post("/logout")
async def logout(response: Response):
    response.delete_cookie(JWT_COOKIE_NAME)
    return {"message": "Logged out"}

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
        mock_fitness_data[user_email] = MOCK_FITNESS_DATA.copy()
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
        mock_travel_data[user_email] = MOCK_TRAVEL_DATA.copy()
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
    return MOCK_WEATHER_DATA

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

# Accounting Ledger endpoints
@app.get("/ledger/entries")
async def get_ledger_entries(current_user: User = Depends(get_current_user)):
    """Get all ledger entries for the current user"""
    user_email = current_user.email
    if user_email not in mock_ledger_data:
        # Return mock data
        mock_ledger_data[user_email] = MOCK_LEDGER_DATA.copy()
    return mock_ledger_data[user_email]

@app.post("/ledger/entries")
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

@app.get("/")
async def root():
    return {"message": "Personal Life Tracking API", "version": "1.0.0"}

# Catch-all route to serve React app for client-side routing
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str, request: Request):
    # Don't serve React app for API routes
    if full_path.startswith(("api/", "auth/", "fitness/", "travel/", "weather/", "ledger/")):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    # Serve the React app's index.html for all other routes
    try:
        # For development, serve from the React dev server
        # In production, you would serve from the built files
        return {"message": "React app route. Use the React dev server for development."}
    except Exception:
        return {"message": "React app not found. Make sure to run the React dev server."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
