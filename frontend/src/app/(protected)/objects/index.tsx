import { IconButton, Modal, Portal, Text, TextInput } from 'react-native-paper';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
  Animated,
  Easing,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { rMS, rMV, rS, rV } from '@/styles/responsive';
import Loader from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Swipeable } from 'react-native-gesture-handler';
import { typeOfProductionImages } from '@/utils/typeOfProductionImages/typeOfProductionImages';
import useFieldStore from '@/store/fieldStore';
import { useEffect, useState, useRef } from 'react';

import useTypeOfObjectStore from '@/store/typeOfObjectStore';

export default function HomeScreen() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(rMS(60))).current;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { role, userName } = useAuthStore((state) => ({
    role: state.role,

    userName: state.username,
  }));
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (index: number) => {
    // Alterna el estado expandido del elemento en el índice dado
    setExpandedItems((prevState) => {
      const isExpanded = !prevState[index]; // Invertir el estado de expansión
      const newHeight = isExpanded ? rMS(120) : rMS(60); // Define la nueva altura según el estado

      // Ejecuta la animación con la altura calculada
      Animated.timing(animatedHeight, {
        toValue: newHeight,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      // Retorna el nuevo estado con el índice actualizado
      return {
        ...prevState,
        [index]: isExpanded, // Alterna solo el índice seleccionado
      };
    });
  };

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
    onDelete: state.onDelete,
  }));

  const { t } = useTranslation();

  const deleteButtonAlert = (id: string, name: string) =>
    Alert.alert(
      `¿${t('fieldView.deleteAlertTitle')} "${name}"?`,
      `${t('fieldView.deleteAlertSubTitle')}`,
      [
        {
          text: `${t('fieldView.deleteAlertText')}`,
          style: 'cancel',
        },
        { text: 'OK', onPress: () => onDelete(id) },
      ]
    );

  const renderRightActions = (progress: any, dragX: any, field: any) => (
    <View style={styles.rightActions}>
      <Pressable
        style={styles.editButton}
        onPress={() => router.push(`/editField/${field.id}`)}
      >
        <IconButton icon="pencil-outline" iconColor="#fff" size={rMS(24)} />
        <Text style={styles.actionText}>{t(`fieldView.editButton`)}</Text>
      </Pressable>
      <Pressable
        style={styles.deleteButton}
        onPress={() => deleteButtonAlert(field.id, field.name)}
      >
        <IconButton icon="trash-can-outline" iconColor="#fff" size={rMS(24)} />
        <Text style={styles.actionText}>{t(`fieldView.deleteButton`)}</Text>
      </Pressable>
    </View>
  );

  useEffect(() => {
    if (fieldsByUserId !== null && typeOfObjects === null) {
      getAllTypeOfObjects();
    }
  }, [typeOfObjects, getAllTypeOfObjects, fieldsByUserId]);

  return (
    <View style={styles.titleContainer}>
      {Array.isArray(fieldsByUserId) &&
        fieldsByUserId.length > 0 &&
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
                paddingHorizontal: rMS(2),
                paddingRight: rMS(14),
              }}
            >
              <IconButton
                icon={'alert-circle-outline'}
                iconColor="#d9a220"
                size={rMS(20)}
              />
              <Text
                style={{
                  color: '#d9a220',
                  fontFamily: 'Pro-Regular',
                  fontSize: rMS(10),
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
              />
              <Text
                style={{
                  color: '#487632',
                  fontFamily: 'Pro-Regular',
                  fontSize: rMS(10),
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
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item: typeOfObjects, index }) => (
                <Swipeable
                  // enabled={false}
                  renderRightActions={(progress, dragX) =>
                    renderRightActions(progress, dragX, typeOfObjects)
                  }
                  containerStyle={{
                    backgroundColor: '#3A5228',
                    height: animatedHeight,
                    marginBottom: 10,
                    borderRadius: 10,
                  }}
                >
                  <Pressable onPress={() => toggleExpand(index)}>
                    <View key={index} style={styles.fieldContainer}>
                      <View
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text
                          style={{
                            textAlign: 'left',
                            fontSize: 18,
                            paddingLeft: 6,
                            fontWeight: 'bold',
                            fontFamily: 'Pro-Regular',
                          }}
                        >
                          NAME
                        </Text>
                        <View
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: rMS(6),
                            marginBottom: rMS(12),

                            width: rS(178),
                          }}
                        >
                          <Text
                            style={{ width: rS(158) }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            LOCATION
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          width: rS(110),
                        }}
                      >
                        <Text>IMAGE</Text>
                        <View>
                          <Text style={styles.fieldText}>TYPE</Text>
                        </View>
                      </View>
                    </View>
                    {/* Mostrar información adicional cuando esté expandido */}
                    {expandedItems[index] && (
                      <View style={{ marginTop: 10 }}>
                        <Text>Variable 1</Text>
                        <Text>Variable 2</Text>
                        {/* Agrega más variables según sea necesario */}
                      </View>
                    )}
                  </Pressable>
                </Swipeable>
              )}
            />
          </View>
        )}
      </View>
      {/* Modal */}
      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={() => setIsModalVisible(false)}
          // onBackButtonPress={() => setIsModalVisible(false)}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Nombre del objeto"
              value={inputValue}
              onChangeText={setInputValue}
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={() => console.log('creado')}
                style={styles.createButton}
              >
                <Text style={styles.buttonText}>Crear</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </Portal>
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
  fieldContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: rMS(98),
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  fieldText: {
    textAlign: 'center',
    marginTop: rMS(2),
    fontSize: 16,
    fontFamily: 'Pro-Regular',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: '#3A5228',
    height: rMS(98),
    width: 68,
  },
  deleteButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: '#B82E2E',
    height: rMS(98),
    width: 68,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
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
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
