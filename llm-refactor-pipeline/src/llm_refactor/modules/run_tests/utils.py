"""
Auxiliary functions for running tests across repositories.

This module contains helper functions for executing tests in repositories
that have a .run_tests configuration file.
"""

import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
from rich.console import Console
from rich.panel import Panel


# ============================================================================
# DISCOVERY FUNCTIONS
# ============================================================================

def find_repositories_directory(start_path: Path) -> Optional[Path]:
    """
    Find the repositories directory by walking up from start_path.

    Args:
        start_path: Starting path to search from

    Returns:
        Path to repositories directory or None if not found
    """
    current = start_path.resolve()
    for parent in current.parents:
        candidate = parent / "repositories"
        if candidate.is_dir():
            return candidate
    return None


def get_repository_list(repos_dir: Path) -> List[str]:
    """
    Get list of all repositories in the repositories directory.

    Args:
        repos_dir: Path to repositories directory

    Returns:
        Sorted list of repository names

    Raises:
        RuntimeError: If error reading repositories directory
    """
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
    """
    Validate that a repository exists.

    Args:
        repos_dir: Path to repositories directory
        repo_name: Name of repository to validate

    Returns:
        Tuple of (is_valid, message)
    """
    repo_path = repos_dir / repo_name
    if not repo_path.exists():
        return False, f"Repository '{repo_name}' not found in {repos_dir}"
    if not repo_path.is_dir():
        return False, f"'{repo_name}' is not a directory"
    return True, f"Repository '{repo_name}' exists"


# ============================================================================
# TEST COMMAND FUNCTIONS
# ============================================================================

def read_run_tests_command(repo_path: Path) -> Tuple[bool, str]:
    """
    Read the test command from the .run_tests file.

    Args:
        repo_path: Path to the repository

    Returns:
        Tuple of (success, command_or_error_message)
    """
    run_tests_file = repo_path / ".run_tests"

    if not run_tests_file.exists():
        return False, "No .run_tests file found"

    try:
        command = run_tests_file.read_text().strip()
        if not command:
            return False, "Empty .run_tests file"
        return True, command
    except Exception as e:
        return False, f"Error reading .run_tests: {str(e)}"


def execute_tests_for_repository(
    repo_path: Path,
    command: str,
    timeout: int = 300
) -> Tuple[bool, str, str]:
    """
    Execute the test command in the repository directory.

    Args:
        repo_path: Path to the repository
        command: Test command to execute
        timeout: Command timeout in seconds (default: 300)

    Returns:
        Tuple of (success, stdout, stderr)
    """
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=str(repo_path),
            capture_output=True,
            text=True,
            timeout=timeout
        )

        # Consider exit code 0 as success
        success = result.returncode == 0
        return success, result.stdout, result.stderr

    except subprocess.TimeoutExpired:
        return False, "", f"Command timed out after {timeout} seconds"
    except Exception as e:
        return False, "", f"Error executing command: {str(e)}"


# ============================================================================
# FILE OPERATIONS
# ============================================================================

def ensure_directory_exists(path: Path) -> Tuple[bool, str]:
    """
    Ensure a directory exists, creating it if necessary.

    Args:
        path: Directory path to create

    Returns:
        Tuple of (success, message)
    """
    try:
        path.mkdir(parents=True, exist_ok=True)
        return True, "Directory created"
    except Exception as e:
        return False, f"Error creating directory: {str(e)}"


def save_test_output(
    output_dir: Path,
    repo_name: str,
    command: str,
    stdout: str,
    stderr: str,
    success: bool,
    force: bool = False
) -> Tuple[bool, str]:
    """
    Save test output to a text file.

    Args:
        output_dir: Base output directory
        repo_name: Repository name
        command: Command that was executed
        stdout: Standard output from command
        stderr: Standard error from command
        success: Whether command succeeded
        force: Force overwrite if file exists

    Returns:
        Tuple of (success, message)
    """
    try:
        # Create repository output directory
        repo_output_dir = output_dir / repo_name
        dir_success, dir_msg = ensure_directory_exists(repo_output_dir)
        if not dir_success:
            return False, dir_msg

        # Create output file with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = repo_output_dir / f"test_output_{timestamp}.txt"

        # Check if we should overwrite
        if output_file.exists() and not force:
            return False, "Output file already exists (use --force to overwrite)"

        # Build output content
        content_lines = [
            "=" * 80,
            f"Test Execution Report: {repo_name}",
            "=" * 80,
            f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Command: {command}",
            f"Status: {'SUCCESS' if success else 'FAILED'}",
            "=" * 80,
            "",
            "STDOUT:",
            "-" * 80,
            stdout if stdout else "(no output)",
            "",
            "STDERR:",
            "-" * 80,
            stderr if stderr else "(no errors)",
            "",
            "=" * 80,
        ]

        content = "\n".join(content_lines)
        output_file.write_text(content, encoding="utf-8")

        return True, str(output_file)

    except Exception as e:
        return False, f"Error saving output: {str(e)}"


# ============================================================================
# PROCESSING FUNCTIONS
# ============================================================================

def process_single_repository(
    repos_dir: Path,
    output_dir: Path,
    repo_name: str,
    force: bool = False,
    verbose: bool = True
) -> Dict[str, Any]:
    """
    Process a single repository: read .run_tests, execute, and save output.

    Args:
        repos_dir: Path to repositories directory
        output_dir: Base output directory
        repo_name: Repository name to process
        force: Force overwrite existing files
        verbose: Print progress messages during execution

    Returns:
        Dictionary with processing results
    """
    console = Console()

    result = {
        "repo": repo_name,
        "status": "pending",
        "message": "",
        "command": "",
        "output_file": "",
        "test_success": False,
    }

    repo_path = repos_dir / repo_name

    # Step 1: Read .run_tests file
    with console.status(f"[cyan]🔍 Looking for .run_tests file in {repo_name}...", spinner="dots"):
        has_command, command_or_error = read_run_tests_command(repo_path)

    if not has_command:
        console.print(f"⊘ Skipped [bold]{repo_name}[/bold]: {command_or_error}", style="yellow")
        result["status"] = "skipped"
        result["message"] = f"⊘ {command_or_error}"
        return result

    result["command"] = command_or_error

    # Show panel with repository info and command
    panel = Panel(
        f"[bold cyan]Repository:[/bold cyan] {repo_name}\n"
        f"[bold cyan]Repository Path:[/bold cyan] {repo_path}\n"
        f"[bold cyan]Command:[/bold cyan] {command_or_error}\n"
        f"[bold cyan]Output Directory:[/bold cyan] {output_dir / repo_name}",
        title="🧪 Running Tests",
        border_style="cyan",
        padding=(1, 2)
    )
    console.print(panel)

    # Step 2: Execute tests
    with console.status(f"[cyan]⚙️  Executing tests for {repo_name} (this may take a while)...", spinner="dots"):
        test_success, stdout, stderr = execute_tests_for_repository(
            repo_path,
            command_or_error
        )

    result["test_success"] = test_success

    # Step 3: Create output directory
    with console.status(f"[cyan]📁 Creating output directory...", spinner="dots"):
        repo_output_dir = output_dir / repo_name
        dir_success, dir_msg = ensure_directory_exists(repo_output_dir)

    if not dir_success:
        console.print(f"✗ Failed to create directory: {dir_msg}", style="bold red")
        result["status"] = "error"
        result["message"] = f"✗ {dir_msg}"
        return result

    # Step 4: Save output
    with console.status(f"[cyan]💾 Saving test output...", spinner="dots"):
        save_success, save_result = save_test_output(
            output_dir,
            repo_name,
            command_or_error,
            stdout,
            stderr,
            test_success,
            force
        )

    if save_success:
        result["output_file"] = save_result

        if test_success:
            result["status"] = "success"
            result["message"] = "✓ Tests passed"
            console.print(
                f"✓ [bold green]SUCCESS:[/bold green] All tests passed for [bold cyan]{repo_name}[/bold cyan]"
            )
            console.print(f"  Output saved to: [dim]{save_result}[/dim]")
        else:
            result["status"] = "warning"
            result["message"] = "⚠ Tests failed (output saved)"
            console.print(
                f"⚠ [bold yellow]WARNING:[/bold yellow] Tests failed for [bold cyan]{repo_name}[/bold cyan], but output was saved"
            )
            console.print(f"  Output saved to: [dim]{save_result}[/dim]")
    else:
        result["status"] = "error"
        result["message"] = f"✗ {save_result}"
        console.print(f"✗ [bold red]ERROR:[/bold red] Failed to save output: {save_result}", style="bold red")

    console.print()  # Add blank line after processing
    return result


def calculate_statistics(results: List[Dict]) -> Dict[str, int]:
    """
    Calculate statistics from processing results.

    Args:
        results: List of processing result dictionaries

    Returns:
        Dictionary with statistics
    """
    stats = {
        "total": len(results),
        "success": 0,
        "warning": 0,
        "skipped": 0,
        "errors": 0,
    }

    for result in results:
        status = result["status"]
        if status == "success":
            stats["success"] += 1
        elif status == "warning":
            stats["warning"] += 1
        elif status == "skipped":
            stats["skipped"] += 1
        elif status == "error":
            stats["errors"] += 1

    return stats


# ============================================================================
# FORMATTING FUNCTIONS
# ============================================================================

def build_processing_list(results: List[Dict]) -> str:
    """
    Build a formatted list of processing results.

    Args:
        results: List of processing result dictionaries

    Returns:
        Formatted string
    """
    lines = ["Processing repositories:"]
    for result in results:
        lines.append(f"  {result['message']:<35} {result['repo']}")
        if result.get("output_file"):
            lines.append(f"    → Output: {result['output_file']}")
    return "\n".join(lines)


def build_summary_section(stats: Dict) -> str:
    """
    Build a formatted summary section.

    Args:
        stats: Statistics dictionary

    Returns:
        Formatted string
    """
    lines = [
        "\n" + "─" * 50,
        "Summary:",
        f"  ├─ Total repositories: {stats['total']}",
        f"  ├─ Tests passed: {stats['success']}",
        f"  ├─ Tests failed (output saved): {stats['warning']}",
        f"  ├─ Skipped (no .run_tests): {stats['skipped']}",
        f"  └─ Errors: {stats['errors']}",
        "─" * 50,
    ]
    return "\n".join(lines)


def format_processing_results(
    stats: Dict,
    results: List[Dict],
    repos_dir: Path,
    output_dir: Path
) -> str:
    """
    Format the complete processing results for display.

    Args:
        stats: Statistics dictionary
        results: List of processing result dictionaries
        repos_dir: Path to repositories directory
        output_dir: Output directory path

    Returns:
        Formatted results string
    """
    output_lines = []

    # Header
    output_lines.append(f"\nScanning repositories from: {repos_dir}")
    output_lines.append(f"Found {stats['total']} repositories\n")
    output_lines.append(f"Running tests and saving output to: {output_dir}\n")

    # Processing results
    output_lines.append(build_processing_list(results))

    # Summary
    output_lines.append(build_summary_section(stats))

    return "\n".join(output_lines)


# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

def validate_output_directory(output_dir: Path) -> Tuple[bool, str]:
    """
    Validate that the output directory is writable.

    Args:
        output_dir: Directory path to validate

    Returns:
        Tuple of (is_valid, message)
    """
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
