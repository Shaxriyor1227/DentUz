import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './StatusPill.module.css';

const STATUS_LABELS = {
  uz: {
    completed: 'Yakunlandi',
    paid: "To'landi",
    in_progress: 'Jarayonda',
    scheduled: 'Rejalashtirilgan',
    pending: 'Kutilmoqda',
    partial: "Qisman to'langan",
    cancelled: 'Bekor qilindi',
    debtor: 'Qarzdor',
    active: 'Faol',
    suspended: "To'xtatilgan",
    new: 'Yangi',
    approved: 'Tasdiqlangan',
    rejected: 'Rad etilgan',
  },
  en: {
    completed: 'Completed',
    paid: 'Paid',
    in_progress: 'In Progress',
    scheduled: 'Scheduled',
    pending: 'Pending',
    partial: 'Partially Paid',
    cancelled: 'Cancelled',
    debtor: 'Debtor',
    active: 'Active',
    suspended: 'Suspended',
    new: 'New',
    approved: 'Approved',
    rejected: 'Rejected',
  },
};

export default function StatusPill({ status, label, showDot = true, className = '' }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'uz';
  const normStatus = (status || 'pending').toLowerCase().replace(/\s+/g, '_');
  const displayLabel = label || STATUS_LABELS[lang]?.[normStatus] || STATUS_LABELS.uz[normStatus] || status;
  const variantClass = styles[normStatus] || styles.pending;

  return (
    <span className={`${styles.pill} ${variantClass} ${className}`}>
      {showDot && <span className={styles.dot} />}
      <span>{displayLabel}</span>
    </span>
  );
}
