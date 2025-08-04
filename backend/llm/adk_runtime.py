import logging
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.adk.agents import Agent
from typing import Dict, Optional

# Configure logging
logger = logging.getLogger(__name__)


class AdkRuntime:
    def __init__(self):
        """Initialize the ADK runtime with session management"""
        logger.info("[INIT] Initializing ADK Runtime")
        self.session_service = InMemorySessionService()
        self.runners: Dict[str, Runner] = {}
        logger.info("[OK] ADK Runtime initialized")

    def get_or_create_runner(self, agent_name: str, agent: Agent) -> Runner:
        """Get an existing runner for the agent or create a new one"""
        logger.info(f"[RUNNER] Getting or creating runner for agent: {agent_name}")
        
        if agent_name in self.runners:
            logger.info(f"[OK] Reusing existing runner for agent: {agent_name}")
            return self.runners[agent_name]
        
        logger.info(f"[CREATE] Creating new runner for agent: {agent_name}")
        runner = Runner(
            agent=agent,
            app_name=agent_name,
            session_service=self.session_service,
        )
        self.runners[agent_name] = runner
        logger.info(f"[OK] Created new runner for agent: {agent_name}")
        return runner

    def get_or_create_session(self, app: str, user: str):
        """Get an existing session if it exists, otherwise create a new one"""
        logger.info(f"[SESSION] Getting or creating session for app: {app}, user: {user}")
        
        # WARNING: This is vulnerable to race conditions!
        # This is provided solely as an example for demonstration purposes.
        # DO NOT USE THIS PATTERN IN PRODUCTION.
        existing_sessions = self.session_service.list_sessions(
            app_name=app, user_id=user
        )
        if existing_sessions.sessions:
            logger.info(f"[OK] Reusing existing session for app: {app}, user: {user}")
            return existing_sessions.sessions[0]

        logger.info(f"[CREATE] Creating new session for app: {app}, user: {user}")
        session = self.session_service.create_session(
            app_name=app, user_id=user
        )
        logger.info(f"[OK] Created new session: {session.id}")
        return session


# Create a global singleton instance
logger.info("[BUILD] Creating global ADK Runtime singleton")
adk_runtime = AdkRuntime() 