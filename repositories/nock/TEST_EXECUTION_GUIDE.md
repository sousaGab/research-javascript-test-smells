# Test Execution and Coverage Guide

## Running Tests with Coverage

This repository has been configured to run all tests and generate a comprehensive coverage report.

### Quick Start

Run all tests with coverage:
```bash
npm run test:coverage
```

This will execute:
- All Mocha tests (in `tests/` directory)
- All Jest tests (in `tests_jest/` directory)
- Generate coverage reports using nyc

### Expected Output Format

The output follows a standardized format showing:
```
=============================== Coverage summary ===============================
Statements   : 96.66% ( 1392/1440 )
Branches     : 94.44% ( 765/810 )
Functions    : 94.69% ( 250/264 )
Lines        : 96.72% ( 1358/1404 )
================================================================================

Test Suites: 48 passed, 48 total
Tests:       11 skipped, 634 passed, 645 total
Time:        16.122 s
```

### Available Test Commands

- `npm test` - Run Mocha tests with coverage (default)
- `npm run test:mocha` - Run only Mocha tests with nyc coverage
- `npm run test:jest` - Run only Jest tests with leak detection
- `npm run test:all` - Run all tests with combined coverage report
- `npm run test:coverage` - Same as test:all, recommended for full test execution

### Coverage Reports

Coverage reports are generated in multiple formats:
- **Text Summary**: Displayed in console output
- **HTML Report**: Available in `coverage/lcov-report/index.html`
- **LCOV Format**: Available in `coverage/lcov.info`

To view the HTML coverage report:
```bash
open coverage/lcov-report/index.html
```

### Test Structure

- **Mocha Tests**: Located in `tests/` directory
  - ~634 test cases across 48 test suites
  - Tests use Mocha + Chai for assertions
  - Some tests are skipped (pending) - marked in output

- **Jest Tests**: Located in `tests_jest/` directory  
  - Memory leak detection tests
  - Run with Jest's leak detection enabled

### Configuration Files

- `.nycrc.yml` - NYC (Istanbul) coverage configuration
- `.mocharc.js` - Mocha test runner configuration
- `jest.config.js` - Jest test runner configuration
- `run-all-tests.js` - Custom script for unified test execution

### Notes

The test execution script (`run-all-tests.js`) combines both test frameworks and normalizes the output format for consistency across different projects.
