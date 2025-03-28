import { rMS, rMV, rS, rV } from '@/styles/responsive';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles';
import {
  Platform,
  Pressable,
  Text,
  View,
  ImageBackground,
  Dimensions,
  BackHandler,
  Alert,
} from 'react-native';
// import { useNavigation } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ActivityIndicator, IconButton, TextInput } from 'react-native-paper';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import useReportStore from '@/store/reportStore';
import Slider from '@react-native-community/slider';
import {
  ModalComponent,
  SuccessModal,
  UnsavedModalComponent,
} from '@/components/modal/ModalComponent';
import useMeasurementStatsStore from '@/store/measurementStatsStore';
import useFieldStore from '@/store/fieldStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get('window');

export type NumericValue = {
  min: number | string;
  max: number | string;
  optimal_min: number | string;
  optimal_max: number | string;
  granularity: number | string;
};

export type CategoricalValue = string[];

type FormData = {
  name: string | null;
};

const CreateMeasurement: React.FC = () => {
  const { typeOfObjectId, typeOfObjectName, fieldName, penName, reportName, reportCreated } =
    useLocalSearchParams();
  const [texts, setTexts] = useState({
    title: '',
    subtitle: '',
  });
  const [lng, setLng] = useState<string | null>(null);
  const [reloadMeasurementStats, setReloadMeasurementStats] = useState<boolean>(false)
  const navigation = useNavigation();
  const [showWarningError, setShowWarningError] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [errorsName, setErrorsName] = useState<string[]>([]);
  const [values, setValues] = useState<{
    [key: string]: number | string | null;
  }>({});
  const handlePress = (key: string, name: string, item: string) => {
    if (values[key] === item) {
      setValues((prevValues) => ({
        ...prevValues,
        [key]: null,
      }));

      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: 'true',
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        [key]: item,
      }));

      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  const [sliderKey, setSliderKey] = useState<number>(0);
  const router = useRouter();
  const {
    createReportId,
    reportsLoading,
    createMeasurementWithReportId,
    measurementVariablesData,
  } = useReportStore((state: any) => ({
    reportsLoading: state.reportsLoading,
    createReportId: state.createReportId,
    measurementVariablesData: state.measurementVariablesData,
    createMeasurementWithReportId: state.createMeasurementWithReportId,
  }));

  const { getStatsByField, stats, statsLoading } = useMeasurementStatsStore((state: any) => ({
    getStatsByField: state.getStatsByField,
    stats: state.stats,
    statsLoading: state.statsLoading,
  }));

  const { fieldId } = useFieldStore((state: any) => ({
    fieldId: state.fieldId,
  }));

  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    name: null,
  });

  useEffect(() => {
    if (measurementVariablesData) {
      measurementVariablesData.map((e: any) => {
        setValues((prevValues) => ({
          ...prevValues,
          [e.pen_variable_type_of_object_id]: null,
        }));
      });
    }
  }, []);

  useEffect(() => {
    // Inicializa el valor del slider al mínimo cada vez que el componente se monte
    if (measurementVariablesData) {
      measurementVariablesData.forEach((e: any) => {
        setSliderKey((prevKey) => prevKey + 1);
      });
    }
  }, []);

  const onChange = (field: keyof FormData, inputValue: any) => {
    setFormData({ ...formData, [field]: inputValue });
  };

  const validateValues = () => {
    const newErrors: any = [];
    measurementVariablesData.forEach((e: any) => {
      if (
        values[e['pen_variable_type_of_object_id']] === null ||
        values[e['pen_variable_type_of_object_id']] === ''
      ) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [e.variable.name]: `true`,
        }));
        newErrors.push(e.variable.name);
      }
    });
    setErrorsName(newErrors);
    return newErrors;
  };

  const createNewMeasurement = async () => {
    const newMeasurement = {
      name: formData.name,
      type_of_object_id: typeOfObjectId,
      field_id: fieldId,
      measurements: Object.entries(values)
        .filter(([key, value]) => value !== null)
        .map(([key, value]) => ({
          pen_variable_type_of_object_id: Number(key),
          value: value,
          report_id: createReportId,
        })),
    };
    await createMeasurementWithReportId(newMeasurement);
    setModalVisible('success');
    measurementVariablesData.map((e: any) => {
      setValues((prevValues) => ({
        ...prevValues,
        [e.pen_variable_type_of_object_id]: null,
      }));
    });
    setFormData({
      name: null,
    });
    setErrors({});
    setErrorsName([]);
  };

  const getModalButtons = () => {
    if (modalVisible === 'unsavedChanges') {
      return [
        {
          text: t('attributeView.cancelButtonText'),
          onPress: () => setModalVisible(null),
        },
        {
          text: t('measurementView.leaveButtonText'),
          onPress: () => {
            setModalVisible(null);
            router.back();
          },
        },
        {
          text: t('measurementView.exitReportText'),
          onPress: () => {
            setModalVisible(null);
            router.dismissTo({
              pathname: '/report',
              params: {
                fieldId: fieldId as string,
                fieldName: fieldName,
                withFields: 'false',
                withObjects: 'true',
                onReport: 'true',
              },
            });
          },
        },
      ];
    }

    if (
      errorsName.length === measurementVariablesData.length &&
      Object.values(values).every((value) => value === null)
    ) {
      return [
        {
          text: 'Cancelar',
          onPress: () => setModalVisible(null),
        },
      ];
    }
    if (
      showWarningError &&
      errorsName.length > 0 &&
      errorsName.length < measurementVariablesData.length
    ) {
      return [
        {
          text: 'Continuar sin completar',
          onPress: async () => {
            setModalVisible(null);
            try {
              await createNewMeasurement();
            } catch (error) {
              console.log('ERROR:', error);
            }
          },
        },
        {
          text: 'Completar el campo',
          onPress: () => setModalVisible(null),
        },
        {
          text: 'No mostrar de nuevo',
          onPress: async () => {
            setShowWarningError(false);
            setModalVisible(null);
            try {
              await createNewMeasurement();
            } catch (error) {
              console.log('ERROR:', error);
            }
          },
        },
      ];
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateValues();
    if (
      validationErrors.length > 0 &&
      validationErrors.length === measurementVariablesData.length &&
      Object.values(values).some((value) => value === null)
    ) {
      let title =
        'Debes completar al menos un campo para guardar una medición.';
      let subtitle = '';
      setTexts({ title, subtitle });
      setModalVisible('modal');
      return;
    }
    if (
      showWarningError &&
      validationErrors.length < measurementVariablesData.length &&
      Object.values(values).some((value) => value === null)
    ) {
      let title = 'Campo incompleto';
      let subtitle: any = (
        <Text>
          Parece que no has completado el campo{' '}
          <Text style={{ fontWeight: 'bold' }}>
            {validationErrors.join(', ')}
          </Text>
          . ¿Deseas continuar de todas formas?
        </Text>
      );
      setTexts({ title, subtitle });
      setModalVisible('modal');
      return;
    }
    try {
      await createNewMeasurement();
      setReloadMeasurementStats(true);
    } catch (error) {
      console.log('ERROR:', error);
    }
  };

  const showUnsavedChangesModal = () => {
    setTexts({
      title: t('attributeView.unsavedChangesTitle'),
      subtitle: t('attributeView.unsavedChangesMessage'),
    });
    setModalVisible('unsavedChanges');
  };

  useFocusEffect(
    React.useCallback(() => {
      // Constatar que values halla sido modificado
      const hasNullValues =
        Object.keys(values).length > 0 &&
        Object.values(values).some((value) => value === null);
      if (hasNullValues) {
        // si no se modifico nada, entra a este if y retornamos. Eso es para no configurar el evento.
        return;
      }
      const onBackPress = () => {
        showUnsavedChangesModal();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [values])
  );

  const handleInputChange = (
    key: string,
    name: string,
    min: number,
    max: number,
    value: string,
    step: number = 1
  ) => {
    // Reemplazar comas por puntos
    const normalizedValue = value.replace(',', '.');

    setValues((prevValues) => ({
      ...prevValues,
      [key]: normalizedValue,
    }));

    if (normalizedValue === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: 'El campo no puede estar vacío.',
      }));

      setValues((prevValues) => ({
        ...prevValues,
        [key]: null,
      }));
      return;
    }

    const numericValue = parseFloat(normalizedValue);
    if (!isNaN(numericValue)) {
      // Validar rango
      if (numericValue < min || numericValue > max) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: `El valor debe estar entre ${min} y ${max}.`,
        }));
        return;
      }

      // Validar que el valor sea un paso válido a partir del mínimo
      const validValues = [];
      for (let current = min; current <= max; current += step) {
        validValues.push(parseFloat(current.toFixed(10))); // Redondeo para evitar problemas de precisión
      }

      if (!validValues.includes(numericValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: `El valor debe incrementarse en pasos de ${step} a partir de ${min}.`,
        }));
        return;
      }

      // Si pasa todas las validaciones, eliminar errores
      setErrors((prevErrors) => {
        const { [name]: _, ...newErrors } = prevErrors;
        return newErrors;
      });
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: 'El valor debe ser un número.',
      }));
    }
  };

  const handleSliderChange = (
    key: string,
    name: string,
    value: number,
    min: number,
    max: number,
    step: number
  ) => {
    // if (value === null || value === undefined) {
    //   setErrors((prevErrors) => ({
    //     ...prevErrors,
    //     [name]: 'El campo no puede estar vacío.',
    //   }));
    // } else if (
    //   value < min ||
    //   value > max ||
    //   ((value - min) % step !== 0 && value !== min && value !== max)
    // ) {
    //   setErrors((prevErrors) => ({
    //     ...prevErrors,
    //     [name]: `El valor debe estar entre ${min} y ${max} y respetar la granularidad de ${step}.`,
    //   }));
    // } else {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });
    // }

    setValues((prevValues) => ({
      ...prevValues,
      [key]: parseFloat(value.toFixed(2)),
    }));
  };

  useEffect(() => {
    setReloadMeasurementStats(false)
    getStatsByField(fieldId, false, true);
  }, [reloadMeasurementStats]);


  useEffect(() => {
    const getLanguage = async () => {
      const language = await AsyncStorage.getItem('language');
      setLng(language);
    };
    getLanguage();
  }, []);

  return (
    <View
      style={[
        styles.titleContainer,
        { maxHeight: Dimensions.get('window').height },
      ]}
    >
      {reportsLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <ActivityIndicator
            style={{
              marginTop: '20%',
            }}
            animating={true}
            color="#486732"
          />
        </View>
      )}
      {/* header */}
      <View style={{ flex: 1, width: '100%', height: 900 }}>
        <ImageBackground
          source={require('../../../../../../assets/images/penAndReport-bg-image.png')}
          style={{ height: rV(174), width: '100%', zIndex: 0 }}
          resizeMode="cover"
        >
          <View>
            <Pressable
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => showUnsavedChangesModal()}
            >
              <IconButton
                icon="chevron-left"
                iconColor="#fff"
                style={{ marginHorizontal: 0 }}
              />
              <Text style={[styles.greeting, { marginLeft: -4 }]}>
                {t('detailField.goBackText')}
              </Text>
            </Pressable>
            <View>
              <Text style={styles.welcome}>
                {t('measurementView.newMeasurementText')}
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 10, alignContent: 'center', width: "64%" }}>
                <Text style={{
                  marginLeft: 20,
                  color: '#ffffff',
                  fontFamily: 'Pro-Regular',
                  fontSize: 16.4,
                  fontWeight: 'bold',
                }}>{t('reportsView.reportNameText')}</Text>
                <Text style={{
                  marginLeft: 4,
                  color: '#ffffff',
                  fontFamily: 'Pro-Regular-Bold',
                  fontSize: 16.4,
                  fontWeight: 'bold',
                  overflow: 'hidden', // Ensures that overflow is hidden
                  textOverflow: 'ellipsis', // This is for web; in React Native, we use numberOfLines
                  width: '100%',
                }}
                  numberOfLines={1}
                >{reportName ? reportName : "Ops ocurred error"}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 0, alignContent: 'center', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', width: '44%' }}>
                  <Text style={{
                    marginLeft: 20,
                    color: '#fff',
                    fontFamily: 'Pro-Regular',
                    fontSize: 16.4,
                    // fontWeight: 'bold',
                  }}>
                    {t('measurementView.measureInPen')}
                  </Text>
                  <Text style={{
                    marginLeft: 4,
                    color: '#ffffff',
                    fontFamily: 'Pro-Regular-Bold',
                    fontSize: 16.4,
                    fontWeight: 'bold',
                    overflow: 'hidden', // Ensures that overflow is hidden
                    textOverflow: 'ellipsis', // This is for web; in React Native, we use numberOfLines
                    width: '100%',
                  }}
                    numberOfLines={1}
                  >{penName}</Text>
                </View>
                <View style={{
                  backgroundColor: 'rgba(53, 52, 52, 0.5)', // Color con 50% de transparencia
                  alignSelf: 'flex-end',
                  paddingHorizontal: 14,
                  paddingVertical: 4,

                  borderRadius: 6,
                  marginLeft: 10,
                  marginRight: 20,
                  justifyContent: 'center',
                  marginTop: 10,
                  marginBottom: 10,

                }}>
                  <Text style={{
                    color: '#ffffff',
                    fontFamily: 'Pro-Regular-Bold',
                    fontWeight: 'bold',
                    fontSize: 16.4,
                  }}>
                    {t('measurementView.measureNumber')}{stats && stats.measurement_by_object[`${typeOfObjectName}`] ? stats.measurement_by_object[`${typeOfObjectName}`] + 1 : 1}
                  </Text>
                </View>
              </View>

            </View>

          </View>
          {/* contenedor contenido variable */}
        </ImageBackground>

        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            borderTopLeftRadius: 54,
            borderTopRightRadius: 54,
            marginTop: -50,
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              marginTop: rMS(10),
              fontSize: 18,
              fontWeight: 'bold',
              fontFamily: 'Pro-Regular',
            }}
          >
            {t('measurementView.measurementObjectText')}
          </Text>
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: '90%',
                backgroundColor: '#ebf2ed',
                height: rMV(44),
                borderRadius: rMS(6),
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: rMV(6),
                display: 'flex',
                flexDirection: 'row',
                paddingRight: rMS(12),
              }}
            >
              <IconButton
                icon={'alert-circle-outline'}
                iconColor="#487632"
                size={rMS(20)}
                style={{ margin: 0 }}
              />
              <Text
                style={{
                  color: '#487632',
                  fontFamily: 'Pro-Regular',
                  fontSize: rMS(10),
                  flexShrink: 1,
                  flexWrap: 'wrap',
                  textAlign: 'center',
                }}
              >
                {t('measurementView.subjectTextInfo')}
              </Text>
            </View>
          </View>
          {/* contenido scroll  */}
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            enableOnAndroid
            extraHeight={10}
            extraScrollHeight={30}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingVertical: 10 },
            ]}
          >
            <View style={{ marginBottom: 20 }}>
              <TextInput
                mode="outlined"
                placeholderTextColor="#486732"
                placeholder={`${t('measurementView.objectTextMeasurement')}${typeOfObjectName}`}
                editable={false}
                activeOutlineColor="transparent"
                outlineColor="#F1F1F1"
                style={styles.input}
              />

              <TextInput
                mode="outlined"
                placeholderTextColor="#292929"
                placeholder={t('measurementView.objectTextIdentification')}
                value={formData.name as string}
                onChangeText={(value) => onChange('name', value)}
                autoCapitalize="sentences"
                activeOutlineColor="transparent"
                outlineColor="#F1F1F1"
                cursorColor="#486732"
                selectionColor={Platform.OS == 'ios' ? '#486732' : '#486732'}
                style={styles.input}
              />

              {measurementVariablesData &&
                measurementVariablesData.map((e: any, i: any) => (
                  <View key={e.pen_variable_type_of_object_id}>
                    {e.variable.type === 'NUMBER' ? (
                      <View
                        style={{
                          alignSelf: 'center',
                          justifyContent: 'center',
                          marginVertical: height * 0.01,
                          width: width * 0.9,
                          height: 'auto',
                          borderWidth: 1,
                          paddingVertical: rMS(10),
                          borderColor: '#F1F1F1',
                          backgroundColor:
                            errors[e.variable.name] === 'true'
                              ? 'rgba(217, 162, 32, 0.12)'
                              : '#F1F1F1',
                          borderRadius: 8,
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <View
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%',
                            paddingHorizontal: rMS(16),
                            paddingRight: rMS(6),
                            alignItems: 'center',
                            height: rMS(28),
                          }}
                        >
                          <Text
                            style={{
                              textAlign: 'center',
                              fontFamily: 'Pro-Regular',
                              fontSize: rMS(14),
                            }}
                          >
                            {e.variable.name}
                          </Text>
                          <Text>
                            {`Min: ${e.custom_parameters.value.min}; Max: ${e.custom_parameters.value.max}`}
                          </Text>
                          {errors[e.variable.name] === 'true' ? (
                            <IconButton
                              icon={'alert-circle-outline'}
                              iconColor="#D9A220"
                              size={rMS(20)}
                              style={{ margin: 0 }}
                            />
                          ) : null}
                        </View>
                        <View
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: width * 0.9,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingHorizontal: rMS(12),
                            marginTop: rMV(10),
                          }}
                        >
                          <TextInput
                            mode="outlined"
                            placeholderTextColor="#292929"
                            placeholder=""
                            value={String(
                              values[e.pen_variable_type_of_object_id] || ''
                            )}
                            onChangeText={(value) =>
                              handleInputChange(
                                e.pen_variable_type_of_object_id,
                                e.variable.name,
                                e.custom_parameters.value.min,
                                e.custom_parameters.value.max,
                                value,
                                e.custom_parameters.value.granularity
                              )
                            }
                            keyboardType="numeric"
                            autoCapitalize="sentences"
                            activeOutlineColor="transparent"
                            outlineColor="#F1F1F1"
                            cursorColor="#486732"
                            selectionColor={
                              Platform.OS == 'ios' ? '#486732' : '#486732'
                            }
                            style={{
                              height: rMS(48),
                              width: rMS(100),
                              borderRadius: rMS(4),
                              borderColor: '#486732',
                              borderWidth: 1,
                            }}
                          />
                          <Slider
                            key={sliderKey}
                            style={{
                              width: width * 0.9 - rMS(100) - rMS(12),
                            }}
                            minimumValue={e.custom_parameters.value.min}
                            maximumValue={e.custom_parameters.value.max ?? 0}
                            step={e.custom_parameters.value.granularity}
                            value={
                              Platform.OS === 'android'
                                ? undefined
                                : Number(
                                  values[e.pen_variable_type_of_object_id] ||
                                  0
                                )
                            }
                            onValueChange={(value) =>
                              handleSliderChange(
                                e.pen_variable_type_of_object_id,
                                e.variable.name,
                                value,
                                e.custom_parameters.value.min,
                                e.custom_parameters.value.max,
                                e.custom_parameters.value.granularity
                              )
                            }
                            minimumTrackTintColor="#486732"
                            thumbTintColor="#FFFFFF"
                          />
                        </View>
                        {errors[e.variable.name] &&
                          errors[e.variable.name] !== 'true' && (
                            <Text style={styles.errorText}>
                              {errors[e.variable.name]}
                            </Text>
                          )}
                        {/* <View
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            width: width * 0.9,
                            paddingHorizontal: rMS(14),
                            marginTop: rMV(10),
                          }}
                        >
                          <Text style={{ color: '#96A59A' }}>
                            Granularidad:{' '}
                            {e.custom_parameters.value.granularity}
                          </Text>
                        </View> */}
                      </View>
                    ) : (
                      <View
                        style={{
                          alignSelf: 'center',
                          justifyContent: 'center',
                          marginVertical: height * 0.01,
                          width: width * 0.9,
                          height: 'auto',
                          borderWidth: 1,
                          paddingVertical: rMS(10),
                          borderColor: '#F1F1F1',
                          backgroundColor:
                            errors[e.variable.name] === 'true'
                              ? 'rgba(217, 162, 32, 0.12)'
                              : '#F1F1F1',
                          borderRadius: 8,
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <View
                          style={{
                            width: width * 0.9,
                            display: 'flex',
                            alignItems: 'flex-start',
                            flexDirection: 'column',
                            gap: rMS(4),
                          }}
                        >
                          <View
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              width: '100%',
                              paddingHorizontal: rMS(16),
                              paddingRight: rMS(6),
                              alignItems: 'center',
                              height: rMS(28),
                            }}
                          >
                            <Text
                              style={{
                                textAlign: 'center',
                                fontFamily: 'Pro-Regular',
                                fontSize: rMS(14),
                              }}
                            >
                              {e.variable.name}
                            </Text>
                            {errors[e.variable.name] === 'true' ? (
                              <IconButton
                                icon={'alert-circle-outline'}
                                iconColor="#D9A220"
                                size={rMS(20)}
                                style={{ margin: 0 }}
                              />
                            ) : null}
                          </View>
                          <View style={{}}>
                            <View
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                columnGap: 10,
                                paddingHorizontal: rMS(16),
                                width: '100%',
                                rowGap: 0,
                              }}
                            >
                              {e.custom_parameters.value.map(
                                (item: any, index: number) => (
                                  <Pressable
                                    key={index}
                                    onPress={() =>
                                      handlePress(
                                        e.pen_variable_type_of_object_id,
                                        e.variable.name,
                                        item
                                      )
                                    }
                                    style={{
                                      width: 'auto',
                                      display: 'flex',
                                    }}
                                  >
                                    <View
                                      style={{
                                        width: 'auto',
                                        height: 32,
                                        marginVertical: 6,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingHorizontal: 4,
                                        borderWidth: 1,
                                        borderColor: '#486732',
                                        borderRadius: 4,
                                        backgroundColor:
                                          values[
                                            e.pen_variable_type_of_object_id
                                          ] === item
                                            ? '#486732'
                                            : 'transparent',
                                      }}
                                    >
                                      <Text
                                        style={{
                                          textAlign: 'center',
                                          paddingHorizontal: 4,
                                          color:
                                            values[
                                              e.pen_variable_type_of_object_id
                                            ] === item
                                              ? 'white'
                                              : '#486732',
                                        }}
                                      >
                                        {item}
                                      </Text>
                                    </View>
                                  </Pressable>
                                )
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
            </View>
          </KeyboardAwareScrollView>
          {/* Botón fijo */}
          <View style={styles.fixedButtonContainer}>
            <Pressable
              onPress={handleSubmit}
              disabled={
                Object.values(errors).filter((e: any) => e !== 'true').length >
                0
              }
              style={[
                styles.button,
                {
                  opacity:
                    Object.values(errors).filter((e: any) => e !== 'true')
                      .length > 0
                      ? 0.5
                      : 1,
                },
              ]}
            >
              <Text style={styles.buttonText}>
                {t('measurementView.saveText')}
              </Text>
            </Pressable>
          </View>

          <ModalComponent
            visible={modalVisible === 'modal'}
            onDismiss={() => setModalVisible(null)}
            title={texts.title}
            subtitle={texts.subtitle}
            buttons={getModalButtons()}
            marginVertical={'30%'}
          />
          <UnsavedModalComponent
            visible={modalVisible === 'unsavedChanges'}
            onDismiss={() => setModalVisible(null)}
            title={texts.title}
            subtitle={texts.subtitle}
            buttons={getModalButtons()}
            marginVertical={'30%'}
          />
          {/* este view es para poner el boton debajo de todo */}
          <SuccessModal
            visible={modalVisible === 'success'}
            onDismiss={() => setModalVisible(null)}
            title={'Medicion guardada'}
            icon={
              <IconButton
                icon="check-circle-outline"
                iconColor="#486732"
                size={rMS(82)}
              />
            }
            marginVertical={'38%'}
          />
        </View>
      </View>
    </View>
  );
};

export default CreateMeasurement;
