import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ErrorBar, Cell, ResponsiveContainer, LabelList,
  PieChart, Pie, Legend,
} from 'recharts';
import './RQ4.css';

const API = 'http://localhost:8001/api/rq4';
const PROMPT_ORDER = ['Zero-Shot', 'Few-Shot', 'Chain-of-Thought'];

function fmt(val) { return val == null ? '—' : `${val.toFixed(1)}%`; }

function matrixCell(successes, n) {
  if (!n) return '—';
  const sr = Math.round(successes / n * 1000) / 10;
  return `${sr.toFixed(1)}% (${successes}/${n})`;
}

/* blue gradient: red=0% → blue=100% */
function heatColor(rate) {
  if (rate == null) return '#f3f4f6';
  const t = Math.min(1, Math.max(0, rate / 100));
  const r = Math.round(239 + (37  - 239) * t);
  const g = Math.round(68  + (99  - 68)  * t);
  const b = Math.round(68  + (235 - 68)  * t);
  return `rgb(${r},${g},${b})`;
}

/* ── Sub-components ── */

function Heatmap({ modelMatrix, prompts }) {
  if (!modelMatrix.length) return <p className="rq4-nodata">No data</p>;
  return (
    <div className="rq4-heatmap-wrap">
      <table className="rq4-heatmap">
        <thead>
          <tr>
            <th>Model</th>
            {prompts.map(p => <th key={p}><code>{p}</code></th>)}
          </tr>
        </thead>
        <tbody>
          {modelMatrix.map(row => (
            <tr key={row.model}>
              <td className="rq4-heatmap-model" title={row.model}>{row.model}</td>
              {prompts.map(p => {
                const bp = row.by_prompt[p];
                const sr = bp ? Math.round(bp.successes / bp.n * 1000) / 10 : null;
                const bg = heatColor(sr);
                const fg = sr != null && sr > 55 ? '#fff' : '#1f2937';
                return (
                  <td key={p} style={{ background: bg, color: fg }} className="rq4-heatmap-cell">
                    {sr != null ? `${sr.toFixed(1)}%` : '—'}
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
    <div className="rq4-tooltip">
      <strong>{label}</strong>
      <div>RSR: <b>{fmt(d.success_rate)}</b></div>
      <div>{d.successes}/{d.n} successful</div>
      {d.ci_lower != null && (
        <div className="rq4-tooltip-ci">95% CI: [{fmt(d.ci_lower)}, {fmt(d.ci_upper)}]</div>
      )}
    </div>
  );
}

const CAUSE_COLORS = {
  removal_failure:    '#eab308',
  behavior_violation: '#f97316',
  coverage_violation: '#ef4444',
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
    <button className="rq4-export-section-btn" onClick={handleClick} title={`Export ${table} CSV`}>
      ⬇ CSV
    </button>
  );
}

/* ── Main page ── */

export default function RQ4() {
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
  const allPrompts = fo.prompting_approaches?.length
    ? PROMPT_ORDER.filter(p => fo.prompting_approaches.includes(p))
        .concat(fo.prompting_approaches.filter(p => !PROMPT_ORDER.includes(p)))
    : fo.prompting_approaches ?? [];

  const modelChartData = (data?.by_model ?? []).map(d => ({
    ...d,
    errorY: d.ci_lower != null ? [d.success_rate - d.ci_lower, d.ci_upper - d.success_rate] : undefined,
  }));

  const promptChartData = (data?.by_prompt ?? []).map(d => ({
    ...d,
    errorY: d.ci_lower != null ? [d.success_rate - d.ci_lower, d.ci_upper - d.success_rate] : undefined,
  }));

  const causePieData = (data?.failure_causes ?? [])
    .filter(d => d.count > 0)
    .map(d => ({
      name: d.label,
      value: d.count,
      pct: d.pct_of_failures,
      cause: d.cause,
      fill: CAUSE_COLORS[d.cause] ?? '#6b7280',
    }));

  return (
    <div className="rq4-page">

      {/* ── Header ── */}
      <div className="rq4-header">
        <div>
          <h1 className="rq4-title">RQ4 — Refactoring Success Rate (RSR)</h1>
          <p className="rq4-subtitle">
            RSR = Σ(success) / N<sub>included</sub> — success requires smell removal + behavior preservation + coverage delta ≥ −0.5 pp
          </p>
        </div>
        <button
          className="rq4-export-btn"
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

      {/* ── Filter bar ── */}
      <div className="rq4-filterbar">
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
          className="rq4-clear-btn"
          onClick={() => setFilters({ smell_type: '', ai_model_version: '', prompting_approach: '' })}
        >
          Clear
        </button>
      </div>

      {loading && <div className="rq4-loading">Loading…</div>}
      {error   && <div className="rq4-error">Error: {error}</div>}

      {data && !loading && (
        <>
          {/* ── Overview cards ── */}
          <div className="rq4-overview-cards">
            <div className="rq4-card">
              <span className="rq4-card-label">Total Attempts</span>
              <span className="rq4-card-value">{data.overall.n}</span>
              <span className="rq4-card-sub">{data.overview.baseline_excluded} excluded (no after-phase)</span>
            </div>
            <div className="rq4-card">
              <span className="rq4-card-label">Successful</span>
              <span className="rq4-card-value rq4-card-value--accent">{data.overall.successes}</span>
              <span className="rq4-card-sub">{data.overall.total_failures} failed</span>
            </div>
            <div className="rq4-card">
              <span className="rq4-card-label">Success Rate (RSR)</span>
              <span className="rq4-card-value rq4-card-value--accent">{fmt(data.overall.success_rate)}</span>
              <span className="rq4-card-sub">
                {data.overall.ci_lower != null
                  ? `95% CI [${fmt(data.overall.ci_lower)}, ${fmt(data.overall.ci_upper)}]`
                  : '—'}
              </span>
            </div>
            <div className="rq4-card">
              <span className="rq4-card-label">Models</span>
              <span className="rq4-card-value">{data.overview.models_count}</span>
              <span className="rq4-card-sub">{data.overview.strategies_count} prompt strategies</span>
            </div>
          </div>

          {/* ── Charts ── */}
          <div className="rq4-charts">

            {/* G1 — RSR by Model */}
            <section className="rq4-chart-card rq4-chart-card--wide">
              <h2 className="rq4-section-title">
                G1 — RSR by Model
                <span className="rq4-chart-hint">sorted by RSR · 95% CI bars</span>
              </h2>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={modelChartData} margin={{ top: 18, right: 24, left: 0, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="model" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} width={42} />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="success_rate" radius={[4, 4, 0, 0]} maxBarSize={52}>
                    {modelChartData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${220 + i * 20}, 70%, ${48 + i * 2}%)`} />
                    ))}
                    <ErrorBar dataKey="errorY" width={4} strokeWidth={2} stroke="#374151" direction="y" />
                    <LabelList dataKey="success_rate" position="top"
                      formatter={v => v != null ? `${v.toFixed(0)}%` : ''}
                      style={{ fontSize: 10, fill: '#374151' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* G2 — RSR by Prompt Strategy */}
            <section className="rq4-chart-card">
              <h2 className="rq4-section-title">G2 — RSR by Prompt Strategy</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={promptChartData} margin={{ top: 18, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="prompt" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} width={42} />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="success_rate" radius={[4, 4, 0, 0]} maxBarSize={64}>
                    {(promptChartData).map((_, i) => (
                      <Cell key={i} fill={['#2563eb', '#1d4ed8', '#1e40af'][i % 3]} />
                    ))}
                    <ErrorBar dataKey="errorY" width={4} strokeWidth={2} stroke="#374151" direction="y" />
                    <LabelList dataKey="success_rate" position="top"
                      formatter={v => v != null ? `${v.toFixed(1)}%` : ''}
                      style={{ fontSize: 11, fill: '#374151' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* G3 — Failure Cause Distribution */}
            <section className="rq4-chart-card">
              <h2 className="rq4-section-title">
                G3 — Failure Cause Distribution
                <span className="rq4-chart-hint">% of failed attempts · independently counted</span>
              </h2>
              {causePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={causePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      labelLine={false}
                      label={<PieLabel />}
                    >
                      {causePieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend
                      iconType="circle"
                      iconSize={10}
                      formatter={value => (
                        <span style={{ fontSize: 11, color: '#374151' }}>{value}</span>
                      )}
                    />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} (${props.payload.pct.toFixed(1)}% of failures)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="rq4-nodata">No failures in selection</p>
              )}
            </section>

            {/* G4 — Model × Prompt Heatmap */}
            <section className="rq4-chart-card rq4-chart-card--wide">
              <h2 className="rq4-section-title">
                G4 — Model × Prompt Heatmap
                <span className="rq4-chart-hint">cell = RSR% · colour: red → blue</span>
              </h2>
              <Heatmap modelMatrix={data.model_matrix} prompts={allPrompts} />
            </section>

          </div>

          {/* ── Tables ── */}
          <div className="rq4-tables">

            {/* Table A — Experimental Overview */}
            <section className="rq4-section">
              <div className="rq4-section-header">
                <h2 className="rq4-section-title">Table A — Experimental Overview</h2>
                <ExportBtn table="overall" filters={filters} />
              </div>
              <table className="rq4-table">
                <thead><tr><th>Item</th><th>Value</th></tr></thead>
                <tbody>
                  <tr><td>Total experiments</td><td>{data.overview.total_experiments}</td></tr>
                  <tr><td>Included in RQ4 (after-phase data)</td><td>{data.overview.included_in_rq4}</td></tr>
                  <tr><td>Excluded (no after-phase data)</td><td>{data.overview.baseline_excluded}</td></tr>
                  <tr><td>Models evaluated</td><td>{data.overview.models_count}</td></tr>
                  <tr><td>Prompt strategies</td><td>{data.overview.strategies_count}</td></tr>
                </tbody>
              </table>
            </section>

            {/* Table B — Global success */}
            <section className="rq4-section">
              <div className="rq4-section-header">
                <h2 className="rq4-section-title">Table B — Global Refactoring Success</h2>
                <ExportBtn table="overall" filters={filters} />
              </div>
              <table className="rq4-table">
                <thead><tr><th>Metric</th><th>Value</th></tr></thead>
                <tbody>
                  <tr><td>N included</td><td>{data.overall.n}</td></tr>
                  <tr><td>Successful refactorings</td><td>{data.overall.successes}</td></tr>
                  <tr>
                    <td>Overall RSR%</td>
                    <td><strong><span className="rq4-badge">{fmt(data.overall.success_rate)}</span></strong></td>
                  </tr>
                  <tr>
                    <td>95% CI</td>
                    <td className="rq4-ci">
                      {data.overall.ci_lower != null
                        ? `[${fmt(data.overall.ci_lower)}, ${fmt(data.overall.ci_upper)}]`
                        : '—'}
                    </td>
                  </tr>
                  <tr><td>Total failures</td><td>{data.overall.total_failures}</td></tr>
                </tbody>
              </table>
            </section>

            {/* Table C — By Prompt Strategy */}
            <section className="rq4-section">
              <div className="rq4-section-header">
                <h2 className="rq4-section-title">Table C — RSR by Prompt Strategy</h2>
                <ExportBtn table="by_prompt" filters={filters} />
              </div>
              <table className="rq4-table">
                <thead>
                  <tr><th>Prompt</th><th>Attempts</th><th>Successes</th><th>RSR%</th><th>95% CI</th></tr>
                </thead>
                <tbody>
                  {data.by_prompt.map(row => (
                    <tr key={row.prompt}>
                      <td><code>{row.prompt}</code></td>
                      <td>{row.n}</td>
                      <td>{row.successes}</td>
                      <td><span className="rq4-badge">{fmt(row.success_rate)}</span></td>
                      <td className="rq4-ci">
                        {row.ci_lower != null ? `[${fmt(row.ci_lower)}, ${fmt(row.ci_upper)}]` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Table D — By Model */}
            <section className="rq4-section">
              <div className="rq4-section-header">
                <h2 className="rq4-section-title">Table D — RSR by Model</h2>
                <ExportBtn table="by_model" filters={filters} />
              </div>
              <table className="rq4-table">
                <thead>
                  <tr><th>Model</th><th>Attempts</th><th>Successes</th><th>RSR%</th><th>95% CI</th></tr>
                </thead>
                <tbody>
                  {data.by_model.map(row => (
                    <tr key={row.model}>
                      <td className="rq4-model-cell" title={row.model}>{row.model}</td>
                      <td>{row.n}</td>
                      <td>{row.successes}</td>
                      <td><span className="rq4-badge">{fmt(row.success_rate)}</span></td>
                      <td className="rq4-ci">
                        {row.ci_lower != null ? `[${fmt(row.ci_lower)}, ${fmt(row.ci_upper)}]` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Table E — Model × Prompt Matrix */}
            <section className="rq4-section rq4-section--wide">
              <div className="rq4-section-header">
                <h2 className="rq4-section-title">Table E — Model × Prompt Success Matrix</h2>
                <ExportBtn table="model_matrix" filters={filters} />
              </div>
              <div className="rq4-table-scroll">
                <table className="rq4-table rq4-table--matrix">
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
                        <td className="rq4-model-cell" title={row.model}>{row.model}</td>
                        {allPrompts.map(p => {
                          const bp = row.by_prompt[p];
                          return (
                            <td key={p}>{bp ? matrixCell(bp.successes, bp.n) : '—'}</td>
                          );
                        })}
                        <td>
                          <strong>{matrixCell(row.overall_successes, row.overall_n)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td><strong>ALL MODELS</strong></td>
                      {allPrompts.map(p => {
                        const totN = data.model_matrix.reduce((s, r) => s + (r.by_prompt[p]?.n || 0), 0);
                        const totS = data.model_matrix.reduce((s, r) => s + (r.by_prompt[p]?.successes || 0), 0);
                        return <td key={p}><strong>{matrixCell(totS, totN)}</strong></td>;
                      })}
                      <td>
                        <strong>{matrixCell(data.overall.successes, data.overall.n)}</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* Table F — Failure Causes */}
            <section className="rq4-section rq4-section--wide">
              <div className="rq4-section-header">
                <h2 className="rq4-section-title">
                  Table F — Failure Cause Diagnosis
                  <span className="rq4-chart-hint">independently counted; one attempt may contribute to multiple causes</span>
                </h2>
                <ExportBtn table="failure_causes" filters={filters} />
              </div>
              <table className="rq4-table">
                <thead>
                  <tr><th>Cause</th><th>Description</th><th>Count</th><th>% of Failures</th><th>Category</th></tr>
                </thead>
                <tbody>
                  {data.failure_causes.map(row => (
                    <tr
                      key={row.cause}
                      className={
                        row.cause === 'removal_failure'    ? 'rq4-row--removal' :
                        row.cause === 'behavior_violation' ? 'rq4-row--behavior' :
                        'rq4-row--coverage'
                      }
                    >
                      <td><code>{row.cause}</code></td>
                      <td>{row.label}</td>
                      <td>{row.count}</td>
                      <td>
                        <span className="rq4-badge rq4-badge--fail">
                          {row.pct_of_failures.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span className={
                          row.cause === 'removal_failure'    ? 'rq4-tag--removal' :
                          row.cause === 'behavior_violation' ? 'rq4-tag--behavior' :
                          'rq4-tag--coverage'
                        }>
                          {row.cause === 'removal_failure'    ? 'Removal' :
                           row.cause === 'behavior_violation' ? 'Behavior' :
                           'Coverage'}
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
