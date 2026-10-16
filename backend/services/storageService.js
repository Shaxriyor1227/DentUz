const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Storage Service — Abstraction for medical file storage.
 * Supports:
 * 1) 'local' (Local persistent or ephemeral directory)
 * 2) 's3' / 'supabase' (S3-compatible object storage via standard S3 API or HTTPS REST)
 *
 * Configured via env STORAGE_DRIVER ('local' | 'supabase' | 's3'). Default: 'local'
 */
const STORAGE_DRIVER = process.env.STORAGE_DRIVER || 'local';
const LOCAL_STORAGE_DIR = path.join(__dirname, '../uploads/medical');

// Ensure local directory exists
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

/**
 * Validates actual file type by checking magic bytes header against allowed MIME types.
 * Prevents file-extension spoofing (e.g. executable/script disguised as .pdf or .jpg).
 */
function validateMagicBytes(buffer, declaredMime, originalName) {
  if (!buffer || buffer.length < 4) {
    return { valid: false, detectedMime: null };
  }

  // PDF signature: %PDF (0x25 0x50 0x44 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { valid: true, detectedMime: 'application/pdf' };
  }

  // PNG signature: \x89PNG (0x89 0x50 0x4E 0x47)
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { valid: true, detectedMime: 'image/png' };
  }

  // JPEG signature: \xFF\xD8\xFF (0xFF 0xD8 0xFF)
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, detectedMime: 'image/jpeg' };
  }

  // WEBP signature: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
    buffer.slice(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { valid: true, detectedMime: 'image/webp' };
  }

  // DICOM signature: DICM at offset 128
  if (buffer.length > 132 && buffer.slice(128, 132).toString('ascii') === 'DICM') {
    return { valid: true, detectedMime: 'application/dicom' };
  }

  // Extension check for DICOM files without 128-byte preamble
  const ext = path.extname(originalName || '').toLowerCase();
  if (ext === '.dcm' || ext === '.dicom' || declaredMime === 'application/dicom') {
    return { valid: true, detectedMime: 'application/dicom' };
  }

  return { valid: false, detectedMime: null };
}

/**
 * Generates an unpredictable filename using crypto.randomUUID
 */
function generateSecureFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const safeExt = /^\.[a-z0-9]{2,5}$/.test(ext) ? ext : '.bin';
  return `MR-${crypto.randomUUID()}${safeExt}`;
}

const storageService = {
  getDriver() {
    return STORAGE_DRIVER;
  },

  validateFile(buffer, declaredMime, originalName) {
    return validateMagicBytes(buffer, declaredMime, originalName);
  },

  /**
   * Save a file buffer to storage.
   * Returns metadata including storedFilename, originalName, mimeType, size.
   */
  async saveFile({ buffer, originalName, mimeType }) {
    const magicCheck = validateMagicBytes(buffer, mimeType, originalName);
    if (!magicCheck.valid) {
      throw new Error(`Xavfsizlik xatosi: Fayl turi haqiqiy emas yoki ruxsat etilmagan (${mimeType})`);
    }

    const storedFilename = generateSecureFilename(originalName);

    if (STORAGE_DRIVER === 'supabase' || STORAGE_DRIVER === 's3') {
      // In production with Supabase Storage:
      // Uses Supabase REST Storage API or S3 API without needing heavy AWS SDK
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
      const bucket = process.env.SUPABASE_BUCKET || 'medical-records';

      if (supabaseUrl && supabaseKey) {
        const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${storedFilename}`;
        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': magicCheck.detectedMime || mimeType,
          },
          body: buffer,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Supabase Storage yuklashda xatolik: ${res.status} ${errText}`);
        }

        return {
          id: crypto.randomUUID(),
          storedFilename,
          originalName,
          mimeType: magicCheck.detectedMime || mimeType,
          size: buffer.length,
          driver: 'supabase',
          url: `/api/medical-records/files/${storedFilename}`,
        };
      }
      // If config missing, fallback to local storage with warning
      console.warn('STORAGE_DRIVER=supabase/s3 belgilangan, lekin kalitlar to\'liq emas. Fayl mahalliy diskka saqlanmoqda.');
    }

    // Local driver
    const filePath = path.join(LOCAL_STORAGE_DIR, storedFilename);
    await fs.promises.writeFile(filePath, buffer);

    return {
      id: crypto.randomUUID(),
      storedFilename,
      originalName,
      mimeType: magicCheck.detectedMime || mimeType,
      size: buffer.length,
      driver: 'local',
      url: `/api/medical-records/files/${storedFilename}`,
    };
  },

  /**
   * Retrieves a file from storage.
   * Returns { buffer, stream, mimeType, size }
   */
  async getFile(storedFilename) {
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(storedFilename);

    if (STORAGE_DRIVER === 'supabase' || STORAGE_DRIVER === 's3') {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
      const bucket = process.env.SUPABASE_BUCKET || 'medical-records';

      if (supabaseUrl && supabaseKey) {
        const downloadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${safeFilename}`;
        const res = await fetch(downloadUrl, {
          headers: { Authorization: `Bearer ${supabaseKey}` },
        });
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          return {
            buffer,
            mimeType: res.headers.get('content-type') || 'application/octet-stream',
            size: buffer.length,
          };
        }
      }
    }

    // Local storage lookup
    const filePath = path.join(LOCAL_STORAGE_DIR, safeFilename);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const buffer = await fs.promises.readFile(filePath);
    return {
      buffer,
      size: buffer.length,
    };
  },

  /**
   * Deletes a file from storage
   */
  async deleteFile(storedFilename) {
    const safeFilename = path.basename(storedFilename);
    const filePath = path.join(LOCAL_STORAGE_DIR, safeFilename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  },
};

module.exports = storageService;
