import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../context/SidebarContext';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { logout } = useAuth();
  const { collapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
    { to: '/patients', label: 'Bemorlar', icon: 'group' },
    { to: '/calendar', label: 'Taqvim', icon: 'calendar_today' },
    { to: '/treatment-plan', label: 'Davolash Rejasi', icon: 'healing' },
    { to: '/finance', label: 'Moliya', icon: 'account_balance_wallet' },
    { to: '/settings', label: 'Sozlamalar', icon: 'settings' }
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
            title={collapsed ? "Yon panelni ochish (Ctrl+B)" : "Yon panelni yig'ish (Ctrl+B)"}
            aria-label="Yon panelni ochish yoki yopish"
          >
            <span className="material-symbols-outlined">
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {!collapsed ? (
          <div className={styles.sectionLabel}>Asosiy Panel</div>
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
          title={collapsed ? 'Bosh sahifa' : 'Bosh sahifa (Landing page)'}
        >
          <span className={`material-symbols-outlined ${styles.navIcon}`}>home</span>
          {!collapsed && <span>Bosh sahifa</span>}
          {collapsed && (
            <span className={styles.floatingTooltip}>Bosh sahifa</span>
          )}
        </Link>

        <button
          onClick={handleLogout}
          className={styles.logoutBtn}
          type="button"
          title={collapsed ? 'Chiqish' : undefined}
        >
          <span className={`material-symbols-outlined ${styles.navIcon}`}>logout</span>
          {!collapsed && <span>Chiqish</span>}
          {collapsed && (
            <span className={styles.floatingTooltip}>Chiqish</span>
          )}
        </button>

        {/* Quick toggle at bottom */}
        <button
          type="button"
          className={styles.bottomToggleBtn}
          onClick={toggleSidebar}
          title={collapsed ? "Yon panelni ochish (Ctrl+B)" : "Yon panelni yig'ish (Ctrl+B)"}
        >
          <span className={`material-symbols-outlined ${styles.navIcon}`}>
            {collapsed ? 'last_page' : 'first_page'}
          </span>
          {!collapsed && <span className={styles.toggleText}>Panelni yig'ish</span>}
          {!collapsed && <kbd className={styles.kbdShortcut}>Ctrl+B</kbd>}
          {collapsed && (
            <span className={styles.floatingTooltip}>Panelni ochish (Ctrl+B)</span>
          )}
        </button>
      </div>
    </aside>
  );
}
