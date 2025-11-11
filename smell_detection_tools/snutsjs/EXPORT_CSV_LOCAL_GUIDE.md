# export-csv-local.js - CLI Command

## Quick Start

This CLI script executes the exact same functionality as the `/export-csv-local` API endpoint, but as a standalone Node.js command.

### Basic Command

```bash
node export-csv-local.js <directory> [outputFile]
```

Or using npm script:

```bash
yarn export-csv-local <directory> [outputFile]
```

## What Does It Do?

1. **Scans** your test directory for test files
2. **Analyzes** each test file for 15 types of code smells
3. **Filters** to only show files with detected smells
4. **Exports** results to a CSV file

## Quick Examples

### Example 1: Analyze a project in the workspace

```bash
node export-csv-local.js /Users/gabriel.amaralmercos.com/Desktop/refactoring-smells/projects/binance-trading-bot

# Output:
# 📁 Analyzing directory: ...
# ✓ Found 1234 analysis results
# ✓ Filtered to 456 results with smells
# ✓ Split results to 789 CSV rows
# ✓ CSV exported successfully to: analysis-results.csv
```

### Example 2: Custom output filename

```bash
node export-csv-local.js ./src/tests my-report.csv
```

### Example 3: Analyze with relative path

```bash
node export-csv-local.js ../../projects/prettier prettier-analysis.csv
```

### Example 4: Using npm script

```bash
yarn export-csv-local /path/to/project results.csv
```

## Output

The script generates:

1. **Console Output**: Real-time progress and summary
2. **CSV File**: With columns:
   - `file` - Path to test file (relative)
   - `type` - Smell type detected
   - `smells` - Array of smell occurrences with line numbers
   - `itCount` - Number of test cases
   - `describeCount` - Number of describe blocks

## Detected Smell Types

The script detects 15 different test code smells:

| Smell Type | Description |
|------------|-------------|
| **AnonymousTest** | Test with no description |
| **SensitiveEquality** | Using == or != instead of === or !== |
| **CommentsOnlyTest** | Test that only contains comments |
| **GeneralFixture** | General fixture not specific to test |
| **TestWithoutDescription** | Missing or empty test description |
| **TranscriptingTest** | Over-detailed test that just transcribes code |
| **OvercommentedTest** | Excessive comments in test |
| **IdenticalTestDescription** | Duplicate test descriptions |
| **ComplexSnapshot** | Overly complex snapshot |
| **ConditionalTestLogic** | Conditional logic in tests |
| **NonFunctionalStatement** | Non-functional statements |
| **OnlyTest** | Using `.only` (test isolation issue) |
| **SubOptimalAssert** | Non-ideal assertion patterns |
| **VerboseTest** | Unnecessarily verbose test code |
| **VerifyInSetup** | Assertions in setup blocks |

## Complete Usage Guide

### Directory Argument Requirements

The directory path:
- ✓ Can be absolute or relative
- ✓ Must exist
- ✓ Should contain test files matching patterns like:
  - `*.test.js`, `*.spec.js`
  - `__tests__/**/*.js`
  - `test/**/*.js`

### Output File Argument

- Optional (defaults to `analysis-results.csv`)
- Can be absolute or relative path
- File will be created in the specified location

## Example Workflow

```bash
# 1. Navigate to snutsjs directory
cd /Users/gabriel.amaralmercos.com/Desktop/refactoring-smells/smell_detection_tools/snutsjs

# 2. Analyze a project
node export-csv-local.js /path/to/your/project results.csv

# 3. View results
cat results.csv

# 4. Or import into a spreadsheet application
open results.csv  # Opens in default app (Excel, Numbers, etc.)
```

## Troubleshooting

### "Directory does not exist"
```bash
# Check directory path is correct
ls -la /path/to/your/directory

# Use absolute path instead of relative
node export-csv-local.js /absolute/path/to/project
```

### "No test files found"
The directory might not contain files matching test patterns:
```bash
# Search for test files in your directory
find /path/to/project -name "*.test.js" -o -name "*.spec.js"
```

### "Invalid directory format"
Some special characters aren't allowed. Use simple paths:
```bash
# Good
node export-csv-local.js ./src
node export-csv-local.js /Users/name/project

# Avoid special characters
```

## Equivalence with API Endpoint

This script is equivalent to:

```bash
curl -X POST http://localhost:8000/api/analyze/export-csv-local \
  -H "Content-Type: application/json" \
  -d '{"directory": "./your/project"}'
```

But without needing:
- Server running
- Network calls
- Port configuration

## Integration Examples

### Add to shell profile

```bash
# Add to ~/.zshrc
alias analyze="node /path/to/snutsjs/export-csv-local.js"

# Then use:
analyze /path/to/project report.csv
```

### Batch analyze multiple projects

```bash
#!/bin/bash
for project in projects/*; do
  echo "Analyzing $project..."
  node export-csv-local.js "$project" "results/${project##*/}-smells.csv"
done
```

### Git hook integration

```bash
#!/bin/bash
# .git/hooks/pre-commit
node export-csv-local.js . test-smells-report.csv
if [ $? -ne 0 ]; then
  echo "Test smell analysis failed"
  exit 1
fi
```

## Return Codes

- `0` - Success
- `1` - Error (missing args, invalid directory, etc.)

## Performance Notes

- Speed depends on number of test files
- Large projects (1000+ files) may take 30-60 seconds
- Results are cached during processing

## Output Files Structure

CSV headers:
```
file,type,smells,itCount,describeCount
```

Example row:
```
src/__tests__/app.test.js,IdenticalTestDescription,"[{""startLine"":10,""endLine"":10},{""startLine"":15,""endLine"":15}]",5,2
```

---

**For more details, see CLI_USAGE.md**
