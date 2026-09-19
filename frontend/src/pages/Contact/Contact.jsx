import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon/Icon';
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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      return;
    }
    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
    }, 900);
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
          <span>{isEn ? 'Direct Support & Consultation' : 'Murojaat va Konsultatsiya'}</span>
        </div>
        <h1 className={styles.heroTitle}>
          {isEn ? 'We are always ready to help' : 'Biz bilan bog\'laning, '}
          <span className={styles.gradientText}>
            {isEn ? 'your clinic thrive' : 'har doim tayyormiz'}
          </span>
        </h1>
        <p className={styles.heroSubtitle}>
          {isEn
            ? 'Have questions about DentUz? Request a personalized live demonstration or reach our engineering support team directly.'
            : 'DentUz tizimi bo\'yicha savollaringiz bormi? Mutaxassisimiz bilan bepul demo taqdimot belgilang yoki to\'g\'ridan-to\'g\'ri bog\'laning.'}
        </p>
      </section>

      {/* Main Grid: Info + Form */}
      <section className={styles.mainGridSection}>
        <div className={styles.gridContainer}>
          {/* Left: Contact Info & Offices */}
          <div className={styles.infoCol}>
            <div className={styles.infoCard}>
              <h2 className={styles.infoCardTitle}>
                {isEn ? 'Direct Communication Channels' : 'Aloqa kanallari'}
              </h2>
              <p className={styles.infoCardDesc}>
                {isEn
                  ? 'Our support specialists respond in under 5 minutes during working hours.'
                  : 'Mutaxassislarimiz ish vaqtida o\'rtacha 5 daqiqa ichida javob berishadi.'}
              </p>

              <div className={styles.contactList}>
                <a href="tel:+998712008844" className={styles.contactItem}>
                  <div className={styles.itemIconWrap}>
                    <Icon name="call" size={20} />
                  </div>
                  <div className={styles.itemContent}>
                    <span className={styles.itemLabel}>{isEn ? 'Single Contact Center' : 'Yagona aloqa markazi'}</span>
                    <span className={styles.itemValue}>+998 (71) 200-88-44</span>
                  </div>
                </a>

                <a href="https://t.me/DentUz_Support" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                  <div className={styles.itemIconWrap}>
                    <Icon name="send" size={20} />
                  </div>
                  <div className={styles.itemContent}>
                    <span className={styles.itemLabel}>{isEn ? 'Telegram Support Desk' : 'Telegram rasmiy ko\'mak'}</span>
                    <span className={styles.itemValue}>@DentUz_Support</span>
                  </div>
                </a>

                <a href="mailto:info@dentuz.uz" className={styles.contactItem}>
                  <div className={styles.itemIconWrap}>
                    <Icon name="mail" size={20} />
                  </div>
                  <div className={styles.itemContent}>
                    <span className={styles.itemLabel}>{isEn ? 'Email Inquiries' : 'Elektron pochta'}</span>
                    <span className={styles.itemValue}>info@dentuz.uz</span>
                  </div>
                </a>

                <div className={styles.contactItem}>
                  <div className={styles.itemIconWrap}>
                    <Icon name="schedule" size={20} />
                  </div>
                  <div className={styles.itemContent}>
                    <span className={styles.itemLabel}>{isEn ? 'Operating Hours' : 'Ish vaqti'}</span>
                    <span className={styles.itemValue}>
                      {isEn ? 'Mon - Sat: 09:00 - 19:00 (Emergency: 24/7)' : 'Dush - Shan: 09:00 - 19:00 (Favqulodda: 24/7)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Offices */}
            <div className={styles.officesCard}>
              <h3 className={styles.officesTitle}>
                <Icon name="apartment" size={20} />
                <span>{isEn ? 'Offices in Uzbekistan' : 'O\'zbekistondagi ofislarimiz'}</span>
              </h3>
              
              <div className={styles.officeItem}>
                <div className={styles.officeBadge}>{isEn ? 'Headquarters' : 'Bosh ofis'}</div>
                <h4 className={styles.officeCity}>{isEn ? 'Tashkent' : 'Toshkent shahri'}</h4>
                <p className={styles.officeAddress}>
                  <Icon name="location_on" size={16} />
                  <span>Yunusobod tumani, Amir Temur shoh ko'chasi, 107-B uy (IT Park)</span>
                </p>
              </div>

              <div className={styles.officeItem}>
                <div className={styles.officeBadge}>{isEn ? 'Branch' : 'Filial'}</div>
                <h4 className={styles.officeCity}>{isEn ? 'Samarkand' : 'Samarqand shahri'}</h4>
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
                  {isEn ? 'Request a Free Live Demo' : 'Bepul taqdimot va konsultatsiya'}
                </h2>
                <p className={styles.formDesc}>
                  {isEn
                    ? 'Fill out the form below. We will demonstrate how DentUz transforms your clinic workflows within 20 minutes.'
                    : 'Quyidagi shaklni to\'ldiring. Mutaxassisimiz siz bilan bog\'lanib, tizim imkoniyatlarini 20 daqiqada namoyish etib beradi.'}
                </p>
              </div>

              {status === 'success' ? (
                <div className={styles.successBox}>
                  <div className={styles.successIcon}>
                    <Icon name="check_circle" size={48} />
                  </div>
                  <h3 className={styles.successTitle}>
                    {isEn ? 'Request Received!' : 'So\'rovingiz qabul qilindi!'}
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
                    {isEn ? 'Send another message' : 'Boshqa xabar yuborish'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="contactName">
                      {isEn ? 'Your Full Name *' : 'Ism-sharifingiz *'}
                    </label>
                    <input
                      id="contactName"
                      name="name"
                      type="text"
                      required
                      placeholder={isEn ? 'Dr. Jasur Azimov' : 'Masalan: Dr. Jasur Azimov'}
                      value={formData.name}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="clinicName">
                        {isEn ? 'Clinic Name' : 'Klinika nomi'}
                      </label>
                      <input
                        id="clinicName"
                        name="clinicName"
                        type="text"
                        placeholder={isEn ? 'Tashkent Dental Care' : 'Masalan: Toshkent Dental Clinic'}
                        value={formData.clinicName}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="contactPhone">
                        {isEn ? 'Phone Number *' : 'Telefon raqamingiz *'}
                      </label>
                      <input
                        id="contactPhone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="+998 (90) 123-45-67"
                        value={formData.phone}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="chairsCount">
                      {isEn ? 'Number of Dental Chairs' : 'Kreslolar soni'}
                    </label>
                    <select
                      id="chairsCount"
                      name="chairsCount"
                      value={formData.chairsCount}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="1">1 ta kreslo (Yakka shifokor)</option>
                      <option value="2-3">2 - 3 ta kreslo (Kichik klinika)</option>
                      <option value="4-6">4 - 6 ta kreslo (O'rta klinika)</option>
                      <option value="7+">7+ kreslo (Tarmoq yoki yirik markaz)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="contactMessage">
                      {isEn ? 'Questions or Specific Requests' : 'Savol yoki qo\'shimcha izoh'}
                    </label>
                    <textarea
                      id="contactMessage"
                      name="message"
                      rows={3}
                      placeholder={
                        isEn
                          ? 'Tell us what you would like to automate or ask...'
                          : 'Klinikangiz uchun qaysi modullar muhimligi yoki savollaringizni yozing...'
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
                      <span>{isEn ? 'Submitting...' : 'Yuborilmoqda...'}</span>
                    ) : (
                      <>
                        <span>{isEn ? 'Send Demo Request' : 'Bepul taqdimotga yozilish'}</span>
                        <Icon name="send" size={18} />
                      </>
                    )}
                  </button>

                  <p className={styles.privacyNote}>
                    <Icon name="lock" size={14} />
                    <span>
                      {isEn
                        ? 'Your data is strictly confidential and protected by SSL encryption.'
                        : 'Ma\'lumotlaringiz maxfiy saqlanadi va uchinchi shaxslarga berilmaydi.'}
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
              {isEn ? 'Frequently Asked Inquiries' : 'Tez-tez beriladigan savollar'}
            </h3>
          </div>
          <div className={styles.faqMiniGrid}>
            <div className={styles.faqMiniCard}>
              <h4 className={styles.faqMiniQ}>
                {isEn ? 'How fast can our clinic start?' : 'Klinikamiz qancha vaqtda ish boshlay oladi?'}
              </h4>
              <p className={styles.faqMiniA}>
                {isEn
                  ? 'In less than 15 minutes! Signup is instant, and our team will guide you through setting up chairs, doctors, and price lists.'
                  : '15 daqiqa ichida! Ro\'yxatdan o\'tishingiz bilan tizim ishga tushadi, shifokorlar va narxnomani kiritishda ko\'maklashamiz.'}
              </p>
            </div>
            <div className={styles.faqMiniCard}>
              <h4 className={styles.faqMiniQ}>
                {isEn ? 'Can you train our clinic staff in person?' : 'Xodimlarimizga amaliy o\'rgatasizmi?'}
              </h4>
              <p className={styles.faqMiniA}>
                {isEn
                  ? 'Yes. We provide both online interactive sessions and in-person training at your clinic in Tashkent and regional hubs.'
                  : 'Albatta. Toshkent va viloyat markazlaridagi klinikalarga mutaxassisimiz tashrif buyurib, administrator va shifokorlarni o\'rgatadi.'}
              </p>
            </div>
            <div className={styles.faqMiniCard}>
              <h4 className={styles.faqMiniQ}>
                {isEn ? 'Can we try before buying?' : 'Sotib olishdan oldin bepul sinab ko\'rish mumkinmi?'}
              </h4>
              <p className={styles.faqMiniA}>
                {isEn
                  ? 'Yes! 14 days free trial with zero credit card commitment and full feature access.'
                  : 'Ha! 14 kun davomida hech qanday to\'lovsiz va barcha imkoniyatlar bilan bepul sinab ko\'rishingiz mumkin.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>
            {isEn ? 'Ready to Automate Your Dental Clinic?' : 'Klinikangizni yangi bosqichga olib chiqing'}
          </h2>
          <p className={styles.ctaDesc}>
            {isEn
              ? 'Join 350+ leading dental clinics in Uzbekistan using DentUz every day.'
              : 'O\'zbekistondagi 350+ dan ortiq ilg\'or stomatologiyalar safiga hoziroq qo\'shiling.'}
          </p>
          <div className={styles.ctaActions}>
            <button
              type="button"
              className={styles.ctaPrimaryBtn}
              onClick={() => window.scrollTo({ top: 200, behavior: 'smooth' })}
            >
              {isEn ? 'Request Live Demo' : "Bepul demo so'rash"}
            </button>
            <Link to="/pricing" className={styles.ctaSecondaryBtn}>
              {isEn ? 'View Pricing Plans' : 'Tariflar bilan tanishish'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
