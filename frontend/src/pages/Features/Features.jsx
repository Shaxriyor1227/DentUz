import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon/Icon';
import styles from './Features.module.css';

export default function Features() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const ALL_MODULES = [
    {
      icon: 'calendar_month',
      title: t('features.smartOperatoryCalendar'),
      desc: t('features.realTimeDragDrop'),
      badge: t('features.coreModule'),
    },
    {
      icon: 'dentistry',
      title: t('features.fdiDigitalOdontogram'),
      desc: t('features.5SurfaceAnatomicalCharting'),
      badge: 'FDI Standard',
    },
    {
      icon: 'clinical_notes',
      title: t('features.electronicHealthRecord043'),
      desc: t('features.fullyCompliantWithNational'),
      badge: 'SSV 043/h',
    },
    {
      icon: 'account_balance_wallet',
      title: t('features.billingInvoicingCashDesk'),
      desc: t('features.trackIncomeExpensesAccept'),
      badge: 'Payme / Click',
    },
    {
      icon: 'radiology',
      title: t('features.radiographArchive3dCbct'),
      desc: t('features.storePanoramicOpgPeriapical'),
      badge: 'Cloud Storage',
    },
    {
      icon: 'biotech',
      title: t('features.dentalLabWorkOrders'),
      desc: t('features.sendDigitalLaboratoryWork'),
      badge: 'Lab Orders',
    },
    {
      icon: 'sms',
      title: t('features.automatedSmsNotificationService'),
      desc: t('features.sendAutomatedVisitConfirmations'),
      badge: 'Auto-SMS',
    },
    {
      icon: 'inventory_2',
      title: t('features.dentalSuppliesInventory'),
      desc: t('features.realTimeConsumableTracking'),
      badge: 'Inventory',
    },
    {
      icon: 'analytics',
      title: t('features.clinicalAnalyticsReporting'),
      desc: t('features.interactiveRevenueGrowthGraphs'),
      badge: 'Reports',
    },
  ];

  return (
    <main className={styles.featuresPage} id="main-content">
      {/* Ambient background glow orbs */}
      <div className={styles.ambientGlow} />

      {/* ── Page Hero Header (GateDent Pro Style) ── */}
      <section className={styles.heroSection}>
        <div className={styles.pageBadge}>
          <span className={styles.badgeEmoji}>🚀</span>
          <span>{t('features.aNewEraFor')}</span>
        </div>

        <h1 className={styles.pageTitle}>
          <span className={styles.titleLine1}>
            {t('features.dentalSoftware')}
          </span>
          <span className={styles.titleLine2}>
            {t('features.yourPracticeOnOne')}
          </span>
        </h1>

        <p className={styles.pageSubtitle}>
          {t('features.fromPatientRegistrationTo')}
        </p>

        <div className={styles.heroCtaRow}>
          <Link to="/contact" className={styles.primaryCta}>
            <span>{t('features.startForFree')}</span>
            <span className={styles.ctaArrow}>→</span>
          </Link>
          <a href="#features-grid" className={styles.secondaryCta}>
            <span>{t('features.learnMore')}</span>
          </a>
        </div>
      </section>

      {/* ── 3 Deep-Dive Interactive Visual Stories ── */}
      <div className={styles.storiesContainer}>
        {/* Story 1: Smart Taqvim */}
        <section className={styles.storyCard}>
          <div className={styles.storyGrid}>
            <div className={styles.storyText}>
              <span className={styles.storyTag}>{t('homepage.stories.story1.tag')}</span>
              <h2 className={styles.storyHeading}>{t('homepage.stories.story1.title')}</h2>
              <p className={styles.storyBody}>{t('homepage.stories.story1.body')}</p>
              <ul className={styles.storyBulletList}>
                <li>✓ {t('features.multiChairOperatoryGrid')}</li>
                <li>✓ {t('features.smsAppointmentConfirmation')}</li>
                <li>✓ {t('features.colorCodedProcedureStatuses')}</li>
              </ul>
            </div>

            <div className={styles.storyVisual}>
              <div className={styles.scheduleHeader}>
                <span className={styles.scheduleHeaderTitle}>{t('homepage.stories.story1.scheduleTitle')}</span>
                <span className={styles.scheduleHeaderMeta}>{t('homepage.stories.story1.activeChairs')}</span>
              </div>
              <div className={styles.scheduleList}>
                <div className={styles.scheduleItem}>
                  <span className={styles.scheduleTime}>09:00</span>
                  <div className={styles.scheduleInfo}>
                    <div className={styles.scheduleDoctor}>{t('features.drAzimovCariesTherapy')}</div>
                    <div className={styles.schedulePatient}>{t('features.patientAnvarQosimov')}</div>
                  </div>
                  <span className={styles.scheduleBadgeDone}>{t('common.completed')}</span>
                </div>
                <div className={`${styles.scheduleItem} ${styles.scheduleItemActive}`}>
                  <span className={`${styles.scheduleTime} ${styles.scheduleTimeActive}`}>14:00</span>
                  <div className={styles.scheduleInfo}>
                    <div className={styles.scheduleDoctor}>{t('features.drSaidovaAirFlow')}</div>
                    <div className={styles.schedulePatient}>{t('features.patientNilufarRahimova')}</div>
                  </div>
                  <span className={styles.scheduleBadgeProgress}>{t('common.inProgress')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story 2: Bemorlar tarixi */}
        <section className={styles.storyCard}>
          <div className={`${styles.storyGrid} ${styles.storyGridReverse}`}>
            <div className={styles.storyVisual}>
              <div className={styles.patientProfileHeader}>
                <div className={styles.patientAvatar}>AQ</div>
                <div>
                  <div className={styles.patientName}>Anvar Qosimov</div>
                  <div className={styles.patientMeta}>ID: P-1042 • {t('features.34Yrs')}</div>
                </div>
              </div>
              <div className={styles.allergyAlert}>
                <Icon name="warning" size={16} />
                <span>{t('homepage.stories.story2.allergy')}</span>
              </div>
              <div className={styles.patientTreatmentNote}>
                {t('homepage.stories.story2.treatmentNote')}
              </div>
            </div>

            <div className={styles.storyText}>
              <span className={styles.storyTag}>{t('homepage.stories.story2.tag')}</span>
              <h2 className={styles.storyHeading}>{t('homepage.stories.story2.title')}</h2>
              <p className={styles.storyBody}>{t('homepage.stories.story2.body')}</p>
              <ul className={styles.storyBulletList}>
                <li>✓ {t('features.ssvForm043H')}</li>
                <li>✓ {t('features.criticalAllergyWarningBanner')}</li>
                <li>✓ {t('features.chronologicalDentalTimeline')}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Story 3: Moliya va Kassa */}
        <section className={styles.storyCard}>
          <div className={styles.storyGrid}>
            <div className={styles.storyText}>
              <span className={styles.storyTag}>{t('homepage.stories.story3.tag')}</span>
              <h2 className={styles.storyHeading}>{t('homepage.stories.story3.title')}</h2>
              <p className={styles.storyBody}>{t('homepage.stories.story3.body')}</p>
              <ul className={styles.storyBulletList}>
                <li>✓ {t('features.paymeClickCardCash')}</li>
                <li>✓ {t('features.automaticDoctorKpiBonus')}</li>
                <li>✓ {t('features.officialPrintableThermalReceipts')}</li>
              </ul>
            </div>

            <div className={styles.storyVisual}>
              <div className={styles.financeLabel}>{t('homepage.stories.story3.revenueLabel')}</div>
              <div className={styles.financeAmount}>
                148 500 000 <span className={styles.financeAmountUnit}>UZS</span>
              </div>
              <div className={styles.financeProgressTrack}>
                <div style={{ width: '65%', background: '#10B981' }} />
                <div style={{ width: '20%', background: '#00B4D8' }} />
                <div style={{ width: '15%', background: '#F59E0B' }} />
              </div>
              <div className={styles.financeBreakdown}>
                <span>Payme/Click: 65%</span>
                <span>Uzcard/Humo: 20%</span>
                <span>{t('features.cash15')}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── 9 Modules Comprehensive Grid ── */}
      <section className={styles.gridSection} id="features-grid">
        <div className={styles.gridHeader}>
          <span className={styles.pageBadge}>{t('features.fullCapabilities')}</span>
          <h2 className={styles.gridTitle}>
            {t('features.completeDentalPracticeEcosystem')}
          </h2>
        </div>

        <div className={styles.modulesGrid}>
          {ALL_MODULES.map((mod, idx) => (
            <div key={idx} className={styles.moduleCard}>
              <div className={styles.cardTop}>
                <div className={styles.cardIconBox}>
                  <Icon name={mod.icon} size={24} />
                </div>
                <span className={styles.cardBadge}>{mod.badge}</span>
              </div>
              <h3 className={styles.cardTitle}>{mod.title}</h3>
              <p className={styles.cardDesc}>{mod.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className={styles.bottomCtaSection}>
        <div className={styles.bottomCtaCard}>
          <h2 className={styles.bottomCtaTitle}>
            {t('features.experienceDentuzInYour')}
          </h2>
          <p className={styles.bottomCtaSub}>
            {t('features.noCreditCardRequired')}
          </p>
          <Link to="/contact" className={styles.ctaBannerBtn}>
            {t('homepage.hero.startFree')} →
          </Link>
        </div>
      </section>
    </main>
  );
}
