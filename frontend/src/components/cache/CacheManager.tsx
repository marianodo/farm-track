import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { cacheManager } from '../../utils/cache';

interface CacheInfo {
  key: string;
  size: number;
  age: number;
}

const CacheManager: React.FC = () => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCacheInfo = async () => {
    setLoading(true);
    try {
      const info = await cacheManager.getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error('Error loading cache info:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllCache = async () => {
    Alert.alert(
      'Limpiar Caché',
      '¿Estás seguro de que quieres limpiar todo el caché? Esto hará que la app sea más lenta la próxima vez que cargues datos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await cacheManager.clearAll();
              await loadCacheInfo();
              Alert.alert('Éxito', 'Caché limpiado correctamente');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'No se pudo limpiar el caché');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatAge = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  useEffect(() => {
    loadCacheInfo();
  }, []);

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Administrador de Caché</Title>
      
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={loadCacheInfo}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Actualizar Info
        </Button>
        
        <Button
          mode="contained"
          onPress={clearAllCache}
          loading={loading}
          disabled={loading}
          style={[styles.button, styles.clearButton]}
          buttonColor="#d32f2f"
        >
          Limpiar Todo
        </Button>
      </View>

      <Text style={styles.subtitle}>
        Elementos en caché: {cacheInfo.length}
      </Text>

      {cacheInfo.map((item, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>
              {item.key.replace('cache_', '').replace(/_/g, ' ')}
            </Title>
            <Paragraph>Tamaño: {formatBytes(item.size)}</Paragraph>
            <Paragraph>Edad: {formatAge(item.age)}</Paragraph>
          </Card.Content>
        </Card>
      ))}

      {cacheInfo.length === 0 && !loading && (
        <Card style={styles.card}>
          <Card.Content>
            <Paragraph>No hay elementos en caché</Paragraph>
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#486732',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  clearButton: {
    backgroundColor: '#d32f2f',
  },
  card: {
    marginBottom: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
});

export default CacheManager; 