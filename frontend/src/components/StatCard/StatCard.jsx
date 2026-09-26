import React from 'react';
import styles from './StatCard.module.css';

function Sparkline({ data, color = '#06B6D4' }) {
  if (!data || data.length < 2) return null;
  const width = 76;
  const height = 28;
  const pad = 3;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - pad * 2) + pad;
    const y = height - pad - ((val - min) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const lastPoint = points.split(' ').slice(-1)[0].split(',');

  return (
    <svg className={styles.sparklineSvg} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r="3"
        fill={color}
      />
    </svg>
  );
}

export default function StatCard({
  label,
  value,
  unit,
  subtext,
  icon,
  trend,
  trendPositive = true,
  isMono = false,
  className = '',
  sparklineData = null,
  sparklineColor,
  children
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

      <div className={styles.valueWithSparkline}>
        <div className={styles.valueRow}>
          <span className={`${styles.value} ${isMono ? styles.valueMono : ''}`}>
            {value}
          </span>
          {unit && <span className={styles.unit}>{unit}</span>}
        </div>
        {sparklineData && (
          <Sparkline
            data={sparklineData}
            color={sparklineColor || (trendPositive ? 'var(--color-mint)' : 'var(--color-cyan)')}
          />
        )}
      </div>

      {children}

      {(trend || subtext) && (
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
      )}
    </div>
  );
}
