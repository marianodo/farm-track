import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheConfig {
  ttl: number;
  key: string;
}

// Configuraciones de caché por tipo de dato
export const CACHE_CONFIGS = {
  variables: { ttl: 10 * 60 * 1000, key: 'cache_variables' }, // 10 minutos
  typeOfObjects: { ttl: 10 * 60 * 1000, key: 'cache_type_of_objects' }, // 10 minutos
  pens: { ttl: 10 * 60 * 1000, key: 'cache_pens' }, // 10 minutos
  reports: { ttl: 5 * 60 * 1000, key: 'cache_reports' }, // 5 minutos
  reportById: { ttl: 5 * 60 * 1000, key: 'cache_report_by_id' }, // 5 minutos
  fields: { ttl: 15 * 60 * 1000, key: 'cache_fields' }, // 15 minutos
  penVariables: { ttl: 5 * 60 * 1000, key: 'cache_pen_variables' }, // 5 minutos
  measurementStats: { ttl: 3 * 60 * 1000, key: 'cache_measurement_stats' }, // 3 minutos
  fieldById: { ttl: 15 * 60 * 1000, key: 'cache_field_by_id' }, // 15 minutos
  penById: { ttl: 10 * 60 * 1000, key: 'cache_pen_by_id' }, // 10 minutos
  variableById: { ttl: 10 * 60 * 1000, key: 'cache_variable_by_id' }, // 10 minutos
  typeOfObjectById: { ttl: 10 * 60 * 1000, key: 'cache_type_of_object_by_id' }, // 10 minutos
  measurementStatsByUser: { ttl: 3 * 60 * 1000, key: 'cache_measurement_stats_user' }, // 3 minutos
  measurementStatsByField: { ttl: 3 * 60 * 1000, key: 'cache_measurement_stats_field' }, // 3 minutos
  measurementStatsByReport: { ttl: 3 * 60 * 1000, key: 'cache_measurement_stats_report' }, // 3 minutos
} as const;

class CacheManager {
  // Guardar datos en caché
  async set<T>(config: CacheConfig, data: T, userId?: string): Promise<void> {
    try {
      if (!config || !config.key) {
        console.error('Invalid cache config:', config);
        return;
      }
      
      const key = userId ? `${config.key}_${userId}` : config.key;
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: config.ttl,
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  // Obtener datos del caché
  async get<T>(config: CacheConfig, userId?: string): Promise<T | null> {
    try {
      if (!config || !config.key) {
        console.error('Invalid cache config:', config);
        return null;
      }
      
      const key = userId ? `${config.key}_${userId}` : config.key;
      const cached = await AsyncStorage.getItem(key);
      
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();
      
      // Verificar si el caché ha expirado
      if (now - cacheItem.timestamp > cacheItem.ttl) {
        await this.remove(config, userId);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  // Remover datos del caché
  async remove(config: CacheConfig, userId?: string): Promise<void> {
    try {
      if (!config || !config.key) {
        console.error('Invalid cache config:', config);
        return;
      }
      
      const key = userId ? `${config.key}_${userId}` : config.key;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  }

  // Invalidar caché por patrón
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const keysToRemove = keys.filter(key => key.includes(pattern));
      await AsyncStorage.multiRemove(keysToRemove);
    } catch (error) {
      console.error('Error invalidating cache pattern:', error);
    }
  }

  // Limpiar todo el caché
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }

  // Obtener información del caché
  async getCacheInfo(): Promise<{ key: string; size: number; age: number }[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      const info = [];

      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const cacheItem = JSON.parse(cached);
          info.push({
            key,
            size: cached.length,
            age: Date.now() - cacheItem.timestamp,
          });
        }
      }

      return info;
    } catch (error) {
      console.error('Error getting cache info:', error);
      return [];
    }
  }
}

export const cacheManager = new CacheManager();

// Hook personalizado para usar caché
export const useCache = () => {
  const setCache = async <T>(config: CacheConfig, data: T, userId?: string) => {
    await cacheManager.set(config, data, userId);
  };

  const getCache = async <T>(config: CacheConfig, userId?: string): Promise<T | null> => {
    return await cacheManager.get<T>(config, userId);
  };

  const removeCache = async (config: CacheConfig, userId?: string) => {
    await cacheManager.remove(config, userId);
  };

  const invalidateCache = async (pattern: string) => {
    await cacheManager.invalidatePattern(pattern);
  };

  return {
    setCache,
    getCache,
    removeCache,
    invalidateCache,
    clearAllCache: () => cacheManager.clearAll(),
    getCacheInfo: () => cacheManager.getCacheInfo(),
  };
};

// Función helper para crear claves de caché únicas
export const createCacheKey = (baseKey: string, ...params: (string | number)[]): string => {
  const validParams = params.filter(p => p !== undefined && p !== null);
  return `${baseKey}_${validParams.join('_')}`;
};

// Funciones helper simplificadas para el store
export const setCacheData = async <T>(key: string, data: T, ttl: number): Promise<void> => {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error setting cache data:', error);
  }
};

export const getCacheData = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const cacheItem: CacheItem<T> = JSON.parse(cached);
    const now = Date.now();
    
    // Verificar si el caché ha expirado
    if (now - cacheItem.timestamp > cacheItem.ttl) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.error('Error getting cache data:', error);
    return null;
  }
};

export const invalidateCachePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const keysToRemove = keys.filter(key => key.includes(pattern));
    await AsyncStorage.multiRemove(keysToRemove);
  } catch (error) {
    console.error('Error invalidating cache pattern:', error);
  }
};

// Función para verificar conectividad y decidir si usar caché
export const shouldUseCache = (forceRefresh: boolean = false): boolean => {
  return !forceRefresh; // Por ahora simple, se puede expandir con conectividad
}; 