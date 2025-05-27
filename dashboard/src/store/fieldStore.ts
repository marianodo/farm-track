import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';


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
  getFieldsByUser: (id?: string | null) => void;
  getFieldById: (id: string) => void;
  resetDetail: () => void;
  clearFields: () => void;
  setFieldProductionType: (type: string) => void;
  categoricalMeasurementsByFieldId: any[] | null;
  getCategoricalMeasurementsByFieldId: (fieldId: string) => Promise<any>;
  numericalMeasurementsByFieldId: any[] | null;
  getNumericalMeasurementsByFieldId: (fieldId: string) => Promise<any>;
}

const useFieldStore = create<FieldState>((set: any) => ({
  fields: null,
  fieldsByUserId: null,
  fieldId: null,
  fieldProductionType: null,
  fieldDetail: null,
  fieldLoading: false,
  categoricalMeasurementsByFieldId: null,
  numericalMeasurementsByFieldId: null,
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
    console.log(id);
  },
  onUpdate: async (id: string, field: Partial<Field>) => {
    console.log(id, field);
  },
  getAllFields: () => {},
  getCategoricalMeasurementsByFieldId: async (fieldId: string) => {
    set({ fieldLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/fields/dataset/categorical/${fieldId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      set({ categoricalMeasurementsByFieldId: response.data, fieldLoading: false });
      return response.data;
    } catch (error) {
      set({ fieldLoading: false });
      console.error('Error fetching categorical measurements:', error);
      throw error;
    }
  },
  getNumericalMeasurementsByFieldId: async (fieldId: string) => {
    set({ fieldLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/fields/dataset/numerical/${fieldId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      set({ numericalMeasurementsByFieldId: response.data, fieldLoading: false });
      return response.data;
    } catch (error) {
      set({ fieldLoading: false });
      console.error('Error fetching numerical measurements:', error);
      throw error;
    }
  },
  getFieldsByUser: async (id?: string | null) => {
    set({ fieldLoading: true });
    try {
      const userId = useAuthStore.getState()?.user?.userId
      console.log(userId)
      if (id) {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/fields/byUserId/${id ?? null}`,
            {
              headers: {
                Authorization: `Bearer ${useAuthStore.getState().token}`
              }
            }
        );
        set({
          fieldsByUserId: response.data.length ? response.data : [],
          fieldLoading: false,
        });
        return response.data
      }
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/fields/byUserId/${userId ?? null}`,
            {
              headers: {
                Authorization: `Bearer ${useAuthStore.getState().token}`
              }
            }
        );
        set({
          fieldsByUserId: response.data.length ? response.data : [],
          fieldLoading: false,
        });
        return response.data
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
