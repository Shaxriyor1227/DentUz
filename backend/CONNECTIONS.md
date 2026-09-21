# DentUz Backend — Connection & Integration Map

> Generated: 2026-09-21  
> Status: **Scaffold complete — awaiting PostgreSQL setup**

---

## 1. Database

| Setting | Value |
|---|---|
| Engine | PostgreSQL 15+ |
| ORM | Sequelize 6 |
| Config | `config/database.js` |
| Env vars | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |
| Sync command | `npm run db:sync` (force drop+create, dev only) |
| Auto-sync | `sequelize.sync({ alter: true })` runs on every `npm run dev` start |

---

## 2. Models (9 total)

| Model | Table | Key Fields | Associations |
|---|---|---|---|
| `Clinic` | `clinics` | id (UUID), name, address, phone, workingHours, subscriptionPlan | hasMany Users, Doctors, Patients, Appointments, Invoices |
| `User` | `users` | id (UUID), name, shortName, title, email, password (hashed), role ENUM, clinicId, phone, avatarUrl, refreshToken | belongsTo Clinic; hasOne Doctor |
| `Doctor` | `doctors` | id (UUID), userId, specialization, cabinetNumber, workingHours, clinicId | belongsTo User, Clinic; hasMany Appointments |
| `Patient` | `patients` | id (P-XXXX string), name, phone, birthdate, age, lastVisit, lastProcedure, nextVisit, status ENUM, allergies, notes, balance, clinicId | belongsTo Clinic; hasMany Appointments, Invoices; hasOne Odontogram |
| `Appointment` | `appointments` | id (apt-N string), time, duration, patientId, patientName, procedure, doctorId, doctorSlug, doctorName, status ENUM, day, date, chair, color, clinicId | belongsTo Patient, Doctor, Clinic |
| `Invoice` | `invoices` | id (INV-XXXX string), patientId, patient, doctor, procedure, date, method ENUM, amount, status ENUM, clinicId | belongsTo Patient, Clinic |
| `Odontogram` | `odontograms` | id (UUID), patientId (unique), teeth (JSONB), lastUpdatedBy | belongsTo Patient, User; hasMany OdontogramHistory |
| `OdontogramHistory` | `odontogram_history` | id (UUID), odontogramId, patientId, snapshot (JSONB), changedTooth, previousCondition, newCondition, notes, savedBy | belongsTo Odontogram, User |
| `Notification` | `notifications` | id (UUID), clinicId, recipientId, channel ENUM, type, title, body, status ENUM, sentAt, metadata (JSONB) | belongsTo Clinic |

---

## 3. API Endpoints

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/login` | Public | Login → returns `{ token, refreshToken, user }` |
| POST | `/refresh` | Public | Rotate refresh token |
| POST | `/logout` | JWT | Invalidate refresh token |
| GET | `/me` | JWT | Return current user object |

### Patients — `/api/patients`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | JWT | Paginated list: `?search=&filter=all|today|scheduled|debtor&page=1&pageSize=30` |
| GET | `/:id` | JWT | Single patient |
| POST | `/` | JWT | Create patient |
| PUT | `/:id` | JWT | Update patient |
| DELETE | `/:id` | owner, doctor | Delete patient |

**GET `/api/patients` response shape** (mirrors `patientsApi.js`):
```json
{
  "success": true,
  "items": [...],
  "total": 342,
  "fullFilteredCount": 342,
  "page": 1,
  "pageSize": 30,
  "allTotalCount": 342,
  "counts": { "all": 342, "today": 7, "scheduled": 114, "debtor": 23 }
}
```

### Appointments — `/api/appointments`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | JWT | All clinic appointments |
| GET | `/today` | JWT | Today's appointments |
| POST | `/` | JWT | Create appointment |
| PUT | `/:id` | JWT | Update appointment |
| DELETE | `/:id` | JWT | Cancel appointment |

**Appointment object shape** (mirrors `appointmentsApi.js`):
```json
{
  "id": "apt-1", "time": "09:00", "duration": 45,
  "patientId": "P-1042", "patientName": "Anvar Qosimov",
  "procedure": "Karies davolash",
  "doctorSlug": "azimov", "doctorName": "Dr. Azimov Farrux",
  "status": "completed", "day": "fri", "date": "2026-09-19",
  "chair": 1, "color": "#10B981"
}
```

### Finance — `/api/finance`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/stats` | JWT | KPI stats: `?period=this_month|last_month|custom` |
| GET | `/invoices` | JWT | Invoice list: `?period=this_month|last_month|custom` |
| POST | `/invoices` | JWT | Create invoice |
| PATCH | `/invoices/:id/status` | JWT | Update invoice status |

**Stats response shape** (mirrors `financeApi.js`):
```json
{
  "success": true,
  "stats": {
    "monthlyRevenue": 148500000, "revenueGrowth": 14.2,
    "pendingPayments": 24800000, "pendingCount": 32,
    "expenses": 46200000, "netProfit": 102300000
  }
}
```

### Odontogram — `/api/odontogram`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/:patientId` | JWT | Get teeth map (auto-creates if missing) |
| PUT | `/:patientId` | JWT | Save teeth map + append history |
| GET | `/:patientId/history` | JWT | Full change history |

### Team — `/api/team`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | JWT | All clinic staff |
| POST | `/` | owner, receptionist | Add team member |
| PUT | `/:id` | owner, receptionist | Update member |
| DELETE | `/:id` | owner | Remove member |

**Team member shape** (mirrors `teamApi.js`):
```json
{
  "id": "uuid", "name": "Dr. Jasur Azimov", "initials": "JA",
  "role": "Egasi", "roleType": "owner",
  "title": "Bosh shifokor • Implantolog",
  "email": "j.azimov@dentuz.uz", "phone": "+998 90 123 45 67",
  "branch": "Markaziy Klinika", "status": "offline"
}
```

---

## 4. Role Mapping

| DB Role | Display (UZ) | Frontend `roleType` | Permissions |
|---|---|---|---|
| `owner` | Egasi | owner | Full access |
| `doctor` | Shifokor | doctor | Patients, appointments, odontogram |
| `receptionist` | Administrator | admin | Patients, appointments, finance, team (add/edit) |
| `nurse` | Hamshira | nurse/assistant | View patients, odontogram assist |

> **Note:** Frontend mock uses `roleType: 'admin'` which maps to DB `role: 'receptionist'`.  
> `roleType: 'assistant'` is a display-only label — stored as `nurse` in DB.

---

## 5. Auth Flow

```
Client                          Backend
  │── POST /api/auth/login ────►│ validate email+password
  │◄── { token, refreshToken } ─│ sign JWT (15m) + refresh (7d)
  │                              │ store refreshToken in users.refreshToken
  │── GET /api/patients ────────►│ verify Bearer token
  │◄── { items, ... } ──────────│
  │── POST /api/auth/refresh ───►│ verify refresh token
  │◄── { token, refreshToken } ─│ rotate refresh token
```

Token stored in frontend: `localStorage.dentuz_auth_token` (access) + `localStorage.dentuz_auth_user` (user object).

---

## 6. Swagger UI

Available at: `http://localhost:5000/api/docs`

---

## 7. Setup Instructions

```bash
# 1. Install dependencies
cd backend && npm install

# 2. Create .env from template
cp .env.example .env
# → Fill in DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET

# 3. Create PostgreSQL database
createdb dentuz

# 4. Start server (auto syncs schema)
npm run dev

# 5. (Optional) Force reset schema
npm run db:sync
```

---

## 8. Next Steps

- [ ] `scripts/seedDb.js` — seed initial clinic + owner user
- [ ] SMS notifications via Eskiz API
- [ ] Telegram Bot webhook handler
- [ ] File upload (patient X-ray images) via multer + S3/local
- [ ] Dashboard aggregation endpoint (`/api/dashboard/stats`)
- [ ] Refresh token rotation with Redis blacklist
