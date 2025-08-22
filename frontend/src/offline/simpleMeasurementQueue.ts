import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = '@measurement_queue';

export interface QueuedMeasurement {
  id: string; // ID temporal único
  reportId: number; // ID del reporte (que ya existe)
  data: {
    pen_variable_type_of_object_id: number;
    value: string;
    subject_id: number;
  };
  createdAt: string; // timestamp
}

/**
 * Agregar una medición a la cola offline
 */
export const addMeasurementToQueue = async (measurement: Omit<QueuedMeasurement, 'id' | 'createdAt'>): Promise<void> => {
  try {
    const queue = await getQueue();
    
    const queuedMeasurement: QueuedMeasurement = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...measurement,
      createdAt: new Date().toISOString(),
    };
    
    queue.push(queuedMeasurement);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    
    console.log('✅ Measurement added to offline queue:', queuedMeasurement.id);
  } catch (error) {
    console.error('❌ Error adding measurement to queue:', error);
    throw error;
  }
};

/**
 * Obtener todas las mediciones en cola
 */
export const getQueue = async (): Promise<QueuedMeasurement[]> => {
  try {
    const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('❌ Error getting queue:', error);
    return [];
  }
};

/**
 * Obtener el número de mediciones en cola
 */
export const getQueueCount = async (): Promise<number> => {
  try {
    const queue = await getQueue();
    return queue.length;
  } catch (error) {
    console.error('❌ Error getting queue count:', error);
    return 0;
  }
};

/**
 * Eliminar una medición específica de la cola
 */
export const removeMeasurementFromQueue = async (measurementId: string): Promise<void> => {
  try {
    const queue = await getQueue();
    const filteredQueue = queue.filter(m => m.id !== measurementId);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filteredQueue));
    
    console.log('✅ Measurement removed from queue:', measurementId);
  } catch (error) {
    console.error('❌ Error removing measurement from queue:', error);
    throw error;
  }
};

/**
 * Limpiar toda la cola
 */
export const clearQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
    console.log('✅ Measurement queue cleared');
  } catch (error) {
    console.error('❌ Error clearing queue:', error);
    throw error;
  }
};

/**
 * Verificar si hay conexión a internet
 */
export const isOnline = async (): Promise<boolean> => {
  try {
    const netInfo = await NetInfo.fetch();
    return !!netInfo.isConnected && !!netInfo.isInternetReachable;
  } catch (error) {
    console.error('❌ Error checking network status:', error);
    return false;
  }
};

/**
 * Procesar la cola: enviar todas las mediciones al servidor
 */
export const processQueue = async (): Promise<{ success: number; failed: number }> => {
  console.log('🔄 Starting queue processing...');
  
  const queue = await getQueue();
  if (queue.length === 0) {
    console.log('📝 Queue is empty, nothing to process');
    return { success: 0, failed: 0 };
  }
  
  let successCount = 0;
  let failedCount = 0;
  
  for (const measurement of queue) {
    try {
      console.log(`📤 Processing measurement ${measurement.id}...`);
      
      // Hacer el POST al endpoint de measurements
      const { axiosInstance } = await import('../store/authStore');
      
      const response = await axiosInstance.post('/measurements/single', {
        report_id: measurement.reportId,
        pen_variable_type_of_object_id: measurement.data.pen_variable_type_of_object_id,
        value: measurement.data.value,
        subject_id: measurement.data.subject_id,
      });
      
      if (response.status === 200 || response.status === 201) {
        // Éxito: eliminar de la cola
        await removeMeasurementFromQueue(measurement.id);
        successCount++;
        console.log(`✅ Measurement ${measurement.id} sent successfully`);
      } else {
        failedCount++;
        console.log(`❌ Measurement ${measurement.id} failed with status:`, response.status);
      }
      
    } catch (error) {
      failedCount++;
      console.log(`❌ Measurement ${measurement.id} failed with error:`, error);
      
      // Si es un error 400/404 (datos incorrectos), eliminar de la cola
      if (error?.response?.status === 400 || error?.response?.status === 404) {
        console.log(`🗑️ Removing measurement ${measurement.id} due to data error`);
        await removeMeasurementFromQueue(measurement.id);
      }
    }
  }
  
  console.log(`🏁 Queue processing complete. Success: ${successCount}, Failed: ${failedCount}`);
  return { success: successCount, failed: failedCount };
};

