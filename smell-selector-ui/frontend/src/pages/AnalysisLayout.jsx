import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const rqs = [
  { path: '/analysis/overview', label: 'Overview', desc: 'Repository smell overview' },
  { path: '/analysis/rq1', label: 'RQ1', desc: 'Smell prevalence' },
  { path: '/analysis/rq2', label: 'RQ2', desc: 'Refactoring success' },
  { path: '/analysis/rq3', label: 'RQ3', desc: 'Structural side effects' },
  { path: '/analysis/rq4', label: 'RQ4', desc: 'Model comparison' },
  { path: '/analysis/rq5', label: 'RQ5', desc: 'Smell-specific patterns' },
];

export default function AnalysisLayout() {
  return (
    <div className="rq-layout">
      <aside className="side-menu">
        <span className="side-menu-title">Research Questions</span>
        <nav>
          {rqs.map(({ path, label, desc }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `side-link${isActive ? ' side-link-active' : ''}`}
            >
              <strong>{label}</strong>
              <span className="side-link-label">{desc}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="rq-main">
        <Outlet />
      </main>
    </div>
  );
}