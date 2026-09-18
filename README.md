# 🦷 DentUz — Zamonaviy Stomatologiya Klinikalari Boshqaruv Tizimi

<p align="center">
  <img src="./frontend/public/favicon.svg" alt="DentUz Logo" width="96" height="96" />
</p>

<p align="center">
  <b>O'zbekistondagi stomatologiya klinikalari uchun professional, ergonomik va to'liq avtomatlashtirilgan klinik operatsion tizim (Dental Clinic OS).</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white" alt="Vite 5" />
  <img src="https://img.shields.io/badge/CSS_Modules-Custom_Design_Tokens-1572B6?logo=css3&logoColor=white" alt="CSS Modules" />
  <img src="https://img.shields.io/badge/Typography-Inter_%26_JetBrains_Mono-000000" alt="Typography" />
  <img src="https://img.shields.io/badge/Design-Apple_Spotlight_%26_GateDent_Aesthetics-06B6D4" alt="Design" />
  <img src="https://img.shields.io/badge/PWA-Ready-10B981" alt="PWA Ready" />
</p>

---

## 🌟 Asosiy Imkoniyatlar (Features)

### 1. 🦷 Interaktiv Digital Odontogramma (FDI Xalqaro Standarti)
- 32 ta tishning to'liq anatomik joylashuvi (yuqori va pastki jag', 4 ta kvadrant).
- Har bir tishning **5 ta yuzasi** alohida boshqariladi: *Okklyuzal, Mezial, Distal, Vestibulyar, Lingval*.
- Holatlar: Sog'lom, Karies, Plomba, Koronka, Yo'q (sug'urilgan), Ildiz davolash.
- Tish bo'yicha tezkor muolaja belgilash va davolash tarixini real vaqtda ko'rish.

### 2. 📊 Real-vaqt Kreslolar va Klinika Dashboardi
- Klinika kreslolari holati real vaqt indikatori (Band / Bo'sh / Tozalanmoqda, qolgan vaqt taymeri, shifokor va muolaja nomi).
- Bugungi qabullar statistikasi va navbatdagi bemorlar ro'yxati.
- Haftalik tushum va dinamika vizual grafiklari (chart).
- Tezkor randevu qo'shish modali.

### 3. 👥 Bemorlar Boshqaruvi va Elektron Tibbiy Karta (EHR)
- Katta hajmdagi bemorlar ro'yxati uchun optimallashtirilgan tezkor qidiruv va filtrlash.
- Bemor profili: Anamnez, kontaktlar, qon guruhi, allergiyalar, tish formulasi, rentgen tasvirlari galereyasi va to'lovlar varaqasi.
- Rentgen (X-ray) lightbox ko'rish va tasvirlarni siqish algoritmi.

### 4. 📅 Aqlli Randevu Taqvimi (Calendar)
- Kunlik, haftalik va oylik interaktiv ko'rinish.
- Shifokorlar va kabinetlar bo'yicha filtrlar.
- O'zbekiston vaqt mintaqasi (`Asia/Tashkent`) bilan sinxronlangan qabul vaqtlari.

### 5. 📑 Davolash Rejasi va Professional PDF Eksport
- Bosqichma-bosqich davolash rejasi, har bir bosqich narxi, holati va muddati.
- O'zbekiston Respublikasi tibbiy hujjati talablariga mos, chop etishga tayyor rasmiy **Klinik Davolash Rejasi PDF hujjati**.

### 6. 💰 Moliya va Hisob-kitob Moduli
- Davrlar bo'yicha dinamik filtrlar (*"Shu oy"*, *"O'tgan oy"*, *"Boshqa sana"*).
- Jami tushum, kutilayotgan qoldiq to'lovlar, o'rtacha chek va to'lov turlari bo'yicha tahlil (*Payme, Click, Uzum, Naqd, Humo*).
- Hisob-fakturalar (Invoices) boshqaruvi.

### 7. 🔍 Apple Spotlight Universal Qidiruv (`⌘K` / `Ctrl+K`)
- Istalgan sahifadan turib bemorlar, shifokorlar, xizmatlar va sahifalarni bir zumda topish.
- Klaviatura orqali to'liq boshqaruv (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`).

### 8. 🌓 Klinik Ergonomik Dark / Light Mode
- Ko'z charchashini oldini oluvchi, GateDent va Apple dizayn falsafasiga asoslangan ranglar palitrasi.
- **Inter** shrifti — barcha sarlavhalar, matnlar, tugmalar va yorliqlar uchun.
- **JetBrains Mono** — qat'iy ravishda faqat raqamlar, narxlar, sanalar va ID kodlar uchun.
- 240px dan 72px ga ixchamlashuvchi yon panel (`Sidebar`) va silliq mikro-animatsiyalar.

---

## 🛠 Texnologiyalar Steki (Tech Stack)

| Qatlam | Texnologiya |
|---|---|
| **Frontend Framework** | React 18 (Hooks, Context, Suspense, Lazy loading) |
| **Build Tool** | Vite 5 (Fast HMR, optimized bundling) |
| **Styling** | Vanilla CSS Modules + CSS Custom Properties (Design Tokens) |
| **Typography** | Inter (UI), JetBrains Mono (Tabular Numbers/Codes) |
| **Icons** | Google Material Symbols & Custom SVG Icons |
| **Routing** | React Router v6 |
| **PWA** | Vite PWA Plugin (Offline caching, installable web app) |
| **Backend (Rejalashtirilgan)** | Node.js (Express) / Python (FastAPI) + PostgreSQL |

---

## 🚀 O'rnatish va Ishga Tushirish (Getting Started)

### Talablar:
- [Node.js](https://nodejs.org/) (v18 yoki undan yuqori)
- `npm` yoki `yarn` / `pnpm`

### 1. Repozitoriyani klonlash:
```bash
git clone https://github.com/USERNAME/dentuz.git
cd dentuz
```

### 2. Frontend bog'liqliklarini (dependencies) o'rnatish:
```bash
cd frontend
npm install
```

### 3. Dasturni dev rejimida ishga tushirish:
```bash
npm run dev
```
Brauzerda oching: [http://localhost:3000](http://localhost:3000)

### 4. Ishlab chiqarish (Production build) uchun yig'ish:
```bash
npm run build
npm run preview
```

---

## 📂 Loyiha Strukturasi (Folder Structure)

```text
DentUz/
├── .gitignore               # Git uchun filtrlar
├── package.json             # Root boshqaruv konfiguratsiyasi
├── README.md                # Loyiha bosh sahifasi va yo'riqnomasi
├── backend/                 # Backend API uchun tayyorlangan papka
└── frontend/                # React Vite Frontend ilovasi
    ├── index.html           # HTML5 bosh sahifa va SEO teglari
    ├── vite.config.js       # Vite konfiguratsiyasi
    └── src/
        ├── App.jsx          # Yo'nalishlar (Routes) va kontekstlar
        ├── main.jsx         # React ilova ildizi
        ├── api/             # Mock API xizmatlari (Bemorlar, Moliya, Randevular)
        ├── components/      # Qayta ishlatiluvchi UI komponentlar
        │   ├── Button/
        │   ├── CalendarGrid/
        │   ├── DataTable/
        │   ├── Odontogram/  # FDI 32 tishli SVG odontogramma
        │   ├── Sidebar/     # Yig'iluvchi yon navigatsiya
        │   ├── StatCard/
        │   ├── StatusPill/
        │   ├── Toast/
        │   └── TopBar/      # Apple Spotlight qidiruv va notifikatsiyalar
        ├── context/         # Auth, Theme va Sidebar global kontekstlari
        ├── hooks/           # Maxsus React hooklar
        ├── layouts/         # AppLayout, AuthLayout, PublicLayout
        ├── pages/           # Asosiy sahifalar (Dashboard, Patients, Finance...)
        ├── styles/          # global.css va tokens.css (Design System)
        └── utils/           # Formatlagichlar va rasm siqish utilitalari
```

---

## ⌨️ Klaviatura Qaynoq Tugmalari (Shortcuts)

| Tugma | Vazifasi |
|---|---|
| `⌘ + K` yoki `Ctrl + K` | Universal Apple Spotlight qidiruvni ochish |
| `[` | Yon panelni yig'ish / ochish (Sidebar toggle) |
| `Esc` | Ochiq modal, qidiruv yoki oynani yopish |

---

## 📄 Litsenziya

Ushbu loyiha MIT litsenziyasi asosida tarqatiladi. Batafsil ma'lumot uchun `LICENSE` fayliga qarang.
