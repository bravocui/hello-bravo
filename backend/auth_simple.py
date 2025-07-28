"""
Simplified auth module for testing without database
"""
from fastapi import HTTPException, Response
from datetime import datetime, timedelta
from jose import jwt
from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES, JWT_COOKIE_NAME

def create_jwt(user: dict):
    """Create JWT token for user"""
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode = {"sub": user["email"], "exp": expire, "user": user}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def google_auth_simple(token: dict, response: Response):
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
        
        jwt_token = create_jwt(jwt_user_data)
        
        # Set secure, HTTP-only cookie
        response.set_cookie(
            key=JWT_COOKIE_NAME,
            value=jwt_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=JWT_EXPIRE_MINUTES*60
        )
        return {"user": jwt_user_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

async def logout_simple(response: Response):
    """Handle user logout"""
    response.delete_cookie(JWT_COOKIE_NAME)
    return {"message": "Logged out"} 