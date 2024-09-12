import { IconButton, Text, TextInput } from 'react-native-paper';
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
  ImageBackground,
} from 'react-native';
import { rMS, rV } from '@/styles/responsive';
import Loader from '@/components/Loader';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function HomeScreen() {
  const router = useRouter();
  const { onLogout, authLoading, userName } = useAuthStore((state) => ({
    userName: state.username,
    onLogout: state.onLogout,
    authLoading: state.authLoading,
  }));
  const { t } = useTranslation();

  if (authLoading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {/* header */}
      <ImageBackground
        source={require('../../../assets/images/tabs/tabs-header.png')}
        style={styles.header}
        resizeMode="cover"
      >
        <View style={styles.headerContent}>
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
            <Text style={styles.greeting}>Volver</Text>
          </View>
          <View>
            <Text style={styles.welcome}>{t('fieldView.welcome')}</Text>
          </View>
        </View>
      </ImageBackground>

      {/* contenedor contenido campo */}
      <View style={styles.contentContainer}>
        <Text style={styles.fieldTitle}>{t('fieldView.fieldText')}</Text>

        {/* Usar KeyboardAwareScrollView para manejar inputs y teclado */}
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          style={{ flex: 1 }}
          extraScrollHeight={20}
        >
          <View style={styles.formContainer}>
            {/* Aquí los TextInputs */}
            {[...Array(10)].map((_, index) => (
              <TextInput
                key={index}
                placeholder={`Input ${index + 1}`}
                style={styles.input}
              />
            ))}
          </View>
        </KeyboardAwareScrollView>

        {/* Botón fijo */}
        <View style={styles.fixedButtonContainer}>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Crear campo</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: rV(174),
    width: '100%',
  },
  headerContent: {
    // justifyContent: 'flex-end',
    // height: '50%',
  },
  greeting: {
    color: '#fff',
    fontFamily: 'Pro-Regular',
    fontSize: rMS(13.6),
    marginRight: 200,
  },
  welcome: {
    marginLeft: 20,
    color: '#fff',
    fontFamily: 'Pro-Regular',
    fontSize: 22,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 54,
    borderTopRightRadius: 54,
    marginTop: -50,
  },
  fieldTitle: {
    textAlign: 'center',
    marginTop: rMS(10),
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Pro-Regular',
  },
  scrollContent: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 40,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  fixedButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20, // Añadir espacio debajo del botón
  },
  button: {
    width: '100%',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#486732',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: rMS(16),
    color: 'white',
    fontFamily: 'Pro-Regular',
  },
});
