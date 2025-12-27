"""Structured logging configuration with JSON format support."""

import logging
import sys
import json
from datetime import datetime, timezone
from typing import Any, Dict
from pythonjsonlogger import jsonlogger

from app.config import settings


class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter with additional fields."""
    
    def add_fields(
        self,
        log_record: Dict[str, Any],
        record: logging.LogRecord,
        message_dict: Dict[str, Any]
    ) -> None:
        """Add custom fields to log record."""
        super().add_fields(log_record, record, message_dict)
        
        # Add timestamp in ISO format
        log_record["timestamp"] = datetime.now(timezone.utc).isoformat() + "Z"
        
        # Add log level
        log_record["level"] = record.levelname
        
        # Add logger name
        log_record["logger"] = record.name
        
        # Add request_id if available (will be set by middleware)
        if hasattr(record, "request_id"):
            log_record["request_id"] = record.request_id
        
        # Add user_id if available
        if hasattr(record, "user_id"):
            log_record["user_id"] = record.user_id
        
        # Add any additional context from extra parameter
        if "context" in message_dict:
            log_record["context"] = message_dict["context"]


def setup_logging() -> None:
    """Configure application logging based on settings."""
    
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    
    # Remove existing handlers
    root_logger.handlers.clear()
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    
    # Set formatter based on configuration
    if settings.LOG_FORMAT.lower() == "json":
        formatter = CustomJsonFormatter(
            "%(timestamp)s %(level)s %(logger)s %(message)s"
        )
    else:
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
    
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # Set log levels for third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("celery").setLevel(logging.INFO)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name.
    
    Args:
        name: Logger name (typically __name__ of the module)
    
    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)
