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
  const isEn = i18n.language === 'en';
  const [selectedTooth, setSelectedTooth] = useState('11');

  // Stats in-view trigger
  const [statsRef, statsInView] = useInView({ threshold: 0.2, triggerOnce: true });

  const getToothStatus = (num) => {
    if (['16', '36'].includes(num)) return { label: isEn ? 'Caries Treated' : 'Plomba', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
    if (['14'].includes(num)) return { label: isEn ? 'Implant Planned' : 'Implant', color: '#0EA5E9', bg: 'rgba(14, 165, 233, 0.15)' };
    if (['21'].includes(num)) return { label: isEn ? 'Zirconia Crown' : 'Toj (Koronka)', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
    return { label: isEn ? 'Healthy' : 'Sog\'lom', color: '#64748B', bg: 'rgba(100, 116, 139, 0.1)' };
  };

  const currentDesc = isEn
    ? (TOOTH_DESCRIPTIONS_EN[selectedTooth] || `Tooth #${selectedTooth} • Regular healthy tooth status`)
    : (TOOTH_DESCRIPTIONS[selectedTooth] || `Tish #${selectedTooth} • Sog'lom holatda`);

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
      {/* Ambient background glow */}
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

        <div className={styles.heroActions}>
          <Link to="/signup" className={styles.primaryCta}>
            {isEn ? 'Start 14-Day Free Trial' : "14 kun bepul sinab ko'rish"}
          </Link>
          <Link to="/dashboard" className={styles.secondaryCta}>
            <Icon name="health_and_safety" size={18} />
            <span>{isEn ? 'Explore Live Demo' : 'Jonli demo ko\'rish'}</span>
          </Link>
        </div>

        {/* Hero Dental Arch Interactive Visual */}
        <div className={styles.heroCanvasWrapper} id="hero-canvas">
          <div className={styles.heroCanvasCard}>
            <div className={styles.canvasTop}>
              <div>
                <div className={styles.canvasTag}>
                  {isEn ? 'FDI WORLD DENTAL STANDARD' : 'FDI XALQARO STANDARTI'}
                </div>
                <div className={styles.canvasTitle}>
                  {isEn ? 'Interactive FDI Dental Chart (Live Demonstration)' : 'Interaktiv FDI Odontogramma (Jonli namoyish)'}
                </div>
              </div>
              <div className={styles.canvasLegend}>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#64748B' }} />
                  {isEn ? 'Healthy' : 'Sog\'lom'}
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#10B981' }} />
                  {isEn ? 'Restored' : 'Plomba'}
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#0EA5E9' }} />
                  {isEn ? 'Implant' : 'Implant'}
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#F59E0B' }} />
                  {isEn ? 'Crown' : 'Koronka'}
                </span>
              </div>
            </div>

            {/* Arches Grid */}
            <div className={styles.archGrid}>
              {/* Upper Arch */}
              <div>
                <div className={styles.archRowHeader}>
                  <span>{isEn ? 'Maxillary Arch (Upper • 18 - 28)' : 'Yuqori jag\' (18 - 28)'}</span>
                  <span>{isEn ? 'Click any tooth to inspect' : 'Tekshirish uchun ustiga bosing'}</span>
                </div>
                <div className={styles.teethGrid}>
                  {HERO_UPPER_TEETH.map((tooth) => {
                    const isSelected = selectedTooth === tooth;
                    const status = getToothStatus(tooth);
                    return (
                      <div
                        key={tooth}
                        className={styles.toothCell}
                        onClick={() => setSelectedTooth(tooth)}
                        title={`Tish #${tooth} - ${status.label}`}
                      >
                        <div
                          className={`${styles.toothBox} ${isSelected ? styles.toothBoxSelected : ''} ${status.isTreated ? styles.toothBoxTreated : ''}`}
                          style={!isSelected && status.customColor ? { borderColor: status.customColor, backgroundColor: status.customBg } : undefined}
                        >
                          <span className={styles.toothNumber}>{tooth}</span>
                        </div>
                        <span className={`${styles.toothLabel} ${isSelected ? styles.toothLabelSelected : ''}`}>
                          #{tooth}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lower Arch */}
              <div>
                <div className={styles.archRowHeader}>
                  <span>{isEn ? 'Mandibular Arch (Lower • 48 - 38)' : 'Pastki jag\' (48 - 38)'}</span>
                </div>
                <div className={styles.teethGrid}>
                  {HERO_LOWER_TEETH.map((tooth) => {
                    const isSelected = selectedTooth === tooth;
                    const status = getToothStatus(tooth);
                    return (
                      <div
                        key={tooth}
                        className={styles.toothCell}
                        onClick={() => setSelectedTooth(tooth)}
                        title={`Tish #${tooth} - ${status.label}`}
                      >
                        <div
                          className={`${styles.toothBox} ${isSelected ? styles.toothBoxSelected : ''} ${status.isTreated ? styles.toothBoxTreated : ''}`}
                          style={!isSelected && status.customColor ? { borderColor: status.customColor, backgroundColor: status.customBg } : undefined}
                        >
                          <span className={styles.toothNumber}>{tooth}</span>
                        </div>
                        <span className={`${styles.toothLabel} ${isSelected ? styles.toothLabelSelected : ''}`}>
                          #{tooth}
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

        {/* Security & Compliance Strip */}
        <div className={styles.trustBadgeRow}>
          <div className={styles.trustItem}>
            <Icon name="lock" size={16} />
            <span>256-bit SSL Shifrlash</span>
          </div>
          <div className={styles.trustItem}>
            <Icon name="verified_user" size={16} />
            <span>O'zR Qonuni (O'RQ-547)</span>
          </div>
          <div className={styles.trustItem}>
            <Icon name="credit_card_off" size={16} />
            <span>Karta talab qilinmaydi</span>
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
            <Link to="/signup" className={styles.ctaBannerBtn}>
              {isEn ? 'Create Free Clinic Account' : "14 kun bepul sinab ko'rish"}
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
