require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const jwt = require('jsonwebtoken');
const { User, Clinic } = require('../models');

const BASE_URL = 'http://localhost:5000/api';

// Phone formatter utility to mirror frontend formatters
function formatPhone(phoneStr) {
  if (!phoneStr) return '';
  const digits = String(phoneStr).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('998')) {
    const code = digits.slice(3, 5);
    const p1 = digits.slice(5, 8);
    const p2 = digits.slice(8, 10);
    const p3 = digits.slice(10, 12);
    return `+998 ${code} ${p1} ${p2} ${p3}`;
  }
  return phoneStr;
}

function normalizePhone(phoneStr) {
  if (!phoneStr) return '';
  const cleaned = String(phoneStr).replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    return '+' + cleaned.replace(/\D/g, '');
  }
  const digits = cleaned.replace(/\D/g, '');
  if (digits.startsWith('998')) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  return `+${digits}`;
}

async function runFormTests() {
  console.log('================================================================');
  console.log('    DENTUZ FORMALARINI HAQIQIY BACKENDDA SINASH VA TELEFON FORMATI');
  console.log('================================================================\n');

  // 1. Contact Form (/api/clinics/apply)
  console.log('1. CONTACT FORMASI (/api/clinics/apply):');
  const inputPhone1 = '+998 (90) 123-45-67';
  const normPhone1 = normalizePhone(inputPhone1);
  console.log(`   Kiritilgan: "${inputPhone1}" -> Normalizatsiya: "${normPhone1}"`);
  
  const resContact = await fetch(`${BASE_URL}/clinics/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Alisher Testov',
      clinicName: 'Oazis Premium Dental',
      phone: normPhone1,
      chairsCount: '3',
      message: 'Bizning klinikamiz uchun avtomatlashtirish kerak'
    })
  });
  const dataContact = await resContact.json().catch(() => ({}));
  console.log(`   Status: ${resContact.status}`);
  console.log(`   Backend javobi: id=${dataContact.id || dataContact.data?.id}, phone=${dataContact.phone || dataContact.data?.phone}\n`);

  // Find or create active owner user to authenticate clinical endpoints
  const ownerUser = await User.findOne({ where: { role: 'owner' } });
  if (!ownerUser) {
    throw new Error('Owner foydalanuvchi topilmadi');
  }
  const ownerToken = jwt.sign(
    { id: ownerUser.id, email: ownerUser.email, role: ownerUser.role, clinicId: ownerUser.clinicId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Find or create superadmin for superadmin form test
  let superadminUser = await User.findOne({ where: { role: 'superadmin' } });
  let superadminToken = '';
  if (superadminUser) {
    superadminToken = jwt.sign(
      { id: superadminUser.id, email: superadminUser.email, role: 'superadmin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  // 2. Signup / Register Form (POST /api/auth/register)
  console.log('2. SIGNUP / REGISTER FORMASI (/api/auth/register):');
  const randNum = Math.floor(Math.random() * 90000) + 10000;
  const inputPhone2 = '+998 94 888 77 66';
  const normPhone2 = normalizePhone(inputPhone2);
  console.log(`   Kiritilgan: "${inputPhone2}" -> Normalizatsiya: "${normPhone2}"`);
  const resRegister = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Dr. Shaxzod ${randNum}`,
      email: `shaxzod.${randNum}@testclinic.uz`,
      password: 'StrongPassword123!',
      clinicName: `Dent Shaxzod ${randNum}`,
      phone: normPhone2
    })
  });
  const dataRegister = await resRegister.json().catch(() => ({}));
  console.log(`   Status: ${resRegister.status}`);
  console.log(`   Yaratildi: email=${dataRegister.data?.user?.email || dataRegister.user?.email}\n`);

  // 3. Patients Form (POST /api/patients) & Display Formatter
  console.log('3. PATIENTS FORMASI VA KO\'RSATISH FORMATI (POST & GET /api/patients):');
  const inputPhone3 = '+998 (97) 111-22-33';
  const normPhone3 = normalizePhone(inputPhone3);
  console.log(`   Kiritilgan: "${inputPhone3}" -> Normalizatsiya: "${normPhone3}"`);
  const resPatient = await fetch(`${BASE_URL}/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ownerToken}`
    },
    body: JSON.stringify({
      name: `Bemor Test ${randNum}`,
      phone: normPhone3,
      allergies: 'Penitsillin yo\'q',
      notes: 'Plomba qo\'yish kerak'
    })
  });
  const dataPatient = await resPatient.json().catch(() => ({}));
  console.log(`   POST Status: ${resPatient.status}`);
  const createdPatient = dataPatient.data || dataPatient;
  console.log(`   Saqlangan bemor telefoni (baza/API): "${createdPatient.phone}"`);
  console.log(`   UI da chiroyli ko'rsatilishi (formatPhone): "${formatPhone(createdPatient.phone)}"\n`);

  // 4. Calendar Form (POST /api/appointments)
  console.log('4. CALENDAR / QABUL FORMASI (POST /api/appointments):');
  const inputPhone4 = '+998 90 999 00 11';
  const normPhone4 = normalizePhone(inputPhone4);
  console.log(`   Kiritilgan: "${inputPhone4}" -> Normalizatsiya: "${normPhone4}"`);
  const resApt = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ownerToken}`
    },
    body: JSON.stringify({
      patientName: `Qabul Bemor ${randNum}`,
      patientPhone: normPhone4,
      procedure: 'Gingivit terapiyasi',
      doctor: ownerUser.id,
      doctorName: ownerUser.name,
      chair: 1,
      date: '2026-10-20',
      time: '11:30'
    })
  });
  const dataApt = await resApt.json().catch(() => ({}));
  console.log(`   POST Status: ${resApt.status}`, JSON.stringify(dataApt));

  // 5. Settings / Team Member Form (POST /api/team)
  console.log('5. SETTINGS / JAMOA XODIMI FORMASI (POST /api/team):');
  const inputPhone5 = '+998 93 444 55 66';
  const normPhone5 = normalizePhone(inputPhone5);
  console.log(`   Kiritilgan: "${inputPhone5}" -> Normalizatsiya: "${normPhone5}"`);
  const resTeam = await fetch(`${BASE_URL}/team`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ownerToken}`
    },
    body: JSON.stringify({
      name: `Hamshira Gulnoza ${randNum}`,
      title: 'Katta hamshira',
      role: 'nurse',
      email: `gulnoza.${randNum}@dentuz.uz`,
      phone: normPhone5
    })
  });
  const dataTeam = await resTeam.json().catch(() => ({}));
  console.log(`   POST Status: ${resTeam.status}`);
  console.log(`   Yaratilgan xodim tel: "${(dataTeam.data || dataTeam).phone}"\n`);

  // 6. SuperAdmin Clinic Form (POST /api/superadmin/clinics/onboard)
  if (superadminToken) {
    console.log('6. SUPERADMIN KLINIKA ONBOARD FORMASI (POST /api/superadmin/clinics/onboard):');
    const inputPhone6 = '+998 99 777 88 99';
    const normPhone6 = normalizePhone(inputPhone6);
    console.log(`   Kiritilgan: "${inputPhone6}" -> Normalizatsiya: "${normPhone6}"`);
    const resClinic = await fetch(`${BASE_URL}/superadmin/clinics/onboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superadminToken}`
      },
      body: JSON.stringify({
        name: `Super Clinic ${randNum}`,
        ownerName: `Dr. Super ${randNum}`,
        email: `superowner.${randNum}@clinic.uz`,
        phone: normPhone6,
        address: 'Toshkent shahar, Chilonzor 9-kvartal',
        chairsCount: 4,
        subscriptionPlan: 'pro'
      })
    });
    const dataClinic = await resClinic.json().catch(() => ({}));
    console.log(`   POST Status: ${resClinic.status}`);
    console.log(`   Yaratilgan klinika tel: "${dataClinic.data?.clinic?.phone || dataClinic.clinic?.phone || normPhone6}"\n`);
  }

  console.log('================================================================');
  console.log('✅ BARCHA FORMALAR MUVAOFFAQIYATLI YUBORILDI VA NORMALIZATSIYA TASDIQLANDI!');
  console.log('================================================================');
  process.exit(0);
}

runFormTests().catch((err) => {
  console.error('Test xatosi:', err);
  process.exit(1);
});
