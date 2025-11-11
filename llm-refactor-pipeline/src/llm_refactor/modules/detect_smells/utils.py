"""
Auxiliary functions for repository checking operations.

This module contains helper functions used by the check_repositories module.
Functions are organized by purpose: discovery, file operations, processing, and formatting.
"""

import csv
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import subprocess
from rich.console import Console
from rich.panel import Panel
from rich.status import Status


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


def validate_repository_exists(repos_dir: Path, repo_name: str) -> Tuple[bool, str]:
    repo_path = repos_dir / repo_name
    if not repo_path.exists():
        return False, f"Repository '{repo_name}' not found in {repos_dir}"
    if not repo_path.is_dir():
        return False, f"'{repo_name}' is not a directory"
    return True, f"Repository '{repo_name}' exists"


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
    output_dir: Path, repo_name: str, csv_headers: List[str], force: bool = False, repos_dir: Path = None
) -> Dict[str, Any]:
    result = {
        "repo": repo_name,
        "folder_created": False,
        "csv_created": False,
        "snuts_success": False,
        "snuts_message": "",
        "steel_success": False,
        "steel_message": "",
        "status": "pending",
        "message": "",
    }

    # Create repository folder
    repo_folder = output_dir / repo_name
    folder_existed = repo_folder.exists()

    folder_success, folder_msg = ensure_directory_exists(repo_folder)
    result["folder_created"] = folder_success and not folder_existed

    # Run snuts tool to detect smells
    if repos_dir:
        repo_path = str(repos_dir / repo_name)
        snuts_success, snuts_msg = run_snuts(repo_name=repo_name, repo_path=repo_path, output_dir=str(repo_folder))
        result["snuts_success"] = snuts_success
        result["snuts_message"] = snuts_msg

        # Run steel tool to detect smells
        steel_success, steel_msg = run_steel(repo_name=repo_name, repo_path=repo_path, output_dir=str(repo_folder))
        result["steel_success"] = steel_success
        result["steel_message"] = steel_msg

    # Create CSV file
    csv_path = repo_folder / "smells.csv"
    csv_success, csv_msg = create_csv_file(csv_path, csv_headers, force)
    result["csv_created"] = csv_success

    # Determine overall status
    if folder_success and csv_success:
        if result["snuts_success"] and result["steel_success"]:
            result["status"] = "success"
            result["message"] = "✓ All smell detections completed"
        elif result["snuts_success"] or result["steel_success"]:
            failed_tools = []
            if not result["snuts_success"]:
                failed_tools.append(f"snuts: {result['snuts_message']}")
            if not result["steel_success"]:
                failed_tools.append(f"steel: {result['steel_message']}")
            result["status"] = "warning"
            result["message"] = f"⚠ Partial success. Failed: {', '.join(failed_tools)}"
        elif result["snuts_message"] or result["steel_message"]:
            result["status"] = "warning"
            result["message"] = f"⚠ Folder/CSV created but detection tools failed"
        else:
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
    stats = {"total": len(results), "created": 0, "skipped": 0, "errors": 0, "warnings": 0}

    for result in results:
        if result["status"] == "success":
            stats["created"] += 1
        elif result["status"] == "skipped":
            stats["skipped"] += 1
        elif result["status"] == "warning":
            stats["warnings"] += 1
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
        f"  ├─ Warnings: {stats['warnings']}",
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

def run_snuts(repo_name: str, repo_path: str, output_dir: str) -> Tuple[bool, str]:
    console = Console()

    try:
        current = Path(__file__).resolve()
        snuts_dir = None
        for ancestor in [current] + list(current.parents):
            candidate = ancestor / "smell_detection_tools" / "snutsjs"
            if candidate.is_dir():
                snuts_dir = candidate
                break

        if snuts_dir is None:
            console.print("✗ snutsjs directory not found within project", style="bold red")
            return False, "snutsjs directory not found within project"

        snuts_output_dir = Path(output_dir) / "snutsjs_output"
        snuts_output_dir.mkdir(parents=True, exist_ok=True)

        output_csv = snuts_output_dir / "smells_detected.csv"

        command = [
            "node",
            str(snuts_dir / "export-csv-local.js"),
            repo_path,
            str(output_csv)
        ]

        panel = Panel(
            f"[bold cyan]Repository:[/bold cyan] {repo_name}\n"
            f"[bold cyan]Command:[/bold cyan] {' '.join(command)}",
            title="🔍 Running Smell Detection",
            border_style="cyan",
            padding=(1, 2)
        )
        console.print(panel)

        with console.status(f"[cyan]Analyzing {repo_name} with snuts...", spinner="dots") as status:
            result = subprocess.run(
                command,
                cwd=str(snuts_dir),
                capture_output=True,
                text=True,
                timeout=300
            )

        console.print(result.stdout)

        if result.stderr:
            console.print(f"[yellow]STDERR:[/yellow] {result.stderr}")

        if result.returncode == 0:
            console.print(f"✓ Successfully completed smell detection for [bold cyan]{repo_name}[/bold cyan]", style="bold green")
            return True, f"Smell detection completed for {repo_name}"
        else:
            console.print(f"✗ Smell detection failed for [bold]{repo_name}[/bold]", style="bold red")
            return False, f"Snuts error (exit code {result.returncode})"

    except subprocess.TimeoutExpired:
        error_msg = f"Snuts timeout for {repo_name} (exceeded 300s)"
        console.print(f"✗ {error_msg}", style="bold red")
        return False, error_msg
    except Exception as e:
        error_msg = f"Failed to run snuts: {str(e)}"
        console.print(f"✗ {error_msg}", style="bold red")
        return False, error_msg


def run_steel(repo_name: str, repo_path: str, output_dir: str) -> Tuple[bool, str]:
    console = Console()

    try:
        current = Path(__file__).resolve()
        steel_dir = None
        for ancestor in [current] + list(current.parents):
            candidate = ancestor / "smell_detection_tools" / "steel"
            if candidate.is_dir():
                steel_dir = candidate
                break

        if steel_dir is None:
            console.print("✗ steel directory not found within project", style="bold red")
            return False, "steel directory not found within project"

        steel_output_dir = Path(output_dir) / "steel_output"
        steel_output_dir.mkdir(parents=True, exist_ok=True)

        test_pattern = "{**/__tests__/**/*.js,**/test/**/*.js,**/?(*.)+(test|tests|spec|specs).js,**/test_*.js,**/test-*.js,**/Spec*.js,**/*Test.js,**/*Tests.js}"
        glob_pattern = f"{repo_path}/{test_pattern}"

        command = [
            "npx",
            "steel",
            "detect",
            glob_pattern,
            "-o",
            str(steel_output_dir)
        ]

        panel = Panel(
            f"[bold magenta]Repository:[/bold magenta] {repo_name}\n"
            f"[bold magenta]Pattern:[/bold magenta] {test_pattern}\n"
            f"[bold magenta]Command:[/bold magenta] npx steel detect {glob_pattern} -o {steel_output_dir}",
            title="🔬 Running Steel Detection",
            border_style="magenta",
            padding=(1, 2)
        )
        console.print(panel)

        with console.status(f"[magenta]Analyzing {repo_name} with steel...", spinner="dots") as status:
            result = subprocess.run(
                command,
                cwd=str(steel_dir),
                capture_output=True,
                text=True,
                timeout=300
            )

        console.print(result.stdout)

        if result.stderr:
            console.print(f"[yellow]STDERR:[/yellow] {result.stderr}")

        if result.returncode == 0:
            console.print(f"✓ Successfully completed steel detection for [bold magenta]{repo_name}[/bold magenta]", style="bold green")
            return True, f"Steel detection completed for {repo_name}"
        else:
            console.print(f"✗ Steel detection failed for [bold]{repo_name}[/bold]", style="bold red")
            return False, f"Steel error (exit code {result.returncode})"

    except subprocess.TimeoutExpired:
        error_msg = f"Steel timeout for {repo_name} (exceeded 300s)"
        console.print(f"✗ {error_msg}", style="bold red")
        return False, error_msg
    except Exception as e:
        error_msg = f"Failed to run steel: {str(e)}"
        console.print(f"✗ {error_msg}", style="bold red")
        return False, error_msg