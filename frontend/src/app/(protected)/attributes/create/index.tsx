import useTypeOfObjectStore from '@/store/typeOfObjectStore';
import { rMS, rMV, rV } from '@/styles/responsive';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
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
} from 'react-native';
import DropDownPicker, { ValueType } from 'react-native-dropdown-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ActivityIndicator, IconButton, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useValidationRules } from '@/utils/validation/validationRules';
import useVariableStore from '@/store/variableStore';
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
  type: 'NUMBER' | 'CATEGORICAL' | null;
  defaultValue: DefaultParameters | null;
  type_of_object_ids: number[] | null;
};

type FormDataError = {
  name: string | null;
  type: string | null;
  defaultValue: { [key: string]: string } | null;
  type_of_object_ids: string | null;
};

const CreateAttribute: React.FC = () => {
  const {
    validateRangeOrGranularity,
    validateCategoricalValue,
    validateTypeObjectValue,
    validateNameInput,
  } = useValidationRules();
  const [error, setError] = useState<FormDataError>({
    name: null,
    type: null,
    defaultValue: null,
    type_of_object_ids: null,
  });
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
  const [itemsValue, setItemsValue] = useState<string | undefined>();
  const [categoricalValue, setCategoricalValue] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: null,
    type: null,
    defaultValue: {
      value: {
        min: 0,
        max: 0,
        optimal_min: 0,
        optimal_max: 0,
        granularity: 0,
      },
    },
    type_of_object_ids: null,
  });

  const validateForm = () => {
    const newError: FormDataError = {
      name: validateNameInput(formData.name ?? '', t),
      type: formData.type ? null : t('validation.required'),
      defaultValue:
        formData.type === 'NUMBER'
          ? validateRangeOrGranularity(
              formData.defaultValue?.value as NumericValue,
              t
            )
          : validateCategoricalValue(
              formData.defaultValue?.value as CategoricalValue,
              t
            ),
      type_of_object_ids: validateTypeObjectValue(
        formData.type_of_object_ids,
        t
      ),
    };

    setError(newError);
    return (
      newError.name ||
      newError.type ||
      newError.defaultValue ||
      newError.type_of_object_ids
    );
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
      case 'type':
        updatedFormData.defaultValue = null;
        if (inputValue === 'NUMBER') {
          updatedFormData.defaultValue = {
            value: {
              min: '',
              max: '',
              optimal_min: '',
              optimal_max: '',
              granularity: '',
            },
          };
        } else if (inputValue === 'CATEGORICAL') {
          updatedFormData.defaultValue = {
            value: [],
          };
        }
        setError({
          ...error,
          defaultValue: null,
        });
        break;
      case 'type_of_object_ids':
        setError((prevError) => ({
          ...prevError,
          type_of_object_ids:
            itemsValue !== undefined
              ? validateTypeObjectValue(inputValue as number[] | null, t)
              : null,
        }));
        break;
      default:
        setError((prevError) => ({
          ...prevError,
          name: validateNameInput(inputValue, t),
        }));
    }
    setFormData(updatedFormData);
  };

  const onChangeDefaultValue = (value: any, key: string) => {
    if (formData.type !== null && formData.type === 'NUMBER') {
      const updatedValues = {
        ...((formData.defaultValue?.value as NumericValue) || {}),
        [key]: value !== '' ? Number(value) : '',
      };

      const newFormData = {
        ...formData,
        defaultValue: {
          ...formData.defaultValue,
          value: updatedValues,
        },
      };

      setFormData(newFormData);

      const errors = validateRangeOrGranularity(
        newFormData?.defaultValue?.value as NumericValue,
        t
      );

      setError((prevError) => ({
        ...prevError,
        defaultValue: errors,
      }));
      return;
    }
    if (formData.type !== null && formData.type === 'CATEGORICAL') {
      if (key === 'delete') {
        setFormData((prevFormData) => {
          const updatedValues = Array.isArray(prevFormData.defaultValue?.value)
            ? prevFormData.defaultValue.value.filter(
                (item: string) => item.toLowerCase() !== value.toLowerCase()
              )
            : [];

          const newFormData = {
            ...prevFormData,
            defaultValue:
              updatedValues.length > 0
                ? {
                    ...prevFormData.defaultValue,
                    value: updatedValues,
                  }
                : null,
          };

          const errors = validateCategoricalValue(
            newFormData.defaultValue?.value as CategoricalValue,
            t
          );

          setError((prevError) => ({
            ...prevError,
            defaultValue: errors,
          }));

          return newFormData;
        });
      } else {
        setFormData((prevFormData) => {
          let newFormData: FormData;
          const currentValues = Array.isArray(prevFormData.defaultValue?.value)
            ? prevFormData.defaultValue.value
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
              defaultValue: {
                ...prevFormData.defaultValue,
                value: newValues,
              },
            };
          } else {
            newFormData = prevFormData;
          }

          const errors = validateCategoricalValue(
            newFormData.defaultValue?.value as CategoricalValue,
            t
          );

          setError((prevError) => ({
            ...prevError,
            defaultValue: errors,
          }));

          return newFormData;
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      try {
        await createVariable(formData);
        alert(t('attributeView.formOkText'));
        setFormData({
          name: null,
          type: null,
          defaultValue: {
            value: {
              min: 0,
              max: 0,
              optimal_min: 0,
              optimal_max: 0,
              granularity: 0,
            },
          },
          type_of_object_ids: null,
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
        if (
          formData.name ||
          formData.type ||
          formData.defaultValue ||
          formData.type_of_object_ids
        ) {
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
    <View style={styles.titleContainer}>
      {variablesLoading && (
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
          source={require('../../../../../assets/images/objects-bg-image.png')}
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
              <Text style={styles.welcome}>
                {t('attributeView.createAttributeTextTitle')}
              </Text>
            </View>
          </View>

          {/* contenedor contenido variable */}
        </ImageBackground>

        <View
          style={{
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
            zIndex: 200,
            top: rMS(-50),
            borderTopLeftRadius: 54,
            borderTopRightRadius: 54,
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
            {formData.type !== null
              ? `${t('attributeView.createAttributeText')} ${t(
                  `attributeView.${formData.type}`
                )}`
              : t('attributeView.createAttributeText')}
          </Text>
          {/* contenido scroll  */}
          <View style={styles.spacer}>
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
              <View style={[styles.spacer, { marginBottom: 20 }]}>
                <TextInput
                  mode="outlined"
                  placeholderTextColor="#292929"
                  placeholder={t('attributeView.createPlaceHolderName')}
                  // value={formData.name ?? ''}
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
                <DropDownPicker
                  placeholder={t('attributeView.createPlaceHolderTypeOfObject')}
                  placeholderStyle={{
                    fontSize: width * 0.04,
                    fontFamily: 'Pro-Regular',
                    color: '#292929',
                    paddingLeft: rMS(4),
                  }}
                  style={[styles.input, { marginBottom: 12 }]}
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
                  value={itemsValue as ValueType}
                  items={items ?? []}
                  setOpen={setOpen}
                  setValue={setItemsValue}
                  setItems={setItems as Dispatch<SetStateAction<any[]>>}
                  onChangeValue={() =>
                    onChange(
                      'type_of_object_ids',
                      (itemsValue ?? []).length > 0 ? itemsValue : null
                    )
                  }
                  multiple={true}
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
                {error?.type_of_object_ids && (
                  <Text style={styles.errorText}>
                    {error?.type_of_object_ids}
                  </Text>
                )}
                <View
                  style={[
                    styles.input,
                    { height: rMV(70), paddingHorizontal: rMS(14) },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: width * 0.04,
                      marginBottom: 10,
                      fontFamily: 'Pro-Regular',
                      color: '#292929',
                    }}
                  >
                    {t('attributeView.createPlaceHolderVariableType')}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        onChange('type', 'NUMBER');
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
                        {formData.type === 'NUMBER' && (
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
                        {t(`attributeView.mayusType.NUMBER`)}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        onChange('type', 'CATEGORICAL');
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
                        {formData.type === 'CATEGORICAL' && (
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
                        {t(`attributeView.mayusType.CATEGORICAL`)}
                      </Text>
                    </Pressable>
                  </View>
                </View>
                {formData.type !== null && formData.type === 'NUMBER' ? (
                  <>
                    <View style={[styles.input, styles.inputContainerNumber]}>
                      <Text style={styles.textDefaultValues}>
                        {t('attributeView.createPlaceHolderDefaultValues')}
                      </Text>
                      <View style={styles.row}>
                        <TextInput
                          mode="outlined"
                          placeholderTextColor="#486732"
                          placeholder={t(
                            'attributeView.createPlaceHolderMinValue'
                          )}
                          activeOutlineColor="#486732"
                          outlineColor="#486732"
                          cursorColor="#486732"
                          keyboardType="numeric"
                          value={
                            (formData.type === 'NUMBER'
                              ? (
                                  formData.defaultValue?.value as NumericValue
                                )?.min.toString()
                              : '') ?? ''
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
                          placeholder={t(
                            'attributeView.createPlaceHolderMaxValue'
                          )}
                          activeOutlineColor="#486732"
                          outlineColor="#486732"
                          cursorColor="#486732"
                          keyboardType="numeric"
                          onChangeText={(value) =>
                            onChangeDefaultValue(value, 'max')
                          }
                          selectionColor={
                            Platform.OS == 'ios' ? '#486732' : '#486732'
                          }
                          style={[styles.input, styles.textInput]}
                        />
                      </View>
                      {error?.defaultValue?.minMax && (
                        <Text style={styles.errorText}>
                          {error?.defaultValue?.minMax}
                        </Text>
                      )}
                      <Text style={styles.textOptimalValues}>
                        {t('attributeView.createPlaceHolderOptimalValues')}
                      </Text>
                      <View style={styles.row}>
                        <TextInput
                          mode="outlined"
                          placeholderTextColor="#486732"
                          placeholder={t(
                            'attributeView.createPlaceHolderMinValue'
                          )}
                          activeOutlineColor="#486732"
                          outlineColor="#486732"
                          cursorColor="#486732"
                          keyboardType="numeric"
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
                          placeholder={t(
                            'attributeView.createPlaceHolderMaxValue'
                          )}
                          activeOutlineColor="#486732"
                          outlineColor="#486732"
                          cursorColor="#486732"
                          keyboardType="numeric"
                          onChangeText={(value) =>
                            onChangeDefaultValue(value, 'optimal_max')
                          }
                          selectionColor={
                            Platform.OS == 'ios' ? '#486732' : '#486732'
                          }
                          style={[styles.input, styles.textInput]}
                        />
                      </View>
                      {error?.defaultValue?.optimalMinMax && (
                        <Text style={styles.errorText}>
                          {error?.defaultValue?.optimalMinMax}
                        </Text>
                      )}
                      <Text style={styles.textGranularity}>
                        {t('attributeView.createTextGranularity')}
                      </Text>
                      <View style={styles.row}>
                        <TextInput
                          mode="outlined"
                          placeholderTextColor="#486732"
                          placeholder={t(
                            'attributeView.createPlaceHolderGranularity'
                          )}
                          activeOutlineColor="#486732"
                          outlineColor="#486732"
                          cursorColor="#486732"
                          keyboardType="numeric"
                          onChangeText={(value) =>
                            onChangeDefaultValue(value, 'granularity')
                          }
                          selectionColor={
                            Platform.OS == 'ios' ? '#486732' : '#486732'
                          }
                          style={[styles.input, styles.textInput]}
                        />
                      </View>
                      {error?.defaultValue?.granularity && (
                        <Text style={styles.errorText}>
                          {error?.defaultValue?.granularity}
                        </Text>
                      )}
                    </View>
                  </>
                ) : formData.type !== null &&
                  formData.type === 'CATEGORICAL' ? (
                  <>
                    <View
                      style={[styles.input, styles.inputContainerCategorical]}
                    >
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
                          autoCapitalize="sentences"
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
                      {error?.defaultValue?.categoricalEmpty && (
                        <Text style={styles.errorText}>
                          {error?.defaultValue?.categoricalEmpty}
                        </Text>
                      )}
                    </View>

                    {formData.defaultValue?.value &&
                      Array.isArray(formData.defaultValue.value) &&
                      formData.defaultValue?.value.length > 0 && (
                        <View
                          style={[styles.input, styles.definedValuesContainer]}
                        >
                          <Text style={styles.definedValuesText}>
                            {t('attributeView.createTextDefinedValues')}
                          </Text>
                          <View style={styles.definedValuesRow}>
                            {formData.defaultValue.value.length > 0 &&
                              formData.defaultValue.value.map((item, index) => (
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
                                    <View
                                      style={styles.definedValueSeparator}
                                    />
                                    <Text style={styles.definedValueDeleteText}>
                                      x
                                    </Text>
                                  </View>
                                </Pressable>
                              ))}
                          </View>
                          {error?.defaultValue?.categorical && (
                            <Text style={styles.errorText}>
                              {error?.defaultValue?.categorical}
                            </Text>
                          )}
                        </View>
                      )}
                  </>
                ) : null}
              </View>
            </KeyboardAwareScrollView>
          </View>
          {/* Botón fijo */}
          <View style={styles.fixedButtonContainer}>
            <Pressable onPress={handleSubmit} style={styles.button}>
              <Text style={styles.buttonText}>
                {t('attributeView.createVariableTextButton')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CreateAttribute;
