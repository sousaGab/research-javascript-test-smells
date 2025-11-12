import subprocess
import json
import csv
from pathlib import Path
from typing import Tuple
from rich.console import Console
from rich.panel import Panel




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

            steel_json = steel_output_dir / f"steel.json"
            output_csv = steel_output_dir / "smells_detected.csv"
            _convert_steel_json_to_csv(steel_json, output_csv, console)

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


def _convert_steel_json_to_csv(json_path: Path, output_csv: Path, console: Console) -> bool:
    try:
        if not json_path.exists():
            console.print(f"[yellow]⚠ Steel JSON file not found: {json_path}[/yellow]")
            return False

        with open(json_path, 'r') as json_file:
            data = json.load(json_file)

        smelled_files = data.get('smelledFiles', [])
        csv_data = []

        for smelled_file in smelled_files:
            file_name = smelled_file.get('path', 'Unknown')
            smell_info = smelled_file.get('smellInfo', [])

            for smell_info_item in smell_info:
                smell_type = smell_info_item.get('name', 'Unknown')
                items = smell_info_item.get('items', [])

                for item in items:
                    smell_lines = item.get('start', {})
                    line = smell_lines.get('line', 'Unknown') if isinstance(smell_lines, dict) else smell_lines
                    frame = item.get('frame', 'Unknown')
                    csv_data.append([file_name, smell_type, line, frame])

        with open(output_csv, 'w', newline='', encoding='utf-8') as csv_file:
            writer = csv.writer(csv_file)
            writer.writerow(['file', 'type', 'line', 'frame'])
            writer.writerows(csv_data)

        console.print(f"✓ Converted steel JSON to CSV: [cyan]{output_csv.name}[/cyan]", style="bold green")
        return True

    except json.JSONDecodeError as e:
        console.print(f"[yellow]⚠ Failed to parse JSON: {str(e)}[/yellow]")
        return False
    except Exception as e:
        console.print(f"[yellow]⚠ Failed to convert JSON to CSV: {str(e)}[/yellow]")
        return False