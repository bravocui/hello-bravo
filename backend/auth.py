from fastapi import HTTPException, Depends, Response, Cookie, Header
from jose import jwt, JWTError
import requests
from datetime import datetime, timedelta
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
import base64
import os
from sqlalchemy.orm import Session
from models import User
from mock_data import MOCK_USERS
from database import get_db
from services.user_service import UserService

# Import centralized configuration
from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES, GOOGLE_CLIENT_ID, ENVIRONMENT

# JWT Configuration
JWT_COOKIE_NAME = "session_token"

async def verify_google_token(id_token: str):
    """Verify Google ID token"""
    # For demo tokens, skip verification
    if id_token.startswith('demo-token-'):
        return MOCK_USERS["demo-token"]
    
    try:
        # Get Google's public keys
        keys_url = "https://www.googleapis.com/oauth2/v1/certs"
        keys_response = requests.get(keys_url)
        keys_response.raise_for_status()
        keys = keys_response.json()
        
        # Decode the JWT header to get the key ID
        header = jwt.get_unverified_header(id_token)
        key_id = header.get('kid')
        
        if not key_id or key_id not in keys:
            raise HTTPException(status_code=401, detail="Invalid token key")
        
        # Get the public key
        public_key = keys[key_id]
        
        # Verify the token
        payload = jwt.decode(
            id_token,
            public_key,
            algorithms=['RS256'],
            audience=GOOGLE_CLIENT_ID,
            issuer='https://accounts.google.com'
        )
        
        return {
            "email": payload["email"],
            "name": payload.get("name", payload["email"]),
            "picture": payload.get("picture")
        }
        
    except jwt.JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token verification error: {str(e)}")

def create_jwt(user: dict):
    """Create JWT token for user"""
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode = {"sub": user["email"], "exp": expire, "user": user}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(
    session_token: str = Cookie(None), 
    authorization: str = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from JWT cookie or Authorization header"""
    print(f"🔐 Authentication Debug:")
    print(f"   Session token present: {session_token is not None}")
    print(f"   Authorization header present: {authorization is not None}")
    print(f"   Session token length: {len(session_token) if session_token else 0}")
    print(f"   Session token preview: {session_token[:50] if session_token else 'None'}...")
    
    # Try to get token from cookie first, then from Authorization header
    token = session_token
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization[7:]  # Remove "Bearer " prefix
            print(f"   Using Authorization header token")
    
    if not token:
        print("❌ No session token found in cookies or Authorization header")
        print("🔍 This usually means:")
        print("   1. Cookies are not being sent by the browser")
        print("   2. SameSite policy is blocking the cookie")
        print("   3. Cookie domain/path is incorrect")
        print("   4. Authorization header not set")
        raise HTTPException(status_code=401, detail="Not authenticated (no token)")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_data = payload["user"]
        print(f"✅ JWT decoded successfully for user: {user_data.get('email', 'Unknown')}")
        
        # Check if this is a guest user
        is_guest = (user_data.get('email', '').startswith('guest-') or 
                   user_data.get('role') == 'guest' or
                   user_data.get('id') == 0)
        
        if is_guest:
            print(f"🎭 Guest user detected: {user_data.get('email', 'Unknown')}")
            # Return guest user without database lookup
            return User(
                id=0,
                email=user_data.get('email', ''),
                name=user_data.get('name', 'Guest User'),
                picture=user_data.get('picture'),
                role=user_data.get('role', 'guest')
            )
        
        # For regular users, get fresh user data from database
        try:
            db_user = UserService.get_user_by_id(db, user_data["id"])
            if not db_user:
                print(f"❌ User not found in database: {user_data.get('email', 'Unknown')}")
                raise HTTPException(status_code=401, detail="User not found in database")
            print(f"✅ User found in database: {db_user.email}")
        except Exception as db_error:
            # Check if it's a connection error
            error_str = str(db_error).lower()
            if any(keyword in error_str for keyword in ['timeout', 'connection', 'network', 'unreachable']):
                # Database is unavailable - return error with specific message
                print(f"❌ Database connection error: {db_error}")
                raise HTTPException(
                    status_code=503, 
                    detail="Database is currently unavailable. Please try again later."
                )
            else:
                # Other database errors
                error_msg = f"Database error during authentication: {str(db_error)}"
                print(f"❌ Database error: {error_msg}")
                raise HTTPException(status_code=500, detail=error_msg)
        
        return User(
            id=db_user.id,
            email=db_user.email,
            name=db_user.name,
            picture=db_user.picture_url,
            role=db_user.role.value
        )
    except JWTError as jwt_error:
        print(f"❌ JWT decode error: {jwt_error}")
        raise HTTPException(status_code=401, detail=f"Invalid session token: {str(jwt_error)}")
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")

async def google_auth(token: dict, response: Response, db: Session = Depends(get_db)):
    """Handle Google OAuth authentication"""
    try:
        token_value = token.get("token", "")
        
        # Guest login
        if token_value.startswith('guest-token-'):
            user_data = {
                "email": f"guest-{datetime.now().timestamp()}@example.com",
                "name": "Guest User",
                "picture": None,
                "role": "guest"
            }
        else:
            user_data = await verify_google_token(token_value)
        
        # For Google login, check if user exists in database
        if not token_value.startswith('guest-token-'):
            try:
                # Check if user exists
                existing_user = UserService.get_user_by_email(db, user_data["email"])
                if not existing_user:
                    # New user - don't add to database, show message
                    raise HTTPException(
                        status_code=403,
                        detail="Login as guest. Please contact admin to add you as user."
                    )
                
                # User exists, use their data
                db_user = existing_user
                user_data = {
                    "email": db_user.email,
                    "name": db_user.name,
                    "picture": db_user.picture_url,
                    "role": db_user.role.value
                }
            except Exception as db_error:
                # Check if it's a connection error
                error_str = str(db_error).lower()
                if any(keyword in error_str for keyword in ['timeout', 'connection', 'network', 'unreachable']):
                    # Database is unavailable - return error with specific message
                    raise HTTPException(
                        status_code=503, 
                        detail="Database is currently unavailable. Please try again later."
                    )
                else:
                    # Other database errors
                    error_msg = f"Database error during login: {str(db_error)}"
                    raise HTTPException(status_code=500, detail=error_msg)
        
        # Create JWT with user data
        jwt_user_data = {
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "id": user_data.get("id", 0),
            "role": user_data["role"]
        }
        
        jwt_token = create_jwt(jwt_user_data)
        
        # Configure cookie settings based on environment
        cookie_kwargs = {
            "key": JWT_COOKIE_NAME,
            "value": jwt_token,
            "httponly": True,
            "secure": True,
            "max_age": JWT_EXPIRE_MINUTES * 60,
            "path": "/"  # Ensure cookie is sent to all paths
        }
        
        # Set SameSite and domain based on environment
        if ENVIRONMENT == "production":
            # For production: cross-domain cookies
            cookie_kwargs.update({
                "samesite": "none",     # Allow cross-site cookies
                "domain": ".us-central1.run.app",  # Set explicit domain for cross-subdomain
            })
        else:
            # For development: local cookies
            cookie_kwargs.update({
                "samesite": "lax"
            })
        
        response.set_cookie(**cookie_kwargs)
        print(f"🍪 Cookie set successfully:")
        print(f"   Key: {JWT_COOKIE_NAME}")
        print(f"   Path: {cookie_kwargs.get('path', 'Not set')}")
        print(f"   SameSite: {cookie_kwargs.get('samesite', 'Not set')}")
        print(f"   Secure: {cookie_kwargs.get('secure', 'Not set')}")
        print(f"   HttpOnly: {cookie_kwargs.get('httponly', 'Not set')}")
        print(f"   Max Age: {cookie_kwargs.get('max_age', 'Not set')}")
        return {
            "user": jwt_user_data,
            "token": jwt_token  # Include token for frontend storage
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions (like from verify_google_token)
        raise
    except Exception as e:
        # Catch any other unexpected errors
        error_msg = f"Login failed: {str(e)}"
        if "google" in str(e).lower():
            error_msg = f"Google authentication error: {str(e)}"
        elif "jwt" in str(e).lower():
            error_msg = f"Token creation error: {str(e)}"
        raise HTTPException(status_code=500, detail=error_msg)

async def logout(response: Response):
    """Handle user logout"""
    # Configure cookie deletion based on environment
    cookie_kwargs = {
        "key": JWT_COOKIE_NAME,
        "path": "/"  # Ensure cookie is deleted from all paths
    }
    
    if ENVIRONMENT == "production":
        cookie_kwargs.update({
            "secure": True,
            "samesite": "none",
            "domain": None
        })
    
    response.delete_cookie(**cookie_kwargs)
    return {"message": "Logged out"}

async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user 