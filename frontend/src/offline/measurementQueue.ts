import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { axiosInstance } from '../store/authStore';

const QUEUE_KEY = '@measurement_queue';

export interface QueuedMeasurementGroup {
  id: string; // ID temporal único para la cola
  name?: string;
  type_of_object_id: number;
  field_id: string;
  measurements: Array<{
    pen_variable_type_of_object_id: number;
    value: string;
    report_id: number;
  }>;
  timestamp: string; // Cuándo se agregó a la cola
}

/**
 * Agregar un grupo de mediciones (de un animal) a la cola offline
 */
export const addMeasurementToQueue = async (measurementGroup: Omit<QueuedMeasurementGroup, 'id' | 'timestamp'>): Promise<void> => {
  try {
    console.log('🔄 addMeasurementToQueue called with:', JSON.stringify(measurementGroup));
    
    const queue = await getQueue();
    console.log('📋 Current queue length:', queue.length);
    
    const queuedMeasurementGroup: QueuedMeasurementGroup = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...measurementGroup,
      timestamp: new Date().toISOString(),
    };
    
    console.log('📦 About to add to queue:', JSON.stringify(queuedMeasurementGroup));
    
    queue.push(queuedMeasurementGroup);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    
    console.log('✅ Measurement group added to offline queue:', queuedMeasurementGroup.id);
  } catch (error) {
    console.error('❌ Error adding measurement to queue:', error);
    console.error('❌ Error details:', JSON.stringify(error));
    throw error;
  }
};

/**
 * Obtener todos los grupos de mediciones en cola
 */
export const getQueue = async (): Promise<QueuedMeasurementGroup[]> => {
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
 * Eliminar un grupo de mediciones específico de la cola
 */
export const removeMeasurementFromQueue = async (measurementGroupId: string): Promise<void> => {
  try {
    const queue = await getQueue();
    const filteredQueue = queue.filter(m => m.id !== measurementGroupId);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filteredQueue));
    
    console.log('✅ Measurement group removed from queue:', measurementGroupId);
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
  
  for (const measurementGroup of queue) {
    try {
      console.log(`📤 Processing measurement group ${measurementGroup.id}...`);
      
      // Hacer el POST al endpoint original
      const response = await axiosInstance.post('/measurements', {
        name: measurementGroup.name,
        type_of_object_id: measurementGroup.type_of_object_id,
        field_id: measurementGroup.field_id,
        measurements: measurementGroup.measurements,
      });
      
      if (response.status === 200 || response.status === 201) {
        // Éxito: eliminar de la cola
        await removeMeasurementFromQueue(measurementGroup.id);
        successCount++;
        console.log(`✅ Measurement group ${measurementGroup.id} sent successfully`);
      } else {
        failedCount++;
        console.log(`❌ Measurement group ${measurementGroup.id} failed with status:`, response.status);
      }
      
    } catch (error) {
      failedCount++;
      console.log(`❌ Measurement group ${measurementGroup.id} failed with error:`, error);
      
      // Si es un error 400/404 (datos incorrectos), eliminar de la cola
      if (error?.response?.status === 400 || error?.response?.status === 404) {
        console.log(`🗑️ Removing measurement group ${measurementGroup.id} due to data error`);
        await removeMeasurementFromQueue(measurementGroup.id);
      }
    }
  }
  
  console.log(`🏁 Queue processing complete. Success: ${successCount}, Failed: ${failedCount}`);
  return { success: successCount, failed: failedCount };
};

