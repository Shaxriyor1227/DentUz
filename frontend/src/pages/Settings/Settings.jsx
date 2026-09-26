import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { teamApi } from '../../api/teamApi';
import { servicesApi } from '../../api/servicesApi';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import Toast from '../../components/Toast/Toast';
import { usePageMeta } from '../../hooks/usePageMeta';
import styles from './Settings.module.css';

const MOCK_SERVICES = [

  { id: 1, category: 'Diagnostika', name: 'Dastlabki konsultatsiya', duration: 30, price: 50000 },
  { id: 2, category: 'Diagnostika', name: 'Panoramik rentgen', duration: 15, price: 120000 },
  { id: 3, category: 'Davolash', name: 'Karies davolash (1 sirt)', duration: 60, price: 250000 },
  { id: 4, category: 'Davolash', name: 'Karies davolash (2 sirt)', duration: 90, price: 380000 },
  { id: 5, category: 'Jarrohlik', name: 'Tish chiqarish (oddiy)', duration: 30, price: 180000 },
  { id: 6, category: 'Jarrohlik', name: 'Murakkab chiqarish', duration: 60, price: 350000 },
  { id: 7, category: 'Estetika', name: 'Professional tozalash (Air-Flow)', duration: 60, price: 300000 },
  { id: 8, category: 'Estetika', name: 'Oqartirish (Zoom)', duration: 120, price: 1800000 },
  { id: 9, category: 'Protezlash', name: 'Metall-keramika toj', duration: 45, price: 1200000 },
  { id: 10, category: 'Protezlash', name: 'Zirkoniy toj', duration: 45, price: 2500000 },
];

const MOCK_SMS_TEMPLATES = [
  {
    id: 1,
    name: 'Qabul eslatmasi',
    trigger: 'Qabuldan 24 soat oldin',
    text: 'Hurmatli {bemor_ismi}, ertaga soat {vaqt} da {klinika_nomi} klinikasida qabulingiz bor. Batafsil: {telefon}',
    active: true,
  },
  {
    id: 2,
    name: 'Qabulni tasdiqlash',
    trigger: 'Qabul yaratilganda',
    text: 'Hurmatli {bemor_ismi}, {sana} sanasida soat {vaqt} da qabulingiz muvaffaqiyatli ro\'yxatdan o\'tkazildi.',
    active: true,
  },
  {
    id: 3,
    name: 'To\'lov tasdiqnomasi',
    trigger: 'To\'lov qabul qilinganda',
    text: 'To\'lov qabul qilindi: {summa} so\'m. Qolgan qarz: {qoldiq} so\'m. Rahmat, {klinika_nomi}.',
    active: false,
  },
  {
    id: 4,
    name: 'Tug\'ilgan kun tabriki',
    trigger: 'Tug\'ilgan kunda',
    text: 'Hurmatli {bemor_ismi}, tug\'ilgan kuningiz muborak bo\'lsin! 🎂 Sog\'lik va baxt tilaymiz. — {klinika_nomi}',
    active: true,
  },
];

const DEFAULT_PERMISSIONS = {
  owner: {
    viewPatients: true,
    editPatients: true,
    manageCalendar: true,
    viewFinance: true,
    editFinance: true,
    viewReports: true,
    manageStaff: true,
    manageSettings: true,
  },
  doctor: {
    viewPatients: true,
    editPatients: true,
    manageCalendar: true,
    viewFinance: false,
    editFinance: false,
    viewReports: true,
    manageStaff: false,
    manageSettings: false,
  },
  receptionist: {
    viewPatients: true,
    editPatients: false,
    manageCalendar: true,
    viewFinance: true,
    editFinance: true,
    viewReports: false,
    manageStaff: false,
    manageSettings: false,
  },
  nurse: {
    viewPatients: true,
    editPatients: false,
    manageCalendar: false,
    viewFinance: false,
    editFinance: false,
    viewReports: false,
    manageStaff: false,
    manageSettings: false,
  },
};

DEFAULT_PERMISSIONS['Egasi'] = DEFAULT_PERMISSIONS['owner'];
DEFAULT_PERMISSIONS['admin'] = DEFAULT_PERMISSIONS['receptionist'];
DEFAULT_PERMISSIONS['Shifokor'] = DEFAULT_PERMISSIONS['doctor'];
DEFAULT_PERMISSIONS['Administrator'] = DEFAULT_PERMISSIONS['receptionist'];
DEFAULT_PERMISSIONS['Hamshira'] = DEFAULT_PERMISSIONS['nurse'];
DEFAULT_PERMISSIONS['Assistent'] = DEFAULT_PERMISSIONS['nurse'];

const resolveMemberPermissions = (member) => {
  if (!member) return {};
  if (member.permissions) return { ...member.permissions };
  const r = (member.roleType || member.role || '').toLowerCase();
  if (r.includes('owner') || r.includes('ega')) return { ...DEFAULT_PERMISSIONS.owner };
  if (r.includes('doc') || r.includes('shifokor')) return { ...DEFAULT_PERMISSIONS.doctor };
  if (r.includes('admin') || r.includes('recept')) return { ...DEFAULT_PERMISSIONS.receptionist };
  if (r.includes('nurse') || r.includes('hamshira') || r.includes('assistent')) return { ...DEFAULT_PERMISSIONS.nurse };
  return { ...(DEFAULT_PERMISSIONS[member.role] || DEFAULT_PERMISSIONS[member.roleType] || DEFAULT_PERMISSIONS.doctor) };
};

const PERM_DEFINITIONS = [
  {
    key: 'viewPatients',
    icon: 'folder_shared',
    labelUz: "Bemorlar kartasi va ambulatoriya",
    labelEn: 'Patient Health Records',
    descUz: "Elektron bemorlar bazasi, anamnez va tashriflar tarixini ko'rish",
    descEn: 'Access electronic patient directory, history, and medical records',
  },
  {
    key: 'editPatients',
    icon: 'dentistry',
    labelUz: 'FDI Odontogramma & Davolash rejasi',
    labelEn: '3D Odontogram & Clinical Plan',
    descUz: "32-tish anatomik xaritasi, tashxislar qo'yish va rejani tahrirlash",
    descEn: 'Perform diagnoses, edit 32-tooth chart, and adjust treatment plan',
  },
  {
    key: 'manageCalendar',
    icon: 'calendar_today',
    labelUz: 'Taqvim va qabullarni belgilash',
    labelEn: 'Calendar & Operatory Scheduling',
    descUz: "Bemorlarni qabulga yozish, vaqt va kreslolarni band qilish",
    descEn: 'Book appointments, assign operatory chairs, and manage time slots',
  },
  {
    key: 'viewFinance',
    icon: 'payments',
    labelUz: 'Kassa tushumi va moliyaviy hisobotlar',
    labelEn: 'Practice Inflow & Ledgers',
    descUz: "Klinikaning umumiy daromadi, tushumlar va qoldiq qarzlar",
    descEn: 'View overall clinic revenue, daily inflow, and receivables',
  },
  {
    key: 'editFinance',
    icon: 'receipt_long',
    labelUz: "To'lov qabul qilish va chek chiqarish",
    labelEn: 'Billing & Payment Processing',
    descUz: "Bemorlardan naqd va karta to'lovlarini qabul qilish, kvitansiya",
    descEn: 'Collect payments, generate receipts, and manage billing',
  },
  {
    key: 'viewReports',
    icon: 'analytics',
    labelUz: 'Klinik analitika va rentgen arxivi',
    labelEn: 'Clinical Analytics & Radiographs',
    descUz: "Muolajalar statistikasi va rentgen (CBCT) arxivi",
    descEn: 'View clinical performance metrics, X-rays, and treatment stats',
  },
  {
    key: 'manageStaff',
    icon: 'badge',
    labelUz: 'Xodimlar va jamoa huquqlari',
    labelEn: 'Staff & Team Access Control',
    descUz: "Yangi shifokorlarni taklif qilish va tizim huquqlarini o'zgartirish",
    descEn: 'Add staff members and configure access permissions',
  },
  {
    key: 'manageSettings',
    icon: 'tune',
    labelUz: 'Klinika va operatsion kreslolar',
    labelEn: 'Clinic Settings & Chairs',
    descUz: "Operatsion kreslolar sonini boshqarish, ish vaqti va rekvizitlar",
    descEn: 'Configure practice operatories count, working hours, and clinic setup',
  },
];

const SERVICE_CATEGORIES = ['Diagnostika', 'Davolash', 'Jarrohlik', 'Estetika', 'Protezlash'];

function formatPrice(n) {
  return n.toLocaleString('uz-UZ') + ' so\'m';
}

export default function Settings() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  usePageMeta(
    isEn ? 'Practice Settings' : 'Klinika Sozlamalari',
    'DentUz klinika sozlamalari: jamoa huquqlari, operatsion kreslolar soni, xizmatlar va xavfsizlik.'
  );

  // Core state
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clinic');
  const [toast, setToast] = useState({ open: false, type: 'success', title: '', message: '' });

  // Team
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(null); // member obj
  const [showDeleteModal, setShowDeleteModal] = useState(null); // member obj to delete
  const [newMember, setNewMember] = useState({ name: '', title: '', role: 'Shifokor', email: '', phone: '+998 ', branch: 'Markaziy Klinika' });

  // Clinic
  const [clinicData, setClinicData] = useState(() => {
    const savedChairs = localStorage.getItem('dentuz_clinic_chairs');
    const savedName = localStorage.getItem('dentuz_clinic_name');
    return {
      name: savedName || (isEn ? 'DentUz Central Clinic' : 'DentUz Markaziy Klinika'),
      license: 'MED-UZ-2021-9988',
      director: 'Dr. Jasur Azimov',
      phone: '+998 71 200 44 22',
      extraPhone: '+998 90 842 11 00',
      email: 'info@dentuz.uz',
      address: isEn ? 'Bunyodkor Ave 42, Chilanzar district, Tashkent' : "Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko'chasi 42-uy",
      workingHours: isEn ? 'Monday - Saturday: 08:30 - 20:00' : 'Dushanba - Shanba: 08:30 - 20:00',
      inn: '307 456 789',
      mfo: '00873',
      bankAccount: '20208000205174219001',
      bankName: 'Xalq Banki',
      chairsCount: savedChairs ? Number(savedChairs) : 7,
    };
  });
  const [clinicSaved, setClinicSaved] = useState(false);

  // Services
  const [services, setServices] = useState(MOCK_SERVICES);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCat, setServiceCat] = useState('Barchasi');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(null);
  const [editService, setEditService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ category: 'Davolash', name: '', duration: 30, price: '' });

  // SMS
  const [smsTemplates, setSmsTemplates] = useState(MOCK_SMS_TEMPLATES);
  const [editTemplate, setEditTemplate] = useState(null);

  // Security
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [twoFactor, setTwoFactor] = useState(true);
  const [passSuccess, setPassSuccess] = useState(false);

  // Backup
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [lastBackup] = useState('2025-09-18 03:00 AM');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [teamData, servicesData] = await Promise.all([
          teamApi.getTeam(),
          servicesApi.getAll().catch(() => null)
        ]);
        if (teamData) setTeam(teamData);
        if (servicesData && servicesData.length > 0) setServices(servicesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const showToast = (type, title, message) => setToast({ open: true, type, title, message });

  const [memberPerms, setMemberPerms] = useState({});

  const handleOpenPermModal = (member) => {
    setShowPermModal(member);
    setMemberPerms(resolveMemberPermissions(member));
  };

  const handleTogglePerm = (key) => {
    setMemberPerms(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleResetPerms = () => {
    if (!showPermModal) return;
    const def = resolveMemberPermissions({ ...showPermModal, permissions: null });
    setMemberPerms(def);
    showToast(
      'info',
      isEn ? 'Reset to Defaults' : 'Standartga qaytarildi',
      isEn ? 'Permissions reset to role default values.' : 'Huquqlar standart rol holatiga qaytarildi.'
    );
  };

  const handleSavePerms = () => {
    if (!showPermModal) return;
    setTeam(prev => prev.map(m => m.id === showPermModal.id ? { ...m, permissions: memberPerms } : m));
    showToast(
      'success',
      isEn ? 'Permissions Saved' : 'Huquqlar saqlandi',
      isEn
        ? `Permissions updated for ${showPermModal.name}`
        : `${showPermModal.name} uchun tizim huquqlari muvaffaqiyatli saqlandi.`
    );
    setShowPermModal(null);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.name) return;
    const added = await teamApi.addMember(newMember);
    setTeam((prev) => [...prev, added]);
    setShowAddModal(false);
    setNewMember({ name: '', title: '', role: 'Shifokor', email: '', phone: '+998 ', branch: 'Markaziy Klinika' });
    showToast('success', isEn ? 'Member Added' : 'Xodim qo\'shildi', isEn ? `${newMember.name} joined the practice team.` : `${newMember.name} jamoaga muvaffaqiyatli qo'shildi.`);
  };

  const handleSaveClinic = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('dentuz_clinic_chairs', clinicData.chairsCount);
      localStorage.setItem('dentuz_clinic_name', clinicData.name);
    } catch {}
    setClinicSaved(true);
    showToast(
      'success',
      isEn ? 'Settings Saved' : 'Saqlandi',
      isEn
        ? `Practice details and ${clinicData.chairsCount} operatory chairs updated successfully.`
        : `Klinika ma'lumotlari va ${clinicData.chairsCount} ta operatsion kreslo muvaffaqiyatli saqlandi.`
    );
    setTimeout(() => setClinicSaved(false), 3000);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      showToast('error', isEn ? 'Error' : 'Xatolik', isEn ? 'New passwords do not match!' : 'Yangi parollar mos kelmadi!');
      return;
    }
    setPassSuccess(true);
    setPasswords({ current: '', newPass: '', confirm: '' });
    showToast('success', isEn ? 'Password Updated' : 'Parol o\'zgartirildi', isEn ? 'Password has been updated securely.' : 'Yangi parol muvaffaqiyatli saqlandi.');
    setTimeout(() => setPassSuccess(false), 3000);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (editService) {
      const updated = { ...editService, ...serviceForm, price: Number(serviceForm.price) };
      setServices(prev => prev.map(s => s.id === editService.id ? updated : s));
      try {
        await servicesApi.update(editService.id, updated);
      } catch (err) {
        console.warn('Update service failed:', err);
      }
      showToast('success', isEn ? 'Updated' : 'Yangilandi', isEn ? `${serviceForm.name} service updated.` : `${serviceForm.name} xizmati yangilandi.`);
    } else {
      const newSvc = { ...serviceForm, price: Number(serviceForm.price) };
      try {
        const created = await servicesApi.create(newSvc);
        setServices(prev => [...prev, created || { id: `srv-${Date.now()}`, ...newSvc }]);
      } catch (err) {
        setServices(prev => [...prev, { id: `srv-${Date.now()}`, ...newSvc }]);
      }
      showToast('success', isEn ? 'Created' : 'Qo\'shildi', isEn ? `${serviceForm.name} service added to catalog.` : `${serviceForm.name} xizmati qo'shildi.`);
    }
    setShowServiceModal(false);
    setEditService(null);
    setServiceForm({ category: 'Davolash', name: '', duration: 30, price: '' });
  };

  const handleDeleteService = async (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
    try {
      await servicesApi.delete(id);
    } catch (err) {
      console.warn('Delete service failed:', err);
    }
    showToast('info', isEn ? 'Deleted' : 'O\'chirildi', isEn ? 'Service removed from price list.' : 'Xizmat ro\'yxatdan olib tashlandi.');
  };

  const handleToggleSms = (id) => {
    setSmsTemplates(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const handleBackup = () => {
    setBackupLoading(true);
    setTimeout(() => {
      setBackupLoading(false);
      showToast('success', isEn ? 'Backup Created' : 'Zaxira nusxa yaratildi', isEn ? 'Database backup exported securely.' : 'Ma\'lumotlar bazasi muvaffaqiyatli eksport qilindi.');
    }, 2000);
  };

  const filteredTeam = team.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.title.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  const filteredServices = services.filter((s) => {
    const matchCat = serviceCat === 'Barchasi' || s.category === serviceCat;
    const matchSearch = !serviceSearch.trim() || s.name.toLowerCase().includes(serviceSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const getRoleLabel = (role) => {
    if (role === 'owner') return isEn ? 'Chief Physician' : 'Bosh shifokor';
    if (role === 'doctor') return isEn ? 'Doctor' : 'Shifokor';
    if (role === 'receptionist') return isEn ? 'Administrator' : 'Administrator';
    if (role === 'nurse') return isEn ? 'Nurse' : 'Hamshira';
    return role;
  };

  const tabs = [
    { id: 'clinic',    icon: 'business',         label: isEn ? 'Practice Info' : 'Klinika' },
    { id: 'team',      icon: 'group',            label: isEn ? 'Staff & Roles' : 'Jamoa' },
    { id: 'services',  icon: 'medical_services', label: isEn ? 'Services & Pricing' : 'Xizmatlar' },
    { id: 'sms',       icon: 'sms',              label: isEn ? 'SMS Templates' : 'SMS Shablonlar' },
    { id: 'security',  icon: 'shield',           label: isEn ? 'Security & 2FA' : 'Xavfsizlik' },
    { id: 'backup',    icon: 'backup',           label: isEn ? 'Database Backup' : 'Backup' },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.headerMeta}>
            <span className={styles.sectionBadge}>{isEn ? 'PRACTICE OS' : 'Boshqaruv paneli'}</span>
            <span className={styles.dot}>•</span>
            <span className={styles.metaLabel}>{isEn ? 'Settings' : 'Sozlamalar'}</span>
          </div>
          <h1 className={styles.pageTitle}>{isEn ? 'Clinic Settings' : 'Klinika Sozlamalari'}</h1>
          <p className={styles.pageSubtitle}>
            {isEn
              ? 'Manage your dental practice profile, operatory chairs, staff access, services catalog, and security.'
              : 'Klinikangiz profili, kreslolar soni, xodimlar, xizmatlar va tizim sozlamalarini boshqaring.'}
          </p>
        </div>
      </div>

      <div className={styles.settingsLayout}>

        {/* Left sidebar nav */}
        <nav className={styles.sideNav}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={`material-symbols-outlined ${styles.navIcon}`}>{tab.icon}</span>
              <span className={styles.navLabel}>{tab.label}</span>
              {tab.id === 'team' && team.length > 0 && (
                <span className={styles.navBadge}>{team.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Main content area */}
        <div className={styles.mainContent}>

          {/* ══════════════════════════════════════════
              TAB: KLINIKA MA'LUMOTLARI (PRACTICE INFO)
          ══════════════════════════════════════════ */}
          {activeTab === 'clinic' && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <div>
                  <h2 className={styles.tabTitle}>{isEn ? 'Practice Profile & Credentials' : 'Klinika Ma\'lumotlari'}</h2>
                  <p className={styles.tabSub}>{isEn ? 'Official clinic credentials, dental operatories, and working hours' : 'Rasmiy rekvizitlar, operatsion kreslolar va ish vaqtini sozlang'}</p>
                </div>
              </div>

              <form onSubmit={handleSaveClinic} className={styles.formStack}>
                {/* Basic info */}
                <div className={styles.card}>
                  <div className={styles.cardSectionTitle}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
                    {isEn ? 'General Clinic Details' : 'Asosiy ma\'lumotlar'}
                  </div>
                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{isEn ? 'Clinic Name' : 'Klinika nomi'}</label>
                      <input className={styles.input} value={clinicData.name} onChange={e => setClinicData({ ...clinicData, name: e.target.value })} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{isEn ? 'Medical License Number' : 'Litsenziya raqami'}</label>
                      <input className={styles.input} value={clinicData.license} onChange={e => setClinicData({ ...clinicData, license: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{isEn ? 'Medical Director (F.I.O)' : 'Rahbar F.I.O'}</label>
                      <input className={styles.input} value={clinicData.director} onChange={e => setClinicData({ ...clinicData, director: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{isEn ? 'Working Hours' : 'Ish vaqti'}</label>
                      <input className={styles.input} value={clinicData.workingHours} onChange={e => setClinicData({ ...clinicData, workingHours: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{isEn ? 'Primary Phone' : 'Asosiy telefon'}</label>
                      <input className={styles.input} value={clinicData.phone} onChange={e => setClinicData({ ...clinicData, phone: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{isEn ? 'Secondary Phone' : 'Qo\'shimcha telefon'}</label>
                      <input className={styles.input} value={clinicData.extraPhone} onChange={e => setClinicData({ ...clinicData, extraPhone: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{isEn ? 'Official Email' : 'Email'}</label>
                      <input className={styles.input} type="email" value={clinicData.email} onChange={e => setClinicData({ ...clinicData, email: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        {isEn ? 'Dental Operatories (Chairs)' : 'Stomatologik kreslolar soni'}
                        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-cyan)', marginLeft: 6 }}>
                          ({isEn ? 'Controls Dashboard' : 'Dashboard uchun'})
                        </span>
                      </label>
                      <input
                        className={styles.input}
                        type="number"
                        min="1"
                        max="16"
                        value={clinicData.chairsCount}
                        onChange={e => setClinicData({ ...clinicData, chairsCount: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup} style={{ marginTop: 4 }}>
                    <label className={styles.formLabel}>{isEn ? 'Physical Address' : 'Manzil'}</label>
                    <input className={styles.input} value={clinicData.address} onChange={e => setClinicData({ ...clinicData, address: e.target.value })} />
                  </div>
                </div>

                {/* Bank rekvizitlar */}
                <div className={styles.card}>
                  <div className={styles.cardSectionTitle}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>account_balance</span>
                    {isEn ? 'Banking & Billing Credentials' : 'Bank rekvizitlari'}
                  </div>
                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{isEn ? 'Tax ID (INN)' : 'INN'}</label>
                      <input className={styles.input} value={clinicData.inn} onChange={e => setClinicData({ ...clinicData, inn: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{isEn ? 'Bank Code (MFO)' : 'MFO'}</label>
                      <input className={styles.input} value={clinicData.mfo} onChange={e => setClinicData({ ...clinicData, mfo: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{isEn ? 'Settlement Account' : 'Hisob raqami'}</label>
                      <input className={styles.input} value={clinicData.bankAccount} onChange={e => setClinicData({ ...clinicData, bankAccount: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{isEn ? 'Bank Name' : 'Bank nomi'}</label>
                      <input className={styles.input} value={clinicData.bankName} onChange={e => setClinicData({ ...clinicData, bankName: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className={styles.formActions}>
                  {clinicSaved && <span className={styles.successLabel}>✓ {isEn ? 'Saved successfully' : 'Muvaffaqiyatli saqlandi'}</span>}
                  <button type="submit" className={styles.btnPrimary}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                    {isEn ? 'Save Changes' : 'Saqlash'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: JAMOA VA HUQUQLAR (STAFF & ROLES)
          ══════════════════════════════════════════ */}
          {activeTab === 'team' && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <div>
                  <h2 className={styles.tabTitle}>{isEn ? 'Team & Role Permissions' : 'Jamoa va Huquqlar'}</h2>
                  <p className={styles.tabSub}>{isEn ? 'Add medical team members and configure role-based access' : 'Xodimlarni qo\'shing va ularning tizim huquqlarini sozlang'}</p>
                </div>
                <button type="button" className={styles.btnPrimary} onClick={() => setShowAddModal(true)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                  {isEn ? '+ Add Team Member' : 'Xodim qo\'shish'}
                </button>
              </div>

              {/* Filter strip */}
              <div className={styles.filterStrip}>
                <div className={styles.searchBox}>
                  <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder={isEn ? "Search staff by name, title, or email..." : "Xodim qidirish..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className={styles.metaChips}>
                  <div className={styles.chip}>
                    <span className={styles.dotGreen} />
                    <span>{isEn ? 'Active' : 'Faol'}</span>
                    <strong>{team.filter(m => m.status === 'online').length}</strong>
                  </div>
                  <div className={styles.chip}>
                    <span>{isEn ? 'Total Staff' : 'Jami xodim'}</span>
                    <strong>{team.length} / 10</strong>
                  </div>
                </div>
              </div>

              {/* Staff list */}
              <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                  <div style={{ padding: 24 }}><SkeletonLoader type="table" count={5} /></div>
                ) : filteredTeam.length === 0 ? (
                  <div className={styles.emptyState}>
                    <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-outline)' }}>group_off</span>
                    <p>{isEn ? 'No staff members found' : 'Xodim topilmadi'}</p>
                  </div>
                ) : (
                  <table className={styles.staffTable}>
                    <thead>
                      <tr>
                        <th>{isEn ? 'MEMBER' : 'XODIM'}</th>
                        <th>{isEn ? 'ROLE' : 'ROL'}</th>
                        <th>{isEn ? 'CONTACT' : 'KONTAKT'}</th>
                        <th>{isEn ? 'BRANCH' : 'FILIAL'}</th>
                        <th>{isEn ? 'STATUS' : 'HOLAT'}</th>
                        <th>{isEn ? 'ACTIONS' : 'AMALLAR'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeam.map((member) => (
                        <tr key={member.id}>
                          <td>
                            <div className={styles.memberCell}>
                              <div className={styles.avatar} style={{ overflow: 'hidden', padding: 0 }}>
                                {member.avatar ? (
                                  <img
                                    src={member.avatar}
                                    alt={member.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  member.initials
                                )}
                              </div>
                              <div>
                                <div className={styles.memberName}>{member.name}</div>
                                <div className={styles.memberTitle}>{member.title}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={styles.roleTag}>{getRoleLabel(member.role)}</span>
                          </td>
                          <td>
                            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                              <div>{member.email}</div>
                              <div style={{ color: 'var(--color-text-secondary)' }}>{member.phone}</div>
                            </div>
                          </td>
                          <td style={{ fontSize: 12 }}>
                            {member.branch === 'Markaziy Klinika'
                              ? (isEn ? 'Central Clinic' : 'Markaziy Klinika')
                              : member.branch}
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${member.status === 'online' ? styles.statusOnline : styles.statusOffline}`}>
                              {member.status === 'online' ? (isEn ? 'Active' : 'Faol') : (isEn ? 'Offline' : 'Oflayn')}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actionBtns}>
                              <button
                                type="button"
                                className={styles.actionBtn}
                                title={isEn ? "Permissions" : "Huquqlar"}
                                onClick={() => handleOpenPermModal(member)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>manage_accounts</span>
                              </button>
                              <button
                                type="button"
                                className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                                title={isEn ? "Remove member" : "Jamoadan chiqarish"}
                                onClick={() => setShowDeleteModal(member)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_remove</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: XIZMATLAR VA NARXLAR
          ══════════════════════════════════════════ */}
          {activeTab === 'services' && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <div>
                  <h2 className={styles.tabTitle}>Xizmatlar va Prays-list</h2>
                  <p className={styles.tabSub}>Klinika xizmatlarini va ularning narxlarini boshqaring</p>
                </div>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => {
                    setEditService(null);
                    setServiceForm({ category: 'Davolash', name: '', duration: 30, price: '' });
                    setShowServiceModal(true);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                  Xizmat qo'shish
                </button>
              </div>

              {/* Category tabs + search */}
              <div className={styles.serviceFilterRow}>
                <div className={styles.catTabs}>
                  {['Barchasi', ...SERVICE_CATEGORIES].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className={`${styles.catTab} ${serviceCat === cat ? styles.catTabActive : ''}`}
                      onClick={() => setServiceCat(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className={styles.searchBox} style={{ maxWidth: 240 }}>
                  <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Xizmat qidirish..."
                    value={serviceSearch}
                    onChange={e => setServiceSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                <table className={styles.staffTable}>
                  <thead>
                    <tr>
                      <th>Xizmat nomi</th>
                      <th>Kategoriya</th>
                      <th>Davomiyligi</th>
                      <th>Narx</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map((svc) => (
                      <tr key={svc.id}>
                        <td style={{ fontWeight: 600 }}>{svc.name}</td>
                        <td><span className={styles.catBadge}>{svc.category}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{svc.duration} daq</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--color-cyan-hover)' }}>
                          {formatPrice(svc.price)}
                        </td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              type="button"
                              className={styles.actionBtn}
                              onClick={() => {
                                setEditService(svc);
                                setServiceForm({ category: svc.category, name: svc.name, duration: svc.duration, price: String(svc.price) });
                                setShowServiceModal(true);
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                            </button>
                            <button
                              type="button"
                              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                              title="Xizmatni o'chirish"
                              onClick={() => setShowDeleteServiceModal(svc)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredServices.length === 0 && (
                  <div className={styles.emptyState}>
                    <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-outline)' }}>search_off</span>
                    <p>Xizmat topilmadi</p>
                  </div>
                )}
              </div>

              {/* Price stats */}
              <div className={styles.statsRow}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{services.length}</div>
                  <div className={styles.statLabel}>Jami xizmatlar</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{formatPrice(Math.min(...services.map(s => s.price)))}</div>
                  <div className={styles.statLabel}>Eng arzon</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{formatPrice(Math.max(...services.map(s => s.price)))}</div>
                  <div className={styles.statLabel}>Eng qimmat</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{formatPrice(Math.round(services.reduce((a, s) => a + s.price, 0) / services.length))}</div>
                  <div className={styles.statLabel}>O'rtacha narx</div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: SMS SHABLONLAR
          ══════════════════════════════════════════ */}
          {activeTab === 'sms' && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <div>
                  <h2 className={styles.tabTitle}>SMS Shablonlar</h2>
                  <p className={styles.tabSub}>Avtomatik SMS xabarlar matnini sozlang</p>
                </div>
                <div className={styles.chip}>
                  <span className={styles.dotGreen} />
                  <span>Faol: {smsTemplates.filter(t => t.active).length} shablon</span>
                </div>
              </div>

              {/* Variable reference */}
              <div className={styles.infoBox}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>info</span>
                <div>
                  <strong>Mavjud o'zgaruvchilar:</strong>{' '}
                  <code>{'{bemor_ismi}'}</code>, <code>{'{vaqt}'}</code>, <code>{'{sana}'}</code>,{' '}
                  <code>{'{klinika_nomi}'}</code>, <code>{'{telefon}'}</code>, <code>{'{summa}'}</code>, <code>{'{qoldiq}'}</code>
                </div>
              </div>

              <div className={styles.smsGrid}>
                {smsTemplates.map((tmpl) => (
                  <div key={tmpl.id} className={`${styles.smsCard} ${!tmpl.active ? styles.smsCardInactive : ''}`}>
                    <div className={styles.smsCardHeader}>
                      <div>
                        <div className={styles.smsName}>{tmpl.name}</div>
                        <div className={styles.smsTrigger}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
                          {tmpl.trigger}
                        </div>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={tmpl.active}
                          onChange={() => handleToggleSms(tmpl.id)}
                        />
                        <span className={styles.toggleSlider} />
                      </label>
                    </div>
                    {editTemplate === tmpl.id ? (
                      <div>
                        <textarea
                          className={styles.smsTextarea}
                          value={tmpl.text}
                          rows={4}
                          onChange={(e) => setSmsTemplates(prev => prev.map(t => t.id === tmpl.id ? { ...t, text: e.target.value } : t))}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button type="button" className={styles.btnPrimary} style={{ fontSize: 12, height: 32, padding: '0 12px' }}
                            onClick={() => { setEditTemplate(null); showToast('success', 'Saqlandi', `${tmpl.name} yangilandi.`); }}>
                            Saqlash
                          </button>
                          <button type="button" className={styles.btnOutline} style={{ fontSize: 12, height: 32, padding: '0 12px' }}
                            onClick={() => setEditTemplate(null)}>
                            Bekor
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className={styles.smsText}>{tmpl.text}</div>
                        <button type="button" className={styles.smsMeta} onClick={() => setEditTemplate(tmpl.id)}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                          Matnni tahrirlash
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: XAVFSIZLIK
          ══════════════════════════════════════════ */}
          {activeTab === 'security' && (
            <div className={styles.tabContent}>
              <h2 className={styles.tabTitle}>Xavfsizlik</h2>
              <p className={styles.tabSub} style={{ marginBottom: 24 }}>Parol va ikki bosqichli tasdiqlashni sozlang</p>

              {/* Change password */}
              <div className={styles.card}>
                <div className={styles.cardSectionTitle}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
                  Parolni o'zgartirish
                </div>
                <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Joriy parol</label>
                    <input type="password" className={styles.input} placeholder="••••••••" value={passwords.current}
                      onChange={e => setPasswords({ ...passwords, current: e.target.value })} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Yangi parol</label>
                    <input type="password" className={styles.input} placeholder="Kamida 8 ta belgi" value={passwords.newPass}
                      onChange={e => setPasswords({ ...passwords, newPass: e.target.value })} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Yangi parolni takrorlang</label>
                    <input type="password" className={styles.input} placeholder="Parolni qayta kiriting" value={passwords.confirm}
                      onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} required />
                  </div>
                  <div className={styles.formActions}>
                    {passSuccess && <span className={styles.successLabel}>✓ Parol o'zgartirildi</span>}
                    <button type="submit" className={styles.btnPrimary}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                      Yangilash
                    </button>
                  </div>
                </form>
              </div>

              {/* 2FA */}
              <div className={styles.card}>
                <div className={styles.cardSectionTitle}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>phonelink_lock</span>
                  Ikki bosqichli tasdiqlash (2FA)
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleTitle}>SMS orqali tasdiqlash</div>
                    <div className={styles.toggleDesc}>Tizimga kirish uchun SMS kod talab qilinadi</div>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={twoFactor} onChange={e => {
                      setTwoFactor(e.target.checked);
                      showToast('info', '2FA', e.target.checked ? '2FA yoqildi' : '2FA o\'chirildi');
                    }} />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
              </div>

              {/* Active sessions */}
              <div className={styles.card}>
                <div className={styles.cardSectionTitle}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>devices</span>
                  Faol seanslar
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { device: 'Google Chrome • Windows 11', ip: '195.158.12.44', loc: 'Toshkent, O\'zbekiston', current: true },
                    { device: 'DentUz Mobile App • iPhone 15 Pro', ip: '195.158.12.44', loc: 'Kecha, 19:40 da', current: false },
                  ].map((sess, i) => (
                    <div key={i} className={styles.sessionRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--color-text-secondary)' }}>
                          {sess.current ? 'laptop' : 'phone_iphone'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{sess.device}</div>
                          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                            IP: {sess.ip} • {sess.loc}
                          </div>
                        </div>
                      </div>
                      {sess.current ? (
                        <span className={styles.statusBadge + ' ' + styles.statusOnline}>Joriy seans</span>
                      ) : (
                        <button type="button" className={styles.btnDanger}
                          onClick={() => showToast('success', 'Seans yakunlandi', `${sess.device} seansi to'xtatildi.`)}>
                          Yakunlash
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: BACKUP VA TIKLASH
          ══════════════════════════════════════════ */}
          {activeTab === 'backup' && (
            <div className={styles.tabContent}>
              <h2 className={styles.tabTitle}>Backup va Ma'lumotlarni Tiklash</h2>
              <p className={styles.tabSub} style={{ marginBottom: 24 }}>Ma'lumotlar bazasini eksport qiling yoki zaxira nusxadan tiklang</p>

              {/* Status card */}
              <div className={styles.backupStatusCard}>
                <div>
                  <div className={styles.cardSectionTitle} style={{ marginBottom: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-mint-text)' }}>check_circle</span>
                    Oxirgi backup holati
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{lastBackup}</span>
                    {' '} — Muvaffaqiyatli yakunlandi
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${styles.statusOnline}`}>Avto-backup: Yoqilgan</span>
              </div>

              <div className={styles.backupGrid}>
                {/* Export */}
                <div className={styles.card}>
                  <div className={styles.cardSectionTitle}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>cloud_download</span>
                    Ma'lumotlarni eksport qilish
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                    Bemorlar, qabullar, to'lovlar va barcha tizim ma'lumotlarini ZIP arxiv sifatida yuklab oling.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { icon: 'group', label: 'Bemorlar bazasi', sub: '1,240 ta bemor', size: '2.4 MB' },
                      { icon: 'event', label: 'Qabullar tarixi', sub: 'Barcha vaqt', size: '1.1 MB' },
                      { icon: 'payments', label: 'Moliyaviy hisob', sub: 'Barcha tranzaksiyalar', size: '0.8 MB' },
                      { icon: 'folder_zip', label: 'To\'liq arxiv (ZIP)', sub: 'Barcha modullar', size: '4.5 MB', highlight: true },
                    ].map((item, i) => (
                      <div key={i} className={`${styles.backupItem} ${item.highlight ? styles.backupItemHighlight : ''}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 20, color: item.highlight ? 'var(--color-cyan)' : 'var(--color-text-secondary)' }}>{item.icon}</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{item.sub} • {item.size}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={item.highlight ? styles.btnPrimary : styles.btnOutline}
                          style={{ fontSize: 12, height: 32, padding: '0 12px' }}
                          onClick={handleBackup}
                          disabled={backupLoading}
                        >
                          {backupLoading ? (
                            <span className="material-symbols-outlined" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>refresh</span>
                          ) : (
                            <>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
                              Yuklab olish
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restore */}
                <div className={styles.card}>
                  <div className={styles.cardSectionTitle}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>restore</span>
                    Zaxiradan tiklash
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                    Avval yuklab olingan backup faylidan ma'lumotlarni tiklang.
                  </p>

                  <div className={styles.dropZone}>
                    <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--color-outline)' }}>cloud_upload</span>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '8px 0 4px' }}>
                      Backup faylini bu yerga tashlang yoki tanlang
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--color-outline)' }}>.zip, .json formatda, max 50MB</p>
                    <button
                      type="button"
                      className={styles.btnOutline}
                      style={{ marginTop: 12 }}
                      onClick={() => {
                        setRestoreLoading(true);
                        setTimeout(() => {
                          setRestoreLoading(false);
                          showToast('success', 'Tiklandi', 'Ma\'lumotlar muvaffaqiyatli tiklandi.');
                        }, 2500);
                      }}
                      disabled={restoreLoading}
                    >
                      {restoreLoading ? 'Tiklanmoqda...' : 'Fayl tanlash'}
                    </button>
                  </div>

                  {/* Backup schedule */}
                  <div style={{ marginTop: 16, padding: '12px', borderRadius: 10, background: 'var(--color-surface-container-low)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Avtomarik backup jadvali</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'Kunlik backup', time: 'Har kuni 03:00', active: true },
                        { label: 'Haftalik arxiv', time: 'Dushanba 02:00', active: true },
                        { label: 'Cloud sinxronizatsiya', time: 'Har soatda', active: false },
                      ].map((sched, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{sched.label}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>{sched.time}</div>
                          </div>
                          <span className={`${styles.statusBadge} ${sched.active ? styles.statusOnline : styles.statusOffline}`}>
                            {sched.active ? 'Faol' : 'O\'chiq'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ══════════════════════════════════════════
          MODAL: Xodim qo'shish
      ══════════════════════════════════════════ */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Yangi xodim qo'shish</h3>
              <button type="button" className={styles.modalClose} onClick={() => setShowAddModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddMember} className={styles.modalForm}>
              <div className={styles.formGrid2}>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.formLabel}>To'liq ismi *</label>
                  <input required className={styles.input} placeholder="Sardor Ismoilov" value={newMember.name}
                    onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mutaxassislik</label>
                  <input className={styles.input} placeholder="Tish shifokori" value={newMember.title}
                    onChange={e => setNewMember({ ...newMember, title: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Rol</label>
                  <select className={styles.input} value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })}>
                    <option>Shifokor</option>
                    <option>Hamshira</option>
                    <option>Administrator</option>
                    <option>Assistent</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Telefon</label>
                  <input className={styles.input} value={newMember.phone}
                    onChange={e => setNewMember({ ...newMember, phone: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input type="email" className={styles.input} placeholder="staff@dentuz.uz" value={newMember.email}
                    onChange={e => setNewMember({ ...newMember, email: e.target.value })} />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnOutline} onClick={() => setShowAddModal(false)}>Bekor qilish</button>
                <button type="submit" className={styles.btnPrimary}>Qo'shish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: Xodimni o'chirishni tasdiqlash
      ══════════════════════════════════════════ */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(null)}>
          <div className={styles.modalBox} style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className={styles.deleteModalIcon}>
              <span className="material-symbols-outlined">person_remove</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 className={styles.modalTitle} style={{ marginBottom: 8 }}>
                Xodimni chiqarishni tasdiqlang
              </h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>{showDeleteModal.name}</strong> ({showDeleteModal.role})
                ni jamoadan chiqarishni xohlaysizmi?
                <br />
                Bu amalni qaytarib bo'lmaydi.
              </p>
            </div>
            <div className={styles.modalFooter} style={{ justifyContent: 'center', gap: 12 }}>
              <button
                type="button"
                className={styles.btnOutline}
                style={{ minWidth: 120 }}
                onClick={() => setShowDeleteModal(null)}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                className={styles.btnDeleteConfirm}
                style={{ minWidth: 120 }}
                onClick={() => {
                  setTeam(prev => prev.filter(m => m.id !== showDeleteModal.id));
                  showToast('info', "O'chirildi", `${showDeleteModal.name} jamoadan chiqarildi.`);
                  setShowDeleteModal(null);
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                Ha, chiqarish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: Huquqlar (Apple Minimalist Design)
      ══════════════════════════════════════════ */}
      {showPermModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPermModal(null)}>
          <div className={styles.modalBox} style={{ maxWidth: 460, padding: '20px 22px', gap: 14 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--color-surface-container-high)',
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 13,
                  border: '1px solid var(--color-border)',
                }}>
                  {showPermModal.initials || showPermModal.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className={styles.modalTitle} style={{ fontSize: 15, marginBottom: 1 }}>
                    {showPermModal.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--color-text-secondary)' }}>
                    <span>{showPermModal.title || showPermModal.role}</span>
                    <span>•</span>
                    <span style={{ 
                      textTransform: 'capitalize', 
                      background: 'var(--color-surface-container)', 
                      padding: '1px 6px', 
                      borderRadius: 6, 
                      fontWeight: 500,
                    }}>
                      {showPermModal.role}
                    </span>
                  </div>
                </div>
              </div>
              <button type="button" className={styles.modalClose} onClick={() => setShowPermModal(null)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            <div style={{
              background: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-border-subtle, rgba(0, 0, 0, 0.06))',
              borderRadius: 8,
              padding: '7px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12
            }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {isEn ? 'Permissions access:' : 'Tizim huquqlari:'}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--color-cyan, #0891b2)' }}>
                {Object.values(memberPerms).filter(Boolean).length} / {PERM_DEFINITIONS.length} {isEn ? 'active' : 'faol'}
              </span>
            </div>

            <div className={styles.permissionsGrid}>
              {PERM_DEFINITIONS.map((perm) => {
                const isAllowed = !!memberPerms[perm.key];
                return (
                  <div 
                    key={perm.key} 
                    className={styles.permRow}
                    onClick={() => handleTogglePerm(perm.key)}
                  >
                    <span className={`material-symbols-outlined ${styles.permIconBox}`}>
                      {perm.icon}
                    </span>
                    <div className={styles.permInfo}>
                      <div className={styles.permTitle}>
                        {isEn ? perm.labelEn : perm.labelUz}
                      </div>
                      <div className={styles.permDesc}>
                        {isEn ? perm.descEn : perm.descUz}
                      </div>
                    </div>
                    {/* Apple iOS Switch Toggle */}
                    <div 
                      className={`${styles.appleSwitch} ${isAllowed ? styles.appleSwitchActive : ''}`}
                      role="switch"
                      aria-checked={isAllowed}
                    >
                      <span className={styles.appleSwitchKnob} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.modalFooter} style={{ justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
              <button 
                type="button" 
                className={styles.btnOutline}
                style={{ fontSize: 11.5, padding: '6px 10px', border: 'none', background: 'transparent', color: 'var(--color-text-secondary)' }}
                onClick={handleResetPerms}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>restart_alt</span>
                {isEn ? 'Reset' : 'Standart'}
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  type="button" 
                  className={styles.btnOutline} 
                  style={{ fontSize: 12, padding: '6px 12px' }}
                  onClick={() => setShowPermModal(null)}
                >
                  {isEn ? 'Cancel' : 'Bekor qilish'}
                </button>
                <button 
                  type="button" 
                  className={styles.btnPrimary} 
                  style={{ fontSize: 12, padding: '6px 14px' }}
                  onClick={handleSavePerms}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>check</span>
                  {isEn ? 'Save' : 'Saqlash'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: Xizmatni o'chirishni tasdiqlash
      ══════════════════════════════════════════ */}
      {showDeleteServiceModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteServiceModal(null)}>
          <div className={styles.modalBox} style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className={styles.deleteModalIcon}>
              <span className="material-symbols-outlined">delete_forever</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 className={styles.modalTitle} style={{ marginBottom: 8 }}>
                Xizmatni o'chirishni tasdiqlang
              </h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>{showDeleteServiceModal.name}</strong> ({showDeleteServiceModal.category})
                xizmatini o'chirishni xohlaysizmi?
                <br />
                Bu amal xizmatlar ro'yxatidan va narxlar hisobotidan olib tashlaydi.
              </p>
            </div>
            <div className={styles.modalFooter} style={{ justifyContent: 'center', gap: 12 }}>
              <button
                type="button"
                className={styles.btnOutline}
                style={{ minWidth: 120 }}
                onClick={() => setShowDeleteServiceModal(null)}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                className={styles.btnDeleteConfirm}
                style={{ minWidth: 120 }}
                onClick={() => {
                  setServices(prev => prev.filter(s => s.id !== showDeleteServiceModal.id));
                  showToast('info', "O'chirildi", `${showDeleteServiceModal.name} xizmati olib tashlandi.`);
                  setShowDeleteServiceModal(null);
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: Xizmat qo'shish/tahrirlash
      ══════════════════════════════════════════ */}
      {showServiceModal && (
        <div className={styles.modalOverlay} onClick={() => setShowServiceModal(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editService ? 'Xizmatni tahrirlash' : 'Yangi xizmat qo\'shish'}</h3>
              <button type="button" className={styles.modalClose} onClick={() => setShowServiceModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveService} className={styles.modalForm}>
              <div className={styles.formGrid2}>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.formLabel}>Xizmat nomi *</label>
                  <input required className={styles.input} placeholder="Karies davolash" value={serviceForm.name}
                    onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Kategoriya</label>
                  <select className={styles.input} value={serviceForm.category} onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}>
                    {SERVICE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Davomiyligi (daqiqa)</label>
                  <input type="number" min="5" className={styles.input} value={serviceForm.duration}
                    onChange={e => setServiceForm({ ...serviceForm, duration: Number(e.target.value) })} />
                </div>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.formLabel}>Narx (so'm) *</label>
                  <input required type="number" min="0" className={styles.input} placeholder="250000" value={serviceForm.price}
                    onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnOutline} onClick={() => setShowServiceModal(false)}>Bekor qilish</button>
                <button type="submit" className={styles.btnPrimary}>{editService ? 'Yangilash' : 'Qo\'shish'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        open={toast.open}
        title={toast.title}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
