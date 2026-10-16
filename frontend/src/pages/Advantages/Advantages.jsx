import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OrbitEcosystem from '../../components/OrbitEcosystem/OrbitEcosystem';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import Icon from '../../components/Icon/Icon';
import styles from './Advantages.module.css';

export default function Advantages() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const ADVANTAGES_LIST = [
    {
      icon: 'verified_user',
      title: t('advantages.ssvForm043H'),
      desc: t('advantages.officialElectronicPatientHealth'),
      tag: 'SSV Standard',
    },
    {
      icon: 'gavel',
      title: t('advantages.lawNo547Privacy'),
      desc: t('advantages.medicalAndPersonalData'),
      tag: 'Legal Compliance',
    },
    {
      icon: 'lock',
      title: t('advantages.256BitBankingGrade'),
      desc: t('advantages.endToEndEncrypted'),
      tag: 'High Security',
    },
    {
      icon: 'cloud_done',
      title: t('advantages.localDataCentersNightly'),
      desc: t('advantages.hostedInModernLocal'),
      tag: '99.9% Uptime',
    },
    {
      icon: 'devices',
      title: t('advantages.universalCrossDeviceAccess'),
      desc: t('advantages.seamlessResponsivenessAcrossIpad'),
      tag: 'Multi-Device',
    },
    {
      icon: 'support_agent',
      title: t('advantages.247DedicatedSupport'),
      desc: t('advantages.ourClinicalOnboardingSpecialists'),
      tag: 'Dedicated Care',
    },
  ];

  return (
    <main className={styles.advantagesPage} id="main-content">
      {/* ── Page Hero Header ── */}
      <section className={styles.heroSection}>
        <div className={styles.pageBadge}>
          <span>🛡️</span>
          <span>{t('advantages.clinicalAdvantagesTrust')}</span>
        </div>
        <h1 className={styles.pageTitle}>
          {t('advantages.engineeredForReliabilitySpeed')}
        </h1>
        <p className={styles.pageSubtitle}>
          {t('advantages.discoverWhyOver120')}
        </p>
      </section>

      {/* ── 2-Column GateDent Style Orbit Ecosystem Visual ── */}
      <section className={styles.orbitWrapper}>
        <OrbitEcosystem />
      </section>

      {/* ── Trust & Security Pillars ── */}
      <section className={styles.pillarsSection}>
        <div className={styles.pillarsHeader}>
          <span className={styles.pageBadge}>{t('advantages.trustCompliance')}</span>
          <h2 className={styles.pillarsTitle}>
            {t('advantages.builtForSeriousDental')}
          </h2>
        </div>

        <div className={styles.pillarsGrid}>
          {ADVANTAGES_LIST.map((item, idx) => (
            <div key={idx} className={styles.pillarCard}>
              <div className={styles.pillarCardTop}>
                <div className={styles.pillarIconBox}>
                  <Icon name={item.icon} size={24} />
                </div>
                <span className={styles.pillarTag}>{item.tag}</span>
              </div>
              <h3 className={styles.pillarTitle}>{item.title}</h3>
              <p className={styles.pillarDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats Bar with AnimatedCounter ── */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <div className={`${styles.statNum} ${styles.statCyan}`}>
              <AnimatedCounter value={t('homepage.stats.clinics')} />
            </div>
            <div className={styles.statLabel}>{t('homepage.stats.clinicsLabel')}</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum}>
              <AnimatedCounter value={t('homepage.stats.cards')} />
            </div>
            <div className={styles.statLabel}>{t('homepage.stats.cardsLabel')}</div>
          </div>
          <div className={styles.statBox}>
            <div className={`${styles.statNum} ${styles.statCyan}`}>
              <AnimatedCounter value={t('homepage.stats.uptime')} />
            </div>
            <div className={styles.statLabel}>{t('homepage.stats.uptimeLabel')}</div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className={styles.bottomCtaSection}>
        <div className={styles.bottomCtaCard}>
          <h2 className={styles.bottomCtaTitle}>
            {t('advantages.readyToElevateYour')}
          </h2>
          <p className={styles.bottomCtaSub}>
            {t('advantages.startYour14Day')}
          </p>
          <Link to="/contact" className={styles.ctaBannerBtn}>
            {t('homepage.hero.startFree')} →
          </Link>
        </div>
      </section>
    </main>
  );
}
