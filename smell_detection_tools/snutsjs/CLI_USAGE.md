# CLI Script: export-csv-local

This is a command-line interface script that replicates the functionality of the `/export-csv-local` API endpoint from the snutsjs web application.

## Overview

The script analyzes JavaScript/TypeScript test files in a local directory, detects code smells, and exports the results to a CSV file.

## What it does

1. **Scans** the specified directory for test files (matching test file patterns)
2. **Parses** each test file using Babel AST parser
3. **Detects** 15 different types of test smells:
   - Anonymous Test
   - Sensitive Equality
   - Comments Only Test
   - General Fixture
   - Test Without Description
   - Transcripting Test
   - Overcommented Test
   - Identical Test Description
   - Complex Snapshot
   - Conditional Test Logic
   - Non Functional Statement
   - Only Test
   - Sub Optimal Assert
   - Verbose Test
   - Verify In Setup

4. **Filters** results to only include files containing smells
5. **Exports** to CSV format with columns:
   - `file`: relative path to the test file
   - `type`: type of smell detected
   - `smells`: array of detected smells
   - `itCount`: number of test cases (it/test blocks)
   - `describeCount`: number of describe blocks

## Installation

No additional installation needed! The script uses the dependencies already in the project.

## Usage

### Basic Usage
```bash
node export-csv-local.js <directory>
```

This will analyze the directory and save results to `analysis-results.csv` (default output file).

### Custom Output File
```bash
node export-csv-local.js <directory> <outputFile>
```

### Examples

```bash
# Analyze current directory's test files
node export-csv-local.js ./

# Analyze a specific project directory
node export-csv-local.js /path/to/project

# Analyze and save to custom file
node export-csv-local.js ./src tests-report.csv

# Analyze with relative path
node export-csv-local.js ../other-project smells-report.csv
```

## Directory Format

The directory path must be:
- A valid path (relative or absolute)
- Containing test files matching these patterns:
  - `**/*.test.js`
  - `**/*.tests.js`
  - `**/*.spec.js`
  - `**/*.specs.js`
  - `**/*test_*.js`
  - `**/*test-*.js`
  - `**/*Test*.js`
  - `**/*Spec*.js`
  - `**/__tests__/**/*.js`
  - `**/__specs__/**/*.js`
  - `**/test/**/*.js`
  - `**/tests/**/*.js`
  - `**/spec/**/*.js`
  - `**/specs/**/*.js`

## Output Format

The script generates a CSV file with one row per smell detected. Example:

| file | type | smells | itCount | describeCount |
|------|------|--------|---------|---------------|
| src/__tests__/app.test.js | anonymousTest | [...] | 5 | 2 |
| src/__tests__/app.test.js | overcommented | [...] | 5 | 2 |

## Error Handling

The script provides clear error messages for:
- Missing directory argument
- Invalid directory format
- Non-existent directory paths
- File parsing errors

## Output Information

The script displays:
- ✓ Number of analysis results found
- ✓ Number of results filtered (with smells)
- ✓ Number of CSV rows generated
- 📊 Summary statistics:
  - Total rows in CSV
  - Unique files analyzed
  - Breakdown of smells by type

## Equivalent API Usage

This script performs the same operation as:

```bash
curl -X POST http://localhost:8000/api/analyze/export-csv-local \
  -H "Content-Type: application/json" \
  -d '{"directory": "./path/to/project"}'
```

But runs directly without needing the API server to be running.

## Requirements

- Node.js (v16+)
- All dependencies installed (`npm install` or `yarn install`)

## Running from anywhere

You can also use a shell alias for easier access:

```bash
# Add to your ~/.zshrc or ~/.bash_profile
alias analyze-tests="node /path/to/snutsjs/export-csv-local.js"

# Then use:
analyze-tests ./my-project results.csv
```

Or use npm script in package.json:

```json
{
  "scripts": {
    "export-csv-local": "node export-csv-local.js"
  }
}
```

Then run:
```bash
yarn export-csv-local ./path/to/project output.csv
```
