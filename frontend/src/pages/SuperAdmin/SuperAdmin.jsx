import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Logo from '../../components/Logo/Logo';
import Icon from '../../components/Icon/Icon';
import styles from './SuperAdmin.module.css';

export default function SuperAdmin() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'clinics'
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
  const [loading, setLoading] = useState(true);

  // Filters
  const [appSearch, setAppSearch] = useState('');
  const [appStatus, setAppStatus] = useState('all');
  const [clinicSearch, setClinicSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onboardSuccessData, setOnboardSuccessData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

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

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Load all initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes, clinicsRes] = await Promise.all([
        fetch(`${baseUrl}/superadmin/stats`),
        fetch(`${baseUrl}/superadmin/applications`),
        fetch(`${baseUrl}/superadmin/clinics`),
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
    } catch (err) {
      console.error('SuperAdmin loadData error:', err);
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
        loadData(); // refresh tables
      } else {
        alert(data.message || 'Xatolik yuz berdi');
      }
    } catch (err) {
      alert('Server bilan ulanishda xatolik: ' + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Change clinic status (active / suspended)
  const handleToggleClinicStatus = async (clinic) => {
    const newStatus = clinic.status === 'active' ? 'suspended' : 'active';
    const confirmMsg = clinic.status === 'active' 
      ? `"${clinic.name}" klinikasini vaqtincha bloklashni tasdiqlaysizmi?`
      : `"${clinic.name}" klinikasini qayta faollashtirasizmi?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${baseUrl}/superadmin/clinics/${clinic.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Extend subscription plan
  const handleExtendSubscription = async (clinic) => {
    const months = prompt(`"${clinic.name}" obunasini necha oyga uzaytirmoqchisiz?`, '12');
    if (!months || isNaN(months)) return;

    try {
      const res = await fetch(`${baseUrl}/superadmin/clinics/${clinic.id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalMonths: parseInt(months, 10) }),
      });
      if (res.ok) {
        alert('Obuna muddati muvaffaqiyatli uzaytirildi!');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Copy helper
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(type);
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

  return (
    <div className={styles.superAdminContainer}>
      {/* Top Navbar */}
      <header className={styles.topNav}>
        <div className={styles.topNavInner}>
          <div className={styles.brandGroup}>
            <Logo size={36} animated={false} />
            <div className={styles.portalBadge}>
              <span className={styles.liveDot} />
              Platform Founder Portal
            </div>
          </div>

          <div className={styles.userActions}>
            <div className={styles.adminProfile}>
              <div className={styles.adminAvatar}>SA</div>
              <div className={styles.adminMeta}>
                <span className={styles.adminName}>{user?.name || 'SuperAdmin'}</span>
                <span className={styles.adminRole}>Platform Administrator</span>
              </div>
            </div>

            <button onClick={handleLogout} className={styles.logoutBtn} title="Tizimdan chiqish">
              <Icon name="logout" size={16} />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>DentUz SaaS Boshqaruv Markazi</h1>
            <p className={styles.pageSubtitle}>
              Platformadagi barcha klinikalar, arizalar va obunalarni markazlashgan holda boshqaring.
            </p>
          </div>

          <button onClick={handleOpenNewClinic} className={styles.createClinicBtn}>
            <Icon name="add" size={18} />
            <span>+ Yangi Klinika Qo'shish</span>
          </button>
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
              <Icon name="medical_services" size={26} />
            </div>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>Shifokorlar & Bemorlar</span>
              <span className={styles.kpiValue}>{stats.totalDoctors} shifokor</span>
              <span className={styles.kpiSub}>• {stats.totalPatients} ta bemorlar bazada</span>
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
                      <th style={{ textAlign: 'right' }}>Amal</th>
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
                          <a href={`tel:${app.phone}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
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
                        <td>
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
                            {app.status === 'new' ? 'Yangi' : app.status === 'approved' ? 'Faollashtirildi' : app.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {app.status !== 'approved' ? (
                            <button
                              onClick={() => handleOpenOnboardFromApp(app)}
                              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                            >
                              <Icon name="bolt" size={15} />
                              <span>Klinika ochish</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                              ✓ Ulangan
                            </span>
                          )}
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
                          <div className={styles.primaryText}>{clinic.phone || '—'}</div>
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
                        <td>
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
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleExtendSubscription(clinic)}
                              className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
                              title="Obunani uzaytirish"
                            >
                              <Icon name="schedule" size={14} />
                              <span>Uzaytirish</span>
                            </button>

                            <button
                              onClick={() => handleToggleClinicStatus(clinic)}
                              className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
                              style={{
                                color: clinic.status === 'active' ? '#dc2626' : '#16a34a',
                                borderColor: clinic.status === 'active' ? '#fca5a5' : '#86efac',
                              }}
                            >
                              {clinic.status === 'active' ? 'Bloklash' : 'Ochish'}
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
      </main>

      {/* Onboarding Modal */}
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
    </div>
  );
}
