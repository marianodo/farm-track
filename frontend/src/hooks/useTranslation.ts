import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

export const { i18n } = useTranslation();

export const changeLanguage = async (lang: string) => {
  await AsyncStorage.setItem('language', lang);
  i18n.changeLanguage(lang);
};
