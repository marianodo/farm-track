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
const { height } = Dimensions.get('window');
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
import useFieldStore from '@/store/fieldStore';
import useAuthStore from '@/store/authStore';
import { productivityNameType } from '@/utils/constants/productivity';
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
};

// FormDataError removido - ya no hay validación obligatoria

type ProductivityData = {
  total_cows: number | null;
  milking_cows: number | null;
  average_production: number | null;
  somatic_cells: number | null;
  percentage_of_fat: number | null;
  percentage_of_protein: number | null;
};

const CreateReport: React.FC = () => {
  const { fieldId, fieldName } = useLocalSearchParams();
  // Validación removida - campos son opcionales
  const [editObjects, setEditObjects] = useState<boolean>(false);
  const router = useRouter();
  const { typeOfObjects } = useTypeOfObjectStore((state: any) => ({
    typeOfObjects: state.typeOfObjects,
  }));

  const { resetCreateReportId, createReport, reportsLoading, createReportId, createReportName } =
    useReportStore((state: any) => ({
      reportsLoading: state.reportsLoading,
      createReport: state.createReport,
      resetDetail: state.resetDetail,
      resetCreateReportId: state.resetCreateReportId,
      createReportId: state.createReportId,
      createReportName: state.createReportName,
    }));

  const { fieldProductionType } = useFieldStore();

  const { pens, pensLoading } = usePenStore((state: any) => ({
    pens: state.pens,
    pensLoading: state.pensLoading,
  }));

  const { t } = useTranslation();
  const productivityInfo = productivityNameType.map((item) => ({
    ...item,
    label: t(`reportsView.productivityDataLabel.${item.name}`),
  }));
  const [open, setOpen] = useState(false);
  const [itemsValue, setItemsValue] = useState<string | undefined | string[]>();
  const [items, setItems] = useState<Item[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: null,
    comment: null,
  });

  const [productivityData, setProductivityData] = useState<ProductivityData>({
    total_cows: null,
    milking_cows: null,
    average_production: null,
    somatic_cells: null,
    percentage_of_fat: null,
    percentage_of_protein: null,
  });

  const { userId } = useAuthStore((state) => ({
    userId: state.userId,
  }));

  // Función para manejar el cambio en los inputs
  const handleInputChange = (name: string, value: number | null | string) => {
    setProductivityData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Removida validación obligatoria - nombre y observación son opcionales
    return null;
  };

  const onChange = (field: keyof FormData, inputValue: any) => {
    setFormData({ ...formData, [field]: inputValue });
    // Removida validación en tiempo real - campos son opcionales
  };
  const handleSubmit = async () => {

    const hasProductivityData = Object.values(productivityData).some(
      (value) => value !== null
    );

    const data = {
      report: formData,
      ...(hasProductivityData && {
        productivity: { ...productivityData, userId: userId },
      }),
    };

    try {
      const newReport = await createReport(data, fieldId);
      
      // Verificar que el reporte se creó correctamente
      if (!newReport || !newReport.id) {
        throw new Error('Failed to create report');
      }

      const reportId = newReport.correlative_id;
      const reportRealId = newReport.id;
      
      // Usar el nombre del formulario si existe, sino usar createReportName del store, sino usar formato por defecto
      const reportName = formData.name && formData.name.trim() !== ''
        ? formData.name
        : (createReportName && createReportName.trim() !== ''
          ? createReportName
          : `Report ${reportId} - ${new Date().toLocaleDateString('es', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}`);
      
      const reportNameFind = formData.name && formData.name.trim() !== ''
        ? formData.name
        : `Report ${reportRealId} - ${new Date().toLocaleDateString('es', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}`;

      // Navegar solo después de que todo esté correcto
      router.push({
        pathname: `/measurement`,
        params: {
          fieldName: fieldName,
          fieldId: fieldId,
          reportName: reportName,
          reportNameFind: reportNameFind,
          reportId: reportRealId.toString() // Pasar el reportId para establecer createReportId
        },
      });
    } catch (error) {
      console.error('Error creating report:', error);
      
      // Mostrar mensaje de error más específico
      if (error?.message?.includes('timeout') || error?.message?.includes('expired')) {
        alert(t('reportsView.timeoutError') || 'Database operation timed out. Please try again.');
      } else if (error?.message?.includes('network') || error?.message?.includes('connection')) {
        alert(t('reportsView.networkError') || 'Network error. Please check your connection and try again.');
      } else {
        alert(t('attributeView.formErrorText'));
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setFormData({ name: null, comment: null });
        setProductivityData({
          total_cows: null,
          milking_cows: null,
          average_production: null,
          somatic_cells: null,
          percentage_of_fat: null,
          percentage_of_protein: null,
        });
        resetCreateReportId();
      };
    }, [resetCreateReportId])
  );

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
                {t('reportsView.newReportText')}
              </Text>
            </View>
          </View>
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
                placeholder={`${t('reportsView.reportFieldNamePlaceHolder')}: ${fieldName as string
                  }`}
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
                )}: ${new Date().toLocaleDateString('es', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}`}
                editable={false}
                activeOutlineColor="transparent"
                outlineColor="#F1F1F1"
                style={styles.input}
              />

              <TextInput
                mode="outlined"
                placeholderTextColor="#292929"
                placeholder={t('reportsView.reportNamePlaceHolder')}
                value={formData.name || ''}
                onChangeText={(value) => onChange('name', value)}
                autoCapitalize="sentences"
                activeOutlineColor="transparent"
                outlineColor="#F1F1F1"
                cursorColor="#486732"
                selectionColor={Platform.OS == 'ios' ? '#486732' : '#486732'}
                style={styles.input}
              />

              <TextInput
                mode="outlined"
                placeholderTextColor="#292929"
                placeholder={t('reportsView.reportObservationsPlaceHolder')}
                value={formData.comment || ''}
                onChangeText={(value) => onChange('comment', value)}
                autoCapitalize="sentences"
                activeOutlineColor="transparent"
                outlineColor="#F1F1F1"
                cursorColor="#486732"
                selectionColor={Platform.OS == 'ios' ? '#486732' : '#486732'}
                style={styles.input}
              />
              {fieldProductionType === 'bovine_of_milk' && (
                <>
                  <View
                    style={{
                      padding: 10,
                      marginTop: 10,
                      width: '100%',
                      backgroundColor: '#F1F1F1',
                      borderRadius: 8,
                      flexDirection: 'column',
                      // flexWrap: 'wrap',
                      // justifyContent: 'center',
                      // alignContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: width * 0.04,
                        fontFamily: 'Pro-Bold',
                        color: '#0009',
                      }}
                    >
                      Production details
                    </Text>
                    <View
                      style={{
                        padding: 10,
                        marginTop: 10,
                        width: '100%',
                        backgroundColor: '#F1F1F1',
                        borderRadius: 8,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                      }}
                    >
                      {productivityInfo.map((input, index) => (
                        <View
                          key={index}
                          style={{
                            width: '48%',
                            marginBottom: 10,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'Pro-Regular',
                              color: '#292929',
                              marginLeft: 5,
                              textTransform: 'capitalize',
                              marginBottom: 8,
                            }}
                          >
                            {input.label}
                          </Text>
                          <TextInput
                            mode="outlined"
                            style={{
                              width: '100%',
                              height: 50,
                              borderWidth: 1,
                              fontSize: 16,
                              fontFamily: 'Pro-Regular',
                              color: '#292929',
                              borderColor: '#ccc',
                              borderRadius: 8,
                              paddingHorizontal: 4,
                            }}
                            keyboardType={
                              input.type === 'integer'
                                ? 'number-pad'
                                : 'decimal-pad'
                            }
                            placeholder={input.label}
                            placeholderTextColor="#486732"
                            value={
                              productivityData[
                                input.name as keyof ProductivityData
                              ]?.toString() || ''
                            }
                            activeOutlineColor="#486732"
                            outlineColor="#486732"
                            cursorColor="#486732"
                            onChangeText={(value) => {
                              const sanitizedValue = value.replace(',', '.');
                              if (/^[0-9]*\.?[0-9]*$/.test(sanitizedValue)) {
                                handleInputChange(
                                  input.name,
                                  input.type === 'integer'
                                    ? parseInt(sanitizedValue) || null
                                    : sanitizedValue || null
                                );
                              }
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </View>
          </KeyboardAwareScrollView>
          <View style={styles.fixedButtonContainer}>
            <Pressable 
              onPress={handleSubmit} 
              style={[
                styles.button,
                reportsLoading && { opacity: 0.6 }
              ]}
              disabled={reportsLoading}
            >
              <Text style={styles.buttonText}>
                {reportsLoading ? t('reportsView.creatingText') || 'Creating...' : t('reportsView.continueText')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CreateReport;
