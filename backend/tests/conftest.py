import sys
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).parent.parent
sys.path.append(str(backend_path))

import pytest
from app.core.config import settings

@pytest.fixture(autouse=True)
def mock_settings_env(monkeypatch):
    """Mock environment variables and settings for testing."""
    monkeypatch.setenv("GROQ_API_KEY", "test_key")
    monkeypatch.setattr(settings, "GROQ_API_KEY", "test_key")
    monkeypatch.setattr(settings, "DEBUG", True)
    return settings
