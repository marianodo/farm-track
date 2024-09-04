import { Image, StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  loadingImage: {
    width: 100, // Ajusta el tamaño de la imagen según tus necesidades
    height: 100,
  },
});

const Loader = () => {
  return (
    <View style={styles.loadingContainer}>
      <Image
        source={require('../../assets/images/cargando.gif')}
        style={styles.loadingImage}
      />
    </View>
  );
};

export default Loader;