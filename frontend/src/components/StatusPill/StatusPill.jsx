import React from 'react';
import styles from './StatusPill.module.css';

const STATUS_LABELS = {
  completed: 'Yakunlandi',
  paid: "To'landi",
  in_progress: 'Jarayonda',
  scheduled: 'Rejalashtirilgan',
  pending: 'Kutilmoqda',
  partial: 'Qisman to\'langan',
  cancelled: 'Bekor qilindi',
  debtor: 'Qarzdor'
};

export default function StatusPill({ status, label, showDot = true, className = '' }) {
  const normStatus = (status || 'pending').toLowerCase().replace(/\s+/g, '_');
  const displayLabel = label || STATUS_LABELS[normStatus] || status;
  const variantClass = styles[normStatus] || styles.pending;

  return (
    <span className={`${styles.pill} ${variantClass} ${className}`}>
      {showDot && <span className={styles.dot} />}
      <span>{displayLabel}</span>
    </span>
  );
}
