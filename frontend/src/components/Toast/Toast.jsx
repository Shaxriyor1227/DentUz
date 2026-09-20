import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export default function Toast({
  open,
  title = 'Muvaffaqiyatli bajarildi',
  message,
  type = 'success',
  duration = 3500,
  onClose
}) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let hideTimer;
    let removeTimer;

    if (open && message) {
      setVisible(true);
      setClosing(false);

      if (duration > 0) {
        hideTimer = setTimeout(() => {
          setClosing(true);
          removeTimer = setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
          }, 300);
        }, duration);
      }
    } else if (!open && visible) {
      setClosing(true);
      removeTimer = setTimeout(() => {
        setVisible(false);
      }, 300);
    }

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [open, message, duration, onClose]);

  if (!visible && !open) return null;

  const handleManualClose = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 250);
  };

  const renderIcon = () => {
    if (type === 'error') {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    }
    if (type === 'warning') {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    }
    // Default / success / info uses the exact sleek checkmark (ptichka)
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  };

  return (
    <div
      className={`${styles.toastWrapper} ${styles[type]} ${closing ? styles.toastClosing : styles.toastEntering}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.iconCircle}>
        {renderIcon()}
      </div>

      <div className={styles.toastBody}>
        {title && <div className={styles.toastTitle}>{title}</div>}
        <div className={styles.toastMessage}>{message}</div>
      </div>

      <button
        type="button"
        className={styles.closeBtn}
        onClick={handleManualClose}
        aria-label="Yopish"
      >
        <span className="material-symbols-outlined">close</span>
      </button>

      {duration > 0 && !closing && (
        <div
          className={styles.progressBar}
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
}
