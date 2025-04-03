import useTypeOfObjectStore from '@/store/typeOfObjectStore';
import { rMS, rMV, rV } from '@/styles/responsive';
import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useCallback,
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
import useReportStore from '@/store/reportStore';
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
  penId: string | null;
  typeOfObjectId: string | null;
  typeOfObjectName: string | null;
  variablesIds: string[] | null;
};

type FormDataError = {
  penId: number | null;
  typeOfObjectId: number | null;
  variablesIds: number[] | null;
};

const CreatePen: React.FC = () => {
  const { fieldId, fieldName, reportName, reportNameFind } = useLocalSearchParams();
  const { pens, pensLoading } = usePenStore((state: any) => ({
    pens: state.pens,
    pensLoading: state.pensLoading,
  }));
  // ----->  DROPDOWN UTILS START <------
  // Pen dropdown

  const [penDropDownValue, setPenDropDownValue] = useState(null);
  const [pensDropDown, setPensDropdown] = useState<Item[]>(
    pens[`${fieldId}`]?.map((pen: any) => ({
      label: pen.name,
      value: pen.id,
    })) ?? []
  );

  // Pen selected name
  const [penName, setPenName] = useState<string>('');

  // Type of object dropdown
  const [typeOfObjectDropDownValue, setTypeOfObjectDropDownValue] = useState<
    string | undefined | string[] | null
  >(null);
  const [typeOfObjectDropDown, setTypeOfObjectDropDown] = useState<Item[]>([]);

  // Variables dropdown
  const [variablesDropDownValue, setVariablesDropDownValue] = useState<
    string | undefined | string[] | null
  >(null);
  const [variablesDropDown, setVariablesDropDown] = useState<Item[]>([]);

  // Estado compartido para controlar cuál dropdown está abierto
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // ----->  DROPDOWN UTILS END <------
  const { validateNameInput } = useValidationRules();
  const [error, setError] = useState<FormDataError>({
    penId: null,
    typeOfObjectId: null,
    variablesIds: null,
  });

  const [editObjects, setEditObjects] = useState<boolean>(false);
  const router = useRouter();

  const { getTypeOfObjectById, typeOfObjectById } = useTypeOfObjectStore(
    (state: any) => ({
      getTypeOfObjectById: state.getTypeOfObjectById,
      typeOfObjectById: state.typeOfObjectById,
    })
  );

  const {
    getPenVariableTypeOfObjectsByObjectIdAndPen,
    penVariableTypeOfObjectByTypeIdAndPen,
    penVariableTypeOfObjectsLoading,
  } = usePenVariableTypeOfObjectStore((state: any) => ({
    getPenVariableTypeOfObjectsByObjectIdAndPen:
      state.getPenVariableTypeOfObjectsByObjectIdAndPen,
    penVariableTypeOfObjectByTypeIdAndPen:
      state.penVariableTypeOfObjectByTypeIdAndPen,
    penVariableTypeOfObjectsLoading: state.penVariableTypeOfObjectsLoading,
  }));

  const {
    createReportId,
    createReport,
    reportsLoading,
    resetCreateReportId,
    setMeasurementData,
    measurementVariablesData,
  } = useReportStore((state: any) => ({
    reportsLoading: state.reportsLoading,
    createReportId: state.createReportId,
    createReport: state.createReport,
    setMeasurementData: state.setMeasurementData,
    resetCreateReportId: state.resetCreateReportId,
    measurementVariablesData: state.measurementVariablesData,
  }));

  const { t } = useTranslation();
  const [open, setOpen] = useState({
    penId: false,
    typeOfObjectId: false,
    variablesIds: false,
  });

  const [formData, setFormData] = useState<FormData>({
    penId: null,
    typeOfObjectId: null,
    typeOfObjectName: null,
    variablesIds: null,
  });

  const validateFormData = (data: any) => {
    return !Object.values(data).some((value) => value === null);
  };

  // useEffect(() => {
  //   const pensData = pens[`${fieldId}`].map((pen: any) => ({
  //     label: pen.name,
  //     value: pen.id,
  //   }));

  //   setPensDropdown(pensData);
  // }, []);

  useEffect(() => {
    if (penVariableTypeOfObjectByTypeIdAndPen) {
      setVariablesDropDown(
        penVariableTypeOfObjectByTypeIdAndPen.map((element: any) => ({
          label: element.variable.name,
          value: element.id,
        }))
      );
    }
  }, [penVariableTypeOfObjectByTypeIdAndPen]);

  const onChange = (field: keyof FormData, inputValue: any) => {
    if (field === 'penId') {
      setTypeOfObjectDropDown([]);
      setTypeOfObjectDropDownValue(undefined);
      const penFound = pens[`${fieldId}`].find((p: any) => p.id == inputValue);
      if (penFound) {
        setPenName(penFound.name);
        setTypeOfObjectDropDown(
          penFound?.type_of_objects.map((type: any) => ({
            label: type.name,
            value: type.id,
          }))
        );
      }
      setFormData({ ...formData, [field]: inputValue });
    }

    if (field === 'typeOfObjectId') {
      setVariablesDropDown([]);
      setVariablesDropDownValue(undefined);
      if (inputValue) {
        const objectName = typeOfObjectDropDown.find(
          (e: any) => e.value == inputValue
        );

        getPenVariableTypeOfObjectsByObjectIdAndPen(inputValue, formData.penId);
        setFormData({
          ...formData,
          [field]: inputValue,
          typeOfObjectName: objectName?.label ?? null,
        });
      }
    }
    if (field === 'variablesIds') {
      if (inputValue) {
        const filters = penVariableTypeOfObjectByTypeIdAndPen.filter((e: any) =>
          inputValue.includes(e.id)
        );
        setFormData({
          ...formData,
          [field]: filters?.length
            ? filters.map((e: any) => ({
              pen_variable_type_of_object_id: e.id,
              custom_parameters: e.custom_parameters,
              variable: e.variable,
            }))
            : null,
        });
      }
    }
  };
  const handleSubmit = async () => {
    const isValid = validateFormData(formData);
    if (isValid) {
      try {
        setMeasurementData(formData.variablesIds);
        // await createReport({ ...formData, reportId: reportId as string });
        router.push({
          pathname: `/measurement/createMeasurement`,
          params: {
            penId: formData.penId,
            typeOfObjectId: formData.typeOfObjectId,
            typeOfObjectName: formData.typeOfObjectName,
            fieldId: fieldId,
            fieldName: fieldName,
            penName: penName,
            reportName: reportName,
            reportNameFind: reportNameFind
          },
        });
        setFormData({
          penId: null,
          typeOfObjectId: null,
          typeOfObjectName: null,
          variablesIds: null,
        });
        // setPenValue(undefined);
        // router.back();
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
      // Aca se puede ejecutar codigo cuando el componente obtiene el foco.
      return () => {
        // Cy aca se puede ejecutar codigo cuando el componente pierde el foco.
        setPenDropDownValue(null);
        setTypeOfObjectDropDownValue(null);
        setTypeOfObjectDropDown([]);
        setVariablesDropDownValue(null);
        setVariablesDropDown([]);
        setOpenDropdown(null);
      };
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (formData.penId) {
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
          source={require('../../../../../assets/images/penAndReport-bg-image.png')}
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
                {t('measurementView.newMeasurementText')}
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
            {t('measurementView.detailMeasurementText')}
          </Text>
          {/* contenido scroll  */}
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            enableOnAndroid
            extraHeight={10}
            extraScrollHeight={30}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingVertical: 10 },
            ]}
          // height: open ? rMS(360) : null,
          >
            <View style={{ marginBottom: 20 }}>
              <DropDownPicker
                placeholder={t('measurementView.penPlaceHolder')}
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
                zIndex={openDropdown === 'pen' ? 1 : 0}
                zIndexInverse={openDropdown === 'pen' ? 1 : 0}
                arrowIconStyle={{ tintColor: '#486732' }}
                closeAfterSelecting={true}
                ActivityIndicatorComponent={() => (
                  <ActivityIndicator size="large" color="#486732" />
                )}
                open={openDropdown === 'pen'}
                value={penDropDownValue}
                items={pensDropDown ?? []}
                setValue={setPenDropDownValue}
                setItems={setPensDropdown as Dispatch<SetStateAction<any[]>>}
                onChangeValue={() => onChange('penId', penDropDownValue)}
                scrollViewProps={{
                  style: {
                    height:
                      Dimensions.get('window').height > 640 ? 'auto' : rMS(156),
                  },
                }}
                multiple={false}
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
                onOpen={() => setOpenDropdown('pen')}
                onClose={() => setOpenDropdown(null)}
                ListEmptyComponent={() => (
                  <Text style={{ textAlign: 'center', padding: 10 }}>
                    {t('measurementView.dropDownDontInfo')}
                  </Text>
                )}
              />

              <DropDownPicker
                placeholder={t('measurementView.typeOfObjectPlaceHolder')}
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
                zIndex={openDropdown === 'typeOfObject' ? 1 : 0}
                zIndexInverse={openDropdown === 'typeOfObject' ? 1 : 0}
                arrowIconStyle={{ tintColor: '#486732' }}
                closeAfterSelecting={true}
                open={openDropdown === 'typeOfObject'}
                value={typeOfObjectDropDownValue as ValueType}
                items={typeOfObjectDropDown ?? []}
                setValue={setTypeOfObjectDropDownValue}
                setItems={
                  setTypeOfObjectDropDown as Dispatch<SetStateAction<any[]>>
                }
                onChangeValue={() =>
                  onChange('typeOfObjectId', typeOfObjectDropDownValue)
                }
                multiple={false}
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
                disabled={formData.penId ? false : true}
                disabledStyle={{ opacity: 0.5 }}
                dropDownDirection="BOTTOM"
                scrollViewProps={{
                  style: {
                    height:
                      Dimensions.get('window').height > 640 ? 'auto' : rMS(156),
                  },
                }}
                onOpen={() => setOpenDropdown('typeOfObject')}
                onClose={() => setOpenDropdown(null)}
                ListEmptyComponent={() => (
                  <Text style={{ textAlign: 'center', padding: 10 }}>
                    {t('measurementView.dropDownDontInfo')}
                  </Text>
                )}
              />
              <DropDownPicker
                placeholder={t('measurementView.variablePlaceHolder')}
                placeholderStyle={{
                  fontSize: width * 0.04,
                  fontFamily: 'Pro-Regular',
                  color: '#292929',
                  paddingLeft: rMS(4),
                }}
                // stickyHeader={true}
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
                zIndex={openDropdown === 'variables' ? 1 : 0}
                zIndexInverse={openDropdown === 'variables' ? 1 : 0}
                arrowIconStyle={{ tintColor: '#486732' }}
                open={openDropdown === 'variables'}
                value={variablesDropDownValue as ValueType}
                items={variablesDropDown ?? []}
                setValue={setVariablesDropDownValue}
                setItems={
                  setVariablesDropDown as Dispatch<SetStateAction<any[]>>
                }
                onChangeValue={() =>
                  onChange('variablesIds', variablesDropDownValue)
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
                scrollViewProps={{
                  style: {
                    height:
                      Dimensions.get('window').height > 640 ? 'auto' : rMS(156),
                  },
                }}
                showsHorizontalScrollIndicator={true}
                showsVerticalScrollIndicator={true}
                disabled={formData.typeOfObjectId ? false : true}
                disabledStyle={{ opacity: 0.5 }}
                onOpen={() => setOpenDropdown('variables')}
                onClose={() => setOpenDropdown(null)}
                ListEmptyComponent={() => (
                  <Text style={{ textAlign: 'center', padding: 10 }}>
                    {t('measurementView.dropDownDontInfo')}
                  </Text>
                )}
              />
            </View>
          </KeyboardAwareScrollView>
          {/* Botón fijo */}
          <View style={styles.fixedButtonContainer}>
            <Pressable onPress={handleSubmit} style={styles.button}>
              <Text style={styles.buttonText}>
                {t('measurementView.continueButtonTEXT')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CreatePen;
