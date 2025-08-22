import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useOfflineStore from '../store/offlineStore';
import { getQueueCount, processQueue, clearQueue } from '../offline/measurementQueue';
import useReportStore from '../store/reportStore';
import useMeasurementStatsStore from '../store/measurementStatsStore';
import useFieldStore from '../store/fieldStore';

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
          // Refrescar reportes 
          await getAllReportsByField(fieldId, true); // true = forceRefresh
          // Refrescar estadísticas
          await getStatsByField(fieldId, null, null, null, null, null, true, true); // true = forceRefresh
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
