import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../components/Logo/Logo';
import styles from './Signup.module.css';

// Crisp inline SVGs
const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <line x1="8" y1="6" x2="10" y2="6" />
    <line x1="14" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="10" y2="10" />
    <line x1="14" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="10" y2="14" />
    <line x1="14" y1="14" x2="16" y2="14" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export default function Signup() {
  const { t } = useTranslation();
  const [clinicName, setClinicName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = () => {
    setClinicName('Premium Dental Care');
    setDoctorName('Dr. Sanjar Karimov');
    setEmail('s.karimov@dentuz.uz');
    setPhone('+998 (90) 123-45-67');
    setPassword('demoPass2026!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login({
      email,
      name: doctorName || 'Yangi shifokor',
      clinic: clinicName || 'Mening Klinikam',
      role: 'Klinika rahbari',
    });
    navigate('/dashboard');
  };

  return (
    <div className={styles.signupCardWrapper}>
      {/* Brand Header */}
      <div className={styles.header}>
        <div className={styles.brandRow}>
          <Link to="/" className={styles.brandLink} title="DentUz - Bosh sahifa">
            <Logo size={40} withText subtitle="Clinic OS" />
          </Link>
        </div>

        <div className={styles.titleRow}>
          <h1 className={styles.title}>{t('auth.signupTitle')}</h1>
          <button
            type="button"
            className={styles.demoFillBtn}
            onClick={handleFillDemo}
            title={t('auth.demoFillTooltip')}
          >
            <BoltIcon />
            <span>{t('auth.demoFill')}</span>
          </button>
        </div>
        <p className={styles.subtitle}>{t('auth.signupSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Clinic Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="clinic_name">
            {t('auth.clinicName')}
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIconLeft}>
              <BuildingIcon />
            </span>
            <input
              id="clinic_name"
              type="text"
              required
              className={styles.input}
              placeholder={t('auth.clinicPlaceholder')}
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
            />
          </div>
        </div>

        {/* Doctor Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="doctor_name">
            {t('auth.doctorName')}
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIconLeft}>
              <UserIcon />
            </span>
            <input
              id="doctor_name"
              type="text"
              required
              className={styles.input}
              placeholder={t('auth.doctorPlaceholder')}
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
            />
          </div>
        </div>

        {/* Email & Phone in 2 Columns on Tablet/Desktop */}
        <div className={styles.twoColRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="signup-email">
              {t('auth.email')}
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIconLeft}>
                <MailIcon />
              </span>
              <input
                id="signup-email"
                type="email"
                required
                className={styles.input}
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="signup-phone">
              {t('auth.phone')}
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIconLeft}>
                <PhoneIcon />
              </span>
              <input
                id="signup-phone"
                type="tel"
                required
                className={styles.input}
                placeholder="+998 (90) 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="signup-password">
            {t('auth.password')} *
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIconLeft}>
              <LockIcon />
            </span>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              className={`${styles.input} ${styles.inputWithToggle}`}
              placeholder={t('auth.passwordMinPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.togglePassBtn}
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* Terms Agreement Note */}
        <p className={styles.termsAgreement}>
          {t('auth.termsAgreement')}
        </p>

        {/* Submit Button */}
        <button type="submit" className={styles.submitBtn}>
          <span>{t('auth.signupBtn')}</span>
          <ArrowRightIcon />
        </button>

        <p className={styles.trialNote}>
          {t('auth.trialNote')}
        </p>
      </form>

      {/* Switch to Login */}
      <p className={styles.loginPrompt}>
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className={styles.loginLink}>
          {t('auth.loginBtn')}
        </Link>
      </p>
    </div>
  );
}
