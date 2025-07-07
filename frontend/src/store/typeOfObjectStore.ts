import { create } from 'zustand';
import useAuthStore, { axiosInstance } from './authStore';
import { cacheManager, CACHE_CONFIGS } from '../utils/cache';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Renombrar 'Object' a 'MyTypeOfObject' para evitar conflictos
export interface Variable {
  id: number;
  name: string;
}

export interface MyTypeOfObject {
  id: number;
  name: string;
  variables?: Variable[];
}

interface TypeOfObjectState {
  typeOfObjects: MyTypeOfObject[] | null;
  typeOfObjectById: MyTypeOfObject | null; // Cambiar a objeto en lugar de array
  typeOfObjectsLoading: boolean; // Cambiar de null a boolean
  createTypeOfObject: (object: MyTypeOfObject) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, object: Partial<MyTypeOfObject>) => Promise<void>;
  getAllTypeOfObjects: (forceRefresh?: boolean) => void;
  getTypeOfObjectById: (id: string | null) => Promise<void>;
  clearTypeOfObjects: () => void;
}

const useTypeOfObjectStore = create<TypeOfObjectState>((set) => ({
  typeOfObjects: null,
  typeOfObjectById: null,
  typeOfObjectsLoading: false, // Cambiar de null a false
  createTypeOfObject: async (object: MyTypeOfObject): Promise<void> => {
    set({ typeOfObjectsLoading: true });
    try {
      const userId = useAuthStore.getState().userId;
      await axiosInstance.post(`/type-of-objects/${userId}`, object);
      
      // Invalidar caché
      await cacheManager.remove(CACHE_CONFIGS.typeOfObjects, userId);
      
      useTypeOfObjectStore.getState().getAllTypeOfObjects(true);
      set({ typeOfObjects: null, typeOfObjectsLoading: false });
    } catch (error: any) {
      set({ typeOfObjectsLoading: false });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {

      } else {

      }
    }
  },
  onDelete: async (id: string) => {
    try {
      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.userId;
      
      await axiosInstance.delete(`/type-of-objects/${id}`);
      
      // Invalidar caché
      await cacheManager.remove(CACHE_CONFIGS.typeOfObjects, userId);
      
      useTypeOfObjectStore.getState().getAllTypeOfObjects(true);
    } catch (error: any) {
      set({ typeOfObjectsLoading: false });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error deleting object');
      }
    }
  },
  onUpdate: async (id: string, object: Partial<MyTypeOfObject>) => {
    set({ typeOfObjectsLoading: true });
    try {
      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.userId;
      
      await axiosInstance.patch(`/type-of-objects/${id}`, object);
      
      // Invalidar caché
      await cacheManager.remove(CACHE_CONFIGS.typeOfObjects, userId);
      
      useTypeOfObjectStore.getState().getAllTypeOfObjects(true);
      set({ typeOfObjects: null, typeOfObjectsLoading: false });
    } catch (error: any) {
      set({ typeOfObjectsLoading: false });

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error updating object');
      }
    }
  },
  getAllTypeOfObjects: async (forceRefresh: boolean = false) => {
    set({ typeOfObjectsLoading: true });
    try {
      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.userId;
      
      // Intentar obtener del caché primero
      if (!forceRefresh) {
        const cachedTypeOfObjects = await cacheManager.get(CACHE_CONFIGS.typeOfObjects, userId);
        if (cachedTypeOfObjects) {
          set({ typeOfObjects: cachedTypeOfObjects, typeOfObjectsLoading: false });
          return;
        }
      }
      
      const response = await axiosInstance.get(`/type-of-objects/byUser/${userId}`);
      const sortedData = response.data.sort(
        (a: MyTypeOfObject, b: MyTypeOfObject) => a.name.localeCompare(b.name)
      );
      const typeOfObjects = sortedData.length ? sortedData : [];
      
      // Guardar en caché
      await cacheManager.set(CACHE_CONFIGS.typeOfObjects, typeOfObjects, userId);
      
      set({ typeOfObjects, typeOfObjectsLoading: false });
    } catch (error) {
      set({ typeOfObjectsLoading: false });
    }
  },
  getTypeOfObjectById: async (id: string | null) => {
    set({ typeOfObjectsLoading: true });
    try {
      if (id) {
        const response = await axiosInstance.get(`/type-of-objects/${id}`);

        set({
          typeOfObjectById: response.data ? response.data : null, // Cambiado 'objectsByUserId' por 'typeOfObjectById'
          typeOfObjectsLoading: false,
        });
      }
    } catch (error) {
      set({ typeOfObjectsLoading: false });

    }
  },
  clearTypeOfObjects: () => {
    set({
      typeOfObjects: null,
      typeOfObjectById: null,
    });
  },
}));

export default useTypeOfObjectStore;
