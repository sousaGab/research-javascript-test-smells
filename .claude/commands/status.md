---
description: Show project status and research progress
---

Display the current status of the research project.

**Task:**
1. Scan the project directories to gather status information
2. Show an overview of:
   - Number of repositories being analyzed
   - Repositories with smell detection completed
   - Repositories with test results
   - Recent activity (from git log)
   - Current focus (based on recent changes)

**Expected analysis:**
- Count directories in `repositories/`
- Check for smell results in `smells_detected/`
- Check for test outputs in `tests_output/`
- Review recent git commits (last 5)
- Identify which repos have complete data

**Example output format:**
```
Research Project Status
========================

REPOSITORIES:
-------------
Total Repositories: 30
├─ Smell Detection Complete: 28 (93%)
├─ Test Results Available: 15 (50%)
└─ Fully Analyzed: 12 (40%)

RECENT ACTIVITY (Last 5 commits):
----------------------------------
1. b2e3499 - delete eslint config prettier
2. 7e6c242 - Remove outdated test output files...
3. 0b578db - execution of tests
4. c4b2454 - create the execution file to run tests in dayjs...
5. e920789 - adjust dayjs repository

CURRENT FOCUS:
--------------
→ Working on: dayjs repository
→ Recent tasks: Test execution and analysis
→ Status: Active development

REPOSITORIES BY STATUS:
-----------------------
✓ Complete: dayjs, luxon, falcor, jasmine
⚠ Partial: inferno, isomorphic-git, winston
○ Not Started: moleculer, parse-server

NEXT STEPS:
-----------
1. Complete test execution for remaining repos
2. Run comparison analysis
3. Document findings

Tools Ready:
  ✓ Steel detector installed
  ✓ SNutsJS detector installed
  ✓ LLM pipeline operational
  ✓ Python environment active
```

**Note:** This gives a quick overview to understand where the research stands.
