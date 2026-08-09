"""
Backfill added_smells column in experiments table.

For each completed experiment, compare per-category smell counts between:
  - baseline: smells_detected/{repo_name}/smells.csv
  - after:    dataset/{strategy}/{model}/smell_{id}/smell_detection/smells.csv

If count_after > count_before for a smell category, record it.
Saves a JSON string like {"AssertionRoulette": 2, "EagerTest": 1} to experiments.added_smells
(raw, unfiltered — all smell types that increased are stored).

introduced_new_smells is set to 1 ONLY when at least one smell from ALLOWED_ADDED_SMELLS
was added (i.e. the allowlist controls the boolean flag, not the raw storage).
"""

import sqlite3
import json
import re
from pathlib import Path
from collections import Counter

import pandas as pd

# ── Paths ──────────────────────────────────────────────────────────────────────
PIPELINE_DIR = Path(__file__).parent
PROJECT_ROOT = PIPELINE_DIR.parent          # research-javascript-test-smells/
DB_PATH      = PROJECT_ROOT / "research_data" / "research.db"
DATASET_DIR  = PIPELINE_DIR / "dataset"
BASELINE_DIR = PROJECT_ROOT / "smells_detected"

# ── Detector name aliases → canonical names ─────────────────────────────────────
# Different detector versions report the same smell under different naming
# conventions (e.g. camelCase vs space-separated).  Normalise before allowlist check.
SMELL_ALIASES: dict = {
    "ConditionalTestLogic": "Conditional Test Logic",
    "OvercommentedTest":    "Overcommented Test",
    "SubOptimalAssert":     "Suboptimal Assert",
    "AnonymousTest":        "Anonymous Test",
    "VerboseStatement":     "Verbose Statement",
}

# ── Allowlist: introduced_new_smells is only True for these smell types ─────────
# Any smell outside this set is stored in added_smells for audit purposes but
# does NOT set the introduced_new_smells flag.
# Matching is case-insensitive and space-insensitive.
ALLOWED_ADDED_SMELLS: set = {
    "Conditional Test Logic",
    "Overcommented Test",
    "Suboptimal Assert",
    "Anonymous Test",
    "Verbose Statement",
    "Duplicate Assert",
    "Exception Handling",
    "Magic Number",
    "Sleepy Test",
    "Unknown Test",
}

# Pre-compute normalised allowlist key set (lowercase, no spaces)
_ALLOWED_KEYS: set = {s.lower().replace(" ", "") for s in ALLOWED_ADDED_SMELLS}


def _is_allowed(smell_type: str) -> bool:
    """Return True if smell_type (any casing/spacing) is in the allowlist."""
    return smell_type.lower().replace(" ", "") in _ALLOWED_KEYS


# ── Strategy name normalisation ────────────────────────────────────────────────
STRATEGY_MAP = {
    "zero-shot":       "zero_shot",
    "zero_shot":       "zero_shot",
    "few-shot":        "few_shot",
    "few_shot":        "few_shot",
    "chain-of-thought": "chain_of_thought",
    "chain_of_thought": "chain_of_thought",
    "cot":             "chain_of_thought",
}

def normalise_strategy(prompting_approach: str) -> str:
    key = prompting_approach.lower().replace(" ", "-")
    return STRATEGY_MAP.get(key, key.replace("-", "_"))


def normalise_model(ai_model_version: str) -> str:
    """Same logic as ExecuteExperimentModule._get_model_name."""
    name = ai_model_version.lower()
    name = name.replace(" ", "-")
    name = name.replace("(", "").replace(")", "")
    name = name.replace("/", "-")
    return name


_model_dir_cache: dict[str, str] = {}

def resolve_model_dir(strategy_dir: str, model_name: str) -> str | None:
    """
    Return the actual directory name on disk for a model.
    1. Try exact match of normalise_model output.
    2. If not found, find the first dir under strategy_dir that *starts with*
       the normalised name (handles e.g. 'codellama-34b' → 'codellama-34b-instruct').
    Returns None when no candidate found.
    """
    cache_key = f"{strategy_dir}/{model_name}"
    if cache_key in _model_dir_cache:
        return _model_dir_cache[cache_key]

    base_dir = DATASET_DIR / strategy_dir
    normalised = normalise_model(model_name)

    # 1. Exact match
    if (base_dir / normalised).is_dir():
        _model_dir_cache[cache_key] = normalised
        return normalised

    # 2. Starts-with fuzzy match (e.g. 'codellama-34b' → 'codellama-34b-instruct')
    if base_dir.is_dir():
        candidates = sorted(
            d.name for d in base_dir.iterdir()
            if d.is_dir() and d.name.startswith(normalised)
        )
        if candidates:
            best = candidates[0]  # deterministic: shortest / first alphabetically
            _model_dir_cache[cache_key] = best
            return best

    _model_dir_cache[cache_key] = None  # type: ignore[assignment]
    return None


# ── CSV helpers ────────────────────────────────────────────────────────────────
def load_counts(csv_path: Path) -> Counter:
    """Return Counter of smell_type → count from a smells.csv file."""
    if not csv_path.exists():
        return None
    try:
        df = pd.read_csv(csv_path)
        if "type" not in df.columns:
            return Counter()
        return Counter(df["type"].dropna().tolist())
    except Exception as e:
        print(f"    ⚠ Could not read {csv_path}: {e}")
        return None


# ── Main backfill ──────────────────────────────────────────────────────────────
def backfill():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    c = db.cursor()

    # Add column if missing
    c.execute("PRAGMA table_info(experiments)")
    cols = [r["name"] for r in c.fetchall()]
    if "added_smells" not in cols:
        c.execute("ALTER TABLE experiments ADD COLUMN added_smells TEXT")
        db.commit()
        print("✓ Added 'added_smells' column to experiments table")
    else:
        print("'added_smells' column already exists – will overwrite ALL rows")

    # Fetch ALL completed experiments (reprocess even if already filled,
    # so introduced_new_smells is recalculated with the current allowlist)
    c.execute("""
        SELECT
            e.id          AS exp_id,
            e.study_smell_id,
            e.prompting_approach,
            e.ai_model_version,
            r.name        AS repo_name
        FROM experiments e
        JOIN study_smells ss ON e.study_smell_id = ss.id
        JOIN files f ON ss.file_id = f.id
        JOIN repositories r ON f.repository_id = r.id
        WHERE e.execution_phase_completed = 1
        ORDER BY e.id
    """)
    rows = c.fetchall()
    print(f"Processing {len(rows)} completed experiments…\n")

    ok = skipped_no_after = skipped_no_baseline = updated = 0
    baseline_cache: dict[str, Counter | None] = {}

    for row in rows:
        exp_id       = row["exp_id"]
        smell_id     = row["study_smell_id"]
        repo_name    = row["repo_name"]
        strategy_dir = normalise_strategy(row["prompting_approach"])
        model_dir_name = resolve_model_dir(strategy_dir, row["ai_model_version"])

        # ── Locate CSVs ──
        if model_dir_name is None:
            skipped_no_after += 1
            continue
        after_csv = (
            DATASET_DIR / strategy_dir / model_dir_name
            / f"smell_{smell_id}" / "smell_detection" / "smells.csv"
        )
        if not after_csv.exists():
            skipped_no_after += 1
            continue

        if repo_name not in baseline_cache:
            baseline_cache[repo_name] = load_counts(
                BASELINE_DIR / repo_name / "smells.csv"
            )
        baseline_counts = baseline_cache[repo_name]

        if baseline_counts is None:
            skipped_no_baseline += 1
            continue

        after_counts = load_counts(after_csv)
        if after_counts is None:
            skipped_no_after += 1
            continue

        # ── Compute additions ──
        # Normalise detector names to canonical names, then store ALL increases
        # (raw, for audit).  introduced_new_smells flag uses only ALLOWED smells
        # matched case-insensitively and space-insensitively via _is_allowed().
        added: dict[str, int] = {}
        for smell_type, after_n in after_counts.items():
            canonical = SMELL_ALIASES.get(smell_type, smell_type)
            before_n  = baseline_counts.get(smell_type, 0)
            delta     = after_n - before_n
            if delta > 0:
                added[canonical] = added.get(canonical, 0) + delta

        added_json = json.dumps(added)   # '{}' when nothing added – distinguishable from NULL
        has_new    = any(_is_allowed(s) for s in added)

        c.execute(
            "UPDATE experiments SET added_smells=?, introduced_new_smells=? WHERE id=?",
            (added_json, 1 if has_new else 0, exp_id),
        )
        updated += 1
        ok += 1

        if updated % 500 == 0:
            db.commit()
            print(f"  … {updated} / {len(rows)} committed")

    db.commit()

    print(f"""
Done!
  ✓ Updated              : {ok}
  ⚠ Skipped (no after)  : {skipped_no_after}
  ⚠ Skipped (no baseline): {skipped_no_baseline}
""")

    # ── Quick sanity check ──
    c.execute("SELECT COUNT(*) FROM experiments WHERE added_smells IS NOT NULL")
    processed = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM experiments WHERE added_smells IS NOT NULL AND added_smells != '{}'")
    with_adds = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM experiments WHERE added_smells = '{}'")
    no_adds   = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM experiments WHERE introduced_new_smells=1")
    flagged   = c.fetchone()[0]

    print(f"Sanity check:")
    print(f"  experiments processed (added_smells set)  : {processed}")
    print(f"    → with ≥1 smell added                   : {with_adds}")
    print(f"    → no smells added                       : {no_adds}")
    print(f"  experiments with introduced_new_smells=1  : {flagged}")
    print(f"  experiments pending (no after CSV / NULL) : {ok + skipped_no_after + skipped_no_baseline - updated}")

    # Show a few examples
    c.execute("""
        SELECT id, added_smells, introduced_new_smells
        FROM experiments
        WHERE added_smells IS NOT NULL AND added_smells != '{}'
        LIMIT 5
    """)
    print("\nSample rows:")
    for r in c.fetchall():
        print(f"  exp {r[0]}: {r[1]}  (flag={r[2]})")

    db.close()


if __name__ == "__main__":
    backfill()
