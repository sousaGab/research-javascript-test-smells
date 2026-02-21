"""
Smell Analysis Core Module.

Provides robust smell comparison with name normalization to handle
variations in smell type naming (case, spaces, special characters).
"""

import re
from pathlib import Path
from typing import Dict, Tuple, Optional
from functools import lru_cache
import pandas as pd


@lru_cache(maxsize=128)
def normalize_smell_name(smell_name: str) -> str:
    """
    Normalize smell name for robust comparison.
    
    Removes:
    - Case sensitivity (converts to lowercase)
    - Spaces
    - Underscores
    - Hyphens
    - All other non-alphanumeric characters
    
    Args:
        smell_name: Original smell name (e.g., "Duplicate Assert", "duplicate_assert")
        
    Returns:
        Normalized name (e.g., "duplicateassert")
        
    Examples:
        >>> normalize_smell_name("Duplicate Assert")
        'duplicateassert'
        >>> normalize_smell_name("duplicate_assert")
        'duplicateassert'
        >>> normalize_smell_name("DUPLICATE-ASSERT")
        'duplicateassert'
        >>> normalize_smell_name("Magic Number!")
        'magicnumber'
    """
    if not smell_name:
        return ""
    
    # Convert to lowercase
    normalized = smell_name.lower()
    
    # Remove all non-alphanumeric characters
    normalized = re.sub(r'[^a-z0-9]', '', normalized)
    
    return normalized


def smell_names_match(name1: str, name2: str) -> bool:
    """
    Check if two smell names match after normalization.
    
    Args:
        name1: First smell name
        name2: Second smell name
        
    Returns:
        True if names match after normalization
        
    Examples:
        >>> smell_names_match("Duplicate Assert", "duplicate_assert")
        True
        >>> smell_names_match("MagicNumber", "Magic Number")
        True
        >>> smell_names_match("DuplicateAssert", "MagicNumber")
        False
    """
    return normalize_smell_name(name1) == normalize_smell_name(name2)


class SmellAnalyzer:
    """
    Analyzer for comparing smell detection results before and after refactoring.
    
    Handles:
    - Loading and parsing smell CSV files
    - Normalizing smell names for robust comparison
    - Counting smells by type and file
    - Generating comprehensive comparison reports
    """
    
    def load_smell_csv(self, csv_path: Path) -> Optional[pd.DataFrame]:
        """
        Load smell CSV and add normalized type column.
        
        Args:
            csv_path: Path to smells CSV file
            
        Returns:
            DataFrame with added 'normalized_type' column, or None if loading fails
        """
        try:
            if not csv_path.exists():
                return None
            
            df = pd.read_csv(csv_path)
            
            # Validate required columns
            required_cols = ['file', 'type', 'line', 'method', 'methodStart', 'methodEnd', 'source']
            missing = [col for col in required_cols if col not in df.columns]
            if missing:
                print(f"Warning: CSV missing columns: {missing}")
                return None
            
            # Add normalized type column for robust comparison
            df['normalized_type'] = df['type'].apply(normalize_smell_name)
            
            return df
            
        except Exception as e:
            print(f"Error loading CSV {csv_path}: {e}")
            return None
    
    def count_by_type(self, df: pd.DataFrame, use_normalized: bool = True) -> Dict[str, int]:
        """
        Count smells grouped by type.
        
        Args:
            df: DataFrame with smell data
            use_normalized: If True, group by normalized_type; otherwise by original type
            
        Returns:
            Dict mapping smell type to count
        """
        if df is None or df.empty:
            return {}
        
        type_col = 'normalized_type' if use_normalized else 'type'
        
        if type_col not in df.columns:
            return {}
        
        counts = df[type_col].value_counts().to_dict()
        return counts
    
    def count_by_file_and_type(self, df: pd.DataFrame, use_normalized: bool = True) -> Dict[Tuple[str, str], int]:
        """
        Count smells grouped by file and type.
        
        Args:
            df: DataFrame with smell data
            use_normalized: If True, use normalized_type; otherwise original type
            
        Returns:
            Dict mapping (file, smell_type) to count
        """
        if df is None or df.empty:
            return {}
        
        type_col = 'normalized_type' if use_normalized else 'type'
        
        if type_col not in df.columns or 'file' not in df.columns:
            return {}
        
        counts = df.groupby(['file', type_col]).size().to_dict()
        return counts
    
    def _get_original_smell_name(self, df: pd.DataFrame, normalized_name: str) -> str:
        """
        Get the original smell name from a normalized name.
        
        Args:
            df: DataFrame with smell data
            normalized_name: Normalized smell name
            
        Returns:
            Original smell name (first occurrence)
        """
        if df is None or df.empty:
            return normalized_name
        
        matches = df[df['normalized_type'] == normalized_name]
        if not matches.empty:
            return matches.iloc[0]['type']
        
        return normalized_name
    
    def compare_repositories(self, baseline_df: pd.DataFrame, refactored_df: pd.DataFrame, 
                           target_file: str, target_smell: str) -> Dict:
        """
        Compare smell detection results between baseline and refactored versions.
        
        Performs global repository-wide comparison to detect side effects.
        
        Args:
            baseline_df: DataFrame with baseline smell detection results
            refactored_df: DataFrame with refactored smell detection results
            target_file: File path that was refactored
            target_smell: Type of smell that was targeted for removal
            
        Returns:
            Dict with comprehensive analysis:
            {
                'target_smell_analysis': {...},
                'repository_wide_changes': {...},
                'summary': {...},
                'normalization_info': {...}
            }
        """
        if baseline_df is None or refactored_df is None:
            return {
                'error': 'Invalid DataFrames provided',
                'summary': {
                    'target_smell_removed': False,
                    'introduced_new_smells': False
                }
            }
        
        # Normalize target smell name for comparison
        target_smell_normalized = normalize_smell_name(target_smell)
        
        # Count smells by type (normalized) for repository-wide analysis
        baseline_counts = self.count_by_type(baseline_df, use_normalized=True)
        refactored_counts = self.count_by_type(refactored_df, use_normalized=True)
        
        # Get all unique smell types (normalized)
        all_smell_types = set(baseline_counts.keys()) | set(refactored_counts.keys())
        
        # Analyze target smell specifically in target file
        baseline_target_file = baseline_df[baseline_df['file'].str.contains(target_file, na=False, regex=False)]
        refactored_target_file = refactored_df[refactored_df['file'].str.contains(target_file, na=False, regex=False)]
        
        baseline_target_smell = baseline_target_file[
            baseline_target_file['normalized_type'] == target_smell_normalized
        ]
        refactored_target_smell = refactored_target_file[
            refactored_target_file['normalized_type'] == target_smell_normalized
        ]
        
        target_count_before = len(baseline_target_smell)
        target_count_after = len(refactored_target_smell)
        target_smell_removed = target_count_after < target_count_before
        
        # Find original name for target smell
        target_smell_original = self._get_original_smell_name(baseline_df, target_smell_normalized)
        
        # Find variants of target smell name
        target_smell_variants = list(set(
            baseline_df[baseline_df['normalized_type'] == target_smell_normalized]['type'].tolist() +
            refactored_df[refactored_df['normalized_type'] == target_smell_normalized]['type'].tolist()
        ))
        
        # Repository-wide changes (only reduced and increased, not unchanged)
        smells_reduced = []
        smells_increased = []
        
        for smell_type_normalized in all_smell_types:
            before = baseline_counts.get(smell_type_normalized, 0)
            after = refactored_counts.get(smell_type_normalized, 0)
            diff = after - before
            
            # Skip unchanged smells
            if diff == 0:
                continue
            
            # Get original name
            original_name = (
                self._get_original_smell_name(refactored_df, smell_type_normalized) 
                if after > 0 
                else self._get_original_smell_name(baseline_df, smell_type_normalized)
            )
            
            change_entry = {
                'type': original_name,
                'type_normalized': smell_type_normalized,
                'before': before,
                'after': after,
                'diff': diff
            }
            
            if diff < 0:
                smells_reduced.append(change_entry)
            elif diff > 0:
                smells_increased.append(change_entry)
        
        # Sort by absolute difference
        smells_reduced.sort(key=lambda x: abs(x['diff']), reverse=True)
        smells_increased.sort(key=lambda x: abs(x['diff']), reverse=True)
        
        # Summary
        total_before = len(baseline_df)
        total_after = len(refactored_df)
        introduced_new_smells = len(smells_increased) > 0
        
        return {
            'target_smell_analysis': {
                'smell_type_original': target_smell_original,
                'smell_type_normalized': target_smell_normalized,
                'target_file': target_file,
                'original_count_in_file': target_count_before,
                'refactored_count_in_file': target_count_after,
                'removed': target_smell_removed,
                'reduction_count': target_count_before - target_count_after
            },
            'repository_wide_changes': {
                'smells_reduced': smells_reduced,
                'smells_increased': smells_increased
            },
            'summary': {
                'target_smell_removed': target_smell_removed,
                'introduced_new_smells': introduced_new_smells,
                'total_smell_count_before': total_before,
                'total_smell_count_after': total_after,
                'net_change': total_after - total_before,
                'types_reduced': len(smells_reduced),
                'types_increased': len(smells_increased)
            },
            'normalization_info': {
                'note': 'Smell names normalized for comparison (lowercase, no spaces/special chars)',
                'target_smell_variants_found': target_smell_variants
            }
        }
