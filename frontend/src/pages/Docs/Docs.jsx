import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  SearchIcon,
  RocketIcon,
  PatientsIcon,
  CalendarIcon,
  ToothIcon,
  TreatmentIcon,
  FinanceIcon,
  InventoryIcon,
  LabIcon,
  ProcessesIcon,
  SecurityIcon,
  SettingsIcon,
  FaqIcon,
  SupportIcon,
  CheckIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  SparklesIcon,
  DeviceLaptopIcon,
  DeviceMobileIcon,
  WifiIcon,
  PrinterIcon,
  PhoneCallIcon,
  TelegramIcon,
  CloseIcon
} from './DocsIcons';
import styles from './Docs.module.css';

export default function Docs() {
  const { t, i18n  } = useTranslation();
  const isEn = i18n.language === 'en';

  const [activeTab, setActiveTab] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Navigation Groups Definition with Apple pastel colored tiles
  const NAV_GROUPS = useMemo(() => [
    {
      title: t('docs.coreModules'),
      items: [
        {
          id: 'getting-started',
          label: t('docs.gettingStarted'),
          icon: <RocketIcon size={18} />,
          iconBg: 'rgba(2, 132, 199, 0.12)',
          iconColor: '#0284c7',
          badge: t('docs.guide')
        },
        {
          id: 'patients',
          label: t('docs.patientsDatabase'),
          icon: <PatientsIcon size={18} />,
          iconBg: 'rgba(99, 102, 241, 0.12)',
          iconColor: '#6366f1'
        },
        {
          id: 'appointments',
          label: t('docs.calendarVisits'),
          icon: <CalendarIcon size={18} />,
          iconBg: 'rgba(245, 158, 11, 0.12)',
          iconColor: '#d97706'
        },
        {
          id: 'odontogram',
          label: t('docs.fdiOdontogram'),
          icon: <ToothIcon size={18} />,
          iconBg: 'rgba(13, 148, 136, 0.12)',
          iconColor: '#0d9488'
        },
        {
          id: 'treatments',
          label: t('docs.treatmentPlans'),
          icon: <TreatmentIcon size={18} />,
          iconBg: 'rgba(16, 185, 129, 0.12)',
          iconColor: '#059669'
        },
        {
          id: 'finance',
          label: t('docs.financeReceipts'),
          icon: <FinanceIcon size={18} />,
          iconBg: 'rgba(139, 92, 246, 0.12)',
          iconColor: '#7c3aed'
        },
      ]
    },
    {
      title: t('docs.clinicManagement'),
      items: [
        {
          id: 'inventory',
          label: t('docs.suppliesStock'),
          icon: <InventoryIcon size={18} />,
          iconBg: 'rgba(59, 130, 246, 0.12)',
          iconColor: '#2563eb'
        },
        {
          id: 'laboratory',
          label: t('docs.dentalLaboratory'),
          icon: <LabIcon size={18} />,
          iconBg: 'rgba(236, 72, 153, 0.12)',
          iconColor: '#db2777'
        },
        {
          id: 'processes',
          label: t('docs.internalWorkflows'),
          icon: <ProcessesIcon size={18} />,
          iconBg: 'rgba(14, 165, 233, 0.12)',
          iconColor: '#0284c7'
        },
        {
          id: 'security',
          label: t('docs.securityLaw547'),
          icon: <SecurityIcon size={18} />,
          iconBg: 'rgba(16, 185, 129, 0.12)',
          iconColor: '#059669'
        },
        {
          id: 'settings',
          label: t('docs.clinicSettings'),
          icon: <SettingsIcon size={18} />,
          iconBg: 'rgba(100, 116, 139, 0.12)',
          iconColor: '#475569'
        },
      ]
    },
    {
      title: t('docs.assistance'),
      items: [
        {
          id: 'faq',
          label: t('docs.frequentlyAsked'),
          icon: <FaqIcon size={18} />,
          iconBg: 'rgba(249, 115, 22, 0.12)',
          iconColor: '#ea580c'
        },
        {
          id: 'support',
          label: t('docs.helpOnboarding'),
          icon: <SupportIcon size={18} />,
          iconBg: 'rgba(2, 132, 199, 0.12)',
          iconColor: '#0284c7'
        },
      ]
    }
  ], [isEn]);

  // All items for search filtering
  const allNavItems = useMemo(() => {
    return NAV_GROUPS.flatMap(group => group.items);
  }, [NAV_GROUPS]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allNavItems;
    const q = searchQuery.toLowerCase();
    return allNavItems.filter(item =>
      item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
    );
  }, [allNavItems, searchQuery]);

  // First Steps Cards (Apple style interactive tiles)
  const FIRST_STEPS = [
    {
      targetId: 'patients',
      icon: <PatientsIcon size={22} />,
      iconBg: 'rgba(99, 102, 241, 0.1)',
      iconColor: '#6366f1',
      title: t('docs.addAPatient'),
      desc: t('docs.registerNewPatientWith')
    },
    {
      targetId: 'appointments',
      icon: <CalendarIcon size={22} />,
      iconBg: 'rgba(245, 158, 11, 0.1)',
      iconColor: '#d97706',
      title: t('docs.scheduleAnAppointment'),
      desc: t('docs.pickAnOpenOperatory')
    },
    {
      targetId: 'odontogram',
      icon: <ToothIcon size={22} />,
      iconBg: 'rgba(13, 148, 136, 0.1)',
      iconColor: '#0d9488',
      title: t('docs.fdiDentalChart'),
      desc: t('docs.tapAnyOfThe')
    },
    {
      targetId: 'treatments',
      icon: <TreatmentIcon size={22} />,
      iconBg: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#059669',
      title: t('docs.treatmentPlan'),
      desc: t('docs.autoCalculateTotalEstimated')
    },
    {
      targetId: 'finance',
      icon: <FinanceIcon size={22} />,
      iconBg: 'rgba(139, 92, 246, 0.1)',
      iconColor: '#7c3aed',
      title: t('docs.billingThermalReceipt'),
      desc: t('docs.acceptCashOrCards')
    },
    {
      targetId: 'inventory',
      icon: <InventoryIcon size={22} />,
      iconBg: 'rgba(59, 130, 246, 0.1)',
      iconColor: '#2563eb',
      title: t('docs.dentalInventory'),
      desc: t('docs.trackAnestheticsAndResin')
    }
  ];

  // Simple, Understandable FAQ list
  const FAQS = [
    {
      q: t('docs.canWeImportOur'),
      a: t('docs.yesYouDonT')
    },
    {
      q: t('docs.doesTheSoftwareWork'),
      a: t('docs.yesPerfectlyDentuzIs')
    },
    {
      q: t('docs.whatHappensIfThe'),
      a: t('docs.noDataIsLost')
    },
    {
      q: t('docs.canWePrintReceipts'),
      a: t('docs.yesDentuzSupportsStandard')
    },
    {
      q: t('docs.canWeLimitAccess'),
      a: t('docs.yesDentuzIncludesStrict')
    },
    {
      q: t('docs.whereIsPatientData'),
      a: t('docs.allDataIsHosted')
    }
  ];

  return (
    <div className={styles.docsPage}>
      {/* Ambient glow matching Features & Contact */}
      <div className={styles.ambientGlow} />

      {/* ── Signature Hero Section (Features & Contact style) ── */}
      <section className={styles.heroSection}>
        <div className={styles.pageBadge}>
          <SparklesIcon size={14} color="#0284c7" />
          <span>{t('docs.dentuzOfficialUserManual')}</span>
        </div>

        <h1 className={styles.pageTitle}>
          <span className={styles.titleLine1}>
            {t('docs.documentationGuides')}
          </span>
          <span className={styles.titleLine2}>
            {t('docs.learnIn15Minutes')}
          </span>
        </h1>

        <p className={styles.pageSubtitle}>
          {t('docs.everythingYouNeedTo')}
        </p>

          {/* Apple Spotlight Search Bar */}
          <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
              <span className={styles.searchIconWrapper}>
                <SearchIcon size={18} color="#64748b" />
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={t('docs.searchGuidesEG')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery ? (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={() => setSearchQuery('')}
                  aria-label="Tozalash"
                >
                  <CloseIcon size={14} />
                </button>
              ) : (
                <span className={styles.searchKbdHint}>⌘K</span>
              )}
            </div>
          </div>

          {/* Quick Verified Tags */}
          <div className={styles.heroTags}>
            <span className={styles.heroTag}>
              <span className={styles.heroTagCheck}><CheckIcon size={12} /></span>
              {t('docs.cloudBased')}
            </span>
            <span className={styles.heroTag}>
              <span className={styles.heroTagCheck}><CheckIcon size={12} /></span>
              {t('docs.fdiStandard')}
            </span>
            <span className={styles.heroTag}>
              <span className={styles.heroTagCheck}><CheckIcon size={12} /></span>
              {t('docs.ssv043HForm')}
            </span>
            <span className={styles.heroTag}>
              <span className={styles.heroTagCheck}><CheckIcon size={12} /></span>
              {t('docs.80mm58mmReceipts')}
            </span>
          </div>
      </section>

      {/* ── Main Workspace ── */}
      <div className={styles.docsWorkspace}>
        {/* Mobile Horizontal Pill Selector */}
        <div className={styles.mobileTabsScroll}>
          {allNavItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`${styles.mobileTabPill} ${activeTab === item.id ? styles.mobileTabPillActive : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── Left Sidebar (macOS / iPadOS Settings Style) ── */}
        <aside className={styles.appleSidebar}>
          {NAV_GROUPS.map((group, gIdx) => {
            const groupItems = group.items.filter(item =>
              filteredItems.some(fi => fi.id === item.id)
            );
            if (groupItems.length === 0) return null;

            return (
              <div key={gIdx} className={styles.navSection}>
                <div className={styles.navSectionLabel}>{group.title}</div>
                {groupItems.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.sidebarNavItem} ${isActive ? styles.sidebarNavItemActive : ''}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        window.scrollTo({ top: 360, behavior: 'smooth' });
                      }}
                    >
                      <div
                        className={styles.iconTile}
                        style={{
                          backgroundColor: isActive ? 'transparent' : item.iconBg,
                          color: isActive ? '#ffffff' : item.iconColor
                        }}
                      >
                        {item.icon}
                      </div>
                      <span className={styles.navItemLabelText}>{item.label}</span>
                      {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </aside>

        {/* ── Content Main Panel ── */}
        <main className={styles.docsMainPanel}>
          <div key={activeTab} className={styles.tabContentAnimated}>
          {/* TAB 1: GETTING STARTED */}
          {activeTab === 'getting-started' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <RocketIcon size={14} />
                  <span>{t('docs.gettingStarted_1')}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {t('docs.dentalClinicSoftwareQuick')}
                </h2>
                <p className={styles.panelLead}>
                  {t('docs.dentuzEliminatesPaperClutter')}
                </p>
              </div>

              {/* Free Trial Banner */}
              <div className={styles.appleTrialBanner}>
                <div className={styles.trialBannerText}>
                  <div className={styles.trialTitle}>
                    <SparklesIcon size={18} />
                    <span>{t('docs.14DayFullAccess')}</span>
                  </div>
                  <div className={styles.trialDesc}>
                    {t('docs.testAllClinicalFeatures')}
                  </div>
                </div>
                <Link to="/contact" className={styles.trialCtaButton}>
                  <span>{t('docs.tryForFree')}</span>
                  <ArrowRightIcon size={15} />
                </Link>
              </div>

              {/* First Steps Grid (Interactive Cards) */}
              <h3 className={styles.subSectionTitle}>
                <span>{t('docs.keyStepsToGet')}</span>
              </h3>
              <div className={styles.appleCardsGrid}>
                {FIRST_STEPS.map((step, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    className={styles.appleStepCard}
                    onClick={() => {
                      setActiveTab(step.targetId);
                      window.scrollTo({ top: 360, behavior: 'smooth' });
                    }}
                  >
                    <div
                      className={styles.cardIconTile}
                      style={{ backgroundColor: step.iconBg, color: step.iconColor }}
                    >
                      {step.icon}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardTitle}>{step.title}</div>
                      <div className={styles.cardDescription}>{step.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* System Requirements (Clean Apple Style Cards) */}
              <h3 className={styles.subSectionTitle}>
                <span>{t('docs.systemRequirements')}</span>
              </h3>
              <div className={styles.appleSystemReq}>
                <p className={styles.reqLead}>
                  {t('docs.dentuzRunsInThe')}
                </p>
                <div className={styles.reqGrid}>
                  <div className={styles.reqItemCard}>
                    <div className={styles.reqItemIcon}><DeviceLaptopIcon size={22} /></div>
                    <div className={styles.reqItemContent}>
                      <div className={styles.reqItemTitle}>{t('docs.computers')}</div>
                      <div className={styles.reqItemDesc}>Chrome, Safari, Firefox, Edge ({t('docs.anyOs')}).</div>
                    </div>
                  </div>

                  <div className={styles.reqItemCard}>
                    <div className={styles.reqItemIcon}><DeviceMobileIcon size={22} /></div>
                    <div className={styles.reqItemContent}>
                      <div className={styles.reqItemTitle}>{t('docs.tabletsPhones')}</div>
                      <div className={styles.reqItemDesc}>Apple iPad, Android ({t('docs.chairsideTouchScreen')}).</div>
                    </div>
                  </div>

                  <div className={styles.reqItemCard}>
                    <div className={styles.reqItemIcon}><WifiIcon size={22} /></div>
                    <div className={styles.reqItemContent}>
                      <div className={styles.reqItemTitle}>{t('docs.internet')}</div>
                      <div className={styles.reqItemDesc}>{t('docs.anyNormalWifiOr')}</div>
                    </div>
                  </div>

                  <div className={styles.reqItemCard}>
                    <div className={styles.reqItemIcon}><PrinterIcon size={22} /></div>
                    <div className={styles.reqItemContent}>
                      <div className={styles.reqItemTitle}>{t('docs.printers')}</div>
                      <div className={styles.reqItemDesc}>{t('docs.standardA4And80mm')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple 3-step walkthrough */}
              <h3 className={styles.subSectionTitle}>
                <span>{t('docs.3StepsToDigitize')}</span>
              </h3>
              <div className={styles.appleFlowList}>
                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>1</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>
                      {t('docs.1AddYourDoctors')}
                    </h4>
                    <p className={styles.flowDescription}>
                      {t('docs.createLoginsForYour')}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>2</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>
                      {t('docs.2RegisterYourPatients')}
                    </h4>
                    <p className={styles.flowDescription}>
                      {t('docs.uploadYourExcelPatient')}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>3</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>
                      {t('docs.3FillTheDental')}
                    </h4>
                    <p className={styles.flowDescription}>
                      {t('docs.tapAffectedTeethTo')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PATIENTS */}
          {activeTab === 'patients' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <PatientsIcon size={14} />
                  <span>{t('docs.module02Patients')}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {t('docs.patientDirectoryElectronicCard')}
                </h2>
                <p className={styles.panelLead}>
                  {t('docs.allPatientFilesIn')}
                </p>
              </div>

              <div className={styles.appleFeaturesGrid}>
                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#0284c7" />
                    <span>{t('docs.1MinuteRegistration')}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {t('docs.onlyNameAndPhone')}
                  </p>
                </div>

                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#0284c7" />
                    <span>{t('docs.instantSearchBy4')}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {t('docs.typeJustTheLast')}
                  </p>
                </div>

                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#0284c7" />
                    <span>{t('docs.ssv043HMedical')}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {t('docs.compliesWithOfficialHealthcare')}
                  </p>
                </div>
              </div>

              <div className={styles.appleTip}>
                <div className={styles.appleTipIcon}><SparklesIcon size={18} /></div>
                <div className={styles.appleTipContent}>
                  <strong>{t('docs.allergiesSafetyAlert')}</strong> {t('docs.ifAPatientHas')}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <CalendarIcon size={14} />
                  <span>{t('docs.module03Calendar')}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {t('docs.appointmentsCalendarDoctorSchedules')}
                </h2>
                <p className={styles.panelLead}>
                  {t('docs.seeWhoIsBusy')}
                </p>
              </div>

              <div className={styles.appleFlowList}>
                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>1</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{t('docs.clickOnAnyFree')}</h4>
                    <p className={styles.flowDescription}>
                      {t('docs.chooseTheDoctorSelect')}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>2</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{t('docs.colorCodedVisitStatuses')}</h4>
                    <p className={styles.flowDescription}>
                      {t('docs.confirmedWaitingInOperatory')}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>3</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{t('docs.automatedSmsNotification')}</h4>
                    <p className={styles.flowDescription}>
                      {t('docs.thePatientReceivesAn')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ODONTOGRAM */}
          {activeTab === 'odontogram' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <ToothIcon size={14} />
                  <span>{t('docs.module04FdiDental')}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {t('docs.interactiveFdiOdontogramTooth')}
                </h2>
                <p className={styles.panelLead}>
                  {t('docs.32PermanentTeethAnd')}
                </p>
              </div>

              {/* Tooth Diagnostic Colors */}
              <div className={styles.odontogramPreviewCard}>
                <div className={styles.odontogramLegendTitle}>
                  <ToothIcon size={16} />
                  <span>{t('docs.dentalConditionColors')}</span>
                </div>
                <div className={styles.odontogramGrid}>
                  <div className={styles.odontogramItem}>
                    <span className={styles.colorDot} style={{ background: '#ef4444' }} />
                    <span>{t('docs.cariesRed')}</span>
                  </div>
                  <div className={styles.odontogramItem}>
                    <span className={styles.colorDot} style={{ background: '#3b82f6' }} />
                    <span>{t('docs.fillingBlue')}</span>
                  </div>
                  <div className={styles.odontogramItem}>
                    <span className={styles.colorDot} style={{ background: '#eab308' }} />
                    <span>{t('docs.crownGold')}</span>
                  </div>
                  <div className={styles.odontogramItem}>
                    <span className={styles.colorDot} style={{ background: '#8b5cf6' }} />
                    <span>{t('docs.implantPurple')}</span>
                  </div>
                  <div className={styles.odontogramItem}>
                    <span className={styles.colorDot} style={{ background: '#ec4899' }} />
                    <span>{t('docs.rootCanalPink')}</span>
                  </div>
                  <div className={styles.odontogramItem}>
                    <span className={styles.colorDot} style={{ background: '#64748b' }} />
                    <span>{t('docs.extractedGray')}</span>
                  </div>
                </div>
              </div>

              <div className={styles.appleFeaturesGrid}>
                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#0d9488" />
                    <span>{t('docs.5SurfacePrecision')}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {t('docs.chartChewingOcclusalSide')}
                  </p>
                </div>

                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#0d9488" />
                    <span>{t('docs.primaryTeethForChildren')}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {t('docs.switchToThe20')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TREATMENTS */}
          {activeTab === 'treatments' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <TreatmentIcon size={14} />
                  <span>{t('docs.module05Treatments')}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {t('docs.treatmentPlansAutomaticPrice')}
                </h2>
                <p className={styles.panelLead}>
                  {t('docs.buildAClearStep')}
                </p>
              </div>

              <div className={styles.appleFlowList}>
                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>1</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{t('docs.selectServicesFromYour')}</h4>
                    <p className={styles.flowDescription}>
                      {t('docs.chooseProceduresEG')}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>2</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{t('docs.breakIntoStages')}</h4>
                    <p className={styles.flowDescription}>
                      {t('docs.groupWorkIntoStage')}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>3</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{t('docs.printOrSendPdf')}</h4>
                    <p className={styles.flowDescription}>
                      {t('docs.patientsSignTheEstimate')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FINANCE */}
          {activeTab === 'finance' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <FinanceIcon size={14} />
                  <span>{t('docs.module06Finance')}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {t('docs.billingDebtsLedgerQr')}
                </h2>
                <p className={styles.panelLead}>
                  {t('docs.trackCashHumoUzcard')}
                </p>
              </div>

              <div className={styles.appleFeaturesGrid}>
                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <PrinterIcon size={18} color="#7c3aed" />
                    <span>{t('docs.80mm58mmThermalReceipts')}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {t('docs.printReceiptsOnCompact')}
                  </p>
                </div>

                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#7c3aed" />
                    <span>{t('docs.patientDebtsBook')}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {t('docs.instantlySeeWhichPatient')}
                  </p>
                </div>

                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#7c3aed" />
                    <span>{t('docs.doctorCommissionsKpi')}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {t('docs.calculatesExactPercentageFees')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: INVENTORY */}
          {activeTab === 'inventory' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <InventoryIcon size={14} />
                  <span>{t('docs.module07Inventory')}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {t('docs.dentalConsumablesStockManagement')}
                </h2>
                <p className={styles.panelLead}>
                  {t('docs.trackDentalAnestheticsFilling')}
                </p>
              </div>

              <div className={styles.appleFeaturesGrid}>
                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#2563eb" />
                    <span>{t('docs.lowStockWarning')}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {t('docs.setMinimumStockNumbers')}
                  </p>
                </div>

                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#2563eb" />
                    <span>{t('docs.supplierInvoices')}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {t('docs.storeSupplierContactsIncoming')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: LABORATORY */}
          {activeTab === 'laboratory' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <LabIcon size={14} />
                  <span>{t('docs.module08Laboratory')}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {t('docs.labOrdersDeliveryDeadlines')}
                </h2>
                <p className={styles.panelLead}>
                  {t('docs.sendDigitalLaboratoryWork')}
                </p>
              </div>

              <div className={styles.appleFlowList}>
                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>1</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{t('docs.createDigitalOrder')}</h4>
                    <p className={styles.flowDescription}>
                      {t('docs.selectToothNumberVita')}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>2</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{t('docs.trackReadiness')}</h4>
                    <p className={styles.flowDescription}>
                      {t('docs.theReceptionStaffSees')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: PROCESSES */}
          {activeTab === 'processes' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <ProcessesIcon size={14} />
                  <span>{t('docs.module09Workflows')}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {t('docs.receptionOperatoryCoordination')}
                </h2>
                <p className={styles.panelLead}>
                  {t('docs.seamlessSignalWhenA')}
                </p>
              </div>

              <div className={styles.appleFeaturesGrid}>
                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#0284c7" />
                    <span>{t('docs.instantArrivalAlert')}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {t('docs.receptionMarksArrivedAnd')}
                  </p>
                </div>

                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#0284c7" />
                    <span>{t('docs.zeroChairIdling')}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {t('docs.optimizesClinicChairOccupancy')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SECURITY */}
          {activeTab === 'security' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <SecurityIcon size={14} />
                  <span>{t('docs.module10Security')}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {t('docs.dataProtectionLawNo')}
                </h2>
                <p className={styles.panelLead}>
                  {t('docs.bankLevel256Bit')}
                </p>
              </div>

              <div className={styles.appleSystemReq}>
                <div className={styles.reqGrid}>
                  <div className={styles.reqItemCard}>
                    <div className={styles.reqItemIcon}><CheckIcon size={20} /></div>
                    <div className={styles.reqItemContent}>
                      <div className={styles.reqItemTitle}>{t('docs.uzbekistanLawNo547')}</div>
                      <div className={styles.reqItemDesc}>{t('docs.allPatientRecordsAre')}</div>
                    </div>
                  </div>

                  <div className={styles.reqItemCard}>
                    <div className={styles.reqItemIcon}><CheckIcon size={20} /></div>
                    <div className={styles.reqItemContent}>
                      <div className={styles.reqItemTitle}>{t('docs.dailyAutomatedBackups')}</div>
                      <div className={styles.reqItemDesc}>{t('docs.nightlySnapshotsPreventAny')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: SETTINGS */}
          {activeTab === 'settings' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <SettingsIcon size={14} />
                  <span>{t('docs.module11Settings')}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {t('docs.customizingYourClinicProfile')}
                </h2>
                <p className={styles.panelLead}>
                  {t('docs.uploadClinicLogoCustomize')}
                </p>
              </div>

              <div className={styles.appleFlowList}>
                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>1</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{t('docs.logoReceiptHeaders')}</h4>
                    <p className={styles.flowDescription}>
                      {t('docs.yourLogoClinicAddress')}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>2</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{t('docs.workingHours')}</h4>
                    <p className={styles.flowDescription}>
                      {t('docs.setStartAndClosing')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: FAQ */}
          {activeTab === 'faq' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <FaqIcon size={14} />
                  <span>{t('docs.questionsAnswers')}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {t('docs.frequentlyAskedQuestions')}
                </h2>
                <p className={styles.panelLead}>
                  {t('docs.straightforwardPracticalAnswersTo')}
                </p>
              </div>

              <div className={styles.faqAccordion}>
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className={styles.faqItem}>
                      <button
                        type="button"
                        className={styles.faqHeader}
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                        aria-expanded={isOpen}
                      >
                        <span>{faq.q}</span>
                        <span className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ''}`}>
                          <ChevronDownIcon size={18} />
                        </span>
                      </button>
                      {isOpen && (
                        <div className={styles.faqAnswer}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 13: SUPPORT */}
          {activeTab === 'support' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <SupportIcon size={14} />
                  <span>{t('docs.support')}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {t('docs.dentuzAssistanceStaffCoaching')}
                </h2>
                <p className={styles.panelLead}>
                  {t('docs.weHelpYouMigrate')}
                </p>
              </div>

              <div className={styles.supportCards}>
                <div className={styles.supportCard}>
                  <div
                    className={styles.supportCardIconCircle}
                    style={{ backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}
                  >
                    <PhoneCallIcon size={26} />
                  </div>
                  <h4 className={styles.supportCardTitle}>{t('docs.phoneCall')}</h4>
                  <p className={styles.supportCardSubtitle}>
                    {t('docs.directLineToOur')}
                  </p>
                  <a href="tel:+998712004545" className={styles.supportActionBtn}>
                    +998 71 200 45 45
                  </a>
                </div>

                <div className={styles.supportCard}>
                  <div
                    className={styles.supportCardIconCircle}
                    style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', color: '#0284c7' }}
                  >
                    <TelegramIcon size={26} />
                  </div>
                  <h4 className={styles.supportCardTitle}>{t('docs.telegramSupport')}</h4>
                  <p className={styles.supportCardSubtitle}>
                    {t('docs.instantAnswersWithin2')}
                  </p>
                  <a href="https://t.me/dentuz_support" target="_blank" rel="noreferrer" className={styles.supportActionBtn}>
                    @dentuz_support
                  </a>
                </div>

                <div className={styles.supportCard}>
                  <div
                    className={styles.supportCardIconCircle}
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}
                  >
                    <SparklesIcon size={26} />
                  </div>
                  <h4 className={styles.supportCardTitle}>{t('docs.freeStaffCoaching')}</h4>
                  <p className={styles.supportCardSubtitle}>
                    {t('docs.liveZoomOrOnsite')}
                  </p>
                  <Link to="/contact" className={styles.supportActionBtn} style={{ background: '#059669' }}>
                    {t('docs.bookCoaching')}
                  </Link>
                </div>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}
