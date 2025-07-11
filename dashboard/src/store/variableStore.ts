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
      // Get auth token
      const token = useAuthStore.getState().token;
      
      // If token is missing, we can't make authenticated requests
      if (!token) {
        console.warn('No authentication token available');
        set({ 
          variableLoading: false, 
          variablesByUser: [],
          variableError: 'No authentication token available'
        });
        return [];
      }
      
      try {
        // Get all variables and filter locally if needed
        const url = `${process.env.NEXT_PUBLIC_API_URL}/variables`;
        console.log('Fetching all variables and filtering locally');
        
        const response = await axios.get(
          url,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Handle empty response
        if (!response.data) {
          set({ 
            variableLoading: false, 
            variablesByUser: [],
            variableError: 'Empty response from server'
          });
          return [];
        }
        
        // Get all variables from response
        const allVariables = response.data;
        console.log(`Fetched ${allVariables.length} total variables`);
        // Get current user (for local filtering if needed)
        const user = useAuthStore.getState().user;

        const userId = user?.userId;
        console.log(userId);
        
        // If we have a userId, filter the variables locally
        let userVariables = allVariables;
        if (userId) {
          userVariables = allVariables.filter((v: any) => v.userId === userId);
          console.log(`Filtered ${userVariables.length} variables for user ${userId}`);
        } else {
          console.warn('No user ID available for local filtering');
        }
        
        // Update state with the variables
        set({
          variablesByUser: userVariables,
          variableLoading: false,
          variableError: userId ? null : 'Warning: Using all variables without user filtering'
        });
        
        return userVariables;
      } catch (apiError: any) {
        const statusCode = apiError.response?.status;
        const errorMessage = apiError.response?.data?.message || apiError.message;
        
        console.error(`API error (${statusCode}):`, errorMessage);
        set({ 
          variableLoading: false,
          variableError: `Error al obtener variables: ${errorMessage}`
        });
        return [];
      }
    } catch (error: any) {
      console.error('Unexpected error in getVariablesByUser:', error);
      set({ 
        variableLoading: false,
        variableError: 'Error inesperado al obtener variables'
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
