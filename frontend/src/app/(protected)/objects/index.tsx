import {
  Badge,
  Button,
  Divider,
  IconButton,
  Modal,
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
import { ActivityIndicator } from 'react-native-paper';
import { rMS, rMV, rS, rV } from '@/styles/responsive';
import { useAuth } from '@/context/AuthContext';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Swipeable,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import useFieldStore from '@/store/fieldStore';
import { useEffect, useState, useRef } from 'react';

import useTypeOfObjectStore from '@/store/typeOfObjectStore';
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useValidationRules } from '@/utils/validation/validationRules';
import { FormErrors, validateInput } from '@/utils/validation/validationUtils';
import useVariableStore from '@/store/variableStore';
import TwoButtonsModal from '@/components/modal/TwoButtonsModal';
import MessageModal from '@/components/modal/MessageModal';

interface ListItemProps {
  item: any;
  index: number;
  isExpanded: boolean;
  toggleExpand: (index: number) => void;
  setExpandedItems: (items: number[]) => void;
}

export default function ObjectScreen() {
  const { variables, variableLoading } = useVariableStore((state: any) => ({
    variables: state.variables,
    variableLoading: state.variableLoading,
  }));
  const [selectedObjectDelete, setSelectedObjectDelete] = useState<{
    id: string;
  } | null>(null);
  const [texts, setTexts] = useState<{
    title: string;
  } | null>(null);
  const [messageModalText, setMessageModalText] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [success, setSucces] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const { startsWithABlankSpace, minLength } = useValidationRules();
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();
  const [inputValue, setInputValue] = useState<Record<string, any>>({
    name: '',
  });
  const [editInputValue, setEditInputValue] = useState<Record<string, any>>({
    name: '',
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
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
      setIsModalEditVisible(false);
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
      await createTypeOfObject(inputValue);
      setErrors({});
      setExpandedItems([]);
      setInputValue({ name: '' });
      setIsModalVisible(false);
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
    typeOfObjects,
    typeOfObjectsLoading,
    createTypeOfObject,
    onDelete,
    onUpdate,
    getAllTypeOfObjects,
  } = useTypeOfObjectStore((state: any) => ({
    typeOfObjects: state.typeOfObjects,
    typeOfObjectsLoading: state.typeOfObjectsLoading,
    createTypeOfObject: state.createTypeOfObject,
    onDelete: state.onDelete,
    onUpdate: state.onUpdate,
    getAllTypeOfObjects: state.getAllTypeOfObjects,
  }));

  const { fieldLoading, fieldsByUserId } = useFieldStore((state) => ({
    fieldLoading: state.fieldLoading,
    fieldsByUserId: state.fieldsByUserId,
  }));

  const { t } = useTranslation();

  const deleteButtonAlert = async () => {
    if (selectedObjectDelete && selectedObjectDelete.id) {
      try {
        await onDelete(selectedObjectDelete.id); // Espera a que onDelete sea exitoso
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

  const renderRightActions = (progress: any, dragX: any, object: any) => (
    <View style={styles.rightActions}>
      <Pressable
        style={styles.editButton}
        onPress={() => {
          setEditInputValue({
            name: object.name,
          });
          setObjectId(object.id);
          setIsModalEditVisible(true);
        }}
      >
        <IconButton icon="pencil-outline" iconColor="#fff" size={rMS(24)} />
        <Text style={styles.actionText}>{t(`fieldView.editButton`)}</Text>
      </Pressable>
      <Pressable
        style={styles.deleteButton}
        onPress={() => {
          setSelectedObjectDelete({ id: object.id });
          setTexts({
            title: `${t('objectView.deleteAlertTitle')} "${object.name}"?`,
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
            item.variables.length > 0
              ? () => {
                  Keyboard.dismiss;
                  toggleExpand(index);
                }
              : () => {
                  Keyboard.dismiss;
                }
          }
        >
          <View style={styles.objectContainer}>
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
            {item.variables.length > 0 && isExpanded ? (
              <View style={{ paddingBottom: rMS(8) }}>
                <Image
                  source={require('../../../../assets/images/tabs/variables-selected.png')}
                  style={{
                    width: rMS(22),
                    height: rMS(22),
                    alignSelf: 'center',
                  }}
                  resizeMode="contain"
                />
              </View>
            ) : item.variables.length > 0 && !isExpanded ? (
              <View style={{ paddingBottom: rMS(8) }}>
                <Image
                  source={require('../../../../assets/images/tabs/variables-unselected.png')}
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
            {item.variables.map((variable: any, index: number) => {
              return (
                <Badge
                  key={index}
                  style={{
                    paddingHorizontal: rMS(7),
                    height: rMS(24),
                    backgroundColor: '#486732',
                    fontFamily: 'Pro-Regular',
                    fontSize: rMS(12),
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
    if (fieldsByUserId !== null && typeOfObjects === null) {
      getAllTypeOfObjects();
    }
    setExpandedItems([]);
  }, [typeOfObjects, getAllTypeOfObjects, fieldsByUserId]);

  return (
    <View style={styles.titleContainer}>
      {Array.isArray(fieldsByUserId) &&
        fieldsByUserId.length > 0 &&
        !isModalVisible &&
        !isModalEditVisible &&
        (Platform.OS === 'ios' ? (
          <SafeAreaView style={styles.floatingButton}>
            <IconButton
              icon="plus"
              iconColor="#FFF"
              onPress={() => setIsModalVisible(true)}
              size={rS(24)}
            />
          </SafeAreaView>
        ) : (
          <IconButton
            style={styles.floatingButton}
            icon="plus"
            iconColor="#FFF"
            onPress={() => setIsModalVisible(true)}
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
              {t('objectView.title')}
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
          {t('objectView.objectText')}
        </Text>
        {typeOfObjectsLoading ? (
          <ActivityIndicator
            style={{
              marginTop: '60%',
            }}
            animating={true}
            color="#486732"
          />
        ) : !fieldsByUserId?.length ? (
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
                {t('objectView.dontFieldMessage')}
              </Text>
            </View>
          </View>
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
                {t('objectView.dontObjectMessage')}
              </Text>
            </View>
          </View>
        ) : (
          /* contenido scroll */
          <View style={styles.spacer}>
            <FlatList
              style={{ paddingHorizontal: rMS(20), paddingTop: rMS(10) }}
              data={typeOfObjects}
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
      {/* Modal Edit */}
      <Modal
        visible={isModalEditVisible}
        onDismiss={() => setIsModalEditVisible(false)}
        style={[styles.modal, { margin: 'auto' }]}
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
            justifyContent: isKeyboardVisible ? 'flex-start' : 'center',
            alignItems: 'center',
          }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={100}
        >
          <View style={styles.modalContent}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
                paddingBottom: 0,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Pro-Regular',
                  color: '#292929',
                  fontWeight: 'bold',
                  fontSize: rMS(17),
                }}
              >
                {t('objectView.modalEditTitle')}
              </Text>
              <Text
                style={{
                  fontFamily: 'Pro-Regular',
                  color: '#292929',
                  // fontWeight: 'bold',
                  fontSize: rMS(13),
                }}
              >
                {t('objectView.modalEditSubtitle')}
              </Text>
            </View>
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <TextInput
                mode="outlined"
                activeOutlineColor="transparent"
                textColor="#486732"
                cursorColor="#486732"
                placeholderTextColor="#96A59A"
                selectionColor={Platform.OS == 'ios' ? '#486732' : '#9cdfa3'}
                selectionHandleColor="#486732"
                placeholder={`${t('objectView.placeHolderModal')}`}
                outlineColor="#F1F1F1"
                value={editInputValue.name}
                onChangeText={(text) => handleInputChange('name', text, 'edit')}
                style={styles.modalInput}
              />
            </View>
            {errors.name && (
              <Text
                style={{
                  color: 'red',
                  textAlign: 'center',
                  fontSize: rS(11),
                  marginBottom: 12,
                }}
              >
                {errors.name[0]}
              </Text>
            )}
            <View
              style={{
                width: '100%',
                alignSelf: 'center',
              }}
            >
              {typeOfObjectsLoading ? (
                <ActivityIndicator
                  style={{
                    paddingVertical: '10%',
                  }}
                  animating={true}
                  color="#486732"
                />
              ) : (
                <>
                  <Divider style={{ backgroundColor: '#486732' }} />
                  <View style={styles.modalButtons}>
                    <Button
                      onPress={() => {
                        setErrors({});
                        setIsModalEditVisible(false);
                      }}
                      style={styles.cancelButton}
                      rippleColor="#436d22"
                    >
                      <Text style={styles.buttonText}>
                        {t('objectView.cancelButtonText')}
                      </Text>
                    </Button>
                    <View
                      style={{
                        height: '100%',
                        width: 0.5,
                        backgroundColor: '#486732',
                      }}
                    />
                    <Button
                      onPress={() => updateVariableSubmit()}
                      style={styles.createButton}
                      rippleColor="#436d22"
                    >
                      <Text style={styles.buttonText}>
                        {t('objectView.updateButtonText')}
                      </Text>
                    </Button>
                  </View>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        style={styles.modal}
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
            justifyContent: isKeyboardVisible ? 'flex-start' : 'center',
            alignItems: 'center',
          }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={100}
        >
          <View style={styles.modalContent}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
                paddingBottom: 0,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Pro-Regular',
                  color: '#292929',
                  fontWeight: 'bold',
                  fontSize: rMS(17),
                }}
              >
                {t('objectView.modalTitle')}
              </Text>
              <Text
                style={{
                  fontFamily: 'Pro-Regular',
                  color: '#292929',
                  // fontWeight: 'bold',
                  fontSize: rMS(13),
                }}
              >
                {t('objectView.modalSubtitle')}
              </Text>
            </View>
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <TextInput
                mode="outlined"
                activeOutlineColor="transparent"
                textColor="#486732"
                cursorColor="#486732"
                placeholderTextColor="#96A59A"
                selectionColor={Platform.OS == 'ios' ? '#486732' : '#9cdfa3'}
                selectionHandleColor="#486732"
                placeholder={`${t('objectView.placeHolderModal')}`}
                outlineColor="#F1F1F1"
                value={inputValue.name}
                onChangeText={(text) => handleInputChange('name', text)}
                style={styles.modalInput}
              />
              {errors.name && (
                <Text
                  style={{
                    color: 'red',
                    textAlign: 'center',
                    fontSize: rS(11),
                    marginBottom: 12,
                  }}
                >
                  {errors.name[0]}
                </Text>
              )}
            </View>
            <View
              style={{
                width: '100%',
                alignSelf: 'center',
              }}
            >
              {typeOfObjectsLoading ? (
                <ActivityIndicator
                  style={{
                    paddingVertical: '10%',
                  }}
                  animating={true}
                  color="#486732"
                />
              ) : (
                <>
                  <Divider style={{ backgroundColor: '#486732' }} />
                  <View style={styles.modalButtons}>
                    <Button
                      onPress={() => {
                        setErrors({});
                        setInputValue({ name: '' });
                        setIsModalVisible(false);
                      }}
                      style={styles.cancelButton}
                      rippleColor="#436d22"
                    >
                      <Text style={styles.buttonText}>
                        {t('objectView.cancelButtonText')}
                      </Text>
                    </Button>
                    <View
                      style={{
                        height: '100%',
                        width: 0.5,
                        backgroundColor: '#486732',
                      }}
                    />
                    <Button
                      onPress={() => onSubmit()}
                      style={styles.createButton}
                      rippleColor="#436d22"
                    >
                      <Text style={styles.buttonText}>
                        {' '}
                        {t('objectView.createButtonText')}
                      </Text>
                    </Button>
                  </View>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  objectContainer: {
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
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 10,
    width: rMS(270),
    backgroundColor: '#EBF2ED',
  },
  modalInput: {
    width: rMS(238),
    height: rMV(32),
    borderWidth: 1.1,
    borderColor: '#96A59A',
    marginBottom: 20,
    paddingVertical: 5,
    borderRadius: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
