import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import uz from './locales/uz.json';
import en from './locales/en.json';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'uz';
  const saved = localStorage.getItem('dentuz_lang');
  if (saved && (saved === 'uz' || saved === 'en')) return saved;

  const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (browserLang.startsWith('en')) return 'en';
  return 'uz'; // Default language is Uzbek
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
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false // React safely handles XSS escaping
    }
  });

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dentuz_lang', lng);
    if (document.documentElement) {
      document.documentElement.lang = lng;
    }
  }
});

export default i18n;
