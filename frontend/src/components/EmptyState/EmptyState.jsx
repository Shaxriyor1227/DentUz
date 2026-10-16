import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './EmptyState.module.css';

export default function EmptyState({
  title,
  description,
  icon = 'inbox',
  actionLabel,
  onAction,
  isError = false,
  className = '',
}) {
  const { t, i18n  } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const defaultTitle = isError
    ? t('common.somethingWentWrong')
    : t('common.noDataFound');

  const defaultDesc = isError
    ? t('common.pleaseCheckYourConnection')
    : t('common.thereAreCurrentlyNo');

  const defaultAction = isError
    ? t('common.tryAgain')
    : null;

  return (
    <div className={`${styles.container} ${className}`} role="status">
      <div className={`${styles.iconCircle} ${isError ? styles.iconError : ''}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
          {isError ? 'error_outline' : icon}
        </span>
      </div>

      <h4 className={styles.title}>{title || defaultTitle}</h4>
      <p className={styles.description}>{description || defaultDesc}</p>

      {(actionLabel || defaultAction) && onAction && (
        <button type="button" className={styles.actionBtn} onClick={onAction}>
          {isError && (
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              refresh
            </span>
          )}
          <span>{actionLabel || defaultAction}</span>
        </button>
      )}
    </div>
  );
}
