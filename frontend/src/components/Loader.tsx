import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', // Se asegura de superponerse
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro semitransparente
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Asegura que esté por encima de otros elementos
  },
  loadingImage: {
    width: 100, // Tamaño de la imagen de carga
    height: 100,
  },
});

const Loader = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Image
        source={require('../../assets/images/cargando.gif')}
        style={styles.loadingImage}
      />
    </View>
  );
};

export default Loader;
