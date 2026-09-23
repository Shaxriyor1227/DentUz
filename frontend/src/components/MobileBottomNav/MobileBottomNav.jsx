import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import styles from './MobileBottomNav.module.css';

export default function MobileBottomNav() {
  const { t } = useTranslation();
  const { canAccess } = useAuth();

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard') || 'Asosiy', icon: 'grid_view', module: 'dashboard' },
    { to: '/patients', label: t('nav.patients') || 'Bemorlar', icon: 'person_search', module: 'patients' },
    { to: '/calendar', label: t('nav.calendar') || 'Taqvim', icon: 'calendar_month', module: 'calendar' },
    { to: '/treatment-plan', label: t('nav.treatmentPlan') || 'Davolash', icon: 'assignment', module: 'treatment' },
    { to: '/finance', label: t('nav.finance') || 'Moliya', icon: 'payments', module: 'finance' },
  ];

  const allowedItems = navItems.filter((item) => !item.module || canAccess(item.module));

  return (
    <nav className={styles.bottomNav} aria-label="Mobil pastki navigatsiya paneli">
      <ul className={styles.navList}>
        {allowedItems.map((item) => (
          <li key={item.to} className={styles.navItem}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
              aria-label={item.label}
            >
              <span className={`material-symbols-outlined ${styles.navIcon}`}>
                {item.icon}
              </span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
