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

// ─────────────────────────────────────────────────────────────
// AUTHENTIC BRANDED PAYMENT LOGOS (Payme, Click, Uzcard, Humo, Cash)
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// COMPACT LOGO BADGES (Used in DataTable Chips & Notifications)
// ─────────────────────────────────────────────────────────────
function PaymeLogo({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ flexShrink: 0 }}>
      <rect width="28" height="28" rx="7" fill="#00CCCC" />
      <path d="M8.5 7.5C8.5 6.67157 9.17157 6 10 6H16C19.0376 6 21.5 8.46243 21.5 11.5C21.5 14.5376 19.0376 17 16 17H12.5V21C12.5 21.5523 12.0523 22 11.5 22H10C9.17157 22 8.5 21.3284 8.5 20.5V7.5Z" fill="#FFFFFF" />
      <circle cx="15.5" cy="11.5" r="2.5" fill="#00CCCC" />
    </svg>
  );
}

function ClickLogo({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ flexShrink: 0 }}>
      <rect width="28" height="28" rx="7" fill="#0073FF" />
      <circle cx="14" cy="14" r="8.5" stroke="#FFFFFF" strokeWidth="2.2" strokeDasharray="38 12" strokeLinecap="round" />
      <polygon points="12.5,8 18.5,14 12.5,20 14.5,14" fill="#FFFFFF" />
    </svg>
  );
}

function UzcardLogo({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ flexShrink: 0 }}>
      <rect width="28" height="28" rx="7" fill="#581C87" />
      <rect x="6" y="8" width="16" height="12" rx="2.5" stroke="#FFFFFF" strokeWidth="1.6" />
      <rect x="8.5" y="11.5" width="4" height="3" rx="0.6" fill="#FBBF24" />
      <line x1="6" y1="11" x2="22" y2="11" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.35" />
      <circle cx="18" cy="15.5" r="1.8" fill="#C084FC" />
    </svg>
  );
}

function HumoLogo({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ flexShrink: 0 }}>
      <rect width="28" height="28" rx="7" fill="#D97706" />
      <path d="M7 17.5C10 17.5 13 15 15.5 11C17 14 19.5 16.5 21.5 16.5C18.5 20 10.5 20 7 17.5Z" fill="#FFFFFF" />
      <path d="M9.5 14C12 14 15 10.5 16.5 7C18 9.5 19.5 11 21 12C18 14.5 12.5 15.5 9.5 14Z" fill="#FEF3C7" />
    </svg>
  );
}

function VisaMiniLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="28" height="28" rx="7" fill="#1434CB" />
      <text x="14" y="19" fontFamily="sans-serif" fontSize="11" fontWeight="900" fill="#FFFFFF" textAnchor="middle" fontStyle="italic">
        VISA
      </text>
    </svg>
  );
}

function CashLogo({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ flexShrink: 0 }}>
      <rect width="28" height="28" rx="7" fill="#059669" />
      <rect x="6" y="9" width="16" height="10" rx="2" stroke="#FFFFFF" strokeWidth="1.6" />
      <circle cx="14" cy="14" r="2.5" fill="#FFFFFF" />
      <circle cx="9" cy="14" r="1" fill="#A7F3D0" />
      <circle cx="19" cy="14" r="1" fill="#A7F3D0" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// FULL OFFICIAL BRAND LOGOS (Used in Checkout Card Tiles)
// ─────────────────────────────────────────────────────────────
function PaymeBrandLogo() {
  return (
    <svg width="112" height="30" viewBox="0 0 115 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#00CCCC" />
      <path d="M10 8.5C10 7.67 10.67 7 11.5 7H18C21.31 7 24 9.69 24 13C24 16.31 21.31 19 18 19H14V24C14 24.55 13.55 25 13 25H11C10.45 25 10 24.55 10 24V8.5Z" fill="#FFFFFF" />
      <circle cx="17.5" cy="13" r="2.8" fill="#00CCCC" />
      <text x="38" y="23" fontFamily="system-ui, -apple-system, sans-serif" fontSize="21" fontWeight="800" fill="#1E293B" letterSpacing="-0.3px">
        pay<tspan fill="#00CCCC">me</tspan>
      </text>
    </svg>
  );
}

function ClickBrandLogo() {
  return (
    <svg width="105" height="30" viewBox="0 0 108 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#0073FF" />
      <circle cx="16" cy="16" r="9.5" stroke="#FFFFFF" strokeWidth="2.2" strokeDasharray="42 12" strokeLinecap="round" />
      <polygon points="14,10 21,16 14,22 16,16" fill="#FFFFFF" />
      <text x="38" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="900" fill="#0073FF" letterSpacing="0.8px">
        CLICK
      </text>
    </svg>
  );
}

function UzcardBrandLogo() {
  return (
    <svg width="112" height="30" viewBox="0 0 116 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#581C87" />
      <rect x="6" y="8" width="20" height="16" rx="3" stroke="#FFFFFF" strokeWidth="1.8" />
      <rect x="9" y="12" width="5.5" height="4.5" rx="1" fill="#FBBF24" />
      <line x1="6" y1="12" x2="26" y2="12" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.4" />
      <circle cx="21" cy="19.5" r="2" fill="#C084FC" />
      <text x="38" y="23.5" fontFamily="system-ui, -apple-system, sans-serif" fontSize="19" fontWeight="800" fill="#581C87" letterSpacing="0.4px">
        UZCARD
      </text>
    </svg>
  );
}

function HumoBrandLogo() {
  return (
    <svg width="102" height="30" viewBox="0 0 106 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#D97706" />
      <path d="M7 21C11 21 15 17.5 18 12C20 16 23.5 19.5 26 19.5C22 24 12 24 7 21Z" fill="#FFFFFF" />
      <path d="M10 16C13 16 17 11.5 19 7C21 10 23 12 25 13C21 16.5 14 18 10 16Z" fill="#FEF3C7" />
      <text x="38" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="21" fontWeight="900" fill="#D97706" letterSpacing="1px">
        HUMO
      </text>
    </svg>
  );
}

function VisaMastercardLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
      <svg width="48" height="17" viewBox="0 0 60 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.5 1L15.3 19.5H10.2L6 4.2C5.7 3 5.5 2.5 4.6 2C3.3 1.3 1.4 0.7 0 0.3L0.1 0H8.4C9.5 0 10.5 0.8 10.7 2L12.7 13.1L17.8 0H23.5Z" fill="#1434CB"/>
        <path d="M30 13.5C30.1 8.3 22.8 8 22.9 5.7C23 4.9 23.8 4.1 25.3 3.9C26.1 3.8 28.2 3.7 30.4 4.8L31.3 0.6C30.1 0.2 28.5 0 26.5 0C20.9 0 17 3 16.9 7.3C16.8 10.5 19.7 12.3 21.9 13.3C24.1 14.4 24.8 15.1 24.8 16.1C24.7 17.6 23 18.2 21.4 18.3C18.6 18.3 17 17.5 15.7 16.9L14.7 21.2C16 21.8 18.4 22.3 20.9 22.3C26.8 22.3 30.1 19.3 30 13.5Z" fill="#1434CB"/>
        <path d="M38.8 19.5H44L40 1H35.4C34.3 1 33.4 1.6 33 2.6L28 19.5H33.7L34.8 16.3H38.3L38.8 19.5ZM36.1 12.8L37.5 8.7L38.7 12.8H36.1Z" fill="#1434CB"/>
        <path d="M53 1H48C46.9 1 46.1 1.6 45.7 2.6L38.4 19.5H44.1L45.2 16.3H50.4L50.9 19.5H56L53 1ZM46.5 12.8L48.8 5.7L50.2 12.8H46.5Z" fill="#1434CB"/>
      </svg>
      <span style={{ width: '1px', height: '20px', background: '#E2E8F0' }} />
      <svg width="34" height="22" viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="13" r="11" fill="#EB001B"/>
        <circle cx="25" cy="13" r="11" fill="#F79E1B"/>
        <path d="M20 5.6C22.5 7.6 24.1 10.6 24.1 14C24.1 17.4 22.5 20.4 20 22.4C17.5 20.4 15.9 17.4 15.9 14C15.9 10.6 17.5 7.6 20 5.6Z" fill="#FF5F00"/>
      </svg>
    </div>
  );
}

function CashBrandLogo() {
  return (
    <svg width="108" height="30" viewBox="0 0 114 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#059669" />
      <rect x="5.5" y="8.5" width="21" height="15" rx="2.5" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="16" cy="16" r="3.5" fill="#FFFFFF" />
      <circle cx="9.5" cy="16" r="1.2" fill="#A7F3D0" />
      <circle cx="22.5" cy="16" r="1.2" fill="#A7F3D0" />
      <text x="38" y="23" fontFamily="system-ui, -apple-system, sans-serif" fontSize="17.5" fontWeight="800" fill="#059669" letterSpacing="0.4px">
        NAQD PUL
      </text>
    </svg>
  );
}

function getPaymentLogo(methodName, size = 18) {
  const norm = (methodName || '').toLowerCase();
  if (norm.includes('payme')) return <PaymeLogo size={size} />;
  if (norm.includes('click')) return <ClickLogo size={size} />;
  if (norm.includes('uzcard')) return <UzcardLogo size={size} />;
  if (norm.includes('humo')) return <HumoLogo size={size} />;
  if (norm.includes('visa') || norm.includes('mastercard') || norm.includes('mc')) return <VisaMiniLogo size={size} />;
  if (norm.includes('naqd') || norm.includes('cash')) return <CashLogo size={size} />;
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="28" height="28" rx="7" fill="#475569" />
      <path d="M6 12L14 7L22 12H6Z" fill="#FFFFFF" />
      <line x1="9" y1="13" x2="9" y2="19" stroke="#FFFFFF" strokeWidth="1.6" />
      <line x1="14" y1="13" x2="14" y2="19" stroke="#FFFFFF" strokeWidth="1.6" />
      <line x1="19" y1="13" x2="19" y2="19" stroke="#FFFFFF" strokeWidth="1.6" />
      <rect x="6" y="19" width="16" height="2.5" fill="#FFFFFF" />
    </svg>
  );
}

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
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [copiedCard, setCopiedCard] = useState(false);
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

  const handleOpenSettleModal = (inv) => {
    setSelectedInvoice(inv);
    setPaymentForm({
      patient: inv.patient,
      patientId: inv.patientId,
      procedure: inv.procedure,
      doctor: inv.doctor,
      amount: String(inv.amount),
      method: inv.method || 'Payme',
      status: 'paid',
      notes: ''
    });
    setShowCollectModal(true);
  };

  const handleOpenNewPaymentModal = () => {
    setSelectedInvoice(null);
    setPaymentForm({
      patient: '',
      patientId: '',
      procedure: 'Kompozit restavratsiya',
      doctor: 'Dr. Azimov',
      amount: '450000',
      method: 'Payme',
      status: 'paid',
      notes: ''
    });
    setShowCollectModal(true);
  };

  const handleCopyClinicCard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('9860350188442200');
    }
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2200);
    setToast({
      open: true,
      type: 'success',
      title: i18n.language === 'en' ? 'Card Copied' : 'Karta raqami nusxalandi',
      message: '9860 3501 8844 2200 (DentUz Aloqabank) buferga nusxalandi.'
    });
  };

  const handleSendPaymentSms = () => {
    setToast({
      open: true,
      type: 'success',
      title: i18n.language === 'en' ? 'Payment Link Sent' : 'To\'lov havolasi yuborildi',
      message: `${paymentForm.patient || 'Bemor'} telefon raqamiga ${paymentForm.method} to'lov havolasi yuborildi.`
    });
  };

  const handleViewReceipt = (row) => {
    setActiveReceipt(row);
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

    if (selectedInvoice) {
      const wasPending = selectedInvoice.status !== 'paid';
      const isNowPaid = paymentForm.status === 'paid';

      setInvoices((prev) =>
        prev.map((item) =>
          item.id === selectedInvoice.id
            ? {
                ...item,
                patient: paymentForm.patient,
                procedure: paymentForm.procedure,
                doctor: paymentForm.doctor,
                method: paymentForm.method,
                amount: cleanAmount,
                status: paymentForm.status
              }
            : item
        )
      );

      if (wasPending && isNowPaid) {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                monthlyRevenue: (prev.monthlyRevenue || 0) + cleanAmount,
                pendingPayments: Math.max(0, (prev.pendingPayments || 0) - selectedInvoice.amount),
                pendingCount: Math.max(0, (prev.pendingCount || 1) - 1)
              }
            : prev
        );
      }

      setShowCollectModal(false);
      const settledId = selectedInvoice.id;
      setSelectedInvoice(null);

      setToast({
        open: true,
        type: 'success',
        title: i18n.language === 'en' ? 'Payment Processed' : 'To\'lov muvaffaqiyatli qabul qilindi',
        message: i18n.language === 'en'
          ? `Invoice #${settledId} (${formatUZS(cleanAmount)}) settled via ${paymentForm.method}.`
          : `${settledId} raqamli invoys (${formatUZS(cleanAmount)}) ${paymentForm.method} orqali to'landi.`
      });
    } else {
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
    }
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
      render: (val) => (
        <span className={styles.paymentMethodChip}>
          {getPaymentLogo(val, 16)}
          <span>{val}</span>
        </span>
      )
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
    },
    {
      title: i18n.language === 'en' ? 'Actions' : 'Amallar',
      key: 'actions',
      align: 'right',
      render: (_, row) => {
        if (row.status === 'pending' || row.status === 'partial') {
          return (
            <button
              type="button"
              className={styles.quickPayBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenSettleModal(row);
              }}
              title={i18n.language === 'en' ? 'Collect Payment' : "To'lovni qabul qilish"}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                payments
              </span>
              <span>{i18n.language === 'en' ? 'Pay' : "To'lash"}</span>
            </button>
          );
        }
        return (
          <button
            type="button"
            className={styles.viewReceiptBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleViewReceipt(row);
            }}
            title={i18n.language === 'en' ? 'Print / View Receipt' : "Kvitansiya / Chek"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              receipt_long
            </span>
          </button>
        );
      }
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
            onClick={handleOpenNewPaymentModal}
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
        <div className={styles.modalOverlay} onClick={() => { setShowCollectModal(false); setSelectedInvoice(null); }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderInfo}>
                <div className={styles.modalTitle}>
                  <span className={`material-symbols-outlined ${styles.modalTitleIcon}`}>
                    account_balance_wallet
                  </span>
                  <span>
                    {selectedInvoice
                      ? (i18n.language === 'en' ? `Settle Payment #${selectedInvoice.id}` : `To'lovni qabul qilish — #${selectedInvoice.id}`)
                      : (i18n.language === 'en' ? 'Collect Payment' : 'Yangi to\'lov qabul qilish')}
                  </span>
                </div>
                <div className={styles.modalSub}>
                  {selectedInvoice
                    ? (i18n.language === 'en'
                        ? `Settle pending invoice for patient ${selectedInvoice.patient} (ID: #${selectedInvoice.patientId})`
                        : `${selectedInvoice.patient} (ID: #${selectedInvoice.patientId}) hisobi bo'yicha to'lovni rasmiylashtirish`)
                    : (i18n.language === 'en'
                        ? 'Register dental procedure payment and generate invoice receipt'
                        : 'Muolaja to\'lovini qabul qilish va kassa invoysini rasmiylashtirish')}
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => { setShowCollectModal(false); setSelectedInvoice(null); }}
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

              {/* Payment Method Selector (Checkout Style matching user reference) */}
              <div className={styles.paymentSelectorBox}>
                <div className={styles.paymentSelectorTitle}>
                  <span>{i18n.language === 'en' ? 'How would you like to pay?' : 'To\'lov usulini tanlang (To\'lov tizimlari)'}</span>
                  <span className={styles.paymentSelectorSub}>
                    {i18n.language === 'en' ? 'Select provider' : 'Rasmiy integratsiya'}
                  </span>
                </div>

                <div className={styles.methodsGrid}>
                  {[
                    { key: 'Payme', label: 'Payme', logo: <PaymeBrandLogo /> },
                    { key: 'Click', label: 'Click', logo: <ClickBrandLogo /> },
                    { key: 'Uzcard', label: 'Uzcard', logo: <UzcardBrandLogo /> },
                    { key: 'Humo', label: 'Humo', logo: <HumoBrandLogo /> },
                    { key: 'Visa / Mastercard', label: 'Visa & Mastercard', logo: <VisaMastercardLogo /> },
                    { key: 'Naqd', label: 'Naqd pul', logo: <CashBrandLogo /> }
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      className={`${styles.paymentCardTile} ${paymentForm.method === m.key ? styles.paymentCardTileActive : ''}`}
                      onClick={() => setPaymentForm((prev) => ({ ...prev, method: m.key }))}
                      title={m.label}
                    >
                      {paymentForm.method === m.key && (
                        <div className={styles.paymentCardCheckmark}>
                          <span className="material-symbols-outlined" style={{ fontSize: '11px', fontWeight: 800 }}>
                            check
                          </span>
                        </div>
                      )}
                      <div className={styles.paymentCardLogoContainer}>
                        {m.logo}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dedicated Online Payment Box (Payme / Click / Cards) */}
              {paymentForm.method !== 'Naqd' && (
                <div className={styles.onlinePaymentBox}>
                  <div className={styles.onlinePaymentHeader}>
                    <div className={styles.onlinePaymentTitle}>
                      {getPaymentLogo(paymentForm.method, 20)}
                      <span>{paymentForm.method} orqali tezkor to'lov</span>
                    </div>
                    <span className={styles.onlineBadge}>
                      {paymentForm.method === 'Payme' ? 'Payme Business' : paymentForm.method === 'Click' ? 'Click Up' : 'Karta / Terminal'}
                    </span>
                  </div>

                  <div className={styles.onlineBody}>
                    <div className={styles.qrContainer} title={`${paymentForm.method} QR to'lov kodi`}>
                      <svg width="88" height="88" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="28" height="28" rx="4" stroke="#0F172A" strokeWidth="6" fill="white"/>
                        <rect x="13" y="13" width="14" height="14" rx="2" fill="#0F172A"/>
                        <rect x="66" y="6" width="28" height="28" rx="4" stroke="#0F172A" strokeWidth="6" fill="white"/>
                        <rect x="73" y="13" width="14" height="14" rx="2" fill="#0F172A"/>
                        <rect x="6" y="66" width="28" height="28" rx="4" stroke="#0F172A" strokeWidth="6" fill="white"/>
                        <rect x="13" y="73" width="14" height="14" rx="2" fill="#0F172A"/>
                        <rect x="42" y="8" width="6" height="6" fill="#0F172A"/>
                        <rect x="52" y="8" width="6" height="6" fill="#0F172A"/>
                        <rect x="42" y="20" width="6" height="6" fill="#0F172A"/>
                        <rect x="52" y="26" width="6" height="6" fill="#0F172A"/>
                        <rect x="8" y="42" width="6" height="6" fill="#0F172A"/>
                        <rect x="20" y="42" width="6" height="6" fill="#0F172A"/>
                        <rect x="26" y="52" width="6" height="6" fill="#0F172A"/>
                        <rect x="86" y="42" width="6" height="6" fill="#0F172A"/>
                        <rect x="76" y="52" width="6" height="6" fill="#0F172A"/>
                        <rect x="68" y="42" width="6" height="6" fill="#0F172A"/>
                        <rect x="42" y="70" width="6" height="6" fill="#0F172A"/>
                        <rect x="52" y="80" width="6" height="6" fill="#0F172A"/>
                        <rect x="72" y="72" width="6" height="6" fill="#0F172A"/>
                        <rect x="84" y="82" width="6" height="6" fill="#0F172A"/>
                        <rect x="64" y="86" width="6" height="6" fill="#0F172A"/>
                      </svg>
                      <div className={styles.qrIconBadge}>
                        {getPaymentLogo(paymentForm.method, 18)}
                      </div>
                    </div>

                    <div className={styles.onlineDetails}>
                      <div className={styles.cardRow}>
                        <div className={styles.cardInfo}>
                          <span className={styles.cardLabel}>Klinika hisob kartasi (DentUz)</span>
                          <span className={styles.cardNum}>9860 3501 8844 2200</span>
                        </div>
                        <button
                          type="button"
                          className={styles.copyCardBtn}
                          onClick={handleCopyClinicCard}
                          title="Karta raqamini nusxalash"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                            {copiedCard ? 'check' : 'content_copy'}
                          </span>
                          <span>{copiedCard ? 'Nusxalandi' : 'Nusxa'}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        className={styles.sendSmsBtn}
                        onClick={handleSendPaymentSms}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          sms
                        </span>
                        <span>Bemorga to'lov havolasini SMS yuborish</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                  onClick={() => { setShowCollectModal(false); setSelectedInvoice(null); }}
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
                  <span>
                    {selectedInvoice
                      ? (i18n.language === 'en' ? 'Confirm Settlement' : 'To\'lovni qabul qilish')
                      : (i18n.language === 'en' ? 'Confirm Payment' : 'To\'lovni tasdiqlash')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal Dialog */}
      {activeReceipt && (
        <div className={styles.modalOverlay} onClick={() => setActiveReceipt(null)}>
          <div className={styles.receiptModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.receiptTopHeader}>
              <div className={styles.receiptClinicTitle}>DentUz Dental Clinic</div>
              <div className={styles.receiptClinicSub}>
                Litsenziya MED-UZ-2021-9988 • Tel: +998 71 200 44 22
              </div>
              <div className={styles.receiptDocNumber}>
                KVITANSIYA / CHEK #{activeReceipt.id}
              </div>
            </div>

            <div className={styles.receiptBody}>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Bemor:</span>
                <span className={styles.receiptVal}>{activeReceipt.patient} (ID: #{activeReceipt.patientId})</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Shifokor:</span>
                <span className={styles.receiptVal}>{activeReceipt.doctor}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Xizmat / Muolaja:</span>
                <span className={styles.receiptVal}>{activeReceipt.procedure}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Sana va vaqt:</span>
                <span className={styles.receiptVal} style={{ fontFamily: 'var(--font-mono)' }}>{activeReceipt.date}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>To'lov usuli:</span>
                <span className={styles.receiptVal} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {getPaymentLogo(activeReceipt.method, 18)}
                  <span>{activeReceipt.method}</span>
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Holati:</span>
                <span className={styles.receiptVal} style={{ color: '#10B981', fontWeight: 700 }}>
                  To'langan (Fiskal tasdiqlangan)
                </span>
              </div>

              <div className={styles.receiptTotalRow}>
                <span className={styles.receiptTotalLabel}>Jami to'langan summa:</span>
                <span className={styles.receiptTotalVal}>{formatUZS(activeReceipt.amount)}</span>
              </div>

              <div className={styles.receiptFiscalBox}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-cyan-hover)' }}>
                  verified
                </span>
                <span>SOLIQ VA FISKAL OPERATOR TIZIMIDA QAYD ETILGAN</span>
              </div>
            </div>

            <div className={styles.receiptActions}>
              <button
                type="button"
                className={styles.receiptPrintBtn}
                onClick={() => window.print()}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  print
                </span>
                <span>Chop etish (Print)</span>
              </button>
              <button
                type="button"
                className={styles.receiptCloseBtn}
                onClick={() => setActiveReceipt(null)}
              >
                Yopish
              </button>
            </div>
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
