import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import Toast from '../Toast/Toast';
import styles from './ForceChangePassword.module.css';

export default function ForceChangePassword() {
  const { t, i18n } = useTranslation();
  const { user, setUser, logout } = useAuth();
  const isEn = i18n.language?.startsWith('en');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ open: false, type: 'success', title: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      const msg = isEn ? 'New passwords do not match' : 'Yangi parollar bir-biriga mos kelmadi';
      setError(msg);
      return;
    }

    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      const msg = isEn
        ? 'Password must be at least 8 characters with letters and numbers'
        : 'Parol kamida 8 ta belgidan iborat bo\'lishi, kamida bitta harf va bitta raqamni o\'z ichiga olishi shart';
      setError(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res && res.success) {
        setToast({
          open: true,
          type: 'success',
          title: isEn ? 'Password Updated' : 'Parol yangilandi',
          message: isEn
            ? 'Your password has been changed. You can now access the system.'
            : 'Yangi parolingiz muvaffaqiyatli saqlandi. Tizimdan foydalanishingiz mumkin.',
        });

        // Clear mustChangePassword flag in local state so protected routes render immediately
        setTimeout(() => {
          if (setUser) {
            setUser((prev) => ({
              ...prev,
              mustChangePassword: false,
            }));
          }
        }, 1200);
      } else {
        setError(res?.message || (isEn ? 'Failed to update password' : 'Parolni yangilashda xatolik yuz berdi'));
      }
    } catch (err) {
      setError(err?.message || (isEn ? 'Incorrect current password or policy error' : 'Joriy parol noto\'g\'ri yoki parol talablarga mos emas'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="force-pass-title">
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>lock_reset</span>
          </div>
          <h2 id="force-pass-title" className={styles.title}>
            {isEn ? 'Mandatory Password Change' : 'Parolni Yangilash Majburiy'}
          </h2>
          <p className={styles.subtitle}>
            {isEn
              ? 'A temporary password was assigned to your account. For your security, you must create a new personal password before accessing the system.'
              : 'Hisobingizga vaqtinchalik parol berilgan. Xavfsizlik talablariga binoan, tizimdan foydalanishni davom ettirish uchun yangi shaxsiy parol o\'rnating.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              {isEn ? 'Current (Temporary) Password' : 'Joriy (vaqtinchalik) parol'}
            </label>
            <div className={styles.inputWrap}>
              <input
                type={showCurrent ? 'text' : 'password'}
                className={styles.input}
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowCurrent(!showCurrent)}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {showCurrent ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              {isEn ? 'New Personal Password' : 'Yangi shaxsiy parol'}
            </label>
            <div className={styles.inputWrap}>
              <input
                type={showNew ? 'text' : 'password'}
                className={styles.input}
                placeholder={isEn ? 'At least 8 characters (letters + numbers)' : 'Kamida 8 belgi (harf va raqam)'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowNew(!showNew)}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {showNew ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              {isEn ? 'Confirm New Password' : 'Yangi parolni tasdiqlang'}
            </label>
            <div className={styles.inputWrap}>
              <input
                type={showConfirm ? 'text' : 'password'}
                className={styles.input}
                placeholder={isEn ? 'Re-enter new password' : 'Yangi parolni qayta kiriting'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {showConfirm ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
              <span>{error}</span>
            </div>
          )}

          <div className={styles.actions}>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>refresh</span>
                  <span>{isEn ? 'Saving Password...' : 'Saqlanmoqda...'}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                  <span>{isEn ? 'Set Password & Continue' : 'Parolni o\'rnatish va davom etish'}</span>
                </>
              )}
            </button>

            <button type="button" className={styles.logoutBtn} onClick={logout}>
              {isEn ? 'Log Out of Account' : 'Hisobdan chiqish'}
            </button>
          </div>
        </form>
      </div>

      <Toast
        open={toast.open}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}
