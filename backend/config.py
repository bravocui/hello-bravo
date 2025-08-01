"""
Centralized configuration management
"""
import os
from dotenv import load_dotenv

def load_environment():
    """Load environment variables based on ENVIRONMENT setting"""
    environment = os.getenv("ENVIRONMENT", "development")
    
    # Load environment file if it exists
    if environment == "production":
        env_file = ".env.prod"
    elif environment == "development":
        env_file = ".env.dev"
    else:
        # Fail fast if environment is not recognized
        raise ValueError(f"❌ Unrecognized environment: '{environment}'. Must be 'development' or 'production'")
    
    # Try to load the environment file
    if os.path.exists(env_file):
        print(f"📁 Loading environment file: {env_file}")
        load_dotenv(env_file)
    else:
        print(f"⚠️  Environment file not found: {env_file}")
        print(f"🔧 Using environment variables from Cloud Run/System")
    
    return environment

# Load environment variables when module is imported
ENVIRONMENT = load_environment()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/life_tracker")

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET", "supersecret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days (legacy)
JWT_DEFAULT_EXPIRE_MINUTES = int(os.getenv("JWT_DEFAULT_EXPIRE_MINUTES", "60"))  # 1 hours
JWT_STAY_LOGGED_IN_EXPIRE_MINUTES = int(os.getenv("JWT_STAY_LOGGED_IN_EXPIRE_MINUTES", "10080"))  # 7 days
JWT_COOKIE_NAME = "session_token"

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# CORS configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://bravocui.github.io,http://localhost:3000")

# GCS configuration
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "bravocui-site")
GCS_PREFIX = os.getenv("GCS_PREFIX", "dev/")

# Debug: Print configuration (without sensitive data)
print(f"🔧 Environment: {ENVIRONMENT}")
print(f"🌐 Database URL: {DATABASE_URL.split('@')[0]}@***")  # Hide password
print(f"🔑 JWT Algorithm: {JWT_ALGORITHM}")
print(f"🌍 Allowed Origins: {ALLOWED_ORIGINS}") 