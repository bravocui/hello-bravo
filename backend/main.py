from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import os

# Import centralized configuration
from config import ALLOWED_ORIGINS

# Import models and auth
from models import User
from auth import get_current_user, google_auth, logout, get_user_profile
from database import get_db

# Import feature routers
from features.fitness import router as fitness_router
from features.travel import router as travel_router
from features.weather import router as weather_router
from features.ledger import router as ledger_router
from features.users import router as users_router

app = FastAPI(title="Bravo Cui's Life Tracking", version="1.0.0")

# CORS middleware
origins = [o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include feature routers
app.include_router(fitness_router)
app.include_router(travel_router)
app.include_router(weather_router)
app.include_router(ledger_router)
app.include_router(users_router)

# Auth endpoints
@app.post("/auth/google")
async def auth_google(token: dict, response: Response, db = Depends(get_db)):
    return await google_auth(token, response, db)

@app.post("/logout")
async def auth_logout(response: Response):
    return await logout(response)

@app.get("/user/profile")
async def user_profile(current_user: User = Depends(get_current_user)):
    return current_user

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