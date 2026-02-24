import { useState, useEffect, useCallback } from 'react';
import {
  fetchAnalyticsOverview,
  fetchAnalyticsModels,
  fetchAnalyticsSmells,
  fetchAnalyticsTests,
  fetchAnalyticsTimeline,
  fetchAnalyticsRegressions,
  getRefatoracoesFilterOptions,
} from '../api/client';

const initialFilters = {
  startDate: '',
  endDate: '',
  selectedModels: [],
  selectedSmellTypes: [],
  selectedPromptingApproaches: [],
  selectedRepositories: [],
  smellRemoved: 'both',
  testsPassing: 'both',
  testPassRateDecreased: 'both',
  coverageDecreased: 'both',
};

export function useDataAnalysis() {
  // Filter state
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  // Data state
  const [overview, setOverview] = useState({ data: null, loading: true, error: null });
  const [modelStats, setModelStats] = useState({ data: [], loading: true, error: null });
  const [smellStats, setSmellStats] = useState({ data: [], loading: true, error: null });
  const [testStats, setTestStats] = useState({ data: null, loading: true, error: null });
  const [timeline, setTimeline] = useState({ data: [], loading: true, error: null });
  const [regressions, setRegressions] = useState({ data: null, loading: true, error: null });

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    models: [],
    smellTypes: [],
    repos: [],
    promptingApproaches: [],
  });

  // Fetch filter options
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const options = await getRefatoracoesFilterOptions();
        setFilterOptions({
          models: (options.ai_models || []).map(m => m.label || m.ai_model_version || 'Unknown'),
          smellTypes: (options.smell_types || []).map(s => s.name),
          repos: options.repositories || [],
          promptingApproaches: (options.prompting_approaches || []).map(p => p.name),
        });
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    }
    loadFilterOptions();
  }, []);

  // Fetch all analytics data
  const fetchAllData = useCallback(async (currentFilters) => {
    // Overview
    setOverview(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchAnalyticsOverview(currentFilters);
      setOverview({ data, loading: false, error: null });
    } catch (error) {
      console.error('Failed to fetch overview:', error);
      setOverview({ data: null, loading: false, error: error.message });
    }

    // Models
    setModelStats(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchAnalyticsModels(currentFilters);
      setModelStats({ data, loading: false, error: null });
    } catch (error) {
      console.error('Failed to fetch model stats:', error);
      setModelStats({ data: [], loading: false, error: error.message });
    }

    // Smells
    setSmellStats(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchAnalyticsSmells(currentFilters);
      setSmellStats({ data, loading: false, error: null });
    } catch (error) {
      console.error('Failed to fetch smell stats:', error);
      setSmellStats({ data: [], loading: false, error: error.message });
    }

    // Tests
    setTestStats(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchAnalyticsTests(currentFilters);
      setTestStats({ data, loading: false, error: null });
    } catch (error) {
      console.error('Failed to fetch test stats:', error);
      setTestStats({ data: null, loading: false, error: error.message });
    }

    // Timeline
    setTimeline(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchAnalyticsTimeline(currentFilters);
      setTimeline({ data, loading: false, error: null });
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      setTimeline({ data: [], loading: false, error: error.message });
    }

    // Regressions
    setRegressions(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchAnalyticsRegressions(currentFilters);
      setRegressions({ data, loading: false, error: null });
    } catch (error) {
      console.error('Failed to fetch regressions:', error);
      setRegressions({ data: null, loading: false, error: error.message });
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchAllData(appliedFilters);
  }, [appliedFilters, fetchAllData]);

  // Filter handlers
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }, []);

  return {
    // Filter state
    filters,
    setFilters: handleFilterChange,

    // Data
    overview,
    modelStats,
    smellStats,
    testStats,
    timeline,
    regressions,

    // Filter options
    filterOptions,

    // Actions
    applyFilters,
    resetFilters,
  };
}
