-- =============================================================================
-- TEST SMELL REFACTORING RESEARCH DATABASE SCHEMA
-- Version: 1.0.0
-- Purpose: Track LLM-based refactoring experiments on JavaScript test smells
-- =============================================================================

-- Schema Version Tracking
CREATE TABLE IF NOT EXISTS schema_version (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

INSERT OR IGNORE INTO schema_version VALUES
('1.0.0', CURRENT_TIMESTAMP, 'Initial schema: 8 tables for test smell research');

-- -----------------------------------------------------------------------------
-- LEVEL 1: Repository Information
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    url TEXT,
    stars INTEGER,
    language TEXT DEFAULT 'JavaScript',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- LEVEL 2: Files in Repositories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    file_type TEXT DEFAULT 'test',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repository_id, path)
);

-- -----------------------------------------------------------------------------
-- LEVEL 3: Baseline Smell Detection (Initial Analysis)
-- Purpose: Catalog of all smells detected BEFORE any refactoring attempts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS baseline_smell_detections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    smell_type TEXT NOT NULL,
    line_numbers TEXT,
    severity TEXT,
    code_snippet TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detection_tool TEXT,
    UNIQUE(file_id, smell_type, line_numbers)
);

-- -----------------------------------------------------------------------------
-- LEVEL 4: Experiments (Main Research Table)
-- Purpose: Each row = one refactoring attempt on one smell
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS experiments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    baseline_smell_id INTEGER NOT NULL REFERENCES baseline_smell_detections(id) ON DELETE CASCADE,
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    experiment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- AI Tool Configuration
    ai_tool TEXT NOT NULL,
    ai_model_version TEXT,
    prompting_approach TEXT,
    prompt_text TEXT,

    -- Code States
    original_code TEXT NOT NULL,
    refactored_code TEXT,
    original_method TEXT,
    refactored_method TEXT,

    -- Outcomes (Research Results)
    refactoring_completed BOOLEAN DEFAULT FALSE,
    smell_removed BOOLEAN DEFAULT FALSE,
    introduced_new_smells BOOLEAN DEFAULT FALSE,
    tests_still_passing BOOLEAN,
    coverage_changed BOOLEAN,  -- Test coverage changed (baseline vs refactored)
    coverage_decreased BOOLEAN,  -- Test coverage decreased (regression)
    tests_changed BOOLEAN,  -- Test execution results changed

    -- Performance Tracking
    execution_time_seconds REAL,
    tokens_used INTEGER,

    -- Notes
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- LEVEL 5A: Smell Detection Results (Per Experiment Phase)
-- Purpose: Track smells before AND after refactoring for each experiment
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS smell_detection_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id INTEGER NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    phase TEXT NOT NULL CHECK(phase IN ('before', 'after')),

    smell_type TEXT NOT NULL,
    line_numbers TEXT,
    severity TEXT,
    code_snippet TEXT,

    -- Analysis Flags
    is_target_smell BOOLEAN DEFAULT FALSE,
    is_new_smell BOOLEAN DEFAULT FALSE,

    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experiment_id, phase, smell_type, line_numbers)
);

-- -----------------------------------------------------------------------------
-- LEVEL 5B: Code Metrics (Complexity Analysis)
-- Purpose: Measure code quality before and after refactoring
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS code_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id INTEGER NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    phase TEXT NOT NULL CHECK(phase IN ('before', 'after')),

    -- Complexity Metrics
    sloc_logical INTEGER,
    cyclomatic_complexity INTEGER,
    cyclomatic_density REAL,

    -- Halstead Metrics (code difficulty)
    halstead_effort REAL,
    halstead_bugs REAL,
    halstead_difficulty REAL,
    halstead_volume REAL,

    -- Maintainability
    maintainability_index REAL,

    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experiment_id, phase)
);

-- -----------------------------------------------------------------------------
-- LEVEL 5C: Test Results (Test Execution Outcomes)
-- Purpose: Verify refactoring didn't break functionality
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id INTEGER NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    phase TEXT NOT NULL CHECK(phase IN ('before', 'after')),

    -- Test Execution Summary
    test_suites_passed INTEGER,
    test_suites_failed INTEGER,
    test_suites_total INTEGER,
    tests_passed INTEGER,
    tests_failed INTEGER,
    tests_total INTEGER,
    snapshots_total INTEGER,
    execution_time_seconds REAL,

    -- Code Coverage
    coverage_statements REAL,
    coverage_branches REAL,
    coverage_functions REAL,
    coverage_lines REAL,

    -- Overall Status
    all_tests_passed BOOLEAN,

    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experiment_id, phase)
);

-- -----------------------------------------------------------------------------
-- LEVEL 5D: Repository Baseline Test Results
-- Purpose: Store baseline test results once per repository (before any refactoring)
-- Note: This avoids duplicating baseline data across multiple experiments
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repository_baseline_test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,

    -- Test Execution Summary
    test_suites_passed INTEGER,
    test_suites_failed INTEGER,
    test_suites_total INTEGER,
    tests_passed INTEGER,
    tests_failed INTEGER,
    tests_total INTEGER,
    snapshots_total INTEGER,
    execution_time_seconds REAL,

    -- Code Coverage
    coverage_statements REAL,
    coverage_branches REAL,
    coverage_functions REAL,
    coverage_lines REAL,

    -- Overall Status
    all_tests_passed BOOLEAN,

    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repository_id)
);

-- -----------------------------------------------------------------------------
-- LEVEL 6: AI Responses (Qualitative Analysis)
-- Purpose: Capture AI reasoning for qualitative research
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id INTEGER NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    response_text TEXT,
    suggested_alternatives INTEGER,
    reasoning_provided TEXT,
    confidence_level TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES for Query Performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_files_repo ON files(repository_id);
CREATE INDEX IF NOT EXISTS idx_baseline_smells_file ON baseline_smell_detections(file_id);
CREATE INDEX IF NOT EXISTS idx_baseline_smell_type ON baseline_smell_detections(smell_type);
CREATE INDEX IF NOT EXISTS idx_experiments_baseline ON experiments(baseline_smell_id);
CREATE INDEX IF NOT EXISTS idx_experiments_file ON experiments(file_id);
CREATE INDEX IF NOT EXISTS idx_experiments_date ON experiments(experiment_date);
CREATE INDEX IF NOT EXISTS idx_experiments_ai_tool ON experiments(ai_tool);
CREATE INDEX IF NOT EXISTS idx_experiments_smell_removed ON experiments(smell_removed);
CREATE INDEX IF NOT EXISTS idx_smell_results_exp ON smell_detection_results(experiment_id);
CREATE INDEX IF NOT EXISTS idx_metrics_exp ON code_metrics(experiment_id);
CREATE INDEX IF NOT EXISTS idx_tests_exp ON test_results(experiment_id);
CREATE INDEX IF NOT EXISTS idx_repo_baseline_tests_repo ON repository_baseline_test_results(repository_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_exp ON ai_responses(experiment_id);

-- =============================================================================
-- VIEWS for Easy Querying (Claude-Friendly!)
-- =============================================================================
CREATE VIEW IF NOT EXISTS experiment_summary AS
SELECT
    e.id as experiment_id,
    r.name as repository,
    f.path as file_path,
    bs.smell_type as target_smell,
    bs.detection_tool,
    e.ai_tool,
    e.ai_model_version,
    e.prompting_approach,
    e.refactoring_completed,
    e.smell_removed,
    e.introduced_new_smells,
    e.tests_still_passing,
    e.execution_time_seconds,
    e.tokens_used,

    -- Metrics before/after
    mb.sloc_logical as sloc_before,
    ma.sloc_logical as sloc_after,
    (ma.sloc_logical - mb.sloc_logical) as sloc_change,
    mb.cyclomatic_complexity as cyclomatic_before,
    ma.cyclomatic_complexity as cyclomatic_after,
    (ma.cyclomatic_complexity - mb.cyclomatic_complexity) as cyclomatic_change,
    mb.maintainability_index as maintainability_before,
    ma.maintainability_index as maintainability_after,
    (ma.maintainability_index - mb.maintainability_index) as maintainability_change,

    -- Test results
    tb.all_tests_passed as tests_passed_before,
    ta.all_tests_passed as tests_passed_after,
    tb.coverage_lines as coverage_before,
    ta.coverage_lines as coverage_after,
    (ta.coverage_lines - tb.coverage_lines) as coverage_change,

    e.experiment_date,
    e.notes
FROM experiments e
JOIN baseline_smell_detections bs ON e.baseline_smell_id = bs.id
JOIN files f ON e.file_id = f.id
JOIN repositories r ON f.repository_id = r.id
LEFT JOIN code_metrics mb ON e.id = mb.experiment_id AND mb.phase = 'before'
LEFT JOIN code_metrics ma ON e.id = ma.experiment_id AND ma.phase = 'after'
LEFT JOIN test_results tb ON e.id = tb.experiment_id AND tb.phase = 'before'
LEFT JOIN test_results ta ON e.id = ta.experiment_id AND ta.phase = 'after';

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
