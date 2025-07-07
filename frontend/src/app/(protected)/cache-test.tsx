import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import CacheTestScreen from '../../components/cache/CacheTestScreen';

export default function CacheTestRoute() {
  return (
    <SafeAreaView style={styles.container}>
      <CacheTestScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 