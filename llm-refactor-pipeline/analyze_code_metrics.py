#!/usr/bin/env python3
"""
Code Metrics Analysis Script

Analyzes before/after code metrics from the database to evaluate
LLM refactoring quality. Properly handles syntax errors (NULL metrics)
following research best practices.

Usage:
    python3 analyze_code_metrics.py [--output results.csv] [--verbose]
"""

import argparse
import sys
from pathlib import Path
from typing import Dict, List, Tuple
import csv
from sqlalchemy import text

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database.models import CodeMetric, Experiment, StudySmells


def categorize_outcome(before_maint, after_maint, sloc_change, complexity_change):
    """
    Categorize refactoring outcome based on metrics changes.
    
    Args:
        before_maint: Maintainability before (can be None)
        after_maint: Maintainability after (can be None)
        sloc_change: Change in SLOC
        complexity_change: Change in cyclomatic complexity
        
    Returns:
        Tuple of (category, is_syntax_error)
    """
    # Critical failure: syntax error
    if after_maint is None:
        return 'SYNTAX_ERROR', True
    
    if before_maint is None:
        return 'UNKNOWN', False
    
    # Calculate maintainability improvement
    maint_improvement = after_maint - before_maint
    
    # Categorize based on maintainability change
    if maint_improvement > 10:
        return 'MAJOR_IMPROVEMENT', False
    elif maint_improvement > 2:
        return 'MINOR_IMPROVEMENT', False
    elif maint_improvement > -2:
        return 'UNCHANGED', False
    elif maint_improvement > -10:
        return 'MINOR_DEGRADATION', False
    else:
        return 'MAJOR_DEGRADATION', False


def analyze_metrics(session, verbose: bool = False):
    """
    Analyze all experiments with before/after code metrics.
    
    Returns:
        Dict with statistics and detailed results
    """
    print("=" * 70)
    print("CODE METRICS ANALYSIS")
    print("=" * 70)
    print()
    
    # Query all experiments with both before and after metrics (or at least after)
    query = """
    SELECT 
        e.id as experiment_id,
        e.study_smell_id,
        ss.smell_type,
        before_m.sloc_logical as before_sloc,
        after_m.sloc_logical as after_sloc,
        before_m.cyclomatic_complexity as before_complexity,
        after_m.cyclomatic_complexity as after_complexity,
        before_m.cyclomatic_density as before_density,
        after_m.cyclomatic_density as after_density,
        before_m.maintainability_index as before_maintainability,
        after_m.maintainability_index as after_maintainability,
        before_m.halstead_effort as before_halstead_effort,
        after_m.halstead_effort as after_halstead_effort,
        before_m.halstead_volume as before_halstead_volume,
        after_m.halstead_volume as after_halstead_volume
    FROM experiments e
    LEFT JOIN code_metrics before_m ON before_m.experiment_id = e.id AND before_m.phase = 'before'
    JOIN code_metrics after_m ON after_m.experiment_id = e.id AND after_m.phase = 'after'
    LEFT JOIN study_smells ss ON ss.id = e.study_smell_id
    WHERE after_m.id IS NOT NULL
    ORDER BY e.id
    """
    
    results = session.execute(text(query)).fetchall()
    
    if not results:
        print("[ERROR] No experiments found with both before/after metrics")
        return None
    
    print(f"Found {len(results)} experiments with before/after metrics")
    print()
    
    # Initialize statistics
    stats = {
        'total': len(results),
        'syntax_errors': 0,
        'major_improvement': 0,
        'minor_improvement': 0,
        'unchanged': 0,
        'minor_degradation': 0,
        'major_degradation': 0,
        'unknown': 0,
        'sloc_reduced': 0,
        'sloc_increased': 0,
        'sloc_unchanged': 0,
        'complexity_reduced': 0,
        'complexity_increased': 0,
        'complexity_unchanged': 0
    }
    
    detailed_results = []
    syntax_error_cases = []
    
    for row in results:
        # Calculate changes (handle cases where before metrics are missing)
        sloc_change = (row.after_sloc - row.before_sloc 
                      if row.after_sloc and row.before_sloc else None)
        complexity_change = (row.after_complexity - row.before_complexity 
                           if row.after_complexity and row.before_complexity else None)
        maint_change = (row.after_maintainability - row.before_maintainability
                       if row.after_maintainability and row.before_maintainability else None)
        
        # Categorize outcome
        category, is_syntax_error = categorize_outcome(
            row.before_maintainability,
            row.after_maintainability,
            sloc_change,
            complexity_change
        )
        
        # Update statistics
        if is_syntax_error:
            stats['syntax_errors'] += 1
            syntax_error_cases.append({
                'experiment_id': row.experiment_id,
                'smell_type': row.smell_type,
                'before_sloc': row.before_sloc,
                'after_sloc': row.after_sloc,
                'before_complexity': row.before_complexity,
                'after_complexity': row.after_complexity
            })
        elif category == 'MAJOR_IMPROVEMENT':
            stats['major_improvement'] += 1
        elif category == 'MINOR_IMPROVEMENT':
            stats['minor_improvement'] += 1
        elif category == 'UNCHANGED':
            stats['unchanged'] += 1
        elif category == 'MINOR_DEGRADATION':
            stats['minor_degradation'] += 1
        elif category == 'MAJOR_DEGRADATION':
            stats['major_degradation'] += 1
        else:
            stats['unknown'] += 1
        
        # SLOC statistics
        if sloc_change and sloc_change < 0:
            stats['sloc_reduced'] += 1
        elif sloc_change and sloc_change > 0:
            stats['sloc_increased'] += 1
        elif sloc_change is not None:
            stats['sloc_unchanged'] += 1
        
        # Complexity statistics
        if complexity_change and complexity_change < 0:
            stats['complexity_reduced'] += 1
        elif complexity_change and complexity_change > 0:
            stats['complexity_increased'] += 1
        elif complexity_change is not None:
            stats['complexity_unchanged'] += 1
        
        # Store detailed result
        detailed_results.append({
            'experiment_id': row.experiment_id,
            'study_smell_id': row.study_smell_id,
            'smell_type': row.smell_type,
            'category': category,
            'before_sloc': row.before_sloc,
            'after_sloc': row.after_sloc,
            'sloc_change': sloc_change,
            'before_complexity': row.before_complexity,
            'after_complexity': row.after_complexity,
            'complexity_change': complexity_change,
            'before_maintainability': row.before_maintainability,
            'after_maintainability': row.after_maintainability,
            'maintainability_change': maint_change,
            'before_halstead_effort': row.before_halstead_effort,
            'after_halstead_effort': row.after_halstead_effort
        })
    
    return {
        'stats': stats,
        'detailed_results': detailed_results,
        'syntax_error_cases': syntax_error_cases
    }


def print_statistics(analysis_results):
    """Print statistical summary of analysis results."""
    stats = analysis_results['stats']
    total = stats['total']
    
    print("=" * 70)
    print("STATISTICAL SUMMARY")
    print("=" * 70)
    print()
    
    # Overall statistics
    print("📊 Overall Results:")
    print(f"  Total experiments analyzed: {total:,}")
    print()
    
    # Syntax errors
    syntax_count = stats['syntax_errors']
    syntax_pct = (syntax_count / total * 100) if total > 0 else 0
    print(f"❌ Syntax Errors:")
    print(f"  Count: {syntax_count} ({syntax_pct:.2f}%)")
    print(f"  Note: These cases produced syntactically invalid code")
    print()
    
    # Valid refactorings
    valid_count = total - syntax_count
    valid_pct = (valid_count / total * 100) if total > 0 else 0
    print(f"✅ Valid Refactorings: {valid_count} ({valid_pct:.2f}%)")
    print()
    
    # Quality outcomes (excluding syntax errors)
    if valid_count > 0:
        print("📈 Quality Outcomes (Valid Code Only):")
        
        improved = stats['major_improvement'] + stats['minor_improvement']
        degraded = stats['major_degradation'] + stats['minor_degradation']
        
        print(f"  Major Improvement:    {stats['major_improvement']:4d} ({stats['major_improvement']/valid_count*100:5.2f}%)")
        print(f"  Minor Improvement:    {stats['minor_improvement']:4d} ({stats['minor_improvement']/valid_count*100:5.2f}%)")
        print(f"  Unchanged:            {stats['unchanged']:4d} ({stats['unchanged']/valid_count*100:5.2f}%)")
        print(f"  Minor Degradation:    {stats['minor_degradation']:4d} ({stats['minor_degradation']/valid_count*100:5.2f}%)")
        print(f"  Major Degradation:    {stats['major_degradation']:4d} ({stats['major_degradation']/valid_count*100:5.2f}%)")
        print()
        print(f"  Total Improved:       {improved:4d} ({improved/valid_count*100:5.2f}%)")
        print(f"  Total Degraded:       {degraded:4d} ({degraded/valid_count*100:5.2f}%)")
        print()
    
    # SLOC changes
    print("📏 SLOC Changes (All Experiments):")
    print(f"  Reduced:   {stats['sloc_reduced']:4d} ({stats['sloc_reduced']/total*100:5.2f}%)")
    print(f"  Increased: {stats['sloc_increased']:4d} ({stats['sloc_increased']/total*100:5.2f}%)")
    print(f"  Unchanged: {stats['sloc_unchanged']:4d} ({stats['sloc_unchanged']/total*100:5.2f}%)")
    print()
    
    # Complexity changes
    print("🔀 Cyclomatic Complexity Changes (All Experiments):")
    print(f"  Reduced:   {stats['complexity_reduced']:4d} ({stats['complexity_reduced']/total*100:5.2f}%)")
    print(f"  Increased: {stats['complexity_increased']:4d} ({stats['complexity_increased']/total*100:5.2f}%)")
    print(f"  Unchanged: {stats['complexity_unchanged']:4d} ({stats['complexity_unchanged']/total*100:5.2f}%)")
    print()
    
    # Syntax error details
    if syntax_count > 0:
        print("=" * 70)
        print("SYNTAX ERROR DETAILS")
        print("=" * 70)
        print()
        
        for i, case in enumerate(analysis_results['syntax_error_cases'], 1):
            print(f"Case {i}:")
            print(f"  Experiment ID: {case['experiment_id']}")
            print(f"  Smell Type: {case['smell_type']}")
            
            before_sloc = case['before_sloc'] if case['before_sloc'] else 'N/A'
            after_sloc = case['after_sloc']
            if case['before_sloc']:
                change = case['after_sloc'] - case['before_sloc']
                print(f"  SLOC: {before_sloc} → {after_sloc} (change: {change:+d})")
            else:
                print(f"  SLOC: {before_sloc} → {after_sloc} (no baseline)")
            
            before_complexity = case['before_complexity'] if case['before_complexity'] else 'N/A'
            after_complexity = case['after_complexity']
            if case['before_complexity']:
                change = case['after_complexity'] - case['before_complexity']
                print(f"  Cyclomatic: {before_complexity} → {after_complexity} (change: {change:+d})")
            else:
                print(f"  Cyclomatic: {before_complexity} → {after_complexity} (no baseline)")
            print()


def export_to_csv(analysis_results, output_path: str):
    """Export detailed results to CSV for further analysis."""
    
    detailed_results = analysis_results['detailed_results']
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        fieldnames = [
            'experiment_id', 'study_smell_id', 'smell_type',
            'outcome_category',
            'before_sloc', 'after_sloc', 'sloc_change', 'sloc_change_pct',
            'before_complexity', 'after_complexity', 'complexity_change',
            'before_maintainability', 'after_maintainability', 'maintainability_change',
            'before_halstead_effort', 'after_halstead_effort',
            'has_syntax_error'
        ]
        
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for result in detailed_results:
            # Calculate percentage changes
            sloc_change_pct = None
            if result['before_sloc'] and result['sloc_change']:
                sloc_change_pct = (result['sloc_change'] / result['before_sloc']) * 100
            
            writer.writerow({
                'experiment_id': result['experiment_id'],
                'study_smell_id': result['study_smell_id'],
                'smell_type': result['smell_type'] or '',
                'outcome_category': result['category'],
                'before_sloc': result['before_sloc'],
                'after_sloc': result['after_sloc'],
                'sloc_change': result['sloc_change'],
                'sloc_change_pct': f"{sloc_change_pct:.2f}" if sloc_change_pct else '',
                'before_complexity': result['before_complexity'],
                'after_complexity': result['after_complexity'],
                'complexity_change': result['complexity_change'],
                'before_maintainability': result['before_maintainability'],
                'after_maintainability': result['after_maintainability'],
                'maintainability_change': result['maintainability_change'],
                'before_halstead_effort': result['before_halstead_effort'],
                'after_halstead_effort': result['after_halstead_effort'],
                'has_syntax_error': 'TRUE' if result['category'] == 'SYNTAX_ERROR' else 'FALSE'
            })
    
    print(f"✅ Detailed results exported to: {output_path}")
    print()


def main():
    parser = argparse.ArgumentParser(
        description='Analyze code metrics to evaluate LLM refactoring quality'
    )
    parser.add_argument(
        '--output',
        default='code_metrics_analysis.csv',
        help='Output CSV file path (default: code_metrics_analysis.csv)'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show verbose output'
    )
    
    args = parser.parse_args()
    
    # Initialize database connection
    db = ResearchDB()
    session = db.get_session()
    
    try:
        # Analyze metrics
        analysis_results = analyze_metrics(session, verbose=args.verbose)
        
        if not analysis_results:
            print("[ERROR] Analysis failed - no data found")
            return 1
        
        # Print statistics
        print_statistics(analysis_results)
        
        # Export to CSV
        export_to_csv(analysis_results, args.output)
        
        print("=" * 70)
        print("✅ Analysis complete!")
        print("=" * 70)
        
        return 0
        
    finally:
        session.close()


if __name__ == '__main__':
    sys.exit(main())
