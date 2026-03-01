#!/usr/bin/env python3
"""
Re-run tests for experiments that failed due to environment issues.

Covers:
  - html-webpack-plugin (36 experiments): Yarn Berry PnP cache was missing
    (snap/code/220 → snap/code/226 upgrade). Now fixed, re-run required.
  - bootstrap-vue-dev (1 experiment, #4339): Original run timed out at 300s.
    Re-run with 600s timeout.
  - falcor (2 experiments, #2859, #2860): test_output.txt exists and is valid
    but test_results (after) rows are missing. Re-parse only, no test execution.
  - winston (360 experiments): No test re-run needed. Only fix
    experiments.tests_failed classification that was wrong because the
    baseline (test_suites_failed=1) was NULL in the DB during the original
    backfill.

Usage:
  python3 rerun_failed_experiments.py [--dry-run] [--repo REPO] [--exp-id ID]
  python3 rerun_failed_experiments.py                # run all
  python3 rerun_failed_experiments.py --dry-run      # preview only
  python3 rerun_failed_experiments.py --repo html-webpack-plugin
  python3 rerun_failed_experiments.py --repo falcor  # re-parse only
  python3 rerun_failed_experiments.py --fix-winston  # fix classification only
"""

import sys
import os
import re
import sqlite3
import subprocess
import shutil
from datetime import datetime
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.parent
DB_PATH      = PROJECT_ROOT / "research_data" / "research.db"
REPOS_DIR    = PROJECT_ROOT / "repositories"
DATASET_DIR  = Path(__file__).parent / "dataset"

# ── Constants ─────────────────────────────────────────────────────────────────
MODEL_DIR_ALIASES = {
    "codellama-34b": "codellama-34b-instruct",
    "codellama-70b": "codellama-70b",
}
STRATEGY_MAP = {
    "Zero-Shot":        "zero_shot",
    "Few-Shot":         "few_shot",
    "Chain-of-Thought": "chain_of_thought",
}

# Repos that need ACTUAL test re-execution (not just re-parsing)
RERUN_REPOS = {
    "html-webpack-plugin": {"timeout": 120},   # ~55s default; give plenty of margin
    "bootstrap-vue-dev":   {"timeout": 600},   # previously timed out at 300s
    "nock":                {"timeout": 90},    # ~24s baseline
}
# Repos where ALL experiments are re-run regardless of current DB status
# (not just ones with runtime_error / missing after row)
FORCE_RERUN_ALL_REPOS = {"nock"}
# Repos that only need re-parsing (test_output.txt already valid)
REPARSE_ONLY_REPOS = {"falcor"}


# ── Helpers ───────────────────────────────────────────────────────────────────

def model_dir(name: str) -> str:
    slug = name.lower().replace(" ", "-").replace("(", "").replace(")", "")
    return MODEL_DIR_ALIASES.get(slug, slug)


def experiment_dataset_dir(approach: str, model: str, smell_id: int) -> Path:
    strat = STRATEGY_MAP.get(approach, approach.lower().replace(" ", "_").replace("-", "_"))
    return DATASET_DIR / strat / model_dir(model) / f"smell_{smell_id}"


def parse_test_counts(text: str) -> dict:
    """Parse Jest/Mocha test-count lines from text."""
    result = {}
    m = re.search(r"Test Suites:\s*(.*)", text, re.IGNORECASE)
    if m:
        for part in m.group(1).split(","):
            nm = re.match(r"(\d+)\s+(\w+)", part.strip())
            if nm:
                n, label = int(nm.group(1)), nm.group(2).lower()
                if "fail"  in label: result["test_suites_failed"]  = n
                elif "pass" in label: result["test_suites_passed"] = n
                elif "total" in label: result["test_suites_total"] = n
    m = re.search(r"\nTests:\s*(.*)", text, re.IGNORECASE)
    if m:
        for part in m.group(1).split(","):
            nm = re.match(r"(\d+)\s+(\w+)", part.strip())
            if nm:
                n, label = int(nm.group(1)), nm.group(2).lower()
                if "fail"  in label: result["tests_failed"]  = n
                elif "pass" in label: result["tests_passed"] = n
                elif "skip" in label: result["tests_skipped"] = n
                elif "total" in label: result["tests_total"] = n
    m = re.search(r"Snapshots:\s*(.*)", text, re.IGNORECASE)
    if m:
        for part in m.group(1).split(","):
            nm = re.match(r"(\d+)\s+(\w+)", part.strip())
            if nm:
                n, label = int(nm.group(1)), nm.group(2).lower()
                if "total" in label: result["snapshots_total"] = n
    m = re.search(r"Time:\s*([\d.]+)", text, re.IGNORECASE)
    if m:
        result["execution_time_seconds"] = float(m.group(1))
    return result


def parse_coverage(text: str) -> dict:
    """Parse Istanbul/Jest coverage summary from text."""
    result = {}
    patterns = {
        "coverage_statements": r"Statements\s*:\s*([\d.]+)%",
        "coverage_branches":   r"Branches\s*:\s*([\d.]+)%",
        "coverage_functions":  r"Functions\s*:\s*([\d.]+)%",
        "coverage_lines":      r"Lines\s*:\s*([\d.]+)%",
    }
    for key, pat in patterns.items():
        m = re.search(pat, text)
        if m:
            result[key] = float(m.group(1))
    return result


def extract_test_summary_text(output: str) -> str:
    """Build test_summary.txt content from raw test output."""
    lines = []

    # Coverage block — use [^\n]* to avoid catastrophic backtracking
    cov_match = re.search(
        r"(={10,}[^\n]*Coverage summary[^\n]*={10,}\n(?:[^\n]*\n){0,10}={10,})",
        output
    )
    if cov_match:
        lines.append(cov_match.group(1).rstrip())
        lines.append("")
    else:
        lines.append("(Coverage information not available)")
        lines.append("")

    # Test results – last occurrence (use [^\n]* to avoid backtracking with DOTALL)
    for pat in [
        r"(Test Suites:[^\n]*\nTests:[^\n]*\nSnapshots:[^\n]*\nTime:[^\n]*)",
        r"(Test Suites:[^\n]*\nTests:[^\n]*\nTime:[^\n]*)",
        r"(\d+\s+passing[^\n]*)",
    ]:
        matches = re.findall(pat, output, re.IGNORECASE)
        if matches:
            lines.append(matches[-1].strip())
            break
    else:
        lines.append("(Test results not available)")

    return "\n".join(lines)


# ── Code substitution ─────────────────────────────────────────────────────────

def substitute_and_restore(file_path: Path, refactored_code: str,
                            start_line: int | None, end_line: int | None,
                            original_code: str | None = None) -> str:
    """
    Replace the original snippet in the file with refactored_code.

    Strategy (in order):
      1. Line-based replacement if start_line & end_line are set.
      2. Text-based replacement using original_code (exact match).
      3. Text-based replacement using original_code with normalised whitespace.

    Returns the original file content so the caller can restore it.
    Raises ValueError if no substitution strategy works.
    """
    original = file_path.read_text(encoding="utf-8")

    # ── Strategy 1: line-based ───────────────────────────────────────────────
    if start_line is not None and end_line is not None:
        lines = original.splitlines(keepends=True)
        new_snippet_lines = refactored_code.splitlines(keepends=True)
        if new_snippet_lines and not new_snippet_lines[-1].endswith("\n"):
            new_snippet_lines[-1] += "\n"
        s = start_line - 1      # 0-indexed
        e = end_line            # exclusive
        new_content = "".join(lines[:s] + new_snippet_lines + lines[e:])
        file_path.write_text(new_content, encoding="utf-8")
        return original

    # ── Strategy 2 & 3: text-based ───────────────────────────────────────────
    if not original_code:
        raise ValueError("No start_line/end_line and no original_code provided")

    if original_code in original:
        new_content = original.replace(original_code, refactored_code, 1)
        file_path.write_text(new_content, encoding="utf-8")
        return original

    # Normalise \r\n → \n and try again
    orig_norm  = original.replace("\r\n", "\n")
    snip_norm  = original_code.replace("\r\n", "\n")
    refac_norm = refactored_code.replace("\r\n", "\n")
    if snip_norm in orig_norm:
        new_content = orig_norm.replace(snip_norm, refac_norm, 1)
        file_path.write_text(new_content, encoding="utf-8")
        return original

    raise ValueError(
        f"Original snippet not found in {file_path}  "
        f"(snippet len={len(original_code)}, file len={len(original)})"
    )


def restore_file(file_path: Path, original_content: str):
    file_path.write_text(original_content, encoding="utf-8")


# ── Database helpers ──────────────────────────────────────────────────────────

def upsert_test_result_after(cur, exp_id: int, counts: dict, cov: dict):
    """Delete-and-reinsert the 'after' test_results row for an experiment."""
    cur.execute("DELETE FROM test_results WHERE experiment_id=? AND phase='after'", (exp_id,))
    failed   = counts.get("tests_failed")
    sf       = counts.get("test_suites_failed", 0) or 0
    sp       = counts.get("test_suites_passed")
    st       = counts.get("test_suites_total")
    tp       = counts.get("tests_passed")
    tt       = counts.get("tests_total")
    snap     = counts.get("snapshots_total")
    exec_t   = counts.get("execution_time_seconds")
    all_pass = 1 if (sf == 0 and (failed is None or failed == 0)) else 0

    cur.execute("""
        INSERT INTO test_results
            (experiment_id, phase,
             test_suites_passed, test_suites_failed, test_suites_total,
             tests_passed, tests_failed, tests_total,
             snapshots_total, execution_time_seconds,
             coverage_statements, coverage_branches,
             coverage_functions, coverage_lines,
             all_tests_passed, executed_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        exp_id, "after",
        sp, sf, st,
        tp, failed, tt,
        snap, exec_t,
        cov.get("coverage_statements"), cov.get("coverage_branches"),
        cov.get("coverage_functions"), cov.get("coverage_lines"),
        all_pass,
        datetime.now().isoformat(),
    ))


def classify_tests_failed(after_suites_failed: int, baseline_suites_failed: int,
                           test_output_txt: str) -> tuple:
    """Return (tests_failed: int, tests_failed_type: str|None)."""
    af = after_suites_failed or 0
    bl = baseline_suites_failed or 0
    if af > bl:
        return 1, "suites_failed_increase"
    # Check if output indicates runtime error
    if test_output_txt:
        lo = test_output_txt.lower()
        if "syntaxerror" in lo or "unexpected token" in lo:
            return 1, "syntax_error"
        if "cannot find module" in lo or "module not found" in lo:
            return 1, "module_resolution_error"
        if "command timed out" in lo:
            return 1, "timeout"
    return 0, None


# ══════════════════════════════════════════════════════════════════════════════
# MAIN LOGIC
# ══════════════════════════════════════════════════════════════════════════════

def reparse_experiment(cur, exp_id: int, approach: str, model: str,
                       smell_id: int, repo_name: str, baseline_sf: int,
                       dry_run: bool) -> str:
    """
    Re-parse existing test_output.txt (no test execution).
    Used for falcor.
    """
    exp_dir = experiment_dataset_dir(approach, model, smell_id)
    out_file = exp_dir / "test_output.txt"
    if not out_file.exists():
        return f"  SKIP exp={exp_id}: test_output.txt not found at {exp_dir}"

    raw = out_file.read_text(encoding="utf-8")
    counts = parse_test_counts(raw)
    cov    = parse_coverage(raw)
    if not counts:
        return f"  SKIP exp={exp_id}: no parsable test counts in test_output.txt"

    summary_txt = extract_test_summary_text(raw)
    sf = counts.get("test_suites_failed", 0) or 0
    tests_failed, tests_failed_type = classify_tests_failed(sf, baseline_sf, raw)

    if dry_run:
        return (f"  DRY-RUN exp={exp_id} smell={smell_id} {approach}/{model}: "
                f"suites_failed={sf} → tests_failed={tests_failed}({tests_failed_type})")

    # Write test_summary.txt
    sum_file = exp_dir / "test_summary.txt"
    sum_file.write_text(summary_txt, encoding="utf-8")

    # Upsert test_results (after) + update experiments
    upsert_test_result_after(cur, exp_id, counts, cov)
    cur.execute(
        "UPDATE experiments SET tests_failed=?, tests_failed_type=? WHERE id=?",
        (tests_failed, tests_failed_type, exp_id)
    )
    return f"  REPARSED exp={exp_id} smell={smell_id}: suites_failed={sf} tests_failed={tests_failed}({tests_failed_type})"


def rerun_experiment(cur, exp_id: int, approach: str, model: str, smell_id: int,
                     repo_name: str, file_rel_path: str, refactored_code: str,
                     start_line: int | None, end_line: int | None,
                     original_code: str | None, baseline_sf: int,
                     timeout: int, dry_run: bool) -> str:
    """
    Substitute code → run tests → restore → save results.
    """
    repo_path = REPOS_DIR / repo_name
    file_path = repo_path / file_rel_path.lstrip("/")
    exp_dir   = experiment_dataset_dir(approach, model, smell_id)

    # Try reading refactored_code from dataset file first (already cleaned)
    rc_file = exp_dir / "refactored_code.js"
    if rc_file.exists():
        refactored_code_clean = rc_file.read_text(encoding="utf-8")
    else:
        refactored_code_clean = refactored_code

    if not file_path.exists():
        return f"  SKIP exp={exp_id}: repo file not found: {file_path}"
    if not refactored_code_clean.strip():
        return f"  SKIP exp={exp_id}: empty refactored code"

    # Read test command
    run_tests_file = repo_path / ".run_tests"
    if not run_tests_file.exists():
        return f"  SKIP exp={exp_id}: no .run_tests file in {repo_path}"
    command = run_tests_file.read_text().strip()

    subst_mode = "lines" if (start_line and end_line) else "text-match"
    if dry_run:
        return (f"  DRY-RUN exp={exp_id} smell={smell_id} {approach}/{model}: "
                f"would run [{command}] timeout={timeout}s "
                f"mode={subst_mode} lines={start_line}-{end_line} file={file_rel_path}")

    # -- Substitute code
    print(f"  → Applying refactored code ({subst_mode}: lines {start_line}-{end_line})...")
    try:
        original_content = substitute_and_restore(
            file_path, refactored_code_clean,
            start_line, end_line, original_code
        )
    except ValueError as e:
        return f"  SKIP exp={exp_id}: substitution failed — {e}"

    file_was_modified = True
    try:
        # -- Run tests
        print(f"  → Running: {command}  (timeout={timeout}s) ...")
        result = subprocess.run(
            command,
            shell=True,
            cwd=str(repo_path),
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        success    = (result.returncode == 0)
        raw_output = (result.stdout or "") + "\n" + (result.stderr or "")
        timed_out  = False
    except subprocess.TimeoutExpired as e:
        success    = False
        raw_output = (e.output or b"").decode("utf-8", errors="replace") + \
                     f"\nCommand timed out after {timeout} seconds"
        timed_out  = True

    finally:
        if file_was_modified:
            # -- ALWAYS restore
            restore_file(file_path, original_content)
            print(f"  → Restored {file_rel_path}")

    # -- Build output files
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    full_output = "\n".join([
        "=" * 80,
        f"Test Execution Report: {repo_name}",
        "=" * 80,
        f"Timestamp: {timestamp}",
        f"Command: {command}",
        f"Status: {'SUCCESS' if success else 'FAILED'}",
        "=" * 80,
        "",
        "OUTPUT:",
        "-" * 80,
        raw_output.strip(),
        "-" * 80,
        "",
        "=" * 80,
    ])
    summary_txt = extract_test_summary_text(raw_output)

    exp_dir.mkdir(parents=True, exist_ok=True)
    (exp_dir / "test_output.txt").write_text(full_output,  encoding="utf-8")
    (exp_dir / "test_summary.txt").write_text(summary_txt, encoding="utf-8")

    # -- Parse results
    counts = parse_test_counts(raw_output)
    cov    = parse_coverage(raw_output)
    sf     = counts.get("test_suites_failed", 0) or 0
    tests_failed, tests_failed_type = classify_tests_failed(sf, baseline_sf, raw_output)

    if timed_out:
        tests_failed      = 1
        tests_failed_type = "timeout"

    # -- Update DB
    upsert_test_result_after(cur, exp_id, counts, cov)
    cur.execute(
        "UPDATE experiments SET tests_failed=?, tests_failed_type=? WHERE id=?",
        (tests_failed, tests_failed_type, exp_id)
    )

    status = "PASS" if success else ("TIMEOUT" if timed_out else "FAIL")
    return (f"  [{status}] exp={exp_id} smell={smell_id}: "
            f"suites_failed={sf} tests_failed={tests_failed}({tests_failed_type})")


def fix_winston_classification(dry_run: bool):
    """
    Fix experiments.tests_failed for winston.

    During the original backfill the DB baseline was NULL (treated as 0).
    Winston's baseline is test_suites_failed=1; experiments with after=1
    were wrongly flagged as suites_failed_increase. Correct them now.
    """
    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()

    cur.execute("""
        SELECT e.id, tr_after.test_suites_failed, rb.test_suites_failed
        FROM experiments e
        JOIN study_smells ss ON e.study_smell_id = ss.id
        JOIN files f ON ss.file_id = f.id
        JOIN repositories rep ON f.repository_id = rep.id
        JOIN test_results tr_after ON tr_after.experiment_id = e.id
                                   AND tr_after.phase = 'after'
        JOIN repository_baseline_test_results rb ON rb.repository_id = rep.id
        WHERE rep.name = 'winston'
    """)
    rows = cur.fetchall()

    to_ok   = []
    to_fail = []
    for exp_id, after_sf, base_sf in rows:
        after_sf = after_sf or 0
        base_sf  = base_sf  or 0
        if after_sf > base_sf:
            to_fail.append(exp_id)
        else:
            to_ok.append(exp_id)

    print(f"\n[winston] Re-classification: {len(to_ok)} ok, {len(to_fail)} suites_failed_increase")

    if dry_run:
        print("  DRY-RUN: no changes committed.")
        conn.close()
        return

    for exp_id in to_ok:
        cur.execute(
            "UPDATE experiments SET tests_failed=0, tests_failed_type=NULL WHERE id=?",
            (exp_id,)
        )
    for exp_id in to_fail:
        cur.execute(
            "UPDATE experiments SET tests_failed=1, tests_failed_type='suites_failed_increase' WHERE id=?",
            (exp_id,)
        )
    conn.commit()

    # Also re-classify html-webpack-plugin – but all 36 are runtime_error,
    # so baseline fix doesn't change their type. Still run it for safety.
    cur.execute("""
        SELECT e.id, tr_after.test_suites_failed, rb.test_suites_failed
        FROM experiments e
        JOIN study_smells ss ON e.study_smell_id = ss.id
        JOIN files f ON ss.file_id = f.id
        JOIN repositories rep ON f.repository_id = rep.id
        JOIN test_results tr_after ON tr_after.experiment_id = e.id
                                   AND tr_after.phase = 'after'
        JOIN repository_baseline_test_results rb ON rb.repository_id = rep.id
        WHERE rep.name = 'html-webpack-plugin'
          AND e.tests_failed_type NOT IN ('runtime_error','unknown','timeout')
    """)
    rows2 = cur.fetchall()
    for exp_id, after_sf, base_sf in rows2:
        after_sf = after_sf or 0
        base_sf  = base_sf  or 0
        if after_sf > base_sf:
            cur.execute(
                "UPDATE experiments SET tests_failed=1, tests_failed_type='suites_failed_increase' WHERE id=?",
                (exp_id,)
            )
        else:
            cur.execute(
                "UPDATE experiments SET tests_failed=0, tests_failed_type=NULL WHERE id=?",
                (exp_id,)
            )
    conn.commit()
    conn.close()
    print(f"  ✓ Committed {len(to_ok)+len(to_fail)} winston + {len(rows2)} html-webpack-plugin updates.")


# ══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

def main():
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run",      action="store_true")
    parser.add_argument("--repo",         default=None, help="Restrict to one repo name")
    parser.add_argument("--exp-id",       type=int, default=None, help="Single experiment ID")
    parser.add_argument("--fix-winston",  action="store_true",
                        help="Only fix winston tests_failed classification (no test re-run)")
    args = parser.parse_args()

    dry_run = args.dry_run

    # ── 1. Fix winston classification ────────────────────────────────────────
    if args.fix_winston or not args.repo:
        print("\n" + "="*70)
        print("STEP 1: Fix winston tests_failed classification")
        print("="*70)
        fix_winston_classification(dry_run)

    if args.fix_winston:
        return

    # ── 2. Collect experiments that need work ────────────────────────────────
    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()

    # Build repo filter
    repo_filter_sql = ""
    repo_filter_params: list = []
    if args.repo:
        repo_filter_sql = "AND rep.name = ?"
        repo_filter_params = [args.repo]

    exp_id_filter_sql = ""
    exp_id_filter_params: list = []
    if args.exp_id:
        exp_id_filter_sql = "AND e.id = ?"
        exp_id_filter_params = [args.exp_id]

    target_repos = set(RERUN_REPOS) | REPARSE_ONLY_REPOS
    if args.repo:
        target_repos = {args.repo}

    # Compute which repos in our target set need force-all (no status filter)
    active_force_repos = FORCE_RERUN_ALL_REPOS & target_repos
    active_error_repos = target_repos - active_force_repos

    # Build dynamic WHERE: force repos always included; others only if
    # they have a missing after row or an error classification.
    where_parts = []
    query_params: list = []

    if active_force_repos:
        fc = ",".join("?" * len(active_force_repos))
        where_parts.append(f"rep.name IN ({fc})")
        query_params.extend(list(active_force_repos))

    if active_error_repos:
        ec = ",".join("?" * len(active_error_repos))
        where_parts.append(
            f"(rep.name IN ({ec}) AND "
            f"(tr_after.id IS NULL OR "
            f"e.tests_failed_type IN ('runtime_error','unknown','timeout')))"
        )
        query_params.extend(list(active_error_repos))

    if not where_parts:
        print("Nothing to do.")
        conn.close()
        return

    combined_where = "(" + " OR ".join(where_parts) + ")"

    cur.execute(f"""
        SELECT
            e.id, e.prompting_approach, e.ai_model_version,
            ss.id AS smell_id, ss.snippet_start_line, ss.snippet_end_line,
            f.path AS file_path,
            rep.name AS repo_name,
            e.refactored_code,
            e.original_code,
            rb.test_suites_failed AS baseline_sf
        FROM experiments e
        JOIN study_smells ss ON e.study_smell_id = ss.id
        JOIN files         f  ON ss.file_id      = f.id
        JOIN repositories  rep ON f.repository_id = rep.id
        LEFT JOIN repository_baseline_test_results rb ON rb.repository_id = rep.id
        LEFT JOIN test_results tr_after ON tr_after.experiment_id = e.id
                                        AND tr_after.phase = 'after'
        WHERE {combined_where}
          {repo_filter_sql}
          {exp_id_filter_sql}
        ORDER BY rep.name, ss.id, e.prompting_approach, e.ai_model_version
    """, query_params + repo_filter_params + exp_id_filter_params)

    experiments = cur.fetchall()
    print(f"\n{'='*70}")
    print(f"STEP 2: Process {len(experiments)} experiments")
    print("="*70)

    reparse_count  = 0
    rerun_count    = 0
    skip_count     = 0

    for row in experiments:
        (exp_id, approach, model, smell_id, start_line, end_line,
         file_rel_path, repo_name, refactored_code, original_code, baseline_sf) = row

        baseline_sf = baseline_sf or 0
        cfg = RERUN_REPOS.get(repo_name)

        print(f"\n[{repo_name}] exp={exp_id} smell={smell_id} {approach}/{model}")

        if repo_name in REPARSE_ONLY_REPOS:
            msg = reparse_experiment(
                cur, exp_id, approach, model, smell_id,
                repo_name, baseline_sf, dry_run
            )
            print(msg)
            if "REPARSED" in msg: reparse_count += 1
            elif "SKIP"    in msg: skip_count    += 1

        elif cfg is not None:
            if not refactored_code:
                print(f"  SKIP exp={exp_id}: no refactored_code in DB")
                skip_count += 1
                continue
            msg = rerun_experiment(
                cur, exp_id, approach, model, smell_id,
                repo_name, file_rel_path, refactored_code,
                start_line, end_line, original_code, baseline_sf,
                timeout=cfg["timeout"], dry_run=dry_run
            )
            print(msg)
            if "SKIP" not in msg: rerun_count += 1
            else:                 skip_count  += 1
        else:
            print(f"  SKIP exp={exp_id}: repo '{repo_name}' not in target list")
            skip_count += 1
            continue

        # Commit after each experiment to preserve partial progress
        if not dry_run:
            conn.commit()

    conn.close()

    print(f"\n{'='*70}")
    print(f"DONE: re-parsed={reparse_count}, re-run={rerun_count}, skipped={skip_count}")
    if dry_run:
        print("(DRY-RUN – no changes committed)")
    print("="*70)


if __name__ == "__main__":
    main()
