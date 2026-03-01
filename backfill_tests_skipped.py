"""
Backfill tests_skipped column in test_results for all experiments.

- BEFORE rows: parsed from tests_output/{repo}/test_summary.txt (baseline)
- AFTER  rows: parsed from dataset/{strategy}/{model}/smell_{id}/test_summary.txt
"""
import re
import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH     = "research_data/research.db"
DATASET_DIR = Path("llm-refactor-pipeline/dataset")
BASELINE_DIR = Path("tests_output")

STRATEGY_MAP = {
    "Zero-Shot":        "zero_shot",
    "Few-Shot":         "few_shot",
    "Chain-of-Thought": "chain_of_thought",
}

MODEL_DIR_MAP = {
    "Claude Sonnet 4.6":      "claude-sonnet-4.6",
    "CodeLlama 34B":          "codellama-34b-instruct",
    "CodeLlama 70B":          "codellama-70b",
    "DeepSeek-V3.2":          "deepseek-v3.2",
    "GPT-5.1":                "gpt-5.1",
    "GPT-5.2":                "gpt-5.2",
    "Gemini 2.5 Pro":         "gemini-2.5-pro",
    "Qwen 2.5 Coder 32B":     "qwen-2.5-coder-32b",
    "Llama 3.3 70B Instruct": "llama-3.3-70b-instruct",
}


def parse_skipped(summary_text: str) -> int | None:
    """Extract tests_skipped from a test_summary.txt."""
    m = re.search(r'Tests:\s*([^\n]+)', summary_text)
    if not m:
        return None
    line = m.group(1)
    sk = re.search(r'(\d+)\s+skipped', line)
    return int(sk.group(1)) if sk else 0  # 0 = present but no skipped


def find_after_summary(strategy: str, model_version: str, smell_id: int) -> Path | None:
    s = STRATEGY_MAP.get(strategy)
    d = MODEL_DIR_MAP.get(model_version)
    if not s or not d:
        return None
    p = DATASET_DIR / s / d / f"smell_{smell_id}" / "test_summary.txt"
    return p if p.exists() else None


def main():
    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()

    # ── BEFORE rows: one value per repo, from baseline ───────────────────────
    print("=== STEP 1: Backfill tests_skipped for BEFORE rows ===")
    cur.execute("""
        SELECT DISTINCT rep.id, rep.name
        FROM test_results tr
        JOIN experiments e  ON tr.experiment_id = e.id
        JOIN study_smells ss ON e.study_smell_id = ss.id
        JOIN files f        ON ss.file_id = f.id
        JOIN repositories rep ON f.repository_id = rep.id
        WHERE tr.phase = 'before'
        ORDER BY rep.name
    """)
    repos = cur.fetchall()
    before_updated = before_skipped = before_missing = 0

    for repo_id, repo_name in repos:
        summary_path = BASELINE_DIR / repo_name / "test_summary.txt"
        if not summary_path.exists():
            print(f"  [SKIP] {repo_name}: baseline summary not found")
            before_missing += 1
            continue

        skipped = parse_skipped(summary_path.read_text(encoding='utf-8', errors='replace'))
        if skipped is None:
            print(f"  [WARN] {repo_name}: could not parse tests line")
            before_missing += 1
            continue

        cur.execute("""
            UPDATE test_results
            SET tests_skipped = ?
            WHERE phase = 'before'
              AND experiment_id IN (
                SELECT e.id FROM experiments e
                JOIN study_smells ss ON e.study_smell_id = ss.id
                JOIN files f ON ss.file_id = f.id
                WHERE f.repository_id = ?
              )
        """, (skipped, repo_id))
        n = cur.rowcount
        before_updated += n
        if skipped > 0:
            before_skipped += 1
        print(f"  {repo_name}: {n} before rows set tests_skipped={skipped}")

    conn.commit()
    print(f"  Total before updated: {before_updated}, repos with skipped>0: {before_skipped}, missing: {before_missing}")

    # ── AFTER rows: per-experiment, from their own test_summary.txt ──────────
    print()
    print("=== STEP 2: Backfill tests_skipped for AFTER rows ===")
    cur.execute("""
        SELECT tr.id, e.prompting_approach, e.ai_model_version, ss.id
        FROM test_results tr
        JOIN experiments e  ON tr.experiment_id = e.id
        JOIN study_smells ss ON e.study_smell_id = ss.id
        WHERE tr.phase = 'after'
        ORDER BY tr.id
    """)
    after_rows = cur.fetchall()
    print(f"  Processing {len(after_rows)} after rows...")

    after_updated = after_no_summary = after_nonzero = 0
    for tr_id, strategy, model_ver, smell_id in after_rows:
        summary_path = find_after_summary(strategy, model_ver, smell_id)
        if not summary_path:
            after_no_summary += 1
            continue

        skipped = parse_skipped(summary_path.read_text(encoding='utf-8', errors='replace'))
        if skipped is None:
            after_no_summary += 1
            continue

        cur.execute("UPDATE test_results SET tests_skipped=? WHERE id=?", (skipped, tr_id))
        after_updated += 1
        if skipped > 0:
            after_nonzero += 1

    conn.commit()
    print(f"  Updated: {after_updated}, no summary: {after_no_summary}, with skipped>0: {after_nonzero}")

    # ── Verification ──────────────────────────────────────────────────────────
    print()
    print("=== Verification ===")
    cur.execute("""
        SELECT phase,
            COUNT(*) as total,
            SUM(CASE WHEN tests_skipped IS NULL THEN 1 ELSE 0 END) as null_count,
            SUM(CASE WHEN tests_skipped > 0 THEN 1 ELSE 0 END) as nonzero_count,
            MAX(tests_skipped) as max_skipped
        FROM test_results
        GROUP BY phase ORDER BY phase
    """)
    for r in cur.fetchall():
        print(f"  phase={r[0]}: total={r[1]}, null={r[2]}, nonzero={r[3]}, max={r[4]}")

    conn.close()
    print("Done.")


if __name__ == "__main__":
    main()
