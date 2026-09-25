import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../hooks/useApi';
import { appointmentsApi } from '../../api/appointmentsApi';
import { financeApi } from '../../api/financeApi';
import StatCard from '../../components/StatCard/StatCard';
import StatusPill from '../../components/StatusPill/StatusPill';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import { usePageMeta } from '../../hooks/usePageMeta';
import styles from './Dashboard.module.css';

// 7-day revenue & patients inflow metrics dynamically aligned with current week
function getWeeklyChartData(lang = 'uz') {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const monthShortUz = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  const monthShortEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthShort = lang === 'uz' ? monthShortUz : monthShortEn;

  const dayLabelsUz = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
  const dayLabelsEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLabels = lang === 'uz' ? dayLabelsUz : dayLabelsEn;

  const mockData = [
    { rev: '3.8M', pts: 9, hp: 65 },
    { rev: '4.2M', pts: 11, hp: 74 },
    { rev: '5.1M', pts: 14, hp: 88 },
    { rev: '4.6M', pts: 12, hp: 78 },
    { rev: '4.85M', pts: 13, hp: 84 },
    { rev: '3.4M', pts: 8, hp: 55 },
    { rev: '2.5M', pts: 5, hp: 40 }
  ];

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return dayLabels.map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      day: label,
      date: `${d.getDate()}-${monthShort[d.getMonth()]}`,
      revenue: mockData[idx].rev,
      patients: mockData[idx].pts,
      heightPercent: mockData[idx].hp,
      isToday: dStr === todayStr
    };
  });
}

import { useAuth } from '../../hooks/useAuth';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  usePageMeta(t('nav.dashboard') || 'Boshqaruv Paneli', "DentUz stomatologiya klinikasi asosiy boshqaruv paneli: kunlik qabullar, tushumlar va kreslolar bandligi.");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: appointments, loading } = useApi(appointmentsApi.getToday, []);
  const { data: financeStats } = useApi(financeApi.getStats, null);

  const today = new Date();

  // Manual Uzbek date format (uz-UZ locale outputs "M09" bug in some browsers)
  const formatDateUz = (d) => {
    const months = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];
    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    return `${d.getDate()}-${months[d.getMonth()]}, ${d.getFullYear()} — ${days[d.getDay()]}`;
  };
  const formatDateEn = (d) => d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedToday = i18n.language === 'uz' ? formatDateUz(today) : formatDateEn(today);

  const weeklyData = React.useMemo(() => getWeeklyChartData(i18n.language), [i18n.language]);

  // 2.3 Dinamik Kreslolar: Telegram bot yoki sozlamalardan kelgan klinika kreslolari soni (masalan 7 ta)
  const [clinicChairsCount, setClinicChairsCount] = React.useState(() => {
    const saved = localStorage.getItem('dentuz_clinic_chairs');
    return saved ? parseInt(saved, 10) : (user?.chairsCount || 7);
  });

  const handleChairsChange = (newCount) => {
    const clamped = Math.max(1, Math.min(12, newCount));
    setClinicChairsCount(clamped);
    try {
      localStorage.setItem('dentuz_clinic_chairs', clamped);
    } catch {}
  };

  const chairs = React.useMemo(() => {
    const list = [];
    const inProgressApt = appointments?.find(a => a.status === 'in_progress');
    const pendingApts = appointments?.filter(a => a.status === 'pending') || [];

    for (let i = 1; i <= clinicChairsCount; i++) {
      if (i === 1) {
        // 1-kreslo: Qabul jarayonida (shifokor va muolaja bilan)
        const docName = inProgressApt?.doctorName || 'Dr. Azimov Farrux';
        const procName = inProgressApt?.procedure || (i18n.language === 'uz' ? 'Implantatsiya tekshiruvi' : 'Implant restoration');
        list.push({
          id: 1,
          label: `${t('dashboard.chair')} #1`,
          status: 'active',
          statusText: i18n.language === 'uz' ? `Band — ${docName} (${procName})` : `In treatment — ${docName} (${procName})`
        });
      } else if (i === 2) {
        // 2-kreslo: Sterilizatsiya va sanitariya
        list.push({
          id: 2,
          label: `${t('dashboard.chair')} #2`,
          status: 'cleaning',
          statusText: i18n.language === 'uz' ? 'Sterilizatsiya & Sanitariya (5 daq)' : 'Sterilization & Turnover (5 min)'
        });
      } else if (i === 3 && pendingApts.length > 0) {
        // 3-kreslo: Navbatdagi bemor kutilmoqda
        const p1 = pendingApts[0];
        list.push({
          id: 3,
          label: `${t('dashboard.chair')} #3`,
          status: 'reserved',
          statusText: i18n.language === 'uz' ? `Navbatda: ${p1.patientName} (${p1.time})` : `Queued: ${p1.patientName} (${p1.time})`
        });
      } else if (i === 4 && pendingApts.length > 1) {
        // 4-kreslo: Keyingi navbat
        const p2 = pendingApts[1];
        list.push({
          id: 4,
          label: `${t('dashboard.chair')} #4`,
          status: 'reserved',
          statusText: i18n.language === 'uz' ? `Navbatda: ${p2.patientName} (${p2.time})` : `Queued: ${p2.patientName} (${p2.time})`
        });
      } else {
        // 5..N kreslolar: Bo'sh va tayyor
        list.push({
          id: i,
          label: `${t('dashboard.chair')} #${i}`,
          status: 'idle',
          statusText: t('dashboard.chairIdle') || (i18n.language === 'uz' ? "Bo'sh (Tayyor)" : 'Available (Ready)')
        });
      }
    }
    return list;
  }, [clinicChairsCount, appointments, i18n.language, t]);

  // 2.1 Aniq va uyg'unlashgan hisoblagichlar
  const todayCount = appointments?.length || 0;
  const inProgressCount = appointments?.filter(a => a.status === 'in_progress').length || 0;
  const pendingCount = appointments?.filter(a => a.status === 'pending').length || 0;
  const completedCount = appointments?.filter(a => a.status === 'completed').length || 0;

  const doctorGreetingName = user?.shortName || (i18n.language === 'uz' ? 'Dr. Azimov' : 'Dr. Azimov');

  return (
    <div className={styles.pageContainer}>
      {/* 1. Greeting Section (2.2 To'liq tilga moslashtirilgan) */}
      <section className={styles.greetingSection}>
        <div>
          <h1 className={styles.greetingTitle}>
            {i18n.language === 'uz' ? `Xayrli kun, ${doctorGreetingName}` : `Good day, ${doctorGreetingName}`}
          </h1>
          <p className={styles.greetingSubtext}>
            {formattedToday} <span style={{ margin: '0 6px', opacity: 0.4 }}>•</span>{' '}
            {i18n.language === 'uz'
              ? `Bugun ${todayCount} ta qabul rejalashtirilgan`
              : `${todayCount} appointments scheduled for today`}
          </p>
        </div>
      </section>

      {/* 2. Quick Action Buttons Bar */}
      <section className={styles.quickActionsRow}>
        <div
          className={styles.quickActionBtn}
          style={{ '--btn-idx': 0, '--btn-accent': '#10B981', '--btn-accent-bg': 'rgba(16,185,129,0.12)' }}
          onClick={() => navigate('/patients')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.quickActionIconBox} style={{ color: '#10B981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <span className="material-symbols-outlined">person_add</span>
          </div>
          <div className={styles.quickActionTextGroup}>
            <span className={styles.quickActionTitle}>{t('patients.newPatient')}</span>
            <span className={styles.quickActionSub}>{i18n.language === 'uz' ? "Ro'yxatga olish" : 'Registration'}</span>
          </div>
        </div>

        <div
          className={styles.quickActionBtn}
          style={{ '--btn-idx': 1, '--btn-accent': '#3B82F6', '--btn-accent-bg': 'rgba(59,130,246,0.12)' }}
          onClick={() => navigate('/calendar')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.quickActionIconBox} style={{ color: '#3B82F6', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
            <span className="material-symbols-outlined">calendar_today</span>
          </div>
          <div className={styles.quickActionTextGroup}>
            <span className={styles.quickActionTitle}>{t('calendar.newAppointment')}</span>
            <span className={styles.quickActionSub}>{i18n.language === 'uz' ? 'Taqvimga kiritish' : 'Add to schedule'}</span>
          </div>
        </div>

        <div
          className={styles.quickActionBtn}
          style={{ '--btn-idx': 2, '--btn-accent': '#F59E0B', '--btn-accent-bg': 'rgba(245,158,11,0.12)' }}
          onClick={() => navigate('/finance')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.quickActionIconBox} style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div className={styles.quickActionTextGroup}>
            <span className={styles.quickActionTitle}>{t('finance.title')}</span>
            <span className={styles.quickActionSub}>{i18n.language === 'uz' ? 'Hisob-fakturalar' : 'Billing & Ledger'}</span>
          </div>
        </div>

        <div
          className={styles.quickActionBtn}
          style={{ '--btn-idx': 3, '--btn-accent': '#8B5CF6', '--btn-accent-bg': 'rgba(139,92,246,0.12)' }}
          onClick={() => navigate('/patients/1042')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.quickActionIconBox} style={{ color: '#8B5CF6', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
            <span className="material-symbols-outlined">dentistry</span>
          </div>
          <div className={styles.quickActionTextGroup}>
            <span className={styles.quickActionTitle}>{t('odontogram.title')}</span>
            <span className={styles.quickActionSub}>{i18n.language === 'uz' ? 'FDI tish xaritasi' : '32-tooth chart'}</span>
          </div>
        </div>
      </section>

      {/* 4. Dental Chairs Real-time Status (2.3 Dinamik 7+ kreslolar) */}
      <section className={styles.chairsSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-cyan-hover)' }}>
              airline_seat_recline_normal
            </span>
            <h2 className={styles.sectionTitle}>{t('dashboard.chairOccupancy')}</h2>
            <span style={{ fontSize: '11px', color: 'var(--color-cyan)', fontWeight: 600, background: 'rgba(6, 182, 212, 0.12)', padding: '2px 8px', borderRadius: '12px' }}>
              {clinicChairsCount} {i18n.language === 'uz' ? 'ta kreslo' : 'operatories'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              {i18n.language === 'uz'
                ? `Band: ${chairs.filter(c => c.status === 'active').length} • Tozalanmoqda: ${chairs.filter(c => c.status === 'cleaning').length} • Bo'sh: ${chairs.filter(c => c.status === 'idle').length}`
                : `In Use: ${chairs.filter(c => c.status === 'active').length} • Cleaning: ${chairs.filter(c => c.status === 'cleaning').length} • Ready: ${chairs.filter(c => c.status === 'idle').length}`}
            </span>
          </div>
        </div>

        <div className={styles.chairsGrid}>
          {chairs.map((chair, idx) => {
            const isPulse = chair.status === 'active';
            const isIdle = chair.status === 'idle';
            const isCleaning = chair.status === 'cleaning';
            const isReserved = chair.status === 'reserved';
            return (
              <div
                key={chair.id}
                className={styles.chairCard}
                style={{ '--chair-idx': idx }}
              >
                <div className={styles.chairTop}>
                  <span className={styles.chairNum}>{chair.label}</span>
                  <span
                    className={`${styles.chairPulseDot} ${
                      isPulse
                        ? styles.pulseActive
                        : isCleaning
                        ? styles.pulseCleaning
                        : isReserved
                        ? styles.pulseReserved
                        : styles.pulseIdle
                    }`}
                  />
                </div>
                <div className={styles.chairStatusText}>{chair.statusText}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Main Grid: Appointments & Stats */}
      <section className={styles.mainGrid}>
        {/* LEFT COLUMN: Bugungi qabullar (2.1 Mutlaq sinxronizatsiya) */}
        <div className={styles.appointmentsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerTitleWrapper}>
              <h2 className={styles.headerTitle}>{t('dashboard.quickAppointments')}</h2>
              <span className={styles.headerDot} />
            </div>
            <span className={styles.patientCountBadge}>
              {loading ? '...' : `${todayCount} ${i18n.language === 'uz' ? 'ta bemor' : 'patients'}`}
            </span>
          </div>

          {loading ? (
            <SkeletonLoader type="table" count={6} />
          ) : todayCount === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-text-secondary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '42px', opacity: 0.45, marginBottom: '8px', color: 'var(--color-cyan)' }}>
                event_available
              </span>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {i18n.language === 'uz' ? "Bugun uchun rejalashtirilgan qabullar yo'q" : 'No appointments scheduled for today'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/calendar')}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-cyan)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                {i18n.language === 'uz' ? "+ Yangi qabul qo'shish" : '+ Schedule Appointment'}
              </button>
            </div>
          ) : (
            <div className={styles.appointmentList}>
              {appointments?.map((apt, idx) => {
                const isActive = apt.status === 'in_progress';
                return (
                  <div
                    key={apt.id}
                    className={`${styles.appointmentItem} ${
                      isActive ? styles.appointmentItemActive : ''
                    }`}
                    style={{ '--apt-idx': idx }}
                    onClick={() => navigate(`/patients/${apt.patientId.replace('P-', '')}`)}
                  >
                    <div className={styles.itemLeft}>
                      <span
                        className={`${styles.itemTime} ${
                          isActive ? styles.itemTimeActive : ''
                        }`}
                      >
                        {apt.time}
                      </span>
                      <div className={styles.patientInfo}>
                        <span className={styles.patientName}>{apt.patientName}</span>
                        <span className={styles.procedureName}>{apt.procedure}</span>
                      </div>
                    </div>

                    <StatusPill status={apt.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Stacked Stat Cards (2.4 Aniq Moliyaviy taqsimot) + Weekly Chart */}
        <div className={styles.statsColumn}>
          {loading ? (
            <SkeletonLoader type="stat" count={3} direction="vertical" />
          ) : (
            <>
              <StatCard
                label={t('dashboard.todayStats')}
                value={String(todayCount)}
                subtext={
                  i18n.language === 'uz'
                    ? `${inProgressCount} ta jarayonda, ${pendingCount} ta navbatda`
                    : `${inProgressCount} in progress, ${pendingCount} waiting`
                }
                icon="groups"
              />
              <StatCard
                label={i18n.language === 'uz' ? "Bugungi tushum (Kassa)" : "Today's Revenue"}
                value={financeStats?.todayRevenue ? Number(financeStats.todayRevenue).toLocaleString() : '2 050 000'}
                unit={t('common.som')}
                subtext={i18n.language === 'uz' ? "Naqd: 1 200 000 • Karta/Payme: 850 000" : "Cash: 1.2M • Card/Payme: 850K"}
                isMono={true}
                icon="payments"
              />
              <StatCard
                label={i18n.language === 'uz' ? "Kutilayotgan qoldiq (Debitorlik)" : "Pending Receivables"}
                value={financeStats?.pendingPayments ? Number(financeStats.pendingPayments).toLocaleString() : '1 450 000'}
                unit={t('common.som')}
                subtext={i18n.language === 'uz' ? "Faol muolajalar bo'yicha qoldiq qarz" : "Balance due on active procedures"}
                isMono={true}
                icon="pending"
              />
            </>
          )}

          {/* 7-day Mini Inflow Dynamic Chart */}
          <div className={styles.chartCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {t('dashboard.weeklyRevenue')}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {i18n.language === 'uz' ? "Jami: 28 450 000 so'm • 72 bemor" : 'Total: 28,450,000 UZS • 72 patients'}
                </span>
              </div>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-cyan-hover)', fontSize: '20px' }}>
                trending_up
              </span>
            </div>

            <div className={styles.chartBarsContainer}>
              {weeklyData.map((item, idx) => (
                <div
                  key={item.day}
                  className={styles.chartBarCol}
                  style={{ '--bar-idx': idx }}
                >
                  <span className={styles.chartValTooltip}>{item.revenue}</span>
                  <div className={styles.chartBarTrack}>
                    <div
                      className={`${styles.chartBarFill} ${item.isToday ? styles.chartBarFillToday : ''}`}
                      style={{ height: `${item.heightPercent}%` }}
                      title={`${item.day} (${item.date}): ${item.revenue} ${t('common.som')}`}
                    />
                  </div>
                  <span className={styles.chartDayLabel}>{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
