import React from 'react';
import { useTranslation } from 'react-i18next';
import Logo from '../Logo/Logo';
import styles from './OrbitEcosystem.module.css';

// Crisp inline SVG icons for satellite cards
const PatientIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const OdontogramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8 2 7 6 7 10c0 4 2 8 3 11 1 2 2 2 2 0 0-2 1-4 2-4s2 2 2 4c0 2 1 2 2 0 1-3 3-7 3-11 0-4-1-8-5-8z" />
  </svg>
);

const FinanceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <circle cx="16" cy="14" r="1.5" fill="currentColor" />
  </svg>
);

const DocsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const TeamIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function OrbitEcosystem() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const satellites = [
    {
      id: 'patients',
      label: isEn ? 'Patients (043-EHR)' : 'Bemorlar (043-shakl)',
      sub: isEn ? 'Digital history & anamnesis' : 'Elektron karta va anamnez',
      icon: <PatientIcon />,
      color: '#0284C7',
      bg: 'rgba(2, 132, 199, 0.1)',
      angle: 0, // Top
    },
    {
      id: 'calendar',
      label: isEn ? 'Smart Calendar' : 'Aqlli Taqvim',
      sub: isEn ? 'Multi-chair schedule' : 'Kreslolar va SMS eslatma',
      icon: <CalendarIcon />,
      color: '#0D9488',
      bg: 'rgba(13, 148, 136, 0.1)',
      angle: 60, // Top Right
    },
    {
      id: 'odontogram',
      label: isEn ? 'FDI Odontogram' : 'FDI Odontogramma',
      sub: isEn ? '5-surface visual chart' : '5 ta yuza raqamli xarita',
      icon: <OdontogramIcon />,
      color: '#00B4D8',
      bg: 'rgba(0, 180, 216, 0.1)',
      angle: 120, // Bottom Right
    },
    {
      id: 'finance',
      label: isEn ? 'Billing & Finance' : 'Kassa & Moliya',
      sub: isEn ? 'Payme/Click & invoicing' : 'Kvitansiya va daromad',
      icon: <FinanceIcon />,
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.1)',
      angle: 180, // Bottom
    },
    {
      id: 'docs',
      label: isEn ? 'Clinical Docs' : 'Hujjatlar & Rentgen',
      sub: isEn ? 'OPG, CBCT & PDF export' : 'Rentgen arxiv & PDF',
      icon: <DocsIcon />,
      color: '#6366F1',
      bg: 'rgba(99, 102, 241, 0.1)',
      angle: 240, // Bottom Left
    },
    {
      id: 'team',
      label: isEn ? 'Clinic Team' : 'Jamoa & Kreslolar',
      sub: isEn ? 'Doctor KPIs & roles' : 'Shifokorlar va rollar',
      icon: <TeamIcon />,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.1)',
      angle: 300, // Top Left
    },
  ];

  return (
    <div className={styles.sectionWrapper} aria-label={isEn ? "All-in-One Dental System" : "Bitta yaxlit dental tizim"}>
      <div className={styles.header}>
        <span className={styles.sectionBadge}>
          {isEn ? "Unified Ecosystem" : "Yagona Yaxlit Ekotizim"}
        </span>
        <h2 className={styles.heading}>
          {isEn ? "One Central Core. Every Operatory Connected." : "Bitta Tizim — Barcha Dental Jarayonlar Yagona Markazda"}
        </h2>
        <p className={styles.subheading}>
          {isEn
            ? "From clinical charting to calendar, billing, and lab orders — seamless real-time synchronization across your entire practice."
            : "Bemor qabulidan tortib, 043-kartochka, odontogramma, kassa va shifokorlar hisobotigacha yagona platformada birlashgan."}
        </p>
      </div>

      {/* Orbit Container */}
      <div className={styles.orbitStage}>
        {/* Background Track Rings */}
        <div className={styles.orbitTrackRingOuter} />
        <div className={styles.orbitTrackRingInner} />

        {/* Central Hub Node */}
        <div className={styles.centralHub} title="DentUz Central Core">
          <div className={styles.centralHubInner}>
            <Logo size={44} animated={false} />
          </div>
          <span className={styles.hubLabel}>DentUz Core</span>
        </div>

        {/* 360-degree Rotating Wrapper */}
        <div className={styles.orbitTrack}>
          {satellites.map((sat) => (
            <div
              key={sat.id}
              className={`${styles.satellitePositioner} ${styles[`pos_${sat.angle}`]}`}
            >
              {/* Counter-rotating card keeps text & icon upright */}
              <div className={styles.satelliteCard}>
                <div
                  className={styles.satelliteIconWrap}
                  style={{ color: sat.color, backgroundColor: sat.bg }}
                >
                  {sat.icon}
                </div>
                <div className={styles.satelliteMeta}>
                  <div className={styles.satelliteTitle}>{sat.label}</div>
                  <div className={styles.satelliteSub}>{sat.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Fallback Grid (renders when screen < 768px) */}
      <div className={styles.mobileGrid}>
        <div className={styles.mobileHubHeader}>
          <div className={styles.mobileHubBadge}>
            <Logo size={36} animated={false} />
            <span>DentUz Clinic OS</span>
          </div>
        </div>
        <div className={styles.mobileCardsList}>
          {satellites.map((sat) => (
            <div key={sat.id} className={styles.mobileCard}>
              <div
                className={styles.satelliteIconWrap}
                style={{ color: sat.color, backgroundColor: sat.bg }}
              >
                {sat.icon}
              </div>
              <div className={styles.satelliteMeta}>
                <div className={styles.satelliteTitle}>{sat.label}</div>
                <div className={styles.satelliteSub}>{sat.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
