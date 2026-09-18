import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Signup.module.css';

export default function Signup() {
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
          <h1 className={styles.title}>Klinika hisobini yaratish</h1>
          <button
            type="button"
            className={styles.demoFillBtn}
            onClick={handleFillDemo}
            title="Sinov uchun namuna ma'lumotlarni avtomatik to'ldirish"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>bolt</span>
            <span>Demo to'ldirish</span>
          </button>
        </div>
        <p className={styles.subtitle}>14 kunlik bepul sinov muddatini boshlang</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="clinic_name">
            Klinika nomi *
          </label>
          <input
            id="clinic_name"
            type="text"
            required
            className={styles.input}
            placeholder="Masalan: Toshkent Dental Clinic"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="doctor_name">
            Mas'ul shifokor ismi *
          </label>
          <input
            id="doctor_name"
            type="text"
            required
            className={styles.input}
            placeholder="Masalan: Dr. Jasur Azimov"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="email">
            Elektron pochta *
          </label>
          <input
            id="email"
            type="email"
            required
            className={styles.input}
            placeholder="doktor@klinika.uz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="phone">
            Telefon raqami *
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
            Parol *
          </label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              className={styles.input}
              placeholder="Kamida 8 ta belgi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.togglePassBtn}
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
              aria-label="Toggle password visibility"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <button type="submit" className={styles.submitBtn}>
          <span>Hisob yaratish</span>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            arrow_forward
          </span>
        </button>

        <p className={styles.trialNote}>
          🔒 Karta talab qilinmaydi • 14 kun bepul sinov • O'RQ-547 himoyasi
        </p>
      </form>

      <p className={styles.loginPrompt}>
        Allaqachon hisobingiz bormi?
        <Link to="/login" className={styles.loginLink}>
          Tizimga kirish
        </Link>
      </p>
    </div>
  );
}
