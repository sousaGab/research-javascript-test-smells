import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ErrorBar, Cell, ResponsiveContainer, LabelList,
  PieChart, Pie, Legend,
} from 'recharts';
import './RQ2.css';

const API = 'http://localhost:8001/api/rq2';
// Ordered exactly as stored in the DB (Title Case)
const PROMPT_ORDER = ['Zero-Shot', 'Few-Shot', 'Chain-of-Thought'];

function fmt(val) { return val == null ? '—' : `${val.toFixed(1)}%`; }

function matrixCell(preserved, n) {
  if (!n) return '—';
  const ppr = Math.round(preserved / n * 1000) / 10;
  return `${ppr.toFixed(1)}% (${preserved}/${n})`;
}

/* green=100% → red=0% */
function heatColor(ppr) {
  if (ppr == null) return '#f3f4f6';
  const t = Math.min(1, Math.max(0, ppr / 100));
  const r = Math.round(239 + (22  - 239) * t);
  const g = Math.round(68  + (163 - 68)  * t);
  const b = Math.round(68  + (74  - 68)  * t);
  return `rgb(${r},${g},${b})`;
}

/* ── Sub-components ── */

function Heatmap({ modelMatrix, prompts }) {
  if (!modelMatrix.length) return <p className="rq2-nodata">No data</p>;
  return (
    <div className="rq2-heatmap-wrap">
      <table className="rq2-heatmap">
        <thead>
          <tr>
            <th>Model</th>
            {prompts.map(p => <th key={p}><code>{p}</code></th>)}
          </tr>
        </thead>
        <tbody>
          {modelMatrix.map(row => (
            <tr key={row.model}>
              <td className="rq2-heatmap-model" title={row.model}>{row.model}</td>
              {prompts.map(p => {
                const bp = row.by_prompt[p];
                const ppr = bp ? Math.round(bp.preserved / bp.n * 1000) / 10 : null;
                const bg = heatColor(ppr);
                const fg = ppr != null && ppr > 55 ? '#fff' : '#1f2937';
                return (
                  <td key={p} style={{ background: bg, color: fg }} className="rq2-heatmap-cell">
                    {ppr != null ? `${ppr.toFixed(1)}%` : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rq2-tooltip">
      <strong>{label}</strong>
      <div>PPR: <b>{fmt(d.ppr)}</b></div>
      <div>{d.preserved}/{d.n} preserved</div>
      {d.ci_lower != null && (
        <div className="rq2-tooltip-ci">95% CI: [{fmt(d.ci_lower)}, {fmt(d.ci_upper)}]</div>
      )}
    </div>
  );
}

const TAXONOMY_COLORS = {
  'intra_suite_regression':  '#fb923c',  // orange — test-case level regression
  'suites_failed_increase':  '#f97316',  // darker orange — suite level regression
  'syntax_error':            '#ef4444',
  'module_resolution_error': '#dc2626',
  'runtime_error':           '#b91c1c',
  'timeout':                 '#991b1b',
  'unknown':                 '#7f1d1d',
};

const RADIAN = Math.PI / 180;
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, pct }) {
  if (pct < 4) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${pct.toFixed(0)}%`}
    </text>
  );
}

function ExportBtn({ table, filters }) {
  const handleClick = () => {
    const params = new URLSearchParams({ table });
    if (filters.smell_type)         params.set('smell_type', filters.smell_type);
    if (filters.ai_model_version)   params.set('ai_model_version', filters.ai_model_version);
    if (filters.prompting_approach) params.set('prompting_approach', filters.prompting_approach);
    window.location.href = `${API}/export?${params}`;
  };
  return (
    <button className="rq2-export-section-btn" onClick={handleClick} title={`Export ${table} CSV`}>
      ⬇ CSV
    </button>
  );
}

/* ── Main page ── */

export default function RQ2() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    smell_type: '',
    ai_model_version: '',
    prompting_approach: '',
  });

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.smell_type)         params.set('smell_type', filters.smell_type);
      if (filters.ai_model_version)   params.set('ai_model_version', filters.ai_model_version);
      if (filters.prompting_approach) params.set('prompting_approach', filters.prompting_approach);
      const res = await fetch(`${API}/summary?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const fo = data?.filter_options ?? {};
  // Preserve PROMPT_ORDER for known values; append any unknown values at the end
  const allPrompts = fo.prompting_approaches?.length
    ? PROMPT_ORDER.filter(p => fo.prompting_approaches.includes(p))
        .concat(fo.prompting_approaches.filter(p => !PROMPT_ORDER.includes(p)))
    : fo.prompting_approaches ?? [];

  const smellChartData = (data?.by_smell ?? []).map(d => ({
    ...d,
    errorY: d.ci_lower != null ? [d.ppr - d.ci_lower, d.ci_upper - d.ppr] : undefined,
  }));

  const taxonomyChartData = (data?.failure_taxonomy ?? []).map(d => ({
    name: d.label,
    value: d.count,
    pct: d.pct,
    failure_type: d.failure_type,
    fill: TAXONOMY_COLORS[d.failure_type] ?? '#6b7280',
  }));

  return (
    <div className="rq2-page">
      {/* Header */}
      <div className="rq2-header">
        <div>
          <h1 className="rq2-title">RQ2 — Pass Preservation Rate (PPR)</h1>
          <p className="rq2-subtitle">
            PPR = Σ(behavior_preserved) / N<sub>included</sub> — measures LLM preservation of test suite behavior
          </p>
        </div>
        <button
          className="rq2-export-btn"
          onClick={() => {
            const params = new URLSearchParams({ table: 'raw' });
            if (filters.smell_type)         params.set('smell_type', filters.smell_type);
            if (filters.ai_model_version)   params.set('ai_model_version', filters.ai_model_version);
            if (filters.prompting_approach) params.set('prompting_approach', filters.prompting_approach);
            window.location.href = `${API}/export?${params}`;
          }}
        >
          ⬇ Export Raw CSV
        </button>
      </div>

      {/* Filter bar */}
      <div className="rq2-filterbar">
        <select
          value={filters.smell_type}
          onChange={e => setFilters(f => ({ ...f, smell_type: e.target.value }))}
        >
          <option value="">All smell types</option>
          {(fo.smell_types ?? []).map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={filters.ai_model_version}
          onChange={e => setFilters(f => ({ ...f, ai_model_version: e.target.value }))}
        >
          <option value="">All models</option>
          {(fo.models ?? []).map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <select
          value={filters.prompting_approach}
          onChange={e => setFilters(f => ({ ...f, prompting_approach: e.target.value }))}
        >
          <option value="">All strategies</option>
          {allPrompts.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <button
          className="rq2-clear-btn"
          onClick={() => setFilters({ smell_type: '', ai_model_version: '', prompting_approach: '' })}
        >
          Clear
        </button>
      </div>

      {loading && <div className="rq2-loading">Loading…</div>}
      {error   && <div className="rq2-error">Error: {error}</div>}

      {data && !loading && (
        <>
          {/* ── CHARTS ── */}
          <div className="rq2-charts">

            {/* G1 — PPR by Smell Type */}
            <section className="rq2-chart-card rq2-chart-card--wide">
              <h2 className="rq2-section-title">
                G1 — PPR by Smell Type
                <span className="rq2-chart-hint">sorted by PPR · 95% CI bars</span>
              </h2>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={smellChartData} margin={{ top: 18, right: 24, left: 0, bottom: 64 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="smell_type" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} width={42} />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="ppr" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {smellChartData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${140 - i * 15}, 63%, ${46 + i * 2}%)`} />
                    ))}
                    <ErrorBar dataKey="errorY" width={4} strokeWidth={2} stroke="#374151" direction="y" />
                    <LabelList dataKey="ppr" position="top"
                      formatter={v => v != null ? `${v.toFixed(0)}%` : ''}
                      style={{ fontSize: 10, fill: '#374151' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* G2 — PPR by Prompt Strategy */}
            <section className="rq2-chart-card">
              <h2 className="rq2-section-title">G2 — PPR by Prompt Strategy</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.by_prompt} margin={{ top: 18, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="prompt" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} width={42} />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="ppr" radius={[4, 4, 0, 0]} maxBarSize={64}>
                    {(data.by_prompt ?? []).map((_, i) => (
                      <Cell key={i} fill={['#16a34a', '#15803d', '#166534'][i % 3]} />
                    ))}
                    <LabelList dataKey="ppr" position="top"
                      formatter={v => v != null ? `${v.toFixed(1)}%` : ''}
                      style={{ fontSize: 11, fill: '#374151' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* G4 — Failure Taxonomy Pie */}
            <section className="rq2-chart-card">
              <h2 className="rq2-section-title">
                G4 — Failure Taxonomy
                <span className="rq2-chart-hint">% of all included experiments</span>
              </h2>
              {taxonomyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={taxonomyChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      labelLine={false}
                      label={<PieLabel />}
                    >
                      {taxonomyChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => (
                        <span style={{ fontSize: 11, color: '#374151' }}>{value}</span>
                      )}
                    />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} (${props.payload.pct.toFixed(1)}%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="rq2-nodata">No failures in selection</p>
              )}
            </section>

            {/* G3 — Model × Prompt Heatmap */}
            <section className="rq2-chart-card rq2-chart-card--wide">
              <h2 className="rq2-section-title">
                G3 — Model × Prompt Heatmap
                <span className="rq2-chart-hint">cell = PPR% · colour: red → green</span>
              </h2>
              <Heatmap modelMatrix={data.model_matrix} prompts={allPrompts} />
            </section>

          </div>

          {/* ── TABLES ── */}
          <div className="rq2-tables">

            {/* TABLE 1 — Experimental Overview */}
            <section className="rq2-section">
              <div className="rq2-section-header">
                <h2 className="rq2-section-title">Table 1 — Experimental Overview</h2>
                <ExportBtn table="overall" filters={filters} />
              </div>
              <table className="rq2-table">
                <thead><tr><th>Item</th><th>Value</th></tr></thead>
                <tbody>
                  <tr><td>Total experiments</td><td>{data.overview.total_experiments}</td></tr>
                  <tr><td>Included in RQ2 (after-phase data)</td><td>{data.overview.included_in_rq2}</td></tr>
                  <tr><td>Excluded (no after-phase data)</td><td>{data.overview.baseline_excluded}</td></tr>
                  <tr><td>Models</td><td>{data.overview.models_count}</td></tr>
                  <tr><td>Prompt strategies</td><td>{data.overview.strategies_count}</td></tr>
                </tbody>
              </table>
            </section>

            {/* TABLE 2 — Overall PPR */}
            <section className="rq2-section">
              <div className="rq2-section-header">
                <h2 className="rq2-section-title">Table 2 — Overall Behavioral Preservation</h2>
                <ExportBtn table="overall" filters={filters} />
              </div>
              <table className="rq2-table">
                <thead><tr><th>Metric</th><th>Value</th></tr></thead>
                <tbody>
                  <tr><td>N included</td><td>{data.overall.n}</td></tr>
                  <tr><td>Behavior preserved</td><td>{data.overall.preserved}</td></tr>
                  <tr>
                    <td>Overall PPR%</td>
                    <td><strong>{fmt(data.overall.ppr)}</strong></td>
                  </tr>
                  <tr className="rq2-row--divider"><td colSpan={2}><em>Test counts (after-phase, non-error runs)</em></td></tr>
                  <tr><td>Tests executed</td><td>{data.overall.total_tests_executed.toLocaleString()}</td></tr>
                  <tr><td>Tests passed</td><td>{data.overall.total_tests_passed.toLocaleString()}</td></tr>
                  <tr><td>Tests failed</td><td>{data.overall.total_tests_failed.toLocaleString()}</td></tr>
                  <tr><td>Tests skipped</td><td>{data.overall.total_tests_skipped.toLocaleString()}</td></tr>
                  {data.overall.total_tests_todo > 0 && (
                    <tr><td>Tests todo (unaccounted)</td><td>{data.overall.total_tests_todo.toLocaleString()}</td></tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* TABLE 3 — By Smell Type */}
            <section className="rq2-section rq2-section--wide">
              <div className="rq2-section-header">
                <h2 className="rq2-section-title">Table 3 — PPR by Smell Type</h2>
                <ExportBtn table="by_smell" filters={filters} />
              </div>
              <table className="rq2-table">
                <thead>
                  <tr><th>Smell Type</th><th>N</th><th>Preserved</th><th>PPR%</th><th>95% CI</th></tr>
                </thead>
                <tbody>
                  {data.by_smell.map(row => (
                    <tr key={row.smell_type}>
                      <td>{row.smell_type}</td>
                      <td>{row.n}</td>
                      <td>{row.preserved}</td>
                      <td><span className="rq2-badge">{fmt(row.ppr)}</span></td>
                      <td className="rq2-ci">
                        {row.ci_lower != null ? `[${fmt(row.ci_lower)}, ${fmt(row.ci_upper)}]` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* TABLE 4 — By Prompt Strategy */}
            <section className="rq2-section">
              <div className="rq2-section-header">
                <h2 className="rq2-section-title">Table 4 — PPR by Prompt Strategy</h2>
                <ExportBtn table="by_prompt" filters={filters} />
              </div>
              <table className="rq2-table">
                <thead><tr><th>Prompt</th><th>N</th><th>Preserved</th><th>PPR%</th></tr></thead>
                <tbody>
                  {data.by_prompt.map(row => (
                    <tr key={row.prompt}>
                      <td><code>{row.prompt}</code></td>
                      <td>{row.n}</td>
                      <td>{row.preserved}</td>
                      <td><span className="rq2-badge">{fmt(row.ppr)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* TABLE 5 — Model × Prompt Matrix */}
            <section className="rq2-section rq2-section--wide">
              <div className="rq2-section-header">
                <h2 className="rq2-section-title">Table 5 — Model × Prompt Preservation Matrix</h2>
                <ExportBtn table="model_matrix" filters={filters} />
              </div>
              <div className="rq2-table-scroll">
                <table className="rq2-table rq2-table--matrix">
                  <thead>
                    <tr>
                      <th>Model</th>
                      {allPrompts.map(p => <th key={p}><code>{p}</code></th>)}
                      <th>Overall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.model_matrix.map(row => (
                      <tr key={row.model}>
                        <td className="rq2-model-cell" title={row.model}>{row.model}</td>
                        {allPrompts.map(p => {
                          const bp = row.by_prompt[p];
                          return (
                            <td key={p}>
                              {bp ? matrixCell(bp.preserved, bp.n) : '—'}
                            </td>
                          );
                        })}
                        <td>
                          <strong>{matrixCell(row.overall_preserved, row.overall_n)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td><strong>ALL MODELS</strong></td>
                      {allPrompts.map(p => {
                        const totN = data.model_matrix.reduce((s, r) => s + (r.by_prompt[p]?.n || 0), 0);
                        const totP = data.model_matrix.reduce((s, r) => s + (r.by_prompt[p]?.preserved || 0), 0);
                        return <td key={p}><strong>{matrixCell(totP, totN)}</strong></td>;
                      })}
                      <td>
                        <strong>{matrixCell(data.overall.preserved, data.overall.n)}</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* TABLE 6 — Failure Taxonomy */}
            <section className="rq2-section rq2-section--wide">
              <div className="rq2-section-header">
                <h2 className="rq2-section-title">Table 6 — Failure Taxonomy</h2>
                <ExportBtn table="failure_taxonomy" filters={filters} />
              </div>
              <table className="rq2-table">
                <thead>
                  <tr><th>Failure Type</th><th>Description</th><th>Count</th><th>%</th><th>Category</th></tr>
                </thead>
                <tbody>
                  {data.failure_taxonomy.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af' }}>No failures</td></tr>
                  )}
                  {data.failure_taxonomy.map(row => (
                    <tr
                      key={row.failure_type}
                      className={row.is_error ? 'rq2-row--error' : 'rq2-row--regression'}
                    >
                      <td><code>{row.failure_type}</code></td>
                      <td>{row.label}</td>
                      <td>{row.count}</td>
                      <td><span className="rq2-badge rq2-badge--fail">{row.pct.toFixed(1)}%</span></td>
                      <td>
                        <span className={row.is_error ? 'rq2-tag--error' : 'rq2-tag--regression'}>
                          {row.is_error ? 'Error' : 'Regression'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

          </div>
        </>
      )}
    </div>
  );
}