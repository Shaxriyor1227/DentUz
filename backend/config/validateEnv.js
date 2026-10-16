/**
 * Validates mandatory environment variables before server starts.
 * Halts process with a descriptive error if requirements are not met.
 */
const logger = require('../utils/logger');

function validateEnvironment() {
  const errors = [];
  const warnings = [];

  // 1. JWT Secrets (must be at least 32 characters for HMAC SHA-256 security)
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    errors.push("JWT_SECRET kiritilmagan. Kamida 32 belgidan iborat maxfiy kalit bo'lishi shart.");
  } else if (jwtSecret.length < 32) {
    errors.push(`JWT_SECRET juda qisqa (${jwtSecret.length} belgi). Xavfsizlik uchun kamida 32 belgi talab qilinadi.`);
  }

  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!jwtRefreshSecret) {
    errors.push("JWT_REFRESH_SECRET kiritilmagan. Kamida 32 belgidan iborat maxfiy kalit bo'lishi shart.");
  } else if (jwtRefreshSecret.length < 32) {
    errors.push(`JWT_REFRESH_SECRET juda qisqa (${jwtRefreshSecret.length} belgi). Xavfsizlik uchun kamida 32 belgi talab qilinadi.`);
  }

  // 2. Database connection
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const hasDbParams = Boolean(process.env.DB_NAME && (process.env.DB_USER || process.env.DB_USERNAME));
  if (!hasDbUrl && !hasDbParams) {
    errors.push("Ma'lumotlar bazasi konfiguratsiyasi topilmadi. DATABASE_URL yoki DB_NAME/DB_USER kiritilishi shart.");
  }

  // 3. CORS Origins
  if (!process.env.CORS_ORIGINS && process.env.NODE_ENV === 'production') {
    errors.push("Production muhitida CORS_ORIGINS kiritilishi shart (masalan: https://dentuz.vercel.app).");
  }

  // 4. Storage Driver Warning
  const isProduction = process.env.NODE_ENV === 'production';
  const storageDriver = process.env.STORAGE_DRIVER || 'local';
  if (isProduction && storageDriver === 'local') {
    warnings.push(
      "⚠️ OGOHLANTIRISH: Production muhitida STORAGE_DRIVER='local' belgilangan. " +
      "Render disklari vaqtinchalik (ephemeral) bo'lgani sababli yuklangan tibbiy fayllar keyingi deployda o'chib ketishi mumkin. " +
      "Supabase Storage (STORAGE_DRIVER=supabase) yoki S3 drayverini ulash tavsiya etiladi."
    );
  }

  if (errors.length > 0) {
    console.error('\n===============================================================');
    console.error('🚨 SERVER ISHGA TUSHMADI: MUHIM ENV O\'ZGARUVCHILARI XATOSI');
    console.error('===============================================================');
    errors.forEach((err, idx) => console.error(`${idx + 1}. ${err}`));
    console.error('===============================================================\n');
    process.exit(1);
  }

  if (warnings.length > 0) {
    warnings.forEach((warn) => logger.warn(warn));
  }
}

module.exports = { validateEnvironment };
