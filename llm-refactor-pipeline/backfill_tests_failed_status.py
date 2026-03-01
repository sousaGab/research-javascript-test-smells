#!/usr/bin/env python3
"""
Backfill tests_failed and tests_failed_type in experiments.

This script performs three sequential steps:

STEP 1 — MIGRATION
  Adds two new columns to the `experiments` table:
    - tests_failed BOOLEAN DEFAULT NULL
    - tests_failed_type TEXT DEFAULT NULL

  Adds repository baseline to `test_results` (before phase):
    - Currently test_results only has 'after' phase rows.
    - This step re-populates 'before' phase from tests_output/{repo}/test_summary.txt

STEP 2 — POPULATE test_results BEFORE PHASE
  For each unique repository among completed experiments, parse
  tests_output/{repo}/test_summary.txt and insert a test_results row
  with phase='before' for EACH experiment belonging to that repository.
  Existing 'before' rows are deleted and replaced.

STEP 3 — BACKFILL tests_failed / tests_failed_type
  Evaluates each completed experiment according to two rules:

  Rule A — suites_failed_increase:
    after.test_suites_failed > before/baseline.test_suites_failed (NULL treated as 0)
    → tests_failed=TRUE, tests_failed_type='suites_failed_increase'

  Rule B — empty/unparsable test_summary.txt:
    test_summary.txt has no 'Test Suites:' or 'Tests:' line
    → classify from test_output.txt content:
        'syntax_error'            SyntaxError / Unexpected token / jest unexpected token
        'module_resolution_error' Cannot find module / Module not found / ENOENT
        'runtime_error'           ReferenceError / TypeError / Error: (generic)
        'unknown'                 none of the above
    → tests_failed=TRUE, tests_failed_type=<classified>

  Otherwise:
    → tests_failed=FALSE, tests_failed_type=NULL

Usage:
    python3 backfill_tests_failed_status.py [--dry-run] [--step=N]

    --dry-run     Show what would be done without writing
    --step=1      Run only Step 1 (migration)
    --step=2      Run only Step 2 (before phase)
    --step=3      Run only Step 3 (backfill)
"""

import re
import sys
import sqlite3
from pathlib import Path

# ─── Configuration ────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
DB_PATH = BASE_DIR / "research_data" / "research.db"
DATASET_DIR = Path(__file__).parent / "dataset"
TESTS_OUTPUT_DIR = BASE_DIR / "tests_output"

DRY_RUN = "--dry-run" in sys.argv
STEP_FILTER = None
for arg in sys.argv:
    if arg.startswith("--step="):
        STEP_FILTER = int(arg.split("=")[1])

# Model name → directory override (DB ai_model_version → filesystem dirname)
MODEL_DIR_ALIASES = {
    "codellama-34b": "codellama-34b-instruct",
}


# ─── Regex helpers ────────────────────────────────────────────────────────────

def extract_test_results(output: str):
    """Extract test results line(s) — supports Jest with/without Snapshots."""
    patterns = [
        r'(Test Suites:.*\nTests:.*\nSnapshots:.*\nTime:.*)',
        r'(Test Suites:.*\nTests:.*\nTime:.*)',
        r'(Tests:.*?passing.*)',
        r'(\d+\s+passing.*)',
    ]
    for pattern in patterns:
        matches = re.findall(pattern, output, re.IGNORECASE)
        if matches:
            return matches[-1].strip()
    return None


def extract_coverage_summary(output: str):
    """Extract Jest coverage block."""
    m = re.search(
        r'(={10,}[^=\n]*Coverage summary[^=\n]*={10,}\n(?:.*\n){4,6}={10,})',
        output
    )
    if m:
        return m.group(1).strip()
    m = re.search(
        r'(Statements\s*:.*?\nBranches\s*:.*?\nFunctions\s*:.*?\nLines\s*:.*?)(?:\n|$)',
        output, re.DOTALL
    )
    return m.group(1).strip() if m else None


def parse_test_counts(text: str) -> dict:
    """Parse 'Test Suites:' and 'Tests:' lines into a dict."""
    result = {}

    m = re.search(r'Test Suites:\s*(.*)', text, re.IGNORECASE)
    if m:
        for part in m.group(1).split(','):
            part = part.strip()
            nm = re.match(r'(\d+)\s+(\w+)', part)
            if nm:
                n, label = int(nm.group(1)), nm.group(2).lower()
                if 'fail' in label:
                    result['test_suites_failed'] = n
                elif 'pass' in label:
                    result['test_suites_passed'] = n
                elif 'total' in label:
                    result['test_suites_total'] = n

    m = re.search(r'\nTests:\s*(.*)', text, re.IGNORECASE)
    if m:
        for part in m.group(1).split(','):
            part = part.strip()
            nm = re.match(r'(\d+)\s+(\w+)', part)
            if nm:
                n, label = int(nm.group(1)), nm.group(2).lower()
                if 'fail' in label:
                    result['tests_failed'] = n
                elif 'pass' in label:
                    result['tests_passed'] = n
                elif 'total' in label:
                    result['tests_total'] = n

    m = re.search(r'Snapshots:\s*(.*)', text, re.IGNORECASE)
    if m:
        for part in m.group(1).split(','):
            part = part.strip()
            nm = re.match(r'(\d+)\s+(\w+)', part)
            if nm:
                n, label = int(nm.group(1)), nm.group(2).lower()
                if 'total' in label:
                    result['snapshots_total'] = n

    m = re.search(r'Time:\s*([\d.]+)\s*s', text, re.IGNORECASE)
    if m:
        result['execution_time_seconds'] = float(m.group(1))

    return result


def parse_coverage(text: str) -> dict:
    result = {}
    for key, pattern in [
        ('statements', r'Statements\s*:\s*([\d.]+)%'),
        ('branches',   r'Branches\s*:\s*([\d.]+)%'),
        ('functions',  r'Functions\s*:\s*([\d.]+)%'),
        ('lines',      r'Lines\s*:\s*([\d.]+)%'),
    ]:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            result[key] = float(m.group(1))
    return result


def has_test_data(summary_text: str) -> bool:
    """Return True if test_summary.txt contains parsable test results."""
    if not summary_text:
        return False
    return bool(re.search(r'Test Suites:|Tests:\s*\d+', summary_text, re.IGNORECASE))


def classify_error(output_text: str) -> str:
    """Classify type of test failure from test_output.txt content."""
    # Normalize
    text = output_text or ""
    text_lower = text.lower()

    syntax_patterns = [
        r'syntaxerror', r'unexpected token', r'jest encountered an unexpected token',
        r'cannot parse', r'eslint fatal', r'parse error'
    ]
    module_patterns = [
        r'cannot find module', r'module not found', r"error: cannot find",
        r"enoent.*?require", r"no such file.*?require", r"failed to resolve"
    ]
    runtime_patterns = [
        r'referenceerror', r'typeerror', r'rangeerror',
        r'error: ', r'uncaught exception', r'unhandled promise rejection'
    ]

    for p in syntax_patterns:
        if re.search(p, text_lower):
            return 'syntax_error'

    for p in module_patterns:
        if re.search(p, text_lower):
            return 'module_resolution_error'

    for p in runtime_patterns:
        if re.search(p, text_lower):
            return 'runtime_error'

    return 'unknown'


# ─── Path helpers ─────────────────────────────────────────────────────────────

def model_to_dir(model_name: str) -> str:
    name = model_name.lower().replace(' ', '-').replace('(', '').replace(')', '')
    return MODEL_DIR_ALIASES.get(name, name)


def approach_to_dir(approach: str) -> str:
    return approach.lower().replace('-', '_').replace(' ', '_')


def get_experiment_output_dir(approach: str, model: str, smell_id: int) -> Path:
    return DATASET_DIR / approach_to_dir(approach) / model_to_dir(model) / f"smell_{smell_id}"


def load_summary(path: Path) -> str | None:
    if path.exists():
        return path.read_text(encoding='utf-8', errors='replace')
    return None


# ─── STEP 1: Migration ────────────────────────────────────────────────────────

def run_migration(conn: sqlite3.Connection):
    print("\n" + "=" * 70)
    print("STEP 1: Migration — add columns to experiments")
    print("=" * 70)

    cur = conn.cursor()

    # Check which columns already exist
    cur.execute("PRAGMA table_info(experiments)")
    existing_cols = {row[1] for row in cur.fetchall()}

    added = []
    for col_def, col_name in [
        ("tests_failed BOOLEAN DEFAULT NULL", "tests_failed"),
        ("tests_failed_type TEXT DEFAULT NULL", "tests_failed_type"),
    ]:
        if col_name not in existing_cols:
            if not DRY_RUN:
                cur.execute(f"ALTER TABLE experiments ADD COLUMN {col_def}")
            added.append(col_name)
            print(f"  + Added column: {col_name}")
        else:
            print(f"  ✓ Column already exists: {col_name}")

    if not DRY_RUN and added:
        conn.commit()
        print(f"  Committed {len(added)} new column(s).")


# ─── STEP 2: Populate test_results BEFORE phase ───────────────────────────────

def run_before_phase_backfill(conn: sqlite3.Connection):
    print("\n" + "=" * 70)
    print("STEP 2: Populate test_results 'before' phase")
    print("=" * 70)

    cur = conn.cursor()

    # Fetch all completed experiments with their repo name
    cur.execute("""
        SELECT e.id, r.name as repo_name, r.id as repo_id
        FROM experiments e
        JOIN files f ON e.file_id = f.id
        JOIN repositories r ON f.repository_id = r.id
        WHERE e.execution_phase_completed = 1
        ORDER BY e.id
    """)
    experiments = cur.fetchall()
    print(f"  Found {len(experiments)} completed experiments.\n")

    # Cache baseline summaries per repo
    baseline_cache = {}  # repo_name → (counts, coverage, all_passed)

    stats = {'inserted': 0, 'no_baseline': 0, 'parse_error': 0}

    # Delete all existing 'before' rows first (clean repopulation)
    if not DRY_RUN:
        cur.execute("DELETE FROM test_results WHERE phase='before'")
        deleted = cur.rowcount
        print(f"  Deleted {deleted} existing 'before' test_results rows.\n")

    for exp_id, repo_name, repo_id in experiments:
        # Load baseline from cache or disk
        if repo_name not in baseline_cache:
            summary_path = TESTS_OUTPUT_DIR / repo_name / "test_summary.txt"
            summary_text = load_summary(summary_path)

            if not summary_text or not has_test_data(summary_text):
                baseline_cache[repo_name] = None
                print(f"  [WARN] No parsable baseline for repo '{repo_name}' at {summary_path}")
            else:
                counts = parse_test_counts(summary_text)
                cov = parse_coverage(summary_text)
                failed = counts.get('tests_failed', 0) or 0
                suites_failed = counts.get('test_suites_failed', 0) or 0
                all_passed = (failed == 0) and (suites_failed == 0)
                baseline_cache[repo_name] = (counts, cov, all_passed)
                print(f"  [CACHED] '{repo_name}': suites_failed={suites_failed}, "
                      f"tests_failed={failed}, all_passed={all_passed}")

        baseline = baseline_cache.get(repo_name)
        if baseline is None:
            stats['no_baseline'] += 1
            continue

        counts, cov, all_passed = baseline

        if not DRY_RUN:
            cur.execute("""
                INSERT INTO test_results (
                    experiment_id, phase,
                    test_suites_passed, test_suites_failed, test_suites_total,
                    tests_passed, tests_failed, tests_total,
                    snapshots_total, execution_time_seconds,
                    coverage_statements, coverage_branches,
                    coverage_functions, coverage_lines,
                    all_tests_passed
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                exp_id, 'before',
                counts.get('test_suites_passed'), counts.get('test_suites_failed'),
                counts.get('test_suites_total'),
                counts.get('tests_passed'), counts.get('tests_failed'),
                counts.get('tests_total'),
                counts.get('snapshots_total'), counts.get('execution_time_seconds'),
                cov.get('statements'), cov.get('branches'),
                cov.get('functions'), cov.get('lines'),
                1 if all_passed else 0
            ))
        stats['inserted'] += 1

    if not DRY_RUN:
        conn.commit()
        print(f"\n  Committed {stats['inserted']} 'before' test_results rows.")

    print(f"\n  Inserted:    {stats['inserted']}")
    print(f"  No baseline: {stats['no_baseline']}")


# ─── STEP 3: Backfill tests_failed / tests_failed_type ───────────────────────

def run_tests_failed_backfill(conn: sqlite3.Connection):
    print("\n" + "=" * 70)
    print("STEP 3: Backfill tests_failed / tests_failed_type in experiments")
    print("=" * 70)

    cur = conn.cursor()

    # Get all completed experiments with:
    # - after.test_suites_failed
    # - baseline (from repository_baseline_test_results, NULL treated as 0)
    # - approach/model/smell for path resolution
    cur.execute("""
        SELECT
            e.id,
            e.study_smell_id,
            e.prompting_approach,
            e.ai_model_version,
            COALESCE(tr_after.test_suites_failed, 0)  AS after_suites_failed,
            COALESCE(rb.test_suites_failed, 0)         AS baseline_suites_failed
        FROM experiments e
        LEFT JOIN test_results tr_after
            ON tr_after.experiment_id = e.id AND tr_after.phase = 'after'
        LEFT JOIN files f ON e.file_id = f.id
        LEFT JOIN repositories r ON f.repository_id = r.id
        LEFT JOIN repository_baseline_test_results rb ON rb.repository_id = r.id
        WHERE e.execution_phase_completed = 1
        ORDER BY e.id
    """)
    experiments = cur.fetchall()
    print(f"  Processing {len(experiments)} experiments.\n")

    stats = {
        'suites_failed_increase': 0,
        'syntax_error': 0,
        'module_resolution_error': 0,
        'runtime_error': 0,
        'unknown': 0,
        'no_output_dir': 0,
        'ok_false': 0,
    }

    updates = []  # (tests_failed, tests_failed_type, experiment_id)

    for exp_id, smell_id, approach, model, after_suites_failed, baseline_suites_failed in experiments:
        output_dir = get_experiment_output_dir(approach, model, smell_id)
        summary_file = output_dir / "test_summary.txt"
        output_file = output_dir / "test_output.txt"

        # ── Rule A: suites_failed_increase ───────────────────────────────────
        if after_suites_failed > baseline_suites_failed:
            updates.append((1, 'suites_failed_increase', exp_id))
            stats['suites_failed_increase'] += 1
            continue

        # ── Check if test_summary.txt has parsable test data ─────────────────
        summary_text = load_summary(summary_file)
        if has_test_data(summary_text):
            # Tests ran and no new suite failures → OK
            updates.append((0, None, exp_id))
            stats['ok_false'] += 1
            continue

        # ── Rule B: no parsable data → classify from test_output.txt ─────────
        if not output_dir.exists():
            # No output directory at all → unknown
            updates.append((1, 'unknown', exp_id))
            stats['unknown'] += 1
            stats['no_output_dir'] += 1
            print(f"  [NO_DIR]  Exp {exp_id}: {output_dir}")
            continue

        output_text = load_summary(output_file) or ""
        error_type = classify_error(output_text)
        updates.append((1, error_type, exp_id))
        stats[error_type] += 1
        print(f"  [FAIL]    Exp {exp_id} (smell={smell_id}, {approach}/{model}): "
              f"type={error_type}")

    # Apply updates
    if not DRY_RUN:
        for tests_failed, tests_failed_type, exp_id in updates:
            cur.execute(
                "UPDATE experiments SET tests_failed=?, tests_failed_type=? WHERE id=?",
                (tests_failed, tests_failed_type, exp_id)
            )
        conn.commit()
        print(f"\n  Committed {len(updates)} updates to experiments.")

    print(f"\n  ── Results ───────────────────────────────────")
    print(f"  tests_failed=FALSE (ok):        {stats['ok_false']}")
    print(f"  suites_failed_increase:         {stats['suites_failed_increase']}")
    print(f"  syntax_error:                   {stats['syntax_error']}")
    print(f"  module_resolution_error:        {stats['module_resolution_error']}")
    print(f"  runtime_error:                  {stats['runtime_error']}")
    print(f"  unknown:                        {stats['unknown']}")
    print(f"  ── Total:                       {len(updates)}")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("Backfill: tests_failed + tests_failed_type + test_results before")
    print(f"Mode: {'DRY RUN' if DRY_RUN else 'LIVE'}")
    if STEP_FILTER:
        print(f"Running only Step {STEP_FILTER}")
    print("=" * 70)

    conn = sqlite3.connect(str(DB_PATH))

    try:
        if STEP_FILTER is None or STEP_FILTER == 1:
            run_migration(conn)
        if STEP_FILTER is None or STEP_FILTER == 2:
            run_before_phase_backfill(conn)
        if STEP_FILTER is None or STEP_FILTER == 3:
            run_tests_failed_backfill(conn)
    finally:
        conn.close()

    print("\n" + "=" * 70)
    print("Done.")
    print("=" * 70)


if __name__ == "__main__":
    main()
