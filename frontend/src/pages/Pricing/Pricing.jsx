import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon/Icon';
import styles from './Pricing.module.css';

export default function Pricing() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const FAQS = [
    {
      q: isEn ? 'Is a credit card required for the 14-day free trial?' : '14 kunlik bepul sinov davrida bank kartasi kiritish shartmi?',
      a: isEn
        ? 'No, absolutely not! All modules and features are fully unlocked for 14 days immediately upon signing up. No payment card details or purchase obligations are required.'
        : 'Yo\'q, mutlaqo shart emas! Ro\'yxatdan o\'tganingizdan so\'ng darhol barcha modullar 14 kun davomida to\'liq ochiladi. Hech qanday karta raqami yoki to\'lov majburiyati yuklanmaydi.',
    },
    {
      q: isEn ? 'Do you assist with data migration from Excel or other legacy software?' : 'Boshqa dasturdan yoki Excel jadvallaridan ma\'lumotlarni ko\'chirishda yordam berasizmi?',
      a: isEn
        ? 'Yes, definitely! Our technical onboarding team will securely and quickly migrate your patient rosters, phone numbers, and clinical history into DentUz completely free of charge.'
        : 'Albatta! Bizning professional texnik ko\'mak jamoamiz bemorlaringiz bazasini, telefon raqamlarni va klinik ma\'lumotlarni bepul, tez va xavfsiz tarzda DentUz tizimiga import qilib beradi.',
    },
    {
      q: isEn ? 'Can we upgrade, downgrade, or cancel our subscription at any time?' : 'Tarifni keyinchalik o\'zgartirish yoki bekor qilish mumkinmi?',
      a: isEn
        ? 'Yes, you can upgrade, adjust, or cancel your subscription anytime via your clinic settings. Choosing annual billing also automatically unlocks 2 free months (20% discount).'
        : 'Ha, istalgan payt shaxsiy kabinet orqali tarifingizni oshirishingiz yoki bekor qilishingiz mumkin. Yillik to\'lovga o\'tganingizda esa avtomatik 2 oy bepul foydalanasiz (20% tejash).',
    },
    {
      q: isEn ? 'How is patient data secured and backed up?' : 'Ma\'lumotlarimiz xavfsizligi va zaxira nusxalari qanday saqlanadi?',
      a: isEn
        ? 'All data is securely hosted within modern Uzbekistan data centers, fully compliant with national data protection regulations (Law No. 547) and encrypted with 256-bit SSL. Backups are performed automatically every night.'
        : 'Barcha ma\'lumotlar O\'zbekiston hududidagi zamonaviy serverlarda O\'zR "Shaxsiy ma\'lumotlar to\'g\'risida"gi (O\'RQ-547) qonuni talablari asosida 256-bit SSL bilan shifrlanadi. Har kecha avtomatik zaxira nusxalash amalga oshiriladi.',
    },
  ];

  return (
    <main className={styles.pricingPage} id="main-content">
      {/* ── Header ── */}
      <section className={styles.heroSection}>
        <div className={styles.pageBadge}>
          <span>💳</span>
          <span>{t('homepage.pricing.tag')}</span>
        </div>
        <h1 className={styles.pageTitle}>
          {t('homepage.pricing.heading')}
        </h1>
        <p className={styles.pageSubtitle}>
          {t('homepage.pricing.subheading')}
        </p>

        {/* Monthly / Annual Switcher */}
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
      </section>

      {/* ── 4 Pricing Tiers ── */}
      <div className={styles.pricingGrid}>
        {/* Plan 1: Standard */}
        <div className={styles.priceCard}>
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
                <span>{isEn ? '1 Practitioner (1 Operatory Chair)' : '1 ta Shifokor (1 ta kreslo)'}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{isEn ? 'Unlimited Patient Database' : 'Cheksiz bemorlar bazasi'}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{isEn ? '2 Core Modules (EMR 043/h + Calendar)' : '2 ta Modul (043/h Karta + Taqvim)'}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{isEn ? '1 GB Cloud Storage (Docs & Scans)' : '1 GB Bulutli xotira'}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="cancel" size={18} className={styles.featureIconCross} />
                <span className={styles.featureDisabledText}>{isEn ? 'Automated SMS Reminders' : 'SMS avto-eslatmalar'}</span>
              </li>
            </ul>
          </div>
          <Link to="/contact" className={`${styles.planBtn} ${styles.planBtnOutline}`}>
            {t('homepage.pricing.startBtn')}
          </Link>
        </div>

        {/* Plan 2: Premium */}
        <div className={styles.priceCard}>
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
                <span>{isEn ? '1 - 3 Practitioners (Up to 3 Chairs)' : '1 - 3 ta Shifokor (3 tagacha kreslo)'}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{isEn ? 'All 9 Modules Fully Active' : '9 ta Modul to\'liq faol'}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{isEn ? 'Unlimited Patients • 15 GB Cloud' : 'Cheksiz bemorlar • 15 GB xotira'}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{isEn ? '200 SMS / mo Included' : '200 ta SMS / oy kiritilgan'}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{isEn ? 'Practice Analytics & Financials' : 'KPI va moliyaviy hisobot'}</span>
              </li>
            </ul>
          </div>
          <Link to="/contact" className={`${styles.planBtn} ${styles.planBtnOutline}`}>
            {t('homepage.pricing.startBtn')}
          </Link>
        </div>

        {/* Plan 3: VIP (Featured) */}
        <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
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
                <span>{isEn ? '5 - 10 Practitioners (Unlimited Chairs)' : '5 - 10 ta Shifokor (Cheksiz kreslo)'}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{isEn ? 'All Modules Fully Active' : 'Barcha modullar to\'liq faol'}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{isEn ? 'Unlimited Patients • 50 GB Cloud' : 'Cheksiz bemorlar • 50 GB xotira'}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span className={styles.featureHighlightedChip}>{isEn ? '500 SMS / mo Included' : '500 ta SMS / oy kiritilgan'}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{isEn ? '24/7 Dedicated Support & SLA' : '24/7 Jonli qo\'llab-quvvatlash va SLA'}</span>
              </li>
            </ul>
          </div>
          <Link to="/contact" className={`${styles.planBtn} ${styles.planBtnPrimary}`}>
            {t('homepage.pricing.selectVip')}
          </Link>
        </div>

        {/* Plan 4: Enterprise */}
        <div className={styles.priceCard}>
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
          <Link to="/contact" className={`${styles.planBtn} ${styles.planBtnOutline}`}>
            {t('homepage.pricing.contactUs')}
          </Link>
        </div>
      </div>

      {/* ── Comparison Matrix Table ── */}
      <section className={styles.compareSection}>
        <div className={styles.compareHeader}>
          <span className={styles.pageBadge}>{t('homepage.compare.tag')}</span>
          <h2 className={styles.compareTitle}>{t('homepage.compare.heading')}</h2>
          <p className={styles.compareSub}>{t('homepage.compare.subheading')}</p>
        </div>

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
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>{isEn ? '5 - 10 Practitioners' : '5 - 10 ta Shifokor'}</td>
                <td className={styles.compareTdValue}>{isEn ? 'Unlimited' : 'Cheksiz'}</td>
              </tr>
              <tr>
                <td>{isEn ? 'Digital Patient Record (Form 043/h)' : 'Elektron bemor kartasi (043/h shakl)'}</td>
                <td className={styles.compareTdValue}>✓ ({isEn ? 'Unlimited' : 'Cheksiz'})</td>
                <td className={styles.compareTdValue}>✓ ({isEn ? 'Unlimited' : 'Cheksiz'})</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓ ({isEn ? 'Unlimited' : 'Cheksiz'})</td>
                <td className={styles.compareTdValue}>✓ ({isEn ? 'Unlimited' : 'Cheksiz'})</td>
              </tr>
              <tr>
                <td>{isEn ? 'Smart scheduler & operatory calendar' : 'Aqlli taqvim va kreslolar grafigi'}</td>
                <td className={styles.compareTdValue}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
              </tr>

              <tr className={styles.compareCategoryRow}>
                <td colSpan="5">{isEn ? 'Clinical Charting & Odontogram' : 'Klinik Imkoniyatlar & Odontogramma'}</td>
              </tr>
              <tr>
                <td>{isEn ? 'FDI Odontogram (5 anatomic surfaces)' : 'FDI Odontogramma (5 ta anatomik yuza)'}</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={styles.compareTdValue}>✓</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
              </tr>
              <tr>
                <td>{isEn ? 'Phased treatment plans & estimates' : 'Davolash rejalari va bosqichli smeta'}</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={styles.compareTdValue}>✓</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
              </tr>
              <tr>
                <td>{isEn ? 'Dental lab work orders & tracking' : 'Tish texnik laboratoriya buyurtmalari'}</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={styles.compareTdValue}>✓</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
              </tr>

              <tr className={styles.compareCategoryRow}>
                <td colSpan="5">{isEn ? 'Documents & Cloud Storage' : 'Hujjatlar & Bulutli Xotira'}</td>
              </tr>
              <tr>
                <td>{isEn ? 'Radiographs & Secure Cloud Storage' : 'Rentgen va Xavfsiz Bulutli Xotira'}</td>
                <td className={styles.compareTdValue}>1 GB</td>
                <td className={styles.compareTdValue}>15 GB</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>50 GB</td>
                <td className={styles.compareTdValue}>{isEn ? 'Unlimited' : 'Cheksiz'}</td>
              </tr>
              <tr>
                <td>{isEn ? 'Official PDF export & receipt printing' : 'PDF eksport va Kvitansiya chop etish'}</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
              </tr>

              <tr className={styles.compareCategoryRow}>
                <td colSpan="5">{isEn ? 'SMS & Automated Notifications' : 'SMS & Bildirishnomalar'}</td>
              </tr>
              <tr>
                <td>{isEn ? 'Automated SMS reminders & greetings' : 'SMS avto-eslatmalar va tabriklar'}</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={styles.compareTdValue}>{isEn ? '200 / mo' : '200 ta / oy'}</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>{isEn ? '500 / mo' : '500 ta / oy'}</td>
                <td className={styles.compareTdValue}>{isEn ? 'Custom' : 'Kelishuv asosida'}</td>
              </tr>

              <tr className={styles.compareCategoryRow}>
                <td colSpan="5">{isEn ? 'Finance, Analytics & Support' : 'Moliya & Qo\'llab-quvvatlash'}</td>
              </tr>
              <tr>
                <td>{isEn ? 'Financial reporting & cash registers' : 'Moliyaviy hisobotlar va kassa balansi'}</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={styles.compareTdValue}>✓</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
              </tr>
              <tr>
                <td>{isEn ? '24/7 Dedicated support & account rep' : '24/7 Jonli tezkor yordam'}</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className={styles.faqSection}>
        <div className={styles.faqHeader}>
          <span className={styles.pageBadge}>{t('homepage.faq.tag')}</span>
          <h2 className={styles.faqTitle}>{t('homepage.faq.heading')}</h2>
          <p className={styles.faqSub}>{t('homepage.faq.subheading')}</p>
        </div>

        <div className={styles.faqList}>
          {FAQS.map((faq, idx) => (
            <div key={idx} className={`${styles.faqItem} ${openFaq === idx ? styles.faqItemOpen : ''}`}>
              <button
                type="button"
                className={styles.faqQuestionBtn}
                onClick={() => toggleFaq(idx)}
                aria-expanded={openFaq === idx}
              >
                <span className={styles.faqQuestionText}>{faq.q}</span>
                <Icon
                  name="expand_more"
                  size={20}
                  className={`${styles.faqToggleIcon} ${openFaq === idx ? styles.faqToggleIconOpen : ''}`}
                />
              </button>
              {openFaq === idx && (
                <div className={styles.faqAnswer} role="region">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
