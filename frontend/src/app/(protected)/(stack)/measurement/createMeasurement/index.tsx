import { rMS, rMV, rS, rV } from '@/styles/responsive';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  Pressable,
  Text,
  View,
  ImageBackground,
  Dimensions,
  BackHandler,
  Alert,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
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
  const { typeOfObjectId, typeOfObjectName, fieldName, penName, reportName, reportNameFind } =
    useLocalSearchParams();
  const [texts, setTexts] = useState({
    title: '',
    subtitle: '',
  });
  const [lng, setLng] = useState<string | null>(null);
  const [reloadMeasurementStats, setReloadMeasurementStats] = useState<boolean>(false)
  const [measurementCount, setMeasurementCount] = useState<any>(null);
  const navigation = useNavigation();
  const [showWarningError, setShowWarningError] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [errorsName, setErrorsName] = useState<string[]>([]);
  const [firstRender, setFirstRender] = useState<boolean>(false);
  const [values, setValues] = useState<{
    [key: string]: number | string | null;
  }>({});
  const [sliderVal, setSliderVal] = useState<{
    [key: string]: number | string | null;
  } | null>(null);
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

  const { getStatsByField, statsByField, resetStatsByField, statsLoading } = useMeasurementStatsStore((state: any) => ({
    getStatsByField: state.getStatsByField,
    statsByField: state.statsByField,
    statsLoading: state.statsLoading,
    resetStatsByField: state.resetStatsByField
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
    setSliderVal(null);
    setMeasurementCount((prevCount: any) => prevCount + 1);
    setFirstRender(false);
    // setReloadMeasurementStats(true);
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
    // Replace commas with dots
    const normalizedValue = value.replace(',', '.');
    if (!value) {
      setSliderVal((prevValues) => ({
        ...prevValues,
        [key]: '',
      }));
    }

    setSliderVal((prevValues) => ({
      ...prevValues,
      [key]: normalizedValue,
    }));

    setValues((prevValues) => ({
      ...prevValues,
      [key]: normalizedValue,
    }));

    if (normalizedValue === '') {
      // Clear the error for this input field if it's empty
      setErrors((prevErrors) => {
        const { [name]: _, ...newErrors } = prevErrors; // Remove the error for this field
        return newErrors;
      });

      setValues((prevValues) => ({
        ...prevValues,
        [key]: null,
      }));
      return;
    }

    const numericValue = parseFloat(normalizedValue);
    if (!isNaN(numericValue)) {
      // Validate range
      if (numericValue < min || numericValue > max) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: `El valor debe estar entre ${min} y ${max}.`,
        }));
        return;
      }

      // Validate that the value is a valid step from the minimum
      const validValues = [];
      for (let current = min; current <= max; current += step) {
        validValues.push(parseFloat(current.toFixed(10))); // Rounding to avoid precision issues
      }

      if (!validValues.includes(numericValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: `El valor debe incrementarse en pasos de ${step} a partir de ${min}.`,
        }));
        return;
      }

      // If it passes all validations, remove errors
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

  const handleSliderSlidingComplete = (key: string,
    name: string,
    value: number,
    min: number,
    max: number,
    step: number) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });

    setSliderVal((prevValues) => ({
      ...prevValues,
      [key]: parseFloat(value.toFixed(2)),
    }));
  };

  useEffect(() => {
    setMeasurementCount(statsByField?.measurement_by_report?.[`${reportNameFind}`]?.[`${penName}`]?.[`${typeOfObjectName}`] ?
      statsByField.measurement_by_report[`${reportNameFind}`][`${penName}`][`${typeOfObjectName}`] + 1 : 1);
  }, []);


  useEffect(() => {
    const getLanguage = async () => {
      const language = await AsyncStorage.getItem('language');
      setLng(language);
    };
    getLanguage();
  }, []);

  return (
    /* Contenedor general */
    <View style={styles.container}>
      {/* Inicio de loading */}
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
      {/* Fin de loading */}
      {/*Inicio header con imagen de fondo */}
      <ImageBackground
        source={require('../../../../../../assets/images/penAndReport-bg-image.png')}
        style={{ height: height < 700 ? rV(240) : rV(174), width: '100%', zIndex: 0 }}
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
            <View style={{ flexDirection: 'row', marginTop: 10, alignContent: 'center', width: '100%' }}>
              <Text style={{
                marginLeft: 20,
                color: '#ffffff',
                fontFamily: 'Pro-Regular',
                fontSize: 16.4,
              }}>
                {t('reportsView.reportNameText')}
              </Text>
              <View style={{ flex: 1, marginLeft: 4, paddingRight: 20 }}>
                <Text style={{
                  color: '#ffffff',
                  fontFamily: 'Pro-Regular',
                  fontSize: 16.4,
                  fontWeight: 'bold',
                }}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {reportName ? reportName
                    : "Cooming soon"}
                </Text>
              </View>
            </View>
            <View style={{
              flexDirection: 'row', marginTop: 0, alignContent: 'center', alignItems: 'center', justifyContent: 'space-between', width: '100%'
            }}>
              < View style={{ flexDirection: 'row', width: '73%' }}>
                <Text style={{
                  marginLeft: 20,
                  color: '#fff',
                  fontFamily: 'Pro-Regular',
                  fontSize: 16.4,
                }}>
                  {t('measurementView.measureInPen')}
                </Text>
                <View style={{ flex: 1, width: '100%', marginLeft: 4, paddingRight: 1 }}>
                  <Text style={{
                    color: '#ffffff',
                    fontFamily: 'Pro-Regular-Bold',
                    fontSize: 16.4,
                    fontWeight: 'bold',
                  }}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {penName}</Text>
                </View>
              </View>
              <View style={{
                backgroundColor: 'rgba(53, 52, 52, 0.5)', // Color con 50% de transparencia
                alignSelf: 'flex-end',
                paddingHorizontal: 14,
                paddingVertical: 4,
                borderRadius: 6,
                // marginLeft: 10,
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
                  {t('measurementView.measureNumber')}{measurementCount}
                  {/* {stats?.measurement_by_report?.[`${reportNameFind}`]?.[`${penName}`]?.[`${typeOfObjectName}`] ? stats.measurement_by_report[`${reportNameFind}`][`${penName}`][`${typeOfObjectName}`] + 1 : 1} */}

                </Text>
              </View>
            </View>

          </View>

        </View >
        {/* contenedor contenido variable */}
      </ImageBackground >
      {/* Fin header con imagen de fondo */}
      {/* Inicio contenido */}
      <View style={styles.content}>
        {/* Inicio de contenido pre lista scroll */}
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
              width: '100%',
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
        { /* Fin de contenido pre lista scroll */}
        {/* Inicio de lista scrolleable */}
        <KeyboardAwareScrollView keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraHeight={10}
          extraScrollHeight={30}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingVertical: 10 },
          ]}>
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
                        value={values[e.pen_variable_type_of_object_id]?.toString() ?? ''}
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
                            ? Number(sliderVal && sliderVal[e.pen_variable_type_of_object_id] || 0)
                            : Number(
                              values[e.pen_variable_type_of_object_id] ||
                              0
                            )
                        }
                        onTouchStart={() => {
                          setFirstRender(true); // Resetea el valor cuando se empieza a mover el slider
                        }}
                        onSlidingComplete={(value) => {
                          handleSliderSlidingComplete(e.pen_variable_type_of_object_id,
                            e.variable.name,
                            value,
                            e.custom_parameters.value.min,
                            e.custom_parameters.value.max,
                            e.custom_parameters.value.granularity);
                        }}
                        onValueChange={(value) => {
                          if (!firstRender) {
                            return
                          }
                          handleSliderChange(
                            e.pen_variable_type_of_object_id,
                            e.variable.name,
                            value,
                            e.custom_parameters.value.min,
                            e.custom_parameters.value.max,
                            e.custom_parameters.value.granularity
                          )
                        }}
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
        </KeyboardAwareScrollView>
        {/* Fin de lista scrolleable */}
      </View>
      {/* Fin contenido */}
      {/* Inicio de botón para final */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity onPress={handleSubmit} disabled={Object.values(errors).filter((e: any) => e !== 'true').length > 0} style={styles.createButton}>
          <Text style={styles.buttonText}>{t('measurementView.saveText')}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Fin de botón para final */}
      {/* Inicio modales */}
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
        marginVertical={'55%'}
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
      {/* Fin modales */}
    </View >
    // Fin de contenedor
  );
}


export default CreateMeasurement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  backText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  fieldName: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: -50,
    borderTopLeftRadius: 54,
    borderTopRightRadius: 54,
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A6741',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#4A6741',
    fontWeight: '600',
  },
  corralList: {
    marginTop: 20,
  },
  corralItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  corralHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  corralName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  corralInfo: {
    fontSize: 14,
    color: '#666',
  },
  bottomSpacing: {
    height: 100,
  },
  bottomButtonContainer: {
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  createButton: {
    backgroundColor: '#4A6741',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontFamily: 'Pro-Regular',
    color: 'white',
    fontWeight: '600',
    fontSize: rMS(17),
  },
  // separador

  spacer: {
    // flex: 1,
    // height: '64%',
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
  attributeContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: rMS(68),
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
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
  leftActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    height: rMS(98),
    backgroundColor: '#f0f0f0',
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: rMS(52),
    backgroundColor: '#3A5228',
    width: 68,
  },
  deleteButton: {
    display: 'flex',

    alignItems: 'center',
    paddingBottom: rMS(52),
    backgroundColor: '#B82E2E',
    width: 68,
  },
  archiveButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  actionText: {
    color: '#fff',
    fontFamily: 'Pro-Regular',
    fontSize: 11.2,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 10,
    width: rMS(270),
    backgroundColor: '#EBF2ED',
  },
  modalInput: {
    width: rMS(238),
    height: rMV(32),
    borderWidth: 1.1,
    borderColor: '#96A59A',
    marginBottom: 20,
    paddingVertical: 5,
    borderRadius: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  // createButton: {
  //   padding: 5,
  //   borderRadius: 5,
  //   flex: 1,
  //   alignItems: 'center',
  // },
  fixedButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: rMV(12),
  },
  button: {
    width: '100%',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#486732',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.02,
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
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  inputContainerNumber: {
    height: 'auto',
    paddingHorizontal: rMS(14),
    paddingVertical: 10,
    justifyContent: 'flex-start',
  },
  inputContainerCategorical: {
    height: 'auto',
    paddingHorizontal: rMS(14),
    paddingVertical: 10,
    justifyContent: 'flex-start',
  },
  textDefaultValues: {
    fontSize: width * 0.04,
    fontFamily: 'Pro-Regular',
    color: '#292929',
  },
  textOptimalValues: {
    fontSize: width * 0.04,
    fontFamily: 'Pro-Regular',
    color: '#292929',
    marginTop: rMS(16),
  },
  textGranularity: {
    fontSize: width * 0.04,
    fontFamily: 'Pro-Regular',
    color: '#292929',
    marginTop: rMS(16),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  rowCategorical: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    alignItems: 'center',
  },
  textInput: {
    height: 48,
    flex: 1,
  },
  pressableButton: {
    width: 48,
    height: 48,
    backgroundColor: '#486732',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginLeft: 4,
  },
  pressableButtonText: {
    color: '#fff',
    fontSize: rMS(32),
    paddingBottom: 2,
  },
  definedValuesContainer: {
    height: 'auto',
    paddingHorizontal: rMS(14),
    paddingVertical: rMS(10),
    justifyContent: 'flex-start',
  },
  definedValuesText: {
    fontSize: width * 0.04,
    fontFamily: 'Pro-Regular',
    color: '#292929',
    marginTop: rMS(0),
  },
  definedValuesRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 0,
  },
  definedValueItem: {
    width: 'auto',
    height: 32,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#486732',
    borderRadius: 4,
  },
  definedValueText: {
    textAlign: 'center',
    paddingHorizontal: 4,
    color: '#486732',
  },
  definedValueSeparator: {
    height: '60%',
    width: 1,
    backgroundColor: '#486732',
    marginHorizontal: 4,
  },
  definedValueDeleteText: {
    fontSize: 16,
    color: '#486732',
    textAlign: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    alignSelf: 'center',
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: rMS(11),
  },
});