from fastapi import HTTPException, Depends, Response, Cookie
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

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "supersecret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_COOKIE_NAME = "session_token"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # Default: 1 week
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

async def verify_google_token(id_token: str):
    """Verify Google ID token"""
    # For demo tokens, skip verification
    if id_token.startswith('demo-token-'):
        return MOCK_USERS["demo-token"]
    
    # Real Google token verification
    try:
        print(f"DEBUG: Starting Google token verification")
        # Get Google's public keys
        resp = requests.get('https://www.googleapis.com/oauth2/v3/certs')
        jwks = resp.json()
        print(f"DEBUG: Got {len(jwks['keys'])} Google public keys")
        
        # Decode and verify
        unverified_header = jwt.get_unverified_header(id_token)
        print(f"DEBUG: Token header: {unverified_header}")
        
        key = next((k for k in jwks['keys'] if k['kid'] == unverified_header['kid']), None)
        if not key:
            print(f"DEBUG: No matching key found for kid: {unverified_header['kid']}")
            raise HTTPException(status_code=401, detail="Invalid Google token (no key)")
        
        print(f"DEBUG: Found matching key")
        
        # Convert JWK to PEM format for python-jose
        n_b64 = key['n']
        e_b64 = key['e']
        
        # Decode base64url to bytes
        n = base64.urlsafe_b64decode(n_b64 + '==')
        e = base64.urlsafe_b64decode(e_b64 + '==')
        
        # Create RSA public key
        public_numbers = rsa.RSAPublicNumbers(
            e=int.from_bytes(e, 'big'),
            n=int.from_bytes(n, 'big')
        )
        public_key = public_numbers.public_key(backend=default_backend())
        
        # Convert to PEM format
        pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.PKCS1
        )
        
        print(f"DEBUG: About to decode JWT with audience: {GOOGLE_CLIENT_ID}")
        payload = jwt.decode(id_token, pem, algorithms=['RS256'], audience=GOOGLE_CLIENT_ID)
        print(f"DEBUG: JWT decoded successfully, email: {payload.get('email', 'N/A')}")
        
        # Extract user info
        return {
            "email": payload["email"],
            "name": payload.get("name", payload["email"]),
            "picture": payload.get("picture")
        }
    except Exception as e:
        print(f"DEBUG: Token verification error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")

def create_jwt(user: dict):
    """Create JWT token for user"""
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode = {"sub": user["email"], "exp": expire, "user": user}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(session_token: str = Cookie(None), db: Session = Depends(get_db)) -> User:
    """Get current user from JWT cookie"""
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated (no cookie)")
    try:
        payload = jwt.decode(session_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_data = payload["user"]
        
        # Get fresh user data from database
        db_user = UserService.get_user_by_id(db, user_data["id"])
        if not db_user:
            raise HTTPException(status_code=401, detail="User not found in database")
        
        return User(
            email=db_user.email,
            name=db_user.name,
            picture=db_user.picture_url
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid session token")

async def google_auth(token: dict, response: Response, db: Session = Depends(get_db)):
    """Handle Google OAuth authentication"""
    token_value = token.get("token", "")
    
    print(f"DEBUG: Received token type: {'demo' if token_value.startswith('demo-token-') else 'real'}")
    print(f"DEBUG: GOOGLE_CLIENT_ID: {GOOGLE_CLIENT_ID}")
    
    # Demo login
    if token_value.startswith('demo-token-'):
        user_data = MOCK_USERS["demo-token"]
    else:
        user_data = await verify_google_token(token_value)
    
    # Get or create user in database
    db_user = UserService.get_or_create_user(db, user_data)
    
    # Create JWT with database user ID
    jwt_user_data = {
        "email": db_user.email,
        "name": db_user.name,
        "picture": db_user.picture_url,
        "id": db_user.id
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

async def logout(response: Response):
    """Handle user logout"""
    response.delete_cookie(JWT_COOKIE_NAME)
    return {"message": "Logged out"}

async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user 