import * as Localization from 'expo-localization';
import { Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './locales/en-US/translation.json';
import translationEs from './locales/es-ES/translation.json';

//Este archivo es usado para almacenar el lenguaje que seleccione el usuario si asi sucede y hacer que persista. En el caso que no seleccione un idioma tomaria el por defecto de su dispositivo.

const resources = {
  'en-US': { translation: translationEn },
  'es-ES': { translation: translationEs },
};

const initI18n = async () => {
  let savedLanguage = 'es-ES'; // Idioma por defecto
  
  // Solo intentar acceder a AsyncStorage si estamos en una plataforma nativa
  if (Platform.OS !== 'web' && typeof window !== 'undefined') {
    try {
      savedLanguage = await AsyncStorage.getItem('language') || Localization.getLocales()[0].languageTag;
    } catch (error) {
      console.warn('Error loading language from AsyncStorage:', error);
      savedLanguage = Localization.getLocales()[0].languageTag;
    }
  } else {
    // Para web o durante build, usar el idioma del dispositivo
    try {
      savedLanguage = Localization.getLocales()[0].languageTag;
    } catch (error) {
      savedLanguage = 'es-ES'; // Fallback
    }
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

// Solo inicializar si no estamos en un contexto de build
if (typeof window !== 'undefined' || Platform.OS !== 'web') {
  initI18n();
} else {
  // Inicialización síncrona para build
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
