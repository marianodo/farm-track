import { create } from 'zustand';
import { axiosInstance } from './authStore';
import MeasurementStats from './interface/measurementStats.interface';
import useFieldStore from './fieldStore';
import { CACHE_CONFIGS, getCacheData, setCacheData } from '../utils/cache';
import NetInfo from '@react-native-community/netinfo';

interface MeasurementStatsStore {
  stats: MeasurementStats | null;
  statsByUser: MeasurementStats | null;
  statsByField: MeasurementStats | null;
  statsByReport: MeasurementStats | null;
  statsLoading: boolean;
  isFromCache: boolean;
  getStats: (totalMeasurement?: boolean, byObject?: boolean, byPen?: boolean, byVariable?: boolean, byVariableByPen?: boolean, forceRefresh?: boolean) => Promise<void>;
  getStatsByUser: (userId: string, totalMeasurement?: boolean, byObject?: boolean, byPen?: boolean, byVariable?: boolean, byVariableByPen?: boolean, forceRefresh?: boolean) => Promise<void>;
  getStatsByField: (fieldId: string, totalMeasurement?: boolean, byObject?: boolean, byPen?: boolean, byVariable?: boolean, byVariableByPen?: boolean, byReport?: boolean, forceRefresh?: boolean) => Promise<void>;
  getStatsByReport: (reportId: string, totalMeasurement?: boolean, byObject?: boolean, byPen?: boolean, byVariable?: boolean, byVariableByPen?: boolean, forceRefresh?: boolean) => Promise<void>;
  resetStatsByUser: () => void;
  resetStatsByField: () => void;
  resetStats: () => void;
}

const useMeasurementStatsStore = create<MeasurementStatsStore>((set) => ({
  stats: null,
  statsLoading: false,
  statsByUser: null,
  statsByField: null,
  statsByReport: null,
  isFromCache: false,
  getStats: async (totalMeasurement, byObject, byPen, byVariable, byVariableByPen, forceRefresh = false) => {
    set({ statsLoading: true });
    try {
      // Crear clave de caché basada en los parámetros
      const cacheKey = `${CACHE_CONFIGS.measurementStats.key}_${totalMeasurement}_${byObject}_${byPen}_${byVariable}_${byVariableByPen}`;
      
      // Intentar obtener del caché primero
      if (!forceRefresh) {
        const cachedStats = await getCacheData<MeasurementStats>(cacheKey);
        if (cachedStats) {
          set({ stats: cachedStats, statsLoading: false, isFromCache: true });
          return;
        }
      }

      // Si no hay caché o se fuerza refresh, hacer llamada al backend
      const response = await axiosInstance.get('/measurements/stats', {
        params: {
          totalMeasurement,
          byObject,
          byPen,
          byVariable,
          byVariableByPen
        }
      });
      
      // Guardar en caché
      await setCacheData(cacheKey, response.data, CACHE_CONFIGS.measurementStats.ttl);
      
      set({ stats: response.data, statsLoading: false, isFromCache: false });
    } catch (error) {
      set({ statsLoading: false });
      console.error('Error fetching stats:', error);
    }
  },
  getStatsByUser: async (userId: string, totalMeasurement, byObject, byPen, byVariable, byVariableByPen, forceRefresh = false) => {
    set({ statsLoading: true });
    try {
      // Crear clave de caché basada en los parámetros
      const cacheKey = `${CACHE_CONFIGS.measurementStatsByUser.key}_${userId}_${totalMeasurement}_${byObject}_${byPen}_${byVariable}_${byVariableByPen}`;
      
      // Intentar obtener del caché primero
      if (!forceRefresh) {
        const cachedStats = await getCacheData<MeasurementStats>(cacheKey);
        if (cachedStats) {
          set({ statsByUser: cachedStats, statsLoading: false, isFromCache: true });
          return;
        }
      }

      // Si no hay caché o se fuerza refresh, hacer llamada al backend
      const response = await axiosInstance.get(`/measurements/stats/ByUserId/${userId}`, {
        params: {
          totalMeasurement,
          byObject,
          byPen,
          byVariable,
          byVariableByPen
        }
      });
      
      // Guardar en caché
      await setCacheData(cacheKey, response.data, CACHE_CONFIGS.measurementStatsByUser.ttl);
      
      set({ statsByUser: response.data, statsLoading: false, isFromCache: false });
    } catch (error) {
      set({ statsLoading: false });
      console.error('Error fetching stats by user:', error);
    }
  },
  getStatsByField: async (fieldId: string, totalMeasurement, byObject, byPen, byVariable, byVariableByPen, byReport, forceRefresh = false) => {
    set({ statsLoading: true });
    try {
      // Crear clave de caché basada en los parámetros
      const cacheKey = `${CACHE_CONFIGS.measurementStatsByField.key}_${fieldId}_${totalMeasurement}_${byObject}_${byPen}_${byVariable}_${byVariableByPen}_${byReport}`;
      
      // Intentar obtener del caché primero
      if (!forceRefresh) {
        const cachedStats = await getCacheData<MeasurementStats>(cacheKey);
        if (cachedStats) {
          set({ statsByField: cachedStats, statsLoading: false, isFromCache: true });
          return;
        }
      }

      // Si no hay caché o se fuerza refresh, hacer llamada al backend
      const response = await axiosInstance.get(`/measurements/stats/byFieldId/${fieldId}`, {
        params: {
          totalMeasurement,
          byObject,
          byPen,
          byVariable,
          byVariableByPen,
          byReport
        }
      });
      
      // Guardar en caché
      await setCacheData(cacheKey, response.data, CACHE_CONFIGS.measurementStatsByField.ttl);
      
      set({ statsByField: response.data, statsLoading: false, isFromCache: false });
    } catch (error) {
      set({ statsLoading: false });
      
      // Verificar si hay conexión a internet
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('📴 Offline: Cannot fetch stats by field');
        // En modo offline, usar estadísticas vacías o del caché
        const cachedStats = await getCacheData<MeasurementStats>(cacheKey);
        if (cachedStats) {
          set({ statsByField: cachedStats, isFromCache: true });
        }
        return;
      }
      
      // Si hay conexión, loggear el error completo
      console.error('Error fetching stats by field:', error?.message || error);
      if (error?.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  },
  getStatsByReport: async (reportId: string, totalMeasurement, byObject, byPen, byVariable, byVariableByPen, forceRefresh = false) => {
    set({ statsLoading: true });
    try {
      const fieldId = useFieldStore.getState().fieldId;
      
      // Crear clave de caché basada en los parámetros
      const cacheKey = `${CACHE_CONFIGS.measurementStatsByReport.key}_${reportId}_${fieldId}_${totalMeasurement}_${byObject}_${byPen}_${byVariable}_${byVariableByPen}`;
      
      // Intentar obtener del caché primero
      if (!forceRefresh) {
        const cachedStats = await getCacheData<MeasurementStats>(cacheKey);
        if (cachedStats) {
          set({ statsByReport: cachedStats, statsLoading: false, isFromCache: true });
          return;
        }
      }

      // Si no hay caché o se fuerza refresh, hacer llamada al backend
      const response = await axiosInstance.get(`/measurements/stats/byReportId/${reportId}`, {
        params: {
          totalMeasurement,
          byObject,
          byPen,
          byVariable,
          byVariableByPen,
          byField: fieldId
        }
      });
      
      // Guardar en caché
      await setCacheData(cacheKey, response.data, CACHE_CONFIGS.measurementStatsByReport.ttl);
      
      set({ statsByReport: response.data, statsLoading: false, isFromCache: false });
    } catch (error) {
      set({ statsLoading: false });
      
      // Verificar si hay conexión a internet
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('📴 Offline: Cannot fetch stats by report');
        // En modo offline, usar estadísticas del caché
        const fieldId = useFieldStore.getState().fieldId;
        const cacheKey = `${CACHE_CONFIGS.measurementStatsByReport.key}_${reportId}_${fieldId}_${totalMeasurement}_${byObject}_${byPen}_${byVariable}_${byVariableByPen}`;
        const cachedStats = await getCacheData<MeasurementStats>(cacheKey);
        if (cachedStats) {
          set({ statsByReport: cachedStats, isFromCache: true });
        }
        return;
      }
      
      // Si hay conexión, loggear el error completo
      console.error('Error fetching stats by report:', error?.message || error);
      if (error?.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  },
  resetStats: () => set({ stats: null }),
  resetStatsByUser: () => set({ statsByUser: null }),
  resetStatsByField: () => set({ statsByField: null })

}));

export default useMeasurementStatsStore;
