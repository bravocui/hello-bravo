#!/usr/bin/env python3
"""
Test script to verify ADK integration in the AI Assistant Service
"""

import asyncio
import os
import sys
from unittest.mock import Mock, AsyncMock
from PIL import Image
import io

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.ai_assistant_service import ai_assistant_service
from database.database import get_db
from sqlalchemy.orm import Session

async def test_adk_integration():
    """Test the ADK integration"""
    print("Testing ADK Integration...")
    
    # Mock database session
    mock_db = Mock(spec=Session)
    mock_categories = [
        Mock(category_name="Food"),
        Mock(category_name="Transportation"),
        Mock(category_name="Shopping"),
        Mock(category_name="Others")
    ]
    mock_db.query.return_value.all.return_value = mock_categories
    
    # Test health status
    health_status = ai_assistant_service.get_health_status()
    print(f"Health Status: {health_status}")
    
    # Test with a simple prompt
    try:
        response = await ai_assistant_service.process_expense_with_ai(
            db=mock_db,
            prompt="I spent $25 on lunch today",
            images=[],
            user_id="test_user",
            session_id="test_session"
        )
        print(f"Response: {response}")
        print("✅ ADK integration test completed successfully!")
    except Exception as e:
        print(f"❌ ADK integration test failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    # Set up environment
    os.environ.setdefault("GOOGLE_API_KEY", "test_key")
    
    # Run the test
    success = asyncio.run(test_adk_integration())
    sys.exit(0 if success else 1) 