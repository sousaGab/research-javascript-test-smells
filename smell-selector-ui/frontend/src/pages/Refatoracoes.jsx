import { useState } from 'react';
import { useRefatoracoes } from '../hooks/useRefatoracoes';
import { DiffViewer } from '../components/DiffViewer/DiffViewer';
import { RefatoracaoCard } from '../components/RefatoracaoCard/RefatoracaoCard';
import { Pagination } from '../components/Pagination/Pagination';
import './Refatoracoes.css';

// ─── helpers ─────────────────────────────────────────────────────────────────

function Badge({ value, trueLabel = 'Yes', falseLabel = 'No', nullLabel = '—' }) {
  if (value === null || value === undefined) return <span className="ref-badge ref-badge-unknown">{nullLabel}</span>;
  return value
    ? <span className="ref-badge ref-badge-success">{trueLabel}</span>
    : <span className="ref-badge ref-badge-danger">{falseLabel}</span>;
}

function CoverageRow({ label, before, after }) {
  if (before == null && after == null) return null;
  const fmt = v => v != null ? `${Number(v).toFixed(1)}%` : '—';
  const diff = after != null && before != null ? after - before : null;
  return (
    <tr>
      <td>{label}</td>
      <td>{fmt(before)}</td>
      <td>{fmt(after)}</td>
      <td className={diff == null ? '' : diff > 0 ? 'ref-diff-up' : diff < 0 ? 'ref-diff-down' : ''}>
        {diff == null ? '—' : `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`}
      </td>
    </tr>
  );
}

function TestResultsTable({ before, after }) {
  if (!before && !after) return null;
  return (
    <div className="ref-section">
      <h4 className="ref-section-title">Test Results</h4>
      <table className="ref-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Before</th>
            <th>After</th>
            <th>Delta</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tests passing</td>
            <td>{before ? `${before.tests_passed ?? '—'}/${before.tests_total ?? '—'}` : '—'}</td>
            <td>{after ? `${after.tests_passed ?? '—'}/${after.tests_total ?? '—'}` : '—'}</td>
            <td>—</td>
          </tr>
          <tr>
            <td>Test suites passing</td>
            <td>{before ? `${before.test_suites_passed ?? '—'}/${before.test_suites_total ?? '—'}` : '—'}</td>
            <td>{after ? `${after.test_suites_passed ?? '—'}/${after.test_suites_total ?? '—'}` : '—'}</td>
            <td>—</td>
          </tr>
          <CoverageRow
            label="Coverage statements"
            before={before?.coverage_statements}
            after={after?.coverage_statements}
          />
          <CoverageRow
            label="Coverage branches"
            before={before?.coverage_branches}
            after={after?.coverage_branches}
          />
          <CoverageRow
            label="Coverage functions"
            before={before?.coverage_functions}
            after={after?.coverage_functions}
          />
          <CoverageRow
            label="Coverage lines"
            before={before?.coverage_lines}
            after={after?.coverage_lines}
          />
        </tbody>
      </table>
    </div>
  );
}

// ─── filter bar ──────────────────────────────────────────────────────────────

function RefFilter({ filters, filterOptions, onFilterChange, onClear, total }) {
  if (!filterOptions) return <div className="ref-filterbar ref-filterbar-loading">Loading filters...</div>;

  return (
    <div className="ref-filterbar">
      <div className="ref-filterbar-controls">
        <select
          value={filters.smell_type}
          onChange={e => onFilterChange({ smell_type: e.target.value })}
        >
          <option value="">All smell types</option>
          {filterOptions.smell_types.map(s => (
            <option key={s.name} value={s.name}>{s.name} ({s.count})</option>
          ))}
        </select>

        <select
          value={filters.ai_model}
          onChange={e => {
            const selected = filterOptions.ai_models.find(m => m.ai_tool === e.target.value);
            onFilterChange({
              ai_model: e.target.value,
              ai_model_version: selected?.ai_model_version || '',
            });
          }}
        >
          <option value="">All LLM models</option>
          {filterOptions.ai_models.map((m, i) => (
            <option key={i} value={m.ai_tool}>{m.label} ({m.count})</option>
          ))}
        </select>

        <select
          value={filters.prompting_approach}
          onChange={e => onFilterChange({ prompting_approach: e.target.value })}
        >
          <option value="">All approaches</option>
          {filterOptions.prompting_approaches.map(p => (
            <option key={p.name} value={p.name}>{p.name} ({p.count})</option>
          ))}
        </select>

        <select
          value={filters.repo}
          onChange={e => onFilterChange({ repo: e.target.value })}
        >
          <option value="">All repositories</option>
          {filterOptions.repositories.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={filters.smell_removed}
          onChange={e => onFilterChange({ smell_removed: e.target.value })}
        >
          <option value="">Smell removed: All</option>
          <option value="true">Smell removed: Yes</option>
          <option value="false">Smell removed: No</option>
        </select>

        <select
          value={filters.tests_changed}
          onChange={e => onFilterChange({ tests_changed: e.target.value })}
        >
          <option value="">Tests changed: All</option>
          <option value="true">Tests changed: Yes</option>
          <option value="false">Tests changed: No</option>
        </select>

        <select
          value={filters.coverage_changed}
          onChange={e => onFilterChange({ coverage_changed: e.target.value })}
        >
          <option value="">Coverage changed: All</option>
          <option value="true">Coverage changed: Yes</option>
          <option value="false">Coverage changed: No</option>
        </select>

        <button className="ref-btn-clear" onClick={onClear}>Clear filters</button>
      </div>

      <div className="ref-filterbar-stats">
        {total} experiment{total !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// ─── prompt collapsable ───────────────────────────────────────────────────────

function PromptSection({ promptText }) {
  const [open, setOpen] = useState(false);
  if (!promptText) return null;
  return (
    <div className="ref-section">
      <button className="ref-collapse-btn" onClick={() => setOpen(v => !v)}>
        <span>Refactoring Prompt</span>
        <span className="ref-collapse-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <pre className="ref-prompt-text">{promptText}</pre>
      )}
    </div>
  );
}

// ─── experiment detail ────────────────────────────────────────────────────────

function ExperimentDetail({ experiment, layout, onLayoutChange }) {
  if (!experiment) {
    return (
      <div className="ref-detail-placeholder">
        Select an experiment to view details
      </div>
    );
  }

  const modelLabel = experiment.ai_model_version
    ? `${experiment.ai_tool} / ${experiment.ai_model_version}`
    : experiment.ai_tool || '—';

  const displayCode = experiment.refactored_method
    ? { original: experiment.original_method, refactored: experiment.refactored_method }
    : { original: experiment.original_code, refactored: experiment.refactored_code };

  return (
    <div className="ref-detail">
      <div className="ref-detail-header">
        <div className="ref-detail-title">
          <span className="ref-detail-id">Experiment #{experiment.id}</span>
          <span className="ref-detail-smell">{experiment.smell_type || '—'}</span>
        </div>
        <div className="ref-detail-file">
          <span className="ref-detail-repo">{experiment.repository}</span>
          <span className="ref-detail-path">{experiment.file_path}</span>
        </div>
      </div>

      <DiffViewer
        originalCode={displayCode.original}
        refactoredCode={displayCode.refactored}
        layout={layout}
        onLayoutChange={onLayoutChange}
      />

      <PromptSection promptText={experiment.prompt_text} />

      <div className="ref-section">
        <h4 className="ref-section-title">Experiment Data</h4>
        <div className="ref-info-grid">
          <div className="ref-info-item">
            <span className="ref-info-label">Model</span>
            <span className="ref-info-value">{modelLabel}</span>
          </div>
          <div className="ref-info-item">
            <span className="ref-info-label">Approach</span>
            <span className="ref-info-value">{experiment.prompting_approach || '—'}</span>
          </div>
          <div className="ref-info-item">
            <span className="ref-info-label">Date</span>
            <span className="ref-info-value">{experiment.experiment_date ? experiment.experiment_date.slice(0, 16).replace('T', ' ') : '—'}</span>
          </div>
          <div className="ref-info-item">
            <span className="ref-info-label">Time (s)</span>
            <span className="ref-info-value">{experiment.execution_time_seconds != null ? experiment.execution_time_seconds.toFixed(2) : '—'}</span>
          </div>
          <div className="ref-info-item">
            <span className="ref-info-label">Tokens</span>
            <span className="ref-info-value">{experiment.tokens_used ?? '—'}</span>
          </div>
        </div>

        <div className="ref-outcomes">
          <div className="ref-outcome-item">
            <span className="ref-outcome-label">Refactoring completed</span>
            <Badge value={experiment.refactoring_completed} />
          </div>
          <div className="ref-outcome-item">
            <span className="ref-outcome-label">Smell removed</span>
            <Badge value={experiment.smell_removed} />
          </div>
          <div className="ref-outcome-item">
            <span className="ref-outcome-label">New smells introduced</span>
            <Badge value={experiment.introduced_new_smells} trueLabel="Yes" falseLabel="No" />
          </div>
          <div className="ref-outcome-item">
            <span className="ref-outcome-label">Tests still passing</span>
            <Badge value={experiment.tests_still_passing} />
          </div>
          <div className="ref-outcome-item">
            <span className="ref-outcome-label">Tests changed</span>
            <Badge value={experiment.tests_changed} />
          </div>
          <div className="ref-outcome-item">
            <span className="ref-outcome-label">Coverage changed</span>
            <Badge value={experiment.coverage_changed} />
          </div>
        </div>

        {experiment.notes && (
          <div className="ref-notes">
            <span className="ref-info-label">Notes</span>
            <p>{experiment.notes}</p>
          </div>
        )}
      </div>

      <TestResultsTable
        before={experiment.test_results_before}
        after={experiment.test_results_after}
      />
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

function Refatoracoes() {
  const {
    experiments,
    selectedExperiment,
    loading,
    detailLoading,
    error,
    total,
    page,
    pageSize,
    totalPages,
    filters,
    filterOptions,
    layout,
    setLayout,
    loadExperimentDetail,
    updateFilters,
    clearFilters,
    setPage,
  } = useRefatoracoes();

  const [selectedId, setSelectedId] = useState(null);

  const handleCardClick = async (exp) => {
    setSelectedId(exp.id);
    await loadExperimentDetail(exp.id);
  };

  const start = Math.min((page - 1) * pageSize + 1, total);
  const end = Math.min(page * pageSize, total);

  return (
    <>
      <RefFilter
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={updateFilters}
        onClear={clearFilters}
        total={total}
      />

      <div className="ref-content">
        {loading && <div className="ref-loading">Loading experiments...</div>}
        {error && <div className="ref-error">Error: {error}</div>}

        {!loading && !error && (
          <>
            <div className="ref-list">
              <h2 className="ref-list-title">
                Experiments
                {total > 0 && (
                  <span className="ref-list-count">
                    {start}–{end} of {total}
                  </span>
                )}
              </h2>

              {experiments.length === 0 ? (
                <div className="ref-empty">No experiments found with the current filters.</div>
              ) : (
                <>
                  {experiments.map(exp => (
                    <RefatoracaoCard
                      key={exp.id}
                      experiment={exp}
                      isSelected={exp.id === selectedId}
                      onClick={() => handleCardClick(exp)}
                    />
                  ))}
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </>
              )}
            </div>

            <div className="ref-detail-panel">
              {detailLoading ? (
                <div className="ref-loading">Loading details...</div>
              ) : (
                <ExperimentDetail
                  experiment={selectedExperiment}
                  layout={layout}
                  onLayoutChange={setLayout}
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Refatoracoes;
