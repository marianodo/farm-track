import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { axiosInstance } from '../store/authStore';

const REPORT_QUEUE_KEY = '@offline_reports_queue';

export interface QueuedReport {
  id: string; // ID temporal único para la cola
  report: {
    name?: string;
    comment?: string;
  };
  productivity?: {
    total_cows?: number;
    milking_cows?: number;
    average_production?: number;
    somatic_cells?: number;
    percentage_of_fat?: number;
    percentage_of_protein?: number;
    userId: string;
  };
  field_id: string;
  timestamp: string;
  tempReportId?: string; // ID temporal para referencias offline
}

/**
 * Agregar un reporte a la cola offline
 */
export const addReportToQueue = async (reportData: {
  report: {
    name?: string;
    comment?: string;
  };
  productivity?: {
    total_cows?: number;
    milking_cows?: number;
    average_production?: number;
    somatic_cells?: number;
    percentage_of_fat?: number;
    percentage_of_protein?: number;
    userId: string;
  };
  field_id: string;
}): Promise<void> => {
  try {
    const queueData = await AsyncStorage.getItem(REPORT_QUEUE_KEY);
    const queue = queueData ? JSON.parse(queueData) : [];
    
    const queuedReport: QueuedReport = {
      id: `offline-report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      report: reportData.report,
      productivity: reportData.productivity,
      field_id: reportData.field_id,
      timestamp: new Date().toISOString(),
    };
    
    queue.push(queuedReport);
    await AsyncStorage.setItem(REPORT_QUEUE_KEY, JSON.stringify(queue));
    
    console.log('✅ Report added to offline queue:', queuedReport.id);
  } catch (error) {
    console.error('❌ Error adding report to queue:', error);
    throw error;
  }
};

/**
 * Obtener la cola de reportes offline
 */
export const getReportQueue = async (): Promise<QueuedReport[]> => {
  try {
    const queueData = await AsyncStorage.getItem(REPORT_QUEUE_KEY);
    return queueData ? JSON.parse(queueData) : [];
  } catch (error) {
    console.error('❌ Error getting report queue:', error);
    return [];
  }
};

/**
 * Obtener el número de reportes en cola
 */
export const getReportQueueCount = async (): Promise<number> => {
  try {
    const queue = await getReportQueue();
    return queue.length;
  } catch (error) {
    console.error('❌ Error getting report queue count:', error);
    return 0;
  }
};

/**
 * Procesar la cola de reportes offline
 */
export const processReportQueue = async (): Promise<{ success: number; failed: number }> => {
  try {
    const queue = await getReportQueue();
    
    if (queue.length === 0) {
      return { success: 0, failed: 0 };
    }
    
    console.log(`�� Processing ${queue.length} offline reports...`);
    
    let successCount = 0;
    let failedCount = 0;
    const remainingQueue = [];
    
    for (const queuedReport of queue) {
      try {
        console.log(`📤 Syncing report ${queuedReport.id}...`);
        
        // Verificar que el reporte tenga la estructura correcta
        if (!queuedReport.report || !queuedReport.field_id) {
          console.error(`❌ Invalid report structure for ${queuedReport.id}:`, queuedReport);
          remainingQueue.push(queuedReport);
          failedCount++;
          continue;
        }
        
        // Preparar datos para el servidor
        const reportData = {
          report: queuedReport.report,
          productivity: queuedReport.productivity
        };
        
        // Enviar al servidor
        const response = await axiosInstance.post(`/reports/byFieldId/${queuedReport.field_id}`, reportData);
        
        console.log(`✅ Report synced successfully: ${queuedReport.id} -> ${response.data.id}`);
        successCount++;
        
        // Pequeño delay entre reportes
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error: any) {
        console.error(`❌ Failed to sync report ${queuedReport.id}:`, error?.message || error);
        
        // Si es un error de datos (400/404), no reintentar
        if (error?.response?.status === 400 || error?.response?.status === 404) {
          console.log(`⚠️ Report ${queuedReport.id} has invalid data, removing from queue`);
          failedCount++;
        } else {
          // Otros errores, mantener en la cola para reintentar
          remainingQueue.push(queuedReport);
          failedCount++;
        }
      }
    }
    
    // Actualizar la cola con los reportes que fallaron
    await AsyncStorage.setItem(REPORT_QUEUE_KEY, JSON.stringify(remainingQueue));
    
    console.log(`✅ Report queue processed: ${successCount} success, ${failedCount} failed`);
    return { success: successCount, failed: failedCount };
    
  } catch (error) {
    console.error('❌ Error processing report queue:', error);
    return { success: 0, failed: 0 };
  }
};

/**
 * Limpiar la cola de reportes offline
 */
export const clearReportQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(REPORT_QUEUE_KEY);
    console.log('✅ Report queue cleared');
  } catch (error) {
    console.error('❌ Error clearing report queue:', error);
    throw error;
  }
};

/**
 * Verificar si hay reportes en la cola
 */
export const hasReportQueue = async (): Promise<boolean> => {
  try {
    const count = await getReportQueueCount();
    return count > 0;
  } catch (error) {
    console.error('❌ Error checking report queue:', error);
    return false;
  }
};