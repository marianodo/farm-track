import { create } from 'zustand';
import useAuthStore, { axiosInstance } from './authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_CONFIGS, getCacheData, setCacheData, invalidateCachePattern } from '../utils/cache';

export interface Field {
  id: string;
  name: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  production_type?: string;
  breed?: string;
  installation?: string;
  number_of_animals?: number;
}

interface FieldWithMetadata extends Field {
  created_at: Date;
  updated_at: Date;
}

export interface FiledWithUserId extends Field {
  userId: string | null;
  autoConfig?: boolean;
}

interface FieldState {
  fields: Field[] | null;
  fieldsByUserId: Field[] | null;
  fieldId: string | null;
  fieldProductionType: string | null;
  fieldDetail: Field | null;
  fieldLoading: boolean;
  isFromCache: boolean;
  createField: (field: Omit<Field, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, field: Partial<Field>) => Promise<void>;
  getAllFields: () => void;
  getFieldsByUser: (id: string | null, forceRefresh?: boolean) => void;
  getFieldById: (id: string, forceRefresh?: boolean) => void;
  resetDetail: () => void;
  clearFields: () => void;
  setFieldProductionType: (type: string) => void;
  setFieldId: (id: string) => void;
}

const useFieldStore = create<FieldState>((set: any) => ({
  fields: null,
  fieldsByUserId: null,
  fieldId: null,
  fieldProductionType: null,
  fieldDetail: null,
  fieldLoading: false,
  isFromCache: false,
  createField: async (field: Omit<Field, 'id'>): Promise<void> => {
    set({ fieldLoading: true });
    try {
      await axiosInstance.post('/fields', field);
      const userId = useAuthStore.getState().userId;
      
      // Invalidar caché de campos
      await invalidateCachePattern(CACHE_CONFIGS.fields.key);
      
      // Si es bovino de leche o carne, también refrescar tipos de objetos y variables
      // ya que se crean automáticamente
      if (field.production_type === 'bovine_of_milk' || field.production_type === 'bovine_of_meat') {
        const { default: useTypeOfObjectStore } = await import('./typeOfObjectStore');
        const { default: useVariableStore } = await import('./variableStore');
        
        // Invalidar caché de tipos de objetos y variables
        await invalidateCachePattern(CACHE_CONFIGS.typeOfObjects.key);
        await invalidateCachePattern(CACHE_CONFIGS.variables.key);
        
        // Forzar refresh de los datos
        useTypeOfObjectStore.getState().getAllTypeOfObjects(true);
        useVariableStore.getState().getAllVariables(true);
      }
      
      set({ fieldLoading: false });
      useFieldStore.getState().getFieldsByUser(userId, true);
    } catch (error: any) {
      set({ fieldLoading: false });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error creating field');
      }
    }
  },
  onDelete: async (id: string) => {
    try {
      await axiosInstance.delete(`fields/${id}`);
      const userId = useAuthStore.getState().userId;
      
      // Invalidar caché de campos
      await invalidateCachePattern(CACHE_CONFIGS.fields.key);
      await invalidateCachePattern(CACHE_CONFIGS.fieldById.key);
      
      if (userId) {
        // Vuelve a obtener los campos del usuario para actualizar el estado
        const fields = useFieldStore.getState().fieldsByUserId;
        if (fields?.length === 0) set({ fieldsByUserId: null });
        useFieldStore.getState().getFieldsByUser(userId, true);
      }
    } catch (error) {
      throw error;
    }
  },
  onUpdate: async (id: string, field: Partial<Field>) => {
    set({ fieldLoading: true });

    try {
      set({ fieldLoading: true });
      if (!field) throw new Error('No hay datos para actualizar');
      await axiosInstance.patch(`/fields/${id}`, field);
      const userId = useAuthStore.getState().userId;
      
      // Invalidar caché de campos
      await invalidateCachePattern(CACHE_CONFIGS.fields.key);
      await invalidateCachePattern(`${CACHE_CONFIGS.fieldById.key}_${id}`);
      
      useFieldStore.getState().getFieldsByUser(userId, true);
      set({ fieldLoading: false });
    } catch (error: any) {
      set({ fieldLoading: false });

      // Maneja los errores
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error updating field');
      }
    }
  },
  getAllFields: () => {},
  getFieldsByUser: async (id: string | null, forceRefresh: boolean = false) => {
    set({ fieldLoading: true });
    try {
      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      if (user) {
        const userId = user?.userId ?? null;
        
        // Intentar obtener del caché primero
        if (!forceRefresh) {
          const cacheKey = `${CACHE_CONFIGS.fields.key}_${userId}`;
          const cachedFields = await getCacheData<Field[]>(cacheKey);
          if (cachedFields) {
            set({
              fieldsByUserId: cachedFields.length ? cachedFields : [],
              fieldLoading: false,
              isFromCache: true,
            });
            return;
          }
        }

        // Si no hay caché o se fuerza refresh, hacer llamada al backend
        const response = await axiosInstance.get(`/fields/byUserId/${userId}`);
        const fields = response.data.length ? response.data : [];
        
        // Guardar en caché
        const cacheKey = `${CACHE_CONFIGS.fields.key}_${userId}`;
        await setCacheData(cacheKey, fields, CACHE_CONFIGS.fields.ttl);
        
        set({
          fieldsByUserId: fields,
          fieldLoading: false,
          isFromCache: false,
        });
      }
    } catch (error) {
      set({ fieldLoading: false });
    }
  },
  getFieldById: async (id: string, forceRefresh: boolean = false) => {
    set({ fieldLoading: true });
    try {
      // Intentar obtener del caché primero
      if (!forceRefresh) {
        const cacheKey = `${CACHE_CONFIGS.fieldById.key}_${id}`;
        const cachedField = await getCacheData<Field>(cacheKey);
        if (cachedField) {
          set({
            fieldDetail: cachedField,
            fieldLoading: false,
            isFromCache: true,
          });
          return;
        }
      }

      // Si no hay caché o se fuerza refresh, hacer llamada al backend
      const response = await axiosInstance.get(`/fields/${id}`);
      
      // Guardar en caché
      const cacheKey = `${CACHE_CONFIGS.fieldById.key}_${id}`;
      await setCacheData(cacheKey, response.data, CACHE_CONFIGS.fieldById.ttl);
      
      set({
        fieldDetail: response.data,
        fieldLoading: false,
        isFromCache: false,
      });
    } catch (error) {
      set({ fieldLoading: false });
    }
  },
  setFieldProductionType: (type: string) => {
    set({ fieldProductionType: type });
  },
  resetDetail: () => {
    set({
      fieldDetail: null,
    });
  },

  clearFields: () => {
    set({
      fields: null,
      fieldsByUserId: null,
      fieldDetail: null,
    });
  },
  setFieldId: (id: string) => {
    set({ fieldId: id });
  },
}));

export default useFieldStore;
