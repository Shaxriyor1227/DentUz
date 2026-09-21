import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import uz from './locales/uz.json';
import ru from './locales/ru.json';
import en from './locales/en.json';

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('dentuz_lang') || 'uz' : 'uz';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      ru: { translation: ru },
      en: { translation: en }
    },
    lng: savedLanguage,
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false // React handles XSS escaping safely
    }
  });

export default i18n;
