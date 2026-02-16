# Smell Selector UI - Context for AI Assistants

## 🎯 Purpose

Web UI to visualize and select JavaScript test smells for research experiments on LLM-based refactoring.

## 🏗️ Architecture

**Frontend**: React 18 + Vite + CSS Modules (NO Tailwind)
**Backend**: FastAPI (Python 3.8+)
**Database**: SQLite at `../../research_data/research.db`
**Integration**: Uses existing `llm-refactor-pipeline/src/llm_refactor/modules/database/`

## 📊 Database Schema (Relevant Tables)

### Core Tables

```sql
-- All detected smells (source of truth)
detected_smells (
    id, file_id, smell_type, line_numbers, severity,
    code_snippet, detection_tool, detected_at
)

-- Smells selected for experiments
study_smells (
    id, file_id, smell_type, line_numbers, severity,
    selected_at, detection_tool
)

-- UI metadata (NEW TABLE - added by this project)
smell_ui_metadata (
    id, detected_smell_id, annotations, priority, tags,
    ui_status, created_at, updated_at
)

-- Future: refactoring experiments
experiments (
    id, study_smell_id, ai_tool, ai_model_version,
    prompting_approach, original_code, refactored_code,
    smell_removed, introduced_new_smells, tests_still_passing
)
```

### Key Relationships

```
repositories → files → detected_smells
                    → study_smells
detected_smells → smell_ui_metadata
study_smells → experiments
```

### Views

```sql
-- Convenient view joining all data
smells_with_metadata (
    smell_id, file_path, repository_name, smell_type,
    line_numbers, severity, is_selected, annotations, priority
)
```

## 🔄 Data Flow

```
1. Detection (Steel/SNutsJS) → detected_smells
2. UI Selection → study_smells + smell_ui_metadata
3. Refactoring (future) → experiments
```

## 🔌 API Endpoints

### Repositories
- `GET /api/repositories` - List with smell counts

### Smells
- `GET /api/smells?repo=...&smell_type=...&tool=...&selected=...`
  - Returns: `{smells: [], total: 120, selected_count: 15}`
- `GET /api/smells/{id}` - Details + full file content
- `POST /api/smells/{id}/select` - Move to study_smells
  - Body: `{annotations?, priority?, tags?}`
- `DELETE /api/smells/{id}/unselect` - Remove from study_smells
- `PATCH /api/smells/{id}/metadata` - Update UI metadata

### Study Smells
- `GET /api/study-smells` - List all selected

### Stats
- `GET /api/stats` - Database statistics

## 🎨 Frontend Structure

```
src/
├── api/
│   └── client.js          # API wrapper functions
├── hooks/
│   └── useSmells.js       # State management for smells
├── components/
│   ├── FilterBar/         # Filters (repo, type, tool)
│   ├── SmellList/         # Left panel - list of smells
│   ├── CodeViewer/        # Right panel - code display
│   └── AnnotationPanel/   # Bottom - metadata editing
├── pages/
│   └── SmellExplorer.jsx  # Main page
├── App.jsx                # Root component
└── main.jsx               # Entry point
```

### CSS Modules Pattern

```jsx
// Component.jsx
import styles from './Component.module.css';

export function Component() {
  return <div className={styles.container}>...</div>;
}
```

```css
/* Component.module.css */
.container {
  padding: 16px;
}
```

## 🎯 Key Components

### FilterBar
- Dropdowns: repository, smell_type, tool, selected status
- Stats display: total smells, selected count
- Clear filters button

### SmellList (Left Panel)
- Scrollable list of smell cards
- Each card shows:
  - Checkbox (is_selected)
  - Smell type (e.g., "Assertion Roulette")
  - File path + line number
  - Severity badge (high/medium/low)
  - Detection tool badge
  - Note indicator (📝 if has annotations)
- Selected card highlighted
- Click to load detail

### CodeViewer (Right Panel)
- Displays file content
- Syntax highlighting (Prism.js - future)
- Highlight lines where smell occurs
- Line numbers
- Copy button

### AnnotationPanel (Bottom)
- Text area for annotations
- Priority selector (0-5 stars)
- Tags input
- Status indicator
- "Select for Study" button (primary action)

## 🔑 Important Notes

### Smell Selection Logic

```javascript
// A smell is "selected" when it exists in study_smells table
// Query uses LEFT JOIN to check:
SELECT ds.*,
       CASE WHEN ss.id IS NOT NULL THEN 1 ELSE 0 END as is_selected
FROM detected_smells ds
LEFT JOIN study_smells ss ON ds.file_id = ss.file_id
    AND ds.smell_type = ss.smell_type
    AND ds.line_numbers = ss.line_numbers
```

### Line Numbers Format

Stored as JSON string: `"[44, 45, 46]"`

```javascript
// Parse in frontend:
const lines = JSON.parse(smell.line_numbers); // [44, 45, 46]
```

### File Path Resolution

```javascript
// Backend resolves file paths:
const fullPath =
  project_root / "repositories" / repo_name / file_path.lstrip('/');
```

### Metadata Management

- UI metadata stored separately in `smell_ui_metadata`
- Created on-demand (when first accessed or updated)
- Annotations, priority, tags persist across selections

## 🚀 Future: Refactoring Experiments

The system is prepared to store multiple refactoring attempts:

```sql
-- Same smell, different strategies
INSERT INTO experiments VALUES
  (1, 'Claude', 'zero-shot', ...),     -- Experiment 1
  (1, 'Claude', 'chain-of-thought', ...), -- Experiment 2
  (1, 'GPT-4', 'zero-shot', ...),      -- Experiment 3
  (1, 'GPT-4', 'few-shot', ...);       -- Experiment 4
```

All linked to same `study_smell_id`, enabling comparison:
- Success rates by strategy
- Success rates by LLM
- Metrics changes (complexity, maintainability)
- New smells introduced

## 🔧 Development Commands

```bash
# Backend
cd smell-selector-ui/backend
pip install -r requirements.txt
python migrate_database.py  # First time only
python main.py              # Runs on :8000

# Frontend
cd smell-selector-ui/frontend
npm install
npm run dev                 # Runs on :5173

# Both at once
cd smell-selector-ui
./start.sh
```

## 🐛 Common Issues

### No smells showing
- Check: `sqlite3 research.db "SELECT COUNT(*) FROM detected_smells"`
- If 0, run: `/analyze-smells redux-offline` in llm-refactor-pipeline

### CORS errors
- Backend must be running on :8000
- Vite proxy configured in `vite.config.js`

### File content not showing
- Check file exists in `repositories/{repo_name}/...`
- Backend tries to read from absolute path

## 📝 Code Style

- React: Functional components + hooks (no classes)
- CSS: Modules only (no Tailwind, no inline styles)
- API: Async/await (no callbacks)
- Naming: camelCase for JS, kebab-case for CSS

## 🎓 Research Integration

### Workflow
1. Detect smells → `detected_smells`
2. Review in UI → annotate, prioritize
3. Select → `study_smells`
4. Refactor (future) → `experiments`
5. Analyze results

### Key Metrics (Future)
- Smell removal success rate
- Code complexity before/after
- Test pass rate
- New smells introduced
- Execution time per LLM/strategy

## 📚 Related Files

- Database models: `llm-refactor-pipeline/src/llm_refactor/modules/database/models.py`
- CRUD operations: `llm-refactor-pipeline/src/llm_refactor/modules/database/crud.py`
- Connection: `llm-refactor-pipeline/src/llm_refactor/modules/database/connection.py`
- Migration SQL: `smell-selector-ui/backend/add_ui_metadata_table.sql`

## 🤖 For AI Assistants

When modifying this project:
1. ✅ Use CSS Modules (NOT Tailwind)
2. ✅ Use existing database connection from llm-refactor-pipeline
3. ✅ Follow the smell selection logic (detected → study)
4. ✅ Respect the schema (don't modify core tables)
5. ✅ Add indexes for new queries
6. ✅ Update CONTEXT.md when changing architecture

When adding features:
- New endpoint? → Add to `main.py`, `models.py`, `client.js`
- New component? → Create folder with `.jsx` + `.module.css`
- New filter? → Update `FilterBar` and `useSmells` hook
- New table? → Write migration SQL + update schema docs
