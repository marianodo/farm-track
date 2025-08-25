import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useWarmupStore from '../store/warmupStore';

const WarmupIndicator: React.FC = () => {
  const { isWarming, progress, currentStep } = useWarmupStore();
  const insets = useSafeAreaInsets();

  if (!isWarming) return null;

  return (
    <View style={[styles.container, { top: insets.top + 60 }]}>
      <View style={styles.content}>
        <ActivityIndicator size="small" color="#007AFF" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Precargando datos...</Text>
          <Text style={styles.step}>{currentStep}</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.percentage}>{Math.round(progress)}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  step: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBackground: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  percentage: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
    minWidth: 30,
    textAlign: 'right',
  },
});

export default WarmupIndicator;
