import { useState } from 'react';
import './DiffViewer.css';

function CodePanel({ title, code, label }) {
  if (!code) {
    return (
      <div className="diff-panel diff-panel-empty">
        <div className="diff-panel-header">{title}</div>
        <div className="diff-panel-body diff-empty-msg">No code available</div>
      </div>
    );
  }

  const lines = code.split('\n');

  return (
    <div className="diff-panel">
      <div className="diff-panel-header">
        <span>{title}</span>
        {label && <span className="diff-panel-label">{label}</span>}
        <span className="diff-panel-lines">{lines.length} lines</span>
      </div>
      <div className="diff-panel-body">
        <div className="diff-lines">
          {lines.map((line, i) => (
            <div key={i} className="diff-line">
              <span className="diff-line-number">{i + 1}</span>
              <span className="diff-line-content">{line || ' '}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DiffViewer({ originalCode, refactoredCode, layout, onLayoutChange }) {
  return (
    <div className="diff-viewer">
      <div className="diff-viewer-toolbar">
        <span className="diff-viewer-title">Original vs Refactored Code</span>
        <div className="diff-layout-toggle">
          <button
            className={`toggle-btn${layout === 'side-by-side' ? ' toggle-btn-active' : ''}`}
            onClick={() => onLayoutChange('side-by-side')}
            title="Side by side"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="2" width="6" height="12" rx="1"/>
              <rect x="9" y="2" width="6" height="12" rx="1"/>
            </svg>
            Side by side
          </button>
          <button
            className={`toggle-btn${layout === 'stacked' ? ' toggle-btn-active' : ''}`}
            onClick={() => onLayoutChange('stacked')}
            title="Stacked"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="1" width="12" height="6" rx="1"/>
              <rect x="2" y="9" width="12" height="6" rx="1"/>
            </svg>
            Stacked
          </button>
        </div>
      </div>

      <div className={`diff-panels diff-panels-${layout}`}>
        <CodePanel title="Original" code={originalCode} label="before" />
        <CodePanel title="Refactored" code={refactoredCode} label="after" />
      </div>
    </div>
  );
}
