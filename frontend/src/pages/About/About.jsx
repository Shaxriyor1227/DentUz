import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  SparklesIcon,
  PatientsIcon,
  CalendarIcon,
  ToothIcon,
  TreatmentIcon,
  FinanceIcon,
  InventoryIcon,
  LabIcon,
  SecurityIcon,
  ProcessesIcon,
  ArrowRightIcon,
  PhoneCallIcon
} from '../Docs/DocsIcons';
import styles from './About.module.css';

export default function About() {
  const { t, i18n  } = useTranslation();
  const isEn = i18n.language === 'en';

  // Core Platform Modules
  const PLATFORM_MODULES = [
    {
      icon: <PatientsIcon size={24} />,
      iconBg: 'rgba(99, 102, 241, 0.1)',
      iconColor: '#6366f1',
      title: t('about.patientChart043H'),
      desc: t('about.patientRegistrationContactsMedical')
    },
    {
      icon: <CalendarIcon size={24} />,
      iconBg: 'rgba(245, 158, 11, 0.1)',
      iconColor: '#d97706',
      title: t('about.appointmentsSmsReminders'),
      desc: t('about.visualChairAllocationOverlap')
    },
    {
      icon: <ToothIcon size={24} />,
      iconBg: 'rgba(13, 148, 136, 0.1)',
      iconColor: '#0d9488',
      title: t('about.fdiDigitalOdontogram'),
      desc: t('about.globalFdiStandardTooth')
    },
    {
      icon: <TreatmentIcon size={24} />,
      iconBg: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#059669',
      title: t('about.treatmentPlansEstimates'),
      desc: t('about.multiStageClinicalProtocols')
    },
    {
      icon: <FinanceIcon size={24} />,
      iconBg: 'rgba(139, 92, 246, 0.1)',
      iconColor: '#7c3aed',
      title: t('about.financeInstallmentPayments'),
      desc: t('about.incomeAndExpensesPer')
    },
    {
      icon: <InventoryIcon size={24} />,
      iconBg: 'rgba(59, 130, 246, 0.1)',
      iconColor: '#2563eb',
      title: t('about.inventorySuppliesStock'),
      desc: t('about.dentalMaterialsInventoryLow')
    },
    {
      icon: <LabIcon size={24} />,
      iconBg: 'rgba(236, 72, 153, 0.1)',
      iconColor: '#db2777',
      title: t('about.dentalLabWorkOrders'),
      desc: t('about.createDigitalWorkOrders')
    },
    {
      icon: <SecurityIcon size={24} />,
      iconBg: 'rgba(14, 165, 233, 0.1)',
      iconColor: '#0284c7',
      title: t('about.teamRoleBasedPermissions'),
      desc: t('about.roleBasedAccessControl')
    }
  ];

  // Timeline / Story steps
  const TIMELINE_STEPS = [
    {
      year: '2023',
      title: t('about.firstStepsInDigital'),
      desc: t('about.ourSoftwareEngineeringTeam')
    },
    {
      year: '2024',
      title: t('about.dentalPracticeResearch'),
      desc: t('about.identifiedTheCriticalNeed')
    },
    {
      year: '2025',
      title: t('about.platformArchitectureCloudEngine'),
      desc: t('about.engineered5SurfaceFdi')
    },
    {
      year: '2026',
      title: t('about.officialLaunchItPark'),
      desc: t('about.dentuzOfficiallyLaunchedAs')
    }
  ];

  return (
    <div className={styles.aboutPage}>
      {/* Ambient glow matching Features & Contact */}
      <div className={styles.ambientGlow} />

      {/* ── Signature Hero Section (Features style) ── */}
      <section className={styles.heroSection}>
        <div className={styles.pageBadge}>
          <SparklesIcon size={14} color="#0284c7" />
          <span>{t('about.officialItParkUzbekistan')}</span>
        </div>

        <h1 className={styles.pageTitle}>
          <span className={styles.titleLine1}>
            {t('about.aboutUsTheTeam')}
          </span>
          <span className={styles.titleLine2}>
            {t('about.dentuzPlatform')}
          </span>
        </h1>

        <p className={styles.pageSubtitle}>
          {t('about.everythingADentistDoes')}
        </p>

        {/* Stats Row */}
        <div className={styles.heroStatsRow}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>100%</span>
            <span className={styles.statLabel}>{t('about.cloudArchitecture')}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>FDI</span>
            <span className={styles.statLabel}>{t('about.globalStandard')}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>043/h</span>
            <span className={styles.statLabel}>{t('about.ssvMinistryCompliant')}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>256-bit</span>
            <span className={styles.statLabel}>{t('about.aesBankEncryption')}</span>
          </div>
        </div>
      </section>

      {/* ── Main Container ── */}
      <div className={styles.container}>
        {/* Mission Overview Card */}
        <section className={styles.missionSection}>
          <div className={styles.missionCard}>
            <h2 className={styles.missionLead}>
              {t('about.dentuzIsCompleteDental')}
            </h2>
            <p className={styles.missionParagraph}>
              {t('about.fromTheSoloDental')}
            </p>
            <p className={styles.missionParagraph}>
              {t('about.theSoftwareIsBuilt')}
            </p>
          </div>
        </section>

        {/* Real Workflow Steps */}
        <section>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTag}>
              <ProcessesIcon size={14} />
              <span>{t('about.integratedProcess')}</span>
            </div>
            <h3 className={styles.sectionTitle}>
              {t('about.howDentuzUnifiesYour')}
            </h3>
            <p className={styles.sectionSubtitle}>
              {t('about.aSynchronizedPipelineConnecting')}
            </p>
          </div>

          <div className={styles.workflowGrid}>
            <div className={styles.workflowCard}>
              <div className={styles.workflowStepNumber}>1</div>
              <h4 className={styles.workflowCardTitle}>{t('about.reception')}</h4>
              <p className={styles.workflowCardDesc}>
                {t('about.booksAppointmentsOnThe')}
              </p>
            </div>

            <div className={styles.workflowCard}>
              <div className={styles.workflowStepNumber}>2</div>
              <h4 className={styles.workflowCardTitle}>{t('about.doctorChair')}</h4>
              <p className={styles.workflowCardDesc}>
                {t('about.fdiOdontogramAllowsInstant')}
              </p>
            </div>

            <div className={styles.workflowCard}>
              <div className={styles.workflowStepNumber}>3</div>
              <h4 className={styles.workflowCardTitle}>{t('about.treatmentPlan')}</h4>
              <p className={styles.workflowCardDesc}>
                {t('about.autoCalculatesTotalEstimated')}
              </p>
            </div>

            <div className={styles.workflowCard}>
              <div className={styles.workflowStepNumber}>4</div>
              <h4 className={styles.workflowCardTitle}>{t('about.cashReceipts')}</h4>
              <p className={styles.workflowCardDesc}>
                {t('about.acceptsCashCardsPayme')}
              </p>
            </div>

            <div className={styles.workflowCard}>
              <div className={styles.workflowStepNumber}>5</div>
              <h4 className={styles.workflowCardTitle}>{t('about.supplyStock')}</h4>
              <p className={styles.workflowCardDesc}>
                {t('about.automaticallyDecrementsConsumablesAnd')}
              </p>
            </div>
          </div>
        </section>

        {/* Core Platform Modules Grid */}
        <section>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTag}>
              <SparklesIcon size={14} />
              <span>{t('about.platformModules')}</span>
            </div>
            <h3 className={styles.sectionTitle}>
              {t('about.8SpecializedModulesBuilt')}
            </h3>
            <p className={styles.sectionSubtitle}>
              {t('about.everythingRequiredToRun')}
            </p>
          </div>

          <div className={styles.modulesGrid}>
            {PLATFORM_MODULES.map((mod, mIdx) => (
              <div key={mIdx} className={styles.moduleBox}>
                <div
                  className={styles.moduleIconTile}
                  style={{ backgroundColor: mod.iconBg, color: mod.iconColor }}
                >
                  {mod.icon}
                </div>
                <h4 className={styles.moduleTitle}>{mod.title}</h4>
                <p className={styles.moduleDesc}>{mod.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Journey Timeline */}
        <section className={styles.timelineSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTag}>
              <SparklesIcon size={14} />
              <span>{t('about.ourHistory')}</span>
            </div>
            <h3 className={styles.sectionTitle}>
              {t('about.fromIdeaToReality')}
            </h3>
            <p className={styles.sectionSubtitle}>
              {t('about.howDentuzEvolvedInto')}
            </p>
          </div>

          <div className={styles.timelineGrid}>
            {TIMELINE_STEPS.map((step, tIdx) => (
              <div key={tIdx} className={styles.timelineCard}>
                <div className={styles.timelineYearBadge}>{step.year}</div>
                <h4 className={styles.timelineHeading}>{step.title}</h4>
                <p className={styles.timelineBody}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security & Continuous Support Box */}
        <section>
          <div className={styles.trustGrid}>
            <div className={styles.trustBox}>
              <div
                className={styles.trustIconTile}
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}
              >
                <SecurityIcon size={24} />
              </div>
              <div>
                <h4 className={styles.trustTitle}>
                  {t('about.securityLawNo547')}
                </h4>
                <p className={styles.trustDesc}>
                  {t('about.patientClinicalDataIs')}
                </p>
              </div>
            </div>

            <div className={styles.trustBox}>
              <div
                className={styles.trustIconTile}
                style={{ backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}
              >
                <PhoneCallIcon size={24} />
              </div>
              <div>
                <h4 className={styles.trustTitle}>
                  {t('about.continuousSupportEvolution')}
                </h4>
                <p className={styles.trustDesc}>
                  {t('about.weNeverSellSoftware')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className={styles.aboutCta}>
          <h3 className={styles.ctaTitle}>
            {t('about.readyToDigitizeYour')}
          </h3>
          <p className={styles.ctaSubtitle}>
            {t('about.joinForwardThinkingDental')}
          </p>
          <div className={styles.ctaActions}>
            <Link to="/contact" className={styles.ctaPrimaryBtn}>
              <span>{t('about.getStartedFree')}</span>
              <ArrowRightIcon size={16} />
            </Link>
            <a href="tel:+998712004545" className={styles.ctaSecondaryBtn}>
              <PhoneCallIcon size={16} />
              <span>+998 71 200 45 45</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
