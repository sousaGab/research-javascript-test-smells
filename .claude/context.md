# JavaScript Test Smells Research Project - Context

## Project Overview

This is a research project investigating **test smells in JavaScript test suites** and exploring automated refactoring approaches using LLMs (Large Language Models). The project combines static analysis tools with LLM-based refactoring to improve test quality.

## Research Goals

1. **Detect test smells** in popular JavaScript open-source projects
2. **Refactor tests** to remove smells while preserving functionality
3. **Measure effectiveness** of automated refactoring approaches
4. **Compare metrics** before and after refactoring (smells, test results, coverage)

## Project Structure

```
research-javascript-test-smells/
├── repositories/                 # ~30 JavaScript repos for analysis
│   ├── dayjs/                   # Date manipulation library
│   ├── luxon/                   # DateTime library
│   ├── jasmine/                 # Testing framework
│   └── ...                      # More JS projects
│
├── smells_detected/             # Smell detection results
│   ├── dayjs/
│   │   ├── smells.csv          # CSV with smell data
│   │   └── steel_output/       # Raw Steel tool output
│   └── ...
│
├── smell_detection_tools/       # Static analysis tools
│   ├── steel/                   # Steel smell detector
│   └── snutsjs/                 # SNutsJS smell detector
│
├── llm-refactor-pipeline/       # Python CLI for orchestration
│   ├── src/llm_refactor/
│   │   ├── modules/
│   │   │   ├── detect_smells/  # Smell detection module
│   │   │   └── run_tests/      # Test execution module
│   │   └── cli/                # Interactive CLI
│   └── README.md
│
├── tests_output/                # Test execution results
│   └── dayjs/
│       ├── test_summary.txt    # Jest test results
│       └── coverage_summary.txt
│
└── scripts/                     # Analysis scripts
    └── check_smells.py         # Compare original vs refactored
```

## Key Components

### 1. Smell Detection Tools

#### Steel
- JavaScript/TypeScript static analysis tool
- Detects test smells like Assertion Roulette, Eager Test, etc.
- Outputs JSON and CSV formats
- Located in: `smell_detection_tools/steel/`
- Run via: `steel <path-to-tests> --output=json`

#### SNutsJS
- Another test smell detector
- Complementary to Steel
- Located in: `smell_detection_tools/snutsjs/`

### 2. LLM Refactor Pipeline

A Python CLI tool (similar to Claude Code!) for orchestrating the research workflow.

**Key Features:**
- Interactive REPL interface
- Modular architecture
- Modules for smell detection, test running, and analysis

**Usage:**
```bash
cd llm-refactor-pipeline
python -m llm_refactor

# Available commands:
llm-refactor> detect_smells all          # Detect smells in all repos
llm-refactor> detect_smells dayjs        # Detect smells in specific repo
llm-refactor> run_tests dayjs            # Run tests for a repo
llm-refactor> help                       # Show help
```

**Key Modules:**
- `detect_smells` - Runs Steel/SNutsJS on repositories
- `run_tests` - Executes Jest tests and collects coverage
- `check_repositories` - Sets up directory structure

### 3. Test Smell Types

The project focuses on these test smells:

1. **Assertion Roulette**
   - Multiple assertions without descriptive messages
   - Hard to identify which assertion failed

2. **Eager Test**
   - Test checks too many behaviors at once
   - Should be split into multiple focused tests

3. **Lazy Test**
   - Multiple test cases in one test method
   - Makes debugging difficult

4. **Mystery Guest**
   - Test depends on external resources
   - Makes tests brittle and hard to understand

5. **Test Code Duplication**
   - Repeated setup/teardown code
   - Should use beforeEach/afterEach

6. **Unknown Test**
   - Test without clear assertions
   - Unclear what is being tested

### 4. Workflow

#### Standard Research Workflow:

```bash
# 1. Detect smells in a repository
cd smell_detection_tools/steel
node dist/index.js ../../repositories/dayjs/test --output=../../smells_detected/dayjs/

# 2. Run original tests
cd repositories/dayjs
npm test > ../../tests_output/dayjs/original_test_summary.txt

# 3. Refactor using LLM (manual or automated)
# ... refactoring code ...

# 4. Detect smells again
# ... re-run Steel ...

# 5. Run tests again
npm test > ../../tests_output/dayjs/refactored_test_summary.txt

# 6. Compare results
cd ../../scripts
python check_smells.py
```

## Test Repositories

The project analyzes ~30 popular JavaScript repositories:

| Repository | Type | Test Framework |
|-----------|------|----------------|
| dayjs | Date library | Jest |
| luxon | DateTime library | Jest |
| jasmine | Testing framework | Self |
| falcor | Data platform | Jest |
| inferno | React-like library | Jest |
| isomorphic-git | Git implementation | Jest |
| javascript-algorithms | Algorithm library | Jest |
| winston | Logger | Jest |
| morgan | HTTP logger | Jest |
| multer | File upload | Jest |
| ... | ... | ... |

## Data Format

### Smell Detection CSV Format
```csv
file,type,line,description,detected_at
test/plugin/calendar.test.js,Assertion Roulette,45,Multiple assertions without messages,2024-11-17
test/plugin/calendar.test.js,Eager Test,78,Testing multiple behaviors,2024-11-17
```

### Test Summary Format
```txt
Test Suites: 2 passed, 2 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        3.892 s
```

## Common Tasks

### Adding a New Repository
1. Clone repository to `repositories/`
2. Install dependencies: `cd repositories/new-repo && npm install`
3. Run smell detection: Use llm-refactor-pipeline or run Steel manually
4. Results appear in `smells_detected/new-repo/`

### Running Tests on a Repository
```bash
cd repositories/dayjs
npm test                           # Run all tests
npm test -- --coverage             # With coverage
npm test > ../../tests_output/dayjs/test_summary.txt  # Save output
```

### Analyzing Results
```bash
cd scripts
python check_smells.py
# Compares original vs refactored smells and test results
```

### Using the LLM Pipeline
```bash
cd llm-refactor-pipeline
python -m llm_refactor

llm-refactor> detect_smells dayjs
llm-refactor> run_tests dayjs
```

## Environment Setup

### Python Environment
```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Install dependencies
pip install -r llm-refactor-pipeline/requirements.txt
cd llm-refactor-pipeline && pip install -e .
```

### JavaScript Environment
```bash
# Each repository has its own dependencies
cd repositories/dayjs
npm install

# Smell detection tools
cd smell_detection_tools/steel
npm install
npm run compile  # Build TypeScript
```

## Important Files

- `.gitignore` - Excludes node_modules, .venv, build output
- `scripts/check_smells.py` - Main analysis script
- `llm-refactor-pipeline/README.md` - Pipeline documentation
- Repository-specific `package.json` - Test commands for each repo

## Research Notes

### Current Status (from git history)
- ✅ Infrastructure set up (repositories cloned, tools installed)
- ✅ Smell detection completed for most repositories
- ✅ Test execution framework in place
- ✅ LLM refactor pipeline operational
- 🔄 Iterative testing and refinement (recent commits show dayjs work)

### Key Insights
- Most repos use Jest as testing framework
- Common smells: Assertion Roulette, Eager Test
- Test suites vary greatly in size (45 tests to 1000+ tests)
- Coverage data helps validate refactoring doesn't break functionality

## Tips for Working with This Project

1. **Use the LLM pipeline** - It automates many tedious tasks
2. **Check test output** - Always verify tests still pass after changes
3. **Track metrics** - Keep CSV files organized for analysis
4. **One repo at a time** - Focus on single repositories for deep analysis
5. **Backup before refactoring** - Git is your friend

## Useful Commands Reference

```bash
# Python pipeline
python -m llm_refactor

# Run Steel smell detector
cd smell_detection_tools/steel
node dist/index.js <test-directory> --output=<output-path>

# Run tests with coverage
cd repositories/<repo-name>
npm test -- --coverage

# Compare results
cd scripts
python check_smells.py
```

## Next Steps

Based on recent git activity, the project is focusing on:
1. Running tests on dayjs repository
2. Analyzing test results and coverage
3. Comparing original vs refactored versions
4. Documenting findings

---

*This is a research project. Experimental changes are expected. Always validate results and keep good documentation.*
