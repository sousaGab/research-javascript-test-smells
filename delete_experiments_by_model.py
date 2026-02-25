#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to delete all experiments for a specific AI model.
Similar to the delete functionality in the refactoring pages.

Usage:
    python3 delete_experiments_by_model.py
"""

import sqlite3
from pathlib import Path
from typing import List, Tuple, Optional, Dict

# Database path
db_path = Path(__file__).parent / "research_data" / "research.db"

if not db_path.exists():
    print(f"❌ Database not found at: {db_path}")
    exit(1)

# Model mapping from hf_client.py (id -> display name)
MODEL_REGISTRY = {
    "Qwen/Qwen2.5-Coder-32B-Instruct": {"id": 1, "name": "Qwen 2.5 Coder 32B"},
    "meta-llama/CodeLlama-34b-Instruct-hf": {"id": 2, "name": "CodeLlama 34B Instruct"},
    "CodeLlama 34B Instruct": {"id": 2, "name": "CodeLlama 34B Instruct"},
    "claude-sonnet-4-6": {"id": 3, "name": "Claude Sonnet 4.6"},
    "Claude Sonnet 4.6": {"id": 3, "name": "Claude Sonnet 4.6"},
    "gpt-5.2": {"id": 4, "name": "GPT-5.2"},
    "GPT-5.2": {"id": 4, "name": "GPT-5.2"},
    "deepseek-ai/DeepSeek-V3.2": {"id": 5, "name": "DeepSeek-V3.2: Efficient Reasoning & Agentic AI"},
    "DeepSeek-V3.2: Efficient Reasoning & Agentic AI": {"id": 5, "name": "DeepSeek-V3.2: Efficient Reasoning & Agentic AI"},
    "gemini-2.5-pro": {"id": 6, "name": "Gemini 2.5 Pro"},
    "Gemini 2.5 Pro": {"id": 6, "name": "Gemini 2.5 Pro"},
    "gpt-5.1": {"id": 7, "name": "GPT-5.1"},
    "GPT-5.1": {"id": 7, "name": "GPT-5.1"},
}

def get_model_id_from_db(ai_tool: str, ai_model_version: str) -> Optional[int]:
    """Get the model ID from hf_client.py registry based on DB values."""
    # Try ai_model_version first (most specific)
    if ai_model_version in MODEL_REGISTRY:
        return MODEL_REGISTRY[ai_model_version]["id"]
    
    # Try full name combination
    full_name = f"{ai_tool} - {ai_model_version}"
    for key, info in MODEL_REGISTRY.items():
        if info["name"] == ai_model_version or key == ai_model_version:
            return info["id"]
    
    return None


def get_model_statistics(cursor) -> List[Tuple]:
    """Get all models with their experiment counts."""
    query = """
    SELECT 
        ai_tool,
        ai_model_version,
        COUNT(*) as total_experiments,
        SUM(CASE WHEN refactor_phase_completed = 1 THEN 1 ELSE 0 END) as refactor_completed,
        SUM(CASE WHEN execution_phase_completed = 1 THEN 1 ELSE 0 END) as execution_completed,
        SUM(CASE WHEN smell_removed = 1 THEN 1 ELSE 0 END) as smell_removed_count,
        MIN(experiment_date) as first_experiment,
        MAX(experiment_date) as last_experiment
    FROM experiments
    GROUP BY ai_tool, ai_model_version
    ORDER BY total_experiments DESC, ai_tool, ai_model_version
    """
    cursor.execute(query)
    return cursor.fetchall()


def get_experiment_details(cursor, ai_tool: str, ai_model_version: str) -> dict:
    """Get detailed information about experiments for a specific model."""
    # Get experiment IDs
    cursor.execute("""
        SELECT id FROM experiments 
        WHERE ai_tool = ? AND ai_model_version = ?
    """, (ai_tool, ai_model_version))
    experiment_ids = [row[0] for row in cursor.fetchall()]
    
    if not experiment_ids:
        return {}
    
    # Get related data counts
    ids_str = ','.join(map(str, experiment_ids))
    
    # Count smell detection results
    cursor.execute(f"""
        SELECT COUNT(*) FROM smell_detection_results 
        WHERE experiment_id IN ({ids_str})
    """)
    smell_results_count = cursor.fetchone()[0]
    
    # Count code metrics
    cursor.execute(f"""
        SELECT COUNT(*) FROM code_metrics 
        WHERE experiment_id IN ({ids_str})
    """)
    metrics_count = cursor.fetchone()[0]
    
    # Count test results
    cursor.execute(f"""
        SELECT COUNT(*) FROM test_results 
        WHERE experiment_id IN ({ids_str})
    """)
    test_results_count = cursor.fetchone()[0]
    
    # Count AI responses
    cursor.execute(f"""
        SELECT COUNT(*) FROM ai_responses 
        WHERE experiment_id IN ({ids_str})
    """)
    ai_responses_count = cursor.fetchone()[0]
    
    # Get prompting approach breakdown
    cursor.execute("""
        SELECT prompting_approach, COUNT(*) 
        FROM experiments 
        WHERE ai_tool = ? AND ai_model_version = ?
        GROUP BY prompting_approach
    """, (ai_tool, ai_model_version))
    prompt_breakdown = cursor.fetchall()
    
    return {
        'experiment_ids': experiment_ids,
        'smell_results': smell_results_count,
        'metrics': metrics_count,
        'test_results': test_results_count,
        'ai_responses': ai_responses_count,
        'prompt_breakdown': prompt_breakdown
    }


def delete_experiments(cursor, conn, ai_tool: str, ai_model_version: str) -> int:
    """Delete all experiments for a specific model."""
    # SQLite CASCADE DELETE will automatically delete related records:
    # - smell_detection_results
    # - code_metrics
    # - test_results
    # - ai_responses
    
    cursor.execute("""
        DELETE FROM experiments 
        WHERE ai_tool = ? AND ai_model_version = ?
    """, (ai_tool, ai_model_version))
    
    deleted_count = cursor.rowcount
    conn.commit()
    
    return deleted_count


def main():
    print("=" * 100)
    print("🗑️  DELETE EXPERIMENTS BY MODEL".center(100))
    print("=" * 100)
    print()
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get model statistics
    models = get_model_statistics(cursor)
    
    if not models:
        print("✅ No experiments found in database.")
        conn.close()
        return
    
    # Display models
    print(f"📊 Available Models in Database:\n")
    print(f"{'Sel':<5} {'ID':<5} {'AI Tool':<20} {'Model Version':<35} {'Experiments':<15} {'Smells Removed':<15}")
    print("-" * 105)
    
    for idx, model in enumerate(models, 1):
        ai_tool = model['ai_tool'] or 'Unknown'
        ai_model = model['ai_model_version'] or 'Unknown'
        total = model['total_experiments']
        smell_removed = model['smell_removed_count']
        
        # Get real model ID from hf_client.py registry
        model_id = get_model_id_from_db(ai_tool, ai_model)
        model_id_str = str(model_id) if model_id else '?'
        
        print(f"{idx:<5} {model_id_str:<5} {ai_tool:<20} {ai_model:<35} {total:<15} {smell_removed:<15}")
    
    print("-" * 105)
    print(f"\n💡 'Sel' = Selection number to choose | 'ID' = Model ID from hf_client.py\n")
    
    # Get user selection
    try:
        selection = input("Enter the 'Sel' number to delete (or 'q' to quit): ").strip()
        
        if selection.lower() == 'q':
            print("\n👋 Cancelled by user.")
            conn.close()
            return
        
        selection_idx = int(selection)
        if selection_idx < 1 or selection_idx > len(models):
            print(f"\n❌ Invalid selection. Must be between 1 and {len(models)}.")
            conn.close()
            return
        
        selected_model = models[selection_idx - 1]
        ai_tool = selected_model['ai_tool']
        ai_model_version = selected_model['ai_model_version']
        
        # Get model ID for display
        model_id = get_model_id_from_db(ai_tool, ai_model_version)
        model_id_display = f" (Model ID: {model_id})" if model_id else ""
        
    except (ValueError, KeyboardInterrupt):
        print("\n\n❌ Invalid input or cancelled.")
        conn.close()
        return
    
    # Get detailed information
    print(f"\n📋 Details for: {ai_tool} - {ai_model_version}{model_id_display}\n")
    print("-" * 100)
    print(f"  Total Experiments:      {selected_model['total_experiments']}")
    print(f"  Refactor Completed:     {selected_model['refactor_completed']}")
    print(f"  Execution Completed:    {selected_model['execution_completed']}")
    print(f"  Smells Removed:         {selected_model['smell_removed_count']}")
    print(f"  First Experiment:       {selected_model['first_experiment']}")
    print(f"  Last Experiment:        {selected_model['last_experiment']}")
    
    details = get_experiment_details(cursor, ai_tool, ai_model_version)
    
    if details:
        print(f"\n  Related Data to be Deleted:")
        print(f"    • Smell Detection Results: {details['smell_results']}")
        print(f"    • Code Metrics:            {details['metrics']}")
        print(f"    • Test Results:            {details['test_results']}")
        print(f"    • AI Responses:            {details['ai_responses']}")
        
        if details['prompt_breakdown']:
            print(f"\n  Experiments by Prompting Approach:")
            for approach, count in details['prompt_breakdown']:
                approach_name = approach or 'Not specified'
                print(f"    • {approach_name}: {count}")
    
    print("-" * 100)
    
    # Confirmation
    print(f"\n⚠️  WARNING: This will permanently delete ALL {selected_model['total_experiments']} experiments")
    print(f"    for {ai_tool} - {ai_model_version} and all related data.")
    print(f"    This action CANNOT be undone!\n")
    
    confirmation = input("Type 'DELETE' (in uppercase) to confirm: ").strip()
    
    if confirmation != 'DELETE':
        print("\n👋 Deletion cancelled.")
        conn.close()
        return
    
    # Perform deletion
    print(f"\n🗑️  Deleting experiments...")
    
    try:
        deleted_count = delete_experiments(cursor, conn, ai_tool, ai_model_version)
        
        print(f"\n✅ Successfully deleted {deleted_count} experiments for {ai_tool} - {ai_model_version}")
        print(f"   All related data (smell results, metrics, test results, AI responses) were also deleted.")
        
        # Show updated statistics
        remaining = get_model_statistics(cursor)
        total_remaining = sum(m['total_experiments'] for m in remaining)
        print(f"\n📊 Database now has {total_remaining} total experiments across {len(remaining)} models.")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Error during deletion: {e}")
        print("   Changes have been rolled back.")
    
    finally:
        conn.close()
    
    print("\n✅ Done!")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Interrupted by user.")
        exit(0)
