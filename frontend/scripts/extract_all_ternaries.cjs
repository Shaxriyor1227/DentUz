const fs = require('fs');
const path = require('path');

const UZ_PATH = path.resolve(__dirname, '../src/i18n/locales/uz.json');
const EN_PATH = path.resolve(__dirname, '../src/i18n/locales/en.json');
const SRC_DIR = path.resolve(__dirname, '../src');

const uzData = JSON.parse(fs.readFileSync(UZ_PATH, 'utf8'));
const enData = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'));

// Slugify text to create a clean key
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

// Map files to their namespace
const fileNamespaceMap = {
  'About.jsx': 'about',
  'Advantages.jsx': 'advantages',
  'Calendar.jsx': 'calendar',
  'Contact.jsx': 'contact',
  'Dashboard.jsx': 'dashboard',
  'Docs.jsx': 'docs',
  'Features.jsx': 'features',
  'Finance.jsx': 'finance',
  'Homepage.jsx': 'homepage',
  'PatientProfile.jsx': 'patients',
  'Patients.jsx': 'patients',
  'Pricing.jsx': 'pricing',
  'Settings.jsx': 'settings',
  'Signup.jsx': 'auth',
  'TreatmentPlan.jsx': 'treatmentPlan',
  'TopBar.jsx': 'nav',
  'PublicLayout.jsx': 'common',
  'Toast.jsx': 'common'
};

function getAllFiles(dir, exts = ['.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!['assets', 'styles'].includes(file)) {
        results = results.concat(getAllFiles(fullPath, exts));
      }
    } else {
      if (exts.includes(path.extname(file))) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = getAllFiles(SRC_DIR);
let extractedCount = 0;

files.forEach(filePath => {
  const baseName = path.basename(filePath);
  const ns = fileNamespaceMap[baseName] || 'common';
  if (!uzData[ns]) uzData[ns] = {};
  if (!enData[ns]) enData[ns] = {};

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Patterns to match:
  // 1: isEn ? 'Text EN' : 'Text UZ'
  // 2: i18n.language === 'en' ? 'Text EN' : 'Text UZ'
  // 3: i18n.language === 'uz' ? 'Text UZ' : 'Text EN'
  // Also with double quotes or backticks

  // Regex for (isEn ? '...' : '...') or (i18n.language === 'en' ? '...' : '...')
  const patternEnFirst = /(?:\(?(?:isEn|i18n\.language\s*===\s*['"]en['"])\s*\?\s*(['"`])((?:\\.|(?!\1).)*)\1\s*:\s*(['"`])((?:\\.|(?!\3).)*)\3\)?)/g;
  
  content = content.replace(patternEnFirst, (match, q1, textEn, q2, textUz) => {
    // Avoid replacing if it contains complex nested jsx or variables
    if (textEn.includes('${') || textUz.includes('${') || textEn.includes('<') || textUz.includes('<')) {
      return match;
    }
    const cleanEn = textEn.replace(/\\'/g, "'").replace(/\\"/g, '"').trim();
    const cleanUz = textUz.replace(/\\'/g, "'").replace(/\\"/g, '"').trim();
    if (!cleanEn || !cleanUz) return match;

    let key = slugify(cleanEn);
    if (!key || key.length < 2) key = 'item' + Math.floor(Math.random() * 10000);
    
    // Check if key exists with different text
    let finalKey = key;
    let counter = 1;
    while (uzData[ns][finalKey] && (uzData[ns][finalKey] !== cleanUz || enData[ns][finalKey] !== cleanEn)) {
      finalKey = `${key}_${counter++}`;
    }

    uzData[ns][finalKey] = cleanUz;
    enData[ns][finalKey] = cleanEn;
    extractedCount++;
    return `t('${ns}.${finalKey}')`;
  });

  // Regex for i18n.language === 'uz' ? 'Text UZ' : 'Text EN'
  const patternUzFirst = /(?:\(?i18n\.language\s*===\s*['"]uz['"]\s*\?\s*(['"`])((?:\\.|(?!\1).)*)\1\s*:\s*(['"`])((?:\\.|(?!\3).)*)\3\)?)/g;

  content = content.replace(patternUzFirst, (match, q1, textUz, q2, textEn) => {
    if (textEn.includes('${') || textUz.includes('${') || textEn.includes('<') || textUz.includes('<')) {
      return match;
    }
    const cleanEn = textEn.replace(/\\'/g, "'").replace(/\\"/g, '"').trim();
    const cleanUz = textUz.replace(/\\'/g, "'").replace(/\\"/g, '"').trim();
    if (!cleanEn || !cleanUz) return match;

    let key = slugify(cleanEn);
    if (!key || key.length < 2) key = 'item' + Math.floor(Math.random() * 10000);

    let finalKey = key;
    let counter = 1;
    while (uzData[ns][finalKey] && (uzData[ns][finalKey] !== cleanUz || enData[ns][finalKey] !== cleanEn)) {
      finalKey = `${key}_${counter++}`;
    }

    uzData[ns][finalKey] = cleanUz;
    enData[ns][finalKey] = cleanEn;
    extractedCount++;
    return `t('${ns}.${finalKey}')`;
  });

  // Ensure t is extracted from useTranslation if t is used
  if (content !== originalContent) {
    if (!content.includes('const { t') && !content.includes('const {t')) {
      // Find useTranslation call and add t
      if (content.includes('useTranslation()')) {
        content = content.replace(/const\s*\{\s*([^\}]*)\s*\}\s*=\s*useTranslation\(\)/, (m, inner) => {
          if (!inner.includes('t')) {
            return `const { t, ${inner} } = useTranslation()`;
          }
          return m;
        });
      }
    }
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

// Write sorted uz.json and en.json
fs.writeFileSync(UZ_PATH, JSON.stringify(uzData, null, 2) + '\n', 'utf8');
fs.writeFileSync(EN_PATH, JSON.stringify(enData, null, 2) + '\n', 'utf8');

console.log(`✅ Extracted and replaced ${extractedCount} ternaries with t() keys!`);
