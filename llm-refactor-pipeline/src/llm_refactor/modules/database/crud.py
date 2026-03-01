"""
CRUD (Create, Read, Update, Delete) operations for the research database.

This module provides high-level functions for managing all database entities.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from .models import (
    Repository, File, DetectedSmells, BaselineSmellDetections, StudySmells, Experiment,
    SmellDetectionResult, CodeMetric, TestResult, AIResponse, SmellUIMetadata
)


# =============================================================================
# REPOSITORIES
# =============================================================================

def create_repository(session: Session, name: str, url: Optional[str] = None,
                     stars: Optional[int] = None, language: str = 'JavaScript') -> Repository:
    """
    Create a new repository.

    Args:
        session: Database session
        name: Repository name (unique)
        url: Repository URL (optional)
        stars: Number of stars (optional)
        language: Programming language (default: JavaScript)

    Returns:
        Repository: Created repository object

    Raises:
        IntegrityError: If repository with same name already exists
    """
    repo = Repository(name=name, url=url, stars=stars, language=language)
    session.add(repo)
    session.flush()  # Get the ID without committing
    return repo


def get_repository(session: Session, repo_id: Optional[int] = None,
                   name: Optional[str] = None) -> Optional[Repository]:
    """
    Get a repository by ID or name.

    Args:
        session: Database session
        repo_id: Repository ID (optional)
        name: Repository name (optional)

    Returns:
        Repository or None if not found
    """
    if repo_id:
        return session.query(Repository).filter_by(id=repo_id).first()
    elif name:
        return session.query(Repository).filter_by(name=name).first()
    return None


def get_all_repositories(session: Session) -> List[Repository]:
    """Get all repositories."""
    return session.query(Repository).all()


def get_or_create_repository(session: Session, name: str, **kwargs) -> tuple[Repository, bool]:
    """
    Get existing repository or create new one.

    Args:
        session: Database session
        name: Repository name
        **kwargs: Additional fields for creation (url, stars, language)

    Returns:
        tuple: (repository, created) where created is True if newly created
    """
    repo = get_repository(session, name=name)
    if repo:
        return (repo, False)

    repo = create_repository(session, name=name, **kwargs)
    return (repo, True)


def update_repository(session: Session, repo_id: int, **kwargs) -> Optional[Repository]:
    """
    Update repository fields.

    Args:
        session: Database session
        repo_id: Repository ID
        **kwargs: Fields to update (name, url, stars, language)

    Returns:
        Updated repository or None if not found
    """
    repo = get_repository(session, repo_id=repo_id)
    if not repo:
        return None

    for key, value in kwargs.items():
        if hasattr(repo, key):
            setattr(repo, key, value)

    repo.updated_at = datetime.utcnow()
    session.flush()
    return repo


# =============================================================================
# FILES
# =============================================================================

def create_file(session: Session, repository_id: int, path: str,
               file_type: str = 'test') -> File:
    """
    Create a new file entry.

    Args:
        session: Database session
        repository_id: Repository ID
        path: File path (e.g., '/test/parse.test.js')
        file_type: File type (default: 'test')

    Returns:
        File: Created file object
    """
    file = File(repository_id=repository_id, path=path, file_type=file_type)
    session.add(file)
    session.flush()
    return file


def get_file(session: Session, file_id: Optional[int] = None,
            repository_id: Optional[int] = None, path: Optional[str] = None) -> Optional[File]:
    """
    Get a file by ID or by repository + path.

    Args:
        session: Database session
        file_id: File ID (optional)
        repository_id: Repository ID (optional, must be used with path)
        path: File path (optional, must be used with repository_id)

    Returns:
        File or None if not found
    """
    if file_id:
        return session.query(File).filter_by(id=file_id).first()
    elif repository_id and path:
        return session.query(File).filter_by(repository_id=repository_id, path=path).first()
    return None


def get_files_by_repository(session: Session, repository_id: int) -> List[File]:
    """Get all files in a repository."""
    return session.query(File).filter_by(repository_id=repository_id).all()


def get_or_create_file(session: Session, repository_id: int, path: str,
                      **kwargs) -> tuple[File, bool]:
    """
    Get existing file or create new one.

    Args:
        session: Database session
        repository_id: Repository ID
        path: File path
        **kwargs: Additional fields for creation

    Returns:
        tuple: (file, created)
    """
    file = get_file(session, repository_id=repository_id, path=path)
    if file:
        return (file, False)

    file = create_file(session, repository_id=repository_id, path=path, **kwargs)
    return (file, True)


# =============================================================================
# DETECTED SMELLS (All smells found in repository)
# =============================================================================

def create_detected_smell(session: Session, file_id: int, smell_type: str,
                         line_numbers: Optional[str] = None,
                         severity: Optional[str] = None,
                         code_snippet: Optional[str] = None,
                         snippet_start_line: Optional[int] = None,
                         snippet_end_line: Optional[int] = None,
                         detection_tool: Optional[str] = None) -> DetectedSmells:
    """
    Create a detected smell record (from initial repository scan).

    Args:
        session: Database session
        file_id: File ID
        smell_type: Type of smell (e.g., 'Assertion Roulette')
        line_numbers: JSON string of line numbers (optional)
        severity: Severity level (optional)
        code_snippet: Code snippet showing the smell (optional)
        detection_tool: Tool used for detection (e.g., 'steel', 'tsDetect')

    Returns:
        DetectedSmells: Created smell detection object
    """
    smell = DetectedSmells(
        file_id=file_id,
        smell_type=smell_type,
        line_numbers=line_numbers,
        severity=severity,
        code_snippet=code_snippet,
        snippet_start_line=snippet_start_line,
        snippet_end_line=snippet_end_line,
        detection_tool=detection_tool
    )
    session.add(smell)
    session.flush()
    return smell


def get_detected_smells_by_file(session: Session, file_id: int) -> List[DetectedSmells]:
    """Get all detected smells for a file."""
    return session.query(DetectedSmells).filter_by(file_id=file_id).all()


# =============================================================================
# STUDY SMELLS (Smells selected for experiments)
# =============================================================================

def create_study_smell(session: Session, file_id: int, smell_type: str,
                      line_numbers: Optional[str] = None,
                      severity: Optional[str] = None,
                      code_snippet: Optional[str] = None,
                      detection_tool: Optional[str] = None) -> StudySmells:
    """
    Create a study smell record (selected for refactoring experiments).

    Args:
        session: Database session
        file_id: File ID
        smell_type: Type of smell (e.g., 'Assertion Roulette')
        line_numbers: JSON string of line numbers (optional)
        severity: Severity level (optional)
        code_snippet: Code snippet showing the smell (optional)
        detection_tool: Tool used for detection (e.g., 'steel', 'tsDetect')

    Returns:
        StudySmells: Created study smell object
    """
    smell = StudySmells(
        file_id=file_id,
        smell_type=smell_type,
        line_numbers=line_numbers,
        severity=severity,
        code_snippet=code_snippet,
        detection_tool=detection_tool
    )
    session.add(smell)
    session.flush()
    return smell


def get_study_smell(session: Session, smell_id: int) -> Optional[StudySmells]:
    """Get a study smell by ID."""
    return session.query(StudySmells).filter_by(id=smell_id).first()


def get_study_smells_by_file(session: Session, file_id: int) -> List[StudySmells]:
    """Get all study smells for a file."""
    return session.query(StudySmells).filter_by(file_id=file_id).all()


def get_study_smells_by_type(session: Session, smell_type: str) -> List[StudySmells]:
    """Get all study smells of a specific type."""
    return session.query(StudySmells).filter_by(smell_type=smell_type).all()


def get_or_create_baseline_smell_from_study(session: Session, 
                                            study_smell: StudySmells) -> BaselineSmellDetections:
    """
    Get or create a baseline_smell_detection entry from a study_smell.
    
    This is useful when creating experiments from study_smells, as experiments
    reference baseline_smell_detections.
    
    Args:
        session: Database session
        study_smell: StudySmells object
        
    Returns:
        BaselineSmellDetections: Existing or newly created baseline smell
    """
    # Try to find existing baseline smell with same attributes
    baseline = session.query(BaselineSmellDetections).filter_by(
        file_id=study_smell.file_id,
        smell_type=study_smell.smell_type,
        line_numbers=study_smell.line_numbers
    ).first()
    
    if baseline:
        return baseline
    
    # Create new baseline smell from study smell data
    baseline = BaselineSmellDetections(
        file_id=study_smell.file_id,
        smell_type=study_smell.smell_type,
        line_numbers=study_smell.line_numbers,
        severity=study_smell.severity,
        code_snippet=study_smell.code_snippet,
        snippet_start_line=study_smell.snippet_start_line,
        snippet_end_line=study_smell.snippet_end_line,
        detection_tool=study_smell.detection_tool
    )
    session.add(baseline)
    session.flush()
    
    return baseline


# =============================================================================
# EXPERIMENTS
# =============================================================================

def create_experiment(session: Session,
                     baseline_smell_id: int,
                     file_id: int,
                     ai_tool: str,
                     original_code: str,
                     study_smell_id: Optional[int] = None,
                     ai_model_version: Optional[str] = None,
                     prompting_approach: Optional[str] = None,
                     prompt_text: Optional[str] = None,
                     refactored_code: Optional[str] = None,
                     original_method: Optional[str] = None,
                     refactored_method: Optional[str] = None,
                     **kwargs) -> Experiment:
    """
    Create a new experiment record.

    Args:
        session: Database session
        baseline_smell_id: ID of baseline smell (required for schema compatibility)
        file_id: File ID
        ai_tool: AI tool used (e.g., 'HuggingFace', 'Claude', 'GPT-4')
        original_code: Original code before refactoring
        study_smell_id: ID of the study smell being addressed (optional)
        ai_model_version: AI model version (optional)
        prompting_approach: Prompting strategy (optional)
        prompt_text: Full prompt sent to AI (optional)
        refactored_code: Refactored code (optional)
        original_method: Original method code (optional)
        refactored_method: Refactored method code (optional)
        **kwargs: Additional fields (refactoring_completed, smell_removed, etc.)

    Returns:
        Experiment: Created experiment object
        
    Note:
        Both baseline_smell_id and study_smell_id can be provided.
        Use get_or_create_baseline_smell_from_study() to create baseline from study smell.
    """
    experiment = Experiment(
        baseline_smell_id=baseline_smell_id,
        study_smell_id=study_smell_id,
        file_id=file_id,
        ai_tool=ai_tool,
        ai_model_version=ai_model_version,
        prompting_approach=prompting_approach,
        prompt_text=prompt_text,
        original_code=original_code,
        refactored_code=refactored_code,
        original_method=original_method,
        refactored_method=refactored_method,
        **kwargs
    )
    session.add(experiment)
    session.flush()
    return experiment


def get_experiment(session: Session, experiment_id: int) -> Optional[Experiment]:
    """Get an experiment by ID."""
    return session.query(Experiment).filter_by(id=experiment_id).first()


def get_experiments_by_ai_tool(session: Session, ai_tool: str) -> List[Experiment]:
    """Get all experiments for a specific AI tool."""
    return session.query(Experiment).filter_by(ai_tool=ai_tool).all()


def get_experiments_by_repository(session: Session, repository_id: int) -> List[Experiment]:
    """Get all experiments for a repository."""
    return session.query(Experiment)\
        .join(File)\
        .filter(File.repository_id == repository_id)\
        .all()


def get_successful_experiments(session: Session) -> List[Experiment]:
    """Get all experiments where smell was removed."""
    return session.query(Experiment).filter_by(smell_removed=True).all()


def get_experiment_with_relations(session: Session, experiment_id: int) -> Optional[Experiment]:
    """
    Get an experiment by ID with all relationships loaded.
    
    This loads: study_smell, baseline_smell, file, file.repository
    Useful for execution phase which needs complete experiment context.
    
    Args:
        session: Database session
        experiment_id: Experiment ID
    
    Returns:
        Experiment with relationships or None if not found
    """
    from sqlalchemy.orm import joinedload
    
    return session.query(Experiment)\
        .filter_by(id=experiment_id)\
        .options(
            joinedload(Experiment.study_smell),
            joinedload(Experiment.baseline_smell),
            joinedload(Experiment.file).joinedload(File.repository)
        )\
        .first()


def find_experiment_by_smell_strategy_model(
    session: Session,
    study_smell_id: int,
    prompting_approach: str,
    ai_model_version: str
) -> Optional[Experiment]:
    """
    Find existing experiment by smell ID, strategy, and model.
    
    Used to check if experiment already exists before creating new one.
    
    Args:
        session: Database session
        study_smell_id: Study smell ID
        prompting_approach: Strategy name (e.g., "Chain-of-Thought")
        ai_model_version: Model name (e.g., "Qwen 2.5 Coder 32B")
    
    Returns:
        Experiment or None if not found
    """
    return session.query(Experiment)\
        .filter_by(
            study_smell_id=study_smell_id,
            prompting_approach=prompting_approach
        )\
        .filter(Experiment.ai_model_version.like(f"%{ai_model_version[:20]}%"))\
        .first()


def get_refactored_pending_execution(
    session: Session,
    strategy: Optional[str] = None,
    model: Optional[str] = None
) -> List[Experiment]:
    """
    Get experiments with refactoring completed but execution pending.
    
    These are experiments stuck in Phase 1 (refactored but not tested).
    Useful for resuming interrupted batch processing.
    
    Args:
        session: Database session
        strategy: Filter by prompting approach (optional)
        model: Filter by AI model version (optional)
    
    Returns:
        List of experiments ready for execution phase
    """
    query = session.query(Experiment)\
        .filter_by(
            refactor_phase_completed=True,
            execution_phase_completed=False
        )
    
    if strategy:
        query = query.filter_by(prompting_approach=strategy)
    
    if model:
        query = query.filter(Experiment.ai_model_version.like(f"%{model[:20]}%"))
    
    return query.all()


def get_failed_experiments(
    session: Session,
    strategy: Optional[str] = None,
    model: Optional[str] = None
) -> List[Experiment]:
    """
    Get experiments that failed (incomplete or with errors).
    
    Identifies experiments where:
    - Refactoring started but not completed
    - Tests failed after refactoring
    - Neither phase completed
    
    Args:
        session: Database session
        strategy: Filter by prompting approach (optional)
        model: Filter by AI model version (optional)
    
    Returns:
        List of failed/incomplete experiments
    """
    query = session.query(Experiment)\
        .filter(
            (Experiment.refactor_phase_completed == False) |
            (
                (Experiment.refactor_phase_completed == True) &
                (Experiment.execution_phase_completed == False) &
                (Experiment.refactored_code.isnot(None))
            )
        )
    
    if strategy:
        query = query.filter_by(prompting_approach=strategy)
    
    if model:
        query = query.filter(Experiment.ai_model_version.like(f"%{model[:20]}%"))
    
    return query.all()


def update_experiment(session: Session, experiment_id: int, **kwargs) -> Optional[Experiment]:
    """
    Update experiment fields.

    Args:
        session: Database session
        experiment_id: Experiment ID
        **kwargs: Fields to update

    Returns:
        Updated experiment or None if not found
    """
    exp = get_experiment(session, experiment_id)
    if not exp:
        return None

    for key, value in kwargs.items():
        if hasattr(exp, key):
            setattr(exp, key, value)

    exp.updated_at = datetime.utcnow()
    session.flush()
    return exp


def delete_experiment(session: Session, experiment_id: int) -> bool:
    """
    Delete an experiment (cascade deletes related data).

    Args:
        session: Database session
        experiment_id: Experiment ID

    Returns:
        bool: True if deleted, False if not found
    """
    exp = get_experiment(session, experiment_id)
    if not exp:
        return False

    session.delete(exp)
    session.flush()
    return True


# =============================================================================
# SMELL DETECTION RESULTS
# =============================================================================

def create_smell_result(session: Session, experiment_id: int, phase: str,
                       smell_type: str,
                       line_numbers: Optional[str] = None,
                       severity: Optional[str] = None,
                       code_snippet: Optional[str] = None,
                       is_target_smell: bool = False,
                       is_new_smell: bool = False) -> SmellDetectionResult:
    """
    Create a smell detection result for an experiment phase.

    Args:
        session: Database session
        experiment_id: Experiment ID
        phase: 'before' or 'after'
        smell_type: Type of smell
        line_numbers: JSON string of line numbers (optional)
        severity: Severity level (optional)
        code_snippet: Code snippet (optional)
        is_target_smell: Was this the target smell being fixed? (default: False)
        is_new_smell: Was this introduced by refactoring? (default: False)

    Returns:
        SmellDetectionResult: Created smell result object
    """
    result = SmellDetectionResult(
        experiment_id=experiment_id,
        phase=phase,
        smell_type=smell_type,
        line_numbers=line_numbers,
        severity=severity,
        code_snippet=code_snippet,
        is_target_smell=is_target_smell,
        is_new_smell=is_new_smell
    )
    session.add(result)
    session.flush()
    return result


def get_smell_results(session: Session, experiment_id: int,
                     phase: Optional[str] = None) -> List[SmellDetectionResult]:
    """
    Get smell detection results for an experiment.

    Args:
        session: Database session
        experiment_id: Experiment ID
        phase: Filter by phase ('before' or 'after'), optional

    Returns:
        List of smell detection results
    """
    query = session.query(SmellDetectionResult).filter_by(experiment_id=experiment_id)
    if phase:
        query = query.filter_by(phase=phase)
    return query.all()


# =============================================================================
# CODE METRICS
# =============================================================================

def create_code_metrics(session: Session, experiment_id: int, phase: str,
                       sloc_logical: Optional[int] = None,
                       cyclomatic_complexity: Optional[int] = None,
                       cyclomatic_density: Optional[float] = None,
                       halstead_effort: Optional[float] = None,
                       halstead_bugs: Optional[float] = None,
                       halstead_difficulty: Optional[float] = None,
                       halstead_volume: Optional[float] = None,
                       maintainability_index: Optional[float] = None) -> CodeMetric:
    """
    Create code metrics for an experiment phase.

    Args:
        session: Database session
        experiment_id: Experiment ID
        phase: 'before' or 'after'
        sloc_logical: Logical SLOC (optional)
        cyclomatic_complexity: Cyclomatic complexity (optional)
        cyclomatic_density: Cyclomatic density (optional)
        halstead_effort: Halstead effort (optional)
        halstead_bugs: Halstead bugs (optional)
        halstead_difficulty: Halstead difficulty (optional)
        halstead_volume: Halstead volume (optional)
        maintainability_index: Maintainability index (optional)

    Returns:
        CodeMetric: Created metrics object
    """
    metrics = CodeMetric(
        experiment_id=experiment_id,
        phase=phase,
        sloc_logical=sloc_logical,
        cyclomatic_complexity=cyclomatic_complexity,
        cyclomatic_density=cyclomatic_density,
        halstead_effort=halstead_effort,
        halstead_bugs=halstead_bugs,
        halstead_difficulty=halstead_difficulty,
        halstead_volume=halstead_volume,
        maintainability_index=maintainability_index
    )
    session.add(metrics)
    session.flush()
    return metrics


def get_code_metrics(session: Session, experiment_id: int,
                    phase: Optional[str] = None) -> List[CodeMetric]:
    """
    Get code metrics for an experiment.

    Args:
        session: Database session
        experiment_id: Experiment ID
        phase: Filter by phase ('before' or 'after'), optional

    Returns:
        List of code metrics (usually 1 per phase)
    """
    query = session.query(CodeMetric).filter_by(experiment_id=experiment_id)
    if phase:
        query = query.filter_by(phase=phase)
    return query.all()


# =============================================================================
# TEST RESULTS
# =============================================================================

def create_test_results(session: Session, experiment_id: int, phase: str,
                       test_suites_passed: Optional[int] = None,
                       test_suites_failed: Optional[int] = None,
                       test_suites_total: Optional[int] = None,
                       tests_passed: Optional[int] = None,
                       tests_failed: Optional[int] = None,
                       tests_skipped: Optional[int] = None,
                       tests_total: Optional[int] = None,
                       snapshots_total: Optional[int] = None,
                       execution_time_seconds: Optional[float] = None,
                       coverage_statements: Optional[float] = None,
                       coverage_branches: Optional[float] = None,
                       coverage_functions: Optional[float] = None,
                       coverage_lines: Optional[float] = None,
                       all_tests_passed: Optional[bool] = None) -> TestResult:
    """
    Create test results for an experiment phase.

    Args:
        session: Database session
        experiment_id: Experiment ID
        phase: 'before' or 'after'
        test_suites_passed: Number of test suites passed (optional)
        test_suites_failed: Number of test suites failed (optional)
        test_suites_total: Total test suites (optional)
        tests_passed: Number of tests passed (optional)
        tests_failed: Number of tests failed (optional)
        tests_skipped: Number of tests skipped (optional)
        tests_total: Total tests (optional)
        snapshots_total: Total snapshots (optional)
        execution_time_seconds: Execution time in seconds (optional)
        coverage_statements: Statement coverage % (optional)
        coverage_branches: Branch coverage % (optional)
        coverage_functions: Function coverage % (optional)
        coverage_lines: Line coverage % (optional)
        all_tests_passed: Boolean flag (optional)

    Returns:
        TestResult: Created test result object
    """
    result = TestResult(
        experiment_id=experiment_id,
        phase=phase,
        test_suites_passed=test_suites_passed,
        test_suites_failed=test_suites_failed,
        test_suites_total=test_suites_total,
        tests_passed=tests_passed,
        tests_failed=tests_failed,
        tests_skipped=tests_skipped,
        tests_total=tests_total,
        snapshots_total=snapshots_total,
        execution_time_seconds=execution_time_seconds,
        coverage_statements=coverage_statements,
        coverage_branches=coverage_branches,
        coverage_functions=coverage_functions,
        coverage_lines=coverage_lines,
        all_tests_passed=all_tests_passed
    )
    session.add(result)
    session.flush()
    return result


def get_test_results(session: Session, experiment_id: int,
                    phase: Optional[str] = None) -> List[TestResult]:
    """
    Get test results for an experiment.

    Args:
        session: Database session
        experiment_id: Experiment ID
        phase: Filter by phase ('before' or 'after'), optional

    Returns:
        List of test results (usually 1 per phase)
    """
    query = session.query(TestResult).filter_by(experiment_id=experiment_id)
    if phase:
        query = query.filter_by(phase=phase)
    return query.all()


def delete_test_results(session: Session, experiment_id: int, phase: Optional[str] = None) -> int:
    """
    Delete test results for an experiment.
    
    Used when re-executing experiments (--redo flag) to clean previous execution data.

    Args:
        session: Database session
        experiment_id: Experiment ID
        phase: Filter by phase ('before' or 'after'), optional. If None, deletes all phases.

    Returns:
        Number of deleted records
    """
    query = session.query(TestResult).filter_by(experiment_id=experiment_id)
    if phase:
        query = query.filter_by(phase=phase)
    
    count = query.count()
    query.delete(synchronize_session=False)
    session.flush()
    return count


def reset_experiment_execution_data(session: Session, experiment_id: int) -> None:
    """
    Reset execution phase data for an experiment.
    
    This function:
    1. Deletes all test results
    2. Resets analysis flags (smell detection, test analysis)
    3. Resets execution_phase_completed flag
    
    Used when re-executing experiments (--redo flag) to start fresh.

    Args:
        session: Database session
        experiment_id: Experiment ID
    """
    # Delete test results
    delete_test_results(session, experiment_id)
    
    # Reset experiment flags
    update_experiment(
        session=session,
        experiment_id=experiment_id,
        execution_phase_completed=False,
        tests_still_passing=None,
        smell_removed=None,
        introduced_new_smells=None,
        coverage_decreased=None,
        tests_changed=None,
        tests_pass_rate_decreased=None
    )
    
    session.flush()


# =============================================================================
# REPOSITORY BASELINE TEST RESULTS
# =============================================================================

def get_repository_baseline_tests(session: Session, repository_id: int) -> Optional['RepositoryBaselineTestResult']:
    """
    Get baseline test results for a repository.

    Args:
        session: Database session
        repository_id: Repository ID

    Returns:
        RepositoryBaselineTestResult object or None if not found
    """
    from llm_refactor.modules.database.models import RepositoryBaselineTestResult
    return session.query(RepositoryBaselineTestResult).filter_by(
        repository_id=repository_id
    ).first()


def repository_has_baseline_tests(session: Session, repository_id: int) -> bool:
    """
    Check if a repository has baseline test results saved.

    Args:
        session: Database session
        repository_id: Repository ID

    Returns:
        True if baseline exists, False otherwise
    """
    from llm_refactor.modules.database.models import RepositoryBaselineTestResult
    return session.query(RepositoryBaselineTestResult).filter_by(
        repository_id=repository_id
    ).first() is not None


def create_repository_baseline_tests(session: Session, repository_id: int,
                                     test_suites_passed: Optional[int] = None,
                                     test_suites_failed: Optional[int] = None,
                                     test_suites_total: Optional[int] = None,
                                     tests_passed: Optional[int] = None,
                                     tests_failed: Optional[int] = None,
                                     tests_total: Optional[int] = None,
                                     snapshots_total: Optional[int] = None,
                                     execution_time_seconds: Optional[float] = None,
                                     coverage_statements: Optional[float] = None,
                                     coverage_branches: Optional[float] = None,
                                     coverage_functions: Optional[float] = None,
                                     coverage_lines: Optional[float] = None,
                                     all_tests_passed: Optional[bool] = None) -> 'RepositoryBaselineTestResult':
    """
    Create or update repository baseline test results.

    If baseline already exists for this repository, it will be updated.
    Otherwise, a new record is created.

    Args:
        session: Database session
        repository_id: Repository ID
        test_suites_passed: Number of test suites passed (optional)
        test_suites_failed: Number of test suites failed (optional)
        test_suites_total: Total test suites (optional)
        tests_passed: Number of tests passed (optional)
        tests_failed: Number of tests failed (optional)
        tests_total: Total tests (optional)
        snapshots_total: Total snapshots (optional)
        execution_time_seconds: Execution time in seconds (optional)
        coverage_statements: Statement coverage % (optional)
        coverage_branches: Branch coverage % (optional)
        coverage_functions: Function coverage % (optional)
        coverage_lines: Line coverage % (optional)
        all_tests_passed: Boolean flag (optional)

    Returns:
        RepositoryBaselineTestResult: Created or updated baseline test result object
    """
    from llm_refactor.modules.database.models import RepositoryBaselineTestResult
    
    # Check if baseline already exists
    existing = get_repository_baseline_tests(session, repository_id)
    
    if existing:
        # Update existing baseline
        existing.test_suites_passed = test_suites_passed
        existing.test_suites_failed = test_suites_failed
        existing.test_suites_total = test_suites_total
        existing.tests_passed = tests_passed
        existing.tests_failed = tests_failed
        existing.tests_total = tests_total
        existing.snapshots_total = snapshots_total
        existing.execution_time_seconds = execution_time_seconds
        existing.coverage_statements = coverage_statements
        existing.coverage_branches = coverage_branches
        existing.coverage_functions = coverage_functions
        existing.coverage_lines = coverage_lines
        existing.all_tests_passed = all_tests_passed
        existing.executed_at = datetime.utcnow()
        session.flush()
        return existing
    else:
        # Create new baseline
        result = RepositoryBaselineTestResult(
            repository_id=repository_id,
            test_suites_passed=test_suites_passed,
            test_suites_failed=test_suites_failed,
            test_suites_total=test_suites_total,
            tests_passed=tests_passed,
            tests_failed=tests_failed,
            tests_total=tests_total,
            snapshots_total=snapshots_total,
            execution_time_seconds=execution_time_seconds,
            coverage_statements=coverage_statements,
            coverage_branches=coverage_branches,
            coverage_functions=coverage_functions,
            coverage_lines=coverage_lines,
            all_tests_passed=all_tests_passed
        )
        session.add(result)
        session.flush()
        return result


# =============================================================================
# AI RESPONSES
# =============================================================================

def create_ai_response(session: Session, experiment_id: int,
                      response_text: Optional[str] = None,
                      suggested_alternatives: Optional[int] = None,
                      reasoning_provided: Optional[str] = None,
                      confidence_level: Optional[str] = None) -> AIResponse:
    """
    Create an AI response record.

    Args:
        session: Database session
        experiment_id: Experiment ID
        response_text: Full AI response (optional)
        suggested_alternatives: Number of alternatives provided (optional)
        reasoning_provided: Key reasoning points (optional)
        confidence_level: Confidence level (optional)

    Returns:
        AIResponse: Created AI response object
    """
    response = AIResponse(
        experiment_id=experiment_id,
        response_text=response_text,
        suggested_alternatives=suggested_alternatives,
        reasoning_provided=reasoning_provided,
        confidence_level=confidence_level
    )
    session.add(response)
    session.flush()
    return response


def get_ai_response(session: Session, experiment_id: int) -> Optional[AIResponse]:
    """Get AI response for an experiment."""
    return session.query(AIResponse).filter_by(experiment_id=experiment_id).first()


# =============================================================================
# STATISTICS & QUERIES
# =============================================================================

def get_statistics(session: Session) -> Dict[str, Any]:
    """
    Get database statistics.

    Returns:
        dict: Statistics about the database contents
    """
    stats = {
        'repositories': session.query(Repository).count(),
        'files': session.query(File).count(),
        'detected_smells': session.query(DetectedSmells).count(),
        'study_smells': session.query(StudySmells).count(),
        'experiments': session.query(Experiment).count(),
        'smell_results': session.query(SmellDetectionResult).count(),
        'code_metrics': session.query(CodeMetric).count(),
        'test_results': session.query(TestResult).count(),
        'ai_responses': session.query(AIResponse).count(),
    }

    # Experiment statistics
    stats['experiments_successful'] = session.query(Experiment)\
        .filter_by(smell_removed=True).count()
    stats['experiments_failed'] = session.query(Experiment)\
        .filter_by(smell_removed=False).count()

    # AI tool breakdown
    from sqlalchemy import func
    ai_tools = session.query(Experiment.ai_tool, func.count(Experiment.id))\
        .group_by(Experiment.ai_tool).all()
    stats['by_ai_tool'] = {tool: count for tool, count in ai_tools}

    return stats


# =============================================================================
# UI METADATA
# =============================================================================

def get_ui_metadata(session: Session, detected_smell_id: int) -> Optional[SmellUIMetadata]:
    """
    Get UI metadata for a detected smell.

    Args:
        session: Database session
        detected_smell_id: ID of the detected smell

    Returns:
        SmellUIMetadata or None if not found
    """
    return session.query(SmellUIMetadata).filter_by(detected_smell_id=detected_smell_id).first()


def get_or_create_ui_metadata(session: Session, detected_smell_id: int,
                              annotations: Optional[str] = None,
                              priority: int = 0,
                              tags: Optional[str] = None,
                              ui_status: str = 'pending') -> tuple[SmellUIMetadata, bool]:
    """
    Get existing UI metadata or create new one.

    Args:
        session: Database session
        detected_smell_id: ID of the detected smell
        annotations: Optional annotations text
        priority: Priority level (0-5)
        tags: JSON string of tags
        ui_status: Status ('pending', 'reviewing', 'ready', 'selected')

    Returns:
        tuple: (metadata, created) where created is True if newly created
    """
    metadata = get_ui_metadata(session, detected_smell_id)
    if metadata:
        return (metadata, False)

    metadata = SmellUIMetadata(
        detected_smell_id=detected_smell_id,
        annotations=annotations,
        priority=priority,
        tags=tags or '[]',
        ui_status=ui_status
    )
    session.add(metadata)
    session.flush()
    return (metadata, True)


def update_ui_metadata(session: Session, detected_smell_id: int,
                      annotations: Optional[str] = None,
                      priority: Optional[int] = None,
                      tags: Optional[str] = None,
                      ui_status: Optional[str] = None) -> Optional[SmellUIMetadata]:
    """
    Update UI metadata for a detected smell (upsert operation).

    Args:
        session: Database session
        detected_smell_id: ID of the detected smell
        annotations: Annotations text (optional)
        priority: Priority level (optional)
        tags: JSON string of tags (optional)
        ui_status: Status (optional)

    Returns:
        Updated SmellUIMetadata or None if smell not found
    """
    # Verify the smell exists
    smell = session.query(DetectedSmells).filter_by(id=detected_smell_id).first()
    if not smell:
        return None

    # Get or create metadata
    metadata, created = get_or_create_ui_metadata(session, detected_smell_id)

    # Update fields if provided
    if annotations is not None:
        metadata.annotations = annotations
    if priority is not None:
        metadata.priority = priority
    if tags is not None:
        metadata.tags = tags
    if ui_status is not None:
        metadata.ui_status = ui_status

    metadata.updated_at = datetime.utcnow()
    session.flush()
    return metadata


def delete_ui_metadata(session: Session, detected_smell_id: int) -> bool:
    """
    Delete UI metadata for a detected smell.

    Args:
        session: Database session
        detected_smell_id: ID of the detected smell

    Returns:
        bool: True if deleted, False if not found
    """
    metadata = get_ui_metadata(session, detected_smell_id)
    if not metadata:
        return False

    session.delete(metadata)
    session.flush()
    return True
