import { create } from 'zustand';
import { axiosInstance } from './authStore';
import useTypeOfObjectStore from './typeOfObjectStore';
import useAuthStore from './authStore';
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
  createVariable: (variable: VariableWithIds) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, variable: Partial<VariableWithIds>) => Promise<void>;
  getAllVariables: () => void;
  getVariableById: (id: number | null) => Promise<void>;
  getVariablesByObjectId: (id: number) => Promise<void>;
  resetDetail: () => void;
  clearVariables: () => void;
}

const useVariableStore = create<VariableState>((set) => ({
  variables: null,
  variableById: null,
  variablesLoading: false,
  createVariable: async (variable: VariableWithIds): Promise<void> => {
    set({ variablesLoading: true });
    try {
      const userId = useAuthStore.getState().userId;
      await axiosInstance.post(`/variables/${userId}`, variable);
      useVariableStore.getState().getAllVariables();
      useTypeOfObjectStore.getState().getAllTypeOfObjects();
      set({ variablesLoading: false });
    } catch (error: any) {
      set({ variablesLoading: false });
      console.error('Error creating variable:', error);
    }
  },
  onDelete: async (id: number) => {
    try {
      await axiosInstance.delete(`/variables/${id}`);
      useVariableStore.getState().getAllVariables();
      useTypeOfObjectStore.getState().getAllTypeOfObjects();
    } catch (error: any) {
      set({ variablesLoading: false });
      console.error('Error deleting variable:', error);
    }
  },
  onUpdate: async (id: number, variable: Partial<VariableWithIds>) => {
    set({ variablesLoading: true });
    try {
      await axiosInstance.patch(`/variables/${id}`, variable);
      useVariableStore.getState().getAllVariables();
      useTypeOfObjectStore.getState().getAllTypeOfObjects();
      set({ variablesLoading: false });
    } catch (error: any) {
      set({ variablesLoading: false });
      console.error('Error updating variable:', error);
    }
  },
  getAllVariables: async () => {
    set({ variablesLoading: true });
    try {
      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      if (user) {
        const response = await axiosInstance.get(
          `/variables/byUser/${user?.userId}`
        );
        set({
          variables: response.data.length ? response.data : [],
          variablesLoading: false,
        });
      }
    } catch (error) {
      set({ variablesLoading: false });
      console.error('Error fetching variables:', error);
    }
  },
  getVariableById: async (id: number | null) => {
    set({ variablesLoading: true });
    try {
      if (id) {
        const response = await axiosInstance.get(`/variables/${id}`);
        set({
          variableById: response.data ? response.data : null,
          variablesLoading: false,
        });
      }
    } catch (error) {
      set({ variablesLoading: false });
      console.error('Error fetching variable by ID:', error);
    }
  },
  getVariablesByObjectId: async (id: number) => {
    set({ variablesLoading: true });
    try {
      const response = await axiosInstance.get(`/variables/byObjectId/${id}`);
      set({
        variables: response.data.length ? response.data : [],
        variablesLoading: false,
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
