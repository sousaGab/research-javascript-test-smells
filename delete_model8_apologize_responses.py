#!/usr/bin/env python3
"""
Delete all refactoring experiments from Model 8 (CodeLlama-70b) 
that start with "I apologize" instead of providing refactored code.

This script helps clean up experiments where the model refused to refactor
due to ethical concerns.
"""

import sqlite3
import sys
from pathlib import Path

# Database configuration
DB_PATH = Path("/home/gabriel/Disk/Research/research-javascript-test-smells/research_data/research.db")

def get_apologize_experiments():
    """Find all model 8 experiments with 'I apologize' responses."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Model 8 is CodeLlama-70b
    query = """
    SELECT 
        e.id,
        e.study_smell_id,
        e.prompting_approach,
        e.refactored_code,
        ss.smell_type,
        r.name as repository,
        f.path as file_path
    FROM experiments e
    JOIN study_smells ss ON e.study_smell_id = ss.id
    JOIN files f ON ss.file_id = f.id
    JOIN repositories r ON f.repository_id = r.id
    WHERE e.ai_model_version = 'CodeLlama-70b'
    AND e.refactored_code LIKE 'I apologize%'
    ORDER BY e.id
    """
    
    cursor.execute(query)
    results = cursor.fetchall()
    conn.close()
    
    return results

def display_statistics(experiments):
    """Display statistics about experiments to be deleted."""
    if not experiments:
        print("✅ No experiments found with 'I apologize...' responses for Model 8 (CodeLlama-70b)")
        return False
    
    print(f"\n{'='*70}")
    print(f"Found {len(experiments)} experiments with 'I apologize...' responses")
    print(f"{'='*70}\n")
    
    # Group by smell type
    smells = {}
    for exp in experiments:
        smell_type = exp[4]  # smell_type from study_smells
        if smell_type not in smells:
            smells[smell_type] = 0
        smells[smell_type] += 1
    
    print("📊 Breakdown by smell type:")
    for smell, count in sorted(smells.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {smell}: {count} experiments")
    
    # Show first few examples
    print(f"\n📝 Sample experiments (first 5):")
    for exp in experiments[:5]:
        exp_id, study_smell_id, prompting_approach, refactored_code, smell_type, repository, file_path = exp
        preview = refactored_code[:100].replace("\n", " ")
        print(f"\n  Experiment ID: {exp_id}")
        print(f"  Smell Type: {smell_type}")
        print(f"  Repository: {repository}")
        print(f"  File: {file_path}")
        print(f"  Prompting: {prompting_approach}")
        print(f"  Response preview: {preview}...")
    
    if len(experiments) > 5:
        print(f"\n  ... and {len(experiments) - 5} more experiments")
    
    print(f"\n{'='*70}\n")
    return True

def delete_experiments(experiment_ids):
    """Delete experiments by IDs with CASCADE."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # SQLite needs to enable foreign keys for CASCADE to work
    cursor.execute("PRAGMA foreign_keys = ON")
    
    placeholders = ','.join(['?'] * len(experiment_ids))
    delete_query = f"DELETE FROM experiments WHERE id IN ({placeholders})"
    
    cursor.execute(delete_query, experiment_ids)
    deleted_count = cursor.rowcount
    
    conn.commit()
    conn.close()
    
    return deleted_count

def main():
    """Main execution."""
    if not DB_PATH.exists():
        print(f"❌ Database not found at: {DB_PATH}")
        sys.exit(1)
    
    print("🔍 Searching for Model 8 (CodeLlama-70b) experiments with 'I apologize...' responses...")
    
    experiments = get_apologize_experiments()
    
    if not display_statistics(experiments):
        return
    
    # Confirmation
    print("⚠️  WARNING: This will permanently delete these experiments!")
    print("This action cannot be undone.\n")
    confirmation = input("Type 'DELETE' to confirm deletion: ").strip()
    
    if confirmation != "DELETE":
        print("\n❌ Deletion cancelled.")
        sys.exit(0)
    
    # Delete
    print("\n🗑️  Deleting experiments...")
    experiment_ids = [exp[0] for exp in experiments]
    deleted_count = delete_experiments(experiment_ids)
    
    print(f"✅ Successfully deleted {deleted_count} experiments from Model 8")
    print(f"   These experiments had 'I apologize...' responses instead of refactored code.")

if __name__ == "__main__":
    main()
