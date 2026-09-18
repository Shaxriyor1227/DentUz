import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../components/Logo/Logo';
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
    <div>
      <div className={styles.header}>
        <div className={styles.brandRow}>
          <Logo size={36} withText subtitle="Clinic OS" />
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
