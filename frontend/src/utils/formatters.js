/**
 * Formats numbers into Uzbek Sum format with non-breaking spaces (e.g. 4 850 000 UZS)
 * @param {number} amount
 * @param {boolean} includeSuffix
 * @returns {string}
 */
export function formatUZS(amount, includeSuffix = true) {
  if (amount === undefined || amount === null) return '0 UZS';
  const parts = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  return includeSuffix ? `${parts}\u00A0UZS` : parts;
}

/**
 * Format a date object or ISO string to standard clinical display (e.g. 24-may, 2024)
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function formatUzbekDate(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  const months = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
  ];
  return `${d.getDate()}-${months[d.getMonth()]}, ${d.getFullYear()}`;
}

/**
 * Returns initials from full name (e.g. "Anvar Qosimov" -> "AQ")
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return 'DU';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Format date for financial transactions and invoice lists
 * @param {string|Date} val
 * @param {string} lang
 * @returns {string}
 */
export function formatFinanceDate(val, lang = 'uz') {
  if (!val) return '—';
  if (typeof val === 'string' && val.includes('-') && !val.includes('T')) return val;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const isEn = lang === 'en';
    const day = d.getDate();
    const monthsUz = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = (isEn ? monthsEn : monthsUz)[d.getMonth()];
    const year = d.getFullYear();
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${day}-${month}, ${year}${time !== '00:00' ? ` • ${time}` : ''}`;
  } catch {
    return val;
  }
}

