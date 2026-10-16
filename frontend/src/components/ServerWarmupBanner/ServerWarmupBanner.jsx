import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ServerWarmupBanner.module.css';

export const ServerWarmupBanner = () => {
  const [isSlow, setIsSlow] = useState(false);
  const { i18n } = useTranslation();

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
  const message = isEn
    ? "Server is waking up (Render spin-up), please wait 30-50 seconds..."
    : "Server uyg'onmoqda (Render cold-start), 30-50 soniya kuting...";

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <div className={styles.spinner} />
      <span className={styles.text}>{message}</span>
    </div>
  );
};

export default ServerWarmupBanner;
