import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  cancelText,
  isDanger = true,
  icon = 'warning',
  onConfirm,
  onCancel,
  loading = false,
}) {
  const { t, i18n } = useTranslation();
  const dialogRef = useRef(null);
  const isEn = i18n.language?.startsWith('en');

  // ESC key handler and body scroll lock
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onCancel && onCancel();
      }
    };

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    // Focus dialog
    if (dialogRef.current) {
      dialogRef.current.focus();
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  const defaultTitle = isEn ? 'Confirm action' : 'Amalni tasdiqlash';
  const defaultCancel = isEn ? 'Cancel' : 'Bekor qilish';
  const defaultConfirm = isEn ? 'Confirm' : 'Tasdiqlash';

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel && onCancel();
        }
      }}
      role="presentation"
    >
      <div
        className={styles.dialog}
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
      >
        <div
          className={`${styles.iconWrap} ${
            isDanger ? styles.iconDanger : icon === 'info' ? styles.iconInfo : styles.iconWarning
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
            {isDanger ? 'delete_forever' : icon === 'info' ? 'info' : 'warning'}
          </span>
        </div>

        <h3 id="confirm-dialog-title" className={styles.title}>
          {title || defaultTitle}
        </h3>

        <p id="confirm-dialog-desc" className={styles.message}>
          {message}
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText || defaultCancel}
          </button>
          <button
            type="button"
            className={`${styles.confirmBtn} ${isDanger ? styles.confirmDanger : styles.confirmPrimary}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (isEn ? 'Processing...' : 'Bajarilmoqda...') : (confirmText || defaultConfirm)}
          </button>
        </div>
      </div>
    </div>
  );
}
