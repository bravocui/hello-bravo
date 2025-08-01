# Backend Architecture

This backend follows a modular architecture pattern for better maintainability and separation of concerns.

## Directory Structure

```
backend/
├── main.py                    # Entry point - FastAPI app initialization
├── config.py                  # Configuration settings
├── auth.py                    # Authentication logic
├── auth_simple.py             # Simplified auth for development
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Container configuration
├── alembic.ini               # Database migration config
├── env.example               # Environment variables template
├── README.md                 # Architecture documentation
│
├── app/                      # Application setup and configuration
│   ├── __init__.py
│   ├── middleware.py         # CORS configuration
│   ├── handlers.py           # Global exception handling
│   └── startup.py            # Database connection setup
│
├── routes/                   # Core API routes
│   ├── __init__.py
│   └── core.py               # Auth, health, debug endpoints
│
├── features/                 # Feature-specific API routes
│   ├── __init__.py
│   ├── fitness.py            # Fitness tracking endpoints
│   ├── travel.py             # Travel tracking endpoints
│   ├── weather.py            # Weather API endpoints
│   ├── ledger.py             # Financial ledger endpoints
│   ├── users.py              # User management endpoints
│   ├── credit_cards.py       # Credit card management
│   ├── spending_categories.py # Spending categories
│   └── ai_assistant.py       # AI assistant endpoints
│
├── services/                 # Business logic layer
│   ├── __init__.py
│   ├── user_service.py       # User business logic
│   ├── ledger_service.py     # Financial business logic
│   ├── credit_card_service.py # Credit card business logic
│   ├── spending_category_service.py # Category business logic
│   └── ai_assistant_service.py # AI processing logic
│
├── database/                 # Database layer
│   ├── __init__.py
│   ├── database.py           # Database connection
│   ├── database_config.py    # Database configuration
│   ├── models.py             # Pydantic models
│   └── db_models.py          # SQLAlchemy models
│
├── tools/                    # Utility tools
│   ├── __init__.py
│   ├── monitor_db.py         # Database monitoring
│   └── README.md             # Tools documentation
│
└── alembic/                  # Database migrations
    ├── env.py
    ├── script.py.mako
    └── versions/             # Migration files
```

## Architecture Principles

### 1. **Separation of Concerns**
- **Routes**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Models**: Define data structures
- **Middleware**: Handle cross-cutting concerns

### 2. **Modular Design**
- Each feature has its own router and service
- Common functionality is extracted into shared modules
- Clear boundaries between different layers

### 3. **Dependency Injection**
- FastAPI's dependency injection system
- Services are injected into routes
- Database sessions are managed automatically

### 4. **Error Handling**
- Global exception handlers in `handlers/exceptions.py`
- Consistent error responses across all endpoints
- Proper HTTP status codes

## Key Components

### Main Application (`main.py`)
- FastAPI app initialization
- Middleware setup
- Router inclusion
- Clean and minimal entry point

### App (`app/`)
- CORS configuration
- Global exception handling
- Database startup logic
- Application setup and configuration

### Routes (`routes/` and `features/`)
- HTTP endpoint definitions
- Request validation
- Response formatting
- Authentication checks

### Services (`services/`)
- Business logic implementation
- Database operations
- External API integrations
- Data processing

### Database (`database/`)
- Connection management
- Model definitions
- Migration handling

## Benefits of This Structure

1. **Maintainability**: Each component has a single responsibility
2. **Testability**: Services can be unit tested independently
3. **Scalability**: New features can be added without affecting existing code
4. **Readability**: Clear organization makes code easier to understand
5. **Reusability**: Services can be reused across different routes

## Adding New Features

To add a new feature:

1. Create a new router in `features/`
2. Create a corresponding service in `services/`
3. Add the router to `main.py`
4. Add any necessary database models
5. Create migrations if needed

This structure ensures that the codebase remains organized and maintainable as it grows. 