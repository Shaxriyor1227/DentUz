import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FixedSizeList as List } from 'react-window';
import { patientsApi } from '../../api/patientsApi';
import { useDebounce } from '../../hooks/useDebounce';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import Toast from '../../components/Toast/Toast';
import { downloadText } from '../../utils/downloadHelper';
import { usePageMeta } from '../../hooks/usePageMeta';
import styles from './Patients.module.css';

export default function Patients() {
  const { t, i18n } = useTranslation();
  usePageMeta(t('nav.patients') || 'Bemorlar Bazasi', "DentUz elektron ambulatoriya kartochkalari va stomatologik bemorlar bazasi.");
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState({
    all: 0,
    today: 0,
    scheduled: 0,
    debtor: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [newPatient, setNewPatient] = useState({
    name: '',
    phone: '+998 ',
    allergies: '',
    notes: ''
  });
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportDropdownRef = useRef(null);

  const debouncedSearch = useDebounce(search, 250);

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

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch matching items
      const res = await patientsApi.getAll({
        search: debouncedSearch,
        filter,
        page: 1,
        pageSize: 500 // provide items to react-window for smooth virtualization
      });
      setPatients(res.items);
      setTotalCount(res.allTotalCount);
      if (res.counts) {
        setCounts(res.counts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleRowClick = (patient) => {
    const cleanId = patient.id.replace('P-', '');
    navigate(`/patients/${cleanId}`);
  };

  // Fetch the full list of matching patients for full exports (up to all 1,250 records)
  const fetchAllForExport = async () => {
    try {
      const res = await patientsApi.getAll({
        search: debouncedSearch,
        filter,
        page: 1,
        pageSize: 10000 // Get all matching patients without virtual pagination slice
      });
      return (res && res.items && res.items.length > 0) ? res.items : patients;
    } catch {
      return patients;
    }
  };

  const handleExportExcel = async () => {
    if (!patients || patients.length === 0) {
      setToast({
        open: true,
        type: 'warning',
        title: 'Eksport qilib bo\'lmadi',
        message: 'Eksport qilish uchun jadvalda bemorlar topilmadi.'
      });
      return;
    }
    const isEn = i18n.language === 'en';
    try {
      setExporting(true);
      setShowExportMenu(false);
      const allPatients = await fetchAllForExport();
      const { exportPatientsToExcel } = await import('../../utils/exportPatientsExcel');
      await exportPatientsToExcel(allPatients, {
        filter,
        language: i18n.language,
        clinicName: 'DentUz Stomatologiya Klinikasi'
      });
      setToast({
        open: true,
        type: 'success',
        title: isEn ? 'Excel Export Successful' : 'Excel (.xlsx) yuklab olindi',
        message: isEn
          ? `${allPatients.length} patient records exported with full styles and formatting.`
          : `${allPatients.length} ta bemor ma'lumotlari to'liq Excel (.xlsx) jadvaliga yuklandi.`
      });
    } catch (err) {
      console.error('Export Excel error:', err);
      setToast({
        open: true,
        type: 'error',
        title: isEn ? 'Export failed' : 'Eksportda xatolik',
        message: err.message || (isEn ? 'Could not export Excel file.' : 'Excel faylini yaratib bo\'lmadi.')
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    if (!patients || patients.length === 0) {
      setToast({
        open: true,
        type: 'warning',
        title: 'Eksport qilib bo\'lmadi',
        message: 'Eksport qilish uchun jadvalda bemorlar topilmadi.'
      });
      return;
    }
    const isEn = i18n.language === 'en';
    setShowExportMenu(false);
    const allPatients = await fetchAllForExport();
    const headers = isEn
      ? ['ID', 'Patient Name', 'Phone', 'Last Visit', 'Next Appointment', 'Balance (UZS)', 'Status']
      : ['ID', 'Bemor F.I.SH', 'Telefon', 'Oxirgi Tashrif', 'Keyingi Qabul', 'Balans (UZS)', 'Holati'];

    const rows = allPatients.map((p) => {
      const balanceNum = p.balance ? -Math.abs(Number(p.balance)) : 0;
      const statusText = balanceNum < 0
        ? (isEn ? 'Has Debt' : 'Qarzdorlik bor')
        : (isEn ? 'Settled' : 'To\'langan');
      return [
        `"${p.id || ''}"`,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${p.phone || ''}"`,
        `"${(p.lastVisit || '') + (p.lastProcedure ? ' - ' + p.lastProcedure : '')}"`,
        `"${p.nextVisit || (isEn ? 'Not scheduled' : 'Rejalashtirilmagan')}"`,
        balanceNum,
        `"${statusText}"`
      ];
    });

    const csvContent = '\uFEFFsep=,\r\n' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const filterSuffix = filter !== 'all' ? `_${filter}` : '';
    downloadText(csvContent, `DentUz_Bemorlar${filterSuffix}_${new Date().toISOString().slice(0, 10)}.csv`);

    setToast({
      open: true,
      type: 'success',
      title: isEn ? 'Export completed' : 'Eksport muvaffaqiyatli yakunlandi',
      message: isEn
        ? `${allPatients.length} patient records exported to CSV.`
        : `${allPatients.length} ta bemor ma'lumotlari CSV fayliga yuklab olindi.`
    });
  };

  const handleExportPDF = async () => {
    if (!patients || patients.length === 0) return;
    try {
      setShowExportMenu(false);
      const allPatients = await fetchAllForExport();
      const { exportPatientsToPDF } = await import('../../utils/exportPatientsDocuments');
      exportPatientsToPDF(allPatients, { filter, language: i18n.language });
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportWord = async () => {
    if (!patients || patients.length === 0) return;
    try {
      setShowExportMenu(false);
      const allPatients = await fetchAllForExport();
      const { exportPatientsToWord } = await import('../../utils/exportPatientsDocuments');
      exportPatientsToWord(allPatients, { filter, language: i18n.language });
      setToast({
        open: true,
        type: 'success',
        title: i18n.language === 'en' ? 'Word Document Downloaded' : 'Word (.doc) fayli yuklandi',
        message: i18n.language === 'en' ? `${allPatients.length} patient records saved as Word document.` : `${allPatients.length} ta bemor ro'yxati Word hujjatiga yuklandi.`
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!newPatient.name.trim()) return;
    const created = await patientsApi.create(newPatient);
    setShowAddModal(false);
    setNewPatient({ name: '', phone: '+998 ', allergies: '', notes: '' });
    setToast({
      open: true,
      type: 'success',
      title: 'Yangi bemor qo\'shildi',
      message: `${created.name} muvaffaqiyatli ro'yxatdan o'tkazildi.`
    });
    fetchPatients();
    if (created && created.id) {
      setTimeout(() => {
        handleRowClick(created);
      }, 700);
    }
  };

  // Virtual row renderer for react-window
  const Row = ({ index, style }) => {
    const p = patients[index];
    if (!p) return null;

    const initials = p.name
      ? p.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'P';

    const rawNext = p.nextVisit;
    const hasNextFromApt = p.appointments && p.appointments.length > 0;
    const firstApt = hasNextFromApt ? p.appointments[0] : null;
    const displayNext = (rawNext && rawNext !== 'Rejalashtirilmagan')
      ? rawNext
      : (firstApt ? `${firstApt.date || ''} • ${firstApt.time || ''}`.trim() : null);

    const isUnscheduled = !displayNext || displayNext === 'Rejalashtirilmagan';

    const balNum = Number(p.balance) || 0;
    const isDebt = balNum < 0 || (p.status === 'debtor' && balNum !== 0);

    return (
      <div
        style={style}
        className={styles.virtualRow}
        onClick={() => handleRowClick(p)}
        role="button"
        tabIndex={0}
      >
        <div className={styles.patientCell}>
          <div className={styles.avatarBox}>
            {initials}
          </div>
          <div className={styles.patientInfo}>
            <div className={styles.patientNameRow}>
              <span className={styles.patientName}>{p.name}</span>
              <span className={styles.patientIdBadge}>{p.id}</span>
            </div>
            <span className={styles.patientSubDetail}>
              {p.allergies ? `⚠️ ${p.allergies}` : (i18n.language === 'en' ? 'Dental Patient' : 'Klinika bemori')}
            </span>
          </div>
        </div>

        <div className={styles.phoneCell}>{p.phone}</div>

        <div className={styles.visitCell}>
          <span className={styles.visitDate}>{p.lastVisit}</span>
          <span className={styles.visitProc}>{p.lastProcedure}</span>
        </div>

        <div>
          {!isUnscheduled ? (
            <div className={styles.nextVisitBadge}>
              <span className={styles.nextVisitDot} />
              <span>{displayNext}</span>
            </div>
          ) : (
            <span className={styles.noVisitText}>
              {t('patients.notScheduled', 'Rejalashtirilmagan')}
            </span>
          )}
        </div>

        <div className={styles.balanceCell}>
          {isDebt ? (
            <span className={styles.debtBadge}>
              <span className={styles.debtBadgeDot} />
              <span>-{Math.abs(balNum).toLocaleString()} {t('common.som')}</span>
            </span>
          ) : balNum > 0 ? (
            <span className={styles.paidBadge} style={{ color: 'var(--color-cyan)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
              <span>+{balNum.toLocaleString()} {t('common.som')}</span>
            </span>
          ) : (
            <span className={styles.paidBadge}>
              <span>0 {t('common.som')}</span>
            </span>
          )}
        </div>

        <div className={styles.actionsCell}>
          <button
            type="button"
            className={styles.actionIconBtn}
            title={t('common.details')}
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(p);
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              folder_open
            </span>
          </button>
          <button
            type="button"
            className={styles.actionIconBtn}
            title={t('common.details')}
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(p);
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              chevron_right
            </span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>{t('patients.title')}</h1>
          <p className={styles.subtitle}>
            {debouncedSearch || filter !== 'all' ? (
              <span>
                {t('patients.foundCount', 'Topildi')}:{' '}
                <strong style={{ color: 'var(--color-cyan)' }}>{patients.length} ta</strong> bemor{' '}
                <span style={{ opacity: 0.7 }}>(jami {counts.all} tadan)</span>
              </span>
            ) : (
              t('patients.subtitle', { count: counts.all })
            )}
          </p>
        </div>

        <div className={styles.actionGroup}>
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
                  : t('patients.exportExcel', 'Eksport (Excel)')}
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
                        ? 'Styled table, auto column widths, colors & totals'
                        : 'Chiroyli dizayn, ustun kengliklari, ranglar va jami hisoblar'}
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
                        ? 'Official printable document with stamp area'
                        : 'Rasmiy klinika blankasi, imzo va muhr o\'rni bilan'}
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
                        ? 'Editable document for Microsoft Word / WPS Writer'
                        : 'Tahrirlash va hisobot uchun Word formati'}
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
            className={styles.newPatientBtn}
            onClick={() => setShowAddModal(true)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              add
            </span>
            <span>{t('patients.newPatient')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Strip */}
      <div className={styles.filterStrip}>
        <div className={styles.searchBox}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>
            search
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('patients.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterPills}>
          <button
            type="button"
            className={`${styles.filterPill} ${filter === 'all' ? styles.filterPillActive : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('patients.filterAll')} ({counts.all})
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${filter === 'today' ? styles.filterPillActive : ''}`}
            onClick={() => setFilter('today')}
          >
            {t('patients.filterToday')} ({counts.today})
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${filter === 'scheduled' ? styles.filterPillActive : ''}`}
            onClick={() => setFilter('scheduled')}
          >
            {t('patients.filterScheduled')} ({counts.scheduled})
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${filter === 'debtor' ? styles.filterPillActive : ''}`}
            onClick={() => setFilter('debtor')}
          >
            {t('patients.filterDebtors')} ({counts.debtor})
          </button>
        </div>
      </div>

      {/* Desktop Virtualized Table Container (≥ 768px) */}
      <div className={styles.desktopTableView}>
        <div className={styles.tableCard}>
          <div className={styles.tableScrollContainer}>
            <div className={styles.tableInner}>
              <div className={styles.tableHeader}>
                <span>{i18n.language === 'en' ? 'Patient & ID' : 'Bemor va ID'}</span>
                <span>{t('patients.table.phone')}</span>
                <span>{t('patients.table.lastVisit')}</span>
                <span>{t('patients.table.nextVisit')}</span>
                <span>{t('patients.table.balance')}</span>
                <span className={styles.tableHeaderRight}>{t('patients.table.actions')}</span>
              </div>

              {loading ? (
                <div style={{ padding: '20px' }}>
                  <SkeletonLoader type="table" count={8} />
                </div>
              ) : patients.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className="material-symbols-outlined" style={{ fontSize: '42px', color: 'var(--color-outline)' }}>
                    person_search
                  </span>
                  <p style={{ margin: 0, fontWeight: 500 }}>{t('patients.table.noPatientsFound')}</p>
                  {(search || filter !== 'all') && (
                    <button
                      type="button"
                      className={styles.clearFilterBtn}
                      onClick={() => {
                        setSearch('');
                        setFilter('all');
                      }}
                    >
                      Filtrlarni tozalash
                    </button>
                  )}
                </div>
              ) : (
                <List
                  height={Math.min(Math.max(patients.length * 64, 192), 520)}
                  itemCount={patients.length}
                  itemSize={64}
                  width="100%"
                >
                  {Row}
                </List>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Streamlined Cards (< 768px) */}
      <div className={styles.mobileCardList}>
        {loading ? (
          <div style={{ padding: '10px 0' }}>
            <SkeletonLoader type="table" count={4} />
          </div>
        ) : patients.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: '38px', color: 'var(--color-outline)' }}>
              person_search
            </span>
            <p style={{ margin: 0, fontWeight: 500 }}>{t('patients.table.noPatientsFound')}</p>
            {(search || filter !== 'all') && (
              <button
                type="button"
                className={styles.clearFilterBtn}
                onClick={() => {
                  setSearch('');
                  setFilter('all');
                }}
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        ) : (
          patients.map((p) => {
            const initials = p.name
              ? p.name.split(' ').map((n) => n[0]).join('').toUpperCase()
              : 'P';
            const balNum = Number(p.balance) || 0;
            const isDebt = balNum < 0 || (p.status === 'debtor' && balNum !== 0);

            return (
              <div
                key={p.id}
                className={styles.mobilePatientCard}
                onClick={() => handleRowClick(p)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.mobilePatientLeft}>
                  <div className={styles.avatarBox}>{initials}</div>
                  <div className={styles.mobilePatientInfo}>
                    <div className={styles.mobilePatientNameRow}>
                      <span className={styles.mobilePatientName}>{p.name}</span>
                      <span className={styles.patientIdBadge}>{p.id}</span>
                    </div>
                    <div className={styles.mobilePatientSub}>
                      {p.phone ? (
                        <a
                          href={`tel:${p.phone.replace(/\s+/g, '')}`}
                          className={styles.mobilePhoneLink}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>call</span>
                          <span>{p.phone}</span>
                        </a>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Telefon yo'q</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.mobilePatientRight}>
                  {isDebt ? (
                    <span className={styles.debtBadge}>
                      <span className={styles.debtBadgeDot} />
                      <span>-{Math.abs(balNum).toLocaleString()}</span>
                    </span>
                  ) : balNum > 0 ? (
                    <span className={styles.paidBadge} style={{ color: 'var(--color-cyan)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                      +{balNum.toLocaleString()}
                    </span>
                  ) : (
                    <span className={styles.paidBadge}>0 so'm</span>
                  )}
                  <span className={`material-symbols-outlined ${styles.mobileChevron}`}>
                    chevron_right
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modernized New Patient Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{t('patients.modal.title')}</h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setShowAddModal(false)}
                title={t('common.close')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  close
                </span>
              </button>
            </div>

            <form onSubmit={handleAddPatient} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('patients.modal.fullName')} *
                </label>
                <input
                  required
                  type="text"
                  placeholder="masalan, Shavkat Karimov"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className={styles.modalInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('patients.modal.phone')} *
                </label>
                <input
                  required
                  type="text"
                  placeholder="+998 90 123 45 67"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className={styles.modalInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('patientProfile.allergies')}
                </label>
                <input
                  type="text"
                  placeholder="masalan, Penitsillin, Lidokain"
                  value={newPatient.allergies}
                  onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                  className={styles.modalInput}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={styles.cancelBtn}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Feedback Notification */}
      <Toast
        open={toast.open}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
