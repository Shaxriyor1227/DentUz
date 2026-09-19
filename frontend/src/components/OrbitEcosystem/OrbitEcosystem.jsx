import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Logo from '../Logo/Logo';
import styles from './OrbitEcosystem.module.css';

// Crisp, lightweight inline SVG icons for the 8 ecosystem nodes
const LabIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const SupportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const PatientsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ProcessesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const InventoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const TreatmentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8 2 7 6 7 10c0 4 2 8 3 11 1 2 2 2 2 0 0-2 1-4 2-4s2 2 2 4c0 2 1 2 2 0 1-3 3-7 3-11 0-4-1-8-5-8z" />
  </svg>
);

const AppointmentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const FinanceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <circle cx="16" cy="14" r="1.5" fill="currentColor" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00B4D8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default function OrbitEcosystem({ visualOnly = false }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // 8 Satellite nodes placed at 45-degree intervals (GateDent reference style)
  const satellites = [
    {
      id: 'lab',
      label: isEn ? 'Laboratory' : 'Laboratoriya',
      icon: <LabIcon />,
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.15)',
      angleClass: styles.card_0,
    },
    {
      id: 'support',
      label: isEn ? 'Support' : 'Jonli yordam',
      icon: <SupportIcon />,
      color: '#06B6D4',
      bg: 'rgba(6, 182, 212, 0.15)',
      angleClass: styles.card_45,
    },
    {
      id: 'patients',
      label: isEn ? 'Patients' : 'Bemorlar',
      icon: <PatientsIcon />,
      color: '#0284C7',
      bg: 'rgba(2, 132, 199, 0.15)',
      angleClass: styles.card_90,
    },
    {
      id: 'processes',
      label: isEn ? 'Processes' : 'Jarayonlar',
      icon: <ProcessesIcon />,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.15)',
      angleClass: styles.card_135,
    },
    {
      id: 'inventory',
      label: isEn ? 'Inventory' : 'Omborxona',
      icon: <InventoryIcon />,
      color: '#EA580C',
      bg: 'rgba(234, 88, 12, 0.15)',
      angleClass: styles.card_180,
    },
    {
      id: 'treatments',
      label: isEn ? 'Treatments' : 'Muolajalar',
      icon: <TreatmentIcon />,
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.15)',
      angleClass: styles.card_225,
    },
    {
      id: 'appointments',
      label: isEn ? 'Appointments' : 'Taqvim',
      icon: <AppointmentIcon />,
      color: '#0D9488',
      bg: 'rgba(13, 148, 136, 0.15)',
      angleClass: styles.card_270,
    },
    {
      id: 'finance',
      label: isEn ? 'Finance' : 'Moliya',
      icon: <FinanceIcon />,
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.15)',
      angleClass: styles.card_315,
    },
  ];

  const checklistItems = t('homepage.whyChoose.items', { returnObjects: true }) || [];

  const visualContent = (
    <div className={`${styles.visualColumn} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.orbitStage}>
        {/* Background Orbit Guide Rings */}
        <div className={styles.trackRingOuter} />
        <div className={styles.trackRingInner} />

        {/* Ambient Radar Scanner Beam */}
        <div className={styles.radarSweep} />

        {/* Dynamic Connecting Data Spokes */}
        <svg className={styles.spokesSvg} viewBox="-200 -200 400 400" aria-hidden="true">
          <circle cx="0" cy="0" r="175" className={styles.spokeCircleGuide} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x2 = Math.round(Math.cos(rad) * 175);
            const y2 = Math.round(Math.sin(rad) * 175);
            return (
              <line
                key={i}
                x1="0"
                y1="0"
                x2={x2}
                y2={y2}
                className={styles.spokeLine}
                style={{ '--spoke-idx': i }}
              />
            );
          })}
        </svg>

        {/* Central Core Logo Node */}
        <div className={styles.centralHub} title="DentUz Central Core">
          <div className={styles.hubAura} />
          <div className={styles.hubPingRing} />
          <div className={styles.centralHubInner}>
            <Logo size={44} animated={false} />
          </div>
        </div>

        {/* 8 Satellite Cards in Upright Orbit */}
        {satellites.map((sat) => (
          <div
            key={sat.id}
            className={`${styles.satelliteNode} ${sat.angleClass}`}
            style={{ '--card-accent': sat.color }}
          >
            <div className={styles.satelliteCard}>
              <div
                className={styles.satelliteIconBox}
                style={{ color: sat.color, backgroundColor: sat.bg }}
              >
                {sat.icon}
              </div>
              <span className={styles.satelliteLabel}>{sat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Fallback: compact 2-column card grid */}
      <div className={styles.mobileCardsGrid}>
        {satellites.map((sat) => (
          <div
            key={sat.id}
            className={styles.mobileCard}
            style={{ '--card-accent': sat.color }}
          >
            <div
              className={styles.satelliteIconBox}
              style={{ color: sat.color, backgroundColor: sat.bg }}
            >
              {sat.icon}
            </div>
            <span className={styles.satelliteLabel}>{sat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (visualOnly) {
    return <div className={styles.visualOnlyWrapper}>{visualContent}</div>;
  }

  return (
    <div
      ref={sectionRef}
      className={`${styles.sectionContainer} ${isVisible ? styles.visible : ''}`}
      id="ecosystem"
      aria-label={t('homepage.whyChoose.title')}
    >
      <div className={styles.twoColLayout}>
        {/* LEFT COLUMN: Text Content & Checklist */}
        <div className={styles.contentColumn}>
          <span className={styles.sectionBadge}>
            {t('homepage.whyChoose.badge')}
          </span>
          <h2 className={styles.heading}>
            {t('homepage.whyChoose.title')}
          </h2>
          <p className={styles.subheading}>
            {t('homepage.whyChoose.subtitle')}
          </p>

          <ul className={styles.checklist}>
            {Array.isArray(checklistItems) && checklistItems.map((item, idx) => (
              <li
                key={idx}
                className={styles.checkItem}
                style={{ '--item-idx': idx }}
              >
                <CheckCircleIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className={styles.actionRow}>
            <a href="#features" className={styles.viewModulesBtn}>
              <span>{t('homepage.whyChoose.viewAllModules')}</span>
              <span className={styles.arrowIcon}>→</span>
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: Orbiting Visual System */}
        {visualContent}
      </div>
    </div>
  );
}
