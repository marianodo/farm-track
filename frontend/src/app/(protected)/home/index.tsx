import { IconButton, Text } from 'react-native-paper';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  BackHandler,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { rMS, rMV, rS, rV } from '@/styles/responsive';
import useAuthStore from '@/store/authStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Swipeable } from 'react-native-gesture-handler';
import { typeOfProductionImages } from '@/utils/typeOfProductionImages/typeOfProductionImages';
import useFieldStore from '@/store/fieldStore';
import React, { Fragment, useEffect, useState } from 'react';
import useTypeOfObjectStore from '@/store/typeOfObjectStore';
import TwoButtonsModal from '@/components/modal/TwoButtonsModal';
import MessageModal from '@/components/modal/MessageModal';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedFieldDelete, setSelectedFieldDelete] = useState<{
    id: string;
  } | null>(null);
  const [texts, setTexts] = useState<{
    title: string;
    subtitle: string;
  } | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [messageModalText, setMessageModalText] = useState<string | null>(null);
  const [success, setSucces] = useState<boolean>(false);
  const { onLogout, userId, role, deleted, authLoading, userName } =
    useAuthStore((state) => ({
      role: state.role,
      userId: state.userId,
      userName: state.username,
      onLogout: state.onLogout,
      deleted: state.deleted,
      authLoading: state.authLoading,
    }));

  const { fieldLoading, fieldsByUserId, getFieldsByUser, onDelete } =
    useFieldStore((state) => ({
      fieldLoading: state.fieldLoading,
      fieldsByUserId: state.fieldsByUserId,
      getFieldsByUser: state.getFieldsByUser,
      onDelete: state.onDelete,
    }));

  const { t } = useTranslation();
  const onLogoutPressed = () => {
    onLogout!();
  };

  const deleteButtonAlert = async () => {
    if (selectedFieldDelete && selectedFieldDelete.id) {
      try {
        await onDelete(selectedFieldDelete.id); // Espera a que onDelete sea exitoso
        setShowModal(false); // Cierra el modal solo si no hubo errores
        setSucces(true);
        setShowMessageModal(true);
        setTimeout(() => {
          setShowMessageModal(false);
        }, 2000);
      } catch (error) {
        setShowModal(false);
        setSucces(false);
        setShowMessageModal(true);
        setTimeout(() => {
          setShowMessageModal(false);
        }, 2000);
        console.log('Error en deleteButtonAlert:', error);
      }
    }
  };

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
        onPress={() => {
          setSelectedFieldDelete({ id: field.id });
          setTexts({
            title: `¿${t('fieldView.deleteAlertTitle')} "${field.name}"?`,
            subtitle: `${t('fieldView.deleteAlertSubTitle')}`,
          });
          setShowModal(true);
        }}
      >
        <IconButton icon="trash-can-outline" iconColor="#fff" size={rMS(24)} />
        <Text style={styles.actionText}>{t(`fieldView.deleteButton`)}</Text>
      </Pressable>
    </View>
  );

  const { typeOfObjects, getAllTypeOfObjects } = useTypeOfObjectStore(
    (state: any) => ({
      typeOfObjects: state.typeOfObjects,
      getAllTypeOfObjects: state.getAllTypeOfObjects,
    })
  );

  useEffect(() => {
    if (fieldsByUserId === null) {
      getFieldsByUser(userId);
    }
  }, [fieldsByUserId, getFieldsByUser]);

  useEffect(() => {
    if (fieldsByUserId !== null && typeOfObjects === null) {
      getAllTypeOfObjects();
    }
  }, [typeOfObjects, getAllTypeOfObjects, fieldsByUserId]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp(); // Cierra la aplicación
        return true; // Prevenir el comportamiento por defecto
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Limpiamos el listener cuando el componente pierde el foco o se desmonta
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );

  return (
    <View style={styles.titleContainer}>
      {Platform.OS === 'ios' ? (
        <SafeAreaView style={styles.floatingButton}>
          <IconButton
            icon="plus"
            iconColor="#FFF"
            onPress={() => router.push('/createField')}
            size={rS(24)}
          />
        </SafeAreaView>
      ) : (
        <IconButton
          style={styles.floatingButton}
          icon="plus"
          iconColor="#FFF"
          onPress={() => router.push('/createField')}
          size={rS(24)}
        />
      )}
      {/* header */}
      <ImageBackground
        source={require('../../../../assets/images/tabs/tabs-header.png')}
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
              onPress={() => onLogoutPressed()}
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
              {t('fieldView.welcome')}
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
          {t('fieldView.fieldText')}
        </Text>
        {fieldLoading ? (
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
                {t('fieldView.dontFieldMessage')}
              </Text>
            </View>
          </View>
        ) : (
          /* contenido scroll */
          <View style={styles.spacer}>
            <FlatList
              style={{ paddingHorizontal: rMS(20), paddingTop: rMS(10) }}
              data={fieldsByUserId}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item: field, index }) => (
                <Swipeable
                  renderRightActions={(progress, dragX) =>
                    renderRightActions(progress, dragX, field)
                  }
                  containerStyle={{
                    backgroundColor: '#3A5228',
                    height: rMS(98),
                    marginBottom: 10,
                    borderRadius: 10,
                  }}
                >
                  <TouchableOpacity
                    key={index}
                    style={styles.fieldContainer}
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: `/pen/[fieldId]`,
                        params: {
                          fieldId: field.id,
                          fieldName: field.name,
                          withFields: 'false',
                          withObjects: 'true',
                        },
                      })
                    }
                  >
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
                        {field.name}
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
                        <Image
                          source={require('../../../../assets/images/map-marker.png')}
                          style={{
                            width: rMS(16),
                            height: rMS(16),
                            alignSelf: 'center',
                          }}
                          resizeMode="contain"
                        />
                        <Text
                          style={{ width: rS(158) }}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {field.location}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        width: rS(110),
                      }}
                    >
                      <Image
                        source={
                          typeOfProductionImages[
                            field?.production_type ?? 'defaultImage'
                          ]
                        }
                        style={{
                          width: rMS(44),
                          height: rMS(44),
                          alignSelf: 'center',
                        }}
                        resizeMode="contain"
                      />
                      <View>
                        <Text style={styles.fieldText}>
                          {field.production_type
                            ? t(`typeProductionText.${field.production_type}`)
                            : t(`typeProductionText.NoType`)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              )}
            />
          </View>
        )}
      </View>
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
});
