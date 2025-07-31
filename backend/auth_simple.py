"""
Simplified auth module for testing without database
"""
from fastapi import HTTPException, Response
from datetime import datetime, timedelta
from jose import jwt
from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES, JWT_DEFAULT_EXPIRE_MINUTES, JWT_STAY_LOGGED_IN_EXPIRE_MINUTES, JWT_COOKIE_NAME, ENVIRONMENT

def create_jwt(user: dict, expiration_minutes: int = None):
    """Create JWT token for user"""
    # Use provided expiration or default to shorter session
    expire_minutes = expiration_minutes or JWT_DEFAULT_EXPIRE_MINUTES
    expire = datetime.utcnow() + timedelta(minutes=expire_minutes)
    to_encode = {"sub": user["email"], "exp": expire, "user": user}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def google_auth_simple(token: dict, response: Response, stay_logged_in: bool = False):
    """Handle Google OAuth authentication without database"""
    try:
        token_value = token.get("token", "")
        
        # Demo login
        if token_value.startswith('demo-token-'):
            user_data = {
                "email": "demo@example.com",
                "name": "Demo User",
                "picture": None
            }
        else:
            # For real tokens, just use the email as name for now
            user_data = {
                "email": "user@example.com",
                "name": "Test User", 
                "picture": None
            }
        
        # Create JWT
        jwt_user_data = {
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data["picture"],
            "id": 1  # Fake ID
        }
        
        # Determine expiration based on stay_logged_in preference
        expiration_minutes = JWT_STAY_LOGGED_IN_EXPIRE_MINUTES if stay_logged_in else JWT_DEFAULT_EXPIRE_MINUTES
        jwt_token = create_jwt(jwt_user_data, expiration_minutes)
        
        # Configure cookie settings based on environment
        cookie_kwargs = {
            "key": JWT_COOKIE_NAME,
            "value": jwt_token,
            "httponly": True,
            "secure": True,
            "max_age": expiration_minutes * 60,
            "path": "/"  # Ensure cookie is sent to all paths
        }
        # Set SameSite based on environment
        if ENVIRONMENT == "production":
            # For production: cross-domain cookies
            cookie_kwargs.update({
                "samesite": "lax"     # More compatible with mobile browsers
            })
        else:
            # For development: local cookies
            cookie_kwargs.update({
                "samesite": "lax"
            })
        
        response.set_cookie(**cookie_kwargs)
        print(f"🍪 Cookie set successfully (simple auth):")
        print(f"   Key: {JWT_COOKIE_NAME}")
        print(f"   Path: {cookie_kwargs.get('path', 'Not set')}")
        print(f"   SameSite: {cookie_kwargs.get('samesite', 'Not set')}")
        print(f"   Secure: {cookie_kwargs.get('secure', 'Not set')}")
        print(f"   HttpOnly: {cookie_kwargs.get('httponly', 'Not set')}")
        print(f"   Max Age: {cookie_kwargs.get('max_age', 'Not set')}")
        return {"user": jwt_user_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

async def logout_simple(response: Response):
    """Handle user logout"""
    # Configure cookie deletion based on environment
    cookie_kwargs = {
        "key": JWT_COOKIE_NAME,
        "path": "/"  # Ensure cookie is deleted from all paths
    }
    
    if ENVIRONMENT == "production":
        cookie_kwargs.update({
            "secure": True,
            "samesite": "lax"
        })
    
    response.delete_cookie(**cookie_kwargs)
    return {"message": "Logged out"} 