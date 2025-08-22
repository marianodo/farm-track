import AsyncStorage from '@react-native-async-storage/async-storage';
import { dbExec } from './db';

/**
 * LIMPIEZA TOTAL - Borra absolutamente todo lo offline
 */
export const cleanSlateReset = async (): Promise<void> => {
  console.log('🧹 STARTING COMPLETE CLEAN SLATE RESET...');
  
  try {
    // 1. Limpiar toda la base de datos SQLite
    console.log('Cleaning SQLite database...');
    try {
      await dbExec('DELETE FROM queue;');
      await dbExec('DELETE FROM id_map;');
      console.log('✅ SQLite cleaned');
    } catch (sqliteError) {
      console.log('⚠️ SQLite clean failed (may not exist):', sqliteError);
    }
    
    // 2. Limpiar TODO AsyncStorage relacionado con offline
    console.log('Cleaning AsyncStorage...');
    const keys = await AsyncStorage.getAllKeys();
    const offlineKeys = keys.filter(key => 
      key.includes('offline') || 
      key.includes('sync') || 
      key.includes('measurement') ||
      key.includes('@offline') ||
      key.includes('@sync')
    );
    
    if (offlineKeys.length > 0) {
      await AsyncStorage.multiRemove(offlineKeys);
      console.log('✅ AsyncStorage offline keys cleaned:', offlineKeys);
    }
    
    // 3. Resetear stores
    console.log('Resetting stores...');
    try {
      const { default: useSyncStore } = await import('../store/syncStore');
      const { default: useReportStore } = await import('../store/reportStore');
      
      // Resetear sync store
      const syncStore = useSyncStore.getState();
      syncStore.setPending(0);
      syncStore.setSyncing(false);
      
      // Resetear mediciones offline en report store
      const reportStore = useReportStore.getState();
      reportStore.offlineMeasurements = [];
      
      console.log('✅ Stores reset');
    } catch (storeError) {
      console.log('⚠️ Store reset failed:', storeError);
    }
    
    console.log('🎉 CLEAN SLATE RESET COMPLETE - Everything is clean!');
    
  } catch (error) {
    console.error('❌ Error during clean slate reset:', error);
    throw error;
  }
};

/**
 * Verificar que todo está realmente limpio
 */
export const verifyCleanSlate = async (): Promise<boolean> => {
  console.log('🔍 Verifying clean slate...');
  
  try {
    // Verificar SQLite
    const queueResult = await dbExec('SELECT COUNT(*) as count FROM queue;');
    const queueCount = queueResult.rows.item(0)?.count || 0;
    
    // Verificar AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    const offlineKeys = keys.filter(key => 
      key.includes('offline') || 
      key.includes('sync') || 
      key.includes('measurement')
    );
    
    const isClean = queueCount === 0 && offlineKeys.length === 0;
    
    console.log('Clean slate verification:', {
      queueCount,
      offlineKeysCount: offlineKeys.length,
      isClean
    });
    
    return isClean;
    
  } catch (error) {
    console.error('Error verifying clean slate:', error);
    return false;
  }
};

