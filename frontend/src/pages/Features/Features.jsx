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
      title: isEn ? 'Smart Operatory Calendar' : 'Aqlli Taqvim va Kreslolar Grafigi',
      desc: isEn
        ? 'Real-time drag & drop scheduler, multi-chair occupancy tracking, SMS auto-reminders to reduce no-shows.'
        : 'Shifokorlar va kreslolar bandligini bir ekranda boshqaring. Bemorlarga avtomatik SMS eslatmalar yuboring.',
      badge: isEn ? 'Core Module' : 'Asosiy Modul',
    },
    {
      icon: 'dentistry',
      title: isEn ? 'FDI Digital Odontogram' : 'FDI Raqamli Odontogramma',
      desc: isEn
        ? '5-surface anatomical charting, 30+ pathology presets (caries, crowns, implants, endodontics) with instant visual updates.'
        : '5 ta anatomik yuza bo\'yicha tish xaritasi. 30 dan ortiq tashxis holatlarini bir marta bosishda belgilang.',
      badge: 'FDI Standard',
    },
    {
      icon: 'clinical_notes',
      title: isEn ? 'Electronic Health Record (043/h)' : 'Elektron Bemor Kartasi (043/h)',
      desc: isEn
        ? 'Fully compliant with national healthcare standards. Medical history, anamnesis, allergies, and treatment stages.'
        : 'O\'zbekiston SSV 043/h shakliga to\'liq mos. Kasallik tarixi, anamnez, allergiyalar va davolash rejalari.',
      badge: 'SSV 043/h',
    },
    {
      icon: 'account_balance_wallet',
      title: isEn ? 'Billing, Invoicing & Cash Desk' : 'Moliya va Kassa Balansi',
      desc: isEn
        ? 'Track income & expenses, accept Payme, Click, cards, and cash. Doctor KPI commissions calculated in seconds.'
        : 'Kassa tushumi va xarajatlar monitoringi. Payme, Click va naqd to\'lovlar. Shifokorlar oylik ulushi soniyada hisoblanadi.',
      badge: 'Payme / Click',
    },
    {
      icon: 'radiology',
      title: isEn ? 'Radiograph Archive & 3D CBCT' : 'Rentgen Arxiv va 3D Tomografiya',
      desc: isEn
        ? 'Store panoramic OPG, periapical bitewings, and CBCT scans directly in the patient dossier with DICOM viewer support.'
        : 'OPG, viziograf va 3D CBCT tasvirlarini bemor profilida xavfsiz saqlang va tezkor ko\'ring.',
      badge: 'Cloud Storage',
    },
    {
      icon: 'biotech',
      title: isEn ? 'Dental Lab Work Orders' : 'Tish Texnik Laboratoriyasi',
      desc: isEn
        ? 'Send digital laboratory work orders for zirconia, PFM crowns, and aligners. Track production deadlines and fitting dates.'
        : 'Sirkoniy, metall-keramika va ortodontik qoliplarni laboratoriyaga yuboring va tayyorlik muddatini nazorat qiling.',
      badge: 'Lab Orders',
    },
    {
      icon: 'sms',
      title: isEn ? 'Automated SMS Notification Service' : 'Avtomatik SMS Bildirishnomalar',
      desc: isEn
        ? 'Send automated visit confirmations, reminder alerts 2 hours prior, and holiday greetings with high delivery rates.'
        : 'Qabuldan 2 soat oldin avtomatik SMS, rejalashtirilgan tekshiruvlar va bayram tabriklarini avtomatlashtiring.',
      badge: 'Auto-SMS',
    },
    {
      icon: 'inventory_2',
      title: isEn ? 'Dental Supplies & Inventory' : 'Klinika Moddiy Omborxonasi',
      desc: isEn
        ? 'Real-time consumable tracking, minimum stock threshold alerts, and automated write-offs during clinical procedures.'
        : 'Plomba ashyolari, anestetiklar va sterilizatsiya materiallari qoldig\'ini real vaqtda hisoblab boring.',
      badge: 'Inventory',
    },
    {
      icon: 'analytics',
      title: isEn ? 'Clinical Analytics & Reporting' : 'Klinika Analitikasi va Hisobotlar',
      desc: isEn
        ? 'Interactive revenue growth graphs, patient retention metrics, popular procedures, and practitioner performance KPIs.'
        : 'Oylik daromad o\'sishi, bemorlar oqimi, eng talabgir xizmatlar va shifokorlar reytingi bo\'yicha to\'liq tahlil.',
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
          <span>{isEn ? 'A New Era for Dental Clinics' : 'Stomatologiyada yangi davr'}</span>
        </div>

        <h1 className={styles.pageTitle}>
          <span className={styles.titleLine1}>
            {isEn ? 'Dental Software' : 'Stomatologiya Boshqaruvi'}
          </span>
          <span className={styles.titleLine2}>
            {isEn ? 'Your Practice on One Platform' : 'Butun Klinikangiz Yagona Tizimda'}
          </span>
        </h1>

        <p className={styles.pageSubtitle}>
          {isEn
            ? 'From patient registration to financial reports — manage all your dental clinic operations from a single platform, securely and efficiently.'
            : 'Bemorlar ro‘yxatidan kassa va tish xaritasigacha — barcha klinika operatsiyalarini yagona, xavfsiz va qulay bulutli platformada boshqaring.'}
        </p>

        <div className={styles.heroCtaRow}>
          <Link to="/signup" className={styles.primaryCta}>
            <span>{isEn ? 'Start for Free' : '14 kun bepul boshlash'}</span>
            <span className={styles.ctaArrow}>→</span>
          </Link>
          <a href="#features-grid" className={styles.secondaryCta}>
            <span>{isEn ? 'Learn More' : 'Imkoniyatlar bilan tanishish'}</span>
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
                <li>✓ {isEn ? 'Multi-chair operatory grid' : 'Ko\'p kresloli interaktiv grafik'}</li>
                <li>✓ {isEn ? 'SMS appointment confirmation' : 'Bemorga avtomatik SMS eslatma'}</li>
                <li>✓ {isEn ? 'Color-coded procedure statuses' : 'Rangli muolaja holatlari'}</li>
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
        <section className={styles.storyCard}>
          <div className={`${styles.storyGrid} ${styles.storyGridReverse}`}>
            <div className={styles.storyVisual}>
              <div className={styles.patientProfileHeader}>
                <div className={styles.patientAvatar}>AQ</div>
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

            <div className={styles.storyText}>
              <span className={styles.storyTag}>{t('homepage.stories.story2.tag')}</span>
              <h2 className={styles.storyHeading}>{t('homepage.stories.story2.title')}</h2>
              <p className={styles.storyBody}>{t('homepage.stories.story2.body')}</p>
              <ul className={styles.storyBulletList}>
                <li>✓ {isEn ? 'SSV Form 043/h compliant' : 'SSV 043/h shakliga to\'liq mos'}</li>
                <li>✓ {isEn ? 'Critical allergy warning banner' : 'Allergiya va xavf signallari'}</li>
                <li>✓ {isEn ? 'Chronological dental timeline' : 'Xronologik davolash bosqichlari'}</li>
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
                <li>✓ {isEn ? 'Payme, Click, card & cash' : 'Payme, Click, Uzcard va naqd to\'lovlar'}</li>
                <li>✓ {isEn ? 'Automatic doctor KPI bonus calculation' : 'Shifokorlar oylik ulushini avto-hisoblash'}</li>
                <li>✓ {isEn ? 'Official printable thermal receipts' : 'Kvitansiya va chek chop etish'}</li>
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
                <span>{isEn ? 'Cash: 15%' : 'Naqd: 15%'}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── 9 Modules Comprehensive Grid ── */}
      <section className={styles.gridSection} id="features-grid">
        <div className={styles.gridHeader}>
          <span className={styles.pageBadge}>{isEn ? 'Full Capabilities' : 'Barcha Modullar'}</span>
          <h2 className={styles.gridTitle}>
            {isEn ? 'Complete Dental Practice Ecosystem' : 'Klinikangiz Uchun Mukammal Ekotizim'}
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
            {isEn ? 'Experience DentUz in Your Operatories Today' : 'DentUz Tizimini Bugunoq Klinikangizda Sinab Ko\'ring'}
          </h2>
          <p className={styles.bottomCtaSub}>
            {isEn
              ? 'No credit card required. 14 days free with full access to all 9 modules.'
              : 'Bank kartasi talab qilinmaydi. Barcha 9 ta modul 14 kun davomida to\'liq bepul ochiladi.'}
          </p>
          <Link to="/signup" className={styles.ctaBannerBtn}>
            {t('homepage.hero.startFree')} →
          </Link>
        </div>
      </section>
    </main>
  );
}
