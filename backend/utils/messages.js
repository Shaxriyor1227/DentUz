/**
 * Centralized i18n messages for backend responses (UZ and EN only).
 */
const MESSAGES = {
  // Auth
  AUTH_INVALID_CREDENTIALS: {
    uz: "Login yoki parol noto'g'ri",
    en: "Invalid username/email or password",
  },
  AUTH_ACCOUNT_LOCKED: {
    uz: "Juda ko'p xato urinishlar. Akkaunt 15 daqiqaga vaqtincha bloklandi.",
    en: "Too many failed attempts. Account locked for 15 minutes.",
  },
  AUTH_TOKEN_EXPIRED: {
    uz: "Sessiya muddati tugadi. Iltimos, qaytadan kiring.",
    en: "Session expired. Please log in again.",
  },
  AUTH_TOKEN_INVALID: {
    uz: "Avtorizatsiya tokeni yaroqsiz",
    en: "Invalid authorization token",
  },
  AUTH_UNAUTHORIZED: {
    uz: "Tizimga kirish talab qilinadi",
    en: "Authentication required",
  },
  AUTH_FORBIDDEN: {
    uz: "Ushbu amalni bajarish uchun ruxsatingiz yetarli emas",
    en: "You do not have permission to perform this action",
  },
  AUTH_PASSWORD_WEAK: {
    uz: "Parol juda zaif. Kamida 8 ta belgi, kamida bitta harf va bitta raqam bo'lishi shart.",
    en: "Password too weak. Must be at least 8 characters with at least one letter and one number.",
  },
  AUTH_CURRENT_PASSWORD_INCORRECT: {
    uz: "Joriy parol noto'g'ri kiritildi",
    en: "Current password is incorrect",
  },
  AUTH_PASSWORD_CHANGED: {
    uz: "Parol muvaffaqiyatli yangilandi",
    en: "Password successfully changed",
  },
  AUTH_TEMP_PASSWORD_ISSUED: {
    uz: "Xodim uchun vaqtinchalik parol berildi",
    en: "Temporary password issued for staff member",
  },

  // Resource errors
  PATIENT_NOT_FOUND: {
    uz: "Bemor topilmadi",
    en: "Patient not found",
  },
  CLINIC_NOT_FOUND: {
    uz: "Klinika topilmadi",
    en: "Clinic not found",
  },
  USER_NOT_FOUND: {
    uz: "Foydalanuvchi topilmadi",
    en: "User not found",
  },
  RECORD_NOT_FOUND: {
    uz: "Yozuv topilmadi",
    en: "Record not found",
  },
  FILE_NOT_FOUND: {
    uz: "Fayl mavjud emas yoki o'chirilgan, qayta yuklang",
    en: "File does not exist or has been deleted, please re-upload",
  },

  // Generic
  VALIDATION_ERROR: {
    uz: "Kiritilgan ma'lumotlarda xatolik bor",
    en: "Validation error in submitted data",
  },
  RATE_LIMIT_EXCEEDED: {
    uz: "Juda ko'p so'rov yuborildi. Iltimos, keyinroq qayta urinib ko'ring.",
    en: "Too many requests. Please try again later.",
  },
  INTERNAL_SERVER_ERROR: {
    uz: "Serverda ichki xatolik yuz berdi",
    en: "An internal server error occurred",
  },
  SUCCESS: {
    uz: "Muvaffaqiyatli bajarildi",
    en: "Operation completed successfully",
  },
};

function getLanguage(req) {
  const header = (req?.headers?.['accept-language'] || '').toLowerCase();
  if (header.includes('en')) return 'en';
  return 'uz'; // Default language is Uzbek
}

function getMessage(code, lang = 'uz') {
  const entry = MESSAGES[code];
  if (!entry) return code;
  return entry[lang] || entry.uz;
}

function buildResponse(req, { success = true, code = 'SUCCESS', message = null, data = null, meta = null }) {
  const lang = getLanguage(req);
  const finalMessage = message || getMessage(code, lang);

  const payload = {
    success,
    code,
    message: finalMessage,
  };

  if (data !== null && data !== undefined) {
    payload.data = data;
  }
  if (meta !== null && meta !== undefined) {
    payload.meta = meta;
  }

  return payload;
}

module.exports = {
  MESSAGES,
  getLanguage,
  getMessage,
  buildResponse,
};
