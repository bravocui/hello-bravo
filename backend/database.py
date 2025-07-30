from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

# Import centralized configuration
from config import DATABASE_URL
from database_config import get_pool_config, print_config

# Get pool configuration
pool_config = get_pool_config()

# Log database configuration
print_config()
print(f"   📍 DATABASE_URL: {DATABASE_URL}")
print("=" * 60)

# Create SQLAlchemy engine with optimized pool settings
try:
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,  # Explicitly use QueuePool
        pool_pre_ping=True,   # Enable connection health checks
        pool_recycle=pool_config["pool_recycle"],     # Recycle connections
        pool_timeout=pool_config["pool_timeout"],     # Wait for connection
        pool_size=pool_config["pool_size"],           # Keep connections in the pool
        max_overflow=pool_config["max_overflow"],     # Additional connections allowed
        echo=False,           # Disable SQL logging in production
        connect_args={
            "connect_timeout": pool_config["connect_timeout"],  # Connection timeout
            "application_name": "hello-bravo-backend",  # Identify connections
            "options": f"-c statement_timeout={pool_config['statement_timeout']}"  # Statement timeout
        }
    )
    print("✅ SQLAlchemy engine created successfully")
except Exception as e:
    print(f"❌ Failed to create SQLAlchemy engine: {e}")
    raise

# Create SessionLocal class with optimized settings
try:
    SessionLocal = sessionmaker(
        autocommit=False, 
        autoflush=False, 
        bind=engine,
        expire_on_commit=False  # Prevent lazy loading issues
    )
    print("✅ SessionLocal created successfully")
except Exception as e:
    print(f"❌ Failed to create SessionLocal: {e}")
    raise

# Create Base class for models
Base = declarative_base()
print("✅ SQLAlchemy Base class created")

# Dependency to get database session with better error handling
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        print(f"❌ Database session error: {e}")
        print(f"🔗 Database URL: {DATABASE_URL}")
        print(f"🔍 Error type: {type(e).__name__}")
        print(f"🔍 Error details: {str(e)}")
        try:
            db.rollback()
        except Exception as rollback_error:
            print(f"⚠️ Error during rollback: {rollback_error}")
        raise
    finally:
        try:
            db.close()
        except Exception as close_error:
            print(f"⚠️ Error closing database session: {close_error}")

# Function to get database session without dependency injection (for background tasks)
def get_db_session():
    """Get a database session for background tasks or manual usage"""
    return SessionLocal()

# Function to check pool status
def get_pool_status():
    """Get current connection pool status"""
    try:
        pool = engine.pool
        return {
            "pool_size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
            "invalid": pool.invalid()
        }
    except Exception as e:
        return {"error": str(e)} 