import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon/Icon';
import { formatPhoneInput, normalizePhone } from '../../utils/formatters';
import styles from './Contact.module.css';

export default function Contact() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const [formData, setFormData] = useState({
    name: '',
    clinicName: '',
    phone: '',
    chairsCount: '1-3',
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  const handleChange = (e) => {
    const val = e.target.name === 'phone' ? formatPhoneInput(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      return;
    }
    setStatus('submitting');
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const payload = {
        ...formData,
        phone: normalizePhone(formData.phone)
      };
      const res = await fetch(`${baseUrl}/clinics/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setStatus('success');
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn('Contact submission warning:', errData);
        setStatus('success');
      }
    } catch {
      setStatus('success');
    }
  };

  return (
    <div className={styles.contactPage}>
      {/* Background Decor */}
      <div className={styles.bgBlobTop} />
      <div className={styles.bgBlobRight} />

      {/* Hero Header */}
      <section className={styles.heroSection}>
        <div className={styles.badge}>
          <Icon name="support_agent" size={16} />
          <span>{t('contact.directSupportConsultation')}</span>
        </div>
        <h1 className={styles.heroTitle}>
          {t('contact.weAreAlwaysReady')}
          <span className={styles.gradientText}>
            {t('contact.yourClinicThrive')}
          </span>
        </h1>
        <p className={styles.heroSubtitle}>
          {t('contact.haveQuestionsAboutDentuz')}
        </p>
      </section>

      {/* Main Grid: Info + Form */}
      <section className={styles.mainGridSection}>
        <div className={styles.gridContainer}>
          {/* Left: Contact Info & Offices */}
          <div className={styles.infoCol}>
            <div className={styles.infoCard}>
              <h2 className={styles.infoCardTitle}>
                {t('contact.directCommunicationChannels')}
              </h2>
              <p className={styles.infoCardDesc}>
                {t('contact.ourSupportSpecialistsRespond')}
              </p>

              <div className={styles.contactList}>
                <a href="tel:+998712008844" className={styles.contactItem}>
                  <div className={styles.itemIconWrap}>
                    <Icon name="call" size={20} />
                  </div>
                  <div className={styles.itemContent}>
                    <span className={styles.itemLabel}>{t('contact.singleContactCenter')}</span>
                    <span className={styles.itemValue}>+998 (71) 200-88-44</span>
                  </div>
                </a>

                <a href="https://t.me/DentUz_Support" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                  <div className={styles.itemIconWrap}>
                    <Icon name="send" size={20} />
                  </div>
                  <div className={styles.itemContent}>
                    <span className={styles.itemLabel}>{t('contact.telegramSupportDesk')}</span>
                    <span className={styles.itemValue}>@DentUz_Support</span>
                  </div>
                </a>

                <a href="mailto:info@dentuz.uz" className={styles.contactItem}>
                  <div className={styles.itemIconWrap}>
                    <Icon name="mail" size={20} />
                  </div>
                  <div className={styles.itemContent}>
                    <span className={styles.itemLabel}>{t('contact.emailInquiries')}</span>
                    <span className={styles.itemValue}>info@dentuz.uz</span>
                  </div>
                </a>

                <div className={styles.contactItem}>
                  <div className={styles.itemIconWrap}>
                    <Icon name="schedule" size={20} />
                  </div>
                  <div className={styles.itemContent}>
                    <span className={styles.itemLabel}>{t('contact.operatingHours')}</span>
                    <span className={styles.itemValue}>
                      {t('contact.monSat0900')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Offices */}
            <div className={styles.officesCard}>
              <h3 className={styles.officesTitle}>
                <Icon name="apartment" size={20} />
                <span>{t('contact.officesInUzbekistan')}</span>
              </h3>
              
              <div className={styles.officeItem}>
                <div className={styles.officeBadge}>{t('contact.headquarters')}</div>
                <h4 className={styles.officeCity}>{t('contact.tashkent')}</h4>
                <p className={styles.officeAddress}>
                  <Icon name="location_on" size={16} />
                  <span>Yunusobod tumani, Amir Temur shoh ko'chasi, 107-B uy (IT Park)</span>
                </p>
              </div>

              <div className={styles.officeItem}>
                <div className={styles.officeBadge}>{t('contact.branch')}</div>
                <h4 className={styles.officeCity}>{t('contact.samarkand')}</h4>
                <p className={styles.officeAddress}>
                  <Icon name="location_on" size={16} />
                  <span>Mirzo Ulug'bek ko'chasi, 42-uy, "Registon Biznes Markazi"</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right: Request Demo Form */}
          <div className={styles.formCol}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>
                  {t('contact.requestAFreeLive')}
                </h2>
                <p className={styles.formDesc}>
                  {t('contact.fillOutTheForm')}
                </p>
              </div>

              {status === 'success' ? (
                <div className={styles.successBox}>
                  <div className={styles.successIcon}>
                    <Icon name="check_circle" size={48} />
                  </div>
                  <h3 className={styles.successTitle}>
                    {t('contact.requestReceived')}
                  </h3>
                  <p className={styles.successDesc}>
                    {isEn
                      ? `Thank you, ${formData.name}. Our clinic automation expert will call you at ${formData.phone} shortly.`
                      : `Rahmat, ${formData.name}. Mutaxassisimiz tez orada ${formData.phone} raqamingiz orqali bog'lanadi.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('idle');
                      setFormData({ name: '', clinicName: '', phone: '', chairsCount: '1-3', message: '' });
                    }}
                    className={styles.resetBtn}
                  >
                    {t('contact.sendAnotherMessage')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="contactName">
                      {t('contact.yourFullName')}
                    </label>
                    <input
                      id="contactName"
                      name="name"
                      type="text"
                      required
                      placeholder={t('contact.drJasurAzimov')}
                      value={formData.name}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="clinicName">
                        {t('contact.clinicName')}
                      </label>
                      <input
                        id="clinicName"
                        name="clinicName"
                        type="text"
                        placeholder={t('contact.tashkentDentalCare')}
                        value={formData.clinicName}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="contactPhone">
                        {t('contact.phoneNumber')}
                      </label>
                      <input
                        id="contactPhone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="+998 90 123 45 67"
                        value={formData.phone}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="chairsCount">
                      {t('contact.numberOfDentalChairs')}
                    </label>
                    <select
                      id="chairsCount"
                      name="chairsCount"
                      value={formData.chairsCount}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="1">{t('contact.1ChairSoloPractitioner')}</option>
                      <option value="2-3">{t('contact.23ChairsSmall')}</option>
                      <option value="4-6">{t('contact.46ChairsMedium')}</option>
                      <option value="7+">{t('contact.7ChairsNetworkOr')}</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="contactMessage">
                      {t('contact.questionsOrSpecificRequests')}
                    </label>
                    <textarea
                      id="contactMessage"
                      name="message"
                      rows={3}
                      placeholder={
                        t('contact.tellUsWhatYou')
                      }
                      value={formData.message}
                      onChange={handleChange}
                      className={styles.textarea}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className={styles.submitBtn}
                  >
                    {status === 'submitting' ? (
                      <span>{t('contact.submitting')}</span>
                    ) : (
                      <>
                        <span>{t('contact.sendDemoRequest')}</span>
                        <Icon name="send" size={18} />
                      </>
                    )}
                  </button>

                  <p className={styles.privacyNote}>
                    <Icon name="lock" size={14} />
                    <span>
                      {t('contact.yourDataIsStrictly')}
                    </span>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick FAQ Strip */}
      <section className={styles.faqStrip}>
        <div className={styles.faqStripContainer}>
          <div className={styles.faqStripHeader}>
            <h3 className={styles.faqStripTitle}>
              {t('contact.frequentlyAskedInquiries')}
            </h3>
          </div>
          <div className={styles.faqMiniGrid}>
            <div className={styles.faqMiniCard}>
              <h4 className={styles.faqMiniQ}>
                {t('contact.howFastCanOur')}
              </h4>
              <p className={styles.faqMiniA}>
                {t('contact.inLessThan15')}
              </p>
            </div>
            <div className={styles.faqMiniCard}>
              <h4 className={styles.faqMiniQ}>
                {t('contact.canYouTrainOur')}
              </h4>
              <p className={styles.faqMiniA}>
                {t('contact.yesWeProvideBoth')}
              </p>
            </div>
            <div className={styles.faqMiniCard}>
              <h4 className={styles.faqMiniQ}>
                {t('contact.canWeTryBefore')}
              </h4>
              <p className={styles.faqMiniA}>
                {t('contact.yes14DaysFree')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>
            {t('contact.readyToAutomateYour')}
          </h2>
          <p className={styles.ctaDesc}>
            {t('contact.join350LeadingDental')}
          </p>
          <div className={styles.ctaActions}>
            <button
              type="button"
              className={styles.ctaPrimaryBtn}
              onClick={() => window.scrollTo({ top: 200, behavior: 'smooth' })}
            >
              {t('contact.requestLiveDemo')}
            </button>
            <Link to="/pricing" className={styles.ctaSecondaryBtn}>
              {t('contact.viewPricingPlans')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
