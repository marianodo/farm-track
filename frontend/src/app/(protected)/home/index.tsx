import { IconButton, Text } from 'react-native-paper';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { rMS, rMV, rS, rV } from '@/styles/responsive';
import Loader from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Swipeable } from 'react-native-gesture-handler';

export default function HomeScreen() {
  const router = useRouter();
  const { onLogout, role, deleted, authLoading, userName } = useAuthStore(
    (state) => ({
      role: state.role,
      userName: state.username,
      onLogout: state.onLogout,
      deleted: state.deleted,
      authLoading: state.authLoading,
    })
  );
  const { t } = useTranslation();
  const onLogoutPressed = () => {
    onLogout!();
  };

  const deleteBUttonAlert = () =>
    Alert.alert(
      '¿Desea eliminar el "Campo Maravilla"?',
      'Si elimina este campo, se borraran todos los corrales y reportes relacionados. Esta acción no se puede deshacer',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]
    );

  const renderRightActions = (progress: any, dragX: any, field: any) => (
    <View style={styles.rightActions}>
      <Pressable style={styles.editButton} onPress={() => console.log(field)}>
        <IconButton icon="pencil-outline" iconColor="#fff" size={rMS(24)} />
        <Text style={styles.actionText}>Editar</Text>
      </Pressable>
      <Pressable style={styles.deleteButton} onPress={deleteBUttonAlert}>
        <IconButton icon="trash-can-outline" iconColor="#fff" size={rMS(24)} />
        <Text style={styles.actionText}>Eliminar</Text>
      </Pressable>
    </View>
  );

  if (authLoading) {
    return <Loader />;
  }

  const fields = [
    {
      name: 'Campo A',
      locality: 'Localidad 1',
      typeOfProduction: 'bovina_carne',
    },
    {
      name: 'Campo B',
      locality: 'Localidad 2',
      typeOfProduction: 'bovina_leche',
    },
    {
      name: 'Campo C',
      locality: 'Localidad 3',
      typeOfProduction: 'porcina',
    },
    {
      name: 'Campo D',
      locality: 'Localidad 3',
      typeOfProduction: 'avicola_broile',
    },
    {
      name: 'Campo F',
      locality: 'Localidad 3',
      typeOfProduction: 'avicola_postura',
    },
    {
      name: 'Campo G',
      locality: 'Localidad 3',
      typeOfProduction: 'customizada',
    },
  ];

  const typeOfProductionImages: Record<string, any> = {
    bovina_carne: require('../../../../assets/images/typeOfProduction/bovina_carne.png'),
    bovina_leche: require('../../../../assets/images/typeOfProduction/bovina_leche.png'),
    porcina: require('../../../../assets/images/typeOfProduction/porcina.png'),
    avicola_broile: require('../../../../assets/images/typeOfProduction/avicola.png'),
    avicola_postura: require('../../../../assets/images/typeOfProduction/avicola_postura.png'),
    customizada: require('../../../../assets/images/typeOfProduction/custom_option.png'),
  };

  return (
    <View style={styles.titleContainer}>
      <IconButton
        style={styles.floatingButton}
        icon="plus"
        iconColor="#FFF"
        onPress={() => router.push('/createField')}
        size={rS(24)}
      />
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
              onPress={() => console.log('Pressed')}
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
        {!fields.length ? (
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
                Aún no has creado ningún campo.Por favor,añade uno desde el
                boton'+'para comenzar.
              </Text>
            </View>
          </View>
        ) : (
          /* contenido scroll */
          <View style={styles.spacer}>
            <FlatList
              style={{ paddingHorizontal: rMS(20), paddingTop: rMS(10) }}
              data={fields}
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
                  <View key={index} style={styles.fieldContainer}>
                    <View
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 18,
                          fontWeight: 'bold',
                          fontFamily: 'Pro-Regular',
                        }}
                      >
                        Nombre: {field.name}
                      </Text>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          gap: rMS(12),
                          marginBottom: rMS(12),
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
                        <Text>{field.locality}</Text>
                      </View>
                    </View>
                    <View style={{ width: rS(120) }}>
                      <Image
                        source={typeOfProductionImages[field.typeOfProduction]}
                        style={{
                          width: rMS(48),
                          height: rMS(48),
                          alignSelf: 'center',
                        }}
                        resizeMode="contain"
                      />
                      <View>
                        <Text style={styles.fieldText}>
                          {field.typeOfProduction}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Swipeable>
              )}
            />
          </View>
        )}
      </View>
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
    fontSize: 16,
    fontFamily: 'Pro-Regular',
  },
  floatingButton: {
    position: 'relative',
    fontWeight: 'bold',
    zIndex: 1,
    bottom: 200,
    right: 160,
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