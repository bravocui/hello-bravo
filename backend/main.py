from fastapi import FastAPI
import uvicorn

# Import configuration
from config import ENVIRONMENT

# Import setup functions
from app.middleware import setup_cors_middleware
from app.handlers import setup_exception_handlers
from app.startup import setup_database_startup

# Import routers
from app.system import router as core_router
from features.fitness import router as fitness_router
from features.travel import router as travel_router
from features.weather import router as weather_router
from features.ledger import router as ledger_router
from features.users import router as users_router
from features.credit_cards import router as credit_cards_router
from features.spending_categories import router as spending_categories_router
from features.ai_assistant import router as ai_assistant_router

# Create FastAPI app
app = FastAPI(title="Bravo Cui's Life Tracking", version="1.0.0")

# Setup middleware and handlers
setup_cors_middleware(app)
setup_exception_handlers(app)
setup_database_startup(app)

# Include all routers (API routes first)
app.include_router(fitness_router)
app.include_router(travel_router)
app.include_router(weather_router)
app.include_router(ledger_router)
app.include_router(users_router)
app.include_router(credit_cards_router)
app.include_router(spending_categories_router)
app.include_router(ai_assistant_router)
# Include core router last (contains catch-all route)
app.include_router(core_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 