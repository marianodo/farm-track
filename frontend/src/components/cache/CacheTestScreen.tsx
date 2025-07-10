import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { usePerformanceTest } from '../../hooks/usePerformanceTest';
import useVariableStore from '../../store/variableStore';
import useReportStore from '../../store/reportStore';
import useTypeOfObjectStore from '../../store/typeOfObjectStore';
import CacheIndicator from '../ui/CacheIndicator';
import CacheManager from './CacheManager';

const CacheTestScreen: React.FC = () => {
  const { results, isRunning, runPerformanceTest, formatTime } = usePerformanceTest();
  const [showCacheManager, setShowCacheManager] = useState(false);
  
  const { getAllVariables, variablesLoading, variables, isFromCache: variablesFromCache } = useVariableStore();
  const { getAllReportsByField, reportsLoading } = useReportStore();
  const { getAllTypeOfObjects, typeOfObjectsLoading, typeOfObjects } = useTypeOfObjectStore();

  const testVariables = async () => {
    await runPerformanceTest(async (forceRefresh) => {
      await getAllVariables(forceRefresh);
    });
  };

  const testTypeOfObjects = async () => {
    await runPerformanceTest(async (forceRefresh) => {
      await getAllTypeOfObjects(forceRefresh);
    });
  };

  const loadDataForDemo = async () => {
    // Cargar datos para demostración
    await getAllVariables();
    await getAllTypeOfObjects();
  };

  const clearCacheAndReload = async () => {
    Alert.alert(
      'Test de Cache',
      'Esto limpiará el caché y recargará los datos. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: async () => {
            // Limpiar caché
            const { cacheManager } = await import('../../utils/cache');
            await cacheManager.clearAll();
            
            // Recargar datos
            await loadDataForDemo();
            
            Alert.alert('Éxito', 'Caché limpiado y datos recargados');
          }
        }
      ]
    );
  };

  if (showCacheManager) {
    return (
      <View style={styles.container}>
        <Button 
          mode="outlined" 
          onPress={() => setShowCacheManager(false)}
          style={styles.backButton}
        >
          ← Volver a Tests
        </Button>
        <CacheManager />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>🚀 Cache Performance Test</Title>
      
      {/* Indicadores de Estado */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Estado Actual</Title>
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Variables:</Text>
              <Text style={styles.statusValue}>
                {variables?.length || 0} items
              </Text>
              <CacheIndicator isFromCache={variablesFromCache} />
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Tipos de Objetos:</Text>
              <Text style={styles.statusValue}>
                {typeOfObjects?.length || 0} items
              </Text>
              <CacheIndicator isFromCache={objectsFromCache} />
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Botones de Test */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Tests de Performance</Title>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={testVariables}
              loading={isRunning}
              disabled={isRunning || variablesLoading}
              style={styles.testButton}
            >
              Test Variables
            </Button>
            
            <Button
              mode="contained"
              onPress={testTypeOfObjects}
              loading={isRunning}
              disabled={isRunning || typeOfObjectsLoading}
              style={styles.testButton}
            >
              Test Objetos
            </Button>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={loadDataForDemo}
              disabled={isRunning}
              style={styles.utilButton}
            >
              Cargar Datos
            </Button>
            
            <Button
              mode="outlined"
              onPress={clearCacheAndReload}
              disabled={isRunning}
              style={styles.utilButton}
            >
              Limpiar & Recargar
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Resultados */}
      {results && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>📊 Resultados del Test</Title>
            
            <View style={styles.resultContainer}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>⚡ Cache:</Text>
                <Text style={[styles.resultValue, styles.cacheValue]}>
                  {formatTime(results.cacheTime)}
                </Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>🌐 Network:</Text>
                <Text style={[styles.resultValue, styles.networkValue]}>
                  {formatTime(results.networkTime)}
                </Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>🚀 Mejora:</Text>
                <Text style={[styles.resultValue, styles.improvementValue]}>
                  {results.improvementPercentage.toFixed(1)}% más rápido
                </Text>
              </View>
            </View>
            
            <Paragraph style={styles.explanation}>
              El caché es {formatTime(results.improvement)} más rápido que la red
            </Paragraph>
          </Card.Content>
        </Card>
      )}

      {/* Administrador de Cache */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>⚙️ Administración</Title>
          <Button
            mode="contained"
            onPress={() => setShowCacheManager(true)}
            style={styles.managerButton}
          >
            Abrir Administrador de Cache
          </Button>
        </Card.Content>
      </Card>

      {/* Instrucciones */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>📝 Instrucciones</Title>
          <Paragraph>1. Presiona "Cargar Datos" para llenar el caché</Paragraph>
          <Paragraph>2. Ejecuta un test para ver la diferencia de velocidad</Paragraph>
          <Paragraph>3. Los badges muestran si los datos vienen del caché (⚡) o red (🌐)</Paragraph>
          <Paragraph>4. Usa el administrador para ver detalles del caché</Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#486732',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  statusLabel: {
    fontWeight: 'bold',
    flex: 1,
  },
  statusValue: {
    flex: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  testButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#486732',
  },
  utilButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  divider: {
    marginVertical: 12,
  },
  resultContainer: {
    marginTop: 8,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cacheValue: {
    color: '#4CAF50',
  },
  networkValue: {
    color: '#FF9800',
  },
  improvementValue: {
    color: '#2196F3',
  },
  explanation: {
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#666',
  },
  managerButton: {
    backgroundColor: '#486732',
  },
  backButton: {
    marginBottom: 16,
  },
});

export default CacheTestScreen; 