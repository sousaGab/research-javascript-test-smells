import csv
import json
import subprocess
from pathlib import Path
from typing import Tuple
from rich.console import Console


def normalize_file_path(file_path: str, source: str) -> str:
    if not file_path:
        return file_path

    if source == 'snuts':
        if not file_path.startswith('/'):
            return f"/{file_path}"
        return file_path

    elif source == 'steel':
        if 'repositories/' in file_path:
            parts = file_path.split('repositories/')
            if len(parts) > 1:
                remaining = parts[1].split('/', 1)
                if len(remaining) > 1:
                    return f"/{remaining[1]}"
        return file_path

    return file_path


def parse_snuts_line(line_data: str) -> str:
    try:
        if not line_data or line_data == '':
            return ''

        line_data_clean = line_data.replace('""', '"')

        parsed = json.loads(line_data_clean)

        if isinstance(parsed, list) and len(parsed) > 0:
            first_item = parsed[0]
            if isinstance(first_item, dict):
                start_line = first_item.get('startLine', '')
                end_line = first_item.get('endLine', '')
                return f"{{'startLine':{start_line},'endLine':{end_line}}}"

        return line_data
    except (json.JSONDecodeError, KeyError, ValueError):
        return line_data


def extract_line_number(line_data: str, source: str) -> int:
    try:
        if source == 'snuts':
            line_data_clean = line_data.replace("'", '"')
            if 'startLine' in line_data_clean:
                parts = line_data_clean.split('startLine')[1].split(':')
                if len(parts) > 1:
                    num_str = parts[1].split(',')[0].strip().rstrip('}')
                    return int(num_str)
        elif source == 'steel':
            if line_data.isdigit():
                return int(line_data)

            if "'line'" in line_data or '"line"' in line_data:
                parsed = json.loads(line_data.replace("'", '"'))
                if isinstance(parsed, dict) and 'line' in parsed:
                    return int(parsed['line'])
        return 0
    except (ValueError, IndexError, KeyError, json.JSONDecodeError):
        return 0


def concatenate_smell_csvs(output_dir: Path, repo_name: str = '', repos_dir: Path = None) -> Tuple[bool, str]:
    console = Console()

    snuts_csv = output_dir / "snutsjs_output" / "smells_detected.csv"
    steel_csv = output_dir / "steel_output" / "smells_detected.csv"
    output_csv = output_dir / "smells.csv"

    combined_rows = []
    headers = ["file", "type", "line", "method", "source"]

    try:
        if snuts_csv.exists():
            with open(snuts_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    line_data = row.get('smells', row.get('line', ''))
                    parsed_line = parse_snuts_line(line_data)
                    file_path = normalize_file_path(row.get('file', ''), 'snuts')

                    combined_rows.append([
                        file_path,
                        row.get('type', ''),
                        parsed_line,
                        '',
                        'snuts'
                    ])
            console.print(f"✓ Read {len(combined_rows)} smells from snuts", style="dim")

        steel_count_start = len(combined_rows)
        if steel_csv.exists():
            with open(steel_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    file_path = normalize_file_path(row.get('file', ''), 'steel')

                    combined_rows.append([
                        file_path,
                        row.get('type', ''),
                        row.get('line', ''),
                        '',
                        'steel'
                    ])
            steel_count = len(combined_rows) - steel_count_start
            console.print(f"✓ Read {steel_count} smells from steel", style="dim")

        if combined_rows and repo_name and repos_dir:
            with console.status("[cyan]Extracting test methods...", spinner="dots") as status:
                rows_for_extraction = []
                for row in combined_rows:
                    file_path = row[0]
                    line_data = row[2]
                    source = row[4]
                    line_number = extract_line_number(line_data, source)

                    rows_for_extraction.append({
                        'filePath': file_path,
                        'line': line_number,
                        'repoName': repo_name
                    })

                extraction_data = {
                    'rows': rows_for_extraction,
                    'repositoriesPath': str(repos_dir)
                }

                script_path = Path(__file__).parent / "get_method" / "extract_method.js"

                result = subprocess.run(
                    ["node", str(script_path)],
                    input=json.dumps(extraction_data),
                    capture_output=True,
                    text=True,
                    timeout=300
                )

                if result.returncode == 0:
                    methods = json.loads(result.stdout)
                    for i, method_result in enumerate(methods):
                        if i < len(combined_rows):
                            combined_rows[i][3] = method_result.get('method', 'Unknown')
                    console.print(f"✓ Extracted {len(methods)} test methods", style="dim")
                else:
                    console.print(f"⚠ Method extraction failed: {result.stderr}", style="yellow")
                    for row in combined_rows:
                        row[3] = 'Unknown'
        else:
            for row in combined_rows:
                row[3] = 'Unknown'

        with open(output_csv, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(combined_rows)

        total = len(combined_rows)
        console.print(f"✓ Combined CSV created: [cyan]{output_csv.name}[/cyan] ({total} total smells)", style="bold green")
        return True, f"Combined {total} smells from both tools"

    except Exception as e:
        error_msg = f"Failed to concatenate CSVs: {str(e)}"
        console.print(f"✗ {error_msg}", style="bold red")

        try:
            with open(output_csv, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(headers)
            console.print(f"⚠ Created empty CSV as fallback", style="yellow")
        except Exception:
            pass

        return False, error_msg
