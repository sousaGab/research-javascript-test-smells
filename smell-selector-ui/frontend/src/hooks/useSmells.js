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

  // Load repositories on mount
  useEffect(() => {
    loadRepositories();
  }, []);

  // Load smells when filters change
  useEffect(() => {
    loadSmells();
  }, [filters]);

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

      const data = await api.getSmells({ ...cleanFilters, limit: 100 });
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
  };

  const clearFilters = () => {
    setFilters({
      repo: '',
      smell_type: '',
      tool: '',
      selected: null,
    });
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
    setSelectedSmell,
    loadSmellDetail,
    selectSmell,
    unselectSmell,
    updateMetadata,
    updateFilters,
    clearFilters,
    refresh: loadSmells,
  };
}
