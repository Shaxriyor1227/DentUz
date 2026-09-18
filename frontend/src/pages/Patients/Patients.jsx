import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FixedSizeList as List } from 'react-window';
import { patientsApi } from '../../api/patientsApi';
import { useDebounce } from '../../hooks/useDebounce';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import styles from './Patients.module.css';

export default function Patients() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [totalCount, setTotalCount] = useState(342);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    phone: '+998 ',
    allergies: '',
    notes: ''
  });

  const debouncedSearch = useDebounce(search, 250);

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

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!newPatient.name) return;
    const created = await patientsApi.create(newPatient);
    setShowAddModal(false);
    setNewPatient({ name: '', phone: '+998 ', allergies: '', notes: '' });
    fetchPatients();
    navigate(`/patients/${created.id.replace('P-', '')}`);
  };

  // Virtual row renderer for react-window
  const Row = ({ index, style }) => {
    const p = patients[index];
    if (!p) return null;

    const initials = p.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const isCyanAvatar = index % 3 === 1;

    return (
      <div
        style={style}
        className={styles.virtualRow}
        onClick={() => handleRowClick(p)}
      >
        <div className={styles.patientCell}>
          <div
            className={`${styles.avatarBox} ${
              isCyanAvatar ? styles.avatarBoxCyan : ''
            }`}
          >
            {initials}
          </div>
          <div className={styles.patientInfo}>
            <span className={styles.patientName}>{p.name}</span>
            <span className={styles.patientId}>ID: #{p.id}</span>
          </div>
        </div>

        <div className={styles.phoneCell}>{p.phone}</div>

        <div className={styles.visitCell}>
          <span className={styles.visitDate}>{p.lastVisit}</span>
          <span className={styles.visitProc}>{p.lastProcedure}</span>
        </div>

        <div>
          <div className={styles.nextVisitBadge}>
            <span className={styles.nextVisitDot} />
            <span>{p.nextVisit}</span>
          </div>
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
            {t('patients.subtitle', { count: totalCount })}
          </p>
        </div>

        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={() => alert(i18n.language === 'uz' ? "Bemorlar ro'yxati CSV formatida eksport qilindi." : "Patient list exported as CSV.")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              file_download
            </span>
            <span>{t('patients.exportCsv')}</span>
          </button>

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
            {t('patients.filterAll')} ({totalCount})
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${filter === 'today' ? styles.filterPillActive : ''}`}
            onClick={() => setFilter('today')}
          >
            {t('patients.filterToday')} (14)
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${filter === 'scheduled' ? styles.filterPillActive : ''}`}
            onClick={() => setFilter('scheduled')}
          >
            {t('patients.filterScheduled')} (89)
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${filter === 'debtor' ? styles.filterPillActive : ''}`}
            onClick={() => setFilter('debtor')}
          >
            {t('patients.filterDebtors')} (5)
          </button>
        </div>
      </div>

      {/* Virtualized Table Container with react-window */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span>{t('patients.table.patient')}</span>
          <span>{t('patients.table.phone')}</span>
          <span>{t('patients.table.lastVisit')}</span>
          <span>{t('patients.table.nextVisit')}</span>
          <span className={styles.tableHeaderRight}>{t('patients.table.actions')}</span>
        </div>

        {loading ? (
          <div style={{ padding: '16px' }}>
            <SkeletonLoader type="table" count={8} />
          </div>
        ) : patients.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            {t('patients.table.noPatientsFound')}
          </div>
        ) : (
          <List
            height={480}
            itemCount={patients.length}
            itemSize={64}
            width="100%"
          >
            {Row}
          </List>
        )}
      </div>

      {/* New Patient Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{t('patients.modal.title')}</h2>
            <form onSubmit={handleAddPatient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  {t('patients.modal.fullName')}
                </label>
                <input
                  required
                  type="text"
                  placeholder="masalan, Shavkat Karimov"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  {t('patients.modal.phone')}
                </label>
                <input
                  required
                  type="text"
                  placeholder="+998 90 123 45 67"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  {t('patientProfile.allergies')}
                </label>
                <input
                  type="text"
                  placeholder="masalan, Penitsillin, Lidokain"
                  value={newPatient.allergies}
                  onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface-container)', color: 'var(--color-text-primary)', cursor: 'pointer' }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', background: 'var(--color-cyan)', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
