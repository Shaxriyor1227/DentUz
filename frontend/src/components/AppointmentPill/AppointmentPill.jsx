import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AppointmentPill.module.css';

/**
 * Reusable Apple-style Appointment Pill / Card
 * Variants: 'week' | 'day' | 'month' | 'chairs'
 */
export default function AppointmentPill({
  appointment,
  variant = 'week',
  onClick,
  draggable = false,
  onDragStart
}) {
  const { t, i18n } = useTranslation();
  if (!appointment) return null;

  const accentColor = appointment.color || 'var(--color-cyan, #06B6D4)';
  const status = appointment.status || 'pending';

  const handleClick = (e) => {
    if (onClick) {
      onClick(e, appointment);
    }
  };

  const handleDragStart = (e) => {
    if (onDragStart) {
      onDragStart(e, appointment.id);
    }
  };

  // Status label helper
  const getStatusLabel = (st) => {
    if (st === 'completed') {
      return t('treatmentPlan.statusLabels.completed') || t('common.completed') || 'Yakunlandi';
    }
    if (st === 'in_progress') {
      return t('treatmentPlan.statusLabels.in_progress') || t('common.inProgress') || 'Jarayonda';
    }
    return t('treatmentPlan.statusLabels.pending') || t('common.pending') || 'Kutilmoqda';
  };

  // Dynamic status styling
  const getStatusStyle = (st) => {
    if (st === 'completed') {
      return {
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        color: '#059669',
        border: '1px solid rgba(16, 185, 129, 0.25)'
      };
    }
    if (st === 'in_progress') {
      return {
        backgroundColor: 'rgba(6, 182, 212, 0.12)',
        color: 'var(--color-cyan-hover, #0891B2)',
        border: '1px solid rgba(6, 182, 212, 0.25)'
      };
    }
    return {
      backgroundColor: 'var(--color-surface-container, #F1F5F9)',
      color: 'var(--color-text-secondary, #475569)',
      border: '1px solid var(--color-border-subtle, #E2E8F0)'
    };
  };

  // 1. MONTH VIEW VARIANT
  if (variant === 'month') {
    return (
      <div
        className={styles.variantMonth}
        onClick={handleClick}
        title={`${appointment.time} - ${appointment.patientName} (${appointment.procedure})`}
      >
        <span className={styles.monthDot} style={{ backgroundColor: accentColor }} />
        <span className={styles.monthTime}>{appointment.time}</span>
        {appointment.chair && (
          <span className={styles.monthChairBadge}>#{appointment.chair}</span>
        )}
        <span className={styles.monthPatient}>
          {appointment.patientName ? appointment.patientName.split(' ')[0] : ''}
        </span>
      </div>
    );
  }

  // 2. DAY VIEW VARIANT (Detailed)
  if (variant === 'day') {
    return (
      <div
        className={`${styles.pillBase} ${styles.variantDay}`}
        onClick={handleClick}
        style={{ borderLeft: `4px solid ${accentColor}` }}
      >
        <div className={styles.dayApptHeaderRow}>
          <span className={styles.dayApptTimeBadge}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-cyan)' }}>
              schedule
            </span>
            {appointment.time} ({appointment.duration || 45} {i18n.language === 'en' ? 'min' : 'daq'})
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {appointment.chair && (
              <span className={styles.dayApptChairBadge}>#{appointment.chair}</span>
            )}
            <span className={styles.dayApptStatusPill} style={getStatusStyle(status)}>
              {getStatusLabel(status)}
            </span>
          </div>
        </div>

        <div className={styles.dayApptPatientRow}>
          <div className={styles.dayApptPatientName}>
            <span>{appointment.patientName}</span>
            {appointment.patientId && (
              <span className={styles.dayApptPatientId}>{appointment.patientId}</span>
            )}
          </div>
        </div>

        <div className={styles.dayApptProcedureBadge}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--color-cyan)' }}>
            dentistry
          </span>
          <span>{appointment.procedure}</span>
        </div>

        <div className={styles.dayApptFooterRow}>
          <div className={styles.dayApptDoctorInfo}>
            <div className={styles.dayApptDoctorAvatar} style={{ backgroundColor: accentColor }}>
              {appointment.doctorName ? appointment.doctorName.replace(/^Dr\.\s*/, '').charAt(0) : 'D'}
            </div>
            <span className={styles.dayApptDoctorName}>{appointment.doctorName}</span>
          </div>

          <span className={styles.dayApptActionLink}>
            <span>{t('calendar.patientCard') || 'Bemor kartasi'}</span>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    );
  }

  // 3. CHAIRS / OPERATORIES VARIANT (Apple Pastel Pill)
  if (variant === 'chairs') {
    return (
      <div
        className={`${styles.pillBase} ${styles.variantChairs}`}
        onClick={handleClick}
        style={{
          borderLeft: `3.5px solid ${accentColor}`,
          background: `linear-gradient(135deg, var(--color-surface) 75%, ${accentColor}12 100%)`
        }}
        title={`Kreslo #${appointment.chair || '—'} • ${appointment.patientName}`}
      >
        <div className={styles.chairsHeader}>
          <span className={styles.chairsTimeBadge}>
            <span className="material-symbols-outlined" style={{ fontSize: '12px', color: accentColor }}>
              schedule
            </span>
            {appointment.time}
          </span>
          <span className={styles.chairsStatusPill} style={getStatusStyle(status)}>
            {getStatusLabel(status)}
          </span>
        </div>

        <div className={styles.chairsPatientName}>{appointment.patientName}</div>
        <div className={styles.chairsProcedure}>{appointment.procedure}</div>

        <div className={styles.chairsFooter}>
          <div className={styles.chairsDoctorPill}>
            <div className={styles.chairsDoctorAvatar} style={{ backgroundColor: accentColor }}>
              {appointment.doctorName ? appointment.doctorName.replace(/^Dr\.\s*/, '').charAt(0) : 'D'}
            </div>
            <span>{appointment.doctorName ? appointment.doctorName.replace(/^Dr\.\s*/, '') : ''}</span>
          </div>

          {/* Note: #chair badge is intentionally HIDDEN in Chairs view because the column header already denotes Operatory #X */}
          <span className={styles.chairsDurationTag}>
            ⏱ {appointment.duration || 45} {i18n.language === 'en' ? 'min' : 'daq'}
          </span>
        </div>
      </div>
    );
  }

  // 4. WEEK VIEW VARIANT (Default)
  return (
    <div
      className={`${styles.pillBase} ${styles.variantWeek}`}
      draggable={draggable}
      onDragStart={handleDragStart}
      onClick={handleClick}
      style={{ borderLeft: `3px solid ${accentColor}` }}
      title="Bemor sahifasiga o'tish"
    >
      <div className={styles.weekHeader}>
        <span className={styles.weekTime}>{appointment.time}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {appointment.chair && (
            <span className={styles.weekChairBadge}>#{appointment.chair}</span>
          )}
          <span className={styles.weekStatusDot} style={{ backgroundColor: accentColor }} />
        </div>
      </div>
      <div className={styles.weekPatient}>{appointment.patientName}</div>
      <div className={styles.weekProcedure}>{appointment.procedure}</div>
      <div className={styles.weekDoctorTag}>{appointment.doctorName}</div>
    </div>
  );
}
