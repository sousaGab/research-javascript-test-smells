"""
Detect smells module.

This module orchestrates the setup of directory structure and CSV files
for smell detection across all repositories.
"""

from .detect_smells import execute, CheckRepositoriesModule, check_repositories_module

__all__ = ["execute", "CheckRepositoriesModule", "check_repositories_module"]
