import useTypeOfObjectStore from '@/store/typeOfObjectStore';
import { rMS, rMV, rV } from '@/styles/responsive';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import styles from './styles';
import {
  Platform,
  Pressable,
  Text,
  View,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Alert,
  BackHandler,
} from 'react-native';
import DropDownPicker, { ValueType } from 'react-native-dropdown-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ActivityIndicator, IconButton, TextInput } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useValidationRules } from '@/utils/validation/validationRules';
import useVariableStore from '@/store/variableStore';
import MessageModal from '@/components/modal/MessageModal';
import TwoButtonsModal from '@/components/modal/TwoButtonsModal';
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

const EditAttribute: React.FC = () => {
  const { attributeId }: { attributeId: string } = useLocalSearchParams();
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

  // Start modal message

  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(true);
  const [messageModalText, setMessageModalText] = useState<string | null>(null);

  // End modal message

  // Start TwoButtonsModal

  const [texts, setTexts] = useState<{
    title: string;
    subtitle: string;
  } | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // End TwoButtonsModal

  const { typeOfObjects } = useTypeOfObjectStore((state: any) => ({
    typeOfObjects: state.typeOfObjects,
  }));
  const {
    variablesLoading,
    resetDetail,
    getVariableById,
    variableById,
    onUpdate,
  } = useVariableStore((state: any) => ({
    variablesLoading: state.variablesLoading,
    resetDetail: state.resetDetail,
    getVariableById: state.getVariableById,
    variableById: state.variableById,
    onUpdate: state.onUpdate,
  }));
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [itemsValue, setItemsValue] = useState<number[] | undefined>(undefined);
  const [categoricalValue, setCategoricalValue] = useState<string | null>();
  const [items, setItems] = useState<Item[]>([]);
  const options = [0.1, 0.25, 0.5, 1];
  const [formData, setFormData] = useState<FormData>({
    name: variableById?.name ?? null,
    type: variableById?.type ?? null,
    defaultValue: variableById?.defaultValue ?? null,
    type_of_object_ids: variableById?.type_of_object_ids ?? null,
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
    getVariableById(attributeId);
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

    return () => resetDetail();
  }, [attributeId]);

  useEffect(() => {
    if (variableById) {
      setFormData({
        name: variableById.name ?? null,
        type: variableById.type ?? null,
        defaultValue: variableById.defaultValue ?? null,
        type_of_object_ids: variableById.type_of_object_ids ?? null,
      });
      setItemsValue(
        variableById?.type_of_objects?.map(
          (item: { id: number; name: string }) => item.id
        )
      );
    }
  }, [variableById]);

  const onChange = (field: keyof FormData, inputValue: any) => {
    const updatedFormData = { ...formData, [field]: inputValue };
    switch (field) {
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
        await onUpdate(attributeId, formData);
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
        setMessageModalText(t('attributeView.formUpdateOkText'));
        setSuccess(true);
        setShowMessageModal(true);
        if (Platform.OS === 'ios') {
          setTimeout(() => {
            setShowMessageModal(false);
            setTimeout(() => {
              router.back();
            }, 480);
          }, 2000);
        } else {
          setTimeout(() => {
            setShowMessageModal(false);
            router.back();
          }, 2000);
        }
      } catch (error) {
        setMessageModalText(t('attributeView.editAttributeError'));
        setSuccess(false);
        setShowMessageModal(true);
        setTimeout(() => {
          setShowMessageModal(false);
        }, 2000);
      }
    } else {
      setMessageModalText(t('attributeView.editAttributeError'));
      setSuccess(false);
      setShowMessageModal(true);
      setTimeout(() => {
        setShowMessageModal(false);
      }, 2000);
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
          setShowModal(true);
          setTexts({
            title: t('attributeView.unsavedChangesTitle'),
            subtitle: t('attributeView.unsavedChangesMessage'),
          });
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        backHandler.remove(); // Cleanup the event listener on unmount
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
      <ImageBackground
        source={require('../../../../../../assets/images/objects-bg-image.png')}
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
              onPress={() => {
                setShowModal(true);
                setTexts({
                  title: t('attributeView.unsavedChangesTitle'),
                  subtitle: t('attributeView.unsavedChangesMessage'),
                });
              }}
            />
            <Text style={styles.greeting}>{t('detailField.goBackText')}</Text>
          </View>
          <View>
            <Text style={styles.welcome}>
              {t('attributeView.editAttributeTextTitle')}
            </Text>
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
          {formData?.type !== null
            ? `${t('attributeView.createAttributeText')} ${t(
                `attributeView.${formData?.type}`
              )}`
            : t('attributeView.createAttributeText')}
        </Text>
        {/* contenido scroll  */}
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
              value={formData.name ?? ''}
              onChangeText={(value) => onChange('name', value)}
              autoCapitalize="sentences"
              activeOutlineColor="transparent"
              outlineColor="#F1F1F1"
              cursorColor="#486732"
              selectionColor={Platform.OS == 'ios' ? '#486732' : '#486732'}
              style={styles.input}
            />
            {error?.name && <Text style={styles.errorText}>{error?.name}</Text>}
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
              <Text style={styles.errorText}>{error?.type_of_object_ids}</Text>
            )}
            {/* diferenciacion de formularios */}
            {formData?.type !== null && formData?.type === 'NUMBER' ? (
              <>
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
                          formData?.defaultValue?.value as NumericValue
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
                          formData?.defaultValue?.value as NumericValue
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
                      placeholder={t('attributeView.createPlaceHolderMinValue')}
                      activeOutlineColor="#486732"
                      outlineColor="#486732"
                      cursorColor="#486732"
                      keyboardType="numeric"
                      value={
                        (
                          formData?.defaultValue?.value as NumericValue
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
                          formData?.defaultValue?.value as NumericValue
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
                  {error?.defaultValue?.optimalMinMax && (
                    <Text style={styles.errorText}>
                      {error?.defaultValue?.optimalMinMax}
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
                          {formData.defaultValue?.value['granularity'] ===
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
                  {/* <View style={styles.row}>
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
                          value={
                            (
                              formData?.defaultValue?.value as NumericValue
                            )?.granularity?.toString() ?? ''
                          }
                          onChangeText={(value) =>
                            onChangeDefaultValue(value, 'granularity')
                          }
                          selectionColor={
                            Platform.OS == 'ios' ? '#486732' : '#486732'
                          }
                          style={[styles.input, styles.textInput]}
                        />
                      </View> */}
                  {error?.defaultValue?.granularity && (
                    <Text style={styles.errorText}>
                      {error?.defaultValue?.granularity}
                    </Text>
                  )}
                </View>
              </>
            ) : formData?.type !== null && formData?.type === 'CATEGORICAL' ? (
              <>
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
                  {error?.defaultValue?.categoricalEmpty && (
                    <Text style={styles.errorText}>
                      {error?.defaultValue?.categoricalEmpty}
                    </Text>
                  )}
                </View>

                {formData.defaultValue?.value &&
                  Array.isArray(formData.defaultValue.value) &&
                  formData.defaultValue?.value.length > 0 && (
                    <View style={[styles.input, styles.definedValuesContainer]}>
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
                                <View style={styles.definedValueSeparator} />
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
        {/* Botón fijo */}
        <View style={styles.fixedButtonContainer}>
          <Pressable onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>
              {t('attributeView.updateVariableTextButton')}
            </Text>
          </Pressable>
        </View>
      </View>
      {/* START MODALS */}
      <TwoButtonsModal
        isVisible={showModal}
        onDismiss={() => setShowModal(false)}
        title={texts?.title as string}
        subtitle={texts?.subtitle as string}
        onPress={() => {
          if (Platform.OS === 'ios') {
            setShowModal(false);
            setTimeout(() => {
              router.back();
            }, 480);
          } else {
            router.back();
          }
        }}
        vertical={true}
        textOkButton={t('attributeView.leaveButtonText')}
        textCancelButton={t('attributeView.cancelButtonText')}
      />
      <MessageModal
        isVisible={showMessageModal}
        message={messageModalText}
        success={success}
      />
      {/* END MODALS */}
    </View>
  );
};

export default EditAttribute;
