import React from 'react';
import styles from './AnalyticsKPICard.module.css';

/**
 * KPI Card component for displaying key metrics
 * @param {string} title - Card title/label
 * @param {string|number} value - Main metric value
 * @param {string} subtitle - Optional subtitle/description
 * @param {boolean} loading - Loading state
 */
export default function AnalyticsKPICard({ title, value, subtitle, loading = false }) {
  if (loading) {
    return (
      <div className={styles.kpiCard}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonValue}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.kpiCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.value}>{value}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
    </div>
  );
}
