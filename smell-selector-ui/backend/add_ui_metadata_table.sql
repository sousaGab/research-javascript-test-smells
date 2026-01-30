-- =============================================================================
-- UI METADATA TABLE
-- Purpose: Store UI-specific metadata (annotations, priority, tags) for smells
-- Version: 1.1.0 (Extension)
-- =============================================================================

CREATE TABLE IF NOT EXISTS smell_ui_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    detected_smell_id INTEGER NOT NULL REFERENCES detected_smells(id) ON DELETE CASCADE,

    -- Researcher annotations
    annotations TEXT,              -- Observations, notes about the smell

    -- Priority for selection (0-5)
    priority INTEGER DEFAULT 0,    -- 0=not set, 1=very low, 2=low, 3=medium, 4=high, 5=critical

    -- Tags for categorization (JSON array as string)
    tags TEXT,                     -- e.g. '["quick-fix", "high-impact", "complex"]'

    -- UI status tracking
    ui_status TEXT DEFAULT 'pending',  -- 'pending', 'reviewing', 'ready', 'selected'

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure one metadata per smell
    UNIQUE(detected_smell_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_ui_metadata_smell ON smell_ui_metadata(detected_smell_id);
CREATE INDEX IF NOT EXISTS idx_ui_metadata_priority ON smell_ui_metadata(priority);
CREATE INDEX IF NOT EXISTS idx_ui_metadata_status ON smell_ui_metadata(ui_status);

-- =============================================================================
-- TRIGGER: Update timestamp on changes
-- =============================================================================
CREATE TRIGGER IF NOT EXISTS update_ui_metadata_timestamp
AFTER UPDATE ON smell_ui_metadata
FOR EACH ROW
BEGIN
    UPDATE smell_ui_metadata
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;

-- =============================================================================
-- VIEW: Smells with UI Metadata (for easy querying)
-- =============================================================================
CREATE VIEW IF NOT EXISTS smells_with_metadata AS
SELECT
    ds.id as smell_id,
    ds.file_id,
    f.path as file_path,
    f.repository_id,
    r.name as repository_name,
    ds.smell_type,
    ds.line_numbers,
    ds.severity,
    ds.code_snippet,
    ds.detection_tool,
    ds.detected_at,

    -- Check if selected for study
    CASE WHEN ss.id IS NOT NULL THEN 1 ELSE 0 END as is_selected,
    ss.id as study_smell_id,

    -- UI metadata (NULL if not set)
    ui.id as ui_metadata_id,
    ui.annotations,
    ui.priority,
    ui.tags,
    ui.ui_status,
    ui.updated_at as metadata_updated_at

FROM detected_smells ds
JOIN files f ON ds.file_id = f.id
JOIN repositories r ON f.repository_id = r.id
LEFT JOIN study_smells ss ON ds.file_id = ss.file_id
    AND ds.smell_type = ss.smell_type
    AND ds.line_numbers = ss.line_numbers
LEFT JOIN smell_ui_metadata ui ON ds.id = ui.detected_smell_id;

-- =============================================================================
-- SAMPLE DATA (for testing)
-- =============================================================================
-- Uncomment to add sample metadata
/*
INSERT OR IGNORE INTO smell_ui_metadata (detected_smell_id, annotations, priority, tags, ui_status)
VALUES
    (1, 'Good candidate for zero-shot refactoring', 4, '["high-impact", "easy-fix"]', 'ready'),
    (2, 'Complex smell, might need few-shot examples', 5, '["complex", "important"]', 'reviewing');
*/
