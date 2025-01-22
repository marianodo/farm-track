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
} from 'react-native';
import styles from './styles';
import PenList from '../../components/penAndReport/PenList';
import ReportList from '../../components/penAndReport/ReportList';
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
import { useEffect, useState } from 'react';

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
  } = useReportStore((state) => ({
    getAllReportsByField: state.getAllReportsByField,
    getReportById: state.getReportById,
    reportById: state.reportById,
    reportsLoading: state.reportsLoading,
    resetDetail: state.resetDetail,
  }));
  const { t } = useTranslation();

  const [penOrReportSelect, setPenOrReportSelect] = useState<string | null>(
    (reportById && reportById[0]?.name) ?? null
  );

  useEffect(() => {
    const getLanguage = async () => {
      const language = await AsyncStorage.getItem('language');
      setLng(language);
    };
    getLanguage();
  }, []);

  useEffect(() => {
    getReportById(reportId as unknown as number);
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
    console.log(reportById && reportById[0]);
    if (reportById && reportById.length > 0) {
      setPenOrReportSelect(reportById[0].name);
    }
  }, [reportById]);

  const selectedReport =
    Array.isArray(reportById) &&
    reportById?.find((report) => report.name === penOrReportSelect);

  console.log('seleceted', selectedReport);

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
            <Text
              style={{
                marginLeft: 20,
                color: '#EBF2ED',
                fontFamily: 'Pro-Regular',
                fontSize: rMS(14),
              }}
            >
              {fieldName}
            </Text>
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
    </View>
  );
}
