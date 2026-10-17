import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { teamApi } from '../../api/teamApi';
import { servicesApi } from '../../api/servicesApi';
import { auditLogsApi } from '../../api/auditLogsApi';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useFormatters } from '../../hooks/useFormatters';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import Toast from '../../components/Toast/Toast';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { formatPhoneInput, normalizePhone, formatPhone } from '../../utils/formatters';
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
  const { user, hasRole, updateUser } = useAuth();
  const { formatDateTime } = useFormatters();
  const isOwnerOrAdmin = hasRole(['owner', 'administrator', 'superadmin']);

  usePageMeta(
    t('settings.practiceSettings'),
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

  // Staff Password Reset by Owner
  const [resetPassTarget, setResetPassTarget] = useState(null);
  const [resetPassLoading, setResetPassLoading] = useState(false);
  const [tempPasswordIssued, setTempPasswordIssued] = useState(null);

  // Clinic
  const [clinicData, setClinicData] = useState(() => {
    const savedChairs = localStorage.getItem('dentuz_clinic_chairs');
    const savedName = localStorage.getItem('dentuz_clinic_name');
    const chairs = user?.chairsCount || user?.clinicInfo?.chairsCount || (savedChairs ? Number(savedChairs) : 1);
    return {
      name: savedName || user?.clinic || t('settings.dentuzCentralClinic'),
      license: 'MED-UZ-2021-9988',
      director: user?.name || 'Dr. Jasur Azimov',
      phone: user?.phone || '+998 71 200 44 22',
      extraPhone: '+998 90 842 11 00',
      email: typeof user?.email === 'string' ? user.email : 'info@dentuz.uz',
      address: t('settings.bunyodkorAve42Chilanzar'),
      workingHours: t('settings.mondaySaturday0830'),
      inn: '307 456 789',
      mfo: '00873',
      bankAccount: '20208000205174219001',
      bankName: 'Xalq Banki',
      chairsCount: chairs,
    };
  });

  useEffect(() => {
    const chairs = user?.chairsCount || user?.clinicInfo?.chairsCount;
    if (chairs) {
      setClinicData(prev => ({
        ...prev,
        chairsCount: Number(chairs) || prev.chairsCount,
        name: user?.clinic || prev.name,
      }));
    }
  }, [user]);

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

  // Security & Password Change
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [twoFactor, setTwoFactor] = useState(true);
  const [passSuccess, setPassSuccess] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  // Backup
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [lastBackup] = useState('2025-09-18 03:00 AM');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [teamData, servicesData] = await Promise.all([
          teamApi.getTeam().catch(() => null),
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
      t('settings.resetToDefaults'),
      t('settings.permissionsResetToRole')
    );
  };

  const handleSavePerms = () => {
    if (!showPermModal) return;
    setTeam(prev => prev.map(m => m.id === showPermModal.id ? { ...m, permissions: memberPerms } : m));
    showToast(
      'success',
      t('settings.permissionsSaved'),
      isEn
        ? `Permissions updated for ${showPermModal.name}`
        : `${showPermModal.name} uchun tizim huquqlari muvaffaqiyatli saqlandi.`
    );
    setShowPermModal(null);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.name) return;
    const payload = {
      ...newMember,
      phone: normalizePhone(newMember.phone)
    };
    const added = await teamApi.addMember(payload);
    setTeam((prev) => [...prev, added]);
    setShowAddModal(false);
    setNewMember({ name: '', title: '', role: 'Shifokor', email: '', phone: '', branch: 'Markaziy Klinika' });
    showToast('success', t('settings.memberAdded'), t('settings.memberJoined', { name: newMember.name }));
  };

  const handleSaveClinic = async (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('dentuz_clinic_chairs', clinicData.chairsCount);
      localStorage.setItem('dentuz_clinic_name', clinicData.name);
    } catch {}

    const clinicId = user?.clinicId || user?.clinicInfo?.id;
    if (clinicId) {
      try {
        await apiClient.put(`/clinics/${clinicId}`, {
          name: clinicData.name,
          address: clinicData.address,
          phone: clinicData.phone,
          workingHours: clinicData.workingHours,
          chairsCount: Number(clinicData.chairsCount),
        });
      } catch (err) {
        console.warn('Failed to persist clinic update to API:', err);
      }
    }

    if (updateUser) {
      updateUser({
        ...user,
        clinic: clinicData.name,
        chairsCount: Number(clinicData.chairsCount),
        clinicInfo: {
          ...(user?.clinicInfo || {}),
          name: clinicData.name,
          address: clinicData.address,
          phone: clinicData.phone,
          workingHours: clinicData.workingHours,
          chairsCount: Number(clinicData.chairsCount),
        },
      });
    }

    setClinicSaved(true);
    showToast(
      'success',
      t('settings.settingsSaved'),
      isEn
        ? `Practice details and ${clinicData.chairsCount} operatory chairs updated successfully.`
        : `Klinika ma'lumotlari va ${clinicData.chairsCount} ta operatsion kreslo muvaffaqiyatli saqlandi.`
    );
    setTimeout(() => setClinicSaved(false), 3000);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    if (passwords.newPass !== passwords.confirm) {
      const msg = t('settings.newPasswordsDoNot');
      setPassError(msg);
      showToast('error', t('settings.error'), msg);
      return;
    }
    if (passwords.newPass.length < 8) {
      const msg = t('settings.passwordMustBeAt');
      setPassError(msg);
      showToast('error', t('settings.weakPassword'), msg);
      return;
    }
    setPassLoading(true);
    try {
      const res = await apiClient.post('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      if (res && res.success) {
        setPassSuccess(true);
        setPasswords({ current: '', newPass: '', confirm: '' });
        showToast('success', t('settings.passwordUpdated'), res.message || t('settings.passwordHasBeenUpdated'));
        setTimeout(() => setPassSuccess(false), 4000);
      } else {
        const msg = res?.message || t('settings.failedToUpdatePassword');
        setPassError(msg);
        showToast('error', t('settings.error'), msg);
      }
    } catch (err) {
      const msg = err?.message || t('settings.currentPasswordIncorrectOr');
      setPassError(msg);
      showToast('error', t('settings.error'), msg);
    } finally {
      setPassLoading(false);
    }
  };

  const handleConfirmResetStaffPassword = async () => {
    if (!resetPassTarget) return;
    setResetPassLoading(true);
    try {
      const res = await teamApi.resetPassword(resetPassTarget.id);
      const tempPass = res?.data?.temporaryPassword || res?.temporaryPassword;
      setTempPasswordIssued({
        member: resetPassTarget,
        password: tempPass,
      });
      showToast(
        'success',
        t('settings.temporaryPasswordIssued'),
        isEn
          ? `Temporary password issued for ${resetPassTarget.name}.`
          : `${resetPassTarget.name} uchun yangi vaqtinchalik parol berildi.`
      );
    } catch (err) {
      showToast('error', t('settings.error'), err?.message || t('settings.failedToResetPassword'));
    } finally {
      setResetPassLoading(false);
      setResetPassTarget(null);
    }
  };

  const loadAuditLogs = async (page = 1, action = '', search = '') => {
    setAuditLoading(true);
    try {
      const res = await auditLogsApi.getAuditLogs({
        page,
        limit: 15,
        action: action || undefined,
        search: search || undefined,
      });
      if (res && res.data) {
        setAuditLogs(res.data);
        setAuditTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.warn('Audit logs load failed:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit' && isOwnerOrAdmin) {
      loadAuditLogs(auditPage, auditActionFilter, auditSearch);
    }
  }, [activeTab, auditPage, auditActionFilter, isOwnerOrAdmin]);

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
      showToast('success', t('settings.updated'), t('settings.serviceUpdatedMsg', { name: serviceForm.name }));
    } else {
      const newSvc = { ...serviceForm, price: Number(serviceForm.price) };
      try {
        const created = await servicesApi.create(newSvc);
        setServices(prev => [...prev, created || { id: `srv-${Date.now()}`, ...newSvc }]);
      } catch (err) {
        setServices(prev => [...prev, { id: `srv-${Date.now()}`, ...newSvc }]);
      }
      showToast('success', t('settings.created'), t('settings.serviceCreatedMsg', { name: serviceForm.name }));
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
    showToast('info', t('settings.deleted'), t('settings.serviceRemovedFromPrice'));
  };

  const handleToggleSms = (id) => {
    setSmsTemplates(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const handleBackup = () => {
    setBackupLoading(true);
    setTimeout(() => {
      setBackupLoading(false);
      showToast('success', t('settings.backupCreated'), t('settings.databaseBackupExportedSecurely'));
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
    if (role === 'owner') return t('settings.chiefPhysician');
    if (role === 'doctor') return t('settings.doctor');
    if (role === 'receptionist') return t('settings.administrator');
    if (role === 'nurse') return t('settings.nurse');
    return role;
  };

  const tabs = [
    { id: 'clinic',    icon: 'business',         label: t('settings.practiceInfo') },
    { id: 'team',      icon: 'group',            label: t('settings.staffRoles') },
    { id: 'services',  icon: 'medical_services', label: t('settings.servicesPricing') },
    { id: 'sms',       icon: 'sms',              label: t('settings.smsTemplates') },
    { id: 'security',  icon: 'shield',           label: t('settings.security2fa') },
    { id: 'backup',    icon: 'backup',           label: t('settings.databaseBackup') },
    ...(isOwnerOrAdmin ? [{ id: 'audit', icon: 'manage_history', label: t('settings.auditLog') }] : []),
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.headerMeta}>
            <span className={styles.sectionBadge}>{t('settings.practiceOs')}</span>
            <span className={styles.dot}>•</span>
            <span className={styles.metaLabel}>{t('settings.settings')}</span>
          </div>
          <h1 className={styles.pageTitle}>{t('settings.clinicSettings')}</h1>
          <p className={styles.pageSubtitle}>
            {t('settings.manageYourDentalPractice')}
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
                  <h2 className={styles.tabTitle}>{t('settings.practiceProfileCredentials')}</h2>
                  <p className={styles.tabSub}>{t('settings.officialClinicCredentialsDental')}</p>
                </div>
              </div>

              <form onSubmit={handleSaveClinic} className={styles.formStack}>
                {/* Basic info */}
                <div className={styles.card}>
                  <div className={styles.cardSectionTitle}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
                    {t('settings.generalClinicDetails')}
                  </div>
                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{t('settings.clinicName')}</label>
                      <input className={styles.input} value={clinicData.name} onChange={e => setClinicData({ ...clinicData, name: e.target.value })} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{t('settings.medicalLicenseNumber')}</label>
                      <input className={styles.input} value={clinicData.license} onChange={e => setClinicData({ ...clinicData, license: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{t('settings.medicalDirectorFI')}</label>
                      <input className={styles.input} value={clinicData.director} onChange={e => setClinicData({ ...clinicData, director: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{t('settings.workingHours')}</label>
                      <input className={styles.input} value={clinicData.workingHours} onChange={e => setClinicData({ ...clinicData, workingHours: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{t('settings.primaryPhone')}</label>
                      <input className={styles.input} value={clinicData.phone} onChange={e => setClinicData({ ...clinicData, phone: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{t('settings.secondaryPhone')}</label>
                      <input className={styles.input} value={clinicData.extraPhone} onChange={e => setClinicData({ ...clinicData, extraPhone: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{t('settings.officialEmail')}</label>
                      <input className={styles.input} type="email" value={clinicData.email} onChange={e => setClinicData({ ...clinicData, email: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        {t('settings.dentalOperatoriesChairs')}
                        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-cyan)', marginLeft: 6 }}>
                          ({t('settings.controlsDashboard')})
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
                    <label className={styles.formLabel}>{t('settings.physicalAddress')}</label>
                    <input className={styles.input} value={clinicData.address} onChange={e => setClinicData({ ...clinicData, address: e.target.value })} />
                  </div>
                </div>

                {/* Bank rekvizitlar */}
                <div className={styles.card}>
                  <div className={styles.cardSectionTitle}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>account_balance</span>
                    {t('settings.bankingBillingCredentials')}
                  </div>
                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{t('settings.taxIdInn')}</label>
                      <input className={styles.input} value={clinicData.inn} onChange={e => setClinicData({ ...clinicData, inn: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{t('settings.bankCodeMfo')}</label>
                      <input className={styles.input} value={clinicData.mfo} onChange={e => setClinicData({ ...clinicData, mfo: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{t('settings.settlementAccount')}</label>
                      <input className={styles.input} value={clinicData.bankAccount} onChange={e => setClinicData({ ...clinicData, bankAccount: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{t('settings.bankName')}</label>
                      <input className={styles.input} value={clinicData.bankName} onChange={e => setClinicData({ ...clinicData, bankName: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className={styles.formActions}>
                  {clinicSaved && <span className={styles.successLabel}>✓ {t('settings.savedSuccessfully')}</span>}
                  <button type="submit" className={styles.btnPrimary}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                    {t('settings.saveChanges')}
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
                  <h2 className={styles.tabTitle}>{t('settings.teamRolePermissions')}</h2>
                  <p className={styles.tabSub}>{t('settings.addMedicalTeamMembers')}</p>
                </div>
                <button type="button" className={styles.btnPrimary} onClick={() => setShowAddModal(true)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                  {t('settings.addTeamMember')}
                </button>
              </div>

              {/* Filter strip */}
              <div className={styles.filterStrip}>
                <div className={styles.searchBox}>
                  <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder={t('settings.searchStaffByName')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className={styles.metaChips}>
                  <div className={styles.chip}>
                    <span className={styles.dotGreen} />
                    <span>{t('settings.active')}</span>
                    <strong>{team.filter(m => m.status === 'online').length}</strong>
                  </div>
                  <div className={styles.chip}>
                    <span>{t('settings.totalStaff')}</span>
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
                    <p>{t('settings.noStaffMembersFound')}</p>
                  </div>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.staffTable}>
                    <thead>
                      <tr>
                        <th>{t('settings.member')}</th>
                        <th>{t('settings.role')}</th>
                        <th>{t('settings.contact')}</th>
                        <th>{t('settings.branch')}</th>
                        <th>{t('settings.status')}</th>
                        <th>{t('settings.actions')}</th>
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
                              <div style={{ color: 'var(--color-text-secondary)' }}>{formatPhone(member.phone)}</div>
                            </div>
                          </td>
                          <td style={{ fontSize: 12 }}>
                            {member.branch === 'Markaziy Klinika'
                              ? t('settings.centralClinic')
                              : member.branch}
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${member.status === 'online' ? styles.statusOnline : styles.statusOffline}`}>
                              {member.status === 'online' ? t('settings.active') : t('settings.offline')}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actionBtns}>
                              <button
                                type="button"
                                className={styles.actionBtn}
                                title={t('settings.permissions')}
                                onClick={() => handleOpenPermModal(member)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>manage_accounts</span>
                              </button>
                              {isOwnerOrAdmin && (
                                <button
                                  type="button"
                                  className={styles.actionBtn}
                                  title={t('settings.issueTemporaryPassword')}
                                  onClick={() => setResetPassTarget(member)}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-cyan-hover)' }}>key</span>
                                </button>
                              )}
                              <button
                                type="button"
                                className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                                title={t('settings.removeMember')}
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
                  </div>
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
                    placeholder={t('settings.searchServices')}
                    value={serviceSearch}
                    onChange={e => setServiceSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                <div className={styles.tableWrapper}>
                <table className={styles.staffTable}>
                  <thead>
                    <tr>
                      <th>{t('settings.serviceName')}</th>
                      <th>{t('settings.category')}</th>
                      <th>{t('settings.duration')}</th>
                      <th>{t('settings.price')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map((svc) => (
                      <tr key={svc.id}>
                        <td style={{ fontWeight: 600 }}>{svc.name}</td>
                        <td><span className={styles.catBadge}>{svc.category}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{svc.duration} {t('settings.min')}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--color-cyan-hover)' }}>
                          {formatPrice(svc.price)}
                        </td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              type="button"
                              className={styles.actionBtn}
                              title={t('settings.editService')}
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
                              title={t('settings.deleteService')}
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
                </div>
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
              <h2 className={styles.tabTitle}>{t('settings.accountSecurityAccess')}</h2>
              <p className={styles.tabSub} style={{ marginBottom: 24 }}>
                {t('settings.updateYourPersonalCredentials')}
              </p>

              {/* Change password */}
              <div className={styles.card}>
                <div className={styles.cardSectionTitle}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
                  {t('settings.changePassword')}
                </div>
                <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 440 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('settings.currentPassword')}</label>
                    <div className={styles.passwordInputWrapper}>
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        className={styles.input}
                        placeholder="••••••••"
                        value={passwords.current}
                        onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className={styles.passwordToggleBtn}
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        tabIndex={-1}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          {showCurrentPass ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('settings.newPassword')}</label>
                    <div className={styles.passwordInputWrapper}>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        className={styles.input}
                        placeholder={t('settings.atLeast8Characters')}
                        value={passwords.newPass}
                        onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className={styles.passwordToggleBtn}
                        onClick={() => setShowNewPass(!showNewPass)}
                        tabIndex={-1}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          {showNewPass ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('settings.confirmNewPassword')}</label>
                    <div className={styles.passwordInputWrapper}>
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        className={styles.input}
                        placeholder={t('settings.reEnterNewPassword')}
                        value={passwords.confirm}
                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className={styles.passwordToggleBtn}
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        tabIndex={-1}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          {showConfirmPass ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {passError && (
                    <div style={{ color: 'var(--color-danger)', fontSize: 12, fontWeight: 500 }}>
                      ⚠️ {passError}
                    </div>
                  )}

                  <div className={styles.formActions}>
                    {passSuccess && (
                      <span className={styles.successLabel}>
                        ✓ {t('settings.passwordChangedSuccessfully')}
                      </span>
                    )}
                    <button type="submit" className={styles.btnPrimary} disabled={passLoading}>
                      {passLoading ? (
                        <>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>refresh</span>
                          {t('settings.updating')}
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                          {t('settings.updatePassword')}
                        </>
                      )}
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

          {/* ══════════════════════════════════════════
              TAB: AUDIT LOG (FAOLIYAT JURNALI)
          ══════════════════════════════════════════ */}
          {activeTab === 'audit' && isOwnerOrAdmin && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <div>
                  <h2 className={styles.tabTitle}>{t('settings.securityActivityAuditLog')}</h2>
                  <p className={styles.tabSub}>{t('settings.immutableAuditRecordOf')}</p>
                </div>
              </div>

              {/* Filter strip */}
              <div className={styles.filterStrip}>
                <div className={styles.searchBox}>
                  <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder={t('settings.searchByUserEmail')}
                    value={auditSearch}
                    onChange={(e) => {
                      setAuditSearch(e.target.value);
                      setAuditPage(1);
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    className={styles.input}
                    style={{ height: 38, padding: '0 12px', fontSize: 13 }}
                    value={auditActionFilter}
                    onChange={(e) => {
                      setAuditActionFilter(e.target.value);
                      setAuditPage(1);
                    }}
                  >
                    <option value="">{t('settings.allActions')}</option>
                    <option value="AUTH_LOGIN">AUTH_LOGIN</option>
                    <option value="AUTH_LOGOUT">AUTH_LOGOUT</option>
                    <option value="AUTH_PASSWORD_CHANGE">AUTH_PASSWORD_CHANGE</option>
                    <option value="STAFF_PASSWORD_RESET">STAFF_PASSWORD_RESET</option>
                    <option value="PATIENT_CREATE">PATIENT_CREATE</option>
                    <option value="PAYMENT_RECORD">PAYMENT_RECORD</option>
                  </select>
                  <button
                    type="button"
                    className={styles.btnOutline}
                    style={{ height: 38, padding: '0 12px' }}
                    onClick={() => loadAuditLogs(auditPage, auditActionFilter, auditSearch)}
                    title={t('settings.refresh')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className={styles.card} style={{ padding: 0, overflowX: 'auto' }}>
                {auditLoading ? (
                  <div style={{ padding: 24 }}><SkeletonLoader type="table" count={5} /></div>
                ) : auditLogs.length === 0 ? (
                  <div className={styles.emptyState}>
                    <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-outline)' }}>history_toggle_off</span>
                    <p>{t('settings.noAuditLogEntries')}</p>
                  </div>
                ) : (
                  <table className={styles.auditTable}>
                    <thead>
                      <tr>
                        <th>{t('settings.timestamp')}</th>
                        <th>{t('settings.user')}</th>
                        <th>{t('settings.action')}</th>
                        <th>{t('settings.resource')}</th>
                        <th>{t('settings.ipAddress')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                            {formatDateTime(log.createdAt)}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{log.userEmail || t('settings.system')}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                              {log.userRole || '—'}
                            </div>
                          </td>
                          <td>
                            <span className={styles.auditBadge}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                            {log.resource} {log.resourceId ? `#${log.resourceId}` : ''}
                          </td>
                          <td style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                            {log.ip || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Pagination */}
                <div className={styles.paginationContainer}>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {t('common.pageOfTotal', { page: auditPage, total: auditTotalPages })}
                  </div>
                  <div className={styles.paginationActions}>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={auditPage <= 1 || auditLoading}
                      onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
                      {t('settings.previous')}
                    </button>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={auditPage >= auditTotalPages || auditLoading}
                      onClick={() => setAuditPage((p) => p + 1)}
                    >
                      {t('settings.next')}
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                    </button>
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
                  <label className={styles.formLabel}>{t('settings.fullName')}</label>
                  <input required className={styles.input} placeholder={t('settings.eGJohnDoe')} value={newMember.name}
                    onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('settings.specialization')}</label>
                  <input className={styles.input} placeholder={t('settings.dentist')} value={newMember.title}
                    onChange={e => setNewMember({ ...newMember, title: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('settings.role_1')}</label>
                  <select className={styles.input} value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })}>
                    <option value="doctor">{t('settings.doctor')}</option>
                    <option value="nurse">{t('settings.nurse')}</option>
                    <option value="administrator">{t('settings.administrator')}</option>
                    <option value="receptionist">{t('settings.receptionist')}</option>
                    <option value="accountant">{t('settings.accountant')}</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('settings.phone')}</label>
                  <input className={styles.input} placeholder="+998 90 123 45 67" value={newMember.phone}
                    onChange={e => setNewMember({ ...newMember, phone: formatPhoneInput(e.target.value) })} />
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
      {/* ══════════════════════════════════════════
          CONFIRM DIALOGS: Xodim o'chirish va Parol tiklash
      ══════════════════════════════════════════ */}
      <ConfirmDialog
        open={Boolean(showDeleteModal)}
        title={t('settings.removeTeamMember')}
        message={
          isEn
            ? `Are you sure you want to remove ${showDeleteModal?.name} (${showDeleteModal?.role}) from the team? This action cannot be undone.`
            : `${showDeleteModal?.name} (${showDeleteModal?.role}) ni jamoadan chiqarishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.`
        }
        confirmText={t('settings.remove')}
        cancelText={t('settings.cancel')}
        isDanger={true}
        onConfirm={() => {
          setTeam((prev) => prev.filter((m) => m.id !== showDeleteModal.id));
          showToast(
            'info',
            t('settings.removed'),
            isEn ? `${showDeleteModal.name} was removed from the team.` : `${showDeleteModal.name} jamoadan chiqarildi.`
          );
          setShowDeleteModal(null);
        }}
        onCancel={() => setShowDeleteModal(null)}
      />

      <ConfirmDialog
        open={Boolean(resetPassTarget)}
        title={t('settings.issueTemporaryPassword_1')}
        message={
          isEn
            ? `Issue a new temporary password for ${resetPassTarget?.name}? Existing sessions will be terminated and password change will be mandatory on login.`
            : `${resetPassTarget?.name} uchun yangi vaqtinchalik parol berilsinmi? Xodimning barcha mavjud seanslari yakunlanadi va keyingi kirishda yangi shaxsiy parol o'rnatishi majburiy bo'ladi.`
        }
        confirmText={t('settings.generateIssue')}
        cancelText={t('settings.cancel')}
        isDanger={false}
        icon="info"
        loading={resetPassLoading}
        onConfirm={handleConfirmResetStaffPassword}
        onCancel={() => setResetPassTarget(null)}
      />

      {/* Modal: Temporary Password Generated Display */}
      {tempPasswordIssued && (
        <div className={styles.modalOverlay} onClick={() => setTempPasswordIssued(null)}>
          <div className={styles.modalBox} style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--color-cyan-hover)' }}>key</span>
                <h3 className={styles.modalTitle}>{t('settings.temporaryPasswordGenerated')}</h3>
              </div>
              <button type="button" className={styles.modalClose} onClick={() => setTempPasswordIssued(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {isEn
                  ? `Provide this temporary password to ${tempPasswordIssued.member?.name}. Upon sign-in, the system will require them to set a new personal password.`
                  : `Ushbu vaqtinchalik parolni ${tempPasswordIssued.member?.name} ga taqdim eting. Tizimga kirgach, xodim darhol yangi shaxsiy parol o'rnatishi shart bo'ladi.`}
              </p>
              <div style={{
                background: 'var(--color-surface-container-low)',
                border: '1px dashed var(--color-cyan-hover)',
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-primary)' }}>
                  {tempPasswordIssued.password}
                </span>
                <button
                  type="button"
                  className={styles.btnOutline}
                  style={{ height: 32, padding: '0 12px', fontSize: 12 }}
                  onClick={() => {
                    navigator.clipboard?.writeText(tempPasswordIssued.password);
                    showToast('success', t('settings.copied'), t('settings.passwordCopiedToClipboard'));
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>content_copy</span>
                  {t('settings.copy')}
                </button>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setTempPasswordIssued(null)}
              >
                {t('settings.done')}
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
                {t('settings.permissionsAccess')}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--color-cyan, #0891b2)' }}>
                {Object.values(memberPerms).filter(Boolean).length} / {PERM_DEFINITIONS.length} {t('settings.active_1')}
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
                {t('settings.reset')}
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  type="button" 
                  className={styles.btnOutline} 
                  style={{ fontSize: 12, padding: '6px 12px' }}
                  onClick={() => setShowPermModal(null)}
                >
                  {t('settings.cancel')}
                </button>
                <button 
                  type="button" 
                  className={styles.btnPrimary} 
                  style={{ fontSize: 12, padding: '6px 14px' }}
                  onClick={handleSavePerms}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>check</span>
                  {t('settings.save')}
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
                  <label className={styles.formLabel}>{t('settings.serviceName_1')}</label>
                  <input required className={styles.input} placeholder={t('settings.eGCariesTreatment')} value={serviceForm.name}
                    onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('settings.category_1')}</label>
                  <select className={styles.input} value={serviceForm.category} onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}>
                    {SERVICE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('settings.durationMinutes')}</label>
                  <input type="number" min="5" className={styles.input} value={serviceForm.duration}
                    onChange={e => setServiceForm({ ...serviceForm, duration: Number(e.target.value) })} />
                </div>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.formLabel}>{t('settings.priceUzs')}</label>
                  <input required type="number" min="0" className={styles.input} placeholder="250000" value={serviceForm.price}
                    onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnOutline} onClick={() => setShowServiceModal(false)}>{t('settings.cancel')}</button>
                <button type="submit" className={styles.btnPrimary}>{editService ? t('settings.update') : t('settings.add')}</button>
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
