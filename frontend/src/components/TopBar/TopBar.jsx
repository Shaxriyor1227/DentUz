import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useSidebar } from '../../context/SidebarContext';
import { patientsApi } from '../../api/patientsApi';
import { notificationsApi } from '../../api/notificationsApi';
import Toast from '../Toast/Toast';
import apiClient from '../../api/client';
import styles from './TopBar.module.css';


const ALL_SEARCH_ITEMS = [
  // Bo'limlar
  { id: 'nav-1', category: 'pages', type: "Bo'lim", title: 'Dashboard', meta: 'Klinika tahlillari va operatsion kreslolar', keywords: 'asosiy analitika monitor kreslo boshqaruv', path: '/dashboard', icon: 'grid_view' },
  { id: 'nav-2', category: 'pages', type: "Bo'lim", title: 'Bemorlar Bazasi', meta: 'Ambulatoriya kartalari va bemorlar ro\'yxati', keywords: 'kartalar ambulatoriya bemorlar royxat', path: '/patients', icon: 'group' },
  { id: 'nav-3', category: 'pages', type: "Bo'lim", title: 'Taqvim va Bandlik', meta: 'Operatsion kreslolar va qabullar jadvali', keywords: 'grafik navbat rejalashtirish jadval taqvim', path: '/calendar', icon: 'calendar_today' },
  { id: 'nav-4', category: 'pages', type: "Bo'lim", title: 'Davolash Rejasi', meta: '3D FDI Odontogramma va muolaja smetasi', keywords: '3d reja stomatologiya odontogramma narx xarita', path: '/treatment-plan', icon: 'healing' },
  { id: 'nav-5', category: 'pages', type: "Bo'lim", title: 'Moliya va Hisoblar', meta: 'Kassa tushumi, tushumlar va qoldiq qarzlar', keywords: 'invoys qarz kassa hisobot daromad moliya', path: '/finance', icon: 'account_balance_wallet' },
  { id: 'nav-6', category: 'pages', type: "Bo'lim", title: 'Tizim Sozlamalari', meta: 'Kreslolar soni, xodimlar huquqlari va xizmatlar', keywords: 'xodimlar servis kreslo narxlar jamoa sozlama', path: '/settings', icon: 'settings' },

  // Tezkor Amallar
  { id: 'act-1', category: 'actions', type: 'Amal', title: 'Yangi qabul belgilash', meta: 'Taqvimga tezkor yozish', keywords: 'yozilish bron qabul belgilash', path: '/calendar', icon: 'add_alarm' },
  { id: 'act-2', category: 'actions', type: 'Amal', title: "Yangi bemor ro'yxatga olish", meta: 'Elektron ambulator karta ochish', keywords: 'bemor qoshish yangi karta royxat', path: '/patients', icon: 'person_add' },
  { id: 'act-3', category: 'actions', type: 'Amal', title: 'Davolash rejasini eksport qilish', meta: 'PDF hisobot chiqarish', keywords: 'chop etish yuklab olish pdf eksport', path: '/treatment-plan', icon: 'picture_as_pdf' },
  { id: 'act-4', category: 'actions', type: 'Amal', title: 'Mavzuni almashtirish', meta: "Tungi / Kunduzgi rejim (Dark/Light)", keywords: 'tungi kunduzgi fon mavzu theme dark light', actionType: 'toggle_theme', icon: 'dark_mode' }
];

function formatRelativeTime(dateInput) {
  if (!dateInput) return 'hozirgina';
  const now = new Date();
  const past = new Date(dateInput);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return 'hozirgina';
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  if (diffHour < 24) return `${diffHour} soat oldin`;
  if (diffDay === 1) return 'kecha';
  if (diffDay < 7) return `${diffDay} kun oldin`;
  return past.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
}

function mapServerNotification(n) {
  return {
    id: n.id,
    title: n.title,
    message: n.body,
    time: formatRelativeTime(n.createdAt || n.sentAt),
    read: n.status === 'read',
    icon: n.metadata?.icon || (n.type === 'payment' ? 'payments' : n.type === 'patient' ? 'person_add' : n.type === 'inventory' ? 'inventory_2' : 'notifications'),
    color: n.metadata?.color || (n.type === 'payment' ? '#10B981' : n.type === 'patient' ? '#8B5CF6' : n.type === 'inventory' ? '#EF4444' : 'var(--color-cyan)'),
    link: n.metadata?.link || '/calendar',
    raw: n,
  };
}

export default function TopBar() {
  const { t, i18n } = useTranslation();
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { collapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem('dentuz_lang', lang);
    } catch (e) {}
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, title: '', message: '', type: 'info' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef({});
  const isKeyboardNav = useRef(false);
  const searchInputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const [backendPatients, setBackendPatients] = useState([]);

  // Fetch real backend patients so search is 100% in sync with database
  useEffect(() => {
    let active = true;
    async function fetchClinicPatients() {
      try {
        const res = await patientsApi.getAll({ pageSize: 50 });
        if (active && res?.items && res.items.length > 0) {
          setBackendPatients(res.items);
        }
      } catch (err) {
        console.warn('Backend patients fetch fallback:', err);
      }
    }
    fetchClinicPatients();
    return () => { active = false; };
  }, []);

  // Notifications state (strictly loaded from backend, initially empty for new clinics)
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  // Real backend notifications synchronization
  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getAll({ limit: 40 });
      if (res?.success && Array.isArray(res.data)) {
        setNotifications(res.data.map(mapServerNotification));
      }
    } catch (err) {
      console.warn('Backend notifications fetch fallback:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20s polling
    return () => clearInterval(interval);
  }, []);

  // Doctor Profile Popover State
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const fileInputRef = useRef(null);

  // Performance: Conditional backdrop-filter during scroll
  const [isScrolling, setIsScrolling] = useState(false);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        setIsScrolling(true);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Get user initials for default badge
  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const userInitials = useMemo(() => getUserInitials(user?.name || user?.shortName), [user?.name, user?.shortName]);

  // Per-user avatar: isolated by user?.id so doctor, receptionist and owner do not mix up
  const currentAvatar = useMemo(() => {
    if (user?.avatar) return user.avatar;
    if (user?.avatarUrl) return user.avatarUrl;
    if (user?.id) {
      try {
        const cached = localStorage.getItem(`dentuz_avatar_${user.id}`);
        if (cached) return cached;
      } catch {}
    }
    return null;
  }, [user?.id, user?.avatar, user?.avatarUrl]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({
          open: true,
          title: t('nav.error'),
          message: t('nav.imageSizeMustBe'),
          type: 'error'
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result;
        if (typeof base64 === 'string') {
          if (user?.id) {
            try {
              localStorage.setItem(`dentuz_avatar_${user.id}`, base64);
            } catch (err) {
              console.warn('LocalStorage avatar save error:', err);
            }
          }
          if (updateUser) {
            updateUser({ avatar: base64, avatarUrl: base64 });
          }
          try {
            const token = localStorage.getItem('dentuz_auth_token');
            const baseUrl = apiClient.getBaseUrl();
            await fetch(`${baseUrl}/auth/profile`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ avatarUrl: base64 })
            });
            setToast({
              open: true,
              title: 'Muvaffaqiyatli',
              message: 'Profilingiz rasmi yangilandi',
              type: 'success'
            });
          } catch (err) {
            console.warn('Profile avatar update backend sync:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetAvatar = async (e) => {
    e.stopPropagation();
    if (user?.id) {
      try {
        localStorage.removeItem(`dentuz_avatar_${user.id}`);
      } catch {}
    }
    if (updateUser) {
      updateUser({ avatar: null, avatarUrl: null });
    }
    try {
      const token = localStorage.getItem('dentuz_auth_token');
      const baseUrl = apiClient.getBaseUrl();
      await fetch(`${baseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatarUrl: null })
      });
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayedNotifications = notifications.filter((n) => {
    if (notifFilter === 'unread') return !n.read;
    return true;
  });

  // Global hotkeys (ESC, Cmd+K) & Click Outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (notifOpen) setNotifOpen(false);
        if (profileOpen) setProfileOpen(false);
        if (searchOpen) setSearchOpen(false);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [notifOpen, profileOpen, searchOpen]);

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationsApi.markAllAsRead();
    } catch (err) {
      console.warn('Failed markAllAsRead:', err);
    }
  };

  const handleNotificationClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setNotifOpen(false);

    if (item.raw?.id) {
      notificationsApi.markAsRead(item.raw.id).catch(() => {});
    }

    if (item.link) {
      navigate(item.link);
    }
  };

  const handleClearAllNotifications = async () => {
    setNotifications([]);
    try {
      await notificationsApi.clearAll();
    } catch (err) {
      console.warn('Failed clearAll:', err);
    }
  };

  // Static items (pages + actions) — always available
  const STATIC_ITEMS = useMemo(() => {
    return ALL_SEARCH_ITEMS.filter((item) => item.category !== 'patients');
  }, []);

  // Search Results filtering — show patients ONLY when user types a query
  const filteredSearchItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      // No query → show only pages and actions, NOT a huge patient list
      return STATIC_ITEMS;
    }

    // Build patient list from backend data (or fallback to static)
    const patientSource = backendPatients.length > 0
      ? backendPatients.map((p) => {
          const cleanId = (p.id || '').replace(/^P-/i, '');
          return {
            id: `p-${cleanId || p._id || p.id}`,
            category: 'patients',
            title: p.name,
            meta: `${p.phone || ''}${p.lastProcedure ? ' • ' + p.lastProcedure : ''}`,
            keywords: `${p.id || ''} ${p.name || ''} ${p.phone || ''} ${p.lastProcedure || ''}`.toLowerCase(),
            path: `/patients/${cleanId}`,
            icon: 'person'
          };
        })
      : [];

    const allItems = [...patientSource, ...STATIC_ITEMS];

    const filtered = allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.meta && item.meta.toLowerCase().includes(q)) ||
        (item.keywords && item.keywords.toLowerCase().includes(q))
    );

    // Limit patients to max 8 in results so it stays clean
    const patients = filtered.filter(i => i.category === 'patients').slice(0, 8);
    const others = filtered.filter(i => i.category !== 'patients');
    return [...patients, ...others];
  }, [searchQuery, backendPatients, STATIC_ITEMS]);

  const groupedResults = useMemo(() => {
    const isEn = i18n.language === 'en';
    const categories = [
      { key: 'patients', label: t('nav.patients') },
      { key: 'pages', label: t('nav.pagesSections') },
      { key: 'actions', label: t('nav.quickActions') }
    ];
    return categories
      .map((cat) => ({
        category: cat.key,
        categoryLabel: cat.label,
        items: filteredSearchItems.filter((item) => item.category === cat.key)
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredSearchItems, i18n.language]);

  // Visual flattened results in the EXACT order they are rendered
  const visualResults = useMemo(() => {
    return groupedResults.flatMap((group) => group.items);
  }, [groupedResults]);

  // Pre-compute index map for O(1) lookups — avoid findIndex on every render
  const indexMap = useMemo(() => {
    const map = {};
    visualResults.forEach((item, i) => { map[item.id] = i; });
    return map;
  }, [visualResults]);

  useEffect(() => {
    if (searchOpen) {
      setSelectedIndex(0);
      itemRefs.current = {};
      isKeyboardNav.current = false;
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  useEffect(() => {
    setSelectedIndex(0);
    isKeyboardNav.current = false;
  }, [searchQuery]);

  // Keep selected item visible in viewport with smooth auto-scroll
  useEffect(() => {
    if (!searchOpen) return;
    const activeEl = itemRefs.current[selectedIndex];
    if (activeEl) {
      activeEl.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: isKeyboardNav.current ? 'smooth' : 'auto'
      });
    }
  }, [selectedIndex, searchOpen]);

  const handleSelectResult = (item) => {
    if (!item) return;
    if (item.actionType === 'toggle_theme') {
      toggleTheme();
    } else if (item.path) {
      navigate(item.path);
    }
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleModalKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setSearchOpen(false);
      return;
    }

    if (visualResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      isKeyboardNav.current = true;
      setSelectedIndex((prev) => (prev + 1 >= visualResults.length ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      isKeyboardNav.current = true;
      setSelectedIndex((prev) => (prev - 1 < 0 ? visualResults.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (visualResults[selectedIndex]) {
        handleSelectResult(visualResults[selectedIndex]);
      }
    }
  };

  return (
    <>
      <header className={`${styles.topbar} ${isScrolling ? styles.isScrolling : ''}`}>
        <div className={styles.leftSection}>
          <button
            type="button"
            className={styles.sidebarToggleBtn}
            onClick={toggleSidebar}
            title={collapsed ? "Yon panelni ochish (Ctrl+B)" : "Yon panelni yig'ish (Ctrl+B)"}
            aria-label="Yon panelni ochish yoki yopish"
          >
            <span className="material-symbols-outlined">
              {collapsed ? 'menu' : 'menu_open'}
            </span>
          </button>
          <span className={styles.clinicTitle}>
            <span className={styles.clinicTitleFull}>
              {user?.clinic && user.clinic !== 'DentUz Markaziy Klinika'
                ? user.clinic
                : t('nav.dentuzCentralClinic')}
            </span>
            <span className={styles.clinicTitleShort}>DentUz</span>
          </span>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.searchWrapper} onClick={() => setSearchOpen(true)}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
            <input
              type="text"
              readOnly
              className={styles.searchInput}
              placeholder={t('topbar.searchPlaceholder')}
            />
            <span className={styles.searchShortcut}>⌘K</span>
          </div>
        </div>

        <div className={styles.rightSection}>
          {/* Language & Theme — hidden on mobile, accessible via Settings */}
          <div className={styles.desktopControls}>
            <div className={styles.langSegment} role="group" aria-label="Language selector">
              <button
                type="button"
                className={`${styles.langOption} ${!i18n.language?.startsWith('en') ? styles.langOptionActive : ''}`}
                onClick={() => changeLanguage('uz')}
                title="O'zbekcha"
              >
                UZB
              </button>
              <button
                type="button"
                className={`${styles.langOption} ${i18n.language?.startsWith('en') ? styles.langOptionActive : ''}`}
                onClick={() => changeLanguage('en')}
                title="English"
              >
                ENG
              </button>
            </div>

            <button
              className={styles.themeToggleBtn}
              onClick={toggleTheme}
              title={theme === 'dark' ? t('topbar.switchToLight') : t('topbar.switchToDark')}
              type="button"
              aria-label="Toggle dark/light theme"
            >
              <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
              <span className={styles.themeLabelText}>
                {theme === 'dark' ? t('topbar.lightMode') : t('topbar.darkMode')}
              </span>
            </button>
          </div>

          {/* Notifications Trigger & Dropdown */}
          <div className={styles.notifWrapper} ref={notifRef}>
            <button
              className={`${styles.iconBtn} ${notifOpen ? styles.iconBtnActive : ''}`}
              title={t('topbar.notifications')}
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              aria-expanded={notifOpen}
              aria-label={t('topbar.notifications')}
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className={styles.badgePip}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover Menu */}
            {notifOpen && (
              <div
                className={styles.notifPopover}
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
              >
                <div className={styles.notifHeader}>
                  <div className={styles.notifHeaderLeft}>
                    <span className={styles.notifTitle}>{t('topbar.notificationsTitle')}</span>
                    {unreadCount > 0 && (
                      <span className={styles.notifCountBadge}>{unreadCount} {t('nav.new')}</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className={styles.markReadBtn}
                      onClick={handleMarkAllAsRead}
                      title={t('topbar.markAllRead')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                        done_all
                      </span>
                      <span>{t('topbar.markAllRead')}</span>
                    </button>
                  )}
                </div>

                <div className={styles.notifTabs}>
                  <button
                    type="button"
                    className={`${styles.notifTab} ${notifFilter === 'all' ? styles.notifTabActive : ''}`}
                    onClick={() => setNotifFilter('all')}
                  >
                    {t('common.all')} ({notifications.length})
                  </button>
                  <button
                    type="button"
                    className={`${styles.notifTab} ${notifFilter === 'unread' ? styles.notifTabActive : ''}`}
                    onClick={() => setNotifFilter('unread')}
                  >
                    {t('nav.unread')} ({unreadCount})
                  </button>
                </div>

                <div
                  className={styles.notifList}
                  onWheel={(e) => {
                    e.stopPropagation();
                    const el = e.currentTarget;
                    const isDown = e.deltaY > 0;
                    if (
                      (isDown && el.scrollHeight - el.scrollTop <= el.clientHeight + 1) ||
                      (!isDown && el.scrollTop <= 0)
                    ) {
                      e.preventDefault();
                    }
                  }}
                >
                  {displayedNotifications.length === 0 ? (
                    <div className={styles.emptyNotifs}>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-outline)' }}>
                        notifications_off
                      </span>
                      <p>{t('topbar.noNotifications')}</p>
                    </div>
                  ) : (
                    displayedNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`${styles.notifItem} ${!n.read ? styles.notifItemUnread : ''}`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div
                          className={styles.notifIconWrap}
                          style={{ backgroundColor: `${n.color}15`, color: n.color }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            {n.icon}
                          </span>
                        </div>
                        <div className={styles.notifContent}>
                          <div className={styles.notifItemHeader}>
                            <span className={styles.notifItemTitle}>{n.title}</span>
                            <span className={styles.notifTime}>{n.time}</span>
                          </div>
                          <p className={styles.notifItemMsg}>{n.message}</p>
                        </div>
                        {!n.read && <div className={styles.unreadDot} />}
                      </div>
                    ))
                  )}
                </div>

                <div className={styles.notifFooter}>
                  <button
                    type="button"
                    className={styles.notifFooterAction}
                    onClick={() => {
                      setNotifOpen(false);
                      navigate('/calendar');
                    }}
                  >
                    {t('dashboard.viewAllCalendar')}
                  </button>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      className={styles.clearNotifsBtn}
                      onClick={handleClearAllNotifications}
                    >
                      {t('topbar.clearAll')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

            {/* Hidden file input for Telegram-style avatar upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {/* Doctor Profile Trigger & Dropdown Popover */}
            <div className={styles.profileWrapper} ref={profileRef}>
              <div
                className={`${styles.userProfile} ${profileOpen ? styles.userProfileActive : ''}`}
                onClick={() => setProfileOpen((prev) => !prev)}
                role="button"
                tabIndex={0}
                aria-expanded={profileOpen}
                aria-label="Doctor Profile"
              >
                <div
                  className={styles.avatar}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  title={t('nav.uploadChangePhoto')}
                  style={{ overflow: 'hidden', padding: 0 }}
                >
                  {currentAvatar ? (
                    <img
                      src={currentAvatar}
                      alt={user?.name || 'Foydalanuvchi'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '9999px' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, var(--color-cyan, #06b6d4) 0%, #3b82f6 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '13px',
                        letterSpacing: '0.5px',
                        borderRadius: '9999px',
                        userSelect: 'none'
                      }}
                    >
                      {userInitials}
                    </div>
                  )}
                  {/* Telegram-style hover overlay with + */}
                  <div className={styles.avatarHoverOverlay}>
                    <span className={styles.avatarPlusIcon}>+</span>
                  </div>
                  <span className={styles.onlineBadge} />
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user?.shortName || user?.name || 'Foydalanuvchi'}</span>
                  <span className={styles.userRole}>
                    {user?.title || (user?.role === 'doctor' ? (i18n.language === 'uz' ? 'Shifokor-stomatolog' : 'Doctor Dentist') : user?.role === 'receptionist' ? (i18n.language === 'uz' ? "Qabulxona ma'muri" : 'Receptionist') : (i18n.language === 'uz' ? "Bosh shifokor • Implantolog" : "Chief Physician"))}
                  </span>
                </div>
                <span className={`material-symbols-outlined ${styles.profileChevron} ${profileOpen ? styles.profileChevronOpen : ''}`}>
                  expand_more
                </span>
              </div>

              {/* Doctor Profile Popover Dropdown */}
              {profileOpen && (
                <div
                  className={styles.profilePopover}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.profilePopHeader}>
                    <div
                      className={styles.popAvatarLarge}
                      onClick={() => fileInputRef.current?.click()}
                      title={t('nav.clickToChangePhoto')}
                    >
                      {currentAvatar ? (
                        <img
                          src={currentAvatar}
                          alt={user?.name || 'Foydalanuvchi'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, var(--color-cyan, #06b6d4) 0%, #3b82f6 100%)',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '22px',
                            letterSpacing: '1px',
                            userSelect: 'none'
                          }}
                        >
                          {userInitials}
                        </div>
                      )}
                      <div className={styles.popAvatarHoverOverlay}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>photo_camera</span>
                      </div>
                    </div>
                    <div className={styles.popDoctorMeta}>
                      <div className={styles.popDoctorName}>{user?.name || user?.shortName || 'Foydalanuvchi'}</div>
                      <div className={styles.popDoctorRole}>{user?.title || (user?.role === 'doctor' ? (i18n.language === 'uz' ? 'Shifokor-stomatolog' : 'Doctor Dentist') : user?.role === 'receptionist' ? (i18n.language === 'uz' ? "Qabulxona ma'muri" : 'Receptionist') : (i18n.language === 'uz' ? 'Bosh shifokor • Klinika rahbari' : 'Chief Physician'))}</div>
                      <div className={styles.avatarActionsRow}>
                        <button
                          type="button"
                          className={styles.changeAvatarBtn}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>photo_camera</span>
                          <span>{t('nav.uploadPhoto')}</span>
                        </button>
                        {currentAvatar && (
                          <button
                            type="button"
                            className={styles.resetAvatarBtn}
                            onClick={handleResetAvatar}
                            title={t('nav.resetToDefault')}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>restart_alt</span>
                          </button>
                        )}
                      </div>
                      <div className={styles.popDoctorClinic}>
                        {user?.role === 'superadmin' ? '🌐 DentUz SaaS Boshqaruvi' : `🏥 ${user?.clinic || 'DentUz Markaziy Klinika'}`}
                      </div>
                    </div>
                  </div>

                  <div className={styles.popInfoGrid}>
                    <div className={`${styles.popInfoItem} ${styles.popInfoFull}`}>
                      <span className={styles.popInfoLabel}>{t('nav.email')}</span>
                      <span className={styles.popInfoValue} title={typeof user?.email === 'string' ? user.email : (user?.email?.email || 'shaxriyorrozmamatov@dentuz.uz')}>
                        {typeof user?.email === 'string' ? user.email : (user?.email?.email || 'shaxriyorrozmamatov@dentuz.uz')}
                      </span>
                    </div>
                    <div className={styles.popInfoItem}>
                      <span className={styles.popInfoLabel}>{t('nav.phone')}</span>
                      <span className={styles.popInfoValue}>{user?.phone || '+998 (90) 123-45-67'}</span>
                    </div>
                    {user?.role === 'superadmin' ? (
                      <div className={styles.popInfoItem}>
                        <span className={styles.popInfoLabel}>{t('nav.systemRole')}</span>
                        <span className={styles.popRoleBadge}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>verified_user</span>
                          SuperAdmin
                        </span>
                      </div>
                    ) : (
                      <div className={styles.popInfoItem}>
                        <span className={styles.popInfoLabel}>{t('nav.clinicId')}</span>
                        <span className={styles.popInfoValue} style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>
                          #{user?.clinicId ? `DENT-${user.clinicId}` : 'DENT-778'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.popDivider} />

                  <div className={styles.popNavActions}>
                    {user?.role === 'superadmin' && (
                      <a
                        href="/superadmin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.popActionLink}
                        onClick={() => setProfileOpen(false)}
                        style={{ color: '#06b6d4', fontWeight: 600, background: 'rgba(6, 182, 212, 0.08)' }}
                      >
                        <span className="material-symbols-outlined" style={{ color: '#06b6d4' }}>admin_panel_settings</span>
                        <span>{t('nav.superadminPortal')}</span>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, marginLeft: 'auto', opacity: 0.7 }}>open_in_new</span>
                      </a>
                    )}

                    <Link
                      to="/settings"
                      className={styles.popActionLink}
                      onClick={() => setProfileOpen(false)}
                    >
                      <span className="material-symbols-outlined">tune</span>
                      <span>{t('nav.clinicProfileSettings')}</span>
                    </Link>

                    {user?.role !== 'superadmin' && (
                      <Link
                        to="/finance"
                        className={styles.popActionLink}
                        onClick={() => setProfileOpen(false)}
                      >
                        <span className="material-symbols-outlined">payments</span>
                        <span>{t('nav.doctorKpiCompensation')}</span>
                      </Link>
                    )}
                  </div>

                  <div className={styles.popDivider} />

                  <div className={styles.popFooter}>
                    <button
                      type="button"
                      className={styles.popLogoutBtn}
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        navigate('/login');
                      }}
                    >
                      <span className="material-symbols-outlined">logout</span>
                      <span>{t('nav.signOut')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
        </div>
      </header>

      {/* Apple Spotlight Search Modal */}
      {searchOpen && (
        <div className={styles.searchModalOverlay} onClick={() => setSearchOpen(false)}>
          <div
            className={styles.spotlightModal}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleModalKeyDown}
          >
            {/* Apple Spotlight Input Header */}
            <div className={styles.spotlightHeader}>
              <span className={`material-symbols-outlined ${styles.spotlightSearchIcon}`}>
                search
              </span>
              <input
                ref={searchInputRef}
                autoFocus
                className={styles.spotlightInput}
                placeholder={t('topbar.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearQueryBtn}
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  title={t('topbar.clearAll')}
                >
                  <span className="material-symbols-outlined">cancel</span>
                </button>
              )}
              <kbd className={styles.escBadge} onClick={() => setSearchOpen(false)}>
                ESC
              </kbd>
            </div>

            {/* Apple Spotlight Results List */}
            <div className={styles.spotlightResults} ref={resultsContainerRef}>
              {visualResults.length === 0 ? (
                <div className={styles.emptySpotlight}>
                  <span className="material-symbols-outlined">search_off</span>
                  <p>{t('topbar.searchNoResults')}</p>
                </div>
              ) : (
                groupedResults.map((group) => (
                  <div key={group.category} className={styles.spotlightGroup}>
                    <div className={styles.spotlightGroupHeader}>
                      {group.categoryLabel}
                    </div>
                    {group.items.map((item) => {
                      const itemIndex = indexMap[item.id] ?? -1;
                      const isSelected = itemIndex === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          ref={(el) => {
                            if (el) itemRefs.current[itemIndex] = el;
                          }}
                          className={`${styles.spotlightItem} ${isSelected ? styles.spotlightItemSelected : ''}`}
                          onClick={() => handleSelectResult(item)}
                          onMouseMove={() => {
                            if (isKeyboardNav.current) {
                              isKeyboardNav.current = false;
                            }
                            if (selectedIndex !== itemIndex) {
                              setSelectedIndex(itemIndex);
                            }
                          }}
                        >
                          <div className={`${styles.itemIconWrap} ${styles[`icon_${item.category}`]}`}>
                            <span className="material-symbols-outlined">{item.icon}</span>
                          </div>

                          <div className={styles.itemMain}>
                            <span className={styles.itemTitle}>{item.title}</span>
                            {item.meta && <span className={styles.itemMeta}>{item.meta}</span>}
                          </div>

                          {isSelected && (
                            <div className={styles.actionPill}>
                              <kbd className={styles.actionEnterKey}>↵</kbd>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Apple Spotlight Footer */}
            <div className={styles.spotlightFooter}>
              <div className={styles.footerShortcuts}>
                <span className={styles.shortcutItem}>
                  <kbd className={styles.footerKey}>↑</kbd>
                  <kbd className={styles.footerKey}>↓</kbd>
                  <span>{t('topbar.searchNavigate')}</span>
                </span>
                <span className={styles.shortcutItem}>
                  <kbd className={styles.footerKey}>↵</kbd>
                  <span>{t('topbar.searchPressEnter')}</span>
                </span>
                <span className={styles.shortcutItem}>
                  <kbd className={styles.footerKey}>ESC</kbd>
                  <span>{t('topbar.searchClose')}</span>
                </span>
              </div>
              <div className={styles.spotlightBrand}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--color-cyan)' }}>
                  auto_awesome
                </span>
                <span>DentUz Spotlight</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <Toast
        open={toast.open}
        title={toast.title}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ open: false })}
      />
    </>
  );
}
