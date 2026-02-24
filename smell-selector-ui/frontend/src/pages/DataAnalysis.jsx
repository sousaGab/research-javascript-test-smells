import React from 'react';
import { useDataAnalysis } from '../hooks/useDataAnalysis';
import AnalyticsFilter from '../components/AnalyticsFilter/AnalyticsFilter';
import AnalyticsKPICard from '../components/AnalyticsKPICard/AnalyticsKPICard';
import BarChartCard from '../components/BarChartCard/BarChartCard';
import PieChartCard from '../components/PieChartCard/PieChartCard';
import LineChartCard from '../components/LineChartCard/LineChartCard';
import './DataAnalysis.css';

export default function DataAnalysis() {
  const {
    filters,
    setFilters,
    overview,
    modelStats,
    smellStats,
    testStats,
    timeline,
    regressions,
    filterOptions,
    applyFilters,
    resetFilters,
  } = useDataAnalysis();

  // Prepare data for charts

  // Model performance data
  const modelPerformanceData = modelStats.data.map(model => ({
    name: model.model_name,
    'Success Rate': model.success_rate,
    'Smell Removal': model.smell_removal_rate,
    'Tests Passing': model.test_pass_rate,
  }));

  // Smell distribution (for pie chart)
  const smellDistributionData = smellStats.data.map(smell => ({
    name: smell.smell_type,
    value: smell.percentage_of_total,
  }));

  // Smell removal rate (horizontal bar)
  const smellRemovalData = smellStats.data.map(smell => ({
    name: smell.smell_type,
    'Removal Rate': smell.removal_rate,
  }));

  // Test passing data
  const testPassingData = testStats.data ? [
    {
      metric: 'Tests Still Passing',
      rate: testStats.data.tests_passing_rate,
    },
  ] : [];

  // Coverage changes
  const coverageData = testStats.data ? [
    {
      metric: 'Coverage',
      Before: testStats.data.avg_coverage_before,
      After: testStats.data.avg_coverage_after,
    },
  ] : [];

  // Regression analysis data (by model)
  const regressionByModelData = regressions.data ? regressions.data.by_model.map(model => ({
    name: model.model_name,
    'Test Pass Rate Decreased': model.test_pass_rate_decreased_count,
    'Coverage Decreased': model.coverage_decreased_count,
    'Both Decreased': model.both_decreased_count,
  })) : [];

  return (
    <div className="data-analysis-page">
      <header className="page-header">
        <h1>📊 Data Analysis Dashboard</h1>
        <p className="page-subtitle">
          Comprehensive analysis of LLM refactoring experiments
        </p>
      </header>

      <AnalyticsFilter
        filters={filters}
        onFilterChange={setFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        filterOptions={filterOptions}
      />

      {/* KPI Cards Row */}
      <div className="kpi-row">
        <AnalyticsKPICard
          title="Total Experiments"
          value={overview.data?.total_experiments || 0}
          loading={overview.loading}
        />
        <AnalyticsKPICard
          title="Success Rate"
          value={overview.data ? `${overview.data.success_rate}%` : '0%'}
          subtitle="Smell removed & tests passing"
          loading={overview.loading}
        />
        <AnalyticsKPICard
          title="Avg Tokens Used"
          value={overview.data?.avg_tokens || 0}
          subtitle="Per experiment"
          loading={overview.loading}
        />
        <AnalyticsKPICard
          title="Avg Latency"
          value={overview.data ? `${overview.data.avg_latency}s` : '0s'}
          subtitle="LLM response time"
          loading={overview.loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Row 1: Model Performance & Smell Distribution */}
        <BarChartCard
          title="Success Rate by Model"
          data={modelPerformanceData}
          xKey="name"
          bars={[
            { key: 'Success Rate', color: '#3b82f6', name: 'Success Rate %' },
          ]}
          loading={modelStats.loading}
        />
        <PieChartCard
          title="Smell Type Distribution"
          data={smellDistributionData}
          dataKey="value"
          nameKey="name"
          loading={smellStats.loading}
        />

        {/* Row 2: Smell Removal & Test Passing */}
        <BarChartCard
          title="Smell Removal Rate by Type"
          data={smellRemovalData}
          xKey="name"
          bars={[{ key: 'Removal Rate', color: '#10b981', name: 'Removal Rate %' }]}
          orientation="horizontal"
          loading={smellStats.loading}
        />
        <BarChartCard
          title="Tests Still Passing Rate"
          data={testPassingData}
          xKey="metric"
          bars={[{ key: 'rate', color: '#8b5cf6', name: 'Percentage %' }]}
          loading={testStats.loading}
        />

        {/* Row 3: Coverage Changes & Timeline */}
        <BarChartCard
          title="Coverage Changes (Before/After)"
          data={coverageData}
          xKey="metric"
          bars={[
            { key: 'Before', color: '#f59e0b', name: 'Before %' },
            { key: 'After', color: '#10b981', name: 'After %' },
          ]}
          loading={testStats.loading}
        />
        <LineChartCard
          title="Experiments Over Time"
          data={timeline.data}
          xKey="date"
          lines={[
            { key: 'total_experiments', color: '#3b82f6', name: 'Total Experiments' },
            { key: 'success_rate', color: '#10b981', name: 'Success Rate %' },
          ]}
          loading={timeline.loading}
        />

        {/* Row 4: Model Comparison & Regression Analysis */}
        <BarChartCard
          title="Model Performance Comparison"
          data={modelPerformanceData}
          xKey="name"
          bars={[
            { key: 'Success Rate', color: '#3b82f6', name: 'Success Rate %' },
            { key: 'Smell Removal', color: '#10b981', name: 'Smell Removal %' },
            { key: 'Tests Passing', color: '#8b5cf6', name: 'Tests Passing %' },
          ]}
          loading={modelStats.loading}
        />
        <BarChartCard
          title="Regression Analysis by Model"
          data={regressionByModelData}
          xKey="name"
          bars={[
            { key: 'Test Pass Rate Decreased', color: '#ef4444', name: 'Test Pass Decreased' },
            { key: 'Coverage Decreased', color: '#f59e0b', name: 'Coverage Decreased' },
            { key: 'Both Decreased', color: '#991b1b', name: 'Both Decreased' },
          ]}
          loading={regressions.loading}
        />

        {/* Row 5: Token Usage & Latency */}
        <BarChartCard
          title="Avg Tokens by Model"
          data={modelStats.data.map(m => ({ name: m.model_name, tokens: m.avg_tokens }))}
          xKey="name"
          bars={[{ key: 'tokens', color: '#ec4899', name: 'Tokens' }]}
          loading={modelStats.loading}
        />
        <BarChartCard
          title="Avg Latency by Model"
          data={modelStats.data.map(m => ({ name: m.model_name, latency: m.avg_latency }))}
          xKey="name"
          bars={[{ key: 'latency', color: '#06b6d4', name: 'Latency (s)' }]}
          loading={modelStats.loading}
        />
      </div>

      {/* Regression Summary Section */}
      {regressions.data && (
        <div className="regression-summary">
          <h2 className="section-title">Regression Summary</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-label">Test Pass Rate Decreased</div>
              <div className="summary-value">
                {regressions.data.overall.test_pass_rate_decreased_count}
              </div>
              <div className="summary-subtitle">
                out of {regressions.data.overall.total_experiments} experiments
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Coverage Decreased</div>
              <div className="summary-value">
                {regressions.data.overall.coverage_decreased_count}
              </div>
              <div className="summary-subtitle">
                out of {regressions.data.overall.total_experiments} experiments
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Both Decreased</div>
              <div className="summary-value">
                {regressions.data.overall.both_decreased_count}
              </div>
              <div className="summary-subtitle">
                out of {regressions.data.overall.total_experiments} experiments
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
