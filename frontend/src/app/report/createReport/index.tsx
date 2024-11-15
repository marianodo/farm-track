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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ActivityIndicator, IconButton, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useValidationRules } from '@/utils/validation/validationRules';
import useVariableStore from '@/store/variableStore';
import usePenStore from '@/store/penStore';
import { ViewStyle } from 'react-native-size-matters';
import useReportStore from '@/store/reportStore';
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
  comment: string | null;
  field_id: string;
};

type FormDataError = {
  name: string | null;
};

const CreateReport: React.FC = () => {
  const { fieldId, fieldName } = useLocalSearchParams();
  const { validateNameInput } = useValidationRules();
  const [error, setError] = useState<FormDataError>({
    name: null,
  });
  const [editObjects, setEditObjects] = useState<boolean>(false);
  const router = useRouter();
  const { typeOfObjects } = useTypeOfObjectStore((state: any) => ({
    typeOfObjects: state.typeOfObjects,
  }));
  const { resetCreateReportId, createReport, reportsLoading, createReportId } =
    useReportStore((state: any) => ({
      reportsLoading: state.reportsLoading,
      createReport: state.createReport,
      resetDetail: state.resetDetail,
      resetCreateReportId: state.resetCreateReportId,
      createReportId: state.createReportId,
    }));

  const { pens, pensLoading } = usePenStore((state: any) => ({
    pens: state.pens,
    pensLoading: state.pensLoading,
  }));

  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [itemsValue, setItemsValue] = useState<string | undefined | string[]>();
  const [items, setItems] = useState<Item[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: null,
    comment: null,
    field_id: fieldId as string,
  });

  const validateForm = () => {
    const newError: FormDataError = {
      name: validateNameInput(formData.name ?? '', t),
    };

    setError(newError);
    return newError.name;
  };

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

  const handleSubmit = async () => {
    try {
      await createReport(formData);
      router.push({
        pathname: `/measurement`,
        params: {
          fieldName: fieldName,
          fieldId: fieldId,
        },
      });
    } catch (error) {
      console.log(error);
      alert(t('attributeView.formErrorText'));
    }
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
              <Text style={styles.welcome}>
                {t('reportsView.newReportText')}
              </Text>
            </View>
          </View>
        </ImageBackground>

        <View
          style={{
            backgroundColor: 'white',
            width: '100%',
            flex: 1,
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
            {t('reportsView.detailReportText')}
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
                {t('reportsView.createReportInfoText')}
              </Text>
            </View>
          </View>
          {/* contenido scroll  */}
          <View style={styles.spacer}>
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
                  placeholder={`${t(
                    'reportsView.reportFieldNamePlaceHolder'
                  )}: ${fieldName as string}`}
                  editable={false}
                  activeOutlineColor="transparent"
                  outlineColor="#F1F1F1"
                  style={styles.input}
                />

                <TextInput
                  mode="outlined"
                  placeholderTextColor="#486732"
                  placeholder={`${t(
                    'reportsView.reportDatePlaceHolder'
                  )}: ${new Date().toLocaleDateString('es-Es')}`}
                  editable={false}
                  activeOutlineColor="transparent"
                  outlineColor="#F1F1F1"
                  style={styles.input}
                />

                <TextInput
                  mode="outlined"
                  placeholderTextColor="#292929"
                  placeholder={t('reportsView.reportNamePlaceHolder')}
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

                <TextInput
                  mode="outlined"
                  placeholderTextColor="#292929"
                  placeholder={t('reportsView.reportObservationsPlaceHolder')}
                  onChangeText={(value) => onChange('comment', value)}
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
              </View>
            </KeyboardAwareScrollView>
          </View>
          {/* este view es para poner el boton debajo de todo */}

          <View
            style={{ flex: Dimensions.get('window').height > 640 ? 1 : 0.5 }}
          />
          {/* Botón fijo */}
          <View style={styles.fixedButtonContainer}>
            <Pressable onPress={handleSubmit} style={styles.button}>
              <Text style={styles.buttonText}>
                {t('reportsView.createReportTextButton')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CreateReport;
