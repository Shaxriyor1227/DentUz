const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../src');

function getAllFiles(dir, exts = ['.jsx', '.js']) {
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

const files = getAllFiles(SRC_DIR, ['.jsx']);
let totalTernaries = 0;
const results = {};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const matches = [];

  lines.forEach((line, idx) => {
    if (line.includes("i18n.language ===") || line.includes("language === 'en'") || line.includes("isEn ?") || line.includes("isEn?")) {
      matches.push({ line: idx + 1, content: line.trim() });
    }
  });

  if (matches.length > 0) {
    const rel = path.relative(path.resolve(__dirname, '..'), file).replace(/\\/g, '/');
    results[rel] = matches;
    totalTernaries += matches.length;
  }
});

console.log(`Found ${totalTernaries} ternary occurrences in ${Object.keys(results).length} files:`);
Object.entries(results).forEach(([file, list]) => {
  console.log(`\n📁 ${file} (${list.length} ta):`);
  list.slice(0, 5).forEach(m => console.log(`   L${m.line}: ${m.content}`));
  if (list.length > 5) console.log(`   ... and ${list.length - 5} more`);
});
