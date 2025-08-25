import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useOfflineStore from '../store/offlineStore';
import { getQueueCount, processQueue, clearQueue } from '../offline/measurementQueue';
import useReportStore from '../store/reportStore';
import useMeasurementStatsStore from '../store/measurementStatsStore';
import useFieldStore from '../store/fieldStore';
import { invalidateCachePattern } from '../utils/cache';

const OfflineIndicator: React.FC = () => {
  const { 
    pendingCount, 
    isProcessing, 
    setPendingCount, 
    setIsProcessing 
  } = useOfflineStore();
  
  const { getAllReportsByField } = useReportStore();
  const { getStatsByField } = useMeasurementStatsStore();
  const { fieldId } = useFieldStore();
  
  const insets = useSafeAreaInsets();

  // Cargar contador al montar el componente
  useEffect(() => {
    const loadQueueCount = async () => {
      try {
        const count = await getQueueCount();
        setPendingCount(count);
      } catch (error) {
        console.error('Error loading queue count:', error);
      }
    };
    
    loadQueueCount();
  }, [setPendingCount]);

  const handleSync = async () => {
    if (isProcessing) {
      console.log('Already processing, ignoring request');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🔄 Starting sync process...');
      const result = await processQueue();
      
      // Actualizar contador después del sync
      const newCount = await getQueueCount();
      setPendingCount(newCount);
      
      // Si hubo sincronizaciones exitosas, refrescar datos
      if (result.success > 0) {
        console.log('🔄 Refreshing reports and stats after successful sync...');
        if (fieldId) {
          try {
            // 1. Invalidar caché de reportes y mediciones (con timeout)
            console.log('🔄 Step 1: Invalidating cache...');
            
            const cacheTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Cache invalidation timeout')), 10000); // 10 segundos
            });
            
            await Promise.race([
              Promise.all([
                invalidateCachePattern('cache_reports'),
                invalidateCachePattern('cache_report_by_id')
              ]),
              cacheTimeout
            ]);
            
            console.log('✅ Cache invalidated');
            
            // 2. Refrescar reportes del campo (con timeout)
            console.log('🔄 Step 2: Refreshing reports...');
            const reportsTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Reports refresh timeout')), 15000); // 15 segundos
            });
            
            await Promise.race([
              getAllReportsByField(fieldId, true), // true = forceRefresh
              reportsTimeout
            ]);
            console.log('✅ Reports refreshed');
            
            // 3. Refrescar estadísticas del campo (con timeout)
            console.log('🔄 Step 3: Refreshing stats...');
            const statsTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Stats refresh timeout')), 15000); // 15 segundos
            });
            
            await Promise.race([
              getStatsByField(fieldId, true, true, true, true, true, true, true), // true = forceRefresh
              statsTimeout
            ]);
            console.log('✅ Stats refreshed');
            
            // 4. Si hay un reporte abierto, refrescarlo también (con timeout)
            console.log('🔄 Step 4: Checking for open report...');
            const currentReportId = useReportStore.getState().reportById?.[0]?.id;
            
            if (currentReportId) {
              console.log(`🔄 Refreshing current report ${currentReportId}...`);
              const reportTimeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Report refresh timeout')), 15000); // 15 segundos
              });
              
              await Promise.race([
                useReportStore.getState().getReportById(currentReportId, undefined, true),
                reportTimeout
              ]);
              console.log('✅ Current report refreshed');
            } else {
              console.log('ℹ️ No open report to refresh');
            }
            
            console.log('✅ All refresh operations completed successfully');
            
          } catch (refreshError) {
            console.error('⚠️ Warning: Some refresh operations failed:', refreshError);
            // No fallar el sync por errores en refresh
            // Mostrar alerta de advertencia pero no bloquear
            Alert.alert(
              '⚠️ Advertencia',
              'La sincronización fue exitosa, pero algunos datos podrían no estar completamente actualizados. Puedes refrescar manualmente si es necesario.',
              [{ text: 'OK' }]
            );
          }
        }
      }
      
      if (result.success > 0 || result.failed === 0) {
        Alert.alert(
          '✅ Sincronización Exitosa',
          `Se enviaron ${result.success} mediciones correctamente.${result.failed > 0 ? `\n\n${result.failed} mediciones fallaron y se mantienen en la cola.` : ''}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '⚠️ Errores en Sincronización',
          `${result.failed} mediciones fallaron al enviar. Se mantienen en la cola para intentar más tarde.`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Error during sync:', error);
      Alert.alert(
        '❌ Error de Sincronización',
        `No se pudo completar la sincronización: ${error}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = async () => {
    Alert.alert(
      '🗑️ Limpiar Cola',
      '¿Estás seguro de que quieres eliminar todas las mediciones pendientes?\n\n¡Esta acción no se puede deshacer!',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearQueue();
              setPendingCount(0);
              Alert.alert('✅ Cola Limpia', 'Todas las mediciones pendientes han sido eliminadas.');
            } catch (error) {
              Alert.alert('❌ Error', `No se pudo limpiar la cola: ${error}`);
            }
          }
        }
      ]
    );
  };

  // No mostrar si no hay pendientes y no estamos procesando
  if (pendingCount === 0 && !isProcessing) {
    return null;
  }

  return (
    <View style={[styles.container, { top: insets.top + 8 }]}>
      <View style={styles.content}>
        <Text style={styles.text}>
          {isProcessing ? 'Sincronizando...' : `Pendientes: ${pendingCount}`}
        </Text>
        
        {!isProcessing && (
          <>
            <TouchableOpacity 
              style={styles.syncButton} 
              onPress={handleSync}
            >
              <Text style={styles.buttonText}>Sync</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={handleClear}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 10,
    backgroundColor: 'rgba(255, 152, 0, 0.9)', // Naranja para indicar estado offline
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  syncButton: {
    backgroundColor: '#28a745', // Verde para sincronizar
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  clearButton: {
    backgroundColor: '#dc3545', // Rojo para limpiar
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default OfflineIndicator;
