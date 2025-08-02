import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

export interface TypeOfObject {
  id: number;
  name: string;
}

interface TypeOfObjectState {
  typeOfObjects: TypeOfObject[] | null;
  typeOfObjectsLoading: boolean;
  typeOfObjectError: string | null;
  
  getAllTypeOfObjects: () => Promise<TypeOfObject[] | undefined>;
  clearTypeOfObjects: () => void;
}

const useTypeOfObjectStore = create<TypeOfObjectState>((set) => ({
  typeOfObjects: null,
  typeOfObjectsLoading: false,
  typeOfObjectError: null,
  
  getAllTypeOfObjects: async () => {
    set({ typeOfObjectsLoading: true, typeOfObjectError: null });
    
    try {
      const token = useAuthStore.getState().token;
      const userId = useAuthStore.getState()?.user?.id || useAuthStore.getState()?.user?.userId;
      
      if (!token) {
        set({ 
          typeOfObjectsLoading: false, 
          typeOfObjectError: 'No authentication token available'
        });
        return [];
      }
      
      if (!userId) {
        set({ 
          typeOfObjectsLoading: false, 
          typeOfObjectError: 'No user ID available'
        });
        return [];
      }
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/type-of-objects/byUser/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const sortedData = response.data.sort(
        (a: TypeOfObject, b: TypeOfObject) => a.name.localeCompare(b.name)
      );
      
      const typeOfObjects = sortedData.length ? sortedData : [];
      
      set({
        typeOfObjects,
        typeOfObjectsLoading: false,
        typeOfObjectError: null
      });
      
      return typeOfObjects;
    } catch (error: any) {
      console.error('Error fetching type of objects:', error);
      set({ 
        typeOfObjectsLoading: false,
        typeOfObjectError: error.response?.data?.message || error.message || 'Error al obtener tipos de objetos'
      });
      return [];
    }
  },
  
  clearTypeOfObjects: () => {
    set({
      typeOfObjects: null,
      typeOfObjectError: null
    });
  }
}));

export default useTypeOfObjectStore; 