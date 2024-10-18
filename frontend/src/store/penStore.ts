import { create } from 'zustand';
import { axiosInstance } from './authStore';
import useTypeOfObjectStore from './typeOfObjectStore';
import { Pen, CreatePen } from './interface/pen.interface';

interface PenState {
  pens: Pen[] | null;
  penById: Pen | null;
  pensLoading: boolean;
  createPen: (pen: CreatePen, fieldId: string) => Promise<void>;
  onDelete: (id: number, fieldId: string) => Promise<void>;
  onUpdate: (
    id: number,
    pen: Partial<CreatePen>,
    fieldId: string
  ) => Promise<void>;
  getAllPens: (
    fieldId: string,
    withFields?: boolean,
    withObjects?: boolean
  ) => void;
  getPenById: (id: number | null) => Promise<void>;
  getPensByObjectId: (id: number) => Promise<void>;
  resetDetail: () => void;
}

const usePenStore = create<PenState>((set) => ({
  pens: null,
  penById: null,
  pensLoading: false,
  createPen: async (pen: CreatePen): Promise<void> => {
    set({ pensLoading: true });
    try {
      await axiosInstance.post('/pens', pen);
      usePenStore.getState().getAllPens(pen.fieldId);
      useTypeOfObjectStore.getState().getAllTypeOfObjects();
      set({ pensLoading: false });
    } catch (error: any) {
      set({ pensLoading: false });
      console.error('Error creating pen:', error);
    }
  },
  onDelete: async (id: number, fieldId: string) => {
    try {
      await axiosInstance.delete(`/pens/${id}`);
      usePenStore.getState().getAllPens(fieldId);
      useTypeOfObjectStore.getState().getAllTypeOfObjects();
    } catch (error: any) {
      set({ pensLoading: false });
      console.error('Error deleting pen:', error);
    }
  },
  onUpdate: async (id: number, pen: Partial<CreatePen>, fieldId: string) => {
    set({ pensLoading: true });
    try {
      await axiosInstance.patch(`/pens/${id}`, pen);
      usePenStore.getState().getAllPens(fieldId);
      useTypeOfObjectStore.getState().getAllTypeOfObjects();
      set({ pensLoading: false });
    } catch (error: any) {
      set({ pensLoading: false });
      console.error('Error updating pen:', error);
    }
  },
  getAllPens: async (
    fieldId: string,
    withFields?: boolean,
    withObjects?: boolean
  ) => {
    set({ pensLoading: true });
    try {
      const response = await axiosInstance.get(
        `/pens/byField/${fieldId}?withFields=${withFields}&withObjects=${withObjects}`
      );
      set({
        pens: response.data.length ? response.data : [],
        pensLoading: false,
      });
    } catch (error) {
      set({ pensLoading: false });
      console.error('Error fetching pens:', error);
    }
  },
  getPenById: async (id: number | null) => {
    set({ pensLoading: true });
    try {
      if (id) {
        const response = await axiosInstance.get(`/pens/${id}`);
        set({
          penById: response.data ? response.data : null,
          pensLoading: false,
        });
      }
    } catch (error) {
      set({ pensLoading: false });
      console.error('Error fetching pen by ID:', error);
    }
  },
  getPensByObjectId: async (id: number) => {
    set({ pensLoading: true });
    try {
      const response = await axiosInstance.get(`/pens/byObjectId/${id}`);
      set({
        pens: response.data.length ? response.data : [],
        pensLoading: false,
      });
    } catch (error) {
      set({ pensLoading: false });
      console.error('Error fetching pens by object ID:', error);
    }
  },
  resetDetail: () => {
    set({
      penById: null,
    });
  },
}));

export default usePenStore;
