import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../context/SidebarContext';
import Logo from '../Logo/Logo';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { collapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: 'grid_view' },
    { to: '/patients', label: t('nav.patients'), icon: 'person_search' },
    { to: '/calendar', label: t('nav.calendar'), icon: 'calendar_month' },
    { to: '/treatment-plan', label: t('nav.treatmentPlan'), icon: 'assignment' },
    { to: '/finance', label: t('nav.finance'), icon: 'payments' },
    { to: '/settings', label: t('nav.settings'), icon: 'settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}
      aria-label="Asosiy navigatsiya paneli"
    >
      <div className={styles.topSection}>
        {/* Brand Header */}
        <div className={styles.brandHeaderWrapper}>
          <Link
            to="/dashboard"
            className={styles.brandHeader}
            title={collapsed ? 'DentUz Dental OS' : undefined}
          >
            <Logo
              size={collapsed ? 32 : 36}
              withText={!collapsed}
              subtitle="Dental OS"
            />
          </Link>

          <button
            type="button"
            className={styles.collapseToggleBtn}
            onClick={toggleSidebar}
            title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
            aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
          >
            <span className="material-symbols-outlined">
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {!collapsed ? (
          <div className={styles.sectionLabel}>{t('nav.mainSections')}</div>
        ) : (
          <div className={styles.sectionDivider} />
        )}

        <nav>
          <ul className={styles.navList}>
            {navLinks.map((item) => (
              <li key={item.to} className={styles.navListItem}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.navItem} ${styles.navItemActive}`
                      : styles.navItem
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <span className={`material-symbols-outlined ${styles.navIcon}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                  {collapsed && (
                    <span className={styles.floatingTooltip}>{item.label}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={styles.bottomSection}>
        <Link
          to="/"
          className={styles.bottomLink}
          title={collapsed ? 'Landing' : undefined}
        >
          <span className={`material-symbols-outlined ${styles.navIcon}`}>home</span>
          {!collapsed && <span>DentUz.uz</span>}
          {collapsed && (
            <span className={styles.floatingTooltip}>DentUz.uz</span>
          )}
        </Link>

        <button
          onClick={handleLogout}
          className={styles.logoutBtn}
          type="button"
          title={collapsed ? t('nav.logout') : undefined}
        >
          <span className={`material-symbols-outlined ${styles.navIcon}`}>logout</span>
          {!collapsed && <span>{t('nav.logout')}</span>}
          {collapsed && (
            <span className={styles.floatingTooltip}>{t('nav.logout')}</span>
          )}
        </button>

        {/* Quick toggle at bottom */}
        <button
          type="button"
          className={styles.bottomToggleBtn}
          onClick={toggleSidebar}
          title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
        >
          <span className={`material-symbols-outlined ${styles.navIcon}`}>
            {collapsed ? 'last_page' : 'first_page'}
          </span>
          {!collapsed && <span className={styles.toggleText}>{t('nav.collapseSidebar')}</span>}
          {!collapsed && <kbd className={styles.kbdShortcut}>Ctrl+B</kbd>}
          {collapsed && (
            <span className={styles.floatingTooltip}>{t('nav.expandSidebar')}</span>
          )}
        </button>
      </div>
    </aside>
  );
}
