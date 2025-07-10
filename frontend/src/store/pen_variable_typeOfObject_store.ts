import { create } from 'zustand';
import { axiosInstance } from './authStore';
import { CACHE_CONFIGS, getCacheData, setCacheData, invalidateCachePattern } from '../utils/cache';
import useTypeOfObjectStore from './typeOfObjectStore';
import {
  PenVariableTypeOfObject,
  CreatePenVariableTypeOfObject,
  ExtendedPenVariableTypeOfObject,
} from './interface/penVariableTypeOfObject.interface';

interface PenVariableTypeOfObjectState {
  penVariableTypeOfObjects: PenVariableTypeOfObject[] | null;
  penVariableTypeOfObjectByTypeId: PenVariableTypeOfObject | null;
  penVariableTypeOfObjectByTypeIdAndPen: ExtendedPenVariableTypeOfObject | null;
  penVariableTypeOfObjectsLoading: boolean;
  isFromCache: boolean;
  createPenVariableTypeOfObject: (
    penVariableTypeOfObject: CreatePenVariableTypeOfObject
  ) => Promise<void>;
  onDeleteByIds: (
    corralId: number,
    variableId: number,
    typeOfObjectId: number
  ) => Promise<void>;
  onUpdateByIds: (
    penId: number,
    variableId: number,
    typeOfObjectId: number,
    penVariableTypeOfObject: CreatePenVariableTypeOfObject
  ) => Promise<void>;
  getAllPenVariableTypeOfObjects: (
    fieldId?: string,
    withFields?: boolean,
    withObjects?: boolean
  ) => void;
  getPenVariableTypeOfObjectByObjectId: (
    typeId: number | null
  ) => Promise<void>;
  getPenVariableTypeOfObjectsByObjectIdAndPen: (
    typeId: number,
    penId: number,
    forceRefresh?: boolean
  ) => Promise<void>;
  resetDetail: () => void;
  clearPenVariableTypeOfObjects: () => void;
}

const usePenVariableTypeOfObjectStore = create<PenVariableTypeOfObjectState>(
  (set) => ({
    penVariableTypeOfObjects: null,
    penVariableTypeOfObjectByTypeId: null,
    penVariableTypeOfObjectByTypeIdAndPen: null,
    penVariableTypeOfObjectsLoading: false,
    isFromCache: false,
    createPenVariableTypeOfObject: async (
      penVariableTypeOfObject: CreatePenVariableTypeOfObject
    ): Promise<void> => {
      set({ penVariableTypeOfObjectsLoading: true });
      try {
        await axiosInstance.post(
          '/pens-variables-type-of-objects',
          penVariableTypeOfObject
        );
        
        // Invalidar caché relacionado
        await invalidateCachePattern('cache_pen_variables');
        
        usePenVariableTypeOfObjectStore
          .getState()
          .getAllPenVariableTypeOfObjects();
        useTypeOfObjectStore.getState().getAllTypeOfObjects();
        set({ penVariableTypeOfObjectsLoading: false });
      } catch (error: any) {
        set({ penVariableTypeOfObjectsLoading: false });
        console.error('Error creating pen variable type of object:', error);
      }
    },
    onDeleteByIds: async (
      corralId: number,
      variableId: number,
      typeOfObjectId: number
    ) => {
      try {
        await axiosInstance.delete(
          `/pens-variables-type-of-objects/${corralId}/${variableId}/${typeOfObjectId}`
        );
        
        // Invalidar caché relacionado
        await invalidateCachePattern('cache_pen_variables');
        
        usePenVariableTypeOfObjectStore
          .getState()
          .getAllPenVariableTypeOfObjects();
        useTypeOfObjectStore.getState().getAllTypeOfObjects();
      } catch (error: any) {
        set({ penVariableTypeOfObjectsLoading: false });
        console.error('Error deleting pen variable type of object:', error);
      }
    },
    onUpdateByIds: async (
      penId: number,
      variableId: number,
      typeOfObjectId: number,
      penVariableTypeOfObject: Partial<CreatePenVariableTypeOfObject>
    ) => {
      set({ penVariableTypeOfObjectsLoading: true });
      try {
        await axiosInstance.patch(
          `/pens-variables-type-of-objects/${penId}/${variableId}/${typeOfObjectId}`,
          penVariableTypeOfObject
        );
        
        // Invalidar caché relacionado
        await invalidateCachePattern('cache_pen_variables');
        
        usePenVariableTypeOfObjectStore
          .getState()
          .getPenVariableTypeOfObjectsByObjectIdAndPen(typeOfObjectId, penId, true);
        // useTypeOfObjectStore.getState().getAllTypeOfObjects();
        set({ penVariableTypeOfObjectsLoading: false });
      } catch (error: any) {
        set({ penVariableTypeOfObjectsLoading: false });
        console.error('Error updating pen variable type of object:', error);
      }
    },
    getAllPenVariableTypeOfObjects: async () => {
      set({ penVariableTypeOfObjectsLoading: true });
      try {
        const response = await axiosInstance.get(
          `/pens-variables-type-of-objects`
        );
        set({
          penVariableTypeOfObjects: response.data.length ? response.data : [],
          penVariableTypeOfObjectsLoading: false,
        });
      } catch (error) {
        set({ penVariableTypeOfObjectsLoading: false });
        console.error('Error fetching pen variable type of objects:', error);
      }
    },
    getPenVariableTypeOfObjectByObjectId: async (typeId: number | null) => {
      set({ penVariableTypeOfObjectsLoading: true });
      try {
        if (typeId) {
          const response = await axiosInstance.get(
            `/pens-variables-type-of-objects/type-of-object/${typeId}`
          );
          set({
            penVariableTypeOfObjectByTypeId: response.data
              ? response.data
              : null,
            penVariableTypeOfObjectsLoading: false,
          });
        }
      } catch (error) {
        set({ penVariableTypeOfObjectsLoading: false });
        console.error(
          'Error fetching pen variable type of object by ID:',
          error
        );
      }
    },
    getPenVariableTypeOfObjectsByObjectIdAndPen: async (
      type: number,
      penId: number,
      forceRefresh: boolean = false
    ) => {
      set({ penVariableTypeOfObjectsLoading: true });
      
      try {
        const cacheKey = `${CACHE_CONFIGS.penVariables.key}_${type}_${penId}`;
        
        // Intentar obtener desde caché primero
        if (!forceRefresh) {
          const cachedData = await getCacheData<ExtendedPenVariableTypeOfObject>(cacheKey);
          if (cachedData) {
            set({
              penVariableTypeOfObjectByTypeIdAndPen: cachedData,
              penVariableTypeOfObjectsLoading: false,
              isFromCache: true,
            });
            return;
          }
        }
        
        // Si no hay caché o se fuerza refresh, hacer llamada al backend
        const response = await axiosInstance.get(
          `/pens-variables-type-of-objects/type-of-object/${type}/${penId}`
        );
        
        const data = response.data ? response.data : [];
        
        // Guardar en caché
        await setCacheData(cacheKey, data, CACHE_CONFIGS.penVariables.ttl);
        
        set({
          penVariableTypeOfObjectByTypeIdAndPen: data,
          penVariableTypeOfObjectsLoading: false,
          isFromCache: false,
        });
      } catch (error) {
        set({ penVariableTypeOfObjectsLoading: false });
        console.error(
          'Error fetching pen variable type of objects by object ID:',
          error
        );
      }
    },
    resetDetail: () => {
      set({
        penVariableTypeOfObjectByTypeId: null,
        penVariableTypeOfObjectByTypeIdAndPen: null,
      });
    },
    clearPenVariableTypeOfObjects: () => {
      set({
        penVariableTypeOfObjects: null,
        penVariableTypeOfObjectByTypeId: null,
        penVariableTypeOfObjectByTypeIdAndPen: null,
      });
    },
  })
);

export default usePenVariableTypeOfObjectStore;
