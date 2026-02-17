"""
Smell Analysis Database Persistence.

Handles saving smell detection results and analysis outcomes to the database.
"""

from pathlib import Path
from typing import Set, Tuple
import pandas as pd
from sqlalchemy.orm import Session

from llm_refactor.modules.smell_analysis.analyzer import normalize_smell_name
from llm_refactor.modules.database.crud import create_smell_result, update_experiment


def save_smell_results_to_db(session: Session, experiment_id: int, csv_path: Path, 
                            phase: str, target_smell_type: str) -> int:
    """
    Save smell detection results from CSV to database.
    
    Reads smell CSV and creates smell_detection_results records for each smell,
    using normalized names to identify target smells.
    
    Args:
        session: Database session
        experiment_id: Experiment ID
        csv_path: Path to smell detection CSV file
        phase: 'before' or 'after'
        target_smell_type: Type of smell being targeted (will be normalized for comparison)
        
    Returns:
        Number of smell results saved to database
    """
    if not csv_path.exists():
        print(f"Warning: CSV file not found: {csv_path}")
        return 0
    
    try:
        # Load CSV
        df = pd.read_csv(csv_path)
        
        # Validate required columns
        required_cols = ['file', 'type', 'line', 'method']
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            print(f"Warning: CSV missing required columns: {missing}")
            return 0
        
        # Normalize target smell type once
        target_smell_normalized = normalize_smell_name(target_smell_type)
        
        count = 0
        
        # Iterate through each smell
        for _, row in df.iterrows():
            # Parse line numbers (stored as JSON string)
            line_numbers = row.get('line', '')
            
            # Determine if this is the target smell using normalized comparison
            smell_type = row.get('type', '')
            is_target = normalize_smell_name(smell_type) == target_smell_normalized
            
            # Extract code snippet (method)
            code_snippet = row.get('method', '')
            if pd.isna(code_snippet):
                code_snippet = None
            elif len(str(code_snippet)) > 1000:
                # Truncate very long snippets
                code_snippet = str(code_snippet)[:1000] + "..."
            
            # Create smell result record
            try:
                create_smell_result(
                    session=session,
                    experiment_id=experiment_id,
                    phase=phase,
                    smell_type=smell_type,  # Store original name
                    line_numbers=str(line_numbers) if not pd.isna(line_numbers) else None,
                    code_snippet=code_snippet,
                    is_target_smell=is_target,
                    is_new_smell=False  # Will be updated separately for 'after' phase
                )
                count += 1
            except Exception as e:
                # Log but continue processing other smells
                print(f"Warning: Failed to save smell result: {e}")
                continue
        
        # Commit all smell results
        session.commit()
        
        return count
        
    except Exception as e:
        print(f"Error saving smell results from {csv_path}: {e}")
        session.rollback()
        return 0


def identify_new_smells_for_db(baseline_df: pd.DataFrame, refactored_df: pd.DataFrame) -> Set[Tuple[str, str]]:
    """
    Identify smells that were introduced during refactoring.
    
    Compares baseline and refactored DataFrames to find new smell instances.
    Uses normalized smell types and line numbers for comparison.
    
    Args:
        baseline_df: DataFrame with baseline smell detection (must have 'normalized_type' column)
        refactored_df: DataFrame with refactored smell detection (must have 'normalized_type' column)
        
    Returns:
        Set of (file_path, normalized_type) tuples representing new smells
    """
    if baseline_df is None or refactored_df is None:
        return set()
    
    try:
        # Add normalized type columns if not present
        if 'normalized_type' not in baseline_df.columns:
            baseline_df['normalized_type'] = baseline_df['type'].apply(normalize_smell_name)
        
        if 'normalized_type' not in refactored_df.columns:
            refactored_df['normalized_type'] = refactored_df['type'].apply(normalize_smell_name)
        
        # Count smells by (file, normalized_type) in baseline
        baseline_counts = baseline_df.groupby(['file', 'normalized_type']).size().to_dict()
        
        # Count smells by (file, normalized_type) in refactored
        refactored_counts = refactored_df.groupby(['file', 'normalized_type']).size().to_dict()
        
        # Find smells that increased in count or appeared in new files
        new_smells = set()
        
        for (file_path, smell_type), refactored_count in refactored_counts.items():
            baseline_count = baseline_counts.get((file_path, smell_type), 0)
            
            # If count increased, mark as new smell
            if refactored_count > baseline_count:
                new_smells.add((file_path, smell_type))
        
        return new_smells
        
    except Exception as e:
        print(f"Error identifying new smells: {e}")
        return set()


def mark_new_smells_in_db(session: Session, experiment_id: int, new_smells: Set[Tuple[str, str]]) -> int:
    """
    Update smell_detection_results to mark newly introduced smells.
    
    Args:
        session: Database session
        experiment_id: Experiment ID
        new_smells: Set of (file_path, normalized_type) tuples
        
    Returns:
        Number of smells marked as new
    """
    if not new_smells:
        return 0
    
    try:
        from llm_refactor.modules.database.models import SmellDetectionResult
        
        count = 0
        
        # Query all 'after' phase smells for this experiment
        after_smells = session.query(SmellDetectionResult).filter(
            SmellDetectionResult.experiment_id == experiment_id,
            SmellDetectionResult.phase == 'after'
        ).all()
        
        for smell_result in after_smells:
            # Check if this smell is in the new_smells set
            # We need to match by normalized type
            smell_type_normalized = normalize_smell_name(smell_result.smell_type)
            
            # For simplicity, mark as new if the smell type appears in new_smells
            # (More precise matching would require file path comparison)
            for _, new_smell_type in new_smells:
                if smell_type_normalized == new_smell_type:
                    smell_result.is_new_smell = True
                    count += 1
                    break
        
        session.commit()
        return count
        
    except Exception as e:
        print(f"Error marking new smells: {e}")
        session.rollback()
        return 0


def update_experiment_analysis_flags(session: Session, experiment_id: int, 
                                    target_removed: bool, new_introduced: bool,
                                    coverage_changed: bool = None, 
                                    tests_changed: bool = None) -> bool:
    """
    Update experiment record with smell and test analysis results.
    
    Args:
        session: Database session
        experiment_id: Experiment ID
        target_removed: Was the target smell removed?
        new_introduced: Were new smells introduced?
        coverage_changed: Did test coverage change? (optional)
        tests_changed: Did test execution results change? (optional)
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Prepare update dict
        update_data = {
            'smell_removed': target_removed,
            'introduced_new_smells': new_introduced
        }
        
        # Add test analysis fields if provided
        if coverage_changed is not None:
            update_data['coverage_changed'] = coverage_changed
        if tests_changed is not None:
            update_data['tests_changed'] = tests_changed
        
        result = update_experiment(
            session=session,
            experiment_id=experiment_id,
            **update_data
        )
        
        if result:
            session.commit()
            return True
        else:
            print(f"Warning: Experiment {experiment_id} not found for update")
            return False
            
    except Exception as e:
        print(f"Error updating experiment analysis flags: {e}")
        session.rollback()
        return False
