import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Homepage.module.css';
import Icon from '../../components/Icon/Icon';
import OrbitEcosystem from '../../components/OrbitEcosystem/OrbitEcosystem';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import { useInView } from '../../hooks/useInView';

const HERO_UPPER_TEETH = [
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28'
];

const HERO_LOWER_TEETH = [
  '48', '47', '46', '45', '44', '43', '42', '41',
  '31', '32', '33', '34', '35', '36', '37', '38'
];

const TOOTH_DESCRIPTIONS = {
  '11': "11-tish • Yuqori o'ng markaziy kurak: Emal butun, karies yo'q, tabiiy sog'lom holat",
  '12': "12-tish • Yuqori o'ng lateral kurak: Tabiiy holatda, periapikal o'zgarishlar yo'q",
  '13': "13-tish • Yuqori o'ng qoziq tish: Sog'lom anatomik shakl, mustahkam ildiz",
  '14': "14-tish • Yuqori o'ng birinchi premolyar: Reabilitatsiya va titan implant o'rnatilgan",
  '15': "15-tish • Yuqori o'ng ikkinchi premolyar: O'rta karies (O sirt) — plomba tavsiya etiladi",
  '16': "16-tish • Yuqori o'ng birinchi molyar: Estetik kompozit plomba, okklyuziya barqaror",
  '18': "18-tish • Aql tishi: Jarrohlik yo'li bilan olingan (retensiya asoratlari bartaraf etilgan)",
  '21': "21-tish • Yuqori chap markaziy kurak: Sirkoniy keramik toj (estetik zona restavratsiyasi)",
  '22': "22-tish • Yuqori chap lateral kurak: Sog'lom holatda, karies alomatlari yo'q",
  '24': "24-tish • Yuqori chap premolyar: Profilaktik ko'rikdan o'tgan, emal mustahkam",
  '25': "25-tish • Yuqori chap ikkinchi premolyar: Karies kavagi (MOD sirt), davolash talab etiladi",
  '26': "26-tish • Yuqori chap birinchi molyar: Fissura germetizatsiyasi va kompozit restavratsiya",
  '27': "27-tish • Yuqori chap ikkinchi molyar: Pulpit davolangan, ildiz kanallari gutta-percha bilan to'ldirilgan",
  '28': "28-tish • Yuqori chap aql tishi: Distopik joylashuv sababli ekstraksiya qilingan",
  '31': "31-tish • Pastki chap markaziy kurak: Tish toshlari ultratovushda tozalangan, sog'lom",
  '36': "36-tish • Pastki chap birinchi molyar: Qatlamli kompozit plomba (Nano-gibrid)",
  '38': "38-tish • Pastki chap aql tishi: Jarrohlik ekstraksiyasi o'tkazilgan",
  '41': "41-tish • Pastki o'ng markaziy kurak: Sog'lom va mustahkam periodontal tayanch",
  '45': "45-tish • Pastki o'ng ikkinchi premolyar: Integratsiyalashgan dental implant",
  '46': "46-tish • Pastki o'ng birinchi molyar: Endodontik davolash (3 ta kanal) va tojga tayyorgarlik",
  '47': "47-tish • Pastki o'ng ikkinchi molyar: Boshlang'ich chuqur karies, davolash rejalashtirilgan",
  '48': "48-tish • Pastki o'ng aql tishi: Rentgen nazoratida, to'g'ri o'sgan va funksional"
};

const TOOTH_DESCRIPTIONS_EN = {
  '11': "Tooth 11 • Maxillary right central incisor: Intact enamel, caries-free, sound tooth",
  '12': "Tooth 12 • Maxillary right lateral incisor: Natural presentation, intact periodontium",
  '13': "Tooth 13 • Maxillary right canine: Sound anatomical crown, stable canine guidance",
  '14': "Tooth 14 • Maxillary right first premolar: Osseointegrated titanium implant restoration",
  '15': "Tooth 15 • Maxillary right second premolar: Occlusal caries cavity — restoration needed",
  '16': "Tooth 16 • Maxillary right first molar: Aesthetic composite restoration, stable contact",
  '18': "Tooth 18 • Maxillary right third molar: Surgically extracted due to impaction",
  '21': "Tooth 21 • Maxillary left central incisor: Monolithic zirconia aesthetic crown",
  '22': "Tooth 22 • Maxillary left lateral incisor: Sound periodontal support, vital pulp",
  '24': "Tooth 24 • Maxillary left premolar: Sound occlusal anatomy, routine prophylaxis",
  '25': "Tooth 25 • Maxillary left second premolar: Caries lesion on MOD surface",
  '26': "Tooth 26 • Maxillary left molar: Pit & fissure sealant and light-cure composite",
  '27': "Tooth 27 • Maxillary left second molar: Endodontically treated, hermetic obturation",
  '28': "Tooth 28 • Maxillary left third molar: Extracted (ectopic eruption)",
  '31': "Tooth 31 • Mandibular left central incisor: Ultrasonic calculus scaling completed",
  '36': "Tooth 36 • Mandibular left first molar: Aesthetic composite restoration intact",
  '38': "Tooth 38 • Mandibular left third molar: Extracted tooth space healed",
  '41': "Tooth 41 • Mandibular right central incisor: Healthy alveolar bone and intact enamel",
  '45': "Tooth 45 • Mandibular right second premolar: Precision dental implant with custom abutment",
  '46': "Tooth 46 • Mandibular right first molar: 3-root canal therapy, provisional restoration",
  '47': "Tooth 47 • Mandibular right second molar: Deep occlusal fissure caries detected",
  '48': "Tooth 48 • Mandibular right third molar: Fully erupted and radiographically sound"
};

export default function Homepage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [selectedTooth, setSelectedTooth] = useState('11');

  // Stats in-view trigger
  const [statsRef, statsInView] = useInView({ threshold: 0.2, triggerOnce: true });

  const getToothStatus = (num) => {
    // Caries (Red)
    if (['15', '25', '47'].includes(num)) {
      return { label: t('homepage.activeCaries'), color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', isCaries: true };
    }
    // Restored / Plomba (Green)
    if (['16', '26', '36'].includes(num)) {
      return { label: t('homepage.restoredFilling'), color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', isRestored: true };
    }
    // Implant (Cyan - matches tokens.css --color-cyan)
    if (['14', '45'].includes(num)) {
      return { label: t('homepage.dentalImplant'), color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.15)', isImplant: true };
    }
    // Crown / Koronka (Royal Blue #2563EB — sof ko'k, implant #06B6D4, warning #F59E0B va endo #8B5CF6 bilan chalkashmasligi uchun)
    if (['21'].includes(num)) {
      return { label: t('homepage.zirconiaCrown'), color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)', isCrown: true };
    }
    // Root Canal / Endo / Pulpit (Purple)
    if (['27', '46'].includes(num)) {
      return { label: t('homepage.rootCanalEndo'), color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', isEndo: true };
    }
    // Extracted / Missing (Muted / Slate - non-color dependent dashed + cross indicator)
    if (['18', '28', '38'].includes(num)) {
      return { label: t('homepage.extracted'), color: '#94A3B8', bg: 'transparent', isExtracted: true };
    }
    // Healthy (Default)
    return { label: t('homepage.healthy'), color: '#64748B', bg: 'rgba(100, 116, 139, 0.08)' };
  };

  const currentDesc = isEn
    ? (TOOTH_DESCRIPTIONS_EN[selectedTooth] || `Tooth ${selectedTooth} • Sound physiological state, no clinical pathology detected`)
    : (TOOTH_DESCRIPTIONS[selectedTooth] || `${selectedTooth}-tish • Sog'lom holatda, klinik patologiya aniqlanmadi`);

  const currentStatus = getToothStatus(selectedTooth);

  const PORTAL_SECTIONS = [
    {
      to: '/features',
      title: t('homepage.features'),
      desc: t('homepage.deepDiveIntoFdi'),
      icon: 'edit_note',
      badge: t('homepage.9Modules'),
    },
    {
      to: '/advantages',
      title: t('homepage.advantages'),
      desc: t('homepage.discoverWhy350Clinics'),
      icon: 'verified_user',
      badge: t('homepage.whyDentuz'),
    },
    {
      to: '/pricing',
      title: t('homepage.pricing_1'),
      desc: t('homepage.simpleAndTransparentPlans'),
      icon: 'credit_card_off',
      badge: t('homepage.from19Mo'),
    },
    {
      to: '/contact',
      title: t('homepage.contact_1'),
      desc: t('homepage.speakDirectlyWithOur'),
      icon: 'support_agent',
      badge: t('homepage.directSupport'),
    },
  ];

  return (
    <div className={styles.homepageRoot}>
      {/* Ambient background glow & cyber medical matrix */}
      <div className={styles.ambientGridMatrix} />
      <div className={styles.ambientGlowPrimary} />
      <div className={styles.ambientGlowSecondary} />

      {/* ── 1. Hero Section ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Icon name="verified_user" size={16} />
          <span>{t('homepage.1DentalManagementPlatform')}</span>
        </div>

        <h1 className={styles.heroHeadline}>
          {t('homepage.theModernOperatingSystem')}{' '}
          <span className={styles.headlineHighlight}>
            {t('homepage.dentalClinics')}
          </span>
        </h1>

        <p className={styles.heroSubhead}>
          {t('homepage.electronicPatientRecords3d')}
        </p>

        {/* Action Buttons: 1.1 aniq va tushunarli ajratilgan */}
        <div className={styles.heroActions}>
          <Link to="/signup" className={styles.primaryCta} title={t('homepage.startFree14Day')}>
            <Icon name="rocket_launch" size={18} />
            <span>{t('homepage.start14DayFree')}</span>
          </Link>
          <Link to="/dashboard" className={styles.secondaryCta} title={t('homepage.tryInteractiveDemo')}>
            <Icon name="play_circle" size={18} />
            <span>{t('homepage.exploreInteractiveDemo')}</span>
          </Link>
        </div>

        {/* Hero Dental Arch Interactive Visual (1.3 Kengaytirilgan klinik holatlar) */}
        <div className={styles.heroCanvasWrapper} id="hero-canvas">
          <div className={styles.heroCanvasCard}>
            {/* High-tech holographic scanning beam */}
            <div className={styles.canvasScanBeam} />

            <div className={styles.canvasTop}>
              <div>
                <div className={styles.canvasTag}>
                  {t('homepage.fdiWorldDentalStandard')}
                </div>
                <div className={styles.canvasTitle}>
                  {t('homepage.interactiveFdiDentalChart')}
                </div>
              </div>
              <div className={styles.canvasLegend} style={{ flexWrap: 'wrap', gap: '12px' }}>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#64748B' }} />
                  {t('homepage.healthy')}
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#10B981' }} />
                  {t('homepage.restored')}
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#EF4444' }} />
                  {t('homepage.caries')}
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#06B6D4' }} />
                  {t('homepage.implant')}
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#2563EB' }} />
                  {t('homepage.crown')}
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#8B5CF6' }} />
                  {t('homepage.rootCanal')}
                </span>
                <span className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{
                      background: 'transparent',
                      border: '1.5px dashed #94A3B8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      fontWeight: 'bold',
                      color: '#64748B'
                    }}
                  >
                    ✕
                  </span>
                  {t('homepage.extracted_1')}
                </span>
              </div>
            </div>

            {/* Arches Grid */}
            <div className={styles.archGrid}>
              {/* Upper Arch */}
              <div>
                <div className={styles.archRowHeader}>
                  <span>{t('homepage.maxillaryArchUpper18')}</span>
                  <span>{t('homepage.clickAnyToothTo')}</span>
                </div>
                <div className={styles.teethGrid}>
                  {HERO_UPPER_TEETH.map((tooth, idx) => {
                    const isSelected = selectedTooth === tooth;
                    const status = getToothStatus(tooth);
                    return (
                      <div
                        key={tooth}
                        className={styles.toothCell}
                        style={{ '--tooth-idx': idx }}
                        onClick={() => setSelectedTooth(tooth)}
                        title={`${tooth}-tish • ${status.label}`}
                      >
                        <div
                          className={`${styles.toothBox} ${isSelected ? styles.toothBoxSelected : ''} ${status.isExtracted ? styles.toothBoxExtracted : ''}`}
                          style={
                            !isSelected && status.color && status.color !== '#64748B' && !status.isExtracted
                              ? { borderColor: status.color, backgroundColor: status.bg, boxShadow: `0 0 10px ${status.bg}` }
                              : undefined
                          }
                        >
                          <span
                            className={`${styles.toothNumber} ${status.isExtracted ? styles.toothNumberExtracted : ''}`}
                            style={!isSelected && status.color && status.color !== '#64748B' && !status.isExtracted ? { color: status.color } : undefined}
                          >
                            {status.isExtracted ? '✕' : tooth}
                          </span>
                        </div>
                        <span className={`${styles.toothLabel} ${isSelected ? styles.toothLabelSelected : ''}`}>
                          {tooth}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lower Arch */}
              <div>
                <div className={styles.archRowHeader}>
                  <span>{t('homepage.mandibularArchLower48')}</span>
                </div>
                <div className={styles.teethGrid}>
                  {HERO_LOWER_TEETH.map((tooth, idx) => {
                    const isSelected = selectedTooth === tooth;
                    const status = getToothStatus(tooth);
                    return (
                      <div
                        key={tooth}
                        className={styles.toothCell}
                        style={{ '--tooth-idx': idx + 16 }}
                        onClick={() => setSelectedTooth(tooth)}
                        title={`${tooth}-tish • ${status.label}`}
                      >
                        <div
                          className={`${styles.toothBox} ${isSelected ? styles.toothBoxSelected : ''} ${status.isExtracted ? styles.toothBoxExtracted : ''}`}
                          style={
                            !isSelected && status.color && status.color !== '#64748B' && !status.isExtracted
                              ? { borderColor: status.color, backgroundColor: status.bg, boxShadow: `0 0 10px ${status.bg}` }
                              : undefined
                          }
                        >
                          <span
                            className={`${styles.toothNumber} ${status.isExtracted ? styles.toothNumberExtracted : ''}`}
                            style={!isSelected && status.color && status.color !== '#64748B' && !status.isExtracted ? { color: status.color } : undefined}
                          >
                            {status.isExtracted ? '✕' : tooth}
                          </span>
                        </div>
                        <span className={`${styles.toothLabel} ${isSelected ? styles.toothLabelSelected : ''}`}>
                          {tooth}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Tooth Live Inspection Bar */}
            <div className={styles.canvasInspectionPill}>
              <div className={styles.pillBadge}>
                <span className={styles.statusDot} style={{ backgroundColor: currentStatus.color }} />
                <strong style={{ color: currentStatus.color }}>{currentStatus.label}:</strong>
                <span>{currentDesc}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1.4 Kuchaytirilgan Ishonch va Xavfsizlik Nishonlari (Social Proof & Trust Badges) */}
        <div className={styles.trustBadgeRow} style={{ flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
          <div className={styles.trustItem}>
            <Icon name="verified_user" size={16} />
            <span>{t('homepage.uzbekistanLawORq')}</span>
          </div>
          <div className={styles.trustItem}>
            <Icon name="domain" size={16} />
            <span>{t('homepage.350LicensedClinicsIn')}</span>
          </div>
          <div className={styles.trustItem}>
            <Icon name="lock" size={16} />
            <span>{t('homepage.256BitMedicalGrade')}</span>
          </div>
          <div className={styles.trustItem}>
            <Icon name="cloud_done" size={16} />
            <span>{t('homepage.998UptimeTashkent')}</span>
          </div>
          <div className={styles.trustItem}>
            <Icon name="credit_card_off" size={16} />
            <span>{t('homepage.noCreditCardRequired')}</span>
          </div>
        </div>
      </section>

      {/* ── 2. Portal Cards Gateway (Direct links to dedicated animated pages) ── */}
      <section className={styles.portalSection}>
        <div className={styles.portalHeader}>
          <div className={styles.portalBadge}>
            <Icon name="apartment" size={15} />
            <span>{t('homepage.platformArchitecture')}</span>
          </div>
          <h2 className={styles.portalTitle}>
            {t('homepage.exploreDentuzByCategory')}
          </h2>
          <p className={styles.portalSubtitle}>
            {t('homepage.eachSectionIsSpecifically')}
          </p>
        </div>

        <div className={styles.portalGrid}>
          {PORTAL_SECTIONS.map((sec) => (
            <Link key={sec.to} to={sec.to} className={styles.portalCard}>
              <div className={styles.portalCardIconWrap}>
                <Icon name={sec.icon} size={28} />
              </div>
              <h3 className={styles.portalCardTitle}>
                <span>{sec.title}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0ea5e9' }}>{sec.badge}</span>
              </h3>
              <p className={styles.portalCardDesc}>{sec.desc}</p>
              <div className={styles.portalCardAction}>
                <span>{t('homepage.openSection')}</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. Orbit Ecosystem 2-Column Section (GateDent Style) ── */}
      <section className={styles.orbitEcosystemSection}>
        <div className={styles.orbitContainer}>
          <div className={styles.orbitLeftCol}>
            <div className={styles.orbitBadge}>
              <Icon name="apartment" size={15} />
              <span>{t('homepage.dentuzEcosystem')}</span>
            </div>
            <h2 className={styles.orbitHeading}>
              {t('homepage.oneUnifiedSystemAll')}
            </h2>
            <p className={styles.orbitSubtext}>
              {t('homepage.sayGoodbyeToLost')}
            </p>

            <ul className={styles.orbitFeatureList}>
              <li className={styles.orbitFeatureItem}>
                <div className={styles.orbitCheckWrap}>
                  <Icon name="check_circle" size={18} />
                </div>
                <div>
                  <strong>{t('homepage.smartSchedulingSmsReminders')}</strong>
                  <p>{t('homepage.reducePatientNoShows')}</p>
                </div>
              </li>
              <li className={styles.orbitFeatureItem}>
                <div className={styles.orbitCheckWrap}>
                  <Icon name="check_circle" size={18} />
                </div>
                <div>
                  <strong>{t('homepage.complete3dOdontogramTreatment')}</strong>
                  <p>{t('homepage.oneClickTreatmentPlans')}</p>
                </div>
              </li>
              <li className={styles.orbitFeatureItem}>
                <div className={styles.orbitCheckWrap}>
                  <Icon name="check_circle" size={18} />
                </div>
                <div>
                  <strong>{t('homepage.financialAnalyticsDoctorCommission')}</strong>
                  <p>{t('homepage.instantCalculationOfDoctor')}</p>
                </div>
              </li>
            </ul>

            <div className={styles.orbitActions}>
              <Link to="/advantages" className={styles.orbitPrimaryBtn}>
                {t('homepage.learnAllAdvantages')}
              </Link>
            </div>
          </div>

          <div className={styles.orbitRightCol}>
            <OrbitEcosystem visualOnly={true} />
          </div>
        </div>
      </section>

      {/* ── 4. Stats Counter Section ── */}
      <section ref={statsRef} className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              <AnimatedCounter value="350+" duration={1600} />
            </div>
            <div className={styles.statLabel}>
              {t('homepage.activeDentalClinics')}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              <AnimatedCounter value="45 000+" duration={1800} />
            </div>
            <div className={styles.statLabel}>
              {t('homepage.registeredPatients')}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              <AnimatedCounter value="99.8%" duration={1500} />
            </div>
            <div className={styles.statLabel}>
              {t('homepage.systemUptimeStability')}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              15 <span className={styles.statUnit}>{t('homepage.minutes')}</span>
            </div>
            <div className={styles.statLabel}>
              {t('homepage.averageOnboardingTime')}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Bottom Conversion Banner ── */}
      <section className={styles.ctaBannerSection}>
        <div className={styles.ctaBannerInner}>
          <h2 className={styles.ctaBannerHeadline}>
            {t('homepage.readyToModerniseYour')}
          </h2>
          <p className={styles.ctaBannerSubhead}>
            {t('homepage.join350ClinicsAcross')}
          </p>
          <div className={styles.ctaBannerActions}>
            <Link to="/contact" className={styles.ctaBannerBtn}>
              {t('homepage.requestLiveDemo')}
            </Link>
            <Link to="/pricing" className={styles.ctaBannerOutlineBtn}>
              {t('homepage.viewPricingPlans')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
