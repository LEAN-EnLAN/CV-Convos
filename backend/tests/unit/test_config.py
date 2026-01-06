import os
from app.core.config import Settings

def test_config_defaults():
    """Test default values of settings."""
    settings = Settings()
    assert settings.PROJECT_NAME == "CV Builder IA"
    assert settings.DEBUG is True

def test_config_env_override(monkeypatch):
    """Test environment variable overrides."""
    monkeypatch.setenv("PROJECT_NAME", "Test Project")
    monkeypatch.setenv("DEBUG", "False")
    monkeypatch.setenv("GROQ_API_KEY", "new_key")
    
    settings = Settings()
    assert settings.PROJECT_NAME == "Test Project"
    # Note: pydantic BaseSettings usually handles boolean casing from env vars
    assert settings.DEBUG is False
    assert settings.GROQ_API_KEY == "new_key"
