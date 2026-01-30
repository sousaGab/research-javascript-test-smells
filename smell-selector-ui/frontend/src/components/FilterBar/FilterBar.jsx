import { useState, useEffect } from 'react';
import { getFilterOptions } from '../../api/client';
import styles from './FilterBar.module.css';

export function FilterBar({ repositories, filters, onFilterChange, onClearFilters, total, selectedCount }) {
  const [detectionTools, setDetectionTools] = useState([]);
  const [smellTypes, setSmellTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const options = await getFilterOptions();
        setDetectionTools(options.detection_tools || []);
        setSmellTypes(options.smell_types || []);
      } catch (error) {
        console.error('Failed to load filter options:', error);
        // Fallback to empty arrays
        setDetectionTools([]);
        setSmellTypes([]);
      } finally {
        setLoading(false);
      }
    }

    loadFilterOptions();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <select
          className={styles.select}
          value={filters.repo}
          onChange={(e) => onFilterChange({ repo: e.target.value })}
        >
          <option value="">All Repositories</option>
          {repositories.map((repo) => (
            <option key={repo.id} value={repo.name}>
              {repo.name} ({repo.total_smells})
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filters.smell_type}
          onChange={(e) => onFilterChange({ smell_type: e.target.value })}
          disabled={loading}
        >
          <option value="">
            {loading ? 'Loading smell types...' : 'All Smell Types'}
          </option>
          {smellTypes.map((smell) => (
            <option key={smell.name} value={smell.name}>
              {smell.is_primary ? '★ ' : ''}{smell.name} ({smell.count})
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filters.tool}
          onChange={(e) => onFilterChange({ tool: e.target.value })}
          disabled={loading}
        >
          <option value="">
            {loading ? 'Loading tools...' : 'All Tools'}
          </option>
          {detectionTools.map((tool) => (
            <option key={tool} value={tool}>
              {tool}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filters.selected === null ? '' : filters.selected}
          onChange={(e) => {
            const value = e.target.value === '' ? null : e.target.value === 'true';
            onFilterChange({ selected: value });
          }}
        >
          <option value="">All Smells</option>
          <option value="false">Not Selected</option>
          <option value="true">Selected for Study</option>
        </select>

        <button className={styles.clearButton} onClick={onClearFilters}>
          Clear Filters
        </button>

        <button
          className={styles.exportButton}
          onClick={() => {
            // Build query params from current filters
            const params = new URLSearchParams();
            if (filters.repo) params.append('repo', filters.repo);
            if (filters.smell_type) params.append('smell_type', filters.smell_type);
            if (filters.tool) params.append('tool', filters.tool);

            const url = `/api/export-all-smells${params.toString() ? '?' + params.toString() : ''}`;
            window.open(url, '_blank');
          }}
          title="Export filtered smells to CSV"
        >
          📥 Export Filtered
        </button>

        <button
          className={styles.exportButton}
          onClick={() => window.open('/api/export-selected-smells', '_blank')}
          disabled={selectedCount === 0}
          title={selectedCount === 0 ? 'No smells selected' : 'Export selected smells to CSV'}
        >
          ⬇️ Export Selected ({selectedCount})
        </button>
      </div>

      <div className={styles.stats}>
        <span className={styles.stat}>
          Total: <strong>{total}</strong>
        </span>
        <span className={styles.stat}>
          Selected: <strong>{selectedCount}</strong>
        </span>
      </div>
    </div>
  );
}
