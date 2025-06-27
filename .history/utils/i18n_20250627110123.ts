import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/es';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from '../locales/en.json';
import es from '../locales/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

const initI18n = async () => {
  try {
    const locales = getLocales();
    const languageTag = locales[0]?.languageTag || 'es';
    const language = languageTag.startsWith('es') ? 'es' : 'en';

    await i18n.use(initReactI18next).init({
      resources,
      lng: language,
      fallbackLng: 'es',
      compatibilityJSON: 'v3',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false, // Add this to prevent suspense issues
      },
    });
  } catch (error) {
    console.error('i18n initialization failed:', error);
    // Fallback initialization
    await i18n.use(initReactI18next).init({
      resources,
      lng: 'es',
      fallbackLng: 'es',
      compatibilityJSON: 'v3',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
  }
};

export { initI18n };
export default i18n;