import { create } from 'zustand';
import useAuthStore, { axiosInstance } from './authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  fields: FieldWithMetadata[] | null;
  fieldsByUserId: Field[] | null;
  fieldId: string | null;
  setFieldId: (id: string) => void;
  fieldDetail: Field | null;
  fieldProductionType: string | null;
  fieldLoading: boolean;
  createField: (field: Omit<FiledWithUserId, 'id'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: Partial<Field>) => void;
  getAllFields: () => void;
  getFieldsByUser: (id: string | null) => void;
  getFieldById: (id: string) => void;
  resetDetail: () => void;
  clearFields: () => void;
  setFieldProductionType: (type: string) => void;
}

const useFieldStore = create<FieldState>((set: any) => ({
  fields: null,
  fieldsByUserId: null,
  fieldId: null,
  fieldProductionType: null,
  fieldDetail: null,
  fieldLoading: false,
  createField: async (field: Omit<Field, 'id'>): Promise<void> => {
    set({ fieldLoading: true });
    try {
      await axiosInstance.post('/fields', field);
      const userId = useAuthStore.getState().userId;
      set({ fieldLoading: false });
      useFieldStore.getState().getFieldsByUser(userId);
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
      if (userId) {
        // Vuelve a obtener los campos del usuario para actualizar el estado
        const fields = useFieldStore.getState().fieldsByUserId;
        if (fields?.length === 0) set({ fieldsByUserId: null });
        useFieldStore.getState().getFieldsByUser(userId);
      }
    } catch (error) {
      console.log('error onDelete Field', error);
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
      useFieldStore.getState().getFieldsByUser(userId);
      set({ fieldLoading: false });
    } catch (error: any) {
      set({ fieldLoading: false });

      // Maneja los errores
      console.log('error onUpdate Field:', error);
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
  getFieldsByUser: async (id: string | null) => {
    set({ fieldLoading: true });
    try {
      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      if (user) {
        const response = await axiosInstance.get(
          `/fields/byUserId/${user?.userId ?? null}`
        );
        set({
          fieldsByUserId: response.data.length ? response.data : [],
          fieldLoading: false,
        });
      }
    } catch (error) {
      set({ fieldLoading: false });
      console.log('error getFieldByUser:', error);
    }
  },
  getFieldById: async (id: string) => {
    set({ fieldLoading: true });
    try {
      const response = await axiosInstance.get(`/fields/${id}`);
      set({
        fieldDetail: response.data,
        fieldLoading: false,
      });
    } catch (error) {
      set({ fieldLoading: false });
      console.log('error getFieldById:', error);
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
