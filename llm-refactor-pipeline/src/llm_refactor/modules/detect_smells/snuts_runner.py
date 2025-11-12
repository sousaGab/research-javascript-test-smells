import subprocess
from pathlib import Path
from typing import Tuple
from rich.console import Console
from rich.panel import Panel


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
