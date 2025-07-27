import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

export type VariableType = 'NUMBER' | 'CATEGORICAL';

export type Variable = {
  id: string;
  name: string;
  type: VariableType;
  defaultValue: any;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
};

type VariableStore = {
  variables: Variable[];
  variablesByUser: Variable[];
  variableLoading: boolean;
  variableError: string | null;
  
  // CRUD operations
  createVariable: (variable: Omit<Variable, 'id'>) => Promise<Variable | undefined>;
  updateVariable: (id: string, variable: Partial<Variable>) => Promise<Variable | undefined>;
  deleteVariable: (id: string) => Promise<boolean>;
  getVariableById: (id: string) => Promise<Variable | undefined>;
  
  // Get variables by user
  getVariablesByUser: (userId?: string) => Promise<Variable[] | undefined>;
  
  // Clear variables (for logout)
  clearVariables: () => void;
};

const variableStore = create<VariableStore>((set) => ({
  variables: [],
  variablesByUser: [],
  variableLoading: false,
  variableError: null,
  
  // Create a new variable
  createVariable: async (variable: Omit<Variable, 'id'>) => {
    set({ variableLoading: true, variableError: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/variables/${userId}`,
        variable,
        { headers: { Authorization: `Bearer ${useAuthStore.getState().token}` } }
      );
      
      set({ variableLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error creating variable:', error);
      set({ 
        variableLoading: false, 
        variableError: error instanceof Error ? error.message : 'Error creating variable' 
      });
      return undefined;
    }
  },
  
  // Update an existing variable
  updateVariable: async (id: string, variable: Partial<Variable>) => {
    set({ variableLoading: true, variableError: null });
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/variables/${id}`,
        variable,
        { headers: { Authorization: `Bearer ${useAuthStore.getState().token}` } }
      );
      
      set({ variableLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error updating variable:', error);
      set({ 
        variableLoading: false, 
        variableError: error instanceof Error ? error.message : 'Error updating variable' 
      });
      return undefined;
    }
  },
  
  // Delete a variable
  deleteVariable: async (id: string) => {
    set({ variableLoading: true, variableError: null });
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/variables/${id}`,
        { headers: { Authorization: `Bearer ${useAuthStore.getState().token}` } }
      );
      
      set({ variableLoading: false });
      return true;
    } catch (error) {
      console.error('Error deleting variable:', error);
      set({ 
        variableLoading: false, 
        variableError: error instanceof Error ? error.message : 'Error deleting variable' 
      });
      return false;
    }
  },
  
  // Get a variable by ID
  getVariableById: async (id: string) => {
    set({ variableLoading: true, variableError: null });
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/variables/${id}`,
        { headers: { Authorization: `Bearer ${useAuthStore.getState().token}` } }
      );
      
      set({ variableLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error getting variable by ID:', error);
      set({ 
        variableLoading: false, 
        variableError: error instanceof Error ? error.message : 'Error getting variable' 
      });
      return undefined;
    }
  },
  
  // Get all variables for the current user
  getVariablesByUser: async () => {
    set({ variableLoading: true, variableError: null });
    
    try {
      // Get auth token and user info (same as fields store)
      const token = useAuthStore.getState().token;
      const userId = useAuthStore.getState()?.user?.id || useAuthStore.getState()?.user?.userId;
      
      console.log('🔍 DEBUG - Variable store - Token:', token);
      console.log('🔍 DEBUG - Variable store - User ID:', userId);
      console.log('🔍 DEBUG - Variable store - Full user object:', useAuthStore.getState().user);
      
      if (!token) {
        console.warn('No authentication token available');
        set({ 
          variableLoading: false, 
          variablesByUser: [],
          variableError: 'No authentication token available'
        });
        return [];
      }
        
        if (!userId) {
        console.warn('No user ID available');
          set({ 
            variableLoading: false, 
            variablesByUser: [],
            variableError: 'No user ID available for authentication'
          });
          return [];
        }
        
      // Use the same pattern as fields store
        const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/variables/byUser/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        );
        
      console.log('🔍 DEBUG - Variable store - Response:', response.data);
        
      // Handle response same as fields store
      const userVariables = response.data.length ? response.data : [];
        set({
          variablesByUser: userVariables,
          variableLoading: false,
          variableError: null
        });
        
        return userVariables;
    } catch (error: any) {
      console.error('🔍 DEBUG - Variable store - Error:', error);
      set({ 
        variableLoading: false,
        variableError: error.response?.data?.message || error.message || 'Error al obtener variables'
      });
      return [];
    }
  },
  
  // Clear variables (for logout)
  clearVariables: () => {
    set({
      variables: [],
      variablesByUser: [],
      variableError: null
    });
  }
}));

export default variableStore;
