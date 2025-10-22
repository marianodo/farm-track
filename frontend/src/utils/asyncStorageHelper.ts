import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Helper para usar AsyncStorage de manera segura en web y servidor
 */
export const safeAsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    // Solo usar AsyncStorage si no estamos en web/servidor
    if (Platform.OS !== 'web' && typeof window !== 'undefined') {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.warn(`Error accessing AsyncStorage for key "${key}":`, error);
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

  async setItem(key: string, value: string): Promise<void> {
    // Solo usar AsyncStorage si no estamos en web/servidor
    if (Platform.OS !== 'web' && typeof window !== 'undefined') {
      try {
        await AsyncStorage.setItem(key, value);
        return;
      } catch (error) {
        console.warn(`Error setting AsyncStorage for key "${key}":`, error);
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

  async removeItem(key: string): Promise<void> {
    // Solo usar AsyncStorage si no estamos en web/servidor
    if (Platform.OS !== 'web' && typeof window !== 'undefined') {
      try {
        await AsyncStorage.removeItem(key);
        return;
      } catch (error) {
        console.warn(`Error removing AsyncStorage for key "${key}":`, error);
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
  }
};
