import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { patientsApi } from '../../api/patientsApi';
import { odontogramApi } from '../../api/odontogramApi';
import Odontogram from '../../components/Odontogram/Odontogram';
import StatusPill from '../../components/StatusPill/StatusPill';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import { formatUZS } from '../../utils/formatters';
import styles from './PatientProfile.module.css';

// Initial treatment history items
// Initial treatment history items
const INITIAL_TREATMENTS = [
  {
    id: 'TR-101',
    date: '18-Sentabr, 2026',
    tooth: '#16',
    title: "Endodontik davolash (ildiz kanallarini tozalash va dorilash)",
    doctor: 'Dr. J. Azimov',
    materials: 'Septanest 1:100000, Endo-Prep, Ca(OH)2 pasta',
    price: 950000,
    status: 'completed',
    note: "3 ta ildiz kanali to'liq kengaytirildi va kalsiy gidroksidi kiritildi. Vaqtinchalik plomba qo'yildi."
  },
  {
    id: 'TR-102',
    date: '15-Sentabr, 2026',
    tooth: 'Umumiy',
    title: "3D CBCT tomografiya va diagnostik tahlil",
    doctor: 'Dr. M. Saidova',
    materials: 'Vatech PaX-i3D apparati, DICOM eksport',
    price: 350000,
    status: 'completed',
    note: "Yuqori o'ng jag' sohasida #16 tish periapikal to'qimalarida 2.4 mm destruksiya o'chog'i aniqlandi."
  },
  {
    id: 'TR-103',
    date: '02-Sentabr, 2026',
    tooth: '#14',
    title: "Yorug'likda qotuvchi estetik kompozit restavratsiya",
    doctor: 'Dr. J. Azimov',
    materials: 'Filtek Z250 (3M ESPE), A3 rang, Single Bond',
    price: 450000,
    status: 'completed',
    note: "Oklyuzion va distal yuzalar anatomik shaklda tiklandi va sayqallandi."
  },
  {
    id: 'TR-104',
    date: '15-Avgust, 2026',
    tooth: 'Umumiy',
    title: "Professional ultratovushli tozalash va Air-Flow gigiyena",
    doctor: 'Dr. M. Saidova',
    materials: 'Kavo PROPHYflex, Clinpro profilaktik pasta',
    price: 300000,
    status: 'completed',
    note: "Supragingival va subgingival tish toshlari olib tashlandi, flyuorizatsiya qilindi."
  },
  {
    id: 'TR-105',
    date: '08-Iyul, 2026',
    tooth: '#21',
    title: "Metall-keramika toj doimiy fiksatsiyasi",
    doctor: 'Dr. J. Azimov',
    materials: 'Duceram Plus keramika, Fuji I shisha ionomer sement',
    price: 1100000,
    status: 'completed',
    note: "Estetika va rang mosligi tekshirildi, oklyuziya sozlangan holda fiksatsiya qilindi."
  }
];

// Initial X-ray and CT gallery items with authentic dental radiology
// Initial X-ray and CT gallery items with authentic dental radiology
const XRAY_GALLERY = [
  {
    id: 'xr-1',
    title: "To'liq jag' panoramik rentgeni (OPG)",
    type: "Panoramik OPG",
    date: '18.09.2026',
    doctor: 'Dr. M. Saidova',
    region: "Yuqori va pastki jag'",
    desc: "Barcha tishlar ildiz tizimi va suyak to'qimasi balandligi holati ko'rinishi.",
    img: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 'xr-2',
    title: "3D CBCT Tomografiya kesimi (16-tish sohasi)",
    type: "3D Tomografiya",
    date: '18.09.2026',
    doctor: 'Dr. J. Azimov',
    region: "16-tish oziq tish apeksi",
    desc: "MB2 qo'shimcha ildiz kanalini aniqlash va gaymor bo'shlig'i tubi munosabati.",
    img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 'xr-3',
    title: "Periapikal viziografiya (16-tish ildiz kanallari)",
    type: "Periapikal",
    date: '18.09.2026',
    doctor: 'Dr. J. Azimov',
    region: "16-tish",
    desc: "Ishchi uzunlikni o'lchash (Working Length) nazorat rentgen tasviri.",
    img: "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 'xr-4',
    title: "Bitewing interproksimal rentgen (36 va 37-tishlar)",
    type: "Bitewing",
    date: '15.09.2026',
    doctor: 'Dr. M. Saidova',
    region: "Pastki chap molyarlar",
    desc: "Yashirin kontakt karies profilaktik nazorati, patologiya aniqlanmadi.",
    img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80"
  }
];

// Initial Invoices for this patient
const INITIAL_INVOICES = [
  { id: 'INV-1042-01', date: '18-sentabr, 2026', procedure: '16-tish Endodontik davolash', amount: 950000, method: 'Payme', status: 'paid' },
  { id: 'INV-1042-02', date: '15-sentabr, 2026', procedure: '3D CBCT Tomografiya kesimi', amount: 350000, method: 'Naqd', status: 'paid' },
  { id: 'INV-1042-03', date: '02-sentabr, 2026', procedure: '14-tish Estetik plomba', amount: 450000, method: 'Click', status: 'paid' },
  { id: 'INV-1042-04', date: '25-sentabr, 2026 (Reja)', procedure: '16-tish Sirkoniy toj fiksatsiyasi', amount: 1400000, method: 'Kutilmoqda', status: 'pending' }
];

export default function PatientProfile() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [chartData, setChartData] = useState({});
  const [selectedToothId, setSelectedToothId] = useState('16');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('odontogram');

  // Odontogram tooth form states
  const [toothStatus, setToothStatus] = useState('caries');
  const [doctorPlan, setDoctorPlan] = useState('');
  const [doctorDiag, setDoctorDiag] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // History states
  const [treatments, setTreatments] = useState(INITIAL_TREATMENTS);
  const [showAddTreatmentModal, setShowAddTreatmentModal] = useState(false);
  const [newTreatment, setNewTreatment] = useState({
    tooth: '16-tish',
    title: '',
    materials: '',
    price: '',
    doctor: 'Dr. J. Azimov'
  });

  // Clinical Dossier (Form 043/h) modal
  const [showDossierModal, setShowDossierModal] = useState(false);

  // X-Ray viewer lightbox states (Apple Pro Dark Room)
  const [selectedXray, setSelectedXray] = useState(null);
  const [xrayZoom, setXrayZoom] = useState(1);
  const [xrayInvert, setXrayInvert] = useState(false);
  const [xrayBrightness, setXrayBrightness] = useState(100);
  const [xrayContrast, setXrayContrast] = useState(120);
  const [showRuler, setShowRuler] = useState(false);

  // Billing states
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('1200000');
  const [paymentMethod, setPaymentMethod] = useState('Payme');
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Load patient & odontogram
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [pat, chart] = await Promise.all([
          patientsApi.getById(id || '1042'),
          odontogramApi.getChart(id || '1042')
        ]);
        setPatient(pat);
        setChartData(chart);

        const initialTooth = chart['16'] || chart[Object.keys(chart)[0]];
        if (initialTooth) {
          setSelectedToothId(initialTooth.id);
          setToothStatus(initialTooth.status);
          setDoctorDiag(initialTooth.diagnosis);
          setDoctorPlan(initialTooth.plan);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // When user clicks a tooth in Odontogram
  const handleSelectTooth = useCallback(
    (toothId) => {
      setSelectedToothId(toothId);
      const tooth = chartData[toothId];
      if (tooth) {
        setToothStatus(tooth.status);
        setDoctorDiag(tooth.diagnosis);
        setDoctorPlan(tooth.plan);
      }
    },
    [chartData]
  );

  // Save changes to selected tooth
  const handleSaveToothChanges = async () => {
    try {
      const updated = await odontogramApi.updateTooth(selectedToothId, {
        status: toothStatus,
        plan: doctorPlan,
        note: `Muolaja yangilandi: ${toothStatus}`
      });
      setChartData((prev) => ({
        ...prev,
        [selectedToothId]: updated
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  // Add treatment to history
  const handleAddTreatment = (e) => {
    e.preventDefault();
    if (!newTreatment.title) return;
    const added = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      date: 'Bugun',
      tooth: newTreatment.tooth || 'Umumiy',
      title: newTreatment.title,
      doctor: newTreatment.doctor || 'Dr. J. Azimov',
      materials: newTreatment.materials || 'Standart stomatologik material',
      price: Number(newTreatment.price) || 450000,
      status: 'completed',
      note: "Muolaja muvaffaqiyatli yakunlandi."
    };
    setTreatments((prev) => [added, ...prev]);
    setShowAddTreatmentModal(false);
    setNewTreatment({ tooth: '#16', title: '', materials: '', price: '', doctor: 'Dr. J. Azimov' });
  };

  // Handle new payment
  const handleAddPayment = (e) => {
    e.preventDefault();
    const inv = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      date: 'Bugun',
      procedure: '#16 Qoldiq to\'lov yopildi',
      amount: Number(paymentAmount) || 1200000,
      method: paymentMethod,
      status: 'paid'
    };
    setInvoices((prev) => [inv, ...prev]);
    setShowPaymentModal(false);
    setActiveReceipt(inv);
  };

  const currentTooth = chartData[selectedToothId] || {
    id: selectedToothId,
    name: `${selectedToothId}-tish`,
    diagnosis: doctorDiag,
    plan: doctorPlan,
    history: []
  };

  if (loading && !patient) {
    return (
      <div className={styles.pageContainer}>
        <SkeletonLoader type="card" height="120px" />
        <SkeletonLoader type="card" height="360px" />
      </div>
    );
  }

  const initials = patient?.name
    ? patient.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AQ';

  const totalBilled = invoices.reduce((acc, c) => acc + c.amount, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((acc, c) => acc + c.amount, 0);
  const remainingDebt = Math.max(0, totalBilled - totalPaid);

  return (
    <div className={styles.pageContainer}>
      {/* 1. Context Breadcrumb */}
      <div className={styles.breadcrumbRow}>
        <Link to="/patients" className={styles.backLink}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            arrow_back
          </span>
          <span>{t('patientProfile.backToList')}</span>
        </Link>
        <div className={styles.lastVisitBadge}>
          <span>{t('patientProfile.lastVisitLabel')}</span>
          <span className={styles.dateChip}>{patient?.lastVisit || '18-Sentabr, 2026'}</span>
        </div>
      </div>

      {/* 2. Patient Summary Dossier Card */}
      <div className={styles.summaryCard}>
        <div className={styles.patientIdentity}>
          <div className={styles.avatarWrapper}>
            <span>{initials}</span>
            <span className={styles.onlineIndicator} />
          </div>

          <div className={styles.identityMeta}>
            <div className={styles.nameRow}>
              <h1 className={styles.patientFullName}>{patient?.name || 'Anvar Qosimov'}</h1>
              <span className={styles.idBadge}>{patient?.id || 'P-1042'}</span>
              <span className={styles.regularBadge}>{t('patientProfile.regularPatient')}</span>
            </div>

            <div className={styles.contactRow}>
              <span className={`${styles.contactItem} ${styles.contactItemMono}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-cyan-hover)' }}>
                  call
                </span>
                {patient?.phone || '+998 90 842 11 00'}
              </span>
              <span className={styles.separatorDot} />
              <span className={styles.contactItem}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>
                  cake
                </span>
                {patient?.birthdate || '14.08.1989'} ({patient?.age || 34} {t('patientProfile.yearsOld')})
              </span>
              <span className={styles.separatorDot} />
              <span className={styles.allergyBadge}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  warning
                </span>
                {t('patientProfile.allergyPrefix')} {patient?.allergies || 'Penitsillin'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.summaryActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setShowDossierModal(true)}
            title={t('patientProfile.clinicalRecord')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              assignment
            </span>
            <span>{t('patientProfile.clinicalRecord')} (043/h)</span>
          </button>
          <Link to="/calendar" className={styles.btnPrimary}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              calendar_add_on
            </span>
            <span>{t('patientProfile.newAppointment')}</span>
          </Link>
        </div>
      </div>

      {/* 3. Medical Tabs Navigation */}
      <div className={styles.tabsNav}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'general' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            clinical_notes
          </span>
          <span>{t('patientProfile.tabs.overview')}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'odontogram' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('odontogram')}
        >
          <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--color-cyan)' }} />
          <span>{t('patientProfile.tabs.odontogram')}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'history' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span>{t('patientProfile.tabs.history')}</span>
          <span className={styles.tabCountBadge}>{treatments.length}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'xray' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('xray')}
        >
          <span>{t('patientProfile.tabs.xray')}</span>
          <span className={styles.tabCountBadge}>{XRAY_GALLERY.length}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'billing' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <span>{t('patientProfile.tabs.billing')}</span>
          {remainingDebt > 0 && (
            <span style={{ fontSize: '10px', background: 'var(--color-danger)', color: '#fff', padding: '1px 6px', borderRadius: 9999 }}>
              {t('patientProfile.debtBadge')}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================
          TAB 1: ODONTOGRAM
          ======================================================== */}
      {activeTab === 'odontogram' && (
        <div className={styles.workspaceGrid}>
          {/* Left Column (8 cols): SVG Odontogram & Stats */}
          <div className={styles.leftColumn}>
            <Odontogram
              chartData={chartData}
              selectedToothId={selectedToothId}
              onSelectTooth={handleSelectTooth}
            />

            {/* Quick Treatment Statistics Cards */}
            <div className={styles.statsRow}>
              <div className={styles.quickStatCard}>
                <div>
                  <span className={styles.statTitle}>{t('patientProfile.quickStats.treatedTeeth')}</span>
                  <div className={styles.statVal}>3 {t('common.qty')}</div>
                </div>
                <div className={styles.statIconBox}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-mint)', fontSize: '20px' }}>
                    verified
                  </span>
                </div>
              </div>

              <div className={styles.quickStatCard}>
                <div>
                  <span className={styles.statTitle}>{t('patientProfile.quickStats.treatmentPending')}</span>
                  <div className={`${styles.statVal} ${styles.statValDanger}`}>2 {t('common.qty')}</div>
                </div>
                <div className={styles.statIconBox} style={{ backgroundColor: 'var(--color-danger-bg)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-danger)', fontSize: '20px' }}>
                    healing
                  </span>
                </div>
              </div>

              <div className={styles.quickStatCard}>
                <div>
                  <span className={styles.statTitle}>{t('patientProfile.quickStats.healthyShare')}</span>
                  <div className={styles.statVal}>84.3%</div>
                </div>
                <div className={styles.statIconBox}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-cyan-hover)', fontSize: '20px' }}>
                    dentistry
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Tooth Details Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.detailsPanel}>
              <div className={styles.detailsHeader}>
                <div>
                  <div className={styles.toothBadgeRow}>
                    <span className={styles.detailsTitle}>{t('patientProfile.detailsPanel.title')}</span>
                    <span className={styles.toothBadge}>{t('patientProfile.detailsPanel.toothPrefix')}{selectedToothId}</span>
                  </div>
                  <div className={styles.toothFullName}>{currentTooth.name}</div>
                </div>

                <button
                  type="button"
                  style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-text-secondary)', background: 'var(--color-surface-container-low)' }}
                  title={t('common.details')}
                  onClick={() => handleSelectTooth(selectedToothId)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    sync
                  </span>
                </button>
              </div>

              {/* Status Select & One-Click Quick Pills */}
              <div className={styles.panelField}>
                <label className={styles.fieldLabel}>{t('patientProfile.detailsPanel.currentStatus')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '8px' }}>
                  {[
                    { id: 'healthy', label: t('odontogram.conditions.healthy'), color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
                    { id: 'caries', label: t('odontogram.conditions.caries'), color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
                    { id: 'treated', label: t('odontogram.conditions.treated'), color: '#00B4D8', bg: 'rgba(0, 180, 216, 0.1)' },
                    { id: 'crown', label: t('odontogram.conditions.crown'), color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
                    { id: 'missing', label: t('odontogram.conditions.missing'), color: '#64748B', bg: 'rgba(100, 116, 139, 0.1)' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setToothStatus(st.id)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: toothStatus === st.id ? `2px solid ${st.color}` : '1px solid var(--color-border)',
                        background: toothStatus === st.id ? st.bg : 'var(--color-surface-container-low)',
                        color: toothStatus === st.id ? st.color : 'var(--color-text-secondary)',
                        fontWeight: toothStatus === st.id ? 700 : 500,
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.color }} />
                      <span>{st.label}</span>
                    </button>
                  ))}
                </div>
                <select
                  className={styles.selectInput}
                  value={toothStatus}
                  onChange={(e) => setToothStatus(e.target.value)}
                >
                  <option value="caries">● {t('odontogram.conditions.caries')}</option>
                  <option value="healthy">● {t('odontogram.conditions.healthy')}</option>
                  <option value="treated">● {t('odontogram.conditions.treated')}</option>
                  <option value="crown">● {t('odontogram.conditions.crown')}</option>
                  <option value="missing">● {t('odontogram.conditions.missing')}</option>
                </select>
              </div>

              {/* Clinical Diagnosis Box */}
              <div className={styles.panelField}>
                <label className={styles.fieldLabel}>{t('patientProfile.detailsPanel.clinicalDiagnosis')}</label>
                <div className={styles.diagBox}>
                  {doctorDiag || (i18n.language === 'en' ? 'Enamel and dentin layer compromised. Thermal sensitivity present.' : 'Emal va dentin qatlami zararlangan. Termik sezuvchanlik mavjud.')}
                </div>
              </div>

              {/* Treatment Plan Textarea */}
              <div className={styles.panelField}>
                <label className={styles.fieldLabel}>{t('patientProfile.detailsPanel.treatmentPlanNote')}</label>
                <textarea
                  className={styles.textareaInput}
                  rows={3}
                  value={doctorPlan}
                  onChange={(e) => setDoctorPlan(e.target.value)}
                  placeholder={t('patientProfile.detailsPanel.planPlaceholder')}
                />
              </div>

              {/* Tooth Specific History */}
              <div className={styles.historySection}>
                <span className={styles.fieldLabel}>{t('patientProfile.detailsPanel.toothHistory')}</span>
                {currentTooth.history && currentTooth.history.length > 0 ? (
                  currentTooth.history.map((h, i) => (
                    <div key={i} className={styles.historyItem}>
                      <div className={styles.historyHeader}>
                        <span className={styles.historyDate}>{h.date}</span>
                        <span className={styles.historyDoctor}>{h.doctor}</span>
                      </div>
                      <p className={styles.historyNote}>{h.note}</p>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', padding: '8px 0' }}>
                    {t('patientProfile.detailsPanel.noToothHistory')}
                  </div>
                )}
              </div>

              {/* Feedback */}
              {saveSuccess && (
                <div style={{ padding: '8px 12px', background: 'var(--color-mint-soft)', color: 'var(--color-mint-text)', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                  ✓ {t('patientProfile.detailsPanel.saveSuccessMsg')}
                </div>
              )}

              <div className={styles.panelActions}>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={handleSaveToothChanges}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    check
                  </span>
                  <span>{t('patientProfile.detailsPanel.saveChanges')}</span>
                </button>

                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => handleSelectTooth(selectedToothId)}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>

            {/* Quick Tomography Attachment */}
            <div className={styles.attachmentCard}>
              <div className={styles.attachmentLeft}>
                <div className={styles.attachmentIcon}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    description
                  </span>
                </div>
                <div>
                  <div className={styles.attachmentTitle}>{t('patientProfile.detailsPanel.tomographyAttachment')}</div>
                  <div className={styles.attachmentSub}>{t('patientProfile.detailsPanel.fileLabel')} cbct_jaw_scan_1042.dicom</div>
                </div>
              </div>

              <button
                type="button"
                style={{ padding: '8px 14px', borderRadius: '8px', background: 'var(--color-surface-container-low)', color: 'var(--color-cyan-hover)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setActiveTab('xray')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  visibility
                </span>
                <span>{t('patientProfile.detailsPanel.viewAttachment')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: GENERAL MEDICAL & ANAMNESIS
          ======================================================== */}
      {activeTab === 'general' && (
        <div className={styles.tabContentContainer}>
          <div className={styles.generalGrid}>
            {/* Card 1: Pasport va Shaxsiy Ma'lumotlar */}
            <div className={styles.medicalCard}>
              <div className={styles.cardHeaderTitle}>
                <div className={styles.cardHeaderIcon}>
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div>
                  <h3 className={styles.cardTitle}>{t('patientProfile.generalAnamnesis.personalInfoTitle')}</h3>
                  <p className={styles.cardSub}>{t('patientProfile.generalAnamnesis.personalInfoSub')}</p>
                </div>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.fullName')}</span>
                  <span className={styles.infoValue}>{patient?.name || 'Anvar Qosimov'}</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.patientId')}</span>
                  <span className={styles.infoValue} style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-cyan-hover)' }}>
                    #{patient?.id || 'P-1042'}
                  </span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.birthAndAge')}</span>
                  <span className={styles.infoValue}>14.08.1989 (34 {t('patientProfile.yearsOld')})</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.gender')}</span>
                  <span className={styles.infoValue}>{t('patientProfile.generalAnamnesis.male')}</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.pinfl')}</span>
                  <span className={styles.infoValue} style={{ fontFamily: 'var(--font-mono)' }}>31408891230045</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.passport')}</span>
                  <span className={styles.infoValue} style={{ fontFamily: 'var(--font-mono)' }}>AA 5812903</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.address')}</span>
                  <span className={styles.infoValue}>Toshkent sh., Mirobod t., Nukus ko'chasi 24-uy</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.occupation')}</span>
                  <span className={styles.infoValue}>Dasturiy injiniring bo'yicha mutaxassis</span>
                </div>
              </div>

              {/* Shoshilinch aloqa */}
              <div style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', background: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    {t('patientProfile.generalAnamnesis.emergencyContact')}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    Saidova Nargiza ({i18n.language === 'en' ? 'Spouse' : 'Turmush o\'rtog\'i'})
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-cyan-hover)' }}>
                  +998 90 123 45 67
                </span>
              </div>
            </div>

            {/* Card 2: Somatik va Klinik Anamnez */}
            <div className={styles.medicalCard}>
              <div className={styles.cardHeaderTitle}>
                <div className={styles.cardHeaderIcon} style={{ color: 'var(--color-danger)' }}>
                  <span className="material-symbols-outlined">health_and_safety</span>
                </div>
                <div>
                  <h3 className={styles.cardTitle}>{t('patientProfile.generalAnamnesis.medicalHistoryTitle')}</h3>
                  <p className={styles.cardSub}>{t('patientProfile.generalAnamnesis.medicalHistorySub')}</p>
                </div>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.drugAllergy')}</span>
                  <div className={styles.alertPillWarning}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                    <span>{patient?.allergies || 'Penitsillin'}</span>
                  </div>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.bloodGroupRh')}</span>
                  <span className={styles.infoValue} style={{ fontFamily: 'var(--font-mono)' }}>
                    A (II) Rh+
                  </span>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.cardiovascular')}</span>
                  <span className={styles.infoValue}>{i18n.language === 'en' ? 'Hypertension Stage 1 (Stable, ECG normal)' : 'Gipertoniya 1-daraja (Barqaror, EKG normada)'}</span>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.diabetes')}</span>
                  <span className={styles.infoValue} style={{ color: 'var(--color-mint-text)' }}>
                    {i18n.language === 'en' ? 'None (Last lab: 5.2 mmol/l)' : 'Yo\'q (Oxirgi tahlil: 5.2 mmol/l)'}
                  </span>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.infectiousRisks')}</span>
                  <span className={styles.infoValue} style={{ color: 'var(--color-mint-text)' }}>
                    {i18n.language === 'en' ? 'Negative / Cleared' : 'Inkor etiladi (Manfiy)'}
                  </span>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.surgicalHistory')}</span>
                  <span className={styles.infoValue}>{i18n.language === 'en' ? 'Appendectomy (2018)' : '2018-yil appendektomiya'}</span>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.habits')}</span>
                  <span className={styles.infoValue}>{i18n.language === 'en' ? 'Non-smoker' : 'Chekmaydi'}</span>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>{t('patientProfile.generalAnamnesis.painTolerance')}</span>
                  <span className={styles.infoValue}>{i18n.language === 'en' ? 'High tolerance, responsive to standard anesthesia' : 'Past sezuvchanlik, anesteziyaga chidamli'}</span>
                </div>
              </div>

              {/* Tish gigiyenasi bahosi */}
              <div style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    {t('patientProfile.generalAnamnesis.dentalHygieneIndex')}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    8.5 / 10
                  </div>
                </div>
                <span className={styles.badgeGood}>{t('patientProfile.generalAnamnesis.good')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: TREATMENT HISTORY TIMELINE
          ======================================================== */}
      {activeTab === 'history' && (
        <div className={styles.tabContentContainer}>
          <div className={styles.historyTimeline}>
            <div className={styles.historyTimelineHeader}>
              <div>
                <h3 className={styles.cardTitle}>{t('patientProfile.historyTab.title')}</h3>
                <p className={styles.cardSub}>{t('patientProfile.historyTab.sub')}</p>
              </div>

              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setShowAddTreatmentModal(true)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  add
                </span>
                <span>{t('patientProfile.historyTab.addNewTreatment')}</span>
              </button>
            </div>

            {treatments.map((tr) => (
              <div key={tr.id} className={styles.timelineCard}>
                <div className={styles.timelineTop}>
                  <div className={styles.timelineDateRow}>
                    <span className={styles.timelineDateBadge}>{tr.date}</span>
                    <span className={styles.timelineToothBadge}>{tr.tooth}</span>
                    <h4 className={styles.timelineProcTitle}>{tr.title}</h4>
                  </div>
                  <StatusPill status={tr.status} label={t('patientProfile.historyTab.completedBadge')} />
                </div>

                <p className={styles.timelineDesc}>{tr.note}</p>

                <div className={styles.timelineBottom}>
                  <div className={styles.timelineDoctor}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-cyan-hover)' }}>
                      stethoscope
                    </span>
                    <span>{tr.doctor}</span>
                    <span style={{ margin: '0 4px', opacity: 0.4 }}>•</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{t('patientProfile.historyTab.materialLabel')} {tr.materials}</span>
                  </div>

                  <div className={styles.timelinePrice}>
                    {formatUZS(tr.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: X-RAY & 3D CBCT IMAGING
          ======================================================== */}
      {activeTab === 'xray' && (
        <div className={styles.tabContentContainer}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 className={styles.cardTitle}>{t('patientProfile.xrayTab.title')}</h3>
              <p className={styles.cardSub}>{t('patientProfile.xrayTab.sub')}</p>
            </div>

            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => alert(i18n.language === 'en' ? "Direct PACS / DICOM integration is active." : "Rentgen apparati (DICOM server) bilan to'g'ridan-to'g'ri integratsiya faol.")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                cloud_upload
              </span>
              <span>{t('patientProfile.xrayTab.uploadBtn')}</span>
            </button>
          </div>

          <div className={styles.xrayGrid}>
            {XRAY_GALLERY.map((item) => (
              <div
                key={item.id}
                className={styles.xrayCard}
                onClick={() => {
                  setSelectedXray(item);
                  setXrayZoom(1);
                  setXrayInvert(false);
                }}
              >
                <div className={styles.xrayThumb}>
                  <img src={item.img} alt={item.title} className={styles.xrayImgMock} />
                  <div className={styles.xrayZoomIcon}>
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                      zoom_in
                    </span>
                  </div>
                </div>
                <div className={styles.xrayInfo}>
                  <span className={styles.xrayTitle}>{item.title}</span>
                  <div className={styles.xrayMeta}>
                    <span>{item.type}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: BILLING & INVOICES
          ======================================================== */}
      {activeTab === 'billing' && (
        <div className={styles.tabContentContainer}>
          {/* Summary stats */}
          <div className={styles.billingSummaryGrid}>
            <div className={styles.billingStatBox}>
              <div className={styles.billingStatLabel}>{t('patientProfile.billingTab.totalBilled')}</div>
              <div className={styles.billingStatVal}>{formatUZS(totalBilled)}</div>
            </div>

            <div className={styles.billingStatBox}>
              <div className={styles.billingStatLabel} style={{ color: 'var(--color-mint-text)' }}>
                {t('patientProfile.billingTab.totalPaid')}
              </div>
              <div className={styles.billingStatVal} style={{ color: 'var(--color-mint-text)' }}>
                {formatUZS(totalPaid)}
              </div>
            </div>

            <div className={styles.billingStatBox}>
              <div className={styles.billingStatLabel} style={{ color: remainingDebt > 0 ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                {t('patientProfile.billingTab.remainingDebt')}
              </div>
              <div className={styles.billingStatVal} style={{ color: remainingDebt > 0 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                {formatUZS(remainingDebt)}
              </div>
            </div>
          </div>

          {/* Invoices table */}
          <div className={styles.billingTableCard}>
            <div className={styles.tableHeader}>
              <div>
                <h3 className={styles.cardTitle}>{t('patientProfile.billingTab.invoiceReceiptsTitle')}</h3>
                <p className={styles.cardSub}>{t('patientProfile.billingTab.invoiceReceiptsSub')}</p>
              </div>

              {remainingDebt > 0 && (
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => setShowPaymentModal(true)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    payments
                  </span>
                  <span>{t('patientProfile.billingTab.acceptPayment')}</span>
                </button>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-container-low)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>{t('patientProfile.billingTab.colReceiptNo')}</th>
                    <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{t('patientProfile.billingTab.colDate')}</th>
                    <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{t('patientProfile.billingTab.colService')}</th>
                    <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{t('patientProfile.billingTab.colMethod')}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>{t('patientProfile.billingTab.colAmount')}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{t('patientProfile.billingTab.colStatus')}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{t('patientProfile.billingTab.colAction')}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-cyan-hover)' }}>
                        {inv.id}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                        {inv.date}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {inv.procedure}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--color-surface-container-low)', fontSize: '11px', fontWeight: 600 }}>
                          {inv.method}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {formatUZS(inv.amount)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <StatusPill status={inv.status === 'paid' ? 'completed' : 'pending'} label={inv.status === 'paid' ? t('patientProfile.billingTab.statusPaid') : t('patientProfile.billingTab.statusPending')} />
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          style={{ padding: '6px 10px', borderRadius: '6px', background: 'var(--color-surface-container-low)', color: 'var(--color-text-primary)', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setActiveReceipt(inv)}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            print
                          </span>
                          <span>{t('patientProfile.billingTab.printBtn')}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD NEW TREATMENT
          ======================================================== */}
      {/* ========================================================
          MODAL: ADD NEW TREATMENT
          ======================================================== */}
      {showAddTreatmentModal && (
        <div className={styles.lightboxOverlay} onClick={() => setShowAddTreatmentModal(false)}>
          <div className={styles.receiptModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {t('patientProfile.addTreatmentModal.title')}
              </h3>
              <button type="button" onClick={() => setShowAddTreatmentModal(false)} style={{ color: 'var(--color-text-secondary)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddTreatment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className={styles.fieldLabel}>{t('patientProfile.addTreatmentModal.toothNumber')}</label>
                <input
                  type="text"
                  className={styles.selectInput}
                  value={newTreatment.tooth}
                  onChange={(e) => setNewTreatment({ ...newTreatment, tooth: e.target.value })}
                  placeholder={t('patientProfile.addTreatmentModal.toothPlaceholder')}
                  required
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>{t('patientProfile.addTreatmentModal.procName')}</label>
                <input
                  type="text"
                  className={styles.selectInput}
                  value={newTreatment.title}
                  onChange={(e) => setNewTreatment({ ...newTreatment, title: e.target.value })}
                  placeholder={i18n.language === 'en' ? "e.g., Root canal obturation (Gutta-percha)" : "masalan, Tish kanalini plombalash (Guttapercha)"}
                  required
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>{t('patientProfile.addTreatmentModal.materialsUsed')}</label>
                <input
                  type="text"
                  className={styles.selectInput}
                  value={newTreatment.materials}
                  onChange={(e) => setNewTreatment({ ...newTreatment, materials: e.target.value })}
                  placeholder="masalan, AH Plus, Gutta-percha konusi"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className={styles.fieldLabel}>{t('patientProfile.addTreatmentModal.priceUzs')}</label>
                  <input
                    type="number"
                    className={styles.selectInput}
                    value={newTreatment.price}
                    onChange={(e) => setNewTreatment({ ...newTreatment, price: e.target.value })}
                    placeholder="600000"
                    required
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>{t('patientProfile.addTreatmentModal.attendingDoctor')}</label>
                  <select
                    className={styles.selectInput}
                    value={newTreatment.doctor}
                    onChange={(e) => setNewTreatment({ ...newTreatment, doctor: e.target.value })}
                  >
                    <option value="Dr. J. Azimov">Dr. J. Azimov</option>
                    <option value="Dr. M. Saidova">Dr. M. Saidova</option>
                    <option value="Dr. A. Tursunov">Dr. A. Tursunov</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className={styles.btnPrimary} style={{ flex: 1, justifyContent: 'center' }}>
                  {t('patientProfile.addTreatmentModal.saveAndAdd')}
                </button>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowAddTreatmentModal(false)}>
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ACCEPT PAYMENT
          ======================================================== */}
      {showPaymentModal && (
        <div className={styles.lightboxOverlay} onClick={() => setShowPaymentModal(false)}>
          <div className={styles.receiptModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {t('patientProfile.paymentModal.title')}
              </h3>
              <button type="button" onClick={() => setShowPaymentModal(false)} style={{ color: 'var(--color-text-secondary)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px', background: 'var(--color-surface-container-low)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t('patientProfile.paymentModal.outstandingDebt')}</div>
                <div style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-danger)' }}>
                  {formatUZS(remainingDebt)}
                </div>
              </div>

              <div>
                <label className={styles.fieldLabel}>{t('patientProfile.paymentModal.payingAmount')}</label>
                <input
                  type="number"
                  className={styles.selectInput}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>{t('patientProfile.paymentModal.paymentMethod')}</label>
                <select
                  className={styles.selectInput}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Payme">Payme</option>
                  <option value="Click">Click</option>
                  <option value="Naqd">Naqd pul / Cash</option>
                  <option value="Uzcard/Humo">Terminal (Uzcard / Humo)</option>
                  <option value="Hisob-raqam">Bank o'tkazmasi</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className={styles.btnPrimary} style={{ flex: 1, justifyContent: 'center' }}>
                  {t('patientProfile.paymentModal.confirmPayment')}
                </button>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowPaymentModal(false)}>
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: X-RAY LIGHTBOX & ENLARGER
          ======================================================== */}
      {selectedXray && (
        <div className={styles.lightboxOverlay} onClick={() => setSelectedXray(null)}>
          <div className={styles.lightboxCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxHeader}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {selectedXray.title}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {selectedXray.region} • {selectedXray.date} • {selectedXray.doctor}
                </div>
              </div>

              <button
                type="button"
                style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedXray(null);
                  setXrayZoom(1);
                  setXrayInvert(false);
                  setShowRuler(false);
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Apple Dark Room Canvas */}
            <div
              className={styles.lightboxCanvas}
              style={{
                background: '#070B12',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                minHeight: '440px',
                cursor: 'grab'
              }}
            >
              <img
                src={selectedXray.img}
                alt={selectedXray.title}
                style={{
                  maxHeight: '420px',
                  maxWidth: '92%',
                  borderRadius: '10px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                  transform: `scale(${xrayZoom})`,
                  filter: `invert(${xrayInvert ? 1 : 0}) contrast(${xrayContrast}%) brightness(${xrayBrightness}%)`,
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease'
                }}
              />

              {/* Dental Calibration Ruler Overlay */}
              {showRuler && (
                <div
                  style={{
                    position: 'absolute',
                    top: '24px',
                    left: '24px',
                    background: 'rgba(0,0,0,0.75)',
                    border: '1px solid rgba(0, 180, 216, 0.5)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#00E5FF',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>straighten</span>
                    <span>KALIBRLANGAN O'LCHAGICH (CALIPER)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,180,216,0.3)', paddingTop: '4px' }}>
                    <span>0 mm</span>
                    <span>• 10 mm •</span>
                    <span>25 mm</span>
                  </div>
                </div>
              )}
            </div>

            {/* Apple Pro Floating Toolbar */}
            <div
              className={styles.lightboxToolbar}
              style={{
                background: 'rgba(15, 23, 42, 0.92)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  style={{ padding: '7px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', color: '#F1F5F9', cursor: 'pointer' }}
                  onClick={() => setXrayZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>zoom_in</span>
                  <span>{t('patientProfile.xrayTab.zoomIn')}</span>
                </button>

                <button
                  type="button"
                  style={{ padding: '7px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', color: '#F1F5F9', cursor: 'pointer' }}
                  onClick={() => setXrayZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>zoom_out</span>
                  <span>{t('patientProfile.xrayTab.zoomOut')}</span>
                </button>

                <button
                  type="button"
                  style={{ padding: '7px 12px', borderRadius: '8px', background: xrayInvert ? '#00B4D8' : 'rgba(255,255,255,0.06)', color: xrayInvert ? '#fff' : '#F1F5F9', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => setXrayInvert(!xrayInvert)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>contrast</span>
                  <span>{xrayInvert ? 'Normal' : 'Negativ'}</span>
                </button>

                <button
                  type="button"
                  style={{ padding: '7px 12px', borderRadius: '8px', background: showRuler ? 'rgba(0, 180, 216, 0.25)' : 'rgba(255,255,255,0.06)', color: showRuler ? '#00E5FF' : '#F1F5F9', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                  onClick={() => setShowRuler(!showRuler)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>straighten</span>
                  <span>O'lchagich (mm)</span>
                </button>

                <button
                  type="button"
                  style={{ padding: '7px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', cursor: 'pointer' }}
                  onClick={() => {
                    setXrayZoom(1);
                    setXrayInvert(false);
                    setXrayBrightness(100);
                    setXrayContrast(120);
                    setShowRuler(false);
                  }}
                >
                  Qaytarish (100%)
                </button>
              </div>

              <div style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                Masshtab: <strong style={{ color: '#00E5FF' }}>{Math.round(xrayZoom * 100)}%</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: OFFICIAL INVOICE RECEIPT PREVIEW (PRINT / POS)
          ======================================================== */}
      {activeReceipt && (
        <div className={styles.lightboxOverlay} onClick={() => setActiveReceipt(null)}>
          <div className={styles.receiptModalCard} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', borderRadius: '16px' }}>
            <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px dashed var(--color-border)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {t('patientProfile.receiptModal.clinicName')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Litsenziya MED-UZ-2021-9988 • Tel: +998 71 200 44 22
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--color-cyan-hover)', marginTop: '8px' }}>
                KVITANSIYA / CHEK {activeReceipt.id}
              </div>
            </div>

            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Bemor:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{patient?.name} (ID: {patient?.id})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Sana & Vaqt:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{activeReceipt.date}, 11:45</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Xizmat turi:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{activeReceipt.procedure}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>To'lov usuli:</span>
                <span style={{ fontWeight: 600 }}>{activeReceipt.method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--color-border)', fontSize: '16px' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Jami to'landi:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-cyan-hover)' }}>
                  {formatUZS(activeReceipt.amount)}
                </span>
              </div>
            </div>

            {/* Visual Receipt Barcode / QR Code simulation */}
            <div style={{ textAlign: 'center', padding: '12px', background: 'var(--color-surface-container-low)', borderRadius: '10px', marginTop: '4px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-cyan-hover)' }}>qr_code_2</span>
                <span>TO'LOV FISKAL CHEKI TASDIQLANDI (SOLIQ / INTEGRATSIYA)</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className={styles.btnPrimary}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => window.print()}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
                <span>Chop etish (Print)</span>
              </button>

              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setActiveReceipt(null)}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: OFFICIAL MEDICAL CARD (SSV SHAKL 043/h)
          ======================================================== */}
      {showDossierModal && (
        <div className={styles.lightboxOverlay} onClick={() => setShowDossierModal(false)}>
          <div
            className={styles.receiptModalCard}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '18px', padding: '28px' }}
          >
            {/* Official SSV Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid var(--color-text-primary)', paddingBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
                O'ZBEKISTON RESPUBLIKASI SOG'LIQNI SAQLASH VAZIRLIGI
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                STOMATOLOGIK BEMORNING TIBBIY KARTASI
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-cyan-hover)', marginTop: '2px' }}>
                (TIBBIY HUJJAT SHAKLI № 043/h) • Karta № {patient?.id || '1042'}/2026
              </div>
            </div>

            {/* Patient Credentials */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px 0', borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Bemor F.I.SH:</span>
                <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>{patient?.name}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Tug'ilgan yili & Yoshi:</span>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>1992-yil (34 yosh) • Erkak</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Telefon:</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '2px' }}>{patient?.phone}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Birinchi murojaat sanasi:</span>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>18-Sentabr, 2026</div>
              </div>
            </div>

            {/* Allergy Banner */}
            <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#EF4444', fontSize: '18px' }}>warning</span>
              <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 700 }}>
                Allergologik Anamnez: Penitsillin antibiotiklariga yuqori sezuvchanlik! (Lidokain sinamasi manfiy)
              </div>
            </div>

            {/* Clinical Diagnosis & Plan */}
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div>
                <strong style={{ color: 'var(--color-text-primary)' }}>Birlamchi klinik tashxis:</strong>
                <div style={{ padding: '8px 12px', background: 'var(--color-surface-container-low)', borderRadius: '6px', marginTop: '4px' }}>
                  K04.0 — 16-tish o'tkir o'choqli pulpit (Caries profunda asorati).
                </div>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-primary)' }}>Rejalashtirilgan davolash bosqichlari:</strong>
                <ol style={{ margin: '4px 0 0 18px', padding: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  <li>Infiltratsion anesteziya (Ubistesin / Artikain 1:200 000).</li>
                  <li>Karies bo'shlig'ini shakllantirish, pulpa kamerasini ochish.</li>
                  <li>3 ta ildiz kanalini mexanik va medikamentoz ishlov berish (Working length: MB 21mm, DB 20mm, P 22mm).</li>
                  <li>Kanallarni gutta-percha va AH-Plus sillere bilan obturatsiya qilish.</li>
                  <li>Sirkoniy ortopedik toj (Crown) bilan tish anatomiyasini tiklash.</li>
                </ol>
              </div>
            </div>

            {/* Stamp & Doctor Signature Footer */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '12px' }}>
              <div>
                <div style={{ color: 'var(--color-text-secondary)' }}>Davolovchi shifokor:</div>
                <strong style={{ color: 'var(--color-text-primary)', fontSize: '13px' }}>Dr. Jasur Azimov</strong>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Stomatolog-terapevt, ortoped</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ borderBottom: '1px solid var(--color-text-primary)', width: '140px', height: '24px', marginBottom: '4px' }} />
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>(Shifokor imzosi va muhri)</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                className={styles.btnPrimary}
                style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
                onClick={() => window.print()}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
                <span>Rasmiy Shaklni Chop Etish (Print / PDF)</span>
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowDossierModal(false)}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
