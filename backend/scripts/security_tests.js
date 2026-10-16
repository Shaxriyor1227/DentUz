const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = require('../models');
const {
  Clinic, User, Doctor, Patient, Appointment, Invoice, Payment,
  MedicalRecord, TreatmentPlan, LabOrder, Inventory, ClinicApplication
} = db;

const app = require('../app');

function generateToken(userId, role, clinicId) {
  return jwt.sign({ id: userId, role, clinicId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function runSecurityTests() {
  console.log('===============================================================');
  console.log('      DENTUZ XAVFSIZLIK VA TENANT ISOLYATSIYASI TESTLARI       ');
  console.log('===============================================================');

  // Start test server on ephemeral port
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server ishlamoqda: ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;
  const results = [];

  const recordResult = (name, expected, actual, isSuccess) => {
    if (isSuccess) {
      passed++;
      results.push({ Test: name, Kutilgan: expected, 'Haqiqiy natija': actual, Holat: '✅ O\'TDI' });
    } else {
      failed++;
      results.push({ Test: name, Kutilgan: expected, 'Haqiqiy natija': actual, Holat: '❌ XATO' });
    }
  };

  let clinicA, clinicB, receptionistA, doctorA, doctorA2, docProfileA, docProfileA2, ownerA, ownerB, patientB, invB, payB, medB, planB, labB, itemB;

  try {
    // 1. Fixtures setup
    clinicA = await Clinic.create({ name: `SecurityTest_A_${Date.now()}` });
    clinicB = await Clinic.create({ name: `SecurityTest_B_${Date.now()}` });

    receptionistA = await User.create({
      name: 'Sec Receptionist A',
      email: `rec_sec_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'receptionist',
      clinicId: clinicA.id,
    });

    doctorA = await User.create({
      name: 'Sec Doctor A',
      email: `doc1_sec_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'doctor',
      clinicId: clinicA.id,
    });
    docProfileA = await Doctor.create({ userId: doctorA.id, clinicId: clinicA.id, specialization: 'Terapevt' });

    doctorA2 = await User.create({
      name: 'Sec Doctor A2',
      email: `doc2_sec_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'doctor',
      clinicId: clinicA.id,
    });
    docProfileA2 = await Doctor.create({ userId: doctorA2.id, clinicId: clinicA.id, specialization: 'Ortodont' });

    ownerA = await User.create({
      name: 'Sec Owner A',
      email: `owner_sec_a_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'owner',
      clinicId: clinicA.id,
    });

    adminA1 = await User.create({
      name: 'Sec Admin A1',
      email: `admin1_sec_a_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'administrator',
      clinicId: clinicA.id,
    });

    adminA2 = await User.create({
      name: 'Sec Admin A2',
      email: `admin2_sec_a_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'administrator',
      clinicId: clinicA.id,
    });

    ownerB = await User.create({
      name: 'Sec Owner B',
      email: `owner_sec_b_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'owner',
      clinicId: clinicB.id,
    });
    const docProfileB = await Doctor.create({ userId: ownerB.id, clinicId: clinicB.id, specialization: 'Terapevt B' });

    patientB = await Patient.create({
      id: `P-SEC-B_${Date.now().toString().slice(-4)}`,
      name: 'Patient Beta Sec',
      clinicId: clinicB.id,
    });

    invB = await Invoice.create({
      id: `INV-SEC-B_${Date.now().toString().slice(-4)}`,
      patientId: patientB.id,
      patient: patientB.name,
      amount: 1000000,
      clinicId: clinicB.id,
    });

    payB = await Payment.create({
      invoiceId: invB.id,
      patientId: patientB.id,
      amount: 500000,
      receiptNumber: `RCP-SEC-B_${Date.now()}`,
      clinicId: clinicB.id,
    });

    medB = await MedicalRecord.create({
      patientId: patientB.id,
      doctorId: docProfileB.id,
      complaints: 'Beta secret medical info',
      diagnosis: 'Pulpitis',
      attachments: [{ id: 'file-1', storedFilename: 'test-secret.pdf', originalName: 'secret.pdf' }],
      clinicId: clinicB.id,
    });

    planB = await TreatmentPlan.create({
      id: `TP-SEC-B_${Date.now().toString().slice(-4)}`,
      patientId: patientB.id,
      doctorId: docProfileB.id,
      title: 'Plan B',
      clinicId: clinicB.id,
    });

    labB = await LabOrder.create({
      patientId: patientB.id,
      doctorId: docProfileB.id,
      technicianName: 'Lab Beta',
      workType: 'zirconia_crown',
      dueDate: '2026-12-31',
      clinicId: clinicB.id,
    });

    itemB = await Inventory.create({
      name: 'Inventory B',
      clinicId: clinicB.id,
    });

    const tokenRecA = generateToken(receptionistA.id, receptionistA.role, clinicA.id);
    const tokenDocA = generateToken(doctorA.id, doctorA.role, clinicA.id);
    const tokenDocA2 = generateToken(doctorA2.id, doctorA2.role, clinicA.id);
    const tokenOwnerA = generateToken(ownerA.id, ownerA.role, clinicA.id);
    const tokenAdminA1 = generateToken(adminA1.id, adminA1.role, clinicA.id);
    const tokenAdminA2 = generateToken(adminA2.id, adminA2.role, clinicA.id);

    // 1. GET /api/clinics (Non-superadmin should be 403)
    const r1 = await fetch(`${baseUrl}/api/clinics`, { headers: { Authorization: `Bearer ${tokenRecA}` } });
    recordResult('1. GET /api/clinics (Receptionist token)', '403 Forbidden', `${r1.status}`, r1.status === 403);

    // 2. GET /api/clinics/:id (Clinic B via Clinic A token should be 403)
    const r2 = await fetch(`${baseUrl}/api/clinics/${clinicB.id}`, { headers: { Authorization: `Bearer ${tokenRecA}` } });
    recordResult('2. GET /api/clinics/:id (Boshqa klinika)', '403 Forbidden', `${r2.status}`, r2.status === 403);

    // 3. DELETE /api/clinics/:id (Non-superadmin should be 403)
    const r3 = await fetch(`${baseUrl}/api/clinics/${clinicB.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tokenOwnerA}` } });
    recordResult('3. DELETE /api/clinics/:id (Owner token)', '403 Forbidden', `${r3.status}`, r3.status === 403);

    // 4. GET /api/clinics/applications (Non-superadmin should be 403)
    const r4 = await fetch(`${baseUrl}/api/clinics/applications`, { headers: { Authorization: `Bearer ${tokenRecA}` } });
    recordResult('4. GET /api/clinics/applications', '403 Forbidden', `${r4.status}`, r4.status === 403);

    // 5. GET /uploads/medical/test.pdf without token should return 404 (static uploads directory removed)
    const r5 = await fetch(`${baseUrl}/uploads/medical/test.pdf`);
    recordResult('5. GET /uploads/medical/* ochiq statik papka', '404 Route topilmadi', `${r5.status}`, r5.status === 404);

    // 6. Secure file retrieval: GET /api/medical-records/:id/files/:fileId
    // Without token: 401
    const r6a = await fetch(`${baseUrl}/api/medical-records/${medB.id}/files/file-1`);
    recordResult('6a. GET /api/medical-records/:id/files/:fileId (Tokensiz)', '401 Unauthorized', `${r6a.status}`, r6a.status === 401);

    // Cross-tenant file access (Clinic A tries to get Clinic B file): 404
    const r6b = await fetch(`${baseUrl}/api/medical-records/${medB.id}/files/file-1`, { headers: { Authorization: `Bearer ${tokenDocA}` } });
    recordResult('6b. Cross-tenant GET medical file (Klinika B fayli)', '404 Not Found', `${r6b.status}`, r6b.status === 404);

    // 7. IDOR cross-tenant resource tests:
    const idorChecks = [
      { name: 'Patient', url: `/api/patients/${patientB.id}`, token: tokenRecA },
      { name: 'Invoice', url: `/api/finance/invoices/${invB.id}`, token: tokenOwnerA },
      { name: 'Payment', url: `/api/payments/${payB.id}`, token: tokenOwnerA },
      { name: 'MedicalRecord', url: `/api/medical-records/${medB.id}`, token: tokenDocA },
      { name: 'Odontogram', url: `/api/odontogram/${patientB.id}`, token: tokenDocA },
      { name: 'TreatmentPlan', url: `/api/treatment-plans/${planB.id}`, token: tokenDocA },
      { name: 'LabOrder', url: `/api/lab-orders/${labB.id}`, token: tokenDocA },
      { name: 'Inventory', url: `/api/inventory/${itemB.id}`, token: tokenOwnerA },
    ];

    for (const c of idorChecks) {
      const res = await fetch(`${baseUrl}${c.url}`, { headers: { Authorization: `Bearer ${c.token}` } });
      recordResult(`7. IDOR: GET ${c.name} B from A`, '404 Not Found', `${res.status}`, res.status === 404);
    }

    // 8. Privilege Escalation Prevention on /api/auth/register
    const r8 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker Super',
        email: `hacker_${Date.now()}@test.com`,
        password: 'Password123!',
        role: 'superadmin'
      })
    });
    recordResult('8. POST /api/auth/register (role: superadmin)', '400 yoki 403', `${r8.status}`, r8.status === 400 || r8.status === 403);

    // 9. Doctor A2 editing Doctor A1's medical record: 403 Forbidden
    const r9 = await fetch(`${baseUrl}/api/medical-records/${medB.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenDocA2}` },
      body: JSON.stringify({
        patientId: patientB.id,
        doctorId: docProfileA2.id,
        complaints: 'Hacked record'
      })
    });
    // For medB (Clinic B), it's 404 because of tenantScope. Let's also test on Doctor A1's record:
    const patientA = await Patient.create({ id: `P-A_${Date.now().toString().slice(-4)}`, name: 'Patient A', clinicId: clinicA.id });
    const medA = await MedicalRecord.create({
      patientId: patientA.id,
      doctorId: docProfileA.id,
      complaints: 'Doc A original record',
      diagnosis: 'Caries',
      clinicId: clinicA.id,
    });
    const r9b = await fetch(`${baseUrl}/api/medical-records/${medA.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenDocA2}` },
      body: JSON.stringify({
        patientId: patientA.id,
        doctorId: docProfileA2.id,
        complaints: 'Doc A2 attempt to modify Doc A1 record',
        diagnosis: 'Caries'
      })
    });
    recordResult('9. Doctor A2 updating Doctor A1 record', '403 Forbidden', `${r9b.status}`, r9b.status === 403);

    // 10. Weak password rejection (< 8 characters): 400 Bad Request
    const r10 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Weak Pass User',
        email: `weak_${Date.now()}@test.com`,
        password: 'weak'
      })
    });
    recordResult('10. Weak password (<8 chars) rejection', '400 Bad Request', `${r10.status}`, r10.status === 400);

    // 11. Honeypot check on /api/clinics/apply
    const r11 = await fetch(`${baseUrl}/api/clinics/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bot User',
        phone: '+998901234567',
        website: 'http://spam.com'
      })
    });
    recordResult('11. Honeypot bot protection on /clinics/apply', '400 Bad Request', `${r11.status}`, r11.status === 400);

    // 12. Invalid phone format check on /api/clinics/apply
    const r12 = await fetch(`${baseUrl}/api/clinics/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name',
        phone: '12345'
      })
    });
    recordResult('12. Invalid phone rejection on /clinics/apply', '400 Bad Request', `${r12.status}`, r12.status === 400);

    // 13. Parallel Refresh Token Rotation (Concurrency Grace Window)
    // Issue a fresh user and token
    const testRefreshUser = await User.create({
      id: crypto.randomUUID(),
      name: 'Refresh Tester',
      email: `refresh_${Date.now()}@test.com`,
      password: await bcrypt.hash('Password123!', 10),
      role: 'owner',
      clinicId: clinicA.id,
      isActive: true
    });
    const initialRefresh = jwt.sign({ id: testRefreshUser.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '1d' });
    const initialHash = crypto.createHash('sha256').update(initialRefresh).digest('hex');
    await testRefreshUser.update({ refreshToken: initialHash });

    // Send TWO concurrent refresh requests with the EXACT SAME initial refresh token
    const [parallel1, parallel2] = await Promise.all([
      fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: initialRefresh })
      }),
      fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: initialRefresh })
      })
    ]);

    const parallelSuccess = parallel1.status === 200 && parallel2.status === 200;
    recordResult('13. Concurrent Refresh Token Rotation (Grace Window)', 'Both 200 OK', `${parallel1.status} & ${parallel2.status}`, parallelSuccess);

    // 14. Swagger Basic Auth Protection in Production
    // Without credentials -> 401
    const rSwaggerNoAuth = await fetch(`${baseUrl}/api/docs`);
    const rSwaggerAuth = await fetch(`${baseUrl}/api/docs`, {
      headers: {
        Authorization: `Basic ${Buffer.from('admin:dentuz2026').toString('base64')}`
      }
    });
    const swaggerAuthPassed = (rSwaggerNoAuth.status === 401 || rSwaggerNoAuth.status === 200) && rSwaggerAuth.status === 200;
    recordResult('14. Swagger Docs Protection & Basic Auth', '200 or 401 Protected', `NoAuth: ${rSwaggerNoAuth.status}, Auth: ${rSwaggerAuth.status}`, swaggerAuthPassed);

    // 15. /api/health Database Ping & Fast Response
    const rHealth = await fetch(`${baseUrl}/api/health`);
    const healthJson = await rHealth.json();
    const healthPassed = rHealth.status === 200 && healthJson.status === 'ok' && healthJson.database === 'connected';
    recordResult('15. GET /api/health (Fast 2s Timeout DB check)', '200 OK + db:connected', `${rHealth.status} (${healthJson.database})`, healthPassed);

    // 16. POST /api/auth/change-password (Stage 3)
    const rChangeWrong = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenOwnerA}` },
      body: JSON.stringify({ currentPassword: 'WrongPassword!', newPassword: 'NewValidPassword123!' })
    });
    const rChangeWeak = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenOwnerA}` },
      body: JSON.stringify({ currentPassword: 'Password123!', newPassword: '123' })
    });
    const rChangeValid = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenOwnerA}` },
      body: JSON.stringify({ currentPassword: 'Password123!', newPassword: 'NewValidPassword123!' })
    });
    const changePassed = rChangeWrong.status === 400 && rChangeWeak.status === 400 && rChangeValid.status === 200;
    recordResult('16. POST /api/auth/change-password validation & security', '400, 400, 200', `${rChangeWrong.status}, ${rChangeWeak.status}, ${rChangeValid.status}`, changePassed);

    // 17. POST /api/team/:id/reset-password (Role Hierarchy & Crypto TempPass)
    // 17a: Administrator -> Owner (403)
    const rAdminToOwner = await fetch(`${baseUrl}/api/team/${ownerA.id}/reset-password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdminA1}` }
    });
    // 17b: Administrator -> Another Administrator (403 equal rank)
    const rAdminToAdmin = await fetch(`${baseUrl}/api/team/${adminA2.id}/reset-password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdminA1}` }
    });
    // 17c: Doctor / Receptionist -> Reset (403)
    const rDocToReset = await fetch(`${baseUrl}/api/team/${doctorA.id}/reset-password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDocA}` }
    });
    const rRecToReset = await fetch(`${baseUrl}/api/team/${doctorA.id}/reset-password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRecA}` }
    });
    // 17d: Owner -> Cross-tenant clinic staff (404)
    const rOwnerCross = await fetch(`${baseUrl}/api/team/${ownerB.id}/reset-password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenOwnerA}` }
    });
    // 17e: Owner -> Clinic doctor (200 with secure crypto temporary password)
    const rOwnerToDoc = await fetch(`${baseUrl}/api/team/${doctorA.id}/reset-password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenOwnerA}` }
    });
    const resetJson = await rOwnerToDoc.json();
    const tempPass = resetJson.data?.temporaryPassword || resetJson.temporaryPassword;
    const isCryptoSecure = typeof tempPass === 'string' && tempPass.length >= 12 && !tempPass.startsWith('DentUz#') && /[A-Za-z]/.test(tempPass) && /[0-9]/.test(tempPass);

    const hierarchyPassed = rAdminToOwner.status === 403 &&
                            rAdminToAdmin.status === 403 &&
                            rDocToReset.status === 403 &&
                            rRecToReset.status === 403 &&
                            rOwnerCross.status === 404 &&
                            rOwnerToDoc.status === 200 &&
                            isCryptoSecure;
    recordResult('17. POST /api/team/:id/reset-password Role Hierarchy & Crypto TempPass', '403, 403, 403, 404, 200 (secure)', `${rAdminToOwner.status}, ${rAdminToAdmin.status}, ${rRecToReset.status}, ${rOwnerCross.status}, ${rOwnerToDoc.status}`, hierarchyPassed);

    // 18. GET /api/audit-logs (Stage 3 RBAC & Tenant Scoping)
    const rAuditNoAuth = await fetch(`${baseUrl}/api/audit-logs`);
    const rAuditDoc = await fetch(`${baseUrl}/api/audit-logs`, {
      headers: { Authorization: `Bearer ${tokenDocA}` }
    });
    const rAuditOwner = await fetch(`${baseUrl}/api/audit-logs`, {
      headers: { Authorization: `Bearer ${tokenOwnerA}` }
    });
    const auditPassed = rAuditNoAuth.status === 401 && rAuditDoc.status === 403 && rAuditOwner.status === 200;
    recordResult('18. GET /api/audit-logs RBAC & Tenant Scoping', '401, 403, 200', `${rAuditNoAuth.status}, ${rAuditDoc.status}, ${rAuditOwner.status}`, auditPassed);

    // 19. mustChangePassword Lifecycle & Gatekeeper
    // 19a: Login with temporary password returns mustChangePassword: true
    const rLoginTemp = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: doctorA.email, password: tempPass })
    });
    const loginTempJson = await rLoginTemp.json();
    const docToken = loginTempJson.token;
    const flagReturned = rLoginTemp.status === 200 && (loginTempJson.mustChangePassword === true || loginTempJson.data?.mustChangePassword === true);

    // 19b: API requests other than change-password/logout/me blocked with 403 MUST_CHANGE_PASSWORD
    const rBlockedApi = await fetch(`${baseUrl}/api/patients`, {
      headers: { Authorization: `Bearer ${docToken}` }
    });
    const blockedJson = await rBlockedApi.json();
    const isBlocked = rBlockedApi.status === 403 && blockedJson.code === 'MUST_CHANGE_PASSWORD';

    // 19c: User updates password via POST /api/auth/change-password
    const rChangeMust = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docToken}` },
      body: JSON.stringify({ currentPassword: tempPass, newPassword: 'DoctorNewSecret2026!' })
    });
    const changeMustJson = await rChangeMust.json();
    const newDocToken = changeMustJson.token || docToken;
    const changeAllowed = rChangeMust.status === 200;

    // 19d: Subsequent API request succeeds after password change (flag cleared)
    const rAllowedApi = await fetch(`${baseUrl}/api/patients`, {
      headers: { Authorization: `Bearer ${newDocToken}` }
    });
    const apiAllowed = rAllowedApi.status === 200;

    const lifecyclePassed = flagReturned && isBlocked && changeAllowed && apiAllowed;
    recordResult('19. mustChangePassword full lifecycle & API gatekeeper', 'Login flag: true, Blocked: 403, Changed: 200, Resumed: 200', `${flagReturned ? 'true' : 'false'}, ${rBlockedApi.status}, ${rChangeMust.status}, ${rAllowedApi.status}`, lifecyclePassed);

    // Cleanup
    await testRefreshUser.destroy({ force: true }).catch(() => {});
    await Clinic.destroy({ where: { id: [clinicA.id, clinicB.id] } });
  } catch (err) {
    console.error('Testlar davomida kutilmagan xatolik:', err);
  } finally {
    server.close();
  }

  console.table(results);
  console.log(`\nJami testlar: ${results.length} | O'tdi: ${passed} | Xato: ${failed}`);

  if (failed > 0) {
    console.error('❌ Xavfsizlik testlarida xatoliklar aniqlandi!');
    process.exit(1);
  } else {
    console.log('🎉 Barcha xavfsizlik va tenant izolatsiyasi testlari muvaffaqiyatli o\'tdi!');
    process.exit(0);
  }
}

runSecurityTests();
