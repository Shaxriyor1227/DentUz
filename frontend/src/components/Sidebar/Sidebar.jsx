import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../context/SidebarContext';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { collapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: 'grid_view' },
    { to: '/patients', label: t('nav.patients'), icon: 'group' },
    { to: '/calendar', label: t('nav.calendar'), icon: 'calendar_today' },
    { to: '/treatment-plan', label: t('nav.treatmentPlan'), icon: 'healing' },
    { to: '/finance', label: t('nav.finance'), icon: 'account_balance_wallet' },
    { to: '/settings', label: t('nav.settings'), icon: 'settings' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      <div className={styles.topSection}>
        {/* Brand Header */}
        <div className={styles.brandHeaderWrapper}>
          <Link
            to="/dashboard"
            className={styles.brandHeader}
            title={collapsed ? 'DentUz Dental OS' : undefined}
          >
            <div className={styles.brandLogo}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path
                  d="M12 2C7.5 2 6 5.5 6 9c0 4 2 8 3 11 1 3 2.5 3 3 0 .5-3 1-5 2-5s1.5 2 2 5c.5 3 2 3 3 0 1-3 3-7 3-11 0-3.5-1.5-7-6-7z"
                  fill="#06B6D4"
                />
                <circle cx="12" cy="7.5" r="1.5" fill="#FFFFFF" />
              </svg>
            </div>
            {!collapsed && (
              <div className={styles.brandTitles}>
                <span className={styles.brandName}>
                  Dent<span className={styles.brandNameCyan}>Uz</span>
                </span>
                <span className={styles.brandTag}>Dental OS</span>
              </div>
            )}
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
