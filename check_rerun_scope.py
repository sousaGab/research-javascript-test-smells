#!/usr/bin/env python3
"""Investigate which experiments need re-running and why."""
import sqlite3, os, re

DB = 'research_data/research.db'
DATASET = 'llm-refactor-pipeline/dataset'
MODEL_ALIASES = {'codellama-34b': 'codellama-34b-instruct'}

conn = sqlite3.connect(DB)
cur = conn.cursor()

strategy_map = {'Zero-Shot': 'zero_shot', 'Few-Shot': 'few_shot', 'Chain-of-Thought': 'chain_of_thought'}

def model_dir(name):
    slug = name.lower().replace(' ', '-')
    return MODEL_ALIASES.get(slug, slug)

def experiment_dir(row):
    exp_id, approach, model, smell_id = row
    strat = strategy_map.get(approach, approach.lower().replace('-','_').replace(' ','_'))
    return os.path.join(DATASET, strat, model_dir(model), f'smell_{smell_id}')

print("=== Experiments with runtime_error / unknown ===")
cur.execute('''
SELECT e.id, e.prompting_approach, e.ai_model_version, ss.id as smell_id,
       rep.name as repo, e.tests_failed_type
FROM experiments e
JOIN study_smells ss ON e.study_smell_id=ss.id
JOIN files f ON ss.file_id=f.id
JOIN repositories rep ON f.repository_id=rep.id
WHERE e.tests_failed_type IN ('runtime_error', 'unknown')
ORDER BY repo, ss.id, e.prompting_approach, e.ai_model_version
''')
rows = cur.fetchall()
print(f"Total: {len(rows)}")
for r in rows:
    exp_id, approach, model, smell_id, repo, ftype = r
    d = experiment_dir((exp_id, approach, model, smell_id))
    has_out = os.path.exists(os.path.join(d, 'test_output.txt'))
    has_sum = os.path.exists(os.path.join(d, 'test_summary.txt'))
    print(f"  exp={exp_id:5d} repo={repo:25s} smell={smell_id:4d} {approach:20s} {model:25s} [{ftype}] out={has_out} sum={has_sum}")

print("\n=== Experiments missing after test_results ===")
cur.execute('''
SELECT e.id, e.prompting_approach, e.ai_model_version, ss.id, rep.name
FROM experiments e
JOIN study_smells ss ON e.study_smell_id=ss.id
JOIN files f ON ss.file_id=f.id
JOIN repositories rep ON f.repository_id=rep.id
LEFT JOIN test_results tr ON tr.experiment_id=e.id AND tr.phase='after'
WHERE tr.id IS NULL
ORDER BY rep.name
''')
missing = cur.fetchall()
print(f"Total: {len(missing)}")
for r in missing:
    exp_id, approach, model, smell_id, repo = r
    d = experiment_dir((exp_id, approach, model, smell_id))
    has_out = os.path.exists(os.path.join(d, 'test_output.txt'))
    print(f"  exp={exp_id:5d} repo={repo:25s} smell={smell_id:4d} {approach:20s} {model:25s} out={has_out}")

print("\n=== Before rows that need updating (winston + html-webpack-plugin) ===")
cur.execute('''
SELECT rep.name, COUNT(*) as before_rows,
    SUM(tr.test_suites_failed) as sum_sf, SUM(tr.tests_failed) as sum_tf
FROM test_results tr
JOIN experiments e ON tr.experiment_id=e.id
JOIN study_smells ss ON e.study_smell_id=ss.id
JOIN files f ON ss.file_id=f.id
JOIN repositories rep ON f.repository_id=rep.id
WHERE tr.phase='before' AND rep.name IN ('winston','html-webpack-plugin')
GROUP BY rep.name
''')
for r in cur.fetchall():
    print(f"  {r}")

print("\n=== Baseline values (now corrected) ===")
cur.execute('''
SELECT rep.name, rb.test_suites_failed, rb.tests_failed, rb.all_tests_passed
FROM repository_baseline_test_results rb
JOIN repositories rep ON rb.repository_id=rep.id
WHERE rep.name IN ('winston','html-webpack-plugin')
''')
for r in cur.fetchall():
    print(f"  {r}")

# Check html-webpack-plugin test error details for first experiment
print("\n=== html-webpack-plugin first experiment test error snippet ===")
cur.execute('''
SELECT e.id, e.prompting_approach, e.ai_model_version, ss.id
FROM experiments e
JOIN study_smells ss ON e.study_smell_id=ss.id
JOIN files f ON ss.file_id=f.id
JOIN repositories rep ON f.repository_id=rep.id
WHERE rep.name='html-webpack-plugin' LIMIT 1
''')
row = cur.fetchone()
if row:
    d = experiment_dir(row)
    fp = os.path.join(d, 'test_output.txt')
    if os.path.exists(fp):
        txt = open(fp).read()
        # Show key error lines
        for line in txt.split('\n'):
            if 'Error:' in line or 'FAILED' in line or 'cross-env' in line:
                print(f"  {line[:120]}")

conn.close()
