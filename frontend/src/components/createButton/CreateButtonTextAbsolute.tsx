import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { rMS, rS } from '@/styles/responsive';

const CreateButtonTextAbsolute = ({ t, onPress }: { t: any; onPress: any }) => {
  console.log(Platform.OS);
  return Platform.OS === 'ios' ? (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        pressed ? { backgroundColor: 'rgba(67, 109, 34, 0.2)' } : null,
      ]}
      // style={styles.button}
    >
      <Text style={styles.buttonText}>{t('detailField.createFieldText')}</Text>
    </Pressable>
  ) : (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed ? { backgroundColor: 'rgba(67, 109, 34, 0.2)' } : null,
      ]}
      // style={styles.button}
    >
      <Text style={styles.buttonText}>{t('detailField.createFieldText')}</Text>
    </Pressable>
  );
};

export default CreateButtonTextAbsolute;

const styles = StyleSheet.create({
  //   floatingButton: {
  //     position: 'absolute',
  //     fontWeight: 'bold',
  //     zIndex: 99999,
  //     bottom: 20,
  //     right: 15,
  //     width: rMS(56),
  //     height: rMS(56),
  //     borderRadius: 30,
  //     backgroundColor: '#486732',
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     elevation: 5,
  //     shadowColor: '#000',
  //     shadowOffset: { width: 0, height: 2 },
  //     shadowOpacity: 0.3,
  //     shadowRadius: 3.5,
  //   },
  button: {
    position: 'absolute',
    fontWeight: 'bold',
    zIndex: 99999,
    bottom: 20,
    right: 22,
    minWidth: rMS(98),
    height: rMS(36),
    backgroundColor: '#486732',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: rMS(16),
    color: 'white',
    fontFamily: 'Pro-Regular',
    paddingHorizontal: rMS(10),
  },
  //   floatingButtonText: {
  //     color: '#fff',
  //     fontSize: 30,
  //     fontWeight: 'bold',
  //   },
});
