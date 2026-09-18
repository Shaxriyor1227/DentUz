import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import styles from './AuthLayout.module.css';

const CAROUSEL_ICONS = ['assignment_ind', 'dentistry', 'calendar_month'];

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
  const currentIcon = CAROUSEL_ICONS[currentSlide] || 'dentistry';

  return (
    <div className={styles.container}>
      {/* Left Column: Form Section */}
      <div className={styles.leftColumn}>
        <div className={styles.topBar}>
          <Link to="/" className={styles.topBackLink}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              arrow_back
            </span>
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
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
              <span>{theme === 'dark' ? t('topbar.lightMode') : t('topbar.darkMode')}</span>
            </button>
          </div>
        </div>

        <div className={styles.centerForm}>
          <Outlet />
        </div>

        <div className={styles.bottomTrust}>
          <div className={styles.trustItem}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-cyan)', fontSize: '16px' }}>
              lock
            </span>
            <span>{t('common.sslEncrypted')}</span>
          </div>
          <div className={styles.trustDot} />
          <div className={styles.trustItem}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-mint)', fontSize: '16px' }}>
              verified_user
            </span>
            <span>{t('common.complianceLaw')}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Premium Showcase Carousel */}
      <div className={styles.rightColumn}>
        <div className={styles.glowTopRight} />
        <div className={styles.glowBottomLeft} />

        <div className={styles.showcaseWrapper}>
          <div className={styles.topTrustPill}>
            <span className={styles.trustPillDot} />
            <span>{t('common.dentistsChoice')}</span>
          </div>

          <div className={styles.showcaseCard}>
            <div className={styles.slideHeader}>
              <div className={styles.slideIconBadge}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  {currentIcon}
                </span>
              </div>
              <div>
                <span className={styles.slideModuleLabel}>{slide.badge}</span>
                <h3 className={styles.slideTitle}>{slide.title}</h3>
              </div>
            </div>

            <p className={styles.slideDesc}>{slide.desc}</p>

            <div className={styles.slideFeatures}>
              {slide.features?.map((feat, idx) => (
                <div key={idx} className={styles.featureRow}>
                  <div className={styles.checkDot}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                      check
                    </span>
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.carouselDots}>
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
        </div>
      </div>
    </div>
  );
}
