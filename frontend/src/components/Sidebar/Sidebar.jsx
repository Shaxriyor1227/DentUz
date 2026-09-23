import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../context/SidebarContext';
import Logo from '../Logo/Logo';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { t } = useTranslation();
  const { logout, canAccess } = useAuth();
  const { collapsed, toggleSidebar, mobileOpen, closeMobileSidebar } = useSidebar();
  const navigate = useNavigate();

  const allNavLinks = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: 'grid_view', module: 'dashboard' },
    { to: '/patients', label: t('nav.patients'), icon: 'person_search', module: 'patients' },
    { to: '/calendar', label: t('nav.calendar'), icon: 'calendar_month', module: 'calendar' },
    { to: '/treatment-plan', label: t('nav.treatmentPlan'), icon: 'assignment', module: 'treatment' },
    { to: '/finance', label: t('nav.finance'), icon: 'payments', module: 'finance' },
    { to: '/settings', label: t('nav.settings'), icon: 'settings', module: 'settings' },
  ];

  const navLinks = allNavLinks.filter(item => !item.module || canAccess(item.module));

  const handleLogout = () => {
    closeMobileSidebar();
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
      aria-label="Asosiy navigatsiya paneli"
    >
      <div className={styles.topSection}>
        {/* Brand Header */}
        <div className={styles.brandHeaderWrapper}>
          <Link
            to="/"
            className={styles.brandHeader}
            title={collapsed ? 'DentUz - Bosh sahifa' : undefined}
            onClick={closeMobileSidebar}
          >
            <Logo
              size={collapsed ? 32 : 36}
              withText={!collapsed}
              subtitle="Dental OS"
              variant="onDark"
            />
          </Link>

          {/* Desktop collapse toggle */}
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

          {/* Mobile drawer close button */}
          <button
            type="button"
            className={styles.mobileCloseBtn}
            onClick={closeMobileSidebar}
            aria-label="Panelni yopish"
          >
            <span className="material-symbols-outlined">close</span>
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
                  onClick={closeMobileSidebar}
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
          aria-label="DentUz bosh sahifasiga o'tish"
          onClick={closeMobileSidebar}
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
          aria-label={t('nav.logout') || 'Tizimdan chiqish'}
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
          aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
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
