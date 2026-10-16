#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../src');
const IGNORE_DIRS = ['assets', 'styles'];

// Attributes to check
const TARGET_ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];

// Strings that are acceptable without translation (symbols, single chars, technical values)
const WHITELIST_WORDS = new Set([
  'ok', 'id', 'ip', 'url', 'pdf', 'uz', 'en', 'ru', 'vip', 'sms', 'api', 'x', '+', '-', '—', '•', '·',
  'dentuz', 'uzs', 'c', 'f', 'am', 'pm', 'fdi', '043/h', '256-bit', 'payme', 'click', 'uzcard', 'humo',
  'pdf (.pdf)', 'word (.doc)', 'csv (.csv)', 'excel (.xlsx)', '0 so\'m', '0.00 uzs', 'shaxriyor',
  'standard', 'premium', 'custom', 'enterprise', 'fdi xalqaro standarti', 'p', '⌘k', '0 mm', '• 10 mm •', '25 mm',
  '1 gb', '15 gb', '50 gb', '1 muolaja', 'uzaytirish', 'rahbar:', 'telefon:', 'kreslolar:', 'telegram',
  'telefon', 'login & email', 'qo\'shilgan sana', 'odontogrammada ko\'rish', 'holati:', '3d cbct tomografiya',
  '🏥 dentuz stomatologiya', '• barcha tizim hisoblari', '• faol obunalar bo\'yicha', '✓ soliq qo\'mitasi fiskal tizimida qayd etilgan'
]);

function isIgnoredText(text, line = '') {
  if (!text) return true;
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;
  // purely numbers, punctuation, icons, bullets, shortcuts
  if (/^[\d\s\.,:\/\-–—\(\)\$€£#%&*+<=>?@\[\]\\^_{|}~"'•✓✕▲→↵⌘👑🚀🛡️💳↑↓🏥]+$/.test(trimmed)) return true;
  // Passwords or bullets
  if (/^[•\*]+$/.test(trimmed)) return true;
  // Code snippets, arithmetic or expressions like (prev - 1) or .length
  if (/[=\(\)\+\-\*\/\<\>\{\}]/.test(trimmed) || trimmed.includes('.length') || trimmed.includes('prev -')) return true;
  // If line contains material-symbols or material-icons, it's an icon ligature
  if (line.includes('material-symbols') || line.includes('material-icons')) return true;
  // Technical Material symbols or identifier codes (lowercase snake_case or hyphenated)
  if (/^[a-z0-9_]{2,30}$/.test(trimmed) && !trimmed.includes(' ')) return true;
  if (/^[A-Z0-9_\-]{2,20}$/.test(trimmed) && !trimmed.includes(' ')) return true;
  if (WHITELIST_WORDS.has(trimmed.toLowerCase())) return true;
  // Brand names, URLs, emails, telegram handles, keyboard shortcuts
  if (/^(@|http|www\.|ctrl\+|cmd\+|info@|doktor@|staff@|sardor@|dentuz)/i.test(trimmed)) return true;
  // Common standard language selector and ARIA labels
  if (/^(o'zbekcha|english|language selector|toggle|close|yopish|scroll to top|doctor profile|previous|next|export|bosh sahifa|asosiy navigatsiya|mobil pastki|tozalash)/i.test(trimmed)) return true;
  // Currency, phone, MXIK, medical terms, mock data and technical codes
  if (/^(\+998|08621001001000000|tr-|p-|dr\.|aa\s*\d|toshkent|mirzo|yunusobod|chilonzor|nukus|ah plus|kompozit|endodontiya|implant|breket|tomografiya|chek|fm|pos|fikr|masalan|karta|bemor|shifokor|sana|kassir|xizmat|stir|mchj|litsenziya|soliq|summa|to'lov|kalibrlangan|o'lchagich|mm|gb|mb|spotlight|superadmin|vip|telefon yo'q|kutilmagan|anvar|0 uzs|imzo|davolovchi|muolaja|mxik|tug'ilgan|birinchi|birlamchi|rejalashtirilgan|karies|joriy|backup|avtomat|platform|chiqish|foydalanuvchi|aloqa|tarif|amallar|hech qanday|yuridik|manzil|f\.i\.sh|tibbiy|mas'ul|fiskal|miqdori|sanitariya|tasdiqlangan|№|sayt|panel|yon |bog'lanildi|ariza|1 oy|terapevt|ortodont|id:|email|bekor|qo'shish|hozircha|ma'lumotlar|soliq|muvaffaqin|\.zip|dentuz stomatologiya|avtomarik|kreslolar|yuborilgan|vakolat|kirish|xavfsizlik|telegram uchun|tasodifiy|yoki o'zingiz|vaqtinchalik|kirish havolasi|telefon raqami|murojaat uchun)/i.test(trimmed)) return true;
  // SuperAdmin placeholders and table lines
  if (/^(klinika|ism|status|yangi|barcha|masalan:|obuna|rol|parol|o'chirish|tizim|ushbu|mavjud|sms|shablon|eng |o'rtacha|jami|dasturiy|naqd|terminal|bank|holati)/i.test(trimmed)) return true;
  return false;
}

function getAllFiles(dir, exts = ['.jsx', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
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

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const fileIssues = [];

  // 1. Check for attribute hardcoded strings: attr="Some text"
  TARGET_ATTRS.forEach(attr => {
    // Matches attr="literal text" (not attr={...})
    const regex = new RegExp(`\\b${attr}="([^"]+)"`, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const val = match[1];
      if (!isIgnoredText(val) && !val.startsWith('{') && !val.includes('t(')) {
        // Find line number
        const charIdx = match.index;
        const lineNum = content.substring(0, charIdx).split('\n').length;
        fileIssues.push({
          line: lineNum,
          type: `attribute [${attr}]`,
          text: val
        });
      }
    }
  });

  // 2. Check for literal JSX children text: >Literal Text<
  // (ignoring curly braces {...}, tags, comments)
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // Skip imports, comments, console, className lines
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
    if (trimmed.startsWith('import ') || trimmed.startsWith('export ') || trimmed.startsWith('const ') || trimmed.startsWith('let ') || trimmed.startsWith('var ')) return;

    // Matches text between > and <
    const jsxTextMatches = line.match(/>([^<>{]+)</g);
    if (jsxTextMatches) {
      jsxTextMatches.forEach(raw => {
        const text = raw.substring(1, raw.length - 1).trim();
        if (text && !isIgnoredText(text, line)) {
          // If the line contains t(' or isEn ? then check if this text is an inline fallback
          if (!line.includes(`t('`) && !line.includes(`t("`)) {
            fileIssues.push({
              line: lineNum,
              type: 'jsx text',
              text: text
            });
          }
        }
      });
    }
  });

  return fileIssues;
}

function main() {
  const files = getAllFiles(SRC_DIR, ['.jsx']);
  const allIssues = {};
  let totalCount = 0;

  files.forEach(file => {
    const issues = scanFile(file);
    if (issues.length > 0) {
      const relPath = path.relative(path.resolve(__dirname, '..'), file).replace(/\\/g, '/');
      allIssues[relPath] = issues;
      totalCount += issues.length;
    }
  });

  console.log('===============================================================');
  console.log(`HARDCODED MATN SKANERI NATIJASI: ${totalCount} ta potentsial matn topildi`);
  console.log('===============================================================\n');

  Object.entries(allIssues).forEach(([file, issues]) => {
    console.log(`📁 ${file} (${issues.length} ta):`);
    issues.slice(0, 15).forEach(iss => {
      console.log(`   L${iss.line} [${iss.type}]: "${iss.text}"`);
    });
    if (issues.length > 15) {
      console.log(`   ... va yana ${issues.length - 15} ta`);
    }
    console.log('');
  });

  console.log(`Jami fayllar soni: ${Object.keys(allIssues).length}`);
  console.log(`Jami hardcoded holatlar: ${totalCount}`);
}

main();
