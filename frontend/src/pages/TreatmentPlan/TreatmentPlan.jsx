import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import StatusPill from '../../components/StatusPill/StatusPill';
import Toast from '../../components/Toast/Toast';
import { formatUZS } from '../../utils/formatters';
import styles from './TreatmentPlan.module.css';

const INITIAL_PROCEDURES = [
  {
    step: '01',
    title: "Dastlabki ko'rik va 3D CBCT tomografiya",
    desc: "Diagnostik rentgen tahlili, panoramik o'lchov va 3D suyak zichligi bahosi",
    tooth: 'Umumiy',
    date: '18-Sentabr, 2026',
    price: 350000,
    status: 'completed'
  },
  {
    step: '02',
    title: '#16 tish endodontik davolash (kanal tozalash va dorilash)',
    desc: 'Kanal ichi nekrotik to\'qimalarni tozalash, antiseptik ishlov va kalsiy pastasini kiritish',
    tooth: '#16',
    date: '18-Sentabr, 2026',
    price: 950000,
    status: 'completed'
  },
  {
    step: '03',
    title: '#14 tish kompozit restavratsiya',
    desc: "Yorug'likda qotuvchi estetik restavratsiya (Filtek Z250) anatomiya tiklanishi",
    tooth: '#14',
    date: '19-Sentabr, 2026',
    price: 450000,
    status: 'completed'
  },
  {
    step: '04',
    title: '#16 tishni doimiy obturatsiya qilish (Guttapercha)',
    desc: 'Ildiz kanal tizimini issiq guttapercha usulida doimiy zich plombalash',
    tooth: '#16',
    date: '22-Sentabr, 2026',
    price: 600000,
    status: 'in_progress'
  },
  {
    step: '05',
    title: '#16 tish uchun sirkoniy toj tayyorlash va o\'rnatish',
    desc: 'CAD/CAM texnologiyasi asosida sirkoniy oksid asosli toj tayyorlash va fiksatsiyasi',
    tooth: '#16',
    date: '25-Sentabr, 2026',
    price: 2400000,
    status: 'scheduled'
  },
  {
    step: '06',
    title: '#36 tish kariesini davolash va estetik plomba',
    desc: 'Fissura kariesini tozalash, adgeziv protokol va kompozit restavratsiya',
    tooth: '#36',
    date: '29-Sentabr, 2026',
    price: 450000,
    status: 'scheduled'
  }
];

const STATUS_OPTIONS = [
  { key: 'completed', label: 'Yakunlandi', dotColor: 'var(--color-mint)' },
  { key: 'in_progress', label: 'Jarayonda', dotColor: 'var(--color-cyan)' },
  { key: 'scheduled', label: 'Rejalashtirilgan', dotColor: 'var(--color-info)' },
  { key: 'cancelled', label: 'Bekor qilingan', dotColor: '#EF4444' }
];

export default function TreatmentPlan() {
  const [items, setItems] = useState(INITIAL_PROCEDURES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [openDropdownStep, setOpenDropdownStep] = useState(null);
  const [toastNotice, setToastNotice] = useState(null);
  const dropdownRef = useRef(null);

  const [newStep, setNewStep] = useState({
    title: '',
    desc: '',
    tooth: '#16',
    date: '30-Sentabr, 2026',
    price: 500000,
    status: 'scheduled'
  });

  const completedCount = items.filter((p) => p.status === 'completed').length;
  const inProgressCount = items.filter((p) => p.status === 'in_progress').length;
  const scheduledCount = items.filter((p) => p.status === 'scheduled').length;
  const totalAmount = items.reduce((acc, curr) => acc + curr.price, 0);
  const paidAmount = 1750000;
  const remainingAmount = Math.max(0, totalAmount - paidAmount);
  const progressPercent = Math.round((completedCount / items.length) * 100);

  const handleExportJson = () => {
    const payload = {
      documentType: "CLINICAL_TREATMENT_PLAN_ESTIMATION",
      version: "1.0",
      generatedAt: "2026-09-18T10:50:00.000Z",
      clinic: {
        name: "Toshkent Dental Clinic",
        license: "MED-UZ-2021-9988",
        director: "Dr. Jasur Azimov",
        phone: "+998 71 200 44 22",
        address: "Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko'chasi 42-uy"
      },
      patient: {
        name: "Anvar Qosimov",
        id: "P-1042",
        phone: "+998 90 842 11 00",
        doctor: "Dr. J. Azimov"
      },
      plan: {
        planId: "TR-8821",
        title: "Kompleks reabilitatsiya va endodontiya",
        protocol: "Terapevtik va ortopedik protokol",
        startDate: "18-Sentabr, 2026",
        procedures: items,
        financialSummary: {
          currency: "UZS",
          totalEstimated: totalAmount,
          totalPaid: paidAmount,
          remainingDebt: remainingAmount,
          progressPercent: progressPercent
        }
      },
      legal: {
        guaranteeMonths: 12,
        standard: "SSV 043/h va FDI ISO 3950",
        consentAgreed: true
      }
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DentUz_Davolash_Rejasi_TR8821_Anvar_Qosimov.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddStep = (e) => {
    e.preventDefault();
    if (!newStep.title) return;
    const stepNum = String(items.length + 1).padStart(2, '0');
    const created = {
      step: stepNum,
      title: newStep.title,
      desc: newStep.desc || 'Rejalashtirilgan stomatologik muolaja bosqichi',
      tooth: newStep.tooth || 'Umumiy',
      date: newStep.date,
      price: Number(newStep.price) || 500000,
      status: newStep.status
    };
    setItems((prev) => [...prev, created]);
    setShowAddModal(false);
    setNewStep({
      title: '',
      desc: '',
      tooth: '#16',
      date: '30-Sentabr, 2026',
      price: 500000,
      status: 'scheduled'
    });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownStep(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpenDropdownStep(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdownStep]);

  const handleSelectStatus = (stepId, newStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.step === stepId ? { ...item, status: newStatus } : item))
    );
    setOpenDropdownStep(null);
    const matched = STATUS_OPTIONS.find((s) => s.key === newStatus);
    setToastNotice(`#${stepId} muolaja holati "${matched?.label || newStatus}" ga o'zgartirildi.`);
  };

  return (
    <div className={styles.pageContainer}>
      {/* 1. Breadcrumb / Context Bar */}
      <div className={styles.breadcrumbRow}>
        <Link to="/patients/1042" className={styles.backLink}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            arrow_back
          </span>
          <span>
            Bemor profiliga qaytish: <strong style={{ color: 'var(--color-text-primary)' }}>Anvar Qosimov (#P-1042)</strong>
          </span>
        </Link>
        <StatusPill status="in_progress" label="Faol reja" />
      </div>

      {/* 2. Header Area */}
      <div className={styles.headerCard}>
        <div className={styles.headerInfo}>
          <div className={styles.tagRow}>
            <span className={styles.planTag}>Reja #TR-8821</span>
            <span style={{ color: 'var(--color-border)' }}>•</span>
            <span className={styles.protocolType}>Terapevtik va ortopedik protokol</span>
          </div>

          <div className={styles.titleRow}>
            <h1 className={styles.planTitle}>Kompleks reabilitatsiya va endodontiya</h1>
            <span className={styles.h1ProgressBadge}>
              <span className={styles.h1BadgeDot} />
              {progressPercent}% yakunlandi
            </span>
          </div>

          <div className={styles.metaRow}>
            <span>Bemor: <strong style={{ color: 'var(--color-text-primary)' }}>Anvar Qosimov</strong></span>
            <span className={styles.metaSeparator}>/</span>
            <span>ID: <strong style={{ fontFamily: 'var(--font-mono)' }}>#P-1042</strong></span>
            <span className={styles.metaSeparator}>/</span>
            <span>Boshlangan: 18-Sentabr, 2026</span>
            <span className={styles.metaSeparator}>/</span>
            <span>Mas'ul shifokor: Dr. Azimov</span>
          </div>

          {/* Integrated progress bar directly inside headerCard */}
          <div className={styles.headerProgressRow}>
            <div className={styles.headerProgressCounts}>
              <span>Jami: <strong style={{ color: 'var(--color-text-primary)' }}>{items.length} ta</strong></span>
              <span>•</span>
              <span>Bajarildi: <strong style={{ color: 'var(--color-mint-text)' }}>{completedCount} ta</strong></span>
              <span>•</span>
              <span>Kutilmoqda: <strong style={{ color: 'var(--color-cyan-hover)' }}>{inProgressCount + scheduledCount} ta</strong></span>
            </div>
            <div className={styles.headerProgressBarBg}>
              <div className={styles.headerProgressBarFill} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.printBtn}
            onClick={() => setShowPdfModal(true)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              picture_as_pdf
            </span>
            <span>Chop etish / PDF</span>
          </button>

          <button
            type="button"
            className={styles.addProcBtn}
            onClick={() => setShowAddModal(true)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              add
            </span>
            <span>Yangi muolaja</span>
          </button>
        </div>
      </div>

      {/* 3. Treatment Procedures Ledger Table */}
      <div className={styles.ledgerCard}>
        <div className={styles.ledgerHeader}>
          <span>#</span>
          <span>Muolaja va klinik protokol</span>
          <span>Lokalizatsiya</span>
          <span>Reja sanasi</span>
          <span style={{ textAlign: 'right' }}>Qiymati & Holat</span>
        </div>

        {items.map((proc) => (
          <div key={proc.step} className={styles.stepRow}>
            <div className={styles.stepNum}>{proc.step}</div>
            <div className={styles.stepDetails}>
              <div className={styles.stepTitle}>{proc.title}</div>
              <div className={styles.stepDesc}>{proc.desc}</div>
            </div>
            <div>
              <span className={styles.toothTag}>{proc.tooth}</span>
            </div>
            <div className={styles.stepDate}>{proc.date}</div>
            <div className={styles.stepPriceCol}>
              <span className={styles.priceAmount}>{formatUZS(proc.price)}</span>
              
              <div
                className={styles.statusDropdownContainer}
                ref={openDropdownStep === proc.step ? dropdownRef : null}
              >
                <button
                  type="button"
                  className={styles.statusSelectTrigger}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdownStep((prev) => (prev === proc.step ? null : proc.step));
                  }}
                  title="Muolaja holatini tanlash"
                  aria-haspopup="listbox"
                  aria-expanded={openDropdownStep === proc.step}
                >
                  <StatusPill status={proc.status} />
                  <span className={`material-symbols-outlined ${styles.triggerChevron}`}>
                    {openDropdownStep === proc.step ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {openDropdownStep === proc.step && (
                  <div className={styles.statusPopover} onClick={(e) => e.stopPropagation()}>
                    {STATUS_OPTIONS.map((opt) => {
                      const isCurrent = proc.status === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          className={`${styles.popoverOption} ${isCurrent ? styles.popoverOptionActive : ''}`}
                          onClick={() => handleSelectStatus(proc.step, opt.key)}
                        >
                          <span
                            className={styles.optionDot}
                            style={{ backgroundColor: opt.dotColor }}
                          />
                          <span className={styles.optionLabel}>{opt.label}</span>
                          {isCurrent && (
                            <span
                              className={`material-symbols-outlined ${styles.optionCheck}`}
                            >
                              check
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Total calculation summary card */}
      <div className={styles.totalSummaryCard}>
        <div className={styles.summaryRow}>
          <span>Davolash rejasi umumiy smetasi</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {formatUZS(totalAmount)}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span>Bemor tomonidan to'langan (Kassa / Payme)</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-mint-text)' }}>
            {formatUZS(paidAmount)}
          </span>
        </div>
        <div className={styles.summaryTotalRow}>
          <span>Qoldiq to'lanishi lozim</span>
          <span className={styles.remainingAmount}>
            {formatUZS(remainingAmount)}
          </span>
        </div>
      </div>

      {/* Add Step Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text-primary)' }}>
              Rejaga Yangi Muolaja Qo'shish
            </h3>

            <form onSubmit={handleAddStep} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Muolaja nomi
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan, #46 Tishni plombalash"
                  value={newStep.title}
                  onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Protokol va tavsif
                </label>
                <textarea
                  rows={2}
                  placeholder="Muolaja tafsilotlari"
                  value={newStep.desc}
                  onChange={(e) => setNewStep({ ...newStep, desc: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Tish / Soha
                  </label>
                  <input
                    type="text"
                    value={newStep.tooth}
                    onChange={(e) => setNewStep({ ...newStep, tooth: e.target.value })}
                    style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Qiymati (UZS)
                  </label>
                  <input
                    type="number"
                    value={newStep.price}
                    onChange={(e) => setNewStep({ ...newStep, price: e.target.value })}
                    style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, height: '40px', background: 'var(--color-cyan)', color: '#FFFFFF', borderRadius: '8px', fontWeight: 600 }}
                >
                  Rejaga kiritish
                </button>
                <button
                  type="button"
                  style={{ height: '40px', padding: '0 16px', background: 'var(--color-surface-container)', color: 'var(--color-text-secondary)', borderRadius: '8px' }}
                  onClick={() => setShowAddModal(false)}
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Clinical Treatment Plan PDF Preview & Export Modal */}
      {showPdfModal && (
        <div className={styles.pdfModalOverlay} onClick={() => setShowPdfModal(false)}>
          <div className={styles.pdfModalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.pdfModalToolbar}>
              <div className={styles.pdfToolbarTitle}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-cyan-hover)' }}>
                  description
                </span>
                <span>Rasmiy Davolash Rejasi & Moliyaviy Smeta (A4)</span>
              </div>

              <div className={styles.pdfToolbarActions}>
                <button
                  type="button"
                  className={`${styles.pdfActionBtn} ${styles.pdfPrintBtn}`}
                  onClick={() => window.print()}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    print
                  </span>
                  <span>Chop etish / PDF</span>
                </button>

                <button
                  type="button"
                  className={`${styles.pdfActionBtn} ${styles.pdfJsonBtn}`}
                  onClick={handleExportJson}
                  title="Backend API uchun barcha ma'lumotlarni JSON qilib yuklab olish"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-cyan-hover)' }}>
                    download
                  </span>
                  <span>JSON ma'lumotlar</span>
                </button>

                <button
                  type="button"
                  className={styles.pdfCloseBtn}
                  onClick={() => setShowPdfModal(false)}
                  title="Yopish"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    close
                  </span>
                </button>
              </div>
            </div>

            <div className={styles.pdfModalBody}>
              <div id="clinical-print-sheet" className={styles.pdfSheet}>
                {/* Header */}
                <div className={styles.pdfClinicHeader}>
                  <div className={styles.pdfClinicBrand}>
                    <div className={styles.pdfLogoMark}>
                      <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                        dentistry
                      </span>
                    </div>
                    <div>
                      <div className={styles.pdfClinicName}>Toshkent Dental Clinic</div>
                      <div className={styles.pdfClinicLicense}>Litsenziya: MED-UZ-2021-9988 • O'zR SSV Standarti</div>
                    </div>
                  </div>

                  <div className={styles.pdfDocMeta}>
                    <div className={styles.pdfDocTitle}>DAVOLASH REJASI & SMETA</div>
                    <div>Hujjat №: <strong>TR-8821</strong></div>
                    <div>Sana: <strong>18-Sentabr, 2026</strong></div>
                  </div>
                </div>

                {/* Dossier */}
                <div className={styles.pdfDossierGrid}>
                  <div className={styles.pdfDossierCol}>
                    <div className={styles.pdfDossierRow}>
                      <span className={styles.pdfDossierLabel}>Bemor F.I.SH.:</span>
                      <span className={styles.pdfDossierVal}>Anvar Qosimov</span>
                    </div>
                    <div className={styles.pdfDossierRow}>
                      <span className={styles.pdfDossierLabel}>Bemor ID:</span>
                      <span className={styles.pdfDossierVal}>#P-1042</span>
                    </div>
                    <div className={styles.pdfDossierRow}>
                      <span className={styles.pdfDossierLabel}>Telefon:</span>
                      <span className={styles.pdfDossierVal}>+998 90 842 11 00</span>
                    </div>
                  </div>

                  <div className={styles.pdfDossierCol}>
                    <div className={styles.pdfDossierRow}>
                      <span className={styles.pdfDossierLabel}>Mas'ul shifokor:</span>
                      <span className={styles.pdfDossierVal}>Dr. Jasur Azimov</span>
                    </div>
                    <div className={styles.pdfDossierRow}>
                      <span className={styles.pdfDossierLabel}>Mutaxassislik:</span>
                      <span className={styles.pdfDossierVal}>Bosh shifokor / Terapevt-Endodont</span>
                    </div>
                    <div className={styles.pdfDossierRow}>
                      <span className={styles.pdfDossierLabel}>Klinik Tashxis:</span>
                      <span className={styles.pdfDossierVal}>#16 Tish chuqur kariesi va pulpiti</span>
                    </div>
                  </div>
                </div>

                {/* Procedures Table */}
                <table className={styles.pdfTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>№</th>
                      <th>Klinik Muolaja va Protokol</th>
                      <th style={{ width: '70px' }}>Soha</th>
                      <th style={{ width: '130px' }}>Reja Sanasi</th>
                      <th style={{ width: '100px' }}>Holat</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>Qiymati</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.step}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.step}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.title}</div>
                          <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>{item.desc}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.tooth}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{item.date}</td>
                        <td>
                          <span style={{ fontSize: '10.5px', fontWeight: 600, color: item.status === 'completed' ? '#059669' : item.status === 'in_progress' ? '#0891B2' : '#64748B' }}>
                            {item.status === 'completed' ? '✓ Yakunlandi' : item.status === 'in_progress' ? '● Jarayonda' : '○ Rejada'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {formatUZS(item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial Summary */}
                <div className={styles.pdfFinancialSummary}>
                  <div className={styles.pdfSummaryBox}>
                    <div className={styles.pdfSummaryLine}>
                      <span>Reja umumiy smetasi:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatUZS(totalAmount)}</span>
                    </div>
                    <div className={styles.pdfSummaryLine}>
                      <span>Bemor to'lagan (Kassa / Payme):</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#059669' }}>- {formatUZS(paidAmount)}</span>
                    </div>
                    <div className={styles.pdfSummaryLineTotal}>
                      <span>Qoldiq to'lanishi lozim:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#0891B2' }}>{formatUZS(remainingAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Notice */}
                <div className={styles.pdfNotice}>
                  * Ushbu hujjat stomatologiya klinikasi va bemor o'rtasidagi kelishilgan muolaja protokoli hisoblanadi. Klinik muolajalar O'zR SSV №043/h talablariga mos ravishda 12 oylik kafolat bilan ta'minlanadi. To'lovlar Click, Payme, Uzcard, Humo yoki naqd shaklda amalga oshirilishi mumkin.
                </div>

                {/* Signatures */}
                <div className={styles.pdfSignatures}>
                  <div className={styles.pdfSignCol}>
                    <div className={styles.pdfSignTitle}>Davolovchi Shifokor:</div>
                    <div className={styles.pdfSignLine}>
                      <span>Dr. Jasur Azimov</span>
                      <span>(imzo / muhr)</span>
                    </div>
                  </div>

                  <div className={styles.pdfSignCol}>
                    <div className={styles.pdfSignTitle}>Bemor (yoki vasiy) roziligi:</div>
                    <div className={styles.pdfSignLine}>
                      <span>Anvar Qosimov</span>
                      <span>(imzo)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Side Toast Notification */}
      <Toast
        open={Boolean(toastNotice)}
        title="Muolaja holati yangilandi"
        message={toastNotice}
        duration={3500}
        onClose={() => setToastNotice(null)}
      />
    </div>
  );
}
