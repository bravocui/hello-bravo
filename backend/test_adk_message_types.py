#!/usr/bin/env python3
"""
Test to check what message types ADK expects
"""

import os
import sys
from google.adk.agents import Agent
from google.genai.types import Content, Part

# Set up environment
os.environ.setdefault("GOOGLE_API_KEY", "your_api_key_here")

def test_adk_message_types():
    """Test what message types ADK expects"""
    print("Testing ADK message types...")
    
    try:
        # Create a simple agent
        agent = Agent(
            name="TestAgent",
            model="gemini-1.5-flash",
            description="A test agent",
            instruction="You are a helpful assistant. Respond with 'Hello from ADK!'"
        )
        
        print("✅ ADK Agent created successfully")
        
        # Check the agent's schema and input requirements
        print(f"\n🔍 Agent schema: {agent.schema}")
        print(f"🔍 Agent input_schema: {agent.input_schema}")
        print(f"🔍 Agent output_schema: {agent.output_schema}")
        
        # Check if there are any example methods or attributes
        if hasattr(agent, 'examples'):
            print(f"🔍 Agent examples: {agent.examples}")
        
        # Check the instruction format
        print(f"🔍 Agent instruction: {agent.instruction}")
        
        return True
        
    except Exception as e:
        print(f"❌ ADK test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_adk_message_types()
    sys.exit(0 if success else 1) 