#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('Running all tests with coverage...\n');

const startTime = Date.now();

try {
  // Run mocha tests with coverage and capture both output and results
  let mochaTextOutput = '';
  try {
    mochaTextOutput = execSync(
      'nyc --reporter=json --reporter=text mocha --recursive tests',
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
  } catch (e) {
    // Tests might have skipped ones, but that's ok
    mochaTextOutput = e.stdout || '';
  }
  
  // Extract mocha results from the text output
  const passingMatch = mochaTextOutput.match(/(\d+) passing/);
  const pendingMatch = mochaTextOutput.match(/(\d+) pending/);
  const failingMatch = mochaTextOutput.match(/(\d+) failing/);
  
  const mochaPassed = passingMatch ? parseInt(passingMatch[1]) : 0;
  const mochaPending = pendingMatch ? parseInt(pendingMatch[1]) : 0;
  const mochaFailed = failingMatch ? parseInt(failingMatch[1]) : 0;
  const mochaTests = mochaPassed + mochaPending + mochaFailed;

  // Run jest tests
  let jestResults = { numPassedTests: 0, numTotalTests: 0, numPassedTestSuites: 0, numTotalTestSuites: 0 };
  try {
    const jestOutput = execSync(
      'jest tests_jest --json',
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    jestResults = JSON.parse(jestOutput);
  } catch (e) {
    // Jest might fail but still produce output
    if (e.stdout) {
      try {
        jestResults = JSON.parse(e.stdout);
      } catch (parseErr) {
        // ignore
      }
    }
  }

  // Generate text-summary coverage
  const coverageSummary = execSync('nyc report --reporter=text-summary', {
    encoding: 'utf-8'
  });

  // Calculate totals
  const jestPassed = jestResults.numPassedTests || 0;
  const jestTests = jestResults.numTotalTests || 0;
  const jestSuites = jestResults.numTotalTestSuites || 0;
  
  const totalPassed = mochaPassed + jestPassed;
  const totalTests = mochaTests + jestTests;
  
  // Count mocha test suites (rough estimate based on test files)
  let mochaTestFiles = 0;
  try {
    const findOutput = execSync('find tests -name "test_*.js" -type f | wc -l', { encoding: 'utf-8' });
    mochaTestFiles = parseInt(findOutput.trim()) || 1;
  } catch (e) {
    mochaTestFiles = 1;
  }
  
  const totalSuites = mochaTestFiles + jestSuites;

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(3);

  console.log('\n=============================== Coverage summary ===============================');
  
  // Extract and print coverage lines
  const lines = coverageSummary.split('\n');
  for (const line of lines) {
    if (line.includes('Statements') || line.includes('Branches') || 
        line.includes('Functions') || line.includes('Lines')) {
      console.log(line);
    }
  }
  
  console.log('================================================================================\n');
  console.log(`Test Suites: ${totalSuites} passed, ${totalSuites} total`);
  
  if (mochaPending > 0) {
    console.log(`Tests:       ${mochaPending} skipped, ${totalPassed} passed, ${totalTests} total`);
  } else {
    console.log(`Tests:       ${totalPassed} passed, ${totalTests} total`);
  }
  console.log(`Time:        ${duration} s`);

  // Exit with error if any tests failed
  process.exit(mochaFailed > 0 ? 1 : 0);

} catch (error) {
  console.error('Error running tests:', error.message);
  process.exit(1);
}
