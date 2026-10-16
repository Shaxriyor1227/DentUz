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
  'dentuz', 'uzs', 'c', 'f', 'am', 'pm'
]);

function isIgnoredText(text) {
  if (!text) return true;
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;
  // purely numbers, punctuation, icons
  if (/^[\d\s\.,:\/\-–—\(\)\$€£#%&*+<=>?@\[\]\\^_{|}~"']+$/.test(trimmed)) return true;
  // Material symbols (e.g. check, add, close, delete, person, edit, search, etc.)
  if (/^[a-z_]{2,25}$/.test(trimmed) && !trimmed.includes(' ')) {
    // If it's a known material icon name or single word lowercase
    const iconNames = ['check', 'add', 'close', 'delete', 'edit', 'search', 'person', 'menu', 'schedule', 'settings', 'dashboard', 'groups', 'logout', 'lock', 'visibility', 'visibility_off', 'mail', 'phone', 'location_on', 'shield', 'notifications', 'badge', 'security', 'verified', 'event', 'today', 'payments', 'receipt', 'info', 'warning', 'error', 'chevron_right', 'chevron_left', 'expand_more', 'expand_less', 'refresh', 'sync', 'download', 'upload', 'help', 'arrow_back', 'arrow_forward', 'open_in_new', 'filter_list', 'tune', 'print', 'history_toggle_off', 'group_off', 'search_off', 'light_mode', 'dark_mode'];
    if (iconNames.includes(trimmed)) return true;
  }
  if (WHITELIST_WORDS.has(trimmed.toLowerCase())) return true;
  // Currency or phone formats
  if (/^(\+998|08621001001000000)/.test(trimmed)) return true;
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
        if (text && !isIgnoredText(text)) {
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
