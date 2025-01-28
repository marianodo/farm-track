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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useValidationRules } from '@/utils/validation/validationRules';
import useVariableStore from '@/store/variableStore';
import usePenVariableTypeOfObjectStore from '@/store/pen_variable_typeOfObject_store';
const { width } = Dimensions.get('window');

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
  custom_parameters: DefaultParameters | null;
};

type FormDataError = {
  name: string | null;
  custom_parameters: { [key: string]: string } | null;
};

const EditVariable: React.FC = () => {
  const { onUpdateByIds, penVariableTypeOfObjectsLoading } =
    usePenVariableTypeOfObjectStore((state: any) => ({
      penVariableTypeOfObjectsLoading: state.penVariableTypeOfObjectsLoading,
      onUpdateByIds: state.onUpdateByIds,
    }));

  const {
    penId,
    variableName,
    typeOfObjectsId,
    variableId,
    type,
    custom_parameters,
    penName,
  } = useLocalSearchParams();
  const {
    validateRangeOrGranularity,
    validateCategoricalValue,
    validateTypeObjectValue,
    validateNameInput,
  } = useValidationRules();
  const [error, setError] = useState<FormDataError>({
    name: null,
    custom_parameters: null,
  });
  const options = [0.1, 0.25, 0.5, 1];
  const [editObjects, setEditObjects] = useState<boolean>(false);
  const router = useRouter();
  const { typeOfObjects } = useTypeOfObjectStore((state: any) => ({
    typeOfObjects: state.typeOfObjects,
  }));
  const { createVariable, variablesLoading } = useVariableStore(
    (state: any) => ({
      createVariable: state.createVariable,
      variablesLoading: state.variablesLoading,
    })
  );
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [itemsValue, setItemsValue] = useState<string | undefined | string[]>();
  const [categoricalValue, setCategoricalValue] = useState<string | null>();
  const [items, setItems] = useState<Item[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: variableName as string,
    custom_parameters: JSON.parse(
      Array.isArray(custom_parameters)
        ? custom_parameters[0]
        : custom_parameters
    ) as DefaultParameters,
  });

  const validateForm = () => {
    const newError: FormDataError = {
      name: validateNameInput(formData.name ?? '', t),
      // type: formData.type ? null : t('validation.required'),
      custom_parameters:
        type === 'NUMBER'
          ? validateRangeOrGranularity(
              formData.custom_parameters?.value as NumericValue,
              t
            )
          : validateCategoricalValue(
              formData.custom_parameters?.value as CategoricalValue,
              t
            ),
    };

    setError(newError);
    return newError.name || newError.custom_parameters;
  };

  useEffect(() => {
    if (items.length === 0 && typeOfObjects) {
      typeOfObjects.map((type: any) => {
        setItems((prev) => [
          ...(prev ?? []),
          {
            label: type.name,
            value: type.id,
          },
        ]);
      });
    }
  }, []);

  const onChange = (field: keyof FormData, inputValue: any) => {
    const updatedFormData = { ...formData, [field]: inputValue };
    switch (field) {
      default:
        setError((prevError) => ({
          ...prevError,
          name: validateNameInput(inputValue, t),
        }));
    }
    setFormData(updatedFormData);
  };

  const onChangeDefaultValue = (value: any, key: string) => {
    if (type === 'NUMBER') {
      const updatedValues = {
        ...((formData.custom_parameters?.value as NumericValue) || {}),
        [key]: value !== '' ? parseFloat(value) : '',
      };

      const newFormData = {
        ...formData,
        custom_parameters: {
          ...formData.custom_parameters,
          value: updatedValues,
        },
      };

      setFormData(newFormData);

      const errors = validateRangeOrGranularity(
        newFormData?.custom_parameters?.value as NumericValue,
        t
      );

      setError((prevError) => ({
        ...prevError,
        custom_parameters: errors,
      }));
      return;
    }
    if (type === 'CATEGORICAL') {
      if (key === 'delete') {
        setFormData((prevFormData) => {
          const updatedValues = Array.isArray(
            prevFormData.custom_parameters?.value
          )
            ? prevFormData.custom_parameters.value.filter(
                (item: string) => item.toLowerCase() !== value.toLowerCase()
              )
            : [];

          const newFormData = {
            ...prevFormData,
            custom_parameters:
              updatedValues.length > 0
                ? {
                    ...prevFormData.custom_parameters,
                    value: updatedValues,
                  }
                : null,
          };

          const errors = validateCategoricalValue(
            newFormData.custom_parameters?.value as CategoricalValue,
            t
          );

          setError((prevError) => ({
            ...prevError,
            custom_parameters: errors,
          }));

          return newFormData;
        });
      } else {
        setFormData((prevFormData) => {
          let newFormData: FormData;
          const currentValues = Array.isArray(
            prevFormData.custom_parameters?.value
          )
            ? prevFormData.custom_parameters.value
            : [];

          if (
            value &&
            value.trim() !== '' &&
            !currentValues.some(
              (item) => item.toLowerCase() === value.toLowerCase()
            )
          ) {
            const newValues = [...currentValues, value];
            newFormData = {
              ...prevFormData,
              custom_parameters: {
                ...prevFormData.custom_parameters,
                value: newValues,
              },
            };
          } else {
            newFormData = prevFormData;
          }

          const errors = validateCategoricalValue(
            newFormData.custom_parameters?.value as CategoricalValue,
            t
          );

          setError((prevError) => ({
            ...prevError,
            custom_parameters: errors,
          }));

          return newFormData;
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      try {
        await onUpdateByIds(penId, variableId, typeOfObjectsId, {
          custom_parameters: formData.custom_parameters,
        });

        alert(t('attributeView.formOkText'));
        setFormData({
          name: null,
          custom_parameters: {
            value: {
              min: 0,
              max: 0,
              optimal_min: 0,
              optimal_max: 0,
              granularity: 0,
            },
          },
        });
        setItemsValue(undefined);
        router.back();
      } catch (error) {
        console.log(error);
        alert(t('attributeView.formErrorText'));
      }
    } else {
      alert(t('attributeView.formErrorText'));
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (formData.name || formData.custom_parameters) {
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

  return (
    <View
      style={[
        styles.titleContainer,
        { maxHeight: Dimensions.get('window').height },
      ]}
    >
      {penVariableTypeOfObjectsLoading && (
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
        source={require('../../../../../../assets/images/penAndReport-bg-image.png')}
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
            <Text style={styles.welcome}>{t('editTypeObject.title')}</Text>
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
            marginBottom: rMS(10),
          }}
        >
          {`${t('editTypeObject.subtitleVariable')} ${
            type === 'NUMBER'
              ? t('editTypeObject.number')
              : t('editTypeObject.categorical')
          }`}
        </Text>

        {/* contenido scroll  */}
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: rMS(5),
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
              // marginTop: rMV(20),
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
              {`${t('editTypeObject.helpText2')}: ${penName}.`}
            </Text>
          </View>
        </View>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraHeight={10}
          extraScrollHeight={30}
          contentContainerStyle={[
            styles.scrollContent,
            { height: open ? rMS(360) : null },
          ]}
        >
          <View style={{ width: '100%', marginBottom: 20 }}>
            {type !== null && type === 'NUMBER' ? (
              <>
                <TextInput
                  mode="outlined"
                  placeholderTextColor="#292929"
                  placeholder={t('penView.penNamePlaceHolder')}
                  value={formData.name as string}
                  editable={false}
                  // onChangeText={(value) => onChange('name', value)}
                  autoCapitalize="sentences"
                  activeOutlineColor="transparent"
                  outlineColor="#F1F1F1"
                  cursorColor="#486732"
                  selectionColor={Platform.OS == 'ios' ? '#486732' : '#486732'}
                  style={styles.input}
                />
                {error?.name && (
                  <Text style={styles.errorText}>{error?.name}</Text>
                )}
                <View style={[styles.input, styles.inputContainerNumber]}>
                  <Text style={styles.textDefaultValues}>
                    {t('attributeView.createPlaceHolderDefaultValues')}
                  </Text>
                  <View style={styles.row}>
                    <TextInput
                      mode="outlined"
                      placeholderTextColor="#486732"
                      placeholder={t('attributeView.createPlaceHolderMinValue')}
                      activeOutlineColor="#486732"
                      outlineColor="#486732"
                      cursorColor="#486732"
                      keyboardType="numeric"
                      value={
                        (
                          formData?.custom_parameters?.value as NumericValue
                        )?.min?.toString() ?? ''
                      }
                      onChangeText={(value) =>
                        onChangeDefaultValue(value, 'min')
                      }
                      selectionColor={
                        Platform.OS == 'ios' ? '#486732' : '#486732'
                      }
                      style={[styles.input, styles.textInput]}
                    />
                    <TextInput
                      mode="outlined"
                      placeholderTextColor="#486732"
                      placeholder={t('attributeView.createPlaceHolderMaxValue')}
                      activeOutlineColor="#486732"
                      outlineColor="#486732"
                      cursorColor="#486732"
                      keyboardType="numeric"
                      value={
                        (
                          formData?.custom_parameters?.value as NumericValue
                        )?.max?.toString() ?? ''
                      }
                      onChangeText={(value) =>
                        onChangeDefaultValue(value, 'max')
                      }
                      selectionColor={
                        Platform.OS == 'ios' ? '#486732' : '#486732'
                      }
                      style={[styles.input, styles.textInput]}
                    />
                  </View>
                  {error?.custom_parameters?.minMax && (
                    <Text style={styles.errorText}>
                      {error?.custom_parameters?.minMax}
                    </Text>
                  )}
                  <Text style={styles.textOptimalValues}>
                    {t('attributeView.createPlaceHolderOptimalValues')}
                  </Text>
                  <View style={styles.row}>
                    <TextInput
                      mode="outlined"
                      placeholderTextColor="#486732"
                      placeholder={t('attributeView.createPlaceHolderMinValue')}
                      activeOutlineColor="#486732"
                      outlineColor="#486732"
                      cursorColor="#486732"
                      keyboardType="numeric"
                      value={
                        (
                          formData?.custom_parameters?.value as NumericValue
                        )?.optimal_min?.toString() ?? ''
                      }
                      onChangeText={(value) =>
                        onChangeDefaultValue(value, 'optimal_min')
                      }
                      selectionColor={
                        Platform.OS == 'ios' ? '#486732' : '#486732'
                      }
                      style={[styles.input, styles.textInput]}
                    />
                    <TextInput
                      mode="outlined"
                      placeholderTextColor="#486732"
                      placeholder={t('attributeView.createPlaceHolderMaxValue')}
                      activeOutlineColor="#486732"
                      outlineColor="#486732"
                      cursorColor="#486732"
                      keyboardType="numeric"
                      value={
                        (
                          formData?.custom_parameters?.value as NumericValue
                        )?.optimal_max?.toString() ?? ''
                      }
                      onChangeText={(value) =>
                        onChangeDefaultValue(value, 'optimal_max')
                      }
                      selectionColor={
                        Platform.OS == 'ios' ? '#486732' : '#486732'
                      }
                      style={[styles.input, styles.textInput]}
                    />
                  </View>
                  {error?.custom_parameters?.optimalMinMax && (
                    <Text style={styles.errorText}>
                      {error?.custom_parameters?.optimalMinMax}
                    </Text>
                  )}
                  <Text style={styles.textGranularity}>
                    {t('attributeView.createTextGranularity')}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                      paddingVertical: rMV(10),
                      paddingTop: rMV(20),
                    }}
                  >
                    {options.map((value) => (
                      <Pressable
                        key={value}
                        onPress={() => {
                          onChangeDefaultValue(value, 'granularity');
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <View
                          style={{
                            height: 18,
                            width: 18,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#486732',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 5,
                          }}
                        >
                          {formData.custom_parameters?.value['granularity'] ===
                            value && (
                            <View
                              style={{
                                height: 8,
                                width: 8,
                                borderRadius: 5,
                                backgroundColor: '#486732',
                              }}
                            />
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: width * 0.04,
                            fontFamily: 'Pro-Regular',
                            color: '#292929',
                          }}
                        >
                          {value}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {error?.custom_parameters?.granularity && (
                    <Text style={styles.errorText}>
                      {error?.custom_parameters?.granularity}
                    </Text>
                  )}
                </View>
              </>
            ) : type === 'CATEGORICAL' ? (
              <>
                <TextInput
                  mode="outlined"
                  placeholderTextColor="#292929"
                  placeholder={t('penView.penNamePlaceHolder')}
                  value={formData.name as string}
                  editable={false}
                  // onChangeText={(value) => onChange('name', value)}
                  autoCapitalize="sentences"
                  activeOutlineColor="transparent"
                  outlineColor="#F1F1F1"
                  cursorColor="#486732"
                  selectionColor={Platform.OS == 'ios' ? '#486732' : '#486732'}
                  style={styles.input}
                />
                {error?.name && (
                  <Text style={styles.errorText}>{error?.name}</Text>
                )}
                <View style={[styles.input, styles.inputContainerCategorical]}>
                  <Text style={styles.textDefaultValues}>
                    {t('attributeView.createPlaceHolderDefaultValues')}
                  </Text>
                  <View style={styles.rowCategorical}>
                    <TextInput
                      mode="outlined"
                      placeholderTextColor="#486732"
                      placeholder={t(
                        'attributeView.createPlaceHolderExampleDefaultValues'
                      )}
                      activeOutlineColor="#486732"
                      outlineColor="#486732"
                      cursorColor="#486732"
                      value={categoricalValue ?? ''}
                      onChangeText={(value) => setCategoricalValue(value)}
                      selectionColor={
                        Platform.OS == 'ios' ? '#486732' : '#486732'
                      }
                      style={[styles.input, styles.textInput]}
                    />
                    <Pressable
                      onPress={() => {
                        onChangeDefaultValue(categoricalValue, '');
                        setCategoricalValue(null);
                      }}
                      style={styles.pressableButton}
                    >
                      <Text style={styles.pressableButtonText}>+</Text>
                    </Pressable>
                  </View>
                  {error?.custom_parameters?.categoricalEmpty && (
                    <Text style={styles.errorText}>
                      {error?.custom_parameters?.categoricalEmpty}
                    </Text>
                  )}
                </View>
                {formData.custom_parameters?.value &&
                  Array.isArray(formData.custom_parameters.value) &&
                  formData.custom_parameters?.value.length > 0 && (
                    <View style={[styles.input, styles.definedValuesContainer]}>
                      <Text style={styles.definedValuesText}>
                        {t('attributeView.createTextDefinedValues')}
                      </Text>
                      <View style={styles.definedValuesRow}>
                        {formData.custom_parameters.value.length > 0 &&
                          formData.custom_parameters.value.map(
                            (item, index) => (
                              <Pressable
                                key={index}
                                onPress={() =>
                                  onChangeDefaultValue(item, 'delete')
                                }
                              >
                                <View style={styles.definedValueItem}>
                                  <Text style={styles.definedValueText}>
                                    {item}
                                  </Text>
                                  <View style={styles.definedValueSeparator} />
                                  <Text style={styles.definedValueDeleteText}>
                                    x
                                  </Text>
                                </View>
                              </Pressable>
                            )
                          )}
                      </View>
                      {error?.custom_parameters?.categorical && (
                        <Text style={styles.errorText}>
                          {error?.custom_parameters?.categorical}
                        </Text>
                      )}
                    </View>
                  )}
              </>
            ) : null}
          </View>
        </KeyboardAwareScrollView>
        {/* Botón fijo */}
        <View style={styles.fixedButtonContainer}>
          <Pressable onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>
              {t('attributeView.updateVariableTextButton')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default EditVariable;
