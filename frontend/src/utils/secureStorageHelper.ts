import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Helper para usar SecureStore de manera segura en web y servidor.
 *
 * expo-secure-store no tiene implementación web (su módulo nativo es un objeto
 * vacío), así que llamarlo desde el navegador lanza un TypeError. En web caemos
 * a localStorage: no es Keychain, pero es el mismo nivel de protección que usa
 * cualquier app web para sus tokens.
 */
export const safeSecureStore = {
  async getItemAsync(key: string): Promise<string | null> {
    // Solo usar SecureStore si no estamos en web/servidor
    if (Platform.OS !== 'web' && typeof window !== 'undefined') {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.warn(`Error accessing SecureStore for key "${key}":`, error);
        return null;
      }
    }

    // En web/servidor, usar localStorage si está disponible
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        console.warn(`Error accessing localStorage for key "${key}":`, error);
        return null;
      }
    }

    // Si no hay storage disponible, retornar null
    return null;
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    // Solo usar SecureStore si no estamos en web/servidor
    if (Platform.OS !== 'web' && typeof window !== 'undefined') {
      try {
        await SecureStore.setItemAsync(key, value);
        return;
      } catch (error) {
        console.warn(`Error setting SecureStore for key "${key}":`, error);
        return;
      }
    }

    // En web/servidor, usar localStorage si está disponible
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (error) {
        console.warn(`Error setting localStorage for key "${key}":`, error);
        return;
      }
    }
  },

  async deleteItemAsync(key: string): Promise<void> {
    // Solo usar SecureStore si no estamos en web/servidor
    if (Platform.OS !== 'web' && typeof window !== 'undefined') {
      try {
        await SecureStore.deleteItemAsync(key);
        return;
      } catch (error) {
        console.warn(`Error removing SecureStore for key "${key}":`, error);
        return;
      }
    }

    // En web/servidor, usar localStorage si está disponible
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch (error) {
        console.warn(`Error removing localStorage for key "${key}":`, error);
        return;
      }
    }
  },
};
