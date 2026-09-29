import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import Logo from '../../components/Logo/Logo';
import Icon from '../../components/Icon/Icon';
import styles from './SuperAdmin.module.css';

// Sleek Custom Dropdown (No native OS select box glitches)
function CustomDropdown({ value, options, onChange, placeholder, icon }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.customDropdownContainer} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={styles.customDropdownTrigger}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon && <Icon name={icon} size={16} />}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={18} />
      </button>

      {open && (
        <div className={styles.customDropdownMenu}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`${styles.customDropdownItem} ${
                opt.value === value ? styles.customDropdownItemActive : ''
              }`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {opt.icon && <Icon name={opt.icon} size={15} />}
                <span>{opt.label}</span>
              </div>
              {opt.value === value && <Icon name="check" size={16} style={{ color: '#06b6d4' }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SuperAdmin() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('clinics'); // 'clinics' | 'applications' | 'superadmins'
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

  // Dedicated Clinic Workspace View State
  const [selectedClinicDetail, setSelectedClinicDetail] = useState(null);

  // Filters
  const [appSearch, setAppSearch] = useState('');
  const [appStatus, setAppStatus] = useState('all');
  const [clinicSearch, setClinicSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('all');

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

  // Telegram Credentials Sharing Modal
  const [telegramModal, setTelegramModal] = useState({
    isOpen: false,
    clinicName: '',
    employeeName: '',
    role: '',
    login: '',
    password: '',
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

  // Custom Modal: Role Change
  const [roleModal, setRoleModal] = useState({
    isOpen: false,
    user: null,
    selectedRole: 'doctor',
    loading: false,
  });

  // Custom Modal: Password Reset
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    user: null,
    newPassword: '',
    showPassword: true,
    copied: false,
    loading: false,
  });

  // Custom Modal: Confirm Action
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Tasdiqlash',
    cancelText: 'Bekor qilish',
    icon: 'warning',
    isDanger: true,
    onConfirm: null,
    loading: false,
  });

  // Custom Modal: Extend Subscription
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
        if (cData.success) {
          setClinics(cData.data);
          // If a clinic was open, update its reference with functional updater
          setSelectedClinicDetail((prev) => {
            if (!prev) return null;
            return cData.data.find((c) => c.id === prev.id) || prev;
          });
        }
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

  // Helper: Strong password generator
  const generateRandomPassword = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const num = Math.floor(1000 + Math.random() * 9000);
    return `DentUz#${num}!`;
  };

  // Helper: Clean auto username generator from full name
  const generateUsernameFromName = (name, clinicName = '') => {
    if (!name) return `xodim_${Math.floor(100 + Math.random() * 900)}`;
    const clean = name
      .toLowerCase()
      .replace(/dr\.?/g, '')
      .trim()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/__+/g, '_')
      .replace(/^_|_$/g, '');
    const cSlug = clinicName
      ? clinicName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5)
      : '';
    return cSlug ? `${clean}_${cSlug}` : clean || `xodim_${Math.floor(1000 + Math.random() * 9000)}`;
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
        showToast('Klinika va uning egasi muvaffaqiyatli ulandi! 🎉');
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

  // Submit Create New User (inside a clinic)
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
        showToast('Xodim muvaffaqiyatli yaratildi!');
        setIsUserModalOpen(false);

        // Open Telegram credentials modal for instant copy to clinic head
        const clName =
          clinics.find((c) => c.id === userFormData.clinicId)?.name ||
          selectedClinicDetail?.name ||
          'Klinika';
        setTelegramModal({
          isOpen: true,
          clinicName: clName,
          employeeName: userFormData.name,
          role: userFormData.role,
          login: userFormData.username || userFormData.email,
          password: userFormData.password,
        });

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

  // Helper: Open New User Modal with pre-locked clinic
  const handleOpenAddStaffForClinic = (clinic) => {
    const autoPass = generateRandomPassword();
    setUserFormData({
      name: '',
      username: '',
      email: '',
      password: autoPass,
      role: 'doctor',
      clinicId: clinic.id,
      phone: '',
      title: '',
    });
    setIsUserModalOpen(true);
  };

  // Open Telegram modal for an existing employee
  const handleOpenTelegramForEmployee = (employee, clinic) => {
    setTelegramModal({
      isOpen: true,
      clinicName: clinic?.name || 'Klinika',
      employeeName: employee.name,
      role: employee.role,
      login: employee.username || employee.email,
      password: '*(Avval o\'rnatilgan parol yoki parolni yangilash tugmasidan oling)*',
    });
  };

  // Application actions
  const handleUpdateAppStatus = async (app, newStatus) => {
    try {
      const res = await fetch(`${baseUrl}/superadmin/applications/${app.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Ariza holati yangilandi: ${newStatus}`);
        loadData();
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

  // Clinic actions
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

  // User actions
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
      }
    } catch (err) {
      showToast('Xatolik: ' + err.message, 'error');
    } finally {
      setRoleModal((prev) => ({ ...prev, loading: false }));
    }
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

        // Offer to share updated credentials via Telegram
        const targetClinic = clinics.find((c) => c.id === passwordModal.user.clinicId);
        setTelegramModal({
          isOpen: true,
          clinicName: targetClinic?.name || 'Klinika',
          employeeName: passwordModal.user.name,
          role: passwordModal.user.role,
          login: passwordModal.user.username || passwordModal.user.email,
          password: passwordModal.newPassword.trim(),
        });
      }
    } catch (err) {
      showToast('Xatolik: ' + err.message, 'error');
    } finally {
      setPasswordModal((prev) => ({ ...prev, loading: false }));
    }
  };

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

  const handleDeleteUser = (targetUser) => {
    setConfirmModal({
      isOpen: true,
      title: "Foydalanuvchini o'chirish",
      message: `"${targetUser.name}" (${targetUser.email}) hisobini butunlay o'chirib tashlashni tasdiqlaysizmi?`,
      confirmText: "O'chirish",
      cancelText: "Bekor qilish",
      icon: 'delete',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`${baseUrl}/superadmin/users/${targetUser.id}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast('Foydalanuvchi tizimdan o\'chirildi');
            loadData();
          } else {
            showToast(data.message || 'Xatolik yuz berdi', 'error');
          }
        } catch (err) {
          showToast('Xatolik: ' + err.message, 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Copy helper
  const handleCopy = (text, type = '') => {
    navigator.clipboard.writeText(text);
    setCopyStatus(type);
    showToast('Nusxalandi! ✓');
    setTimeout(() => setCopyStatus(''), 2500);
  };

  // Build Telegram ready text
  const generateTelegramShareText = (m) => {
    return `🏥 "${m.clinicName}" xodimi uchun kirish ma'lumotlari:

👤 Xodim: ${m.employeeName}
💼 Lavozimi: ${m.role}
🔑 Login (Username/Email): ${m.login}
🔒 Parol: ${m.password}
🌐 Kirish havolasi: http://localhost:3001/login

Iltimos, birinchi marta kirgach, xavfsizlik uchun parolingizni yangilab oling.`;
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

  // Filtered staff for Selected Clinic
  const clinicStaff = selectedClinicDetail
    ? users.filter((u) => {
        if (u.clinicId !== selectedClinicDetail.id) return false;
        const matchRole = staffRoleFilter === 'all' || u.role === staffRoleFilter;
        const matchSearch =
          !staffSearch ||
          (u.name && u.name.toLowerCase().includes(staffSearch.toLowerCase())) ||
          (u.email && u.email.toLowerCase().includes(staffSearch.toLowerCase())) ||
          (u.username && u.username.toLowerCase().includes(staffSearch.toLowerCase())) ||
          (u.phone && u.phone.includes(staffSearch));
        return matchRole && matchSearch;
      })
    : [];

  // SuperAdmins (Platform level accounts)
  const platformSuperAdmins = users.filter((u) => u.role === 'superadmin');

  // Role list options for custom dropdown
  const roleDropdownOptions = [
    { value: 'all', label: 'Barcha rollar', icon: 'filter_list' },
    { value: 'owner', label: 'Klinika Egasi (Owner)', icon: 'apartment' },
    { value: 'doctor', label: 'Shifokor (Doctor)', icon: 'medical_services' },
    { value: 'receptionist', label: 'Administrator (Receptionist)', icon: 'calendar_month' },
    { value: 'nurse', label: 'Hamshira (Nurse)', icon: 'vaccines' },
  ];

  const appStatusOptions = [
    { value: 'all', label: 'Barcha statuslar', icon: 'filter_list' },
    { value: 'new', label: 'Yangi (new)', icon: 'mark_email_unread' },
    { value: 'contacted', label: 'Bog\'lanildi (contacted)', icon: 'phone_callback' },
    { value: 'approved', label: 'Tasdiqlandi (approved)', icon: 'verified' },
    { value: 'rejected', label: 'Rad etildi (rejected)', icon: 'cancel' },
  ];

  const rolesList = [
    {
      id: 'doctor',
      name: 'Shifokor (Doctor)',
      desc: 'Bemorlarni qabul qilish, tashxis, muolaja va davolash jurnallari',
      badgeClass: styles.roleDoctor,
    },
    {
      id: 'receptionist',
      name: 'Administrator (Receptionist)',
      desc: 'Navbatga yozish, kassa/to\'lovlar, yangi bemor kartochkasini ochish',
      badgeClass: styles.roleReceptionist,
    },
    {
      id: 'nurse',
      name: 'Hamshira (Nurse)',
      desc: 'Muolaja xonalari, asboblarni sterilizatsiya qilish, vrachga yordam',
      badgeClass: styles.roleNurse,
    },
    {
      id: 'owner',
      name: 'Klinika Egasi (Owner)',
      desc: 'Klinika ichidagi barcha shifokorlar, moliya va xizmatlarni to\'liq boshqarish',
      badgeClass: styles.roleOwner,
    },
    {
      id: 'superadmin',
      name: '👑 SuperAdmin (DentUz Egasi)',
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
        {/* Page Title & Header Actions */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>DentUz SaaS Boshqaruv Markazi</h1>
            <p className={styles.pageSubtitle}>
              Klinikalar, ularning xodimlari va arizalarini alohida, aralashtirmasdan qulay boshqaring.
            </p>
          </div>

          <div className={styles.headerActions}>
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
              <span className={styles.kpiSub}>• Barcha tizim hisoblari</span>
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
              <span className={styles.kpiSub}>• Faol obunalar bo'yicha</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabsBar}>
          <button
            onClick={() => {
              setActiveTab('clinics');
              setSelectedClinicDetail(null);
            }}
            className={`${styles.tabBtn} ${activeTab === 'clinics' ? styles.tabBtnActive : ''}`}
          >
            <Icon name="apartment" size={18} />
            <span>Klinikalar va Xodimlar Markazi</span>
            <span className={styles.tabBadge}>{clinics.length}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('applications');
              setSelectedClinicDetail(null);
            }}
            className={`${styles.tabBtn} ${activeTab === 'applications' ? styles.tabBtnActive : ''}`}
          >
            <Icon name="inbox" size={18} />
            <span>Tushgan Arizalar (Demo so'rovlari)</span>
            <span className={styles.tabBadge}>{applications.length}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('superadmins');
              setSelectedClinicDetail(null);
            }}
            className={`${styles.tabBtn} ${activeTab === 'superadmins' ? styles.tabBtnActive : ''}`}
          >
            <Icon name="admin_panel_settings" size={18} />
            <span>Platforma Asoschilari (SuperAdmin)</span>
            <span className={styles.tabBadge}>{platformSuperAdmins.length}</span>
          </button>
        </div>

        {/* TAB 1: CLINICS & THEIR STAFF WORKSPACE */}
        {activeTab === 'clinics' && (
          <div>
            {!selectedClinicDetail ? (
              /* VIEW A: LIST OF ALL CLINICS */
              <div className={styles.sectionCard}>
                <div className={styles.sectionFilterBar}>
                  <div className={styles.searchBox}>
                    <Icon name="search" size={18} />
                    <input
                      type="text"
                      placeholder="Klinika nomi, egasi yoki telefon orqali qidirish..."
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
                          <th>Xodimlar / Bemorlar</th>
                          <th>Klinika Holati (Bloklash)</th>
                          <th style={{ textAlign: 'right' }}>Amallar</th>
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
                              <span className={styles.primaryText}>{clinic.doctorsCount || 0} xodim</span>
                              <span className={styles.secondaryText}> / {clinic.patientsCount || 0} bemor</span>
                            </td>
                            <td>
                              <div className={styles.statusColumnWrap}>
                                <span
                                  className={`${styles.statusBadge} ${
                                    clinic.status === 'active' ? styles.statusActive : styles.statusSuspended
                                  }`}
                                >
                                  {clinic.status === 'active' ? '● Faol' : '● To\'xtatilgan'}
                                </span>
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
                            <td style={{ textAlign: 'right' }}>
                              <div className={styles.actionBtnGroup}>
                                <button
                                  onClick={() => setSelectedClinicDetail(clinic)}
                                  className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                                  title="Ushbu klinika ichiga kirish va uning xodimlarini alohida boshqarish"
                                >
                                  <Icon name="arrow_forward" size={14} />
                                  <span>Klinikaga Kirish & Xodimlar ({clinic.doctorsCount || 0})</span>
                                </button>

                                <button
                                  onClick={() => handleOpenExtendPlan(clinic)}
                                  className={`${styles.actionBtn} ${styles.actionBtnSoftPurple}`}
                                  title="Obunani uzaytirish"
                                >
                                  <Icon name="schedule" size={14} />
                                  <span>Uzaytirish</span>
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
            ) : (
              /* VIEW B: DEDICATED CLINIC WORKSPACE (NO OTHER CLINIC STAFF MIXED!) */
              <div className={styles.clinicWorkspaceWrap}>
                <button
                  onClick={() => setSelectedClinicDetail(null)}
                  className={styles.backToClinicsBtn}
                >
                  <Icon name="arrow_back" size={18} />
                  <span>Barcha Klinikalar Ro'yxatiga Qaytish</span>
                </button>

                {/* Clinic Hero Banner Card */}
                <div className={styles.clinicHeroCard}>
                  <div className={styles.clinicHeroLeft}>
                    <div className={styles.clinicHeroAvatar}>
                      <Icon name="domain" size={32} />
                    </div>
                    <div>
                      <div className={styles.clinicHeroTitle}>
                        <span>{selectedClinicDetail.name}</span>
                        <span
                          className={`${styles.statusBadge} ${
                            selectedClinicDetail.status === 'active'
                              ? styles.statusActive
                              : styles.statusSuspended
                          }`}
                        >
                          {selectedClinicDetail.status === 'active' ? '● Faol' : '● To\'xtatilgan'}
                        </span>
                        <span className={styles.planBadge}>{selectedClinicDetail.subscriptionPlan || 'pro'}</span>
                      </div>
                      <div className={styles.clinicHeroSub}>
                        <span><strong>Rahbar:</strong> {selectedClinicDetail.ownerName || '—'}</span>
                        <span>•</span>
                        <span><strong>Telefon:</strong> {selectedClinicDetail.phone || '—'}</span>
                        <span>•</span>
                        <span><strong>Manzil:</strong> {selectedClinicDetail.address || 'Toshkent sh.'}</span>
                        <span>•</span>
                        <span><strong>Kreslolar:</strong> {selectedClinicDetail.chairsCount || 1} ta</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.clinicHeroActions}>
                    <button
                      onClick={() => handleOpenAddStaffForClinic(selectedClinicDetail)}
                      className={styles.createClinicBtn}
                      style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                    >
                      <Icon name="person_add" size={18} />
                      <span>+ Ushbu Klinikaga Xodim Qo'shish</span>
                    </button>

                    <button
                      onClick={() => handleOpenExtendPlan(selectedClinicDetail)}
                      className={`${styles.actionBtn} ${styles.actionBtnSoftPurple}`}
                      style={{ height: '40px', padding: '0 14px' }}
                    >
                      <Icon name="schedule" size={16} />
                      <span>Obunani Uzaytirish</span>
                    </button>

                    <button
                      onClick={() => handleToggleClinicStatus(selectedClinicDetail)}
                      className={`${styles.actionBtn} ${
                        selectedClinicDetail.status === 'active'
                          ? styles.actionBtnSoftDanger
                          : styles.actionBtnSoftSuccess
                      }`}
                      style={{ height: '40px', padding: '0 14px' }}
                    >
                      <Icon
                        name={selectedClinicDetail.status === 'active' ? 'pause_circle' : 'play_circle'}
                        size={16}
                      />
                      <span>{selectedClinicDetail.status === 'active' ? 'Klinikani Bloklash' : 'Faollashtirish'}</span>
                    </button>
                  </div>
                </div>

                {/* Staff Section for this Clinic */}
                <div className={styles.sectionCard}>
                  <div className={styles.sectionFilterBar}>
                    <div className={styles.searchBox}>
                      <Icon name="search" size={18} />
                      <input
                        type="text"
                        placeholder={`"${selectedClinicDetail.name}" xodimlarini qidirish...`}
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                      />
                    </div>

                    <div className={styles.filterControlsGroup}>
                      {/* Custom styled Dropdown for Role Filter */}
                      <CustomDropdown
                        value={staffRoleFilter}
                        options={roleDropdownOptions}
                        onChange={setStaffRoleFilter}
                        placeholder="Barcha rollar"
                        icon="filter_alt"
                      />
                    </div>
                  </div>

                  <div className={styles.tableResponsive}>
                    {clinicStaff.length === 0 ? (
                      <div className={styles.emptyState}>
                        <Icon name="group_off" size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p>Hozircha ushbu klinikada xodimlar topilmadi.</p>
                        <button
                          onClick={() => handleOpenAddStaffForClinic(selectedClinicDetail)}
                          className={styles.createClinicBtn}
                          style={{ margin: '14px auto 0' }}
                        >
                          <Icon name="person_add" size={16} />
                          <span>Birinchi xodimni qo'shish</span>
                        </button>
                      </div>
                    ) : (
                      <table className={styles.dataTable}>
                        <thead>
                          <tr>
                            <th>Xodim (F.I.Sh)</th>
                            <th>Roli / Vazifasi</th>
                            <th>Login & Email</th>
                            <th>Telefon</th>
                            <th>Kirish Huquqi (Bloklash)</th>
                            <th>Qo'shilgan Sana</th>
                            <th style={{ textAlign: 'right' }}>Amallar & Telegram</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clinicStaff.map((u) => (
                            <tr key={u.id}>
                              <td>
                                <div className={styles.userCell}>
                                  <div
                                    className={styles.userTableAvatar}
                                    style={{
                                      background:
                                        u.role === 'owner'
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
                                    <div className={styles.secondaryText}>{u.title || 'Mutaxassis'}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span
                                  className={`${styles.roleBadge} ${
                                    u.role === 'owner'
                                      ? styles.roleOwner
                                      : u.role === 'doctor'
                                      ? styles.roleDoctor
                                      : u.role === 'receptionist'
                                      ? styles.roleReceptionist
                                      : styles.roleNurse
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td>
                                <div className={styles.primaryText}>{u.username ? `@${u.username}` : '—'}</div>
                                <div className={styles.secondaryText}>{u.email}</div>
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
                                <div className={styles.statusColumnWrap}>
                                  <span
                                    className={`${styles.statusBadge} ${
                                      u.isActive ? styles.statusActive : styles.statusSuspended
                                    }`}
                                  >
                                    {u.isActive ? '● Faol' : '● Bloklangan'}
                                  </span>
                                  <button
                                    onClick={() => handleToggleUserStatus(u)}
                                    className={`${styles.actionBtn} ${
                                      u.isActive ? styles.actionBtnSoftDanger : styles.actionBtnSoftSuccess
                                    }`}
                                    title={u.isActive ? 'Foydalanuvchini bloklash' : 'Kirish huquqini qayta yoqish'}
                                  >
                                    <Icon name={u.isActive ? 'block' : 'check_circle'} size={13} />
                                    <span>{u.isActive ? 'Bloklash' : 'Ochish'}</span>
                                  </button>
                                </div>
                              </td>
                              <td className={styles.nowrapCell}>
                                <span className={styles.secondaryText}>
                                  {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div className={styles.actionBtnGroup}>
                                  {/* Telegram Ready Message Button */}
                                  <button
                                    onClick={() => handleOpenTelegramForEmployee(u, selectedClinicDetail)}
                                    className={`${styles.actionBtn} ${styles.actionBtnSoftCyan}`}
                                    title="Klinika rahbariga Telegram orqali yuborish uchun ma'lumotlarni nusxalash"
                                  >
                                    <Icon name="send" size={13} />
                                    <span>Telegram</span>
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

                                  {u.role !== 'owner' && (
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
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPLICATIONS (DEMO SO'ROVLARI) */}
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
                <CustomDropdown
                  value={appStatus}
                  options={appStatusOptions}
                  onChange={setAppStatus}
                  placeholder="Status bo'yicha filter"
                  icon="filter_list"
                />
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
                                <Icon name="bolt" size={14} />
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

        {/* TAB 3: PLATFORM SUPERADMINS ONLY (NEVER MIXED WITH CLINIC STAFF!) */}
        {activeTab === 'superadmins' && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionFilterBar}>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--color-text-primary, #0f172a)' }}>
                  Platforma Asoschilari va Tizim Adminlari
                </strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-slate, #64748b)', margin: '2px 0 0' }}>
                  Bu hisoblar DentUz butun infratuzilmasi, serverlari va klinikalari ustidan to'liq nazoratga ega.
                </p>
              </div>
            </div>

            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Asoschi / SuperAdmin</th>
                    <th>Vakolat</th>
                    <th>Tizim</th>
                    <th>Kirish Holati</th>
                    <th>Qo'shilgan Sana</th>
                    <th style={{ textAlign: 'right' }}>Xavfsizlik & Parol</th>
                  </tr>
                </thead>
                <tbody>
                  {platformSuperAdmins.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div
                            className={styles.userTableAvatar}
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                          >
                            {u.name.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
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
                        <span className={`${styles.roleBadge} ${styles.roleSuperadmin}`}>
                          👑 SuperAdmin (Asoschi)
                        </span>
                      </td>
                      <td>
                        <span className={styles.primaryText}>DentUz Platformasi</span>
                      </td>
                      <td>
                        <span className={styles.protectedBadge}>
                          <Icon name="verified" size={13} />
                          <span>Faol (Himoyalangan)</span>
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
                            onClick={() => handleOpenPasswordModal(u)}
                            className={`${styles.actionBtn} ${styles.actionBtnSoftPurple}`}
                            title="Parolni yangilash"
                          >
                            <Icon name="key" size={14} />
                            <span>Parolni Yangilash</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================
          MODAL: TELEGRAM CREDENTIALS SHARING MODAL
         ========================================================= */}
      {telegramModal.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} ${styles.modalCardSm}`}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="send" size={22} style={{ color: '#0284c7' }} />
                <h2 className={styles.modalTitle}>Telegram uchun Tayyor Ma'lumot</h2>
              </div>
              <button
                onClick={() => setTelegramModal((prev) => ({ ...prev, isOpen: false }))}
                className={styles.modalCloseBtn}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-slate, #64748b)', marginBottom: '14px' }}>
                Ushbu tayyor matnni nusxalab, klinika rahbariga Telegram yoki SMS orqali yuborishingiz mumkin:
              </p>

              <div className={styles.telegramMessageWrap} style={{ margin: 0 }}>
                <textarea
                  readOnly
                  style={{ height: '170px', fontFamily: 'monospace', lineHeight: 1.5 }}
                  value={generateTelegramShareText(telegramModal)}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setTelegramModal((prev) => ({ ...prev, isOpen: false }))}
                className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
              >
                Yopish
              </button>

              <button
                type="button"
                onClick={() => handleCopy(generateTelegramShareText(telegramModal), 'tgMsg')}
                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                style={{ padding: '10px 18px' }}
              >
                <Icon name="content_copy" size={16} />
                <span>Nusxalash (Telegram)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: Role Change Modal
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
          MODAL: Password Reset Modal with Quick Telegram Sharing
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
                {passwordModal.loading ? 'Saqlanmoqda...' : 'Parolni Saqlash & Telegram'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: Confirm Action Modal
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
          MODAL: Extend Plan Modal
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
          MODAL: Onboarding Modal
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
          MODAL: Create User / Staff Modal (With Instant Auto-Generators)
         ========================================================= */}
      {isUserModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Yangi Xodim Qo'shish</h2>
                <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>
                  🏥 {clinics.find((c) => c.id === userFormData.clinicId)?.name || 'Klinika xodimi'}
                </span>
              </div>
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
                      placeholder="Dr. Sardor Aliyev"
                      value={userFormData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        const cName = clinics.find((c) => c.id === userFormData.clinicId)?.name || '';
                        setUserFormData({
                          ...userFormData,
                          name: val,
                          username: userFormData.username || generateUsernameFromName(val, cName),
                          email: userFormData.email || `${generateUsernameFromName(val)}@dentuz.uz`,
                        });
                      }}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Roli (Kirish Huquqi) *</label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    >
                      <option value="doctor">🩺 Shifokor (Doctor)</option>
                      <option value="receptionist">📋 Qabulxona (Receptionist)</option>
                      <option value="nurse">💉 Hamshira (Nurse)</option>
                      <option value="owner">🏥 Klinika Rahbari (Owner)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label>Login (Username) *</label>
                      <button
                        type="button"
                        onClick={() => {
                          const cName = clinics.find((c) => c.id === userFormData.clinicId)?.name || '';
                          setUserFormData({
                            ...userFormData,
                            username: generateUsernameFromName(userFormData.name, cName),
                          });
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0891b2',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ Avto-yaratish
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="sardor_dr"
                      value={userFormData.username}
                      onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="sardor@dentuz.uz"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroupFull}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label>Parol *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setUserFormData({
                            ...userFormData,
                            password: generateRandomPassword(),
                          });
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0891b2',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ Tasodifiy parol yaratish
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="masalan: DentUz#2026!"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    />
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
                  {modalLoading ? 'Yaratilmoqda...' : 'Saqlash va Telegramga Tayyorlash 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
