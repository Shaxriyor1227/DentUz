import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appointmentsApi } from '../../api/appointmentsApi';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import Toast from '../../components/Toast/Toast';
import AppointmentPill from '../../components/AppointmentPill/AppointmentPill';
import styles from './Calendar.module.css';

const DAY_NAMES = [
  { key: 'mon', short: 'Dush', full: 'Dushanba' },
  { key: 'tue', short: 'Sesh', full: 'Seshanba' },
  { key: 'wed', short: 'Chor', full: 'Chorshanba' },
  { key: 'thu', short: 'Pay', full: 'Payshanba' },
  { key: 'fri', short: 'Juma', full: 'Juma' },
  { key: 'sat', short: 'Shan', full: 'Shanba' },
  { key: 'sun', short: 'Yak', full: 'Yakshanba' }
];

const MONTH_NAMES = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

// Categorized dental treatments
const TREATMENT_CATEGORIES = [
  {
    id: 'terapiya',
    name: 'Terapiya',
    procedures: [
      'Karies davolash',
      'Plomba almashtirish',
      'Tish nervini davolash (Endodontiya)',
      'Estetik restavratsiya'
    ]
  },
  {
    id: 'jarrohlik',
    name: 'Jarrohlik & Implant',
    procedures: [
      'Tish sug\'urish',
      'Implantatsiya tekshiruvi',
      'Sinus-lifting',
      'Milk davolash'
    ]
  },
  {
    id: 'ortodontiya',
    name: 'Ortodontiya',
    procedures: [
      'Breket korreksiyasi',
      'Elaynerlar tekshiruvi',
      'Ortodontik plastinka',
      'Tish qatori diagnostikasi'
    ]
  },
  {
    id: 'ortopediya',
    name: 'Ortopediya (Protez)',
    procedures: [
      'Sirkoniy toj o\'rnatish',
      'Keramik vinirlar',
      'Metallokeramika'
    ]
  },
  {
    id: 'gigiyena',
    name: 'Gigiyena & Estetika',
    procedures: [
      'Tish tozalash (Air-Flow)',
      'Ultratez tozalash',
      'Tish oqartirish (Zoom 4)',
      'Ftorlash muolajasi'
    ]
  },
  {
    id: 'diagnostika',
    name: 'Diagnostika',
    procedures: [
      'Birlamchi konsultatsiya',
      'Rentgen / R-grafiya',
      '3D Tomografiya (KT)'
    ]
  }
];

// Scalable list of clinic doctors
const CLINIC_DOCTORS = [
  { id: 'azimov', name: 'Dr. Azimov Farrux', role: 'Bosh shifokor • Stomatolog-terapevt', color: 'var(--color-mint)', initial: 'A' },
  { id: 'saidova', name: 'Dr. Saidova Malika', role: 'Terapevt • Ortodont', color: '#3B82F6', initial: 'S' },
  { id: 'karimov', name: 'Dr. Karimov Jamshid', role: 'Jarroh • Implantolog', color: '#F59E0B', initial: 'K' },
  { id: 'tursunov', name: 'Dr. Tursunov Bobur', role: 'Ortoped • Gnatolog', color: '#8B5CF6', initial: 'T' },
  { id: 'rasulova', name: 'Dr. Rasulova Nigora', role: 'Bolalar stomatologi', color: '#EC4899', initial: 'R' },
  { id: 'xalilov', name: 'Dr. Xalilov Otabek', role: 'Endodontist • Mikroskopist', color: '#06B6D4', initial: 'X' }
];

function formatYYYYMMDD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Uzbekistan Phone Formatter: +998 90 842 77 78
function formatUzbekPhone(value) {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  }
  digits = digits.slice(0, 9); // Max 9 digits

  let formatted = '+998';
  if (digits.length > 0) {
    formatted += ' ' + digits.slice(0, 2); // 2 digits: e.g. 90
  }
  if (digits.length > 2) {
    formatted += ' ' + digits.slice(2, 5); // 3 digits: e.g. 842
  }
  if (digits.length > 5) {
    formatted += ' ' + digits.slice(5, 7); // 2 digits: e.g. 77
  }
  if (digits.length > 7) {
    formatted += ' ' + digits.slice(7, 9); // 2 digits: e.g. 78
  }
  return formatted;
}

export default function Calendar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'day' | 'week' | 'month'
  const [viewMode, setViewMode] = useState('week');

  // Active Anchor Date: dynamic local date (Uzbekistan / current system date)
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Doctor Filter in Top Bar: 'all' | doctor id ('azimov', 'saidova', etc.)
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [topDoctorFilterOpen, setTopDoctorFilterOpen] = useState(false);
  const [topDoctorSearch, setTopDoctorSearch] = useState('');
  const topDoctorRef = useRef(null);

  // Drag & Drop
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [optimisticNotice, setOptimisticNotice] = useState(null);
  const [toastConfig, setToastConfig] = useState({ type: 'success', title: '' });

  // Current time tracker for the red time-indicator line
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);

  // Modal State - Simplified, High-Speed
  const [showModal, setShowModal] = useState(false);

  // Check navigation intent from Dashboard or other pages
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (location.state?.openNewModal || params.get('new') === '1') {
      setShowModal(true);
      if (location.state?.chair || params.get('chair')) {
        const chairVal = location.state?.chair || parseInt(params.get('chair'), 10);
        setNewApt((prev) => ({ ...prev, chair: chairVal }));
      }
      // Immediately clear state so browser back button does not re-open modal
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);
  const [newApt, setNewApt] = useState(() => {
    const today = new Date();
    const dayKey = DAY_NAMES[(today.getDay() + 6) % 7].key;
    return {
      patientName: '',
      patientPhone: '',
      procedure: 'Karies davolash',
      doctor: 'azimov',
      date: formatYYYYMMDD(today),
      day: dayKey,
      time: '12:00'
    };
  });

  // Category & Scalable Doctor Selector states
  const [selectedCategory, setSelectedCategory] = useState('terapiya');
  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState('');
  const doctorSelectRef = useRef(null);

  // Chairs View & Apple Quick-Add Popover State
  const [quickAddSlot, setQuickAddSlot] = useState(null); // { chair, time, date }

  // TODO: totalChairs hozircha faqat shu brauzerda saqlanadi (localStorage), keyinchalik Clinic.totalChairs backend maydoniga ko'chirilishi kerak
  const totalChairs = useMemo(() => {
    const saved = localStorage.getItem('dentuz_clinic_chairs');
    const parsed = saved ? parseInt(saved, 10) : 7;
    return isNaN(parsed) || parsed < 1 ? 7 : parsed;
  }, []);

  // Operatory chairs list: union of range(1, totalChairs) and any chair numbers present in appointments for active day
  const operatoryChairs = useMemo(() => {
    const chairsSet = new Set(Array.from({ length: totalChairs }, (_, i) => i + 1));
    const activeDate = formatYYYYMMDD(currentDate);
    const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][currentDate.getDay()];
    appointments.forEach((a) => {
      const isForDay = a.date ? a.date === activeDate : a.day === dayKey;
      if (isForDay) {
        const chairNum = parseInt(a.chair, 10);
        if (!isNaN(chairNum) && chairNum > 0) {
          chairsSet.add(chairNum);
        }
      }
    });
    return Array.from(chairsSet).sort((a, b) => a - b);
  }, [totalChairs, appointments, currentDate]);

  const handleOpenChairSlot = (chairNum, slotTime, dateStr) => {
    setNewApt((prev) => ({
      ...prev,
      chair: chairNum,
      time: slotTime || '10:00',
      date: dateStr || formatYYYYMMDD(currentDate)
    }));
    setQuickAddSlot({
      chair: chairNum,
      time: slotTime || '10:00',
      date: dateStr || formatYYYYMMDD(currentDate)
    });
  };

  const getChairAppointmentsForHour = (dateStr, dayKey, chairNum, slotTime) => {
    const slotHour = parseInt(slotTime.split(':')[0], 10);
    return filteredAppointments.filter((a) => {
      if (a.chair !== chairNum) return false;
      const aptHour = parseInt(a.time.split(':')[0], 10);
      if (aptHour !== slotHour) return false;
      if (a.date && dateStr) return a.date === dateStr;
      return a.day === dayKey;
    });
  };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await appointmentsApi.getAll();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handle ESC key and outside click for doctor dropdown / top doctor filter / modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (topDoctorFilterOpen) {
          setTopDoctorFilterOpen(false);
        } else if (doctorDropdownOpen) {
          setDoctorDropdownOpen(false);
        } else if (showModal) {
          setShowModal(false);
        }
      }
    };
    const handleOutsideClick = (e) => {
      if (topDoctorRef.current && !topDoctorRef.current.contains(e.target)) {
        setTopDoctorFilterOpen(false);
      }
      if (doctorSelectRef.current && !doctorSelectRef.current.contains(e.target)) {
        setDoctorDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showModal, doctorDropdownOpen, topDoctorFilterOpen]);

  // Filter appointments by selected doctor
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (selectedDoctor === 'all') return true;
      return apt.doctor === selectedDoctor;
    });
  }, [appointments, selectedDoctor]);

  // Active category object
  const activeCategory = useMemo(() => {
    return TREATMENT_CATEGORIES.find((c) => c.id === selectedCategory) || TREATMENT_CATEGORIES[0];
  }, [selectedCategory]);

  // Active doctor object in modal
  const activeModalDoctor = useMemo(() => {
    return CLINIC_DOCTORS.find((d) => d.id === newApt.doctor) || CLINIC_DOCTORS[0];
  }, [newApt.doctor]);

  // Filtered doctors for modal dropdown search
  const filteredClinicDoctors = useMemo(() => {
    if (!doctorSearch.trim()) return CLINIC_DOCTORS;
    const q = doctorSearch.toLowerCase();
    return CLINIC_DOCTORS.filter(
      (d) => d.name.toLowerCase().includes(q) || d.role.toLowerCase().includes(q)
    );
  }, [doctorSearch]);

  // Filtered doctors for top bar dropdown search
  const filteredTopDoctors = useMemo(() => {
    if (!topDoctorSearch.trim()) return CLINIC_DOCTORS;
    const q = topDoctorSearch.toLowerCase();
    return CLINIC_DOCTORS.filter(
      (d) => d.name.toLowerCase().includes(q) || d.role.toLowerCase().includes(q)
    );
  }, [topDoctorSearch]);

  // Today string for real-time comparison
  const todayStr = useMemo(() => formatYYYYMMDD(new Date()), []);

  // Compute 7 days of the current week around currentDate
  const weekDays = useMemo(() => {
    const dayOfWeek = currentDate.getDay(); // 0 is Sun, 1 is Mon...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + diffToMonday);

    return DAY_NAMES.map((dn, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateString = formatYYYYMMDD(d);
      const isToday = dateString === todayStr;
      const isSelected = dateString === formatYYYYMMDD(currentDate);
      return {
        key: dn.key,
        name: t(`calendar.daysShort.${dn.key}`),
        fullName: t(`calendar.days.${dn.key}`),
        num: d.getDate(),
        date: dateString,
        dateObj: d,
        isToday,
        isSelected
      };
    });
  }, [currentDate, todayStr, t]);

  // Compute calendar grid for Month View
  const monthGridDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
    const totalDays = lastDayOfMonth.getDate();

    const days = [];

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const dStr = formatYYYYMMDD(d);
      days.push({
        dateObj: d,
        num: d.getDate(),
        dateStr: dStr,
        isCurrentMonth: false,
        isToday: dStr === todayStr
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      const dStr = formatYYYYMMDD(d);
      days.push({
        dateObj: d,
        num: i,
        dateStr: dStr,
        isCurrentMonth: true,
        isToday: dStr === todayStr
      });
    }

    // Next month filler days
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dStr = formatYYYYMMDD(d);
      days.push({
        dateObj: d,
        num: i,
        dateStr: dStr,
        isCurrentMonth: false,
        isToday: dStr === todayStr
      });
    }

    return days;
  }, [currentDate, todayStr]);

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === 'day' || viewMode === 'chairs') {
        next.setDate(prev.getDate() - 1);
      } else if (viewMode === 'week') {
        next.setDate(prev.getDate() - 7);
      } else if (viewMode === 'month') {
        next.setMonth(prev.getMonth() - 1);
      }
      return next;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === 'day' || viewMode === 'chairs') {
        next.setDate(prev.getDate() + 1);
      } else if (viewMode === 'week') {
        next.setDate(prev.getDate() + 7);
      } else if (viewMode === 'month') {
        next.setMonth(prev.getMonth() + 1);
      }
      return next;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Header Title & Badge
  const headerDateText = useMemo(() => {
    const isEn = i18n.language === 'en';
    const EN_MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const EN_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const months = isEn ? EN_MONTHS : MONTH_NAMES;
    const days = isEn ? EN_DAYS : DAY_NAMES.map((d) => d.full);

    if (viewMode === 'day') {
      const dayName = days[(currentDate.getDay() + 6) % 7];
      return `${currentDate.getDate()}-${months[currentDate.getMonth()]}, ${currentDate.getFullYear()} (${dayName})`;
    } else if (viewMode === 'chairs') {
      return `${months[currentDate.getMonth()]}, ${currentDate.getFullYear()}`;
    } else if (viewMode === 'week') {
      const first = weekDays[0];
      const last = weekDays[6];
      if (first.dateObj.getMonth() === last.dateObj.getMonth()) {
        return `${first.num} – ${last.num} ${months[first.dateObj.getMonth()]}, ${first.dateObj.getFullYear()}`;
      } else {
        return `${first.num} ${months[first.dateObj.getMonth()]} – ${last.num} ${months[last.dateObj.getMonth()]}, ${last.dateObj.getFullYear()}`;
      }
    } else {
      return `${months[currentDate.getMonth()]}, ${currentDate.getFullYear()}`;
    }
  }, [viewMode, currentDate, weekDays, i18n.language]);

  const headerBadgeText = useMemo(() => {
    if (viewMode === 'day') return i18n.language === 'en' ? 'Daily Schedule' : 'Kunlik jadval';
    if (viewMode === 'week') return i18n.language === 'en' ? 'Weekly View' : 'Haftalik reja';
    if (viewMode === 'chairs') return i18n.language === 'en' ? 'Chairs / Operatories' : 'Kreslolar / Operatories';
    return i18n.language === 'en' ? 'Monthly View' : 'Oylik reja';
  }, [viewMode, i18n.language]);

  // Open modal pre-filled with day/time slot
  const handleOpenSlot = (dayKey, dateStr, slotTime) => {
    setNewApt((prev) => ({
      ...prev,
      day: dayKey || 'fri',
      date: dateStr || formatYYYYMMDD(currentDate),
      time: slotTime || '10:00'
    }));
    setShowModal(true);
  };

  // Drag & Drop
  const handleDragStart = (e, aptId) => {
    e.dataTransfer.setData('text/plain', aptId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, dayKey, slotTime) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverSlot || dragOverSlot.dayKey !== dayKey || dragOverSlot.slotTime !== slotTime) {
      setDragOverSlot({ dayKey, slotTime });
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverSlot(null);
  };

  const handleDrop = async (e, targetDay, targetDate, targetTime) => {
    e.preventDefault();
    setDragOverSlot(null);
    const aptId = e.dataTransfer.getData('text/plain');
    if (!aptId) return;

    const aptToMove = appointments.find((a) => a.id === aptId);
    if (!aptToMove) return;

    const previousState = [...appointments];

    // Optimistic UI update
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === aptId
          ? { ...a, day: targetDay, date: targetDate, time: targetTime }
          : a
      )
    );

    setOptimisticNotice(
      `Qabul (${aptToMove.patientName}) vaqti ${targetTime} ga ko'chirildi.`
    );
    setTimeout(() => setOptimisticNotice(null), 3000);

    try {
      await appointmentsApi.update(aptId, {
        day: targetDay,
        date: targetDate,
        time: targetTime
      });
    } catch (err) {
      setAppointments(previousState);
      setToastConfig({ type: 'error', title: 'Qabul ko\'chirilmadi' });
      setOptimisticNotice("Xatolik yuz berdi: Qabul ko'chirilishi bekor qilindi!");
    }
  };

  // Create Appointment
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!newApt.patientName.trim()) {
      setToastConfig({ type: 'warning', title: 'Bemor ismi kiritilmadi' });
      setOptimisticNotice('Iltimos, yangi qabul uchun bemor ismini kiriting.');
      return;
    }

    try {
      const doc = CLINIC_DOCTORS.find((d) => d.id === newApt.doctor) || CLINIC_DOCTORS[0];
      const created = await appointmentsApi.create({
        ...newApt,
        doctorName: doc.name,
        color: doc.color
      });
      setAppointments((prev) => [...prev, created]);
      setShowModal(false);

      setToastConfig({ type: 'success', title: t('calendar.scheduleUpdated') });
      setOptimisticNotice(
        `Yangi qabul (${newApt.patientName} - ${newApt.time}) muvaffaqiyatli saqlandi!`
      );
      setTimeout(() => setOptimisticNotice(null), 3500);

      // Reset form
      setNewApt({
        patientName: '',
        patientPhone: '',
        procedure: 'Karies davolash',
        doctor: 'azimov',
        date: formatYYYYMMDD(currentDate),
        day: 'fri',
        time: '12:00'
      });
    } catch (err) {
      setToastConfig({ type: 'error', title: 'Saqlashda xatolik' });
      setOptimisticNotice(err.message || 'Xatolik yuz berdi');
    }
  };

  // Helper to match appointment to date or day
  const getSlotAppointments = (dayKey, dateStr, slotTime) => {
    const slotHour = parseInt(slotTime.split(':')[0], 10);
    return filteredAppointments.filter((a) => {
      const aptHour = parseInt(a.time.split(':')[0], 10);
      const isSameHour = aptHour === slotHour;
      if (!isSameHour) return false;

      if (a.date && dateStr) {
        return a.date === dateStr;
      }
      return a.day === dayKey;
    });
  };

  // Helper for Day View appointments
  const getDayAppointmentsForHour = (dateStr, dayKey, hourStr) => {
    const hour = parseInt(hourStr.split(':')[0], 10);
    return filteredAppointments.filter((a) => {
      const aptHour = parseInt(a.time.split(':')[0], 10);
      if (aptHour !== hour) return false;
      if (a.date && dateStr) return a.date === dateStr;
      return a.day === dayKey;
    });
  };

  // Active day statistics for Day View
  const activeDayKey = DAY_NAMES[(currentDate.getDay() + 6) % 7].key;
  const activeDateStr = formatYYYYMMDD(currentDate);
  const activeDayAppts = useMemo(() => {
    return filteredAppointments.filter((a) =>
      a.date ? a.date === activeDateStr : a.day === activeDayKey
    );
  }, [filteredAppointments, activeDateStr, activeDayKey]);

  const dayStats = useMemo(() => {
    const total = activeDayAppts.length;
    const completed = activeDayAppts.filter((a) => a.status === 'completed').length;
    const inProgress = activeDayAppts.filter((a) => a.status === 'in_progress').length;
    const pending = activeDayAppts.filter((a) => a.status === 'pending' || !a.status).length;
    return { total, completed, inProgress, pending };
  }, [activeDayAppts]);

  return (
    <div className={styles.pageContainer}>
      {/* Top Command & Filter Bar */}
      <div className={styles.topBar}>
        <div className={styles.leftControls}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>{t('calendar.title')}</h1>
            <span className={styles.badge}>{headerBadgeText}</span>
          </div>

          <div className={styles.dateRangeNav}>
            <button
              type="button"
              className={styles.navArrowBtn}
              onClick={handlePrev}
              title={i18n.language === 'en' ? 'Previous' : 'Oldingi'}
              aria-label="Previous period"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                chevron_left
              </span>
            </button>
            <span className={styles.dateRangeText}>{headerDateText}</span>
            <button
              type="button"
              className={styles.navArrowBtn}
              onClick={handleNext}
              title={i18n.language === 'en' ? 'Next' : 'Keyingi'}
              aria-label="Next period"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                chevron_right
              </span>
            </button>
            <button
              type="button"
              className={styles.todayBtn}
              onClick={handleToday}
              title={t('calendar.todayBtn')}
            >
              {t('calendar.todayBtn')}
            </button>
          </div>

          {/* View Mode Switcher: Kun | Hafta | Oy */}
          <div className={styles.viewModeGroup}>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${viewMode === 'day' ? styles.viewModeBtnActive : ''}`}
              onClick={() => setViewMode('day')}
            >
              {t('calendar.viewDay')}
            </button>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${viewMode === 'week' ? styles.viewModeBtnActive : ''}`}
              onClick={() => setViewMode('week')}
            >
              {t('calendar.viewWeek')}
            </button>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${viewMode === 'month' ? styles.viewModeBtnActive : ''}`}
              onClick={() => setViewMode('month')}
            >
              {t('calendar.viewMonth')}
            </button>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${viewMode === 'chairs' ? styles.viewModeBtnActive : ''}`}
              onClick={() => setViewMode('chairs')}
            >
              {i18n.language === 'en' ? 'Chairs' : 'Kreslolar'}
            </button>
          </div>
        </div>

        <div className={styles.rightControls}>
          {/* Scalable Doctor Selector Dropdown (Like Image 4) */}
          <div className={styles.topDoctorFilter} ref={topDoctorRef}>
            <button
              type="button"
              className={`${styles.topDoctorTrigger} ${topDoctorFilterOpen ? styles.topDoctorTriggerActive : ''}`}
              onClick={() => setTopDoctorFilterOpen((prev) => !prev)}
              title={t('calendar.allDoctors')}
            >
              {selectedDoctor === 'all' ? (
                <>
                  <span style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: 'var(--color-cyan)', flexShrink: 0 }} />
                  <span className={styles.topDoctorName}>{t('calendar.allDoctors')}</span>
                </>
              ) : (
                (() => {
                  const doc = CLINIC_DOCTORS.find((d) => d.id === selectedDoctor) || CLINIC_DOCTORS[0];
                  return (
                    <>
                      <div className={styles.topDoctorAvatar} style={{ backgroundColor: doc.color }}>
                        {doc.initial}
                      </div>
                      <span className={styles.topDoctorName}>{doc.name}</span>
                    </>
                  );
                })()
              )}
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-outline)', marginLeft: 4 }}>
                {topDoctorFilterOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {topDoctorFilterOpen && (
              <div className={styles.topDoctorPopover}>
                <div className={styles.topDoctorSearchBox}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-outline)' }}>
                    search
                  </span>
                  <input
                    type="text"
                    placeholder={t('calendar.searchDoctor')}
                    value={topDoctorSearch}
                    onChange={(e) => setTopDoctorSearch(e.target.value)}
                    className={styles.topDoctorSearchInput}
                    autoFocus
                  />
                  {topDoctorSearch && (
                    <button
                      type="button"
                      onClick={() => setTopDoctorSearch('')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--color-text-muted)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                    </button>
                  )}
                </div>

                <div className={styles.topDoctorList}>
                  <div
                    className={`${styles.topDoctorItem} ${selectedDoctor === 'all' ? styles.topDoctorItemActive : ''}`}
                    onClick={() => {
                      setSelectedDoctor('all');
                      setTopDoctorFilterOpen(false);
                      setTopDoctorSearch('');
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: 'var(--color-cyan)', flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {t('calendar.allDoctors')}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {t('calendar.clinicTotal', { count: CLINIC_DOCTORS.length })}
                        </span>
                      </div>
                    </div>
                    {selectedDoctor === 'all' && (
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-cyan)' }}>
                        check
                      </span>
                    )}
                  </div>

                  {filteredTopDoctors.map((doc) => {
                    const isSelected = selectedDoctor === doc.id;
                    return (
                      <div
                        key={doc.id}
                        className={`${styles.topDoctorItem} ${isSelected ? styles.topDoctorItemActive : ''}`}
                        onClick={() => {
                          setSelectedDoctor(doc.id);
                          setTopDoctorFilterOpen(false);
                          setTopDoctorSearch('');
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className={styles.topDoctorAvatar} style={{ backgroundColor: doc.color }}>
                            {doc.initial}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {doc.name}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {doc.role}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-cyan)' }}>
                            check
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className={styles.newApptBtn}
            onClick={() => {
              setNewApt((prev) => ({
                ...prev,
                date: formatYYYYMMDD(currentDate)
              }));
              setShowModal(true);
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              add
            </span>
            <span>{t('calendar.newAppointment')}</span>
          </button>
        </div>
      </div>

      {/* Floating Side Toast Notification */}
      <Toast
        open={Boolean(optimisticNotice)}
        title={toastConfig.title || t('calendar.scheduleUpdated')}
        message={optimisticNotice}
        type={toastConfig.type || 'success'}
        duration={3500}
        onClose={() => {
          setOptimisticNotice(null);
          setToastConfig({ type: 'success', title: '' });
        }}
      />

      {/* Main Calendar Card */}
      <div className={styles.calendarCard}>
        {loading ? (
          <div style={{ padding: '28px' }}>
            <SkeletonLoader type="card" height="420px" />
          </div>
        ) : (
          <>
            {/* 1. WEEK VIEW */}
            {viewMode === 'week' && (
              <div className={styles.calendarGrid}>
                {/* Header: 7 Days */}
                <div className={styles.headerRow}>
                  <div className={styles.timeHeaderCorner}>{t('calendar.timeSlot')}</div>
                  {weekDays.map((day) => (
                    <div
                      key={day.key}
                      className={`${styles.dayHeaderCell} ${day.isToday ? styles.dayHeaderCellToday : ''}`}
                      onClick={() => {
                        setCurrentDate(day.dateObj);
                        setViewMode('day');
                      }}
                      title={i18n.language === 'en' ? `View ${day.fullName} schedule` : `${day.fullName} kunlik jadvalini ko'rish`}
                    >
                      <span className={`${styles.dayName} ${day.isToday ? styles.dayNameToday : ''}`}>
                        {day.name}
                      </span>
                      <span className={`${styles.dayNumber} ${day.isToday ? styles.dayNumberToday : ''}`}>
                        {day.num}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Hourly Slots */}
                {TIME_SLOTS.map((slotTime) => (
                  <div key={slotTime} className={styles.timeSlotRow}>
                    <div className={styles.timeLabelCell}>{slotTime}</div>

                    {weekDays.map((day) => {
                      const isDragTarget =
                        dragOverSlot &&
                        dragOverSlot.dayKey === day.key &&
                        dragOverSlot.slotTime === slotTime;

                      const slotAppointments = getSlotAppointments(day.key, day.date, slotTime);

                      return (
                        <div
                          key={day.key}
                          className={`${styles.slotCell} ${isDragTarget ? styles.slotCellDragOver : ''} ${day.isToday ? styles.slotCellToday : ''}`}
                          onDragOver={(e) => handleDragOver(e, day.key, slotTime)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, day.key, day.date, slotTime)}
                          onClick={(e) => {
                            if (e.target === e.currentTarget) {
                              handleOpenSlot(day.key, day.date, slotTime);
                            }
                          }}
                        >
                          {/* Current-time indicator line inside today's column */}
                          {day.isToday && (() => {
                            const slotHour = parseInt(slotTime.split(':')[0], 10);
                            const nowHour = currentTime.getHours();
                            const nowMin = currentTime.getMinutes();
                            const showLine = nowHour === slotHour;
                            if (!showLine) return null;
                            const pct = (nowMin / 60) * 100;
                            return (
                              <div className={styles.timeIndicatorLine} style={{ top: `${pct}%` }}>
                                <div className={styles.timeIndicatorDot} />
                              </div>
                            );
                          })()}
                          {slotAppointments.length === 0 && (
                            <div
                              className={styles.slotAddHint}
                              onClick={() => handleOpenSlot(day.key, day.date, slotTime)}
                            >
                              <span className={styles.slotAddBtn}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                  add
                                </span>
                                Qabul
                              </span>
                            </div>
                          )}

                          {slotAppointments.map((apt) => (
                            <AppointmentPill
                              key={apt.id}
                              appointment={apt}
                              variant="week"
                              draggable
                              onDragStart={handleDragStart}
                              onClick={(e, a) => {
                                e.stopPropagation();
                                navigate(`/patients/${a.patientId?.replace('P-', '') || ''}`);
                              }}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* 2. DAY VIEW (KUNLIK JADVAL) */}
            {viewMode === 'day' && (
              <div className={styles.dayViewWrapper}>
                {/* 7-Day Fast Switcher Strip */}
                <div className={styles.dayTabsStrip}>
                  {weekDays.map((day) => {
                    const dayApptsCount = filteredAppointments.filter((a) =>
                      a.date ? a.date === day.date : a.day === day.key
                    ).length;

                    return (
                      <button
                        key={day.key}
                        type="button"
                        className={`${styles.dayTabItem} ${day.isSelected ? styles.dayTabItemActive : ''} ${day.isToday ? styles.dayTabItemToday : ''}`}
                        onClick={() => setCurrentDate(day.dateObj)}
                      >
                        <span className={styles.dayTabName}>{day.fullName}</span>
                        <span className={styles.dayTabNum}>{day.num}</span>
                        {dayApptsCount > 0 && (
                          <span className={styles.dayTabCountBadge}>{dayApptsCount} qabul</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Day Summary Stats Bar */}
                <div className={styles.dayStatsBar}>
                  <div className={styles.dayDateInfo}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--color-cyan)' }}>
                      event_available
                    </span>
                    <div>
                      <span className={styles.dayDateTitle}>
                        {currentDate.getDate()}-{MONTH_NAMES[currentDate.getMonth()]}, {currentDate.getFullYear()} ({DAY_NAMES[(currentDate.getDay() + 6) % 7].full})
                      </span>
                    </div>
                  </div>

                  <div className={styles.dayPillsGroup}>
                    <span className={styles.daySummaryPill}>
                      <strong>{dayStats.total}</strong> jami qabul
                    </span>
                    <span
                      className={styles.daySummaryPill}
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#059669',
                        borderColor: 'rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: '#10B981' }} />
                      <strong>{dayStats.completed}</strong> {t('treatmentPlan.statusLabels.completed').toLowerCase()}
                    </span>
                    <span
                      className={styles.daySummaryPill}
                      style={{
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        color: 'var(--color-cyan-hover)',
                        borderColor: 'rgba(6, 182, 212, 0.25)'
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: 'var(--color-cyan)' }} />
                      <strong>{dayStats.inProgress}</strong> {t('calendar.inProgress')}
                    </span>
                    <span className={styles.daySummaryPill}>
                      <span style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: '#94A3B8' }} />
                      <strong>{dayStats.pending}</strong> {t('calendar.pending')}
                    </span>
                  </div>
                </div>

                {/* Hourly Timeline */}
                <div className={styles.dayTimeline}>
                  {TIME_SLOTS.map((slotTime) => {
                    const slotAppts = getDayAppointmentsForHour(activeDateStr, activeDayKey, slotTime);

                    return (
                      <div key={slotTime} className={styles.daySlotRow}>
                        <div className={styles.dayHourColumn}>
                          <span className={styles.dayHourLabel}>{slotTime}</span>
                        </div>

                        <div className={styles.daySlotAppts}>
                          {slotAppts.length === 0 ? (
                            <button
                              type="button"
                              className={styles.daySlotEmptyAction}
                              onClick={() => handleOpenSlot(activeDayKey, activeDateStr, slotTime)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-cyan)' }}>
                                add_circle
                              </span>
                              <span>{t('calendar.emptySlot', { time: slotTime })}</span>
                            </button>
                          ) : (
                            slotAppts.map((apt) => (
                              <AppointmentPill
                                key={apt.id}
                                appointment={apt}
                                variant="day"
                                onClick={() => navigate(`/patients/${apt.patientId?.replace('P-', '') || ''}`)}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. MONTH VIEW (OYLIK REJA) */}
            {viewMode === 'month' && (
              <div className={styles.monthViewWrapper}>
                {/* Month Day Headers */}
                <div className={styles.monthHeaderRow}>
                  {DAY_NAMES.map((d) => (
                    <div key={d.key} className={styles.monthHeaderCell}>
                      {t(`calendar.days.${d.key}`)}
                    </div>
                  ))}
                </div>

                {/* 35-42 Grid of Month Days */}
                <div className={styles.monthMatrixGrid}>
                  {monthGridDays.map((cell, idx) => {
                    const dayKey = DAY_NAMES[(cell.dateObj.getDay() + 6) % 7].key;
                    const dayAppts = filteredAppointments.filter((a) => {
                      if (a.date) return a.date === cell.dateStr;
                      return cell.isCurrentMonth && a.day === dayKey;
                    });

                    return (
                      <div
                        key={idx}
                        className={`${styles.monthDayCell} ${!cell.isCurrentMonth ? styles.monthDayCellOther : ''} ${cell.isToday ? styles.monthDayCellToday : ''}`}
                        onClick={() => {
                          setCurrentDate(cell.dateObj);
                          setViewMode('day');
                        }}
                      >
                        <div className={styles.monthDayHeader}>
                          <span
                            className={`${styles.monthDayNum} ${cell.isToday ? styles.monthDayNumToday : ''}`}
                          >
                            {cell.num}
                          </span>
                          {dayAppts.length > 0 && (
                            <span className={styles.monthCountBadge}>
                              {t('calendar.appointmentsCount', { count: dayAppts.length })}
                            </span>
                          )}
                        </div>

                        <div className={styles.monthApptList}>
                          {dayAppts.slice(0, 3).map((apt) => (
                            <AppointmentPill
                              key={apt.id}
                              appointment={apt}
                              variant="month"
                              onClick={() => {
                                setCurrentDate(cell.dateObj);
                                setViewMode('day');
                              }}
                            />
                          ))}
                          {dayAppts.length > 3 && (
                            <div className={styles.monthMoreBadge}>
                              {t('calendar.moreAppointments', { count: dayAppts.length - 3 })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. CHAIRS VIEW (KRESLOLAR / OPERATORIES JADVALI) */}
            {viewMode === 'chairs' && (
              <div className={styles.chairsViewWrapper}>
                {/* 1. Independent Full-Width Day Selector Strip (MON-SUN, Week View Style) */}
                <div className={styles.chairsDayTabsStrip}>
                  {weekDays.map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      className={`${styles.chairsDayTabCell} ${day.isSelected ? styles.chairsDayTabCellActive : ''} ${day.isToday ? styles.dayHeaderCellToday : ''}`}
                      onClick={() => setCurrentDate(day.dateObj)}
                      title={i18n.language === 'en' ? `View ${day.fullName} schedule` : `${day.fullName} kunlik jadvalini ko'rish`}
                    >
                      <span className={`${styles.dayName} ${day.isToday ? styles.dayNameToday : ''}`}>
                        {day.name}
                      </span>
                      <span className={`${styles.dayNumber} ${day.isToday ? styles.dayNumberToday : ''}`}>
                        {day.num}
                      </span>
                    </button>
                  ))}
                </div>

                {/* 2. Independent Horizontally Scrollable Operatories Grid Container */}
                <div className={styles.chairsScrollContainer}>
                  {/* Chair Column Headers */}
                  <div
                    className={styles.chairsHeaderRow}
                    style={{ gridTemplateColumns: `70px repeat(${operatoryChairs.length}, minmax(180px, 1fr))` }}
                  >
                    <div className={styles.chairsTimeHeaderCell}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>schedule</span>
                    </div>
                    {operatoryChairs.map((chairNum) => {
                      const chairApptsToday = filteredAppointments.filter(
                        (a) => a.chair === chairNum && (a.date ? a.date === activeDateStr : a.day === activeDayKey)
                      ).length;

                      return (
                        <div key={chairNum} className={styles.chairsHeaderCell}>
                          <div className={styles.chairBadgeGroup}>
                            <div className={styles.chairHeaderIconSquircle}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                airline_seat_recline_extra
                              </span>
                            </div>
                            <div>
                              <div className={styles.chairHeaderTitle}>
                                {t('dashboard.chair')} #{chairNum}
                              </div>
                            </div>
                          </div>
                          <span className={styles.chairOccupancyBadge}>
                            {chairApptsToday > 0
                              ? `${chairApptsToday} ${t('common.qty')}`
                              : (i18n.language === 'en' ? 'Empty' : "Bo'sh")}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Hourly Timeline Grid by Chair */}
                  <div className={styles.chairsGridBody}>
                    {TIME_SLOTS.map((slotTime) => (
                      <div
                        key={slotTime}
                        className={styles.chairsSlotRow}
                        style={{ gridTemplateColumns: `70px repeat(${operatoryChairs.length}, minmax(180px, 1fr))` }}
                      >
                        <div className={styles.chairsHourCol}>
                          <span>{slotTime}</span>
                        </div>

                        {operatoryChairs.map((chairNum) => {
                          const cellAppts = getChairAppointmentsForHour(activeDateStr, activeDayKey, chairNum, slotTime);

                          return (
                            <div
                              key={chairNum}
                              className={styles.chairsCellSlot}
                              onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                  handleOpenChairSlot(chairNum, slotTime, activeDateStr);
                                }
                              }}
                            >
                              {cellAppts.length === 0 ? (
                                <div
                                  className={styles.chairsSlotEmpty}
                                  onClick={() => handleOpenChairSlot(chairNum, slotTime, activeDateStr)}
                                >
                                  <span className={styles.chairsEmptyAddBtn}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>add</span>
                                    <span>Qabul</span>
                                  </span>
                                </div>
                              ) : (
                                cellAppts.map((apt) => (
                                  <AppointmentPill
                                    key={apt.id}
                                    appointment={apt}
                                    variant="chairs"
                                    onClick={(e, a) => {
                                      e.stopPropagation();
                                      navigate(`/patients/${a.patientId?.replace('P-', '') || ''}`);
                                    }}
                                  />
                                ))
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* SIMPLIFIED, USER-FRIENDLY MODAL: "Yangi qabul belgilash" */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modalWindow} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeaderBar}>
              <div className={styles.modalHeaderTitleArea}>
                <div className={styles.modalIconBox}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                    calendar_add_on
                  </span>
                </div>
                <div>
                  <h2 className={styles.modalMainTitle}>{t('calendar.modal.title')}</h2>
                  <p className={styles.modalSubTitle}>
                    {t('calendar.modal.subtitle')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setShowModal(false)}
                title={i18n.language === 'en' ? 'Close (Esc)' : 'Yopish (Esc)'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  close
                </span>
              </button>
            </div>

            {/* Simplified Form */}
            <form onSubmit={handleCreateAppointment} className={styles.modalForm}>
              <div className={styles.modalFormBody}>
                {/* 1. Patient Name Input */}
              <div className={styles.formFieldGroup}>
                <label className={styles.fieldLabel}>{t('calendar.modal.patient')}</label>
                <div className={styles.fieldInputWrapper}>
                  <span className={`material-symbols-outlined ${styles.fieldIcon}`}>person</span>
                  <input
                    required
                    type="text"
                    placeholder={t('calendar.modal.patientPlaceholder')}
                    value={newApt.patientName}
                    onChange={(e) => setNewApt({ ...newApt, patientName: e.target.value })}
                    className={styles.formTextInput}
                    autoFocus
                  />
                </div>
              </div>

              {/* 2. Patient Phone with Uzbek automatic mask (+998 XX XXX XX XX) */}
              <div className={styles.formFieldGroup}>
                <label className={styles.fieldLabel}>{t('calendar.modal.phone')}</label>
                <div className={styles.fieldInputWrapper}>
                  <span className={`material-symbols-outlined ${styles.fieldIcon}`}>call</span>
                  <input
                    type="tel"
                    placeholder="+998 xx xxx xx xx"
                    value={newApt.patientPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val || val === '+' || val === '+9' || val === '+99' || val === '+998' || val === '+998 ' || val.trim() === '') {
                        setNewApt({ ...newApt, patientPhone: '' });
                        return;
                      }
                      setNewApt({ ...newApt, patientPhone: formatUzbekPhone(val) });
                    }}
                    onFocus={() => {
                      if (!newApt.patientPhone) {
                        setNewApt((prev) => ({ ...prev, patientPhone: '+998 ' }));
                      }
                    }}
                    className={styles.formTextInput}
                  />
                </div>
              </div>

              {/* 3. Treatment with Categories & Procedures Selection */}
              <div className={styles.formFieldGroup}>
                <label className={styles.fieldLabel}>{t('calendar.modal.procedure')}</label>
                <div className={styles.fieldInputWrapper}>
                  <span className={`material-symbols-outlined ${styles.fieldIcon}`}>dentistry</span>
                  <input
                    required
                    type="text"
                    placeholder={t('calendar.modal.procedurePlaceholder')}
                    value={newApt.procedure}
                    onChange={(e) => setNewApt({ ...newApt, procedure: e.target.value })}
                    className={styles.formTextInput}
                  />
                </div>

                {/* Category Selection Tabs */}
                <div className={styles.categoryTabsStrip}>
                  {TREATMENT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.categoryTabBtn} ${selectedCategory === cat.id ? styles.categoryTabBtnActive : ''}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Procedures in Active Category */}
                <div className={styles.categoryProceduresList}>
                  {activeCategory.procedures.map((proc) => (
                    <button
                      key={proc}
                      type="button"
                      className={`${styles.procedurePillBtn} ${newApt.procedure === proc ? styles.procedurePillBtnActive : ''}`}
                      onClick={() => setNewApt({ ...newApt, procedure: proc })}
                    >
                      {proc}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Scalable Doctor Selector (Scales effortlessly to 30+ doctors) */}
              <div className={styles.formFieldGroup}>
                <label className={styles.fieldLabel}>{t('calendar.modal.doctor')}</label>
                <div className={styles.doctorDropdownWrap} ref={doctorSelectRef}>
                  <div
                    className={`${styles.doctorTrigger} ${doctorDropdownOpen ? styles.doctorTriggerActive : ''}`}
                    onClick={() => setDoctorDropdownOpen((prev) => !prev)}
                  >
                    <div className={styles.doctorSelectedInfo}>
                      <div
                        className={styles.docAvatarSmall}
                        style={{ backgroundColor: activeModalDoctor.color }}
                      >
                        {activeModalDoctor.initial}
                      </div>
                      <span className={styles.docSelectedName}>{activeModalDoctor.name}</span>
                      <span className={styles.docSelectedRole}>• {activeModalDoctor.role}</span>
                    </div>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)' }}>
                      {doctorDropdownOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>

                  {doctorDropdownOpen && (
                    <div className={styles.doctorMenuPopover}>
                      {CLINIC_DOCTORS.length > 4 && (
                        <div className={styles.doctorSearchBox}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-outline)' }}>
                            search
                          </span>
                          <input
                            type="text"
                            placeholder={t('calendar.modal.doctorSearch')}
                            value={doctorSearch}
                            onChange={(e) => setDoctorSearch(e.target.value)}
                            className={styles.doctorSearchInput}
                            autoFocus
                          />
                        </div>
                      )}

                      <div className={styles.doctorMenuList}>
                        {filteredClinicDoctors.map((doc) => {
                          const isSelected = newApt.doctor === doc.id;
                          return (
                            <div
                              key={doc.id}
                              className={`${styles.doctorMenuItem} ${isSelected ? styles.doctorMenuItemActive : ''}`}
                              onClick={() => {
                                setNewApt({ ...newApt, doctor: doc.id });
                                setDoctorDropdownOpen(false);
                                setDoctorSearch('');
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className={styles.docAvatarSmall} style={{ backgroundColor: doc.color }}>
                                  {doc.initial}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                    {doc.name}
                                  </span>
                                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                    {doc.role}
                                  </span>
                                </div>
                              </div>
                              {isSelected && (
                                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-cyan)' }}>
                                  check
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Date and Time (Side-by-side, defaults to today/active date) */}
              <div className={styles.formGridTwo}>
                <div className={styles.formFieldGroup}>
                  <label className={styles.fieldLabel}>{t('calendar.modal.date')}</label>
                  <input
                    required
                    type="date"
                    value={newApt.date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      const d = new Date(newDate);
                      const dayKey = DAY_NAMES[(d.getDay() + 6) % 7].key;
                      setNewApt({ ...newApt, date: newDate, day: dayKey });
                    }}
                    className={styles.formTextInput}
                    style={{ paddingLeft: '14px' }}
                  />
                </div>

                <div className={styles.formFieldGroup}>
                  <label className={styles.fieldLabel}>{t('calendar.modal.time')}</label>
                  <select
                    value={newApt.time}
                    onChange={(e) => setNewApt({ ...newApt, time: e.target.value })}
                    className={styles.formSelect}
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              </div>

              {/* Footer buttons */}
              <div className={styles.modalFooterBar}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.btnCancel}
                >
                  {t('common.cancel')}
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    check
                  </span>
                  <span>{t('calendar.modal.save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLE QUICK-ADD FLOATING POPOVER (Operatories View, apple-blur-dense) */}
      {quickAddSlot && (
        <div className={styles.appleQuickAddOverlay} onClick={() => setQuickAddSlot(null)}>
          <div className={styles.appleQuickAddPopover} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popoverHeader}>
              <div className={styles.popoverTitleGroup}>
                <div className={styles.chairHeaderIconSquircle}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    event_available
                  </span>
                </div>
                <div>
                  <div className={styles.popoverTitle}>
                    {i18n.language === 'en' ? 'Quick Appointment' : 'Tezkor qabul biriktirish'}
                  </div>
                  <div className={styles.popoverSub}>
                    {activeDateStr}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={styles.popoverCloseBtn}
                onClick={() => setQuickAddSlot(null)}
                aria-label="Close"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                await handleCreateAppointment(e);
                setQuickAddSlot(null);
              }}
              className={styles.popoverForm}
            >
              <div className={styles.popoverMetaPillStrip}>
                <span className={styles.popoverMetaBadge}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-cyan-hover)' }}>
                    airline_seat_recline_extra
                  </span>
                  Kreslo #{quickAddSlot.chair}
                </span>
                <span className={styles.popoverMetaBadge}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-cyan-hover)' }}>
                    schedule
                  </span>
                  {quickAddSlot.time}
                </span>
              </div>

              <div className={styles.formFieldGroup}>
                <label className={styles.fieldLabel}>{t('calendar.modal.patient')}</label>
                <div className={styles.fieldInputWrapper}>
                  <span className={`material-symbols-outlined ${styles.fieldIcon}`}>person</span>
                  <input
                    required
                    type="text"
                    placeholder={t('calendar.modal.patientPlaceholder')}
                    value={newApt.patientName}
                    onChange={(e) => setNewApt({ ...newApt, patientName: e.target.value })}
                    className={styles.formTextInput}
                    autoFocus
                  />
                </div>
              </div>

              <div className={styles.formFieldGroup}>
                <label className={styles.fieldLabel}>{t('calendar.modal.phone')}</label>
                <div className={styles.fieldInputWrapper}>
                  <span className={`material-symbols-outlined ${styles.fieldIcon}`}>call</span>
                  <input
                    type="tel"
                    placeholder="+998 xx xxx xx xx"
                    value={newApt.patientPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val || val.trim() === '') {
                        setNewApt({ ...newApt, patientPhone: '' });
                        return;
                      }
                      setNewApt({ ...newApt, patientPhone: formatUzbekPhone(val) });
                    }}
                    className={styles.formTextInput}
                  />
                </div>
              </div>

              <div className={styles.formFieldGroup}>
                <label className={styles.fieldLabel}>{t('calendar.modal.procedure')}</label>
                <div className={styles.fieldInputWrapper}>
                  <span className={`material-symbols-outlined ${styles.fieldIcon}`}>dentistry</span>
                  <input
                    required
                    type="text"
                    placeholder={t('calendar.modal.procedurePlaceholder')}
                    value={newApt.procedure}
                    onChange={(e) => setNewApt({ ...newApt, procedure: e.target.value })}
                    className={styles.formTextInput}
                  />
                </div>
              </div>

              <div className={styles.formFieldGroup}>
                <label className={styles.fieldLabel}>{t('calendar.modal.doctor')}</label>
                <select
                  value={newApt.doctor}
                  onChange={(e) => setNewApt({ ...newApt, doctor: e.target.value })}
                  className={styles.formSelect}
                >
                  {CLINIC_DOCTORS.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.popoverActions}>
                <button
                  type="button"
                  className={styles.popoverCancelBtn}
                  onClick={() => setQuickAddSlot(null)}
                >
                  {t('common.cancel')}
                </button>
                <button type="submit" className={styles.popoverSaveBtn}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                  <span>{t('calendar.modal.save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
