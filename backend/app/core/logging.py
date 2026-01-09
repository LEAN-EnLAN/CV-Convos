import logging
import sys
from pythonjsonlogger import jsonlogger
from app.core.config import settings

def setup_logging():
    """Configure structured logging for the application."""
    logger = logging.getLogger()
    
    # Clear existing handlers
    if logger.handlers:
        logger.handlers = []

    if settings.DEBUG:
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    
    # Custom formatter supporting JSON
    formatter = jsonlogger.JsonFormatter(
        "%(asctime)s %(levelname)s %(name)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        json_ensure_ascii=False
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    # Set levels for libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("python_multipart.multipart").setLevel(logging.WARNING)
