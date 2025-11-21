---
description: Compare test smells and results before/after refactoring
---

Compare test smell detection and test results between original and refactored versions.

**Task:**
1. Ask the user which repository to compare (or use 'dayjs' if not specified)
2. Check for existence of:
   - Original smell data: `smells_detected/<repo>/original_smells.csv`
   - Refactored smell data: `smells_detected/<repo>/refactored_smells.csv`
   - Original test results: `tests_output/<repo>/original_test_summary.txt`
   - Refactored test results: `tests_output/<repo>/refactored_test_summary.txt`
3. Parse and compare the data
4. Generate a comparison report showing:
   - Smell reduction metrics
   - Test result changes
   - Coverage changes (if available)
   - Potential issues or regressions

**Expected analysis:**
- Count smells by type in both versions
- Calculate reduction percentages
- Check if any new smells were introduced
- Verify tests still pass
- Compare coverage metrics

**Example output format:**
```
Comparison Report: dayjs (Original vs Refactored)
==================================================

SMELL ANALYSIS:
---------------
Total Smells: 47 → 12 (74% reduction) ✓

By Type:
  Assertion Roulette: 23 → 3 (-87%) ✓✓
  Eager Test: 12 → 5 (-58%) ✓
  Test Duplication: 8 → 4 (-50%) ✓
  Unknown Test: 4 → 0 (-100%) ✓✓

New Smells Introduced: 0 ✓

TEST RESULTS:
-------------
Original:
  Test Suites: 45 passed, 45 total
  Tests: 892 passed, 892 total

Refactored:
  Test Suites: 45 passed, 45 total
  Tests: 892 passed, 892 total

Status: No regressions ✓

COVERAGE:
---------
Statements: 98.5% → 98.7% (+0.2%)
Branches: 96.2% → 96.5% (+0.3%)
Functions: 97.8% → 97.8% (no change)
Lines: 98.7% → 99.0% (+0.3%)

SUMMARY:
--------
✓ Significant smell reduction achieved
✓ All tests still passing
✓ Coverage maintained/improved
✓ No new issues introduced

Recommendation: Refactoring successful - ready to commit
```

**Note:** If comparison files don't exist, offer to help create them by running smell detection and tests.
