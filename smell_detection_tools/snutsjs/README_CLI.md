# 📋 CLI Script Created: export-csv-local.js

## Summary

I've created a standalone Node.js CLI script that replicates the exact functionality of the `/export-csv-local` API endpoint from your snutsjs web application.

## Files Created

### 1. **export-csv-local.js** (Main Script)
- Location: `/smell_detection_tools/snutsjs/export-csv-local.js`
- Executable Node.js script with shebang
- Takes directory path as parameter
- Outputs CSV file with test smell analysis

### 2. **Documentation Files**
- **EXPORT_CSV_LOCAL_GUIDE.md** - Complete usage guide with examples
- **CLI_USAGE.md** - Detailed API documentation
- **examples.sh** - Example command snippets

### 3. **Updated package.json**
- Added npm script: `yarn export-csv-local <directory> [outputFile]`

## How to Use

### Simple Usage
```bash
node export-csv-local.js <directory> [outputFile]
```

### Examples

```bash
# Analyze binance-trading-bot
node export-csv-local.js /Users/gabriel.amaralmercos.com/Desktop/refactoring-smells/projects/binance-trading-bot btb-analysis.csv

# Analyze react-beautiful-dnd
node export-csv-local.js /Users/gabriel.amaralmercos.com/Desktop/refactoring-smells/projects/react-beautiful-dnd dnd-analysis.csv

# Using npm script
yarn export-csv-local ./src my-analysis.csv

# Simple usage (default output file)
node export-csv-local.js ./src
```

## What the Script Does

1. ✅ Validates directory path
2. ✅ Finds all test files matching patterns
3. ✅ Parses each file using Babel AST
4. ✅ Detects 15 types of test code smells
5. ✅ Filters results to show only files with smells
6. ✅ Converts to CSV format (one smell per row)
7. ✅ Saves to specified output file
8. ✅ Displays summary statistics

## Output Example

```
📁 Analyzing directory: /path/to/project
✓ Found 4575 analysis results
✓ Filtered to 171 results with smells
✓ Split results to 327 CSV rows
✓ CSV exported successfully to: analysis-results.csv

📊 Summary:
   - Total rows in CSV: 327
   - Unique files analyzed: 116
   - Smells by type:
     • NonFunctionalStatement: 40
     • OvercommentedTest: 51
     • VerboseStatement: 68
     • IdenticalTestDescription: 77
     • ConditionalTestLogic: 6
     • SubOptimalAssert: 85
```

## Detected Smell Types

The script detects these 15 test code smells:

1. **AnonymousTest** - Test without description
2. **SensitiveEquality** - Using == instead of ===
3. **CommentsOnlyTest** - Only comments, no code
4. **GeneralFixture** - Non-specific fixtures
5. **TestWithoutDescription** - Missing description
6. **TranscriptingTest** - Over-detailed transcription
7. **OvercommentedTest** - Too many comments
8. **IdenticalTestDescription** - Duplicate descriptions
9. **ComplexSnapshot** - Overly complex snapshots
10. **ConditionalTestLogic** - Conditionals in tests
11. **NonFunctionalStatement** - Useless statements
12. **OnlyTest** - Using `.only` (isolation issue)
13. **SubOptimalAssert** - Weak assertions
14. **VerboseTest** - Unnecessarily verbose
15. **VerifyInSetup** - Assertions in setup

## CSV Output Format

The generated CSV contains:
- **file** - Test file path (relative)
- **type** - Type of smell detected
- **smells** - Array with line numbers of smell occurrences
- **itCount** - Number of test cases in file
- **describeCount** - Number of describe blocks in file

## Key Features

✨ **No Server Required** - Run without API server
⚡ **Fast** - Direct file analysis without network
📊 **Detailed** - Comprehensive smell detection
💾 **Exportable** - Standard CSV format
🎯 **Accurate** - Same detection as API endpoint
📝 **Documented** - Clear usage examples
🔧 **Configurable** - Custom output filenames

## Testing

The script has been tested successfully with the `react-beautiful-dnd` project:
- ✅ Analyzed 4,575 test results
- ✅ Identified 171 files with smells
- ✅ Generated 327 CSV rows
- ✅ Successfully exported to CSV

## Integration Options

### 1. Direct Command
```bash
node export-csv-local.js /path/to/project results.csv
```

### 2. NPM Script
```bash
yarn export-csv-local /path/to/project results.csv
```

### 3. Shell Alias
```bash
alias analyze="node /path/to/snutsjs/export-csv-local.js"
analyze /path/to/project
```

### 4. Batch Processing
```bash
for dir in projects/*; do
  node export-csv-local.js "$dir" "results/${dir##*/}.csv"
done
```

## Next Steps

You can now:
1. Analyze any local project for test smells
2. Export results to CSV for reporting
3. Compare smell patterns across projects
4. Integrate into CI/CD pipelines
5. Generate reports without API server

---

**Need help?** Check the documentation files:
- `EXPORT_CSV_LOCAL_GUIDE.md` - Full guide
- `CLI_USAGE.md` - API details
- `examples.sh` - Command examples
