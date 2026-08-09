import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, Cell, ResponsiveContainer,
} from 'recharts';
import './RQ3.css';

const API = 'http://localhost:8001/api/rq3';

// ── color constants ──────────────────────────────────────────────────────────
const PURPLE   = '#7c3aed';
const PURPLE_L = '#a78bfa';
const RED      = '#ef4444';
const GREEN    = '#22c55e';
const AMBER    = '#f59e0b';

const MODEL_COLORS = [
  '#7c3aed', '#a855f7', '#6d28d9', '#9333ea', '#4f46e5',
  '#7e22ce', '#c026d3', '#db2777',
];

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt1  = v => v == null ? '—' : `${v.toFixed(1)}%`;
const fmtN  = v => v == null ? '—' : v.toLocaleString();

function downloadCSV(filename, headers, rows) {
  const esc = v => {
    if (v == null) return '';
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers, ...rows].map(r => r.map(esc).join(','));
  const blob  = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function DeltaCell({ v }) {
  if (v == null) return <td className="num">—</td>;
  const cls = v > 0 ? 'delta-pos' : v < 0 ? 'delta-neg' : 'delta-zero';
  const prefix = v > 0 ? '+' : '';
  return <td className={`num ${cls}`}>{prefix}{v.toFixed(3)}</td>;
}

function PctCell({ v, good = 'low' }) {
  if (v == null) return <td className="pct">—</td>;
  const cls = good === 'high'
    ? (v >= 70 ? 'pct-good' : v >= 40 ? '' : 'pct-bad')
    : (v <= 10 ? 'pct-good' : v <= 30 ? '' : 'pct-bad');
  return <td className={`pct ${cls}`}>{v.toFixed(1)}%</td>;
}

function WarningBanner({ message }) {
  return (
    <div className="rq3-warning">
      <span className="rq3-warning-icon">⚠️</span>
      <span>{message}</span>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #ddd6fe', borderRadius: 6, padding: '8px 12px', fontSize: '0.8rem' }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: '#4c1d95' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
function SmellInteractionHeatmap({ matrix, onDownload }) {
  if (!matrix?.targeted_labels?.length || !matrix?.added_labels?.length) {
    return <div className="rq3-empty">No interaction data available.</div>;
  }
  const { targeted_labels, added_labels, cells, max_count } = matrix;

  // Build sparse lookup: targeted → added → count
  const lookup = {};
  for (const c of cells) {
    if (!lookup[c.targeted]) lookup[c.targeted] = {};
    lookup[c.targeted][c.added] = c.count;
  }

  const maxVal = max_count || 1;
  const cellBg = (count) => {
    if (!count) return 'transparent';
    const t = Math.sqrt(count / maxVal);                   // sqrt for perceptual spread
    const r = Math.round(237 + t * (76  - 237));           // #ede9fe → #4c1d95
    const g = Math.round(233 + t * (29  - 233));
    const b = Math.round(254 + t * (149 - 254));
    return `rgb(${r},${g},${b})`;
  };
  const cellFg = (count) => {
    if (!count) return '#d1d5db';
    return Math.sqrt(count / maxVal) > 0.55 ? '#fff' : '#4c1d95';
  };

  return (
    <div className="rq3-heatmap-card">
      <div className="rq3-table-card-header">
        <p className="rq3-table-title">G5 — Smell Interaction Matrix</p>
        {onDownload && <button className="rq3-table-dl-btn" onClick={onDownload}>↓ CSV</button>}
      </div>
      <p className="rq3-chart-subtitle" style={{ marginTop: -8, marginBottom: 12 }}>
        Targeted smell (row) × accidentally added smell (column). Cell = total added instances. Hover for details.
      </p>
      <div className="rq3-heatmap-scroll">
        <table className="rq3-hm-table">
          <thead>
            <tr>
              <th className="rq3-hm-corner">Targeted ↓   Added →</th>
              {added_labels.map(a => (
                <th key={a} className="rq3-hm-col-th">
                  <div className="rq3-hm-col-label">{a}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {targeted_labels.map(t => (
              <tr key={t}>
                <td className="rq3-hm-row-td">{t}</td>
                {added_labels.map(a => {
                  const count = lookup[t]?.[a] ?? 0;
                  return (
                    <td
                      key={a}
                      className="rq3-hm-cell"
                      style={{ background: cellBg(count), color: cellFg(count) }}
                      title={count ? `${t} → ${a}: ${count} instances` : `${t} → ${a}: none`}
                    >
                      {count > 0 ? count : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rq3-hm-legend">
        <span className="rq3-hm-legend-label">0</span>
        <div className="rq3-hm-legend-bar" />
        <span className="rq3-hm-legend-label">{maxVal}</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
export default function RQ3() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [smellType, setSmellType] = useState('');
  const [model, setModel]         = useState('');
  const [prompt, setPrompt]       = useState('');

  const buildParams = useCallback(() => {
    const p = new URLSearchParams();
    if (smellType) p.set('smell_type', smellType);
    if (model)     p.set('ai_model_version', model);
    if (prompt)    p.set('prompting_approach', prompt);
    return p.toString();
  }, [smellType, model, prompt]);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`${API}/summary?${buildParams()}`)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [buildParams]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const exportUrl = (table) => `${API}/export?table=${table}&${buildParams()}`;

  if (loading) return (
    <div className="rq3-loading">
      <div className="rq3-spinner" />
      Loading RQ3 data…
    </div>
  );

  if (error) return (
    <div className="rq3-page">
      <div className="rq3-warning">
        <span className="rq3-warning-icon">❌</span>
        <span>Failed to load data: {error}</span>
      </div>
    </div>
  );

  const fo    = data?.filter_options ?? {};
  const avail = data?.data_availability ?? {};
  const a     = data?.rq3a ?? {};
  const b     = data?.rq3b ?? {};
  const oa    = a.overall ?? {};
  const ob    = b.overall ?? {};

  const smellRemovalData = (a.by_smell ?? []).map(r => ({
    name:              r.smell_type,
    'Removal Rate':    r.removal_rate  ?? 0,
    'New Intros Rate': r.new_introduction_rate ?? 0,
  }));

  const modelNewSmellData = (a.by_model ?? []).map((r, i) => ({
    name:  r.model ?? 'Unknown',
    rate:  r.new_introduction_rate ?? 0,
    color: MODEL_COLORS[i % MODEL_COLORS.length],
  }));

  const coverageDeltaData = (b.by_model ?? []).map((r, i) => ({
    name:  r.model ?? 'Unknown',
    delta: r.avg_delta_statements ?? 0,
    color: MODEL_COLORS[i % MODEL_COLORS.length],
  }));

  // Prompt strategy comparison data (merged smell + coverage)
  const promptSmellData = (a.by_prompt ?? []).map(r => ({
    name:              r.prompt ?? 'Unknown',
    'Removal Rate':    r.removal_rate ?? 0,
    'New Intros Rate': r.new_introduction_rate ?? 0,
  }));

  // Build a lookup for coverage by prompt to merge into prompt table rows
  const promptCoverageLookup = Object.fromEntries(
    (b.by_prompt ?? []).map(r => [r.prompt, r])
  );

  const promptCoverageDeltaData = (b.by_prompt ?? []).map(r => ({
    name:  r.prompt ?? 'Unknown',
    delta: r.avg_delta_statements ?? 0,
  }));

  return (
    <div className="rq3-page">

      {/* Header */}
      <div className="rq3-header">
        <div>
          <h2 className="rq3-title">RQ3 — Structural Side Effects</h2>
          <p className="rq3-subtitle">
            What unintended structural side effects emerge from LLM-based refactoring?
          </p>
        </div>
        <div className="rq3-export-group">
          <a className="rq3-export-btn" href={exportUrl('raw_smells')} download>↓ Raw Smells CSV</a>
          <a className="rq3-export-btn" href={exportUrl('raw_coverage')} download>↓ Raw Coverage CSV</a>
        </div>
      </div>

      {/* Filters */}
      <div className="rq3-filters">
        <label>Smell type</label>
        <select value={smellType} onChange={e => setSmellType(e.target.value)}>
          <option value="">All</option>
          {(fo.smell_types ?? []).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label>Model</label>
        <select value={model} onChange={e => setModel(e.target.value)}>
          <option value="">All</option>
          {(fo.models ?? []).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <label>Prompt</label>
        <select value={prompt} onChange={e => setPrompt(e.target.value)}>
          <option value="">All</option>
          {(fo.prompting_approaches ?? []).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(smellType || model || prompt) && (
          <button className="rq3-filter-clear"
            onClick={() => { setSmellType(''); setModel(''); setPrompt(''); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Data Availability */}
      <div className="rq3-avail-card">
        <h4>Data Availability</h4>
        <div className="rq3-avail-grid">
          {[
            ['Total experiments',       avail.total_experiments],
            ['RQ3a — included',         avail.rq3a_included],
            ['RQ3a — error class',      avail.rq3a_excluded_error_class],
            ['RQ3a — no after CSV',     avail.rq3a_excluded_no_after_data],
            ['RQ3b — included',         avail.rq3b_included],
            ['RQ3b — no coverage data', avail.rq3b_excluded_no_coverage],
          ].map(([label, val]) => (
            <div className="rq3-avail-item" key={label}>
              <div className="avail-label">{label}</div>
              <div className="avail-value">{fmtN(val ?? 0)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ RQ3a — Smell Side Effects ═══════════ */}
      <div className="rq3-section">
        <div className="rq3-section-header">
          <span className="rq3-section-badge">RQ3a</span>
          <div>
            <h3 className="rq3-section-title">Smell Side Effects</h3>
            <p className="rq3-section-desc">
              Does LLM refactoring reliably remove the targeted smell without introducing new ones?
            </p>
          </div>
        </div>

        {avail.rq3a_warning && (
          <WarningBanner message={
            `Only ${avail.rq3a_included} experiments have after-phase smell CSV data. ` +
            `Run the backfill script to increase coverage.`
          } />
        )}

        <div className="rq3-kpi-row">
          <div className="rq3-kpi">
            <div className="rq3-kpi-value">{fmtN(oa.n)}</div>
            <div className="rq3-kpi-label">Included experiments</div>
          </div>
          <div className={`rq3-kpi ${(oa.removal_rate ?? 0) >= 50 ? 'positive' : 'negative'}`}>
            <div className="rq3-kpi-value">{fmt1(oa.removal_rate)}</div>
            <div className="rq3-kpi-label">Smell removal rate</div>
          </div>
          <div className={`rq3-kpi ${(oa.new_introduction_rate ?? 100) <= 20 ? 'positive' : 'negative'}`}>
            <div className="rq3-kpi-value">{fmt1(oa.new_introduction_rate)}</div>
            <div className="rq3-kpi-label">New smell intro rate</div>
          </div>
          <div className="rq3-kpi neutral">
            <div className="rq3-kpi-value">{fmtN(oa.total_added_smell_instances)}</div>
            <div className="rq3-kpi-label">Total added smell instances</div>
          </div>
          <div className={`rq3-kpi ${(oa.avg_added_per_experiment ?? 1) <= 0.1 ? 'positive' : 'negative'}`}>
            <div className="rq3-kpi-value">
              {oa.avg_added_per_experiment != null
                ? oa.avg_added_per_experiment.toFixed(2)
                : '—'}
            </div>
            <div className="rq3-kpi-label">Avg added / experiment</div>
          </div>
        </div>

        <div className="rq3-chart-grid">
          <div className="rq3-chart-card">
            <p className="rq3-chart-title">G1 — Smell Removal vs New Introduction Rate by Smell Type</p>
            <p className="rq3-chart-subtitle">% of included experiments per smell type</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={smellRemovalData} margin={{ top: 4, right: 20, bottom: 60, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Bar dataKey="Removal Rate"    fill={PURPLE} radius={[3,3,0,0]} />
                <Bar dataKey="New Intros Rate" fill={AMBER}  radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rq3-chart-card">
            <p className="rq3-chart-title">G2 — New Smell Introduction Rate by Model</p>
            <p className="rq3-chart-subtitle">% of experiments per model that introduced ≥1 new smell</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelNewSmellData} margin={{ top: 4, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rate" name="New Intro Rate %" radius={[3,3,0,0]}>
                  {modelNewSmellData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* T1 */}
        <div className="rq3-table-card">
          <div className="rq3-table-card-header">
            <p className="rq3-table-title">T1 — By Smell Type</p>
            <button className="rq3-table-dl-btn" onClick={() => downloadCSV(
              'rq3_t1_by_smell_type.csv',
              ['Smell Type', 'n', 'Removed', 'Removal Rate (%)', 'New Intros', 'New Intro Rate (%)'],
              (a.by_smell ?? []).map(r => [
                r.smell_type, r.n, r.removed,
                r.removal_rate, r.new_introduced, r.new_introduction_rate,
              ]),
            )}>↓ CSV</button>
          </div>
          {(a.by_smell ?? []).length === 0
            ? <div className="rq3-empty">No data available.</div>
            : (
              <table className="rq3-table">
                <thead>
                  <tr>
                    <th>Smell Type</th>
                    <th className="num">n</th>
                    <th className="num">Removed</th>
                    <th className="pct">Removal Rate</th>
                    <th className="num">New Intros</th>
                    <th className="pct">New Intro Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {(a.by_smell ?? []).map(r => (
                    <tr key={r.smell_type}>
                      <td>{r.smell_type}</td>
                      <td className="num">{fmtN(r.n)}</td>
                      <td className="num">{fmtN(r.removed)}</td>
                      <PctCell v={r.removal_rate} good="high" />
                      <td className="num">{fmtN(r.new_introduced)}</td>
                      <PctCell v={r.new_introduction_rate} good="low" />
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>

        {/* T2 */}
        <div className="rq3-table-card">
          <div className="rq3-table-card-header">
            <p className="rq3-table-title">T2 — Accidentally Introduced Smells (Taxonomy)</p>
            <button className="rq3-table-dl-btn" onClick={() => downloadCSV(
              'rq3_t2_new_smell_taxonomy.csv',
              ['Introduced Smell Type', 'Count', '% of All New Smells', '% of Included Exps'],
              (a.new_smell_taxonomy ?? []).map(r => [
                r.introduced_smell_type, r.count, r.pct_of_new, r.pct_of_included,
              ]),
            )}>↓ CSV</button>
          </div>
          {(a.new_smell_taxonomy ?? []).length === 0
            ? <div className="rq3-empty">No new smell instances detected.</div>
            : (
              <table className="rq3-table">
                <thead>
                  <tr>
                    <th>Introduced Smell Type</th>
                    <th className="num">Count</th>
                    <th className="pct">% of All New Smells</th>
                    <th className="pct">% of Included Exps</th>
                  </tr>
                </thead>
                <tbody>
                  {(a.new_smell_taxonomy ?? []).map(r => (
                    <tr key={r.introduced_smell_type}>
                      <td>{r.introduced_smell_type}</td>
                      <td className="num">{fmtN(r.count)}</td>
                      <td className="pct">{fmt1(r.pct_of_new)}</td>
                      <td className="pct">{fmt1(r.pct_of_included)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>

        {/* G5 — Smell Interaction Heatmap */}
        <SmellInteractionHeatmap
          matrix={a.interaction_matrix}
          onDownload={() => downloadCSV(
            'rq3_g5_interaction_matrix.csv',
            ['Targeted Smell', 'Added Smell', 'Count'],
            (a.interaction_matrix?.cells ?? []).map(c => [c.targeted, c.added, c.count]),
          )}
        />

        {/* ── Prompt Strategy Comparison ── */}
        <div className="rq3-subsection-title">Prompt Strategy Comparison</div>

        {(a.by_prompt ?? []).length === 0
          ? <div className="rq3-empty">No prompt strategy breakdown available.</div>
          : (
            <>
              <div className="rq3-chart-grid">
                {/* G6 — Smell metrics by prompt */}
                <div className="rq3-chart-card">
                  <p className="rq3-chart-title">G6 — Smell Removal vs New Introduction by Prompt Strategy</p>
                  <p className="rq3-chart-subtitle">% of experiments per prompting approach</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={promptSmellData} margin={{ top: 4, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                      <Bar dataKey="Removal Rate"    fill={PURPLE} radius={[3,3,0,0]} />
                      <Bar dataKey="New Intros Rate" fill={AMBER}  radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* G7 — Coverage delta by prompt */}
                <div className="rq3-chart-card">
                  <p className="rq3-chart-title">G7 — Mean Δ Statement Coverage by Prompt Strategy</p>
                  <p className="rq3-chart-subtitle">Positive = coverage increased; negative = decreased</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={promptCoverageDeltaData} margin={{ top: 4, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={v => v.toFixed(1)} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={0} stroke="#374151" strokeWidth={1.5} />
                      <Bar dataKey="delta" name="Avg Δ Stmt Coverage" radius={[3,3,0,0]}>
                        {promptCoverageDeltaData.map((entry, i) => (
                          <Cell key={i} fill={entry.delta >= 0 ? GREEN : RED} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* T5 — Combined prompt strategy table */}
              <div className="rq3-table-card">
                <div className="rq3-table-card-header">
                  <p className="rq3-table-title">T5 — Smell &amp; Coverage by Prompt Strategy</p>
                  <button className="rq3-table-dl-btn" onClick={() => downloadCSV(
                    'rq3_t5_by_prompt_strategy.csv',
                    ['Prompt Strategy', 'n (Smell)', 'Removal Rate (%)', 'New Intro Rate (%)', 'n (Coverage)', 'Avg Δ Stmt', 'Degraded (%)', 'Improved (%)'],
                    (a.by_prompt ?? []).map(r => {
                      const cov = promptCoverageLookup[r.prompt] ?? {};
                      return [
                        r.prompt, r.n, r.removal_rate, r.new_introduction_rate,
                        cov.n ?? '—', cov.avg_delta_statements ?? '—',
                        cov.degraded_rate ?? '—', cov.improved_rate ?? '—',
                      ];
                    }),
                  )}>↓ CSV</button>
                </div>
                <table className="rq3-table">
                  <thead>
                    <tr>
                      <th>Prompt Strategy</th>
                      <th className="num">n</th>
                      <th className="pct">Removal Rate</th>
                      <th className="pct">New Intro Rate</th>
                      <th className="num">n (Cov.)</th>
                      <th className="num">Avg Δ Stmt</th>
                      <th className="pct">Degraded %</th>
                      <th className="pct">Improved %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(a.by_prompt ?? []).map(r => {
                      const cov = promptCoverageLookup[r.prompt] ?? {};
                      return (
                        <tr key={r.prompt}>
                          <td>{r.prompt}</td>
                          <td className="num">{fmtN(r.n)}</td>
                          <PctCell v={r.removal_rate} good="high" />
                          <PctCell v={r.new_introduction_rate} good="low" />
                          <td className="num">{cov.n != null ? fmtN(cov.n) : '—'}</td>
                          <DeltaCell v={cov.avg_delta_statements ?? null} />
                          <PctCell v={cov.degraded_rate ?? null} good="low" />
                          <PctCell v={cov.improved_rate ?? null} good="high" />
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )
        }

      </div>

      {/* ═══════════ RQ3b — Coverage Side Effects ═══════════ */}
      <div className="rq3-section">
        <div className="rq3-section-header">
          <span className="rq3-section-badge">RQ3b</span>
          <div>
            <h3 className="rq3-section-title">Coverage Side Effects</h3>
            <p className="rq3-section-desc">
              Does LLM refactoring preserve, degrade, or improve test coverage?
            </p>
          </div>
        </div>

        {avail.rq3b_warning && (
          <WarningBanner message={
            `Only ${avail.rq3b_included} experiments have coverage data. ` +
            `Ensure the pipeline was run with the --coverage flag for meaningful results.`
          } />
        )}

        <div className="rq3-kpi-row">
          <div className="rq3-kpi">
            <div className="rq3-kpi-value">{fmtN(ob.n)}</div>
            <div className="rq3-kpi-label">Included experiments</div>
          </div>
          <div className={`rq3-kpi ${(ob.avg_delta_statements ?? -1) >= 0 ? 'positive' : 'negative'}`}>
            <div className="rq3-kpi-value">
              {ob.avg_delta_statements != null
                ? `${ob.avg_delta_statements > 0 ? '+' : ''}${ob.avg_delta_statements.toFixed(3)}`
                : '—'}
            </div>
            <div className="rq3-kpi-label">Avg Δ Statements%</div>
          </div>
          <div className={`rq3-kpi ${(ob.avg_delta_lines ?? -1) >= 0 ? 'positive' : 'negative'}`}>
            <div className="rq3-kpi-value">
              {ob.avg_delta_lines != null
                ? `${ob.avg_delta_lines > 0 ? '+' : ''}${ob.avg_delta_lines.toFixed(3)}`
                : '—'}
            </div>
            <div className="rq3-kpi-label">Avg Δ Lines%</div>
          </div>
          <div className="rq3-kpi positive">
            <div className="rq3-kpi-value">{fmt1(ob.preserved_rate)}</div>
            <div className="rq3-kpi-label">Coverage preserved</div>
          </div>
          <div className={`rq3-kpi ${(ob.degraded_rate ?? 100) <= 20 ? 'positive' : 'negative'}`}>
            <div className="rq3-kpi-value">{fmt1(ob.degraded_rate)}</div>
            <div className="rq3-kpi-label">Coverage degraded</div>
          </div>
          <div className="rq3-kpi positive">
            <div className="rq3-kpi-value">{fmt1(ob.improved_rate)}</div>
            <div className="rq3-kpi-label">Coverage improved</div>
          </div>
        </div>

        <div className="rq3-chart-grid">
          <div className="rq3-chart-card">
            <p className="rq3-chart-title">G3 — Mean Δ Statement Coverage by Model</p>
            <p className="rq3-chart-subtitle">Positive = coverage increased; negative = decreased</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={coverageDeltaData} margin={{ top: 4, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => v.toFixed(1)} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#374151" strokeWidth={1.5} />
                <Bar dataKey="delta" name="Avg Δ Stmt Coverage" radius={[3,3,0,0]}>
                  {coverageDeltaData.map((entry, i) => (
                    <Cell key={i} fill={entry.delta >= 0 ? GREEN : RED} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rq3-chart-card">
            <p className="rq3-chart-title">G4 — Coverage Classification (overall)</p>
            <p className="rq3-chart-subtitle">Distribution: improved / preserved / degraded</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={[{
                  name: 'All experiments',
                  Improved:  ob.improved_rate  ?? 0,
                  Preserved: ob.preserved_rate ?? 0,
                  Degraded:  ob.degraded_rate  ?? 0,
                }]}
                layout="vertical"
                margin={{ top: 4, right: 20, bottom: 20, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Bar dataKey="Improved"  fill={GREEN}    stackId="a" />
                <Bar dataKey="Preserved" fill={PURPLE_L} stackId="a" />
                <Bar dataKey="Degraded"  fill={RED}      stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* T3 */}
        <div className="rq3-table-card">
          <div className="rq3-table-card-header">
            <p className="rq3-table-title">T3 — Coverage Delta by Smell Type</p>
            <button className="rq3-table-dl-btn" onClick={() => downloadCSV(
              'rq3_t3_coverage_by_smell.csv',
              ['Smell Type', 'n', 'Avg Δ Stmt', 'Avg Δ Branch', 'Avg Δ Func', 'Avg Δ Lines', 'Degraded (%)'],
              (b.by_smell ?? []).map(r => [
                r.smell_type, r.n,
                r.avg_delta_statements, r.avg_delta_branches,
                r.avg_delta_functions, r.avg_delta_lines,
                r.degraded_rate,
              ]),
            )}>↓ CSV</button>
          </div>
          {(b.by_smell ?? []).length === 0
            ? <div className="rq3-empty">No coverage data available.</div>
            : (
              <table className="rq3-table">
                <thead>
                  <tr>
                    <th>Smell Type</th>
                    <th className="num">n</th>
                    <th className="num">Avg Δ Stmt</th>
                    <th className="num">Avg Δ Branch</th>
                    <th className="num">Avg Δ Func</th>
                    <th className="num">Avg Δ Lines</th>
                    <th className="pct">Degraded %</th>
                  </tr>
                </thead>
                <tbody>
                  {(b.by_smell ?? []).map(r => (
                    <tr key={r.smell_type}>
                      <td>{r.smell_type}</td>
                      <td className="num">{fmtN(r.n)}</td>
                      <DeltaCell v={r.avg_delta_statements} />
                      <DeltaCell v={r.avg_delta_branches} />
                      <DeltaCell v={r.avg_delta_functions} />
                      <DeltaCell v={r.avg_delta_lines} />
                      <PctCell v={r.degraded_rate} good="low" />
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>

        {/* T4 */}
        <div className="rq3-table-card">
          <div className="rq3-table-card-header">
            <p className="rq3-table-title">T4 — Coverage Delta by Model</p>
            <button className="rq3-table-dl-btn" onClick={() => downloadCSV(
              'rq3_t4_coverage_by_model.csv',
              ['Model', 'n', 'Avg Δ Stmt', 'Degraded Exps', 'Degraded (%)'],
              (b.by_model ?? []).map(r => [
                r.model, r.n,
                r.avg_delta_statements, r.degraded_experiments, r.degraded_rate,
              ]),
            )}>↓ CSV</button>
          </div>
          {(b.by_model ?? []).length === 0
            ? <div className="rq3-empty">No coverage data available.</div>
            : (
              <table className="rq3-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th className="num">n</th>
                    <th className="num">Avg Δ Stmt</th>
                    <th className="num">Degraded Exps</th>
                    <th className="pct">Degraded %</th>
                  </tr>
                </thead>
                <tbody>
                  {(b.by_model ?? []).map(r => (
                    <tr key={r.model}>
                      <td>{r.model}</td>
                      <td className="num">{fmtN(r.n)}</td>
                      <DeltaCell v={r.avg_delta_statements} />
                      <td className="num">{fmtN(r.degraded_experiments)}</td>
                      <PctCell v={r.degraded_rate} good="low" />
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>

        <div className="rq3-export-group" style={{ marginTop: 8 }}>
          <a className="rq3-export-btn" href={exportUrl('by_smell')} download>↓ By Smell CSV</a>
          <a className="rq3-export-btn" href={exportUrl('by_model')} download>↓ By Model CSV</a>
          <a className="rq3-export-btn" href={exportUrl('new_smell_taxonomy')} download>↓ New Smell Taxonomy CSV</a>
          <a className="rq3-export-btn" href={exportUrl('coverage_summary')} download>↓ Coverage Summary CSV</a>
        </div>
      </div>

    </div>
  );
}