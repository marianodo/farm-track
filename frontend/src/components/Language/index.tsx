import React, { Fragment, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';

// const flags = [
//   { component: Brasil, lang: 'pt-BR', name: 'Brasil' },
//   { component: USA, lang: 'en-US', name: 'USA' },
//   { component: Russian, lang: 'ru-RU', name: 'Russia' },
//   { component: China, lang: 'zh-CN', name: 'China' },
//   { component: Spain, lang: 'es-ES', name: 'Spain' },
//   { component: Italy, lang: 'it-IT', name: 'Italy' },
//   { component: India, lang: 'hi-IN', name: 'India' },
// ];

export function Language() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        i18n.changeLanguage(savedLanguage);
      }
    };
    loadLanguage();
  }, [i18n]);

  const changeLanguage = async (lang: string) => {
    await AsyncStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
  };

  return (
    <Fragment>
      <TouchableOpacity
        onPress={() => {
          changeLanguage('en-US'), console.log(currentLanguage);
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>EN</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          changeLanguage('es-ES'), console.log(currentLanguage);
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>ES</Text>
      </TouchableOpacity>
    </Fragment>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     justifyContent: 'center',
//   },
//   flagsContainer: {
//     flexDirection: 'row',
//     paddingVertical: 10,
//   },
//   flag: {
//     paddingHorizontal: 10,
//   },
//   activeFlag: {
//     transform: [{ scale: 1.2 }],
//   },
//   inactiveFlag: {
//     opacity: 0.5,
//   },
//   text: {
//     fontSize: 22,
//     lineHeight: 32,
//     marginTop: -6,
//   },
// });
const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 20, // Margen superior relativo a la altura de la pantalla
    marginBottom: 20, // Margen inferior relativo a la altura de la pantalla
    alignItems: 'center',
    backgroundColor: '#486732',
    width: 40, // Ancho relativo al ancho de la pantalla
    height: 40, // Altura relativa a la altura de la pantalla
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
