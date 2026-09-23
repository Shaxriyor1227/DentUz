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

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  usePageMeta(t('nav.dashboard') || 'Boshqaruv Paneli', "DentUz stomatologiya klinikasi asosiy boshqaruv paneli: kunlik qabullar, tushumlar va kreslolar bandligi.");
  const navigate = useNavigate();
  const { data: appointments, loading } = useApi(appointmentsApi.getToday, []);
  const { data: financeStats } = useApi(financeApi.getStats, null);

  const today = new Date();
  const locale = i18n.language === 'uz' ? 'uz-UZ' : 'en-US';
  const formattedToday = today.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const weeklyData = React.useMemo(() => getWeeklyChartData(i18n.language), [i18n.language]);

  const chairs = [
    {
      id: 1,
      label: `${t('dashboard.chair')} #1`,
      status: appointments?.some(a => a.chair === 1 && a.status === 'in_progress') ? 'active' : 'idle',
      statusText: appointments?.some(a => a.chair === 1 && a.status === 'in_progress')
        ? (i18n.language === 'uz' ? 'Band — Dr. Azimov' : 'In treatment — Dr. Azimov')
        : t('dashboard.chairIdle')
    },
    {
      id: 2,
      label: `${t('dashboard.chair')} #2`,
      status: appointments?.some(a => a.chair === 2) ? 'active' : 'idle',
      statusText: appointments?.some(a => a.chair === 2)
        ? (i18n.language === 'uz' ? 'Navbatda — Dr. Saidova (10:15)' : 'Next — Dr. Saidova (10:15)')
        : t('dashboard.chairIdle')
    },
    {
      id: 3,
      label: `${t('dashboard.chair')} #3`,
      status: appointments?.some(a => a.chair === 3) ? 'active' : 'idle',
      statusText: appointments?.some(a => a.chair === 3)
        ? (i18n.language === 'uz' ? 'Navbatda — Dr. Karimov (11:30)' : 'Next — Dr. Karimov (11:30)')
        : t('dashboard.chairIdle')
    },
    {
      id: 4,
      label: `${t('dashboard.chair')} #4`,
      status: 'idle',
      statusText: t('dashboard.chairIdle')
    }
  ];

  const todayCount = appointments?.length || 0;
  const inProgressCount = appointments?.filter(a => a.status === 'in_progress').length || 0;
  const pendingCount = appointments?.filter(a => a.status === 'pending').length || 0;
  const completedCount = appointments?.filter(a => a.status === 'completed').length || 0;

  return (
    <div className={styles.pageContainer}>
      {/* 1. Greeting Section */}
      <section className={styles.greetingSection}>
        <div>
          <h1 className={styles.greetingTitle}>{i18n.language === 'uz' ? 'Xayrli tong, Dr. Azimov' : 'Good day, Dr. Azimov'}</h1>
          <p className={styles.greetingSubtext}>
            {formattedToday} <span style={{ margin: '0 6px', opacity: 0.4 }}>•</span> {i18n.language === 'uz' ? `Bugun ${todayCount} ta qabul rejalashtirilgan` : `${todayCount} appointments scheduled for today`}
          </p>
        </div>
      </section>

      {/* 2. Quick Action Buttons Bar */}
      <section className={styles.quickActionsRow}>
        <div
          className={styles.quickActionBtn}
          style={{ '--btn-idx': 0 }}
          onClick={() => navigate('/patients')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.quickActionIconBox}>
            <span className="material-symbols-outlined">person_add</span>
          </div>
          <div className={styles.quickActionTextGroup}>
            <span className={styles.quickActionTitle}>{t('patients.newPatient')}</span>
            <span className={styles.quickActionSub}>{i18n.language === 'uz' ? "Ro'yxatga olish" : 'Registration'}</span>
          </div>
        </div>

        <div
          className={styles.quickActionBtn}
          style={{ '--btn-idx': 1 }}
          onClick={() => navigate('/calendar')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.quickActionIconBox}>
            <span className="material-symbols-outlined">calendar_today</span>
          </div>
          <div className={styles.quickActionTextGroup}>
            <span className={styles.quickActionTitle}>{t('calendar.newAppointment')}</span>
            <span className={styles.quickActionSub}>{i18n.language === 'uz' ? 'Taqvimga kiritish' : 'Add to schedule'}</span>
          </div>
        </div>

        <div
          className={styles.quickActionBtn}
          style={{ '--btn-idx': 2 }}
          onClick={() => navigate('/finance')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.quickActionIconBox}>
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div className={styles.quickActionTextGroup}>
            <span className={styles.quickActionTitle}>{t('finance.title')}</span>
            <span className={styles.quickActionSub}>{i18n.language === 'uz' ? 'Hisob-fakturalar' : 'Billing & Ledger'}</span>
          </div>
        </div>

        <div
          className={styles.quickActionBtn}
          style={{ '--btn-idx': 3 }}
          onClick={() => navigate('/patients/1042')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.quickActionIconBox}>
            <span className="material-symbols-outlined">dentistry</span>
          </div>
          <div className={styles.quickActionTextGroup}>
            <span className={styles.quickActionTitle}>{t('odontogram.title')}</span>
            <span className={styles.quickActionSub}>{i18n.language === 'uz' ? 'FDI tish xaritasi' : '32-tooth chart'}</span>
          </div>
        </div>
      </section>

      {/* 4. Dental Chairs Real-time Status */}
      <section className={styles.chairsSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-cyan-hover)' }}>
              airline_seat_recline_normal
            </span>
            <h2 className={styles.sectionTitle}>{t('dashboard.chairOccupancy')}</h2>
          </div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            {t('dashboard.chairOccupancyDesc')}
          </span>
        </div>

        <div className={styles.chairsGrid}>
          {chairs.map((chair, idx) => {
            const isPulse = chair.status === 'active';
            const isIdle = chair.status === 'idle';
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
                        : isIdle
                        ? styles.pulseIdle
                        : styles.pulseCleaning
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
        {/* LEFT COLUMN: Bugungi qabullar (7/12 cols) */}
        <div className={styles.appointmentsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerTitleWrapper}>
              <h2 className={styles.headerTitle}>{t('dashboard.quickAppointments')}</h2>
              <span className={styles.headerDot} />
            </div>
            <span className={styles.patientCountBadge}>
              {loading ? '...' : `${appointments?.length || 8} ${i18n.language === 'uz' ? 'ta bemor' : 'patients'}`}
            </span>
          </div>

          {loading ? (
            <SkeletonLoader type="table" count={6} />
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

        {/* RIGHT COLUMN: Stacked Stat Cards + Weekly Dynamic Chart (5/12 cols) */}
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
                label={t('dashboard.expectedRevenue')}
                value={financeStats?.monthlyRevenue ? Number(financeStats.monthlyRevenue).toLocaleString() : '550 000'}
                unit={t('common.som')}
                subtext={i18n.language === 'uz' ? "Kassaga tushgan to'lovlar" : "Received patient payments"}
                isMono={true}
                icon="payments"
              />
              <StatCard
                label={t('finance.stats.expectedPayments')}
                value={financeStats?.pendingPayments ? Number(financeStats.pendingPayments).toLocaleString() : '3 500 000'}
                unit={t('common.som')}
                subtext={i18n.language === 'uz' ? `${financeStats?.pendingCount || 1} ta muolaja bo'yicha qoldiq` : "Balance due on active procedures"}
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
                  {i18n.language === 'uz' ? 'Jami: 28 450 000 so\'m • 72 bemor' : 'Total: 28,450,000 UZS • 72 patients'}
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
