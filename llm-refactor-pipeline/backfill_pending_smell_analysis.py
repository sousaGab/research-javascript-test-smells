"""
backfill_pending_smell_analysis.py
───────────────────────────────────
For experiments that already have a smell_detection/smells.csv on disk but
whose DB flags are still incomplete (added_smells IS NULL, or
execution_phase_completed = 0), run only the analysis step:

  1. Locate the after-phase smells.csv for each experiment
  2. Load the baseline smells.csv from smells_detected/{repo}/smells.csv
  3. Compare before vs after counts per smell category in the target file
  4. Update DB:
       • smell_removed           (bool)
       • introduced_new_smells   (bool)
       • added_smells            JSON dict {type: count_added}  or '{}'
       • execution_phase_completed = 1
       • refactor_phase_completed  = 1  (already set, but ensured)
  5. If the after-CSV exists but cannot be parsed → set tests_failed_type =
     'syntax_error' and leave added_smells = '{}'

Usage:
    python backfill_pending_smell_analysis.py [--dry-run] [--ids 2859 8365 ...]
"""

import sys
import json
import argparse
from collections import Counter
from pathlib import Path

import pandas as pd
import sqlite3

# ── paths ─────────────────────────────────────────────────────────────────────
PROJECT_ROOT   = Path(__file__).resolve().parent.parent   # research-javascript-test-smells/
DB_PATH        = PROJECT_ROOT / "research_data" / "research.db"
BASELINE_ROOT  = PROJECT_ROOT / "smells_detected"
DATASET_ROOT   = Path(__file__).resolve().parent / "dataset"

# ── model dir aliases (db value → filesystem folder name) ────────────────────
MODEL_DIR_MAP = {
    'Qwen 2.5 Coder 32B':   'qwen-2.5-coder-32b',
    'DeepSeek-V3.2':        'deepseek-v3.2',
    'CodeLlama 34B':        'codellama-34b-instruct',
    'DeepSeek Coder 33B':   'deepseek-coder-33b-instruct',
    'Llama 3.1 8B':         'llama-3.1-8b-instruct',
}

PROMPT_DIR_MAP = {
    'Zero-Shot':        'zero_shot',
    'zero-shot':        'zero_shot',
    'Few-Shot':         'few_shot',
    'few-shot':         'few_shot',
    'Chain-of-Thought': 'chain_of_thought',
    'cot':              'chain_of_thought',
}

# ── helpers ───────────────────────────────────────────────────────────────────

def model_to_dir(model: str) -> str:
    if model in MODEL_DIR_MAP:
        return MODEL_DIR_MAP[model]
    return model.lower().replace(' ', '-').replace('/', '-')

def prompt_to_dir(prompt: str) -> str:
    if prompt in PROMPT_DIR_MAP:
        return PROMPT_DIR_MAP[prompt]
    return prompt.lower().replace('-', '_').replace(' ', '_')


def find_after_csv(experiment_id: int, study_smell_id: int,
                   model: str, prompt: str) -> Path | None:
    """Return path to after-phase smells.csv, trying multiple naming conventions."""
    model_dir  = model_to_dir(model)
    prompt_dir = prompt_to_dir(prompt)

    candidates = []
    for mid in [model_dir, model_dir.replace('-instruct', '')]:
        # pipeline uses study_smell_id as folder name, not experiment id
        candidates.append(DATASET_ROOT / prompt_dir / mid / f"smell_{study_smell_id}" / "smell_detection" / "smells.csv")
        candidates.append(DATASET_ROOT / prompt_dir / mid / f"smell_{experiment_id}"  / "smell_detection" / "smells.csv")

    for p in candidates:
        if p.exists():
            return p
    return None


def load_smells(csv_path: Path) -> pd.DataFrame | None:
    """Load smells CSV; return None on failure."""
    try:
        df = pd.read_csv(csv_path, dtype=str, low_memory=False)
        df.columns = [c.strip().lower() for c in df.columns]
        return df
    except Exception as e:
        print(f"    ⚠ Could not read {csv_path}: {e}")
        return None


def count_smells_by_type(df: pd.DataFrame, file_path: str | None = None) -> Counter:
    """Count smells per type, optionally filtered to a specific file."""
    if df is None or df.empty:
        return Counter()
    # Normalise column names
    type_col  = next((c for c in df.columns if c in ('type', 'smell_type', 'smelltype')), None)
    file_col  = next((c for c in df.columns if c in ('file', 'filepath', 'file_path')), None)

    if type_col is None:
        return Counter()

    sub = df
    if file_path and file_col:
        # Match by filename suffix since paths may differ
        fname = Path(file_path).name
        sub = df[df[file_col].str.endswith(fname, na=False)]

    return Counter(sub[type_col].dropna().str.strip().tolist())


def compute_added_smells(before: Counter, after: Counter) -> dict:
    """Return {smell_type: count} for types where after > before."""
    added = {}
    all_types = set(before) | set(after)
    for t in all_types:
        delta = after.get(t, 0) - before.get(t, 0)
        if delta > 0:
            added[t] = delta
    return added


def smell_removed(before: Counter, after: Counter, target_type: str) -> bool:
    """True if the target smell count decreased to 0 or below baseline."""
    # normalise same way as pipeline
    def norm(s):
        return s.lower().replace(' ', '').replace('_', '').replace('-', '')
    tgt = norm(target_type)
    b = sum(v for k, v in before.items() if norm(k) == tgt)
    a = sum(v for k, v in after.items()  if norm(k) == tgt)
    return a < b


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dry-run', action='store_true', help='Show what would be updated, no writes')
    parser.add_argument('--ids', nargs='*', type=int, help='Restrict to specific experiment IDs')
    args = parser.parse_args()

    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    cur = db.cursor()

    # Fetch pending experiments
    where_ids = f"AND e.id IN ({','.join(str(i) for i in args.ids)})" if args.ids else ""
    cur.execute(f"""
        SELECT e.id, e.ai_model_version, e.prompting_approach,
               e.study_smell_id, e.baseline_smell_id,
               e.refactor_phase_completed, e.execution_phase_completed,
               e.added_smells,
               COALESCE(ss.smell_type, bsd.smell_type) AS smell_type,
               COALESCE(r.name, '?')                   AS repo,
               f.path                                  AS file_path
        FROM experiments e
        LEFT JOIN study_smells ss              ON e.study_smell_id = ss.id
        LEFT JOIN baseline_smell_detections bsd ON e.baseline_smell_id = bsd.id
        LEFT JOIN files f                      ON e.file_id = f.id
        LEFT JOIN repositories r               ON f.repository_id = r.id
        WHERE e.added_smells IS NULL
        {where_ids}
        ORDER BY e.id
    """)
    rows = cur.fetchall()

    if not rows:
        print("✅ No pending experiments found.")
        db.close()
        return

    print(f"Found {len(rows)} experiment(s) to process.\n")

    # Cache baseline CSVs per repo
    baseline_cache: dict[str, Counter] = {}
    ok = 0
    skipped = 0

    for row in rows:
        eid        = row['id']
        model      = row['ai_model_version']
        prompt     = row['prompting_approach']
        smell_id   = row['study_smell_id']
        smell_type = row['smell_type'] or 'Unknown'
        repo       = row['repo']
        file_path  = row['file_path'] or ''

        print(f"── Experiment {eid}  [{model} / {prompt}]  smell={smell_type}  repo={repo}")

        # ── 1. Locate after CSV ──────────────────────────────────────────────
        after_csv = find_after_csv(eid, smell_id, model, prompt)
        if after_csv is None:
            print("   ✗ No after-phase CSV found — skipping")
            skipped += 1
            continue
        print(f"   → after CSV : {after_csv.relative_to(PROJECT_ROOT)}")

        # ── 2. Load baseline ─────────────────────────────────────────────────
        if repo not in baseline_cache:
            bp = BASELINE_ROOT / repo / "smells.csv"
            if not bp.exists():
                print(f"   ✗ Baseline CSV not found: {bp} — skipping")
                skipped += 1
                continue
            df_base = load_smells(bp)
            if df_base is None:
                skipped += 1
                continue
            baseline_cache[repo] = count_smells_by_type(df_base, file_path)

        before = baseline_cache[repo]

        # ── 3. Load after CSV ────────────────────────────────────────────────
        df_after = load_smells(after_csv)
        if df_after is None:
            # CSV exists but unreadable → treat as syntax error
            print("   ⚠ Could not parse after CSV → marking syntax_error")
            if not args.dry_run:
                cur.execute("""
                    UPDATE experiments
                    SET added_smells='{}',
                        introduced_new_smells=0,
                        smell_removed=0,
                        tests_failed=1,
                        tests_failed_type='syntax_error',
                        refactor_phase_completed=1,
                        execution_phase_completed=1
                    WHERE id=?
                """, (eid,))
                db.commit()
            print("   ✓ Marked as syntax_error")
            ok += 1
            continue

        after = count_smells_by_type(df_after, file_path)

        # ── 4. Compute deltas ────────────────────────────────────────────────
        added       = compute_added_smells(before, after)
        removed     = smell_removed(before, after, smell_type)
        new_intros  = len(added) > 0
        added_json  = json.dumps(added) if added else '{}'

        print(f"   → smell_removed={removed}  new_intros={new_intros}  added={added}")

        if not args.dry_run:
            cur.execute("""
                UPDATE experiments
                SET smell_removed=?,
                    introduced_new_smells=?,
                    added_smells=?,
                    refactor_phase_completed=1,
                    execution_phase_completed=1
                WHERE id=?
            """, (int(removed), int(new_intros), added_json, eid))
            db.commit()
            print("   ✓ DB updated")
        else:
            print("   [dry-run] would update DB")

        ok += 1

    print(f"\n{'='*60}")
    print(f"Done.  Updated: {ok}  Skipped: {skipped}  Total: {len(rows)}")
    if args.dry_run:
        print("(dry-run — no changes written)")
    db.close()


if __name__ == '__main__':
    main()
