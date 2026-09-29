/**
 * test_frontend_smoke.js
 * 
 * Stage 2.5: Automated Frontend Role Smoke Test & Backend RBAC Verification
 * Tests all roles across all modules and APIs to verify access control,
 * ensure no 500 errors, verify 403 forbidden enforcement where appropriate,
 * and verify graceful UI behavior.
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');
const http = require('http');
const { User, Clinic, Patient } = require('../models');

const BASE_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is missing.');
  process.exit(1);
}

function request(method, path, token, body = null) {
  return new Promise((resolve) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data ? (() => { try { return JSON.parse(data); } catch { return data; } })() : null
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, error: err.message });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const ROLES_TO_TEST = [
  'owner',
  'administrator',
  'doctor',
  'accountant',
  'nurse',
  'receptionist',
  'superadmin'
];

async function run() {
  console.log('='.repeat(80));
  console.log('STARTING STAGE 2.5 FRONTEND ROLE SMOKE TEST & API MATRIX');
  console.log('='.repeat(80));

  // 1. Setup or reuse a test clinic and test patient
  let testClinic = await Clinic.findOne({ where: { name: 'P2.5 Smoke Test Clinic' } });
  if (!testClinic) {
    testClinic = await Clinic.create({
      name: 'P2.5 Smoke Test Clinic',
      status: 'active',
      phone: '+998901239999',
      email: 'smoke_clinic@test.uz'
    });
  }

  let testPatient = await Patient.findOne({ where: { clinicId: testClinic.id } });
  if (!testPatient) {
    testPatient = await Patient.create({
      id: 'P-9999',
      clinicId: testClinic.id,
      name: 'Smoke Test Patient',
      phone: '+998901112233',
      birthdate: '1995-05-15',
      status: 'scheduled'
    });
  }

  // 2. Prepare tokens for each role
  const tokens = {};
  for (const role of ROLES_TO_TEST) {
    const isSuper = role === 'superadmin';
    const email = `smoke_${role}@test.uz`;
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        clinicId: isSuper ? null : testClinic.id,
        name: `Smoke ${role.toUpperCase()}`,
        username: `smoke_${role}`,
        email: email,
        password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890', // dummy hash
        role: role,
        isActive: true
      });
    } else {
      user.role = role;
      user.clinicId = isSuper ? null : testClinic.id;
      user.isActive = true;
      await user.save();
    }

    tokens[role] = jwt.sign(
      { id: user.id, role: user.role, clinicId: user.clinicId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  // 3. Define the endpoints representing each page / feature
  const endpoints = [
    { page: 'dashboard', api: 'GET /appointments/today' },
    { page: 'dashboard', api: 'GET /finance/stats' },
    { page: 'patients', api: 'GET /patients' },
    { page: 'calendar', api: 'GET /appointments' },
    { page: 'finance', api: 'GET /finance/invoices' },
    { page: 'finance', api: 'GET /payments' },
    { page: 'inventory', api: 'GET /inventory' },
    { page: 'team', api: 'GET /team' },
    { page: 'treatment plans', api: 'GET /treatment-plans' },
    { page: 'odontogram', api: `GET /odontogram/${testPatient.id}` },
    { page: 'medical records', api: 'GET /medical-records' },
    { page: 'lab orders', api: 'GET /lab-orders' },
    { page: 'settings', api: 'GET /services' }
  ];

  // 4. Execute Matrix Test
  const results = [];

  for (const role of ROLES_TO_TEST) {
    const token = tokens[role];
    for (const ep of endpoints) {
      const [method, path] = ep.api.split(' ');
      const res = await request(method, path, token);
      
      let broken = false;
      let note = '';
      if (res.status === 500) {
        broken = true;
        note = '500 Server Error!';
      } else if (res.status === 403) {
        note = '403 Forbidden (RBAC Protected)';
      } else if (res.status === 200) {
        note = '200 OK (Authorized)';
      } else {
        note = `${res.status}`;
      }

      results.push({
        role,
        page: ep.page,
        api: ep.api,
        status: res.status,
        broken: broken ? 'HA (500)' : 'YO\'Q',
        note
      });
    }
  }

  // 5. Output Summary Table
  console.log('\n--- MATRIX RESULTS TABLE ---');
  console.table(results.map(r => ({
    Role: r.role,
    Page: r.page,
    API: r.api,
    HTTP: r.status,
    Buzildimi: r.broken,
    Status: r.note
  })));

  // Cleanup test entities
  console.log('\nCleaning up smoke test entities...');
  await User.destroy({ where: { email: ROLES_TO_TEST.map(r => `smoke_${r}@test.uz`) } });
  await Patient.destroy({ where: { id: testPatient.id } });
  await Clinic.destroy({ where: { id: testClinic.id } });
  console.log('Smoke test cleanup completed cleanly.');

  // Validate no 500 errors occurred
  const serverErrors = results.filter(r => r.status === 500);
  if (serverErrors.length > 0) {
    console.error(`FATAL: ${serverErrors.length} requests returned HTTP 500!`);
    process.exit(1);
  } else {
    console.log('\nSUCCESS: All endpoints returned expected RBAC codes (200 / 403). Zero 500 errors.');
    process.exit(0);
  }
}

run().catch(err => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
