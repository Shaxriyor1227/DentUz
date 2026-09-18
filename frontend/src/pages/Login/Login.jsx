import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../components/Logo/Logo';
import styles from './Login.module.css';

// Crisp inline SVGs
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('j.azimov@dentuz.uz');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email: email || 'j.azimov@dentuz.uz', name: 'Dr. Jasur Azimov', clinic: 'Toshkent Dental Clinic', role: 'Bosh shifokor' });
    navigate('/dashboard');
  };

  return (
    <div className={styles.loginCardWrapper}>
      {/* Brand Header */}
      <div className={styles.header}>
        <div className={styles.brandRow}>
          <Link to="/" className={styles.brandLink} title="DentUz - Bosh sahifa">
            <Logo size={40} withText subtitle="Clinic OS" />
          </Link>
        </div>

        <h1 className={styles.title}>{t('auth.loginTitle')}</h1>
        <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Email Address with Left Icon */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="login-email">
            {t('auth.emailOrId')}
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIconLeft}>
              <MailIcon />
            </span>
            <input
              id="login-email"
              type="text"
              required
              className={styles.input}
              placeholder="example@clinic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
        </div>

        {/* Password with Left Icon & Visibility Toggle */}
        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="login-password">
              {t('auth.password')}
            </label>
            <a href="#forgot" className={styles.forgotLink} onClick={(e) => e.preventDefault()}>
              {t('auth.forgotPassword')}
            </a>
          </div>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIconLeft}>
              <LockIcon />
            </span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              className={`${styles.input} ${styles.inputWithToggle}`}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

        {/* Remember Me & Terms Note */}
        <div className={styles.optionsRow}>
          <label className={styles.rememberMe}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={styles.checkbox}
            />
            <span>{t('auth.rememberMe')}</span>
          </label>
        </div>

        <p className={styles.termsAgreement}>
          {t('auth.termsAgreement')}
        </p>

        {/* Action Button */}
        <button type="submit" className={styles.submitBtn}>
          <span>{t('auth.loginBtn')}</span>
          <ArrowRightIcon />
        </button>
      </form>

      {/* Switch to Signup */}
      <p className={styles.signupPrompt}>
        {t('auth.noAccount')}{' '}
        <Link to="/signup" className={styles.signupLink}>
          {t('auth.registerNow')}
        </Link>
      </p>
    </div>
  );
}
