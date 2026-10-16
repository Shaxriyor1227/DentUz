# 🦷 DentUz — Zamonaviy Stomatologiya Klinikalari Boshqaruv Tizimi (Dental Clinic OS)

<p align="center">
  <img src="./frontend/public/favicon.svg" alt="DentUz Logo" width="96" height="96" />
</p>

<p align="center">
  <b>O'zbekistondagi stomatologiya klinikalari uchun professional, multi-tenant va yuqori xavfsizlikka ega klinik boshqaruv platformasi.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React_18_%26_Vite_5-61DAFB?logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Backend-Express_%26_Sequelize-000000?logo=express&logoColor=white" alt="Express 4" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Security-HIPAA_Tenant_Isolation-06B6D4" alt="Security" />
  <img src="https://img.shields.io/badge/Deploy-Vercel_%2B_Render-000000?logo=vercel&logoColor=white" alt="Vercel & Render" />
  <img src="https://img.shields.io/badge/Languages-UZ_%26_EN_Only-10B981" alt="Languages" />
</p>

---

## 🌟 Tizim Arxitekturasi va Xavfsizlik

DentUz bemorlarning nozik tibbiy ma'lumotlari (EHR, tashxislar, rentgen suratlari, to'lovlar) bilan ishlagani sababli xavfsizlik tizimning yadrosiga qurilgan:

1. **Multi-Tenant Izolyatsiyasi (BOLA/IDOR Himoyasi):** Har bir so'rov `tenantMiddleware` va `withTenantScope` orqali tekshiriladi. Klinika A foydalanuvchisi boshqa klinikaning ma'lumotlariga kira olmaydi (`404 Not Found`).
2. **Tibbiy Fayllar Xavfsizligi:** Ochiq statik papkalar butunlay o'chirilgan. Fayllarga faqat `GET /api/medical-records/:id/files/:fileId` endpointi, JWT autentifikatsiyasi va tenant tekshiruvi orqali ruxsat beriladi.
3. **Storage Abstraksiyasi:** Render diski vaqtinchalik bo'lgani sababli `storageService.js` orqali **Supabase Storage** (yoki S3) drayveri integratsiya qilingan (Private bucket, Service Key faqat backendda).
4. **Fayl Haqiqiyligini Tekshirish (Magic Bytes):** Kengaytma bilan birga faylning dastlabki baytlari (PDF, PNG, JPEG, WEBP, DICOM) tekshiriladi.
5. **Kengaytirilgan Auth & Token Rotation:** Refresh tokenlar SHA-256 xesh qilinib saqlanadi. Bir vaqtda bir nechta tablar yuklanishi uchun 20 soniyalik qisqa **Grace Window** mavjud. O'g'irlangan yoki eski token ishlatilsa barcha sessiyalar bekor qilinadi.
6. **AuditLog & Soft Delete:** Bemorlar va to'lovlar o'chirilganda `paranoid: true` (soft delete) qo'llanadi. Muhim amallar `AuditLog` modelida qayd etiladi.
7. **Cold-Start UX:** Render bepul rejimida server uyg'onishini kutish uchun frontendda avtomatik 3 soniyalik cold-start indikatori va GET so'rovlarida qayta urinish (retry) mexanizmi joriy etilgan.

---

## 🚀 Ishga Tushirish va Deploy Yo'riqnomasi

### 1. Render.com ga Backendni Deploy Qilish

Backend Render Web Service sifatida ishlaydi. Loyiha ildizida `render.yaml` (Blueprint) mavjud.

#### Qadamlar:
1. [Render.com Dashboard](https://dashboard.render.com/) ga kiring.
2. **New +** -> **Blueprint** ni tanlang va DentUz GitHub repozitoriysini ulang.
3. Render avtomatik `render.yaml` faylini aniqlaydi.
4. Muhit o'zgaruvchilarini to'ldiring:

| O'zgaruvchi | Tavsifi | Namuna qiymat |
|---|---|---|
| `NODE_ENV` | Ishga tushish muhiti | `production` |
| `DATABASE_URL` | PostgreSQL ulanish URL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT imzo kaliti (kamida 32 belgi) | `crypto.randomBytes(32).toString('hex')` |
| `JWT_REFRESH_SECRET` | Refresh JWT kaliti (kamida 32 belgi) | `crypto.randomBytes(32).toString('hex')` |
| `CORS_ORIGINS` | Ruxsat etilgan frontend domenlari | `https://dentuz.vercel.app` |
| `STORAGE_DRIVER` | Fayllar ombori drayveri | `supabase` |
| `SUPABASE_URL` | Supabase loyiha URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase Private Service Key | `eyJhbGciOi...` |
| `STORAGE_BUCKET` | Maxfiy fayllar papkasi | `medical-records` |
| `BOT_ENABLED` | Telegram bot polling | `false` (web uchun) / `true` (worker uchun) |
| `ENABLE_SWAGGER` | Swagger docs yoqish | `false` (yoki Basic Auth bilan `true`) |

5. **Start Command:** `npm run migrate && npm start` (Har bir deployda yangi migratsiyalar avtomatik xavfsiz bajariladi).
6. **Health Check Path:** `/api/health`

> ⚠️ **Muhim:** Render bepul tarifida konteyner 15 daqiqa harakatsizlikdan so'ng uxlaydi. [UptimeRobot](https://uptimerobot.com/) kabi bepul xizmat orqali `https://your-app.onrender.com/api/health` manziliga har 5-10 daqiqada HTTP GET ping qo'yish tavsiya etiladi.

---

### 2. Vercel ga Frontendni Deploy Qilish

Frontend Vercel platformasiga optimallashtirilgan (`vercel.json` xavfsizlik sarlavhalari va CSP bilan).

#### Qadamlar:
1. [Vercel Dashboard](https://vercel.com/) ga kiring.
2. **Add New Project** -> DentUz repozitoriyini tanlang.
3. **Root Directory:** `frontend` deb belgilang.
4. **Environment Variables:**
   - `VITE_API_URL`: Backend API manzili (masalan: `https://dentuz.onrender.com/api`).
   - `VITE_USE_MOCK`: `false` (Production build uchun qat'iy talab).
5. **Deploy** tugmasini bosing.

---

## 🗄️ Baza Zaxirasi va Migratsiya Tartibi

Ishlab chiqarishda (Production) ma'lumotlarni xavfsiz yangilash qat'iy tartibda amalga oshiriladi:

### 1-Qadam: Zaxira nusxa olish (pg_dump)
Har qanday deploy yoki migratsiyadan oldin zaxira oling:
```bash
pg_dump -U postgres -d dentuz -F c -b -v -f "dentuz_backup_$(date +%Y%m%d).dump"
```

### 2-Qadam: Migratsiyalarni tekshirish va ishga tushirish
```bash
# Migratsiyalar holatini ko'rish
npm --prefix backend run migrate:status

# Yangi migratsiyalarni xavfsiz qo'llash
npm --prefix backend run migrate

# Zarurat bo'lsa oxirgi migratsiyani orqaga qaytarish
npm --prefix backend run migrate:undo
```

### 3-Qadam: Yangi kodni deploy qilish
Backend avtomatik ishga tushganda `assertNoPendingMigrations()` orqali bazaning tayyorligini tasdiqlaydi.

---

## 👑 Birinchi SuperAdmin Akkauntini Yaratish

Yangi bazaga tizim egalari (SuperAdmin) kirishi uchun maxsus xavfsiz skript mavjud:

```bash
# Standart yoki env dagi parametrlar bilan yaratish
cd backend
node scripts/seed_supabase_superadmin.js
```
*Skript mavjud foydalanuvchini yangilaydi yoki xavfsiz parol xeshi (bcrypt 12 raund) bilan yangi `superadmin` akkaunt yaratadi.*

---

## 🧪 Avtomatlashtirilgan Xavfsizlik Testlari

Har qanday o'zgarishdan so'ng barcha xavfsizlik va tenant qatlamlarini tekshiring:

```bash
# Barcha 23 ta xavfsizlik testlarini ishga tushirish
npm --prefix backend run test:security
```
Testlar quyidagilarni avtomatik sinovdan o'tkazadi:
- BOLA / Broken Access Control (`/api/clinics/*`)
- Ruxsatsiz tibbiy fayllarga kirishning oldini olish
- Barcha modellar bo'yicha Cross-Tenant IDOR testlari (Bemor, Kvitansiya, To'lov, Odontogramma, Davolash rejasi, Laboratoriya, Inventar)
- `/auth/register` orqali superadmin huquqini noqonuniy olishni rad etish
- Shifokorlar o'rtasida begona tibbiy yozuvlarni tahrirlashdan himoya
- Concurrent Refresh Token Rotation (20s Grace Window)
- Swagger Basic Auth va `/api/health` 2-soniyalik timeoutli DB tekshiruvi

---

## 📄 Til Siyosati

DentUz tizimi xalqaro va milliy standartlarga mos ravishda **faqat O'zbek (`uz`) va Ingliz (`en`)** tillarini qo'llab-quvvatlaydi. Rus tili qo'llanilmaydi.

---

## 📄 Litsenziya
Ushbu loyiha maxfiy va xususiy mulk hisoblanadi. Ruxsatsiz nusxa ko'chirish qat'iyan taqiqlanadi.
