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
import {
  ModalComponent,
  SuccessModal,
  UnsavedModalComponent,
} from '@/components/modal/ModalComponent';
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
  const [texts, setTexts] = useState({
    title: '',
    subtitle: '',
  });
  const [formOk, setFormOk] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<string | null>(null);
  const [modalSuccess, setIsModalSuccess] = useState<boolean>(false);
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
        [name]: 'Debes seleccionar un valor.',
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

  const router = useRouter();

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

  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: null,
    subject_id: null,
    measurements: null,
  });

  useEffect(() => {
    getMeasurementEditData(reportId, subjectId);
    return () => {
      resetMeasurementEditData();
    };
  }, []);

  useEffect(() => {
    setFormData((prevValues) => ({
      ...prevValues,
      name: subjectName ? (subjectName as string) : null,
      subject_id: Number(subjectId),
    }));
    if (measurementEditData) {
      measurementEditData.map((e: any) => {
        setValues((prevValues) => ({
          ...prevValues,
          [e.id]: e.value,
        }));
        if (!isNaN(e.value)) {
          setSliderValue((prevValues) => ({
            ...prevValues,
            [e.id]: e.value,
          }));
        }
      });
    }
  }, [measurementEditData]);
  useEffect(() => {
    validateValues();
  }, [values]);

  const onChange = (field: keyof FormData, inputValue: any) => {
    setFormData({
      ...formData,
      [field]: inputValue === undefined ? null : inputValue,
    });
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
    // const validationErrors = validateValues();
    // if (
    //   (validationErrors.length > 0 &&
    //     validationErrors.length !== measurementEditData.length) ||
    //   validationErrors.length === measurementEditData.length
    // ) {
    //   setFormOk(false);
    //   setTexts({
    //     title: 'Faltan campos por completar',
    //     subtitle: `No has completado el campo: ${validationErrors.join(', ')}.`,
    //   });
    //   setModalVisible(null);

    //   // Alert.alert(
    //   //   'Faltan algunos campos por completar',
    //   //   'Por favor, complete los campos faltantes.'
    //   // );
    //   return;
    // }
    // setFormOk(true);
    // setTexts({
    //   title: '¿Estás seguro de guardar la medición?',
    //   subtitle: `Una vez guardada, no podrás modificarla.`,
    // });
    // setModalVisible(null);
    try {
      editNewsMeasurements();
      setModalVisible('success');
    } catch (error) {
      console.log('ERROR:', error);
    }
  };

  const getModalButtons = () => {
    if (modalVisible === 'unsavedChanges') {
      return [
        {
          text: t('attributeView.cancelButtonText'),
          onPress: () => setModalVisible(null),
        },
        {
          text: t('attributeView.leaveButtonText'),
          onPress: () => {
            setModalVisible(null);
            router.back();
          },
        },
      ];
    }
  };

  const showUnsavedChangesModal = () => {
    setTexts({
      title: t('attributeView.unsavedChangesTitle'),
      subtitle: t('attributeView.unsavedChangesMessage'),
    });
    setModalVisible('unsavedChanges');
  };

  // useEffect(() => {
  //   const onBackPress = () => {
  //     router.back();
  //     return true;
  //   };

  //   BackHandler.addEventListener('hardwareBackPress', onBackPress);

  //   return () => {
  //     BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  //   };
  // }, [formData]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const onBackPress = () => {
  //       if (formData.name || Object.keys(values).length > 0) {
  //         Alert.alert(
  //           t('attributeView.unsavedChangesTitle'),
  //           t('attributeView.unsavedChangesMessage'),
  //           [
  //             {
  //               text: t('attributeView.leaveButtonText'),
  //               style: 'cancel',
  //               onPress: () => router.back(),
  //             },
  //             {
  //               text: t('attributeView.cancelButtonText'),
  //             },
  //           ],
  //           { cancelable: false }
  //         );
  //         return true;
  //       }
  //       return false;
  //     };

  //     BackHandler.addEventListener('hardwareBackPress', onBackPress);

  //     return () =>
  //       BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  //   }, [formData])
  // );

  const [sliderValue, setSliderValue] = useState<{
    [key: string]: number | string | null;
  }>({});

  const editNewsMeasurements = async () => {
    const editsMeasurements = {
      name: formData.name,
      subject_id: formData.subject_id,
      measurements: Object.entries(values)
        .filter(([key, value]) => value !== null)
        .map(([key, value]) => ({
          id: key,
          value: value,
        })),
    };
    try {
      await onUpdate(reportId, editsMeasurements);
    } catch (error) {
      console.log(error);
    }
  };
  const handleInputChange = (
    key: string,
    name: string,
    min: number,
    max: number,
    value: string,
    step: number = 1
  ) => {
    const sanitizedValue = value.replace(',', '.');
    const pointCount = (sanitizedValue.match(/\./g) || []).length;
    if (pointCount > 1) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: 'El valor no puede tener más de un punto decimal.',
      }));
      return;
    }
    setValues((prevValues) => ({
      ...prevValues,
      [key]: sanitizedValue,
    }));

    if (sanitizedValue === '') {
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
    const numericValue = parseFloat(sanitizedValue);
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
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });
    setValues((prevValues) => ({
      ...prevValues,
      [key]: value,
    }));
    setValues((prevValues) => ({
      ...prevValues,
      [key]: parseFloat(value.toFixed(2)).toString(),
    }));
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
          Medición de objetos
        </Text>

        {/* contenido scroll  */}
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
          <View style={{ marginBottom: 20 }}>
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
              autoCapitalize="sentences"
              activeOutlineColor="transparent"
              outlineColor="#F1F1F1"
              cursorColor="#486732"
              selectionColor={Platform.OS == 'ios' ? '#486732' : '#486732'}
              style={styles.input}
            />

            {measurementEditData &&
              measurementEditData.map((e: any) => (
                <View key={e.id}>
                  {e.pen_variable_type_of_object.variable.type === 'NUMBER' ? (
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
                          errors[e.pen_variable_type_of_object.variable.name] ||
                          errorsName.includes(
                            e.pen_variable_type_of_object.variable.name
                          )
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
                          width: width * 0.9,
                          paddingHorizontal: rMS(16),
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
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
                        {errors[e.pen_variable_type_of_object.variable.name] ||
                        errorsName.includes(
                          e.pen_variable_type_of_object.variable.name
                        ) ? (
                          <IconButton
                            icon={'alert-circle-outline'}
                            iconColor="#D9A220"
                            size={rMS(20)}
                            style={{
                              margin: 0,
                              // marginVertical: rMV(-7),
                            }}
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
                          value={String(values[e.id] || '')}
                          onChangeText={(value) =>
                            handleInputChange(
                              e.id,
                              e.pen_variable_type_of_object.variable.name,
                              e.pen_variable_type_of_object.custom_parameters
                                .value.min,
                              e.pen_variable_type_of_object.custom_parameters
                                .value.max,
                              value,
                              e.pen_variable_type_of_object.custom_parameters
                                .value.granularity
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
                          value={Number(sliderValue[e.id])}
                          onSlidingComplete={(value) => {
                            setSliderValue((prevValues) => ({
                              ...prevValues,
                              [e.id]: value,
                            }));
                          }}
                          onValueChange={(value) =>
                            handleSliderChange(
                              e.id,
                              e.pen_variable_type_of_object.variable.name,
                              value,
                              e.pen_variable_type_of_object.custom_parameters
                                .value.min,
                              e.pen_variable_type_of_object.custom_parameters
                                .value.max,
                              e.pen_variable_type_of_object.custom_parameters
                                .value.granularity
                            )
                          }
                          minimumTrackTintColor="#486732"
                          // maximumTrackTintColor="#000000"
                          thumbTintColor="#FFFFFF"
                        />
                      </View>
                      {errors[e.pen_variable_type_of_object.variable.name] &&
                        errors[e.pen_variable_type_of_object.variable.name] !==
                          'true' && (
                          <Text style={styles.errorText}>
                            {
                              errors[
                                e.pen_variable_type_of_object.variable.name
                              ]
                            }
                          </Text>
                        )}
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
                          errors[e.pen_variable_type_of_object.variable.name] ||
                          errorsName.includes(
                            e.pen_variable_type_of_object.variable.name
                          )
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
                            {e.pen_variable_type_of_object.variable.name}
                          </Text>
                          {errors[
                            e.pen_variable_type_of_object.variable.name
                          ] ||
                          errorsName.includes(
                            e.pen_variable_type_of_object.variable.name
                          ) ? (
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
                              rowGap: 0,
                            }}
                          >
                            {e.pen_variable_type_of_object.custom_parameters.value.map(
                              (item: string, index: number) => (
                                <Pressable
                                  key={index}
                                  onPress={() =>
                                    handlePress(
                                      e.id,
                                      e.pen_variable_type_of_object.variable
                                        .name,
                                      item
                                    )
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

                          {errors[
                            e.pen_variable_type_of_object.variable.name
                          ] && (
                            <Text style={styles.errorText}>
                              {
                                errors[
                                  e.pen_variable_type_of_object.variable.name
                                ]
                              }
                            </Text>
                          )}
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
            style={[
              styles.button,
              { opacity: Object.keys(errors).length > 0 ? 0.5 : 1 },
            ]}
            disabled={Object.keys(errors).length > 0}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Terminar edición</Text>
          </Pressable>
        </View>
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
          back={true}
        />
      </View>
    </View>
  );
};

export default CreatePen;
