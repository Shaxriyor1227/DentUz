import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../components/Logo/Logo';
import styles from './Login.module.css';

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
    login({ email, name: 'Dr. Jasur Azimov', clinic: 'Toshkent Dental Clinic', role: 'Bosh shifokor' });
    navigate('/dashboard');
  };

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.brandRow}>
          <Link to="/" style={{ textDecoration: 'none' }} title="DentUz - Bosh sahifa">
            <Logo size={36} withText subtitle="Clinic OS" />
          </Link>
        </div>

        <h1 className={styles.title}>{t('auth.loginTitle')}</h1>
        <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="email">
            {t('auth.emailOrId')}
          </label>
          <input
            id="email"
            type="text"
            required
            className={styles.input}
            placeholder="doktor@dentuz.uz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="password">
            {t('auth.password')}
          </label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              className={styles.input}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.togglePassBtn}
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className={styles.optionsRow}>
          <label className={styles.rememberMe}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: 'var(--color-cyan)' }}
            />
            <span>{t('auth.rememberMe')}</span>
          </label>

          <a href="#forgot" className={styles.forgotLink} onClick={(e) => e.preventDefault()}>
            {t('auth.forgotPassword')}
          </a>
        </div>

        <button type="submit" className={styles.submitBtn}>
          <span>{t('auth.loginBtn')}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            arrow_forward
          </span>
        </button>
      </form>

      <p className={styles.signupPrompt}>
        {t('auth.noAccount')}{' '}
        <Link to="/signup" className={styles.signupLink}>
          {t('auth.registerNow')}
        </Link>
      </p>
    </div>
  );
}
