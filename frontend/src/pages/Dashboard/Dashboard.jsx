import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { appointmentsApi } from '../../api/appointmentsApi';
import StatCard from '../../components/StatCard/StatCard';
import StatusPill from '../../components/StatusPill/StatusPill';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import styles from './Dashboard.module.css';

// Dental Chairs Live Status Data — short status line only
const CHAIRS_STATUS = [
  { id: 1, label: 'Kreslo #1', status: 'active',   statusText: 'Band — 15 daq qoldi' },
  { id: 2, label: 'Kreslo #2', status: 'idle',     statusText: "Bo'sh" },
  { id: 3, label: 'Kreslo #3', status: 'active',   statusText: 'Band — 25 daq qoldi' },
  { id: 4, label: 'Kreslo #4', status: 'cleaning', statusText: 'Dezinfeksiya' }
];

// 7-day revenue & patients inflow metrics dynamically aligned with current week
function getWeeklyChartData() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const monthShort = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  const dayLabels = [
    { key: 'Dush', rev: '3.8M', pts: 9, hp: 65 },
    { key: 'Sesh', rev: '4.2M', pts: 11, hp: 74 },
    { key: 'Chor', rev: '5.1M', pts: 14, hp: 88 },
    { key: 'Pay',  rev: '4.6M', pts: 12, hp: 78 },
    { key: 'Jum',  rev: '4.85M', pts: 13, hp: 84 },
    { key: 'Shan', rev: '3.4M', pts: 8, hp: 55 },
    { key: 'Yak',  rev: '2.5M', pts: 5, hp: 40 }
  ];

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return dayLabels.map((item, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      day: item.key,
      date: `${d.getDate()}-${monthShort[d.getMonth()]}`,
      revenue: item.rev,
      patients: item.pts,
      heightPercent: item.hp,
      isToday: dStr === todayStr
    };
  });
}

const WEEKLY_DATA = getWeeklyChartData();

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: appointments, loading } = useApi(appointmentsApi.getToday, []);

  const today = new Date();
  const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const monthNames = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  const formattedToday = `${dayNames[today.getDay()]}, ${today.getDate()}-${monthNames[today.getMonth()]}, ${today.getFullYear()}-yil`;

  return (
    <div className={styles.pageContainer}>
      {/* 1. Greeting Section */}
      <section className={styles.greetingSection}>
        <div>
          <h1 className={styles.greetingTitle}>Xayrli tong, Dr. Azimov</h1>
          <p className={styles.greetingSubtext}>
            {formattedToday} <span style={{ margin: '0 6px', opacity: 0.4 }}>•</span> Bugun {appointments?.length || 8} ta qabul rejalashtirilgan
          </p>
        </div>
      </section>

      {/* 2. Quick Action Buttons Bar */}
      <section className={styles.quickActionsRow}>
        <div
          className={styles.quickActionBtn}
          onClick={() => navigate('/patients')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.quickActionIconBox}>
            <span className="material-symbols-outlined">person_add</span>
          </div>
          <div className={styles.quickActionTextGroup}>
            <span className={styles.quickActionTitle}>Yangi Bemor</span>
            <span className={styles.quickActionSub}>Ro'yxatga olish</span>
          </div>
        </div>

        <div
          className={styles.quickActionBtn}
          onClick={() => navigate('/calendar')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.quickActionIconBox}>
            <span className="material-symbols-outlined">calendar_today</span>
          </div>
          <div className={styles.quickActionTextGroup}>
            <span className={styles.quickActionTitle}>Yangi Qabul</span>
            <span className={styles.quickActionSub}>Taqvimga kiritish</span>
          </div>
        </div>

        <div
          className={styles.quickActionBtn}
          onClick={() => navigate('/finance')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.quickActionIconBox}>
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div className={styles.quickActionTextGroup}>
            <span className={styles.quickActionTitle}>Kassa & To'lov</span>
            <span className={styles.quickActionSub}>Hisob-fakturalar</span>
          </div>
        </div>

        <div
          className={styles.quickActionBtn}
          onClick={() => navigate('/patients/1042')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.quickActionIconBox}>
            <span className="material-symbols-outlined">dentistry</span>
          </div>
          <div className={styles.quickActionTextGroup}>
            <span className={styles.quickActionTitle}>Odontogramma</span>
            <span className={styles.quickActionSub}>FDI tish xaritasi</span>
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
            <h2 className={styles.sectionTitle}>Stomatologik Kreslolar Jonli Holati</h2>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            Real vaqt monitoringi
          </span>
        </div>

        <div className={styles.chairsGrid}>
          {CHAIRS_STATUS.map((chair) => {
            const isPulse = chair.status === 'active';
            const isIdle = chair.status === 'idle';
            return (
              <div key={chair.id} className={styles.chairCard}>
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
              <h2 className={styles.headerTitle}>Bugungi qabullar</h2>
              <span className={styles.headerDot} />
            </div>
            <span className={styles.patientCountBadge}>
              {loading ? '...' : `${appointments?.length || 8} ta bemor`}
            </span>
          </div>

          {loading ? (
            <SkeletonLoader type="table" count={6} />
          ) : (
            <div className={styles.appointmentList}>
              {appointments?.map((apt) => {
                const isActive = apt.status === 'in_progress';
                return (
                  <div
                    key={apt.id}
                    className={`${styles.appointmentItem} ${
                      isActive ? styles.appointmentItemActive : ''
                    }`}
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
                label="Bugungi bemorlar"
                value="8"
                subtext="5 ta qabul yakunlandi, 3 ta kutilmoqda"
                icon="groups"
              />
              <StatCard
                label="Bugungi tushum"
                value="4 850 000"
                unit="UZS"
                subtext="Payme, Click va naqd to'lovlar"
                isMono={true}
                icon="payments"
              />
              <StatCard
                label="Kutilayotgan to'lovlar"
                value="1 200 000"
                unit="UZS"
                subtext="2 ta muolaja bo'yicha qoldiq"
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
                  Haftalik Tushum Dinamikasi
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  Jami: 28 450 000 UZS • 72 bemor
                </span>
              </div>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-cyan-hover)', fontSize: '20px' }}>
                trending_up
              </span>
            </div>

            <div className={styles.chartBarsContainer}>
              {WEEKLY_DATA.map((item) => (
                <div key={item.day} className={styles.chartBarCol}>
                  <span className={styles.chartValTooltip}>{item.revenue}</span>
                  <div className={styles.chartBarTrack}>
                    <div
                      className={`${styles.chartBarFill} ${item.isToday ? styles.chartBarFillToday : ''}`}
                      style={{ height: `${item.heightPercent}%` }}
                      title={`${item.day} (${item.date}): ${item.revenue} UZS (${item.patients} bemor)`}
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
