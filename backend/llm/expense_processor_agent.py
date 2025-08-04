import logging
from sqlalchemy.orm import Session
from database.db_models import SpendingCategory as DBSpendingCategory
from google.adk.agents import Agent
from config import MODEL_NAME_GENAI

# Configure logging
logger = logging.getLogger(__name__)

# Global constants
EXPENSE_PROCESSOR_AGENT_NAME = "ExpenseProcessor"


def _system_instruction(category_names: list[str]) -> str:
    """Create the system prompt for AI processing"""
    category_names_str = ", ".join(category_names)

    return f"""
You are an AI assistant that extracts expense information from user input or images.

Extract expense information and return ONLY this JSON format:
[
    {{
        "category": "exact_category_name",
        "amount": number,
        "year": number (optional),
        "month": number (optional),
        "notes": "brief explanation"
    }}
]

Rules:
- Use ONLY the exact category names in this list: {', '.join(category_names)}
- If no match, use "Others". Merge all "Others" into one entry, with short note explaining how you calculated the amount from the input.
- Respond with ONLY the JSON array - no other text
- No explanations, no conversation, no markdown
- Just the raw JSON array

Example input: "I spent $25 on lunch today"
Example output: [{{"category": "Food", "amount": 25, "notes": "Lunch expense"}}]

Example Bad Notes of "Others" category: Extracted from the 'Shopping' row in the provided spending breakdown.
Example Bad Notes of "Others" category: Calculated by summing 'Personal' ($13.42) and 'Home' ($11.67) expenses, as these categories are not in the allowed list.
Example Good Notes of "Others" category: From 'Shopping' row.
Example Good Notes of "Others" category: Sum: 'Personal' ($13.42) + 'Home' ($11.67) = $25.09.
    """


# Global cache for the agent
_expense_processor_agent = None


def create_or_get_expense_processor_agent(category_names: list[str]) -> Agent:
    """Create or get the expense processor agent (cached)"""
    global _expense_processor_agent
    
    if _expense_processor_agent is not None:
        return _expense_processor_agent

    logger.info(f"[AGENT] Creating agent {EXPENSE_PROCESSOR_AGENT_NAME}")

    # Create the agent
    _expense_processor_agent = Agent(
        name=EXPENSE_PROCESSOR_AGENT_NAME,
        model=MODEL_NAME_GENAI,
        description="Agent to extract and process expense information from text and images",
        instruction=_system_instruction(category_names),
    )

    return _expense_processor_agent 