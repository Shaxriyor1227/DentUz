/**
 * Standalone Intl formatters for non-React contexts or utilities (UZ / EN only).
 */

export function formatUZS(amount, includeSuffix = true, lang = 'uz') {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return includeSuffix ? (lang === 'en' ? 'UZS 0' : "0 so'm") : '0';
  }
  const locale = lang === 'en' ? 'en-US' : 'uz-UZ';
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.round(Number(amount)));
  if (!includeSuffix) return formatted;
  return lang === 'en' ? `UZS ${formatted}` : `${formatted} so'm`;
}

export function formatUzbekDate(dateVal, lang = 'uz') {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const locale = lang === 'en' ? 'en-US' : 'uz-UZ';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  } catch {
    return String(dateVal);
  }
}

export function getInitials(name) {
  if (!name) return 'DU';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function formatFinanceDate(val, lang = 'uz') {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    const locale = lang === 'en' ? 'en-US' : 'uz-UZ';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);
  } catch {
    return String(val);
  }
}

export function formatPhone(phoneStr) {
  if (!phoneStr) return '—';
  const clean = phoneStr.replace(/\D/g, '');
  if (clean.length === 12 && clean.startsWith('998')) {
    return `+998 ${clean.slice(3, 5)} ${clean.slice(5, 8)} ${clean.slice(8, 10)} ${clean.slice(10, 12)}`;
  }
  if (clean.length === 9) {
    return `+998 ${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 7)} ${clean.slice(7, 9)}`;
  }
  return phoneStr;
}
