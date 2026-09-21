import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  SparklesIcon,
  PatientsIcon,
  CalendarIcon,
  ToothIcon,
  TreatmentIcon,
  FinanceIcon,
  InventoryIcon,
  LabIcon,
  SecurityIcon,
  ProcessesIcon,
  ArrowRightIcon,
  PhoneCallIcon
} from '../Docs/DocsIcons';
import styles from './About.module.css';

export default function About() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  // Core Platform Modules
  const PLATFORM_MODULES = [
    {
      icon: <PatientsIcon size={24} />,
      iconBg: 'rgba(99, 102, 241, 0.1)',
      iconColor: '#6366f1',
      title: isEn ? 'Patient Chart (043/h)' : 'Elektron Bemor Kartasi (043/h)',
      desc: isEn
        ? 'Patient registration, contacts, medical history, secure storage of X-rays and documents, full visit timeline in a single dossier.'
        : 'Bemorlarni ro\'yxatga olish, telefon raqami, kasallik tarixi, rentgen va fotosuratlarni xavfsiz saqlash hamda to\'liq tashriflar arxivi.'
    },
    {
      icon: <CalendarIcon size={24} />,
      iconBg: 'rgba(245, 158, 11, 0.1)',
      iconColor: '#d97706',
      title: isEn ? 'Appointments & SMS Reminders' : 'Qabullar Taqvimi & SMS Eslatmalar',
      desc: isEn
        ? 'Visual chair allocation, overlap protection, and automated SMS reminders sent 2h prior to visits to reduce clinic no-shows.'
        : 'Shifokorlar va kreslolar bandligi jadvali. Bemor qabulni unutmasligi uchun 2 soat oldin yuboriladigan avtomatik SMS eslatmalar.'
    },
    {
      icon: <ToothIcon size={24} />,
      iconBg: 'rgba(13, 148, 136, 0.1)',
      iconColor: '#0d9488',
      title: isEn ? 'FDI Digital Odontogram' : 'FDI Raqamli Odontogramma',
      desc: isEn
        ? 'Global FDI standard tooth map, 5 anatomical surfaces, caries, fillings, crowns, and pediatric primary teeth support.'
        : 'Xalqaro FDI standarti bo\'yicha 32 ta tishning 5 tomonlama anatomik xaritasi, karies, plomba va bolalar sut tishlari rejimi.'
    },
    {
      icon: <TreatmentIcon size={24} />,
      iconBg: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#059669',
      title: isEn ? 'Treatment Plans & Estimates' : 'Davolash Rejalari & Smetalar',
      desc: isEn
        ? 'Multi-stage clinical protocols, procedure catalog, and instant cost calculations. Patients clearly understand their timeline.'
        : 'Bosqichma-bosqich davolash rejalari, klinika preyskuranti va avtomatik narx hisoblash. Bemor muddat va narxlarni aniq biladi.'
    },
    {
      icon: <FinanceIcon size={24} />,
      iconBg: 'rgba(139, 92, 246, 0.1)',
      iconColor: '#7c3aed',
      title: isEn ? 'Finance & Installment Payments' : 'Moliya, Kassa & QR Chek',
      desc: isEn
        ? 'Income and expenses, per-patient debts ledger, Payme/Click integration, and verified 80mm/58mm thermal receipts.'
        : 'Kassa balansi, Payme, Click, Humo, Uzcard va naqd to\'lovlar, qarzlar daftari hamda 80mm/58mm rasmiy kassa cheki.'
    },
    {
      icon: <InventoryIcon size={24} />,
      iconBg: 'rgba(59, 130, 246, 0.1)',
      iconColor: '#2563eb',
      title: isEn ? 'Inventory & Supplies Stock' : 'Omborxona & Moddiy Nazorat',
      desc: isEn
        ? 'Dental materials inventory, low-stock threshold alerts, automatic material deduction during treatments, and supplier invoices.'
        : 'Sarf materiallari qoldig\'i, minimum zaxira signali va muolaja davomida ishlatilgan materiallarni avtomatik hisobdan chiqarish.'
    },
    {
      icon: <LabIcon size={24} />,
      iconBg: 'rgba(236, 72, 153, 0.1)',
      iconColor: '#db2777',
      title: isEn ? 'Dental Lab Work Orders' : 'Tish Texnik Laboratoriyasi',
      desc: isEn
        ? 'Create digital work orders for zirconia, ceramic crowns, and dentures. Track production deadlines and fitting dates.'
        : 'Sirkoniy, metall-keramika tojlar va protezlarga laboratoriyaga elektron buyurtma berish hamda sinov kunlarini aniq belgilash.'
    },
    {
      icon: <SecurityIcon size={24} />,
      iconBg: 'rgba(14, 165, 233, 0.1)',
      iconColor: '#0284c7',
      title: isEn ? 'Team & Role-Based Permissions' : 'Jamoa & Ruxsatlar Chegarasi',
      desc: isEn
        ? 'Role-based access control (RBAC). Doctors see only their clinical charts, while receptionists handle scheduling safely.'
        : 'Bosh shifokor, stomatolog, administrator va kassir uchun alohida huquqlar. Maxfiy ma\'lumotlar begonalardan himoyalanadi.'
    }
  ];

  // Timeline / Story steps
  const TIMELINE_STEPS = [
    {
      year: '2023',
      title: isEn ? 'First Steps in Digital Health' : 'IT va Raqamli Tibbiyotdagi Dastlabki Qadamlar',
      desc: isEn
        ? 'Our software engineering team focused on healthcare workflow automation, studying the core operational bottlenecks of private clinics.'
        : 'Muhandislar jamoamiz xususiy tibbiyot muassasalaridagi asosiy qiyinchiliklar va avtomatlashtirish ehtiyojlarini chuqur o\'rgandi.'
    },
    {
      year: '2024',
      title: isEn ? 'Dental Practice Research' : 'Stomatologiya Sohasiga Ixtisoslashuv',
      desc: isEn
        ? 'Identified the critical need in Uzbekistan: chaotic paper charts, lost X-ray records, and uncollected debts. Development of DentUz began.'
        : 'O\'zbekistondagi klinikalarda qog\'oz daftarlar, yo\'qolgan rentgenlar va qarzlar nazoratsizligi muammosini hal qilish uchun DentUz loyihasi boshlandi.'
    },
    {
      year: '2025',
      title: isEn ? 'Platform Architecture & Cloud Engine' : 'Bulutli Arxitektura va FDI Tizimi',
      desc: isEn
        ? 'Engineered 5-surface FDI tooth charting, automatic fiscal receipt printing, multi-chair calendar, and 256-bit encryption.'
        : 'Xalqaro FDI tish xaritasi, 80mm kassa cheki chiqarish, kreslolar jadvali va 256-bitli shifrlangan bulutli arxitektura ishlab chiqildi.'
    },
    {
      year: '2026',
      title: isEn ? 'Official Launch & IT Park Residency' : 'Rasmiy Bozorga Chiqish & IT Park Rezidentligi',
      desc: isEn
        ? 'DentUz officially launched as an official IT Park resident, serving modern dental clinics across Tashkent, Samarkand, and regions.'
        : 'DentUz rasmiy IT Park rezidenti sifatida ishga tushirildi va Toshkent, Samarqand hamda viloyatlardagi zamonaviy klinikalarga xizmat ko\'rsatishni boshladi.'
    }
  ];

  return (
    <div className={styles.aboutPage}>
      {/* Ambient glow matching Features & Contact */}
      <div className={styles.ambientGlow} />

      {/* ── Signature Hero Section (Features style) ── */}
      <section className={styles.heroSection}>
        <div className={styles.pageBadge}>
          <SparklesIcon size={14} color="#0284c7" />
          <span>{isEn ? 'Official IT Park Uzbekistan Resident' : 'IT Park O\'zbekiston Rasmiy Rezidenti'}</span>
        </div>

        <h1 className={styles.pageTitle}>
          <span className={styles.titleLine1}>
            {isEn ? 'About Us — The Team Behind' : 'Stomatologiya Boshqaruvi —'}
          </span>
          <span className={styles.titleLine2}>
            {isEn ? 'DentUz Platform' : 'Biz Haqimizda & Missiyamiz'}
          </span>
        </h1>

        <p className={styles.pageSubtitle}>
          {isEn
            ? 'Everything a dentist does, from patient registration to financial reports — in one modern cloud platform, securely and efficiently.'
            : 'Bemorlar ro\'yxatidan to moliyaviy hisobotlargacha — stomatologiyaning har bir kundalik amaliyoti yagona ekotizimda.'}
        </p>

        {/* Stats Row */}
        <div className={styles.heroStatsRow}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>100%</span>
            <span className={styles.statLabel}>{isEn ? 'Cloud Architecture' : 'Bulutli Arxitektura'}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>FDI</span>
            <span className={styles.statLabel}>{isEn ? 'Global Standard' : 'Xalqaro Tish Standarti'}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>043/h</span>
            <span className={styles.statLabel}>{isEn ? 'SSV Ministry Compliant' : 'SSV 043/h Shakliga Mos'}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>256-bit</span>
            <span className={styles.statLabel}>{isEn ? 'AES Bank Encryption' : 'Bank Darajasida Shifrlash'}</span>
          </div>
        </div>
      </section>

      {/* ── Main Container ── */}
      <div className={styles.container}>
        {/* Mission Overview Card */}
        <section className={styles.missionSection}>
          <div className={styles.missionCard}>
            <h2 className={styles.missionLead}>
              {isEn
                ? 'DentUz is complete dental management software built specifically for clinics and dentists in Uzbekistan.'
                : 'DentUz — O\'zbekistondagi stomatologlar va klinikalar uchun maxsus ishlab chiqilgan yagona amaliy boshqaruv tizimi.'}
            </h2>
            <p className={styles.missionParagraph}>
              {isEn
                ? 'From the solo dental practitioner to multi-chair clinics with large medical teams, DentUz brings every part of daily work together onto one screen: electronic patient dossiers, appointments, clinical odontograms, finance, and stock inventory. Clinic owners choosing dental software select DentUz for exactly this seamless workflow.'
                : 'Yakka tartibdagi shifokor kabinetidan tortib yirik ko\'p tarmoqli klinikalar tarmog\'igacha — DentUz har kungi klinik jarayonlarni bitta zamonaviy ekranga jamlaydi: bemorlar kartasi, qabullar taqvimi, FDI odontogramma, moliya va omborxona. Qog\'oz jurnallar va alohida Excel fayllardan to\'liq xalos bo\'ling.'}
            </p>
            <p className={styles.missionParagraph}>
              {isEn
                ? 'The software is built around a dentist\'s real everyday workflow: reception registers and books the visit, the dentist charts tooth conditions on the interactive odontogram and builds a treatment plan, the cashier records payments with official thermal receipts, and the inventory module automatically deducts used materials. No operation gets lost on paper.'
                : 'Dastur stomatologning haqiqiy amaliy ish tartibiga moslangan: Qabulxona (resepshn) bemorni yozadi va SMS yuboradi, shifokor tish xaritasida holatni belgilaydi va davolash rejasini tuzadi, kassa rasmiy QR-kodli chek chiqaradi, omborxona esa ishlatilgan plomba va dori vositalarini avtomatik hisobdan chiqaradi. Hech bir ma\'lumot yo\'qolmaydi.'}
            </p>
          </div>
        </section>

        {/* Real Workflow Steps */}
        <section>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTag}>
              <ProcessesIcon size={14} />
              <span>{isEn ? 'Integrated Process' : 'Klinikaning Yaxlit Ish Jarayoni'}</span>
            </div>
            <h3 className={styles.sectionTitle}>
              {isEn ? 'How DentUz Unifies Your Entire Clinic' : 'DentUz Klinikangizni Qanday Birlashtiradi?'}
            </h3>
            <p className={styles.sectionSubtitle}>
              {isEn
                ? 'A synchronized pipeline connecting reception, operatory chair, finance desk, and inventory.'
                : 'Qabulxona, shifokor kreslosi, kassa va omborxona o\'rtasidagi uzluksiz raqamli zanjir.'}
            </p>
          </div>

          <div className={styles.workflowGrid}>
            <div className={styles.workflowCard}>
              <div className={styles.workflowStepNumber}>1</div>
              <h4 className={styles.workflowCardTitle}>{isEn ? 'Reception' : '1. Qabulxona'}</h4>
              <p className={styles.workflowCardDesc}>
                {isEn
                  ? 'Books appointments on the visual calendar and dispatches auto-SMS reminders.'
                  : 'Bemorga qulay vaqtni taqvimda band qiladi va avtomatik SMS eslatma jo\'natadi.'}
              </p>
            </div>

            <div className={styles.workflowCard}>
              <div className={styles.workflowStepNumber}>2</div>
              <h4 className={styles.workflowCardTitle}>{isEn ? 'Doctor Chair' : '2. Shifokor Kreslosi'}</h4>
              <p className={styles.workflowCardDesc}>
                {isEn
                  ? 'FDI odontogram allows instant condition charting (caries, crowns, implants).'
                  : '32 ta tishning interaktiv xaritasida karies, plomba yoki toj holatini 2 soniyada belgilaydi.'}
              </p>
            </div>

            <div className={styles.workflowCard}>
              <div className={styles.workflowStepNumber}>3</div>
              <h4 className={styles.workflowCardTitle}>{isEn ? 'Treatment Plan' : '3. Davolash Rejasi'}</h4>
              <p className={styles.workflowCardDesc}>
                {isEn
                  ? 'Auto-calculates total estimated sum from the clinic procedure price list.'
                  : 'Muolajalar preyskuranti asosida bemorga shaffof smeta va bosqichlar shakllanadi.'}
              </p>
            </div>

            <div className={styles.workflowCard}>
              <div className={styles.workflowStepNumber}>4</div>
              <h4 className={styles.workflowCardTitle}>{isEn ? 'Cash & Receipts' : '4. Kassa & Chek'}</h4>
              <p className={styles.workflowCardDesc}>
                {isEn
                  ? 'Accepts cash, cards, Payme/Click and prints 80mm receipts with QR codes.'
                  : 'To\'lovlarni qabul qilib, rasmiy QR-kodli 80mm termal kassa chekini chop etadi.'}
              </p>
            </div>

            <div className={styles.workflowCard}>
              <div className={styles.workflowStepNumber}>5</div>
              <h4 className={styles.workflowCardTitle}>{isEn ? 'Supply Stock' : '5. Omborxona'}</h4>
              <p className={styles.workflowCardDesc}>
                {isEn
                  ? 'Automatically decrements consumables and warns when supplies run low.'
                  : 'Ishlatilgan materiallarni hisobdan chiqaradi va qoldiq tugaganda ogohlantiradi.'}
              </p>
            </div>
          </div>
        </section>

        {/* Core Platform Modules Grid */}
        <section>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTag}>
              <SparklesIcon size={14} />
              <span>{isEn ? 'Platform Modules' : 'Platforma Modullari'}</span>
            </div>
            <h3 className={styles.sectionTitle}>
              {isEn ? '8 Specialized Modules Built for Dentistry' : 'Stomatologiya Uchun Yaratilgan 8 Asosiy Modul'}
            </h3>
            <p className={styles.sectionSubtitle}>
              {isEn
                ? 'Everything required to run a clinical practice seamlessly without third-party tools.'
                : 'Klinikangiz faoliyati uchun zarur bo\'lgan barcha amallar yagona yaxlit ekotizimda.'}
            </p>
          </div>

          <div className={styles.modulesGrid}>
            {PLATFORM_MODULES.map((mod, mIdx) => (
              <div key={mIdx} className={styles.moduleBox}>
                <div
                  className={styles.moduleIconTile}
                  style={{ backgroundColor: mod.iconBg, color: mod.iconColor }}
                >
                  {mod.icon}
                </div>
                <h4 className={styles.moduleTitle}>{mod.title}</h4>
                <p className={styles.moduleDesc}>{mod.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Journey Timeline */}
        <section className={styles.timelineSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTag}>
              <SparklesIcon size={14} />
              <span>{isEn ? 'Our History' : 'Bizning Tariximiz'}</span>
            </div>
            <h3 className={styles.sectionTitle}>
              {isEn ? 'From Idea to Reality — Our Journey' : 'G\'oyadan Haqiqatgacha — Bizning Yo\'limiz'}
            </h3>
            <p className={styles.sectionSubtitle}>
              {isEn
                ? 'How DentUz evolved into Uzbekistan\'s modern dental software ecosystem.'
                : 'DentUz qanday qilib O\'zbekistondagi zamonaviy stomatologiya platformasiga aylandi.'}
            </p>
          </div>

          <div className={styles.timelineGrid}>
            {TIMELINE_STEPS.map((step, tIdx) => (
              <div key={tIdx} className={styles.timelineCard}>
                <div className={styles.timelineYearBadge}>{step.year}</div>
                <h4 className={styles.timelineHeading}>{step.title}</h4>
                <p className={styles.timelineBody}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security & Continuous Support Box */}
        <section>
          <div className={styles.trustGrid}>
            <div className={styles.trustBox}>
              <div
                className={styles.trustIconTile}
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}
              >
                <SecurityIcon size={24} />
              </div>
              <div>
                <h4 className={styles.trustTitle}>
                  {isEn ? 'Security & Law No. 547 Compliance' : 'Xavfsizlik va O\'RQ-547 Qonuni'}
                </h4>
                <p className={styles.trustDesc}>
                  {isEn
                    ? 'Patient clinical data is protected with 256-bit AES encryption. Hosted locally inside Uzbekistan with daily automated backups.'
                    : 'Barcha ma\'lumotlar O\'zbekiston Respublikasi O\'RQ-547 qonuniga muvofiq Toshkentdagi xavfsiz serverlarda saqlanadi. Har tunda avtomatik nusxa olinadi.'}
                </p>
              </div>
            </div>

            <div className={styles.trustBox}>
              <div
                className={styles.trustIconTile}
                style={{ backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}
              >
                <PhoneCallIcon size={24} />
              </div>
              <div>
                <h4 className={styles.trustTitle}>
                  {isEn ? 'Continuous Support & Evolution' : 'Doimiy Ko\'mak va Rivojlanish'}
                </h4>
                <p className={styles.trustDesc}>
                  {isEn
                    ? 'We never sell software and disappear. We provide regular feature updates, free staff coaching, and direct 24/7 technical support.'
                    : 'Biz dasturni sotib g\'oyib bo\'lmaymiz. Muntazam yangilanishlar, xodimlarni bepul o\'rgatish va 24/7 jonli qo\'llab-quvvatlash bilan doim birgamiz.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className={styles.aboutCta}>
          <h3 className={styles.ctaTitle}>
            {isEn ? 'Ready to Digitize Your Dental Practice?' : 'Klinikangizni Raqamlashtirishga Tayyormisiz?'}
          </h3>
          <p className={styles.ctaSubtitle}>
            {isEn
              ? 'Join forward-thinking dental clinics across Uzbekistan. Start your 14-day free trial today.'
              : 'O\'zbekiston bo\'ylab yuzlab zamonaviy stomatologlar qatoriga qo\'shiling. 14 kunlik bepul sinovni bugunoq boshlang.'}
          </p>
          <div className={styles.ctaActions}>
            <Link to="/contact" className={styles.ctaPrimaryBtn}>
              <span>{isEn ? 'Get Started Free' : 'Bepul Sinab Ko\'rish'}</span>
              <ArrowRightIcon size={16} />
            </Link>
            <a href="tel:+998712004545" className={styles.ctaSecondaryBtn}>
              <PhoneCallIcon size={16} />
              <span>+998 71 200 45 45</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
