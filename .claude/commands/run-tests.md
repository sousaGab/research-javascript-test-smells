---
description: Run tests for a repository and analyze results
---

Run the test suite for a specified repository and analyze the results.

**Task:**
1. Ask the user which repository to test (or use 'dayjs' if not specified)
2. Verify the repository exists in `./repositories/`
3. Navigate to the repository directory
4. Run `npm test` (or `npm test -- --coverage` if user wants coverage)
5. Capture and save the output to `./tests_output/<repo>/test_summary.txt`
6. Parse the test results and present:
   - Number of test suites passed/failed
   - Number of tests passed/failed
   - Execution time
   - Coverage summary (if requested)
   - Any failures or warnings

**Expected flow:**
- `cd repositories/<repo>`
- `npm test > ../../tests_output/<repo>/test_summary_$(date +%Y%m%d_%H%M%S).txt`
- Parse Jest output
- Display formatted results

**Example output format:**
```
Test Execution Results: dayjs
==============================

✓ Test Suites: 45 passed, 45 total
✓ Tests: 892 passed, 892 total
⏱ Time: 8.234s

Coverage (if requested):
  Statements: 98.5%
  Branches: 96.2%
  Functions: 97.8%
  Lines: 98.7%

Status: All tests passing ✓

Output saved to: tests_output/dayjs/test_summary_20241121_120000.txt
```

**Options:**
- Add `--coverage` to include coverage analysis
- Add `--watch` to run in watch mode (interactive)
- Add `--verbose` for detailed output
