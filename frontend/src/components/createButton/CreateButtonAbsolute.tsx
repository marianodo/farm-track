import { Platform, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { rMS, rS } from '@/styles/responsive';

const CreateButtonAbsolute = () => {
  
  return Platform.OS === 'ios' ? (
    <IconButton
      icon="plus"
      iconColor="#FFF"
      onPress={() => router.push('/createField')}
      size={rS(24)}
    />
  ) : (
    <IconButton
      style={styles.floatingButton}
      icon="plus"
      iconColor="#FFF"
      onPress={() => router.push('/createField')}
      size={rS(24)}
    />
  );
};

export default CreateButtonAbsolute;

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    fontWeight: 'bold',
    zIndex: 99999,
    bottom: 20,
    right: 15,
    width: rMS(56),
    height: rMS(56),
    borderRadius: 30,
    backgroundColor: '#486732',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
