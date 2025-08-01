from fastapi import FastAPI
from sqlalchemy import text

# Global database connection status
database_available = False

def setup_database_startup(app: FastAPI) -> None:
    """Setup database connection test on startup"""
    
    @app.on_event("startup")
    async def test_database_connection():
        global database_available
        try:
            from database.database import engine
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

def get_database_status() -> bool:
    """Get current database availability status"""
    return database_available 