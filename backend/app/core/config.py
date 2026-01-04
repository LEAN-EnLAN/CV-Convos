from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
import os

# Forzamos la carga del .env sobreescribiendo cualquier variable de entorno global
load_dotenv(override=True)

class Settings(BaseSettings):
    GROQ_API_KEY: str = "placeholder_key"
    PROJECT_NAME: str = "CV Builder IA"
    DEBUG: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        extra='ignore'
    )

settings = Settings()
