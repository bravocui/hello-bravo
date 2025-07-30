from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from fastapi.exceptions import RequestValidationError
import os
from datetime import datetime

# Import centralized configuration
from config import ALLOWED_ORIGINS, ENVIRONMENT

# Import models and auth
from models import User
from auth import get_current_user, google_auth, logout, get_user_profile
from auth_simple import google_auth_simple, logout_simple
from database import get_db

# Import feature routers
from features.fitness import router as fitness_router
from features.travel import router as travel_router
from features.weather import router as weather_router
from features.ledger import router as ledger_router
from features.users import router as users_router
from features.credit_cards import router as credit_cards_router
from features.spending_categories import router as spending_categories_router
from features.ai_assistant import router as ai_assistant_router

app = FastAPI(title="Bravo Cui's Life Tracking", version="1.0.0")

# Database connection status
database_available = False

# Test database connection on startup
@app.on_event("startup")
async def test_database_connection():
    global database_available
    try:
        from database import engine
        from sqlalchemy import text
        from config import DATABASE_URL
        
        print("🔍 Testing database connection...")
        print(f"   URL: {DATABASE_URL}")
        
        print("   ⏳ Attempting to connect...")
        
        with engine.connect() as connection:
            # Test basic connection
            result = connection.execute(text("SELECT 1"))
            print("   ✅ Basic connection successful!")
            
            # Test database name
            result = connection.execute(text("SELECT current_database()"))
            db_name = result.scalar()
            print(f"   📊 Connected to database: {db_name}")
            
            # List all tables
            result = connection.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            
            tables = [row[0] for row in result]
            print(f"   📋 Available tables: {tables}")
            
            # Test user permissions
            result = connection.execute(text("SELECT current_user"))
            user = result.scalar()
            print(f"   👤 Connected as user: {user}")
            
            database_available = True
            print("   🎉 Database connection successful!")
            print("✅ Database is available for authentication")
            
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        print(f"❌ Database connection failed: {error_type}")
        print(f"💬 Error details: {error_msg}")
        print("⚠️  Falling back to simplified authentication (no database)")
        database_available = False

# Global exception handlers for better error messages
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_type": "http_exception"}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": f"Validation error: {str(exc)}", "error_type": "validation_error"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}", "error_type": "internal_error"}
    )

# CORS middleware
origins = [o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()]

# Add additional headers for Google OAuth
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include feature routers
app.include_router(fitness_router)
app.include_router(travel_router)
app.include_router(weather_router)
app.include_router(ledger_router)
app.include_router(users_router)
app.include_router(credit_cards_router)
app.include_router(spending_categories_router)
app.include_router(ai_assistant_router)

# Auth endpoints
@app.post("/auth/google")
async def auth_google(token: dict, response: Response, db = Depends(get_db)):
    if database_available:
        return await google_auth(token, response, db)
    else:
        return await google_auth_simple(token, response)

@app.post("/logout")
async def auth_logout(response: Response):
    if database_available:
        return await logout(response)
    else:
        return await logout_simple(response)

@app.get("/user/profile")
async def user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/debug/cookies")
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

@app.get("/")
async def root():
    return {"message": "Personal Life Tracking API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint with optimized database check"""
    global database_available
    
    # Use cached database status to reduce connection overhead
    db_status = "connected" if database_available else "disconnected"
    db_error = None
    
    # Only do a full database check if we haven't established connection yet
    if not database_available:
        try:
            from database import engine
            from sqlalchemy import text
            
            # Use existing engine from database module
            with engine.connect() as connection:
                result = connection.execute(text("SELECT 1"))
                db_status = "connected"
                database_available = True
                
        except Exception as e:
            db_status = "disconnected"
            db_error = str(e)
            database_available = False
    
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

@app.get("/debug/pool-status")
async def get_pool_status():
    """Get database connection pool status for debugging"""
    try:
        from database import get_pool_status
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

# Catch-all route to serve React app for client-side routing
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str, request: Request):
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 