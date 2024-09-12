import { IconButton, Text, TextInput } from 'react-native-paper';
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
  ImageBackground,
  Platform,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';
import * as Location from 'expo-location';
import * as Localization from 'expo-localization';
import { rMS, rV } from '@/styles/responsive';
import Loader from '@/components/Loader';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useEffect, useState } from 'react';
import DropDown, { Dropdown } from 'react-native-paper-dropdown';
const { width, height } = Dimensions.get('window');
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [formData, setFormData] = useState({
    nombreCampo: { value: '', placeholder: 'Nombre del campo' },
    descripcion: { value: '', placeholder: 'Descripción' },
    ubicacion: { value: '', placeholder: 'Ubicación', lat: 0, lng: 0 },
    tipoProduccion: { value: '', placeholder: 'Tipo de producción' },
    numeroAnimales: { value: '', placeholder: 'Número de animales' },
  });
  const [origin, setOrigin] = useState({
    latitude: -38.416097, // Coordenadas de Argentina
    longitude: -63.616672,
    latitudeDelta: 10, // Ajusta para mostrar una mayor área de Argentina
    longitudeDelta: 10,
  });

  const [userLocation, setUserLocation] = useState({
    latitude: origin.latitude,
    longitude: origin.longitude,
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: origin.latitude,
    longitude: origin.longitude,
  });
  const [showDropDown, setShowDropDown] = useState(false); // State to manage dropdown visibility
  const [tipoProduccionValue, setTipoProduccionValue] = useState('');
  const [lang, setLang] = useState<any>('');

  const productionOptions = [
    { label: 'Agrícola', value: 'agricola' },
    { label: 'Ganadera', value: 'ganadera' },
    { label: 'Mixta', value: 'mixta' },
  ];

  const handleOriginChange = (newOrigin) => {
    setOrigin(newOrigin);
    setMarkerPosition({
      latitude: newOrigin.latitude,
      longitude: newOrigin.longitude,
    });
  };

  useEffect(() => {
    const getLanguage = async () => {
      const lang = await AsyncStorage.getItem('language');
      setLang(lang);
    };
    getLanguage();
  }, []);

  useEffect(() => {
    const getLocation = async () => {
      if (Platform.OS === 'android') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const { coords } = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            distanceInterval: 10, // Actualiza la ubicación si se mueve más de 10 metros
            mayShowUserSettingsDialog: true, // Muestra un diálogo si los permisos no están habilitados
          });
          const { latitude, longitude } = coords;
          setUserLocation({ latitude, longitude });
          setMarkerPosition({ latitude, longitude });
          setOrigin({
            ...origin,
            latitude,
            longitude,
          });
        } else {
          console.log('Permiso de ubicación denegado');
        }
      } else if (Platform.OS === 'ios') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const { coords } = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            distanceInterval: 10, // Actualiza la ubicación si se mueve más de 10 metros
            mayShowUserSettingsDialog: true, // Muestra un diálogo si los permisos no están habilitados
          });
          const { latitude, longitude } = coords;
          setUserLocation({ latitude, longitude });
          setMarkerPosition({ latitude, longitude });
          setOrigin({
            ...origin,
            latitude,
            longitude,
          });
        } else {
          console.log('Permiso de ubicación denegado');
        }
      }
    };

    getLocation();
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: {
        ...prevFormData[key],
        value: value,
      },
    }));
  };
  const onRegionChange = () => {};

  const router = useRouter();
  const { onLogout, authLoading, userName } = useAuthStore((state) => ({
    userName: state.username,
    onLogout: state.onLogout,
    authLoading: state.authLoading,
  }));
  const { t } = useTranslation();

  if (authLoading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {/* header */}
      <ImageBackground
        source={require('../../../assets/images/tabs/tabs-header.png')}
        style={styles.header}
        resizeMode="cover"
      >
        <View style={styles.headerContent}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignContent: 'center',
              alignItems: 'center',
            }}
          >
            <IconButton
              icon="chevron-left"
              iconColor="#fff"
              style={{ marginHorizontal: 0 }}
              onPress={() => router.back()}
            />
            <Text style={styles.greeting}>Volver</Text>
          </View>
          <View>
            <Text style={styles.welcome}>{t('fieldView.welcome')}</Text>
          </View>
        </View>
      </ImageBackground>

      {/* contenedor contenido campo */}
      <View style={styles.contentContainer}>
        <Text style={styles.fieldTitle}>{t('fieldView.fieldText')}</Text>

        {/* Usar KeyboardAwareScrollView para manejar inputs y teclado */}
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          style={{ flexGrow: 1 }}
          extraScrollHeight={20}
        >
          <View style={styles.formContainer}>
            {/* Aquí los TextInputs */}
            {Object.keys(formData).map((key: string) => {
              const input = formData[key];
              // Verifica si es el campo "tipoProduccion" para renderizar el Dropdown
              if (key === 'tipoProduccion') {
                return (
                  <TextInput
                    key={key}
                    mode="flat"
                    placeholder={input.placeholder}
                    value={input.value}
                    onChangeText={(value) => handleInputChange(key, value)}
                    activeOutlineColor="transparent"
                    outlineColor="#F1F1F1"
                    cursorColor="#486732"
                    selectionColor={
                      Platform.OS == 'ios' ? '#486732' : '#486732'
                    }
                    style={styles.input}
                  />
                );
              }
              if (key === 'ubicacion') {
                return (
                  <View key={key}>
                    <View>
                      <GooglePlacesAutocomplete
                        placeholder="Ubicación"
                        minLength={1}
                        textInputProps={{
                          cursorColor: '#486732',
                          selectionColor: '#486732',
                          placeholderTextColor: '#292929',

                          returnKeyType: 'search',
                        }}
                        styles={{
                          textInputContainer: {
                            alignSelf: 'center',
                            marginVertical: height * 0.01,
                            width: width * 0.9,
                            height: height * 0.07,
                            borderWidth: 1,
                            borderColor: '#F1F1F1',
                            borderRadius: 8,
                          },
                          textInput: {
                            height: '100%',
                            fontSize: width * 0.04,
                            fontFamily: 'Pro-Regular',
                            color: 'black',
                            backgroundColor: '#F1F1F1',
                            paddingHorizontal: 16,
                          },

                          listView: {
                            zIndex: 10,
                          },
                          description: { color: 'black' },
                          separator: {
                            height: 0.5,
                          },
                          poweredContainer: {
                            display: 'none', // Oculta el texto "Powered by Google"
                          },
                        }}
                        onFail={(err) => console.error(err)}
                        fetchDetails={false}
                        disableScroll={true}
                        onPress={(data, details) => {
                          console.log('data: ', data, details);
                        }}
                        query={{
                          key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
                          language: lang,
                        }}
                      />
                    </View>

                    <View>
                      <MapView
                        style={{ width: width * 0.9, height: 239 }}
                        initialRegion={origin}
                      >
                        <Marker
                          draggable
                          coordinate={userLocation}
                          onDragEnd={(e) => {
                            // console.log();
                          }}
                        />
                      </MapView>
                    </View>
                  </View>
                );
              }

              // Verifica si es el campo "numeroAnimales" para hacer que acepte solo números
              if (key === 'numeroAnimales') {
                return (
                  <TextInput
                    key={key}
                    mode="outlined"
                    placeholder={input.placeholder}
                    value={input.value}
                    onChangeText={(value) => {
                      const sanitizedValue = value.replace(/[^0-9]/g, '');
                      handleInputChange(key, sanitizedValue);
                    }}
                    keyboardType="numeric"
                    cursorColor="#486732"
                    selectionColor={
                      Platform.OS == 'ios' ? '#486732' : '#486732'
                    }
                    activeOutlineColor="transparent"
                    outlineColor="#F1F1F1"
                    style={styles.input}
                  />
                );
              }

              // Renderiza otros inputs
              return (
                <TextInput
                  key={key}
                  mode="outlined"
                  placeholder={input.placeholder}
                  value={input.value}
                  onChangeText={(value) => handleInputChange(key, value)}
                  autoCapitalize="words"
                  activeOutlineColor="transparent"
                  outlineColor="#F1F1F1"
                  cursorColor="#486732"
                  selectionColor={Platform.OS == 'ios' ? '#486732' : '#486732'}
                  style={styles.input}
                />
              );
            })}
          </View>
        </KeyboardAwareScrollView>

        {/* Botón fijo */}
        <View style={styles.fixedButtonContainer}>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Crear campo</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: rV(174),
    width: '100%',
  },
  headerContent: {
    // justifyContent: 'flex-end',
    // height: '50%',
  },
  greeting: {
    color: '#fff',
    fontFamily: 'Pro-Regular',
    fontSize: rMS(13.6),
    marginRight: 200,
  },
  welcome: {
    marginLeft: 20,
    color: '#fff',
    fontFamily: 'Pro-Regular',
    fontSize: 22,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 54,
    borderTopRightRadius: 54,
    marginTop: -50,
  },
  fieldTitle: {
    textAlign: 'center',
    marginTop: rMS(10),
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Pro-Regular',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    alignSelf: 'center',
    marginVertical: height * 0.01,
    width: width * 0.9,
    height: height * 0.07,
    borderWidth: 1,
    fontSize: width * 0.04,
    fontFamily: 'Pro-Regular',
    color: '#486732',
    borderColor: '#F1F1F1',
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
  },
  fixedButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20, // Añadir espacio debajo del botón
  },
  button: {
    width: '100%',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#486732',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: rMS(16),
    color: 'white',
    fontFamily: 'Pro-Regular',
  },
});
