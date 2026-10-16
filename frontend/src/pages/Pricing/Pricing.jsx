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
      q: t('pricing.isACreditCard'),
      a: t('pricing.noAbsolutelyNotAll'),
    },
    {
      q: t('pricing.doYouAssistWith'),
      a: t('pricing.yesDefinitelyOurTechnical'),
    },
    {
      q: t('pricing.canWeUpgradeDowngrade'),
      a: t('pricing.yesYouCanUpgrade'),
    },
    {
      q: t('pricing.howIsPatientData'),
      a: t('pricing.allDataIsSecurely'),
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
            title={t('pricing.toggleAnnualOrMonthly')}
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
                {t('pricing.idealForSoloPractitioners')}
              </p>
            </div>
            <div className={styles.planPrice}>
              {isAnnual ? '280 000' : '350 000'} <span className={styles.planPeriod}>{t('homepage.pricing.perMonth')}</span>
            </div>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.1Practitioner1Operatory')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.unlimitedPatientDatabase')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.2CoreModulesEmr')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.1GbCloudStorage')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="cancel" size={18} className={styles.featureIconCross} />
                <span className={styles.featureDisabledText}>{t('pricing.automatedSmsReminders')}</span>
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
                {t('pricing.expandedCapabilitiesForGrowing')}
              </p>
            </div>
            <div className={styles.planPrice}>
              {isAnnual ? '600 000' : '750 000'} <span className={styles.planPeriod}>{t('homepage.pricing.perMonth')}</span>
            </div>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.13PractitionersUp')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.all9ModulesFully')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.unlimitedPatients15Gb')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.200SmsMoIncluded')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.practiceAnalyticsFinancials')}</span>
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
                {t('pricing.allModulesHighVolume')}
              </p>
            </div>
            <div className={`${styles.planPrice} ${styles.planPriceCyan}`}>
              {isAnnual ? '1 120 000' : '1 400 000'} <span className={styles.planPeriod}>{t('homepage.pricing.perMonth')}</span>
            </div>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.510PractitionersUnlimited')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.allModulesFullyActive')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.unlimitedPatients50Gb')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span className={styles.featureHighlightedChip}>{t('pricing.500SmsMoIncluded')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.247DedicatedSupport')}</span>
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
                {t('pricing.tailoredForMultiChair')}
              </p>
            </div>
            <div className={styles.planPrice} style={{ fontSize: '24px' }}>
              {t('homepage.pricing.customPrice')}
            </div>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.practitionerSeatsTailored')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.smsVolumeCustomQuota')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.patientFilesXRays')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.1cPaymeClickCustom')}</span>
              </li>
              <li className={styles.featureItem}>
                <Icon name="check_circle" size={18} className={styles.featureIconCheck} />
                <span>{t('pricing.dedicatedAccountRepSla')}</span>
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
                <td colSpan="5">{t('pricing.practiceManagementStaff')}</td>
              </tr>
              <tr>
                <td>{t('pricing.staffAccountsOperatoryChairs')}</td>
                <td className={styles.compareTdValue}>{t('pricing.1Practitioner')}</td>
                <td className={styles.compareTdValue}>{t('pricing.upTo3')}</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>{t('pricing.510Practitioners')}</td>
                <td className={styles.compareTdValue}>{t('pricing.unlimited')}</td>
              </tr>
              <tr>
                <td>{t('pricing.digitalPatientRecordForm')}</td>
                <td className={styles.compareTdValue}>✓ ({t('pricing.unlimited')})</td>
                <td className={styles.compareTdValue}>✓ ({t('pricing.unlimited')})</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓ ({t('pricing.unlimited')})</td>
                <td className={styles.compareTdValue}>✓ ({t('pricing.unlimited')})</td>
              </tr>
              <tr>
                <td>{t('pricing.smartSchedulerOperatoryCalendar')}</td>
                <td className={styles.compareTdValue}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
              </tr>

              <tr className={styles.compareCategoryRow}>
                <td colSpan="5">{t('pricing.clinicalChartingOdontogram')}</td>
              </tr>
              <tr>
                <td>{t('pricing.fdiOdontogram5Anatomic')}</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={styles.compareTdValue}>✓</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
              </tr>
              <tr>
                <td>{t('pricing.phasedTreatmentPlansEstimates')}</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={styles.compareTdValue}>✓</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
              </tr>
              <tr>
                <td>{t('pricing.dentalLabWorkOrders')}</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={styles.compareTdValue}>✓</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
              </tr>

              <tr className={styles.compareCategoryRow}>
                <td colSpan="5">{t('pricing.documentsCloudStorage')}</td>
              </tr>
              <tr>
                <td>{t('pricing.radiographsSecureCloudStorage')}</td>
                <td className={styles.compareTdValue}>1 GB</td>
                <td className={styles.compareTdValue}>15 GB</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>50 GB</td>
                <td className={styles.compareTdValue}>{t('pricing.unlimited')}</td>
              </tr>
              <tr>
                <td>{t('pricing.officialPdfExportReceipt')}</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
              </tr>

              <tr className={styles.compareCategoryRow}>
                <td colSpan="5">{t('pricing.smsAutomatedNotifications')}</td>
              </tr>
              <tr>
                <td>{t('pricing.automatedSmsRemindersGreetings')}</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={styles.compareTdValue}>{t('pricing.200Mo')}</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>{t('pricing.500Mo')}</td>
                <td className={styles.compareTdValue}>{t('pricing.custom')}</td>
              </tr>

              <tr className={styles.compareCategoryRow}>
                <td colSpan="5">{t('pricing.financeAnalyticsSupport')}</td>
              </tr>
              <tr>
                <td>{t('pricing.financialReportingCashRegisters')}</td>
                <td className={styles.compareTdValue}>✕</td>
                <td className={styles.compareTdValue}>✓</td>
                <td className={`${styles.compareTdValue} ${styles.compareTdVip}`}>✓</td>
                <td className={styles.compareTdValue}>✓</td>
              </tr>
              <tr>
                <td>{t('pricing.247DedicatedSupport_1')}</td>
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
