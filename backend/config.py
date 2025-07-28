"""
Centralized configuration management
"""
import os
from dotenv import load_dotenv

def load_environment():
    """Load environment variables based on ENVIRONMENT setting"""
    environment = os.getenv("ENVIRONMENT", "development")
    
    if environment == "production":
        env_file = ".env.production"
    elif environment == "development":
        env_file = ".env.development"
    else:
        env_file = ".env"
    
    load_dotenv(env_file)
    return environment

# Load environment variables when module is imported
ENVIRONMENT = load_environment()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/life_tracker")

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET", "supersecret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))
JWT_COOKIE_NAME = "session_token"

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# CORS configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://bravocui.github.io,http://localhost:3000")

# GCS configuration
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "bravocui-site")
GCS_PREFIX = os.getenv("GCS_PREFIX", "dev/") 