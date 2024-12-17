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
import MessageModal from '@/components/modal/MessageModal';
import TwoButtonsModal from '@/components/modal/TwoButtonsModal';

interface ListItemProps {
  item: any;
  index: number;
  isExpanded: boolean;
  toggleExpand: (index: number) => void;
  setExpandedItems: (items: number[]) => void;
}

export default function AttributeScreen() {
  const { startsWithABlankSpace, minLength } = useValidationRules();
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  // modal delete y success or error

  const [selectedAttributesDelete, setSelectedAttributesDelete] = useState<{
    id: string;
  } | null>(null);
  const [texts, setTexts] = useState<{
    title: string;
  } | null>(null);
  const [messageModalText, setMessageModalText] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [success, setSucces] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // end modal delete y success or error

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
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleExpand = (index: number) => {
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
      setExpandedItems([]);
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
      setExpandedItems([]);
      setInputValue({ name: '' });
    } else {
      return;
    }
  };

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

  const deleteButtonAlert = async () => {
    if (selectedAttributesDelete && selectedAttributesDelete.id) {
      try {
        await onDelete(selectedAttributesDelete.id); // Espera a que onDelete sea exitoso
        setShowDeleteModal(false); // Cierra el modal solo si no hubo errores
        setSucces(true);
        setShowMessageModal(true);
        setTimeout(() => {
          setShowMessageModal(false);
        }, 2000);
      } catch (error) {
        setShowDeleteModal(false);
        setSucces(false);
        setShowMessageModal(true);
        setTimeout(() => {
          setShowMessageModal(false);
        }, 2000);
        console.log('Error en deleteButtonAlert:', error);
      }
    }
  };

  const renderRightActions = (progress: any, dragX: any, attribute: any) => (
    <View style={styles.rightActions}>
      <Pressable
        style={styles.editButton}
        onPress={() => router.push(`/attributes/edit/${attribute.id}`)}
      >
        <IconButton icon="pencil-outline" iconColor="#fff" size={rMS(24)} />
        <Text style={styles.actionText}>{t(`fieldView.editButton`)}</Text>
      </Pressable>
      <Pressable
        style={styles.deleteButton}
        // onPress={() => deleteButtonAlert(attribute.id, attribute.name)}
        onPress={() => {
          setSelectedAttributesDelete({ id: attribute.id });
          setTexts({
            title: `${t('attributeView.deleteAlertTitle')} "${
              attribute.name
            }"?`,
          });
          setShowDeleteModal(true);
        }}
      >
        <IconButton icon="trash-can-outline" iconColor="#fff" size={rMS(24)} />
        <Text style={styles.actionText}>{t(`fieldView.deleteButton`)}</Text>
      </Pressable>
    </View>
  );

  const ListItem: React.FC<ListItemProps> = ({
    item,
    index,
    isExpanded,
    toggleExpand,
    setExpandedItems,
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const animatedHeight = isExpanded
        ? withTiming('auto', {
            duration: 3000,
            easing: Easing.out(Easing.linear),
          })
        : withTiming(0, {
            duration: 3000,
            easing: Easing.out(Easing.linear),
          });
      return {
        marginTop: -20,
        height: animatedHeight,
        backgroundColor: '#f0f0f0',
      };
    }, [isExpanded]);

    return (
      <Swipeable
        key={index}
        enabled={!isExpanded} // Elimina el swipe si está expandido
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item)
        }
        containerStyle={{
          backgroundColor: '#3A5228',
          marginBottom: 10,
          borderRadius: 10,
        }}
      >
        <TouchableWithoutFeedback
          key={index}
          onPress={
            item.type_of_objects.length > 0
              ? () => {
                  Keyboard.dismiss;
                  toggleExpand(index);
                }
              : () => {
                  Keyboard.dismiss;
                }
          }
        >
          <View style={styles.attributeContainer}>
            <Text
              style={{
                paddingBottom: rMS(8),
                fontSize: rMS(17),
                paddingLeft: 6,
                fontWeight: 'bold',
                fontFamily: 'Pro-Regular',
              }}
            >
              {item?.name}
            </Text>
            {item.type_of_objects.length > 0 && isExpanded ? (
              <View style={{ paddingBottom: rMS(8) }}>
                <Image
                  source={require('../../../../assets/images/tabs/object-selected.png')}
                  style={{
                    width: rMS(22),
                    height: rMS(22),
                    alignSelf: 'center',
                  }}
                  resizeMode="contain"
                />
              </View>
            ) : item.type_of_objects.length > 0 && !isExpanded ? (
              <View style={{ paddingBottom: rMS(8) }}>
                <Image
                  source={require('../../../../assets/images/tabs/object-unselected.png')}
                  style={{
                    width: rMS(22),
                    height: rMS(22),
                    alignSelf: 'center',
                  }}
                  resizeMode="contain"
                />
              </View>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
        {/* Mostrar información cuando se expande */}

        <Animated.View style={[animatedStyle, { overflow: 'hidden' }]}>
          <Divider
            style={{
              backgroundColor: '#486732',
              height: 1,
            }}
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingHorizontal: rMS(10),
              paddingTop: rMS(8),
              paddingBottom: rMS(8),
              gap: rMS(4),
              width: '100%',
            }}
          >
            {item.type_of_objects.map((variable: any, index: number) => {
              return (
                <Badge
                  key={index}
                  style={{
                    paddingHorizontal: rMS(7),
                    height: rMS(24),
                    backgroundColor: '#486732',
                    fontFamily: 'Pro-Regular',
                    fontSize: rMS(12),
                    marginRight: rMS(4), // Add margin to ensure proper spacing
                    marginBottom: rMS(4), // Add margin to ensure proper spacing
                  }}
                >
                  {variable.name}
                </Badge>
              );
            })}
          </View>
        </Animated.View>
      </Swipeable>
    );
  };

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
              onPress={() => router.push('/attributes/create')}
              size={rS(24)}
            />
          </SafeAreaView>
        ) : (
          <IconButton
            style={styles.floatingButton}
            icon="plus"
            iconColor="#FFF"
            onPress={() => router.push('/attributes/create')}
            size={rS(24)}
          />
        ))}
      {/* header */}
      <ImageBackground
        source={require('../../../../assets/images/objects-bg-image.png')}
        style={{ height: rV(174), width: '100%' }}
        resizeMode="cover"
      >
        {/* contenedor header */}
        <View
          style={{
            paddingHorizontal: rMS(14),
            display: 'flex',
            justifyContent: 'space-between',
            height: '70%',
          }}
        >
          {/* profile y 3 puntitos */}
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <IconButton
              icon={require('../../../../assets/images/profile.png')}
              iconColor="#fff"
              size={rMV(24)}
              // onPress={() => onLogoutPressed()}
              style={{ marginLeft: rMS(-10) }}
            />
            <IconButton
              icon="dots-vertical"
              iconColor="#fff"
              size={rMV(24)}
              onPress={() => console.log('Pressed')}
              style={{ marginRight: rMS(-12) }}
            />
          </View>
          {/* nombre y bienvenido */}
          <View style={{ display: 'flex', gap: 2, paddingBottom: rMS(10) }}>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Pro-Regular',
                fontSize: rMS(13.6),
                fontWeight: 'regular',
              }}
            >
              {t('fieldView.greeting')} {userName}
            </Text>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Pro-Regular',
                fontSize: 22,
                fontWeight: 'bold',
              }}
            >
              {t('attributeView.title')}
            </Text>
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
        <Text
          style={{
            textAlign: 'center',
            marginTop: rMS(10),
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Pro-Regular',
          }}
        >
          {t('attributeView.attributeText')}
        </Text>
        {variablesLoading ? (
          <ActivityIndicator
            style={{
              marginTop: '60%',
            }}
            animating={true}
            color="#486732"
          />
        ) : !typeOfObjects?.length ? (
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
                backgroundColor: '#f5ead2',
                height: rMV(44),
                borderRadius: rMS(6),
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: rMV(20),
                display: 'flex',
                flexDirection: 'row',
                paddingRight: rMS(12),
              }}
            >
              <IconButton
                icon={'alert-circle-outline'}
                iconColor="#d9a220"
                size={rMS(20)}
                style={{ margin: 0 }}
              />
              <Text
                style={{
                  color: '#d9a220',
                  fontFamily: 'Pro-Regular',
                  fontSize: rMS(10),
                  flexShrink: 1,
                  flexWrap: 'wrap',
                  textAlign: 'center',
                }}
              >
                {t('attributeView.dontObjectMessage')}
              </Text>
            </View>
          </View>
        ) : !variables?.length ? (
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
                marginTop: rMV(20),
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
                {t('attributeView.dontAttributeMessage')}
              </Text>
            </View>
          </View>
        ) : (
          /* contenido scroll */
          <View style={styles.spacer}>
            <FlatList
              style={{ paddingHorizontal: rMS(20), paddingTop: rMS(10) }}
              data={variables}
              keyExtractor={(item, index) => `${item.name}${index}`}
              renderItem={({ item, index }) => {
                const isExpanded = expandedItems.includes(index);
                return (
                  <ListItem
                    item={item}
                    index={index}
                    isExpanded={isExpanded}
                    toggleExpand={toggleExpand}
                    setExpandedItems={setExpandedItems}
                  />
                );
              }}
            />
          </View>
        )}
      </View>
      <TwoButtonsModal
        isVisible={showDeleteModal}
        onDismiss={() => setShowDeleteModal(false)}
        title={texts?.title as string}
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

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    position: 'relative',
    height: '100%',
    alignItems: 'center',
  },
  spacer: {
    height: '72%',
  },
  attributeContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: rMS(68),
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  floatingButton: {
    position: 'absolute',
    fontWeight: 'bold',
    zIndex: 99999,
    bottom: 20,
    right: 15,
    width: rMS(56),
    height: rMS(56),
    borderRadius: 30,
    backgroundColor: '#486732',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  leftActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    height: rMS(98),
    backgroundColor: '#f0f0f0',
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: rMS(52),
    backgroundColor: '#3A5228',
    width: 68,
  },
  deleteButton: {
    display: 'flex',

    alignItems: 'center',
    paddingBottom: rMS(52),
    backgroundColor: '#B82E2E',
    width: 68,
  },
  archiveButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  actionText: {
    color: '#fff',
    fontFamily: 'Pro-Regular',
    fontSize: 11.2,
  },
  cancelButton: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  createButton: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Pro-Regular',
    color: '#486732',
    fontWeight: '600',
    fontSize: rMS(17),
  },
});
