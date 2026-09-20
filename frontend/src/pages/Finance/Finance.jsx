import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { financeApi } from '../../api/financeApi';
import StatCard from '../../components/StatCard/StatCard';
import StatusPill from '../../components/StatusPill/StatusPill';
import DataTable from '../../components/DataTable/DataTable';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import Toast from '../../components/Toast/Toast';
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
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportDropdownRef = useRef(null);
  const [toast, setToast] = useState({ open: false, type: 'success', title: '', message: '' });
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    patient: 'Anvar Qosimov',
    patientId: '1042',
    procedure: 'Kompozit restavratsiya',
    doctor: 'Dr. Azimov',
    amount: '450000',
    method: 'Payme',
    status: 'paid',
    notes: ''
  });

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportExcel = async () => {
    if (!filteredInvoices || filteredInvoices.length === 0) {
      setToast({
        open: true,
        type: 'warning',
        title: i18n.language === 'en' ? 'No records to export' : 'Eksport qilib bo\'lmadi',
        message: i18n.language === 'en' ? 'No invoices found for the selected filter.' : 'Tanlangan filtr bo\'yicha invoyslar topilmadi.'
      });
      return;
    }
    const isEn = i18n.language === 'en';
    try {
      setExporting(true);
      setShowExportMenu(false);
      const { exportFinanceToExcel } = await import('../../utils/exportFinanceExcel');
      await exportFinanceToExcel(filteredInvoices, {
        activeTab,
        dateRange,
        stats,
        language: i18n.language,
        clinicName: 'DentUz Stomatologiya Klinikasi'
      });
      setToast({
        open: true,
        type: 'success',
        title: isEn ? 'Finance Ledger Exported' : 'Moliya hisoboti (Excel) yuklandi',
        message: isEn
          ? `${filteredInvoices.length} invoices saved in styled Excel (.xlsx) file.`
          : `${filteredInvoices.length} ta invoys ma'lumotlari to'liq Excel (.xlsx) jadvaliga yuklandi.`
      });
    } catch (err) {
      console.error(err);
      setToast({
        open: true,
        type: 'error',
        title: isEn ? 'Export failed' : 'Eksportda xatolik',
        message: err.message || (isEn ? 'Failed to generate Excel file.' : 'Excel faylini yaratib bo\'lmadi.')
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    if (!filteredInvoices || filteredInvoices.length === 0) {
      setToast({
        open: true,
        type: 'warning',
        title: i18n.language === 'en' ? 'No records to export' : 'Eksport qilib bo\'lmadi',
        message: i18n.language === 'en' ? 'No invoices found for the selected filter.' : 'Tanlangan filtr bo\'yicha invoyslar topilmadi.'
      });
      return;
    }
    const isEn = i18n.language === 'en';
    try {
      setShowExportMenu(false);
      const { exportFinanceToCSV } = await import('../../utils/exportFinanceExcel');
      exportFinanceToCSV(filteredInvoices, {
        activeTab,
        language: i18n.language
      });
      setToast({
        open: true,
        type: 'success',
        title: isEn ? 'CSV Export Completed' : 'CSV fayli yuklab olindi',
        message: isEn
          ? `${filteredInvoices.length} invoices exported to CSV format.`
          : `${filteredInvoices.length} ta invoys CSV formatida yuklab olindi.`
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportPDF = async () => {
    if (!filteredInvoices || filteredInvoices.length === 0) return;
    try {
      setShowExportMenu(false);
      const { exportFinanceToPDF } = await import('../../utils/exportFinanceExcel');
      exportFinanceToPDF(filteredInvoices, { activeTab, dateRange, language: i18n.language });
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportWord = async () => {
    if (!filteredInvoices || filteredInvoices.length === 0) return;
    try {
      setShowExportMenu(false);
      const { exportFinanceToWord } = await import('../../utils/exportFinanceExcel');
      exportFinanceToWord(filteredInvoices, { activeTab, dateRange, stats, language: i18n.language });
      setToast({
        open: true,
        type: 'success',
        title: i18n.language === 'en' ? 'Word Document Downloaded' : 'Word (.doc) fayli yuklandi',
        message: i18n.language === 'en' ? `${filteredInvoices.length} invoices saved as Word document.` : `${filteredInvoices.length} ta invoys Word hujjatiga yuklandi.`
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCollectSubmit = (e) => {
    e.preventDefault();
    if (!paymentForm.patient.trim()) {
      setToast({
        open: true,
        type: 'warning',
        title: i18n.language === 'en' ? 'Missing patient' : 'Bemor tanlanmadi',
        message: i18n.language === 'en' ? 'Please enter or select a patient.' : 'Iltimos, bemor ismini kiriting.'
      });
      return;
    }
    const cleanAmount = parseInt(String(paymentForm.amount).replace(/\D/g, ''), 10) || 0;
    if (cleanAmount <= 0) {
      setToast({
        open: true,
        type: 'warning',
        title: i18n.language === 'en' ? 'Invalid amount' : 'Noto\'g\'ri summa',
        message: i18n.language === 'en' ? 'Payment amount must be greater than zero.' : 'To\'lov summasi 0 dan katta bo\'lishi kerak.'
      });
      return;
    }

    const nextIdNum = invoices.length + 1;
    const newId = `INV-2026-${String(nextIdNum).padStart(3, '0')}`;
    const now = new Date();
    const monthsUz = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
    const dateFormatted = `${now.getDate()}-${monthsUz[now.getMonth()]}, ${now.getFullYear()} • ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const created = {
      id: newId,
      patient: paymentForm.patient,
      patientId: paymentForm.patientId || String(Math.floor(1000 + Math.random() * 9000)),
      procedure: paymentForm.procedure,
      doctor: paymentForm.doctor,
      date: dateFormatted,
      method: paymentForm.method,
      amount: cleanAmount,
      status: paymentForm.status
    };

    setInvoices((prev) => [created, ...prev]);

    if (paymentForm.status === 'paid') {
      setStats((prev) => prev ? { ...prev, monthlyRevenue: (prev.monthlyRevenue || 0) + cleanAmount } : prev);
    } else {
      setStats((prev) => prev ? { ...prev, pendingPayments: (prev.pendingPayments || 0) + cleanAmount, pendingCount: (prev.pendingCount || 0) + 1 } : prev);
    }

    setShowCollectModal(false);
    setToast({
      open: true,
      type: 'success',
      title: i18n.language === 'en' ? 'Payment Collected' : 'To\'lov muvaffaqiyatli qabul qilindi',
      message: i18n.language === 'en'
        ? `Invoice #${newId} (${formatUZS(cleanAmount)}) has been recorded.`
        : `${paymentForm.patient} uchun ${formatUZS(cleanAmount)} miqdoridagi to'lov (${paymentForm.method}) qabul qilindi.`
    });
  };

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
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-cyan-hover)', transition: 'color 0.2s ease' }}>
          {val}
        </span>
      )
    },
    {
      title: t('finance.invoicesTable.colPatient'),
      key: 'patient',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }}>{val}</div>
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
          <div className={styles.exportGroup} ref={exportDropdownRef}>
            <button
              type="button"
              className={styles.exportBtn}
              onClick={handleExportExcel}
              disabled={exporting}
              title={i18n.language === 'en' ? 'Download as Excel (.xlsx)' : 'Excel (.xlsx) formatida yuklab olish'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>
                table_view
              </span>
              <span>
                {exporting
                  ? (i18n.language === 'en' ? 'Exporting...' : 'Yuklanmoqda...')
                  : (i18n.language === 'en' ? 'Export (Excel)' : 'Eksport (Excel)')}
              </span>
            </button>
            <button
              type="button"
              className={styles.exportMenuTrigger}
              onClick={() => setShowExportMenu(!showExportMenu)}
              title={i18n.language === 'en' ? 'More export formats' : 'Boshqa formatlar'}
              aria-label="Export options"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_drop_down
              </span>
            </button>

            {showExportMenu && (
              <div className={styles.exportMenu}>
                <button
                  type="button"
                  className={styles.exportMenuItem}
                  onClick={handleExportExcel}
                  disabled={exporting}
                >
                  <span className="material-symbols-outlined" style={{ color: '#10B981', fontSize: '24px' }}>
                    table_view
                  </span>
                  <div className={styles.menuItemContent}>
                    <div className={styles.menuItemTitle}>
                      Excel (.xlsx) <span className={styles.recommendedBadge}>{i18n.language === 'en' ? 'Recommended' : 'Tavsiya'}</span>
                    </div>
                    <div className={styles.menuItemDesc}>
                      {i18n.language === 'en'
                        ? 'Full ledger, KPI summary & financial totals'
                        : 'Moliya hisoboti, KPI bloklari va jami summalar'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  className={styles.exportMenuItem}
                  onClick={handleExportPDF}
                >
                  <span className="material-symbols-outlined" style={{ color: '#EF4444', fontSize: '24px' }}>
                    picture_as_pdf
                  </span>
                  <div className={styles.menuItemContent}>
                    <div className={styles.menuItemTitle}>PDF (.pdf)</div>
                    <div className={styles.menuItemDesc}>
                      {i18n.language === 'en'
                        ? 'Printable financial report with stamp & sign areas'
                        : 'Chop etish va hisobot uchun rasmiy blanka'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  className={styles.exportMenuItem}
                  onClick={handleExportWord}
                >
                  <span className="material-symbols-outlined" style={{ color: '#3B82F6', fontSize: '24px' }}>
                    article
                  </span>
                  <div className={styles.menuItemContent}>
                    <div className={styles.menuItemTitle}>Word (.doc)</div>
                    <div className={styles.menuItemDesc}>
                      {i18n.language === 'en'
                        ? 'Editable financial ledger for Word & WPS Writer'
                        : 'Tahrirlash va hisobot uchun Word hujjati'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  className={styles.exportMenuItem}
                  onClick={handleExportCSV}
                >
                  <span className="material-symbols-outlined" style={{ color: '#64748B', fontSize: '24px' }}>
                    description
                  </span>
                  <div className={styles.menuItemContent}>
                    <div className={styles.menuItemTitle}>CSV (.csv)</div>
                    <div className={styles.menuItemDesc}>
                      {i18n.language === 'en'
                        ? 'Standard raw tabular data for spreadsheets'
                        : 'Universal matnli ma\'lumotlar jadvali'}
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className={styles.collectBtn}
            onClick={() => setShowCollectModal(true)}
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

      {/* Collect Payment Modal Dialog */}
      {showCollectModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCollectModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderInfo}>
                <div className={styles.modalTitle}>
                  <span className={`material-symbols-outlined ${styles.modalTitleIcon}`}>
                    account_balance_wallet
                  </span>
                  <span>{i18n.language === 'en' ? 'Collect Payment' : 'Yangi to\'lov qabul qilish'}</span>
                </div>
                <div className={styles.modalSub}>
                  {i18n.language === 'en'
                    ? 'Register dental procedure payment and generate invoice receipt'
                    : 'Muolaja to\'lovini qabul qilish va kassa invoysini rasmiylashtirish'}
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setShowCollectModal(false)}
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className={styles.modalForm}>
              {/* Patient */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {i18n.language === 'en' ? 'Patient' : 'Bemor'}
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder={i18n.language === 'en' ? 'e.g. Anvar Qosimov' : 'Masalan: Anvar Qosimov'}
                  value={paymentForm.patient}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, patient: e.target.value }))}
                  required
                />
              </div>

              {/* Procedure & Doctor */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {i18n.language === 'en' ? 'Procedure' : 'Muolaja / Xizmat'}
                  </label>
                  <select
                    className={styles.formSelect}
                    value={paymentForm.procedure}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, procedure: e.target.value }))}
                  >
                    <option value="Kompozit restavratsiya">Kompozit restavratsiya</option>
                    <option value="Endodontiya & kanal davolash">Endodontiya & kanal davolash</option>
                    <option value="Tish tozalash & Air-Flow">Tish tozalash & Air-Flow</option>
                    <option value="Implantatsiya (Straumann)">Implantatsiya (Straumann)</option>
                    <option value="Breket korreksiyasi">Breket korreksiyasi</option>
                    <option value="3D CBCT tomografiya">3D CBCT tomografiya</option>
                    <option value="Dastlabki konsultatsiya">Dastlabki konsultatsiya</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {i18n.language === 'en' ? 'Doctor' : 'Shifokor'}
                  </label>
                  <select
                    className={styles.formSelect}
                    value={paymentForm.doctor}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, doctor: e.target.value }))}
                  >
                    <option value="Dr. Azimov">Dr. Azimov (Bosh shifokor)</option>
                    <option value="Dr. Saidova">Dr. Saidova (Ortodont)</option>
                    <option value="Dr. Karimov">Dr. Karimov (Jarroh-implantolog)</option>
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {i18n.language === 'en' ? 'Amount (UZS)' : 'To\'lov summasi (UZS)'}
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={paymentForm.amount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setPaymentForm((prev) => ({ ...prev, amount: raw }));
                  }}
                  placeholder="500000"
                  required
                />
                <div className={styles.quickChipsRow}>
                  {['200000', '450000', '800000', '1500000', '3000000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={styles.quickChip}
                      onClick={() => setPaymentForm((prev) => ({ ...prev, amount: amt }))}
                    >
                      {formatUZS(Number(amt))}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {i18n.language === 'en' ? 'Payment Method' : 'To\'lov usuli'}
                </label>
                <div className={styles.methodsGrid}>
                  {[
                    { key: 'Payme', color: '#06B6D4' },
                    { key: 'Click', color: '#3B82F6' },
                    { key: 'Naqd', color: '#10B981' },
                    { key: 'Uzcard', color: '#8B5CF6' },
                    { key: 'Humo', color: '#F59E0B' }
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      className={`${styles.methodCard} ${paymentForm.method === m.key ? styles.methodCardActive : ''}`}
                      onClick={() => setPaymentForm((prev) => ({ ...prev, method: m.key }))}
                    >
                      <span className={styles.methodDot} style={{ backgroundColor: m.color }} />
                      <span>{m.key}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Status */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {i18n.language === 'en' ? 'Payment Status' : 'To\'lov holati'}
                </label>
                <select
                  className={styles.formSelect}
                  value={paymentForm.status}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="paid">{i18n.language === 'en' ? 'Fully Paid' : 'To\'liq to\'langan'}</option>
                  <option value="pending">{i18n.language === 'en' ? 'Pending' : 'Kutilmoqda'}</option>
                  <option value="partial">{i18n.language === 'en' ? 'Partial' : 'Qisman to\'langan'}</option>
                </select>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowCollectModal(false)}
                >
                  {i18n.language === 'en' ? 'Cancel' : 'Bekor qilish'}
                </button>
                <button
                  type="submit"
                  className={styles.confirmBtn}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    check
                  </span>
                  <span>{i18n.language === 'en' ? 'Confirm Payment' : 'To\'lovni tasdiqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        open={toast.open}
        title={toast.title}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
