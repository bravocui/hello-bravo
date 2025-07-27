# Database Setup & User Profile System

## Overview

We've successfully integrated CloudSQL (PostgreSQL) with the backend and built a comprehensive user profile system.

## 🗄️ Database Structure

### Tables Created:

1. **`users`** - User profiles and authentication
   - `id` (Primary Key)
   - `email` (Unique, indexed)
   - `name`
   - `picture_url`
   - `is_active`
   - `created_at`, `updated_at`

2. **`fitness_entries`** - Fitness tracking data
   - `id` (Primary Key)
   - `user_id` (Foreign Key to users)
   - `date`, `activity`, `duration_minutes`
   - `calories`, `notes`
   - `created_at`, `updated_at`

3. **`travel_entries`** - Travel log data
   - `id` (Primary Key)
   - `user_id` (Foreign Key to users)
   - `destination`, `start_date`, `end_date`
   - `description`, `rating`, `photos` (JSON)
   - `created_at`, `updated_at`

4. **`ledger_entries`** - Accounting/expense data
   - `id` (Primary Key)
   - `user_id` (Foreign Key to users)
   - `year`, `month`, `category`, `amount`
   - `credit_card`, `owner`, `notes`
   - `created_at`, `updated_at`

## 🔧 Files Created/Modified

### Database Configuration:
- **`database.py`** - SQLAlchemy setup and session management
- **`db_models.py`** - SQLAlchemy ORM models
- **`alembic.ini`** - Database migration configuration
- **`alembic/env.py`** - Alembic environment setup

### User System:
- **`services/user_service.py`** - User CRUD operations
- **`features/users.py`** - User profile API endpoints
- **`auth.py`** - Updated to use database users

### Migration:
- **`alembic/versions/cf3c0a3a6236_initial_database_schema.py`** - Initial database schema

## 🚀 Setup Instructions

### 1. Environment Variables

Update your `.env` file with CloudSQL connection:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@your-cloudsql-instance/database_name

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id

# CORS Configuration
ALLOWED_ORIGINS=https://bravocui.github.io,http://localhost:3000
```

### 2. Database Migration

```bash
cd backend

# Create and apply migrations
alembic upgrade head

# To create new migrations
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

### 3. Test the Setup

```bash
# Start the backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test user endpoints
curl -X GET http://localhost:8000/users/profile
```

## 📊 User Profile Features

### Authentication Flow:
1. **Google OAuth** → Verify token with Google
2. **User Creation** → Auto-create user in database if new
3. **JWT Token** → Contains user ID and profile data
4. **Session Management** → Secure HTTP-only cookies

### Profile Endpoints:
- **`GET /users/profile`** - Get user profile with statistics
- **`PUT /users/profile`** - Update user profile

### Profile Statistics:
- Fitness entries count
- Travel entries count
- Ledger entries count
- Total expenses

## 🔐 Security Features

- **JWT Authentication** with secure HTTP-only cookies
- **Google OAuth** integration
- **Database user validation** on each request
- **CORS protection** for cross-origin requests
- **SQL injection protection** via SQLAlchemy ORM

## 🗂️ Project Structure

```
backend/
├── database.py              # Database configuration
├── db_models.py             # SQLAlchemy models
├── auth.py                  # Authentication logic
├── services/
│   └── user_service.py      # User business logic
├── features/
│   ├── users.py             # User API endpoints
│   ├── fitness.py           # Fitness endpoints
│   ├── travel.py            # Travel endpoints
│   ├── weather.py           # Weather endpoints
│   └── ledger.py            # Accounting endpoints
├── alembic/                 # Database migrations
│   ├── env.py
│   └── versions/
└── .env                     # Environment variables
```

## 🎯 Next Steps

1. **CloudSQL Setup**: Configure your CloudSQL instance
2. **Environment Variables**: Update `.env` with your CloudSQL credentials
3. **Migration**: Run `alembic upgrade head` to create tables
4. **Testing**: Test authentication and user profile endpoints
5. **Feature Migration**: Update other features to use database instead of mock data

## 🔍 Testing

### Test User Profile:
```bash
# Login first to get session cookie
curl -X POST http://localhost:8000/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "demo-token-123"}' \
  -c cookies.txt

# Get user profile
curl -X GET http://localhost:8000/users/profile \
  -b cookies.txt
```

The user profile system is now ready for production use with CloudSQL! 🎉 