from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Import centralized configuration
from config import DATABASE_URL

# Log database configuration
print("🔧 Database Configuration:")
print(f"   📍 DATABASE_URL: {DATABASE_URL}")
print(f"   🔒 Pool pre-ping: Enabled")
print(f"   🔄 Pool recycle: 300 seconds")
print("=" * 60)

# Create SQLAlchemy engine
try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Enable connection health checks
        pool_recycle=300,    # Recycle connections after 5 minutes
        connect_args={"connect_timeout": 10}  # 10 second timeout
    )
    print("✅ SQLAlchemy engine created successfully")
except Exception as e:
    print(f"❌ Failed to create SQLAlchemy engine: {e}")
    raise

# Create SessionLocal class
try:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print("✅ SessionLocal created successfully")
except Exception as e:
    print(f"❌ Failed to create SessionLocal: {e}")
    raise

# Create Base class for models
Base = declarative_base()
print("✅ SQLAlchemy Base class created")

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        print("🔗 Database session created")
        yield db
    except Exception as e:
        print(f"❌ Database session error: {e}")
        print(f"🔗 Database URL: {DATABASE_URL}")
        print(f"🔍 Error type: {type(e).__name__}")
        print(f"🔍 Error details: {str(e)}")
        db.rollback()
        raise
    finally:
        try:
            db.close()
            print("🔗 Database session closed")
        except Exception as close_error:
            print(f"⚠️ Error closing database session: {close_error}") 