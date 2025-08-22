import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { saveLog } from './logger';

// Configuración
const MAX_ERROR_LOGS = 50;
const ERROR_LOG_FILE = `${FileSystem.documentDirectory}error_logs.json`;

// Lista de errores que queremos ignorar completamente
const IGNORED_ERRORS = [
  'SplashModule.internalMaybeHideAsync is not a function',
  'SplashModule.internalMaybeHideAsync',
  'SplashScreen',
  'SplashModule'
];

// Función para verificar si un error debe ser ignorado
const shouldIgnoreError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = typeof error === 'string' ? error : 
                      error.message || 
                      error.toString() || 
                      JSON.stringify(error);
  
  return IGNORED_ERRORS.some(ignoredError => 
    errorMessage.includes(ignoredError)
  );
};

// Interfaz para los errores guardados
interface ErrorLog {
  timestamp: string;
  error: string;
  componentStack?: string;
  jsEngine?: string;
  message?: string;
  name?: string;
  stack?: string;
}

// Cargar errores previos
export const loadErrorLogs = async (): Promise<ErrorLog[]> => {
  try {
    const fileExists = await FileSystem.getInfoAsync(ERROR_LOG_FILE);
    if (!fileExists.exists) {
      return [];
    }
    
    const content = await FileSystem.readAsStringAsync(ERROR_LOG_FILE);
    return JSON.parse(content);
  } catch (e) {
    console.error('Error loading error logs:', e);
    return [];
  }
};

// Guardar un nuevo error
export const saveErrorLog = async (error: any, componentStack?: string): Promise<void> => {
  try {
    // Crear el objeto de error
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      error: typeof error === 'string' ? error : JSON.stringify(error),
      componentStack,
      jsEngine: error.jsEngine,
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
    
    // Guardar también en el sistema de logs normal
    await saveLog('CRITICAL ERROR', {
      error: errorLog.error,
      message: errorLog.message,
      stack: errorLog.stack?.slice(0, 500),
      componentStack: errorLog.componentStack?.slice(0, 500),
    }, 'error');
    
    // Cargar logs existentes
    let logs = await loadErrorLogs();
    
    // Añadir el nuevo log
    logs.unshift(errorLog);
    
    // Limitar el número de logs
    if (logs.length > MAX_ERROR_LOGS) {
      logs = logs.slice(0, MAX_ERROR_LOGS);
    }
    
    // Guardar los logs
    await FileSystem.writeAsStringAsync(ERROR_LOG_FILE, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving error log:', e);
  }
};

// Mostrar un diálogo de error amigable
export const showErrorDialog = (error: any): void => {
  let message = 'Se ha producido un error inesperado.';
  
  if (error && typeof error === 'object' && error.message) {
    if (error.message.includes('Network Error') || error.message.includes('timeout')) {
      message = 'Error de conexión. Por favor verifica tu conexión a internet e intenta nuevamente.';
    } else {
      message = `Error: ${error.message.slice(0, 100)}`;
    }
  }
  
  Alert.alert(
    'Error',
    message,
    [{ text: 'OK', style: 'default' }]
  );
};

// Manejador global de errores no capturados
export const setupGlobalErrorHandler = (): void => {
  // Para errores de JavaScript
  const originalErrorHandler = ErrorUtils.getGlobalHandler();
  
  ErrorUtils.setGlobalHandler(async (error, isFatal) => {
    // Verificar si debemos ignorar este error
    if (shouldIgnoreError(error)) {
      console.log('Ignorando error conocido:', error?.message || error);
      return;
    }
    
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.error('GLOBAL ERROR:', errorMessage, 'Fatal:', isFatal);
    
    // Guardar error crítico si es fatal
    if (isFatal) {
      await saveErrorBeforeRestart(`Fatal Error: ${errorMessage}`);
    }
    
    try {
      await saveErrorLog(error);
      
      // En desarrollo, mostrar el error original
      if (__DEV__) {
        originalErrorHandler(error, isFatal);
      } else {
        // En producción, mostrar un mensaje amigable
        showErrorDialog(error);
      }
    } catch (handlerError) {
      console.error('Error in error handler:', handlerError);
      originalErrorHandler(error, isFatal);
    }
  });
  
  // Para errores de promesas no capturadas
  if (Platform.OS !== 'web') {
    // @ts-ignore
    if (global.HermesInternal) {
      // @ts-ignore
      global.HermesInternal.enablePromiseRejectionTracker?.({
        allRejections: true,
        onUnhandled: async (id: number, error: any) => {
          // Verificar si debemos ignorar este error usando nuestra función centralizada
          if (shouldIgnoreError(error)) {
            console.log('Ignorando error conocido de promesa rechazada:', error?.message || error);
            return;
          }
          
          const errorMessage = error?.message || error?.toString() || 'Unknown promise rejection';
          console.error('UNHANDLED PROMISE REJECTION:', errorMessage);
          
          // Guardar error crítico para promesas rechazadas importantes
          await saveErrorBeforeRestart(`Promise Rejection: ${errorMessage}`);
          
          await saveErrorLog(error);
          showErrorDialog(error);
        },
        onHandled: (id: number) => {
          // No hacer nada cuando se maneja una promesa rechazada
        }
      });
    }
  }
};

// Función para limpiar los logs de errores
export const clearErrorLogs = async (): Promise<void> => {
  try {
    await FileSystem.writeAsStringAsync(ERROR_LOG_FILE, JSON.stringify([]));
  } catch (e) {
    console.error('Error clearing error logs:', e);
  }
};

// Función para guardar errores críticos antes del reinicio
const saveErrorBeforeRestart = async (error: string) => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const timestamp = new Date().toISOString();
    const errorData = {
      error,
      timestamp,
      type: 'critical_before_restart'
    };
    await AsyncStorage.setItem('@last_critical_error', JSON.stringify(errorData));
    console.log('Critical error saved:', errorData);
  } catch (e) {
    console.error('Failed to save critical error:', e);
  }
};

// Función para recuperar el último error crítico
export const getLastCriticalError = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const errorJson = await AsyncStorage.getItem('@last_critical_error');
    if (errorJson) {
      const errorData = JSON.parse(errorJson);
      // Limpiar el error después de leerlo
      await AsyncStorage.removeItem('@last_critical_error');
      return errorData;
    }
    return null;
  } catch (e) {
    console.error('Failed to get last critical error:', e);
    return null;
  }
};
