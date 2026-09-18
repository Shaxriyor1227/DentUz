import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import styles from './Signup.module.css';

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
    setClinicName('Toshkent Dental Clinic');
    setDoctorName('Dr. Jasur Azimov');
    setEmail('j.azimov@dentuz.uz');
    setPhone('+998 (90) 123-45-67');
    setPassword('password123');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email || 'j.azimov@dentuz.uz', password || 'password123');
    navigate('/dashboard');
  };

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.brandRow}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M12 2C7.5 2 6 5.5 6 9c0 4 2 8 3 11 1 3 2.5 3 3 0 .5-3 1-5 2-5s1.5 2 2 5c.5 3 2 3 3 0 1-3 3-7 3-11 0-3.5-1.5-7-6-7z"
                fill="#06B6D4"
              />
              <circle cx="12" cy="7.5" r="1.5" fill="#FFFFFF" />
            </svg>
          </div>
          <div>
            <span className={styles.brandTitle}>
              Dent<span className={styles.brandCyan}>Uz</span>
            </span>
            <span className={styles.clinicBadge}>Clinic</span>
          </div>
        </div>

        <div className={styles.titleRow}>
          <h1 className={styles.title}>{t('auth.signupTitle')}</h1>
          <button
            type="button"
            className={styles.demoFillBtn}
            onClick={handleFillDemo}
            title={t('auth.demoFillTooltip')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>bolt</span>
            <span>{t('auth.demoFill')}</span>
          </button>
        </div>
        <p className={styles.subtitle}>{t('auth.signupSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="clinic_name">
            {t('auth.clinicName')}
          </label>
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

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="doctor_name">
            {t('auth.doctorName')}
          </label>
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

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="email">
            {t('auth.email')}
          </label>
          <input
            id="email"
            type="email"
            required
            className={styles.input}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="phone">
            {t('auth.phone')}
          </label>
          <input
            id="phone"
            type="tel"
            required
            className={styles.input}
            placeholder="+998 (90) 123-45-67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="password">
            {t('auth.password')} *
          </label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              className={styles.input}
              placeholder={t('auth.passwordMinPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.togglePassBtn}
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              aria-label="Toggle password visibility"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <button type="submit" className={styles.submitBtn}>
          <span>{t('auth.signupBtn')}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            arrow_forward
          </span>
        </button>

        <p className={styles.trialNote}>
          {t('auth.trialNote')}
        </p>
      </form>

      <p className={styles.loginPrompt}>
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className={styles.loginLink}>
          {t('auth.loginBtn')}
        </Link>
      </p>
    </div>
  );
}
