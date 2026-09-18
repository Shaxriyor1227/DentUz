import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
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
const XRAY_GALLERY = [
  {
    id: 'xr-1',
    title: "To'liq jag' panoramik rentgeni (OPG)",
    type: "Panoramik OPG",
    date: '18.09.2026',
    doctor: 'Dr. M. Saidova',
    region: "Yuqori va pastki jag'",
    desc: "Barcha tishlar ildiz tizimi va suyak to'qimasi balandligi holati ko'rinishi.",
    img: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'xr-2',
    title: "3D CBCT Tomografiya kesimi (#16 soha)",
    type: "3D Tomografiya",
    date: '18.09.2026',
    doctor: 'Dr. J. Azimov',
    region: "#16 Oziq tish apeksi",
    desc: "MB2 qo'shimcha ildiz kanalini aniqlash va gaymor bo'shlig'i tubi munosabati.",
    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'xr-3',
    title: "Periapikal viziografiya (#16 ildiz kanallari)",
    type: "Periapikal",
    date: '18.09.2026',
    doctor: 'Dr. J. Azimov',
    region: "#16 Tish",
    desc: "Ishchi uzunlikni o'lchash (Working Length) nazorat rentgen tasviri.",
    img: "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'xr-4',
    title: "Bitewing interproksimal rentgen (#36, #37)",
    type: "Bitewing",
    date: '15.09.2026',
    doctor: 'Dr. M. Saidova',
    region: "Pastki chap molar",
    desc: "Yashirin kontakt karies profilaktik nazorati, patologiya aniqlanmadi.",
    img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80"
  }
];

// Initial Invoices for this patient
const INITIAL_INVOICES = [
  { id: 'INV-1042-01', date: '18-sentabr, 2026', procedure: '#16 Endodontik davolash', amount: 950000, method: 'Payme', status: 'paid' },
  { id: 'INV-1042-02', date: '15-sentabr, 2026', procedure: '3D CBCT Tomografiya', amount: 350000, method: 'Naqd', status: 'paid' },
  { id: 'INV-1042-03', date: '02-sentabr, 2026', procedure: '#14 Estetik plomba', amount: 450000, method: 'Click', status: 'paid' },
  { id: 'INV-1042-04', date: '25-sentabr, 2026 (Reja)', procedure: '#16 Sirkoniy toj fiksatsiyasi', amount: 1400000, method: 'Kutilmoqda', status: 'pending' }
];

export default function PatientProfile() {
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
    tooth: '#16',
    title: '',
    materials: '',
    price: '',
    doctor: 'Dr. J. Azimov'
  });

  // X-Ray viewer lightbox states
  const [selectedXray, setSelectedXray] = useState(null);
  const [xrayZoom, setXrayZoom] = useState(1);
  const [xrayInvert, setXrayInvert] = useState(false);

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
    name: `Tish #${selectedToothId}`,
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
          <span>Bemorlar ro'yxatiga qaytish</span>
        </Link>
        <div className={styles.lastVisitBadge}>
          <span>Oxirgi tashrif:</span>
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
              <span className={styles.idBadge}>#{patient?.id || 'P-1042'}</span>
              <span className={styles.regularBadge}>Doimiy bemor</span>
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
                {patient?.birthdate || '14.08.1989'} ({patient?.age || 34} yosh)
              </span>
              <span className={styles.separatorDot} />
              <span className={styles.allergyBadge}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  warning
                </span>
                Allergiya: {patient?.allergies || 'Penitsillin'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.summaryActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setActiveTab('general')}
            title="Bemor anketasini ko'rish"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              badge
            </span>
            <span>Klinik Anketa</span>
          </button>
          <Link to="/calendar" className={styles.btnPrimary}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              calendar_add_on
            </span>
            <span>Yangi qabul</span>
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
          <span>Umumiy ma'lumot & Anamnez</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'odontogram' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('odontogram')}
        >
          <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--color-cyan)' }} />
          <span>Odontogramma</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'history' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span>Davolash tarixi</span>
          <span className={styles.tabCountBadge}>{treatments.length}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'xray' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('xray')}
        >
          <span>Rentgen & X-ray</span>
          <span className={styles.tabCountBadge}>{XRAY_GALLERY.length}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'billing' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <span>To'lovlar & Hisob</span>
          {remainingDebt > 0 && (
            <span style={{ fontSize: '10px', background: 'var(--color-danger)', color: '#fff', padding: '1px 6px', borderRadius: 9999 }}>
              Qarz
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
                  <span className={styles.statTitle}>Davolangan tishlar</span>
                  <div className={styles.statVal}>3 ta</div>
                </div>
                <div className={styles.statIconBox}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-mint)', fontSize: '20px' }}>
                    verified
                  </span>
                </div>
              </div>

              <div className={styles.quickStatCard}>
                <div>
                  <span className={styles.statTitle}>Muolaja kutilmoqda</span>
                  <div className={`${styles.statVal} ${styles.statValDanger}`}>2 ta</div>
                </div>
                <div className={styles.statIconBox} style={{ backgroundColor: 'var(--color-danger-bg)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-danger)', fontSize: '20px' }}>
                    healing
                  </span>
                </div>
              </div>

              <div className={styles.quickStatCard}>
                <div>
                  <span className={styles.statTitle}>Sog'lom tishlar ulushi</span>
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
                    <span className={styles.detailsTitle}>Tish tafsilotlari</span>
                    <span className={styles.toothBadge}>Tish #{selectedToothId}</span>
                  </div>
                  <div className={styles.toothFullName}>{currentTooth.name}</div>
                </div>

                <button
                  type="button"
                  style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-text-secondary)', background: 'var(--color-surface-container-low)' }}
                  title="Qayta yuklash"
                  onClick={() => handleSelectTooth(selectedToothId)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    sync
                  </span>
                </button>
              </div>

              {/* Status Select */}
              <div className={styles.panelField}>
                <label className={styles.fieldLabel}>Hozirgi Holat (Status)</label>
                <select
                  className={styles.selectInput}
                  value={toothStatus}
                  onChange={(e) => setToothStatus(e.target.value)}
                >
                  <option value="caries">● Karies (Chuqur karies)</option>
                  <option value="healthy">● Sog'lom (Normada)</option>
                  <option value="treated">● Davolangan / Plomba</option>
                  <option value="crown">● Toj / Qoplama (Crown)</option>
                  <option value="missing">● Yo'qolgan (Ekstraktsiya)</option>
                </select>
              </div>

              {/* Clinical Diagnosis Box */}
              <div className={styles.panelField}>
                <label className={styles.fieldLabel}>Klinik Tashxis</label>
                <div className={styles.diagBox}>
                  {doctorDiag || 'Emal va dentin qatlami zararlangan. Termik sezuvchanlik mavjud.'}
                </div>
              </div>

              {/* Treatment Plan Textarea */}
              <div className={styles.panelField}>
                <label className={styles.fieldLabel}>Muolaja Rejasi va Shifokor Izohi</label>
                <textarea
                  className={styles.textareaInput}
                  rows={3}
                  value={doctorPlan}
                  onChange={(e) => setDoctorPlan(e.target.value)}
                  placeholder="Muolaja protokolini kiriting..."
                />
              </div>

              {/* Tooth Specific History */}
              <div className={styles.historySection}>
                <span className={styles.fieldLabel}>Tish bo'yicha amaliyotlar tarixi</span>
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
                    Ushbu tish bo'yicha tarix yozuvlari mavjud emas
                  </div>
                )}
              </div>

              {/* Feedback */}
              {saveSuccess && (
                <div style={{ padding: '8px 12px', background: 'var(--color-mint-soft)', color: 'var(--color-mint-text)', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                  ✓ Tish #{selectedToothId} klinik o'zgarishlari muvaffaqiyatli saqlandi!
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
                  <span>O'zgarishlarni saqlash</span>
                </button>

                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => handleSelectTooth(selectedToothId)}
                >
                  Bekor qilish
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
                  <div className={styles.attachmentTitle}>Tomografiya (CBCT 3D)</div>
                  <div className={styles.attachmentSub}>Fayl: cbct_jaw_scan_1042.dicom</div>
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
                <span>Ko'rish</span>
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
                  <h3 className={styles.cardTitle}>Shaxsiy va Identifikatsiya Ma'lumotlari</h3>
                  <p className={styles.cardSub}>Klinik hisobga olish va rasmiy anketasi</p>
                </div>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>To'liq Ism</span>
                  <span className={styles.infoValue}>{patient?.name || 'Anvar Qosimov'}</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Bemor ID Raqami</span>
                  <span className={styles.infoValue} style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-cyan-hover)' }}>
                    #{patient?.id || 'P-1042'}
                  </span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Tug'ilgan Sana & Yosh</span>
                  <span className={styles.infoValue}>14.08.1989 (34 yosh)</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Jinsi</span>
                  <span className={styles.infoValue}>Erkak</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>JSHSHIR (PINFL)</span>
                  <span className={styles.infoValue} style={{ fontFamily: 'var(--font-mono)' }}>31408891230045</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Pasport Seriyasi</span>
                  <span className={styles.infoValue} style={{ fontFamily: 'var(--font-mono)' }}>AA 5812903</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Yashash Manzili</span>
                  <span className={styles.infoValue}>Toshkent sh., Mirobod t., Nukus ko'chasi 24-uy</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Kasbi / Faoliyati</span>
                  <span className={styles.infoValue}>Dasturiy injiniring bo'yicha mutaxassis</span>
                </div>
              </div>

              {/* Shoshilinch aloqa */}
              <div style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', background: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    Shoshilinch Bog'lanish Shaxsi
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    Saidova Nargiza (Turmush o'rtog'i)
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
                  <h3 className={styles.cardTitle}>Tibbiy va Somatik Anamnez</h3>
                  <p className={styles.cardSub}>Surunkali kasalliklar, allergiyalar va xavflar</p>
                </div>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Dori vositalariga allergiya</span>
                  <div className={styles.alertPillWarning}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                    <span>Penitsillin guruhi antibiotiklari</span>
                  </div>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Qon Guruhi & Rh</span>
                  <span className={styles.infoValue} style={{ fontFamily: 'var(--font-mono)' }}>
                    A (II) Rh+ (Musbat)
                  </span>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Yurak-qon tomir tizimi</span>
                  <span className={styles.infoValue}>Gipertoniya 1-daraja (Barqaror, EKG normada)</span>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Qandli Diabet</span>
                  <span className={styles.infoValue} style={{ color: 'var(--color-mint-text)' }}>
                    Yo'q (Oxirgi tahlil: 5.2 mmol/l)
                  </span>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Infeksion Xavflar (HBsAg, HCV, OIV)</span>
                  <span className={styles.infoValue} style={{ color: 'var(--color-mint-text)' }}>
                    Inkor etiladi (Manfiy)
                  </span>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>O'tkazilgan operatsiyalar</span>
                  <span className={styles.infoValue}>2018-yil appendektomiya</span>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Zararli Odatlar</span>
                  <span className={styles.infoValue}>Chekmaydi, kofe ko'p ichadi</span>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Og'riqqa sezuvchanlik</span>
                  <span className={styles.infoValue}>Past sezuvchanlik, anesteziyaga chidamli</span>
                </div>
              </div>

              {/* Tish gigiyenasi bahosi */}
              <div style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    Stomatologik Gigiyena Indeksi (OHI-S)
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    8.5 / 10 — Qoniqarli, muntazam nazorat tavsiya etiladi
                  </div>
                </div>
                <span className={styles.badgeGood}>Yaxshi</span>
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
                <h3 className={styles.cardTitle}>Xronologik Davolash Tarixi</h3>
                <p className={styles.cardSub}>Barcha bajarilgan muolajalar, ishlatilgan materiallar va shifokorlar</p>
              </div>

              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setShowAddTreatmentModal(true)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  add
                </span>
                <span>Yangi muolaja kiritish</span>
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
                  <StatusPill status={tr.status} label="Yakunlandi" />
                </div>

                <p className={styles.timelineDesc}>{tr.note}</p>

                <div className={styles.timelineBottom}>
                  <div className={styles.timelineDoctor}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-cyan-hover)' }}>
                      stethoscope
                    </span>
                    <span>{tr.doctor}</span>
                    <span style={{ margin: '0 4px', opacity: 0.4 }}>•</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Material: {tr.materials}</span>
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
              <h3 className={styles.cardTitle}>Rentgen va 3D Tomografiya Arxivlari</h3>
              <p className={styles.cardSub}>Panoramik OPG, viziografik periapikal va CBCT skanerlar</p>
            </div>

            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => alert("Rentgen apparati (DICOM server) bilan to'g'ridan-to'g'ri integratsiya faol.")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                cloud_upload
              </span>
              <span>Yangi rentgen yuklash</span>
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
              <div className={styles.billingStatLabel}>Jami hisoblangan</div>
              <div className={styles.billingStatVal}>{formatUZS(totalBilled)}</div>
            </div>

            <div className={styles.billingStatBox}>
              <div className={styles.billingStatLabel} style={{ color: 'var(--color-mint-text)' }}>
                To'langan summa
              </div>
              <div className={styles.billingStatVal} style={{ color: 'var(--color-mint-text)' }}>
                {formatUZS(totalPaid)}
              </div>
            </div>

            <div className={styles.billingStatBox}>
              <div className={styles.billingStatLabel} style={{ color: remainingDebt > 0 ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                Qoldiq qarzdorlik
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
                <h3 className={styles.cardTitle}>Invoyslar va To'lov Kvitansiyalari</h3>
                <p className={styles.cardSub}>Muolajalar uchun shakllantirilgan rasmiy cheklar</p>
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
                  <span>To'lov qabul qilish</span>
                </button>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-container-low)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>CHEK #</th>
                    <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>SANA</th>
                    <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>MUOLAJA NOMI</th>
                    <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>TO'LOV USULI</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>SUMMA</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>HOLAT</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>AMAL</th>
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
                        <StatusPill status={inv.status === 'paid' ? 'completed' : 'pending'} label={inv.status === 'paid' ? "To'langan" : "Kutilmoqda"} />
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
                          <span>Chek</span>
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
      {showAddTreatmentModal && (
        <div className={styles.lightboxOverlay} onClick={() => setShowAddTreatmentModal(false)}>
          <div className={styles.receiptModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Yangi Muolajani Qayd Qilish
              </h3>
              <button type="button" onClick={() => setShowAddTreatmentModal(false)} style={{ color: 'var(--color-text-secondary)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddTreatment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className={styles.fieldLabel}>Tish raqami</label>
                <input
                  type="text"
                  className={styles.selectInput}
                  value={newTreatment.tooth}
                  onChange={(e) => setNewTreatment({ ...newTreatment, tooth: e.target.value })}
                  placeholder="masalan, #16 yoki Umumiy"
                  required
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>Muolaja nomi</label>
                <input
                  type="text"
                  className={styles.selectInput}
                  value={newTreatment.title}
                  onChange={(e) => setNewTreatment({ ...newTreatment, title: e.target.value })}
                  placeholder="masalan, Tish kanalini plombalash (Guttapercha)"
                  required
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>Ishlatilgan materiallar</label>
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
                  <label className={styles.fieldLabel}>Muolaja narxi (UZS)</label>
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
                  <label className={styles.fieldLabel}>Davolovchi shifokor</label>
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
                  Saqlash va qo'shish
                </button>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowAddTreatmentModal(false)}>
                  Bekor qilish
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
                Bemor To'lovini Qabul Qilish
              </h3>
              <button type="button" onClick={() => setShowPaymentModal(false)} style={{ color: 'var(--color-text-secondary)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px', background: 'var(--color-surface-container-low)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Bemor qarzdorligi:</div>
                <div style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-danger)' }}>
                  {formatUZS(remainingDebt)}
                </div>
              </div>

              <div>
                <label className={styles.fieldLabel}>To'lanayotgan summa (UZS)</label>
                <input
                  type="number"
                  className={styles.selectInput}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>To'lov usuli</label>
                <select
                  className={styles.selectInput}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Payme">Payme</option>
                  <option value="Click">Click</option>
                  <option value="Naqd">Naqd pul</option>
                  <option value="Uzcard/Humo">Terminal (Uzcard / Humo)</option>
                  <option value="Hisob-raqam">Bank o'tkazmasi</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className={styles.btnPrimary} style={{ flex: 1, justifyContent: 'center' }}>
                  To'lovni tasdiqlash
                </button>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowPaymentModal(false)}>
                  Bekor qilish
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
                style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-text-secondary)' }}
                onClick={() => setSelectedXray(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className={styles.lightboxCanvas}>
              <img
                src={selectedXray.img}
                alt={selectedXray.title}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  transform: `scale(${xrayZoom})`,
                  filter: xrayInvert ? 'invert(1) contrast(1.5)' : 'contrast(1.2)',
                  transition: 'transform 0.2s ease, filter 0.2s ease'
                }}
              />
            </div>

            <div className={styles.lightboxToolbar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--color-surface-container-low)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-primary)' }}
                  onClick={() => setXrayZoom((z) => Math.min(2.5, z + 0.25))}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>zoom_in</span>
                  <span>Kattalashtirish</span>
                </button>

                <button
                  type="button"
                  style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--color-surface-container-low)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-primary)' }}
                  onClick={() => setXrayZoom((z) => Math.max(0.75, z - 0.25))}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>zoom_out</span>
                  <span>Kichiklashtirish</span>
                </button>

                <button
                  type="button"
                  style={{ padding: '6px 12px', borderRadius: '6px', background: xrayInvert ? 'var(--color-cyan-soft)' : 'var(--color-surface-container-low)', color: xrayInvert ? 'var(--color-cyan-hover)' : 'var(--color-text-primary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                  onClick={() => setXrayInvert(!xrayInvert)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>contrast</span>
                  <span>{xrayInvert ? "Oddiy rejim" : "Negativ/Rentgen kontrasti"}</span>
                </button>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                Kattalash: {Math.round(xrayZoom * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: OFFICIAL INVOICE RECEIPT PREVIEW (PRINT)
          ======================================================== */}
      {activeReceipt && (
        <div className={styles.lightboxOverlay} onClick={() => setActiveReceipt(null)}>
          <div className={styles.receiptModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px dashed var(--color-border)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Toshkent Dental Clinic
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Litsenziya #MED-UZ-2021-9988 • Tel: +998 71 200 44 22
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--color-cyan-hover)', marginTop: '8px' }}>
                KVITANSIYA / CHEK {activeReceipt.id}
              </div>
            </div>

            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Bemor:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{patient?.name} (#{patient?.id})</span>
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

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className={styles.btnPrimary}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  window.print();
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  print
                </span>
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
    </div>
  );
}
