#!/usr/bin/env python3
"""
Migration script to add GUEST role to UserRole enum
Run this script to update the database schema for development
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL

def migrate_add_guest_role():
    """Add GUEST role to the UserRole enum in the database"""
    
    print("🔧 Starting migration: Add GUEST role to UserRole enum")
    print("=" * 60)
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        with engine.connect() as connection:
            print("✅ Connected to database")
            
            # Check if GUEST role already exists
            result = connection.execute(text("""
                SELECT unnest(enum_range(NULL::userrole)) as role_value;
            """))
            existing_roles = [row[0] for row in result]
            
            print(f"📋 Current roles in database: {existing_roles}")
            
            if 'guest' in existing_roles:
                print("✅ GUEST role already exists in database")
                return
            
            # Add GUEST role to the enum
            print("➕ Adding GUEST role to UserRole enum...")
            
            # PostgreSQL: Add new enum value
            connection.execute(text("ALTER TYPE userrole ADD VALUE 'guest';"))
            connection.commit()
            
            print("✅ Successfully added GUEST role to UserRole enum")
            
            # Verify the change
            result = connection.execute(text("""
                SELECT unnest(enum_range(NULL::userrole)) as role_value;
            """))
            updated_roles = [row[0] for row in result]
            print(f"📋 Updated roles in database: {updated_roles}")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print(f"🔍 Error type: {type(e).__name__}")
        return False
    
    print("✅ Migration completed successfully!")
    return True

if __name__ == "__main__":
    success = migrate_add_guest_role()
    sys.exit(0 if success else 1) 