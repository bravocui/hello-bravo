#!/usr/bin/env python3
"""
Check production database schema
Verify that the UserRole enum and users table have correct structure
"""

import sys
import os
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker

# Production database URL
PRODUCTION_DATABASE_URL = "postgresql://prod_user:812-Galt-prod@127.0.0.1/life_tracker_prod"

def check_production_schema():
    """Check the production database schema"""
    
    print("🔍 Checking Production Database Schema")
    print("=" * 50)
    print(f"🗄️  Database: {PRODUCTION_DATABASE_URL}")
    print("=" * 50)
    
    try:
        # Create engine
        engine = create_engine(PRODUCTION_DATABASE_URL)
        inspector = inspect(engine)
        
        with engine.connect() as connection:
            print("✅ Connected to production database")
            
            # Check if users table exists
            tables = inspector.get_table_names()
            print(f"📋 Tables in database: {tables}")
            
            if 'users' not in tables:
                print("❌ Users table not found!")
                return False
            
            # Check users table structure
            print("\n📊 Users table structure:")
            columns = inspector.get_columns('users')
            for column in columns:
                print(f"   • {column['name']}: {column['type']}")
            
            # Check UserRole enum values
            print("\n🎭 UserRole enum values:")
            result = connection.execute(text("""
                SELECT unnest(enum_range(NULL::userrole)) as role_value;
            """))
            roles = [row[0] for row in result]
            print(f"   • Available roles: {roles}")
            
            # Check if GUEST role exists
            if 'guest' in roles:
                print("✅ GUEST role found in UserRole enum")
            else:
                print("❌ GUEST role missing from UserRole enum")
                return False
            
            # Check existing users
            print("\n👥 Existing users:")
            result = connection.execute(text("""
                SELECT id, email, name, role, created_at 
                FROM users 
                ORDER BY created_at DESC 
                LIMIT 10;
            """))
            users = result.fetchall()
            
            if users:
                for user in users:
                    print(f"   • {user[1]} ({user[2]}) - Role: {user[3]}")
            else:
                print("   • No users found")
            
            # Check enum type definition
            print("\n🔧 UserRole enum definition:")
            result = connection.execute(text("""
                SELECT t.typname, e.enumlabel
                FROM pg_type t 
                JOIN pg_enum e ON t.oid = e.enumtypid  
                WHERE t.typname = 'userrole'
                ORDER BY e.enumsortorder;
            """))
            enum_values = [row[1] for row in result]
            print(f"   • Enum values: {enum_values}")
            
            print("\n✅ Production database schema check completed successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Schema check failed: {e}")
        print(f"🔍 Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    success = check_production_schema()
    sys.exit(0 if success else 1) 