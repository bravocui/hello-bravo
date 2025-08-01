from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import ALLOWED_ORIGINS

def setup_cors_middleware(app: FastAPI) -> None:
    """Setup CORS middleware for the FastAPI app"""
    origins = [o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    ) 