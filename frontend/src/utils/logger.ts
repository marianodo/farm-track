import AsyncStorage from '@react-native-async-storage/async-storage';

// Función para guardar logs persistentes
export const saveLog = async (message: string, data?: any, category: string = 'general') => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      category,
      data: data ? JSON.stringify(data) : null
    };
    
    const existingLogs = await AsyncStorage.getItem('app_logs');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(logEntry);
    
    // Mantener solo los últimos 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    await AsyncStorage.setItem('app_logs', JSON.stringify(logs));
    console.log(`[${category.toUpperCase()}] ${message}`, data);
  } catch (error) {
    console.error('Error saving log:', error);
  }
};

// Función para obtener logs guardados
export const getLogs = async (category?: string) => {
  try {
    const logs = await AsyncStorage.getItem('app_logs');
    if (logs) {
      const parsedLogs = JSON.parse(logs);
      if (category) {
        return parsedLogs.filter((log: any) => log.category === category);
      }
      return parsedLogs;
    }
    return [];
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
};

// Función para limpiar logs
export const clearLogs = async () => {
  try {
    await AsyncStorage.removeItem('app_logs');
    console.log('Logs cleared successfully');
  } catch (error) {
    console.error('Error clearing logs:', error);
  }
};

// Función para exportar logs
export const exportLogs = async () => {
  try {
    const logs = await getLogs();
    return JSON.stringify(logs, null, 2);
  } catch (error) {
    console.error('Error exporting logs:', error);
    return '';
  }
}; 