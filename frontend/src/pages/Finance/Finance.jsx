import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { financeApi } from '../../api/financeApi';
import StatCard from '../../components/StatCard/StatCard';
import StatusPill from '../../components/StatusPill/StatusPill';
import DataTable from '../../components/DataTable/DataTable';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import Toast from '../../components/Toast/Toast';
import { formatUZS } from '../../utils/formatters';
import {
  printThermalReceipt,
  printOfficialInvoiceA4,
  ReceiptBarcode
} from '../../utils/exportFinanceReceipt';
import styles from './Finance.module.css';

// Payment logos (Payme, Click, Uzcard, Humo, Cash)

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

// Brand logos for checkout cards

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
  const [receiptPrintFormat, setReceiptPrintFormat] = useState('thermal'); // 'thermal' | 'a4'
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
    setActiveReceipt({
      ...row,
      patientId: row.patientId || '1046',
      fiscalNumber: row.fiscalNumber || '482910481239',
      fmNumber: row.fmNumber || '001928374',
      terminalId: row.terminalId || 'T-88401',
      cashier: row.cashier || 'Nigora R. (Kassir-1)',
      clinicName: 'DentUz Dental Clinic',
      clinicLegalName: 'MCHJ "DENTUZ MED SERVIS"',
      clinicInn: '308 124 591',
      licenseNumber: 'MED-UZ-2021-9988',
      address: 'Toshkent sh., Chilonzor t., Bunyodkor shoh ko\'chasi 42',
      phone: '+998 (71) 200-44-22'
    });
  };

  const handleDirectPrintReceipt = () => {
    if (!activeReceipt) return;
    if (receiptPrintFormat === 'thermal') {
      printThermalReceipt(activeReceipt);
    } else {
      printOfficialInvoiceA4(activeReceipt);
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

      {/* Apple-Inspired Payment Sheet Dialog */}
      {showCollectModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowCollectModal(false); setSelectedInvoice(null); }}>
          <div className={styles.appleModalCard} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.appleModalHeader}>
              <div className={styles.appleModalTitleGroup}>
                <div className={styles.appleModalTitle}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-cyan-hover)', fontSize: '22px' }}>
                    account_balance_wallet
                  </span>
                  <span>
                    {selectedInvoice
                      ? (i18n.language === 'en' ? 'Settle Payment' : 'To\'lovni qabul qilish')
                      : (i18n.language === 'en' ? 'Collect Payment' : 'Yangi to\'lov')}
                  </span>
                  {selectedInvoice && (
                    <span className={styles.appleInvoiceBadge}>
                      #{selectedInvoice.id}
                    </span>
                  )}
                </div>
                <div className={styles.appleModalSub}>
                  {selectedInvoice
                    ? `${selectedInvoice.patient} hisobi bo'yicha to'lovni tasdiqlash`
                    : 'Muolaja to\'lovini qabul qilish va kassa invoysini yaratish'}
                </div>
              </div>
              <button
                type="button"
                className={styles.appleCloseBtn}
                onClick={() => { setShowCollectModal(false); setSelectedInvoice(null); }}
                aria-label="Close"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className={styles.appleForm}>
              {/* Context: Patient & Treatment */}
              {selectedInvoice ? (
                <div className={styles.applePatientCard}>
                  <div className={styles.applePatientAvatar}>
                    {paymentForm.patient?.charAt(0) || 'P'}
                  </div>
                  <div className={styles.applePatientInfo}>
                    <div className={styles.applePatientName}>
                      {paymentForm.patient}
                      <span className={styles.applePatientId}>ID: #{paymentForm.patientId}</span>
                    </div>
                    <div className={styles.applePatientMeta}>
                      {paymentForm.procedure} • {paymentForm.doctor}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.appleMethodLabel}>
                      {i18n.language === 'en' ? 'Patient Name' : 'Bemor ismi'}
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
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.appleMethodLabel}>
                        {i18n.language === 'en' ? 'Procedure' : 'Muolaja'}
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
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.appleMethodLabel}>
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
                </div>
              )}

              {/* Apple Hero Amount Display */}
              <div className={styles.appleHeroAmountBox}>
                <div className={styles.appleAmountHeader}>
                  <span className={styles.appleAmountLabel}>
                    {i18n.language === 'en' ? 'Amount to pay' : 'To\'lov summasi'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {formatUZS(Number(paymentForm.amount) || 0)}
                  </span>
                </div>

                <div className={styles.appleAmountInputWrap}>
                  <input
                    type="text"
                    className={styles.appleAmountInput}
                    value={paymentForm.amount ? Number(paymentForm.amount).toLocaleString('ru-RU') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setPaymentForm((prev) => ({ ...prev, amount: raw }));
                    }}
                    placeholder="0"
                    required
                  />
                  <span className={styles.appleCurrencyTag}>UZS</span>
                </div>

                <div className={styles.appleChipsRow}>
                  {selectedInvoice && (
                    <button
                      type="button"
                      className={`${styles.appleChip} ${paymentForm.amount === String(selectedInvoice.amount) ? styles.appleChipActive : ''}`}
                      onClick={() => setPaymentForm((prev) => ({ ...prev, amount: String(selectedInvoice.amount) }))}
                    >
                      To'liq ({formatUZS(selectedInvoice.amount)})
                    </button>
                  )}
                  {['350000', '800000', '1500000', '3000000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={`${styles.appleChip} ${paymentForm.amount === amt ? styles.appleChipActive : ''}`}
                      onClick={() => setPaymentForm((prev) => ({ ...prev, amount: amt }))}
                    >
                      {formatUZS(Number(amt))}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apple Segmented Payment Method Control */}
              <div className={styles.appleMethodSection}>
                <div className={styles.appleMethodLabel}>
                  {i18n.language === 'en' ? 'Select payment method' : 'To\'lov usulini tanlang'}
                </div>
                <div className={styles.appleSegmentGrid}>
                  {[
                    { key: 'Payme', label: 'Payme', icon: <PaymeLogo size={18} /> },
                    { key: 'Click', label: 'Click', icon: <ClickLogo size={18} /> },
                    { key: 'Uzcard', label: 'Uzcard', icon: <UzcardLogo size={18} /> },
                    { key: 'Humo', label: 'Humo', icon: <HumoLogo size={18} /> },
                    { key: 'Naqd', label: 'Naqd pul', icon: <CashLogo size={18} /> }
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      className={`${styles.appleSegmentBtn} ${paymentForm.method === m.key ? styles.appleSegmentBtnActive : ''}`}
                      onClick={() => setPaymentForm((prev) => ({ ...prev, method: m.key }))}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact 1-line Card Transfer Strip (Only for online/card) */}
              {paymentForm.method !== 'Naqd' && (
                <div className={styles.appleTransferStrip}>
                  <div className={styles.appleTransferLeft}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-cyan-hover)' }}>
                      credit_card
                    </span>
                    <span>
                      Klinika kartasi: <strong>9860 3501 8844 2200</strong>
                    </span>
                  </div>
                  <div className={styles.appleTransferActions}>
                    <button
                      type="button"
                      className={styles.appleMiniBtn}
                      onClick={handleCopyClinicCard}
                      title="Karta raqamini nusxalash"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                        {copiedCard ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedCard ? 'Nusxalandi' : 'Nusxa'}</span>
                    </button>
                    <button
                      type="button"
                      className={styles.appleMiniBtn}
                      onClick={handleSendPaymentSms}
                      title="Bemorga SMS havola"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                        sms
                      </span>
                      <span>SMS</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Apple Primary CTA Button */}
              <button
                type="submit"
                className={styles.applePrimaryBtn}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  check_circle
                </span>
                <span>
                  {selectedInvoice
                    ? (i18n.language === 'en' ? 'Confirm Settlement' : 'To\'lovni qabul qilish')
                    : (i18n.language === 'en' ? 'Confirm Payment' : 'To\'lovni tasdiqlash')}
                  {' '}• {formatUZS(Number(paymentForm.amount) || 0)}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal Dialog */}
      {activeReceipt && (
        <div className={styles.modalOverlay} onClick={() => setActiveReceipt(null)}>
          <div className={styles.receiptModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.receiptTopControl}>
              <div className={styles.receiptPreviewTitle}>
                <span className="material-symbols-outlined" style={{ fontSize: '19px', color: 'var(--color-cyan-hover)' }}>
                  receipt_long
                </span>
                <span>Kvitansiya / Chek</span>
              </div>
              <div className={styles.receiptFormatTabs}>
                <button
                  type="button"
                  className={`${styles.receiptFormatTab} ${receiptPrintFormat === 'thermal' ? styles.receiptFormatTabActive : ''}`}
                  onClick={() => setReceiptPrintFormat('thermal')}
                >
                  🧾 80mm Termo Chek
                </button>
                <button
                  type="button"
                  className={`${styles.receiptFormatTab} ${receiptPrintFormat === 'a4' ? styles.receiptFormatTabActive : ''}`}
                  onClick={() => setReceiptPrintFormat('a4')}
                >
                  📄 A4 Blank (PDF)
                </button>
              </div>
            </div>

            <div className={styles.receiptPaperScrollArea}>
              {receiptPrintFormat === 'thermal' ? (
                /* Authentic 80mm Thermal Receipt Paper */
                <div className={styles.receiptThermalPaper}>
                  {/* Clinic Header */}
                  <div className={styles.paperHeader}>
                    <div className={styles.paperClinicTitle}>DentUz Dental Clinic</div>
                    <div className={styles.paperClinicSub} style={{ fontWeight: 'bold' }}>MCHJ "DENTUZ MED SERVIS"</div>
                    <div className={styles.paperClinicSub}>STIR (INN): 308 124 591 &bull; Litsenziya: MED-UZ-2021-9988</div>
                    <div className={styles.paperClinicSub}>Toshkent sh., Bunyodkor shoh k. 42 &bull; Tel: +998 71 200 44 22</div>
                  </div>

                  <div className={styles.paperDividerSolid} />

                  {/* Receipt Identification */}
                  <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}>
                    *** FISKAL TO'LOV CHEKI ***
                  </div>
                  <div className={styles.paperRow}>
                    <span className={styles.paperRowLabel}>Chek №:</span>
                    <span className={styles.paperRowVal}>{activeReceipt.id}</span>
                  </div>
                  <div className={styles.paperRow}>
                    <span className={styles.paperRowLabel}>Sana va vaqt:</span>
                    <span className={styles.paperRowVal}>{activeReceipt.date}</span>
                  </div>
                  <div className={styles.paperRow}>
                    <span className={styles.paperRowLabel}>Kassir:</span>
                    <span className={styles.paperRowVal}>{activeReceipt.cashier || 'Nigora R. (Kassir-1)'}</span>
                  </div>
                  <div className={styles.paperRow}>
                    <span className={styles.paperRowLabel}>POS Terminal:</span>
                    <span className={styles.paperRowVal}>{activeReceipt.terminalId || 'T-88401'}</span>
                  </div>

                  <div className={styles.paperDividerDashed} />

                  {/* Patient and Doctor */}
                  <div className={styles.paperRow}>
                    <span className={styles.paperRowLabel}>Bemor:</span>
                    <span className={styles.paperRowVal}>{activeReceipt.patient}</span>
                  </div>
                  <div className={styles.paperRow}>
                    <span className={styles.paperRowLabel}>Karta ID:</span>
                    <span className={styles.paperRowVal}>#{activeReceipt.patientId}</span>
                  </div>
                  <div className={styles.paperRow}>
                    <span className={styles.paperRowLabel}>Shifokor:</span>
                    <span className={styles.paperRowVal}>{activeReceipt.doctor}</span>
                  </div>

                  <div className={styles.paperDividerDashed} />

                  {/* Items */}
                  <div className={styles.paperTableHeader}>
                    <span>Xizmat / Muolaja</span>
                    <span>Summa</span>
                  </div>
                  <div className={styles.paperTableItem}>
                    <span>1. {activeReceipt.procedure}</span>
                    <span>{formatUZS(activeReceipt.amount)}</span>
                  </div>
                  <div className={styles.paperRow} style={{ fontSize: '9px', color: '#6B7280', marginTop: '2px' }}>
                    <span>MXIK: 08621001001000000 (Stomatologiya)</span>
                    <span>1 x {formatUZS(activeReceipt.amount)}</span>
                  </div>

                  {/* Total Box */}
                  <div className={styles.paperTotalBox}>
                    <div className={styles.paperRow} style={{ alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>JAMI TO'LOV:</span>
                      <span className={styles.paperTotalAmount}>{formatUZS(activeReceipt.amount)}</span>
                    </div>
                    <div className={styles.paperRow} style={{ marginTop: '3px' }}>
                      <span className={styles.paperRowLabel}>To'lov turi:</span>
                      <span className={styles.paperRowVal} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {getPaymentLogo(activeReceipt.method, 14)}
                        <span>{activeReceipt.method}</span>
                      </span>
                    </div>
                    <div className={styles.paperRow} style={{ fontSize: '9px' }}>
                      <span className={styles.paperRowLabel}>QQS (0% imtiyoz):</span>
                      <span>0 UZS</span>
                    </div>
                  </div>

                  {/* Soliq verification */}
                  <div className={styles.paperFiscalBadge}>
                    SOLIQ VA FISKAL TIZIMDA QAYD ETILDI
                  </div>
                  <div className={styles.paperRow} style={{ fontSize: '9px' }}>
                    <span className={styles.paperRowLabel}>ФМ (Modul №):</span>
                    <span className={styles.paperRowVal}>{activeReceipt.fmNumber || '001928374'}</span>
                  </div>
                  <div className={styles.paperRow} style={{ fontSize: '9px' }}>
                    <span className={styles.paperRowLabel}>ФП (Fiskal belgi):</span>
                    <span className={styles.paperRowVal}>{activeReceipt.fiscalNumber || '482910481239'}</span>
                  </div>



                  {/* Barcode */}
                  <div className={styles.paperBarcodeBox}>
                    <ReceiptBarcode code={activeReceipt.id} width={180} height={32} />
                  </div>

                  <div className={styles.paperDividerDouble} />

                  <div className={styles.paperFooterNote}>
                    Tashrifingiz va ishonchingiz uchun rahmat!<br />
                    Sizga sog'lom va chiroyli tabassum tilaymiz.<br />
                    <strong>DentUz Dental OS</strong>
                  </div>
                </div>
              ) : (
                /* Official A4 Medical Invoice Slip */
                <div className={styles.receiptA4Paper}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0891B2', paddingBottom: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#0891B2' }}>🏥 DentUz Stomatologiya</div>
                      <div style={{ fontSize: '9px', color: '#64748B' }}>MCHJ "DENTUZ MED SERVIS"</div>
                      <div style={{ fontSize: '9px', color: '#64748B' }}>STIR: 308 124 591 &bull; Litsenziya: MED-UZ-2021-9988</div>
                      <div style={{ fontSize: '9px', color: '#64748B' }}>Tel: +998 71 200 44 22</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#0F172A' }}>TO'LOV KVITANSIYASI</div>
                      <div style={{ fontSize: '10px', color: '#0891B2', fontWeight: 'bold' }}>#{activeReceipt.id}</div>
                      <div style={{ fontSize: '8.5px', color: '#64748B', marginTop: '2px' }}>{activeReceipt.date}</div>
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px', marginBottom: '12px', fontSize: '9.5px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <div style={{ color: '#64748B' }}>Bemor F.I.Sh.:</div>
                        <div style={{ fontWeight: '700', color: '#0F172A' }}>{activeReceipt.patient}</div>
                        <div style={{ color: '#64748B', marginTop: '4px' }}>Tibbiy karta ID: #{activeReceipt.patientId}</div>
                      </div>
                      <div>
                        <div style={{ color: '#64748B' }}>Davolovchi shifokor:</div>
                        <div style={{ fontWeight: '700', color: '#0F172A' }}>{activeReceipt.doctor}</div>
                        <div style={{ color: '#64748B', marginTop: '4px' }}>To'lov usuli: {activeReceipt.method}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px' }}>
                      <thead>
                        <tr style={{ background: '#0891B2', color: '#FFFFFF', textAlign: 'left' }}>
                          <th style={{ padding: '6px 8px' }}>Muolaja nomi</th>
                          <th style={{ padding: '6px 8px' }}>MXIK kodi</th>
                          <th style={{ padding: '6px 8px', textAlign: 'right' }}>Summa</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>
                            <strong>{activeReceipt.procedure}</strong>
                          </td>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0', fontFamily: 'monospace' }}>08621001001000000</td>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0', textAlign: 'right', fontWeight: 'bold' }}>{formatUZS(activeReceipt.amount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F0FDFA', border: '1px dashed #0891B2', borderRadius: '6px', padding: '10px 14px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#0891B2' }}>
                        verified
                      </span>
                      <div style={{ fontSize: '9px', color: '#0F766E' }}>
                        <strong>SOLIQ QO'MITASIDA RO'YXATDAN O'TGAN</strong>
                        <div>ФМ: {activeReceipt.fmNumber || '001928374'} &bull; ФП: {activeReceipt.fiscalNumber || '482910481239'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '8.5px', color: '#64748B' }}>Jami to'langan summa:</div>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: '#0891B2' }}>{formatUZS(activeReceipt.amount)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '8.5px', color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                    <div>
                      <div>Kassir / Hisobchi:</div>
                      <div style={{ marginTop: '10px' }}>Imzo: _______________ (M.O'.)</div>
                    </div>
                    <div>
                      <div>Bemor (To'lovchi):</div>
                      <div style={{ marginTop: '10px' }}>Imzo: _______________</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.receiptActions}>
              <button
                type="button"
                className={styles.receiptPrintMainBtn}
                onClick={handleDirectPrintReceipt}
                title="Chekni toza va professional tarzda chop etish yoki PDF sifatida saqlash"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                  print
                </span>
                <span>
                  {receiptPrintFormat === 'thermal' ? "Termo chekni chop etish (80mm)" : "A4 Kvitansiyani chop etish (PDF)"}
                </span>
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

      {/* Hidden container specifically for clean native window.print() if triggered */}
      {activeReceipt && (
        <div id="dentuz-print-receipt" className={styles.printOnlySheet}>
          {receiptPrintFormat === 'thermal' ? (
            <div style={{ width: '76mm', margin: '0 auto', fontFamily: 'monospace', fontSize: '11px', color: '#000', padding: '6mm 4mm' }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>DentUz Dental Clinic</div>
                <div style={{ fontSize: '9px' }}>MCHJ "DENTUZ MED SERVIS" &bull; STIR: 308 124 591</div>
                <div style={{ fontSize: '9px' }}>Litsenziya: MED-UZ-2021-9988 &bull; Tel: +998 71 200 44 22</div>
              </div>
              <div style={{ borderTop: '1px solid #000', margin: '6px 0' }} />
              <div style={{ textAlign: 'center', fontWeight: 'bold' }}>*** FISKAL TO'LOV CHEKI ***</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Chek №:</span><strong>{activeReceipt.id}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Sana:</span><span>{activeReceipt.date}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bemor:</span><strong>{activeReceipt.patient} (#{activeReceipt.patientId})</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shifokor:</span><span>{activeReceipt.doctor}</span></div>
              <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>1. {activeReceipt.procedure}</span><strong>{formatUZS(activeReceipt.amount)}</strong></div>
              <div style={{ fontSize: '9px', color: '#555' }}>MXIK: 08621001001000000</div>
              <div style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '4px 0', margin: '6px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>JAMI:</span>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{formatUZS(activeReceipt.amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}><span>To'lov usuli:</span><strong>{activeReceipt.method}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}><span>QQS (0%):</span><span>0 UZS</span></div>
              <div style={{ border: '1px solid #000', textAlign: 'center', padding: '2px', margin: '6px 0', fontSize: '9px', fontWeight: 'bold' }}>
                SOLIQ QO'MITASIDA QAYD ETILDI
              </div>

              <div style={{ textAlign: 'center', margin: '4px 0' }}>
                <ReceiptBarcode code={activeReceipt.id} width={180} height={30} />
              </div>
              <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '6px' }}>
                Tashrifingiz uchun rahmat! Salomat bo'ling!<br />
                DentUz Dental OS
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: '700px', margin: '20px auto', fontFamily: 'sans-serif', fontSize: '11pt', color: '#000' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #0891b2', paddingBottom: '12px' }}>
                <div>
                  <h2 style={{ color: '#0891b2', margin: 0 }}>DentUz Dental Clinic</h2>
                  <div style={{ fontSize: '9pt', color: '#555' }}>MCHJ "DENTUZ MED SERVIS" &bull; STIR: 308 124 591 &bull; Litsenziya: MED-UZ-2021-9988</div>
                  <div style={{ fontSize: '9pt', color: '#555' }}>Toshkent sh., Bunyodkor shoh ko'chasi 42 &bull; Tel: +998 (71) 200-44-22</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ margin: 0 }}>TO'LOV KVITANSIYASI</h3>
                  <div style={{ fontWeight: 'bold', color: '#0891b2' }}>#{activeReceipt.id}</div>
                  <div style={{ fontSize: '9pt', color: '#555' }}>{activeReceipt.date}</div>
                </div>
              </div>
              <div style={{ margin: '18px 0', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><strong>Bemor:</strong> {activeReceipt.patient} (ID: #{activeReceipt.patientId})</div>
                  <div><strong>Davolovchi shifokor:</strong> {activeReceipt.doctor}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <div><strong>To'lov usuli:</strong> {activeReceipt.method}</div>
                  <div><strong>Holati:</strong> To'langan (Fiskal tasdiqlangan)</div>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '18px 0' }}>
                <thead>
                  <tr style={{ background: '#0891b2', color: '#fff' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Xizmat / Muolaja nomi</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>MXIK Kodi</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Summa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{activeReceipt.procedure}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', fontFamily: 'monospace' }}>08621001001000000</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 'bold' }}>{formatUZS(activeReceipt.amount)}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '2px solid #000', paddingTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '20px', color: '#0891b2', fontWeight: 'bold' }}>✓</div>
                  <div style={{ fontSize: '8.5pt', color: '#444' }}>
                    <strong>SOLIQ QO'MITASI FISKAL TIZIMIDA QAYD ETILGAN</strong><br />
                    ФМ: {activeReceipt.fmNumber || '001928374'} &bull; ФП: {activeReceipt.fiscalNumber || '482910481239'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10pt', color: '#555' }}>JAMI TO'LOV:</div>
                  <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#0891b2' }}>{formatUZS(activeReceipt.amount)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '10px', borderTop: '1px solid #999', fontSize: '9pt' }}>
                <div>Kassir imzosi: _____________________ (M.O'.)</div>
                <div>Bemor imzosi: _____________________</div>
              </div>
            </div>
          )}
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
