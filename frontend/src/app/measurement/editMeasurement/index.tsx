import useTypeOfObjectStore from '@/store/typeOfObjectStore';
import { rMS, rMV, rV } from '@/styles/responsive';
import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles';
import {
  Platform,
  Pressable,
  Text,
  View,
  StyleSheet,
  ImageBackground,
  Dimensions,
  BackHandler,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import DropDownPicker, { ValueType } from 'react-native-dropdown-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ActivityIndicator, IconButton, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useValidationRules } from '@/utils/validation/validationRules';
import useVariableStore from '@/store/variableStore';
import usePenStore from '@/store/penStore';
import { ViewStyle } from 'react-native-size-matters';
import useReportStore from '@/store/reportStore';
import Slider from '@react-native-community/slider';
const { width, height } = Dimensions.get('window');

type Item = {
  label: string;
  value: number | string;
};

export type NumericValue = {
  min: number | string;
  max: number | string;
  optimal_min: number | string;
  optimal_max: number | string;
  granularity: number | string;
};

export type CategoricalValue = string[];

type DefaultParameters = {
  value: NumericValue | CategoricalValue;
};

type FormData = {
  name: string | null;
  subject_id: number | null;
  measurements: [{ id: number; value: string }] | null;
};

type FormDataError = {
  name: string | null;
};

const CreatePen: React.FC = () => {
  const { reportId, subjectId, typeOfObjectName, subjectName } =
    useLocalSearchParams();
  const [firstRender, setFirstRender] = useState<boolean>(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [errorsName, setErrorsName] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [values, setValues] = useState<{
    [key: string]: number | string | null;
  }>({});
  const handlePress = (key: string, name: string, item: string) => {
    if (values[key] === item) {
      // const newValues = { ...values };
      // delete newValues[key];
      setValues((prevValues) => ({
        ...prevValues,
        [key]: null,
      }));

      // validateValues();

      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: 'true',
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        [key]: item,
      }));

      // validateValues();

      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const { validateNameInput } = useValidationRules();
  const [error, setError] = useState<FormDataError>({
    name: null,
  });
  const [editObjects, setEditObjects] = useState<boolean>(false);
  const router = useRouter();
  const { typeOfObjects } = useTypeOfObjectStore((state: any) => ({
    typeOfObjects: state.typeOfObjects,
  }));

  const MIN_VALUE = 0;
  const MAX_VALUE = 100;

  const {
    createReportId,
    createReport,
    reportsLoading,
    resetCreateReportId,
    setMeasurementData,
    getMeasurementEditData,
    measurementEditData,
    resetMeasurementEditData,
    createMeasurementWithReportId,
    measurementVariablesData,
    onUpdate,
  } = useReportStore((state: any) => ({
    reportsLoading: state.reportsLoading,
    createReportId: state.createReportId,
    createReport: state.createReport,
    setMeasurementData: state.setMeasurementData,
    resetCreateReportId: state.resetCreateReportId,
    measurementVariablesData: state.measurementVariablesData,
    createMeasurementWithReportId: state.createMeasurementWithReportId,
    getMeasurementEditData: state.getMeasurementEditData,
    measurementEditData: state.measurementEditData,
    resetMeasurementEditData: state.resetMeasurementEditData,
    onUpdate: state.onUpdate,
  }));

  const { pensLoading, createPen } = usePenStore((state: any) => ({
    pensLoading: state.pensLoading,
    createPen: state.createPen,
  }));

  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [itemsValue, setItemsValue] = useState<string | undefined | string[]>();
  const [items, setItems] = useState<Item[]>([]);
  const [measurement, setMeasurement] = useState<{
    [key: string]: string | number;
  }>({});

  const [formData, setFormData] = useState<FormData>({
    name: null,
    subject_id: null,
    measurements: null,
  });

  const validateForm = () => {
    const newError: FormDataError = {
      name: validateNameInput(formData.name ?? '', t),
    };

    setError(newError);
    return newError.name;
  };

  useEffect(() => {
    getMeasurementEditData(reportId, subjectId);
    return () => {
      resetMeasurementEditData();
    };
  }, []);

  // useEffect(() => {
  //   if (items.length === 0 && typeOfObjects) {
  //     typeOfObjects.map((type: any) => {
  //       setItems((prev) => [
  //         ...(prev ?? []),
  //         {
  //           label: type.name,
  //           value: type.id,
  //         },
  //       ]);
  //     });
  //   }
  // }, []);

  useEffect(() => {
    setFormData((prevValues) => ({
      ...prevValues,
      name: subjectName as string,
    }));
    if (measurementEditData) {
      measurementEditData.map((e: any) => {
        setValues((prevValues) => ({
          ...prevValues,
          [e.id]: e.value,
        }));
      });
    }
  }, [measurementEditData]);

  useEffect(() => {
    validateValues();
  }, [values]);

  const onChange = (field: keyof FormData, inputValue: any) => {
    // const updatedFormData = { ...formData, [field]: inputValue };
    // switch (field) {
    //   default:
    //     setError((prevError) => ({
    //       ...prevError,
    //       name: validateNameInput(inputValue, t),
    //     }));
    // }
    setFormData({ ...formData, [field]: inputValue });
  };

  const validateValues = () => {
    const newErrors: any = [];
    measurementEditData &&
      measurementEditData.forEach((e: any) => {
        if (values[e['id']] === null || values[e['id']] === '') {
          newErrors.push(e.pen_variable_type_of_object.variable.name);
        }
      });
    setErrorsName(newErrors);
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateValues();
    if (
      validationErrors.length > 0 &&
      validationErrors.length === measurementEditData.length
    ) {
      Alert.alert(
        'Faltan campos por completar',
        'Por favor, complete los campos faltantes.'
      );
      return;
    }
    if (
      validationErrors.length > 0 &&
      validationErrors.length !== measurementEditData.length
    ) {
      Alert.alert(
        'Faltan algunos campos por completar',
        'Por favor, complete los campos faltantes.'
      );
      return;
    }
    Alert.alert(
      '¿Estás seguro de guardar la medición?',
      'Una vez guardada, no podrás modificarla.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Guardar',
          onPress: async () => {
            try {
              const newMeasurement = {
                name: formData.name,
                subject_id: +subjectId as number,
                measurements: Object.entries(values).map(([key, value]) => ({
                  id: Number(+key),
                  value: typeof value === 'number' ? value.toString() : value,
                })),
              };
              await onUpdate(reportId, newMeasurement);
              alert('Medición actualizada con éxito');
              router.back();
            } catch (error) {
              console.log('ERROR:', error);
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (formData.name) {
          Alert.alert(
            t('attributeView.unsavedChangesTitle'),
            t('attributeView.unsavedChangesMessage'),
            [
              {
                text: t('attributeView.leaveButtonText'),
                style: 'cancel',
                onPress: () => router.back(),
              },
              {
                text: t('attributeView.cancelButtonText'),
              },
            ],
            { cancelable: false }
          );
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [formData])
  );

  const handleInputChange = (
    key: string,
    name: string,
    min: number,
    max: number,
    value: string,
    step: number = 1
  ) => {
    setValues((prevValues) => ({
      ...prevValues,
      [key]: value,
    }));

    if (value === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: 'true',
      }));
      // const newValues = { ...values };
      // delete newValues[key];
      // setValues(newValues);
      setValues((prevValues) => ({
        ...prevValues,
        [key]: null,
      }));
    } else {
      const numericValue = parseInt(value, 10);
      if (!isNaN(numericValue)) {
        if (
          numericValue < min ||
          numericValue > max ||
          ((numericValue - min) % step !== 0 &&
            numericValue !== min &&
            numericValue !== max)
        ) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: `El valor debe estar entre ${min} y ${max} y respetar la granularidad de ${step}.`,
          }));
        } else {
          const newErrors = { ...errors };
          delete newErrors[name];
          setErrors(newErrors);
        }
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'El valor debe ser un número.',
        }));
      }
    }
  };

  const handleSliderChange = (
    key: string,
    name: string,
    value: number | null
  ) => {
    if (value === null || value === undefined) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: 'El campo no puede estar vacío.',
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        [key]: value,
      }));
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

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
          source={require('../../../../assets/images/penAndReport-bg-image.png')}
          style={{ height: rV(174), width: '100%', zIndex: 0 }}
          resizeMode="cover"
        >
          <View>
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
              <Text style={styles.greeting}>{t('detailField.goBackText')}</Text>
            </View>
            <View>
              <Text style={styles.welcome}>Editar medición</Text>
            </View>
          </View>

          {/* contenedor contenido variable */}
        </ImageBackground>

        <View
          style={{
            backgroundColor: 'white',
            width: '100%',
            flex: 1,
            // height: Dimensions.get('window').height,
            maxHeight: Dimensions.get('window').height + rMS(140),
            minHeight: Dimensions.get('window').height - rMS(130),
            zIndex: 200,
            top: rMS(-50),
            borderTopLeftRadius: 54,
            borderTopRightRadius: 54,
            paddingBottom: rMS(20),
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
            Medición de objetos
          </Text>

          {/* contenido scroll  */}
          <View
            style={{
              // flex: 1,
              height: Dimensions.get('window').height > 640 ? '82%' : '64%',
            }}
          >
            <KeyboardAwareScrollView
              keyboardShouldPersistTaps="handled"
              enableOnAndroid
              extraHeight={10}
              extraScrollHeight={30}
              contentContainerStyle={[
                styles.scrollContent,
                { height: open ? rMS(360) : null, paddingVertical: 10 },
              ]}
            >
              <View style={[styles.spacer, { marginBottom: 20 }]}>
                <TextInput
                  mode="outlined"
                  placeholderTextColor="#486732"
                  placeholder={`Objeto a medir: ${typeOfObjectName}`}
                  editable={false}
                  activeOutlineColor="transparent"
                  outlineColor="#F1F1F1"
                  style={styles.input}
                />

                <TextInput
                  mode="outlined"
                  placeholderTextColor="#292929"
                  placeholder="Nombre del objeto"
                  value={formData.name as string}
                  onChangeText={(value) => onChange('name', value)}
                  autoCapitalize="words"
                  activeOutlineColor="transparent"
                  outlineColor="#F1F1F1"
                  cursorColor="#486732"
                  selectionColor={Platform.OS == 'ios' ? '#486732' : '#486732'}
                  style={styles.input}
                />
                {error?.name && (
                  <Text style={styles.errorText}>{error?.name}</Text>
                )}
                {measurementEditData &&
                  measurementEditData.map((e: any) => (
                    <View key={e.id}>
                      {e.pen_variable_type_of_object.variable.type ===
                      'NUMBER' ? (
                        <View
                          style={{
                            alignSelf: 'center',
                            justifyContent: 'center',
                            marginVertical: height * 0.01,
                            width: width * 0.9,
                            height: 'auto',
                            borderWidth: 1,
                            paddingVertical: rMS(10),
                            // fontSize: width * 0.04,
                            // fontFamily: 'Pro-Regular',
                            // color: '#292929',
                            borderColor: '#F1F1F1',
                            backgroundColor: '#F1F1F1',
                            borderRadius: 8,
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}
                        >
                          <View
                            style={{
                              display: 'flex',
                              width: width * 0.9,
                              paddingHorizontal: rMS(16),
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Text
                              style={{
                                textAlign: 'center',
                                fontFamily: 'Pro-Regular',
                                fontSize: rMS(14),
                              }}
                            >
                              {e.pen_variable_type_of_object.variable.name}
                            </Text>
                            <Text>
                              {`Min: ${e.pen_variable_type_of_object.custom_parameters.value.min}; Max: ${e.pen_variable_type_of_object.custom_parameters.value.max}`}
                            </Text>
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
                              value={String(values[e.id] || '')}
                              onChangeText={(value) =>
                                handleInputChange(
                                  e.id,
                                  'whats ',
                                  e.pen_variable_type_of_object
                                    .custom_parameters.value.min,
                                  e.pen_variable_type_of_object
                                    .custom_parameters.value.max,
                                  value,
                                  e.pen_variable_type_of_object
                                    .custom_parameters.value.granularity
                                )
                              }
                              keyboardType="numeric"
                              autoCapitalize="words"
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
                              style={{
                                width: width * 0.9 - rMS(100) - rMS(12),
                              }}
                              minimumValue={
                                e.pen_variable_type_of_object.custom_parameters
                                  .value.min
                              }
                              maximumValue={
                                e.pen_variable_type_of_object.custom_parameters
                                  .value.max ?? 0
                              }
                              step={
                                e.pen_variable_type_of_object.custom_parameters
                                  .value.granularity
                              }
                              value={Number(values[e.id] || 0)}
                              onValueChange={(value) =>
                                handleSliderChange(e.id, 'whats', value)
                              }
                              minimumTrackTintColor="#486732"
                              // maximumTrackTintColor="#000000"
                              thumbTintColor="#FFFFFF"
                            />
                          </View>
                          {/* {errors[e.variable.name] &&
                            errors[e.variable.name] !== 'true' && (
                              <Text style={styles.errorText}>
                                {errors[e.variable.name]}
                              </Text>
                            )} */}
                          <View
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
                              {
                                e.pen_variable_type_of_object.custom_parameters
                                  .value.granularity
                              }
                            </Text>
                          </View>
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
                            // fontSize: width * 0.04,
                            // fontFamily: 'Pro-Regular',
                            // color: '#292929',
                            borderColor: '#F1F1F1',
                            backgroundColor:
                              // errors[e.variable.name] === 'true' ||
                              // errorsName.includes(e.variable.name)
                              //   ? 'rgba(217, 162, 32, 0.12)'
                              // :
                              '#F1F1F1',
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
                                {e.pen_variable_type_of_object.variable.name}
                              </Text>
                              {/* {errors[e.variable.name] === 'true' ||
                              errorsName.includes(e.variable.name) ? (
                                <IconButton
                                  icon={'alert-circle-outline'}
                                  iconColor="#D9A220"
                                  size={rMS(20)}
                                  style={{ margin: 0 }}
                                />
                              ) : null} */}
                            </View>
                            <View style={{}}>
                              <View
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  flexWrap: 'wrap',
                                  columnGap: 10,
                                  paddingHorizontal: rMS(16),
                                  rowGap: 0,
                                }}
                              >
                                {e.pen_variable_type_of_object.custom_parameters.value.map(
                                  (item: string, index: number) => (
                                    <Pressable
                                      key={index}
                                      onPress={() =>
                                        handlePress(e.id, 'whats', item)
                                      }
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
                                            values[e.id] === item
                                              ? '#486732'
                                              : 'transparent',
                                        }}
                                      >
                                        <Text
                                          style={{
                                            textAlign: 'center',
                                            paddingHorizontal: 4,
                                            color:
                                              values[e.id] === item
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

                              {/* {errors[e.variable.name] && (
                                <Text style={styles.errorText}>
                                  {errors[e.variable.name]}
                                </Text>
                              )} */}
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
              </View>
            </KeyboardAwareScrollView>
          </View>
          {/* este view es para poner el boton debajo de todo */}

          <View
            style={{ flex: Dimensions.get('window').height > 640 ? 1 : 0.5 }}
          />
          {/* Botón fijo */}
          <View style={styles.fixedButtonContainer}>
            <Pressable style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Terminar edición</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CreatePen;
