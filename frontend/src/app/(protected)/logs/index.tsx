import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  StyleSheet,
} from 'react-native';
import { getLogs, clearLogs, exportLogs, saveLog } from '../../../utils/logger';

interface LogEntry {
  timestamp: string;
  message: string;
  category: string;
  data: string | null;
}

export default function LogsScreen() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');

  const categories = ['all', 'general', 'auth', 'measurement', 'error'];

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, selectedCategory, searchText]);

  const loadLogs = async () => {
    const allLogs = await getLogs();
    setLogs(allLogs.reverse()); // Mostrar los más recientes primero
  };

  const filterLogs = () => {
    let filtered = logs;

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(log => log.category === selectedCategory);
    }

    // Filtrar por texto de búsqueda
    if (searchText) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchText.toLowerCase()) ||
        log.data?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Limpiar Logs',
      '¿Estás seguro de que quieres eliminar todos los logs?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            await clearLogs();
            setLogs([]);
            setFilteredLogs([]);
          },
        },
      ]
    );
  };

  const handleExportLogs = async () => {
    try {
      const logsData = await exportLogs();
      await Share.share({
        message: logsData,
        title: 'App Logs',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar los logs');
    }
  };

  const createTestLog = async () => {
    await saveLog('Log de prueba creado', { test: true }, 'general');
    loadLogs();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logs del Sistema</Text>
      
      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar en logs..."
          value={searchText}
          onChangeText={setSearchText}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category === 'all' ? 'Todos' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={loadLogs}>
          <Text style={styles.actionButtonText}>Actualizar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={createTestLog}>
          <Text style={styles.actionButtonText}>Test Log</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleExportLogs}>
          <Text style={styles.actionButtonText}>Exportar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={handleClearLogs}>
          <Text style={[styles.actionButtonText, styles.clearButtonText]}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de logs */}
      <ScrollView style={styles.logsContainer}>
        {filteredLogs.length === 0 ? (
          <Text style={styles.noLogsText}>No hay logs para mostrar</Text>
        ) : (
          filteredLogs.map((log, index) => (
            <View key={index} style={styles.logEntry}>
              <View style={styles.logHeader}>
                <Text style={styles.logTimestamp}>{formatTimestamp(log.timestamp)}</Text>
                <Text style={styles.logCategory}>[{log.category}]</Text>
              </View>
              <Text style={styles.logMessage}>{log.message}</Text>
              {log.data && (
                <Text style={styles.logData}>{log.data}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#666',
  },
  categoryTextActive: {
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  clearButtonText: {
    color: 'white',
  },
  logsContainer: {
    flex: 1,
  },
  noLogsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  logEntry: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  logCategory: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  logMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  logData: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 4,
    borderRadius: 4,
  },
}); 