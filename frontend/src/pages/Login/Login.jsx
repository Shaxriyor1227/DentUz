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

const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#2AABEE">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z"/>
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

  const handleDemoFill = () => {
    setEmail('j.azimov@dentuz.uz');
    setPassword('password123');
  };

  const handleQuickLogin = (provider) => {
    login({
      email: provider === 'google' ? 'dr.google@dentuz.uz' : 'dr.telegram@dentuz.uz',
      name: provider === 'google' ? 'Dr. Jasur Azimov (Google)' : 'Dr. Jasur Azimov (Telegram)',
      clinic: 'Toshkent Dental Clinic',
      role: 'Bosh shifokor',
    });
    navigate('/dashboard');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login({
      email: email || 'j.azimov@dentuz.uz',
      name: 'Dr. Jasur Azimov',
      clinic: 'Toshkent Dental Clinic',
      role: 'Bosh shifokor',
    });
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

        <div className={styles.titleRow}>
          <h1 className={styles.title}>{t('auth.loginTitle')}</h1>
          <button
            type="button"
            className={styles.demoFillBtn}
            onClick={handleDemoFill}
            title={t('auth.demoLogin')}
          >
            <BoltIcon />
            <span>{t('auth.demoLogin')}</span>
          </button>
        </div>
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

        {/* Social / Quick Login Divider */}
        <div className={styles.socialDivider}>
          <span>{t('auth.orDivider')}</span>
        </div>

        <div className={styles.socialButtonsRow}>
          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => handleQuickLogin('google')}
          >
            <GoogleIcon />
            <span>{t('auth.continueGoogle')}</span>
          </button>
          <button
            type="button"
            className={`${styles.socialBtn} ${styles.telegramBtn}`}
            onClick={() => handleQuickLogin('telegram')}
          >
            <TelegramIcon />
            <span>{t('auth.continueTelegram')}</span>
          </button>
        </div>
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
