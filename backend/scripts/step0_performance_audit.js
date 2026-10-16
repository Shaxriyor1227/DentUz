const fs = require('fs');
const path = require('path');
const http = require('http');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function measureEndpoint(url, headers = {}) {
  const start = process.hrtime.bigint();
  return new Promise((resolve) => {
    const req = http.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1e6;
        resolve({
          status: res.statusCode,
          durationMs: Number(durationMs.toFixed(2)),
          sizeBytes: Buffer.byteLength(data),
          contentType: res.headers['content-type'],
          contentEncoding: res.headers['content-encoding'] || 'none',
        });
      });
    });
    req.on('error', (err) => {
      resolve({ error: err.message });
    });
    req.setTimeout(5000, () => {
      req.abort();
      resolve({ error: 'Timeout 5000ms' });
    });
  });
}

async function runStep0Audit() {
  console.log("=== 4-BOSQICH (0-QADAM: O'LCHASH VA BASELINE DIAGNOSTIKA) ===\n");

  // 1. Frontend Dist Bundle Audit
  const distDir = path.resolve(__dirname, '../../frontend/dist');
  if (fs.existsSync(distDir)) {
    console.log('--- 1. FRONTEND BUNDLE VA CHUNK O\'LCHOVI ---');
    const jsDir = path.join(distDir, 'assets/js');
    const cssDir = path.join(distDir, 'assets/css');
    
    let totalJsBytes = 0;
    let totalCssBytes = 0;
    const jsFiles = fs.readdirSync(jsDir).map(file => {
      const stats = fs.statSync(path.join(jsDir, file));
      totalJsBytes += stats.size;
      return { file, sizeKb: (stats.size / 1024).toFixed(2), bytes: stats.size };
    }).sort((a, b) => b.bytes - a.bytes);

    const cssFiles = fs.readdirSync(cssDir).map(file => {
      const stats = fs.statSync(path.join(cssDir, file));
      totalCssBytes += stats.size;
      return { file, sizeKb: (stats.size / 1024).toFixed(2), bytes: stats.size };
    }).sort((a, b) => b.bytes - a.bytes);

    console.log(`Jami JS hajmi: ${(totalJsBytes / 1024).toFixed(2)} KB (${(totalJsBytes / (1024*1024)).toFixed(2)} MB)`);
    console.log(`Jami CSS hajmi: ${(totalCssBytes / 1024).toFixed(2)} KB`);
    console.log('\nEng katta 7 ta JS chunk:');
    jsFiles.slice(0, 7).forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.file} -> ${item.sizeKb} KB`);
    });

    console.log('\nEng katta 5 ta CSS fayl:');
    cssFiles.slice(0, 5).forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.file} -> ${item.sizeKb} KB`);
    });
  }

  // 2. Backend Latency & Response Audit
  console.log('\n--- 2. BACKEND ENDPOINTLARINING JAVOB VAQTLARI (BASELINE) ---');
  const endpoints = [
    { name: 'Health Check', url: 'http://localhost:5000/api/health' },
    { name: 'Static Frontend Root (Vite)', url: 'http://localhost:3000/' },
    { name: 'Public Clinic Application (GET options/404)', url: 'http://localhost:5000/api/clinics/apply' },
  ];

  for (const ep of endpoints) {
    const latencies = [];
    let lastResult = null;
    for (let i = 0; i < 5; i++) {
      const res = await measureEndpoint(ep.url);
      if (!res.error) latencies.push(res.durationMs);
      lastResult = res;
    }
    if (latencies.length > 0) {
      const avg = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
      const min = Math.min(...latencies).toFixed(2);
      const max = Math.max(...latencies).toFixed(2);
      console.log(`[${ep.name}] Status: ${lastResult.status} | Encoding: ${lastResult.contentEncoding} | O'rtacha: ${avg}ms (min: ${min}ms, max: ${max}ms) | Hajm: ${lastResult.sizeBytes} B`);
    } else {
      console.log(`[${ep.name}] Error: ${lastResult?.error || 'Noma\'lum'}`);
    }
  }

  // 3. PostgreSQL Database Index Inspection
  console.log('\n--- 3. BAZA INDEKSLARI VA DIAGNOSTIKASI ---');
  const { sequelize } = require('../models');
  try {
    const [indexes] = await sequelize.query(`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `);
    console.log(`Jami 'public' sxemadagi indekslar soni: ${indexes.length}`);

    // Check FKs vs Indexes
    const [missingFkIndexes] = await sequelize.query(`
      SELECT
        conrelid::regclass AS table_name,
        conname AS foreign_key,
        pg_get_constraintdef(c.oid) AS constraint_def
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE c.contype = 'f' AND n.nspname = 'public'
      ORDER BY table_name;
    `);
    console.log(`Jami mavjud Foreign Key munosabatlari: ${missingFkIndexes.length}`);
  } catch (err) {
    console.log('DB diagnostika xatosi:', err.message);
  } finally {
    await sequelize.close();
  }
}

runStep0Audit().catch(console.error);
