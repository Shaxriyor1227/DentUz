import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import uz from './locales/uz.json';
import en from './locales/en.json';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en';

  // 1. URL parameter override (?lang=uz or ?lang=en)
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang === 'uz' || urlLang === 'en') return urlLang;
  } catch {}

  // 2. Active session manual choice
  try {
    const sessionLang = sessionStorage.getItem('dentuz_lang_active');
    if (sessionLang === 'uz' || sessionLang === 'en') return sessionLang;
  } catch {}

  // 3. Guaranteed pristine default: English (en) on every fresh site entry
  return 'en';
};

const initialLang = getInitialLanguage();

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      en: { translation: en }
    },
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React safely handles XSS escaping
    }
  });

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('dentuz_lang_active', lng);
      localStorage.setItem('dentuz_lang', lng);
      if (document.documentElement) {
        document.documentElement.lang = lng;
      }
    } catch {}
  }
});

export default i18n;
