import { create } from 'zustand';
import useAuthStore, { axiosInstance } from './authStore';
import useTypeOfObjectStore from './typeOfObjectStore';
import { cacheManager, CACHE_CONFIGS, getCacheData, setCacheData, invalidateCachePattern } from '../utils/cache';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TypeOfObject {
  id: number;
  name: string;
}

export interface Variable {
  id: number;
  name: string;
  type: string;
  defaultValue: any;
  type_of_objects?: TypeOfObject[];
}

export interface VariableWithIds
  extends Omit<Variable, 'id' | 'type_of_objects'> {
  type_of_objects_ids: number[];
}

interface VariableState {
  variables: Variable[] | null;
  variableById: Variable | null;
  variablesLoading: boolean;
  isFromCache: boolean;
  createVariable: (variable: VariableWithIds) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, variable: Partial<VariableWithIds>) => Promise<void>;
  getAllVariables: (forceRefresh?: boolean) => void;
  getVariableById: (id: number | null, forceRefresh?: boolean) => Promise<void>;
  getVariablesByObjectId: (id: number, forceRefresh?: boolean) => Promise<void>;
  resetDetail: () => void;
  clearVariables: () => void;
}

const useVariableStore = create<VariableState>((set) => ({
  variables: null,
  variableById: null,
  variablesLoading: false,
  isFromCache: false,
  createVariable: async (variable: VariableWithIds): Promise<void> => {
    set({ variablesLoading: true });
    try {
      const userId = useAuthStore.getState().userId;
      await axiosInstance.post(`/variables/${userId}`, variable);
      
      // Invalidar caché
      await invalidateCachePattern(CACHE_CONFIGS.variables.key);
      await invalidateCachePattern(CACHE_CONFIGS.typeOfObjects.key);
      
      useVariableStore.getState().getAllVariables(true);
      useTypeOfObjectStore.getState().getAllTypeOfObjects();
      set({ variablesLoading: false });
    } catch (error: any) {
      set({ variablesLoading: false });
      console.error('Error creating variable:', error);
    }
  },
  onDelete: async (id: number) => {
    set({ variablesLoading: true });
    try {
      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.userId;
      
      await axiosInstance.delete(`/variables/${id}`);
      
      // Invalidar caché
      await invalidateCachePattern(CACHE_CONFIGS.variables.key);
      await invalidateCachePattern(CACHE_CONFIGS.typeOfObjects.key);
      await invalidateCachePattern(`${CACHE_CONFIGS.variableById.key}_${id}`);
      
      useVariableStore.getState().getAllVariables(true);
      useTypeOfObjectStore.getState().getAllTypeOfObjects();
    } catch (error: any) {
      set({ variablesLoading: false });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error deleting variable');
      }
    }
  },
  onUpdate: async (id: number, variable: Partial<VariableWithIds>) => {
    set({ variablesLoading: true });
    try {
      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.userId;
      
      await axiosInstance.patch(`/variables/${id}`, variable);
      
      // Invalidar caché
      await invalidateCachePattern(CACHE_CONFIGS.variables.key);
      await invalidateCachePattern(CACHE_CONFIGS.typeOfObjects.key);
      await invalidateCachePattern(`${CACHE_CONFIGS.variableById.key}_${id}`);
      
      useVariableStore.getState().getAllVariables(true);
      useTypeOfObjectStore.getState().getAllTypeOfObjects();
      set({ variablesLoading: false });
    } catch (error: any) {
      set({ variablesLoading: false });
      console.error('Error updating variable:', error);
    }
  },
  getAllVariables: async (forceRefresh: boolean = false) => {
    set({ variablesLoading: true });
    try {
      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      if (user) {
        const userId = user?.userId;
        
        // Intentar obtener del caché primero
        if (!forceRefresh) {
          const cacheKey = `${CACHE_CONFIGS.variables.key}_${userId}`;
          const cachedVariables = await getCacheData<Variable[]>(cacheKey);
          if (cachedVariables) {
            set({ variables: cachedVariables, variablesLoading: false, isFromCache: true });
            return;
          }
        }

        // Si no hay caché o se fuerza refresh, hacer llamada al backend
        const response = await axiosInstance.get(`/variables/byUser/${userId}`);
        const variables = response.data.length ? response.data : [];
        
        // Guardar en caché
        const cacheKey = `${CACHE_CONFIGS.variables.key}_${userId}`;
        await setCacheData(cacheKey, variables, CACHE_CONFIGS.variables.ttl);
        
        set({ variables, variablesLoading: false, isFromCache: false });
      }
    } catch (error) {
      set({ variablesLoading: false });
      console.error('Error fetching variables:', error);
    }
  },
  getVariableById: async (id: number | null, forceRefresh: boolean = false) => {
    set({ variablesLoading: true });
    try {
      if (id) {
        // Intentar obtener del caché primero
        if (!forceRefresh) {
          const cacheKey = `${CACHE_CONFIGS.variableById.key}_${id}`;
          const cachedVariable = await getCacheData<Variable>(cacheKey);
          if (cachedVariable) {
            set({
              variableById: cachedVariable,
              variablesLoading: false,
              isFromCache: true,
            });
            return;
          }
        }

        // Si no hay caché o se fuerza refresh, hacer llamada al backend
        const response = await axiosInstance.get(`/variables/${id}`);
        
        // Guardar en caché
        const cacheKey = `${CACHE_CONFIGS.variableById.key}_${id}`;
        await setCacheData(cacheKey, response.data, CACHE_CONFIGS.variableById.ttl);
        
        set({
          variableById: response.data ? response.data : null,
          variablesLoading: false,
          isFromCache: false,
        });
      }
    } catch (error) {
      set({ variablesLoading: false });
      console.error('Error fetching variable by ID:', error);
    }
  },
  getVariablesByObjectId: async (id: number, forceRefresh: boolean = false) => {
    set({ variablesLoading: true });
    try {
      // Intentar obtener del caché primero
      if (!forceRefresh) {
        const cacheKey = `${CACHE_CONFIGS.variables.key}_object_${id}`;
        const cachedVariables = await getCacheData<Variable[]>(cacheKey);
        if (cachedVariables) {
          set({
            variables: cachedVariables,
            variablesLoading: false,
            isFromCache: true,
          });
          return;
        }
      }

      // Si no hay caché o se fuerza refresh, hacer llamada al backend
      const response = await axiosInstance.get(`/variables/byObjectId/${id}`);
      const variables = response.data.length ? response.data : [];
      
      // Guardar en caché
      const cacheKey = `${CACHE_CONFIGS.variables.key}_object_${id}`;
      await setCacheData(cacheKey, variables, CACHE_CONFIGS.variables.ttl);
      
      set({
        variables: variables,
        variablesLoading: false,
        isFromCache: false,
      });
    } catch (error) {
      set({ variablesLoading: false });
      console.error('Error fetching variables by object ID:', error);
    }
  },
  resetDetail: () => {
    set({
      variableById: null,
    });
  },
  clearVariables: () => {
    set({
      variables: null,
      variableById: null,
    });
  },
}));

export default useVariableStore;
