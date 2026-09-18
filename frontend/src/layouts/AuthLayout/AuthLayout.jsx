import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import styles from './AuthLayout.module.css';

const CAROUSEL_SLIDES = [
  {
    badge: '01 • TIBBIY KARTA',
    title: 'Bemorlar elektron kartasi',
    desc: 'Bemor tarixi, 043-shakl, tashxislar, rentgen suratlari va davolash rejalari yagona bazada.',
    icon: 'assignment_ind',
    features: [
      'Elektron 043-raqamli bemor kartasi',
      "To'liq anamnez, allergiyalar va tashxislar",
      'Rentgen va hujjatlarning xavfsiz arxivi'
    ]
  },
  {
    badge: '02 • INTERAKTIV TIZIM',
    title: 'Interaktiv FDI Odontogramma',
    desc: "Har bir tishning 5 ta sathi bo'yicha aniq raqamli xarita va bosqichma-bosqich davolash rejasi.",
    icon: 'dentistry',
    features: [
      'Xalqaro FDI (11–48) tishlar tizimi',
      'Rangli statuslar va materiallar hisobi',
      'Davolash narxi va cheklarni avto-hisoblash'
    ]
  },
  {
    badge: '03 • KLINIKA NAZORATI',
    title: 'Smart Taqvim va Moliya',
    desc: 'Shifokorlar va kreslolar bandligi, avtomatik cheklar, SMS eslatmalar va kassa tahlili.',
    icon: 'calendar_month',
    features: [
      "Ko'p kresloli interaktiv jadval va SMS eslatmalar",
      'Avtomatik chek, Payme/Click va qarzlar nazorati',
      'Shifokorlar KPI ulushi va oylik daromad hisoboti'
    ]
  }
];

export default function AuthLayout() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = CAROUSEL_SLIDES[currentSlide];

  return (
    <div className={styles.container}>
      {/* Left Column: Form Section */}
      <div className={styles.leftColumn}>
        <div className={styles.topBar}>
          <Link to="/" className={styles.topBackLink}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              arrow_back
            </span>
            <span>Bosh sahifaga qaytish</span>
          </Link>

          <button
            className={styles.themeToggleBtn}
            onClick={toggleTheme}
            type="button"
            title={theme === 'dark' ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish"}
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <span>{theme === 'dark' ? 'Kunduzgi' : 'Tungi'}</span>
          </button>
        </div>

        <div className={styles.centerForm}>
          <Outlet />
        </div>

        <div className={styles.bottomTrust}>
          <div className={styles.trustItem}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-cyan)', fontSize: '16px' }}>
              lock
            </span>
            <span>256-bit SSL Shifrlangan</span>
          </div>
          <div className={styles.trustDot} />
          <div className={styles.trustItem}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-mint)', fontSize: '16px' }}>
              verified_user
            </span>
            <span>O'zR O'RQ-547 Qonuniga Mos</span>
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
            <span>O'zbekistondagi 350+ stomatologlar tanlovi</span>
          </div>

          <div className={styles.showcaseCard}>
            <div className={styles.slideHeader}>
              <div className={styles.slideIconBadge}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  {slide.icon}
                </span>
              </div>
              <div>
                <span className={styles.slideModuleLabel}>{slide.badge}</span>
                <h3 className={styles.slideTitle}>{slide.title}</h3>
              </div>
            </div>

            <p className={styles.slideDesc}>{slide.desc}</p>

            <div className={styles.slideFeatures}>
              {slide.features.map((feat, idx) => (
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
            {CAROUSEL_SLIDES.map((_, idx) => (
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
