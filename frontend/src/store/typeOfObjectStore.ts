import { create } from 'zustand';
import useAuthStore, { axiosInstance } from './authStore';
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
  getAllTypeOfObjects: () => void;
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
      useTypeOfObjectStore.getState().getAllTypeOfObjects();
      set({ typeOfObjects: null, typeOfObjectsLoading: false });
    } catch (error: any) {
      set({ typeOfObjectsLoading: false });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log(error.response.data.message);
      } else {
        console.log('Error creating object');
      }
    }
  },
  onDelete: async (id: string) => {
    try {
      await axiosInstance.delete(`/type-of-objects/${id}`);
      useTypeOfObjectStore.getState().getAllTypeOfObjects();
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
  onUpdate: async (id: string, object: Partial<MyTypeOfObject>) => {
    set({ typeOfObjectsLoading: true });
    try {
      await axiosInstance.patch(`/type-of-objects/${id}`, object);
      useTypeOfObjectStore.getState().getAllTypeOfObjects();

      set({ typeOfObjects: null, typeOfObjectsLoading: false });
    } catch (error: any) {
      set({ typeOfObjectsLoading: false });
      console.log('error onUpdate Object:', error);
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
  getAllTypeOfObjects: async () => {
    set({ typeOfObjectsLoading: true });
    try {
      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const response = await axiosInstance.get(
        `/type-of-objects/byUser/${user.userId}`
      );
      const sortedData = response.data.sort(
        (a: MyTypeOfObject, b: MyTypeOfObject) => a.name.localeCompare(b.name)
      );
      set({
        typeOfObjects: sortedData.length ? sortedData : [],
        typeOfObjectsLoading: false,
      });
    } catch (error) {
      set({ typeOfObjectsLoading: false });
      console.log('error getAllTypeOfObjects:', error);
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
      console.log('error gettypeOfObjectById:', error);
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
