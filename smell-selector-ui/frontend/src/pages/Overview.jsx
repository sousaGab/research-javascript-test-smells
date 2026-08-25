import React, { useEffect, useMemo, useState } from 'react';
import BarChartCard from '../components/BarChartCard/BarChartCard';
import styles from './Overview.module.css';

const API = 'http://localhost:8001/api/overview';
const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Overview() {
  const [draftFilters, setDraftFilters] = useState({
    selectedRepositories: [],
    selectedSmellTypes: [],
  });
  const [repoSearch, setRepoSearch] = useState('');
  const [smellSearch, setSmellSearch] = useState('');
  const [data, setData] = useState({
    summary: {},
    by_smell_type: [],
    by_repository: [],
    filter_options: { repos: [], smellTypes: [] },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    selectedRepositories: [],
    selectedSmellTypes: [],
  });
  const [initialized, setInitialized] = useState(false);

  const fetchOverview = async (filtersToUse) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filtersToUse.selectedRepositories.length) {
        params.set('repos', filtersToUse.selectedRepositories.join(','));
      }
      if (filtersToUse.selectedSmellTypes.length) {
        params.set('smell_types', filtersToUse.selectedSmellTypes.join(','));
      }
      const res = await fetch(`${API}?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      if (!initialized) {
        setInitialized(true);
      }
    } catch (e) {
      setError(e.message || 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) {
      void fetchOverview(appliedFilters);
    }
  }, [initialized, appliedFilters]);

  const smellTypes = useMemo(() => {
    if (data.by_smell_type?.length) {
      return data.by_smell_type.map((item) => item.smell_type);
    }

    const repoTypes = (data.by_repository || []).flatMap((repo) =>
      (repo.smell_types || []).map((item) => item.smell_type)
    );
    return [...new Set(repoTypes)];
  }, [data]);

  const repoChartData = useMemo(() => {
    const rows = (data.by_repository || []).map((repo) => {
      const row = { repository: repo.repository };
      const smellMap = new Map((repo.smell_types || []).map((item) => [item.smell_type, Number(item.count || 0)]));

      smellTypes.forEach((smellType) => {
        row[smellType] = smellMap.get(smellType) || 0;
      });

      return row;
    });

    return rows;
  }, [data, smellTypes]);

  const repoBars = smellTypes.map((smellType, index) => ({
    key: smellType,
    name: smellType,
    color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  const summary = data.summary || {};
  const hasPendingChanges =
    JSON.stringify(draftFilters.selectedRepositories) !== JSON.stringify(appliedFilters.selectedRepositories) ||
    JSON.stringify(draftFilters.selectedSmellTypes) !== JSON.stringify(appliedFilters.selectedSmellTypes);

  const toggleInArray = (list, value) => (
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  );

  const filteredRepoOptions = (data.filter_options?.repos || [])
    .filter((repo) => repo.toLowerCase().includes(repoSearch.toLowerCase()));
  const filteredSmellOptions = (data.filter_options?.smellTypes || [])
    .filter((smellType) => smellType.toLowerCase().includes(smellSearch.toLowerCase()));

  const applyFilters = async () => {
    setAppliedFilters(draftFilters);
    await fetchOverview(draftFilters);
  };

  const resetFilters = async () => {
    const reset = { selectedRepositories: [], selectedSmellTypes: [] };
    setDraftFilters(reset);
    setAppliedFilters(reset);
    setRepoSearch('');
    setSmellSearch('');
    await fetchOverview(reset);
  };

  const exportCsv = () => {
    const params = new URLSearchParams();
    if (appliedFilters.selectedRepositories.length) {
      params.set('repos', appliedFilters.selectedRepositories.join(','));
    }
    if (appliedFilters.selectedSmellTypes.length) {
      params.set('smell_types', appliedFilters.selectedSmellTypes.join(','));
    }
    window.location.href = `${API}/export?${params.toString()}`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Overview</h1>
          <p className={styles.subtitle}>
          Distribution of smells by repository and smell type.
          </p>
        </div>
        <button className={styles.exportButton} type="button" onClick={exportCsv}>
          Export filtered CSV
        </button>
      </div>

      <section className={styles.filtersCard}>
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <div className={styles.filterHeader}>
              <label htmlFor="repo-search" className={styles.label}>Repositories</label>
              <span className={styles.selectedCount}>
                {draftFilters.selectedRepositories.length} selected
              </span>
            </div>
            <input
              id="repo-search"
              className={styles.searchInput}
              type="text"
              value={repoSearch}
              onChange={(event) => setRepoSearch(event.target.value)}
              placeholder="Search repositories..."
            />
            <div className={styles.quickActions}>
              <button
                type="button"
                className={styles.quickButton}
                onClick={() => setDraftFilters((current) => ({
                  ...current,
                  selectedRepositories: [...(data.filter_options?.repos || [])],
                }))}
              >
                Select all
              </button>
              <button
                type="button"
                className={styles.quickButton}
                onClick={() => setDraftFilters((current) => ({ ...current, selectedRepositories: [] }))}
              >
                Clear
              </button>
            </div>
            <div className={styles.optionsList}>
              {filteredRepoOptions.map((repo) => (
                <label key={repo} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={draftFilters.selectedRepositories.includes(repo)}
                    onChange={() => setDraftFilters((current) => ({
                      ...current,
                      selectedRepositories: toggleInArray(current.selectedRepositories, repo),
                    }))}
                  />
                  <span>{repo}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterHeader}>
              <label htmlFor="smell-search" className={styles.label}>Smell types</label>
              <span className={styles.selectedCount}>
                {draftFilters.selectedSmellTypes.length} selected
              </span>
            </div>
            <input
              id="smell-search"
              className={styles.searchInput}
              type="text"
              value={smellSearch}
              onChange={(event) => setSmellSearch(event.target.value)}
              placeholder="Search smell types..."
            />
            <div className={styles.quickActions}>
              <button
                type="button"
                className={styles.quickButton}
                onClick={() => setDraftFilters((current) => ({
                  ...current,
                  selectedSmellTypes: [...(data.filter_options?.smellTypes || [])],
                }))}
              >
                Select all
              </button>
              <button
                type="button"
                className={styles.quickButton}
                onClick={() => setDraftFilters((current) => ({ ...current, selectedSmellTypes: [] }))}
              >
                Clear
              </button>
            </div>
            <div className={styles.optionsList}>
              {filteredSmellOptions.map((smellType) => (
                <label key={smellType} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={draftFilters.selectedSmellTypes.includes(smellType)}
                    onChange={() => setDraftFilters((current) => ({
                      ...current,
                      selectedSmellTypes: toggleInArray(current.selectedSmellTypes, smellType),
                    }))}
                  />
                  <span>{smellType}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          {hasPendingChanges && <span className={styles.pendingBadge}>Unsaved filter changes</span>}
          <button className={styles.applyButton} type="button" onClick={applyFilters} disabled={loading || !hasPendingChanges}>
            Apply filters
          </button>
          <button className={styles.resetButton} type="button" onClick={resetFilters} disabled={loading}>
            Reset
          </button>
        </div>
      </section>

      {error && (
        <div className={styles.errorBox}>
          Error loading overview: {error}
        </div>
      )}

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total repositories</div>
          <div className={styles.kpiValue}>{summary.total_repositories || 0}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total smells</div>
          <div className={styles.kpiValue}>{summary.total_smells || 0}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Smell types</div>
          <div className={styles.kpiValue}>{summary.unique_smell_types || 0}</div>
        </div>
      </div>

      <BarChartCard
        title="Smells by type"
        data={data.by_smell_type || []}
        xKey="smell_type"
        bars={[{ key: 'count', name: 'Smells', color: '#3b82f6' }]}
        loading={loading}
      />

      <BarChartCard
        title="Smells by repository and type"
        data={repoChartData}
        xKey="repository"
        bars={repoBars}
        loading={loading}
      />
    </div>
  );
}
