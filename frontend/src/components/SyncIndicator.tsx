import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useSyncStore from '../store/syncStore';
import { cleanSlateReset, verifyCleanSlate } from '../offline/cleanSlate';
import { processQueue, getQueueCount } from '../offline/simpleMeasurementQueue';

const SyncIndicator: React.FC = () => {
  const { pendingCount, setPending } = useSyncStore();
  const insets = useSafeAreaInsets();
  const [isClearing, setIsClearing] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Cargar contador al montar el componente
  React.useEffect(() => {
    const loadQueueCount = async () => {
      try {
        const count = await getQueueCount();
        setPending(count);
      } catch (error) {
        console.error('Error loading queue count:', error);
      }
    };
    
    loadQueueCount();
  }, [setPending]);

  const handleCleanSlate = async () => {
    Alert.alert(
      '🧹 Empezar de Cero',
      '¿Quieres borrar ABSOLUTAMENTE TODO lo offline y empezar completamente de cero?\n\nEsto eliminará:\n• Todos los datos offline\n• Toda la cola de sincronización\n• Todo el caché\n• Todos los contadores\n\n¡NO SE PUEDE DESHACER!',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'BORRAR TODO',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              
              console.log('🧹 User confirmed - Starting clean slate...');
              await cleanSlateReset();
              
              // Verificar que todo está limpio
              const isClean = await verifyCleanSlate();
              
              if (isClean) {
                setPending(0);
                Alert.alert(
                  '✅ ¡Limpieza Completa!',
                  'Todo ha sido borrado exitosamente. Ahora puedes empezar completamente de cero.',
                  [{ text: 'Perfecto' }]
                );
              } else {
                Alert.alert(
                  '⚠️ Limpieza Parcial',
                  'Se eliminó la mayoría de los datos, pero algunos elementos pueden quedar. Puedes intentar de nuevo.',
                  [{ text: 'OK' }]
                );
              }
              
            } catch (error) {
              console.error('Error during clean slate:', error);
              Alert.alert(
                '❌ Error',
                `No se pudo completar la limpieza: ${error}`,
                [{ text: 'OK' }]
              );
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  const handleSync = async () => {
    if (isSyncing) {
      console.log('Already syncing, ignoring request');
      return;
    }

    setIsSyncing(true);
    
    try {
      console.log('🔄 Starting sync process...');
      const result = await processQueue();
      
      // Actualizar contador después del sync
      const newCount = await getQueueCount();
      setPending(newCount);
      
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
      setIsSyncing(false);
    }
  };

  // Mostrar indicador solo si hay pendientes o si estamos procesando
  if (pendingCount === 0 && !isClearing && !isSyncing) {
    return null;
  }

  return (
    <View style={[styles.container, { top: insets.top + 8 }]}>
      <View style={styles.content}>
        {isClearing ? (
          <Text style={styles.text}>Limpiando...</Text>
        ) : isSyncing ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.text}>Sincronizando...</Text>
          </>
        ) : (
          <>
            <Text style={styles.text}>Pendientes: {pendingCount}</Text>
            <TouchableOpacity 
              style={styles.syncButton} 
              onPress={handleSync}
              disabled={isClearing || isSyncing}
            >
              <Text style={styles.buttonText}>Sincronizar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cleanButton} 
              onPress={handleCleanSlate}
              disabled={isClearing || isSyncing}
            >
              <Text style={styles.cleanButtonText}>Limpiar</Text>
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
    backgroundColor: 'rgba(220, 53, 69, 0.9)', // Rojo para indicar que es destructivo
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
  cleanButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cleanButtonText: {
    color: '#dc3545',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default SyncIndicator;