import NetInfo from '@react-native-community/netinfo';
import { processQueue, getQueueLength } from './queue';

let unsubscribe: (() => void) | null = null;

// Variable para evitar procesar la cola múltiples veces simultáneamente
let isProcessingQueue = false;

// Variable para rastrear el último estado de conexión conocido
let lastConnectionState = false;

export const initNetworkListener = (
  getBaseUrl: () => string,
  getAuthHeader: () => Promise<string | null>,
  onSyncState?: (syncing: boolean, pending: number) => void,
) => {
  if (unsubscribe) return;
  
  // Verificar el estado inicial de la conexión
  NetInfo.fetch().then(async (state) => {
    lastConnectionState = !!state.isConnected;
    console.log(`Initial network state: ${lastConnectionState ? 'connected' : 'disconnected'}`);
    
    // NO procesar la cola automáticamente al inicio para evitar reinicios
    console.log('Network listener initialized but auto-sync disabled to prevent app restarts');
  });
  
  // Configurar el listener para cambios de conectividad PERO NO PROCESAR AUTOMÁTICAMENTE
  unsubscribe = NetInfo.addEventListener(async (state) => {
    const isOnline = !!state.isConnected;
    console.log(`Network state changed: ${isOnline ? 'connected' : 'disconnected'}`);
    
    // Solo actualizar el estado, NO procesar automáticamente
    if (isOnline && !lastConnectionState) {
      console.log('Connection restored, but auto-sync disabled. Use manual sync button.');
      // Notificar que hay conexión pero no procesar automáticamente
      if (onSyncState) {
        try {
          const pending = await getQueueLength();
          onSyncState(false, pending);
        } catch (e) {
          console.error('Error getting queue length:', e);
        }
      }
    }
    
    // Actualizar el último estado conocido
    lastConnectionState = isOnline;
  });
};

// Función auxiliar para procesar la cola si es necesario
const processQueueIfNeeded = async (
  getBaseUrl: () => string,
  getAuthHeader: () => Promise<string | null>,
  onSyncState?: (syncing: boolean, pending: number) => void,
) => {
  // Evitar procesar la cola múltiples veces simultáneamente
  if (isProcessingQueue) {
    console.log('Queue is already being processed, skipping');
    return;
  }
  
  try {
    isProcessingQueue = true;
    
    // Verificar si hay elementos pendientes
    let pending = 0;
    try {
      pending = await getQueueLength();
      console.log(`Queue length: ${pending}`);
    } catch (e) {
      console.error('Error getting queue length:', e);
      isProcessingQueue = false;
      return;
    }
    
    if (pending <= 0) {
      console.log('No pending items, skipping queue processing');
      isProcessingQueue = false;
      return;
    }
    
    // Notificar que estamos sincronizando
    try {
      onSyncState?.(true, pending);
    } catch (e) {
      console.error('Error updating sync state (start):', e);
      // Continue processing even if UI update fails
    }
    
    console.log('Starting queue processing...');
    
    // Procesar la cola con manejo de errores
    try {
      const baseUrl = getBaseUrl();
      console.log('Got baseUrl:', baseUrl);
      
      let auth = null;
      try {
        auth = await getAuthHeader();
        console.log('Got auth header:', auth ? 'Yes (auth token present)' : 'No auth token');
      } catch (authError) {
        console.error('Error getting auth header:', authError);
        // Continue without auth header
      }
      
      const authString = auth || undefined;
      await processQueue(baseUrl, authString);
      console.log('Queue processing completed successfully');
    } catch (processError) {
      console.error('Error in processQueue:', processError);
      // Continue to finally block
    }
  } catch (outerError) {
    // Capturar cualquier error no manejado
    console.error('CRITICAL ERROR in processQueueIfNeeded:', outerError);
  } finally {
    // Actualizar el estado final, con manejo de errores
    try {
      const left = await getQueueLength();
      try {
        onSyncState?.(false, left);
      } catch (e) {
        console.error('Error updating sync state (end):', e);
      }
    } catch (e) {
      console.error('Error getting final queue length:', e);
      try {
        onSyncState?.(false, 0);
      } catch (syncError) {
        console.error('Error updating final sync state:', syncError);
      }
    }
    
    // Siempre liberar el bloqueo de procesamiento
    isProcessingQueue = false;
    console.log('Queue processing function completed');
  }
};

export const disposeNetworkListener = () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
};

// Función para procesar la cola manualmente (útil para depuración o forzar sincronización)
export const manualProcessQueue = async (
  getBaseUrl: () => string,
  getAuthHeader: () => Promise<string | null>,
  onSyncState?: (syncing: boolean, pending: number) => void,
) => {
  console.log('Manually processing queue...');
  try {
    // Verificar que tenemos una URL base válida
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      console.error('Manual process queue failed: No base URL provided');
      return;
    }
    
    // Resolver el token antes de procesar
    const authHeader = await getAuthHeader();
    console.log('Manual sync auth header:', authHeader ? 'Present' : 'Missing');
    
    // Llamar directamente a processQueue con el token resuelto
    if (onSyncState) {
      const pending = await getQueueLength();
      onSyncState(true, pending);
    }
    
    await processQueue(baseUrl, authHeader || undefined);
    
    if (onSyncState) {
      const remaining = await getQueueLength();
      onSyncState(false, remaining);
    }
    console.log('Manual queue processing completed');
  } catch (error) {
    console.error('Error in manual queue processing:', error);
    // Asegurarse de que el indicador de sincronización se actualice
    try {
      onSyncState?.(false, await getQueueLength());
    } catch (e) {
      console.error('Failed to update sync state after manual processing error:', e);
    }
  }
}; 