from fastapi import APIRouter, Request, Response, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from database.models import User
from auth import get_current_user, google_auth, logout, get_user_profile
from auth_simple import google_auth_simple, logout_simple
from database.database import get_db
from app.startup import get_database_status
from config import ENVIRONMENT
from datetime import datetime

# Request model for Google auth
class GoogleAuthRequest(BaseModel):
    token: str
    stay_logged_in: bool = False

router = APIRouter(tags=["core"])

# Auth endpoints
@router.post("/auth/google")
async def auth_google(request: GoogleAuthRequest, response: Response, db = Depends(get_db)):
    """Google OAuth authentication endpoint"""
    database_available = get_database_status()
    if database_available:
        return await google_auth({"token": request.token}, response, db, request.stay_logged_in)
    else:
        return await google_auth_simple({"token": request.token}, response, request.stay_logged_in)

@router.post("/logout")
async def auth_logout(response: Response):
    """Logout endpoint"""
    database_available = get_database_status()
    if database_available:
        return await logout(response)
    else:
        return await logout_simple(response)

@router.get("/user/profile")
async def user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

# Debug endpoints
@router.get("/debug/cookies")
async def debug_cookies(request: Request):
    """Debug endpoint to check cookies"""
    cookies = request.cookies
    headers = dict(request.headers)
    
    print("🍪 Cookie Debug Information:")
    print(f"   Request URL: {request.url}")
    print(f"   Cookies received: {cookies}")
    print(f"   Origin: {headers.get('origin', 'Not set')}")
    print(f"   Referer: {headers.get('referer', 'Not set')}")
    print(f"   User-Agent: {headers.get('user-agent', 'Not set')}")
    
    return JSONResponse({
        "cookies": dict(cookies),
        "headers": {
            "origin": headers.get('origin'),
            "referer": headers.get('referer'),
            "user_agent": headers.get('user-agent')
        }
    })

@router.get("/debug/pool-status")
async def get_pool_status():
    """Get database connection pool status for debugging"""
    try:
        from database.database import get_pool_status
        pool_info = get_pool_status()
        
        return {
            "pool_status": pool_info,
            "environment": ENVIRONMENT,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "error": str(e),
            "environment": ENVIRONMENT,
            "timestamp": datetime.utcnow().isoformat()
        }

# Core endpoints
@router.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Personal Life Tracking API", "version": "1.0.0"}

@router.get("/health")
async def health_check():
    """Health check endpoint with optimized database check"""
    database_available = get_database_status()
    
    # Use cached database status to reduce connection overhead
    db_status = "connected" if database_available else "disconnected"
    db_error = None
    
    # Only do a full database check if we haven't established connection yet
    if not database_available:
        try:
            from database.database import engine
            from sqlalchemy import text
            
            # Use existing engine from database module
            with engine.connect() as connection:
                result = connection.execute(text("SELECT 1"))
                db_status = "connected"
                
        except Exception as e:
            db_status = "disconnected"
            db_error = str(e)
    
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": {
            "status": db_status,
            "available": database_available,
            "error": db_error
        },
        "environment": ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat()
    }

# Catch-all route to serve React app for client-side routing
@router.get("/{full_path:path}")
async def serve_react_app(full_path: str, request: Request):
    """Catch-all route for React app routing"""
    # Don't serve React app for API routes
    if full_path.startswith(("api/", "auth/", "fitness/", "travel/", "weather/", "ledger/", "credit-cards/", "spending-categories/")):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    # Serve the React app's index.html for all other routes
    try:
        # For development, serve from the React dev server
        # In production, you would serve from the built files
        return {"message": "React app route. Use the React dev server for development."}
    except Exception:
        return {"message": "React app not found. Make sure to run the React dev server."} 