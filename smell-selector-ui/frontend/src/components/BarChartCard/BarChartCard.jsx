import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import styles from './BarChartCard.module.css';

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

/**
 * Bar Chart Card component
 * @param {string} title - Chart title
 * @param {Array} data - Chart data
 * @param {string} xKey - Key for X-axis
 * @param {Array} bars - Array of bar configs [{key, color, name}]
 * @param {boolean} loading - Loading state
 * @param {string} orientation - 'vertical' or 'horizontal'
 */
export default function BarChartCard({ 
  title, 
  data = [], 
  xKey, 
  bars = [], 
  loading = false,
  orientation = 'vertical'
}) {
  if (loading) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.skeleton}></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.emptyState}>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const BarChartComponent = orientation === 'horizontal' ? 
    ({ data, children }) => (
      <BarChart data={data} layout="vertical">
        {children}
      </BarChart>
    ) : 
    ({ data, children }) => (
      <BarChart data={data}>
        {children}
      </BarChart>
    );

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            {orientation === 'horizontal' ? (
              <>
                <XAxis type="number" stroke="#6b7280" />
                <YAxis type="category" dataKey={xKey} stroke="#6b7280" width={120} />
              </>
            ) : (
              <>
                <XAxis dataKey={xKey} stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
              </>
            )}
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb' }} />
            {bars.length > 1 && <Legend />}
            {bars.map((bar, index) => (
              <Bar 
                key={bar.key} 
                dataKey={bar.key} 
                fill={bar.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                name={bar.name || bar.key}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
