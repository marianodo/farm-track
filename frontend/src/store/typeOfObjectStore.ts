import { create } from 'zustand';
import useAuthStore, { axiosInstance } from './authStore';

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
}

const useTypeOfObjectStore = create<TypeOfObjectState>((set) => ({
  typeOfObjects: null,
  typeOfObjectById: null,
  typeOfObjectsLoading: false, // Cambiar de null a false
  createTypeOfObject: async (object: MyTypeOfObject): Promise<void> => {
    set({ typeOfObjectsLoading: true });
    try {
      await axiosInstance.post('/objects', object);
      const userId = useAuthStore.getState().userId;
      set({ typeOfObjectsLoading: false });
      if (userId) {
        useTypeOfObjectStore.getState().getTypeOfObjectById(userId);
      }
    } catch (error: any) {
      set({ typeOfObjectsLoading: false });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error creating object');
      }
    }
  },
  onDelete: async (id: string) => {
    try {
      await axiosInstance.delete(`/objects/${id}`);
      const userId = useAuthStore.getState().userId;
      if (userId) {
        const objects = useTypeOfObjectStore.getState().typeOfObjects;
        if (objects?.length === 0) set({ typeOfObjects: null });
        useTypeOfObjectStore.getState().getTypeOfObjectById(userId);
      }
    } catch (error) {
      console.log('error onDelete Object', error);
    }
  },
  onUpdate: async (id: string, object: Partial<MyTypeOfObject>) => {
    set({ typeOfObjectsLoading: true });
    try {
      await axiosInstance.patch(`/objects/${id}`, object);
      const userId = useAuthStore.getState().userId;
      if (userId) {
        useTypeOfObjectStore.getState().getTypeOfObjectById(userId);
      }
      set({ typeOfObjectsLoading: false });
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
      const response = await axiosInstance.get('/type-of-objects');
      set({
        typeOfObjects: response.data.length ? response.data : [],
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
        const response = await axiosInstance.get(`/objects/${id}`);
        set({
          typeOfObjectById: response.data.length ? response.data : null, // Cambiado 'objectsByUserId' por 'typeOfObjectById'
          typeOfObjectsLoading: false,
        });
      }
    } catch (error) {
      set({ typeOfObjectsLoading: false });
      console.log('error gettypeOfObjectById:', error);
    }
  },
}));

export default useTypeOfObjectStore;