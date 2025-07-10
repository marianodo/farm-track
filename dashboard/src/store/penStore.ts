import { create } from 'zustand';
import axios from 'axios';
import useFieldStore from './fieldStore';
import { useAuthStore } from './authStore';

export type Pen = {
  id: string;
  name: string;
  description?: string;
  field_id: string;
  fieldName?: string; // To store the field name
};

type PenStore = {
  pens: Pen[];
  pensByUser: Pen[];
  penLoading: boolean;
  penError: string | null;
  
  // CRUD actions
  createPen: (pen: Omit<Pen, 'id'>) => Promise<Pen | undefined>;
  updatePen: (id: string, pen: Partial<Pen>) => Promise<Pen | undefined>;
  deletePen: (id: string) => Promise<boolean>;
  getPenById: (id: string) => Promise<Pen | undefined>;
  
  // Get pens by user (getting all fields for the user, then all pens for those fields)
  getPensByUser: () => Promise<Pen[] | undefined>;
  
  // Clear pens (for logout)
  clearPens: () => void;
};

const penStore = create<PenStore>((set, get) => ({
  pens: [],
  pensByUser: [],
  penLoading: false,
  penError: null,
  
  // Create a new pen
  createPen: async (pen) => {
    set({ penLoading: true, penError: null });
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/pens`,
        pen,
        {
          headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
        }
      );
      set({ penLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error creating pen:', error);
      set({ 
        penLoading: false, 
        penError: error instanceof Error ? error.message : 'Error creating pen' 
      });
      return undefined;
    }
  },
  
  // Update an existing pen
  updatePen: async (id, pen) => {
    set({ penLoading: true, penError: null });
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/pens/${id}`,
        pen,
        {
          headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
        }
      );
      set({ penLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error updating pen:', error);
      set({ 
        penLoading: false, 
        penError: error instanceof Error ? error.message : 'Error updating pen' 
      });
      return undefined;
    }
  },
  
  // Delete a pen
  deletePen: async (id) => {
    set({ penLoading: true, penError: null });
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/pens/${id}`, {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
      });
      set({ penLoading: false });
      return true;
    } catch (error) {
      console.error('Error deleting pen:', error);
      set({ 
        penLoading: false, 
        penError: error instanceof Error ? error.message : 'Error deleting pen' 
      });
      return false;
    }
  },
  
  // Get a pen by ID
  getPenById: async (id) => {
    set({ penLoading: true, penError: null });
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/pens/${id}`,
        {
          headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
        }
      );
      set({ penLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error getting pen by ID:', error);
      set({ 
        penLoading: false, 
        penError: error instanceof Error ? error.message : 'Error getting pen' 
      });
      return undefined;
    }
  },
  
  // Get all pens for the current user's fields
  getPensByUser: async () => {
    set({ penLoading: true, penError: null });
    
    try {
      // First get all fields
      const fieldStore = useFieldStore.getState();
      let fields;
      
      try {
        // Get fields from the API
        const fieldsData = await fieldStore.getFieldsByUser();
        fields = Array.isArray(fieldsData) ? fieldsData : fieldStore.fieldsByUserId || [];
      } catch (error) {
        console.error('Error fetching fields:', error);
        set({ penLoading: false, penError: 'Failed to load fields' });
        return [];
      }
      
      // If no fields, return empty array
      if (!fields || fields.length === 0) {
        set({ pensByUser: [], penLoading: false });
        return [];
      }
      
      // Create a field lookup map
      const fieldMap = new Map();
      fields.forEach(field => {
        fieldMap.set(String(field.id), field.name);
      });
      
      try {
        // Get pens for all fields in parallel
        const penPromises = fields.map(field => 
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/pens/byField/${field.id}`, 
            { headers: { Authorization: `Bearer ${useAuthStore.getState().token}` } }
          )
        );
        
        const results = await Promise.all(penPromises);
        
        // Process all pens and add field name
        const allPens = [];
        
        for (let i = 0; i < results.length; i++) {
          const fieldId = fields[i].id;
          const fieldName = fields[i].name;
          
          const pens = results[i].data || [];
          
          const pensWithField = pens.map((pen: Pen) => ({
            ...pen,
            fieldName
          }));
          
          allPens.push(...pensWithField);
        }
        
        set({ pensByUser: allPens, penLoading: false });
        return allPens;
      } catch (error) {
        console.error('Error fetching pens:', error);
        set({ penLoading: false, penError: 'Failed to load pens' });
        return [];
      }
    } catch (error) {
      console.error('Error in getPensByUser:', error);
      set({ penLoading: false, penError: 'An unexpected error occurred' });
      return [];
    }
  },
  
  // Clear pens (for logout)
  clearPens: () => {
    set({
      pens: [],
      pensByUser: [],
      penError: null
    });
  }
}));

export default penStore;
