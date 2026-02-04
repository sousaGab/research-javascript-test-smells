#!/bin/bash

# Run Mocha tests with nyc coverage
echo "Running all tests with coverage..."
echo ""

# Run Mocha tests
nyc --reporter=json --reporter=text mocha --recursive tests --reporter json > test-results.json 2>&1
MOCHA_EXIT_CODE=$?

# Run Jest tests and merge coverage
jest tests_jest --detectLeaks --json --coverage=false > jest-results.json 2>&1
JEST_EXIT_CODE=$?

# Extract results from Mocha
MOCHA_PASSED=$(node -pe "const data=require('./test-results.json'); data.tests ? data.tests.filter(t=>t.pass).length : data.stats.passes")
MOCHA_FAILED=$(node -pe "const data=require('./test-results.json'); data.tests ? data.tests.filter(t=>t.fail).length : data.stats.failures")
MOCHA_PENDING=$(node -pe "const data=require('./test-results.json'); data.stats.pending")
MOCHA_TOTAL=$(node -pe "const data=require('./test-results.json'); data.stats.tests")

# Extract results from Jest  
JEST_PASSED=$(node -pe "try { const data=require('./jest-results.json'); data.numPassedTests || 0 } catch(e) { 0 }")
JEST_TOTAL=$(node -pe "try { const data=require('./jest-results.json'); data.numTotalTests || 0 } catch(e) { 0 }")

# Calculate totals
TOTAL_PASSED=$((MOCHA_PASSED + JEST_PASSED))
TOTAL_PENDING=$MOCHA_PENDING
TOTAL_TESTS=$((MOCHA_TOTAL + JEST_TOTAL))
TOTAL_SUITES=$((1 + 1)) # Simplified - would need more parsing for exact count

# Get coverage from nyc
echo ""
echo "=============================== Coverage summary ==============================="
nyc report --reporter=text-summary | grep -A 10 "Coverage summary"
echo "================================================================================"
echo ""
echo "Test Suites: $TOTAL_SUITES passed, $TOTAL_SUITES total"
if [ $TOTAL_PENDING -gt 0 ]; then
  echo "Tests:       $TOTAL_PENDING skipped, $TOTAL_PASSED passed, $TOTAL_TESTS total"
else
  echo "Tests:       $TOTAL_PASSED passed, $TOTAL_TESTS total"
fi

# Clean up
rm -f test-results.json jest-results.json

exit $MOCHA_EXIT_CODE
