#!/usr/bin/env python3
"""
Test to check what methods are available on ADK agent
"""

import os
import sys
from google.adk.agents import Agent
from google.genai.types import Content, Part

# Set up environment
os.environ.setdefault("GOOGLE_API_KEY", "your_api_key_here")

def test_adk_agent_methods():
    """Test what methods are available on ADK agent"""
    print("Testing ADK agent methods...")
    
    try:
        # Create a simple agent
        agent = Agent(
            name="TestAgent",
            model="gemini-1.5-flash",
            description="A test agent",
            instruction="You are a helpful assistant. Respond with 'Hello from ADK!'"
        )
        
        print("✅ ADK Agent created successfully")
        print(f"Agent name: {agent.name}")
        print(f"Agent model: {agent.model}")
        print(f"Agent instruction: {agent.instruction}")
        
        # Check what methods are available
        print("\n🔍 Available methods on agent:")
        methods = [method for method in dir(agent) if not method.startswith('_')]
        for method in methods:
            print(f"  - {method}")
        
        # Check if invoke method exists
        if hasattr(agent, 'invoke'):
            print("\n✅ invoke() method exists")
        else:
            print("\n❌ invoke() method does not exist")
            
        # Check if generate method exists
        if hasattr(agent, 'generate'):
            print("✅ generate() method exists")
        else:
            print("❌ generate() method does not exist")
            
        # Check if run method exists
        if hasattr(agent, 'run'):
            print("✅ run() method exists")
        else:
            print("❌ run() method does not exist")
        
        return True
        
    except Exception as e:
        print(f"❌ ADK test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_adk_agent_methods()
    sys.exit(0 if success else 1) 