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
  fieldError: string | null;
  createField: (field: Omit<FiledWithUserId, 'id'>) => Promise<Field | undefined>;
  updateField: (id: string, field: Partial<Field>) => Promise<Field | undefined>;
  deleteField: (id: string) => Promise<boolean>;
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

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
});

const useFieldStore = create<FieldState>((set: any) => ({
  fields: null,
  fieldsByUserId: null,
  fieldId: null,
  fieldProductionType: null,
  fieldDetail: null,
  fieldLoading: false,
  fieldError: null,
  categoricalMeasurementsByFieldId: null,
  numericalMeasurementsByFieldId: null,
  createField: async (field: Omit<FiledWithUserId, 'id'>) => {
    set({ fieldLoading: true, fieldError: null });
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/fields`,
        field,
        authHeaders(),
      );
      const userId = useAuthStore.getState()?.user?.id || useAuthStore.getState()?.user?.userId;
      set({ fieldLoading: false });
      await useFieldStore.getState().getFieldsByUser(userId);
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Error al crear el campo';
      set({ fieldLoading: false, fieldError: message });
      throw new Error(message);
    }
  },
  updateField: async (id: string, field: Partial<Field>) => {
    set({ fieldLoading: true, fieldError: null });
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/fields/${id}`,
        field,
        authHeaders(),
      );
      set({ fieldLoading: false });
      const userId = useAuthStore.getState()?.user?.id || useAuthStore.getState()?.user?.userId;
      await useFieldStore.getState().getFieldsByUser(userId);
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Error al actualizar el campo';
      set({ fieldLoading: false, fieldError: message });
      return undefined;
    }
  },
  deleteField: async (id: string) => {
    set({ fieldLoading: true, fieldError: null });
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/fields/${id}`, authHeaders());
      set({ fieldLoading: false });
      const userId = useAuthStore.getState()?.user?.id || useAuthStore.getState()?.user?.userId;
      await useFieldStore.getState().getFieldsByUser(userId);
      return true;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Error al eliminar el campo';
      set({ fieldLoading: false, fieldError: message });
      return false;
    }
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

      // Ensure the response includes min and max values
      const dataWithRanges = response.data.map((item: any) => ({
        ...item,
        min: item.min_value !== undefined ? item.min_value : undefined,
        max: item.max_value !== undefined ? item.max_value : undefined,
      }));

      set({ numericalMeasurementsByFieldId: dataWithRanges, fieldLoading: false });
      return dataWithRanges;
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
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/fields/${id}`,
        authHeaders(),
      );
      set({
        fieldDetail: response.data,
        fieldLoading: false,
      });
      return response.data;
    } catch (error) {
      set({ fieldLoading: false });
      console.log('error getFieldById:', error);
      return undefined;
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
