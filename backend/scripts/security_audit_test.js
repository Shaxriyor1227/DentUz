const path = require('path');
const fs = require('fs');
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = require('../models');
const {
  Clinic, User, Doctor, Patient, Appointment, Invoice, Payment,
  MedicalRecord, Odontogram, TreatmentPlan, LabOrder, Inventory, ClinicApplication
} = db;

// Import middlewares & routers as configured in app.js
const { authenticate, authorize } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenantMiddleware');

const authRoutes = require('../routes/authRoutes');
const clinicRoutes = require('../routes/clinicRoutes');
const patientRoutes = require('../routes/patientRoutes');
const appointmentRoutes = require('../routes/appointmentRoutes');
const financeRoutes = require('../routes/financeRoutes');
const odontogramRoutes = require('../routes/odontogramRoutes');
const teamRoutes = require('../routes/teamRoutes');
const userRoutes = require('../routes/userRoutes');
const notificationRoutes = require('../routes/notificationRoutes');
const serviceRoutes = require('../routes/serviceRoutes');
const treatmentPlanRoutes = require('../routes/treatmentPlanRoutes');
const paymentRoutes = require('../routes/paymentRoutes');
const medicalRecordRoutes = require('../routes/medicalRecordRoutes');
const labOrderRoutes = require('../routes/labOrderRoutes');
const inventoryRoutes = require('../routes/inventoryRoutes');
const superAdminRoutes = require('../routes/superAdminRoutes');

function createTestServer() {
  const app = express();
  app.use(express.json());

  // Static files as in app.js line 79
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.use('/api/auth', authRoutes);
  app.use('/api', clinicRoutes);

  app.use('/api', authenticate, tenantMiddleware, patientRoutes);
  app.use('/api', authenticate, tenantMiddleware, appointmentRoutes);
  app.use('/api', authenticate, tenantMiddleware, financeRoutes);
  app.use('/api', authenticate, tenantMiddleware, odontogramRoutes);
  app.use('/api', authenticate, tenantMiddleware, teamRoutes);
  app.use('/api', authenticate, tenantMiddleware, userRoutes);
  app.use('/api', authenticate, tenantMiddleware, notificationRoutes);
  app.use('/api', authenticate, tenantMiddleware, serviceRoutes);
  app.use('/api', authenticate, tenantMiddleware, treatmentPlanRoutes);
  app.use('/api', authenticate, tenantMiddleware, paymentRoutes);
  app.use('/api', authenticate, tenantMiddleware, medicalRecordRoutes);
  app.use('/api', authenticate, tenantMiddleware, labOrderRoutes);
  app.use('/api', authenticate, tenantMiddleware, inventoryRoutes);

  app.use('/api/superadmin', superAdminRoutes);

  return app;
}

function generateToken(userId, role, clinicId) {
  return jwt.sign({ id: userId, role, clinicId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function runAudit() {
  console.log('===============================================================');
  console.log('       DENTUZ XAVFSIZLIK AUDITI VA ISBOTLASH SKRIPTI           ');
  console.log('===============================================================');

  const app = createTestServer();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server ishga tushdi: ${baseUrl}\n`);

  const results = [];

  try {
    // Setup test fixtures in PostgreSQL
    // 1. Two separate clinics
    const clinicA = await Clinic.create({
      name: `Test Klinika Alpha_${Date.now()}`,
      phone: '+998901111111',
    });
    const clinicB = await Clinic.create({
      name: `Test Klinika Beta_${Date.now()}`,
      phone: '+998902222222',
    });

    // 2. Users for Clinic A (receptionist, doctor, owner)
    const receptionistA = await User.create({
      name: 'Receptionist A',
      email: `receptionist_a_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'receptionist',
      clinicId: clinicA.id,
      isActive: true,
    });

    const doctorA = await User.create({
      name: 'Dr. Alpha A',
      email: `doctor_a_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'doctor',
      clinicId: clinicA.id,
      isActive: true,
    });
    const docProfileA = await Doctor.create({
      userId: doctorA.id,
      clinicId: clinicA.id,
      specialization: 'Terapevt',
    });

    const doctorA2 = await User.create({
      name: 'Dr. Alpha A2',
      email: `doctor_a2_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'doctor',
      clinicId: clinicA.id,
      isActive: true,
    });
    const docProfileA2 = await Doctor.create({
      userId: doctorA2.id,
      clinicId: clinicA.id,
      specialization: 'Ortodont',
    });

    const ownerA = await User.create({
      name: 'Owner A',
      email: `owner_a_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'owner',
      clinicId: clinicA.id,
      isActive: true,
    });

    // 3. User & Resources for Clinic B
    const ownerB = await User.create({
      name: 'Owner B',
      email: `owner_b_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'owner',
      clinicId: clinicB.id,
      isActive: true,
    });

    const patientB = await Patient.create({
      id: `P-B${Date.now().toString().slice(-4)}`,
      name: 'Secret Patient Beta',
      phone: '+998909998877',
      clinicId: clinicB.id,
    });

    const invoiceB = await Invoice.create({
      id: `INV-B-${Date.now().toString().slice(-4)}`,
      patientId: patientB.id,
      patient: patientB.name,
      amount: 1500000,
      clinicId: clinicB.id,
    });

    const paymentB = await Payment.create({
      invoiceId: invoiceB.id,
      patientId: patientB.id,
      amount: 500000,
      method: 'Naqd',
      receiptNumber: `RCP-B-${Date.now()}`,
      clinicId: clinicB.id,
    });

    const docProfileB = await Doctor.create({
      userId: ownerB.id,
      clinicId: clinicB.id,
      specialization: 'Terapevt Beta',
    });

    const medRecordB = await MedicalRecord.create({
      patientId: patientB.id,
      doctorId: docProfileB.id,
      complaints: 'Maxfiy tashxis Beta klinika',
      diagnosis: 'Pulpit K04',
      clinicId: clinicB.id,
    });

    const planB = await TreatmentPlan.create({
      id: `TP-B-${Date.now().toString().slice(-4)}`,
      patientId: patientB.id,
      doctorId: docProfileB.id,
      title: 'Maxfiy reja Beta',
      clinicId: clinicB.id,
    });

    const labOrderB = await LabOrder.create({
      patientId: patientB.id,
      doctorId: docProfileB.id,
      workType: 'zirconia_crown',
      technicianName: 'Lab Beta',
      dueDate: '2026-12-31',
      clinicId: clinicB.id,
    });

    const inventoryB = await Inventory.create({
      name: 'Maxfiy Dori Beta',
      quantity: 50,
      minQuantity: 10,
      clinicId: clinicB.id,
    });

    const appB = await ClinicApplication.create({
      name: 'Ariza Beruvchi Maxfiy',
      clinicName: 'Yashirin Klinika',
      phone: '+998901234567',
      status: 'new',
    });

    // Tokens
    const tokenRecA = generateToken(receptionistA.id, receptionistA.role, clinicA.id);
    const tokenDocA = generateToken(doctorA.id, doctorA.role, clinicA.id);
    const tokenDocA2 = generateToken(doctorA2.id, doctorA2.role, clinicA.id);
    const tokenOwnerA = generateToken(ownerA.id, ownerA.role, clinicA.id);

    console.log('--- TEST 2.a: clinicRoutes ruxsatsiz kirish (Broken Access Control) ---');
    // Test 2.a.1: Receptionist A gets all clinics
    const resClinics = await fetch(`${baseUrl}/api/clinics`, {
      headers: { Authorization: `Bearer ${tokenRecA}` }
    });
    const bodyClinics = await resClinics.json();
    const canSeeAllClinics = resClinics.status === 200 && Array.isArray(bodyClinics.data);
    results.push({
      test: '2.a.1 GET /api/clinics (Receptionist token)',
      expected: '403 Forbidden (Faqat superadmin)',
      actual: `${resClinics.status} ${resClinics.statusText} (Ko'rindi: ${bodyClinics.data?.length} ta klinika)`,
      vulnerable: canSeeAllClinics
    });

    // Test 2.a.2: Receptionist A reads Clinic B details
    const resClinicB = await fetch(`${baseUrl}/api/clinics/${clinicB.id}`, {
      headers: { Authorization: `Bearer ${tokenRecA}` }
    });
    const bodyClinicB = await resClinicB.json();
    const canSeeClinicB = resClinicB.status === 200 && bodyClinicB.data?.id === clinicB.id;
    results.push({
      test: '2.a.2 GET /api/clinics/:id (Clinic B ni ko\'rish)',
      expected: '403 Forbidden',
      actual: `${resClinicB.status} (Ko'rildi: ${bodyClinicB.data?.name})`,
      vulnerable: canSeeClinicB
    });

    // Test 2.a.3: Receptionist A deletes Clinic B
    const resDeleteClinicB = await fetch(`${baseUrl}/api/clinics/${clinicB.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenRecA}` }
    });
    const canDeleteClinicB = resDeleteClinicB.status === 200;
    results.push({
      test: '2.a.3 DELETE /api/clinics/:id (Boshqa klinikani o\'chirish)',
      expected: '403 Forbidden',
      actual: `${resDeleteClinicB.status} ${resDeleteClinicB.statusText}`,
      vulnerable: canDeleteClinicB
    });

    // Test 2.a.4: Receptionist A views confidential clinic applications
    const resApps = await fetch(`${baseUrl}/api/clinics/applications`, {
      headers: { Authorization: `Bearer ${tokenRecA}` }
    });
    const bodyApps = await resApps.json();
    const canSeeApps = resApps.status === 200 && bodyApps.count > 0;
    results.push({
      test: '2.a.4 GET /api/clinics/applications (Arizalarni o\'qish)',
      expected: '403 Forbidden',
      actual: `${resApps.status} (Ko'rildi: ${bodyApps.count} ta ariza)`,
      vulnerable: canSeeApps
    });

    console.log('--- TEST 2.b: /uploads/medical/ fayllari tokensiz ochilishi ---');
    const uploadDir = path.join(__dirname, '../uploads/medical');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const proofFile = path.join(uploadDir, 'audit_proof_xray.txt');
    fs.writeFileSync(proofFile, 'BEMORNING MAXFIY RENTGEN VA TIBBIY MA\'LUMOTI');

    const resStatic = await fetch(`${baseUrl}/uploads/medical/audit_proof_xray.txt`);
    const staticText = await resStatic.text();
    const staticAccessible = resStatic.status === 200 && staticText.includes('MAXFIY');
    results.push({
      test: '2.b GET /uploads/medical/:file (Tokensiz)',
      expected: '401/403/404 (Ochiq statik papka bo\'lmasligi kerak)',
      actual: `${resStatic.status} (Fayl ochiq yuklab olindi!)`,
      vulnerable: staticAccessible
    });
    try { fs.unlinkSync(proofFile); } catch {}

    console.log('--- TEST 2.c: IDOR (Klinika A foydalanuvchisi Klinika B resurslariga kirishi) ---');
    // We already deleted Clinic B in 2.a.3 if vulnerable, let's create Clinic C for 2.c
    const clinicC = await Clinic.create({ name: `Test Klinika Gamma_${Date.now()}` });
    const patientC = await Patient.create({
      id: `P-C${Date.now().toString().slice(-4)}`,
      name: 'Secret Patient Gamma',
      clinicId: clinicC.id,
    });
    const invC = await Invoice.create({
      id: `INV-C-${Date.now().toString().slice(-4)}`,
      patientId: patientC.id,
      patient: patientC.name,
      amount: 800000,
      clinicId: clinicC.id,
    });
    const payC = await Payment.create({
      invoiceId: invC.id,
      patientId: patientC.id,
      amount: 400000,
      clinicId: clinicC.id,
    });
    const userC = await User.create({
      name: 'Owner C',
      email: `owner_c_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'owner',
      clinicId: clinicC.id,
      isActive: true,
    });
    const docProfileC = await Doctor.create({
      userId: userC.id,
      clinicId: clinicC.id,
      specialization: 'Ortoped Gamma',
    });
    const medC = await MedicalRecord.create({
      patientId: patientC.id,
      doctorId: docProfileC.id,
      complaints: 'Gamma maxfiy shikoyat',
      diagnosis: 'Karies',
      clinicId: clinicC.id,
    });
    const planC = await TreatmentPlan.create({
      id: `TP-C-${Date.now().toString().slice(-4)}`,
      patientId: patientC.id,
      doctorId: docProfileC.id,
      title: 'Gamma reja',
      clinicId: clinicC.id,
    });
    const labC = await LabOrder.create({
      patientId: patientC.id,
      doctorId: docProfileC.id,
      workType: 'zirconia_crown',
      technicianName: 'Gamma Lab',
      dueDate: '2026-12-31',
      clinicId: clinicC.id,
    });
    const itemC = await Inventory.create({
      name: 'Gamma dori',
      clinicId: clinicC.id,
    });

    // Check cross-tenant access to Clinic C objects using Clinic A token
    const idorChecks = [
      { name: 'GET /api/patients/:id', url: `/api/patients/${patientC.id}`, token: tokenRecA },
      { name: 'GET /api/finance/invoices/:id', url: `/api/finance/invoices/${invC.id}`, token: tokenOwnerA },
      { name: 'GET /api/payments/:id', url: `/api/payments/${payC.id}`, token: tokenOwnerA },
      { name: 'GET /api/medical-records/:id', url: `/api/medical-records/${medC.id}`, token: tokenDocA },
      { name: 'GET /api/odontogram/:patientId', url: `/api/odontogram/${patientC.id}`, token: tokenDocA },
      { name: 'GET /api/treatment-plans/:id', url: `/api/treatment-plans/${planC.id}`, token: tokenDocA },
      { name: 'GET /api/lab-orders/:id', url: `/api/lab-orders/${labC.id}`, token: tokenDocA },
      { name: 'GET /api/inventory/:id', url: `/api/inventory/${itemC.id}`, token: tokenOwnerA },
    ];

    for (const c of idorChecks) {
      const res = await fetch(`${baseUrl}${c.url}`, {
        headers: { Authorization: `Bearer ${c.token}` }
      });
      const data = await res.json().catch(() => ({}));
      const isLeaked = res.status === 200;
      results.push({
        test: `2.c IDOR: ${c.name} (Klinika C resursini Klinika A tokeni bilan olish)`,
        expected: '404 yoki 403',
        actual: `${res.status} (${isLeaked ? 'MA\'LUMOT SIZIB CHIQDI' : data.message || 'Bloklandi'})`,
        vulnerable: isLeaked
      });
    }

    console.log('--- TEST 2.d: Rol chegaralari (Privilege Boundaries) ---');
    // 2.d.1: Receptionist tries finance routes
    const resRecFinance = await fetch(`${baseUrl}/api/finance/invoices`, {
      headers: { Authorization: `Bearer ${tokenRecA}` }
    });
    results.push({
      test: '2.d.1 Receptionist -> GET /api/finance/invoices',
      expected: '403 Forbidden',
      actual: `${resRecFinance.status}`,
      vulnerable: resRecFinance.status === 200
    });

    // 2.d.2: Receptionist tries team routes
    const resRecTeam = await fetch(`${baseUrl}/api/team`, {
      headers: { Authorization: `Bearer ${tokenRecA}` }
    });
    results.push({
      test: '2.d.2 Receptionist -> GET /api/team',
      expected: '403 Forbidden',
      actual: `${resRecTeam.status}`,
      vulnerable: resRecTeam.status === 200
    });

    // 2.d.3: Receptionist tries user management
    const resRecUsers = await fetch(`${baseUrl}/api/users`, {
      headers: { Authorization: `Bearer ${tokenRecA}` }
    });
    results.push({
      test: '2.d.3 Receptionist -> GET /api/users',
      expected: '403 Forbidden',
      actual: `${resRecUsers.status}`,
      vulnerable: resRecUsers.status === 200
    });

    // 2.d.4: Doctor A2 updates Doctor A1's medical record
    const patientA = await Patient.create({
      id: `P-A${Date.now().toString().slice(-4)}`,
      name: 'Patient Alpha',
      clinicId: clinicA.id,
    });
    const medRecDoctorA = await MedicalRecord.create({
      patientId: patientA.id,
      doctorId: docProfileA.id,
      complaints: 'Dastlabki shikoyat',
      diagnosis: 'Karies',
      clinicId: clinicA.id,
    });
    const resDocA2Edit = await fetch(`${baseUrl}/api/medical-records/${medRecDoctorA.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenDocA2}`
      },
      body: JSON.stringify({
        patientId: patientA.id,
        doctorId: docProfileA2.id,
        complaints: 'BOSHQA DOKTOR TOMONIDAN BUZILGAN YOZUV'
      })
    });
    const docA2Body = await resDocA2Edit.json().catch(() => ({}));
    results.push({
      test: '2.d.4 Doctor A2 -> PUT /api/medical-records/:id (Boshqa shifokor yozuvini tahrirlash)',
      expected: '403 Forbidden yoki faqat o\'z yozuvlari',
      actual: `${resDocA2Edit.status} (${docA2Body.data?.complaints || docA2Body.message})`,
      vulnerable: resDocA2Edit.status === 200
    });

    console.log('--- TEST 2.e: /auth/register orqali SuperAdmin/Owner huquqini o\'g\'irlash ---');
    const attackerEmail = `attacker_super_${Date.now()}@pwn.com`;
    const resRegister = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker Superadmin',
        email: attackerEmail,
        password: 'Password123!',
        role: 'superadmin',
        clinicId: clinicA.id
      })
    });
    const regData = await resRegister.json().catch(() => ({}));
    const createdUser = await User.findOne({ where: { email: attackerEmail } });
    const isEscalated = resRegister.status === 201 && createdUser && createdUser.role === 'superadmin';
    results.push({
      test: '2.e POST /api/auth/register (role: "superadmin" bilan ro\'yxatdan o\'tish)',
      expected: '400/403 (O\'zboshimchalik bilan rol va clinicId tanlash bloklanishi kerak)',
      actual: `${resRegister.status} (Bazadagi roli: ${createdUser?.role})`,
      vulnerable: isEscalated
    });

    // Clean up test data
    try {
      await Clinic.destroy({ where: { id: [clinicA.id, clinicB.id, clinicC.id] } });
      await User.destroy({ where: { email: attackerEmail } });
    } catch {}

  } catch (err) {
    console.error('Audit bajarishda xatolik yuz berdi:', err);
  } finally {
    server.close();
  }

  console.log('\n===============================================================');
  console.log('                 AUDIT NATIJALARI JADVALI                      ');
  console.log('===============================================================');
  console.table(results.map(r => ({
    'Test': r.test,
    'Kutilgan': r.expected,
    'Haqiqiy natija': r.actual,
    'Holat': r.vulnerable ? '🚨 ZAIFLIK ISBOTLANDI' : '✅ HIMOYA MAVJUD'
  })));

  process.exit(0);
}

runAudit();
