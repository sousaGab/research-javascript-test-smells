#!/bin/bash

# Example: How to use the export-csv-local.js CLI script
# This file demonstrates various usage scenarios

# Make sure you're in the snutsjs directory
cd "$(dirname "$0")"

echo "=== Example 1: Analyze current directory ==="
# node export-csv-local.js ./

echo ""
echo "=== Example 2: Analyze a specific project directory ==="
# node export-csv-local.js /path/to/project

echo ""
echo "=== Example 3: Analyze and save to custom file ==="
# node export-csv-local.js ./src my-analysis.csv

echo ""
echo "=== Example 4: Analyze test files in a project ==="
# node export-csv-local.js /Users/gabriel.amaralmercos.com/Desktop/refactoring-smells/projects/binance-trading-bot btb-smells.csv

echo ""
echo "=== Example 5: Analyze with relative path ==="
# node export-csv-local.js ../projects/prettier prettier-smells.csv

echo ""
echo "Script Usage:"
echo "  node export-csv-local.js <directory> [outputFile]"
echo ""
echo "Parameters:"
echo "  <directory>  - Path to the directory containing test files (required)"
echo "  [outputFile] - Output CSV filename (optional, default: analysis-results.csv)"
