import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Odontogram from '../../components/Odontogram/Odontogram';
import { odontogramApi } from '../../api/odontogramApi';
import StatusPill from '../../components/StatusPill/StatusPill';
import Toast from '../../components/Toast/Toast';
import Logo from '../../components/Logo/Logo';
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
  { key: 'completed', labelUz: 'Yakunlandi', labelEn: 'Completed', dotColor: 'var(--color-mint)' },
  { key: 'in_progress', labelUz: 'Jarayonda', labelEn: 'In Progress', dotColor: 'var(--color-cyan)' },
  { key: 'scheduled', labelUz: 'Rejalashtirilgan', labelEn: 'Scheduled', dotColor: 'var(--color-info)' },
  { key: 'cancelled', labelUz: 'Bekor qilingan', labelEn: 'Cancelled', dotColor: '#EF4444' }
];

const normalizeTooth = (t) => (t ? String(t).replace('#', '').trim() : t);

export default function TreatmentPlan() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState(INITIAL_PROCEDURES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [openDropdownStep, setOpenDropdownStep] = useState(null);
  const [toastNotice, setToastNotice] = useState(null);
  const dropdownRef = useRef(null);

  // Odontogram Integration States
  const [chartData, setChartData] = useState({});
  const [selectedToothId, setSelectedToothId] = useState('16');
  const [showToothSheet, setShowToothSheet] = useState(false);
  const [filterByTooth, setFilterByTooth] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadChart() {
      try {
        const data = await odontogramApi.getChart('P-1042');
        if (isMounted && data) {
          setChartData(data);
        }
      } catch (e) {
        console.warn('Failed to load odontogram chart:', e);
      }
    }
    loadChart();
    return () => { isMounted = false; };
  }, []);

  const handleSelectTooth = (toothId) => {
    setSelectedToothId(toothId);
    setShowToothSheet(true);
  };

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

  const [exportingExcel, setExportingExcel] = useState(false);

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const { exportTreatmentPlanToExcel } = await import('../../utils/exportTreatmentPlanExcel');
      await exportTreatmentPlanToExcel({
        planId: "TR-8821",
        planTitle: "Kompleks reabilitatsiya va endodontiya",
        patient: {
          name: "Anvar Qosimov",
          id: "P-1042",
          phone: "+998 90 842 11 00",
          doctor: "Dr. J. Azimov"
        },
        clinic: {
          name: "Toshkent Dental Clinic",
          phone: "+998 71 200 44 22"
        },
        items,
        totalAmount,
        paidAmount,
        remainingAmount,
        language: i18n.language
      });
    } catch (err) {
      console.error(err);
    } finally {
      setExportingExcel(false);
    }
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
    const lbl = i18n.language === 'en' ? matched?.labelEn : matched?.labelUz;
    setToastNotice(
      i18n.language === 'en'
        ? `#${stepId} procedure status changed to "${lbl || newStatus}".`
        : `#${stepId} muolaja holati "${lbl || newStatus}" ga o'zgartirildi.`
    );
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
            {t('patientProfile.backToList')}: <strong style={{ color: 'var(--color-text-primary)' }}>Anvar Qosimov (P-1042)</strong>
          </span>
        </Link>
        <StatusPill status="in_progress" label={i18n.language === 'en' ? 'Active Plan' : 'Faol reja'} />
      </div>

      {/* 2. Header Area */}
      <div className={styles.headerCard}>
        <div className={styles.headerInfo}>
          <div className={styles.tagRow}>
            <span className={styles.planTag}>{i18n.language === 'en' ? 'Plan' : 'Reja'} TR-8821</span>
            <span style={{ color: 'var(--color-border)' }}>•</span>
            <span className={styles.protocolType}>{i18n.language === 'en' ? 'Therapeutic & Prosthetic Protocol' : 'Terapevtik va ortopedik protokol'}</span>
          </div>

          <div className={styles.titleRow}>
            <h1 className={styles.planTitle}>{t('treatmentPlan.title')}</h1>
            <span className={styles.h1ProgressBadge}>
              <span className={styles.h1BadgeDot} />
              {progressPercent}% {t('treatmentPlan.planProgress')}
            </span>
          </div>

          <div className={styles.metaRow}>
            <span>{t('treatmentPlan.patient')}: <strong style={{ color: 'var(--color-text-primary)' }}>Anvar Qosimov</strong></span>
            <span className={styles.metaSeparator}>/</span>
            <span>ID: <strong style={{ fontFamily: 'var(--font-mono)' }}>P-1042</strong></span>
            <span className={styles.metaSeparator}>/</span>
            <span>{t('treatmentPlan.date')}: 18-Sentabr, 2026</span>
            <span className={styles.metaSeparator}>/</span>
            <span>{t('dashboard.doctor')}: Dr. Azimov</span>
          </div>

          {/* Integrated progress bar directly inside headerCard */}
          <div className={styles.headerProgressRow}>
            <div className={styles.headerProgressCounts}>
              <span>{i18n.language === 'en' ? 'Total' : 'Jami'}: <strong style={{ color: 'var(--color-text-primary)' }}>{items.length} {t('common.qty')}</strong></span>
              <span>•</span>
              <span>{i18n.language === 'en' ? 'Done' : 'Bajarildi'}: <strong style={{ color: 'var(--color-mint-text)' }}>{completedCount} {t('common.qty')}</strong></span>
              <span>•</span>
              <span>{i18n.language === 'en' ? 'Pending' : 'Kutilmoqda'}: <strong style={{ color: 'var(--color-cyan-hover)' }}>{inProgressCount + scheduledCount} {t('common.qty')}</strong></span>
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
            <span>{t('treatmentPlan.printOfficialPdf')}</span>
          </button>

          <button
            type="button"
            className={styles.addProcBtn}
            onClick={() => setShowAddModal(true)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              add
            </span>
            <span>{t('treatmentPlan.addStep')}</span>
          </button>
        </div>
      </div>

      {/* 3. FDI Odontogram Interactive Arch Visualizer */}
      <section className={styles.odontogramSection}>
        <div className={styles.odontogramSectionHeader}>
          <div className={styles.odontogramTitleGroup}>
            <div className={styles.odontogramIconSquircle}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                dentistry
              </span>
            </div>
            <div>
              <div className={styles.odontogramSectionTitle}>
                {t('odontogram.title')} — FDI Raqamli Tish Xaritasi
              </div>
              <div className={styles.odontogramSectionSub}>
                {i18n.language === 'en'
                  ? 'Click any tooth to inspect clinical diagnosis, plan, and link procedures'
                  : 'Muolaja va tashxisni ko\'rish uchun tish ustiga bosing'}
              </div>
            </div>
          </div>

          <div className={styles.odontogramFilterPills}>
            {selectedToothId && (
              <div
                className={styles.toothFilterChip}
                onClick={() => setFilterByTooth(!filterByTooth)}
                style={{ cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  {filterByTooth ? 'filter_alt' : 'filter_alt_off'}
                </span>
                <span>
                  {filterByTooth
                    ? (i18n.language === 'en' ? `Filtered: #${selectedToothId}` : `Filtr: #${selectedToothId} tish`)
                    : (i18n.language === 'en' ? `Selected: #${selectedToothId} (Filter list)` : `Tanlandi: #${selectedToothId}`)}
                </span>
                <button
                  type="button"
                  className={styles.clearFilterBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedToothId(null);
                    setFilterByTooth(false);
                  }}
                  title="Tozalash"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>close</span>
                </button>
              </div>
            )}
            {selectedToothId && (
              <button
                type="button"
                className={styles.toothFilterChip}
                onClick={() => setShowToothSheet(true)}
                style={{ background: 'var(--color-surface-container)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  assignment
                </span>
                <span>{i18n.language === 'en' ? 'Tooth Sheet' : 'Tish kartasi'}</span>
              </button>
            )}
          </div>
        </div>

        <Odontogram
          chartData={chartData}
          selectedToothId={selectedToothId}
          onSelectTooth={handleSelectTooth}
        />
      </section>

      {/* 4. Apple-style Treatment Procedures Ledger Cards */}
      {(() => {
        const displayedItems = filterByTooth && selectedToothId
          ? items.filter((item) => item.tooth === 'Umumiy' || normalizeTooth(item.tooth) === normalizeTooth(selectedToothId))
          : items;

        return (
          <div className={styles.cardsListContainer}>
            <div className={styles.appleCardHeaderRow}>
              <div className={styles.appleCardListTitle}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-cyan-hover)', fontSize: '18px' }}>
                  list_alt
                </span>
                <span>{t('treatmentPlan.proceduresLedger')} ({displayedItems.length})</span>
                {filterByTooth && (
                  <span className={styles.toothFilterChip} style={{ fontSize: '10.5px', padding: '2px 8px' }}>
                    #{selectedToothId} tish filtri faol
                  </span>
                )}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {i18n.language === 'en' ? 'Status & Pricing' : 'Holat va narxlar'}
              </span>
            </div>

            {displayedItems.map((proc) => {
              const isHighlighted = selectedToothId && normalizeTooth(proc.tooth) === normalizeTooth(selectedToothId);
              const isDone = proc.status === 'completed';
              const isInProgress = proc.status === 'in_progress';

              return (
                <div
                  key={proc.step}
                  className={`${styles.appleProcedureCard} ${isHighlighted ? styles.appleProcedureCardHighlighted : ''}`}
                >
                  <div className={styles.cardLeftCol}>
                    <div className={`${styles.appleStepSquircle} ${isDone ? styles.appleStepDone : isInProgress ? styles.appleStepActive : ''}`}>
                      {isDone ? (
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                      ) : (
                        proc.step
                      )}
                    </div>

                    <div className={styles.cardContentGroup}>
                      <div className={styles.cardTitle}>{proc.title}</div>
                      <div className={styles.cardDesc}>{proc.desc}</div>
                      <div className={styles.cardMetaTagsRow}>
                        <button
                          type="button"
                          className={styles.cardToothTag}
                          onClick={() => {
                            const rawTooth = proc.tooth.replace(/\D/g, '');
                            if (rawTooth) {
                              setSelectedToothId(rawTooth);
                              setShowToothSheet(true);
                            }
                          }}
                          title="Odontogrammada ko'rish"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>dentistry</span>
                          <span>{proc.tooth}</span>
                        </button>
                        <span className={styles.cardDateTag}>
                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>calendar_today</span>
                          <span>{proc.date}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardRightCol}>
                    <div className={styles.cardPriceBox}>
                      <span className={styles.cardPriceVal}>{formatUZS(proc.price)}</span>
                    </div>

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
                        title={t('treatmentPlan.status')}
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
                                <span className={styles.optionLabel}>{i18n.language === 'en' ? opt.labelEn : opt.labelUz}</span>
                                {isCurrent && (
                                  <span className={`material-symbols-outlined ${styles.optionCheck}`}>
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
              );
            })}
          </div>
        );
      })()}

      {/* 5. Total calculation summary card */}
      <div className={styles.totalSummaryCard}>
        <div className={styles.summaryRow}>
          <span>{t('treatmentPlan.totalCost')}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {formatUZS(totalAmount)}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span>{t('treatmentPlan.paidAmount')} (Payme / Cash)</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-mint-text)' }}>
            {formatUZS(paidAmount)}
          </span>
        </div>
        <div className={styles.summaryTotalRow}>
          <span>{t('treatmentPlan.remainingAmount')}</span>
          <span className={styles.remainingAmount}>
            {formatUZS(remainingAmount)}
          </span>
        </div>
      </div>

      {/* Apple-style Tooth Detail Sheet / Modal */}
      {showToothSheet && selectedToothId && (
        <div className={styles.appleToothModalOverlay} onClick={() => setShowToothSheet(false)}>
          <div className={styles.appleToothCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.appleToothHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={styles.odontogramIconSquircle} style={{ width: '40px', height: '40px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '15px' }}>
                    #{selectedToothId}
                  </span>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15.5px', color: 'var(--color-text-primary)' }}>
                    {chartData[selectedToothId]?.name || `${selectedToothId}-tish`}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 7px',
                        borderRadius: '9999px',
                        background:
                          chartData[selectedToothId]?.status === 'caries'
                            ? 'rgba(239,68,68,0.15)'
                            : chartData[selectedToothId]?.status === 'treated'
                            ? 'rgba(16,185,129,0.15)'
                            : 'rgba(6,182,212,0.12)',
                        color:
                          chartData[selectedToothId]?.status === 'caries'
                            ? '#EF4444'
                            : chartData[selectedToothId]?.status === 'treated'
                            ? '#10B981'
                            : 'var(--color-cyan-hover)'
                      }}
                    >
                      {chartData[selectedToothId]?.status || 'healthy'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>FDI Xalqaro standarti</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={styles.clearFilterBtn}
                onClick={() => setShowToothSheet(false)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(120, 120, 128, 0.12)', justifyContent: 'center' }}
                aria-label="Close"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <div className={styles.appleToothBody}>
              <div className={styles.clinicalBox}>
                <div className={styles.clinicalBoxLabel}>
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#EF4444' }}>
                    medical_services
                  </span>
                  <span>{i18n.language === 'en' ? 'Clinical Diagnosis' : 'Klinik Tashxis'}</span>
                </div>
                <div className={styles.clinicalBoxText}>
                  {chartData[selectedToothId]?.diagnosis || (i18n.language === 'en' ? 'No active pathology recorded for this tooth.' : 'Ushbu tish bo\'yicha patologiya aniqlanmagan, holati normada.')}
                </div>
              </div>

              <div className={styles.clinicalBox}>
                <div className={styles.clinicalBoxLabel}>
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--color-cyan-hover)' }}>
                    assignment
                  </span>
                  <span>{i18n.language === 'en' ? 'Recommended Treatment Protocol' : 'Tavsiya etilgan davolash rejasi'}</span>
                </div>
                <div className={styles.clinicalBoxText}>
                  {chartData[selectedToothId]?.plan || (i18n.language === 'en' ? 'Routine hygiene & observational follow-up.' : 'Profilaktik kuzatuv va gigiyena tavsiya etiladi.')}
                </div>
              </div>

              <div className={styles.toothItemsStrip}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
                  {i18n.language === 'en' ? 'Linked Procedures' : 'Biriktirilgan muolajalar'} ({items.filter(item => normalizeTooth(item.tooth) === normalizeTooth(selectedToothId)).length})
                </div>

                {items.filter(item => normalizeTooth(item.tooth) === normalizeTooth(selectedToothId)).length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', padding: '10px 0', fontStyle: 'italic' }}>
                    {i18n.language === 'en' ? 'No procedures linked to this tooth in current plan.' : 'Ushbu tish bo\'yicha rejada muolaja kiritilmagan.'}
                  </div>
                ) : (
                  items.filter(item => normalizeTooth(item.tooth) === normalizeTooth(selectedToothId)).map(proc => (
                    <div key={proc.step} className={styles.toothItemMini}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--color-cyan-hover)' }}>
                          #{proc.step}
                        </span>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {proc.title}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                        {formatUZS(proc.price)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.toothModalTotalBox}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {i18n.language === 'en' ? `Total for Tooth #${selectedToothId}` : `#${selectedToothId} tish bo'yicha jami:`}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {formatUZS(items.filter(item => normalizeTooth(item.tooth) === normalizeTooth(selectedToothId)).reduce((sum, p) => sum + p.price, 0))}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setFilterByTooth(true);
                    setShowToothSheet(false);
                  }}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '12px',
                    background: 'var(--color-surface-container)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {i18n.language === 'en' ? 'Filter Ledger' : 'Ro\'yxatda ko\'rsatish'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewStep(prev => ({ ...prev, tooth: `#${selectedToothId}` }));
                    setShowToothSheet(false);
                    setShowAddModal(true);
                  }}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)'
                  }}
                >
                  + {i18n.language === 'en' ? 'Add Procedure' : 'Muolaja qo\'shish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {t('treatmentPlan.addStep')}
            </h3>

            <form onSubmit={handleAddStep} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  {t('treatmentPlan.procedure')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={i18n.language === 'en' ? "e.g., #46 Composite Restoration" : "masalan, #46 Tishni plombalash"}
                  value={newStep.title}
                  onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  {i18n.language === 'en' ? 'Protocol & Description' : 'Protokol va tavsif'}
                </label>
                <textarea
                  rows={2}
                  placeholder={i18n.language === 'en' ? "Clinical procedure details" : "Muolaja tafsilotlari"}
                  value={newStep.desc}
                  onChange={(e) => setNewStep({ ...newStep, desc: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    {t('treatmentPlan.tooth')}
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
                    {t('treatmentPlan.cost')} (UZS)
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
                  style={{ flex: 1, height: '40px', background: 'var(--color-cyan)', color: '#FFFFFF', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {t('common.save')}
                </button>
                <button
                  type="button"
                  style={{ height: '40px', padding: '0 16px', background: 'var(--color-surface-container)', color: 'var(--color-text-secondary)', borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => setShowAddModal(false)}
                >
                  {t('common.cancel')}
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
                <span>{t('treatmentPlan.pdf.modalTitle')}</span>
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
                  <span>{t('treatmentPlan.printOfficialPdf')}</span>
                </button>

                <button
                  type="button"
                  className={`${styles.pdfActionBtn} ${styles.pdfJsonBtn}`}
                  onClick={handleExportExcel}
                  disabled={exportingExcel}
                  title={i18n.language === 'en' ? "Download Treatment Plan as Excel (.xlsx)" : "Davolash rejasi smetasini Excel (.xlsx) formatida yuklab olish"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>
                    table_view
                  </span>
                  <span>{exportingExcel ? '...' : (i18n.language === 'en' ? 'Export Excel' : 'Excel smeta')}</span>
                </button>

                <button
                  type="button"
                  className={`${styles.pdfActionBtn} ${styles.pdfJsonBtn}`}
                  onClick={handleExportJson}
                  title={i18n.language === 'en' ? "Download JSON payload for EHR sync" : "Backend API uchun barcha ma'lumotlarni JSON qilib yuklab olish"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-cyan-hover)' }}>
                    download
                  </span>
                  <span>{i18n.language === 'en' ? 'Export JSON' : 'JSON ma\'lumotlar'}</span>
                </button>

                <button
                  type="button"
                  className={styles.pdfCloseBtn}
                  onClick={() => setShowPdfModal(false)}
                  title={t('common.close')}
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
                    <Logo size={34} animated={false} />
                    <div>
                      <div className={styles.pdfClinicName}>{t('treatmentPlan.pdf.clinicName')}</div>
                      <div className={styles.pdfClinicLicense}>{t('treatmentPlan.pdf.license')}</div>
                    </div>
                  </div>

                  <div className={styles.pdfDocMeta}>
                    <div className={styles.pdfDocTitle}>{t('treatmentPlan.pdf.docTitle')}</div>
                    <div>{i18n.language === 'en' ? 'Document #:' : 'Hujjat №:'} <strong>TR-8821</strong></div>
                    <div>{t('treatmentPlan.date')}: <strong>18-Sentabr, 2026</strong></div>
                  </div>
                </div>

                {/* Dossier */}
                <div className={styles.pdfDossierGrid}>
                  <div className={styles.pdfDossierCol}>
                    <div className={styles.pdfDossierRow}>
                      <span className={styles.pdfDossierLabel}>{t('treatmentPlan.pdf.patientName')}:</span>
                      <span className={styles.pdfDossierVal}>Anvar Qosimov</span>
                    </div>
                    <div className={styles.pdfDossierRow}>
                      <span className={styles.pdfDossierLabel}>ID:</span>
                      <span className={styles.pdfDossierVal}>P-1042</span>
                    </div>
                    <div className={styles.pdfDossierRow}>
                      <span className={styles.pdfDossierLabel}>{t('treatmentPlan.pdf.phone')}:</span>
                      <span className={styles.pdfDossierVal}>+998 90 842 11 00</span>
                    </div>
                  </div>

                  <div className={styles.pdfDossierCol}>
                    <div className={styles.pdfDossierRow}>
                      <span className={styles.pdfDossierLabel}>{t('treatmentPlan.pdf.doctor')}:</span>
                      <span className={styles.pdfDossierVal}>Dr. Jasur Azimov</span>
                    </div>
                    <div className={styles.pdfDossierRow}>
                      <span className={styles.pdfDossierLabel}>{i18n.language === 'en' ? 'Specialty:' : 'Mutaxassislik:'}</span>
                      <span className={styles.pdfDossierVal}>{i18n.language === 'en' ? 'Chief Doctor / Endodontist' : 'Bosh shifokor / Terapevt-Endodont'}</span>
                    </div>
                    <div className={styles.pdfDossierRow}>
                      <span className={styles.pdfDossierLabel}>{i18n.language === 'en' ? 'Diagnosis:' : 'Klinik Tashxis:'}</span>
                      <span className={styles.pdfDossierVal}>{i18n.language === 'en' ? '#16 Deep Caries & Pulpitis' : '#16 Tish chuqur kariesi va pulpiti'}</span>
                    </div>
                  </div>
                </div>

                {/* Procedures Table */}
                <table className={styles.pdfTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>{t('treatmentPlan.pdf.tableStep')}</th>
                      <th>{t('treatmentPlan.pdf.tableProc')}</th>
                      <th style={{ width: '70px' }}>{t('treatmentPlan.pdf.tableTooth')}</th>
                      <th style={{ width: '130px' }}>{t('treatmentPlan.date')}</th>
                      <th style={{ width: '100px' }}>{t('treatmentPlan.status')}</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>{t('treatmentPlan.cost')}</th>
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
                            {item.status === 'completed' ? (i18n.language === 'en' ? '✓ Completed' : '✓ Yakunlandi') : item.status === 'in_progress' ? (i18n.language === 'en' ? '● In Progress' : '● Jarayonda') : (i18n.language === 'en' ? '○ Scheduled' : '○ Rejada')}
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
                      <span>{t('treatmentPlan.totalCost')}:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatUZS(totalAmount)}</span>
                    </div>
                    <div className={styles.pdfSummaryLine}>
                      <span>{t('treatmentPlan.paidAmount')}:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#059669' }}>- {formatUZS(paidAmount)}</span>
                    </div>
                    <div className={styles.pdfSummaryLineTotal}>
                      <span>{t('treatmentPlan.remainingAmount')}:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#0891B2' }}>{formatUZS(remainingAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Notice */}
                <div className={styles.pdfNotice}>
                  * {t('treatmentPlan.pdf.footerNote')}
                </div>

                {/* Signatures */}
                <div className={styles.pdfSignatures}>
                  <div className={styles.pdfSignCol}>
                    <div className={styles.pdfSignTitle}>{t('treatmentPlan.pdf.doctorSign')}</div>
                    <div className={styles.pdfSignLine}>
                      <span>Dr. Jasur Azimov</span>
                      <span>(imzo / muhr)</span>
                    </div>
                  </div>

                  <div className={styles.pdfSignCol}>
                    <div className={styles.pdfSignTitle}>{t('treatmentPlan.pdf.patientSign')}</div>
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
        type="success"
        duration={3500}
        onClose={() => setToastNotice(null)}
      />
    </div>
  );
}
