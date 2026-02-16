"""
Feature modules for the LLM Refactor Pipeline.

This package contains:
- base: Base module interface
- hello_world: Example Hello World module
- detect_smells: Detect smells module
- ui_server: Smell Selector UI server module

Add new modules here to extend functionality.
"""

from . import base, hello_world, detect_smells, ui_server

__all__ = ["base", "hello_world", "detect_smells", "ui_server"]
