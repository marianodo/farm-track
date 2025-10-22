import * as Localization from 'expo-localization';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './locales/en-US/translation.json';
import translationEs from './locales/es-ES/translation.json';
import { safeAsyncStorage } from '../utils/asyncStorageHelper';

//Este archivo es usado para almacenar el lenguaje que seleccione el usuario si asi sucede y hacer que persista. En el caso que no seleccione un idioma tomaria el por defecto de su dispositivo.

const resources = {
  'en-US': { translation: translationEn },
  'es-ES': { translation: translationEs },
};

const initI18n = async () => {
  let savedLanguage = await safeAsyncStorage.getItem('language');
  
  if (!savedLanguage) {
    savedLanguage = Localization.getLocales()[0].languageTag;
  }

  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng: savedLanguage,
    fallbackLng: 'es-ES',
    interpolation: {
      escapeValue: false,
    },
  });
};

// Solo inicializar si no estamos en contexto de servidor
if (typeof window !== 'undefined') {
  initI18n();
} else {
  // Inicialización básica para servidor/web
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'es-ES',
    fallbackLng: 'es-ES',
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
