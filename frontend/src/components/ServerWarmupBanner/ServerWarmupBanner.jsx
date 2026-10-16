import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ServerWarmupBanner.module.css';

export const ServerWarmupBanner = () => {
  const [isSlow, setIsSlow] = useState(false);
  const { t, i18n  } = useTranslation();

  useEffect(() => {
    const handleSlowEvent = (e) => {
      setIsSlow(Boolean(e.detail?.isSlow));
    };

    window.addEventListener('dentuz:server:slow', handleSlowEvent);
    return () => {
      window.removeEventListener('dentuz:server:slow', handleSlowEvent);
    };
  }, []);

  if (!isSlow) return null;

  const isEn = i18n.language?.startsWith('en');
  const message = t('common.serverIsWakingUp');

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <div className={styles.spinner} />
      <span className={styles.text}>{message}</span>
    </div>
  );
};

export default ServerWarmupBanner;
