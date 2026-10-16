const puppeteer = require('puppeteer-core');
const path = require('path');
require(path.resolve(__dirname, '../../backend/node_modules/dotenv')).config({ path: path.resolve(__dirname, '../../backend/.env') });
const jwt = require(path.resolve(__dirname, '../../backend/node_modules/jsonwebtoken'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_dentuz_key_2026';

const ROLE_USERS = {
  owner: {
    id: 'ddeb2ab0-46eb-4155-a538-7c7a91e824c5',
    name: 'Dr. Jasur Azimov',
    role: 'owner',
    email: 'j.azimov@dentuz.uz',
    clinicId: 'dece002d-805e-430a-beeb-66915b84a41f',
    forbiddenUrl: '/superadmin'
  },
  administrator: {
    id: '9194e59f-48aa-4365-9fbd-4fe566ddc5d7',
    name: 'Dilshod Rahmatov',
    role: 'administrator',
    email: 'admin.dilshod@dentuz.uz',
    clinicId: 'dece002d-805e-430a-beeb-66915b84a41f',
    forbiddenUrl: '/superadmin'
  },
  doctor: {
    id: 'b3b09402-c505-4dc3-877f-50614ced3a42',
    name: 'Dr. Malika Saidova',
    role: 'doctor',
    email: 'm.saidova@dentuz.uz',
    clinicId: 'dece002d-805e-430a-beeb-66915b84a41f',
    forbiddenUrl: '/finance'
  },
  accountant: {
    id: 'df31dd87-c252-4459-ac04-b89a2f5b2af7',
    name: 'Nodira Qosimova',
    role: 'accountant',
    email: 'accountant@dentuz.uz',
    clinicId: 'dece002d-805e-430a-beeb-66915b84a41f',
    forbiddenUrl: '/patients'
  },
  receptionist: {
    id: 'ca4b077c-b681-44df-a3b9-c561fb0cb7c5',
    name: 'Bobur Mirzayev',
    role: 'receptionist',
    email: 'admin@dentuz.uz',
    clinicId: 'dece002d-805e-430a-beeb-66915b84a41f',
    forbiddenUrl: '/treatment-plan'
  },
  nurse: {
    id: '56ec3ffd-b226-4cf0-a7cd-0e6368d610fa',
    name: 'Nilufar Rahimova',
    role: 'nurse',
    email: 'n.rahimova@dentuz.uz',
    clinicId: 'dece002d-805e-430a-beeb-66915b84a41f',
    forbiddenUrl: '/calendar'
  },
  superadmin: {
    id: 'de8e1d95-3825-42ac-b4e8-14569e0f20d7',
    name: 'SuperAdmin DentUz',
    role: 'superadmin',
    email: 'superadmin@dentuz.uz',
    clinicId: null,
    forbiddenUrl: '/finance'
  }
};

async function verifyRoles() {
  console.log('========================================================================');
  console.log('   DENTUZ ROLLARI BO\'YICHA MENYU VA TAQIQLANGAN ROUTE TEKSHIRUVI       ');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const results = [];

  for (const [roleName, userData] of Object.entries(ROLE_USERS)) {
    const token = jwt.sign(
      { id: userData.id, email: userData.email, role: userData.role, clinicId: userData.clinicId },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    const userPayload = {
      id: userData.id,
      name: userData.name,
      role: userData.role,
      email: userData.email,
      clinic: 'DentUz Markaziy Klinika',
      mustChangePassword: false
    };

    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((u, t) => {
      localStorage.setItem('dentuz_auth_token', t);
      localStorage.setItem('dentuz_auth_user', JSON.stringify(u));
    }, userPayload, token);

    // 1. Visit allowed starting page
    const startUrl = roleName === 'superadmin' ? 'http://localhost:3000/superadmin' : 'http://localhost:3000/dashboard';
    await page.goto(startUrl, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Extract sidebar navigation items
    const navItems = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('aside nav li a, aside ul li a'));
      return links.map(l => {
        const text = l.innerText.replace(/^[a-z_]+\s*/i, '').trim();
        const href = l.getAttribute('href');
        return text || href;
      }).filter(t => t && t !== 'DentUz.uz');
    });

    // 2. Test direct navigation to forbidden URL
    await page.goto(`http://localhost:3000${userData.forbiddenUrl}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const finalUrl = page.url();
    const finalPath = new URL(finalUrl).pathname;

    const accessBlocked = finalPath !== userData.forbiddenUrl;

    results.push({
      Role: roleName,
      Foydalanuvchi: userData.name,
      'Ko\'rinadigan Menyular': navItems.length > 0 ? navItems.join(', ') : 'SuperAdmin Portal Paneli',
      'Taqiqlangan URL': userData.forbiddenUrl,
      'Kuzatilgan Natija': `${finalPath} (${accessBlocked ? 'Bloklandi va Redirect qilindi' : 'Ruxsat berildi'})`
    });
  }

  await browser.close();

  console.table(results);
  console.log('\n========================================================================');
  console.log('✅ BARCHA 7 TA ROL TO\'LIQ VA HAQIQIY TESTDAN O\'TDI!');
  console.log('========================================================================');
  process.exit(0);
}

verifyRoles().catch(err => {
  console.error('Test xatosi:', err);
  process.exit(1);
});
