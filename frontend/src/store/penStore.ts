import { create } from 'zustand';
import { axiosInstance } from './authStore';
import useTypeOfObjectStore from './typeOfObjectStore';
import { Pen, CreatePen } from './interface/pen.interface';
import { CACHE_CONFIGS, getCacheData, setCacheData, invalidateCachePattern } from '../utils/cache';

interface PenState {
  pens: { [fieldId: string]: Pen[] } | null;
  penById: Pen | null;
  pensLoading: boolean;
  isFromCache: boolean;
  createPen: (pen: CreatePen) => Promise<void>;
  onDelete: (id: number, fieldId: string) => Promise<void>;
  onUpdate: (
    id: number,
    pen: Partial<CreatePen>,
    fieldId: string
  ) => Promise<void>;
  getAllPens: (
    fieldId: string,
    withFields?: boolean,
    withObjects?: boolean,
    forceRefresh?: boolean
  ) => void;
  getPenById: (id: number | null, forceRefresh?: boolean) => Promise<void>;
  getPensByObjectId: (id: number, forceRefresh?: boolean) => Promise<void>;
  resetDetail: () => void;
  clearPens: () => void;
}

const usePenStore = create<PenState>((set) => ({
  pens: null,
  penById: null,
  pensLoading: false,
  isFromCache: false,
  createPen: async (pen: CreatePen): Promise<void> => {
    set({ pensLoading: true });
    try {
      console.log('📱 Frontend: Sending pen data to backend:', pen);
      const response = await axiosInstance.post('/pens', pen);
      console.log('✅ Frontend: Pen created successfully:', response.data);
      
      // Invalidar caché de pens
      await invalidateCachePattern(CACHE_CONFIGS.pens.key);
      
      usePenStore.getState().getAllPens(pen.fieldId, undefined, undefined, true);
      useTypeOfObjectStore.getState().getAllTypeOfObjects();
      set({ pensLoading: false });
    } catch (error: any) {
      set({ pensLoading: false });
      console.error('❌ Frontend: Error creating pen:', error.response?.data || error.message);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error creating pen');
      }
    }
  },
  onDelete: async (id: number, fieldId: string) => {
    set({ pensLoading: true });
    try {
      await axiosInstance.delete(`/pens/${id}`);
      
      // Invalidar caché de pens
      await invalidateCachePattern(CACHE_CONFIGS.pens.key);
      await invalidateCachePattern(`${CACHE_CONFIGS.penById.key}_${id}`);
      
      usePenStore.getState().getAllPens(fieldId, undefined, undefined, true);
      useTypeOfObjectStore.getState().getAllTypeOfObjects();
    } catch (error: any) {
      set({ pensLoading: false });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error deleting object');
      }
    }
  },
  onUpdate: async (id: number, pen: Partial<CreatePen>, fieldId: string) => {
    set({ pensLoading: true });
    try {
      await axiosInstance.patch(`/pens/${id}`, pen);
      
      // Invalidar caché de pens
      await invalidateCachePattern(CACHE_CONFIGS.pens.key);
      await invalidateCachePattern(`${CACHE_CONFIGS.penById.key}_${id}`);
      
      usePenStore.getState().getAllPens(fieldId, undefined, undefined, true);
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
    withObjects?: boolean,
    forceRefresh: boolean = false
  ) => {
    set({ pensLoading: true });
    try {
      // Intentar obtener del caché primero
      if (!forceRefresh) {
        const cacheKey = `${CACHE_CONFIGS.pens.key}_${fieldId}_${withFields}_${withObjects}`;
        const cachedPens = await getCacheData<Pen[]>(cacheKey);
        if (cachedPens) {
          set((state) => ({
            pens: {
              ...state.pens,
              [fieldId]: cachedPens,
            },
            pensLoading: false,
            isFromCache: true,
          }));
          return;
        }
      }

      // Si no hay caché o se fuerza refresh, hacer llamada al backend
      const response = await axiosInstance.get(
        `/pens/byField/${fieldId}?withFields=${withFields}&withObjects=${withObjects}`
      );
      const pens = response.data.length ? response.data : [];
      
      // Guardar en caché
      const cacheKey = `${CACHE_CONFIGS.pens.key}_${fieldId}_${withFields}_${withObjects}`;
      await setCacheData(cacheKey, pens, CACHE_CONFIGS.pens.ttl);
      
      set((state) => ({
        pens: {
          ...state.pens,
          [fieldId]: pens,
        },
        pensLoading: false,
        isFromCache: false,
      }));
    } catch (error) {
      set({ pensLoading: false });
      console.error('Error fetching pens:', error);
    }
  },
  getPenById: async (id: number | null, forceRefresh: boolean = false) => {
    set({ pensLoading: true });
    try {
      if (id) {
        // Intentar obtener del caché primero
        if (!forceRefresh) {
          const cacheKey = `${CACHE_CONFIGS.penById.key}_${id}`;
          const cachedPen = await getCacheData<Pen>(cacheKey);
          if (cachedPen) {
            set({
              penById: cachedPen,
              pensLoading: false,
              isFromCache: true,
            });
            return;
          }
        }

        // Si no hay caché o se fuerza refresh, hacer llamada al backend
        const response = await axiosInstance.get(`/pens/${id}`);
        
        // Guardar en caché
        const cacheKey = `${CACHE_CONFIGS.penById.key}_${id}`;
        await setCacheData(cacheKey, response.data, CACHE_CONFIGS.penById.ttl);
        
        set({
          penById: response.data ? response.data : null,
          pensLoading: false,
          isFromCache: false,
        });
      }
    } catch (error) {
      set({ pensLoading: false });
      console.error('Error fetching pen by ID:', error);
    }
  },
  getPensByObjectId: async (id: number, forceRefresh: boolean = false) => {
    set({ pensLoading: true });
    try {
      // Intentar obtener del caché primero
      if (!forceRefresh) {
        const cacheKey = `${CACHE_CONFIGS.pens.key}_object_${id}`;
        const cachedPens = await getCacheData<Pen[]>(cacheKey);
        if (cachedPens) {
          set({
            pens: cachedPens.length ? { [id]: cachedPens } : null,
            pensLoading: false,
            isFromCache: true,
          });
          return;
        }
      }

      // Si no hay caché o se fuerza refresh, hacer llamada al backend
      const response = await axiosInstance.get(`/pens/byObjectId/${id}`);
      const pens = response.data.length ? response.data : [];
      
      // Guardar en caché
      const cacheKey = `${CACHE_CONFIGS.pens.key}_object_${id}`;
      await setCacheData(cacheKey, pens, CACHE_CONFIGS.pens.ttl);
      
      set({
        pens: pens.length ? { [id]: pens } : null,
        pensLoading: false,
        isFromCache: false,
      });
    } catch (error) {
      set({ pensLoading: false });
      console.error('Error fetching pens by object ID:', error);
    }
  },
  resetDetail: () => {
    set({
      pens: null,
      penById: null,
    });
  },
  clearPens: () => {
    set({
      pens: null,
      penById: null,
    });
  },
}));

export default usePenStore;
