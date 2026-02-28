import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ErrorBar, Cell, ResponsiveContainer, LabelList,
} from 'recharts';
import './RQ1.css';

const API = 'http://localhost:8001/api/rq1';
const PROMPT_ORDER = ['zero-shot', 'few-shot', 'cot'];

function fmt(val) { return val == null ? '—' : `${val.toFixed(1)}%`; }

function matrixCell(removed, n) {
  if (!n) return '—';
  return `${fmt(Math.round(removed / n * 1000) / 10)} (${removed}/${n})`;
}

/* colour gradient: 0%=red-tint → 100%=blue */
function heatColor(srr) {
  if (srr == null) return '#f3f4f6';
  const t = Math.min(1, Math.max(0, srr / 100));
  const r = Math.round(239 + (29  - 239) * t);
  const g = Math.round(68  + (78  - 68)  * t);
  const b = Math.round(68  + (216 - 68)  * t);
  return `rgb(${r},${g},${b})`;
}

function Heatmap({ modelMatrix, prompts }) {
  if (!modelMatrix.length) return <p className="rq1-nodata">No data</p>;
  return (
    <div className="rq1-heatmap-wrap">
      <table className="rq1-heatmap">
        <thead>
          <tr>
            <th>Model</th>
            {prompts.map(p => <th key={p}><code>{p}</code></th>)}
          </tr>
        </thead>
        <tbody>
          {modelMatrix.map(row => (
            <tr key={row.model}>
              <td className="rq1-heatmap-model" title={row.model}>{row.model}</td>
              {prompts.map(p => {
                const bp = row.by_prompt[p];
                const srr = bp ? Math.round(bp.removed / bp.n * 1000) / 10 : null;
                const bg = heatColor(srr);
                const fg = srr != null && srr > 55 ? '#fff' : '#1f2937';
                return (
                  <td key={p} style={{ background: bg, color: fg }} className="rq1-heatmap-cell">
                    {srr != null ? `${srr.toFixed(1)}%` : '—'}
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
    <div className="rq1-tooltip">
      <strong>{label}</strong>
      <div>SRR: <b>{fmt(d.srr)}</b></div>
      <div>{d.removed}/{d.n} removed</div>
      {d.ci_lower != null && (
        <div className="rq1-tooltip-ci">95% CI: [{fmt(d.ci_lower)}, {fmt(d.ci_upper)}]</div>
      )}
    </div>
  );
}

export default function RQ1() {
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

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filters.smell_type)         params.set('smell_type', filters.smell_type);
    if (filters.ai_model_version)   params.set('ai_model_version', filters.ai_model_version);
    if (filters.prompting_approach) params.set('prompting_approach', filters.prompting_approach);
    window.location.href = `${API}/export?${params}`;
  };

  const fo = data?.filter_options ?? {};
  const allPrompts = fo.prompting_approaches?.length
    ? PROMPT_ORDER.filter(p => fo.prompting_approaches.includes(p))
        .concat(fo.prompting_approaches.filter(p => !PROMPT_ORDER.includes(p)))
    : [];

  const smellChartData = (data?.by_smell ?? []).map(d => ({
    ...d,
    errorY: d.ci_lower != null ? [d.srr - d.ci_lower, d.ci_upper - d.srr] : undefined,
  }));

  return (
    <div className="rq1-page">
      {/* Header */}
      <div className="rq1-header">
        <div>
          <h1 className="rq1-title">RQ1 — Structural Removal Rate (SRR)</h1>
          <p className="rq1-subtitle">
            SRR = Σ(removed) / N<sub>attempts</sub> — measures LLM success in removing JavaScript test smells
          </p>
        </div>
        <button className="rq1-export-btn" onClick={handleExport}>
          ⬇ Export CSV
        </button>
      </div>

      {/* Filter bar */}
      <div className="rq1-filterbar">
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
          className="rq1-clear-btn"
          onClick={() => setFilters({ smell_type: '', ai_model_version: '', prompting_approach: '' })}
        >
          Clear
        </button>
      </div>

      {loading && <div className="rq1-loading">Loading…</div>}
      {error   && <div className="rq1-error">Error: {error}</div>}

      {data && !loading && (
        <>
          {/* ── CHARTS ── */}
          <div className="rq1-charts">

            {/* G1 — SRR by Smell Type */}
            <section className="rq1-chart-card rq1-chart-card--wide">
              <h2 className="rq1-section-title">
                G1 — SRR by Smell Type
                <span className="rq1-chart-hint">sorted by SRR · 95% CI bars</span>
              </h2>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={smellChartData} margin={{ top: 18, right: 24, left: 0, bottom: 64 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="smell_type" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} width={42} />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="srr" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {smellChartData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${220 - i * 18}, 68%, 52%)`} />
                    ))}
                    <ErrorBar dataKey="errorY" width={4} strokeWidth={2} stroke="#374151" direction="y" />
                    <LabelList dataKey="srr" position="top"
                      formatter={v => v != null ? `${v.toFixed(0)}%` : ''}
                      style={{ fontSize: 10, fill: '#374151' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* G3 — SRR by Prompt Strategy */}
            <section className="rq1-chart-card">
              <h2 className="rq1-section-title">G3 — SRR by Prompt Strategy</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.by_prompt} margin={{ top: 18, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="prompt" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} width={42} />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="srr" radius={[4, 4, 0, 0]} maxBarSize={64}>
                    {(data.by_prompt ?? []).map((_, i) => (
                      <Cell key={i} fill={['#3b82f6', '#6366f1', '#8b5cf6'][i % 3]} />
                    ))}
                    <LabelList dataKey="srr" position="top"
                      formatter={v => v != null ? `${v.toFixed(1)}%` : ''}
                      style={{ fontSize: 11, fill: '#374151' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* G2 — Model × Prompt Heatmap */}
            <section className="rq1-chart-card rq1-chart-card--wide">
              <h2 className="rq1-section-title">
                G2 — Model × Prompt Heatmap
                <span className="rq1-chart-hint">cell = SRR% · colour: red → blue</span>
              </h2>
              <Heatmap modelMatrix={data.model_matrix} prompts={allPrompts} />
            </section>

          </div>

          {/* ── TABLES ── */}
          <div className="rq1-tables">

          {/* TABLE 1 — Experimental Overview */}
          <section className="rq1-section">
            <h2 className="rq1-section-title">Table 1 — Experimental Overview</h2>
            <table className="rq1-table">
              <thead>
                <tr><th>Item</th><th>Value</th></tr>
              </thead>
              <tbody>
                <tr><td>Total instances</td><td>{data.overview.total_instances}</td></tr>
                <tr><td>Smell types</td><td>{data.by_smell.length}</td></tr>
                <tr><td>Models</td><td>{data.overview.models_count}</td></tr>
                <tr><td>Prompt strategies</td><td>{data.overview.strategies_count}</td></tr>
                <tr><td>Total refactorings</td><td>{data.overview.total_refactorings}</td></tr>
              </tbody>
            </table>
          </section>

          {/* TABLE 2 — Overall SRR */}
          <section className="rq1-section">
            <h2 className="rq1-section-title">Table 2 — Overall Structural Removal Effectiveness</h2>
            <table className="rq1-table">
              <thead>
                <tr><th>Metric</th><th>Value</th></tr>
              </thead>
              <tbody>
                <tr><td>Total attempts (N)</td><td>{data.overall.total_attempts}</td></tr>
                <tr><td>Successful removals (M)</td><td>{data.overall.successful_removals}</td></tr>
                <tr>
                  <td>Overall SRR%</td>
                  <td><strong>{fmt(data.overall.overall_srr)}</strong></td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* TABLE 3 — By Smell Type */}
          <section className="rq1-section">
            <h2 className="rq1-section-title">Table 3 — Removal Rate by Smell Type</h2>
            <table className="rq1-table">
              <thead>
                <tr><th>Smell Type</th><th>N</th><th>Removed</th><th>SRR%</th><th>95% CI</th></tr>
              </thead>
              <tbody>
                {data.by_smell.map(row => (
                  <tr key={row.smell_type}>
                    <td>{row.smell_type}</td>
                    <td>{row.n}</td>
                    <td>{row.removed}</td>
                    <td><span className="rq1-badge">{fmt(row.srr)}</span></td>
                    <td className="rq1-ci">
                      {row.ci_lower != null ? `[${fmt(row.ci_lower)}, ${fmt(row.ci_upper)}]` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* TABLE 4 — By Prompt Strategy */}
          <section className="rq1-section">
            <h2 className="rq1-section-title">Table 4 — Removal Rate by Prompt Strategy</h2>
            <table className="rq1-table">
              <thead>
                <tr><th>Prompt</th><th>N</th><th>Removed</th><th>SRR%</th></tr>
              </thead>
              <tbody>
                {data.by_prompt.map(row => (
                  <tr key={row.prompt}>
                    <td><code>{row.prompt}</code></td>
                    <td>{row.n}</td>
                    <td>{row.removed}</td>
                    <td><span className="rq1-badge">{fmt(row.srr)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* TABLE 5 — Model × Prompt Matrix */}
          <section className="rq1-section rq1-section--wide">
            <h2 className="rq1-section-title">Table 5 — Model × Prompt Removal Matrix</h2>
            <div className="rq1-table-scroll">
              <table className="rq1-table rq1-table--matrix">
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
                      <td className="rq1-model-cell" title={row.model}>{row.model}</td>
                      {allPrompts.map(p => {
                        const bp = row.by_prompt[p];
                        return (
                          <td key={p}>
                            {bp ? matrixCell(bp.removed, bp.n) : '—'}
                          </td>
                        );
                      })}
                      <td>
                        <strong>{matrixCell(row.overall_removed, row.overall_n)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>ALL MODELS</strong></td>
                    {allPrompts.map(p => {
                      const totN = data.model_matrix.reduce((s, r) => s + (r.by_prompt[p]?.n || 0), 0);
                      const totR = data.model_matrix.reduce((s, r) => s + (r.by_prompt[p]?.removed || 0), 0);
                      return <td key={p}><strong>{matrixCell(totR, totN)}</strong></td>;
                    })}
                    <td>
                      <strong>
                        {matrixCell(data.overall.successful_removals, data.overall.total_attempts)}
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          </div>
        </>
      )}
    </div>
  );
}
