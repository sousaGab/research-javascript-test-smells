import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import styles from './LineChartCard.module.css';

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

/**
 * Line Chart Card component
 * @param {string} title - Chart title
 * @param {Array} data - Chart data
 * @param {string} xKey - Key for X-axis
 * @param {Array} lines - Array of line configs [{key, color, name}]
 * @param {boolean} loading - Loading state
 */
export default function LineChartCard({ 
  title, 
  data = [], 
  xKey, 
  lines = [], 
  loading = false 
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

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xKey} stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb' }} />
            {lines.length > 1 && <Legend />}
            {lines.map((line, index) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                strokeWidth={2}
                name={line.name || line.key}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
