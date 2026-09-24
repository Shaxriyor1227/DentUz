import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import uz from './locales/uz.json';
import en from './locales/en.json';

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('dentuz_lang') || 'en' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      en: { translation: en }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React handles XSS escaping safely
    }
  });

export default i18n;
