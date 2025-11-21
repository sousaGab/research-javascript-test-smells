---
description: Setup a new repository for analysis
---

Setup a new JavaScript repository for test smell analysis.

**Task:**
1. Ask the user for the repository name or GitHub URL
2. If URL provided, clone to `./repositories/`
3. If name provided, verify it exists in `./repositories/`
4. Run setup steps:
   - Navigate to repository
   - Install dependencies (`npm install` or `yarn install`)
   - Create smell detection output directory
   - Create test output directory
   - Verify test command works
5. Report setup status

**Expected flow:**
```bash
# If cloning
cd repositories
git clone <github-url> <repo-name>
cd <repo-name>
npm install

# Create output directories
mkdir -p ../../smells_detected/<repo-name>/steel_output
mkdir -p ../../smells_detected/<repo-name>/snutsjs_output
mkdir -p ../../tests_output/<repo-name>

# Verify tests work
npm test -- --listTests  # Just list, don't run yet
```

**Example output:**
```
Setting up repository: lodash
==============================

Step 1: Repository ✓
  Location: ./repositories/lodash
  Already cloned

Step 2: Dependencies ✓
  Running: npm install
  Installed 234 packages

Step 3: Output Directories ✓
  Created: smells_detected/lodash/
  Created: tests_output/lodash/

Step 4: Test Command ✓
  Test framework detected: Jest
  Test command: npm test
  Found 456 test files

Setup Complete! ✓

Next steps:
  1. Run: /analyze-smells lodash
  2. Run: /run-tests lodash
  3. Analyze results
```

**Notes:**
- Handles both npm and yarn
- Creates standard directory structure
- Validates test setup before proceeding
- Provides clear next steps
