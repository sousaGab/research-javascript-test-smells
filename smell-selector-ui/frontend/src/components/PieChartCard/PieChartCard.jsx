import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import styles from './PieChartCard.module.css';

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

/**
 * Pie Chart Card component
 * @param {string} title - Chart title
 * @param {Array} data - Chart data
 * @param {string} dataKey - Key for values
 * @param {string} nameKey - Key for labels
 * @param {Array} colors - Custom colors array
 * @param {boolean} loading - Loading state
 */
export default function PieChartCard({ 
  title, 
  data = [], 
  dataKey, 
  nameKey, 
  colors = DEFAULT_COLORS,
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
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry[nameKey]}: ${entry[dataKey].toFixed(1)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb' }}
              formatter={(value) => `${value.toFixed(2)}%`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
