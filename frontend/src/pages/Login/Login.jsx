import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../components/Logo/Logo';
import styles from './Login.module.css';

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

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('j.azimov@dentuz.uz');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({
        email: email || 'j.azimov@dentuz.uz',
        password: password || 'Password123!',
        name: 'Dr. Jasur Azimov',
        clinic: 'DentUz Markaziy Klinika',
        role: 'owner',
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginCardWrapper}>
      {/* Apple-style Minimalist Brand Header */}
      <div className={styles.header}>
        <div className={styles.brandMarkWrap}>
          <Logo size={42} animated={false} />
        </div>
        <h1 className={styles.title}>{t('auth.loginTitle')}</h1>
        <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Email or Clinic ID */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="login-email">
            {t('auth.emailOrId')}
          </label>
          <input
            id="login-email"
            type="text"
            required
            className={styles.input}
            placeholder="doktor@klinika.uz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="login-password">
              {t('auth.password')}
            </label>
            <Link to="/contact" className={styles.forgotLink}>
              {t('auth.forgotPassword')}
            </Link>
          </div>
          <div className={styles.inputWrapper}>
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

        {/* Remember Me Option */}
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

        {/* Primary Action Button */}
        <button type="submit" className={styles.submitBtn}>
          <span>{t('auth.loginBtn')}</span>
        </button>
      </form>

      {/* Subtle Link to Contact */}
      <p className={styles.signupPrompt}>
        {t('auth.noAccount')}{' '}
        <Link to="/contact" className={styles.signupLink}>
          {t('auth.registerNow')}
        </Link>
      </p>
    </div>
  );
}
