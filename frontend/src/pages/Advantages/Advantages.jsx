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
      title: isEn ? 'SSV Form 043/h National Standard' : 'SSV 043/h Milliy Standarti',
      desc: isEn
        ? 'Official electronic patient health chart conforming strictly to Ministry of Health guidelines with rapid PDF export.'
        : 'O\'zbekiston Respublikasi Sog\'liqni saqlash vazirligi tasdiqlagan 043/h shakliga 100% muvofiq rasmiy hujjat yuritish.',
      tag: 'SSV Standard',
    },
    {
      icon: 'gavel',
      title: isEn ? 'Law No. 547 Privacy Protection' : 'O\'RQ-547 Maxfiylik Qonuni',
      desc: isEn
        ? 'Medical and personal data of all dental patients is fully protected in compliance with the Republic of Uzbekistan Law on Personal Data.'
        : 'Bemorlarning barcha shaxsiy va klinik ma\'lumotlari O\'zR O\'RQ-547 qonuni talablari asosida qat\'iy himoyalangan.',
      tag: 'Legal Compliance',
    },
    {
      icon: 'lock',
      title: isEn ? '256-Bit Banking-Grade SSL' : '256-bit Bank Darajasidagi SSL',
      desc: isEn
        ? 'End-to-end encrypted sessions guarantee zero data leakages, with multi-layered credential hashing and role-based access control.'
        : 'Klinikadagi har bir operatsiya xalqaro bank darajasidagi 256-bitli SSL shifrlash va rollarga asoslangan xavfsizlik bilan himoyalangan.',
      tag: 'High Security',
    },
    {
      icon: 'cloud_done',
      title: isEn ? 'Local Data Centers & Nightly Backups' : 'O\'zbekiston Serverlari & Avto-Zaxira',
      desc: isEn
        ? 'Hosted in modern local cloud server infrastructure with automated nightly snapshots, ensuring 99.9% clinical continuity.'
        : 'Barcha ma\'lumotlar Toshkentdagi yuqori tezlikdagi serverlarda saqlanadi. Har tunda avtomatik nusxalash (backup) amalga oshiriladi.',
      tag: '99.9% Uptime',
    },
    {
      icon: 'devices',
      title: isEn ? 'Universal Cross-Device Access' : 'Har Qanday Qurilmadan Tezkor Kirish',
      desc: isEn
        ? 'Seamless responsiveness across iPad, Android tablets, reception PCs, and doctor laptops with zero native installation required.'
        : 'Qo\'shimcha dastur o\'rnatish shart emas. Planshet, kompyuter yoki noutbuk orqali brauzerdan bir zumda tizimga kiring.',
      tag: 'Multi-Device',
    },
    {
      icon: 'support_agent',
      title: isEn ? '24/7 Dedicated Support & Onboarding' : '24/7 Jonli Yordam & Bepul O\'rganish',
      desc: isEn
        ? 'Our clinical onboarding specialists provide live phone, Telegram, and onsite assistance with free patient roster data migration.'
        : 'Eski dasturlardan yoki Excel jadvallaridan bemorlar bazasini bepul ko\'chirib beramiz. 24/7 jonli qo\'llab-quvvatlash xizmati.',
      tag: 'Dedicated Care',
    },
  ];

  return (
    <main className={styles.advantagesPage} id="main-content">
      {/* ── Page Hero Header ── */}
      <section className={styles.heroSection}>
        <div className={styles.pageBadge}>
          <span>🛡️</span>
          <span>{isEn ? 'Clinical Advantages & Trust' : 'Klinik Afzalliklar & Kafolat'}</span>
        </div>
        <h1 className={styles.pageTitle}>
          {isEn ? 'Engineered for Reliability, Speed & Clinical Excellence' : 'Ishonchlilik, Tezlik Va Klinik Xavfsizlik'}
        </h1>
        <p className={styles.pageSubtitle}>
          {isEn
            ? 'Discover why over 120 leading dental clinics and 350+ practitioners across Uzbekistan trust DentUz as their centralized practice operating system.'
            : 'O\'zbekiston bo\'ylab 120 dan ortiq yetakchi klinikalar va 350 dan ortiq shifokorlar DentUz tizimini tanlaganining asosiy sabablari bilan tanishing.'}
        </p>
      </section>

      {/* ── 2-Column GateDent Style Orbit Ecosystem Visual ── */}
      <section className={styles.orbitWrapper}>
        <OrbitEcosystem />
      </section>

      {/* ── Trust & Security Pillars ── */}
      <section className={styles.pillarsSection}>
        <div className={styles.pillarsHeader}>
          <span className={styles.pageBadge}>{isEn ? 'Trust & Compliance' : 'Qonuniy & Texnologik Kafolat'}</span>
          <h2 className={styles.pillarsTitle}>
            {isEn ? 'Built for Serious Dental Healthcare Institutions' : 'Klinikangiz Uchun Eng Ishonchli Poydevor'}
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
            {isEn ? 'Ready to Elevate Your Clinic with DentUz?' : 'Klinikangizni Yangi Bosqichga Olib Chiqing'}
          </h2>
          <p className={styles.bottomCtaSub}>
            {isEn
              ? 'Start your 14-day risk-free trial. Zero credit card required, instant setup.'
              : '14 kunlik bepul sinov muddatini boshlang. Karta kiritish talab qilinmaydi.'}
          </p>
          <Link to="/signup" className={styles.ctaBannerBtn}>
            {t('homepage.hero.startFree')} →
          </Link>
        </div>
      </section>
    </main>
  );
}
