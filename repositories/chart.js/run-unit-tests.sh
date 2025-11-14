#!/bin/bash

# Script to run only unit tests in Chart.js
# Unit tests are located in test/specs/ and run using Karma + Jasmine
# This excludes integration tests and type tests

echo "Running Chart.js unit tests..."
echo "================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Error: node_modules not found. Please run 'pnpm install' first."
    exit 1
fi

# Parse options
WITH_COVERAGE=false
GREP_PATTERN=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage)
            WITH_COVERAGE=true
            shift
            ;;
        --grep)
            GREP_PATTERN="$2"
            shift 2
            ;;
        *)
            GREP_PATTERN="$1"
            shift
            ;;
    esac
done

# Build command
CMD="cross-env NODE_ENV=test karma start ./karma.conf.cjs --single-run --browsers chrome"

if [ "$WITH_COVERAGE" = true ]; then
    CMD="$CMD --coverage"
fi

if [ -n "$GREP_PATTERN" ]; then
    CMD="$CMD --grep $GREP_PATTERN"
else
    CMD="$CMD --grep"
fi

echo "Command: $CMD"
echo ""

# Run unit tests
eval $CMD

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
echo "================================"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "Unit tests completed successfully!"
else
    echo "Unit tests failed with exit code: $TEST_EXIT_CODE"
fi

exit $TEST_EXIT_CODE
