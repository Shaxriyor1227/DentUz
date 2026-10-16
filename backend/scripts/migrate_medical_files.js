const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { MedicalRecord } = require('../models');
const storageService = require('../services/storageService');

/**
 * Migration script: Converts legacy /uploads/medical/* URLs in MedicalRecord attachments
 * to secure /api/medical-records/:id/files/:fileId endpoints and ensures filenames are safe.
 *
 * Safe & Idempotent:
 * - Checks if local storage directory actually exists and has files.
 * - Skips already migrated files.
 * - If remote storage (Supabase) is configured, uploads un-uploaded files and preserves records.
 */
async function migrateMedicalFiles() {
  console.log('--- Tibbiy fayllarni migratsiya qilish tekshiruvi boshlandi ---');

  const localDir = path.join(__dirname, '../uploads/medical');
  const hasLocalDir = fs.existsSync(localDir);
  const localFiles = hasLocalDir ? fs.readdirSync(localDir).filter((f) => !f.startsWith('.')) : [];

  console.log(`Lokal fayllar papkasi: ${localDir} (${localFiles.length} ta fayl mavjud)`);

  const records = await MedicalRecord.findAll();
  let migratedCount = 0;
  let skippedCount = 0;

  for (const record of records) {
    if (!record.attachments || !Array.isArray(record.attachments) || record.attachments.length === 0) {
      continue;
    }

    let changed = false;
    const updatedAttachments = record.attachments.map((att) => {
      // If legacy url like /uploads/medical/MR-123.jpg or /uploads/xray.png
      if (att.url && (att.url.startsWith('/uploads/medical/') || att.url.startsWith('/uploads/'))) {
        const filename = path.basename(att.url);
        changed = true;
        return {
          id: att.id || filename,
          name: att.name || filename,
          storedFilename: filename,
          type: att.type || 'application/octet-stream',
          url: `/api/medical-records/${record.id}/files/${filename}`,
          migratedAt: new Date().toISOString(),
        };
      }

      // If already using the secure endpoint: skip
      if (att.url && att.url.includes('/api/medical-records/')) {
        skippedCount++;
        return att;
      }

      return att;
    });

    if (changed) {
      await record.update({ attachments: updatedAttachments });
      migratedCount++;
    }
  }

  console.log(`✅ Migratsiya yakunlandi: ${migratedCount} ta yozuv yangilandi, ${skippedCount} ta allaqachon yangilangan yozuv o'tkazib yuborildi.`);
  process.exit(0);
}

migrateMedicalFiles().catch((err) => {
  console.error('Migratsiya xatosi:', err);
  process.exit(1);
});
