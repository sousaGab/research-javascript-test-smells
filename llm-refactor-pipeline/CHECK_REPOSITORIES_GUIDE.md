# Check Repositories Module - Usage Guide

## Overview

The `check_repositories` module prepares the directory structure and CSV files needed for storing smell detection results from JavaScript repositories.

## What It Does

1. **Discovers repositories** - Finds all repository folders in `../repositories/`
2. **Creates output structure** - Creates `../smell_detected/` with a subfolder for each repository
3. **Prepares CSV files** - Creates `smells.csv` in each repository folder with proper headers
4. **Reports progress** - Shows detailed progress and summary statistics

## Project Structure After Execution

```
research-javascript-test-smells/
├── repositories/              # Source repositories (34 folders)
│   ├── chart.js/
│   ├── codecombat/
│   ├── create-react-app/
│   └── ...
│
├── smell_detected/           # Output directory (CREATED BY MODULE)
│   ├── chart.js/
│   │   └── smells.csv       # Empty CSV with headers
│   ├── codecombat/
│   │   └── smells.csv
│   ├── create-react-app/
│   │   └── smells.csv
│   └── ...
│
└── llm-refactor-pipeline/    # This tool
```

## CSV File Structure

Each `smells.csv` file contains the following columns:

| Column        | Description                              | Example                          |
|---------------|------------------------------------------|----------------------------------|
| `file`        | Relative path to file with smell         | `src/tests/example.test.js`      |
| `type`        | Type of smell detected                   | `Empty Test`, `Assertion Roulette` |
| `line`        | Line number where smell was detected     | `42`                             |
| `description` | Additional details about the smell       | `Test has no assertions`         |
| `detected_at` | Timestamp when smell was detected        | `2025-11-11 03:43:00`            |

## Usage

### Basic Usage

```bash
# Start the CLI
llm-refactor

# Run the module
llm-refactor> check_repositories
```

### With Arguments

```bash
# Force recreation of existing files
llm-refactor> check_repositories --force

# Use custom output directory
llm-refactor> check_repositories --output-dir=/custom/path
```

### Programmatic Usage

```python
from llm_refactor.modules.check_repositories import execute

# Basic usage
result = execute()
print(result)

# Force recreation
result = execute("--force")

# Custom output directory
result = execute("--output-dir=/custom/path")
```

## Example Output

```
Scanning repositories from: /path/to/repositories
Found 34 repositories

Creating output structure in: /path/to/smell_detected

Processing repositories:
  ✓ Created folder and CSV       chart.js
  ✓ Created folder and CSV       codecombat
  ✓ Created folder and CSV       create-react-app
  ✓ Created folder and CSV       dayjs
  ... (all repositories)

──────────────────────────────────────────────────
Summary:
  ├─ Total repositories: 34
  ├─ Successfully processed: 34
  ├─ Skipped (already exist): 0
  └─ Errors: 0
──────────────────────────────────────────────────

Output location: /path/to/smell_detected

Next steps:
  - Run smell detection tool on each repository
  - Results will be saved to {repo_name}/smells.csv
```

## Features

### 1. Smart Skip Behavior

If folders and CSV files already exist, the module skips them by default:

```
Processing repositories:
  ⊘ Already exists (skipped)     chart.js
  ⊘ Already exists (skipped)     codecombat
  ...
```

Use `--force` to recreate existing files.

### 2. Error Handling

The module gracefully handles:
- Missing `repositories` directory
- Permission errors
- Existing files (skips by default)
- Invalid paths

### 3. Progress Reporting

Clear, formatted output showing:
- Number of repositories found
- Processing status for each repository
- Summary statistics
- Next steps

### 4. Modular Design

The module is built with separate functions for:
- `find_repositories_directory()` - Locate repositories
- `get_repositories()` - List all repos
- `create_repository_folder()` - Create output folder
- `create_csv_file()` - Create CSV with headers
- `process_repository()` - Process single repository
- `format_results()` - Format output

## Command-Line Arguments

### `--force`

Recreate folders and CSV files even if they already exist.

```bash
llm-refactor> check_repositories --force
```

**Use case:** When you want to reset the smell detection structure.

### `--output-dir=PATH`

Use a custom output directory instead of the default `smell_detected`.

```bash
llm-refactor> check_repositories --output-dir=/custom/output
```

**Use case:** When you want to organize results in a different location.

## Next Steps After Running

After creating the structure with `check_repositories`, you should:

1. **Run smell detection tools** on each repository:
   - Use `snutsjs` (located in `../smell_detection_tools/snutsjs/`)
   - Use `steel` (located in `../smell_detection_tools/steel/`)

2. **Populate CSV files** with detected smells:
   - Parse smell detection tool output
   - Write results to `smell_detected/{repo_name}/smells.csv`
   - Include all required columns: file, type, line, description, detected_at

3. **Analyze results** using the existing `check_smells.py` script or create new analysis modules

## Integration with Smell Detection Tools

### SNUTS.js Integration

SNUTS.js is an API that detects test smells in JavaScript repositories. It runs on port 3001.

Example integration:

```python
import requests
import csv
from datetime import datetime

# Run smell detection via API
response = requests.post(
    "http://localhost:3001/",
    json={"repository": "path/to/repo"}
)

# Parse results and save to CSV
results = response.json()["results"]
csv_path = f"../smell_detected/{repo_name}/smells.csv"

with open(csv_path, "a", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    for smell in results:
        writer.writerow([
            smell["file"],
            smell["type"],
            smell["line"],
            smell["description"],
            datetime.now().isoformat()
        ])
```

## Testing

The module includes comprehensive tests in `test_cli.py`:

```bash
# Run tests
python -m pytest test_cli.py::test_check_repositories_module_returns_repos_or_message -v

# Or run all tests
python test_cli.py
```

## Verification

To verify the structure was created correctly:

```bash
# Check number of folders created
ls ../smell_detected | wc -l

# Check CSV files
find ../smell_detected -name "smells.csv" | wc -l

# View CSV headers
cat ../smell_detected/chart.js/smells.csv
```

Expected output:
```
file,type,line,description,detected_at
```

## Troubleshooting

### "Error: 'repositories' directory not found"

**Cause:** The module cannot find the `repositories` folder.

**Solution:** Ensure you have a `repositories` folder in the parent directory of `llm-refactor-pipeline`.

### "Permission denied" errors

**Cause:** Insufficient permissions to create directories or files.

**Solution:** Check directory permissions or run with appropriate privileges.

### Files already exist but I want to recreate them

**Solution:** Use the `--force` flag:
```bash
llm-refactor> check_repositories --force
```

## Code Architecture

The module follows clean architecture principles:

```
CheckRepositoriesModule
├── find_repositories_directory()  # Discovery
├── get_repositories()             # Listing
├── create_output_directory()      # Setup
├── create_repository_folder()     # Folder creation
├── create_csv_file()              # CSV creation
├── process_repository()           # Orchestration
├── format_results()               # Presentation
└── execute()                      # Entry point
```

Each function has a single responsibility and can be tested independently.

## Performance

- **34 repositories processed in ~0.1 seconds**
- Efficient file I/O with proper error handling
- No external API calls (local file operations only)

## Future Enhancements

Potential improvements for future versions:

1. **Parallel processing** - Process multiple repositories concurrently
2. **Custom CSV columns** - Allow users to define custom columns
3. **Incremental updates** - Only process repositories that changed
4. **Backup existing files** - Backup before overwriting with `--force`
5. **Integration with smell detection** - Automatically run smell detection after setup
6. **Progress bar** - Show real-time progress for large repository sets

## Related Files

- **Module:** `src/llm_refactor/modules/check_repositories.py`
- **Tests:** `test_cli.py`
- **Router:** `src/llm_refactor/cli/router.py`
- **Smell analysis:** `../scripts/check_smells.py`

## Summary

The `check_repositories` module provides a robust, well-structured foundation for smell detection research. It handles discovery, setup, and error cases gracefully while providing clear feedback to the user.

Use this module as the first step in your smell detection pipeline, followed by running actual smell detection tools and analyzing the results.
