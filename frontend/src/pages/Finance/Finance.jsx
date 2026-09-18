import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { financeApi } from '../../api/financeApi';
import StatCard from '../../components/StatCard/StatCard';
import StatusPill from '../../components/StatusPill/StatusPill';
import DataTable from '../../components/DataTable/DataTable';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import { formatUZS } from '../../utils/formatters';
import styles from './Finance.module.css';

export default function Finance() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('this_month');
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, inv] = await Promise.all([
          financeApi.getStats(dateRange),
          financeApi.getInvoices(dateRange)
        ]);
        setStats(s);
        setInvoices(inv);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dateRange]);

  const filteredInvoices = invoices.filter((item) => {
    if (activeTab === 'paid' && item.status !== 'paid') return false;
    if (activeTab === 'pending' && item.status !== 'pending' && item.status !== 'partial') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.patient.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.doctor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const columns = [
    {
      title: t('finance.invoicesTable.colId'),
      key: 'id',
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-cyan-hover)' }}>
          {val}
        </span>
      )
    },
    {
      title: t('finance.invoicesTable.colPatient'),
      key: 'patient',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{val}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
            ID: #{row.patientId}
          </div>
        </div>
      )
    },
    {
      title: t('finance.invoicesTable.colProc'),
      key: 'procedure',
      render: (val, row) => (
        <div>
          <div style={{ color: 'var(--color-text-primary)' }}>{val}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-cyan-hover)' }}>{row.doctor}</div>
        </div>
      )
    },
    {
      title: t('finance.invoicesTable.colDate'),
      key: 'date',
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {val}
        </span>
      )
    },
    {
      title: t('finance.invoicesTable.colMethod'),
      key: 'method',
      render: (val) => <span className={styles.paymentMethodChip}>{val}</span>
    },
    {
      title: t('finance.invoicesTable.colAmount'),
      key: 'amount',
      align: 'right',
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {formatUZS(val)}
        </span>
      )
    },
    {
      title: t('finance.invoicesTable.colStatus'),
      key: 'status',
      render: (val) => <StatusPill status={val} label={val === 'paid' ? t('patientProfile.billingTab.statusPaid') : t('patientProfile.billingTab.statusPending')} />
    }
  ];

  return (
    <div className={styles.pageContainer}>
      {/* 1. Header Section */}
      <div className={styles.headerRow}>
        <div>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>{t('finance.title')}</h1>
            <span className={styles.badge}>{i18n.language === 'en' ? 'Main Ledger' : 'Asosiy Balans'}</span>
          </div>
          <p className={styles.subtitle}>
            {t('finance.subtitle')}
          </p>
        </div>

        {/* Date Range Selector */}
        <div className={styles.dateFilterGroup}>
          <button
            type="button"
            className={`${styles.dateFilterBtn} ${dateRange === 'this_month' ? styles.dateFilterBtnActive : ''}`}
            onClick={() => setDateRange('this_month')}
          >
            {t('finance.periods.thisMonth')}
          </button>
          <button
            type="button"
            className={`${styles.dateFilterBtn} ${dateRange === 'last_month' ? styles.dateFilterBtnActive : ''}`}
            onClick={() => setDateRange('last_month')}
          >
            {t('finance.periods.lastMonth')}
          </button>
          <button
            type="button"
            className={`${styles.dateFilterBtn} ${dateRange === 'custom' ? styles.dateFilterBtnActive : ''}`}
            onClick={() => setDateRange('custom')}
          >
            {t('finance.periods.customDate')}
          </button>
        </div>
      </div>

      {/* 2. Top Row: 4 Key Stat Cards */}
      {loading ? (
        <SkeletonLoader type="stat" count={4} />
      ) : (
        <div className={styles.statsGrid}>
          <StatCard
            label={t('finance.stats.totalRevenue')}
            value={stats ? formatUZS(stats.monthlyRevenue, false) : '—'}
            unit="UZS"
            trend={stats ? `+${stats.revenueGrowth}%` : ''}
            subtext={stats?.label || ''}
            isMono={true}
            icon="account_balance_wallet"
          />
          <StatCard
            label={t('finance.stats.expectedPayments')}
            value={stats ? formatUZS(stats.pendingPayments, false) : '—'}
            unit="UZS"
            subtext={stats ? `${stats.pendingCount} ${t('common.qty')}` : ''}
            isMono={true}
            icon="pending_actions"
          />
          <StatCard
            label={i18n.language === 'en' ? 'Expenses' : 'Xarajatlar'}
            value={stats ? formatUZS(stats.expenses, false) : '—'}
            unit="UZS"
            trend={stats ? `${stats.expensesGrowth > 0 ? '+' : ''}${stats.expensesGrowth}%` : ''}
            trendPositive={stats ? stats.expensesGrowth < 0 : false}
            subtext={i18n.language === 'en' ? 'vs previous period' : "o'tgan oyga nisbatan"}
            isMono={true}
            icon="shopping_cart_checkout"
          />
          <StatCard
            label={i18n.language === 'en' ? 'Net Profit' : 'Sof foyda'}
            value={stats ? formatUZS(stats.netProfit, false) : '—'}
            unit="UZS"
            trend={stats ? `+${stats.netProfitGrowth}%` : ''}
            subtext={i18n.language === 'en' ? 'net margin' : 'sof rentabellik'}
            isMono={true}
            icon="savings"
          />
        </div>
      )}

      {/* 3. Sub-navigation tabs */}
      <div className={styles.tabsNav}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('all')}
        >
          {t('finance.paymentMethods.all')}
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'paid' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('paid')}
        >
          {i18n.language === 'en' ? 'Paid Invoices' : 'Hisob-fakturalar (To\'langan)'}
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          {i18n.language === 'en' ? 'Pending Receivables' : 'Kutilayotgan qoldiqlar'}
        </button>
      </div>

      {/* 4. Table Toolbar */}
      <div className={styles.tableToolbar}>
        <div className={styles.searchBox}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('finance.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.toolbarActions}>
          <button
            type="button"
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => alert(i18n.language === 'en' ? "Financial ledger exported." : "Moliya hisoboti eksport qilindi.")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              file_download
            </span>
            <span>{t('common.export')}</span>
          </button>
          <button
            type="button"
            style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--color-cyan)', color: '#FFFFFF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}
            onClick={() => alert(i18n.language === 'en' ? "Collect payment modal" : "Yangi to'lov qabul qilish modal oynasi")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              add
            </span>
            <span>{i18n.language === 'en' ? 'Collect Payment' : 'Yangi to\'lov'}</span>
          </button>
        </div>
      </div>

      {/* 5. Invoices Data Table */}
      {loading ? (
        <SkeletonLoader type="table" count={6} />
      ) : (
        <DataTable columns={columns} data={filteredInvoices} />
      )}
    </div>
  );
}
