import React, { useState, useEffect } from 'react';
import { teamApi } from '../../api/teamApi';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import styles from './Settings.module.css';

export default function Settings() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('team');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saveClinicSuccess, setSaveClinicSuccess] = useState(false);
  const [saveSecuritySuccess, setSaveSecuritySuccess] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Clinic Profile State
  const [clinicData, setClinicData] = useState({
    name: 'Toshkent Dental Clinic',
    license: 'MED-UZ-2021-9988',
    director: 'Dr. Jasur Azimov',
    phone: '+998 71 200 44 22',
    extraPhone: '+998 90 842 11 00',
    email: 'info@dentuz.uz',
    address: 'Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko\'chasi 42-uy',
    workingHours: 'Dushanba - Shanba: 08:30 - 20:00',
    chairsCount: 4
  });

  // Security Form State
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  const [newMember, setNewMember] = useState({
    name: '',
    title: '',
    role: 'Shifokor',
    email: '',
    phone: '+998 ',
    branch: 'Markaziy Klinika'
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await teamApi.getTeam();
        setTeam(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredTeam = team.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.name) return;
    const added = await teamApi.addMember(newMember);
    setTeam((prev) => [...prev, added]);
    setShowModal(false);
    setNewMember({
      name: '',
      title: '',
      role: 'Shifokor',
      email: '',
      phone: '+998 ',
      branch: 'Markaziy Klinika'
    });
  };

  const handleSaveClinic = (e) => {
    e.preventDefault();
    setSaveClinicSuccess(true);
    setTimeout(() => setSaveClinicSuccess(false), 3000);
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (passwords.newPass && passwords.newPass !== passwords.confirm) {
      alert("Yangi parollar bir-biriga mos kelmadi!");
      return;
    }
    setSaveSecuritySuccess(true);
    setPasswords({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setSaveSecuritySuccess(false), 3000);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header & Meta */}
      <div className={styles.headerRow}>
        <div>
          <div className={styles.headerMeta}>
            <span className={styles.sectionBadge}>Tizim sozlamalari</span>
            <span style={{ color: 'var(--color-border)' }}>•</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {activeTab === 'team' && 'Xodimlar boshqaruvi'}
              {activeTab === 'clinic' && 'Klinika rekvizitlari'}
              {activeTab === 'billing' && 'Obuna va balans'}
              {activeTab === 'security' && 'Xavfsizlik va 2FA'}
            </span>
          </div>
          <h1 className={styles.title}>
            {activeTab === 'team' && 'Jamoa a\'zolari'}
            {activeTab === 'clinic' && 'Klinika ma\'lumotlari'}
            {activeTab === 'billing' && 'Billing va tariflar'}
            {activeTab === 'security' && 'Xavfsizlik sozlamalari'}
          </h1>
          <p className={styles.subtitle}>
            {activeTab === 'team' && 'Klinikada faoliyat yurituvchi shifokorlar, ma\'murlar va xodimlar ro\'yxati hamda kirish huquqlari.'}
            {activeTab === 'clinic' && 'Klinika litsenziyasi, manzili, aloqa telefonlari va stomatologik kreslolar soni.'}
            {activeTab === 'billing' && 'DentUz dasturiy ta\'minoti obunasi, SMS eslatmalar paketi va to\'lov usullari.'}
            {activeTab === 'security' && 'Tizim parolini yangilash, ikki bosqichli autentifikatsiya (2FA) va faol seanslar.'}
          </p>
        </div>

        {activeTab === 'team' && (
          <button
            type="button"
            className={styles.addMemberBtn}
            onClick={() => setShowModal(true)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              add
            </span>
            <span>Xodim qo'shish</span>
          </button>
        )}
      </div>

      {/* Horizontal Sub-Navigation */}
      <div className={styles.subNavBar}>
        <div className={styles.subTabs}>
          <div
            className={`${styles.subTabItem} ${activeTab === 'team' ? styles.subTabItemActive : ''}`}
            onClick={() => setActiveTab('team')}
            role="button"
            tabIndex={0}
          >
            <span>Jamoa</span>
            <span className={styles.badgeSmall}>{team.length}</span>
          </div>

          <div
            className={`${styles.subTabItem} ${activeTab === 'clinic' ? styles.subTabItemActive : ''}`}
            onClick={() => setActiveTab('clinic')}
            role="button"
            tabIndex={0}
          >
            Klinika ma'lumotlari
          </div>

          <div
            className={`${styles.subTabItem} ${activeTab === 'billing' ? styles.subTabItemActive : ''}`}
            onClick={() => setActiveTab('billing')}
            role="button"
            tabIndex={0}
          >
            Billing va tariflar
          </div>

          <div
            className={`${styles.subTabItem} ${activeTab === 'security' ? styles.subTabItemActive : ''}`}
            onClick={() => setActiveTab('security')}
            role="button"
            tabIndex={0}
          >
            Xavfsizlik
          </div>
        </div>

        <div className={styles.syncMeta}>
          <span>Sinxronlangan:</span>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Bugun, 14:32</span>
        </div>
      </div>

      {/* ========================================================
          TAB 1: TEAM STAFF
          ======================================================== */}
      {activeTab === 'team' && (
        <div className={styles.settingsTabContent}>
          {/* Filter & Meta Strip */}
          <div className={styles.filterMetaStrip}>
            <div className={styles.searchBox}>
              <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Ism, ixtisoslik yoki email bo'yicha saralash..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className={styles.metaChips}>
              <div className={styles.metaChip}>
                <span style={{ width: 6, height: 6, borderRadius: 9999, background: 'var(--color-mint)' }} />
                <span>Faol xodimlar:</span>
                <span className={styles.metaNum}>
                  {team.filter((m) => m.status === 'online').length}
                </span>
              </div>

              <div className={styles.metaChip}>
                <span>Litsenziya o'rni:</span>
                <span className={`${styles.metaNum} ${styles.metaNumCyan}`}>
                  {team.length} / 10
                </span>
              </div>
            </div>
          </div>

          {/* Staff Members List */}
          <div className={styles.staffCard}>
            {loading ? (
              <div style={{ padding: '24px' }}>
                <SkeletonLoader type="table" count={6} />
              </div>
            ) : filteredTeam.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Xodim topilmadi
              </div>
            ) : (
              filteredTeam.map((member) => {
                const isOnline = member.status === 'online';
                return (
                  <div key={member.id} className={styles.staffRow}>
                    <div className={styles.memberIdentity}>
                      <div className={styles.memberAvatar}>{member.initials}</div>
                      <div className={styles.memberNameGroup}>
                        <div className={styles.memberNameRow}>
                          <span className={styles.memberName}>{member.name}</span>
                          <span
                            className={`${styles.statusPip} ${
                              isOnline ? styles.pipOnline : styles.pipOffline
                            }`}
                            title={isOnline ? 'Onlayn' : 'Oflayn'}
                          />
                        </div>
                        <span className={styles.memberTitle}>{member.title}</span>
                      </div>
                    </div>

                    <div className={styles.memberDetailsCol}>
                      <span className={styles.roleTag}>{member.role}</span>

                      <div className={styles.contactCol}>
                        <span className={styles.memberEmail}>{member.email}</span>
                        <span className={styles.memberPhone}>{member.phone}</span>
                      </div>

                      <div className={styles.branchCol}>
                        <span className={styles.branchLabel}>Filial</span>
                        <span className={styles.branchVal}>{member.branch}</span>
                      </div>
                    </div>

                    <div className={styles.memberActions}>
                      <button
                        type="button"
                        className={styles.permBtn}
                        onClick={() => alert(`${member.name} huquqlarini tahrirlash oynasi`)}
                      >
                        Ruxsatlar
                      </button>
                      <button
                        type="button"
                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}
                        title="Ko'proq"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          more_vert
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: CLINIC PROFILE
          ======================================================== */}
      {activeTab === 'clinic' && (
        <div className={styles.settingsTabContent}>
          <div className={styles.settingsCard}>
            <div className={styles.settingsCardHeader}>
              <div>
                <h3 className={styles.settingsCardTitle}>Klinika Asosiy Rekvizitlari</h3>
                <p className={styles.settingsCardSub}>Bemorlarga beriladigan kvitansiyalar va hisobotlarda ko'rsatiladigan rasmiy ma'lumotlar</p>
              </div>
            </div>

            <form onSubmit={handleSaveClinic} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Klinika Rasmiy Nomi</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={clinicData.name}
                    onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tibbiy Litsenziya Raqami</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={clinicData.license}
                    onChange={(e) => setClinicData({ ...clinicData, license: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Bosh Shifokor / Rahbar</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={clinicData.director}
                    onChange={(e) => setClinicData({ ...clinicData, director: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Asosiy Telefon Raqami</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={clinicData.phone}
                    onChange={(e) => setClinicData({ ...clinicData, phone: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Elektron Pochta</label>
                  <input
                    type="email"
                    className={styles.inputField}
                    value={clinicData.email}
                    onChange={(e) => setClinicData({ ...clinicData, email: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ish Tartibi va Vaqtlari</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={clinicData.workingHours}
                    onChange={(e) => setClinicData({ ...clinicData, workingHours: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>To'liq Manzil</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={clinicData.address}
                  onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
                />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Stomatologik Kreslolar Soni</label>
                  <input
                    type="number"
                    className={styles.inputField}
                    value={clinicData.chairsCount}
                    onChange={(e) => setClinicData({ ...clinicData, chairsCount: Number(e.target.value) })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CBCT 3D Tomografiya Uskunasi</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    defaultValue="Vatech PaX-i3D (DICOM Server ulanishi faol)"
                    readOnly
                  />
                </div>
              </div>

              {saveClinicSuccess && (
                <div style={{ padding: '10px 14px', background: 'var(--color-mint-soft)', color: 'var(--color-mint-text)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                  ✓ Klinika ma'lumotlari muvaffaqiyatli saqlandi!
                </div>
              )}

              <div>
                <button type="submit" className={styles.saveSettingsBtn}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    check
                  </span>
                  <span>O'zgarishlarni Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: BILLING & SUBSCRIPTION
          ======================================================== */}
      {activeTab === 'billing' && (
        <div className={styles.settingsTabContent}>
          {/* Plan overview */}
          <div className={styles.planBanner}>
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-cyan-hover)', fontWeight: 700 }}>
                Faol Tarif Rejasi
              </div>
              <div className={styles.planName}>DentUz Enterprise Pro</div>
              <div className={styles.planFeatures}>
                <span>✓ 10 tagacha shifokor va ma'murlar hisobi</span>
                <span>✓ Cheksiz bemorlar kartasi va Odontogramma</span>
                <span>✓ 3D CBCT DICOM rentgen arxivi integratsiyasi</span>
                <span>✓ SMS avtomatik eslatmalar moduli</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Amal qilish muddati:</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                01-Dekabr, 2025-yil
              </div>
              <div style={{ marginTop: '6px' }}>
                <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'var(--color-mint-soft)', color: 'var(--color-mint-text)', fontSize: '11px', fontWeight: 700 }}>
                  Faol obuna
                </span>
              </div>
            </div>
          </div>

          <div className={styles.settingsCard}>
            <h3 className={styles.settingsCardTitle}>Klinika Kvotalari va Balans</h3>

            <div className={styles.formGrid}>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--color-surface-container-low)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  SMS Xabarnomalar Qoldig'i
                </div>
                <div style={{ fontSize: '24px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-cyan-hover)', marginTop: '4px' }}>
                  1 420 ta SMS
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Bemorlarga qabul vaqtini eslatish va tabriklar jo'natish uchun.
                </p>
                <button
                  type="button"
                  style={{ marginTop: '12px', padding: '6px 12px', borderRadius: '6px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', cursor: 'pointer' }}
                  onClick={() => alert("SMS to'ldirish oynasi: 1000 ta SMS — 150 000 UZS")}
                >
                  + Paket sotib olish
                </button>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--color-surface-container-low)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  Bulutli Xotira (X-ray & CBCT)
                </div>
                <div style={{ fontSize: '24px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                  42.8 GB / 200 GB
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Yuqori aniqlikdagi 3D tomografiya va rentgen rasmlari saqlanmoqda.
                </p>
              </div>
            </div>

            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Biriktirilgan Korporativ Karta:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', padding: '6px 12px', background: 'var(--color-surface-container-low)', borderRadius: '6px', fontWeight: 600 }}>
                  Uzcard •••• 4821
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Muddati: 08/27</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: SECURITY & 2FA
          ======================================================== */}
      {activeTab === 'security' && (
        <div className={styles.settingsTabContent}>
          {/* Password update card */}
          <div className={styles.settingsCard}>
            <h3 className={styles.settingsCardTitle}>Parolni Yangilash</h3>
            <p className={styles.settingsCardSub}>Xavfsizlik uchun parolni kamida 8 ta belgidan iborat qiling</p>

            <form onSubmit={handleSaveSecurity} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '440px' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Joriy Parol</label>
                <input
                  type="password"
                  className={styles.inputField}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Yangi Parol</label>
                <input
                  type="password"
                  className={styles.inputField}
                  value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  placeholder="Kamida 8 belgi"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Yangi Parolni Tasdiqlang</label>
                <input
                  type="password"
                  className={styles.inputField}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Qayta kiriting"
                  required
                />
              </div>

              {saveSecuritySuccess && (
                <div style={{ padding: '8px 12px', background: 'var(--color-mint-soft)', color: 'var(--color-mint-text)', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                  ✓ Parol muvaffaqiyatli yangilandi!
                </div>
              )}

              <button type="submit" className={styles.saveSettingsBtn}>
                Parolni Saqlash
              </button>
            </form>
          </div>

          {/* 2FA Card */}
          <div className={styles.settingsCard}>
            <h3 className={styles.settingsCardTitle}>Ikki Bosqichli Himoya (2FA)</h3>

            <div className={styles.toggleRow}>
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>SMS orqali tasdiqlash kodi</span>
                <span className={styles.toggleDesc}>Yangi qurilmadan kirganda telefoningizga 6 xonali kod jo'natiladi.</span>
              </div>

              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    inset: 0,
                    backgroundColor: twoFactorEnabled ? 'var(--color-cyan)' : 'var(--color-border)',
                    borderRadius: '34px',
                    transition: '0.2s'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      height: '20px',
                      width: '20px',
                      left: twoFactorEnabled ? '24px' : '3px',
                      bottom: '3px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '50%',
                      transition: '0.2s'
                    }}
                  />
                </span>
              </label>
            </div>
          </div>

          {/* Active Sessions */}
          <div className={styles.settingsCard}>
            <h3 className={styles.settingsCardTitle}>Faol Kirish Seanslari</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className={styles.sessionRow}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Google Chrome • Windows 11</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    IP: 195.158.12.44 • Toshkent, O'zbekiston
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-mint-text)', background: 'var(--color-mint-soft)', padding: '2px 8px', borderRadius: '4px' }}>
                  Hozir faol
                </span>
              </div>

              <div className={styles.sessionRow}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>DentUz Mobile App • iPhone 15 Pro</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    IP: 195.158.12.44 • Kecha, 19:40 da
                  </div>
                </div>
                <button
                  type="button"
                  style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: 600 }}
                  onClick={() => alert("Sessiya to'xtatildi")}
                >
                  Yakunlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Member Modal */}
      {showModal && (
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '18px', color: 'var(--color-text-primary)' }}>
              Yangi xodim qo'shish
            </h2>
            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  Ism va Familiya
                </label>
                <input
                  required
                  type="text"
                  placeholder="masalan, Dr. Aziz Tursunov"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  Ixtisoslik / Lavozim
                </label>
                <input
                  required
                  type="text"
                  placeholder="masalan, Ortoped-Stomatolog"
                  value={newMember.title}
                  onChange={(e) => setNewMember({ ...newMember, title: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Tizimdagi roli
                  </label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    style={{ width: '100%', height: '38px', padding: '0 8px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                  >
                    <option value="Shifokor">Shifokor</option>
                    <option value="Hamshira">Hamshira</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Assistent">Assistent</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  Elektron pochta
                </label>
                <input
                  type="email"
                  placeholder="xodim@dentuz.uz"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, height: '40px', background: 'var(--color-cyan)', color: '#FFFFFF', borderRadius: '8px', fontWeight: 600 }}
                >
                  Qo'shish
                </button>
                <button
                  type="button"
                  style={{ height: '40px', padding: '0 16px', background: 'var(--color-surface-container)', color: 'var(--color-text-secondary)', borderRadius: '8px' }}
                  onClick={() => setShowModal(false)}
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
