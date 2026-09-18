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
