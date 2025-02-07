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
import { BackHandler } from 'react-native';
import styles from './styles';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { rMS, rMV, rS, rV } from '@/styles/responsive';
import useAuthStore from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import {
  Swipeable,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import useFieldStore from '@/store/fieldStore';
import React, { useEffect, useState } from 'react';

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
import MessageModal from '@/components/modal/MessageModal';
import TwoButtonsModal from '@/components/modal/TwoButtonsModal';
import PenList from '@/components/penAndReport/PenList';
import ReportList from '@/components/penAndReport/ReportList';

interface ListItemProps {
  item: any;
  index: number;
  isExpanded: boolean;
  toggleExpand: (index: number) => void;
  setExpandedItems: (items: number[]) => void;
}

export default function PenScreen() {
  const [lng, setLng] = useState<string | null>(null);
  const { fieldId, fieldName, onReport } = useLocalSearchParams();

  const [penOrReportSelect, setPenOrReportSelect] = useState<string>(
    onReport == 'true' ? 'reports' : 'pens'
  );

  const router = useRouter();

  const { role, userName } = useAuthStore((state) => ({
    role: state.role,

    userName: state.username,
  }));

  // Start modal's variables

  const [selectedPenDelete, setSelectedPenDelete] = useState<{
    id: number;
  } | null>(null);
  const [selectedReportDelete, setSelectedReportDelete] = useState<{
    id: number;
  } | null>(null);
  const [texts, setTexts] = useState<{
    title: string;
    subtitle: string;
  } | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [messageModalText, setMessageModalText] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // End modal's variables

  const [penExpandedItems, setPenExpandedItems] = useState<number[]>([]);
  const [reportExpandedItems, setReportExpandedItems] = useState<number[]>([]);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const toggleExpandPen = (index: number) => {
    setPenExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleExpand = (index: number) => {
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

  const deleteButtonAlert = async () => {
    if (selectedPenDelete && selectedPenDelete.id) {
      try {
        await onDelete(selectedPenDelete.id, fieldId as string);
        setShowModal(false);
        setSuccess(true);
        setShowMessageModal(true);
        setTimeout(() => {
          setShowMessageModal(false);
        }, 2000);
      } catch (error) {
        setShowModal(false);
        setSuccess(false);
        setShowMessageModal(true);
        setTimeout(() => {
          setShowMessageModal(false);
        }, 2000);
        console.log('Error en deleteButtonAlert:', error);
      }
      return;
    }
    if (selectedReportDelete && selectedReportDelete.id) {
      try {
        await onDeleteReport(selectedReportDelete.id, fieldId as string);
        setShowModal(false);
        setSuccess(true);
        setShowMessageModal(true);
        setTimeout(() => {
          setShowMessageModal(false);
        }, 2000);
      } catch (error) {
        setShowModal(false);
        setSuccess(false);
        setShowMessageModal(true);
        setTimeout(() => {
          setShowMessageModal(false);
        }, 2000);
        console.log('Error en deleteButtonAlert:', error);
      }
    }
  };

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
  const { getAllReportsByField, reportsByFielId, onDeleteReport, update } =
    useReportStore((state) => ({
      getAllReportsByField: state.getAllReportsByField,
      reportsByFielId: state.reportsByFielId,
      onDeleteReport: state.onDelete,
      update: state.update,
    }));
  const { t } = useTranslation();

  useEffect(() => {
    const getLanguage = async () => {
      const language = await AsyncStorage.getItem('language');
      setLng(language);
    };
    getLanguage();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (
        !reportsByFielId ||
        reportsByFielId[`${fieldId}`] === undefined ||
        reportsByFielId[`${fieldId}`] === null
      ) {
        getAllReportsByField(fieldId as string);
      }
      if (
        !pens ||
        pens[`${fieldId}`] === undefined ||
        pens[`${fieldId}`] === null
      ) {
        getAllPens(fieldId as string, false, true);
      }
      if (typeOfObjects === null) {
        getAllTypeOfObjects();
      }
      return () => {};
    }, [
      getAllTypeOfObjects,
      getAllPens,
      getAllReportsByField,
      pens,
      reportsByFielId,
      typeOfObjects,
      fieldId,
    ])
  );

  return (
    <View style={styles.titleContainer}>
      {/* {Array.isArray(typeOfObjects) &&
        typeOfObjects.length > 0 &&
        Array.isArray(variables) &&
        variables.length > 0 &&
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
        ))} */}
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
              onPress={() => router.replace('/(protected)/(tabs)/home')}
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
                fontFamily: 'Pro-Regular-Bold',
                fontWeight: 'bold',
                fontSize: rMS(22),
              }}
            >
              {fieldName}
            </Text>
            {/* titulo */}
            <Text style={styles.welcome}>{t('penView.title')}</Text>
          </View>
        </View>
      </ImageBackground>
      {/* contenedor contenido campo */}
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          borderTopRightRadius: 54,
          borderTopLeftRadius: 54,
          marginTop: rMS(-47),
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
          <Text
            style={{
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 'bold',
              fontFamily: 'Pro-Regular',
              color: '#000',
            }}
          >
            {t('penView.penText')}
          </Text>
        </View>
        {pensLoading ? (
          <ActivityIndicator
            style={{
              marginTop: '60%',
            }}
            animating={true}
            color="#486732"
          />
        ) : (
          /* contenido scroll */
          <PenList
            pens={pens && pens[`${fieldId}`]}
            fieldId={fieldId as string}
            expandedItems={penExpandedItems}
            toggleExpand={toggleExpandPen}
            setExpandedItems={setPenExpandedItems}
            rMS={rMS}
            setTexts={setTexts}
            typeOfObjects={typeOfObjects}
            variables={variables}
            styles={styles}
            setSelectedPenDelete={setSelectedPenDelete}
            setShowModal={setShowModal}
          />
        )}
      </View>
      {Array.isArray(typeOfObjects) &&
        typeOfObjects.length > 0 &&
        Array.isArray(variables) &&
        variables.length > 0 && (
          <View
            style={[styles.fixedButtonContainer, { backgroundColor: 'white' }]}
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(protected)/(stack)/pen/createPen',
                  params: { fieldId: fieldId, fieldName: fieldName },
                })
              }
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {t('penView.createPenTextButton')}
              </Text>
            </Pressable>
          </View>
        )}
      <TwoButtonsModal
        isVisible={showModal}
        onDismiss={() => setShowModal(false)}
        title={texts?.title as string}
        subtitle={texts?.subtitle as string}
        onPress={() => deleteButtonAlert()}
        vertical={false}
        textOkButton={t('fieldView.deleteButton')}
      />
      <MessageModal
        isVisible={showMessageModal}
        message={messageModalText}
        success={success}
      />
    </View>
  );
}
