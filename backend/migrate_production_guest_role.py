#!/usr/bin/env python3
"""
Production migration script to add GUEST role to UserRole enum
Run this script to update the production database schema
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Set production database URL
PRODUCTION_DATABASE_URL = "postgresql://prod_user:812-Galt-prod@127.0.0.1/life_tracker_prod"

def migrate_production_add_guest_role():
    """Add GUEST role to the UserRole enum in production database"""
    
    print("🔧 Starting PRODUCTION migration: Add GUEST role to UserRole enum")
    print("=" * 70)
    print("⚠️  WARNING: This will modify the PRODUCTION database!")
    print(f"🗄️  Database: {PRODUCTION_DATABASE_URL}")
    print("=" * 70)
    
    # Confirm with user
    confirm = input("Are you sure you want to proceed with production migration? (yes/no): ")
    if confirm.lower() != 'yes':
        print("❌ Migration cancelled by user")
        return False
    
    try:
        # Create engine with production database URL
        engine = create_engine(PRODUCTION_DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        with engine.connect() as connection:
            print("✅ Connected to PRODUCTION database")
            
            # Check if GUEST role already exists
            result = connection.execute(text("""
                SELECT unnest(enum_range(NULL::userrole)) as role_value;
            """))
            existing_roles = [row[0] for row in result]
            
            print(f"📋 Current roles in production database: {existing_roles}")
            
            if 'guest' in existing_roles:
                print("✅ GUEST role already exists in production database")
                return True
            
            # Add GUEST role to the enum
            print("➕ Adding GUEST role to UserRole enum in production...")
            
            # PostgreSQL: Add new enum value
            connection.execute(text("ALTER TYPE userrole ADD VALUE 'guest';"))
            connection.commit()
            
            print("✅ Successfully added GUEST role to UserRole enum in production")
            
            # Verify the change
            result = connection.execute(text("""
                SELECT unnest(enum_range(NULL::userrole)) as role_value;
            """))
            updated_roles = [row[0] for row in result]
            print(f"📋 Updated roles in production database: {updated_roles}")
            
    except Exception as e:
        print(f"❌ Production migration failed: {e}")
        print(f"🔍 Error type: {type(e).__name__}")
        return False
    
    print("✅ Production migration completed successfully!")
    return True

if __name__ == "__main__":
    success = migrate_production_add_guest_role()
    sys.exit(0 if success else 1) 