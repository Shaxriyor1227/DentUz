import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useSidebar } from '../../context/SidebarContext';
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
  { id: 'p-1042', category: 'patients', type: 'Bemor', title: 'Anvar Qosimov', meta: '+998 90 842 11 00', keywords: 'p-1042 terapiya', path: '/patients/1042', icon: 'person' },
  { id: 'p-1043', category: 'patients', type: 'Bemor', title: 'Malika Saidova', meta: '+998 93 319 44 28', keywords: 'p-1043 ortopediya', path: '/patients', icon: 'person' },
  { id: 'p-1044', category: 'patients', type: 'Bemor', title: 'Jamshid Karimov', meta: '+998 97 712 33 44', keywords: 'p-1044 jarrohlik', path: '/patients', icon: 'person' },
  { id: 'p-1045', category: 'patients', type: 'Bemor', title: 'Shahnoza Aliyeva', meta: '+998 91 555 88 99', keywords: 'p-1045 ortodontiya', path: '/patients', icon: 'person' },
  { id: 'p-1046', category: 'patients', type: 'Bemor', title: 'Rustam Oripov', meta: '+998 90 123 45 67', keywords: 'p-1046 implantatsiya', path: '/patients', icon: 'person' },
  { id: 'p-1047', category: 'patients', type: 'Bemor', title: 'Nigora Zokirova', meta: '+998 94 888 22 11', keywords: 'p-1047 terapiya', path: '/patients', icon: 'person' },

  // Bo'limlar
  { id: 'nav-1', category: 'pages', type: "Bo'lim", title: 'Dashboard', meta: 'Statistika va tahlillar', keywords: 'asosiy analitika', path: '/dashboard', icon: 'grid_view' },
  { id: 'nav-2', category: 'pages', type: "Bo'lim", title: 'Bemorlar Bazasi', meta: "Bemorlar ro'yxati", keywords: 'kartalar ambulatoriya', path: '/patients', icon: 'group' },
  { id: 'nav-3', category: 'pages', type: "Bo'lim", title: 'Taqvim va Bandlik', meta: 'Qabullar jadvali', keywords: 'grafik navbat', path: '/calendar', icon: 'calendar_today' },
  { id: 'nav-4', category: 'pages', type: "Bo'lim", title: 'Davolash Rejasi', meta: 'Tish xaritasi va smeta', keywords: '3d reja stomatologiya', path: '/treatment-plan', icon: 'healing' },
  { id: 'nav-5', category: 'pages', type: "Bo'lim", title: 'Moliya va Hisoblar', meta: "Kassa va to'lovlar", keywords: 'invoys qarz payme', path: '/finance', icon: 'account_balance_wallet' },
  { id: 'nav-6', category: 'pages', type: "Bo'lim", title: 'Tizim Sozlamalari', meta: 'Klinika parametrlari', keywords: 'xodimlar servis', path: '/settings', icon: 'settings' },

  // Tezkor Amallar
  { id: 'act-1', category: 'actions', type: 'Amal', title: 'Yangi qabul belgilash', meta: 'Taqvimga kiritish', keywords: 'yozilish bron', path: '/calendar', icon: 'add_alarm' },
  { id: 'act-2', category: 'actions', type: 'Amal', title: "Yangi bemor ro'yxatga olish", meta: 'Karta ochish', keywords: 'bemor qoshish', path: '/patients', icon: 'person_add' },
  { id: 'act-3', category: 'actions', type: 'Amal', title: 'Davolash rejasini eksport qilish', meta: 'PDF hisobot', keywords: 'chop etish yuklab olish', path: '/treatment-plan', icon: 'picture_as_pdf' },
  { id: 'act-4', category: 'actions', type: 'Amal', title: 'Mavzuni almashtirish', meta: "Dark / Light rejim", keywords: 'tungi kunduzgi fon', actionType: 'toggle_theme', icon: 'dark_mode' }
];

export default function TopBar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { collapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayedNotifications = notifications.filter((n) => {
    if (notifFilter === 'unread') return !n.read;
    return true;
  });

  // Global hotkeys (ESC, Cmd+K)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (notifOpen) setNotifOpen(false);
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
  }, [notifOpen, searchOpen]);

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

  // Search Results filtering
  const flattenedResults = useMemo(() => {
    if (!searchQuery.trim()) return ALL_SEARCH_ITEMS;
    const q = searchQuery.toLowerCase().trim();
    return ALL_SEARCH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.meta && item.meta.toLowerCase().includes(q)) ||
        (item.keywords && item.keywords.toLowerCase().includes(q)) ||
        (item.type && item.type.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const groupedResults = useMemo(() => {
    const categories = [
      { key: 'patients', label: 'Bemorlar' },
      { key: 'pages', label: "Bo'limlar" },
      { key: 'actions', label: 'Tezkor Amallar' }
    ];
    return categories
      .map((cat) => ({
        category: cat.key,
        categoryLabel: cat.label,
        items: flattenedResults.filter((item) => item.category === cat.key)
      }))
      .filter((group) => group.items.length > 0);
  }, [flattenedResults]);

  useEffect(() => {
    if (searchOpen) {
      setSelectedIndex(0);
    }
  }, [searchOpen, searchQuery]);

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
    if (flattenedResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flattenedResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flattenedResults.length) % flattenedResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flattenedResults[selectedIndex]) {
        handleSelectResult(flattenedResults[selectedIndex]);
      }
    }
  };

  return (
    <>
      <header className={styles.topbar}>
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
            {user?.clinic || 'Toshkent Dental Clinic'}
          </span>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.searchWrapper} onClick={() => setSearchOpen(true)}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
            <input
              type="text"
              readOnly
              className={styles.searchInput}
              placeholder="Bemor, telefon yoki sahifani qidiring..."
              value={searchQuery}
            />
            <span className={styles.searchShortcut}>⌘K</span>
          </div>
        </div>

        <div className={styles.rightSection}>
          <button
            className={styles.themeToggleBtn}
            onClick={toggleTheme}
            title={theme === 'dark' ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish (Ko'zga qulay)"}
            type="button"
            aria-label="Toggle dark/light theme"
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <span className={styles.themeLabelText}>
              {theme === 'dark' ? 'Kunduzgi' : 'Tungi'}
            </span>
          </button>

          {/* Notifications Trigger & Dropdown */}
          <div className={styles.notifWrapper} ref={notifRef}>
            <button
              className={`${styles.iconBtn} ${notifOpen ? styles.iconBtnActive : ''}`}
              title="Bildirishnomalar"
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              aria-expanded={notifOpen}
              aria-label="Bildirishnomalar oynasi"
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
                    <span className={styles.notifTitle}>Bildirishnomalar</span>
                    {unreadCount > 0 && (
                      <span className={styles.notifCountBadge}>{unreadCount} yangi</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className={styles.markReadBtn}
                      onClick={handleMarkAllAsRead}
                    >
                      Barchasini o'qilgan qilish
                    </button>
                  )}
                </div>

                <div className={styles.notifTabs}>
                  <button
                    type="button"
                    className={`${styles.notifTab} ${notifFilter === 'all' ? styles.notifTabActive : ''}`}
                    onClick={() => setNotifFilter('all')}
                  >
                    Barchasi ({notifications.length})
                  </button>
                  <button
                    type="button"
                    className={`${styles.notifTab} ${notifFilter === 'unread' ? styles.notifTabActive : ''}`}
                    onClick={() => setNotifFilter('unread')}
                  >
                    O'qilmagan ({unreadCount})
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
                      <p>Yangi bildirishnomalar yo'q</p>
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
                    Taqvimga o'tish
                  </button>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      className={styles.clearNotifsBtn}
                      onClick={() => setNotifications([])}
                    >
                      Tozalash
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              <span className="material-symbols-outlined">person</span>
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.shortName || 'Dr. Azimov'}</span>
              <span className={styles.userRole}>{user?.title || 'Bosh shifokor'}</span>
            </div>
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
                autoFocus
                className={styles.spotlightInput}
                placeholder="Bemor, telefon, sahifa yoki amalni qidiring..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearQueryBtn}
                  onClick={() => setSearchQuery('')}
                  title="Tozalash"
                >
                  <span className="material-symbols-outlined">cancel</span>
                </button>
              )}
              <kbd className={styles.escBadge} onClick={() => setSearchOpen(false)}>
                ESC
              </kbd>
            </div>

            {/* Apple Spotlight Results List */}
            <div className={styles.spotlightResults}>
              {flattenedResults.length === 0 ? (
                <div className={styles.emptySpotlight}>
                  <span className="material-symbols-outlined">search_off</span>
                  <p>"{searchQuery}" bo'yicha hech narsa topilmadi</p>
                  <span>Bemor ismi, telefon raqami yoki bo'lim nomini tekshiring</span>
                </div>
              ) : (
                groupedResults.map((group) => (
                  <div key={group.category} className={styles.spotlightGroup}>
                    <div className={styles.spotlightGroupHeader}>
                      {group.categoryLabel}
                    </div>
                    {group.items.map((item) => {
                      const itemIndex = flattenedResults.findIndex((r) => r.id === item.id);
                      const isSelected = itemIndex === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          className={`${styles.spotlightItem} ${isSelected ? styles.spotlightItemSelected : ''}`}
                          onClick={() => handleSelectResult(item)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
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
                  <span>Harakatlanish</span>
                </span>
                <span className={styles.shortcutItem}>
                  <kbd className={styles.footerKey}>↵</kbd>
                  <span>Tanlash</span>
                </span>
                <span className={styles.shortcutItem}>
                  <kbd className={styles.footerKey}>ESC</kbd>
                  <span>Chiqish</span>
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
