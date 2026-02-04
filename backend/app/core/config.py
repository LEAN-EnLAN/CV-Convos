import os

from dotenv import load_dotenv
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from .exceptions import AIServiceError

# Forzamos la carga del .env sobreescribiendo cualquier variable de entorno global
load_dotenv(override=True)

# Limpiar variables de entorno conflictivas que pueden interferir con pydantic-settings
for var in ['DEBUG', 'ENVIRONMENT']:
    if var in os.environ and os.environ[var] not in ['true', 'True', 'false', 'False', '1', '0']:
        del os.environ[var]

PLACEHOLDER_API_KEY = "placeholder_key"

class Settings(BaseSettings):
    GROQ_API_KEY: str = Field(PLACEHOLDER_API_KEY, description="Groq API Key")
    GOOGLE_API_KEY: str = Field(PLACEHOLDER_API_KEY, description="Google AI API Key (Gemini)")
    PROJECT_NAME: str = "CV Builder IA"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"  # development, production, staging
    CORS_ORIGINS: str = "http://localhost:3000"

    def missing_ai_keys(self, keys: list[str] | None = None) -> list[str]:
        keys_to_check = keys or ["GROQ_API_KEY", "GOOGLE_API_KEY"]
        missing = []
        for key in keys_to_check:
            value = getattr(self, key, None)
            if not value or value == PLACEHOLDER_API_KEY:
                missing.append(key)
        return missing

    def raise_if_missing_ai_keys(self, keys: list[str] | None = None) -> None:
        missing = self.missing_ai_keys(keys)
        if missing:
            raise AIServiceError(f"AI service not configured. Check {', '.join(missing)}.")

    @model_validator(mode='after')
    def validate_config(self):
        if self.GROQ_API_KEY == PLACEHOLDER_API_KEY:
            # Log warning? We can't easily log here before logging setup.
            pass
        return self

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        extra='ignore'
    )

settings = Settings()
