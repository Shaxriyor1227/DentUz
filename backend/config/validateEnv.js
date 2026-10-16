/**
 * Validates mandatory environment variables before server starts.
 * Halts process with a descriptive error if requirements are not met.
 */
const logger = require('../utils/logger');

function validateEnvironment() {
  const errors = [];
  const warnings = [];

  // 1. JWT Secrets
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    errors.push("JWT_SECRET kiritilmagan. Maxfiy kalit bo'lishi shart.");
  } else if (jwtSecret.length < 16) {
    errors.push(`JWT_SECRET xavfli darajada qisqa (${jwtSecret.length} belgi). Kamida 16 belgi bo'lishi shart.`);
  } else if (jwtSecret.length < 32) {
    warnings.push(`JWT_SECRET tavsiya etilgan 32 belgidan kamroq (${jwtSecret.length} belgi). Xavfsizlikni kuchaytirish uchun Render panelida 32+ belgili kalit o'rnatish tavsiya etiladi.`);
  }

  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!jwtRefreshSecret) {
    errors.push("JWT_REFRESH_SECRET kiritilmagan. Maxfiy kalit bo'lishi shart.");
  } else if (jwtRefreshSecret.length < 16) {
    errors.push(`JWT_REFRESH_SECRET xavfli darajada qisqa (${jwtRefreshSecret.length} belgi). Kamida 16 belgi bo'lishi shart.`);
  } else if (jwtRefreshSecret.length < 32) {
    warnings.push(`JWT_REFRESH_SECRET tavsiya etilgan 32 belgidan kamroq (${jwtRefreshSecret.length} belgi). Xavfsizlikni kuchaytirish uchun Render panelida 32+ belgili kalit o'rnatish tavsiya etiladi.`);
  }

  // 2. Database connection
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const hasDbParams = Boolean(process.env.DB_NAME && (process.env.DB_USER || process.env.DB_USERNAME));
  if (!hasDbUrl && !hasDbParams) {
    errors.push("Ma'lumotlar bazasi konfiguratsiyasi topilmadi. DATABASE_URL yoki DB_NAME/DB_USER kiritilishi shart.");
  }

  // 3. CORS Origins
  if (!process.env.CORS_ORIGINS && process.env.NODE_ENV === 'production') {
    if (process.env.CLIENT_URL) {
      warnings.push(`CORS_ORIGINS belgilanmagan, CLIENT_URL (${process.env.CLIENT_URL}) dan foydalanilmoqda.`);
    } else {
      warnings.push("Production muhitida CORS_ORIGINS kiritilmagan. Default domenlar va Vercel previewlar qabul qilinadi.");
    }
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
