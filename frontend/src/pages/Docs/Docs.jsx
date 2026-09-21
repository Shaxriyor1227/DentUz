import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  SearchIcon,
  RocketIcon,
  PatientsIcon,
  CalendarIcon,
  ToothIcon,
  TreatmentIcon,
  FinanceIcon,
  InventoryIcon,
  LabIcon,
  ProcessesIcon,
  SecurityIcon,
  SettingsIcon,
  FaqIcon,
  SupportIcon,
  CheckIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  SparklesIcon,
  DeviceLaptopIcon,
  DeviceMobileIcon,
  WifiIcon,
  PrinterIcon,
  PhoneCallIcon,
  TelegramIcon,
  CloseIcon
} from './DocsIcons';
import styles from './Docs.module.css';

export default function Docs() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const [activeTab, setActiveTab] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Navigation Groups Definition with Apple pastel colored tiles
  const NAV_GROUPS = useMemo(() => [
    {
      title: isEn ? 'Core Modules' : 'Asosiy Modullar',
      items: [
        {
          id: 'getting-started',
          label: isEn ? 'Getting Started' : 'Boshlash',
          icon: <RocketIcon size={18} />,
          iconBg: 'rgba(2, 132, 199, 0.12)',
          iconColor: '#0284c7',
          badge: isEn ? 'Guide' : 'Tezkor'
        },
        {
          id: 'patients',
          label: isEn ? 'Patients Database' : 'Bemorlar bazasi',
          icon: <PatientsIcon size={18} />,
          iconBg: 'rgba(99, 102, 241, 0.12)',
          iconColor: '#6366f1'
        },
        {
          id: 'appointments',
          label: isEn ? 'Calendar & Visits' : 'Qabullar va Taqvim',
          icon: <CalendarIcon size={18} />,
          iconBg: 'rgba(245, 158, 11, 0.12)',
          iconColor: '#d97706'
        },
        {
          id: 'odontogram',
          label: isEn ? 'FDI Odontogram' : 'FDI Tish Xaritasi',
          icon: <ToothIcon size={18} />,
          iconBg: 'rgba(13, 148, 136, 0.12)',
          iconColor: '#0d9488'
        },
        {
          id: 'treatments',
          label: isEn ? 'Treatment Plans' : 'Muolajalar & Rejalar',
          icon: <TreatmentIcon size={18} />,
          iconBg: 'rgba(16, 185, 129, 0.12)',
          iconColor: '#059669'
        },
        {
          id: 'finance',
          label: isEn ? 'Finance & Receipts' : 'Moliya & Kassa Cheki',
          icon: <FinanceIcon size={18} />,
          iconBg: 'rgba(139, 92, 246, 0.12)',
          iconColor: '#7c3aed'
        },
      ]
    },
    {
      title: isEn ? 'Clinic Management' : 'Klinika Boshqaruvi',
      items: [
        {
          id: 'inventory',
          label: isEn ? 'Supplies & Stock' : 'Omborxona & Moddiy',
          icon: <InventoryIcon size={18} />,
          iconBg: 'rgba(59, 130, 246, 0.12)',
          iconColor: '#2563eb'
        },
        {
          id: 'laboratory',
          label: isEn ? 'Dental Laboratory' : 'Tish Laboratoriyasi',
          icon: <LabIcon size={18} />,
          iconBg: 'rgba(236, 72, 153, 0.12)',
          iconColor: '#db2777'
        },
        {
          id: 'processes',
          label: isEn ? 'Internal Workflows' : 'Klinika Jarayonlari',
          icon: <ProcessesIcon size={18} />,
          iconBg: 'rgba(14, 165, 233, 0.12)',
          iconColor: '#0284c7'
        },
        {
          id: 'security',
          label: isEn ? 'Security & Law 547' : 'Xavfsizlik & O\'RQ-547',
          icon: <SecurityIcon size={18} />,
          iconBg: 'rgba(16, 185, 129, 0.12)',
          iconColor: '#059669'
        },
        {
          id: 'settings',
          label: isEn ? 'Clinic Settings' : 'Sozlamalar',
          icon: <SettingsIcon size={18} />,
          iconBg: 'rgba(100, 116, 139, 0.12)',
          iconColor: '#475569'
        },
      ]
    },
    {
      title: isEn ? 'Assistance' : 'Yordam va Aloqa',
      items: [
        {
          id: 'faq',
          label: isEn ? 'Frequently Asked' : 'Savol-javoblar',
          icon: <FaqIcon size={18} />,
          iconBg: 'rgba(249, 115, 22, 0.12)',
          iconColor: '#ea580c'
        },
        {
          id: 'support',
          label: isEn ? 'Help & Onboarding' : 'Qo\'llab-quvvatlash',
          icon: <SupportIcon size={18} />,
          iconBg: 'rgba(2, 132, 199, 0.12)',
          iconColor: '#0284c7'
        },
      ]
    }
  ], [isEn]);

  // All items for search filtering
  const allNavItems = useMemo(() => {
    return NAV_GROUPS.flatMap(group => group.items);
  }, [NAV_GROUPS]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allNavItems;
    const q = searchQuery.toLowerCase();
    return allNavItems.filter(item =>
      item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
    );
  }, [allNavItems, searchQuery]);

  // First Steps Cards (Apple style interactive tiles)
  const FIRST_STEPS = [
    {
      targetId: 'patients',
      icon: <PatientsIcon size={22} />,
      iconBg: 'rgba(99, 102, 241, 0.1)',
      iconColor: '#6366f1',
      title: isEn ? 'Add a Patient' : '1. Bemor qo\'shish',
      desc: isEn ? 'Register new patient with phone number and open SSV 043/h medical card.' : 'Bemorning ismi va telefonini kiritish orqali 1 daqiqada elektron kartochka oching.'
    },
    {
      targetId: 'appointments',
      icon: <CalendarIcon size={22} />,
      iconBg: 'rgba(245, 158, 11, 0.1)',
      iconColor: '#d97706',
      title: isEn ? 'Schedule an Appointment' : '2. Qabul belgilash',
      desc: isEn ? 'Pick an open operatory slot on the visual doctor calendar.' : 'Taqvimdagi bo\'sh vaqtni tanlang, shifokorni biriktiring va qabulni saqlang.'
    },
    {
      targetId: 'odontogram',
      icon: <ToothIcon size={22} />,
      iconBg: 'rgba(13, 148, 136, 0.1)',
      iconColor: '#0d9488',
      title: isEn ? 'FDI Dental Chart' : '3. Tish xaritasini to\'ldirish',
      desc: isEn ? 'Tap any of the 32 teeth to mark caries, fillings, or crowns in 2 clicks.' : '32 ta tishning istalganiga bosing va karies, plomba yoki toj holatini belgilang.'
    },
    {
      targetId: 'treatments',
      icon: <TreatmentIcon size={22} />,
      iconBg: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#059669',
      title: isEn ? 'Treatment Plan' : '4. Davolash rejasi tuzish',
      desc: isEn ? 'Auto-calculate total estimated cost from your clinic price list.' : 'Preyskurantdan xizmatlarni tanlang, tizim umumiy summani o\'zi hisoblab beradi.'
    },
    {
      targetId: 'finance',
      icon: <FinanceIcon size={22} />,
      iconBg: 'rgba(139, 92, 246, 0.1)',
      iconColor: '#7c3aed',
      title: isEn ? 'Billing & Thermal Receipt' : '5. To\'lov va Kassa Cheki',
      desc: isEn ? 'Accept cash or cards and print an official 80mm receipt with QR-code.' : 'Naqd, karta yoki Payme/Click orqali to\'lov oling va 80mm chek chop eting.'
    },
    {
      targetId: 'inventory',
      icon: <InventoryIcon size={22} />,
      iconBg: 'rgba(59, 130, 246, 0.1)',
      iconColor: '#2563eb',
      title: isEn ? 'Dental Inventory' : '6. Sarf materiallari nazorati',
      desc: isEn ? 'Track anesthetics and resin stocks before they run out.' : 'Plomba yoki anestetik tugab qolishidan oldin avtomatik ogohlantirish oling.'
    }
  ];

  // Simple, Understandable FAQ list
  const FAQS = [
    {
      q: isEn ? 'Can we import our existing patients from Excel?' : 'Eski bemorlar ro\'yxatini Excel orqali ko\'chirish osonmi?',
      a: isEn
        ? 'Yes! You don\'t need to enter thousands of patients by hand. Upload your Excel or CSV file, and DentUz imports all names, phone numbers, and balances within 2 minutes. Our team does this for you for free during setup.'
        : 'Ha, juda oson! Barcha bemorlarni bittalab qo\'lda kiritish shart emas. Excel yoki CSV faylingizni yuklasangiz, tizim 2 daqiqa ichida barcha bemorlar, telefonlar va qarzlarni joy-joyiga qo\'yib beradi. Mutaxassislarimiz buni siz uchun bepul qilib berishadi.'
    },
    {
      q: isEn ? 'Does the software work on tablets and smartphones?' : 'Dasturni iPad, planshet yoki telefonda ishlatsa bo\'ladimi?',
      a: isEn
        ? 'Yes, perfectly. DentUz is fully adapted for iPads, Android tablets, and phones. Doctors can comfortably open the tooth chart directly next to the patient chair.'
        : 'Ha, albatta! DentUz interfeysi iPad, har qanday Android planshet va smartfonlarga to\'liq moslashtirilgan. Shifokor kreslo oldida planshet ushlab tish xaritasini 2 soniyada to\'ldirishi juda qulay.'
    },
    {
      q: isEn ? 'What happens if the clinic internet goes down temporarily?' : 'Klinikada internet vaqtincha uzilib qolsa nima bo\'ladi?',
      a: isEn
        ? 'No data is lost. DentUz automatically caches your open inputs in your browser memory. As soon as the internet returns, all changes sync immediately with the secure cloud.'
        : 'Hech qanday ma\'lumot yo\'qolmaydi! DentUz brauzer xotirasida oxirgi kiritilgan ma\'lumotlarni saqlab turadi. Internet yoqilishi bilanoq barcha yozuvlar avtomatik tarzda xavfsiz bulut bilan sinxronlashadi.'
    },
    {
      q: isEn ? 'Can we print receipts on small thermal POS receipt printers?' : 'Kassa chekini kichik 80mm yoki 58mm termal printerda chiqarsa bo\'ladimi?',
      a: isEn
        ? 'Yes. DentUz supports standard office A4 printers as well as compact 80mm and 58mm thermal receipt printers. Receipts include your clinic logo, doctor name, services, and official QR-code.'
        : "Ha. Tizimda ham standart A4 formatda, ham do'kon/dorixonalarda ishlatiladigan 80mm va 58mm kassa termal printerlarida rasmiy QR-kodli chek chiqarish imkoniyati bor."
    },
    {
      q: isEn ? 'Can we limit access so reception staff cannot see doctor finances?' : 'Administratorlar shifokorlarning oylik daromadini ko\'rmaydigan qilsa bo\'ladimi?',
      a: isEn
        ? 'Yes. DentUz includes strict role permissions. Receptionists only manage appointments and patient registration; they cannot see private clinic profit reports or doctor fee percentages.'
        : 'Ha, albatta. Tizimda qat\'iy huquqlar chegarasi bor: Administrator faqat qabullarni yozadi va bemorni ro\'yxatga oladi, lekin klinika umumiy daromadini yoki shifokorlarning oylik ulushini ko\'ra olmaydi.'
    },
    {
      q: isEn ? 'Where is patient data stored and is it legally protected?' : 'Bemorlar ma\'lumotlari qayerda saqlanadi va qonuniy himoyalanganmi?',
      a: isEn
        ? 'All data is hosted inside the Republic of Uzbekistan on Tier-III data centers in full compliance with national Law No. 547 on Personal Data Protection, secured with bank-grade 256-bit SSL encryption.'
        : 'Barcha ma\'lumotlar O\'zbekiston hududidagi serverlarda saqlanadi. O\'zbekiston Respublikasining "Shaxsiy ma\'lumotlar to\'g\'risida"gi O\'RQ-547 qonuniga 100% mos va 256-bitli bank darajasidagi shifrlash bilan himoyalangan.'
    }
  ];

  return (
    <div className={styles.docsPage}>
      {/* Ambient glow matching Features & Contact */}
      <div className={styles.ambientGlow} />

      {/* ── Signature Hero Section (Features & Contact style) ── */}
      <section className={styles.heroSection}>
        <div className={styles.pageBadge}>
          <SparklesIcon size={14} color="#0284c7" />
          <span>{isEn ? 'DentUz Official User Manual' : 'DentUz Rasmiy Tizim Qo\'llanmasi'}</span>
        </div>

        <h1 className={styles.pageTitle}>
          <span className={styles.titleLine1}>
            {isEn ? 'Documentation & Guides —' : 'Hujjatlar va Qo\'llanmalar —'}
          </span>
          <span className={styles.titleLine2}>
            {isEn ? 'Learn in 15 Minutes' : 'Barcha Modullar Yo\'riqnomasi'}
          </span>
        </h1>

        <p className={styles.pageSubtitle}>
          {isEn
            ? 'Everything you need to know to run a modern dental clinic effortlessly. Simple, practical, and clear.'
            : 'Stomatologiya klinikasini oson va zamonaviy boshqarish bo\'yicha qisqa, sodda va tushunarli yo\'riqnoma.'}
        </p>

          {/* Apple Spotlight Search Bar */}
          <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
              <span className={styles.searchIconWrapper}>
                <SearchIcon size={18} color="#64748b" />
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={isEn ? 'Search guides (e.g. patients, odontogram, receipt, calendar)...' : 'Qidirish (masalan: bemor qo\'shish, tish xaritasi, chek chiqarish, taqvim)...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery ? (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={() => setSearchQuery('')}
                  aria-label="Tozalash"
                >
                  <CloseIcon size={14} />
                </button>
              ) : (
                <span className={styles.searchKbdHint}>⌘K</span>
              )}
            </div>
          </div>

          {/* Quick Verified Tags */}
          <div className={styles.heroTags}>
            <span className={styles.heroTag}>
              <span className={styles.heroTagCheck}><CheckIcon size={12} /></span>
              {isEn ? 'Cloud Based' : 'Bulutli Tizim'}
            </span>
            <span className={styles.heroTag}>
              <span className={styles.heroTagCheck}><CheckIcon size={12} /></span>
              {isEn ? 'FDI Standard' : 'FDI Tish Standarti'}
            </span>
            <span className={styles.heroTag}>
              <span className={styles.heroTagCheck}><CheckIcon size={12} /></span>
              {isEn ? 'SSV 043/h Form' : 'SSV 043/h Shakliga Mos'}
            </span>
            <span className={styles.heroTag}>
              <span className={styles.heroTagCheck}><CheckIcon size={12} /></span>
              {isEn ? '80mm / 58mm Receipts' : '80mm / 58mm Kassa Cheklari'}
            </span>
          </div>
      </section>

      {/* ── Main Workspace ── */}
      <div className={styles.docsWorkspace}>
        {/* Mobile Horizontal Pill Selector */}
        <div className={styles.mobileTabsScroll}>
          {allNavItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`${styles.mobileTabPill} ${activeTab === item.id ? styles.mobileTabPillActive : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── Left Sidebar (macOS / iPadOS Settings Style) ── */}
        <aside className={styles.appleSidebar}>
          {NAV_GROUPS.map((group, gIdx) => {
            const groupItems = group.items.filter(item =>
              filteredItems.some(fi => fi.id === item.id)
            );
            if (groupItems.length === 0) return null;

            return (
              <div key={gIdx} className={styles.navSection}>
                <div className={styles.navSectionLabel}>{group.title}</div>
                {groupItems.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.sidebarNavItem} ${isActive ? styles.sidebarNavItemActive : ''}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        window.scrollTo({ top: 360, behavior: 'smooth' });
                      }}
                    >
                      <div
                        className={styles.iconTile}
                        style={{
                          backgroundColor: isActive ? 'transparent' : item.iconBg,
                          color: isActive ? '#ffffff' : item.iconColor
                        }}
                      >
                        {item.icon}
                      </div>
                      <span className={styles.navItemLabelText}>{item.label}</span>
                      {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </aside>

        {/* ── Content Main Panel ── */}
        <main className={styles.docsMainPanel}>
          <div key={activeTab} className={styles.tabContentAnimated}>
          {/* TAB 1: GETTING STARTED */}
          {activeTab === 'getting-started' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <RocketIcon size={14} />
                  <span>{isEn ? 'Getting Started' : '1-Qism • Tezkor Boshlash'}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {isEn ? 'Dental Clinic Software — Quick Start Guide' : 'Klinikada Ishni Boshlash — Tezkor Yo\'riqnoma'}
                </h2>
                <p className={styles.panelLead}>
                  {isEn
                    ? 'DentUz eliminates paper clutter, lost patient histories, and chaotic scheduling. Here is how your clinic can get fully up and running in 15 minutes.'
                    : 'DentUz — qog\'oz jurnallar, yo\'qolgan bemor daftarlari va chalkash navbatlarga chek qo\'yadi. Quyidagi 6 ta qadam orqali tizimni 15 daqiqada to\'liq o\'rganib olishingiz mumkin.'}
                </p>
              </div>

              {/* Free Trial Banner */}
              <div className={styles.appleTrialBanner}>
                <div className={styles.trialBannerText}>
                  <div className={styles.trialTitle}>
                    <SparklesIcon size={18} />
                    <span>{isEn ? '14-Day Full Access Trial' : '14 kunlik bepul to\'liq sinov'}</span>
                  </div>
                  <div className={styles.trialDesc}>
                    {isEn
                      ? 'Test all clinical features risk-free. No credit card required.'
                      : 'Kredit karta talab etilmaydi. Barcha funksiyalarni klinikangizda bepul sinab ko\'ring!'}
                  </div>
                </div>
                <Link to="/contact" className={styles.trialCtaButton}>
                  <span>{isEn ? 'Try for Free' : 'Sinab Ko\'rish'}</span>
                  <ArrowRightIcon size={15} />
                </Link>
              </div>

              {/* First Steps Grid (Interactive Cards) */}
              <h3 className={styles.subSectionTitle}>
                <span>{isEn ? 'Key Steps to Get Started' : 'Asosiy Boshlang\'ich Qadamlar'}</span>
              </h3>
              <div className={styles.appleCardsGrid}>
                {FIRST_STEPS.map((step, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    className={styles.appleStepCard}
                    onClick={() => {
                      setActiveTab(step.targetId);
                      window.scrollTo({ top: 360, behavior: 'smooth' });
                    }}
                  >
                    <div
                      className={styles.cardIconTile}
                      style={{ backgroundColor: step.iconBg, color: step.iconColor }}
                    >
                      {step.icon}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardTitle}>{step.title}</div>
                      <div className={styles.cardDescription}>{step.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* System Requirements (Clean Apple Style Cards) */}
              <h3 className={styles.subSectionTitle}>
                <span>{isEn ? 'System Requirements' : 'Tizim Talablari (Qanday Qurilmalar Kerak?)'}</span>
              </h3>
              <div className={styles.appleSystemReq}>
                <p className={styles.reqLead}>
                  {isEn
                    ? 'DentUz runs in the cloud. You do NOT need expensive servers or complicated IT installations:'
                    : 'DentUz to\'liq bulutda ishlaydi. Qimmatbaho server yoki murakkab texnik sozlashlar talab qilinmaydi:'}
                </p>
                <div className={styles.reqGrid}>
                  <div className={styles.reqItemCard}>
                    <div className={styles.reqItemIcon}><DeviceLaptopIcon size={22} /></div>
                    <div className={styles.reqItemContent}>
                      <div className={styles.reqItemTitle}>{isEn ? 'Computers' : 'Kompyuter / Noutbuk'}</div>
                      <div className={styles.reqItemDesc}>Chrome, Safari, Firefox, Edge ({isEn ? 'any OS' : 'Windows yoki Mac'}).</div>
                    </div>
                  </div>

                  <div className={styles.reqItemCard}>
                    <div className={styles.reqItemIcon}><DeviceMobileIcon size={22} /></div>
                    <div className={styles.reqItemContent}>
                      <div className={styles.reqItemTitle}>{isEn ? 'Tablets & Phones' : 'Planshet va Telefon'}</div>
                      <div className={styles.reqItemDesc}>Apple iPad, Android ({isEn ? 'chairside touch screen' : 'kreslo oldida qulay'}).</div>
                    </div>
                  </div>

                  <div className={styles.reqItemCard}>
                    <div className={styles.reqItemIcon}><WifiIcon size={22} /></div>
                    <div className={styles.reqItemContent}>
                      <div className={styles.reqItemTitle}>{isEn ? 'Internet' : 'Internet Tezligi'}</div>
                      <div className={styles.reqItemDesc}>{isEn ? 'Any normal WiFi or 4G mobile hotspot.' : 'Oddiy Wi-Fi yoki 4G mobil internet.'}</div>
                    </div>
                  </div>

                  <div className={styles.reqItemCard}>
                    <div className={styles.reqItemIcon}><PrinterIcon size={22} /></div>
                    <div className={styles.reqItemContent}>
                      <div className={styles.reqItemTitle}>{isEn ? 'Printers' : 'Printerlar'}</div>
                      <div className={styles.reqItemDesc}>{isEn ? 'Standard A4 and 80mm/58mm thermal rolls.' : 'Standart A4 yoki 80mm/58mm kassa chek printeri.'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple 3-step walkthrough */}
              <h3 className={styles.subSectionTitle}>
                <span>{isEn ? '3 Steps to Digitize Your Clinic' : '3 Qadamda Klinikani To\'liq Raqamlashtirish'}</span>
              </h3>
              <div className={styles.appleFlowList}>
                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>1</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>
                      {isEn ? '1. Add your doctors and staff' : '1. Shifokorlar va xodimlarni kiriting'}
                    </h4>
                    <p className={styles.flowDescription}>
                      {isEn
                        ? 'Create logins for your clinic receptionists, dentists, and dental assistants with individual access rights.'
                        : 'Administrator, shifokorlar va assistentlar uchun alohida kirish ruxsatnomalarini oching. Shifokor faqat o\'z bemorlarini, administrator esa navbatlarni ko\'radi.'}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>2</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>
                      {isEn ? '2. Register your patients' : '2. Bemorlarni ro\'yxatga oling'}
                    </h4>
                    <p className={styles.flowDescription}>
                      {isEn
                        ? 'Upload your Excel patient contact list in one click or add new patients with their phone numbers.'
                        : 'Eski Excel daftaringizni bir zumda yuklang yoki yangi bemor kelganda uning ismi va telefonini kiritib 043/h elektron kartochkasini oching.'}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>3</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>
                      {isEn ? '3. Fill the dental chart and issue receipts' : '3. Tish xaritasini to\'ldiring va chek bering'}
                    </h4>
                    <p className={styles.flowDescription}>
                      {isEn
                        ? 'Tap affected teeth to mark dental conditions, choose procedures from your price list, and print an official receipt.'
                        : 'Tish xaritasida karies yoki plombani belgilang, xizmat narxini ko\'ring va bemorga rasmiy QR-kodli kassa chekini chop etib bering.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PATIENTS */}
          {activeTab === 'patients' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <PatientsIcon size={14} />
                  <span>{isEn ? 'Module 02 • Patients' : 'Modul 02 • Bemorlar Bazasi'}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {isEn ? 'Patient Directory & Electronic Card (043/h)' : 'Bemorlar Ro\'yxati va Elektron Kartochka (043/h)'}
                </h2>
                <p className={styles.panelLead}>
                  {isEn
                    ? 'All patient files in one secure place: personal info, visits history, diagnoses, X-rays, and financial balance.'
                    : 'Barcha bemorlar bitta qulay ro\'yxatda: telefon raqami, kasallik tarixi, tashxislar, rentgen suratlari va to\'lovlar balansi.'}
                </p>
              </div>

              <div className={styles.appleFeaturesGrid}>
                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#0284c7" />
                    <span>{isEn ? '1-Minute Registration' : '1 daqiqada bemor qo\'shish'}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {isEn
                      ? 'Only name and phone are required to get started. You can add medical history later at any time.'
                      : 'Bemor shoshayotganda faqat ismi va telefonini yozib saqlash kifoya. Qolgan ma\'lumotlarni keyin bemalol to\'ldirish mumkin.'}
                  </p>
                </div>

                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#0284c7" />
                    <span>{isEn ? 'Instant Search by 4 digits' : 'Telefon raqami bo\'yicha tezkor qidiruv'}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {isEn
                      ? 'Type just the last 4 digits of a phone number or patient surname to find their card immediately.'
                      : 'Telefonning oxirgi 4 ta raqamini yoki bemor familiyasini yozish bilan uning kartochkasi darhol ochiladi.'}
                  </p>
                </div>

                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#0284c7" />
                    <span>{isEn ? 'SSV 043/h Medical Standard' : 'SSV 043/h Rasmiy Tibbiy Varaqasi'}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {isEn
                      ? 'Complies with official healthcare standards. Print the official patient dossier in 1 click.'
                      : 'Sog\'liqni saqlash vazirligi talablariga to\'liq mos. Tekshiruv bo\'lganda 1 ta tugma bilan rasmiy qog\'oz shaklini chop eting.'}
                  </p>
                </div>
              </div>

              <div className={styles.appleTip}>
                <div className={styles.appleTipIcon}><SparklesIcon size={18} /></div>
                <div className={styles.appleTipContent}>
                  <strong>{isEn ? 'Allergies Safety Alert:' : 'Muhim eslatma (Allergiyalar):'}</strong> {isEn
                    ? 'If a patient has an allergy to anesthesia or penicillin, it is displayed in prominent red at the top of their profile to protect them.'
                    : 'Bemorning qaysidir dori yoki anestetikga allergiyasi bo\'lsa, u profil tepasida qizil rangda yaqqol ko\'rinib turadi. Bu shifokor adashib xato dori qilishining oldini oladi.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <CalendarIcon size={14} />
                  <span>{isEn ? 'Module 03 • Calendar' : 'Modul 03 • Qabullar Taqvimi'}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {isEn ? 'Appointments Calendar & Doctor Schedules' : 'Shifokorlar Jadvali va Qabullarni Rejalashtirish'}
                </h2>
                <p className={styles.panelLead}>
                  {isEn
                    ? 'See who is busy and which chairs are free at a single glance. No more overlapping appointments or confused patients.'
                    : 'Qaysi shifokor qachon bo\'sh, qaysi kresloda kim o\'tirganini bitta ekranda ko\'ring. Hech qanday navbat chalkashligi bo\'lmaydi.'}
                </p>
              </div>

              <div className={styles.appleFlowList}>
                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>1</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{isEn ? 'Click on any free time slot' : '1. Taqvimdagi bo\'sh vaqtga bosing'}</h4>
                    <p className={styles.flowDescription}>
                      {isEn
                        ? 'Choose the doctor, select patient name, and set appointment duration (e.g. 30 min, 1 hour).'
                        : 'Shifokorni tanlang, bemor ismini yozing va qabul davomiyligini (masalan: 30 daqiqa yoki 1 soat) belgilang.'}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>2</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{isEn ? 'Color-coded visit statuses' : '2. Ranglar orqali boshqaring'}</h4>
                    <p className={styles.flowDescription}>
                      {isEn
                        ? '🟡 Confirmed (Waiting) • 🔵 In Operatory Chair • 🟢 Completed • 🔴 Canceled.'
                        : '🟡 Sariq — Bemor kutilmoqda • 🔵 Ko\'k — Kresloda muolaja olinmoqda • 🟢 Yashil — Qabul tugadi • 🔴 Qizil — Kelmadi / Bekor qilindi.'}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>3</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{isEn ? 'Automated SMS notification' : '3. Bemorga avtomatik SMS eslatma'}</h4>
                    <p className={styles.flowDescription}>
                      {isEn
                        ? 'The patient receives an SMS reminder 2 hours prior to their visit so they do not forget their dental appointment.'
                        : 'Bemor qabul vaqtini unutib qo\'ymasligi uchun qabuldan 2 soat oldin uning telefoniga qaysi shifokorga nechanchi soatda kelishi haqida avtomatik SMS boradi.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ODONTOGRAM */}
          {activeTab === 'odontogram' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <ToothIcon size={14} />
                  <span>{isEn ? 'Module 04 • FDI Dental Chart' : 'Modul 04 • FDI Tish Xaritasi'}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {isEn ? 'Interactive FDI Odontogram (Tooth Chart)' : 'Interaktiv FDI Stomatologik Tish Xaritasi'}
                </h2>
                <p className={styles.panelLead}>
                  {isEn
                    ? '32 permanent teeth and 20 primary teeth. Tap any tooth surface to register caries, fillings, crowns, or root canals in seconds.'
                    : 'Xalqaro FDI standarti bo\'yicha 32 ta tishning interaktiv xaritasi. Tish ustiga bosing va karies, plomba yoki toj holatini 2 soniyada belgilang.'}
                </p>
              </div>

              {/* Tooth Diagnostic Colors */}
              <div className={styles.odontogramPreviewCard}>
                <div className={styles.odontogramLegendTitle}>
                  <ToothIcon size={16} />
                  <span>{isEn ? 'Dental Condition Colors' : 'Tashxis Belgilari va Ranglar'}</span>
                </div>
                <div className={styles.odontogramGrid}>
                  <div className={styles.odontogramItem}>
                    <span className={styles.colorDot} style={{ background: '#ef4444' }} />
                    <span>{isEn ? 'Caries (Red)' : 'Karies (Qizil)'}</span>
                  </div>
                  <div className={styles.odontogramItem}>
                    <span className={styles.colorDot} style={{ background: '#3b82f6' }} />
                    <span>{isEn ? 'Filling (Blue)' : 'Plomba (Ko\'k)'}</span>
                  </div>
                  <div className={styles.odontogramItem}>
                    <span className={styles.colorDot} style={{ background: '#eab308' }} />
                    <span>{isEn ? 'Crown (Gold)' : 'Toj / Koronka (Sariq)'}</span>
                  </div>
                  <div className={styles.odontogramItem}>
                    <span className={styles.colorDot} style={{ background: '#8b5cf6' }} />
                    <span>{isEn ? 'Implant (Purple)' : 'Implant (Binafsha)'}</span>
                  </div>
                  <div className={styles.odontogramItem}>
                    <span className={styles.colorDot} style={{ background: '#ec4899' }} />
                    <span>{isEn ? 'Root Canal (Pink)' : 'Kanal / Pulpit (Pushti)'}</span>
                  </div>
                  <div className={styles.odontogramItem}>
                    <span className={styles.colorDot} style={{ background: '#64748b' }} />
                    <span>{isEn ? 'Extracted (Gray)' : 'Olingan tish (Kulrang)'}</span>
                  </div>
                </div>
              </div>

              <div className={styles.appleFeaturesGrid}>
                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#0d9488" />
                    <span>{isEn ? '5-Surface Precision' : '5 tomonlama aniqlik'}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {isEn
                      ? 'Chart chewing (occlusal), side, and interdental surfaces with exact precision.'
                      : 'Tishning chaynash yuzasi, yon tomoni yoki tishlar orasi kariesini alohida-alohida belgilash mumkin.'}
                  </p>
                </div>

                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#0d9488" />
                    <span>{isEn ? 'Primary Teeth for Children' : 'Bolalar uchun sut tishlari'}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {isEn
                      ? 'Switch to the 20 primary teeth mode with 1 click when treating pediatric patients.'
                      : 'Kichik yoshdagi bolalar davolanayotganda 1 tugma bilan 20 ta sut tishlari xaritasiga o\'ting.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TREATMENTS */}
          {activeTab === 'treatments' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <TreatmentIcon size={14} />
                  <span>{isEn ? 'Module 05 • Treatments' : 'Modul 05 • Davolash Rejalari'}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {isEn ? 'Treatment Plans & Automatic Price Estimates' : 'Davolash Rejalari va Avtomatik Narx Hisoblash'}
                </h2>
                <p className={styles.panelLead}>
                  {isEn
                    ? 'Build a clear step-by-step treatment estimate for the patient with exact prices and discounts. Prevents any payment arguments.'
                    : 'Bemorga davolashning barcha bosqichlari va narxini oldindan shaffof ko\'rsating. Bemor davolash qancha turishini aniq biladi.'}
                </p>
              </div>

              <div className={styles.appleFlowList}>
                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>1</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{isEn ? 'Select services from your price list' : '1. Preyskurantdan muolajalarni tanlang'}</h4>
                    <p className={styles.flowDescription}>
                      {isEn
                        ? 'Choose procedures (e.g. Photopolymer filling, Anesthesia, Zirconia crown). Prices are fetched automatically.'
                        : 'Klinikangiz narxnomasidan xizmatlarni tanlang (masalan: Nurli plomba, Anesteziya, Sirkoniy toj). Narxlar avtomatik yoziladi.'}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>2</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{isEn ? 'Break into stages' : '2. Bosqichlarga ajrating'}</h4>
                    <p className={styles.flowDescription}>
                      {isEn
                        ? 'Group work into Stage 1 (Root canal preparation) and Stage 2 (Crown fitting).'
                        : 'Davolashni bosqichlarga bo\'ling: 1-kun: Tishni davolash va vaqtinchalik plomba; 2-kun: Doimiy sirkoniy toj o\'rnatish.'}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>3</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{isEn ? 'Print or send PDF estimate' : '3. Bemorga qog\'ozda yoki PDF da bering'}</h4>
                    <p className={styles.flowDescription}>
                      {isEn
                        ? 'Patients sign the estimate with confidence, knowing their full treatment schedule and financial commitment.'
                        : 'Bemor qo\'liga muhrlangan davolash smetasini bering. U o\'z rejasi va narxlarini ko\'rib xotirjam davolanadi.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FINANCE */}
          {activeTab === 'finance' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <FinanceIcon size={14} />
                  <span>{isEn ? 'Module 06 • Finance' : 'Modul 06 • Moliya va Kassa'}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {isEn ? 'Billing, Debts Ledger & QR Receipts' : 'Kassa Balansi, Qarzlar Nazorati va QR Kassa Cheki'}
                </h2>
                <p className={styles.panelLead}>
                  {isEn
                    ? 'Track cash, Humo, Uzcard, and Payme/Click payments. Print official 80mm receipts and view clinic profit statements.'
                    : 'Kassadagi har bir so\'m nazoratda: Naqd, Humo, Uzcard, Payme va Click. Bemor qarzlarini ko\'rish va rasmiy QR-kodli chek chiqarish.'}
                </p>
              </div>

              <div className={styles.appleFeaturesGrid}>
                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <PrinterIcon size={18} color="#7c3aed" />
                    <span>{isEn ? '80mm / 58mm Thermal Receipts' : '80mm va 58mm Kassa Cheki'}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {isEn
                      ? 'Print receipts on compact POS thermal rolls with clinic details, patient name, and verification QR-code.'
                      : 'Dorixona va marketlardagi kabi ixcham termal printerda klinika logotipi, shifokor ismi va QR-kodli rasmiy chek chiqaring.'}
                  </p>
                </div>

                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#7c3aed" />
                    <span>{isEn ? 'Patient Debts Book' : 'Qarzlar va Nasiyalar Daftari'}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {isEn
                      ? 'Instantly see which patient has remaining balance and track partial installment payments.'
                      : 'Qaysi bemor qancha to\'ladi, qancha qarzi qoldi — barchasi ro\'yxatda ko\'rinadi va qisman to\'lovlarni qabul qilish mumkin.'}
                  </p>
                </div>

                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#7c3aed" />
                    <span>{isEn ? 'Doctor Commissions (KPI)' : 'Shifokorlar Oylik Ulushi (KPI)'}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {isEn
                      ? 'Calculates exact percentage fees for doctors based on collected payments without manual spreadsheets.'
                      : 'Klinikadagi har bir shifokorning oylik foizini (ulushini) kalkulyatorsiz, 1 soniyada avtomatik hisoblab beradi.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: INVENTORY */}
          {activeTab === 'inventory' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <InventoryIcon size={14} />
                  <span>{isEn ? 'Module 07 • Inventory' : 'Modul 07 • Omborxona'}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {isEn ? 'Dental Consumables & Stock Management' : 'Stomatologik Materiallar va Ombor Nazorati'}
                </h2>
                <p className={styles.panelLead}>
                  {isEn
                    ? 'Track dental anesthetics, filling composites, and gloves. Receive early warnings before critical supplies finish.'
                    : 'Anestetiklar, plomba va tibbiy sarf materiallarini nazorat qiling. Material tugab qolmasdan oldin xabar oling.'}
                </p>
              </div>

              <div className={styles.appleFeaturesGrid}>
                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#2563eb" />
                    <span>{isEn ? 'Low Stock Warning' : 'Kam qolgan materiallar signali'}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {isEn
                      ? 'Set minimum stock numbers (e.g. 10 anesthetic ampoules). When supplies dip, you get an alert.'
                      : 'Masalan, karpula yoki plomba 5 tadan kam qolganda ekranda ogohlantirish chiqadi va o\'z vaqtida yangisi buyurtma qilinadi.'}
                  </p>
                </div>

                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#2563eb" />
                    <span>{isEn ? 'Supplier Invoices' : 'Yetkazib beruvchilar hisobi'}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {isEn
                      ? 'Store supplier contacts, incoming invoice prices, and delivery history.'
                      : 'Materiallarni kimdan, qaysi sanada va qancha narxda olganingiz bitta ro\'yxatda saqlanadi.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: LABORATORY */}
          {activeTab === 'laboratory' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <LabIcon size={14} />
                  <span>{isEn ? 'Module 08 • Laboratory' : 'Modul 08 • Tish Laboratoriyasi'}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {isEn ? 'Lab Orders & Delivery Deadlines' : 'Tish Texniklariga Buyurtmalar va Muddatlar'}
                </h2>
                <p className={styles.panelLead}>
                  {isEn
                    ? 'Send digital laboratory work orders for zirconia, ceramic crowns, and aligners without missing fitting dates.'
                    : 'Sirkoniy, metall-keramika tojlar va protezlarni laboratoriyaga yuboring va sinov (primerka) kunini aniq belgilang.'}
                </p>
              </div>

              <div className={styles.appleFlowList}>
                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>1</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{isEn ? 'Create Digital Order' : '1. Buyurtma yaratish'}</h4>
                    <p className={styles.flowDescription}>
                      {isEn
                        ? 'Select tooth number, VITA tooth shade, crown material, and attach photos.'
                        : 'Tish raqamini, VITA shkalasi bo\'yicha rangini (masalan: A2, A3) va material turini tanlab laboratoriyaga yuboring.'}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>2</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{isEn ? 'Track Readiness' : '2. Tayyor bo\'lish sanasini kuzatish'}</h4>
                    <p className={styles.flowDescription}>
                      {isEn
                        ? 'The reception staff sees exactly when the finished crown arrives and schedules the patient appropriately.'
                        : 'Qabulxona xodimi ish qachon tayyor bo\'lishini aniq ko\'radi va bemorni aynan o\'sha kunga bemalol chaqiradi.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: PROCESSES */}
          {activeTab === 'processes' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <ProcessesIcon size={14} />
                  <span>{isEn ? 'Module 09 • Workflows' : 'Modul 09 • Klinika Jarayonlari'}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {isEn ? 'Reception & Operatory Coordination' : 'Qabulxona va Shifokorlar O\'rtasidagi Bog\'liqlik'}
                </h2>
                <p className={styles.panelLead}>
                  {isEn
                    ? 'Seamless signal when a patient walks into the clinic reception, so doctors are instantly notified in their operatory.'
                    : 'Bemor klinikaga kirib kelganda administrator tugmani bosadi va shifokor xonasidagi ekranda bemor kelganligi darhol bildiriladi.'}
                </p>
              </div>

              <div className={styles.appleFeaturesGrid}>
                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#0284c7" />
                    <span>{isEn ? 'Instant Arrival Alert' : 'Bemor kelganligi haqida signal'}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {isEn
                      ? 'Reception marks "Arrived" and the doctor\'s screen updates immediately without calling or knocking.'
                      : 'Qabulxona xodimi shifokor xonasiga qatnab yoki telefon qilib bezovta qilmaydi, ekranda belgi chiqadi.'}
                  </p>
                </div>

                <div className={styles.appleFeatureBox}>
                  <div className={styles.featureBoxTitle}>
                    <CheckIcon size={16} color="#0284c7" />
                    <span>{isEn ? 'Zero Chair Idling' : 'Kreslolar bo\'sh qolmasligi'}</span>
                  </div>
                  <p className={styles.featureBoxDesc}>
                    {isEn
                      ? 'Optimizes clinic chair occupancy and reduces waiting room friction.'
                      : 'Kreslolar grafigini to\'g\'ri taqsimlash orqali navbatlar kutish zalida tiqilib qolishining oldi olinadi.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SECURITY */}
          {activeTab === 'security' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <SecurityIcon size={14} />
                  <span>{isEn ? 'Module 10 • Security' : 'Modul 10 • Xavfsizlik va Qonunchilik'}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {isEn ? 'Data Protection, Law No. 547 & Daily Backups' : 'Ma\'lumotlar Xavfsizligi, O\'RQ-547 Qonuni va Zaxiralash'}
                </h2>
                <p className={styles.panelLead}>
                  {isEn
                    ? 'Bank-level 256-bit encryption. All clinical data is hosted on servers within Uzbekistan in full legal compliance.'
                    : 'Bank darajasidagi 256-bitli shifrlash. Barcha tibbiy ma\'lumotlar O\'zbekiston hududidagi xavfsiz serverlarda saqlanadi.'}
                </p>
              </div>

              <div className={styles.appleSystemReq}>
                <div className={styles.reqGrid}>
                  <div className={styles.reqItemCard}>
                    <div className={styles.reqItemIcon}><CheckIcon size={20} /></div>
                    <div className={styles.reqItemContent}>
                      <div className={styles.reqItemTitle}>{isEn ? 'Uzbekistan Law No. 547' : 'O\'zbekiston O\'RQ-547 Qonuni'}</div>
                      <div className={styles.reqItemDesc}>{isEn ? 'All patient records are hosted legally within Uzbekistan.' : 'Barcha tibbiy ma\'lumotlar O\'zbekiston ichidagi serverlarda qonuniy saqlanadi.'}</div>
                    </div>
                  </div>

                  <div className={styles.reqItemCard}>
                    <div className={styles.reqItemIcon}><CheckIcon size={20} /></div>
                    <div className={styles.reqItemContent}>
                      <div className={styles.reqItemTitle}>{isEn ? 'Daily Automated Backups' : 'Kundalik Avtomatik Zaxira (Backup)'}</div>
                      <div className={styles.reqItemDesc}>{isEn ? 'Nightly snapshots prevent any computer breakdown data loss.' : 'Har kecha zaxira nusxasi olinadi, kompyuter buzilsa ham ma\'lumot yo\'qolmaydi.'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: SETTINGS */}
          {activeTab === 'settings' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <SettingsIcon size={14} />
                  <span>{isEn ? 'Module 11 • Settings' : 'Modul 11 • Klinika Sozlamalari'}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {isEn ? 'Customizing Your Clinic Profile' : 'Klinikangiz Sozlamalari va Moslashtirish'}
                </h2>
                <p className={styles.panelLead}>
                  {isEn
                    ? 'Upload clinic logo, customize printable receipt headers, and define opening hours.'
                    : 'Klinikangiz logotipini yuklang, chekda chiqadigan yuridik ma\'lumotlar va ish vaqtini belgilang.'}
                </p>
              </div>

              <div className={styles.appleFlowList}>
                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>1</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{isEn ? 'Logo & Receipt Headers' : 'Klinika logotipi va chek yozuvlari'}</h4>
                    <p className={styles.flowDescription}>
                      {isEn
                        ? 'Your logo, clinic address, and telephone numbers will be placed automatically onto every printed receipt and 043/h dossier.'
                        : 'Klinikangiz logotipi va telefon raqami bemorga beriladigan har bir kassa cheki hamda tibbiy varaqada chiroyli bo\'lib chiqadi.'}
                    </p>
                  </div>
                </div>

                <div className={styles.appleFlowItem}>
                  <div className={styles.flowBadgeNumber}>2</div>
                  <div className={styles.flowBody}>
                    <h4 className={styles.flowHeading}>{isEn ? 'Working Hours' : 'Klinika ish vaqtlari'}</h4>
                    <p className={styles.flowDescription}>
                      {isEn
                        ? 'Set start and closing hours for weekdays and weekends to format the appointments calendar.'
                        : 'Dushanbadan shanbagacha ochilish va yopilish soatlarini kiriting, taqvim avtomatik shunga moslashadi.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: FAQ */}
          {activeTab === 'faq' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <FaqIcon size={14} />
                  <span>{isEn ? 'Questions & Answers' : 'Ko\'p So\'raladigan Savollar'}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {isEn ? 'Frequently Asked Questions' : 'Eng Ko\'p Beriladigan Savol-Javoblar'}
                </h2>
                <p className={styles.panelLead}>
                  {isEn
                    ? 'Straightforward, practical answers to common questions asked by clinic managers and doctors.'
                    : 'Stomatologlar va klinika rahbarlaridan eng ko\'p tushadigan savollarga aniq va lo\'nda javoblar.'}
                </p>
              </div>

              <div className={styles.faqAccordion}>
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className={styles.faqItem}>
                      <button
                        type="button"
                        className={styles.faqHeader}
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                        aria-expanded={isOpen}
                      >
                        <span>{faq.q}</span>
                        <span className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ''}`}>
                          <ChevronDownIcon size={18} />
                        </span>
                      </button>
                      {isOpen && (
                        <div className={styles.faqAnswer}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 13: SUPPORT */}
          {activeTab === 'support' && (
            <div>
              <div className={styles.panelHeader}>
                <div className={styles.panelBadgeCategory}>
                  <SupportIcon size={14} />
                  <span>{isEn ? 'Support' : 'Qo\'llab-quvvatlash va Aloqa'}</span>
                </div>
                <h2 className={styles.panelTitle}>
                  {isEn ? 'DentUz Assistance & Staff Coaching' : 'DentUz Yordam Markazi va Bepul O\'rgatish'}
                </h2>
                <p className={styles.panelLead}>
                  {isEn
                    ? 'We help you migrate your data and coach your receptionists and doctors for free. We are always one call away.'
                    : 'Klinikangiz xodimlarini bepul o\'rgatamiz va ma\'lumotlarni ko\'chirishga yordam beramiz. Mutaxassislarimiz doimo aloqada.'}
                </p>
              </div>

              <div className={styles.supportCards}>
                <div className={styles.supportCard}>
                  <div
                    className={styles.supportCardIconCircle}
                    style={{ backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}
                  >
                    <PhoneCallIcon size={26} />
                  </div>
                  <h4 className={styles.supportCardTitle}>{isEn ? 'Phone Call' : 'Telefon Qo\'ng\'irog\'i'}</h4>
                  <p className={styles.supportCardSubtitle}>
                    {isEn ? 'Direct line to our customer support' : 'To\'g\'ridan-to\'g\'ri texnik ko\'mak raqami'}
                  </p>
                  <a href="tel:+998712004545" className={styles.supportActionBtn}>
                    +998 71 200 45 45
                  </a>
                </div>

                <div className={styles.supportCard}>
                  <div
                    className={styles.supportCardIconCircle}
                    style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', color: '#0284c7' }}
                  >
                    <TelegramIcon size={26} />
                  </div>
                  <h4 className={styles.supportCardTitle}>{isEn ? 'Telegram Support' : 'Telegram Ko\'mak'}</h4>
                  <p className={styles.supportCardSubtitle}>
                    {isEn ? 'Instant answers within 2 minutes' : '2 daqiqa ichida tezkor yozma javoblar'}
                  </p>
                  <a href="https://t.me/dentuz_support" target="_blank" rel="noreferrer" className={styles.supportActionBtn}>
                    @dentuz_support
                  </a>
                </div>

                <div className={styles.supportCard}>
                  <div
                    className={styles.supportCardIconCircle}
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}
                  >
                    <SparklesIcon size={26} />
                  </div>
                  <h4 className={styles.supportCardTitle}>{isEn ? 'Free Staff Coaching' : 'Bepul O\'rgatish Darsi'}</h4>
                  <p className={styles.supportCardSubtitle}>
                    {isEn ? 'Live Zoom or onsite coaching for your staff' : 'Klinikangiz uchun jonli yoki video taqdimot'}
                  </p>
                  <Link to="/contact" className={styles.supportActionBtn} style={{ background: '#059669' }}>
                    {isEn ? 'Book Coaching' : 'Treningga Yozilish'}
                  </Link>
                </div>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}
