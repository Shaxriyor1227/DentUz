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
      return { label: isEn ? 'Active Caries' : 'Karies', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', isCaries: true };
    }
    // Restored / Plomba (Green)
    if (['16', '26', '36'].includes(num)) {
      return { label: isEn ? 'Restored (Filling)' : 'Plomba', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', isRestored: true };
    }
    // Implant (Cyan / Blue)
    if (['14', '45'].includes(num)) {
      return { label: isEn ? 'Dental Implant' : 'Implant', color: '#0EA5E9', bg: 'rgba(14, 165, 233, 0.15)', isImplant: true };
    }
    // Crown / Koronka (Amber / Gold)
    if (['21'].includes(num)) {
      return { label: isEn ? 'Zirconia Crown' : 'Toj (Koronka)', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', isCrown: true };
    }
    // Root Canal / Endo / Pulpit (Purple)
    if (['27', '46'].includes(num)) {
      return { label: isEn ? 'Root Canal (Endo)' : 'Ildiz kanali (Pulpit)', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', isEndo: true };
    }
    // Extracted / Missing (Muted / Slate)
    if (['18', '28', '38'].includes(num)) {
      return { label: isEn ? 'Extracted' : 'Olingan tish', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.22)', isExtracted: true };
    }
    // Healthy (Default)
    return { label: isEn ? 'Healthy' : "Sog'lom", color: '#64748B', bg: 'rgba(100, 116, 139, 0.08)' };
  };

  const currentDesc = isEn
    ? (TOOTH_DESCRIPTIONS_EN[selectedTooth] || `Tooth ${selectedTooth} • Sound physiological state, no clinical pathology detected`)
    : (TOOTH_DESCRIPTIONS[selectedTooth] || `${selectedTooth}-tish • Sog'lom holatda, klinik patologiya aniqlanmadi`);

  const currentStatus = getToothStatus(selectedTooth);

  const PORTAL_SECTIONS = [
    {
      to: '/features',
      title: isEn ? 'Features' : 'Imkoniyatlar',
      desc: isEn
        ? 'Deep-dive into FDI 3D odontograms, patient profiles, treatment planners, multi-chair calendars, and clinical analytics.'
        : 'Interaktiv FDI odontogramma, to\'liq elektron bemor kartasi, ko\'p kresloli smart taqvim va kassa hisobotlari.',
      icon: 'edit_note',
      badge: isEn ? '9 Modules' : '9 ta modul',
    },
    {
      to: '/advantages',
      title: isEn ? 'Advantages' : 'Afzalliklar',
      desc: isEn
        ? 'Discover why 350+ clinics trust DentUz: national data compliance (Law 547), 99.8% uptime, and zero downtime.'
        : 'Nega aynan DentUz? Milliy O\'RQ-547 qonuniga muvofiqlik, 99.8% barqarorlik va 40% vaqt tejalishi.',
      icon: 'verified_user',
      badge: isEn ? 'Why DentUz' : 'Nega biz?',
    },
    {
      to: '/pricing',
      title: isEn ? 'Pricing' : 'Tariflar',
      desc: isEn
        ? 'Simple and transparent plans starting from single-chair solo practices to multi-branch dental hospitals. 14 days free trial.'
        : 'Yakka shifokorlardan tortib yirik klinika tarmoqlarigacha moslashuvchan narxlar. 14 kun mutlaqo bepul.',
      icon: 'credit_card_off',
      badge: isEn ? 'From $19/mo' : '14 kun bepul',
    },
    {
      to: '/contact',
      title: isEn ? 'Contact' : 'Bog\'lanish',
      desc: isEn
        ? 'Speak directly with our clinical advisors in Tashkent and Samarkand or book an interactive 20-minute live demo.'
        : 'Toshkent va Samarqanddagi mutaxassislarimiz bilan bog\'laning yoki 20 daqiqalik jonli taqdimotga yoziling.',
      icon: 'support_agent',
      badge: isEn ? 'Direct Support' : '24/7 Ko\'mak',
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
          <span>{isEn ? '#1 Dental Management Platform in Uzbekistan' : "O'zbekistonda #1 Stomatologiya Boshqaruv Tizimi"}</span>
        </div>

        <h1 className={styles.heroHeadline}>
          {isEn ? 'The Modern Operating System for' : 'Stomatologiya boshqaruvining'}{' '}
          <span className={styles.headlineHighlight}>
            {isEn ? 'Dental Clinics' : 'yangi davri'}
          </span>
        </h1>

        <p className={styles.heroSubhead}>
          {isEn
            ? 'Electronic patient records, 3D interactive odontogram, automated financial reports, and multi-chair scheduling — all in one modern cloud platform.'
            : 'Bemorlar kartasi, interaktiv odontogramma, kassa va shifokorlar ish jadvali — barchasi bitta qulay bulutli platformada.'}
        </p>

        {/* Action Buttons: 1.1 aniq va tushunarli ajratilgan */}
        <div className={styles.heroActions}>
          <Link to="/signup" className={styles.primaryCta} title={isEn ? 'Start free 14-day trial' : "14 kun bepul sinovni boshlash"}>
            <Icon name="rocket_launch" size={18} />
            <span>{isEn ? 'Start 14-Day Free Trial' : "14 kun bepul boshlash"}</span>
          </Link>
          <Link to="/dashboard" className={styles.secondaryCta} title={isEn ? 'Try interactive demo' : "Ro'yxatdan o'tmasdan sinab ko'rish"}>
            <Icon name="play_circle" size={18} />
            <span>{isEn ? 'Explore Interactive Demo' : "Tizimni sinab ko'rish"}</span>
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
                  {isEn ? 'FDI WORLD DENTAL STANDARD' : 'FDI XALQARO STANDARTI'}
                </div>
                <div className={styles.canvasTitle}>
                  {isEn ? 'Interactive FDI Dental Chart (Live Clinical Demo)' : 'Interaktiv FDI Odontogramma (Jonli klinik namoyish)'}
                </div>
              </div>
              <div className={styles.canvasLegend} style={{ flexWrap: 'wrap', gap: '12px' }}>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#64748B' }} />
                  {isEn ? 'Healthy' : "Sog'lom"}
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#10B981' }} />
                  {isEn ? 'Restored' : 'Plomba'}
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#EF4444' }} />
                  {isEn ? 'Caries' : 'Karies'}
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#0EA5E9' }} />
                  {isEn ? 'Implant' : 'Implant'}
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#F59E0B' }} />
                  {isEn ? 'Crown' : 'Koronka'}
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#8B5CF6' }} />
                  {isEn ? 'Root Canal' : 'Ildiz kanali'}
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#94A3B8' }} />
                  {isEn ? 'Extracted' : 'Olingan'}
                </span>
              </div>
            </div>

            {/* Arches Grid */}
            <div className={styles.archGrid}>
              {/* Upper Arch */}
              <div>
                <div className={styles.archRowHeader}>
                  <span>{isEn ? 'Maxillary Arch (Upper • 18 - 28)' : "Yuqori jag' (18 - 28)"}</span>
                  <span>{isEn ? 'Click any tooth to inspect' : 'Tekshirish uchun ustiga bosing'}</span>
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
                            !isSelected && status.color && status.color !== '#64748B'
                              ? { borderColor: status.color, backgroundColor: status.bg, boxShadow: `0 0 10px ${status.bg}` }
                              : undefined
                          }
                        >
                          <span className={styles.toothNumber} style={!isSelected && status.color && status.color !== '#64748B' ? { color: status.color } : undefined}>
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
                  <span>{isEn ? 'Mandibular Arch (Lower • 48 - 38)' : "Pastki jag' (48 - 38)"}</span>
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
                            !isSelected && status.color && status.color !== '#64748B'
                              ? { borderColor: status.color, backgroundColor: status.bg, boxShadow: `0 0 10px ${status.bg}` }
                              : undefined
                          }
                        >
                          <span className={styles.toothNumber} style={!isSelected && status.color && status.color !== '#64748B' ? { color: status.color } : undefined}>
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
            <span>{isEn ? "Uzbekistan Law O'RQ-547 Compliant" : "O'zR Qonuni (O'RQ-547) ga mos"}</span>
          </div>
          <div className={styles.trustItem}>
            <Icon name="domain" size={16} />
            <span>{isEn ? '350+ Licensed Clinics in UZ' : "O'zbekistondagi 350+ klinikalar ishonchi"}</span>
          </div>
          <div className={styles.trustItem}>
            <Icon name="lock" size={16} />
            <span>{isEn ? '256-bit Medical Grade SSL' : '256-bit Shifrlash & Xavfsiz Baza'}</span>
          </div>
          <div className={styles.trustItem}>
            <Icon name="cloud_done" size={16} />
            <span>{isEn ? '99.8% Uptime (Tashkent DC)' : '99.8% Uptime (Toshkent Serverlari)'}</span>
          </div>
          <div className={styles.trustItem}>
            <Icon name="credit_card_off" size={16} />
            <span>{isEn ? 'No Credit Card Required' : '14 kun bepul • Karta talab qilinmaydi'}</span>
          </div>
        </div>
      </section>

      {/* ── 2. Portal Cards Gateway (Direct links to dedicated animated pages) ── */}
      <section className={styles.portalSection}>
        <div className={styles.portalHeader}>
          <div className={styles.portalBadge}>
            <Icon name="apartment" size={15} />
            <span>{isEn ? 'Platform Architecture' : 'Platforma arxitekturasi'}</span>
          </div>
          <h2 className={styles.portalTitle}>
            {isEn ? 'Explore DentUz by Category' : 'DentUz bo\'limlari bilan tanishing'}
          </h2>
          <p className={styles.portalSubtitle}>
            {isEn
              ? 'Each section is specifically designed to provide clear, detailed insight into clinical operations, pricing, and support.'
              : 'Har bir bo\'lim klinikangizni to\'liq avtomatlashtirish, narxlar va aloqa imkoniyatlarini batafsil yoritadi.'}
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
                <span>{isEn ? 'Open section' : 'Bo\'limga o\'tish'}</span>
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
              <span>{isEn ? 'DentUz Ecosystem' : 'DentUz Ekotizimi'}</span>
            </div>
            <h2 className={styles.orbitHeading}>
              {isEn ? 'One Unified System — All Operations Controlled' : 'Bitta tizim — barcha jarayonlar nazoratda'}
            </h2>
            <p className={styles.orbitSubtext}>
              {isEn
                ? 'Say goodbye to lost paper charts, notebook appointments, and financial gaps. DentUz synchronizes doctors, reception, laboratory, and patients in real time.'
                : 'Qog\'oz daftarlar, yo\'qolgan rentgen suratlari va kassa tafovutlariga chek qo\'ying. DentUz barcha klinika jarayonlarini real vaqtda bir-biriga bog\'laydi.'}
            </p>

            <ul className={styles.orbitFeatureList}>
              <li className={styles.orbitFeatureItem}>
                <div className={styles.orbitCheckWrap}>
                  <Icon name="check_circle" size={18} />
                </div>
                <div>
                  <strong>{isEn ? 'Smart Scheduling & SMS Reminders' : 'Smart Taqvimi & SMS eslatmalar'}</strong>
                  <p>{isEn ? 'Reduce patient no-shows by up to 35% with automated SMS alerts.' : 'Bemorlar kelmay qolish xavfini 35% ga qisqartiring.'}</p>
                </div>
              </li>
              <li className={styles.orbitFeatureItem}>
                <div className={styles.orbitCheckWrap}>
                  <Icon name="check_circle" size={18} />
                </div>
                <div>
                  <strong>{isEn ? 'Complete 3D Odontogram & Treatment Plans' : 'Interaktiv Odontogramma & Davolash rejasi'}</strong>
                  <p>{isEn ? 'One-click treatment plans with transparent pricing calculations.' : 'Har bir tish holati bo\'yicha aniq narx hisob-kitobi va bosqichli reja.'}</p>
                </div>
              </li>
              <li className={styles.orbitFeatureItem}>
                <div className={styles.orbitCheckWrap}>
                  <Icon name="check_circle" size={18} />
                </div>
                <div>
                  <strong>{isEn ? 'Financial Analytics & Doctor Commission' : 'Moliya va Shifokorlar foizi'}</strong>
                  <p>{isEn ? 'Instant calculation of doctor KPI shares and daily cash collection.' : 'Shifokorlar ulushi, kunlik kassa va qarzdorliklar avtomatik hisoblanadi.'}</p>
                </div>
              </li>
            </ul>

            <div className={styles.orbitActions}>
              <Link to="/advantages" className={styles.orbitPrimaryBtn}>
                {isEn ? 'Learn All Advantages' : 'Barcha afzalliklar bilan tanishish'}
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
              {isEn ? 'Active Dental Clinics' : 'Faol stomatologiyalar'}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              <AnimatedCounter value="45 000+" duration={1800} />
            </div>
            <div className={styles.statLabel}>
              {isEn ? 'Registered Patients' : 'Bemorlar elektron kartasi'}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              <AnimatedCounter value="99.8%" duration={1500} />
            </div>
            <div className={styles.statLabel}>
              {isEn ? 'System Uptime & Stability' : 'Tizim barqarorligi'}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              15 <span className={styles.statUnit}>{isEn ? 'minutes' : 'daqiqa'}</span>
            </div>
            <div className={styles.statLabel}>
              {isEn ? 'Average Onboarding Time' : 'Tizimni ishga tushirish vaqti'}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Bottom Conversion Banner ── */}
      <section className={styles.ctaBannerSection}>
        <div className={styles.ctaBannerInner}>
          <h2 className={styles.ctaBannerHeadline}>
            {isEn ? 'Ready to modernise your dental practice?' : 'Klinikangizni bugunoq yangi bosqichga olib chiqing'}
          </h2>
          <p className={styles.ctaBannerSubhead}>
            {isEn
              ? 'Join 350+ clinics across Uzbekistan. Start with full features for 14 days — no card required.'
              : "O'zbekistondagi 350+ dan ortiq yetakchi klinikalar qatoriga qo'shiling. 14 kunlik bepul sinov muddati."}
          </p>
          <div className={styles.ctaBannerActions}>
            <Link to="/contact" className={styles.ctaBannerBtn}>
              {isEn ? 'Request Live Demo' : "14 kun bepul sinab ko'rish"}
            </Link>
            <Link to="/pricing" className={styles.ctaBannerOutlineBtn}>
              {isEn ? 'View Pricing Plans' : 'Tariflar bilan tanishish'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
