from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
import os

# Forzamos la carga del .env sobreescribiendo cualquier variable de entorno global
load_dotenv(override=True)

# Limpiar variables de entorno conflictivas que pueden interferir con pydantic-settings
for var in ['DEBUG', 'ENVIRONMENT']:
    if var in os.environ and os.environ[var] not in ['true', 'True', 'false', 'False', '1', '0']:
        del os.environ[var]

from pydantic import Field, model_validator

class Settings(BaseSettings):
    GROQ_API_KEY: str = Field("placeholder_key", description="Groq API Key")
    GOOGLE_API_KEY: str = Field("placeholder_key", description="Google AI API Key (Gemini)")
    PROJECT_NAME: str = "CV Builder IA"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"  # development, production, staging
    CORS_ORIGINS: str = "http://localhost:3000"

    @model_validator(mode='after')
    def validate_config(self):
        if self.GROQ_API_KEY == "placeholder_key":
            # Log warning? We can't easily log here before logging setup.
            pass
        return self

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        extra='ignore'
    )

settings = Settings()
