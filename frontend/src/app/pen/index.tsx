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
import { Href } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { rMS, rMV, rS, rV } from '@/styles/responsive';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'expo-router';
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

interface ListItemProps {
  item: any;
  index: number;
  isExpanded: boolean;
  toggleExpand: (index: number) => void;
  setExpandedItems: (items: number[]) => void;
}

export default function AttributeScreen() {
  const { startsWithABlankSpace, minLength } = useValidationRules();
  const [penOrReportSelect, setPenOrReportSelect] = useState<string>('pens');
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();
  const [inputValue, setInputValue] = useState<Record<string, any>>({
    name: '',
  });
  const [editInputValue, setEditInputValue] = useState<Record<string, any>>({
    name: '',
  });

  const { role, userName } = useAuthStore((state) => ({
    role: state.role,

    userName: state.username,
  }));
  const [objectId, setObjectId] = useState(null);
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

  const handleInputChange = (name: string, value: string, type?: string) => {
    if (type === 'edit') {
      setEditInputValue({
        ...editInputValue,
        [name]: value,
      });
      Object.keys(editInputValue).forEach((key) => {
        validateField(key, 'edit');
      });
    } else {
      setInputValue({
        ...inputValue,
        [name]: value,
      });
      Object.keys(inputValue).forEach((key) => {
        validateField(key);
      });
    }
  };

  const validateField = (name: string, type?: string) => {
    if (type === 'edit') {
      const value = editInputValue[name];
      let fieldErrors: string[] | null = null;

      switch (name) {
        case 'name':
          fieldErrors = validateInput(
            value,
            [startsWithABlankSpace, minLength(2)],
            t
          );
          break;
      }

      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: fieldErrors,
      }));
    } else {
      const value = inputValue[name];
      let fieldErrors: string[] | null = null;

      switch (name) {
        case 'name':
          fieldErrors = validateInput(
            value,
            [startsWithABlankSpace, minLength(2)],
            t
          );
          break;
      }

      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: fieldErrors,
      }));
    }
  };

  const updateVariableSubmit = async () => {
    Object.keys(editInputValue).forEach((key) => {
      validateField(key, 'edit');
    });
    errors.name = errors.name = validateInput(
      editInputValue.name,
      [startsWithABlankSpace, minLength(2)],
      t
    );
    if (!Object.values(errors).some((error) => error !== null) && objectId) {
      await onUpdate(objectId, editInputValue);
      setErrors({});
      setPenExpandedItems([]);
      setReportExpandedItems([]);
    } else {
      return;
    }
  };

  const onSubmit = async () => {
    Object.keys(inputValue).forEach((key) => {
      validateField(key);
    });
    errors.name = errors.name = validateInput(
      inputValue.name,
      [startsWithABlankSpace, minLength(2)],
      t
    );
    if (!Object.values(errors).some((error) => error !== null)) {
      await createVariable(inputValue);
      setErrors({});
      setPenExpandedItems([]);
      setReportExpandedItems([]);
      setInputValue({ name: '' });
    } else {
      return;
    }
  };

  // Dentro de tu componente HomeScreen
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  const {
    variables,
    variablesLoading,
    createVariable,
    onDelete,
    onUpdate,
    getAllVariables,
  } = useVariableStore((state: any) => ({
    variables: state.variables,
    variablesLoading: state.variablesLoading,
    createVariable: state.createVariable,
    onDelete: state.onDelete,
    onUpdate: state.onUpdate,
    getAllVariables: state.getAllVariables,
  }));

  const { fieldLoading, fieldsByUserId } = useFieldStore((state) => ({
    fieldLoading: state.fieldLoading,
    fieldsByUserId: state.fieldsByUserId,
    onDelete: state.onDelete,
  }));

  const { typeOfObjects } = useTypeOfObjectStore((state) => ({
    typeOfObjects: state.typeOfObjects,
  }));

  const { t } = useTranslation();

  useEffect(() => {
    if (
      (fieldsByUserId !== null && variables === null) ||
      typeOfObjects === null
    ) {
      getAllVariables();
    }
  }, [variables, getAllVariables, fieldsByUserId, typeOfObjects]);

  return (
    <View style={styles.titleContainer}>
      {Array.isArray(typeOfObjects) &&
        typeOfObjects.length > 0 &&
        (Platform.OS === 'ios' ? (
          <SafeAreaView style={styles.floatingButton}>
            <IconButton
              icon="plus"
              iconColor="#FFF"
              onPress={() => router.push('/pen/createPen')}
              size={rS(24)}
            />
          </SafeAreaView>
        ) : (
          <IconButton
            style={styles.floatingButton}
            icon="plus"
            iconColor="#FFF"
            onPress={() => router.push('/pen/createPen')}
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
              Nombre del campo aca
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
        {variablesLoading ? (
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
            variables={variables}
            expandedItems={penExpandedItems}
            toggleExpand={toggleExpand}
            setExpandedItems={setPenExpandedItems}
            rMS={rMS}
            styles={styles}
          />
        ) : (
          <ReportList
            variables={variables}
            expandedItems={reportExpandedItems}
            toggleExpand={toggleExpand}
            setExpandedItems={setReportExpandedItems}
            rMS={rMS}
            styles={styles}
          />
        )}
      </View>
    </View>
  );
}
