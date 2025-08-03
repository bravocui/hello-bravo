#!/usr/bin/env python3
"""
Simple test to verify ADK is working
"""

import os
import sys
from google.adk.agents import Agent
from google.genai.types import Content, Part

# Set up environment
os.environ.setdefault("GOOGLE_API_KEY", "your_api_key_here")

def test_simple_adk():
    """Test basic ADK functionality"""
    print("Testing basic ADK functionality...")
    
    try:
        # Create a simple agent
        agent = Agent(
            name="TestAgent",
            model="gemini-1.5-flash",
            description="A test agent",
            instruction="You are a helpful assistant. Respond with 'Hello from ADK!'"
        )
        
        # Create a simple message
        message = Content(parts=[Part(text="Hello")])
        
        print("✅ ADK Agent created successfully")
        print(f"Agent name: {agent.name}")
        print(f"Agent model: {agent.model}")
        print(f"Agent instruction: {agent.instruction}")
        
        return True
        
    except Exception as e:
        print(f"❌ ADK test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_simple_adk()
    sys.exit(0 if success else 1) 