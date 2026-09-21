/**
 * DentUz Clinical & Financial Validation & Masking Utilities
 * Compliant with Uzbekistan Healthcare and National ID Standards
 */

/**
 * Format raw phone input into +998 (XX) XXX-XX-XX mask
 */
export function formatUzbekPhone(value) {
  if (!value) return '';
  // Clean all non-digits
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  }

  // Cap at 9 local digits
  digits = digits.slice(0, 9);

  let formatted = '+998';
  if (digits.length > 0) formatted += ` (${digits.slice(0, 2)}`;
  if (digits.length >= 2) formatted += `) ${digits.slice(2, 5)}`;
  if (digits.length >= 5) formatted += `-${digits.slice(5, 7)}`;
  if (digits.length >= 7) formatted += `-${digits.slice(7, 9)}`;

  return formatted;
}

/**
 * Validate standard 9-digit local phone or 12-digit full phone
 */
export function isValidUzbekPhone(phone) {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('998');
}

/**
 * Validate JSHSHIR / PINFL (14 digits)
 */
export function isValidPINFL(pinfl) {
  if (!pinfl) return false;
  const cleaned = pinfl.toString().trim();
  return /^\d{14}$/.test(cleaned);
}

/**
 * Validate Passport / ID Card series (e.g. AA1234567, FA1234567)
 */
export function isValidPassport(passport) {
  if (!passport) return false;
  const cleaned = passport.toString().trim().toUpperCase();
  return /^[A-Z]{2}\d{7}$/.test(cleaned);
}

/**
 * Calculate age in years from birthdate string (YYYY-MM-DD or DD.MM.YYYY)
 */
export function calculateAge(birthdateStr) {
  if (!birthdateStr) return null;

  let birthDate;
  if (birthdateStr.includes('.')) {
    const [d, m, y] = birthdateStr.split('.');
    birthDate = new Date(`${y}-${m}-${d}`);
  } else {
    birthDate = new Date(birthdateStr);
  }

  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age : 0;
}

/**
 * Format number into clean currency format (e.g., 850 000 so'm)
 */
export function formatCurrency(amount, currency = "so'm") {
  const num = Number(amount) || 0;
  return `${num.toLocaleString('uz-UZ').replace(/,/g, ' ')} ${currency}`;
}

export default {
  formatUzbekPhone,
  isValidUzbekPhone,
  isValidPINFL,
  isValidPassport,
  calculateAge,
  formatCurrency
};
