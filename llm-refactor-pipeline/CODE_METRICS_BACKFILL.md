# Code Metrics Backfill

This document describes how to populate the `code_metrics` table with static analysis metrics for test code in the research database.

## Overview

The code metrics backfill process uses two scripts:
1. **`scripts/calculate_code_metrics.js`** - Node.js script that performs AST-based static analysis using Babel parser
2. **`backfill_code_metrics.py`** - Python orchestrator that queries the database, invokes the JS analyzer, and persists results

## Metrics Calculated

The following metrics are computed for each code snippet:

| Metric | Description |
|--------|-------------|
| `sloc_logical` | Source Lines of Code (logical) - counts meaningful statements |
| `cyclomatic_complexity` | McCabe cyclomatic complexity - counts decision points |
| `cyclomatic_density` | Cyclomatic complexity per 100 SLOC |
| `halstead_effort` | Halstead effort metric - time required to program/understand |
| `halstead_bugs` | Halstead bugs metric - estimated bug count |
| `halstead_difficulty` | Halstead difficulty - how difficult to understand |
| `halstead_volume` | Halstead volume - program size in bits |
| `maintainability_index` | SEI Maintainability Index (0-100, higher is better) |

### Formulas

- **Cyclomatic Complexity**: Count of decision points (if, for, while, case, &&, ||, ?:) + 1
- **Cyclomatic Density**: `(cyclomatic_complexity / sloc_logical) * 100`
- **Halstead Metrics**: Based on unique/total operators and operands
- **Maintainability Index**: `171 - 5.2*ln(V) - 0.23*ln(G) - 16.2*ln(L)` (clamped to 0-100)

## Prerequisites

### 1. Install Node.js Dependencies

```bash
cd llm-refactor-pipeline/scripts
npm install
```

This installs:
- `@babel/parser` (^7.23.0)
- `@babel/traverse` (^7.23.0)

### 2. Activate Python Virtual Environment

```bash
cd /home/gabriel/Disk/Research/research-javascript-test-smells
source .venv/bin/activate
```

## Usage

The backfill script supports two phases:

### Before Phase
Processes the original code from selected `study_smells` records and links metrics to all associated experiments with `phase='before'`.

```bash
cd llm-refactor-pipeline
python3 backfill_code_metrics.py --phase before
```

### After Phase
Processes refactored code from `experiments` where `code_metrics` with `phase='after'` is missing.

```bash
python3 backfill_code_metrics.py --phase after
```

### Both Phases
Process both phases in sequence:

```bash
python3 backfill_code_metrics.py --phase all
```

## Command Line Options

| Option | Description |
|--------|-------------|
| `--phase <before\|after\|all>` | Which phase to process (required) |
| `--dry-run` | Show what would be inserted without modifying database |
| `--limit N` | Process only N records (useful for testing) |
| `--start-from N` | Skip first N records (useful for resume) |
| `--verbose` | Show detailed metrics for each record |
| `--continue-on-error` | Continue processing if some records fail |

## Examples

### Test Run (Dry Run with Limited Records)

```bash
# Test before phase with 10 study smells
python3 backfill_code_metrics.py --phase before --dry-run --limit 10 --verbose

# Test after phase with 10 experiments
python3 backfill_code_metrics.py --phase after --dry-run --limit 10 --verbose
```

### Production Run

```bash
# Full run with error tolerance
python3 backfill_code_metrics.py --phase all --continue-on-error --verbose
```

### Resume After Interruption

```bash
# Skip first 100 study smells and continue
python3 backfill_code_metrics.py --phase before --start-from 100 --continue-on-error
```

## How It Works

### Before Phase Workflow
1. Query `study_smells` where `selected_for_study = TRUE`
2. For each smell, extract `original_code`
3. Send batch (50 items) to `calculate_code_metrics.js`
4. Find all `experiments` linked to each smell
5. Insert `code_metrics` with `phase='before'` for each experiment

### After Phase Workflow
1. Query `experiments` where `refactored_code IS NOT NULL`
2. Filter out experiments that already have `code_metrics` with `phase='after'`
3. Send batch (50 items) to `calculate_code_metrics.js`
4. Insert `code_metrics` with `phase='after'` for each experiment

### Technical Details
- **Batch Size**: 50 items per Node.js invocation
- **Timeout**: 5 minutes per batch
- **Communication**: JSON via stdin/stdout between Python and Node.js
- **Error Handling**: Parse errors logged but don't stop processing (with `--continue-on-error`)
- **Transaction Safety**: Each batch commits independently

## Verifying Results

### Check Record Counts

```sql
-- Count metrics by phase
SELECT phase, COUNT(*) FROM code_metrics GROUP BY phase;

-- Check metrics for specific experiment
SELECT * FROM code_metrics WHERE experiment_id = 123;
```

### Validate Metrics

```sql
-- Check for reasonable metric ranges
SELECT 
    phase,
    AVG(sloc_logical) as avg_sloc,
    AVG(cyclomatic_complexity) as avg_complexity,
    AVG(maintainability_index) as avg_maintainability
FROM code_metrics
GROUP BY phase;
```

### Expected Results
- **Before phase**: ~200 study smells × ~23 experiments/smell ≈ 4,600 records
- **After phase**: All experiments with `refactored_code IS NOT NULL` (varies based on success rate)

## Troubleshooting

### ModuleNotFoundError
**Problem**: `ModuleNotFoundError: No module named 'prompt_toolkit'`

**Solution**: Activate the virtual environment:
```bash
source .venv/bin/activate
```

### Parse Errors
**Problem**: Some code snippets fail to parse

**Solution**: The JS analyzer tries multiple parser configurations (TypeScript → Flow → JavaScript). Parse errors are logged but don't stop processing. Use `--continue-on-error` to skip problematic records.

### Timeout Errors
**Problem**: Batch processing times out

**Solution**: The timeout is set to 5 minutes per batch (50 items). If this occurs, check for extremely large code snippets or reduce batch size in the code.

## Performance

- **Parsing Speed**: ~1-2 seconds per batch of 50 items
- **Before Phase**: ~4,600 insertions, expected time ~3-5 minutes
- **After Phase**: Varies based on experiment count, typically ~5-10 minutes

## Integration with Research Pipeline

These scripts are **standalone** and don't modify the main experiment workflow (`execute_experiment.py`). They are designed for **one-time backfill** of historical data.

For future experiments, consider integrating metrics calculation directly into the experiment execution pipeline.

## Files

- `/llm-refactor-pipeline/scripts/calculate_code_metrics.js` - Babel-based AST analyzer
- `/llm-refactor-pipeline/backfill_code_metrics.py` - Database orchestrator
- `/llm-refactor-pipeline/scripts/package.json` - Node.js dependencies

## References

- **Cyclomatic Complexity**: McCabe, T.J. (1976). "A Complexity Measure"
- **Halstead Metrics**: Halstead, M.H. (1977). "Elements of Software Science"
- **Maintainability Index**: Oman & Hagemeister (1992). "Metrics for Assessing Software System Maintainability"
