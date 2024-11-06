import useTypeOfObjectStore from '@/store/typeOfObjectStore';
import { rMS, rMV, rS, rV } from '@/styles/responsive';
import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
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
  FlatList,
  Keyboard,
  Image,
} from 'react-native';
import DropDownPicker, { ValueType } from 'react-native-dropdown-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  ActivityIndicator,
  Badge,
  Divider,
  IconButton,
  TextInput,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useValidationRules } from '@/utils/validation/validationRules';
import useVariableStore from '@/store/variableStore';
import { Swipeable } from 'react-native-gesture-handler';
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

const EditTypeObject: React.FC = () => {
  const [previousPenId, setPreviousPenId] = useState(null);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const { type_of_object_name, type_of_object_id, penId, penName } =
    useLocalSearchParams();
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

  const [editObjects, setEditObjects] = useState<boolean>(false);
  const router = useRouter();
  const { typeOfObjects } = useTypeOfObjectStore((state: any) => ({
    typeOfObjects: state.typeOfObjects,
  }));
  const { createVariable, variablesLoading } = useVariableStore(
    (state: any) => ({
      createVariable: state.createVariable,
      variablesLoading: state.variablesLoading,
      resetDetail: state.resetDetail,
    })
  );
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [itemsValue, setItemsValue] = useState<string | undefined | string[]>();
  const [categoricalValue, setCategoricalValue] = useState<string[] | null>(
    null
  );
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

  const {
    resetDetail,
    penVariableTypeOfObjectByTypeIdAndPen,
    penVariableTypeOfObjectsLoading,
    getPenVariableTypeOfObjectsByObjectIdAndPen,
  } = usePenVariableTypeOfObjectStore((state: any) => ({
    resetDetail: state.resetDetail,
    penVariableTypeOfObjectByTypeIdAndPen:
      state.penVariableTypeOfObjectByTypeIdAndPen,
    penVariableTypeOfObjectsLoading: state.penVariableTypeOfObjectsLoading,
    getPenVariableTypeOfObjectsByObjectIdAndPen:
      state.getPenVariableTypeOfObjectsByObjectIdAndPen,
  }));

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
    return () => {
      resetDetail();
    };
  }, []);

  useEffect(() => {
    getPenVariableTypeOfObjectsByObjectIdAndPen(type_of_object_id, penId);
    return () => {
      resetDetail();
    };
  }, [penId]);

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

  const toggleExpand = (
    index: number,
    setExpandedItems: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const renderRightActions = (progress: any, dragX: any, pen: any) => (
    <View style={styles.rightActions}>
      <Pressable
        style={styles.editButton}
        onPress={() =>
          router.push({
            pathname: `/pen/editVariable`,
            params: {
              penId: pen.penId,
              variableName: pen.variable.name,
              typeOfObjectsId: pen.typeOfObjectId,
              variableId: pen.variableId,
              type: pen.variable.type,
              custom_parameters: JSON.stringify(pen.custom_parameters),
              penName: penName,
            },
          })
        }
      >
        <IconButton icon="pencil-outline" iconColor="#fff" size={rMS(24)} />
        <Text style={styles.actionText}>{t(`fieldView.editButton`)}</Text>
      </Pressable>
    </View>
  );

  const ListItem = ({
    item,
    index,
    isExpanded,
    toggleExpand,
    setExpandedItems,
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const animatedHeight = isExpanded
        ? withTiming('auto', {
            duration: 3000,
            easing: Easing.out(Easing.linear),
          })
        : withTiming(0, {
            duration: 3000,
            easing: Easing.out(Easing.linear),
          });
      return {
        marginTop: -20,
        height: animatedHeight,
        backgroundColor: '#f0f0f0',
      };
    }, [isExpanded]);

    return (
      <Swipeable
        key={index}
        enabled={!isExpanded} // Elimina el swipe si está expandido
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item)
        }
        containerStyle={{
          backgroundColor: '#3A5228',
          marginBottom: 10,
          borderRadius: 10,
        }}
      >
        <TouchableWithoutFeedback
          key={index}
          onPress={() => {
            Keyboard.dismiss();
            toggleExpand(index, setExpandedItems);
          }}
        >
          <View style={styles.attributeContainer}>
            <Text
              style={{
                paddingBottom: rMS(8),
                fontSize: rMS(17),
                paddingLeft: 6,
                fontWeight: 'bold',
                fontFamily: 'Pro-Regular',
              }}
            >
              {item?.variable?.name}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        {/* Mostrar información cuando se expande */}

        <Animated.View style={[animatedStyle, { overflow: 'hidden' }]}>
          <Divider
            style={{
              backgroundColor: '#486732',
              height: 1,
            }}
          />
          {item?.variable?.type === 'NUMBER' ? (
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                // flexWrap: 'wrap',
                paddingHorizontal: rMS(10),
                paddingVertical: rMS(8),
                gap: rMS(12),
                width: '100%',
              }}
            >
              <Text style={{ color: '#486732' }}>
                {`${t('editTypeObject.numberTextDefault')}:   `}
                <Text style={{ color: '#292929' }}>
                  {`${item.custom_parameters.value.min} - ${item.custom_parameters.value.max}`}
                </Text>
              </Text>
              <Text style={{ color: '#486732' }}>
                {`${t('editTypeObject.numberTextOptimum')}:   `}
                <Text style={{ color: '#292929' }}>
                  {`${item.custom_parameters.value.optimal_min} - ${item.custom_parameters.value.optimal_max}`}
                </Text>
              </Text>
              <Text style={{ color: '#486732' }}>
                {`${t('editTypeObject.granularityText')}:   `}
                <Text style={{ color: '#292929' }}>
                  {`${item.custom_parameters.value.granularity}`}
                </Text>
              </Text>
            </View>
          ) : (
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                // flexWrap: 'wrap',
                paddingHorizontal: rMS(10),
                paddingVertical: rMS(8),
                gap: rMS(12),
                width: '100%',
              }}
            >
              <Text style={{ color: '#486732', paddingVertical: rMS(8) }}>
                {`${t('editTypeObject.categoricalText')}:   `}
                {Array.isArray(item.custom_parameters.value) ? (
                  item.custom_parameters.value.map((val, idx) => (
                    <Text key={idx} style={{ color: '#292929' }}>
                      {val}
                      {idx < item.custom_parameters.value.length - 1 && ', '}
                    </Text>
                  ))
                ) : (
                  <Text style={{ color: '#292929' }}>Invalid data</Text>
                )}
              </Text>
            </View>
          )}
        </Animated.View>
      </Swipeable>
    );
  };

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
            // backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
              <Text style={styles.welcome}>{t('editTypeObject.title')}</Text>
            </View>
          </View>

          {/* contenedor contenido variable */}
        </ImageBackground>

        <View
          style={{
            backgroundColor: 'white',
            width: '100%',
            // height: Dimensions.get('window').height,
            // maxHeight: Dimensions.get('window').height + rMS(140),
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
            {`${t('editTypeObject.subtitle')} ${type_of_object_name}`}
          </Text>
          <View
            style={{
              flex: 1,
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
                // marginTop: rMV(20),
                display: 'flex',
                flexDirection: 'row',
                paddingHorizontal: rMS(12),
              }}
            >
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
                {t('editTypeObject.helpText1')}
              </Text>
            </View>
          </View>
          {/* contenido scroll  */}
          <View style={styles.spacer}>
            <FlatList
              style={{
                flexGrow: 1,
                paddingHorizontal: rMS(20),
                paddingTop: rMS(10),
              }}
              data={penVariableTypeOfObjectByTypeIdAndPen}
              keyExtractor={(item, index) => `${item.typeOfObjectId}${index}`}
              renderItem={({ item, index }) => {
                const isExpanded = expandedItems.includes(index);
                return (
                  <ListItem
                    item={item}
                    index={index}
                    isExpanded={isExpanded}
                    toggleExpand={toggleExpand}
                    setExpandedItems={setExpandedItems}
                  />
                );
              }}
            />
          </View>

          <View
            style={{
              flex: 1,
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
          {/* este view es para poner el boton debajo de todo */}
          {/* <View style={{ flex: 1 }} /> */}
          {/* Botón fijo */}
          <View style={styles.fixedButtonContainer}>
            <Pressable onPress={handleSubmit} style={styles.button}>
              <Text style={styles.buttonText}>
                {t('editTypeObject.finishEditTypeObjectText')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default EditTypeObject;
