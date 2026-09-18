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
  '11': "Tish #11 • Yuqori o'ng markaziy kurak: Emal butun, karies yo'q, sog'lom",
  '12': "Tish #12 • Yuqori o'ng lateral kurak: Tabiiy holatda, sog'lom",
  '13': "Tish #13 • Yuqori o'ng qoziq tish: Sog'lom anatomik shakl",
  '14': "Tish #14 • Yuqori o'ng birinchi premolyar: Reabilitatsiya va implantatsiya",
  '16': "Tish #16 • Yuqori o'ng birinchi molyar: Karies davolash va sirkoniy toj",
  '21': "Tish #21 • Yuqori chap markaziy kurak: Metall-keramika toj",
  '22': "Tish #22 • Yuqori chap lateral kurak: Sog'lom holatda",
  '24': "Tish #24 • Yuqori chap premolyar: Fissuralar profilaktikasi tavsiya etiladi",
  '26': "Tish #26 • Yuqori chap molyar: Fissura germetizatsiyasi muvaffaqiyatli",
  '31': "Tish #31 • Pastki chap markaziy kurak: Tish toshlari ultratovushda tozalangan",
  '36': "Tish #36 • Pastki chap birinchi molyar: Estetik kompozit plomba",
  '41': "Tish #41 • Pastki o'ng markaziy kurak: Sog'lom va mustahkam",
  '46': "Tish #46 • Pastki o'ng birinchi molyar: Kompozit restavratsiya barqaror",
  '48': "Tish #48 • Aql tishi: Rentgen nazoratida, to'g'ri o'sgan"
};

const TOOTH_DESCRIPTIONS_EN = {
  '11': "Tooth #11 • Maxillary right central incisor: Intact enamel, caries-free, healthy",
  '12': "Tooth #12 • Maxillary right lateral incisor: Natural presentation, healthy",
  '13': "Tooth #13 • Maxillary right canine: Sound anatomical crown",
  '14': "Tooth #14 • Maxillary right first premolar: Implant candidate & restoration",
  '16': "Tooth #16 • Maxillary right first molar: Caries therapy and zirconia crown",
  '21': "Tooth #21 • Maxillary left central incisor: PFM crown intact",
  '22': "Tooth #22 • Maxillary left lateral incisor: Sound periodontal support",
  '24': "Tooth #24 • Maxillary left premolar: Pit & fissure sealant recommended",
  '26': "Tooth #26 • Maxillary left molar: Occlusal sealing successful",
  '31': "Tooth #31 • Mandibular left central incisor: Ultrasonic calculus scaling completed",
  '36': "Tooth #36 • Mandibular left first molar: Aesthetic composite restoration",
  '41': "Tooth #41 • Mandibular right central incisor: Healthy and stable",
  '46': "Tooth #46 • Mandibular right first molar: Composite restoration intact",
  '48': "Tooth #48 • Third molar (Wisdom): Radiographically monitored, erupted"
};

export default function Homepage() {
  const { t, i18n } = useTranslation();
  const [selectedTooth, setSelectedTooth] = useState('11');
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    subject: 'Bepul demo taqdimot',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Scroll reveal section observers
  const [heroRef, heroInView] = useInView({ threshold: 0.05 });
  const [orbitRef, orbitInView] = useInView({ threshold: 0.1 });
  const [story1Ref, story1InView] = useInView({ threshold: 0.12 });
  const [story2Ref, story2InView] = useInView({ threshold: 0.12 });
  const [story3Ref, story3InView] = useInView({ threshold: 0.12 });
  const [statsRef, statsInView] = useInView({ threshold: 0.15 });
  const [pricingRef, pricingInView] = useInView({ threshold: 0.08 });
  const [compareRef, compareInView] = useInView({ threshold: 0.08 });
  const [faqRef, faqInView] = useInView({ threshold: 0.1 });
  const [contactRef, contactInView] = useInView({ threshold: 0.1 });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const isEn = i18n.language === 'en';
  const dict = isEn ? TOOTH_DESCRIPTIONS_EN : TOOTH_DESCRIPTIONS;
  const currentDesc =
    dict[selectedTooth] || (isEn ? `Tooth #${selectedTooth} • Healthy condition` : `Tish #${selectedTooth} • Sog'lom holatda`);

  return (
    <main id="main-content">
      {/* 2. HERO SECTION */}
      <section ref={heroRef} className={`${styles.heroSection} ${heroInView ? 'revealed' : 'reveal'}`} aria-label={t('homepage.hero.headline')}>
        <h1 className={styles.heroHeadline}>
          {t('homepage.hero.headline')}
        </h1>
        <p className={styles.heroSubhead}>
          {t('homepage.hero.subhead')}
        </p>

        <div className={styles.heroActions}>
          <Link to="/signup" className={styles.primaryCta}>
            {t('homepage.hero.startFree')}
          </Link>
          <a href="#features" className={styles.secondaryCta}>
            <span>{t('homepage.hero.watchDemo')}</span>
            <span style={{ transition: 'transform 0.2s ease' }}>→</span>
          </a>
        </div>

        {/* Hero Visual: Apple-style Odontogram Canvas */}
        <div className={styles.heroCanvasWrapper}>
          <div className={styles.heroCanvasCard}>
            <div className={styles.canvasTop}>
              <div>
                <p className={styles.canvasTag}>{t('homepage.hero.canvasTag')}</p>
                <p className={styles.canvasTitle}>{t('homepage.hero.canvasTitle')}</p>
              </div>
              <div className={styles.canvasLegend}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#CBD5E1' }} />
                  {t('homepage.hero.healthy')}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--color-cyan)' }} />
                  {t('homepage.hero.selected')}
                </span>
              </div>
            </div>

            {/* The Dental Arch Silhouette Grid */}
            <div className={styles.archGrid}>
              {/* Upper Jaw */}
              <div>
                <div className={styles.archRowHeader}>
                  <span>{t('homepage.hero.upperJaw')}</span>
                  <span>18 — 28</span>
                </div>
                <div className={styles.teethGrid}>
                  {HERO_UPPER_TEETH.map((tooth) => {
                    const isSelected = selectedTooth === tooth;
                    const isTreated = tooth === '21' || tooth === '16';
                    return (
                      <div
                        key={tooth}
                        className={styles.toothCell}
                        onClick={() => setSelectedTooth(tooth)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        aria-label={`Tooth ${tooth}`}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTooth(tooth); } }}
                      >
                        <div
                          className={`${styles.toothBox} ${
                            isSelected
                              ? styles.toothBoxSelected
                              : isTreated
                              ? styles.toothBoxTreated
                              : ''
                          }`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill="currentColor"
                            aria-hidden="true"
                            focusable="false"
                            style={{
                              color: isSelected ? '#FFFFFF' : isTreated ? '#10B981' : '#CBD5E1'
                            }}
                          >
                            <path d="M12 2C8 2 7 6 7 10c0 4 2 8 3 11 1 2 2 2 2 0 0-2 1-4 2-4s2 2 2 4c0 2 1 2 2 0 1-3 3-7 3-11 0-4-1-8-5-8z" />
                          </svg>
                        </div>
                        <span
                          className={`${styles.toothLabel} ${
                            isSelected ? styles.toothLabelSelected : ''
                          }`}
                          aria-hidden="true"
                        >
                          {tooth}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lower Jaw */}
              <div>
                <div className={styles.archRowHeader}>
                  <span>{t('homepage.hero.lowerJaw')}</span>
                  <span>48 — 38</span>
                </div>
                <div className={styles.teethGrid}>
                  {HERO_LOWER_TEETH.map((tooth) => {
                    const isSelected = selectedTooth === tooth;
                    const isTreated = tooth === '46' || tooth === '36';
                    return (
                      <div
                        key={tooth}
                        className={styles.toothCell}
                        onClick={() => setSelectedTooth(tooth)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        aria-label={`Tooth ${tooth}`}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTooth(tooth); } }}
                      >
                        <div
                          className={`${styles.toothBox} ${
                            isSelected
                              ? styles.toothBoxSelected
                              : isTreated
                              ? styles.toothBoxTreated
                              : ''
                          }`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill="currentColor"
                            aria-hidden="true"
                            focusable="false"
                            style={{
                              color: isSelected ? '#FFFFFF' : isTreated ? '#10B981' : '#CBD5E1'
                            }}
                          >
                            <path d="M12 2C8 2 7 6 7 10c0 4 2 8 3 11 1 2 2 2 2 0 0-2 1-4 2-4s2 2 2 4c0 2 1 2 2 0 1-3 3-7 3-11 0-4-1-8-5-8z" />
                          </svg>
                        </div>
                        <span
                          className={`${styles.toothLabel} ${
                            isSelected ? styles.toothLabelSelected : ''
                          }`}
                          aria-hidden="true"
                        >
                          {tooth}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Apple Minimalist Inspection Label */}
            <div className={styles.canvasInspectionPill}>
              <div className={styles.pillBadge}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 9999,
                    backgroundColor: 'var(--color-cyan)'
                  }}
                />
                <span>{currentDesc}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 ORBITING ECOSYSTEM SECTION (Bitta tizim) */}
      <section ref={orbitRef} className={`${styles.orbitWrapperSection} ${orbitInView ? 'revealed' : 'reveal'}`}>
        <OrbitEcosystem />
      </section>

      {/* 3. FEATURE STORYTELLING SECTIONS */}
      {/* Story 1: Smart Taqvim */}
      <section ref={story1Ref} className={`${styles.storySection} ${story1InView ? 'revealed' : 'reveal'}`} id="features">
        <div className={styles.storyGrid}>
          <div>
            <p className={styles.storyNumber}>{t('homepage.stories.story1.tag')}</p>
            <h2 className={styles.storyHeading}>{t('homepage.stories.story1.title')}</h2>
            <p className={styles.storyBody}>
              {t('homepage.stories.story1.body')}
            </p>
          </div>

          <div className={styles.storyCardVisual}>
            <div className={styles.scheduleHeader}>
              <span className={styles.scheduleHeaderTitle}>{t('homepage.stories.story1.scheduleTitle')}</span>
              <span className={styles.scheduleHeaderMeta}>{t('homepage.stories.story1.activeChairs')}</span>
            </div>
            <div className={styles.scheduleList}>
              <div className={styles.scheduleItem}>
                <span className={styles.scheduleTime}>09:00</span>
                <div className={styles.scheduleInfo}>
                  <div className={styles.scheduleDoctor}>{isEn ? 'Dr. Azimov • Caries therapy' : 'Dr. Azimov • Karies davolash'}</div>
                  <div className={styles.schedulePatient}>{isEn ? 'Patient: Anvar Qosimov' : 'Bemor: Anvar Qosimov'}</div>
                </div>
                <span className={styles.scheduleBadgeDone}>{t('common.completed')}</span>
              </div>
              <div className={`${styles.scheduleItem} ${styles.scheduleItemActive}`}>
                <span className={`${styles.scheduleTime} ${styles.scheduleTimeActive}`}>14:00</span>
                <div className={styles.scheduleInfo}>
                  <div className={styles.scheduleDoctor}>{isEn ? 'Dr. Saidova • Air-Flow scaling' : 'Dr. Saidova • Air-Flow tozalash'}</div>
                  <div className={styles.schedulePatient}>{isEn ? 'Patient: Nilufar Rahimova' : 'Bemor: Nilufar Rahimova'}</div>
                </div>
                <span className={styles.scheduleBadgeProgress}>{t('common.inProgress')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story 2: Bemorlar tarixi */}
      <div className={styles.storySectionAltWrapper}>
        <section ref={story2Ref} className={`${styles.storySection} ${story2InView ? 'revealed' : 'reveal'}`}>
          <div className={`${styles.storyGrid} ${styles.storyGridReverse}`}>
            <div className={styles.storyCardVisual}>
              <div className={styles.patientProfileHeader}>
                <div className={styles.patientAvatar}>
                  AQ
                </div>
                <div>
                  <div className={styles.patientName}>Anvar Qosimov</div>
                  <div className={styles.patientMeta}>ID: #P-1042 • {isEn ? '34 yrs' : '34 yosh'}</div>
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

            <div>
              <p className={styles.storyNumber}>{t('homepage.stories.story2.tag')}</p>
              <h2 className={styles.storyHeading}>{t('homepage.stories.story2.title')}</h2>
              <p className={styles.storyBody}>
                {t('homepage.stories.story2.body')}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Story 3: Moliyaviy intizom */}
      <section ref={story3Ref} className={`${styles.storySection} ${story3InView ? 'revealed' : 'reveal'}`}>
        <div className={styles.storyGrid}>
          <div>
            <p className={styles.storyNumber}>{t('homepage.stories.story3.tag')}</p>
            <h2 className={styles.storyHeading}>{t('homepage.stories.story3.title')}</h2>
            <p className={styles.storyBody}>
              {t('homepage.stories.story3.body')}
            </p>
          </div>

          <div className={styles.storyCardVisual}>
            <div className={styles.financeLabel}>
              {t('homepage.stories.story3.revenueLabel')}
            </div>
            <div className={styles.financeAmount}>
              148 500 000 <span className={styles.financeAmountUnit}>UZS</span>
            </div>
            <div className={styles.financeProgressTrack}>
              <div style={{ width: '65%', background: 'var(--color-mint)' }} />
              <div style={{ width: '20%', background: 'var(--color-cyan)' }} />
              <div style={{ width: '15%', background: '#F59E0B' }} />
            </div>
            <div className={styles.financeBreakdown}>
              <span>Payme/Click: 65%</span>
              <span>Uzcard/Humo: 20%</span>
              <span>{isEn ? 'Cash: 15%' : 'Naqd: 15%'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATS SECTION */}
      <section ref={statsRef} className={`${styles.statsSection} ${statsInView ? 'revealed' : 'reveal'}`} id="stats">
        <div className={styles.statsGrid}>
          <div>
            <div className={`${styles.statNum} ${styles.statCyan}`}>
              <AnimatedCounter value={t('homepage.stats.clinics')} />
            </div>
            <div className={styles.statLabel}>{t('homepage.stats.clinicsLabel')}</div>
          </div>
          <div>
            <div className={styles.statNum}>
              <AnimatedCounter value={t('homepage.stats.cards')} />
            </div>
            <div className={styles.statLabel}>{t('homepage.stats.cardsLabel')}</div>
          </div>
          <div>
            <div className={`${styles.statNum} ${styles.statCyan}`}>
              <AnimatedCounter value={t('homepage.stats.uptime')} />
            </div>
            <div className={styles.statLabel}>{t('homepage.stats.uptimeLabel')}</div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION (GateDent-inspired & Simplified) */}
      <section ref={pricingRef} className={`${styles.pricingSection} ${pricingInView ? 'revealed' : 'reveal'}`} id="pricing">
        <p className={styles.storyNumber}>{t('homepage.pricing.tag')}</p>
        <h2 className={styles.storyHeading}>{t('homepage.pricing.heading')}</h2>
        <p className={styles.heroSubhead} style={{ fontSize: '16px', marginTop: '10px' }}>
          {t('homepage.pricing.subheading')}
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className={styles.billingSwitcherWrapper}>
          <span className={`${styles.switcherLabel} ${!isAnnual ? styles.switcherLabelActive : ''}`}>
            {t('homepage.pricing.monthly')}
          </span>
          <button
            type="button"
            className={`${styles.switcherToggle} ${isAnnual ? styles.switcherToggleActive : ''}`}
            onClick={() => setIsAnnual(!isAnnual)}
            title={isEn ? "Toggle annual or monthly billing" : "Yillik yoki oylik to'lovni tanlash"}
            aria-label="Toggle annual or monthly billing"
          >
            <span className={styles.switcherThumb} />
          </button>
          <span className={`${styles.switcherLabel} ${isAnnual ? styles.switcherLabelActive : ''}`}>
            {t('homepage.pricing.annual')}
          </span>
          <span className={styles.annualDiscountBadge}>
            {t('homepage.pricing.annualBadge')}
          </span>
        </div>

        {/* 4 Pricing Tiers */}
        <div className={styles.pricingGrid}>
          {/* Plan 1: Standard */}
          <div className={`${styles.priceCard} ${pricingInView ? 'revealed' : 'reveal'} stagger1`}>
            <div>
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>Standard</h3>
                <p className={styles.planSubhead}>
                  {isEn ? "Ideal for solo practitioners and boutique operatories." : "Yakka tartibdagi amaliyot va kichik kabinetlar uchun."}
                </p>
              </div>
              <div className={styles.planPrice}>
                {isAnnual ? '280 000' : '350 000'} <span className={styles.planPeriod}>{t('homepage.pricing.perMonth')}</span>
              </div>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? '1 Practitioner' : '1 ta Shifokor'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? '2 Core Modules (EMR + Calendar)' : '2 ta Modul (Karta + Taqvim)'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? 'Digital Dental Chart' : 'Raqamli tish xaritasi'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="cancel" size={18} className={styles.featureIconCross} />
                  <span className={styles.featureDisabledText}>{isEn ? 'Automated SMS Reminders' : 'SMS avto-eslatmalar'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="cancel" size={18} className={styles.featureIconCross} />
                  <span className={styles.featureDisabledText}>{isEn ? 'Patient Dossier & Radiographs' : 'Bemor hujjatlari & Rentgen'}</span>
                </li>
              </ul>
            </div>
            <Link to="/signup" className={`${styles.planBtn} ${styles.planBtnOutline}`}>
              {t('homepage.pricing.startBtn')}
            </Link>
          </div>

          {/* Plan 2: Premium */}
          <div className={`${styles.priceCard} ${pricingInView ? 'revealed' : 'reveal'} stagger2`}>
            <div>
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>Premium</h3>
                <p className={styles.planSubhead}>
                  {isEn ? "Expanded capabilities for growing practices." : "Kengaytirilgan imkoniyatlar va o'rta klinikalar uchun."}
                </p>
              </div>
              <div className={styles.planPrice}>
                {isAnnual ? '600 000' : '750 000'} <span className={styles.planPeriod}>{t('homepage.pricing.perMonth')}</span>
              </div>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? '1 - 3 Practitioners' : '1 - 3 ta Shifokor'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? 'All 9 Modules Fully Active' : '9 ta Modul to\'liq faol'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? '150 SMS / mo' : '150 ta SMS / oy'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? '150 Patient Files / mo' : '150 ta Bemor hujjati / oy'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? 'Practice Analytics & Financials' : 'KPI va moliyaviy hisobot'}</span>
                </li>
              </ul>
            </div>
            <Link to="/signup" className={`${styles.planBtn} ${styles.planBtnOutline}`}>
              {t('homepage.pricing.startBtn')}
            </Link>
          </div>

          {/* Plan 3: VIP (Featured) */}
          <div className={`${styles.priceCard} ${styles.priceCardFeatured} ${pricingInView ? 'revealed' : 'reveal'} stagger3`}>
            <span className={styles.popularBadge}>{t('homepage.pricing.popularBadge')}</span>
            <div>
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>VIP</h3>
                <p className={styles.planSubhead}>
                  {isEn ? "All modules, high volume limits, and 24/7 dedicated support." : "Barcha modullar, yuqori limitlar va 24/7 jonli yordam."}
                </p>
              </div>
              <div className={`${styles.planPrice} ${styles.planPriceCyan}`}>
                {isAnnual ? '1 120 000' : '1 400 000'} <span className={styles.planPeriod}>{t('homepage.pricing.perMonth')}</span>
              </div>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? '1 Doctor + 1 Assistant' : '1 Shifokor + 1 Assistent'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? 'All Modules Fully Active' : 'Barcha modullar to\'liq faol'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span className={styles.featureHighlightedChip}>{isEn ? '350 SMS / mo' : '350 ta SMS / oy'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? '600 Patient Files / mo' : '600 ta Bemor hujjati / oy'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? '24/7 Dedicated Live Support' : '24/7 Jonli qo\'llab-quvvatlash'}</span>
                </li>
              </ul>
            </div>
            <Link to="/signup" className={`${styles.planBtn} ${styles.planBtnPrimary}`}>
              {t('homepage.pricing.selectVip')}
            </Link>
          </div>

          {/* Plan 4: Enterprise */}
          <div className={`${styles.priceCard} ${pricingInView ? 'revealed' : 'reveal'} stagger4`}>
            <span className={styles.customBadge}>Custom</span>
            <div>
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>Enterprise</h3>
                <p className={styles.planSubhead}>
                  {isEn ? "Tailored for multi-chair clinics and hospital networks." : "Katta klinika va filiallar tarmog'i uchun maxsus reja."}
                </p>
              </div>
              <div className={styles.planPrice} style={{ fontSize: '24px' }}>
                {t('homepage.pricing.customPrice')}
              </div>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? 'Practitioner seats — tailored' : 'Shifokorlar soni — kelishuv asosida'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? 'SMS volume — custom quota' : 'SMS limiti — kelishuv asosida'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? 'Patient files & X-rays — unlimited' : 'Bemor hujjati & Rentgen — cheksiz'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? '1C, Payme, Click & custom API' : '1C, Payme, Click integratsiyasi'}</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>{isEn ? 'Dedicated account rep & SLA' : 'Shaxsiy menejer va SLA kafolati'}</span>
                </li>
              </ul>
            </div>
            <a href="#contact" className={`${styles.planBtn} ${styles.planBtnOutline}`}>
              {t('homepage.pricing.contactUs')}
            </a>
          </div>
        </div>

        {/* Clinical Trust & Regulatory Signals Bar */}
        <div className={styles.trustBar}>
          <div className={styles.trustItem}>
            <div className={styles.trustIconBox}>
              <Icon name="health_and_safety" size={20} />
            </div>
            <div>
              <div className={styles.trustItemTitle}>{t('homepage.pricing.trustSignals.ssvTitle')}</div>
              <div className={styles.trustItemSub}>{t('homepage.pricing.trustSignals.ssvSub')}</div>
            </div>
          </div>

          <div className={styles.trustItem}>
            <div className={styles.trustIconBox}>
              <Icon name="verified_user" size={20} />
            </div>
            <div>
              <div className={styles.trustItemTitle}>{t('homepage.pricing.trustSignals.lawTitle')}</div>
              <div className={styles.trustItemSub}>{t('homepage.pricing.trustSignals.lawSub')}</div>
            </div>
          </div>

          <div className={styles.trustItem}>
            <div className={styles.trustIconBox}>
              <Icon name="lock" size={20} />
            </div>
            <div>
              <div className={styles.trustItemTitle}>{t('homepage.pricing.trustSignals.sslTitle')}</div>
              <div className={styles.trustItemSub}>{t('homepage.pricing.trustSignals.sslSub')}</div>
            </div>
          </div>

          <div className={styles.trustItem}>
            <div className={styles.trustIconBox}>
              <Icon name="credit_card_off" size={20} />
            </div>
            <div>
              <div className={styles.trustItemTitle}>{t('homepage.pricing.trustSignals.trialTitle')}</div>
              <div className={styles.trustItemSub}>{t('homepage.pricing.trustSignals.trialSub')}</div>
            </div>
          </div>
        </div>

        {/* Compare Plans Table (GateDent-style) */}
        <div ref={compareRef} className={`${styles.compareSection} ${compareInView ? 'revealed' : 'reveal'}`} id="compare">
          <p className={styles.storyNumber}>{t('homepage.compare.tag')}</p>
          <h2 className={styles.storyHeading}>{t('homepage.compare.heading')}</h2>
          <p className={styles.heroSubhead} style={{ fontSize: '15px', marginTop: '8px' }}>
            {t('homepage.compare.subheading')}
          </p>

          <div className={styles.compareTableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th className={styles.compareThFeature}>{t('homepage.compare.featureCol')}</th>
                  <th className={styles.compareThTier}>Standard</th>
                  <th className={styles.compareThTier}>Premium</th>
                  <th className={`${styles.compareThTier} ${styles.compareThVip}`}>VIP 👑</th>
                  <th className={styles.compareThTier}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.compareCategoryRow}>
                  <td colSpan="5">{isEn ? 'Practice Management & Staff' : 'Boshqaruv & Foydalanuvchilar'}</td>
                </tr>
                <tr>
                  <td>{isEn ? 'Staff accounts & operatory chairs' : 'Foydalanuvchilar va kreslolar soni'}</td>
                  <td className={styles.compareTdValue}>{isEn ? '1 Practitioner' : '1 Shifokor'}</td>
                  <td className={styles.compareTdValue}>{isEn ? 'Up to 3' : '3 tagacha'}</td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>{isEn ? '1 Doctor + 2 Assistants' : '1 Shifokor + 2 Assistent'}</td>
                  <td className={styles.compareTdValue}>{isEn ? 'Unlimited' : 'Cheksiz'}</td>
                </tr>
                <tr>
                  <td>{isEn ? 'Digital Patient Record (Form 043/h)' : 'Elektron bemor kartasi (043/h shakl)'}</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>
                <tr>
                  <td>{isEn ? 'Smart scheduler & operatory calendar' : 'Aqlli taqvim va kreslolar grafigi'}</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>

                <tr className={styles.compareCategoryRow}>
                  <td colSpan="5">{isEn ? 'Clinical Charting & Odontogram' : 'Klinik Imkoniyatlar & Odontogramma'}</td>
                </tr>
                <tr>
                  <td>{isEn ? 'FDI Odontogram (5 anatomic surfaces)' : 'FDI Odontogramma (5 ta anatomik yuza)'}</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>
                <tr>
                  <td>{isEn ? 'Phased treatment plans & estimates' : 'Davolash rejalari va bosqichli smeta'}</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>
                <tr>
                  <td>{isEn ? 'Dental lab work orders & tracking' : 'Tish texnik laboratoriya buyurtmalari'}</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>

                <tr className={styles.compareCategoryRow}>
                  <td colSpan="5">{isEn ? 'Documents & Radiograph Archive' : 'Hujjatlar & Rentgen Arxiv'}</td>
                </tr>
                <tr>
                  <td>Rentgen (OPG, Bitewing) & 3D CBCT</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}>{isEn ? '150 / mo' : '150 ta / oy'}</td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>{isEn ? '600 / mo' : '600 ta / oy'}</td>
                  <td className={styles.compareTdValue}>{isEn ? 'Unlimited' : 'Cheksiz'}</td>
                </tr>
                <tr>
                  <td>{isEn ? 'Official PDF export & receipt printing' : 'PDF eksport va Kvitansiya (Chek) chop etish'}</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>

                <tr className={styles.compareCategoryRow}>
                  <td colSpan="5">{isEn ? 'SMS & Automated Notifications' : 'SMS & Bildirishnomalar'}</td>
                </tr>
                <tr>
                  <td>{isEn ? 'Automated SMS reminders & greetings' : 'SMS avto-eslatmalar va tabriklar'}</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}>{isEn ? '150 / mo' : '150 ta / oy'}</td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>{isEn ? '350 / mo' : '350 ta / oy'}</td>
                  <td className={styles.compareTdValue}>{isEn ? 'Custom' : 'Kelishuv asosida'}</td>
                </tr>
                <tr>
                  <td>{isEn ? 'Reschedule & cancellation alerts' : 'Qabulni o\'zgartirish va bekor qilish xabari'}</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>

                <tr className={styles.compareCategoryRow}>
                  <td colSpan="5">{isEn ? 'Finance, Analytics & Support' : 'Moliya & Qo\'llab-quvvatlash'}</td>
                </tr>
                <tr>
                  <td>{isEn ? 'Financial reporting & cash registers' : 'Moliyaviy hisobotlar va kassa balansi'}</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>
                <tr>
                  <td>{isEn ? 'Practitioner compensation & KPI calculation' : 'Shifokorlar oylik ulushi va KPI hisobi'}</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>
                <tr>
                  <td>{isEn ? '24/7 Dedicated support & account rep' : '24/7 Jonli tezkor yordam & Shaxsiy menejer'}</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing FAQ Section */}
        <div ref={faqRef} className={`${styles.faqSection} ${faqInView ? 'revealed' : 'reveal'}`} id="faq">
          <p className={styles.storyNumber}>{t('homepage.faq.tag')}</p>
          <h2 className={styles.storyHeading}>{t('homepage.faq.heading')}</h2>
          <p className={styles.heroSubhead} style={{ fontSize: '15px', marginTop: '8px' }}>
            {t('homepage.faq.subheading')}
          </p>

          <div className={styles.faqList}>
            <div className={`${styles.faqItem} ${faqInView ? 'revealed' : 'reveal'} stagger1 ${openFaq === 0 ? styles.faqItemOpen : ''}`}>
              <button
                type="button"
                className={styles.faqQuestionBtn}
                onClick={() => toggleFaq(0)}
                aria-expanded={openFaq === 0}
                aria-controls="faq-answer-0"
              >
                <span className={styles.faqQuestionText}>
                  {isEn
                    ? "Is a credit card required for the 14-day free trial?"
                    : "14 kunlik bepul sinov davrida bank kartasi kiritish shartmi?"}
                </span>
                <Icon name="expand_more" size={20} className={`${styles.faqToggleIcon} ${openFaq === 0 ? styles.faqToggleIconOpen : ""}`} />
              </button>
              {openFaq === 0 && (
                <div className={styles.faqAnswer} id="faq-answer-0" role="region">
                  {isEn
                    ? "No, absolutely not! All modules and features are fully unlocked for 14 days immediately upon signing up. No payment card details or purchase obligations are required."
                    : "Yo'q, mutlaqo shart emas! Ro'yxatdan o'tganingizdan so'ng darhol barcha modullar 14 kun davomida to'liq ochiladi. Hech qanday karta raqami yoki to'lov majburiyati yuklanmaydi."}
                </div>
              )}
            </div>

            <div className={`${styles.faqItem} ${faqInView ? 'revealed' : 'reveal'} stagger2 ${openFaq === 1 ? styles.faqItemOpen : ''}`}>
              <button
                type="button"
                className={styles.faqQuestionBtn}
                onClick={() => toggleFaq(1)}
                aria-expanded={openFaq === 1}
                aria-controls="faq-answer-1"
              >
                <span className={styles.faqQuestionText}>
                  {isEn
                    ? "Do you assist with data migration from Excel or other legacy software?"
                    : "Boshqa dasturdan yoki Excel jadvallaridan ma'lumotlarni ko'chirishda yordam berasizmi?"}
                </span>
                <Icon name="expand_more" size={20} className={`${styles.faqToggleIcon} ${openFaq === 1 ? styles.faqToggleIconOpen : ""}`} />
              </button>
              {openFaq === 1 && (
                <div className={styles.faqAnswer} id="faq-answer-1" role="region">
                  {isEn
                    ? "Yes, definitely! Our technical onboarding team will securely and quickly migrate your patient rosters, phone numbers, and clinical history into DentUz completely free of charge."
                    : "Albatta! Bizning professional texnik ko'mak jamoamiz bemorlaringiz bazasini, telefon raqamlarni va klinik ma'lumotlarni bepul, tez va xavfsiz tarzda DentUz tizimiga import qilib beradi."}
                </div>
              )}
            </div>

            <div className={`${styles.faqItem} ${faqInView ? 'revealed' : 'reveal'} stagger3 ${openFaq === 2 ? styles.faqItemOpen : ''}`}>
              <button
                type="button"
                className={styles.faqQuestionBtn}
                onClick={() => toggleFaq(2)}
                aria-expanded={openFaq === 2}
                aria-controls="faq-answer-2"
              >
                <span className={styles.faqQuestionText}>
                  {isEn
                    ? "Can we upgrade, downgrade, or cancel our subscription at any time?"
                    : "Tarifni keyinchalik o'zgartirish yoki bekor qilish mumkinmi?"}
                </span>
                <Icon name="expand_more" size={20} className={`${styles.faqToggleIcon} ${openFaq === 2 ? styles.faqToggleIconOpen : ""}`} />
              </button>
              {openFaq === 2 && (
                <div className={styles.faqAnswer} id="faq-answer-2" role="region">
                  {isEn
                    ? "Yes, you can upgrade, adjust, or cancel your subscription anytime via your clinic settings. Choosing annual billing also automatically unlocks 2 free months (20% discount)."
                    : "Ha, istalgan payt shaxsiy kabinet orqali tarifingizni oshirishingiz yoki bekor qilishingiz mumkin. Yillik to'lovga o'tganingizda esa avtomatik 2 oy bepul foydalanasiz (20% tejash)."}
                </div>
              )}
            </div>

            <div className={`${styles.faqItem} ${faqInView ? 'revealed' : 'reveal'} stagger4 ${openFaq === 3 ? styles.faqItemOpen : ''}`}>
              <button
                type="button"
                className={styles.faqQuestionBtn}
                onClick={() => toggleFaq(3)}
                aria-expanded={openFaq === 3}
                aria-controls="faq-answer-3"
              >
                <span className={styles.faqQuestionText}>
                  {isEn
                    ? "How is patient data secured and backed up?"
                    : "Ma'lumotlarimiz xavfsizligi va zaxira nusxalari qanday saqlanadi?"}
                </span>
                <Icon name="expand_more" size={20} className={`${styles.faqToggleIcon} ${openFaq === 3 ? styles.faqToggleIconOpen : ""}`} />
              </button>
              {openFaq === 3 && (
                <div className={styles.faqAnswer} id="faq-answer-3" role="region">
                  {isEn
                    ? "All data is securely hosted within modern Uzbekistan data centers, fully compliant with national data protection regulations (Law No. 547) and encrypted with 256-bit SSL. Backups are performed automatically every night."
                    : "Barcha ma'lumotlar O'zbekiston hududidagi zamonaviy serverlarda O'zR \"Shaxsiy ma'lumotlar to'g'risida\"gi (O'RQ-547) qonuni talablari asosida 256-bit SSL bilan shifrlanadi. Har kecha avtomatik zaxira nusxalash (backup) amalga oshiriladi."}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 10. CONTACT SECTION (GATE DENT INSPIRED) */}
      <section ref={contactRef} className={`${styles.contactSection} ${contactInView ? 'revealed' : 'reveal'}`} id="contact">
        <div className={styles.contactHeader}>
          <div className={styles.contactBadge}>
            <Icon name="support_agent" size={18} />
            <span>{t('homepage.contact.badge')}</span>
          </div>
          <h2 className={styles.contactTitle}>
            {t('homepage.contact.title')}
          </h2>
          <p className={styles.contactSubtitle}>
            {t('homepage.contact.subtitle')}
          </p>
        </div>

        <div className={styles.contactGrid}>
          {/* Left Card: Office Locations and Direct Info */}
          <div className={`${styles.contactInfoCard} ${contactInView ? 'revealed' : 'reveal'} stagger1`}>
            <h3 className={styles.contactCardTitle}>
              <Icon name="apartment" size={26} style={{ color: "var(--color-cyan)" }} />
              {t('homepage.contact.infoTitle')}
            </h3>
            <p className={styles.contactCardSub}>
              {t('homepage.contact.infoSub')}
            </p>

            <div className={styles.contactOfficesWrapper}>
              <div className={styles.contactOfficeBlock}>
                <div className={styles.officeHeader}>
                  <div className={styles.officeName}>
                    <Icon name="location_on" size={18} style={{ color: 'var(--color-cyan)' }} />
                    <span>{t('homepage.contact.tashkentOffice')}</span>
                  </div>
                  <span className={styles.officeRegionBadge}>{t('homepage.contact.tashkentBadge')}</span>
                </div>
                <div className={styles.officeAddress}>
                  {t('homepage.contact.tashkentAddr')}
                </div>
                <div className={styles.officeHours}>
                  <Icon name="schedule" size={14} />
                  <span>{isEn ? 'Mon - Sat: 09:00 - 19:00' : 'Dush - Shan: 09:00 - 19:00'}</span>
                </div>
              </div>

              <div className={styles.contactOfficeBlock}>
                <div className={styles.officeHeader}>
                  <div className={styles.officeName}>
                    <Icon name="location_on" size={18} style={{ color: 'var(--color-cyan)' }} />
                    <span>{t('homepage.contact.samarkandOffice')}</span>
                  </div>
                  <span className={styles.officeRegionBadge}>{t('homepage.contact.samarkandBadge')}</span>
                </div>
                <div className={styles.officeAddress}>
                  {t('homepage.contact.samarkandAddr')}
                </div>
                <div className={styles.officeHours}>
                  <Icon name="schedule" size={14} />
                  <span>{isEn ? 'Mon - Fri: 09:00 - 18:00' : 'Dush - Juma: 09:00 - 18:00'}</span>
                </div>
              </div>
            </div>

            <div className={styles.contactDetailsList}>
              <div className={styles.contactDetailItem}>
                <div className={styles.contactIconCircle}>
                  <Icon name="call" size={20} />
                </div>
                <div className={styles.contactDetailContent}>
                  <span className={styles.contactDetailLabel}>{t('homepage.contact.phoneCenter')}</span>
                  <a href="tel:+998712008855" className={styles.contactDetailLink}>+998 71 200 88 55</a>
                  <span className={styles.contactDetailSub}>{t('homepage.contact.phoneCenterSub')}</span>
                </div>
              </div>

              <div className={styles.contactDetailItem}>
                <div className={styles.contactIconCircle}>
                  <Icon name="mail" size={20} />
                </div>
                <div className={styles.contactDetailContent}>
                  <span className={styles.contactDetailLabel}>{t('homepage.contact.emailLabel')}</span>
                  <a href="mailto:info@dentuz.uz" className={styles.contactDetailLink}>info@dentuz.uz</a>
                  <span className={styles.contactDetailSub}>{t('homepage.contact.emailSub')}</span>
                </div>
              </div>

              <div className={styles.contactDetailItem}>
                <div className={styles.contactIconCircle}>
                  <Icon name="send" size={20} />
                </div>
                <div className={styles.contactDetailContent}>
                  <span className={styles.contactDetailLabel}>{t('homepage.contact.telegramLabel')}</span>
                  <a href="https://t.me/dentuz_support" target="_blank" rel="noopener noreferrer" className={styles.contactDetailLink}>@dentuz_support</a>
                  <span className={styles.contactDetailSub}>{t('homepage.contact.telegramSub')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Interactive Contact Form */}
          <div className={`${styles.contactFormCard} ${contactInView ? 'revealed' : 'reveal'} stagger2`}>
            <h3 className={styles.contactCardTitle}>
              <Icon name="edit_note" size={26} style={{ color: "var(--color-cyan)" }} />
              {t('homepage.contact.formTitle')}
            </h3>
            <p className={styles.contactCardSub}>
              {t('homepage.contact.formSub')}
            </p>

            {contactSubmitted ? (
              <div className={styles.contactSuccessAlert}>
                <div className={styles.successIconBadge}>
                  <Icon name="check_circle" size={20} />
                </div>
                <div className={styles.successTitle}>{t('homepage.contact.successTitle')}</div>
                <p className={styles.successMessage}>
                  {isEn ? (
                    <>Thank you, <strong>{contactForm.fullName || 'Valued Doctor'}</strong>. Our representative will contact you shortly by phone.</>
                  ) : (
                    <>Rahmat, <strong>{contactForm.fullName || 'Hurmatli foydalanuvchi'}</strong>. Mutaxassisimiz tez orada siz bilan telefon orqali bog'lanadi.</>
                  )}
                </p>
                <button
                  type="button"
                  className={styles.successResetBtn}
                  onClick={() => {
                    setContactSubmitted(false);
                    setContactForm({
                      fullName: '',
                      phone: '',
                      email: '',
                      subject: isEn ? 'Free Demo Walkthrough' : 'Bepul demo taqdimot',
                      message: ''
                    });
                  }}
                >
                  {t('homepage.contact.newMsgBtn')}
                </button>
              </div>
            ) : (
              <form className={styles.contactForm} onSubmit={handleContactSubmit}>
                <div className={styles.formRowTwo}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel} htmlFor="contactName">{t('homepage.contact.nameLabel')}</label>
                    <input
                      id="contactName"
                      type="text"
                      className={styles.formInput}
                      placeholder={t('homepage.contact.namePlaceholder')}
                      required
                      value={contactForm.fullName}
                      onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel} htmlFor="contactPhone">{t('homepage.contact.phoneLabel')}</label>
                    <input
                      id="contactPhone"
                      type="tel"
                      className={styles.formInput}
                      placeholder="+998 (90) 123-45-67"
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formRowTwo}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel} htmlFor="contactEmail">{t('homepage.contact.emailInputLabel')}</label>
                    <input
                      id="contactEmail"
                      type="email"
                      className={styles.formInput}
                      placeholder={t('homepage.contact.emailInputPlaceholder')}
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel} htmlFor="contactSubject">{t('homepage.contact.subjectLabel')}</label>
                    <select
                      id="contactSubject"
                      className={styles.formSelect}
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    >
                      <option value="Bepul demo taqdimot">{isEn ? 'Free Demo Walkthrough' : 'Bepul demo taqdimot'}</option>
                      <option value="Tariflar va to'lov">{isEn ? 'Pricing & Billing Plans' : 'Tariflar va to\'lov'}</option>
                      <option value="Texnik yordam">{isEn ? 'Technical Support & Setup' : 'Texnik yordam va o\'rnatish'}</option>
                      <option value="Hamkorlik va integratsiya">{isEn ? 'Partnership & API Integration' : 'Hamkorlik va integratsiya'}</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel} htmlFor="contactMessage">{t('homepage.contact.messageLabel')}</label>
                  <textarea
                    id="contactMessage"
                    className={styles.formTextarea}
                    placeholder={t('homepage.contact.messagePlaceholder')}
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </div>

                <button type="submit" className={styles.contactSubmitBtn}>
                  <span>{t('homepage.contact.sendBtn')}</span>
                  <Icon name="send" size={18} />
                </button>

                <p className={styles.formFootnote}>
                  {t('homepage.contact.privacyFootnote')}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
