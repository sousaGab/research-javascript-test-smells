"""
SQLAlchemy ORM models for the research database.

This module defines the 8 core tables for tracking LLM-based test smell refactoring experiments.
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, ForeignKey,
    DateTime, CheckConstraint, UniqueConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class SchemaVersion(Base):
    """Track database schema versions."""
    __tablename__ = 'schema_version'

    version = Column(String, primary_key=True)
    applied_at = Column(DateTime, default=datetime.utcnow)
    description = Column(Text)

    def __repr__(self):
        return f"<SchemaVersion(version='{self.version}')>"


class Repository(Base):
    """Repository information (e.g., dayjs, luxon)."""
    __tablename__ = 'repositories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    url = Column(String)
    stars = Column(Integer, nullable=True, default=None)
    language = Column(String, default='JavaScript')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    files = relationship("File", back_populates="repository", cascade="all, delete-orphan")
    baseline_test_results = relationship("RepositoryBaselineTestResult", back_populates="repository", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Repository(id={self.id}, name='{self.name}')>"


class File(Base):
    """Files within repositories (test files)."""
    __tablename__ = 'files'
    __table_args__ = (
        UniqueConstraint('repository_id', 'path', name='uq_repository_path'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    repository_id = Column(Integer, ForeignKey('repositories.id', ondelete='CASCADE'), nullable=False)
    path = Column(String, nullable=False)
    file_type = Column(String, default='test')
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    repository = relationship("Repository", back_populates="files")
    detected_smells = relationship("DetectedSmells", back_populates="file", cascade="all, delete-orphan")
    baseline_smell_detections = relationship("BaselineSmellDetections", back_populates="file", cascade="all, delete-orphan")
    study_smells = relationship("StudySmells", back_populates="file", cascade="all, delete-orphan")
    experiments = relationship("Experiment", back_populates="file", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<File(id={self.id}, repository_id={self.repository_id}, path='{self.path}')>"


class DetectedSmells(Base):
    """All smells detected in repository (complete initial scan)."""
    __tablename__ = 'detected_smells'
    __table_args__ = (
        UniqueConstraint('file_id', 'smell_type', 'line_numbers', name='uq_detected_file_smell_lines'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey('files.id', ondelete='CASCADE'), nullable=False)
    smell_type = Column(String, nullable=False)
    line_numbers = Column(Text)  # JSON array as string
    severity = Column(String)
    code_snippet = Column(Text)
    snippet_start_line = Column(Integer)  # Start line of the code snippet/method
    snippet_end_line = Column(Integer)  # End line of the code snippet/method
    detected_at = Column(DateTime, default=datetime.utcnow)
    detection_tool = Column(String)  # 'steel', 'tsDetect'

    # Relationships
    file = relationship("File", back_populates="detected_smells")

    def __repr__(self):
        return f"<DetectedSmells(id={self.id}, smell_type='{self.smell_type}', file_id={self.file_id})>"


class BaselineSmellDetections(Base):
    """Baseline smell detections used as starting point for experiments."""
    __tablename__ = 'baseline_smell_detections'
    __table_args__ = (
        UniqueConstraint('file_id', 'smell_type', 'line_numbers', name='uq_file_smell_lines'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey('files.id', ondelete='CASCADE'), nullable=False)
    smell_type = Column(String, nullable=False)
    line_numbers = Column(Text)  # JSON array as string
    severity = Column(String)
    code_snippet = Column(Text)
    snippet_start_line = Column(Integer)  # Start line of the code snippet/method
    snippet_end_line = Column(Integer)  # End line of the code snippet/method
    detected_at = Column(DateTime, default=datetime.utcnow)
    detection_tool = Column(String)  # 'steel', 'tsDetect'

    # Relationships
    file = relationship("File", back_populates="baseline_smell_detections")
    experiments = relationship("Experiment", back_populates="baseline_smell", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<BaselineSmellDetections(id={self.id}, smell_type='{self.smell_type}', file_id={self.file_id})>"


class StudySmells(Base):
    """Smells selected for refactoring experiments (curated subset)."""
    __tablename__ = 'study_smells'
    __table_args__ = (
        UniqueConstraint('file_id', 'smell_type', 'line_numbers', name='uq_study_file_smell_lines'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey('files.id', ondelete='CASCADE'), nullable=False)
    smell_type = Column(String, nullable=False)
    line_numbers = Column(Text)  # JSON array as string
    severity = Column(String)
    code_snippet = Column(Text)
    snippet_start_line = Column(Integer)  # Start line of the code snippet/method
    snippet_end_line = Column(Integer)  # End line of the code snippet/method
    selected_at = Column(DateTime, default=datetime.utcnow)
    detection_tool = Column(String)  # 'steel', 'tsDetect'

    # Relationships
    file = relationship("File", back_populates="study_smells")

    def __repr__(self):
        return f"<StudySmells(id={self.id}, smell_type='{self.smell_type}', file_id={self.file_id})>"


class Experiment(Base):
    """Main research table: one refactoring attempt per row."""
    __tablename__ = 'experiments'

    id = Column(Integer, primary_key=True, autoincrement=True)
    study_smell_id = Column(Integer, ForeignKey('study_smells.id', ondelete='CASCADE'), nullable=True)
    baseline_smell_id = Column(Integer, ForeignKey('baseline_smell_detections.id', ondelete='CASCADE'), nullable=True)
    file_id = Column(Integer, ForeignKey('files.id', ondelete='CASCADE'), nullable=False)
    experiment_date = Column(DateTime, default=datetime.utcnow)

    # AI Tool Configuration
    ai_tool = Column(String, nullable=False)  # 'Claude', 'GPT-4', 'Gemini'
    ai_model_version = Column(String)  # 'claude-sonnet-4', 'gpt-4-turbo'
    prompting_approach = Column(String)  # 'zero-shot', 'few-shot', 'chain-of-thought'
    prompt_text = Column(Text)

    # Code States
    original_code = Column(Text, nullable=False)
    refactored_code = Column(Text)
    original_method = Column(Text)
    refactored_method = Column(Text)

    # Outcomes
    refactoring_completed = Column(Boolean, default=False)
    smell_removed = Column(Boolean, default=False)
    introduced_new_smells = Column(Boolean, default=False)
    tests_still_passing = Column(Boolean)
    coverage_changed = Column(Boolean)  # Test coverage changed (baseline vs refactored)
    coverage_decreased = Column(Boolean)  # Test coverage decreased (regression)
    tests_changed = Column(Boolean)  # Test execution results changed
    tests_pass_rate_decreased = Column(Boolean)  # Test pass rate decreased (tests_passed/tests_total regression)
    tests_failed = Column(Integer)       # 0=ok, 1=tests introduced failures after refactoring
    tests_failed_type = Column(String)   # 'suites_failed_increase', 'syntax_error', 'module_resolution_error'
    
    # Phase Tracking (for two-phase experiment execution)
    refactor_phase_completed = Column(Boolean, default=False)  # Phase 1: LLM refactoring complete
    execution_phase_completed = Column(Boolean, default=False)  # Phase 2: Testing/detection complete

    # Performance Metrics
    execution_time_seconds = Column(Float)  # Total experiment execution time
    llm_latency_seconds = Column(Float)  # LLM API response time only
    tokens_used = Column(Integer)  # Total tokens (prompt + completion)

    # Added smells: JSON dict {smell_type: count_added} for types where after > before
    added_smells = Column(Text)  # e.g. '{"AssertionRoulette": 2, "EagerTest": 1}'

    # Notes
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    study_smell = relationship("StudySmells", backref="experiments")
    baseline_smell = relationship("BaselineSmellDetections", back_populates="experiments")
    file = relationship("File", back_populates="experiments")
    smell_results = relationship("SmellDetectionResult", back_populates="experiment", cascade="all, delete-orphan")
    metrics = relationship("CodeMetric", back_populates="experiment", cascade="all, delete-orphan")
    test_results = relationship("TestResult", back_populates="experiment", cascade="all, delete-orphan")
    ai_responses = relationship("AIResponse", back_populates="experiment", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Experiment(id={self.id}, ai_tool='{self.ai_tool}', smell_removed={self.smell_removed})>"


class SmellDetectionResult(Base):
    """Smell detection results per experiment phase (before/after)."""
    __tablename__ = 'smell_detection_results'
    __table_args__ = (
        CheckConstraint("phase IN ('before', 'after')", name='check_phase'),
        UniqueConstraint('experiment_id', 'phase', 'smell_type', 'line_numbers', name='uq_exp_phase_smell'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    experiment_id = Column(Integer, ForeignKey('experiments.id', ondelete='CASCADE'), nullable=False)
    phase = Column(String, nullable=False)  # 'before' or 'after'

    smell_type = Column(String, nullable=False)
    line_numbers = Column(Text)  # JSON array
    severity = Column(String)
    code_snippet = Column(Text)

    # Analysis Flags
    is_target_smell = Column(Boolean, default=False)
    is_new_smell = Column(Boolean, default=False)

    detected_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    experiment = relationship("Experiment", back_populates="smell_results")

    def __repr__(self):
        return f"<SmellDetectionResult(id={self.id}, exp_id={self.experiment_id}, phase='{self.phase}', smell='{self.smell_type}')>"


class CodeMetric(Base):
    """Code complexity metrics per experiment phase (before/after)."""
    __tablename__ = 'code_metrics'
    __table_args__ = (
        CheckConstraint("phase IN ('before', 'after')", name='check_metrics_phase'),
        UniqueConstraint('experiment_id', 'phase', name='uq_exp_metrics_phase'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    experiment_id = Column(Integer, ForeignKey('experiments.id', ondelete='CASCADE'), nullable=False)
    phase = Column(String, nullable=False)  # 'before' or 'after'

    # Complexity Metrics
    sloc_logical = Column(Integer)
    cyclomatic_complexity = Column(Integer)
    cyclomatic_density = Column(Float)

    # Halstead Metrics
    halstead_effort = Column(Float)
    halstead_bugs = Column(Float)
    halstead_difficulty = Column(Float)
    halstead_volume = Column(Float)

    # Maintainability
    maintainability_index = Column(Float)

    measured_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    experiment = relationship("Experiment", back_populates="metrics")

    def __repr__(self):
        return f"<CodeMetric(id={self.id}, exp_id={self.experiment_id}, phase='{self.phase}', sloc={self.sloc_logical})>"


class TestResult(Base):
    """Test execution results per experiment phase (before/after)."""
    __tablename__ = 'test_results'
    __table_args__ = (
        CheckConstraint("phase IN ('before', 'after')", name='check_tests_phase'),
        UniqueConstraint('experiment_id', 'phase', name='uq_exp_tests_phase'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    experiment_id = Column(Integer, ForeignKey('experiments.id', ondelete='CASCADE'), nullable=False)
    phase = Column(String, nullable=False)  # 'before' or 'after'

    # Test Execution
    test_suites_passed = Column(Integer)
    test_suites_failed = Column(Integer)
    test_suites_total = Column(Integer)
    tests_passed = Column(Integer)
    tests_failed = Column(Integer)
    tests_skipped = Column(Integer)
    tests_total = Column(Integer)
    snapshots_total = Column(Integer)
    execution_time_seconds = Column(Float)

    # Coverage
    coverage_statements = Column(Float)
    coverage_branches = Column(Float)
    coverage_functions = Column(Float)
    coverage_lines = Column(Float)

    # Status
    all_tests_passed = Column(Boolean)

    executed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    experiment = relationship("Experiment", back_populates="test_results")

    def __repr__(self):
        return f"<TestResult(id={self.id}, exp_id={self.experiment_id}, phase='{self.phase}', passed={self.all_tests_passed})>"


class RepositoryBaselineTestResult(Base):
    """Repository-level baseline test results (before any refactoring)."""
    __tablename__ = 'repository_baseline_test_results'
    __table_args__ = (
        UniqueConstraint('repository_id', name='uq_repo_baseline'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    repository_id = Column(Integer, ForeignKey('repositories.id', ondelete='CASCADE'), nullable=False)

    # Test Execution
    test_suites_passed = Column(Integer)
    test_suites_failed = Column(Integer)
    test_suites_total = Column(Integer)
    tests_passed = Column(Integer)
    tests_failed = Column(Integer)
    tests_total = Column(Integer)
    snapshots_total = Column(Integer)
    execution_time_seconds = Column(Float)

    # Coverage
    coverage_statements = Column(Float)
    coverage_branches = Column(Float)
    coverage_functions = Column(Float)
    coverage_lines = Column(Float)

    # Status
    all_tests_passed = Column(Boolean)

    executed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    repository = relationship("Repository", back_populates="baseline_test_results")

    def __repr__(self):
        return f"<RepositoryBaselineTestResult(id={self.id}, repo_id={self.repository_id}, passed={self.all_tests_passed})>"


class AIResponse(Base):
    """AI tool responses and reasoning (qualitative data)."""
    __tablename__ = 'ai_responses'

    id = Column(Integer, primary_key=True, autoincrement=True)
    experiment_id = Column(Integer, ForeignKey('experiments.id', ondelete='CASCADE'), nullable=False)
    response_text = Column(Text)
    suggested_alternatives = Column(Integer)
    reasoning_provided = Column(Text)
    confidence_level = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    experiment = relationship("Experiment", back_populates="ai_responses")

    def __repr__(self):
        return f"<AIResponse(id={self.id}, exp_id={self.experiment_id})>"


class SmellUIMetadata(Base):
    """UI metadata for smell selection and management."""
    __tablename__ = 'smell_ui_metadata'
    __table_args__ = (
        UniqueConstraint('detected_smell_id', name='uq_ui_metadata_smell'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    detected_smell_id = Column(Integer, ForeignKey('detected_smells.id', ondelete='CASCADE'), nullable=False)

    # Researcher annotations
    annotations = Column(Text)

    # Priority for selection (0-5)
    priority = Column(Integer, default=0)

    # Tags for categorization (JSON array as string)
    tags = Column(Text)

    # UI status tracking
    ui_status = Column(String, default='pending')  # 'pending', 'reviewing', 'ready', 'selected'

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<SmellUIMetadata(id={self.id}, smell_id={self.detected_smell_id}, status='{self.ui_status}')>"
