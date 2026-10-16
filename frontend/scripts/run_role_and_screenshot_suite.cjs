const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve(__dirname, '../../screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

require(path.resolve(__dirname, '../../backend/node_modules/dotenv')).config({ path: path.resolve(__dirname, '../../backend/.env') });
const jwt = require(path.resolve(__dirname, '../../backend/node_modules/jsonwebtoken'));

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_dentuz_key_2026';

const DEMO_USERS = {
  owner: {
    id: 'f8fb075c-9a90-4b0c-9874-dc13d7c5a693',
    name: 'Dr. Jasur Azimov',
    role: 'owner',
    email: 'j.azimov@dentuz.uz',
    clinicId: 'dece002d-805e-430a-beeb-66915b84a41f',
    clinic: 'DentUz Markaziy Klinika'
  },
  administrator: {
    id: '9194e59f-48aa-4365-9fbd-4fe566ddc5d7',
    name: 'Dilshod Rahmatov',
    role: 'administrator',
    email: 'admin.dilshod@dentuz.uz',
    clinicId: 'dece002d-805e-430a-beeb-66915b84a41f',
    clinic: 'DentUz Markaziy Klinika'
  },
  doctor: {
    id: 'b3b09402-c505-4dc3-877f-50614ced3a42',
    name: 'Dr. Malika Saidova',
    role: 'doctor',
    email: 'm.saidova@dentuz.uz',
    clinicId: 'dece002d-805e-430a-beeb-66915b84a41f',
    clinic: 'DentUz Markaziy Klinika'
  },
  accountant: {
    id: 'df31dd87-c252-4459-ac04-b89a2f5b2af7',
    name: 'Nodira Qosimova',
    role: 'accountant',
    email: 'accountant@dentuz.uz',
    clinicId: 'dece002d-805e-430a-beeb-66915b84a41f',
    clinic: 'DentUz Markaziy Klinika'
  },
  receptionist: {
    id: 'ca4b077c-b681-44df-a3b9-c561fb0cb7c5',
    name: 'Bobur Mirzayev',
    role: 'receptionist',
    email: 'admin@dentuz.uz',
    clinicId: 'dece002d-805e-430a-beeb-66915b84a41f',
    clinic: 'DentUz Markaziy Klinika'
  },
  nurse: {
    id: '56ec3ffd-b226-4cf0-a7cd-0e6368d610fa',
    name: 'Nilufar Rahimova',
    role: 'nurse',
    email: 'n.rahimova@dentuz.uz',
    clinicId: 'dece002d-805e-430a-beeb-66915b84a41f',
    clinic: 'DentUz Markaziy Klinika'
  },
  superadmin: {
    id: 'de8e1d95-3825-42ac-b4e8-14569e0f20d7',
    name: 'SuperAdmin DentUz',
    role: 'superadmin',
    email: 'superadmin@dentuz.uz',
    clinic: 'DentUz HQ'
  }
};

async function runSuite() {
  console.log('================================================================');
  console.log('      DENTUZ ROLLARI VA RESPONSIVE SKRINSHOTLAR TEKSHIRUVI      ');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // Helper to set role in localStorage
  async function setUserRole(roleKey) {
    const user = DEMO_USERS[roleKey];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, clinicId: user.clinicId },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((u, t) => {
      localStorage.setItem('dentuz_auth_token', t);
      localStorage.setItem('dentuz_auth_user', JSON.stringify(u));
    }, user, token);
  }

  // --- PART 1: ROLE MATRIX & ACCESS CONTROL ---
  console.log('--- 1. ROLLAR BO\'YICHA MENYU VA TAQIQLANGAN URL TEKSHIRUVI ---\n');
  const roleResults = [];

  const rolesToTest = ['owner', 'administrator', 'doctor', 'accountant', 'receptionist', 'nurse', 'superadmin'];

  for (const role of rolesToTest) {
    await setUserRole(role);
    const startUrl = role === 'superadmin' ? 'http://localhost:3000/superadmin' : 'http://localhost:3000/dashboard';
    await page.goto(startUrl, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 600));

    // Read visible sidebar links
    const visibleLinks = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('aside nav a, aside ul a'));
      return anchors
        .map(a => {
          const text = a.innerText.trim();
          const href = a.getAttribute('href');
          return `${text || href} (${href})`;
        })
        .filter((v, i, self) => self.indexOf(v) === i);
    });

    // Test forbidden direct URL
    let forbiddenTarget = '';
    if (role === 'doctor') forbiddenTarget = '/finance';
    else if (role === 'accountant') forbiddenTarget = '/patients';
    else if (role === 'receptionist') forbiddenTarget = '/treatment-plan';
    else if (role === 'nurse') forbiddenTarget = '/calendar';
    else if (role === 'owner' || role === 'administrator') forbiddenTarget = '/superadmin';
    else if (role === 'superadmin') forbiddenTarget = '/finance';

    let redirectedTo = '';
    if (forbiddenTarget) {
      await page.goto(`http://localhost:3000${forbiddenTarget}`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 400));
      const finalUrl = page.url();
      redirectedTo = new URL(finalUrl).pathname;
    }

    roleResults.push({
      role,
      visibleLinks: visibleLinks.join(', ') || '(SuperAdmin Portal Paneli)',
      forbiddenTest: forbiddenTarget ? `To'g'ridan-to'g'ri: ${forbiddenTarget} -> Natija: ${redirectedTo}` : 'N/A'
    });
  }

  console.table(roleResults);

  // --- PART 2: RESPONSIVE SCREENSHOTS (375px & 768px) ---
  console.log('\n--- 2. RESPONSIVE SKRINSHOTLARNI YARATISH (375px va 768px) ---');

  // Set owner so all clinical pages render cleanly
  await setUserRole('owner');

  const pagesToCapture = [
    { name: 'homepage', path: '/' },
    { name: 'about', path: '/about' },
    { name: 'features', path: '/features' },
    { name: 'pricing', path: '/pricing' },
    { name: 'contact', path: '/contact' },
    { name: 'docs', path: '/docs' },
    { name: 'login', path: '/login', unauth: true },
    { name: 'dashboard', path: '/dashboard' },
    { name: 'patients', path: '/patients' },
    { name: 'calendar', path: '/calendar' },
    { name: 'treatment_plan', path: '/treatment-plan' },
    { name: 'finance', path: '/finance' },
    { name: 'settings', path: '/settings' }
  ];

  const viewports = [
    { width: 375, height: 812, label: '375px' },
    { width: 768, height: 1024, label: '768px' }
  ];

  const capturedFiles = [];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });

    for (const p of pagesToCapture) {
      if (p.unauth) {
        // clear auth for login page
        await page.evaluate(() => {
          localStorage.removeItem('dentuz_auth_token');
          localStorage.removeItem('dentuz_auth_user');
        });
      } else {
        await setUserRole('owner');
      }

      const fileBasename = `${p.name}_${vp.label}.png`;
      const filePath = path.join(SCREENSHOT_DIR, fileBasename);

      await page.goto(`http://localhost:3000${p.path}`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
      // Small pause for transitions
      await new Promise(r => setTimeout(r, 300));
      await page.screenshot({ path: filePath, fullPage: false });

      console.log(`📸 [${vp.label}] ${p.name.padEnd(16)} -> ${fileBasename}`);
      capturedFiles.push({ page: p.name, viewport: vp.label, filename: fileBasename, path: filePath });
    }

    // SuperAdmin screenshot
    await setUserRole('superadmin');
    const saBasename = `superadmin_${vp.label}.png`;
    const saPath = path.join(SCREENSHOT_DIR, saBasename);
    await page.goto('http://localhost:3000/superadmin', { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: saPath, fullPage: false });
    console.log(`📸 [${vp.label}] superadmin       -> ${saBasename}`);
    capturedFiles.push({ page: 'superadmin', viewport: vp.label, filename: saBasename, path: saPath });
  }

  await browser.close();

  console.log('\n================================================================');
  console.log(`✅ JAMI ${capturedFiles.length} TA SKRINSHOT MUVAOFFAQIYATLI SAQLANDI!`);
  console.log('   Manzil: ' + SCREENSHOT_DIR);
  console.log('================================================================');
  process.exit(0);
}

runSuite().catch(err => {
  console.error('Xatolik:', err);
  process.exit(1);
});
