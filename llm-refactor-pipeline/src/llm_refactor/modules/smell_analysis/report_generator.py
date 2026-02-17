"""
Smell Analysis Report Generator.

Exports smell analysis results to JSON format with metadata and timestamps.
"""

import json
from pathlib import Path
from typing import Dict
from datetime import datetime


def save_analysis_json(analysis_data: Dict, output_path: Path, 
                       experiment_metadata: Dict = None) -> bool:
    """
    Save smell analysis results to JSON file.
    
    Creates a comprehensive JSON report with:
    - Experiment metadata
    - Target smell analysis
    - Repository-wide changes
    - Summary statistics
    - Normalization information
    
    Args:
        analysis_data: Analysis results from SmellAnalyzer.compare_repositories()
        output_path: Path where JSON file should be saved
        experiment_metadata: Optional dict with experiment info (id, strategy, model, etc.)
        
    Returns:
        True if successful, False otherwise
        
    Example output structure:
        {
            "metadata": {
                "generated_at": "2026-02-17T10:30:45",
                "experiment_id": 1,
                "strategy": "zero-shot",
                "model": "qwen-2.5-coder-32b"
            },
            "target_smell_analysis": {...},
            "repository_wide_changes": {...},
            "summary": {...},
            "normalization_info": {...}
        }
    """
    try:
        # Ensure output directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Build complete report
        report = {
            'metadata': {
                'generated_at': datetime.utcnow().isoformat(),
                'format_version': '1.0'
            }
        }
        
        # Add experiment metadata if provided
        if experiment_metadata:
            report['metadata'].update(experiment_metadata)
        
        # Add analysis data
        if 'error' in analysis_data:
            report['error'] = analysis_data['error']
            report['summary'] = analysis_data.get('summary', {})
        else:
            report['target_smell_analysis'] = analysis_data.get('target_smell_analysis', {})
            report['repository_wide_changes'] = analysis_data.get('repository_wide_changes', {})
            report['summary'] = analysis_data.get('summary', {})
            report['normalization_info'] = analysis_data.get('normalization_info', {})
        
        # Write JSON with pretty formatting
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        return True
        
    except (OSError, IOError, json.JSONDecodeError) as e:
        print(f"Error saving analysis JSON to {output_path}: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error saving analysis JSON: {e}")
        return False


def format_analysis_summary(analysis_data: Dict) -> str:
    """
    Format analysis results as human-readable text summary.
    
    Args:
        analysis_data: Analysis results from SmellAnalyzer.compare_repositories()
        
    Returns:
        Formatted string summarizing key findings
    """
    if 'error' in analysis_data:
        return f"Analysis Error: {analysis_data['error']}"
    
    target = analysis_data.get('target_smell_analysis', {})
    summary = analysis_data.get('summary', {})
    repo_changes = analysis_data.get('repository_wide_changes', {})
    
    lines = []
    
    # Target smell
    lines.append("TARGET SMELL ANALYSIS:")
    lines.append(f"  Type: {target.get('smell_type_original', 'N/A')}")
    lines.append(f"  File: {target.get('target_file', 'N/A')}")
    lines.append(f"  Before: {target.get('original_count_in_file', 0)} occurrences")
    lines.append(f"  After: {target.get('refactored_count_in_file', 0)} occurrences")
    
    if target.get('removed', False):
        reduction = target.get('reduction_count', 0)
        lines.append(f"  ✓ Removed: Yes ({reduction} fewer)")
    else:
        lines.append("  ✗ Removed: No")
    
    lines.append("")
    
    # Repository-wide changes
    lines.append("REPOSITORY-WIDE IMPACT:")
    lines.append(f"  Total smells before: {summary.get('total_smell_count_before', 0)}")
    lines.append(f"  Total smells after: {summary.get('total_smell_count_after', 0)}")
    lines.append(f"  Net change: {summary.get('net_change', 0):+d}")
    lines.append("")
    
    # Increased smells
    increased = repo_changes.get('smells_increased', [])
    if increased:
        lines.append(f"  Smell types increased ({len(increased)}):")
        for smell in increased[:5]:  # Show top 5
            lines.append(f"    - {smell['type']}: {smell['before']} → {smell['after']} ({smell['diff']:+d})")
        if len(increased) > 5:
            lines.append(f"    ... and {len(increased) - 5} more")
    else:
        lines.append("  No smell types increased")
    
    lines.append("")
    
    # Reduced smells
    reduced = repo_changes.get('smells_reduced', [])
    if reduced:
        lines.append(f"  Smell types reduced ({len(reduced)}):")
        for smell in reduced[:5]:  # Show top 5
            lines.append(f"    - {smell['type']}: {smell['before']} → {smell['after']} ({smell['diff']:+d})")
        if len(reduced) > 5:
            lines.append(f"    ... and {len(reduced) - 5} more")
    else:
        lines.append("  No smell types reduced")
    
    return "\n".join(lines)
