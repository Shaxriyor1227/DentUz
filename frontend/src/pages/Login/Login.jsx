import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('j.azimov@dentuz.uz');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
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

        <h1 className={styles.title}>Xush kelibsiz</h1>
        <p className={styles.subtitle}>Klinika boshqaruv hisobingizga kiring</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="email">
            Elektron pochta yoki ID
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
            Parol
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
              title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
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
            <span>Eslab qolish</span>
          </label>

          <a href="#forgot" className={styles.forgotLink} onClick={(e) => e.preventDefault()}>
            Parolni unutdingizmi?
          </a>
        </div>

        <button type="submit" className={styles.submitBtn}>
          <span>Tizimga kirish</span>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            arrow_forward
          </span>
        </button>
      </form>

      <p className={styles.signupPrompt}>
        Hisobingiz yo'qmi?
        <Link to="/signup" className={styles.signupLink}>
          Ro'yxatdan o'ting
        </Link>
      </p>
    </div>
  );
}
