const puppeteer = require('puppeteer-core');
const path = require('path');
require(path.resolve(__dirname, '../../backend/node_modules/dotenv')).config({ path: path.resolve(__dirname, '../../backend/.env') });
const jwt = require(path.resolve(__dirname, '../../backend/node_modules/jsonwebtoken'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_dentuz_key_2026';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  const user = {
    id: 'f8fb075c-9a90-4b0c-9874-dc13d7c5a693',
    name: 'Dr. Jasur Azimov',
    role: 'owner',
    email: 'j.azimov@dentuz.uz',
    clinicId: 'dece002d-805e-430a-beeb-66915b84a41f',
    clinic: 'DentUz Markaziy Klinika'
  };

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

  console.log('Navigating to http://localhost:3000/dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  console.log('Current URL after navigation:', page.url());

  const navLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => a.href + ' -> ' + a.innerText.trim());
  });
  console.log('Found links:', navLinks.slice(0, 10));

  await browser.close();
  process.exit(0);
})();
