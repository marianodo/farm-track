import {
  Badge,
  Button,
  Divider,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';
import {
  Alert,
  FlatList,
  ImageBackground,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  KeyboardEvent,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import styles from './styles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { rMS, rMV, rS, rV } from '@/styles/responsive';
import useAuthStore from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import {
  Swipeable,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import useFieldStore from '@/store/fieldStore';
import { useCallback, useEffect, useMemo, useState } from 'react';

import useTypeOfObjectStore from '@/store/typeOfObjectStore';
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useValidationRules } from '@/utils/validation/validationRules';
import { FormErrors, validateInput } from '@/utils/validation/validationUtils';
import useVariableStore from '@/store/variableStore';
import usePenStore from '@/store/penStore';
import useReportStore from '@/store/reportStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReportDetail from '@/components/penAndReport/reportDetail';
import InfoStatsModal from '@/components/modal/InfoStatsModal';
import useMeasurementStatsStore from '@/store/measurementStatsStore';

interface ListItemProps {
  item: any;
  index: number;
  isExpanded: boolean;
  toggleExpand: (index: number) => void;
  setExpandedItems: (items: number[]) => void;
}

export default function PenScreen() {
  const [localLoading, setLocalLoading] = useState<boolean>(true);
  const [lng, setLng] = useState<string | null>(null);
  const { fieldId, fieldName, reportName, reportId } = useLocalSearchParams();
  const { statsByReport, getStatsByReport, statsLoading } = useMeasurementStatsStore();
  const router = useRouter();

  const { role, userName } = useAuthStore((state) => ({
    role: state.role,

    userName: state.username,
  }));

  const [penExpandedItems, setPenExpandedItems] = useState<number[]>([]);
  const [reportExpandedItems, setReportExpandedItems] = useState<number[]>([]);

  const toggleExpand = (
    index: number,
    setExpandedItems: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const {
    variables,
    variablesLoading,
    createVariable,
    onUpdate,
    getAllVariables,
  } = useVariableStore((state: any) => ({
    variables: state.variables,
    variablesLoading: state.variablesLoading,
    createVariable: state.createVariable,
    onUpdate: state.onUpdate,
    getAllVariables: state.getAllVariables,
  }));

  const { pensLoading, penById, onDelete, pens, getAllPens } = usePenStore(
    (state) => ({
      pensLoading: state.pensLoading,
      penById: state.penById,
      pens: state.pens,
      onDelete: state.onDelete,
      getAllPens: state.getAllPens,
    })
  );

  const { typeOfObjects, getAllTypeOfObjects } = useTypeOfObjectStore(
    (state) => ({
      typeOfObjects: state.typeOfObjects,
      getAllTypeOfObjects: state.getAllTypeOfObjects,
    })
  );
  const {
    getAllReportsByField,
    resetDetail,
    reportById,
    getReportById,
    reportsLoading,
    reportsByFielId,
  } = useReportStore((state) => ({
    getAllReportsByField: state.getAllReportsByField,
    getReportById: state.getReportById,
    reportById: state.reportById,
    reportsLoading: state.reportsLoading,
    resetDetail: state.resetDetail,
    reportsByFielId: state.reportsByFielId,
  }));
  const { t } = useTranslation();

  const [penOrReportSelect, setPenOrReportSelect] = useState<string | null>(
    (reportById && reportById[0]?.name) ?? null
  );

  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  const [reportStatsData] = useState({
    totalMeasurements: 0,
    variablesMeasured: {},
    totalObjectsMeasured: 0,
    pensMeasured: {},
  });

  useEffect(() => {
    if (reportId) {
      getStatsByReport(reportId as string, true, true, true, true, true);
    }
  }, [reportId, getStatsByReport]);

  const transformStatsData = useCallback((apiData: any) => {
    if (!apiData) return reportStatsData;

    let totalObjectsMeasured = 0;
    const pensMeasured: Record<string, Record<string, number>> = {};

    if (apiData?.measurement_by_field && Object.keys(apiData.measurement_by_field).length > 0) {
      const fieldName = Object.keys(apiData.measurement_by_field)[0];
      const fieldData = apiData?.measurement_by_field[fieldName];

      Object.entries(fieldData)?.forEach(([pen, objects]: [string, any]) => {
        pensMeasured[pen] = objects as Record<string, number>;

        Object.values(objects)?.forEach((count: any) => {
          totalObjectsMeasured += count;
        });
      });
    }

    return {
      totalMeasurements: apiData.total_measurement || 0,
      variablesMeasured: apiData.measurement_by_variable || {},
      totalObjectsMeasured,
      pensMeasured,
    };
  }, []);

  const modalStatsData = useMemo(() => {
    return statsByReport ? transformStatsData(statsByReport) : reportStatsData;
  }, [statsByReport, reportStatsData, transformStatsData]);

  useEffect(() => {
    const getLanguage = async () => {
      const language = await AsyncStorage.getItem('language');
      setLng(language);
    };
    getLanguage();
  }, []);

  useEffect(() => {
    getReportById(reportId as unknown as number);
    
    // Cargar reportes del campo si no están disponibles
    if (!reportsByFielId || !reportsByFielId[fieldId as string]) {
      getAllReportsByField(fieldId as string);
    }
    
    return () => {
      resetDetail();
    };
  }, []);

  useEffect(() => {
    if (!reportsLoading) {
      setLocalLoading(false);
    } else {
      setLocalLoading(true);
    }
  }, [reportsLoading]);

  useEffect(() => {
    if (reportById && reportById.length > 0) {
      setPenOrReportSelect(reportById[0].name);
    }
  }, [reportById]);

  const selectedReport =
    Array.isArray(reportById) &&
    reportById?.find((report) => report.name === penOrReportSelect);


  return (
    <View style={styles.titleContainer}>
      {/* header */}
      <ImageBackground
        source={require('../../../../../assets/images/penAndReport-bg-image.png')}
        style={{ height: rV(174), width: '100%' }}
        resizeMode="cover"
      >
        {/* contenedor header */}
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
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <View style={{
              display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: rMS(18),
            }}>
              <Text
                style={{
                  color: '#EBF2ED',
                  fontFamily: 'Pro-Regular-Bold',
                  fontSize: rMS(22),
                  fontWeight: 'bold',
                }}
              >
                {fieldName}
              </Text>
              <TouchableOpacity
                style={{ width: 0, height: 0, justifyContent: 'center', alignItems: 'center', marginRight: rMS(16) }}
                onPress={() => {
                  setShowInfoModal(true);
                }}
              >
                <IconButton icon="information-outline" iconColor="#fff" size={rMS(24)} />
              </TouchableOpacity>
            </View>
            {/* titulo */}
            <Text style={styles.welcome}>{reportName}</Text>
          </View>
        </View>
      </ImageBackground>
      {/* contenedor contenido campo */}
      <View
        style={{
          backgroundColor: 'white',
          width: '100%',
          height: '100%',
          top: rMS(-50),
          borderTopLeftRadius: 54,
          borderTopRightRadius: 54,
        }}
      >
        <View
          style={{
            marginHorizontal: rMS(22),
            marginVertical: rMS(10),
            paddingHorizontal: rMS(14),
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start', // Cambiado a 'flex-start'
                gap: rMS(30),
              }}
            >
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  gap: 30,
                }}
              >
                {Array.isArray(reportById) &&
                  reportById?.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        setPenOrReportSelect(item.name);
                        setPenExpandedItems([]);
                      }}
                    >
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 18,
                          fontWeight: 'bold',
                          fontFamily: 'Pro-Regular',
                          color:
                            penOrReportSelect === item.name
                              ? '#486732'
                              : '#000',
                        }}
                      >
                        {item.name}
                      </Text>
                      {penOrReportSelect === item.name && (
                        <Divider
                          style={{
                            backgroundColor: '#486732',
                            height: 2.4, // Ajusta según tu función rMS
                          }}
                        />
                      )}
                    </Pressable>
                  ))}
              </View>
            </View>
          </ScrollView>
        </View>

        {reportsLoading || localLoading ? (
          <ActivityIndicator
            style={{
              marginTop: '50%',
            }}
            animating={true}
            color="#486732"
          />
        ) : (
          <ReportDetail
            reports={selectedReport || null}
            reportById={reportById && reportById[0]?.report_id}
            reportsLoading={reportsLoading}
            getAllPens={getAllPens}
            fieldId={fieldId as string}
            onDelete={onDelete}
            expandedItems={penExpandedItems}
            toggleExpand={toggleExpand}
            setExpandedItems={setPenExpandedItems}
            rMS={rMS}
            styles={styles}
          />
        )}
      </View>
      <InfoStatsModal
        isVisible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        stats={modalStatsData}
      />
      
      {/* Botón Agregar Medición */}
      <View style={styles.addMeasurementButtonContainer}>
        <Button
          mode="contained"
          onPress={() => {
            // Buscar el reporte en reportsByFielId usando reportId
            const reportFromList = reportsByFielId && reportsByFielId[fieldId as string]
              ? reportsByFielId[fieldId as string].find((report: any) => report.id === parseInt(reportId as string))
              : null;

            if (reportFromList) {
              const reportDisplayName = reportFromList.name
                ? reportFromList.name.charAt(0).toUpperCase() + reportFromList.name.slice(1).toLowerCase()
                : `Report ${(reportFromList as any).correlative_id} - ${new Date(reportFromList.created_at).toLocaleDateString('es', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}`;
              
              const reportNameFind = reportFromList.name
                ? reportFromList.name.charAt(0).toUpperCase() + reportFromList.name.slice(1).toLowerCase()
                : `Report ${reportFromList.id} - ${new Date(reportFromList.created_at).toLocaleDateString('es', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}`;
              
              router.push({
                pathname: `/measurement`,
                params: {
                  fieldName: fieldName,
                  fieldId: fieldId,
                  reportName: reportDisplayName,
                  reportNameFind: reportNameFind,
                  reportId: reportFromList.id, // Agregar reportId para establecer createReportId
                },
              });
            }
          }}
          style={styles.addMeasurementButton}
          labelStyle={styles.addMeasurementButtonText}
        >
          {t('detailField.addMeasurementText')}
        </Button>
      </View>
    </View>
  );
}
