import NetInfo from '@react-native-community/netinfo';
import { setCache } from './cache';
import { axiosInstance } from '@/store/authStore';
import useAuthStore from '@/store/authStore';
import useFieldStore from '@/store/fieldStore';
import useWarmupStore from '@/store/warmupStore';

export const warmUpData = async () => {
  const net = await NetInfo.fetch();
  if (!net.isConnected) {
    console.log('📴 Skipping warm-up: offline');
    return;
  }

  const userId = useAuthStore.getState().userId;
  if (!userId) {
    console.log('⚠️ Skipping warm-up: no userId');
    return;
  }

  console.log('🔥 Starting enhanced warm-up for user:', userId);
  
  const { setWarming, setProgress } = useWarmupStore.getState();
  setWarming(true);

  try {
    // Import stores dinámicamente para optimizar bundle
    const [
      { default: useTypeOfObjectStore },
      { default: useVariableStore },
      { default: usePenStore },
      { default: useReportStore },
      { default: usePenVarTypeStore }
    ] = await Promise.all([
      import('@/store/typeOfObjectStore'),
      import('@/store/variableStore'),
      import('@/store/penStore'),
      import('@/store/reportStore'),
      import('@/store/pen_variable_typeOfObject_store')
    ]);

    // 1. Cargar datos de usuario en paralelo
    console.log('📊 Loading user-level data...');
    setProgress(20, 'Loading user data...');
    
    const [fields] = await Promise.all([
      useFieldStore.getState().getFieldsByUser(userId, true),
      useTypeOfObjectStore.getState().getAllTypeOfObjects(true),
      useVariableStore.getState().getAllVariables(true),
    ]);

    const fieldsData = useFieldStore.getState().fieldsByUserId || [];
    const typeOfObjects = useTypeOfObjectStore.getState().typeOfObjects || [];
    
    console.log(`🏃 Found ${fieldsData.length} fields, ${typeOfObjects.length} type of objects`);

    // 2. Cargar datos por field en paralelo
    console.log('🌾 Loading field-specific data...');
    setProgress(50, 'Loading field data...');
    
    await Promise.all(
      fieldsData.map(async (field) => {
        try {
          // Cargar pens y reportes en paralelo para cada field
          await Promise.all([
            usePenStore.getState().getAllPens(field.id, undefined, true, true),
            useReportStore.getState().getAllReportsByField(field.id, true)
          ]);

          // Cachear estadísticas de mediciones por reporte
          const reports = useReportStore.getState().reportsByFielId?.[field.id] || [];
          console.log(`🔍 DEBUG: Found ${reports.length} reports for field ${field.id}`);
          console.log(`🔍 DEBUG: Reports:`, reports.map(r => ({ id: r.id, name: r.name })));
          
          if (reports.length > 0) {
            console.log(`📊 Caching stats and measurements for ${reports.length} reports in field ${field.id}...`);
            
            // Importar measurementStatsStore dinámicamente
            const { default: useMeasurementStatsStore } = await import('@/store/measurementStatsStore');
            
            // Cachear estadísticas y mediciones por reporte en paralelo
            await Promise.all(
              reports.map(async (report: any) => {
                try {
                  // 1. Cachear estadísticas del reporte
                  console.log(`📋 Store: Fetching stats for report ${report.id}...`);
                  await useMeasurementStatsStore.getState().getStatsByReport(
                    String(report.id),
                    true, // totalMeasurement
                    true, // byObject
                    true, // byPen
                    true, // byVariable
                    true, // byVariableByPen
                    field.id,
                    true // forceRefresh para cachear
                  );

                  // 2. Cachear mediciones individuales del reporte
                  console.log(`📋 Store: Fetching measurements for report ${report.id}...`);
                  await useReportStore.getState().getReportById(report.id, undefined, true); // forceRefresh
                  
                } catch (error) {
                  console.log(`⚠️ Error caching data for report ${report.id}:`, error);
                }
              })
            );
          }
        } catch (error) {
          console.log(`⚠️ Error loading data for field ${field.id}:`, error);
        }
      })
    );

    // 3. Precachear combinaciones pen x type-of-object
    console.log('🔗 Pre-caching pen-variable-type-of-object combinations...');
    setProgress(85, 'Caching combinations...');
    
    const precachePromises: Promise<any>[] = [];
    
    for (const field of fieldsData) {
      const pensByField = usePenStore.getState().pens?.[field.id] || [];
      
      // Debug: verificar si pens están cargados
      console.log(`🔍 DEBUG: Found ${pensByField.length} pens for field ${field.id}`);
      
      for (const pen of pensByField) {
        for (const typeOfObject of typeOfObjects) {
          // Agregar a la cola de promesas sin await
          precachePromises.push(
            usePenVarTypeStore.getState()
              .getPenVariableTypeOfObjectsByObjectIdAndPen(typeOfObject.id, Number(pen.id), true)
              .catch(() => {}) // Silenciar errores individuales
          );
        }
      }
    }

    // Ejecutar todas las combinaciones en paralelo (con limite)
    const BATCH_SIZE = 10; // Procesar de 10 en 10 para no saturar
    for (let i = 0; i < precachePromises.length; i += BATCH_SIZE) {
      const batch = precachePromises.slice(i, i + BATCH_SIZE);
      await Promise.all(batch);
    }

    console.log(`✅ Warm-up completed: ${precachePromises.length} combinations cached`);
    setProgress(100, 'Warm-up completed!');
    
    // Esperar un poco antes de ocultar
    setTimeout(() => {
      setWarming(false);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error during warm-up:', error);
    setWarming(false);
  }
};

const TTL_1H = 60 * 60 * 1000;

export const warmUpMeasurementData = async () => {
  const net = await NetInfo.fetch();
  if (!net.isConnected) {
    console.log('📴 Skipping measurement warm-up: offline');
    return;
  }

  const userId = useAuthStore.getState().userId;
  if (!userId) {
    console.log('⚠️ Skipping measurement warm-up: no userId');
    return;
  }

  console.log('🎯 Starting measurement-specific warm-up...');

  try {
    // Usar cache directo para datos que no necesitan store state
    console.log('💾 Caching raw API responses...');
    
    const [fieldsRes, toRes, varRes] = await Promise.all([
      axiosInstance.get(`/fields/byUserId/${userId}`),
      axiosInstance.get(`/type-of-objects/byUser/${userId}`),
      axiosInstance.get(`/variables/byUser/${userId}`),
    ]);

    // Cache de respuestas raw (útil para offline)
    await Promise.all([
      setCache(`fields_byUser_${userId}`, fieldsRes.data, TTL_1H),
      setCache(`type_of_objects_byUser_${userId}`, toRes.data, TTL_1H),
      setCache(`variables_byUser_${userId}`, varRes.data, TTL_1H)
    ]);

    const fields = fieldsRes.data as Array<{ id: string }>;
    const typeOfObjects = toRes.data;

    console.log(`📋 Caching ${fields.length} fields, reports and measurement stats...`);

    // Procesar fields en batches para no saturar
    const FIELD_BATCH_SIZE = 3;
    for (let i = 0; i < fields.length; i += FIELD_BATCH_SIZE) {
      const fieldBatch = fields.slice(i, i + FIELD_BATCH_SIZE);
      
      await Promise.all(fieldBatch.map(async (field) => {
        try {
          // Cache pens data
          const pensRes = await axiosInstance.get(`/pens/byField/${field.id}`, { 
            params: { withObjects: true } 
          });
          await setCache(`pens_byField_${field.id}_withObjects`, pensRes.data, TTL_1H);

          // Cache reports and their measurement stats
          const reportsRes = await axiosInstance.get(`/reports/byField/${field.id}`);
          await setCache(`reports_byField_${field.id}`, reportsRes.data, TTL_1H);
          
          // Cache measurement stats per report
          console.log(`🔍 DEBUG (API): Found ${reportsRes.data?.length || 0} reports for field ${field.id}`);
          if (reportsRes.data && reportsRes.data.length > 0) {
            console.log(`📊 API: Caching stats and measurements for ${reportsRes.data.length} reports...`);
            const reportStatsPromises = reportsRes.data.map(async (report: any) => {
              try {
                // 1. Cachear estadísticas del reporte
                console.log(`📋 API: Fetching stats for report ${report.id}...`);
                const statsRes = await axiosInstance.get(
                  `/measurements/stats/byReportId/${report.id}`,
                  {
                    params: {
                      totalMeasurement: true,
                      byObject: true,
                      byPen: true,
                      byVariable: true,
                      byVariableByPen: true,
                      byField: field.id
                    }
                  }
                );
                await setCache(
                  `measurement_stats_report_${report.id}_${field.id}`,
                  statsRes.data,
                  TTL_1H
                );

                // 2. Cachear mediciones individuales del reporte
                console.log(`📋 API: Fetching measurements for report ${report.id}...`);
                const measurementsRes = await axiosInstance.get(`/reports/${report.id}`);
                await setCache(
                  `report_with_measurements_${report.id}`,
                  measurementsRes.data,
                  TTL_1H
                );
                
              } catch (error) {
                // Skip errores para reportes sin mediciones
                console.log(`No data for report ${report.id}:`, error?.message || error);
              }
            });
            
            // Procesar stats en mini-batches
            const STATS_BATCH_SIZE = 3;
            for (let k = 0; k < reportStatsPromises.length; k += STATS_BATCH_SIZE) {
              const batch = reportStatsPromises.slice(k, k + STATS_BATCH_SIZE);
              await Promise.all(batch);
            }
          }
          
          // Cache pen-variable-type-of-object combinations (más eficiente)
          const penVarPromises: Promise<void>[] = [];
          
          for (const pen of pensRes.data) {
            for (const typeOfObject of typeOfObjects) {
              penVarPromises.push(
                axiosInstance.get(`/pens-variables-type-of-objects/type-of-object/${typeOfObject.id}/${pen.id}`)
                  .then(res => setCache(
                    `pen_variables_type_of_object_${typeOfObject.id}_${pen.id}`,
                    res.data,
                    TTL_1H
                  ))
                  .catch(() => {}) // Silent fail para combinaciones que no existen
              );
            }
          }
          
          // Procesar en mini-batches para esta field
          const PEN_BATCH_SIZE = 5;
          for (let j = 0; j < penVarPromises.length; j += PEN_BATCH_SIZE) {
            const batch = penVarPromises.slice(j, j + PEN_BATCH_SIZE);
            await Promise.all(batch);
          }
          
        } catch (error) {
          console.log(`⚠️ Error caching field ${field.id}:`, error);
        }
      }));
    }

    console.log('✅ Measurement warm-up completed');
  } catch (error) {
    console.error('❌ Error during measurement warm-up:', error);
  }
}; 