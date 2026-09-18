import React from 'react';
import styles from './SkeletonLoader.module.css';

export default function SkeletonLoader({
  type = 'text',
  count = 1,
  direction = 'horizontal',
  width,
  height,
  className = ''
}) {
  const customStyle = {};
  if (width) customStyle.width = width;
  if (height) customStyle.height = height;

  if (type === 'stat') {
    const containerStyle = direction === 'vertical'
      ? { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }
      : { display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: '16px', width: '100%' };

    return (
      <div style={containerStyle}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={styles.statCard}>
            <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '40%', height: '12px' }} />
            <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '65%', height: '32px', margin: '12px 0' }} />
            <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '80%', height: '12px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div style={{ background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ height: '42px', background: 'var(--color-surface-container-low)', borderBottom: '1px solid var(--color-border)' }} />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={styles.tableRow}>
            <div className={`${styles.skeleton} ${styles.circle}`} style={{ width: '36px', height: '36px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '35%', height: '14px' }} />
              <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '20%', height: '10px' }} />
            </div>
            <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '15%', height: '14px' }} />
            <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '20%', height: '14px' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${styles.skeleton} ${styles[type] || styles.text} ${className}`}
          style={customStyle}
        />
      ))}
    </>
  );
}
