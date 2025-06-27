import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/es';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from '@/locales/en.json';
import es from '@/locales/es.json';

// Safe locale detection
const getLocale = () => {
  try {
    return Localization.locale?.split('-')[0] || 'en';
  } catch (error) {
    console.warn('Failed to get locale:', error);
    return 'en';
  }
};

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
};

// Make sure i18n is properly initialized
i18n
  .use(initReactI18next)
  .init({
    // your configuration
  });

export default i18n;