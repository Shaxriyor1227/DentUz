import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import styles from './AuthLayout.module.css';

// Bespoke inline SVG icons to eliminate font ligature bugs and guarantee 100% crisp rendering
const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const PulseIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth="1.5" />
    <path d="M6 10.2L8.6 12.8L14 7.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function AuthLayout() {
  const { t, i18n } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { theme, toggleTheme } = useTheme();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('dentuz_lang', lang);
  };

  const rawSlides = t('auth.carousel', { returnObjects: true }) || [];
  const slides = Array.isArray(rawSlides) ? rawSlides : [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide] || slides[0] || {};

  return (
    <div className={styles.container}>
      {/* Left Column: Interactive Form Section */}
      <div className={styles.leftColumn}>
        <div className={styles.topBar}>
          <Link to="/" className={styles.topBackLink} title={t('common.backToHome')}>
            <ArrowLeftIcon />
            <span>{t('common.backToHome')}</span>
          </Link>

          <div className={styles.topRightActions}>
            <div className={styles.langSegment} role="group" aria-label="Language selector">
              <button
                type="button"
                className={`${styles.langOption} ${!i18n.language?.startsWith('en') ? styles.langOptionActive : ''}`}
                onClick={() => changeLanguage('uz')}
                title="O'zbekcha"
              >
                UZB
              </button>
              <button
                type="button"
                className={`${styles.langOption} ${i18n.language?.startsWith('en') ? styles.langOptionActive : ''}`}
                onClick={() => changeLanguage('en')}
                title="English"
              >
                ENG
              </button>
            </div>

            <button
              className={styles.themeToggleBtn}
              onClick={toggleTheme}
              type="button"
              title={theme === 'dark' ? t('topbar.switchToLight') : t('topbar.switchToDark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              <span>{theme === 'dark' ? t('topbar.lightMode') : t('topbar.darkMode')}</span>
            </button>
          </div>
        </div>

        <div className={styles.centerForm}>
          <Outlet />
        </div>

        <div className={styles.bottomTrust}>
          <div className={styles.trustItem}>
            <span className={styles.trustIconWrap} style={{ color: '#00B4D8' }}>
              <LockIcon />
            </span>
            <span>{t('common.sslEncrypted')}</span>
          </div>
          <div className={styles.trustDot} />
          <div className={styles.trustItem}>
            <span className={styles.trustIconWrap} style={{ color: '#10B981' }}>
              <ShieldCheckIcon />
            </span>
            <span>{t('auth.secureLogin') || t('common.complianceLaw')}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Premium GateDent-Inspired Medical Showcase */}
      <div className={styles.rightColumn}>
        <div className={styles.glowTopRight} />
        <div className={styles.glowBottomLeft} />
        <div className={styles.ambientMesh} />

        <div className={styles.showcaseWrapper}>
          <div className={styles.topTrustPill}>
            <span className={styles.trustPillDot} />
            <span>{t('common.dentistsChoice')}</span>
          </div>

          {/* Floating Glassmorphism Showcase Card */}
          <div className={styles.showcaseCard}>
            <div className={styles.slideHeader}>
              <div className={styles.slideIconBadge}>
                <PulseIcon />
              </div>
              <div className={styles.slideHeaderMeta}>
                <span className={styles.slideModuleLabel}>{slide.badge}</span>
                <h3 className={styles.slideTitle}>{slide.title}</h3>
              </div>
            </div>

            <p className={styles.slideDesc}>{slide.desc}</p>

            <div className={styles.slideFeatures}>
              {slide.features?.map((feat, idx) => (
                <div key={idx} className={styles.featureRow}>
                  <CheckCircleIcon />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Carousel Navigation Dots */}
          <div className={styles.carouselDots} role="tablist">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.dot} ${idx === currentSlide ? styles.dotActive : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Bottom Hero Tagline (GateDent style) */}
          <div className={styles.bottomHeroTagline}>
            <h2 className={styles.taglineTitle}>
              {t('auth.digitalHeartTitle')}
            </h2>
            <p className={styles.taglineSubtitle}>
              {t('auth.digitalHeartSubtitle')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
