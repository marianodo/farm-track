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
import { useFocusEffect } from 'expo-router';
import { useValidationRules } from '@/utils/validation/validationRules';
import useVariableStore from '@/store/variableStore';
import usePenStore from '@/store/penStore';
import { ViewStyle } from 'react-native-size-matters';
import MessageModal from '@/components/modal/MessageModal';
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
  type_of_object_ids: number[] | null;
};

type FormDataError = {
  name: string | null;
  type_of_object_ids: string | null;
};

const CreatePen: React.FC = () => {
  const { fieldId } = useLocalSearchParams();
  const {
    validateRangeOrGranularity,
    validateCategoricalValue,
    validateTypeObjectValue,
    validateNameInput,
  } = useValidationRules();
  const [error, setError] = useState<FormDataError>({
    name: null,
    type_of_object_ids: null,
  });
  // Start modal message

  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(true);
  const [messageModalText, setMessageModalText] = useState<string | null>(null);

  // End modal message
  const [editObjects, setEditObjects] = useState<boolean>(false);
  const router = useRouter();
  const { typeOfObjects } = useTypeOfObjectStore((state: any) => ({
    typeOfObjects: state.typeOfObjects,
  }));
  const { pensLoading, createPen, pens } = usePenStore((state: any) => ({
    pensLoading: state.pensLoading,
    createPen: state.createPen,
    pens: state.pens,
  }));
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [itemsValue, setItemsValue] = useState<string | undefined | string[]>();
  const [items, setItems] = useState<Item[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: null,
    type_of_object_ids: null,
  });
  const [inputValue, setInputValue] = useState<string>('');

  const validateForm = () => {
    const newError: FormDataError = {
      name: validateNameInput(formData.name ?? '', t),
      type_of_object_ids: validateTypeObjectValue(
        formData.type_of_object_ids,
        t
      ),
    };

    setError(newError);
    return newError.name || newError.type_of_object_ids;
  };

  const clearForm = () => {
    setFormData({
      name: null,
      type_of_object_ids: null,
    });
    setInputValue('');
    setItemsValue(undefined);
    setError({
      name: null,
      type_of_object_ids: null,
    });
  };

  // Obtener los pens del campo actual ordenados por ID
  const getCurrentFieldPens = () => {
    if (!pens || !fieldId) return [];
    const fieldPens = pens[fieldId as string] || [];
    return fieldPens.sort((a: any, b: any) => a.id - b.id);
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

  // Cargar pens del campo al montar el componente
  useEffect(() => {
    if (fieldId) {
      const { getAllPens } = usePenStore.getState();
      getAllPens(fieldId as string, false, false, false);
    }
  }, [fieldId]);

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

  const handleSubmit = async () => {
    if (!validateForm()) {
      try {
        await createPen({ ...formData, fieldId: fieldId as string });
        
        // Limpiar el formulario completamente
        clearForm();
        
        // Mostrar mensaje de éxito
        setMessageModalText(t('penView.formOkText'));
        setSuccess(true);
        setShowMessageModal(true);
        
        // Ocultar mensaje después de 2 segundos (sin navegar)
          setTimeout(() => {
            setShowMessageModal(false);
          }, 2000);
        
      } catch (error) {
        setMessageModalText(t('penView.penCreatedError'));
        setSuccess(false);
        setShowMessageModal(true);
        setTimeout(() => {
          setShowMessageModal(false);
        }, 2000);
      }
    } else {
      alert(t('penView.penCreatedError'));
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (formData.name || formData.type_of_object_ids) {
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

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        backHandler.remove();
    }, [formData])
  );

  return (
    <View
      style={[
        styles.titleContainer,
        { maxHeight: Dimensions.get('window').height },
      ]}
    >
      {pensLoading && (
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
            <Text style={styles.welcome}>
              {t('penView.createPenTextTitle')}
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
          {t('penView.createPenTextDetail')}
        </Text>
        {/* contenido scroll  */}
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraHeight={10}
          extraScrollHeight={30}
          contentContainerStyle={[
            styles.scrollContent,
            { 
              height: open ? rMS(360) : null,
              paddingBottom: 100 // Espacio para el botón fijo
            },
          ]}
        >
          <View style={{ width: '100%', marginBottom: 20 }}>
            <TextInput
              mode="outlined"
              placeholderTextColor="#292929"
              placeholder={t('penView.penNamePlaceHolder')}
              value={inputValue}
              onChangeText={(value) => {
                setInputValue(value);
                onChange('name', value);
              }}
              autoCapitalize="sentences"
              activeOutlineColor="transparent"
              outlineColor="#F1F1F1"
              cursorColor="#486732"
              selectionColor={Platform.OS == 'ios' ? '#486732' : '#486732'}
              style={styles.input}
            />
            {error?.name && <Text style={styles.errorText}>{error?.name}</Text>}
            <DropDownPicker
              placeholder={t('penView.penObjectsPlaceHolder')}
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
          </View>

          {/* Listado de corrales creados */}
          {getCurrentFieldPens().length > 0 && (
            <View style={{ marginTop: 20, marginBottom: 10 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'Pro-Regular',
                color: '#292929',
                marginBottom: 10,
                textAlign: 'center'
              }}>
                {t('penView.existingPensTitle')}
              </Text>
              
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                gap: 6
              }}>
                {getCurrentFieldPens().map((pen: any, index: number) => (
                  <View key={pen.id} style={{
                    backgroundColor: '#E8F5E8',
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: '#486732'
                  }}>
                    <Text style={{
                      fontSize: 11,
                      fontWeight: '500',
                      fontFamily: 'Pro-Regular',
                      color: '#486732'
                    }}>
                      {pen.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </KeyboardAwareScrollView>
        <View style={styles.fixedButtonContainer}>
          <Pressable onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>
              {t('penView.createPenTextButton')}
            </Text>
          </Pressable>
        </View>
      </View>
      <MessageModal
        isVisible={showMessageModal}
        message={messageModalText}
        success={success}
      />
    </View>
  );
};

export default CreatePen;
