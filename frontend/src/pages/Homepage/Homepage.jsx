import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Homepage.module.css';
import Icon from '../../components/Icon/Icon';

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

export default function Homepage() {
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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const currentDesc =
    TOOTH_DESCRIPTIONS[selectedTooth] || `Tish #${selectedTooth} • Sog'lom holatda`;

  return (
    <main id="main-content">
      {/* 2. HERO SECTION */}
      <section className={styles.heroSection} aria-label="Asosiy sahifa - Klinikangiz uchun mukammal tizim">
        <h1 className={styles.heroHeadline}>
          Klinikangiz uchun yagona, mukammal tizim.
        </h1>
        <p className={styles.heroSubhead}>
          Qog'oz jurnallar va chalkash jadvallardan xalos bo'ling. Raqamli stomatologiyaning yangi standarti.
        </p>

        <div className={styles.heroActions}>
          <Link to="/signup" className={styles.primaryCta}>
            14 kunlik bepul sinov
          </Link>
          <a href="#features" className={styles.secondaryCta}>
            <span>Namoyishni ko'rish</span>
            <span style={{ transition: 'transform 0.2s ease' }}>→</span>
          </a>
        </div>

        {/* Hero Visual: Apple-style Odontogram Canvas */}
        <div className={styles.heroCanvasWrapper}>
          <div className={styles.heroCanvasCard}>
            <div className={styles.canvasTop}>
              <div>
                <p className={styles.canvasTag}>FDI Odontogramma</p>
                <p className={styles.canvasTitle}>Raqamli tish xaritasi</p>
              </div>
              <div className={styles.canvasLegend}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#CBD5E1' }} />
                  Sog'lom
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--color-cyan)' }} />
                  Tanlangan
                </span>
              </div>
            </div>

            {/* The Dental Arch Silhouette Grid */}
            <div className={styles.archGrid}>
              {/* Upper Jaw */}
              <div>
                <div className={styles.archRowHeader}>
                  <span>Yuqori jag'</span>
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
                        aria-label={`Tish ${tooth}${isSelected ? ' - tanlangan' : isTreated ? ' - davolangan' : ' - sog\'lom'}`}
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
                  <span>Pastki jag'</span>
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
                        aria-label={`Tish ${tooth}${isSelected ? ' - tanlangan' : isTreated ? ' - davolangan' : ' - sog\'lom'}`}
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

      {/* 3. FEATURE STORYTELLING SECTIONS */}
      {/* Story 1: Smart Taqvim */}
      <section className={styles.storySection} id="features">
        <div className={styles.storyGrid}>
          <div>
            <p className={styles.storyNumber}>01 / Rejalashtirish</p>
            <h2 className={styles.storyHeading}>Vaqtni daqiqasigacha hisoblang.</h2>
            <p className={styles.storyBody}>
              Shifokorlar bandligi va kreslolar grafigini bir harakat bilan boshqaring — barcha qabullar bir qarashda.
            </p>
          </div>

          <div className={styles.storyCardVisual}>
            <div className={styles.scheduleHeader}>
              <span className={styles.scheduleHeaderTitle}>Bugun, 24-May</span>
              <span className={styles.scheduleHeaderMeta}>3 ta faol kreslo</span>
            </div>
            <div className={styles.scheduleList}>
              <div className={styles.scheduleItem}>
                <span className={styles.scheduleTime}>09:00</span>
                <div className={styles.scheduleInfo}>
                  <div className={styles.scheduleDoctor}>Dr. Azimov • Karies davolash</div>
                  <div className={styles.schedulePatient}>Bemor: Anvar Qosimov</div>
                </div>
                <span className={styles.scheduleBadgeDone}>Yakunlandi</span>
              </div>
              <div className={`${styles.scheduleItem} ${styles.scheduleItemActive}`}>
                <span className={`${styles.scheduleTime} ${styles.scheduleTimeActive}`}>14:00</span>
                <div className={styles.scheduleInfo}>
                  <div className={styles.scheduleDoctor}>Dr. Saidova • Air-Flow tozalash</div>
                  <div className={styles.schedulePatient}>Bemor: Nilufar Rahimova</div>
                </div>
                <span className={styles.scheduleBadgeProgress}>Jarayonda</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story 2: Bemorlar tarixi */}
      <div className={styles.storySectionAltWrapper}>
        <section className={styles.storySection}>
          <div className={`${styles.storyGrid} ${styles.storyGridReverse}`}>
            <div className={styles.storyCardVisual}>
              <div className={styles.patientProfileHeader}>
                <div className={styles.patientAvatar}>
                  AQ
                </div>
                <div>
                  <div className={styles.patientName}>Anvar Qosimov</div>
                  <div className={styles.patientMeta}>ID: #P-1042 • 34 yosh</div>
                </div>
              </div>
              <div className={styles.allergyAlert}>
                <Icon name="warning" size={16} />
                <span>Allergiya: Penitsillin</span>
              </div>
              <div className={styles.patientTreatmentNote}>
                Oxirgi muolaja: Tish #16 endodontiya va ildiz kanallari tozalash.
              </div>
            </div>

            <div>
              <p className={styles.storyNumber}>02 / Bemorlar tarixi</p>
              <h2 className={styles.storyHeading}>Har bir bemor bitta varaqda.</h2>
              <p className={styles.storyBody}>
                Rentgen tasvirlari, davolash rejasi, to'lovlar va tishlar xaritasi yagona profil ostida jamlangan.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Story 3: Moliyaviy intizom */}
      <section className={styles.storySection}>
        <div className={styles.storyGrid}>
          <div>
            <p className={styles.storyNumber}>03 / Moliyaviy intizom</p>
            <h2 className={styles.storyHeading}>Har bir tiyin hisobda.</h2>
            <p className={styles.storyBody}>
              Payme, Click, Uzcard va naqd to'lovlar avtomatik yuritiladi. Shifokorlar oylik ulushi soniyalar ichida hisoblanadi.
            </p>
          </div>

          <div className={styles.storyCardVisual}>
            <div className={styles.financeLabel}>
              Oylik tushum ko'rsatkichi
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
              <span>Naqd: 15%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATS SECTION */}
      <section className={styles.statsSection} id="stats">
        <div className={styles.statsGrid}>
          <div>
            <div className={`${styles.statNum} ${styles.statCyan}`}>120+</div>
            <div className={styles.statLabel}>O'zbekistondagi yetakchi klinikalar</div>
          </div>
          <div>
            <div className={styles.statNum}>45 000+</div>
            <div className={styles.statLabel}>Raqamlashtirilgan bemor kartalari</div>
          </div>
          <div>
            <div className={`${styles.statNum} ${styles.statCyan}`}>99.9%</div>
            <div className={styles.statLabel}>Ishonchli va xavfsiz tizim</div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION (GateDent-inspired & Simplified) */}
      <section className={styles.pricingSection} id="pricing">
        <p className={styles.storyNumber}>Tariflar</p>
        <h2 className={styles.storyHeading}>Stomatologiya dasturi tariflari</h2>
        <p className={styles.heroSubhead} style={{ fontSize: '16px', marginTop: '10px' }}>
          Har qanday byudjet va talabga mos keluvchi sodda yechimlar.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className={styles.billingSwitcherWrapper}>
          <span className={`${styles.switcherLabel} ${!isAnnual ? styles.switcherLabelActive : ''}`}>
            Oylik
          </span>
          <button
            type="button"
            className={`${styles.switcherToggle} ${isAnnual ? styles.switcherToggleActive : ''}`}
            onClick={() => setIsAnnual(!isAnnual)}
            title="Yillik yoki oylik to'lovni tanlash"
            aria-label="Toggle annual or monthly billing"
          >
            <span className={styles.switcherThumb} />
          </button>
          <span className={`${styles.switcherLabel} ${isAnnual ? styles.switcherLabelActive : ''}`}>
            Yillik
          </span>
          <span className={styles.annualDiscountBadge}>
            2 OY BEPUL 🎁 (20% tejash)
          </span>
        </div>

        {/* 4 Pricing Tiers */}
        <div className={styles.pricingGrid}>
          {/* Plan 1: Standard */}
          <div className={styles.priceCard}>
            <div>
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>Standard</h3>
                <p className={styles.planSubhead}>Yakka tartibdagi amaliyot va kichik kabinetlar uchun.</p>
              </div>
              <div className={styles.planPrice}>
                {isAnnual ? '280 000' : '350 000'} <span className={styles.planPeriod}>UZS / oy</span>
              </div>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>1 ta Shifokor</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>2 ta Modul (Karta + Taqvim)</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>Raqamli tish xaritasi</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="cancel" size={18} className={styles.featureIconCross} />
                  <span className={styles.featureDisabledText}>SMS avto-eslatmalar</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="cancel" size={18} className={styles.featureIconCross} />
                  <span className={styles.featureDisabledText}>Bemor hujjatlari & Rentgen</span>
                </li>
              </ul>
            </div>
            <Link to="/signup" className={`${styles.planBtn} ${styles.planBtnOutline}`}>
              Boshlash
            </Link>
          </div>

          {/* Plan 2: Premium */}
          <div className={styles.priceCard}>
            <div>
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>Premium</h3>
                <p className={styles.planSubhead}>Kengaytirilgan imkoniyatlar va o'rta klinikalar uchun.</p>
              </div>
              <div className={styles.planPrice}>
                {isAnnual ? '600 000' : '750 000'} <span className={styles.planPeriod}>UZS / oy</span>
              </div>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>1 - 3 ta Shifokor</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>9 ta Modul to'liq faol</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>150 ta SMS / oy</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>150 ta Bemor hujjati / oy</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>KPI va moliyaviy hisobot</span>
                </li>
              </ul>
            </div>
            <Link to="/signup" className={`${styles.planBtn} ${styles.planBtnOutline}`}>
              Boshlash
            </Link>
          </div>

          {/* Plan 3: VIP (Featured) */}
          <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
            <span className={styles.popularBadge}>👑 Eng ommabop</span>
            <div>
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>VIP</h3>
                <p className={styles.planSubhead}>Barcha modullar, yuqori limitlar va 24/7 jonli yordam.</p>
              </div>
              <div className={`${styles.planPrice} ${styles.planPriceCyan}`}>
                {isAnnual ? '1 120 000' : '1 400 000'} <span className={styles.planPeriod}>UZS / oy</span>
              </div>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>1 Shifokor + 1 Assistent</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>Barcha modullar to'liq faol</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span className={styles.featureHighlightedChip}>350 ta SMS / oy</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>600 ta Bemor hujjati / oy</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>24/7 Jonli qo'llab-quvvatlash</span>
                </li>
              </ul>
            </div>
            <Link to="/signup" className={`${styles.planBtn} ${styles.planBtnPrimary}`}>
              VIP Rejani Tanlash
            </Link>
          </div>

          {/* Plan 4: Enterprise */}
          <div className={styles.priceCard}>
            <span className={styles.customBadge}>Custom</span>
            <div>
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>Enterprise</h3>
                <p className={styles.planSubhead}>Katta klinika va filiallar tarmog'i uchun maxsus reja.</p>
              </div>
              <div className={styles.planPrice} style={{ fontSize: '24px' }}>
                Kelishuv asosida
              </div>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>Shifokorlar soni — kelishuv asosida</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>SMS limiti — kelishuv asosida</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>Bemor hujjati & Rentgen — cheksiz</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>1C, Payme, Click integratsiyasi</span>
                </li>
                <li className={styles.featureItem}>
                  <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                  <span>Shaxsiy menejer va SLA kafolati</span>
                </li>
              </ul>
            </div>
            <a href="#contact" className={`${styles.planBtn} ${styles.planBtnOutline}`}>
              Biz bilan bog'lanish
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
              <div className={styles.trustItemTitle}>SSV 043/h Shakli</div>
              <div className={styles.trustItemSub}>O'zR Sog'liqni saqlash vazirligi standarti</div>
            </div>
          </div>

          <div className={styles.trustItem}>
            <div className={styles.trustIconBox}>
              <Icon name="verified_user" size={20} />
            </div>
            <div>
              <div className={styles.trustItemTitle}>O'RQ-547 Qonuni</div>
              <div className={styles.trustItemSub}>Shaxsiy ma'lumotlar to'liq himoyalangan</div>
            </div>
          </div>

          <div className={styles.trustItem}>
            <div className={styles.trustIconBox}>
              <Icon name="lock" size={20} />
            </div>
            <div>
              <div className={styles.trustItemTitle}>256-bit SSL Shifrlash</div>
              <div className={styles.trustItemSub}>Bank darajasidagi xavfsizlik va zaxira</div>
            </div>
          </div>

          <div className={styles.trustItem}>
            <div className={styles.trustIconBox}>
              <Icon name="credit_card_off" size={20} />
            </div>
            <div>
              <div className={styles.trustItemTitle}>14 Kun Bepul Sinash</div>
              <div className={styles.trustItemSub}>Bank kartasi talab qilinmaydi</div>
            </div>
          </div>
        </div>

        {/* Compare Plans Table (GateDent-style) */}
        <div className={styles.compareSection} id="compare">
          <p className={styles.storyNumber}>Taqqoslash</p>
          <h2 className={styles.storyHeading}>Rejalarni Batafsil Taqqoslash</h2>
          <p className={styles.heroSubhead} style={{ fontSize: '15px', marginTop: '8px' }}>
            Har bir tarif taqdim etadigan modullar va limitlarni batafsil ko'rib chiqing.
          </p>

          <div className={styles.compareTableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th className={styles.compareThFeature}>Imkoniyat / Modul</th>
                  <th className={styles.compareThTier}>Standard</th>
                  <th className={styles.compareThTier}>Premium</th>
                  <th className={`${styles.compareThTier} ${styles.compareThVip}`}>VIP 👑</th>
                  <th className={styles.compareThTier}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.compareCategoryRow}>
                  <td colSpan="5">Boshqaruv & Foydalanuvchilar</td>
                </tr>
                <tr>
                  <td>Foydalanuvchilar va kreslolar soni</td>
                  <td className={styles.compareTdValue}>1 Shifokor</td>
                  <td className={styles.compareTdValue}>3 tagacha</td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>1 Shifokor + 2 Assistent</td>
                  <td className={styles.compareTdValue}>Cheksiz</td>
                </tr>
                <tr>
                  <td>Elektron bemor kartasi (043/h shakl)</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>
                <tr>
                  <td>Aqlli taqvim va kreslolar grafigi</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>

                <tr className={styles.compareCategoryRow}>
                  <td colSpan="5">Klinik Imkoniyatlar & Odontogramma</td>
                </tr>
                <tr>
                  <td>FDI Odontogramma (5 ta anatomik yuza)</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>
                <tr>
                  <td>Davolash rejalari va bosqichli smeta</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>
                <tr>
                  <td>Tish texnik laboratoriya buyurtmalari</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>

                <tr className={styles.compareCategoryRow}>
                  <td colSpan="5">Hujjatlar & Rentgen Arxiv</td>
                </tr>
                <tr>
                  <td>Rentgen (OPG, Bitewing) & 3D CBCT</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}>150 ta / oy</td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>600 ta / oy</td>
                  <td className={styles.compareTdValue}>Cheksiz</td>
                </tr>
                <tr>
                  <td>PDF eksport va Kvitansiya (Chek) chop etish</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>

                <tr className={styles.compareCategoryRow}>
                  <td colSpan="5">SMS & Bildirishnomalar</td>
                </tr>
                <tr>
                  <td>SMS avto-eslatmalar va tabriklar</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}>150 ta / oy</td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>350 ta / oy</td>
                  <td className={styles.compareTdValue}>Kelishuv asosida</td>
                </tr>
                <tr>
                  <td>Qabulni o'zgartirish va bekor qilish xabari</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>

                <tr className={styles.compareCategoryRow}>
                  <td colSpan="5">Moliya & Qo'llab-quvvatlash</td>
                </tr>
                <tr>
                  <td>Moliyaviy hisobotlar va kassa balansi</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>
                <tr>
                  <td>Shifokorlar oylik ulushi va KPI hisobi</td>
                  <td className={styles.compareTdValue}><span className={styles.compareCross}>✕</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                  <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}><span className={styles.compareCheck}>✓</span></td>
                  <td className={styles.compareTdValue}><span className={styles.compareCheck}>✓</span></td>
                </tr>
                <tr>
                  <td>24/7 Jonli tezkor yordam & Shaxsiy menejer</td>
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
        <div className={styles.faqSection} id="faq">
          <p className={styles.storyNumber}>Savol-Javoblar</p>
          <h2 className={styles.storyHeading}>Ko'p beriladigan savollar</h2>
          <p className={styles.heroSubhead} style={{ fontSize: '15px', marginTop: '8px' }}>
            Narxlar, to'lov usullari va tizimdan foydalanish bo'yicha eng muhim savollarga javoblar.
          </p>

          <div className={styles.faqList}>
            <div className={`${styles.faqItem} ${openFaq === 0 ? styles.faqItemOpen : ''}`}>
              <button
                type="button"
                className={styles.faqQuestionBtn}
                onClick={() => toggleFaq(0)}
                aria-expanded={openFaq === 0}
                aria-controls="faq-answer-0"
              >
                <span className={styles.faqQuestionText}>
                  14 kunlik bepul sinov davrida bank kartasi kiritish shartmi?
                </span>
                <Icon name="expand_more" size={20} className={`${styles.faqToggleIcon} ${openFaq === 0 ? styles.faqToggleIconOpen : ""}`} />
              </button>
              {openFaq === 0 && (
                <div className={styles.faqAnswer} id="faq-answer-0" role="region">
                  Yo'q, mutlaqo shart emas! Ro'yxatdan o'tganingizdan so'ng darhol barcha modullar 14 kun davomida to'liq ochiladi. Hech qanday karta raqami yoki to'lov majburiyati yuklanmaydi.
                </div>
              )}
            </div>

            <div className={`${styles.faqItem} ${openFaq === 1 ? styles.faqItemOpen : ''}`}>
              <button
                type="button"
                className={styles.faqQuestionBtn}
                onClick={() => toggleFaq(1)}
                aria-expanded={openFaq === 1}
                aria-controls="faq-answer-1"
              >
                <span className={styles.faqQuestionText}>
                  Boshqa dasturdan yoki Excel jadvallaridan ma'lumotlarni ko'chirishda yordam berasizmi?
                </span>
                <Icon name="expand_more" size={20} className={`${styles.faqToggleIcon} ${openFaq === 1 ? styles.faqToggleIconOpen : ""}`} />
              </button>
              {openFaq === 1 && (
                <div className={styles.faqAnswer} id="faq-answer-1" role="region">
                  Albatta! Bizning professional texnik ko'mak jamoamiz bemorlaringiz bazasini, telefon raqamlarni va klinik ma'lumotlarni bepul, tez va xavfsiz tarzda DentUz tizimiga import qilib beradi.
                </div>
              )}
            </div>

            <div className={`${styles.faqItem} ${openFaq === 2 ? styles.faqItemOpen : ''}`}>
              <button
                type="button"
                className={styles.faqQuestionBtn}
                onClick={() => toggleFaq(2)}
                aria-expanded={openFaq === 2}
                aria-controls="faq-answer-2"
              >
                <span className={styles.faqQuestionText}>
                  Tarifni keyinchalik o'zgartirish yoki bekor qilish mumkinmi?
                </span>
                <Icon name="expand_more" size={20} className={`${styles.faqToggleIcon} ${openFaq === 2 ? styles.faqToggleIconOpen : ""}`} />
              </button>
              {openFaq === 2 && (
                <div className={styles.faqAnswer} id="faq-answer-2" role="region">
                  Ha, istalgan payt shaxsiy kabinet orqali tarifingizni oshirishingiz yoki bekor qilishingiz mumkin. Yillik to'lovga o'tganingizda esa avtomatik 2 oy bepul foydalanasiz (20% tejash).
                </div>
              )}
            </div>

            <div className={`${styles.faqItem} ${openFaq === 3 ? styles.faqItemOpen : ''}`}>
              <button
                type="button"
                className={styles.faqQuestionBtn}
                onClick={() => toggleFaq(3)}
                aria-expanded={openFaq === 3}
                aria-controls="faq-answer-3"
              >
                <span className={styles.faqQuestionText}>
                  Ma'lumotlarimiz xavfsizligi va zaxira nusxalari qanday saqlanadi?
                </span>
                <Icon name="expand_more" size={20} className={`${styles.faqToggleIcon} ${openFaq === 3 ? styles.faqToggleIconOpen : ""}`} />
              </button>
              {openFaq === 3 && (
                <div className={styles.faqAnswer} id="faq-answer-3" role="region">
                  Barcha ma'lumotlar O'zbekiston hududidagi zamonaviy serverlarda O'zR "Shaxsiy ma'lumotlar to'g'risida"gi (O'RQ-547) qonuni talablari asosida 256-bit SSL bilan shifrlanadi. Har kecha avtomatik zaxira nusxalash (backup) amalga oshiriladi.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 10. CONTACT SECTION (GATE DENT INSPIRED) */}
      <section className={styles.contactSection} id="contact">
        <div className={styles.contactHeader}>
          <div className={styles.contactBadge}>
            <Icon name="support_agent" size={18} />
            <span>Yordam Markazi & Aloqa</span>
          </div>
          <h2 className={styles.contactTitle}>
            Biz bilan bog'laning
          </h2>
          <p className={styles.contactSubtitle}>
            DentUz jamoasi savollaringizga javob berish, klinikangiz uchun bepul taqdimot (demo) o'tkazish yoki tizimga ulanishda ko'maklashishga doimo tayyor.
          </p>
        </div>

        <div className={styles.contactGrid}>
          {/* Left Card: Office Locations and Direct Info */}
          <div className={styles.contactInfoCard}>
            <h3 className={styles.contactCardTitle}>
              <Icon name="apartment" size={26} style={{ color: "var(--color-cyan)" }} />
              Aloqa Ma'lumotlari
            </h3>
            <p className={styles.contactCardSub}>
              Klinikangizga qulay aloqa kanallari orqali 24/7 biz bilan muloqotda bo'ling yoki ofisimizga tashrif buyuring.
            </p>

            <div className={styles.contactOfficesWrapper}>
              <div className={styles.contactOfficeBlock}>
                <div className={styles.officeHeader}>
                  <div className={styles.officeName}>
                    <Icon name="location_on" size={18} style={{ color: 'var(--color-cyan)' }} />
                    <span>Toshkent Bosh Ofisi</span>
                  </div>
                  <span className={styles.officeRegionBadge}>Bosh Qarorgoh</span>
                </div>
                <div className={styles.officeAddress}>
                  Toshkent shahri, Chilonzor tumani, Bunyodkor shoh ko'chasi 42, IT Park binosi, 5-qavat
                </div>
                <div className={styles.officeHours}>
                  <Icon name="schedule" size={14} />
                  <span>Dush - Shan: 09:00 - 19:00</span>
                </div>
              </div>

              <div className={styles.contactOfficeBlock}>
                <div className={styles.officeHeader}>
                  <div className={styles.officeName}>
                    <Icon name="location_on" size={18} style={{ color: 'var(--color-cyan)' }} />
                    <span>Samarqand Mintaqaviy Ofisi</span>
                  </div>
                  <span className={styles.officeRegionBadge}>Mintaqaviy Ofis</span>
                </div>
                <div className={styles.officeAddress}>
                  Samarqand shahri, Universitet xiyoboni 14, Digital Hub
                </div>
                <div className={styles.officeHours}>
                  <Icon name="schedule" size={14} />
                  <span>Dush - Juma: 09:00 - 18:00</span>
                </div>
              </div>
            </div>

            <div className={styles.contactDetailsList}>
              <div className={styles.contactDetailItem}>
                <div className={styles.contactIconCircle}>
                  <Icon name="call" size={20} />
                </div>
                <div className={styles.contactDetailContent}>
                  <span className={styles.contactDetailLabel}>Telefon Markazi</span>
                  <a href="tel:+998712008855" className={styles.contactDetailLink}>+998 71 200 88 55</a>
                  <span className={styles.contactDetailSub}>Birlamchi konsultatsiya va yordam</span>
                </div>
              </div>

              <div className={styles.contactDetailItem}>
                <div className={styles.contactIconCircle}>
                  <Icon name="mail" size={20} />
                </div>
                <div className={styles.contactDetailContent}>
                  <span className={styles.contactDetailLabel}>Elektron Pochta</span>
                  <a href="mailto:info@dentuz.uz" className={styles.contactDetailLink}>info@dentuz.uz</a>
                  <span className={styles.contactDetailSub}>Rasmiy murojaatlar va shartnomalar</span>
                </div>
              </div>

              <div className={styles.contactDetailItem}>
                <div className={styles.contactIconCircle}>
                  <Icon name="send" size={20} />
                </div>
                <div className={styles.contactDetailContent}>
                  <span className={styles.contactDetailLabel}>Tezkor Telegram Yordam</span>
                  <a href="https://t.me/dentuz_support" target="_blank" rel="noopener noreferrer" className={styles.contactDetailLink}>@dentuz_support</a>
                  <span className={styles.contactDetailSub}>24/7 onlayn qo'llab-quvvatlash xizmati</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Interactive Contact Form */}
          <div className={styles.contactFormCard}>
            <h3 className={styles.contactCardTitle}>
              <Icon name="edit_note" size={26} style={{ color: "var(--color-cyan)" }} />
              Bizga Yozing
            </h3>
            <p className={styles.contactCardSub}>
              Murojaatingizni qoldiring, mutaxassislarimiz 15 daqiqa ichida siz bilan bog'lanishadi.
            </p>

            {contactSubmitted ? (
              <div className={styles.contactSuccessAlert}>
                <div className={styles.successIconBadge}>
                  <Icon name="check_circle" size={20} />
                </div>
                <div className={styles.successTitle}>Murojaatingiz qabul qilindi!</div>
                <p className={styles.successMessage}>
                  Rahmat, <strong>{contactForm.fullName || 'Hurmatli foydalanuvchi'}</strong>. Mutaxassisimiz tez orada siz bilan telefon orqali bog'lanadi.
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
                      subject: 'Bepul demo taqdimot',
                      message: ''
                    });
                  }}
                >
                  Yangi xabar yuborish
                </button>
              </div>
            ) : (
              <form className={styles.contactForm} onSubmit={handleContactSubmit}>
                <div className={styles.formRowTwo}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel} htmlFor="contactName">Ism va familiya *</label>
                    <input
                      id="contactName"
                      type="text"
                      className={styles.formInput}
                      placeholder="Masalan: Dr. Sherzod Aliyev"
                      required
                      value={contactForm.fullName}
                      onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel} htmlFor="contactPhone">Telefon raqamingiz *</label>
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
                    <label className={styles.formLabel} htmlFor="contactEmail">Elektron pochta</label>
                    <input
                      id="contactEmail"
                      type="email"
                      className={styles.formInput}
                      placeholder="doktor@klinika.uz"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel} htmlFor="contactSubject">Murojaat mavzusi</label>
                    <select
                      id="contactSubject"
                      className={styles.formSelect}
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    >
                      <option value="Bepul demo taqdimot">Bepul demo taqdimot</option>
                      <option value="Tariflar va to'lov">Tariflar va to'lov</option>
                      <option value="Texnik yordam">Texnik yordam va o'rnatish</option>
                      <option value="Hamkorlik va integratsiya">Hamkorlik va integratsiya</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel} htmlFor="contactMessage">Xabar yoki savolingiz</label>
                  <textarea
                    id="contactMessage"
                    className={styles.formTextarea}
                    placeholder="Klinikangiz nomi, shifokorlar soni yoki qiziqtirgan savollaringizni yozing..."
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </div>

                <button type="submit" className={styles.contactSubmitBtn}>
                  <span>Xabarni Yuborish</span>
                  <Icon name="send" size={18} />
                </button>

                <p className={styles.formFootnote}>
                  🔒 Yuborish tugmasini bosish orqali siz O'zbekiston Respublikasi O'RQ-547 qonuniga binoan shaxsiy ma'lumotlarni qayta ishlashga rozilik bildirasiz.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
