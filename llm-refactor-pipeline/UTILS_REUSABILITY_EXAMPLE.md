# Utils Reusability Examples

## How to Use `check_repositories_utils` in Other Modules

The extracted utility functions can now be easily reused in any other module. Here are practical examples:

---

## Example 1: Status Command

Create a new module that shows repository status without modifying anything:

```python
# modules/check_repositories_status.py
"""Show current status of repositories and smell detection structure."""

from pathlib import Path
from llm_refactor.modules.base import SimpleModule
from llm_refactor.modules import check_repositories_utils as utils


class CheckRepositoriesStatusModule(SimpleModule):
    """Show status without making any changes."""

    name = "check_repositories_status"
    description = "Show status of repositories and smell detection structure"

    def execute(self, args: str = "") -> str:
        # Reuse discovery functions
        repos_dir = utils.find_repositories_directory(Path(__file__))
        if not repos_dir:
            return "Error: repositories directory not found"

        repos = utils.get_repository_list(repos_dir)
        output_dir = repos_dir.parent / "smell_detected"

        # Reuse counting function
        counts = utils.count_existing_structures(output_dir, repos)

        # Build status report
        lines = [
            "\n📊 Repository Status Report",
            "=" * 50,
            f"\n📁 Repositories found: {len(repos)}",
            f"📂 Folders created: {counts['folders_exist']}",
            f"📄 CSV files created: {counts['csvs_exist']}",
            f"⚠️  Need processing: {len(repos) - counts['folders_exist']}",
            f"\n📍 Location: {repos_dir}",
            f"📍 Output: {output_dir}",
            "=" * 50,
        ]

        return "\n".join(lines)
```

**Usage:**
```bash
llm-refactor> check_repositories_status

📊 Repository Status Report
==================================================

📁 Repositories found: 34
📂 Folders created: 34
📄 CSV files created: 34
⚠️  Need processing: 0

📍 Location: /path/to/repositories
📍 Output: /path/to/smell_detected
==================================================
```

---

## Example 2: Analyze Smells Module

Create a module that reads and analyzes existing smell CSVs:

```python
# modules/analyze_smells.py
"""Analyze smell detection results across all repositories."""

import csv
from pathlib import Path
from collections import Counter
from llm_refactor.modules.base import SimpleModule
from llm_refactor.modules import check_repositories_utils as utils


class AnalyzeSmellsModule(SimpleModule):
    """Analyze smells across all repositories."""

    name = "analyze_smells"
    description = "Analyze smell detection results"

    def execute(self, args: str = "") -> str:
        # Reuse discovery - same code as check_repositories!
        repos_dir = utils.find_repositories_directory(Path(__file__))
        repos = utils.get_repository_list(repos_dir)
        output_dir = repos_dir.parent / "smell_detected"

        # Analyze smells
        smell_types = Counter()
        total_smells = 0
        repos_with_smells = 0

        for repo in repos:
            csv_path = output_dir / repo / "smells.csv"

            # Reuse csv_exists function
            if not utils.csv_exists(csv_path):
                continue

            # Read and count smells
            with open(csv_path, 'r') as f:
                reader = csv.DictReader(f)
                smells = list(reader)

                if smells:
                    repos_with_smells += 1
                    total_smells += len(smells)

                    for smell in smells:
                        smell_types[smell['type']] += 1

        # Format results (could reuse formatting utils too!)
        lines = [
            "\n🔍 Smell Analysis Report",
            "=" * 50,
            f"\n📊 Summary:",
            f"  Total repositories: {len(repos)}",
            f"  Repositories with smells: {repos_with_smells}",
            f"  Total smells detected: {total_smells}",
            f"\n🏷️  Top Smell Types:",
        ]

        for smell_type, count in smell_types.most_common(10):
            lines.append(f"  • {smell_type}: {count}")

        lines.append("=" * 50)
        return "\n".join(lines)
```

---

## Example 3: Clean Output Module

Create a module to clean/reset the smell_detected folder:

```python
# modules/clean_smell_output.py
"""Clean the smell_detected output directory."""

import shutil
from pathlib import Path
from llm_refactor.modules.base import SimpleModule
from llm_refactor.modules import check_repositories_utils as utils


class CleanSmellOutputModule(SimpleModule):
    """Clean smell detection output."""

    name = "clean_smell_output"
    description = "Remove all smell detection output"

    def execute(self, args: str = "") -> str:
        confirm = "--confirm" in args

        if not confirm:
            return (
                "⚠️  This will delete all smell detection data!\n"
                "Use: clean_smell_output --confirm"
            )

        # Reuse discovery
        repos_dir = utils.find_repositories_directory(Path(__file__))
        output_dir = repos_dir.parent / "smell_detected"

        if not output_dir.exists():
            return "Nothing to clean - smell_detected doesn't exist"

        # Count before deletion
        repos = utils.get_repository_list(repos_dir)
        counts = utils.count_existing_structures(output_dir, repos)

        # Delete
        shutil.rmtree(output_dir)

        return (
            f"✓ Cleaned smell_detected directory\n"
            f"  Removed {counts['folders_exist']} folders\n"
            f"  Removed {counts['csvs_exist']} CSV files"
        )
```

---

## Example 4: Export Results Module

Create a module that exports results to different formats:

```python
# modules/export_results.py
"""Export smell detection results to various formats."""

import json
import csv
from pathlib import Path
from llm_refactor.modules.base import SimpleModule
from llm_refactor.modules import check_repositories_utils as utils


class ExportResultsModule(SimpleModule):
    """Export smell detection results."""

    name = "export_results"
    description = "Export smell results to JSON/Excel"

    def execute(self, args: str = "") -> str:
        format_type = self._parse_format(args)  # json, csv, excel

        # Reuse discovery utilities
        repos_dir = utils.find_repositories_directory(Path(__file__))
        repos = utils.get_repository_list(repos_dir)
        output_dir = repos_dir.parent / "smell_detected"

        # Collect all results
        all_smells = []
        for repo in repos:
            csv_path = output_dir / repo / "smells.csv"

            if utils.csv_exists(csv_path):
                with open(csv_path, 'r') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        row['repository'] = repo
                        all_smells.append(row)

        # Export based on format
        if format_type == "json":
            export_path = repos_dir.parent / "all_smells.json"
            with open(export_path, 'w') as f:
                json.dump(all_smells, f, indent=2)

        # Use formatting utilities for consistent output
        stats = {"total": len(repos), "smells": len(all_smells)}

        return (
            f"✓ Exported {len(all_smells)} smells\n"
            f"  From {len(repos)} repositories\n"
            f"  To: {export_path}"
        )

    def _parse_format(self, args: str) -> str:
        if "--json" in args:
            return "json"
        if "--excel" in args:
            return "excel"
        return "json"  # default
```

---

## Example 5: Test Individual Utilities

Now you can easily test utilities independently:

```python
# tests/test_check_repositories_utils.py
"""Unit tests for repository utilities."""

import pytest
from pathlib import Path
from llm_refactor.modules import check_repositories_utils as utils


def test_find_repositories_directory(tmp_path):
    """Test repository discovery."""
    # Create mock structure
    repos_dir = tmp_path / "parent" / "repositories"
    repos_dir.mkdir(parents=True)

    # Should find it
    test_file = repos_dir / "test.py"
    test_file.touch()

    result = utils.find_repositories_directory(test_file)
    assert result == repos_dir


def test_get_repository_list(tmp_path):
    """Test repository listing."""
    # Create mock repos
    (tmp_path / "repo1").mkdir()
    (tmp_path / "repo2").mkdir()
    (tmp_path / ".hidden").mkdir()  # Should be ignored

    repos = utils.get_repository_list(tmp_path)

    assert len(repos) == 2
    assert "repo1" in repos
    assert "repo2" in repos
    assert ".hidden" not in repos


def test_create_csv_file(tmp_path):
    """Test CSV creation."""
    csv_path = tmp_path / "test.csv"
    headers = ["col1", "col2", "col3"]

    success, msg = utils.create_csv_file(csv_path, headers)

    assert success
    assert csv_path.exists()

    # Verify headers
    with open(csv_path, 'r') as f:
        first_line = f.readline().strip()
        assert first_line == "col1,col2,col3"


def test_create_csv_skip_existing(tmp_path):
    """Test CSV skip logic."""
    csv_path = tmp_path / "test.csv"
    headers = ["col1", "col2"]

    # Create first time
    utils.create_csv_file(csv_path, headers)

    # Try again without force
    success, msg = utils.create_csv_file(csv_path, headers, force=False)

    assert not success
    assert "already exists" in msg.lower()


def test_create_csv_with_force(tmp_path):
    """Test CSV force recreation."""
    csv_path = tmp_path / "test.csv"
    headers = ["col1", "col2"]

    # Create first time
    utils.create_csv_file(csv_path, headers)

    # Recreate with force
    success, msg = utils.create_csv_file(csv_path, headers, force=True)

    assert success
    assert "created" in msg.lower()


def test_calculate_statistics():
    """Test statistics calculation."""
    results = [
        {"status": "success"},
        {"status": "success"},
        {"status": "skipped"},
        {"status": "error"},
    ]

    stats = utils.calculate_statistics(results)

    assert stats["total"] == 4
    assert stats["created"] == 2
    assert stats["skipped"] == 1
    assert stats["errors"] == 1


def test_count_existing_structures(tmp_path):
    """Test counting existing structures."""
    # Create structure
    (tmp_path / "repo1").mkdir()
    (tmp_path / "repo1" / "smells.csv").touch()
    (tmp_path / "repo2").mkdir()

    counts = utils.count_existing_structures(
        tmp_path,
        ["repo1", "repo2", "repo3"]
    )

    assert counts["folders_exist"] == 2
    assert counts["csvs_exist"] == 1
```

---

## Key Benefits Demonstrated

### 1. Code Reuse
- ✅ Same discovery logic in every module
- ✅ No duplication of file operations
- ✅ Consistent formatting across modules

### 2. Testability
- ✅ Each utility tested independently
- ✅ Easy to mock for integration tests
- ✅ Clear input/output contracts

### 3. Consistency
- ✅ All modules use same discovery method
- ✅ Same error handling patterns
- ✅ Consistent output formatting

### 4. Rapid Development
- ✅ New modules created in minutes
- ✅ No need to rewrite common logic
- ✅ Focus on business logic, not infrastructure

---

## Summary

By extracting utilities, we've created:

1. **Reusable building blocks** - Use in any module
2. **Testable components** - Test each function independently
3. **Consistent patterns** - Same approach across all modules
4. **Rapid development** - New modules in minutes, not hours

The refactoring has transformed the codebase from a monolithic structure to a flexible, composable architecture! 🎉
