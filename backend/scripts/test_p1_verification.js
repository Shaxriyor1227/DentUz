require('dotenv').config();
const {
  sequelize,
  Clinic,
  User,
  Doctor,
  Patient,
  Appointment,
  Invoice,
  Payment,
  Inventory,
  MedicalRecord,
  LabOrder,
  TreatmentPlan,
  Service,
  Notification,
  Odontogram,
  OdontogramHistory,
} = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const API_BASE = 'http://127.0.0.1:5000/api';

// 1. Strict Env Secret Verification (No hardcoded fallback)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("❌ XATO: .env da JWT_SECRET aniqlanmagan! Test to'xtatildi.");
  process.exit(1);
}

const shouldCleanup = process.argv.includes('--cleanup');

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const req = async (path, { method = 'GET', token, body } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  return { status: res.status, data };
};

const cleanupTestData = async (clinicAId, clinicBId) => {
  console.log('\n🧹 Test ma\'lumotlarini tozalash boshlandi...');
  const testEmails = [
    'owner_a@test.com',
    'doctor_a@test.com',
    'accountant_a@test.com',
    'admin_a@test.com',
    'owner_b@test.com',
    'orphan@test.com',
    'superadmin_p1@dentuz.uz',
  ];

  const clinicIds = [clinicAId, clinicBId].filter(Boolean);

  if (clinicIds.length > 0) {
    await Payment.destroy({ where: { clinicId: { [Op.in]: clinicIds } } });
    await Invoice.destroy({ where: { clinicId: { [Op.in]: clinicIds } } });
    await Appointment.destroy({ where: { clinicId: { [Op.in]: clinicIds } } });
    await TreatmentPlan.destroy({ where: { clinicId: { [Op.in]: clinicIds } } });
    await MedicalRecord.destroy({ where: { clinicId: { [Op.in]: clinicIds } } });
    await LabOrder.destroy({ where: { clinicId: { [Op.in]: clinicIds } } });
    await Inventory.destroy({ where: { clinicId: { [Op.in]: clinicIds } } });
    await Service.destroy({ where: { clinicId: { [Op.in]: clinicIds } } });
    await Notification.destroy({ where: { clinicId: { [Op.in]: clinicIds } } });

    // Patients and their odontograms
    const testPatients = await Patient.findAll({ where: { clinicId: { [Op.in]: clinicIds } }, attributes: ['id'] });
    const patIds = testPatients.map((p) => p.id);
    if (patIds.length > 0) {
      await OdontogramHistory.destroy({ where: { patientId: { [Op.in]: patIds } } });
      await Odontogram.destroy({ where: { patientId: { [Op.in]: patIds } } });
      await Patient.destroy({ where: { id: { [Op.in]: patIds } } });
    }

    await Doctor.destroy({ where: { clinicId: { [Op.in]: clinicIds } } });
    await User.destroy({ where: { email: { [Op.in]: testEmails } } });
    await Clinic.destroy({ where: { id: { [Op.in]: clinicIds } } });
  }

  console.log('✅ Test ma\'lumotlari to\'liq tozalandi.');
};

const runSuite = async () => {
  console.log('======================================================================');
  console.log('🚀 DENTUZ 2.5-BOSQICH (KENGAYTIRILGAN MULTI-TENANT TEST SUITE)');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title} ${details ? '— ' + details : ''}`);
      failed++;
    }
  };

  let clinicA = null;
  let clinicB = null;

  try {
    await sequelize.authenticate();

    // 0. Seed / Find Clinics
    clinicA = await Clinic.findOne({ where: { name: 'P1 Test Clinic Alpha' } });
    if (!clinicA) {
      clinicA = await Clinic.create({
        name: 'P1 Test Clinic Alpha',
        phone: '+998901111111',
        address: "Toshkent sh., Alpha ko'chasi 1",
        status: 'active',
      });
    }

    clinicB = await Clinic.findOne({ where: { name: 'P1 Test Clinic Beta' } });
    if (!clinicB) {
      clinicB = await Clinic.create({
        name: 'P1 Test Clinic Beta',
        phone: '+998902222222',
        address: "Samarqand sh., Beta ko'chasi 2",
        status: 'active',
      });
    }

    const hashedPassword = await bcrypt.hash('TestPass123!', 10);

    const getOrCreateUser = async (email, role, clinicId, name) => {
      let u = await User.findOne({ where: { email } });
      if (!u) {
        u = await User.create({
          name,
          email,
          password: hashedPassword,
          role,
          clinicId,
          isActive: true,
        });
      } else {
        await u.update({ role, clinicId, isActive: true });
      }
      return u;
    };

    const ownerA = await getOrCreateUser('owner_a@test.com', 'owner', clinicA.id, 'Owner Alpha');
    const doctorA = await getOrCreateUser('doctor_a@test.com', 'doctor', clinicA.id, 'Dr. Alpha');
    const accountantA = await getOrCreateUser('accountant_a@test.com', 'accountant', clinicA.id, 'Accountant Alpha');
    const adminA = await getOrCreateUser('admin_a@test.com', 'administrator', clinicA.id, 'Admin Alpha');

    const ownerB = await getOrCreateUser('owner_b@test.com', 'owner', clinicB.id, 'Owner Beta');
    const doctorB = await getOrCreateUser('doctor_b@test.com', 'doctor', clinicB.id, 'Dr. Beta');
    const superadmin = await getOrCreateUser('superadmin_p1@dentuz.uz', 'superadmin', null, 'Super Admin Test');
    const noClinicUser = await getOrCreateUser('orphan@test.com', 'doctor', null, 'Orphan Doctor');

    // Doctor records
    let docRecordA = await Doctor.findOne({ where: { userId: doctorA.id } });
    if (!docRecordA) {
      docRecordA = await Doctor.create({
        userId: doctorA.id,
        clinicId: clinicA.id,
        specialization: 'Terapevt',
        phone: '+998901234567',
        isActive: true,
      });
    }

    let docRecordB = await Doctor.findOne({ where: { userId: doctorB.id } });
    if (!docRecordB) {
      docRecordB = await Doctor.create({
        userId: doctorB.id,
        clinicId: clinicB.id,
        specialization: 'Jarroh',
        phone: '+998907654321',
        isActive: true,
      });
    }

    const tokenOwnerA = createToken(ownerA);
    const tokenDoctorA = createToken(doctorA);
    const tokenAccountantA = createToken(accountantA);
    const tokenAdminA = createToken(adminA);

    const tokenOwnerB = createToken(ownerB);
    const tokenDoctorB = createToken(doctorB);
    const tokenSuperAdmin = createToken(superadmin);
    const tokenNoClinic = createToken(noClinicUser);

    console.log('📌 Test muhiti tayyorlandi:');
    console.log(`   - Klinika A: ${clinicA.id} (${clinicA.name})`);
    console.log(`   - Klinika B: ${clinicB.id} (${clinicB.name})`);

    // Clean previous test artifacts for idempotent tests
    await Patient.destroy({ where: { phone: { [Op.in]: ['+998990000001', '+998990000002', '+998990000003'] } } });

    // ==========================================
    // 1) TENANT ISOLATION: PATIENTS & APPOINTMENTS
    // ==========================================
    console.log('\n--- 1) TENANT ISOLATION: PATIENTS & APPOINTMENTS ---');

    const resPatA = await req('/patients', {
      method: 'POST',
      token: tokenOwnerA,
      body: { name: 'Bemor Alpha', phone: '+998990000001', status: 'scheduled' },
    });
    assert(resPatA.status === 201 && resPatA.data?.data?.clinicId === clinicA.id,
      'Klinika A egasi bemor yaratdi (clinicId avtomatik A ga biriktirildi)');
    const patientA = resPatA.data?.data;

    const resPatB = await req('/patients', {
      method: 'POST',
      token: tokenOwnerB,
      body: { name: 'Bemor Beta', phone: '+998990000002', status: 'scheduled' },
    });
    assert(resPatB.status === 201 && resPatB.data?.data?.clinicId === clinicB.id,
      'Klinika B egasi bemor yaratdi (clinicId avtomatik B ga biriktirildi)');
    const patientB = resPatB.data?.data;

    const resListA = await req('/patients', { token: tokenOwnerA });
    const listA_IDs = (resListA.data?.data || []).map((p) => p.id);
    assert(listA_IDs.includes(patientA.id) && !listA_IDs.includes(patientB.id),
      "Klinika A useri faqat o'z bemorlarini ko'radi (Klinika B ro'yxatda yo'q)");

    const resCrossGet = await req(`/patients/${patientB.id}`, { token: tokenOwnerA });
    assert(resCrossGet.status === 404,
      "Klinika A useri Klinika B bemorini ID bilan so'raganda 404 oladi");

    const resCrossPut = await req(`/patients/${patientB.id}`, {
      method: 'PUT',
      token: tokenOwnerA,
      body: { name: 'Hacked Name' },
    });
    assert(resCrossPut.status === 404, "Klinika A useri Klinika B bemorini tahrirlamoqchi bo'lsa 404 oladi");

    const resCrossDelete = await req(`/patients/${patientB.id}`, {
      method: 'DELETE',
      token: tokenOwnerA,
    });
    assert(resCrossDelete.status === 404, "Klinika A useri Klinika B bemorini o'chirmoqchi bo'lsa 404 oladi");

    const resSpoof = await req('/patients', {
      method: 'POST',
      token: tokenOwnerA,
      body: {
        name: 'Spoof Bemor',
        phone: '+998990000003',
        clinicId: clinicB.id,
      },
    });
    assert(resSpoof.status === 201 && resSpoof.data?.data?.clinicId === clinicA.id,
      "Request body'dagi begona clinicId e'tiborsiz qoldirilib, tokendagi clinicId saqlanadi");

    const resNoClinic = await req('/patients', { token: tokenNoClinic });
    assert(resNoClinic.status === 403, 'Klinikasi biriktirilmagan foydalanuvchiga 403 ruxsat berilmadi');

    const resCrossApt = await req('/appointments', {
      method: 'POST',
      token: tokenOwnerA,
      body: {
        patientId: patientB.id,
        doctorId: docRecordA.id,
        date: '2026-10-15',
        time: '14:00',
        procedure: "Ko'rik",
      },
    });
    assert(resCrossApt.status === 404, "Boshqa klinika bemoriga qabul yaratish rad etildi (404)");

    // ==========================================
    // 2) TENANT ISOLATION: INVOICES & PAYMENTS
    // ==========================================
    console.log('\n--- 2) TENANT ISOLATION: INVOICES & PAYMENTS ---');

    const resInvA = await req('/finance/invoices', {
      method: 'POST',
      token: tokenOwnerA,
      body: { patientId: patientA.id, amount: 500000, procedure: 'Tish davolash' },
    });
    assert(resInvA.status === 201 && resInvA.data?.data?.clinicId === clinicA.id,
      'Klinika A invoys yaratdi (clinicId avtomatik A)');
    const invoiceA = resInvA.data?.data;

    const resInvB = await req('/finance/invoices', {
      method: 'POST',
      token: tokenOwnerB,
      body: { patientId: patientB.id, amount: 800000, procedure: 'Implant' },
    });
    assert(resInvB.status === 201 && resInvB.data?.data?.clinicId === clinicB.id,
      'Klinika B invoys yaratdi (clinicId avtomatik B)');
    const invoiceB = resInvB.data?.data;

    // Cross lookup invoice -> 404
    const resCrossInvGet = await req(`/finance/invoices/${invoiceB.id}`, { token: tokenOwnerA });
    assert(resCrossInvGet.status === 404, "Klinika A useri Klinika B invoysini so'raganda 404 oladi");

    // Cross create invoice with patient of B -> 404
    const resCrossInvCreate = await req('/finance/invoices', {
      method: 'POST',
      token: tokenOwnerA,
      body: { patientId: patientB.id, amount: 200000, procedure: 'Rentgen' },
    });
    assert(resCrossInvCreate.status === 404, "Begona klinika bemoriga hisob-faktura yozish rad etildi (404)");

    // Create payment in A
    const resPayA = await req('/payments', {
      method: 'POST',
      token: tokenOwnerA,
      body: { invoiceId: invoiceA.id, patientId: patientA.id, amount: 200000, method: 'Payme' },
    });
    assert(resPayA.status === 201 && resPayA.data?.data?.clinicId === clinicA.id,
      "Klinika A to'lov yaratdi (clinicId avtomatik A)");
    const paymentA = resPayA.data?.data;

    // Cross create payment with invoice of B -> 404
    const resCrossPayCreate = await req('/payments', {
      method: 'POST',
      token: tokenOwnerA,
      body: { invoiceId: invoiceB.id, patientId: patientA.id, amount: 100000, method: 'Payme' },
    });
    assert(resCrossPayCreate.status === 404, "Begona klinika invoysiga to'lov qilish rad etildi (404)");

    // Cross get payment -> 404
    const resPayB = await req('/payments', {
      method: 'POST',
      token: tokenOwnerB,
      body: { invoiceId: invoiceB.id, patientId: patientB.id, amount: 100000, method: 'Payme' },
    });
    const paymentB = resPayB.data?.data;

    const resCrossPayGet = await req(`/payments/${paymentB.id}`, { token: tokenOwnerA });
    assert(resCrossPayGet.status === 404, "Klinika A useri Klinika B to'lovini ID bilan ko'ra olmaydi (404)");

    // ==========================================
    // 3) TENANT ISOLATION: INVENTORY & SERVICES
    // ==========================================
    console.log('\n--- 3) TENANT ISOLATION: INVENTORY & SERVICES ---');

    const resInvItemA = await req('/inventory', {
      method: 'POST',
      token: tokenOwnerA,
      body: { name: 'Alpha Qolip', quantity: 20, unit: 'dona', category: 'consumable' },
    });
    const invItemA = resInvItemA.data?.data;

    const resInvItemB = await req('/inventory', {
      method: 'POST',
      token: tokenOwnerB,
      body: { name: 'Beta Qolip', quantity: 30, unit: 'dona', category: 'consumable' },
    });
    const invItemB = resInvItemB.data?.data;

    const resCrossInvItem = await req(`/inventory/${invItemB.id}`, { token: tokenOwnerA });
    assert(resCrossInvItem.status === 404, "Klinika A ombori Klinika B mahsulotini ko'rmaydi (404)");

    const resCrossInvItemAdjust = await req(`/inventory/${invItemB.id}/adjust`, {
      method: 'PATCH',
      token: tokenOwnerA,
      body: { delta: -1 },
    });
    assert(resCrossInvItemAdjust.status === 404, "Klinika A useri Klinika B omborini o'zgartira olmaydi (404)");

    // Services
    const resSrvA = await req('/services', {
      method: 'POST',
      token: tokenOwnerA,
      body: { name: 'Alpha Plomba', price: 150000, category: 'therapy' },
    });
    const srvA = resSrvA.data?.data;

    const resSrvB = await req('/services', {
      method: 'POST',
      token: tokenOwnerB,
      body: { name: 'Beta Plomba', price: 200000, category: 'therapy' },
    });
    const srvB = resSrvB.data?.data;

    const resCrossSrv = await req(`/services/${srvB.id}`, { token: tokenOwnerA });
    assert(resCrossSrv.status === 404, "Klinika A Klinika B xizmatini ID bilan ko'ra olmaydi (404)");

    // ==========================================
    // 4) TENANT ISOLATION: ODONTOGRAM & ODONTOGRAM HISTORY
    // ==========================================
    console.log('\n--- 4) TENANT ISOLATION: ODONTOGRAM & ODONTOGRAM HISTORY ---');

    // Save odontogram for Patient A
    const resOdonA = await req(`/odontogram/${patientA.id}`, {
      method: 'PUT',
      token: tokenDoctorA,
      body: { teeth: { 16: { condition: 'caries' } }, changedTooth: 16, newCondition: 'caries' },
    });
    assert(resOdonA.status === 200, "Klinika A shifokori o'z bemori odontogrammasini saqladi (200)");

    // Doctor A attempts to read odontogram of Patient B -> 404
    const resCrossOdonGet = await req(`/odontogram/${patientB.id}`, { token: tokenDoctorA });
    assert(resCrossOdonGet.status === 404, "Klinika A shifokori Klinika B bemori odontogrammasini so'raganda 404 oladi");

    // Doctor A attempts to update odontogram of Patient B -> 404
    const resCrossOdonPut = await req(`/odontogram/${patientB.id}`, {
      method: 'PUT',
      token: tokenDoctorA,
      body: { teeth: { 11: { condition: 'missing' } }, changedTooth: 11, newCondition: 'missing' },
    });
    assert(resCrossOdonPut.status === 404, "Klinika A shifokori Klinika B bemori odontogrammasini tahrirlashdan to'xtatildi (404)");

    // Doctor A attempts to read history of Patient B -> 404
    const resCrossOdonHist = await req(`/odontogram/${patientB.id}/history`, { token: tokenDoctorA });
    assert(resCrossOdonHist.status === 404, "Klinika A shifokori Klinika B odontogramma tarixini ko'ra olmaydi (404)");

    // ==========================================
    // 5) TENANT ISOLATION: MEDICAL RECORDS, TREATMENT PLANS, LAB ORDERS
    // ==========================================
    console.log('\n--- 5) TENANT ISOLATION: MEDICAL RECORDS, TREATMENT PLANS, LAB ORDERS ---');

    // Medical Records: Doctor A tries to create record with patient B -> 404
    const resCrossMedCreate = await req('/medical-records', {
      method: 'POST',
      token: tokenDoctorA,
      body: { patientId: patientB.id, doctorId: docRecordA.id, complaints: 'Ogriq', diagnosis: 'Karies' },
    });
    assert(resCrossMedCreate.status === 404, "Begona bemorga tibbiy karta ochish rad etildi (404)");

    // Treatment Plans: Doctor A tries to create plan with patient B -> 404
    const resCrossPlanCreate = await req('/treatment-plans', {
      method: 'POST',
      token: tokenDoctorA,
      body: { patientId: patientB.id, doctorId: docRecordA.id, title: 'Davolash' },
    });
    assert(resCrossPlanCreate.status === 404, "Begona bemorga davolash rejasi tuzish rad etildi (404)");

    // Lab Orders: Doctor A tries to create lab order with patient B -> 404
    const resCrossLabCreate = await req('/lab-orders', {
      method: 'POST',
      token: tokenDoctorA,
      body: {
        patientId: patientB.id,
        doctorId: docRecordA.id,
        technicianName: 'Master Dent',
        workType: 'zirconia_crown',
        dueDate: '2026-11-01',
      },
    });
    assert(resCrossLabCreate.status === 404, "Begona bemorga laboratoriya buyurtmasi berish rad etildi (404)");

    // ==========================================
    // 6) TENANT ISOLATION: NOTIFICATIONS & DASHBOARD STATS
    // ==========================================
    console.log('\n--- 6) TENANT ISOLATION: NOTIFICATIONS & DASHBOARD STATS ---');

    const notifA = await Notification.create({
      clinicId: clinicA.id,
      type: 'system',
      body: 'Xabar Alpha',
    });
    const notifB = await Notification.create({
      clinicId: clinicB.id,
      type: 'system',
      body: 'Xabar Beta',
    });

    const resNotifListA = await req('/notifications', { token: tokenOwnerA });
    const notifA_IDs = (resNotifListA.data?.data || []).map((n) => n.id);
    assert(notifA_IDs.includes(notifA.id) && !notifA_IDs.includes(notifB.id),
      "Bildirishnomalar ro'yxatida faqat Klinika A xabarlari chiqdi (Klinika B ko'rinmaydi)");

    const resCrossNotifGet = await req(`/notifications/${notifB.id}`, { token: tokenOwnerA });
    assert(resCrossNotifGet.status === 404, "Klinika A useri Klinika B bildirishnomasini ko'ra olmaydi (404)");

    // Finance / Dashboard stats isolation
    const resStatsA = await req('/finance/stats', { token: tokenOwnerA });
    assert(resStatsA.status === 200, "Klinika A moliyaviy KPI statistikasini muvaffaqiyatli oldi (200)");

    // ==========================================
    // 7) RBAC ROLLAR MATRITSASI TESTLARI
    // ==========================================
    console.log('\n--- 7) RBAC ROLLAR MATRITSASI TESTLARI ---');

    const resAccTeamDel = await req(`/team/${adminA.id}`, {
      method: 'DELETE',
      token: tokenAccountantA,
    });
    assert(resAccTeamDel.status === 403, "Accountant jamoa a'zosini o'chira olmaydi (403)");

    const resDocInvCreate = await req('/finance/invoices', {
      method: 'POST',
      token: tokenDoctorA,
      body: { patientId: patientA.id, amount: 500000, procedure: 'Davolash' },
    });
    assert(resDocInvCreate.status === 403, 'Doctor moliyaga (invoices) yoza olmaydi (403)');

    const resDocPayCreate = await req('/payments', {
      method: 'POST',
      token: tokenDoctorA,
      body: { patientId: patientA.id, amount: 200000, method: 'Naqd' },
    });
    assert(resDocPayCreate.status === 403, "Doctor to'lov (payments) qabul qila olmaydi (403)");

    const resAdminInvDel = await req('/finance/invoices/INV-DUMMY', {
      method: 'DELETE',
      token: tokenAdminA,
    });
    assert(resAdminInvDel.status === 403, "Administrator invoysni o'chira olmaydi (403)");

    const resDocMedRecord = await req('/medical-records', {
      method: 'POST',
      token: tokenDoctorA,
      body: { patientId: patientA.id, doctorId: docRecordA.id, complaints: "Tish og'rig'i", diagnosis: 'Karies' },
    });
    assert(resDocMedRecord.status === 201, 'Doctor tibbiy kartochka yarata oladi (201)');

    // ==========================================
    // 8) TRANZAKSIYALAR VA PARALLELLIK (ACID)
    // ==========================================
    console.log('\n--- 8) TRANZAKSIYALAR VA PARALLELLIK (ACID) ---');

    const resOwnerInv = await req('/finance/invoices', {
      method: 'POST',
      token: tokenOwnerA,
      body: { patientId: patientA.id, amount: 1000000, procedure: 'Plomba' },
    });
    const testInvoice = resOwnerInv.data?.data;

    const paymentPromises = [];
    for (let i = 0; i < 20; i++) {
      paymentPromises.push(
        req('/payments', {
          method: 'POST',
          token: tokenOwnerA,
          body: {
            invoiceId: testInvoice.id,
            patientId: patientA.id,
            amount: 100000,
            method: 'Payme',
            notes: `Parallel to'lov #${i + 1}`,
          },
        })
      );
    }

    const payResults = await Promise.all(paymentPromises);
    const successfulPays = payResults.filter((r) => r.status === 201);
    const rejectedPays = payResults.filter((r) => r.status === 400);

    const freshInvoice = await Invoice.findByPk(testInvoice.id);
    assert(
      successfulPays.length === 10 &&
        rejectedPays.length === 10 &&
        Number(freshInvoice.paidAmount) === 1000000 &&
        freshInvoice.status === 'paid',
      `Parallel to'lovlar atomikligi: 10 ta muvaffaqiyatli (1,000,000 UZS), 10 ta ortiqcha to'lov rad etildi (400), status: paid`
    );

    // Ombor parallel atomik ayirish
    const resInvItem = await req('/inventory', {
      method: 'POST',
      token: tokenOwnerA,
      body: { name: 'P1 Test Anesteziya', quantity: 50, minQuantity: 5, unit: 'dona', category: 'medication' },
    });
    const inventoryItem = resInvItem.data?.data;

    const stockAdjustPromises = [];
    for (let i = 0; i < 20; i++) {
      stockAdjustPromises.push(
        req(`/inventory/${inventoryItem.id}/adjust`, {
          method: 'PATCH',
          token: tokenOwnerA,
          body: { delta: -2 },
        })
      );
    }

    const adjustResults = await Promise.all(stockAdjustPromises);
    const successfulAdjusts = adjustResults.filter((r) => r.status === 200);

    const freshInvItem = await Inventory.findByPk(inventoryItem.id);
    assert(
      successfulAdjusts.length === 20 && Number(freshInvItem.quantity) === 10,
      `Ombor parallel atomik ayirish: boshlang'ich 50 - (20 * 2) = aniq ${Number(freshInvItem.quantity)} qoldi`
    );

    // Negative stock prevention test
    const resNegativeStock = await req(`/inventory/${inventoryItem.id}/adjust`, {
      method: 'PATCH',
      token: tokenOwnerA,
      body: { delta: -15 },
    });
    const checkNoNegStock = await Inventory.findByPk(inventoryItem.id);
    assert(
      resNegativeStock.status === 400 && Number(checkNoNegStock.quantity) === 10,
      "Manfiy qoldiq bo'lib qolishi rad etildi (400) va qoldiq 10 holatida saqlandi"
    );

    // ==========================================
    // 9) SUPERADMIN VA N+1 AGREGAT QUERY TESTI
    // ==========================================
    console.log('\n--- 9) SUPERADMIN VA N+1 AGREGAT QUERY TESTI ---');

    const resSuperClinics = await req('/superadmin/clinics', { token: tokenSuperAdmin });
    assert(
      resSuperClinics.status === 200 && Array.isArray(resSuperClinics.data?.data),
      "SuperAdmin barcha klinikalarni GROUP BY agregat so'rovi bilan N+1 siz oldi"
    );

    // ==========================================
    // 10) P0 REGRESSIYA TESTLARI
    // ==========================================
    console.log('\n--- 10) P0 REGRESSIYA TESTLARI ---');

    const resNoToken = await req('/patients');
    assert(resNoToken.status === 401, "Tokensiz so'rov 401 Unauthorized qaytardi");

    const resBadToken = await req('/patients', { token: 'invalid.jwt.token' });
    assert(resBadToken.status === 401, 'Yaroqsiz token 401 Unauthorized qaytardi');

    const resUserToSuper = await req('/superadmin/clinics', { token: tokenOwnerA });
    assert(resUserToSuper.status === 403, 'Oddiy user SuperAdmin endpointga kira olmadi (403)');

    // ==========================================
    // YAKUNIY HISOBOT VA CLEANUP
    // ==========================================
    console.log('\n======================================================================');
    console.log(`📊 YAKUNIY TEST NATIJASI: ${passed} TA O'TDI, ${failed} TA YIQILDI`);
    console.log('======================================================================\n');

    if (shouldCleanup) {
      await cleanupTestData(clinicA?.id, clinicB?.id);
    }

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test ijrosi vaqtida kutilmagan xatolik:', err);
    if (shouldCleanup && (clinicA || clinicB)) {
      await cleanupTestData(clinicA?.id, clinicB?.id);
    }
    process.exit(1);
  }
};

runSuite();
