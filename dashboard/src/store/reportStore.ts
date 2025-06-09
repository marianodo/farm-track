import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

export interface Report {
  id: string;
  name: string;
  comment?: string;
  created_at?: string;
  updated_at?: string;
  correlative_id?: number;
  userId?: string;
  field_id?: string;
  fieldName?: string;
}

interface ReportState {
  reports: Report[] | null;
  reportsByUser: Report[] | null;
  reportsByField: Record<string, Report[]>;
  reportLoading: boolean;
  reportError: string | null;
  
  getReportsByUser: () => Promise<Report[] | undefined>;
  getReportsByField: (fieldId: string) => Promise<Report[] | undefined>;
}

const useReportStore = create<ReportState>((set, get) => ({
  reports: null,
  reportsByUser: null,
  reportsByField: {},
  reportLoading: false,
  reportError: null,
  
  getReportsByUser: async () => {
    set({ reportLoading: true, reportError: null });
    
    try {
      const { token, user } = useAuthStore.getState();
      
      if (!token) {
        console.warn('No hay token de autenticación disponible');
        set({ reportLoading: false, reportsByUser: [] });
        return [];
      }
      
      const userId = user?.userId;
      
      try {
        if (userId) {
          // Primero obtenemos todos los campos del usuario
          console.log('Obteniendo campos del usuario');
          const fieldsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/fields/byUserId/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          const fields = fieldsResponse.data || [];
          console.log(`Encontrados ${fields.length} campos para el usuario ${userId}`);
          
          if (fields.length === 0) {
            set({ reportsByUser: [], reportLoading: false });
            return [];
          }
          
          // Obtenemos reportes para cada campo
          const allReports: Report[] = [];
          for (const field of fields) {
            try {
              console.log(`Obteniendo reportes para el campo ${field.id} (${field.name})`);
              const reportResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/reports/byField/${field.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              const fieldReports = reportResponse.data || [];
              console.log(`- ${fieldReports.length} reportes encontrados para ${field.name}`);
              
              // Log de información de muestra para depuración
              if (fieldReports.length > 0) {
                console.log('- Muestra de reporte:', fieldReports[0]);
              }
              
              // Añadir nombre del campo y validar fechas
              const reportsWithFieldName = fieldReports.map((report: Report) => {
                // Aseguramos que created_at tenga formato ISO correcto
                let fixedCreatedAt = report.created_at;
                
                if (report.created_at && typeof report.created_at === 'string') {
                  try {
                    const date = new Date(report.created_at);
                    if (!isNaN(date.getTime())) {
                      fixedCreatedAt = date.toISOString();
                    }
                  } catch (e) {
                    console.error('Error al procesar fecha:', e);
                  }
                }
                
                return {
                  ...report,
                  id: report.id?.toString() || `report-${Math.random().toString(36).substr(2, 9)}`,
                  created_at: fixedCreatedAt,
                  fieldName: field.name
                };
              });
              
              allReports.push(...reportsWithFieldName);
            } catch (fieldError) {
              console.error(`Error al obtener reportes para el campo ${field.id}:`, fieldError);
              // Continuamos con otros campos incluso si uno falla
            }
          }
          
          // Ordenar reportes por fecha (más recientes primero)
          allReports.sort((a, b) => {
            return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
          });
          
          console.log(`Total: ${allReports.length} reportes obtenidos de todos los campos`);
          set({ reportsByUser: allReports, reportLoading: false });
          return allReports;
        } else {
          console.warn('No hay ID de usuario disponible para obtener reportes');
          set({ reportLoading: false, reportsByUser: [] });
          return [];
        }
      } catch (error) {
        console.error('Error al obtener reportes:', error);
        set({ reportLoading: false, reportError: 'Error al cargar los reportes' });
        return [];
      }
    } catch (error) {
      console.error('Error en getReportsByUser:', error);
      set({ reportLoading: false, reportError: 'Ocurrió un error inesperado' });
      return [];
    }
  },
  
  getReportsByField: async (fieldId: string) => {
    set({ reportLoading: true, reportError: null });
    
    try {
      const { token } = useAuthStore.getState();
      
      if (!token) {
        console.warn('No authentication token available');
        return [];
      }
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/byField/${fieldId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const reports = response.data || [];
      
      // Update the reports by field in the store
      set(state => ({
        reportsByField: {
          ...state.reportsByField,
          [fieldId]: reports
        },
        reportLoading: false
      }));
      
      return reports;
    } catch (error) {
      console.error(`Error fetching reports for field ${fieldId}:`, error);
      set({ reportLoading: false, reportError: `Failed to load reports for field ${fieldId}` });
      return [];
    }
  }
}));

export default useReportStore;
