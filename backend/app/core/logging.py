"""Logging configuration for the application."""

import logging
import sys
from pythonjsonlogger import jsonlogger

# Configure JSON logging for structured logs
logHandler = logging.StreamHandler(sys.stdout)
formatter = jsonlogger.JsonFormatter(
    fmt="%(timestamp)s %(level)s %(name)s %(message)s"
)
logHandler.setFormatter(formatter)

# Get root logger
root_logger = logging.getLogger()
root_logger.addHandler(logHandler)
root_logger.setLevel(logging.INFO)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(name)
