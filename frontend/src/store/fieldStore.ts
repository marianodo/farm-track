import { create } from 'zustand';
import useAuthStore, { axiosInstance } from './authStore';

interface Field {
  id: string;
  name: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  production_type?: string;
  number_of_animals?: number;
}

interface FieldWithMetadata extends Field {
  created_at: Date;
  updated_at: Date;
}

export interface FiledWithUserId extends Field {
  userId: string | null;
}

interface FieldState {
  fields: FieldWithMetadata[] | null;
  fieldsByUserId: Field[] | null;
  fieldDetail: Field | null;
  fieldLoading: boolean;
  createField: (field: Omit<FiledWithUserId, 'id'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (field: Partial<Field>) => void;
  getAllFields: () => void;
  getFieldsByUser: (id: string | null) => void;
  getFieldById: (id: string) => void;
}

const useFieldStore = create<FieldState>((set: any) => ({
  fields: null,
  fieldsByUserId: null,
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
    }
  },
  onUpdate: (field: Partial<Field>) => {},
  getAllFields: () => {},
  getFieldsByUser: async (id: string | null) => {
    set({ fieldLoading: true });
    try {
      const response = await axiosInstance.get(`/fields/byUserId/${id}`);
      set({
        fieldsByUserId: response.data,
        fieldLoading: false,
      });
    } catch (error) {
      set({ fieldLoading: false });
      console.log('error getFieldByUser:', error);
    }
  },
  getFieldById: (id: string) => {},
}));

export default useFieldStore;
