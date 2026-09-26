import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useSidebar } from '../../context/SidebarContext';
import { patientsApi } from '../../api/patientsApi';
import styles from './TopBar.module.css';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Yangi qabul belgilandi',
    message: 'Nodir Ergashev - Gigiyenik tozalash (Bugun 12:00 da, Dr. Karimov)',
    time: '5 daqiqa oldin',
    read: false,
    icon: 'calendar_month',
    color: 'var(--color-cyan)',
    link: '/calendar'
  },
  {
    id: 'notif-2',
    title: 'Bemor yetib keldi',
    message: 'Anvar Qosimov qabulxona kutish zalida kutmoqda',
    time: '15 daqiqa oldin',
    read: false,
    icon: 'person_check',
    color: 'var(--color-mint)',
    link: '/patients/1042'
  },
  {
    id: 'notif-3',
    title: 'Laboratoriya natijasi',
    message: 'Malika Saidova: Qolip va sirkoniy toj tayyor',
    time: '45 daqiqa oldin',
    read: false,
    icon: 'biotech',
    color: '#3B82F6',
    link: '/treatment-plan'
  },
  {
    id: 'notif-4',
    title: "To'lov qabul qilindi",
    message: "Jamshid Karimov: 850 000 so'm (Karta orqali to'landi)",
    time: '2 soat oldin',
    read: true,
    icon: 'payments',
    color: '#10B981',
    link: '/finance'
  },
  {
    id: 'notif-5',
    title: "Qabul vaqti ko'chirildi",
    message: "Dilnoza Karimova qabulini ertaga soat 11:00 ga ko'chirdi",
    time: '4 soat oldin',
    read: true,
    icon: 'schedule',
    color: '#F59E0B',
    link: '/calendar'
  }
];

const ALL_SEARCH_ITEMS = [
  // Bemorlar
  { id: 'p-1042', category: 'patients', type: 'Bemor', title: 'Anvar Qosimov', meta: '+998 90 842 11 00 • Karies davolash', keywords: 'p-1042 terapiya karies anvar', path: '/patients/1042', icon: 'person' },
  { id: 'p-1043', category: 'patients', type: 'Bemor', title: 'Malika Saidova', meta: '+998 93 319 44 28 • Ortodontik ko\'rik', keywords: 'p-1043 ortopediya ortodontiya malika', path: '/patients/1043', icon: 'person' },
  { id: 'p-1044', category: 'patients', type: 'Bemor', title: 'Jamshid Karimov', meta: '+998 97 711 09 85 • Tish tozalash', keywords: 'p-1044 jarrohlik tozalash gigiyena jamshid', path: '/patients/1044', icon: 'person' },
  { id: 'p-1045', category: 'patients', type: 'Bemor', title: 'Nilufar Rahimova', meta: '+998 91 445 22 19 • Zoom 4 oqartirish', keywords: 'p-1045 tish oqartirish zoom nilufar', path: '/patients/1045', icon: 'person' },
  { id: 'p-1046', category: 'patients', type: 'Bemor', title: 'Shahnoza Aliyeva', meta: '+998 91 555 88 99 • Breket tizimi', keywords: 'p-1046 ortodontiya breket shahnoza', path: '/patients/1046', icon: 'person' },
  { id: 'p-1047', category: 'patients', type: 'Bemor', title: 'Rustam Oripov', meta: '+998 90 123 45 67 • Straumann implant', keywords: 'p-1047 implantatsiya protez rustam', path: '/patients/1047', icon: 'person' },
  { id: 'p-1048', category: 'patients', type: 'Bemor', title: 'Nigora Zokirova', meta: '+998 94 888 22 11 • Plomba & Estetika', keywords: 'p-1048 terapiya plomba nigora', path: '/patients/1048', icon: 'person' },
  { id: 'p-1049', category: 'patients', type: 'Bemor', title: 'Dilshod Normurodov', meta: '+998 93 111 22 33 • Ildiz kanali (Endo)', keywords: 'p-1049 endodontiya ildiz kanal dilshod', path: '/patients/1049', icon: 'person' },
  { id: 'p-1050', category: 'patients', type: 'Bemor', title: 'Zarina Salimova', meta: '+998 90 777 55 44 • Profilaktik ko\'rik', keywords: 'p-1050 gigiyena tozalash zarina', path: '/patients/1050', icon: 'person' },

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

export default function TopBar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
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

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const notifRef = useRef(null);

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

  const [customAvatar, setCustomAvatar] = useState(() => {
    return localStorage.getItem('dentuz_custom_avatar') || '/images/doctor-azimov.jpg';
  });

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(i18n.language === 'uz' ? 'Rasm hajmi 5MB dan oshmasligi kerak' : 'Image size must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        if (typeof base64 === 'string') {
          setCustomAvatar(base64);
          try {
            localStorage.setItem('dentuz_custom_avatar', base64);
          } catch (err) {
            console.warn('LocalStorage avatar save error:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetAvatar = (e) => {
    e.stopPropagation();
    setCustomAvatar('/images/doctor-azimov.jpg');
    try {
      localStorage.removeItem('dentuz_custom_avatar');
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

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setNotifOpen(false);
    if (item.link) {
      navigate(item.link);
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
      : ALL_SEARCH_ITEMS.filter((item) => item.category === 'patients');

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
      { key: 'patients', label: isEn ? 'Patients' : 'Bemorlar' },
      { key: 'pages', label: isEn ? 'Pages & Sections' : "Bo'limlar" },
      { key: 'actions', label: isEn ? 'Quick Actions' : 'Tezkor Amallar' }
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
                : (i18n.language === 'uz' ? 'DentUz Markaziy Klinika' : 'DentUz Central Clinic')}
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
                      <span className={styles.notifCountBadge}>{unreadCount} {i18n.language === 'uz' ? 'yangi' : 'new'}</span>
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
                    {i18n.language === 'uz' ? "O'qilmagan" : 'Unread'} ({unreadCount})
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
                      onClick={() => setNotifications([])}
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
                  title={i18n.language === 'uz' ? "Rasm qo'yish / o'zgartirish (+)" : "Upload / change photo (+)"}
                  style={{ overflow: 'hidden', padding: 0 }}
                >
                  <img
                    src={customAvatar}
                    alt={user?.name || 'Dr. Jasur Azimov'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '9999px' }}
                  />
                  {/* Telegram-style hover overlay with + */}
                  <div className={styles.avatarHoverOverlay}>
                    <span className={styles.avatarPlusIcon}>+</span>
                  </div>
                  <span className={styles.onlineBadge} />
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user?.shortName || 'Dr. Azimov'}</span>
                  <span className={styles.userRole}>
                    {i18n.language === 'uz'
                      ? (user?.title || "Bosh shifokor • Implantolog")
                      : (user?.titleEn || "Chief Physician • Implantologist")}
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
                      title={i18n.language === 'uz' ? "Rasm yuklash uchun bosing" : "Click to change photo"}
                    >
                      <img
                        src={customAvatar}
                        alt={user?.name || 'Dr. Jasur Azimov'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div className={styles.popAvatarHoverOverlay}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>photo_camera</span>
                      </div>
                    </div>
                    <div className={styles.popDoctorMeta}>
                      <div className={styles.popDoctorName}>{user?.name || 'Dr. Jasur Azimov'}</div>
                      <div className={styles.popDoctorRole}>{user?.title || 'Bosh shifokor • Stomatolog'}</div>
                      <div className={styles.avatarActionsRow}>
                        <button
                          type="button"
                          className={styles.changeAvatarBtn}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>photo_camera</span>
                          <span>{i18n.language === 'uz' ? "Rasm qo'yish" : 'Upload photo'}</span>
                        </button>
                        {customAvatar !== '/images/doctor-azimov.jpg' && (
                          <button
                            type="button"
                            className={styles.resetAvatarBtn}
                            onClick={handleResetAvatar}
                            title={i18n.language === 'uz' ? "Asliga qaytarish" : 'Reset to default'}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>restart_alt</span>
                          </button>
                        )}
                      </div>
                      <div className={styles.popDoctorClinic}>🏥 {user?.clinic || 'DentUz Markaziy Klinika'}</div>
                    </div>
                  </div>

                  <div className={styles.popInfoGrid}>
                    <div className={styles.popInfoItem}>
                      <span className={styles.popInfoLabel}>{i18n.language === 'uz' ? 'Elektron pochta' : 'Email'}</span>
                      <span className={styles.popInfoValue}>
                        {typeof user?.email === 'string' ? user.email : (user?.email?.email || 'j.azimov@dentuz.uz')}
                      </span>
                    </div>
                    <div className={styles.popInfoItem}>
                      <span className={styles.popInfoLabel}>{i18n.language === 'uz' ? 'Telefon raqam' : 'Phone'}</span>
                      <span className={styles.popInfoValue}>+998 (90) 123-45-67</span>
                    </div>
                    <div className={styles.popInfoItem}>
                      <span className={styles.popInfoLabel}>{i18n.language === 'uz' ? 'Klinika ID' : 'Clinic ID'}</span>
                      <span className={styles.popInfoValue} style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>#DENT-778</span>
                    </div>
                    <div className={styles.popInfoItem}>
                      <span className={styles.popInfoLabel}>{i18n.language === 'uz' ? 'Litsenziya' : 'License'}</span>
                      <span className={styles.popInfoValue}>SSV-UZ-2024-884</span>
                    </div>
                  </div>

                  <div className={styles.popDivider} />

                  <div className={styles.popNavActions}>
                    <Link
                      to="/settings"
                      className={styles.popActionLink}
                      onClick={() => setProfileOpen(false)}
                    >
                      <span className="material-symbols-outlined">tune</span>
                      <span>{i18n.language === 'uz' ? 'Klinika va profil sozlamalari' : 'Clinic & Profile Settings'}</span>
                    </Link>

                    <Link
                      to="/finance"
                      className={styles.popActionLink}
                      onClick={() => setProfileOpen(false)}
                    >
                      <span className="material-symbols-outlined">payments</span>
                      <span>{i18n.language === 'uz' ? 'Shifokor ulushi va hisob-kitob' : 'Doctor KPI & Compensation'}</span>
                    </Link>
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
                      <span>{i18n.language === 'uz' ? 'Tizimdan chiqish' : 'Sign Out'}</span>
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
    </>
  );
}
