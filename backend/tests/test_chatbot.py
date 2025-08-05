import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock, AsyncMock

from main import app
from auth import get_current_user

class TestChatbot:
    @pytest.mark.asyncio
    async def test_chatbot_health(self):
        """
        Tests the /chatbot/health endpoint.
        """
        app.dependency_overrides[get_current_user] = lambda: MagicMock()

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/chatbot/health")

        assert response.status_code == 200

        expected_response = {
            "status": "healthy",
            "model_available": True,
            "adk_initialized": True,
            "runner_initialized": True,
            "adk_runtime_available": True,
            "chatbot_agent_available": True,
            "model": "gemini-2.0-flash"
        }
        assert response.json() == expected_response

        app.dependency_overrides = {}

    @pytest.mark.asyncio
    @patch('services.chatbot_service.chatbot_service.send_message', new_callable=AsyncMock)
    async def test_send_message(self, mock_send_message):
        """
        Tests the /chatbot/send-message endpoint.
        """
        user = MagicMock()
        user.id = 1
        app.dependency_overrides[get_current_user] = lambda: user

        mock_response = {
            "response": "Hello, this is a mocked response.",
            "timestamp": "2024-01-01T00:00:00Z"
        }
        mock_send_message.return_value = mock_response

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/chatbot/send-message", json={"message": "Hello"})

        assert response.status_code == 200
        assert response.json() == mock_response
        mock_send_message.assert_called_once_with(message="Hello", user_id='1')

        app.dependency_overrides = {}

    @pytest.mark.asyncio
    @patch('services.chatbot_service.chatbot_service.send_message_stream')
    async def test_send_message_stream(self, mock_send_message_stream):
        """
        Tests the /chatbot/send-message-stream endpoint.
        """
        user = MagicMock()
        user.id = 1
        app.dependency_overrides[get_current_user] = lambda: user

        async def mock_stream():
            yield "Hello, "
            yield "this is "
            yield "a streamed response."

        mock_send_message_stream.return_value = mock_stream()

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/chatbot/send-message-stream", json={"message": "Hello"})

        assert response.status_code == 200

        # Collect the streamed content
        content = ""
        async for chunk in response.aiter_bytes():
            content += chunk.decode("utf-8")

        assert content == "Hello, this is a streamed response."
        mock_send_message_stream.assert_called_once_with(message="Hello", user_id='1')

        app.dependency_overrides = {}
