import {
  ActivityIndicator,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
  ImageBackground,
  Platform,
  Dimensions,
  PermissionsAndroid,
  Modal,
  Button,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Location from 'expo-location';
// import * as Localization from 'expo-localization';
import { rMS, rV } from '@/styles/responsive';
import Loader from '@/components/Loader';
import useAuthStore from '@/store/authStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
const { width, height } = Dimensions.get('window');
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useFieldStore, { Field } from '@/store/fieldStore';

export default function EditField() {
  const router = useRouter();
  const { id }: { id: string } = useLocalSearchParams();
  const { userId, authLoading } = useAuthStore((state) => ({
    userId: state.userId,
    authLoading: state.authLoading,
  }));
  const { fieldDetail, getFieldById, resetDetail, fieldLoading, onUpdate } =
    useFieldStore((state) => ({
      fieldDetail: state.fieldDetail,
      getFieldById: state.getFieldById,
      resetDetail: state.resetDetail,
      fieldLoading: state.fieldLoading,
      onUpdate: state.onUpdate,
    }));

  const { t } = useTranslation();

  const mapRef = useRef(null);

  // Estado local para guardar los inputs
  const [fieldData, setFieldData] = useState<{
    name: string;
    description: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    production_type: string;
    number_of_animals: number | string | null;
  }>({
    name: '',
    description: '',
    location: '',
    latitude: null,
    longitude: null,
    production_type: '',
    number_of_animals: null,
  });
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
      setFieldData({
        name: fieldDetail.name || '',
        description: fieldDetail.description || '',
        location: fieldDetail.location || '',
        latitude: fieldDetail.latitude || null,
        longitude: fieldDetail.longitude || null,
        production_type: fieldDetail.production_type || '',
        number_of_animals: fieldDetail.number_of_animals || '',
      });
    }
  }, [fieldDetail]);

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
      alert('Field update successfully');
      router.back();
    } catch (error: any) {
      alert(error.message);
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
            <Text style={styles.fieldTitle}>
              {t('detailField.detailFieldText')}
            </Text>

            {/* Usar KeyboardAwareScrollView para manejar inputs y teclado */}
            <KeyboardAwareScrollView
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.scrollContent,
                { height: open ? rMS(700) : null },
              ]}
              style={{ flexGrow: 1 }}
              extraScrollHeight={20}
              scrollEnabled={Platform.OS === 'ios' ? true : !open}
            >
              <View style={styles.formContainer}>
                {/* TextInputs */}
                {/* name */}
                <TextInput
                  mode="outlined"
                  placeholderTextColor="#292929"
                  placeholder={t('detailField.fieldNamePlaceHolder')}
                  value={fieldData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="words"
                  activeOutlineColor="transparent"
                  outlineColor="#F1F1F1"
                  cursorColor="#486732"
                  selectionColor={Platform.OS == 'ios' ? '#486732' : '#486732'}
                  style={styles.input}
                />
                {/* description */}
                <TextInput
                  mode="outlined"
                  placeholderTextColor="#292929"
                  placeholder={t('detailField.fieldDescriptionPlaceHolder')}
                  value={fieldData.description}
                  onChangeText={(value) =>
                    handleInputChange('description', value)
                  }
                  autoCapitalize="words"
                  activeOutlineColor="transparent"
                  outlineColor="#F1F1F1"
                  cursorColor="#486732"
                  selectionColor={Platform.OS == 'ios' ? '#486732' : '#486732'}
                  style={styles.input}
                />
                {/* ubication */}
                <TextInput
                  mode="outlined"
                  placeholderTextColor="#292929"
                  placeholder={t('detailField.fieldUbicationPlaceHolder')}
                  value={fieldData.location}
                  onChangeText={(value) => handleInputChange('location', value)}
                  editable={false}
                  activeOutlineColor="transparent"
                  outlineColor="#F1F1F1"
                  cursorColor="#486732"
                  selectionColor={Platform.OS == 'ios' ? '#486732' : '#486732'}
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
                {/* production dropDown*/}
                <DropDownPicker
                  placeholder={t('detailField.fieldTypeProductionPlaceHolder')}
                  placeholderStyle={{
                    fontSize: width * 0.04,
                    fontFamily: 'Pro-Regular',
                    color: '#292929',
                    paddingLeft: rMS(4),
                  }}
                  style={styles.input}
                  dropDownContainerStyle={{
                    marginTop: 4,
                    backgroundColor: '#fafafa',
                    borderColor: '#dadada',
                    borderRadius: 20,
                    borderTopStartRadius: 12,
                    borderTopEndRadius: 12,
                  }}
                  listMode="SCROLLVIEW"
                  zIndex={open ? 1 : 0}
                  zIndexInverse={open ? 1 : 0}
                  arrowIconStyle={{ tintColor: '#486732' }}
                  open={open}
                  value={fieldData.production_type}
                  items={items}
                  setOpen={setOpen}
                  setValue={(e) => handleInputChange('production_type', e)}
                  setItems={setItems}
                  // multiple={true}
                  mode="BADGE"
                  badgeDotColors={[
                    '#e76f51',
                    '#00b4d8',
                    '#e9c46a',
                    '#e76f51',
                    '#8ac926',
                    '#00b4d8',
                    '#e9c46a',
                  ]}
                  dropDownDirection="BOTTOM"
                  onOpen={() => setOpen(true)}
                  onClose={() => setOpen(false)}
                />
              </View>
              {/* number of animals*/}
              <TextInput
                mode="outlined"
                placeholder={t('detailField.fieldNumberOfAnimalsPlaceHolder')}
                value={fieldData.number_of_animals?.toString()}
                onChangeText={(value) => {
                  const sanitizedValue = value.replace(/[^0-9]/g, '');
                  handleInputChange('number_of_animals', sanitizedValue);
                }}
                keyboardType="numeric"
                cursorColor="#486732"
                selectionColor={Platform.OS == 'ios' ? '#486732' : '#486732'}
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
