import * as Location from 'expo-location';

import {
  ActivityIndicator,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';
import {
  Dimensions,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { rMS, rV } from '@/styles/responsive';
import useFieldStore, { Field } from '@/store/fieldStore';
import { useLocalSearchParams, useRouter } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MessageModal from '@/components/modal/MessageModal';
import { Selector } from '@/components/Selector/Selector';
import useAuthStore from '@/store/authStore';
import { useFieldSelectorTypes } from '@/components/fieldSelectorTypes/FieldSelectorTypes';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

export default function EditField() {
  const fieldSelectorTypes = useFieldSelectorTypes();
  const [allTypes, setAllTypes] = useState<any>(fieldSelectorTypes);
  const [selectedValues, setSelectedValues] = useState<any>({});
  const [initialValues, setInitialValues] = useState<any>({});
  const router = useRouter();
  const { id }: { id: string } = useLocalSearchParams();
  const { fieldDetail, getFieldById, resetDetail, fieldLoading, onUpdate } =
    useFieldStore((state) => ({
      fieldDetail: state.fieldDetail,
      getFieldById: state.getFieldById,
      resetDetail: state.resetDetail,
      fieldLoading: state.fieldLoading,
      onUpdate: state.onUpdate,
    }));

  const { t } = useTranslation();
  const colorScheme = useColorScheme() || 'light';
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(true);
  const [messageModalText, setMessageModalText] = useState<string | null>(null);
  const mapRef = useRef(null);

  // Estado local para guardar los inputs
  const [fieldData, setFieldData] = useState<{
    name: string;
    description: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    production_type: string | null;
    breed: string | null;
    installation: string | null;
    number_of_animals: number | string | null;
  }>({
    name: '',
    description: '',
    location: '',
    latitude: null,
    longitude: null,
    production_type: '',
    breed: null,
    installation: null,
    number_of_animals: null,
  });

  const [lang, setLang] = useState<any>('');

  const getLanguage = useCallback(async () => {
    const asynLang = await AsyncStorage.getItem('language');
    if (asynLang) setLang(lang);
  }, []);

  useEffect(() => {
    getLanguage();
    // getLocation();
  }, [getLanguage]);

  useEffect(() => {
    getFieldById(id);
    return () => resetDetail();
  }, [id]);

  useEffect(() => {
    // Actualizar el estado con los datos obtenidos cuando lleguen
    if (fieldDetail) {
      const placeholders = {
        production_type: t('detailField.fieldTypeProductionPlaceHolder'),
        breed: t('detailField.fieldBreedPlaceHolder'),
        installation: t('detailField.fieldInstallationPlaceHolder'),
      };

      const updatedTypes = [...fieldSelectorTypes];

      ['production_type', 'breed', 'installation'].forEach((key) => {
        const value = fieldDetail[key];
        const label = value; // Podés traducirlo si hace falta

        const categoryIndex = updatedTypes.findIndex((cat) =>
          Object.keys(cat)[0] === placeholders[key]
        );

        if (categoryIndex !== -1 && value) {
          const category = updatedTypes[categoryIndex];
          const categoryKey = Object.keys(category)[0];
          const options = category[categoryKey];

          const alreadyExists = options.some((opt: any) => opt.value === value);

          if (!alreadyExists) {
            options.push({ label, value });
          }

          // 👉 Mover 'other' al final si existe
          const otherOptionIndex = options.findIndex((opt: any) => opt.value === 'other');
          if (otherOptionIndex !== -1) {
            const [otherOption] = options.splice(otherOptionIndex, 1);
            options.push(otherOption);
          }
        }
      });

      // Seteamos todo
      setAllTypes(updatedTypes);
      setSelectedValues({
        [t('detailField.fieldTypeProductionPlaceHolder').replace(/\s+/g, '')]: {
          value: fieldDetail.production_type,
          customValue: '',
        },
        [t('detailField.fieldBreedPlaceHolder').replace(/\s+/g, '')]: {
          value: fieldDetail.breed,
          customValue: '',
        },
        [t('detailField.fieldInstallationPlaceHolder').replace(/\s+/g, '')]: {
          value: fieldDetail.installation,
          customValue: '',
        },
      });
      setFieldData({
        name: fieldDetail.name || '',
        description: fieldDetail.description || '',
        location: fieldDetail.location || '',
        latitude: fieldDetail.latitude || null,
        longitude: fieldDetail.longitude || null,
        production_type: fieldData.production_type || null,
        breed: fieldData.breed || null,
        installation: fieldData.installation || null,
        number_of_animals: fieldDetail.number_of_animals || '',
      });
    }
  }, [fieldDetail]);

  useEffect(() => {
    setFieldData({
      ...fieldData,
      production_type: selectedValues[t('detailField.fieldTypeProductionPlaceHolder').replace(/\s+/g, '')]?.value
        ? [selectedValues[t('detailField.fieldTypeProductionPlaceHolder').replace(/\s+/g, '')].customValue || selectedValues[t('detailField.fieldTypeProductionPlaceHolder').replace(/\s+/g, '')].value][0]
        : null,
      breed: selectedValues[t('detailField.fieldBreedPlaceHolder').replace(/\s+/g, '')]?.value
        ? [selectedValues[t('detailField.fieldBreedPlaceHolder').replace(/\s+/g, '')].customValue || selectedValues[t('detailField.fieldBreedPlaceHolder').replace(/\s+/g, '')].value][0]
        : null,
      installation: selectedValues[t('detailField.fieldInstallationPlaceHolder').replace(/\s+/g, '')]?.value
        ? [selectedValues[t('detailField.fieldInstallationPlaceHolder').replace(/\s+/g, '')].customValue || selectedValues[t('detailField.fieldInstallationPlaceHolder').replace(/\s+/g, '')].value][0]
        : null,
    })
  }, [selectedValues])

  const onDragEndChange = async (coordinate: any) => {
    try {
      const { latitude, longitude } = coordinate;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY}&language=${lang}`
      );
      const data = await response.json();
      if (data.results) {
        setFieldData({
          ...fieldData,
          latitude: latitude,
          longitude: longitude,
          location:
            data.results[2]?.formatted_address || 'Dirección no encontrada',
        });
      }
    } catch (error) {
      console.error('Error fetching geocode data:', error);
    }
  };

  const handleInputChange = (key: string, value?: any) => {
    if (key === 'production_type') {
      return setFieldData({
        ...fieldData,
        production_type: value(),
      });
    }
    setFieldData({
      ...fieldData,
      [key]: value,
    });
  };
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Verifica si fieldData tiene latitude y longitude antes de marcar el mapa como listo
    if (fieldData.latitude && fieldData.longitude) {
      setIsMapReady(true);
    }
  }, [fieldData]);

  useEffect(() => {
    if (fieldData?.latitude && fieldData?.longitude) {
      mapRef?.current?.animateToRegion(
        {
          latitude: fieldData.latitude,
          longitude: fieldData.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1500
      );
    }
  }, [fieldData.latitude, fieldData.longitude, onDragEndChange]);

  const handlePress = async () => {
    try {
      await onUpdate(id, fieldData as Partial<Field>);
      setMessageModalText(t('fieldView.editFieldSuccess'));
      setSuccess(true);
      setShowMessageModal(true);
      if (Platform.OS === 'ios') {
        setTimeout(() => {
          setShowMessageModal(false);
          setTimeout(() => {
            router.back();
          }, 430); // Reduce el tiempo si es necesario
        }, 2000);
      } else {
        setTimeout(() => {
          setShowMessageModal(false);
          router.back();
        }, 2000);
      }
    } catch (error: any) {
      setMessageModalText(t('fieldView.editFieldError'));
      setSuccess(false);
      setShowMessageModal(true);
      setTimeout(() => {
        setShowMessageModal(false);
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      {fieldLoading && !fieldDetail ? (
        <ActivityIndicator
          style={{
            margin: 'auto',
          }}
          animating={true}
          color="#486732"
        />
      ) : (
        <Fragment>
          {/* header */}
          <ImageBackground
            source={require('../../../../../assets/images/tabs/tabs-header.png')}
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
                <Text style={styles.greeting}>
                  {t('detailField.goBackText')}
                </Text>
              </View>
              <View>
                <Text style={styles.welcome}>{`${t('detailField.fieldText')}${
                  fieldDetail?.name
                }`}</Text>
              </View>
            </View>
          </ImageBackground>

          {/* contenedor contenido campo */}
          <View style={styles.contentContainer}>
            <Text style={[styles.fieldTitle, {color: colorScheme === 'dark' ? 'black' : '#000000'}]}>
              {t('detailField.detailFieldText')}
            </Text>

            {/* Usar KeyboardAwareScrollView para manejar inputs y teclado */}
            <KeyboardAwareScrollView
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              style={{ flexGrow: 1 }}
              extraScrollHeight={20}
             
            >
              <View style={styles.formContainer}>
                {/* TextInputs */}
                {/* name */}
                <TextInput
                  mode="outlined"
                  placeholderTextColor={colorScheme === 'dark' ? '#A0A0A0' : '#292929'}
                  placeholder={t('detailField.fieldNamePlaceHolder')}
                  value={fieldData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="sentences"
                  activeOutlineColor="transparent"
                  outlineColor="#F1F1F1"
                  cursorColor={colorScheme === 'dark' ? '#A0E57D' : '#486732'}
                  selectionColor={colorScheme === 'dark' ? '#A0E57D' : '#486732'}
                  textColor={colorScheme === 'dark' ? '#black' : '#292929'}
                  style={styles.input}
                />
                {/* description */}
                <TextInput
                  mode="outlined"
                  placeholderTextColor={colorScheme === 'dark' ? '#A0A0A0' : '#292929'}
                  placeholder={t('detailField.fieldDescriptionPlaceHolder')}
                  value={fieldData.description}
                  onChangeText={(value) =>
                    handleInputChange('description', value)
                  }
                  autoCapitalize="sentences"
                  activeOutlineColor="transparent"
                  outlineColor="#F1F1F1"
                  cursorColor={colorScheme === 'dark' ? '#A0E57D' : '#486732'}
                  selectionColor={colorScheme === 'dark' ? '#A0E57D' : '#486732'}
                  textColor={colorScheme === 'dark' ? '#black' : '#292929'}
                  style={styles.input}
                />
                {/* ubication */}
                <TextInput
                  mode="outlined"
                  placeholderTextColor={colorScheme === 'dark' ? '#A0A0A0' : '#292929'}
                  placeholder={t('detailField.fieldUbicationPlaceHolder')}
                  value={fieldData.location}
                  onChangeText={(value) => handleInputChange('location', value)}
                  editable={false}
                  activeOutlineColor="transparent"
                  outlineColor="#F1F1F1"
                  cursorColor={colorScheme === 'dark' ? '#A0E57D' : '#486732'}
                  selectionColor={colorScheme === 'dark' ? '#A0E57D' : '#486732'}
                  textColor={colorScheme === 'dark' ? 'black' : '#292929'}
                  selection={{ start: 0, end: 0 }}
                  style={styles.input}
                />
                {/* mapa */}

                <View>
                  {isMapReady ? (
                    <MapView
                      ref={mapRef}
                      style={{ width: width * 0.9, height: 239 }}
                      initialRegion={{
                        latitude: fieldData.latitude,
                        longitude: fieldData.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                      }}
                      region={{
                        latitude: fieldData.latitude,
                        longitude: fieldData.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                      }}
                    >
                      <Marker
                        draggable
                        coordinate={{
                          latitude: fieldData.latitude,
                          longitude: fieldData.longitude,
                        }}
                        onDragEnd={(e) => {
                          onDragEndChange(e.nativeEvent.coordinate);
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      />
                    </MapView>
                  ) : null}
                </View>

                {/* fin mapa */}
                </View>
                <Selector
                key={fieldData?.name}
                data={allTypes}
                selectedValues={selectedValues}
                onChange={setSelectedValues}
                initialSelection={initialValues}
              />
              {/* number of animals*/}
              <TextInput
                mode="outlined"
                placeholderTextColor={colorScheme === 'dark' ? '#A0A0A0' : '#292929'}
                placeholder={t('detailField.fieldNumberOfAnimalsPlaceHolder')}
                value={fieldData.number_of_animals?.toString()}
                onChangeText={(value) => {
                  const sanitizedValue = value.replace(/[^0-9]/g, '');
                  handleInputChange('number_of_animals', sanitizedValue);
                }}
                keyboardType="numeric"
                cursorColor={colorScheme === 'dark' ? '#A0E57D' : '#486732'}
                selectionColor={colorScheme === 'dark' ? '#A0E57D' : '#486732'}
                textColor={colorScheme === 'dark' ? '#black' : '#292929'}
                activeOutlineColor="transparent"
                outlineColor="#F1F1F1"
                style={styles.input}
              />
            </KeyboardAwareScrollView>

            {/* Botón fijo */}
            <View style={styles.fixedButtonContainer}>
              <Pressable
                onPress={handlePress}
                disabled={fieldData.name.length === 0}
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      fieldData.name.length === 0 ? '#202d16' : '#486732',
                  },
                ]}
              >
                <Text style={styles.buttonText}>
                  {t('detailField.updateFieldText')}
                </Text>
              </Pressable>
            </View>
          </View>
        </Fragment>
      )}
      <MessageModal
        isVisible={showMessageModal}
        message={messageModalText}
        success={success}
      />
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
