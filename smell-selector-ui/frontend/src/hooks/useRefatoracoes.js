import { useState, useEffect, useCallback } from 'react';
import {
  getRefatoracoes,
  getRefatoracaoDetail,
  getRefatoracoesFilterOptions,
} from '../api/client';

const PAGE_SIZE = 30;

export function useRefatoracoes() {
  const [experiments, setExperiments] = useState([]);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterOptions, setFilterOptions] = useState(null);
  const [layout, setLayout] = useState('side-by-side');

  const [filters, setFilters] = useState({
    repo: '',
    smell_type: '',
    ai_model: '',
    ai_model_version: '',
    prompting_approach: '',
    smell_removed: '',
    coverage_changed: '',
    coverage_decreased: '',
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const loadExperiments = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: PAGE_SIZE, offset: (currentPage - 1) * PAGE_SIZE };
      if (currentFilters.repo) params.repo = currentFilters.repo;
      if (currentFilters.smell_type) params.smell_type = currentFilters.smell_type;
      if (currentFilters.ai_model) params.ai_model = currentFilters.ai_model;
      if (currentFilters.ai_model_version) params.ai_model_version = currentFilters.ai_model_version;
      if (currentFilters.prompting_approach) params.prompting_approach = currentFilters.prompting_approach;
      if (currentFilters.smell_removed !== '') params.smell_removed = currentFilters.smell_removed;
      if (currentFilters.coverage_changed !== '') params.coverage_changed = currentFilters.coverage_changed;
      if (currentFilters.coverage_decreased !== '') params.coverage_decreased = currentFilters.coverage_decreased;

      const data = await getRefatoracoes(params);
      setExperiments(data.experiments);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFilterOptions = useCallback(async () => {
    try {
      const data = await getRefatoracoesFilterOptions();
      setFilterOptions(data);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    loadExperiments(filters, page);
  }, [filters, page, loadExperiments]);

  const loadExperimentDetail = useCallback(async (experimentId) => {
    setDetailLoading(true);
    try {
      const data = await getRefatoracaoDetail(experimentId);
      setSelectedExperiment(data);
    } catch (err) {
      console.error('Failed to load experiment detail:', err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
    setSelectedExperiment(null);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      repo: '',
      smell_type: '',
      ai_model: '',
      ai_model_version: '',
      prompting_approach: '',
      smell_removed: '',
      coverage_changed: '',
      coverage_decreased: '',
    });
    setPage(1);
    setSelectedExperiment(null);
  }, []);

  const refreshExperiments = useCallback(async () => {
    await loadExperiments(filters, page);
  }, [filters, page, loadExperiments]);

  return {
    experiments,
    selectedExperiment,
    loading,
    detailLoading,
    error,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
    filters,
    filterOptions,
    layout,
    setLayout,
    loadExperimentDetail,
    updateFilters,
    clearFilters,
    setPage,
    refreshExperiments,
  };
}
