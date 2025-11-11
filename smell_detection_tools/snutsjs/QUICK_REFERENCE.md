# 🚀 snutsjs CLI Script - Quick Reference

## What is export-csv-local.js?

A standalone Node.js command-line script that analyzes test files for code smells and exports results to CSV, without needing the web server running.

## ⚡ Quick Start

```bash
cd /Users/gabriel.amaralmercos.com/Desktop/refactoring-smells/smell_detection_tools/snutsjs

# Basic usage
node export-csv-local.js <directory>

# With custom output file
node export-csv-local.js <directory> <outputFile>

# Using npm script
yarn export-csv-local <directory> [outputFile]
```

## 📋 Examples That Work

```bash
# Analyze react-beautiful-dnd project
node export-csv-local.js /Users/gabriel.amaralmercos.com/Desktop/refactoring-smells/projects/react-beautiful-dnd rbd-report.csv

# Analyze vanilla-lazyload
node export-csv-local.js /Users/gabriel.amaralmercos.com/Desktop/refactoring-smells/projects/vanilla-lazyload lazyload-report.csv

# Analyze binance-trading-bot
node export-csv-local.js /Users/gabriel.amaralmercos.com/Desktop/refactoring-smells/projects/binance-trading-bot btb-report.csv

# Default output filename (analysis-results.csv)
node export-csv-local.js /Users/gabriel.amaralmercos.com/Desktop/refactoring-smells/projects/prettier

# Using relative paths
node export-csv-local.js ../other-project my-output.csv
```

## 📊 What You Get

When you run the command:

### 1. Console Output
- Progress indicators
- Summary statistics
- Breakdown of smells by type

Example:
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
```

### 2. CSV File
Contains columns:
- `file` - Test file path
- `type` - Smell type (15 different types)
- `smells` - Smell details with line numbers
- `itCount` - Number of test cases
- `describeCount` - Number of describe blocks

## 🎯 15 Smell Types Detected

| # | Type | Description |
|---|------|-------------|
| 1 | **AnonymousTest** | Test with no description |
| 2 | **SensitiveEquality** | Using == instead of === |
| 3 | **CommentsOnlyTest** | Test with only comments |
| 4 | **GeneralFixture** | Generic fixture setup |
| 5 | **TestWithoutDescription** | Missing test description |
| 6 | **TranscriptingTest** | Over-detailed test |
| 7 | **OvercommentedTest** | Too many comments |
| 8 | **IdenticalTestDescription** | Duplicate descriptions |
| 9 | **ComplexSnapshot** | Complex snapshots |
| 10 | **ConditionalTestLogic** | Conditionals in tests |
| 11 | **NonFunctionalStatement** | Useless code |
| 12 | **OnlyTest** | Using `.only` |
| 13 | **SubOptimalAssert** | Weak assertions |
| 14 | **VerboseTest** | Verbose code |
| 15 | **VerifyInSetup** | Setup assertions |

## 📚 Documentation

- **README_CLI.md** - Complete overview
- **EXPORT_CSV_LOCAL_GUIDE.md** - Detailed guide with workflow examples
- **CLI_USAGE.md** - Full API documentation
- **examples.sh** - Command line examples

## ✅ Tested Projects

These projects have been successfully analyzed:

1. ✅ **react-beautiful-dnd** - 327 CSV rows from 116 files
2. ✅ **vanilla-lazyload** - 27 CSV rows from 6 files

## 🔧 How It Works

```
Input Directory
       ↓
   Find Test Files (using glob patterns)
       ↓
   Parse Each File (Babel AST parser)
       ↓
   Detect Smells (15 detectors)
       ↓
   Filter (only files with smells)
       ↓
   Split Results (one smell per row)
       ↓
   Convert to CSV
       ↓
   Export to File + Console Summary
```

## 💡 Use Cases

### 1. Analyze Before Refactoring
```bash
node export-csv-local.js ./src before-refactor.csv
```

### 2. Batch Analyze Projects
```bash
for project in projects/*; do
  node export-csv-local.js "$project" "results/${project##*/}.csv"
done
```

### 3. Generate Reports
```bash
node export-csv-local.js /path/to/project report-$(date +%Y%m%d).csv
```

### 4. Compare Metrics
Analyze the same project at different times to track improvement

## ⚙️ Requirements

- ✅ Node.js (already installed)
- ✅ Dependencies (already in package.json)
- ✅ Test files in JavaScript or TypeScript

## 🚀 Getting Started Now

1. **Pick a project** from `/projects/` folder
2. **Run the command**:
   ```bash
   node export-csv-local.js /path/to/project output.csv
   ```
3. **View results**:
   - Check console output for summary
   - Open CSV file in Excel/Numbers/etc

## 🎓 Learn More

For comprehensive information:
- How to use different parameters
- Integration with other tools
- Troubleshooting errors
- Performance optimization

→ See **EXPORT_CSV_LOCAL_GUIDE.md**

## 📝 Alternative: Using npm Script

Instead of typing the full path, you can use:

```bash
cd /Users/gabriel.amaralmercos.com/Desktop/refactoring-smells/smell_detection_tools/snutsjs
yarn export-csv-local /path/to/project output.csv
```

## 🔗 Equivalent API Endpoint

This script replaces the need for:
```bash
curl -X POST http://localhost:8000/api/analyze/export-csv-local \
  -H "Content-Type: application/json" \
  -d '{"directory": "./your/project"}'
```

Now you can run the analysis **offline** without the server! 🎉

---

**Files Created:**
- ✅ `export-csv-local.js` - Main executable script
- ✅ `README_CLI.md` - This overview
- ✅ `EXPORT_CSV_LOCAL_GUIDE.md` - Full guide
- ✅ `CLI_USAGE.md` - API documentation
- ✅ `examples.sh` - Command examples
- ✅ Updated `package.json` - Added npm script

**Ready to use!** 🚀
