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

interface ListItemProps {
  item: any;
  index: number;
  isExpanded: boolean;
  toggleExpand: (index: number) => void;
  setExpandedItems: (items: number[]) => void;
}

export default function PenScreen() {
  const [lng, setLng] = useState<string | null>(null);
  const { fieldId, fieldName } = useLocalSearchParams();

  const [penOrReportSelect, setPenOrReportSelect] = useState<string>('pens');

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

  const { pensLoading, penById, onDelete, pens, getAllPens, resetDetail } =
    usePenStore((state) => ({
      pensLoading: state.pensLoading,
      penById: state.penById,
      pens: state.pens,
      onDelete: state.onDelete,
      getAllPens: state.getAllPens,
      resetDetail: state.resetDetail,
    }));

  const { typeOfObjects, getAllTypeOfObjects } = useTypeOfObjectStore(
    (state) => ({
      typeOfObjects: state.typeOfObjects,
      getAllTypeOfObjects: state.getAllTypeOfObjects,
    })
  );
  const { getAllReportsByField, reportsByFielId, onDeleteReport } =
    useReportStore((state) => ({
      getAllReportsByField: state.getAllReportsByField,
      reportsByFielId: state.reportsByFielId,
      onDeleteReport: state.onDelete,
    }));
  const { t } = useTranslation();

  useEffect(() => {
    const getLanguage = async () => {
      const language = await AsyncStorage.getItem('language');
      setLng(language);
    };
    getLanguage();
  }, []);

  useEffect(() => {
    if (!reportsByFielId || reportsByFielId[`${fieldId}`] === null) {
      getAllReportsByField(fieldId as string);
    }
    if (!pens || pens[`${fieldId}`] === null) {
      getAllPens(fieldId as string, false, true);
    }
    if (typeOfObjects === null) {
      getAllTypeOfObjects();
    }
  }, [
    getAllTypeOfObjects,
    getAllPens,
    ,
    getAllReportsByField,
    pens,
    reportsByFielId,
    typeOfObjects,
    fieldId,
  ]);

  return (
    <View style={styles.titleContainer}>
      {Array.isArray(typeOfObjects) &&
        typeOfObjects.length > 0 &&
        (Platform.OS === 'ios' ? (
          <SafeAreaView style={styles.floatingButton}>
            <IconButton
              icon="plus"
              iconColor="#FFF"
              onPress={() =>
                router.push({
                  pathname:
                    penOrReportSelect === 'pens'
                      ? '/pen/createPen'
                      : '/report/createReport',
                  params:
                    penOrReportSelect === 'pens'
                      ? { fieldId: fieldId }
                      : { fieldId: fieldId, fieldName: fieldName },
                })
              }
              size={rS(24)}
            />
          </SafeAreaView>
        ) : (
          <IconButton
            style={styles.floatingButton}
            icon="plus"
            iconColor="#FFF"
            onPress={() =>
              router.push({
                pathname:
                  penOrReportSelect === 'pens'
                    ? '/pen/createPen'
                    : '/report/createReport',
                params:
                  penOrReportSelect === 'pens'
                    ? { fieldId: fieldId }
                    : { fieldId: fieldId, fieldName: fieldName },
              })
            }
            size={rS(24)}
          />
        ))}
      {/* header */}
      <ImageBackground
        source={require('../../../assets/images/penAndReport-bg-image.png')}
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
            {penOrReportSelect === 'pens' ? (
              <Text style={styles.welcome}>{t('penView.title')}</Text>
            ) : (
              <Text style={styles.welcome}>{t('reportsView.title')}</Text>
            )}
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
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: rMS(60),
            marginHorizontal: rMS(22),
            marginVertical: rMS(10),
          }}
        >
          <Pressable onPress={() => setPenOrReportSelect('pens')}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: 'Pro-Regular',
                color: penOrReportSelect === 'pens' ? '#486732' : '#000',
              }}
            >
              {t('penView.penText')}
            </Text>
            {penOrReportSelect === 'pens' && (
              <Divider
                style={{
                  backgroundColor: '#486732',
                  height: rMS(2.4),
                }}
              />
            )}
          </Pressable>
          <Pressable onPress={() => setPenOrReportSelect('reports')}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: 'Pro-Regular',
                color: penOrReportSelect === 'reports' ? '#486732' : '#000',
              }}
            >
              {t('reportsView.reportsText')}
            </Text>
            {penOrReportSelect === 'reports' && (
              <Divider
                style={{
                  backgroundColor: '#486732',
                  height: rMS(2.4),
                }}
              />
            )}
          </Pressable>
        </View>
        {pensLoading ? (
          <ActivityIndicator
            style={{
              marginTop: '60%',
            }}
            animating={true}
            color="#486732"
          />
        ) : penOrReportSelect === 'pens' ? (
          /* contenido scroll */
          <PenList
            pens={pens && pens[`${fieldId}`]}
            getAllPens={getAllPens}
            fieldId={fieldId as string}
            onDelete={onDelete}
            expandedItems={penExpandedItems}
            toggleExpand={toggleExpand}
            setExpandedItems={setPenExpandedItems}
            rMS={rMS}
            styles={styles}
          />
        ) : (
          <ReportList
            reports={reportsByFielId && reportsByFielId[`${fieldId}`]}
            expandedItems={reportExpandedItems}
            toggleExpand={toggleExpand}
            setExpandedItems={setReportExpandedItems}
            rMS={rMS}
            styles={styles}
            getAllReports={getAllReportsByField}
            lng={lng}
            onDelete={onDeleteReport}
            fieldName={fieldName}
            fieldId={fieldId as string}
          />
        )}
      </View>
    </View>
  );
}
