import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Custom hook providing Intl-based formatting according to the active language (uz-UZ or en-US).
 * Completely eliminates hardcoded 'ru-RU' or custom manual date/currency parsers.
 */
export function useFormatters() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'uz';
  const locale = lang === 'en' ? 'en-US' : 'uz-UZ';

  /**
   * Currency formatting in Uzbek Sum (UZS)
   * UZ: 1 250 000 so'm
   * EN: UZS 1,250,000
   */
  const formatCurrency = useCallback((amount, includeUnit = true) => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return includeUnit ? (lang === 'en' ? 'UZS 0' : "0 so'm") : '0';
    }

    const num = Math.round(Number(amount));
    const formatted = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(num);

    if (!includeUnit) return formatted;
    return lang === 'en' ? `UZS ${formatted}` : `${formatted} so'm`;
  }, [lang, locale]);

  /**
   * Generic number formatting (e.g. 1 000 in UZ, 1,000 in EN)
   */
  const formatNumber = useCallback((num, options = {}) => {
    if (num === undefined || num === null || isNaN(Number(num))) return '0';
    return new Intl.NumberFormat(locale, options).format(Number(num));
  }, [locale]);

  /**
   * Clinical standard date formatting (e.g. 24-may, 2024 / May 24, 2024)
   */
  const formatDate = useCallback((dateVal, options = {}) => {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);

      const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
      };

      return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
    } catch {
      return String(dateVal);
    }
  }, [locale]);

  /**
   * Date and Time formatting
   */
  const formatDateTime = useCallback((dateVal, options = {}) => {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);

      const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        ...options,
      };

      return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
    } catch {
      return String(dateVal);
    }
  }, [locale]);

  /**
   * Phone number formatting (+998 90 123 45 67)
   */
  const formatPhone = useCallback((phoneStr) => {
    if (!phoneStr) return '—';
    const clean = phoneStr.replace(/\D/g, '');
    if (clean.length === 12 && clean.startsWith('998')) {
      return `+998 ${clean.slice(3, 5)} ${clean.slice(5, 8)} ${clean.slice(8, 10)} ${clean.slice(10, 12)}`;
    }
    if (clean.length === 9) {
      return `+998 ${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 7)} ${clean.slice(7, 9)}`;
    }
    return phoneStr;
  }, []);

  return {
    lang,
    locale,
    formatCurrency,
    formatNumber,
    formatDate,
    formatDateTime,
    formatPhone,
  };
}

export default useFormatters;
