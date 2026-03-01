#!/usr/bin/env python3
"""
Reprocess Nock Experiments — Fix test_summary.txt and test_results in DB.

Problem: nock uses a custom test runner (node run-all-tests.js) that omits the
"Snapshots:" line from Jest output. The original extract_test_results() regex
required that line, causing all nock test_summary.txt files to be written as:

    (Coverage information not available)
    (Test results not available)

Fix applied:
- extract_test_results() regex now supports Jest output WITHOUT "Snapshots:" line
- This script re-processes all nock experiment output files ON DISK (no tests re-run)
- Rewrites test_summary.txt with correctly extracted content
- Updates test_results (after phase) in the database

Usage:
    python3 reprocess_nock_experiments.py [--dry-run]
"""

import re
import sys
import sqlite3
from pathlib import Path

# ─── Configuration ────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
DB_PATH = BASE_DIR / "research_data" / "research.db"
DATASET_DIR = Path(__file__).parent / "dataset"

DRY_RUN = "--dry-run" in sys.argv

# Model name → directory name overrides (DB value → filesystem dirname)
MODEL_DIR_ALIASES = {
    "codellama-34b": "codellama-34b-instruct",
}


# ─── Regex helpers ────────────────────────────────────────────────────────────

def extract_coverage_summary(output: str):
    """Extract Jest coverage summary block."""
    m = re.search(
        r'(={10,}[^=\n]*Coverage summary[^=\n]*={10,}\n(?:.*\n){4,6}={10,})',
        output
    )
    if m:
        return m.group(1).strip()
    # Fallback: Statements/Branches/Functions/Lines block
    m = re.search(
        r'(Statements\s*:.*?\nBranches\s*:.*?\nFunctions\s*:.*?\nLines\s*:.*?)(?:\n|$)',
        output, re.DOTALL
    )
    return m.group(1).strip() if m else None


def extract_test_results(output: str):
    """
    Extract test results summary — supports Jest with AND without 'Snapshots:' line.
    Returns the LAST match (final results, not intermediate).
    """
    patterns = [
        r'(Test Suites:.*\nTests:.*\nSnapshots:.*\nTime:.*)',   # Standard Jest
        r'(Test Suites:.*\nTests:.*\nTime:.*)',                  # Jest / custom runner (no Snapshots)
        r'(Tests:.*?passing.*)',                                  # Mocha
        r'(\d+\s+passing.*)',
    ]
    for pattern in patterns:
        matches = re.findall(pattern, output, re.IGNORECASE)
        if matches:
            return matches[-1].strip()
    return None


def parse_test_counts(text: str):
    """Parse 'Test Suites:' and 'Tests:' lines into a dict."""
    result = {}

    # Test Suites: X failed, Y passed, Z total
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

    # Tests: X skipped, Y passed, Z total
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

    # Snapshots
    m = re.search(r'Snapshots:\s*(.*)', text, re.IGNORECASE)
    if m:
        for part in m.group(1).split(','):
            part = part.strip()
            nm = re.match(r'(\d+)\s+(\w+)', part)
            if nm:
                n, label = int(nm.group(1)), nm.group(2).lower()
                if 'total' in label:
                    result['snapshots_total'] = n

    # Time
    m = re.search(r'Time:\s*([\d.]+)\s*s', text, re.IGNORECASE)
    if m:
        result['execution_time_seconds'] = float(m.group(1))

    return result


def parse_coverage(text: str):
    """Parse coverage percentages from summary block."""
    result = {}
    mapping = [
        ('statements', r'Statements\s*:\s*([\d.]+)%'),
        ('branches',   r'Branches\s*:\s*([\d.]+)%'),
        ('functions',  r'Functions\s*:\s*([\d.]+)%'),
        ('lines',      r'Lines\s*:\s*([\d.]+)%'),
    ]
    for key, pattern in mapping:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            result[key] = float(m.group(1))
    return result


# ─── Path resolution ──────────────────────────────────────────────────────────

def model_to_dir(model_name: str) -> str:
    """Convert DB ai_model_version to filesystem directory name."""
    name = model_name.lower().replace(' ', '-').replace('(', '').replace(')', '')
    return MODEL_DIR_ALIASES.get(name, name)


def approach_to_dir(approach: str) -> str:
    """Convert DB prompting_approach to filesystem directory name."""
    return approach.lower().replace('-', '_').replace(' ', '_')


def get_experiment_output_dir(approach: str, model: str, smell_id: int) -> Path:
    return DATASET_DIR / approach_to_dir(approach) / model_to_dir(model) / f"smell_{smell_id}"


# ─── Summary file rebuilder ───────────────────────────────────────────────────

def rebuild_summary(output_dir: Path) -> tuple[str | None, str | None]:
    """
    Read test_output.txt and re-extract coverage + test results.
    Returns (coverage_text, test_results_text) or (None, None) on failure.
    """
    output_file = output_dir / "test_output.txt"
    if not output_file.exists():
        return None, None

    full_output = output_file.read_text(encoding='utf-8', errors='replace')
    cov = extract_coverage_summary(full_output)
    tr = extract_test_results(full_output)
    return cov, tr


# ─── DB operations ────────────────────────────────────────────────────────────

def upsert_test_results_after(conn: sqlite3.Connection, experiment_id: int,
                               counts: dict, coverage: dict, all_passed: bool):
    """Delete existing 'after' test_results for this experiment, then insert fresh."""
    cur = conn.cursor()
    cur.execute("DELETE FROM test_results WHERE experiment_id=? AND phase='after'", (experiment_id,))
    cur.execute("""
        INSERT INTO test_results (
            experiment_id, phase,
            test_suites_passed, test_suites_failed, test_suites_total,
            tests_passed, tests_failed, tests_total,
            snapshots_total, execution_time_seconds,
            coverage_statements, coverage_branches, coverage_functions, coverage_lines,
            all_tests_passed
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        experiment_id, 'after',
        counts.get('test_suites_passed'), counts.get('test_suites_failed'),
        counts.get('test_suites_total'),
        counts.get('tests_passed'), counts.get('tests_failed'),
        counts.get('tests_total'),
        counts.get('snapshots_total'), counts.get('execution_time_seconds'),
        coverage.get('statements'), coverage.get('branches'),
        coverage.get('functions'), coverage.get('lines'),
        1 if all_passed else 0
    ))


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("Reprocess Nock Experiments")
    print(f"Mode: {'DRY RUN (no changes)' if DRY_RUN else 'LIVE (writes to DB and disk)'}")
    print("=" * 70)

    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    # Fetch all completed nock experiments
    cur.execute("""
        SELECT e.id, e.study_smell_id, e.prompting_approach, e.ai_model_version
        FROM experiments e
        JOIN study_smells ss ON e.study_smell_id = ss.id
        JOIN files f ON e.file_id = f.id
        JOIN repositories r ON f.repository_id = r.id
        WHERE r.name = 'nock' AND e.execution_phase_completed = 1
        ORDER BY e.id
    """)
    experiments = cur.fetchall()
    print(f"Found {len(experiments)} nock experiments to reprocess.\n")

    stats = {'fixed': 0, 'already_ok': 0, 'no_output_file': 0, 'no_test_results': 0, 'error': 0}

    for exp_id, smell_id, approach, model in experiments:
        output_dir = get_experiment_output_dir(approach, model, smell_id)
        summary_file = output_dir / "test_summary.txt"

        # Check if already correct (has "Test Suites:" line)
        if summary_file.exists():
            existing = summary_file.read_text(encoding='utf-8', errors='replace')
            if 'Test Suites:' in existing and 'Test results not available' not in existing:
                stats['already_ok'] += 1
                continue

        cov_text, tr_text = rebuild_summary(output_dir)

        if cov_text is None and tr_text is None:
            print(f"  [MISSING] Exp {exp_id}: no test_output.txt in {output_dir}")
            stats['no_output_file'] += 1
            continue

        if tr_text is None:
            print(f"  [NO_TR]   Exp {exp_id}: could not extract test results from {output_dir}")
            stats['no_test_results'] += 1
            continue

        # Build new summary content
        cov_block = cov_text or "(Coverage information not available)"
        new_summary = cov_block + '\n\n' + tr_text + '\n'

        counted = parse_test_counts(tr_text)
        coverage = parse_coverage(cov_text) if cov_text else {}
        failed_count = counted.get('tests_failed', 0) or 0
        suites_failed = counted.get('test_suites_failed', 0) or 0
        all_passed = (failed_count == 0) and (suites_failed == 0)

        print(f"  [FIX]     Exp {exp_id} (smell={smell_id}, {approach}/{model}): "
              f"suites_failed={suites_failed}, tests_failed={failed_count}, all_passed={all_passed}")

        if not DRY_RUN:
            # Write corrected summary file
            summary_file.write_text(new_summary, encoding='utf-8')
            # Update DB test_results
            upsert_test_results_after(conn, exp_id, counted, coverage, all_passed)

        stats['fixed'] += 1

    if not DRY_RUN:
        conn.commit()
        print("\nCommitted all changes to database.")
    conn.close()

    print("\n" + "=" * 70)
    print("Summary:")
    print(f"  Fixed:                {stats['fixed']}")
    print(f"  Already correct:      {stats['already_ok']}")
    print(f"  No test_output.txt:   {stats['no_output_file']}")
    print(f"  No test results:      {stats['no_test_results']}")
    print(f"  Errors:               {stats['error']}")
    print("=" * 70)


if __name__ == "__main__":
    main()
