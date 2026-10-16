const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { MedicalRecord } = require('../models');
const storageService = require('../services/storageService');

/**
 * Migration script: Converts legacy /uploads/medical/* URLs in MedicalRecord attachments
 * to secure /api/medical-records/:id/files/:fileId endpoints and ensures filenames are safe.
 */
async function migrateMedicalFiles() {
  console.log('--- Tibbiy fayllarni xavfsiz formatga migratsiya qilish boshlandi ---');
  const records = await MedicalRecord.findAll();
  let migratedCount = 0;

  for (const record of records) {
    if (!record.attachments || !Array.isArray(record.attachments) || record.attachments.length === 0) {
      continue;
    }

    let changed = false;
    const updatedAttachments = record.attachments.map((att) => {
      // If legacy url like /uploads/medical/MR-123.jpg
      if (att.url && att.url.startsWith('/uploads/medical/')) {
        const filename = path.basename(att.url);
        changed = true;
        return {
          id: att.id || filename,
          name: att.name || filename,
          storedFilename: filename,
          type: att.type || 'application/octet-stream',
          url: `/api/medical-records/${record.id}/files/${filename}`,
          migratedAt: new Date().toISOString()
        };
      }
      return att;
    });

    if (changed) {
      await record.update({ attachments: updatedAttachments });
      migratedCount++;
    }
  }

  console.log(`Migratsiya yakunlandi: ${migratedCount} ta tibbiy yozuv yangilandi.`);
  process.exit(0);
}

migrateMedicalFiles().catch((err) => {
  console.error('Migratsiya xatosi:', err);
  process.exit(1);
});
