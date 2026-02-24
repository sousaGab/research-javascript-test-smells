import React from 'react';
import styles from './AnalyticsFilter.module.css';

/**
 * Analytics Filter component for filtering dashboard data
 * @param {Object} filters - Current filter values
 * @param {Function} onFilterChange - Handler for filter changes
 * @param {Function} onApply - Handler for apply button
 * @param {Function} onReset - Handler for reset button
 * @param {Object} filterOptions - Available options for dropdowns
 */
export default function AnalyticsFilter({ 
  filters, 
  onFilterChange, 
  onApply, 
  onReset,
  filterOptions = {} 
}) {
  const handleMultiSelectChange = (field, value) => {
    const currentValues = filters[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange(field, newValues);
  };

  const handleTriStateChange = (field) => {
    const states = ['both', 'yes', 'no'];
    const currentIndex = states.indexOf(filters[field] || 'both');
    const nextIndex = (currentIndex + 1) % states.length;
    onFilterChange(field, states[nextIndex]);
  };

  const getTriStateLabel = (value) => {
    const labels = { both: 'Both', yes: 'Yes', no: 'No' };
    return labels[value] || 'Both';
  };

  const getTriStateClass = (value) => {
    if (value === 'yes') return styles.triStateYes;
    if (value === 'no') return styles.triStateNo;
    return styles.triStateBoth;
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterRow}>
        {/* Date Range */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Date Range</label>
          <div className={styles.dateInputs}>
            <input
              type="date"
              className={styles.dateInput}
              value={filters.startDate || ''}
              onChange={(e) => onFilterChange('startDate', e.target.value)}
              placeholder="From"
            />
            <span className={styles.dateSeparator}>to</span>
            <input
              type="date"
              className={styles.dateInput}
              value={filters.endDate || ''}
              onChange={(e) => onFilterChange('endDate', e.target.value)}
              placeholder="To"
            />
          </div>
        </div>

        {/* Models */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>AI Models</label>
          <select
            multiple
            className={styles.multiSelect}
            value={filters.selectedModels || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onFilterChange('selectedModels', selected);
            }}
          >
            {(filterOptions.models || []).map((model, index) => (
              <option key={`model-${index}`} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Smell Types */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Smell Types</label>
          <select
            multiple
            className={styles.multiSelect}
            value={filters.selectedSmellTypes || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onFilterChange('selectedSmellTypes', selected);
            }}
          >
            {(filterOptions.smellTypes || []).map((smell, index) => (
              <option key={`smell-${index}`} value={smell}>{smell}</option>
            ))}
          </select>
        </div>

        {/* Prompting Approaches */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Prompting Approach</label>
          <select
            multiple
            className={styles.multiSelect}
            value={filters.selectedPromptingApproaches || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onFilterChange('selectedPromptingApproaches', selected);
            }}
          >
            {(filterOptions.promptingApproaches || []).map((approach, index) => (
              <option key={`approach-${index}`} value={approach}>{approach}</option>
            ))}
          </select>
        </div>

        {/* Repositories */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Repositories</label>
          <select
            multiple
            className={styles.multiSelect}
            value={filters.selectedRepositories || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onFilterChange('selectedRepositories', selected);
            }}
          >
            {(filterOptions.repos || []).map((repo, index) => (
              <option key={`repo-${index}`} value={repo}>{repo}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Success Criteria Section */}
      <div className={styles.successCriteria}>
        <h4 className={styles.criteriaTitle}>Success Criteria</h4>
        <div className={styles.criteriaRow}>
          <div className={styles.triStateGroup}>
            <label className={styles.label}>Smell Removed</label>
            <button
              className={`${styles.triStateButton} ${getTriStateClass(filters.smellRemoved)}`}
              onClick={() => handleTriStateChange('smellRemoved')}
            >
              {getTriStateLabel(filters.smellRemoved)}
            </button>
          </div>

          <div className={styles.triStateGroup}>
            <label className={styles.label}>Tests Still Passing</label>
            <button
              className={`${styles.triStateButton} ${getTriStateClass(filters.testsPassing)}`}
              onClick={() => handleTriStateChange('testsPassing')}
            >
              {getTriStateLabel(filters.testsPassing)}
            </button>
          </div>

          <div className={styles.triStateGroup}>
            <label className={styles.label}>Test Pass Rate Decreased</label>
            <button
              className={`${styles.triStateButton} ${getTriStateClass(filters.testPassRateDecreased)}`}
              onClick={() => handleTriStateChange('testPassRateDecreased')}
            >
              {getTriStateLabel(filters.testPassRateDecreased)}
            </button>
          </div>

          <div className={styles.triStateGroup}>
            <label className={styles.label}>Coverage Decreased</label>
            <button
              className={`${styles.triStateButton} ${getTriStateClass(filters.coverageDecreased)}`}
              onClick={() => handleTriStateChange('coverageDecreased')}
            >
              {getTriStateLabel(filters.coverageDecreased)}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button className={styles.applyButton} onClick={onApply}>
          Apply Filters
        </button>
        <button className={styles.resetButton} onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
