import { en } from './en';
import { es } from './es';

export const translations = {
  en,
  es
};

export type Language = 'en' | 'es';
export type TranslationKey = keyof typeof en;
