import * as Location from 'expo-location';

import {
  Alert,
  Button,
  Dimensions,
  ImageBackground,
  Keyboard,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { IconButton, Text, TextInput } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
// import * as Localization from 'expo-localization';
import { rMS, rV } from '@/styles/responsive';
import useFieldStore, { FiledWithUserId } from '@/store/fieldStore';

import AsyncStorage from '@react-native-async-storage/async-storage';
import CreateButton from '@/components/createButton/CreateButton';
import DropDownPicker from 'react-native-dropdown-picker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Image } from 'expo-image';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Loader from '@/components/Loader';
import MessageModal from '@/components/modal/MessageModal';
import OneButtonModal from '@/components/modal/OneButtonModal';
import { Selector } from '@/components/Selector/Selector';
import useAuthStore from '@/store/authStore';
import { useFieldSelectorTypes } from '@/components/fieldSelectorTypes/FieldSelectorTypes';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import useTypeOfObjectStore from '@/store/typeOfObjectStore';
import useVariableStore from '@/store/variableStore';

const { width, height } = Dimensions.get('window');

export default function CreateField() {
  const [selectedValues, setSelectedValues] = useState<any>({})
  const fieldSelectorTypes = useFieldSelectorTypes()
  const router = useRouter();
  const { userId, authLoading } = useAuthStore((state) => ({
    userId: state.userId,
    authLoading: state.authLoading,
  }));
  const { createField, fieldLoading } = useFieldStore((state) => ({
    createField: state.createField,
    fieldLoading: state.fieldLoading,
  }));
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const [value, setValue] = useState<string | undefined>();
  const [openInstallation, setOpenInstallation] = useState<boolean>(false);
  const [openBreed, setOpenBreed] = useState<boolean>(false);
  const [breedValue, setBreedValue] = useState<string | undefined>();
  const [installationValue, setInstallationValue] = useState<string | undefined>();
  const [breedValueText, setBreedValueText] = useState<string | undefined>();
  const [installationValueText, setInstallationValueText] = useState<string | undefined>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(true);
  const [oneButtonOnPress, setOneButtonOnPress] = useState<
    () => void | undefined
  >(() => () => { });
  const [messageModalText, setMessageModalText] = useState<string | null>(null);
  const [ubication, setUbication] = useState({
    origin: {
      latitude: -38.416097, // Coordenadas de Argentina
      longitude: -63.616672,
      latitudeDelta: 10, // Ajusta para mostrar una mayor área de Argentina
      longitudeDelta: 10,
    },
    userLocation: {
      latitude: 0,
      longitude: 0,
      direction: '',
    },
    inputLocation: {
      direction: '',
      latitude: 0,
      longitude: 0,
    },
    marketLocation: {
      latitude: -38.416097,
      longitude: -63.616672,
    },
  });
  const [inputsData, setInputsData] = useState({
    nameField: {
      value: '',
      placeholder: t('detailField.fieldNamePlaceHolder'),
    },
    description: {
      value: '',
      placeholder: t('detailField.fieldDescriptionPlaceHolder'),
    },
    ubication: {
      value: '',
      placeholder: t('detailField.fieldUbicationPlaceHolder'),
      lat: 0,
      lng: 0,
    },
    production_type: {
      placeholder: t('detailField.fieldTypeProductionPlaceHolder'),
    },
    breed: {
      value: '',
      placeholder: t('detailField.fieldBreedPlaceHolder'),
    },
    installation: {
      value: '',
      placeholder: t('detailField.fieldInstallationPlaceHolder'),
    },
    number_of_animals: {
      value: 0,
      placeholder: t('detailField.fieldNumberOfAnimalsPlaceHolder'),
    },
  });

  const [formData, setFormData] = useState<any>({
    name: inputsData.nameField.value,
    description: inputsData.description.value,
    location: ubication.userLocation.direction,
    latitude: ubication.userLocation.latitude,
    longitude: ubication.userLocation.longitude,
    production_type: undefined,
    breed: undefined,
    installation: undefined,
    number_of_animals: +inputsData.number_of_animals.value,
    userId: userId,
  });

  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      name: inputsData.nameField.value,
      description: inputsData.description.value,
      location: ubication.userLocation.direction,
      latitude: ubication.userLocation.latitude,
      longitude: ubication.userLocation.longitude,
      production_type: selectedValues[t('detailField.fieldTypeProductionPlaceHolder').replace(/\s+/g, '')]?.value
        ? [selectedValues[t('detailField.fieldTypeProductionPlaceHolder').replace(/\s+/g, '')].customValue || selectedValues[t('detailField.fieldTypeProductionPlaceHolder').replace(/\s+/g, '')].value][0]
        : undefined,
      breed: selectedValues[t('detailField.fieldBreedPlaceHolder').replace(/\s+/g, '')]?.value
        ? [selectedValues[t('detailField.fieldBreedPlaceHolder').replace(/\s+/g, '')].customValue || selectedValues[t('detailField.fieldBreedPlaceHolder').replace(/\s+/g, '')].value][0]
        : undefined,
      installation: selectedValues[t('detailField.fieldInstallationPlaceHolder').replace(/\s+/g, '')]?.value
        ? [selectedValues[t('detailField.fieldInstallationPlaceHolder').replace(/\s+/g, '')].customValue || selectedValues[t('detailField.fieldInstallationPlaceHolder').replace(/\s+/g, '')].value][0]
        : undefined,
      number_of_animals: +inputsData.number_of_animals.value,
      userId: userId,
    }));
  }, [inputsData, selectedValues]);
  
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: t('typeProductionText.bovine_of_milk'), value: 'bovine_of_milk' },
    { label: t('typeProductionText.bovine_of_meat'), value: 'bovine_of_meat' },
    { label: t('typeProductionText.swine'), value: 'swine' },
    { label: t('typeProductionText.broil_poultry'), value: 'broil_poultry' },
    {
      label: t('typeProductionText.posture_poultry'),
      value: 'posture_poultry',
    },
    { label: t('typeProductionText.customized'), value: 'customized' },
  ]);

  const [breed, setBreed] = useState<{ label: string; value: string }[]>([
    {
      label: t('breedText.holstein'),
      value: 'holstein',
    },
    {
      label: t('breedText.jersey'),
      value: 'jersey',
    },
    {
      label: t('breedText.crossbreed'),
      value: 'crossbreed',
    },
    {
      label: t('breedText.other'),
      value: 'other',
    },
  ]);
  const [installation, setInstallation] = useState<{ label: string; value: string }[]>([
    {
      label: t('installationText.grazing'),
      value: 'grazing',
    },
    {
      label: t('installationText.dry_lot'),
      value: 'dry_lot',
    },
    {
      label: t('installationText.freestall'),
      value: 'freestall',
    },
    {
      label: t('installationText.robot_grazing'),
      value: 'robot_grazing',
    },
    {
      label: t('installationText.robot_freestall'),
      value: 'robot_freestall',
    },
    {
      label: t('installationText.mixed'),
      value: 'mixed',
    },
    {
      label: t('installationText.other'),
      value: 'other',
    },
  ]);

  const [lang, setLang] = useState<any>('');
  const { getAllVariables } = useVariableStore((state: any) => ({
    getAllVariables: state.getAllVariables,
  }));

  const { getAllTypeOfObjects } = useTypeOfObjectStore((state: any) => ({
    getAllTypeOfObjects: state.getAllTypeOfObjects,
  }));

  const onDragEndChange = async (coordinate) => {
    try {
      const { latitude, longitude } = coordinate;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${ubication.marketLocation.latitude},${ubication.marketLocation.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY}&language=${lang}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 2) {
        setUbication((prev) => ({
          ...prev,
          userLocation: {
            latitude: prev.marketLocation.latitude,
            longitude: prev.marketLocation.longitude,
            direction:
              data.results[2]?.formatted_address || 'Dirección no encontrada',
          },
        }));
        setUbication({
          ...ubication,
          marketLocation: {
            latitude,
            longitude,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching geocode data:', error);
    }
  };

  const getLanguage = useCallback(async () => {
    const lang = await AsyncStorage.getItem('language');
    if (lang) setLang(lang);
  }, []);

  const getLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        });
        const { latitude, longitude } = coords;
        setUbication((prev) => ({
          ...prev,
          origin: {
            ...prev.origin,
            latitude,
            longitude,
          },
          marketLocation: { latitude, longitude },
          inputLocation: { latitude, longitude, direction: 'falta' },
        }));
      } else {
        console.log('Permiso de ubicación denegado');
      }
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
    }
  }, []);

  const setDirection = useCallback(async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${ubication.marketLocation.latitude},${ubication.marketLocation.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY}&language=${lang}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 2) {
        setUbication((prev) => ({
          ...prev,
          userLocation: {
            latitude: prev.marketLocation.latitude,
            longitude: prev.marketLocation.longitude,
            direction:
              data.results[2]?.formatted_address || 'Dirección no encontrada',
          },
        }));
      }
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
    }
  }, [ubication.marketLocation]);

  useEffect(() => {
    getLanguage();
    getLocation();
  }, [getLanguage, getLocation]);

  useEffect(() => {
    if (ubication.marketLocation) {
      mapRef.current.animateToRegion(
        {
          ...ubication.marketLocation,
          latitudeDelta: ubication.origin.latitudeDelta,
          longitudeDelta: ubication.origin.longitudeDelta,
        },
        1500
      );
      setDirection();
    }
  }, [ubication.marketLocation, setDirection]);

  const handleInputChange = (key: string, value: string) => {
    setInputsData((previnputsData) => ({
      ...previnputsData,
      [key]: {
        ...previnputsData[key],
        value: value,
      },
    }));
  };

  const validateFormData = (
    data: Partial<Omit<FiledWithUserId, 'id'>>
  ): boolean => {
    const requiredProperties = ['name', 'production_type'];

    return requiredProperties.every((prop) => {
      const value = data[prop as keyof typeof data];

      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      if (typeof value === 'number') {
        return value !== 0;
      }
      return !!value;
    });
  };

  const handlePress = async () => {
    try {
      if (!validateFormData(formData)) {
        setMessageModalText('Por favor completa todos los campos requeridos.');
        setSuccess(false);
        setShowMessageModal(true);
        setTimeout(() => {
          setShowMessageModal(false);
        }, 2000);
        return;
      }
      setShowModal(true);
      await createField(formData);
      setShowModal(false);
      const handleOneButtonPress = () => {
        setMessageModalText(t('fieldView.fieldCreatedText'));
        setSuccess(true);
        setShowMessageModal(true);
        if (Platform.OS === 'ios') {
          setTimeout(() => {
            getAllVariables();
            getAllTypeOfObjects();
            setShowMessageModal(false);
            setTimeout(() => {
              router.back();
            }, 430);
          }, 2000);
        } else {
          setTimeout(() => {
            getAllVariables();
            getAllTypeOfObjects();
            setShowMessageModal(false);
            router.back();
          }, 2000);
        }
      };
      setOneButtonOnPress(handleOneButtonPress);
    } catch (error: any) {
      setShowModal(false);
      setShowMessageModal(false);
      setOneButtonOnPress(() => {
        setMessageModalText(t('fieldView.fieldCreatedError'));
        setSuccess(false);
        setShowMessageModal(true);
        setTimeout(() => {
          setShowMessageModal(false);
        }, 2000);
      });
    }
  };

  // if (authLoading) {
  //   return  />;
  // }

  return (
    //contenedor
    <View style={styles.container}>
      {/* header */}
      <ImageBackground
        source={require('../../../../../assets/images/tabs/tabs-header.png')}
        style={styles.header}
        resizeMode="cover"
      >
        {/* Inicio contenedor del volver y la leyenda nuevo campo */}
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
              onPress={() => router.push('/home')}
            />
            <Text style={styles.greeting}>{t('detailField.goBackText')}</Text>
          </View>
          <View>
            <Text style={styles.welcome}>{t('detailField.newFieldText')}</Text>
          </View>
        </View>
        {/* Fin contenedor del volver y la leyenda nuevo campo */}
      </ImageBackground>

      {/* contenedor contenido campo */}
      <View style={styles.contentContainer}>
        <Text style={styles.fieldTitle}>
          {t('detailField.detailFieldText')}
        </Text>

        {/* Usar KeyboardAwareScrollView para manejar inputs y teclado */}
        <KeyboardAwareScrollView
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { height: open ? rMS(900) : (openBreed ? rMS(900) : openInstallation ? rMS(1000) : null) },
          ]}
          style={{ flexGrow: 1 }}
          extraScrollHeight={20}
          scrollEnabled={Platform.OS === 'ios' ? true : true}
        >
          <View style={styles.formContainer}>
            {/* TextInputs */}
            {Object.keys(inputsData).map((key: string) => {
              const input = inputsData[key];
              if (key === 'ubication') {
                return (
                  <View key={key} style={{ marginBottom: 10 }}>
                    <View>
                      {/* <GooglePlacesAutocomplete
                          placeholder="Ubicación"
                          minLength={3}
                          GooglePlacesDetailsQuery={{
                            fields: 'geometry',
                          }}
                          enablePoweredByContainer={false}
                          textInputProps={{
                            value: `${ubication.userLocation.direction}`,
                            cursorColor: '#486732',
                            selectionColor: '#486732',
                            placeholderTextColor: '#292929',
                            editable: false,
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
                          }}
                          onFail={(err) => console.error(err)}
                          fetchDetails={true}
                          // disableScroll={true}
                          onPress={async (data, details) => {
                            setUbication({
                              ...ubication,
                              marketLocation: {
                                latitude: details?.geometry.location.lat,
                                longitude: details?.geometry.location.lng,
                              },
                            });
                          }}
                          query={{
                            key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
                            language: lang,
                          }}
                        /> */}
                      <TextInput
                        mode="outlined"
                        placeholderTextColor="#292929"
                        placeholder={t('detailField.fieldUbicationPlaceHolder')}
                        value={ubication.userLocation.direction ?? ''}
                        onChangeText={(value) =>
                          handleInputChange('location', value)
                        }
                        editable={false}
                        activeOutlineColor="transparent"
                        outlineColor="#F1F1F1"
                        cursorColor="#486732"
                        selectionColor={
                          Platform.OS == 'ios' ? '#486732' : '#486732'
                        }
                        selection={{ start: 0, end: 0 }}
                        style={styles.input}
                      />
                    </View>

                    <View>
                      <MapView
                        ref={mapRef}
                        style={{ width: width * 0.9, height: 239 }}
                        initialRegion={ubication.origin}
                        region={{
                          ...ubication.marketLocation,
                          latitudeDelta: ubication.origin.latitudeDelta,
                          longitudeDelta: ubication.origin.longitudeDelta,
                        }}
                      >
                        <Marker
                          draggable
                          coordinate={ubication.marketLocation}
                          onDragEnd={(e) => {
                            onDragEndChange(e.nativeEvent.coordinate);
                          }}
                        />
                      </MapView>
                    </View>
                  </View>
                );
              }

              if (key === 'production_type') {
                return (
                <Selector
                data={fieldSelectorTypes}
                selectedValues={selectedValues}
                onChange={setSelectedValues}
               />
               )
              }

              if (key === "installation") {
                return
              }

              if (key === "breed") {
                return
              }

              if (key === 'number_of_animals') {
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

              return (
                <>
                <TextInput
                  key={key}
                  mode="outlined"
                  placeholderTextColor="#292929"
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
                  </>
              );
            })}
          </View>
        </KeyboardAwareScrollView>

        {/* Botón fijo */}
        <CreateButton t={t} onPress={handlePress} />
        {/* <View style={styles.fixedButtonContainer}>
          <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
              styles.button,
              pressed ? { backgroundColor: 'rgba(67, 109, 34, 0.2)' } : null,
            ]}
            // style={styles.button}
          >
            <Text style={styles.buttonText}>
              {t('detailField.createFieldText')}
            </Text>
          </Pressable>
        </View> */}
      </View>
      {/* <Loader visible={fieldLoading} /> */}
      <MessageModal
        isVisible={showModal}
        message={t('fieldView.fieldLoadingAutoConfigTitle')}
        // success={success}
        icon={
          <Image
            source={require('../../../../../assets/images/cargando.gif')}
            style={{
              width: rMS(82),
              height: rMS(82),
              marginTop: rMS(2),
              alignSelf: 'center',
            }}
            contentFit="contain"
          />
        }
        onClose={oneButtonOnPress}
      />
      <MessageModal
        isVisible={showMessageModal}
        message={messageModalText}
        success={success}
      />

      {/* <OneButtonModal
        isVisible={showModal}
        onDismiss={() => setShowModal(false)}
        title={`${t('fieldView.fieldAutoConfigTitle')}`}
        subtitle={`${t('fieldView.fieldAutoConfigSubTitle')}: ${
          formData.production_type
        }`}
        onPress={oneButtonOnPress}
        vertical={false}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
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
    justifyContent: 'center',
    marginVertical: height * 0.01,
    width: width * 0.9,
    height: height * 0.07,
    borderWidth: 1,
    fontSize: width * 0.04,
    fontFamily: 'Pro-Regular',
    color: '#292929',
    borderColor: '#F1F1F1',
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
  },
  inputText: {
    marginLeft: height * 0.02,
    marginRight: height * 0.02,
    fontSize: width * 0.04,
    fontFamily: 'Pro-Regular',
    color: '#292929',
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
