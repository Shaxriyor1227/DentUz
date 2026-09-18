import React from 'react';
import styles from './StatCard.module.css';

export default function StatCard({
  label,
  value,
  unit,
  subtext,
  icon,
  trend,
  trendPositive = true,
  isMono = false,
  className = ''
}) {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.cardTop}>
        <span className={styles.label}>{label}</span>
        {icon && (
          <div className={styles.iconWrapper}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {icon}
            </span>
          </div>
        )}
      </div>

      <div className={styles.valueRow}>
        <span className={`${styles.value} ${isMono ? styles.valueMono : ''}`}>
          {value}
        </span>
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>

      <div className={styles.footer}>
        {trend && (
          <span
            className={`${styles.trendBadge} ${
              trendPositive ? styles.trendUp : styles.trendDown
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
              {trendPositive ? 'trending_up' : 'trending_down'}
            </span>
            {trend}
          </span>
        )}
        {subtext && <span>{subtext}</span>}
      </div>
    </div>
  );
}
