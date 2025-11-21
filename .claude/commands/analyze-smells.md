---
description: Analyze test smells in a repository using Steel detector
---

Analyze test smells in the specified repository.

**Task:**
1. Ask the user which repository to analyze (or use 'dayjs' if not specified)
2. Check if the repository exists in `./repositories/`
3. Run the Steel smell detector on the repository's test files
4. Parse and summarize the results from `./smells_detected/<repo>/steel_output/steel.json`
5. Display:
   - Total number of smells detected
   - Breakdown by smell type
   - Top 3 most affected files
   - Recommendations for refactoring priorities

**Expected flow:**
- Navigate to smell_detection_tools/steel
- Run: `node dist/index.js ../../repositories/<repo>/test --output=../../smells_detected/<repo>/steel_output/`
- Read and analyze the JSON output
- Present findings in a clear, structured format

**Example output format:**
```
Test Smell Analysis for: dayjs
================================

Total Smells Detected: 47

Breakdown by Type:
- Assertion Roulette: 23 (49%)
- Eager Test: 12 (26%)
- Test Code Duplication: 8 (17%)
- Unknown Test: 4 (8%)

Most Affected Files:
1. test/plugin/calendar.test.js - 15 smells
2. test/plugin/duration.test.js - 9 smells
3. test/parse.test.js - 7 smells

Recommendations:
→ Priority 1: Refactor Assertion Roulette in calendar.test.js
→ Priority 2: Split Eager Tests in duration.test.js
→ Priority 3: Extract duplicated setup code
```
