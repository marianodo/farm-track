import { create } from 'zustand';
import { axiosInstance } from './authStore';
import { CACHE_CONFIGS, getCacheData, setCacheData, invalidateCachePattern } from '../utils/cache';
import {
  Report,
  ReportWithMeasurements2,
  CreateReport,
  MeasurementData,
  MeasurementEditData,
} from './interface/report.interface';
import { saveLog } from '../utils/logger';

interface ReportState {
  reportsByFielId: { [fieldId: string]: Report[] } | null;
  reportById: ReportWithMeasurements2[] | null | [];
  reportByIdNameAndComment: any;
  createReportId: number | null;
  createReportName: string | null;
  measurementVariablesData: MeasurementData[] | null;
  measurementEditData: MeasurementEditData[] | null;
  reportsLoading: boolean;
  isFromCache: boolean;
  createReport: (report: Report, field_id: string) => Promise<void>;
  onDelete: (id: number, fieldId: string) => Promise<void>;
  onUpdate: (report_id: number, measurementsUpdates: any) => Promise<void>;
  update: (
    report_id: number,
    reportUpdate: any,
    field_id: number
  ) => Promise<void>;
  getAllReportsByField: (field_id: string, forceRefresh?: boolean) => void;
  getReportById: (
    id: number | null,
    onlyNameAndComment?: string,
    forceRefresh?: boolean
  ) => Promise<void>;
  resetDetail: () => void;
  resetCreateReportId: () => void;
  resetMeasurementEditData: () => void;
  resetReportByIdNameAndComment: () => void;
  setMeasurementData: (data: MeasurementData[]) => void;
  retryWithBackoff: (operation: () => Promise<any>, maxRetries?: number, baseDelay?: number) => Promise<any>;
  createMeasurementWithReportId: (data: any, field_id: string) => void;
  getMeasurementEditData: (report_id: number, subject_id: number) => void;
  onDeleteMeasurement: (report_id: number, measurement_id: number) => void;
  setCreateReportId: (report_id: number) => void;
  clearReports: () => void;
}

const useReportStore = create<ReportState>((set) => ({
  reportsByFielId: null,
  reportById: null,
  reportsLoading: false,
  isFromCache: false,
  createReportId: null,
  createReportName: null,
  reportByIdNameAndComment: null,
  measurementVariablesData: null,
  measurementEditData: null,
  createReport: async (
    report: CreateReport,
    field_id: string
  ): Promise<void> => {
    set({ reportsLoading: true });
    try {
      const response = await axiosInstance.post(
        `/reports/byFieldId/${field_id}`,
        report
      );
      const newReport = response.data;
      
      // Invalidar caché de reportes
      await invalidateCachePattern(CACHE_CONFIGS.reports.key);
      
      useReportStore.getState().getAllReportsByField(field_id, true);
      //   useTypeOfObjectStore.getState().getAllTypeOfObjects();
      set({ reportsLoading: false, createReportId: newReport.id, createReportName: newReport.name });
      return newReport;
    } catch (error: any) {
      set({ reportsLoading: false });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error creating report');
      }
    }
  },
  onDelete: async (id: number, fieldId: string) => {
    try {
      await axiosInstance.delete(`/reports/${id}`);
      
      // Invalidar caché de reportes
      await invalidateCachePattern(CACHE_CONFIGS.reports.key);
      
      set({ reportsLoading: false });
      useReportStore.getState().getAllReportsByField(fieldId, true);
    } catch (error: any) {
      set({ reportsLoading: false });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error deleting report');
      }
    }
  },

  onDeleteMeasurement: async (report_id: number, measurement_id: number) => {
    set({ reportsLoading: true });
    try {
      await axiosInstance.delete(`/measurements/${measurement_id}`);
      
      // Invalidar caché del reporte específico
      await invalidateCachePattern(`${CACHE_CONFIGS.reportById.key}_${report_id}`);
      
      set({ reportsLoading: false });
      useReportStore.getState().getReportById(report_id, undefined, true);
    } catch (error: any) {
      set({ reportsLoading: false });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error deleting measurement');
      }
    }
  },

  onUpdate: async (report_id, measurementsUpdates) => {
    set({ reportsLoading: true });
    try {
      await axiosInstance.patch(
        `/measurements/bulkUpdate`,
        measurementsUpdates
      );
      
      // Invalidar caché del reporte específico
      await invalidateCachePattern(`${CACHE_CONFIGS.reportById.key}_${report_id}`);
      
      useReportStore.getState().getReportById(report_id, undefined, true);
      set({ reportsLoading: false });
    } catch (error: any) {
      set({ reportsLoading: false });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error update measurement');
      }
    }
  },

  update: async (report_id: number, reportUpdate: any, field_id: any) => {
    set({ reportsLoading: true });
    try {
      await axiosInstance.patch(`/reports/${report_id}`, reportUpdate);
      
      // Invalidar caché de reportes
      await invalidateCachePattern(CACHE_CONFIGS.reports.key);
      
      useReportStore.getState().getAllReportsByField(field_id, true);
      set({ reportsLoading: false });
    } catch (error: any) {
      set({ reportsLoading: false });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error updating report');
      }
    }
  },
  getAllReportsByField: async (field_id: string, forceRefresh: boolean = false) => {
    await saveLog('Store: Iniciando getAllReportsByField', {
      field_id,
      forceRefresh,
      reportsLoading: useReportStore.getState().reportsLoading
    }, 'measurement');

    set({ reportsLoading: true });
    
    try {
      // Delay mínimo para mostrar el indicador de carga
      await new Promise(resolve => setTimeout(resolve, 500));

      // Intentar obtener del caché primero
      if (!forceRefresh) {
        const cacheKey = `${CACHE_CONFIGS.reports.key}_${field_id}`;
        const cachedReports = await getCacheData<Report[]>(cacheKey);
        if (cachedReports) {
          await saveLog('Store: Datos obtenidos del caché', {
            field_id,
            reportsCount: cachedReports?.length || 0
          }, 'measurement');
          
          set({ reportsByFielId: { [field_id]: cachedReports }, reportsLoading: false, isFromCache: true });
          return;
        }
      }

      await saveLog('Store: Haciendo llamada GET a /reports/byField', {
        field_id
      }, 'measurement');

      const response = await axiosInstance.get(`/reports/byField/${field_id}`);
      
      // Guardar en caché
      const cacheKey = `${CACHE_CONFIGS.reports.key}_${field_id}`;
      await setCacheData(cacheKey, response.data, CACHE_CONFIGS.reports.ttl);
      
      await saveLog('Store: Llamada GET exitosa, actualizando estado y caché', {
        field_id,
        reportsCount: response.data?.length || 0
      }, 'measurement');

      set({ reportsByFielId: { [field_id]: response.data }, reportsLoading: false, isFromCache: false });
      
      await saveLog('Store: getAllReportsByField completado exitosamente', {
        field_id
      }, 'measurement');

    } catch (error: any) {
      await saveLog('Store: Error en getAllReportsByField', {
        error: error?.toString(),
        errorMessage: error?.message,
        errorResponse: error?.response?.data,
        errorStatus: error?.response?.status,
        field_id
      }, 'error');

      set({ reportsLoading: false });
      
      await saveLog('Store: Estado reportsLoading establecido en false después del error en getAllReportsByField', {
        field_id
      }, 'measurement');

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error fetching reports by field');
      }
    }
  },
  getReportById: async (id: number | null, onlyNameAndComment?: string, forceRefresh: boolean = false) => {
    await saveLog('Store: Iniciando getReportById', {
      id,
      onlyNameAndComment,
      forceRefresh,
      reportsLoading: useReportStore.getState().reportsLoading
    }, 'measurement');

    set({ reportsLoading: true });

    try {
      if (onlyNameAndComment) {
        // Para onlyNameAndComment no usamos caché ya que es un caso especial
        const response = await axiosInstance.get(
          `/reports/${id}?onlyNameAndComment=${onlyNameAndComment}`
        );

        set({ reportByIdNameAndComment: response.data, reportsLoading: false });
        return;
      } else {
        // Delay mínimo para mostrar el indicador de carga
        await new Promise(resolve => setTimeout(resolve, 300));

        // Intentar obtener del caché primero
        if (!forceRefresh && id) {
          const cacheKey = `${CACHE_CONFIGS.reportById.key}_${id}`;
          const cachedReport = await getCacheData<ReportWithMeasurements2[]>(cacheKey);
          if (cachedReport) {
            await saveLog('Store: Reporte obtenido del caché', {
              id,
              reportData: cachedReport?.length || 0
            }, 'measurement');
            
            set({ reportById: cachedReport, reportsLoading: false, isFromCache: true });
            return;
          }
        }

        await saveLog('Store: Haciendo llamada GET a /reports/:id', {
          id
        }, 'measurement');

        const response = await axiosInstance.get(`/reports/${id}`);
        
        // Guardar en caché
        if (id) {
          const cacheKey = `${CACHE_CONFIGS.reportById.key}_${id}`;
          await setCacheData(cacheKey, response.data, CACHE_CONFIGS.reportById.ttl);
        }
        
        await saveLog('Store: Llamada GET exitosa, actualizando estado y caché', {
          id,
          reportData: response.data?.length || 0
        }, 'measurement');

        set({ reportById: response.data, reportsLoading: false, isFromCache: false });
        
        await saveLog('Store: getReportById completado exitosamente', {
          id
        }, 'measurement');
      }
    } catch (error: any) {
      await saveLog('Store: Error en getReportById', {
        error: error?.toString(),
        errorMessage: error?.message,
        errorResponse: error?.response?.data,
        errorStatus: error?.response?.status,
        id
      }, 'error');

      set({ reportsLoading: false });
      
      await saveLog('Store: Estado reportsLoading establecido en false después del error en getReportById', {
        id
      }, 'measurement');

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error fetch report id');
      }
    }
  },
  resetDetail: () => {
    set({
      reportById: null,
    });
  },

  resetCreateReportId: () => {
    set({
      createReportId: null,
      createReportName: null,
    });
  },

  resetMeasurementEditData: () => {
    set({
      measurementEditData: null,
    });
  },

  resetReportByIdNameAndComment: () => {
    set({
      reportByIdNameAndComment: null,
    });
  },

  setCreateReportId: (report_id) => {
    set({
      createReportId: report_id,
    });
  },

  setMeasurementData: (data) => {
    set({
      measurementVariablesData: data,
    });
  },
  // Función auxiliar para reintentos con backoff exponencial
  retryWithBackoff: async (
    operation: () => Promise<any>,
    maxRetries: number = 5,
    baseDelay: number = 1000
  ): Promise<any> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await saveLog('Store: Intento de operación', {
          attempt,
          maxRetries
        }, 'measurement');
        
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        await saveLog('Store: Error en intento', {
          attempt,
          maxRetries,
          error: error?.toString(),
          errorMessage: error?.message,
          errorStatus: error?.response?.status
        }, 'error');
        
        // Si es el último intento, no esperar
        if (attempt === maxRetries) {
          break;
        }
        
        // Calcular delay con backoff exponencial
        const delay = baseDelay * Math.pow(2, attempt - 1);
        
        await saveLog('Store: Esperando antes del siguiente intento', {
          attempt,
          delay,
          nextAttempt: attempt + 1
        }, 'measurement');
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  },

  createMeasurementWithReportId: async (
    data: any,
    field_id: string
  ): Promise<void> => {
    await saveLog('Store: Iniciando createMeasurementWithReportId', {
      data,
      field_id,
      reportsLoading: useReportStore.getState().reportsLoading
    }, 'measurement');

    set({ reportsLoading: true });
    
    await saveLog('Store: Estado reportsLoading establecido en true', {
      data
    }, 'measurement');

    try {
      // Usar la función de reintentos para el POST
      await useReportStore.getState().retryWithBackoff(async () => {
      await saveLog('Store: Haciendo llamada POST a /measurements', {
        data,
        field_id
      }, 'measurement');

        return await axiosInstance.post('/measurements', data);
      });
      
      await saveLog('Store: Llamada POST exitosa, actualizando reports', {
        field_id
      }, 'measurement');
      
      // Invalidar caché de reportes cuando se crean mediciones
      await invalidateCachePattern(CACHE_CONFIGS.reports.key);
      // También invalidar caché de reportes por ID ya que las mediciones han cambiado
      await invalidateCachePattern(CACHE_CONFIGS.reportById.key);
      
      useReportStore.getState().getAllReportsByField(field_id, true);
      set({ reportsLoading: false });
      
      await saveLog('Store: createMeasurementWithReportId completado exitosamente', {
        field_id
      }, 'measurement');

    } catch (error: any) {
      await saveLog('Store: Error final en createMeasurementWithReportId después de todos los reintentos', {
        error: error?.toString(),
        errorMessage: error?.message,
        errorResponse: error?.response?.data,
        errorStatus: error?.response?.status,
        field_id,
        data
      }, 'error');

      set({ reportsLoading: false });
      
      await saveLog('Store: Estado reportsLoading establecido en false después del error final', {
        field_id
      }, 'measurement');

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error creating measurement with report id after retries');
      }
    }
  },
  getMeasurementEditData: async (report_id, subject_id) => {
    set({ reportsLoading: true });
    try {
      const response = await axiosInstance.get(
        `/measurements/${report_id}/${subject_id}`
      );
      set({ measurementEditData: response.data, reportsLoading: false });
    } catch (error: any) {

      set({ reportsLoading: false });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error fetch measurement data');
      }
    }
  },
  clearReports: () => {
    set({
      reportsByFielId: null,
      reportById: null,
      reportByIdNameAndComment: null,
      createReportId: null,
      measurementVariablesData: null,
      measurementEditData: null,
    });
  },
}));

export default useReportStore;
