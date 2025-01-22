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
import usePenStore from '@/store/penStore';
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
  type_of_object_ids: number[] | null;
};

type FormDataError = {
  name: string | null;
  type_of_object_ids: string | null;
};

const EditPen: React.FC = () => {
  const { penId, penName, type_of_objects, fieldId } = useLocalSearchParams();

  const { validateTypeObjectValue, validateNameInput } = useValidationRules();
  const [error, setError] = useState<FormDataError>({
    name: null,
    type_of_object_ids: null,
  });
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

  const router = useRouter();
  const { typeOfObjects } = useTypeOfObjectStore((state: any) => ({
    typeOfObjects: state.typeOfObjects,
  }));
  const { onUpdate, pensLoading } = usePenStore((state: any) => ({
    onUpdate: state.onUpdate,
    pensLoading: state.pensLoading,
  }));
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [itemsValue, setItemsValue] = useState<string | undefined | string[]>(
    JSON.parse(
      Array.isArray(type_of_objects) ? type_of_objects[0] : type_of_objects
    ).map((item: { id: number; name: string }) => item.id)
  );
  const [items, setItems] = useState<Item[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: penName as string,
    type_of_object_ids: null,
  });

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
        await onUpdate(penId, formData, fieldId);
        setMessageModalText(t('penView.formUpdateOkText'));
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
        setMessageModalText(t('penview.editAttributeError'));
        setSuccess(false);
        setShowMessageModal(true);
        setTimeout(() => {
          setShowMessageModal(false);
        }, 2000);
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
          setShowModal(true);
          setTexts({
            title: t('attributeView.unsavedChangesTitle'),
            subtitle: t('attributeView.unsavedChangesMessage'),
          });
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
      <View style={{ flex: 1, width: '100%', height: 900 }}>
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
                {t('penView.editPenTextButton')}
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
              { height: open ? rMS(360) : null },
            ]}
          >
            <View style={{ marginBottom: 20 }}>
              <TextInput
                mode="outlined"
                placeholderTextColor="#292929"
                placeholder={t('penView.penNamePlaceHolder')}
                value={formData.name ?? ''}
                onChangeText={(value) => onChange('name', value)}
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
                <Text style={styles.errorText}>
                  {error?.type_of_object_ids}
                </Text>
              )}
            </View>
          </KeyboardAwareScrollView>
        </View>
        {/* Botón fijo */}
        <View style={styles.fixedButtonContainer}>
          <Pressable onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>
              {t('penView.updatePenTextButton')}
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

export default EditPen;
