/**
 * DentUz i18n Parity & Integrity Checker
 * Verifies parity between uz.json and en.json.
 * Enforces:
 *  - Every key in uz.json exists in en.json
 *  - Every key in en.json exists in uz.json
 *  - No key has an empty string or null value
 *  - ru.json is explicitly ignored per project instructions
 * Exit code 0 on success, exit code 1 on any parity/completeness error.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, '../src/i18n/locales');
const uzPath = path.join(localesDir, 'uz.json');
const enPath = path.join(localesDir, 'en.json');

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`[i18n:check] File not found: ${filePath}`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`[i18n:check] JSON parse error in ${filePath}: ${err.message}`);
    process.exit(1);
  }
}

function getLeafKeys(obj, prefix = '') {
  const result = new Map();
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const nested = getLeafKeys(value, fullPath);
      for (const [k, v] of nested) {
        result.set(k, v);
      }
    } else {
      result.set(fullPath, value);
    }
  }
  return result;
}

const uzData = loadJson(uzPath);
const enData = loadJson(enPath);

const uzKeys = getLeafKeys(uzData);
const enKeys = getLeafKeys(enData);

const missingInEn = [];
const extraInEn = [];
const emptyInUz = [];
const emptyInEn = [];

for (const [key, val] of uzKeys) {
  if (!enKeys.has(key)) {
    missingInEn.push(key);
  }
  if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
    emptyInUz.push(key);
  }
}

for (const [key, val] of enKeys) {
  if (!uzKeys.has(key)) {
    extraInEn.push(key);
  }
  if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
    emptyInEn.push(key);
  }
}

let hasErrors = false;

if (missingInEn.length > 0) {
  hasErrors = true;
  console.error(`\n❌ [i18n:check] Missing in en.json (${missingInEn.length} keys):`);
  missingInEn.slice(0, 30).forEach(k => console.error(`  - ${k}`));
  if (missingInEn.length > 30) console.error(`  ... and ${missingInEn.length - 30} more`);
}

if (extraInEn.length > 0) {
  hasErrors = true;
  console.error(`\n❌ [i18n:check] Extra in en.json (missing in uz.json) (${extraInEn.length} keys):`);
  extraInEn.slice(0, 30).forEach(k => console.error(`  - ${k}`));
  if (extraInEn.length > 30) console.error(`  ... and ${extraInEn.length - 30} more`);
}

if (emptyInUz.length > 0) {
  hasErrors = true;
  console.error(`\n❌ [i18n:check] Empty values in uz.json (${emptyInUz.length} keys):`);
  emptyInUz.slice(0, 30).forEach(k => console.error(`  - ${k}`));
}

if (emptyInEn.length > 0) {
  hasErrors = true;
  console.error(`\n❌ [i18n:check] Empty values in en.json (${emptyInEn.length} keys):`);
  emptyInEn.slice(0, 30).forEach(k => console.error(`  - ${k}`));
}

if (hasErrors) {
  console.error('\n❌ i18n parity check FAILED.');
  process.exit(1);
} else {
  console.log(`\n✓ i18n check PASSED: uz.json and en.json are perfectly in sync (${uzKeys.size} leaf keys).`);
  process.exit(0);
}
