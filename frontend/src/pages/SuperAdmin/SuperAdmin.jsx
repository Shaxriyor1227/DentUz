import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import Logo from '../../components/Logo/Logo';
import Icon from '../../components/Icon/Icon';
import styles from './SuperAdmin.module.css';

export default function SuperAdmin() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'clinics' | 'users'
  const [stats, setStats] = useState({
    totalClinics: 0,
    activeClinics: 0,
    totalApplications: 0,
    newApplications: 0,
    totalDoctors: 0,
    totalPatients: 0,
    estimatedMRR: 0,
  });

  const [applications, setApplications] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [appSearch, setAppSearch] = useState('');
  const [appStatus, setAppStatus] = useState('all');
  const [clinicSearch, setClinicSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userClinicFilter, setUserClinicFilter] = useState('all');

  // Toasts
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onboardSuccessData, setOnboardSuccessData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  // Create User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'doctor',
    clinicId: '',
    phone: '',
    title: '',
  });

  // Form State for Onboarding
  const [formData, setFormData] = useState({
    applicationId: '',
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    chairsCount: 1,
    subscriptionPlan: 'pro',
    address: '',
    password: '',
  });

  // Custom Modal 1: Role Change Modal
  const [roleModal, setRoleModal] = useState({
    isOpen: false,
    user: null,
    selectedRole: 'doctor',
    loading: false,
  });

  // Custom Modal 2: Password Reset Modal
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    user: null,
    newPassword: '',
    showPassword: true,
    copied: false,
    loading: false,
  });

  // Custom Modal 3: Confirm Action Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Tasdiqlash',
    cancelText: 'Bekor qilish',
    icon: 'warning', // 'warning' | 'block' | 'delete' | 'check_circle'
    isDanger: true,
    onConfirm: null,
    loading: false,
  });

  // Custom Modal 4: Extend Subscription Modal
  const [extendPlanModal, setExtendPlanModal] = useState({
    isOpen: false,
    clinic: null,
    months: 12,
    loading: false,
  });

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Load all initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes, clinicsRes, usersRes] = await Promise.all([
        fetch(`${baseUrl}/superadmin/stats`),
        fetch(`${baseUrl}/superadmin/applications`),
        fetch(`${baseUrl}/superadmin/clinics`),
        fetch(`${baseUrl}/superadmin/users`),
      ]);

      if (statsRes.ok) {
        const sData = await statsRes.json();
        if (sData.success) setStats(sData.data);
      }
      if (appsRes.ok) {
        const aData = await appsRes.json();
        if (aData.success) setApplications(aData.data);
      }
      if (clinicsRes.ok) {
        const cData = await clinicsRes.json();
        if (cData.success) setClinics(cData.data);
      }
      if (usersRes.ok) {
        const uData = await usersRes.json();
        if (uData.success) setUsers(uData.data);
      }
    } catch (err) {
      console.error('SuperAdmin loadData error:', err);
      showToast('Ma\'lumotlarni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Open modal from an application
  const handleOpenOnboardFromApp = (app) => {
    setOnboardSuccessData(null);
    setFormData({
      applicationId: app.id,
      name: app.clinicName || `${app.name} Stomatologiyasi`,
      ownerName: app.name,
      email: `${app.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      phone: app.phone,
      chairsCount: app.chairsCount === '1-3' ? 2 : 4,
      subscriptionPlan: 'pro',
      address: 'Toshkent shahri',
      password: '',
    });
    setIsModalOpen(true);
  };

  // Open empty modal for manual clinic creation
  const handleOpenNewClinic = () => {
    setOnboardSuccessData(null);
    setFormData({
      applicationId: '',
      name: '',
      ownerName: '',
      email: '',
      phone: '+998 ',
      chairsCount: 2,
      subscriptionPlan: 'pro',
      address: '',
      password: '',
    });
    setIsModalOpen(true);
  };

  // Submit onboarding
  const handleSubmitOnboard = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const res = await fetch(`${baseUrl}/superadmin/clinics/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOnboardSuccessData(data.data);
        showToast('Klinika va egasi muvaffaqiyatli tizimga ulandi! 🎉');
        loadData();
      } else {
        showToast(data.message || 'Xatolik yuz berdi', 'error');
      }
    } catch (err) {
      showToast('Server bilan ulanishda xatolik: ' + err.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // --- APPLICATION ACTIONS ---
  const handleUpdateAppStatus = async (app, newStatus) => {
    try {
      const res = await fetch(`${baseUrl}/superadmin/applications/${app.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Ariza holati o'zgartirildi: ${newStatus}`);
        loadData();
      } else {
        showToast('Statusni o\'zgartirib bo\'lmadi', 'error');
      }
    } catch (err) {
      showToast('Xatolik: ' + err.message, 'error');
    }
  };

  const handleDeleteAppPrompt = (app) => {
    setConfirmModal({
      isOpen: true,
      title: "Arizani o'chirish",
      message: `"${app.name}" (${app.clinicName || 'Klinika'}) arizasini tizimdan butunlay o'chirishni xohlaysizmi?`,
      confirmText: "O'chirish",
      cancelText: "Bekor qilish",
      icon: 'delete',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`${baseUrl}/superadmin/applications/${app.id}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            showToast('Ariza muvaffaqiyatli o\'chirildi');
            loadData();
          }
        } catch (err) {
          showToast('Xatolik: ' + err.message, 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // --- CLINIC MANAGEMENT ACTIONS ---
  const handleToggleClinicStatus = (clinic) => {
    const isActivating = clinic.status !== 'active';
    setConfirmModal({
      isOpen: true,
      title: isActivating ? "Klinikani faollashtirish" : "Klinikani bloklash",
      message: isActivating
        ? `"${clinic.name}" klinikasini qayta faol holatga keltirmoqchimisiz? Barcha xodimlar tizimdan to'liq foydalana olishadi.`
        : `"${clinic.name}" klinikasini vaqtincha to'xtatmoqchimisiz? Klinika xodimlari tizimga kirishi cheklanadi.`,
      confirmText: isActivating ? "Faollashtirish" : "Bloklash",
      cancelText: "Bekor qilish",
      icon: isActivating ? 'check_circle' : 'block',
      isDanger: !isActivating,
      onConfirm: async () => {
        try {
          const newStatus = isActivating ? 'active' : 'suspended';
          const res = await fetch(`${baseUrl}/superadmin/clinics/${clinic.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          });
          if (res.ok) {
            showToast(`Klinika ${isActivating ? 'faollashtirildi' : 'bloklandi'}`);
            loadData();
          }
        } catch (err) {
          showToast('Xatolik yuz berdi: ' + err.message, 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleOpenExtendPlan = (clinic) => {
    setExtendPlanModal({
      isOpen: true,
      clinic,
      months: 12,
      loading: false,
    });
  };

  const handleSaveExtendPlan = async () => {
    if (!extendPlanModal.clinic) return;
    setExtendPlanModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${baseUrl}/superadmin/clinics/${extendPlanModal.clinic.id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalMonths: parseInt(extendPlanModal.months, 10) }),
      });
      if (res.ok) {
        showToast(`"${extendPlanModal.clinic.name}" obunasi ${extendPlanModal.months} oyga uzaytirildi!`);
        setExtendPlanModal((prev) => ({ ...prev, isOpen: false }));
        loadData();
      } else {
        showToast('Obunani yangilab bo\'lmadi', 'error');
      }
    } catch (err) {
      showToast('Xatolik: ' + err.message, 'error');
    } finally {
      setExtendPlanModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Helper: jump from Clinic to filtered Staff
  const handleViewClinicStaff = (clinic) => {
    setUserClinicFilter(clinic.id);
    setUserRoleFilter('all');
    setActiveTab('users');
  };

  // --- USER ACCESS & RBAC MANAGEMENT MODALS ---

  // 1. Role Change Modal
  const handleOpenRoleModal = (targetUser) => {
    setRoleModal({
      isOpen: true,
      user: targetUser,
      selectedRole: targetUser.role,
      loading: false,
    });
  };

  const handleSaveRole = async () => {
    if (!roleModal.user) return;
    setRoleModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${baseUrl}/superadmin/users/${roleModal.user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleModal.selectedRole }),
      });
      if (res.ok) {
        showToast(`Rol muvaffaqiyatli yangilandi: ${roleModal.selectedRole}`);
        setRoleModal((prev) => ({ ...prev, isOpen: false }));
        loadData();
      } else {
        showToast('Rolni o\'zgartirib bo\'lmadi', 'error');
      }
    } catch (err) {
      showToast('Xatolik: ' + err.message, 'error');
    } finally {
      setRoleModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // 2. Password Reset Modal
  const generateRandomPassword = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
    let rand = '';
    for (let i = 0; i < 5; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `DentUz#${rand}!`;
  };

  const handleOpenPasswordModal = (targetUser) => {
    const initialPass = generateRandomPassword();
    setPasswordModal({
      isOpen: true,
      user: targetUser,
      newPassword: initialPass,
      showPassword: true,
      copied: false,
      loading: false,
    });
  };

  const handleSavePassword = async () => {
    if (!passwordModal.user) return;
    if (!passwordModal.newPassword || passwordModal.newPassword.trim().length < 6) {
      showToast('Parol kamida 6 ta belgidan iborat bo\'lishi kerak', 'error');
      return;
    }
    setPasswordModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${baseUrl}/superadmin/users/${passwordModal.user.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordModal.newPassword.trim() }),
      });
      if (res.ok) {
        showToast(`"${passwordModal.user.name}" paroli muvaffaqiyatli yangilandi!`);
        setPasswordModal((prev) => ({ ...prev, isOpen: false }));
      } else {
        showToast('Parolni yangilashda xatolik', 'error');
      }
    } catch (err) {
      showToast('Xatolik: ' + err.message, 'error');
    } finally {
      setPasswordModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // 3. Toggle User Active / Blocked status with Confirm Modal
  const handleToggleUserStatus = (targetUser) => {
    const isActivating = !targetUser.isActive;
    setConfirmModal({
      isOpen: true,
      title: isActivating ? "Kirish huquqini yoqish" : "Foydalanuvchini bloklash",
      message: isActivating
        ? `"${targetUser.name}" foydalanuvchisiga tizimga kirish huquqini qayta yoqasizmi?`
        : `"${targetUser.name}" foydalanuvchisini bloklashni tasdiqlaysizmi? U darhol tizimdan uziladi va qayta kira olmaydi.`,
      confirmText: isActivating ? "Ruxsat berish" : "Bloklash",
      cancelText: "Bekor qilish",
      icon: isActivating ? 'check_circle' : 'block',
      isDanger: !isActivating,
      onConfirm: async () => {
        try {
          const res = await fetch(`${baseUrl}/superadmin/users/${targetUser.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: isActivating }),
          });
          if (res.ok) {
            showToast(`Foydalanuvchi ${isActivating ? 'faollashtirildi' : 'bloklandi'}`);
            loadData();
          }
        } catch (err) {
          showToast('Xatolik: ' + err.message, 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // 4. Delete User with Confirm Modal
  const handleDeleteUser = (targetUser) => {
    setConfirmModal({
      isOpen: true,
      title: "Foydalanuvchini o'chirish",
      message: `"${targetUser.name}" (${targetUser.email}) hisobini butunlay o'chirib tashlashni tasdiqlaysizmi? Bu amalni ortga qaytarib bo'lmaydi!`,
      confirmText: "O'chirish",
      cancelText: "Bekor qilish",
      icon: 'delete',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`${baseUrl}/superadmin/users/${targetUser.id}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            showToast('Foydalanuvchi tizimdan o\'chirildi');
            loadData();
          }
        } catch (err) {
          showToast('Xatolik: ' + err.message, 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Submit Create New User
  const handleSubmitCreateUser = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const res = await fetch(`${baseUrl}/superadmin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFormData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Foydalanuvchi muvaffaqiyatli yaratildi!');
        setIsUserModalOpen(false);
        loadData();
      } else {
        showToast(data.message || 'Xatolik yuz berdi', 'error');
      }
    } catch (err) {
      showToast('Server xatosi: ' + err.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Copy helper
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(type);
    showToast('Nusxalandi! ✓');
    setTimeout(() => setCopyStatus(''), 2500);
  };

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const matchSearch =
      !appSearch ||
      (app.name && app.name.toLowerCase().includes(appSearch.toLowerCase())) ||
      (app.clinicName && app.clinicName.toLowerCase().includes(appSearch.toLowerCase())) ||
      (app.phone && app.phone.includes(appSearch));
    const matchStatus = appStatus === 'all' || app.status === appStatus;
    return matchSearch && matchStatus;
  });

  // Filtered clinics
  const filteredClinics = clinics.filter((c) => {
    if (!clinicSearch) return true;
    const q = clinicSearch.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.ownerName && c.ownerName.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchClinic =
      userClinicFilter === 'all'
        ? true
        : userClinicFilter === 'unassigned'
        ? !u.clinicId
        : u.clinicId === userClinicFilter;
    const matchSearch =
      !userSearch ||
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.phone && u.phone.includes(userSearch));
    return matchRole && matchClinic && matchSearch;
  });

  const selectedClinicForStaff = clinics.find((c) => c.id === userClinicFilter);

  // Available roles with human descriptions
  const rolesList = [
    {
      id: 'doctor',
      name: 'Shifokor (Doctor)',
      icon: 'medical_services',
      desc: 'Bemorlarni qabul qilish, tashxis, muolaja va davolash jurnallari',
      badgeClass: styles.roleDoctor,
    },
    {
      id: 'receptionist',
      name: 'Administrator (Receptionist)',
      icon: 'calendar_month',
      desc: 'Navbatga yozish, kassa/to\'lovlar, yangi bemor kartochkasini ochish',
      badgeClass: styles.roleReceptionist,
    },
    {
      id: 'nurse',
      name: 'Hamshira (Nurse)',
      icon: 'vaccines',
      desc: 'Muolaja xonalari, asboblarni sterilizatsiya qilish, vrachga yordam',
      badgeClass: styles.roleNurse,
    },
    {
      id: 'owner',
      name: 'Klinika Egasi (Owner)',
      icon: 'apartment',
      desc: 'Klinika ichidagi barcha shifokorlar, moliya va xizmatlarni to\'liq boshqarish',
      badgeClass: styles.roleOwner,
    },
    {
      id: 'superadmin',
      name: '👑 SuperAdmin (DentUz Egasi)',
      icon: 'admin_panel_settings',
      desc: 'DentUz butun platformasining boshqaruvchisi va barcha klinikalarga kirish huquqi',
      badgeClass: styles.roleSuperadmin,
    },
  ];

  return (
    <div className={styles.superAdminContainer}>
      {/* Floating Toasts */}
      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${styles.toastItem} ${
              t.type === 'error'
                ? styles.toastError
                : t.type === 'info'
                ? styles.toastInfo
                : styles.toastSuccess
            }`}
          >
            <Icon
              name={t.type === 'error' ? 'error' : t.type === 'info' ? 'info' : 'check_circle'}
              size={20}
            />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Top Navbar */}
      <header className={styles.topNav}>
        <div className={styles.topNavInner}>
          <div className={styles.brandGroup}>
            <Logo />
            <div className={styles.portalBadge}>
              <span className={styles.liveDot} />
              <span>Platform Founder Portal</span>
            </div>
          </div>

          <div className={styles.userActions}>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className={styles.themeToggleBtn}
              title={theme === 'dark' ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
            >
              <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={18} />
              <span>{theme === 'dark' ? "Yorug'" : 'Tungi'}</span>
            </button>

            {/* Admin Profile */}
            <div className={styles.adminProfile}>
              <div className={styles.adminAvatar}>SR</div>
              <div className={styles.adminMeta}>
                <span className={styles.adminName}>{user?.name || 'DentUz Platforma Egasi'}</span>
                <span className={styles.adminRole}>Founder & SuperAdmin (@shaxriyorrozmamatov)</span>
              </div>
            </div>

            <button onClick={handleLogout} className={styles.logoutBtn} title="Tizimdan chiqish">
              <Icon name="logout" size={18} />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className={styles.mainContent}>
        {/* Page Title & Quick Actions */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>DentUz SaaS Boshqaruv Markazi</h1>
            <p className={styles.pageSubtitle}>
              Barcha klinikalar, arizalar, xodimlar va kirish huquqlarini professional darajada boshqaring.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              onClick={() => {
                setUserFormData({
                  name: '',
                  username: '',
                  email: '',
                  password: '',
                  role: 'doctor',
                  clinicId: userClinicFilter !== 'all' && userClinicFilter !== 'unassigned' ? userClinicFilter : (clinics[0]?.id || ''),
                  phone: '',
                  title: '',
                });
                setIsUserModalOpen(true);
              }}
              className={styles.createUserBtn}
            >
              <Icon name="person_add" size={18} />
              <span>Xodim Qo'shish</span>
            </button>

            <button onClick={handleOpenNewClinic} className={styles.createClinicBtn}>
              <Icon name="add" size={18} />
              <span>Yangi Klinika Qo'shish</span>
            </button>
          </div>
        </div>

        {/* KPI Dashboard Cards */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrap} style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
              <Icon name="domain" size={26} />
            </div>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>Jami Klinikalar</span>
              <span className={styles.kpiValue}>{stats.totalClinics} ta</span>
              <span className={styles.kpiSub}>• {stats.activeClinics} ta faol faoliyatda</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrap} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <Icon name="support_agent" size={26} />
            </div>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>Yangi Arizalar</span>
              <span className={styles.kpiValue}>{stats.newApplications} ta</span>
              <span className={styles.kpiSub}>• Jami {stats.totalApplications} ta murojaat</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrap} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <Icon name="verified_user" size={26} />
            </div>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>Foydalanuvchilar & Xodimlar</span>
              <span className={styles.kpiValue}>{users.length} ta</span>
              <span className={styles.kpiSub}>• Tizimdagi barcha hisoblar</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrap} style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
              <Icon name="payments" size={26} />
            </div>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>Oylik Obuna (MRR)</span>
              <span className={styles.kpiValue}>
                {new Intl.NumberFormat('uz-UZ').format(stats.estimatedMRR || 0)} UZS
              </span>
              <span className={styles.kpiSub}>• Faol litsenziyalar bo'yicha</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabsBar}>
          <button
            onClick={() => setActiveTab('applications')}
            className={`${styles.tabBtn} ${activeTab === 'applications' ? styles.tabBtnActive : ''}`}
          >
            <Icon name="inbox" size={18} />
            <span>Tushgan Arizalar (Demo so'rovlari)</span>
            <span className={styles.tabBadge}>{applications.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('clinics')}
            className={`${styles.tabBtn} ${activeTab === 'clinics' ? styles.tabBtnActive : ''}`}
          >
            <Icon name="apartment" size={18} />
            <span>Klinikalar Boshqaruvi</span>
            <span className={styles.tabBadge}>{clinics.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabBtnActive : ''}`}
          >
            <Icon name="verified_user" size={18} />
            <span>Xodimlar va Huquqlar (RBAC)</span>
            <span className={styles.tabBadge}>{users.length}</span>
          </button>
        </div>

        {/* Tab 1: Applications (Leads) */}
        {activeTab === 'applications' && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionFilterBar}>
              <div className={styles.searchBox}>
                <Icon name="search" size={18} />
                <input
                  type="text"
                  placeholder="Ism, klinika yoki telefon orqali qidirish..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                />
              </div>

              <div className={styles.filterControlsGroup}>
                <select
                  className={styles.filterSelect}
                  value={appStatus}
                  onChange={(e) => setAppStatus(e.target.value)}
                >
                  <option value="all">Barcha statuslar</option>
                  <option value="new">Yangi (new)</option>
                  <option value="contacted">Bog'lanildi (contacted)</option>
                  <option value="approved">Tasdiqlandi (approved)</option>
                  <option value="rejected">Rad etildi (rejected)</option>
                </select>
              </div>
            </div>

            <div className={styles.tableResponsive}>
              {loading ? (
                <div className={styles.emptyState}>Ma'lumotlar yuklanmoqda...</div>
              ) : filteredApps.length === 0 ? (
                <div className={styles.emptyState}>Hozircha hech qanday ariza topilmadi.</div>
              ) : (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Mas'ul Shaxs</th>
                      <th>Klinika Nomi</th>
                      <th>Telefon</th>
                      <th>Kreslolar</th>
                      <th>Xabar / Izoh</th>
                      <th>Yuborilgan Vaqti</th>
                      <th>Holati</th>
                      <th style={{ textAlign: 'right' }}>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <div className={styles.primaryText}>{app.name}</div>
                        </td>
                        <td>
                          <div className={styles.primaryText}>{app.clinicName || 'Ko\'rsatilmagan'}</div>
                        </td>
                        <td>
                          <a href={`tel:${app.phone}`} className={styles.phoneCell}>
                            {app.phone}
                          </a>
                        </td>
                        <td>
                          <span className={styles.secondaryText}>{app.chairsCount || '1-3'} ta</span>
                        </td>
                        <td>
                          <div style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.message}>
                            {app.message || '—'}
                          </div>
                        </td>
                        <td className={styles.nowrapCell}>
                          <span className={styles.secondaryText}>
                            {new Date(app.createdAt).toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              app.status === 'new'
                                ? styles.statusNew
                                : app.status === 'approved'
                                ? styles.statusApproved
                                : app.status === 'contacted'
                                ? styles.statusContacted
                                : styles.statusRejected
                            }`}
                          >
                            {app.status === 'new' ? 'Yangi' : app.status === 'approved' ? 'Faollashtirildi' : app.status === 'contacted' ? 'Bog\'lanildi' : 'Rad etildi'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actionBtnGroup}>
                            {app.status !== 'approved' ? (
                              <button
                                onClick={() => handleOpenOnboardFromApp(app)}
                                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                                title="Ushbu arizadan klinika ochish va hisob yaratish"
                              >
                                <Icon name="bolt" size={15} />
                                <span>Klinika ochish</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                                ✓ Ulangan
                              </span>
                            )}

                            {app.status === 'new' && (
                              <button
                                onClick={() => handleUpdateAppStatus(app, 'contacted')}
                                className={`${styles.actionBtn} ${styles.actionBtnSoftCyan}`}
                                title="Bog'lanildi deb belgilash"
                              >
                                <Icon name="phone_callback" size={13} />
                                <span>Bog'lanildi</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteAppPrompt(app)}
                              className={styles.actionBtnSoftIcon}
                              title="Arizani o'chirish"
                            >
                              <Icon name="delete" size={14} />
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

        {/* Tab 2: Clinics Directory */}
        {activeTab === 'clinics' && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionFilterBar}>
              <div className={styles.searchBox}>
                <Icon name="search" size={18} />
                <input
                  type="text"
                  placeholder="Klinika nomi, egasi yoki email orqali qidirish..."
                  value={clinicSearch}
                  onChange={(e) => setClinicSearch(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.tableResponsive}>
              {loading ? (
                <div className={styles.emptyState}>Ma'lumotlar yuklanmoqda...</div>
              ) : filteredClinics.length === 0 ? (
                <div className={styles.emptyState}>Hech qanday klinika topilmadi.</div>
              ) : (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Klinika</th>
                      <th>Bosh Shifokor (Rahbar)</th>
                      <th>Aloqa</th>
                      <th>Tarif</th>
                      <th>Shifokorlar / Bemorlar</th>
                      <th>Holati</th>
                      <th style={{ textAlign: 'right' }}>Boshqarish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClinics.map((clinic) => (
                      <tr key={clinic.id}>
                        <td>
                          <div className={styles.primaryText}>{clinic.name}</div>
                          <div className={styles.secondaryText}>{clinic.address || 'Toshkent sh.'}</div>
                        </td>
                        <td>
                          <div className={styles.primaryText}>{clinic.ownerName || clinic.owner?.name || '—'}</div>
                          <div className={styles.secondaryText}>{clinic.email || clinic.owner?.email || '—'}</div>
                        </td>
                        <td>
                          <a href={`tel:${clinic.phone}`} className={styles.phoneCell}>
                            {clinic.phone || '—'}
                          </a>
                          <div className={styles.secondaryText}>{clinic.chairsCount || 1} ta kreslo</div>
                        </td>
                        <td>
                          <span
                            className={`${styles.planBadge} ${
                              clinic.subscriptionPlan === 'enterprise'
                                ? styles.planEnterprise
                                : clinic.subscriptionPlan === 'pro'
                                ? styles.planPro
                                : styles.planStarter
                            }`}
                          >
                            {clinic.subscriptionPlan || 'starter'}
                          </span>
                        </td>
                        <td className={styles.nowrapCell}>
                          <span className={styles.primaryText}>{clinic.doctorsCount || 0} shifokor</span>
                          <span className={styles.secondaryText}> / {clinic.patientsCount || 0} bemor</span>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              clinic.status === 'active' ? styles.statusActive : styles.statusSuspended
                            }`}
                          >
                            {clinic.status === 'active' ? '● Faol' : '● To\'xtatilgan'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actionBtnGroup}>
                            <button
                              onClick={() => handleViewClinicStaff(clinic)}
                              className={`${styles.actionBtn} ${styles.actionBtnSoftCyan}`}
                              title="Ushbu klinika xodimlarini ko'rish va sozlash"
                            >
                              <Icon name="group" size={14} />
                              <span>Xodimlar ({clinic.doctorsCount || 0})</span>
                            </button>

                            <button
                              onClick={() => handleOpenExtendPlan(clinic)}
                              className={`${styles.actionBtn} ${styles.actionBtnSoftPurple}`}
                              title="Obunani uzaytirish"
                            >
                              <Icon name="schedule" size={14} />
                              <span>Uzaytirish</span>
                            </button>

                            <button
                              onClick={() => handleToggleClinicStatus(clinic)}
                              className={`${styles.actionBtn} ${
                                clinic.status === 'active' ? styles.actionBtnSoftDanger : styles.actionBtnSoftSuccess
                              }`}
                              title={clinic.status === 'active' ? 'Klinikani vaqtincha bloklash' : 'Qayta faollashtirish'}
                            >
                              <Icon name={clinic.status === 'active' ? 'pause_circle' : 'play_circle'} size={13} />
                              <span>{clinic.status === 'active' ? 'Bloklash' : 'Ochish'}</span>
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

        {/* Tab 3: Users & Access Rights (RBAC) */}
        {activeTab === 'users' && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionFilterBar}>
              <div className={styles.searchBox}>
                <Icon name="search" size={18} />
                <input
                  type="text"
                  placeholder="Ism, login, email yoki telefon orqali qidirish..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div className={styles.filterControlsGroup}>
                {/* Clinic Filter */}
                <select
                  className={styles.filterSelect}
                  value={userClinicFilter}
                  onChange={(e) => setUserClinicFilter(e.target.value)}
                >
                  <option value="all">Barcha klinikalar</option>
                  <option value="unassigned">Biriktirilmagan / Superadmin</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Role Filter */}
                <select
                  className={styles.filterSelect}
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="all">Barcha rollar</option>
                  <option value="superadmin">👑 SuperAdmin</option>
                  <option value="owner">Klinika Egasi (Owner)</option>
                  <option value="doctor">Shifokor (Doctor)</option>
                  <option value="receptionist">Administrator (Receptionist)</option>
                  <option value="nurse">Hamshira (Nurse)</option>
                </select>
              </div>
            </div>

            {/* If a clinic is filtered, display a convenient active indicator */}
            {userClinicFilter !== 'all' && (
              <div className={styles.activeFilterBanner}>
                <span>
                  Hozirda <strong>{selectedClinicForStaff?.name || 'Biriktirilmagan xodimlar'}</strong> filtri faol ({filteredUsers.length} ta xodim).
                </span>
                <button onClick={() => setUserClinicFilter('all')} className={styles.clearFilterBtn}>
                  Filtrni tozalash ✕
                </button>
              </div>
            )}

            <div className={styles.tableResponsive}>
              {loading ? (
                <div className={styles.emptyState}>Foydalanuvchilar yuklanmoqda...</div>
              ) : filteredUsers.length === 0 ? (
                <div className={styles.emptyState}>Hech qanday foydalanuvchi topilmadi.</div>
              ) : (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Foydalanuvchi</th>
                      <th>Roli (Vakolati)</th>
                      <th>Biriktirilgan Klinika</th>
                      <th>Telefon</th>
                      <th>Kirish Huquqi</th>
                      <th>Qo'shilgan Sana</th>
                      <th style={{ textAlign: 'right' }}>Huquqlarni Boshqarish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className={styles.userCell}>
                            <div
                              className={styles.userTableAvatar}
                              style={{
                                background:
                                  u.role === 'superadmin'
                                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                    : u.role === 'owner'
                                    ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                                    : u.role === 'doctor'
                                    ? 'linear-gradient(135deg, #06b6d4, #0891b2)'
                                    : u.role === 'nurse'
                                    ? 'linear-gradient(135deg, #10b981, #059669)'
                                    : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                              }}
                            >
                              {u.name
                                .split(' ')
                                .map((n) => n[0])
                                .filter(Boolean)
                                .slice(0, 2)
                                .join('')
                                .toUpperCase() || 'U'}
                            </div>
                            <div className={styles.userTableMeta}>
                              <div className={styles.primaryText}>{u.name}</div>
                              <div className={styles.secondaryText}>
                                {u.username ? `@${u.username} • ` : ''}{u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${styles.roleBadge} ${
                              u.role === 'superadmin'
                                ? styles.roleSuperadmin
                                : u.role === 'owner'
                                ? styles.roleOwner
                                : u.role === 'doctor'
                                ? styles.roleDoctor
                                : u.role === 'receptionist'
                                ? styles.roleReceptionist
                                : styles.roleNurse
                            }`}
                          >
                            {u.role === 'superadmin' && '👑 '}
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <div className={styles.primaryText}>
                            {u.clinic?.name || (u.role === 'superadmin' ? 'DentUz Platformasi' : 'Biriktirilmagan')}
                          </div>
                        </td>
                        <td>
                          {u.phone ? (
                            <a href={`tel:${u.phone}`} className={styles.phoneCell}>
                              {u.phone}
                            </a>
                          ) : (
                            <span className={styles.secondaryText}>—</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              u.isActive ? styles.statusActive : styles.statusSuspended
                            }`}
                          >
                            {u.isActive ? '● Faol (Kirish mumkin)' : '● Bloklangan'}
                          </span>
                        </td>
                        <td className={styles.nowrapCell}>
                          <span className={styles.secondaryText}>
                            {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actionBtnGroup}>
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={`${styles.actionBtn} ${
                                u.isActive ? styles.actionBtnSoftDanger : styles.actionBtnSoftSuccess
                              }`}
                              title={u.isActive ? 'Foydalanuvchini bloklash' : 'Kirish huquqini qayta yoqish'}
                            >
                              <Icon name={u.isActive ? 'block' : 'check_circle'} size={13} />
                              <span>{u.isActive ? 'Bloklash' : 'Ruxsat berish'}</span>
                            </button>

                            <button
                              onClick={() => handleOpenRoleModal(u)}
                              className={`${styles.actionBtn} ${styles.actionBtnSoftCyan}`}
                              title="Rolni o'zgartirish"
                            >
                              <Icon name="manage_accounts" size={14} />
                              <span>Rol</span>
                            </button>

                            <button
                              onClick={() => handleOpenPasswordModal(u)}
                              className={`${styles.actionBtn} ${styles.actionBtnSoftPurple}`}
                              title="Parolni yangilash"
                            >
                              <Icon name="key" size={14} />
                              <span>Parol</span>
                            </button>

                            {u.role !== 'superadmin' && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className={styles.actionBtnSoftIcon}
                                title="O'chirish"
                              >
                                <Icon name="delete" size={14} />
                              </button>
                            )}
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
      </main>

      {/* =========================================================
          MODAL 1: Role Change Modal (NO prompt/alert!)
         ========================================================= */}
      {roleModal.isOpen && roleModal.user && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} ${styles.modalCardSm}`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Foydalanuvchi Rolini O'zgartirish</h2>
              <button
                onClick={() => setRoleModal((prev) => ({ ...prev, isOpen: false }))}
                className={styles.modalCloseBtn}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.targetUserSummary}>
                <div className={styles.targetUserMeta}>
                  <strong className={styles.primaryText}>{roleModal.user.name}</strong>
                  <span className={styles.secondaryText}>{roleModal.user.email}</span>
                </div>
                <span className={styles.statusBadge}>
                  Joriy: <strong>{roleModal.user.role}</strong>
                </span>
              </div>

              <div className={styles.roleSelectorGrid}>
                {rolesList.map((r) => {
                  const isSelected = roleModal.selectedRole === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setRoleModal((prev) => ({ ...prev, selectedRole: r.id }))}
                      className={`${styles.roleCard} ${isSelected ? styles.roleCardActive : ''}`}
                    >
                      <div className={styles.roleRadioCheck}>
                        {isSelected && <div className={styles.roleRadioInnerDot} />}
                      </div>

                      <div className={styles.roleCardInfo}>
                        <div className={styles.roleCardTitle}>
                          <span>{r.name}</span>
                        </div>
                        <span className={styles.roleCardDesc}>{r.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setRoleModal((prev) => ({ ...prev, isOpen: false }))}
                className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={roleModal.loading}
                onClick={handleSaveRole}
                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              >
                {roleModal.loading ? 'Saqlanmoqda...' : 'Rolni Yangilash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: Password Reset Modal (NO prompt/alert!)
         ========================================================= */}
      {passwordModal.isOpen && passwordModal.user && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} ${styles.modalCardSm}`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Parolni Yangilash</h2>
              <button
                onClick={() => setPasswordModal((prev) => ({ ...prev, isOpen: false }))}
                className={styles.modalCloseBtn}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.targetUserSummary}>
                <div className={styles.targetUserMeta}>
                  <strong className={styles.primaryText}>{passwordModal.user.name}</strong>
                  <span className={styles.secondaryText}>{passwordModal.user.email}</span>
                </div>
                <span className={styles.roleBadge}>{passwordModal.user.role}</span>
              </div>

              <div className={styles.passwordBoxWrap}>
                <div className={styles.formGroup}>
                  <label>Yangi Parol (Kamida 6 ta belgi)</label>
                  <div className={styles.passwordInputContainer}>
                    <input
                      type={passwordModal.showPassword ? 'text' : 'password'}
                      value={passwordModal.newPassword}
                      onChange={(e) =>
                        setPasswordModal((prev) => ({ ...prev, newPassword: e.target.value }))
                      }
                      placeholder="Yangi parol kiriting..."
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPasswordModal((prev) => ({ ...prev, showPassword: !prev.showPassword }))
                      }
                      className={styles.passVisibilityBtn}
                      title="Parolni ko'rsatish/yashirish"
                    >
                      <Icon
                        name={passwordModal.showPassword ? 'visibility_off' : 'visibility'}
                        size={18}
                      />
                    </button>
                  </div>
                </div>

                <div className={styles.passActionsRow}>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = generateRandomPassword();
                      setPasswordModal((prev) => ({ ...prev, newPassword: rand }));
                    }}
                    className={styles.generatePassBtn}
                  >
                    <Icon name="autorenew" size={16} />
                    <span>Tasodifiy kuchli parol yaratish</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(passwordModal.newPassword);
                      setPasswordModal((prev) => ({ ...prev, copied: true }));
                      showToast('Parol nusxalandi! ✓');
                      setTimeout(() => setPasswordModal((prev) => ({ ...prev, copied: false })), 2000);
                    }}
                    className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
                  >
                    <Icon name="content_copy" size={16} />
                    <span>{passwordModal.copied ? 'Nusxalandi!' : 'Nusxalash'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setPasswordModal((prev) => ({ ...prev, isOpen: false }))}
                className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={passwordModal.loading}
                onClick={handleSavePassword}
                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              >
                {passwordModal.loading ? 'Saqlanmoqda...' : 'Parolni Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: Action Confirm Modal (NO window.confirm!)
         ========================================================= */}
      {confirmModal.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} ${styles.modalCardSm}`}>
            <div className={styles.modalBody}>
              <div className={styles.confirmBody}>
                <div
                  className={`${styles.confirmIconWrap} ${
                    confirmModal.isDanger
                      ? styles.confirmIconDanger
                      : confirmModal.icon === 'check_circle'
                      ? styles.confirmIconSuccess
                      : styles.confirmIconWarning
                  }`}
                >
                  <Icon name={confirmModal.icon || 'warning'} size={32} />
                </div>
                <h3 className={styles.confirmTitle}>{confirmModal.title}</h3>
                <p className={styles.confirmDesc}>{confirmModal.message}</p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
              >
                {confirmModal.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`${styles.actionBtn} ${
                  confirmModal.isDanger ? styles.actionBtnDanger : styles.actionBtnPrimary
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: Extend Plan Modal (NO prompt/alert!)
         ========================================================= */}
      {extendPlanModal.isOpen && extendPlanModal.clinic && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} ${styles.modalCardSm}`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Obuna Muddatini Uzaytirish</h2>
              <button
                onClick={() => setExtendPlanModal((prev) => ({ ...prev, isOpen: false }))}
                className={styles.modalCloseBtn}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.targetUserSummary}>
                <div className={styles.targetUserMeta}>
                  <strong className={styles.primaryText}>{extendPlanModal.clinic.name}</strong>
                  <span className={styles.secondaryText}>
                    Bosh shifokor: {extendPlanModal.clinic.ownerName || '—'}
                  </span>
                </div>
                <span className={styles.planBadge}>{extendPlanModal.clinic.subscriptionPlan || 'pro'}</span>
              </div>

              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate, #64748b)' }}>
                Qo'shiladigan muddatni tanlang:
              </label>

              <div className={styles.planOptionsGrid}>
                {[
                  { m: 1, label: '1 Oy', sub: 'Qisqa sinov' },
                  { m: 3, label: '3 Oy', sub: 'Kvartal litsenziyasi' },
                  { m: 6, label: '6 Oy', sub: 'Yarim yillik' },
                  { m: 12, label: '1 Yil (12 oy)', sub: 'Tavsiya etiladi' },
                  { m: 24, label: '2 Yil (24 oy)', sub: 'Maksimal chegirma' },
                ].map((opt) => (
                  <div
                    key={opt.m}
                    onClick={() => setExtendPlanModal((prev) => ({ ...prev, months: opt.m }))}
                    className={`${styles.planOptionCard} ${
                      extendPlanModal.months === opt.m ? styles.planOptionCardActive : ''
                    }`}
                  >
                    <span className={styles.planMonths}>{opt.label}</span>
                    <span className={styles.planPriceEstimate}>{opt.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setExtendPlanModal((prev) => ({ ...prev, isOpen: false }))}
                className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={extendPlanModal.loading}
                onClick={handleSaveExtendPlan}
                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              >
                {extendPlanModal.loading ? 'Uzaytirilmoqda...' : 'Obunani Uzaytirish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 5: Onboarding Modal
         ========================================================= */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {onboardSuccessData ? 'Klinika Muvaffaqiyatli Ulashildi! 🎉' : 'Yangi Klinikani Tizimga Ulash (Onboarding)'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className={styles.modalCloseBtn}>
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {onboardSuccessData ? (
                /* Success View: Display credentials & ready Telegram notification */
                <div className={styles.successCard}>
                  <div className={styles.successIcon}>
                    <Icon name="check_circle" size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>
                    {onboardSuccessData.clinic.name} profili yaratildi!
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#475569' }}>
                    Quyidagi kirish ma'lumotlarini nusxalab, klinika rahbariga yuboring:
                  </p>

                  <div className={styles.credentialsBox}>
                    <div className={styles.credRow}>
                      <span className={styles.credLabel}>Login (Email):</span>
                      <span className={styles.credValue}>{onboardSuccessData.credentials.email}</span>
                    </div>
                    <div className={styles.credRow}>
                      <span className={styles.credLabel}>Vaqtinchalik Parol:</span>
                      <span className={styles.credValue} style={{ color: '#0284c7' }}>
                        {onboardSuccessData.credentials.plainPassword}
                      </span>
                    </div>
                    <div className={styles.credRow}>
                      <span className={styles.credLabel}>Kirish havolasi:</span>
                      <span className={styles.credValue}>http://localhost:3001/login</span>
                    </div>
                  </div>

                  <div className={styles.telegramMessageWrap}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                      Klinika egasiga Telegram/SMS orqali yuborish uchun tayyor matn:
                    </label>
                    <textarea readOnly value={onboardSuccessData.notificationText} />

                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleCopy(onboardSuccessData.notificationText, 'msg')}
                        className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                        style={{ flex: 1, padding: '10px' }}
                      >
                        <Icon name="content_copy" size={16} />
                        <span>{copyStatus === 'msg' ? 'Nusxalandi! ✓' : 'Xabarni nusxalash (Telegram)'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(onboardSuccessData.credentials.plainPassword, 'pwd')}
                        className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
                        style={{ padding: '10px' }}
                      >
                        <span>{copyStatus === 'pwd' ? 'Nusxalandi!' : 'Faqat parolni nusxalash'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Form View */
                <form id="onboardForm" onSubmit={handleSubmitOnboard}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Klinika Nomi *</label>
                      <input
                        type="text"
                        required
                        placeholder="masalan: Stoma Dental Care"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Bosh Shifokor (Rahbar) *</label>
                      <input
                        type="text"
                        required
                        placeholder="masalan: Dr. Sardor Rahimov"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Email (Login uchun) *</label>
                      <input
                        type="email"
                        required
                        placeholder="doktor@klinika.uz"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Telefon Raqami *</label>
                      <input
                        type="text"
                        required
                        placeholder="+998 90 123 45 67"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Obuna Tarifi</label>
                      <select
                        value={formData.subscriptionPlan}
                        onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                      >
                        <option value="starter">Starter (1-2 kreslo)</option>
                        <option value="pro">Pro (3-5 kreslo)</option>
                        <option value="enterprise">Enterprise (Katta klinika)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Kreslolar soni</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={formData.chairsCount}
                        onChange={(e) => setFormData({ ...formData, chairsCount: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroupFull}>
                      <label>Parol (Bo'sh qoldirsangiz, avtomatik yaratiladi)</label>
                      <input
                        type="text"
                        placeholder="masalan: DentUz2026! (ixtiyoriy)"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroupFull}>
                      <label>Klinika Manzili</label>
                      <input
                        type="text"
                        placeholder="Toshkent sh., Yunusobod tumani..."
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className={styles.modalFooter}>
              {onboardSuccessData ? (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                  style={{ padding: '10px 20px' }}
                >
                  Tayyor & Yopish
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    form="onboardForm"
                    disabled={modalLoading}
                    className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                  >
                    {modalLoading ? 'Faollashtirilmoqda...' : 'Tasdiqlash va Hisob Ochish'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 6: Create User / Staff Modal
         ========================================================= */}
      {isUserModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Yangi Xodim / Foydalanuvchi Qo'shish</h2>
              <button onClick={() => setIsUserModalOpen(false)} className={styles.modalCloseBtn}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCreateUser}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>F.I.Sh (Ism Familiya) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Anvar Aliyev"
                      value={userFormData.name}
                      onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Login (Username)</label>
                    <input
                      type="text"
                      placeholder="anvar_dr (ixtiyoriy)"
                      value={userFormData.username}
                      onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="anvar@klinika.uz"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Parol *</label>
                    <input
                      type="text"
                      required
                      placeholder="Parol kiriting..."
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Roli (Kirish Huquqi) *</label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    >
                      <option value="doctor">Shifokor (Doctor)</option>
                      <option value="receptionist">Qabulxona (Receptionist)</option>
                      <option value="nurse">Hamshira (Nurse)</option>
                      <option value="owner">Klinika Rahbari (Owner)</option>
                      <option value="superadmin">SuperAdmin</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Biriktirilgan Klinika</label>
                    <select
                      value={userFormData.clinicId}
                      onChange={(e) => setUserFormData({ ...userFormData, clinicId: e.target.value })}
                    >
                      <option value="">— Klinika tanlang —</option>
                      {clinics.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Telefon Raqami</label>
                    <input
                      type="text"
                      placeholder="+998 90 000 00 00"
                      value={userFormData.phone}
                      onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Lavozimi / Mutaxassisligi</label>
                    <input
                      type="text"
                      placeholder="Terapevt, Ortodont..."
                      value={userFormData.title}
                      onChange={(e) => setUserFormData({ ...userFormData, title: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                >
                  {modalLoading ? 'Yaratilmoqda...' : 'Foydalanuvchini Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
