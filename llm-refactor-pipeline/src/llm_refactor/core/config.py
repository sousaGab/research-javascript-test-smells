"""
Configuration and settings management for LLM Refactor Pipeline.

This module will handle:
- Environment variables
- Configuration files
- API keys and credentials (for future LLM integration)
"""

import os
from pathlib import Path


class Config:
    """Application configuration."""

    # Application settings
    APP_NAME = "LLM Refactor Pipeline"
    VERSION = "0.1.0"

    # Paths
    PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
    HISTORY_FILE = Path.home() / ".llm_refactor_history"

    # Future: LLM API settings
    HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

    @classmethod
    def is_configured(cls) -> bool:
        """Check if required API keys are configured."""
        # For now, always return True since we don't need API keys yet
        return True


# Global config instance
config = Config()
