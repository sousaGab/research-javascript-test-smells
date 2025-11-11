"""
Auxiliary functions for repository checking operations.

This module contains helper functions used by the check_repositories module.
Functions are organized by purpose: discovery, file operations, processing, and formatting.
"""

import csv
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any


# ============================================================================
# DISCOVERY FUNCTIONS
# ============================================================================

def find_repositories_directory(start_path: Path) -> Optional[Path]:
    current = start_path.resolve()
    for parent in current.parents:
        candidate = parent / "repositories"
        if candidate.is_dir():
            return candidate
    return None


def get_repository_list(repos_dir: Path) -> List[str]:
    try:
        repos = [
            p.name
            for p in repos_dir.iterdir()
            if p.is_dir() and not p.name.startswith(".")
        ]
        return sorted(repos)
    except Exception as e:
        raise RuntimeError(f"Error reading repositories directory: {e}")


# ============================================================================
# FILE OPERATIONS
# ============================================================================

def ensure_directory_exists(path: Path) -> Tuple[bool, str]:
    try:
        path.mkdir(parents=True, exist_ok=True)
        return True, "Directory created"
    except Exception as e:
        return False, f"Error creating directory: {str(e)}"


def csv_exists(csv_path: Path) -> bool:
    return csv_path.exists() and csv_path.is_file()


def create_csv_file(
    csv_path: Path, headers: List[str], force: bool = False
) -> Tuple[bool, str]:
    try:
        # Check if file exists
        if csv_exists(csv_path) and not force:
            return False, "CSV already exists (skipped)"

        # Create CSV with headers
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(headers)

        return True, "CSV created"

    except Exception as e:
        return False, f"CSV error: {str(e)}"


# ============================================================================
# PROCESSING FUNCTIONS
# ============================================================================

def process_single_repository(
    output_dir: Path, repo_name: str, csv_headers: List[str], force: bool = False
) -> Dict[str, Any]:
    """
    Process a single repository: create folder and CSV file.

    Args:
        output_dir: Base output directory (e.g., smell_detected)
        repo_name: Name of the repository
        csv_headers: Headers for the CSV file
        force: If True, recreate even if exists

    Returns:
        Dictionary containing:
            - repo: repository name
            - folder_created: whether folder was created
            - csv_created: whether CSV was created
            - status: 'success', 'skipped', or 'error'
            - message: human-readable status message
    """
    result = {
        "repo": repo_name,
        "folder_created": False,
        "csv_created": False,
        "status": "pending",
        "message": "",
    }

    # Create repository folder
    repo_folder = output_dir / repo_name
    folder_existed = repo_folder.exists()

    folder_success, folder_msg = ensure_directory_exists(repo_folder)
    result["folder_created"] = folder_success and not folder_existed

    # Create CSV file
    csv_path = repo_folder / "smells.csv"
    csv_success, csv_msg = create_csv_file(csv_path, csv_headers, force)
    result["csv_created"] = csv_success

    # Determine overall status
    if folder_success and csv_success:
        result["status"] = "success"
        result["message"] = "✓ Created folder and CSV"
    elif folder_existed and not csv_success and not force:
        result["status"] = "skipped"
        result["message"] = "⊘ Already exists (skipped)"
    else:
        result["status"] = "error"
        result["message"] = f"✗ {folder_msg} | {csv_msg}"

    return result


def calculate_statistics(results: List[Dict]) -> Dict[str, int]:
    stats = {"total": len(results), "created": 0, "skipped": 0, "errors": 0}

    for result in results:
        if result["status"] == "success":
            stats["created"] += 1
        elif result["status"] == "skipped":
            stats["skipped"] += 1
        elif result["status"] == "error":
            stats["errors"] += 1

    return stats


# ============================================================================
# FORMATTING FUNCTIONS
# ============================================================================

def build_processing_list(results: List[Dict]) -> str:
    lines = ["Processing repositories:"]
    for result in results:
        lines.append(f"  {result['message']:<30} {result['repo']}")
    return "\n".join(lines)


def build_summary_section(stats: Dict) -> str:
    lines = [
        "\n" + "─" * 50,
        "Summary:",
        f"  ├─ Total repositories: {stats['total']}",
        f"  ├─ Successfully processed: {stats['created']}",
        f"  ├─ Skipped (already exist): {stats['skipped']}",
        f"  └─ Errors: {stats['errors']}",
        "─" * 50,
    ]
    return "\n".join(lines)


def format_processing_results(
    stats: Dict, results: List[Dict], repos_dir: Path, output_dir: Path
) -> str:
    output_lines = []

    # Header
    output_lines.append(f"\nScanning repositories from: {repos_dir}")
    output_lines.append(f"Found {stats['total']} repositories\n")

    output_lines.append(f"Creating output structure in: {output_dir}\n")

    # Processing results
    output_lines.append(build_processing_list(results))

    # Summary
    output_lines.append(build_summary_section(stats))

    # Footer
    output_lines.append(f"\nOutput location: {output_dir}")
    output_lines.append("\nNext steps:")
    output_lines.append("  - Run smell detection tool on each repository")
    output_lines.append("  - Results will be saved to {repo_name}/smells.csv")

    return "\n".join(output_lines)


# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

def validate_output_directory(output_dir: Path) -> Tuple[bool, str]:
    try:
        # Try to create the directory
        output_dir.mkdir(parents=True, exist_ok=True)

        # Check if writable
        test_file = output_dir / ".write_test"
        test_file.touch()
        test_file.unlink()

        return True, "Output directory is valid and writable"

    except PermissionError:
        return False, f"Permission denied: Cannot write to {output_dir}"
    except Exception as e:
        return False, f"Invalid output directory: {str(e)}"


def count_existing_structures(output_dir: Path, repo_names: List[str]) -> Dict[str, int]:
    counts = {"folders_exist": 0, "csvs_exist": 0}

    for repo_name in repo_names:
        repo_folder = output_dir / repo_name
        csv_file = repo_folder / "smells.csv"

        if repo_folder.exists():
            counts["folders_exist"] += 1
        if csv_file.exists():
            counts["csvs_exist"] += 1

    return counts
