import logging
from sqlalchemy.orm import Session
from database.db_models import SpendingCategory as DBSpendingCategory
from google.adk.agents import Agent
from config import MODEL_NAME_GENAI

# Configure logging
logger = logging.getLogger(__name__)

# Global constants
EXPENSE_PROCESSOR_AGENT_NAME = "ExpenseProcessor"

# Fetch categories at module import time
def _get_available_categories() -> list[str]:
    """Get available spending categories from database"""
    logger.info("[DB] Fetching available spending categories from database")
    try:
        from database.database import get_db_session
        db = get_db_session()
        try:
            categories = db.query(DBSpendingCategory).all()
            category_names = [cat.category_name for cat in categories]
            logger.info(f"[OK] Found categories: {category_names}")
            return category_names
        finally:
            db.close()
    except Exception as e:
        logger.error(f"[ERROR] Database error while fetching categories: {str(e)}")
        return ["Food", "Transport", "Shopping", "Others"] # Fallback categories


# System instruction template
def get_system_instruction() -> str:
    """Get the system instruction for the agent."""
    return f"""
You are an AI assistant that extracts expense information from user input or images.

Extract expense information and return ONLY this JSON format:
{{
    "year": number (optional),
    "month": number (optional),
    "entries": [
        {{
            "category": "exact_category_name",
            "amount": number,
            "notes": "brief explanation"
        }}
    ]
}}

Rules:
- Use ONLY the exact category names in this list: {', '.join(_get_available_categories())}
- If no match, use "Others". Merge all "Others" into one entry, with short note explaining how you calculated the amount from the input.
- Respond with ONLY the JSON object - no other text
- No explanations, no conversation, no markdown
- Just the raw JSON object
- Only include year/month if they are explicitly mentioned in the input

Example input: "I spent $25 on lunch today"
Example output: {{"entries": [{{"category": "Food", "amount": 25, "notes": "Lunch expense"}}]}}

Example Bad Notes of "Others" category: Extracted from the 'Shopping' row in the provided spending breakdown.
Example Bad Notes of "Others" category: Calculated by summing 'Personal' ($13.42) and 'Home' ($11.67) expenses, as these categories are not in the allowed list.
Example Good Notes of "Others" category: From 'Shopping' row.
Example Good Notes of "Others" category: Sum: 'Personal' ($13.42) + 'Home' ($11.67) = $25.09.
"""


# Initialize agent at module import
expense_processor_agent = Agent(
    name=EXPENSE_PROCESSOR_AGENT_NAME,
    model=MODEL_NAME_GENAI,
    description="Agent to extract and process expense information from text and images",
    instruction=get_system_instruction,
)
logger.info(f"[INIT] Agent initialized at module import: {EXPENSE_PROCESSOR_AGENT_NAME}")

 