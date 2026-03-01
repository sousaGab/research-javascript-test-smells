"""
Reparse test results for all 360 winston after-phase rows,
fixing tests_passed/tests_failed/tests_total that were NULL
due to the non-standard 'todo' format in Jest output.

Also verifies and corrects before rows from the baseline.
"""
import re
import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = "research_data/research.db"
DATASET_DIR = Path("llm-refactor-pipeline/dataset")
BASELINE_SUMMARY = Path("tests_output/winston/test_summary.txt")

STRATEGY_MAP = {
    "Zero-Shot":         "zero_shot",
    "Few-Shot":          "few_shot",
    "Chain-of-Thought":  "chain_of_thought",
}

MODEL_DIR_MAP = {
    "Claude Sonnet 4.6":      "claude-sonnet-4.6",
    "CodeLlama 34B":          "codellama-34b-instruct",
    "DeepSeek-V3.2":          "deepseek-v3.2",
    "GPT-5.1":                "gpt-5.1",
    "GPT-5.2":                "gpt-5.2",
    "Gemini 2.5 Pro":         "gemini-2.5-pro",
    "Qwen 2.5 Coder 32B":     "qwen-2.5-coder-32b",
    "Llama 3.3 70B Instruct": "llama-3.3-70b-instruct",
    "CodeLlama 70B":          "codellama-70b",
}


def parse_test_counts(summary_text: str):
    """
    Flexible parser that handles:
      - Standard:  Tests: 7 skipped, 455 passed, 462 total
      - Winston:   Tests: 1 failed, 3 todo, 231 passed, 235 total
    Returns dict or None.
    """
    try:
        counts = {}
        # Test Suites
        sm = re.search(
            r'Test Suites:\s*(?:(\d+)\s+failed,\s*)?(?:(\d+)\s+passed,\s*)?(\d+)\s+total',
            summary_text)
        if sm:
            counts['test_suites_failed'] = int(sm.group(1) or 0)
            counts['test_suites_passed'] = int(sm.group(2) or 0)
            counts['test_suites_total']  = int(sm.group(3))

        # Tests — per-field extraction, order-independent
        tl = re.search(r'Tests:\s*([^\n]+)', summary_text)
        if tl:
            line = tl.group(1)
            def ex(field):
                m = re.search(r'(\d+)\s+' + field, line)
                return int(m.group(1)) if m else 0
            counts['tests_failed']  = ex('failed')
            counts['tests_passed']  = ex('passed')
            counts['tests_skipped'] = ex('skipped')
            total_m = re.search(r'(\d+)\s+total', line)
            if total_m:
                counts['tests_total'] = int(total_m.group(1))

        return counts if counts else None
    except Exception:
        return None


def parse_coverage(summary_text: str):
    cov = {}
    patterns = [
        ('statements', r'Statements\s*:\s*([\d.]+)%'),
        ('branches',   r'Branches\s*:\s*([\d.]+)%'),
        ('functions',  r'Functions\s*:\s*([\d.]+)%'),
        ('lines',      r'Lines\s*:\s*([\d.]+)%'),
    ]
    for key, pat in patterns:
        m = re.search(pat, summary_text)
        if m:
            cov[key] = float(m.group(1))
    return cov if cov else None


def find_summary(strategy: str, model_version: str, smell_id: int) -> Path | None:
    strategy_dir = STRATEGY_MAP.get(strategy)
    model_dir    = MODEL_DIR_MAP.get(model_version)
    if not strategy_dir or not model_dir:
        return None
    p = DATASET_DIR / strategy_dir / model_dir / f"smell_{smell_id}" / "test_summary.txt"
    return p if p.exists() else None


def main():
    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()
    now  = datetime.now().isoformat()

    # ── STEP 1: Reparse all 360 winston AFTER rows ────────────────────────────
    print("STEP 1: Reparse after rows for all winston experiments")
    cur.execute("""
        SELECT e.id, e.prompting_approach, e.ai_model_version, ss.id as smell_id,
               tr.id as tr_id, tr.all_tests_passed
        FROM experiments e
        JOIN study_smells ss ON e.study_smell_id=ss.id
        JOIN files f ON ss.file_id=f.id
        JOIN repositories rep ON f.repository_id=rep.id
        JOIN test_results tr ON tr.experiment_id=e.id AND tr.phase='after'
        WHERE rep.name='winston'
        ORDER BY e.id
    """)
    rows = cur.fetchall()
    print(f"  Found {len(rows)} after rows to reparse")

    updated = 0
    skipped = 0
    for exp_id, strategy, model_ver, smell_id, tr_id, all_passed in rows:
        summary_path = find_summary(strategy, model_ver, smell_id)
        if not summary_path:
            print(f"  [SKIP] exp={exp_id}: summary not found "
                  f"({strategy}/{model_ver}/smell_{smell_id})")
            skipped += 1
            continue

        text = summary_path.read_text(encoding='utf-8', errors='replace')
        counts = parse_test_counts(text)
        cov    = parse_coverage(text)

        if not counts:
            print(f"  [WARN] exp={exp_id}: parse failed for {summary_path}")
            skipped += 1
            continue

        cur.execute("""
            UPDATE test_results SET
                test_suites_passed=?, test_suites_failed=?, test_suites_total=?,
                tests_passed=?, tests_failed=?, tests_total=?,
                coverage_statements=?, coverage_branches=?,
                coverage_functions=?, coverage_lines=?,
                executed_at=?
            WHERE id=?
        """, (
            counts.get('test_suites_passed'),
            counts.get('test_suites_failed'),
            counts.get('test_suites_total'),
            counts.get('tests_passed'),
            counts.get('tests_failed'),
            counts.get('tests_total'),
            cov.get('statements') if cov else None,
            cov.get('branches')   if cov else None,
            cov.get('functions')  if cov else None,
            cov.get('lines')      if cov else None,
            now,
            tr_id,
        ))
        updated += 1

    conn.commit()
    print(f"  Updated: {updated}, Skipped: {skipped}")

    # ── STEP 2: Verify/fix all winston BEFORE rows from the baseline ──────────
    print()
    print("STEP 2: Verify/fix before rows for all winston experiments")
    baseline_text = BASELINE_SUMMARY.read_text(encoding='utf-8')
    b_counts = parse_test_counts(baseline_text)
    b_cov    = parse_coverage(baseline_text)
    print(f"  Baseline counts: {b_counts}")
    print(f"  Baseline coverage: {b_cov}")

    cur.execute("""
        UPDATE test_results SET
            test_suites_passed=?, test_suites_failed=?, test_suites_total=?,
            tests_passed=?, tests_failed=?, tests_total=?,
            coverage_statements=?, coverage_branches=?,
            coverage_functions=?, coverage_lines=?,
            executed_at=?
        WHERE phase='before' AND experiment_id IN (
            SELECT e.id FROM experiments e
            JOIN study_smells ss ON e.study_smell_id=ss.id
            JOIN files f ON ss.file_id=f.id
            JOIN repositories rep ON f.repository_id=rep.id
            WHERE rep.name='winston'
        )
    """, (
        b_counts.get('test_suites_passed'),
        b_counts.get('test_suites_failed'),
        b_counts.get('test_suites_total'),
        b_counts.get('tests_passed'),
        b_counts.get('tests_failed'),
        b_counts.get('tests_total'),
        b_cov.get('statements') if b_cov else None,
        b_cov.get('branches')   if b_cov else None,
        b_cov.get('functions')  if b_cov else None,
        b_cov.get('lines')      if b_cov else None,
        now,
    ))
    print(f"  Updated {cur.rowcount} before rows")
    conn.commit()

    # ── STEP 3: Verify final state ────────────────────────────────────────────
    print()
    print("STEP 3: Verification")
    cur.execute("""
        SELECT tr.phase,
               SUM(CASE WHEN tr.tests_passed IS NULL THEN 1 ELSE 0 END) as null_passed,
               MIN(tr.tests_passed), MAX(tr.tests_passed),
               MIN(tr.tests_failed), MAX(tr.tests_failed),
               COUNT(*) as total
        FROM test_results tr
        JOIN experiments e ON tr.experiment_id=e.id
        JOIN study_smells ss ON e.study_smell_id=ss.id
        JOIN files f ON ss.file_id=f.id
        JOIN repositories rep ON f.repository_id=rep.id
        WHERE rep.name='winston'
        GROUP BY tr.phase
    """)
    for r in cur.fetchall():
        print(f"  phase={r[0]}: null_passed={r[1]}, passed_range=[{r[2]},{r[3]}], "
              f"failed_range=[{r[4]},{r[5]}], total={r[6]}")

    conn.close()
    print()
    print("Done.")


if __name__ == "__main__":
    main()
