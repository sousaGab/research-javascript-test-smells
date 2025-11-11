"""
LLM Refactor Pipeline

An interactive CLI tool for LLM-based code refactoring research.
"""

__version__ = "0.1.0"
__author__ = "Research Team"

from . import cli, core, modules

__all__ = ["cli", "core", "modules", "__version__"]
