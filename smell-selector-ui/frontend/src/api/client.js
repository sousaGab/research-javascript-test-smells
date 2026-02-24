/**
 * API client for communicating with the FastAPI backend.
 */

const API_BASE_URL = '/api';

/**
 * Fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// =============================================================================
// REPOSITORIES
// =============================================================================

export async function getRepositories() {
  return fetchAPI('/repositories');
}

// =============================================================================
// SMELLS
// =============================================================================

export async function getSmells(filters = {}) {
  const params = new URLSearchParams();

  if (filters.repo) params.append('repo', filters.repo);
  if (filters.smell_type) params.append('smell_type', filters.smell_type);
  if (filters.tool) params.append('tool', filters.tool);
  if (filters.selected !== undefined) params.append('selected', filters.selected);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);

  const queryString = params.toString();
  return fetchAPI(`/smells${queryString ? '?' + queryString : ''}`);
}

export async function getSmellDetail(smellId) {
  return fetchAPI(`/smells/${smellId}`);
}

export async function selectSmell(smellId, data = {}) {
  return fetchAPI(`/smells/${smellId}/select`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function unselectSmell(smellId) {
  return fetchAPI(`/smells/${smellId}/unselect`, {
    method: 'DELETE',
  });
}

export async function updateSmellMetadata(smellId, metadata) {
  return fetchAPI(`/smells/${smellId}/metadata`, {
    method: 'PATCH',
    body: JSON.stringify(metadata),
  });
}

// =============================================================================
// STUDY SMELLS
// =============================================================================

export async function getStudySmells() {
  return fetchAPI('/study-smells');
}

// =============================================================================
// STATISTICS
// =============================================================================

export async function getStatistics() {
  return fetchAPI('/stats');
}

// =============================================================================
// FILTER OPTIONS
// =============================================================================

export async function getFilterOptions() {
  return fetchAPI('/filter-options');
}

export async function getSmellCatalog() {
  return fetchAPI('/smell-catalog');
}

// =============================================================================
// REFATORACOES
// =============================================================================

export async function getRefatoracoesFilterOptions() {
  return fetchAPI('/refatoracoes/filter-options');
}

export async function getRefatoracoes(params = {}) {
  const query = new URLSearchParams();
  if (params.repo) query.append('repo', params.repo);
  if (params.smell_type) query.append('smell_type', params.smell_type);
  if (params.ai_model) query.append('ai_model', params.ai_model);
  if (params.ai_model_version) query.append('ai_model_version', params.ai_model_version);
  if (params.prompting_approach) query.append('prompting_approach', params.prompting_approach);
  if (params.smell_removed !== undefined && params.smell_removed !== '') {
    query.append('smell_removed', params.smell_removed);
  }
  if (params.coverage_changed !== undefined && params.coverage_changed !== '') {
    query.append('coverage_changed', params.coverage_changed);
  }
  if (params.coverage_decreased !== undefined && params.coverage_decreased !== '') {
    query.append('coverage_decreased', params.coverage_decreased);
  }
  if (params.limit) query.append('limit', params.limit);
  if (params.offset !== undefined) query.append('offset', params.offset);
  const qs = query.toString();
  return fetchAPI(`/refatoracoes${qs ? '?' + qs : ''}`);
}

export async function getRefatoracaoDetail(experimentId) {
  return fetchAPI(`/refatoracoes/${experimentId}`);
}

export async function deleteExperiment(experimentId) {
  return fetchAPI(`/refatoracoes/${experimentId}`, {
    method: 'DELETE',
  });
}

// =============================================================================
// ANALYTICS
// =============================================================================

/**
 * Build analytics query parameters from filters
 */
function buildAnalyticsParams(filters = {}) {
  const params = new URLSearchParams();

  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  
  if (filters.selectedModels && filters.selectedModels.length > 0) {
    params.append('model_ids', filters.selectedModels.join(','));
  }
  
  if (filters.selectedSmellTypes && filters.selectedSmellTypes.length > 0) {
    params.append('smell_types', filters.selectedSmellTypes.join(','));
  }
  
  if (filters.selectedPromptingApproaches && filters.selectedPromptingApproaches.length > 0) {
    params.append('prompting_approaches', filters.selectedPromptingApproaches.join(','));
  }
  
  if (filters.selectedRepositories && filters.selectedRepositories.length > 0) {
    params.append('repos', filters.selectedRepositories.join(','));
  }

  // Tri-state filters
  if (filters.smellRemoved && filters.smellRemoved !== 'both') {
    params.append('smell_removed', filters.smellRemoved === 'yes');
  }
  
  if (filters.testsPassing && filters.testsPassing !== 'both') {
    params.append('tests_passing', filters.testsPassing === 'yes');
  }
  
  if (filters.testPassRateDecreased && filters.testPassRateDecreased !== 'both') {
    params.append('test_pass_rate_decreased', filters.testPassRateDecreased === 'yes');
  }
  
  if (filters.coverageDecreased && filters.coverageDecreased !== 'both') {
    params.append('coverage_decreased', filters.coverageDecreased === 'yes');
  }

  return params.toString();
}

export async function fetchAnalyticsOverview(filters = {}) {
  const params = buildAnalyticsParams(filters);
  return fetchAPI(`/analytics/overview${params ? '?' + params : ''}`);
}

export async function fetchAnalyticsModels(filters = {}) {
  const params = buildAnalyticsParams(filters);
  return fetchAPI(`/analytics/models${params ? '?' + params : ''}`);
}

export async function fetchAnalyticsSmells(filters = {}) {
  const params = buildAnalyticsParams(filters);
  return fetchAPI(`/analytics/smells${params ? '?' + params : ''}`);
}

export async function fetchAnalyticsTests(filters = {}) {
  const params = buildAnalyticsParams(filters);
  return fetchAPI(`/analytics/tests${params ? '?' + params : ''}`);
}

export async function fetchAnalyticsTimeline(filters = {}) {
  const params = buildAnalyticsParams(filters);
  return fetchAPI(`/analytics/timeline${params ? '?' + params : ''}`);
}

export async function fetchAnalyticsRegressions(filters = {}) {
  const params = buildAnalyticsParams(filters);
  return fetchAPI(`/analytics/regressions${params ? '?' + params : ''}`);
}
