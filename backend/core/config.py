"""
Configuración de la aplicación usando Pydantic Settings.
"""

import os
from typing import Literal
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuración global de ForensIA."""
    
    # Azure AI Speech
    AZURE_SPEECH_KEY: str = ""
    AZURE_SPEECH_REGION: str = "eastus"
    
    # Azure OpenAI
    AZURE_OPENAI_KEY: str = ""
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_MODEL: str = "gpt-4"

    # Google Gemini (Alternative)
    GEMINI_API_KEY: str | None = None
    
    # Azure Document Intelligence
    AZURE_DOC_INTEL_KEY: str = ""
    AZURE_DOC_INTEL_ENDPOINT: str = ""
    
    # Azure Storage
    AZURE_STORAGE_CONNECTION_STRING: str = ""
    
    # Application
    CORONERIA_MODE: Literal["auto", "azure", "edge"] = "auto"
    CORONERIA_LANGUAGE: str = "es-PE"
    CORONERIA_LOG_LEVEL: str = "INFO"
    
    # Paths
    CORONERIA_DATA: str = "./data"
    CORONERIA_MODELS: str = "./models"
    CORONERIA_EXPORTS: str = "./exports"
    
    # Security
    SECRET_KEY: str = "change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    @property
    def is_azure_configured(self) -> bool:
        """Verifica si Azure está configurado."""
        return bool(self.AZURE_SPEECH_KEY and self.AZURE_OPENAI_KEY)
    
    def get_effective_mode(self) -> str:
        """Obtiene el modo efectivo basado en configuración."""
        if self.CORONERIA_MODE == "auto":
            return "azure" if self.is_azure_configured else "edge"
        return self.CORONERIA_MODE


# Singleton
settings = Settings()

# Crear directorios si no existen
os.makedirs(settings.FORENSIA_DATA, exist_ok=True)
os.makedirs(settings.FORENSIA_MODELS, exist_ok=True)
os.makedirs(settings.FORENSIA_EXPORTS, exist_ok=True)
