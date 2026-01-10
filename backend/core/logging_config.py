"""
Configuración de logging.
"""

import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path
from core.config import settings


def setup_logging():
    """Configura el sistema de logging."""
    
    log_dir = Path(settings.FORENSIA_DATA) / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    
    log_file = log_dir / "forensia.log"
    
    # Formato
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Handler archivo con rotación (10MB, 5 backups)
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    
    # Handler consola
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    
    # Logger raíz
    root_logger = logging.getLogger()
    root_logger.setLevel(
      level = getattr(logging, settings.CORONERIA_LOG_LEVEL.upper(), logging.INFO)
    )
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)
    
    # Silenciar loggers externos ruidosos
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("azure").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
    logging.getLogger("faster_whisper").setLevel(logging.WARNING)
    
    print(f"📝 Logging configurado: {log_file}")
