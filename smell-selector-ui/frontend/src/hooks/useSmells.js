/**
 * Custom hook for managing smells state and API calls.
 */

import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/client';

export function useSmells() {
  const [smells, setSmells] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [selectedSmell, setSelectedSmell] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    repo: '',
    smell_type: '',
    tool: '',
    selected: null,
  });
  const [total, setTotal] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);

  // Load repositories on mount
  useEffect(() => {
    loadRepositories();
  }, []);

  // Load smells when filters or page change
  useEffect(() => {
    loadSmells();
  }, [filters, page]);

  const loadRepositories = async () => {
    try {
      const data = await api.getRepositories();
      setRepositories(data);
    } catch (err) {
      console.error('Failed to load repositories:', err);
    }
  };

  const loadSmells = async () => {
    setLoading(true);
    setError(null);

    try {
      const cleanFilters = {};
      if (filters.repo) cleanFilters.repo = filters.repo;
      if (filters.smell_type) cleanFilters.smell_type = filters.smell_type;
      if (filters.tool) cleanFilters.tool = filters.tool;
      if (filters.selected !== null) cleanFilters.selected = filters.selected;

      const offset = (page - 1) * pageSize;
      const data = await api.getSmells({ ...cleanFilters, limit: pageSize, offset });
      setSmells(data.smells);
      setTotal(data.total);
      setSelectedCount(data.selected_count);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load smells:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSmellDetail = async (smellId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getSmellDetail(smellId);
      setSelectedSmell(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load smell detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectSmell = async (smellId, metadata = {}) => {
    try {
      await api.selectSmell(smellId, metadata);
      // Reload to update is_selected status
      await loadSmells();
      if (selectedSmell && selectedSmell.id === smellId) {
        await loadSmellDetail(smellId);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const unselectSmell = async (smellId) => {
    try {
      await api.unselectSmell(smellId);
      // Reload to update is_selected status
      await loadSmells();
      if (selectedSmell && selectedSmell.id === smellId) {
        await loadSmellDetail(smellId);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateMetadata = async (smellId, metadata) => {
    try {
      await api.updateSmellMetadata(smellId, metadata);
      // Reload smell detail
      if (selectedSmell && selectedSmell.id === smellId) {
        await loadSmellDetail(smellId);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      repo: '',
      smell_type: '',
      tool: '',
      selected: null,
    });
    setPage(1); // Reset to first page when clearing filters
  };

  return {
    smells,
    repositories,
    selectedSmell,
    loading,
    error,
    filters,
    total,
    selectedCount,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    setSelectedSmell,
    loadSmellDetail,
    selectSmell,
    unselectSmell,
    updateMetadata,
    updateFilters,
    clearFilters,
    setPage,
    refresh: loadSmells,
  };
}
