import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Language } from '@/components/Language';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const Page = () => {
  const { i18n, t } = useTranslation();
  const changeLanguage = async (lang: string) => {
    await AsyncStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { onLogin } = useAuth();

  const onSignInPress = async () => {
    onLogin!(username, password);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // style={{ justifyContent: 'center' }}
      >
        <KeyboardAwareScrollView>
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/images/login-bg-image.png')}
              style={styles.backgroundImage}
            />
            <Image
              source={require('../../assets/images/logo-farm.png')}
              style={styles.logo}
            />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Bienvenido</Text>
              <Text style={styles.subtitle}>a FarmTrack</Text>
              <Text style={styles.headerText}>Inicia sesión en tu cuenta</Text>
            </View>
          </View>
          <View style={styles.formContainer}>
            <TextInput
              autoCapitalize="none"
              placeholder="Correo electrónico"
              value={username}
              onChangeText={setUsername}
              style={styles.inputField}
            />
            <TextInput
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.inputField}
            />
            <Text style={styles.forgotPasswordText}>
              ¿Olvidaste tu contraseña?
            </Text>
            <TouchableOpacity onPress={onSignInPress} style={styles.button}>
              <Text style={styles.buttonText}>{t('loginView.login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => changeLanguage('en-US')}
              style={styles.button}
            >
              <Text style={styles.buttonText}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => changeLanguage('es-ES')}
              style={styles.button}
            >
              <Text style={styles.buttonText}>ES</Text>
            </TouchableOpacity>
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                ¿Aun no tienes una cuenta?
              </Text>
              <Text style={styles.registerLink}>Registrarse</Text>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    height: '100%',
  },
  headerContainer: {
    // backgroundColor: 'blue',
    alignItems: 'center',
    height: height * 0.4, // Altura ajustada para adaptarse a diferentes tamaños de pantalla
  },
  backgroundImage: {
    // backgroundColor: 'red',
    width: '100%',
    height: 273, // Altura ajustada para adaptarse a diferentes tamaños de pantalla
    position: 'relative',
  },
  logo: {
    position: 'absolute',
    width: 80, // Ancho relativo al ancho de la pantalla
    height: 80, // Altura relativa a la altura de la pantalla
    marginTop: height * 0.15, // Margen superior relativo a la altura de la pantalla
  },
  titleContainer: {
    // backgroundColor: 'green',
    position: 'absolute',
    width: width * 0.5, // Ancho relativo al ancho de la pantalla
    height: height * 0.1, // Altura relativa a la altura de la pantalla
    marginTop: height * 0.238,
  },
  title: {
    fontFamily: 'Pro-Regular',
    fontWeight: '700',
    fontSize: height * 0.04, // Tamaño de fuente relativo al ancho de la pantalla
    textAlign: 'center',
    lineHeight: height * 0.05, // Altura de línea relativa a la altura de la pantalla
    marginTop: height * 0.04, // Margen superior relativo a la altura de la pantalla
    color: '#486732',
  },
  subtitle: {
    fontSize: 34, // Tamaño de fuente relativo al ancho de la pantalla
    textAlign: 'center',
    lineHeight: height * 0.05, // Altura de línea relativa a la altura de la pantalla
    fontFamily: 'Pro-Regular',
    fontWeight: '700',
    color: '#486732',
  },
  formContainer: {
    marginTop: height * 0.06, // Margen superior relativo a la altura de la pantalla
    paddingBottom: height * 0.01,
  },
  headerText: {
    color: '#96A59A',
    fontFamily: 'Pro-Regular',
    fontSize: 16, // Tamaño de fuente relativo al ancho de la pantalla
    marginTop: height * 0.01, // Margen superior relativo a la altura de la pantalla
    marginBottom: height * 0.04, // Margen inferior relativo a la altura de la pantalla
    textAlign: 'center',
    fontWeight: '400',
  },
  inputField: {
    alignSelf: 'center',
    marginVertical: height * 0.01, // Margen vertical relativo a la altura de la pantalla
    width: width * 0.9, // Ancho relativo al ancho de la pantalla
    height: height * 0.06, // Altura relativa a la altura de la pantalla
    borderWidth: 1,
    fontSize: width * 0.04, // Tamaño de fuente relativo al ancho de la pantalla
    fontFamily: 'Pro-Regular',
    color: '#486732',
    borderColor: '#F1F1F1',
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
    padding: 10,
  },
  forgotPasswordText: {
    color: '#486732',
    fontFamily: 'Pro-Regular',
    fontSize: width * 0.035, // Tamaño de fuente relativo al ancho de la pantalla
    marginEnd: width * 0.1, // Margen final relativo al ancho de la pantalla
    marginTop: height * 0.01, // Margen superior relativo a la altura de la pantalla
    marginBottom: height * 0.04, // Margen inferior relativo a la altura de la pantalla
    textAlign: 'right',
    fontWeight: '700',
  },
  button: {
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: height * 0.01, // Margen superior relativo a la altura de la pantalla
    marginBottom: height * 0.03, // Margen inferior relativo a la altura de la pantalla
    alignItems: 'center',
    backgroundColor: '#486732',
    width: width * 0.9, // Ancho relativo al ancho de la pantalla
    height: height * 0.06, // Altura relativa a la altura de la pantalla
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 10,
  },
  registerText: {
    color: '#486732',
    fontFamily: 'Pro-Regular',
    fontSize: width * 0.04, // Tamaño de fuente relativo al ancho de la pantalla
    fontWeight: '400',
  },
  registerLink: {
    color: '#486732',
    fontFamily: 'Pro-Regular',
    fontSize: width * 0.04, // Tamaño de fuente relativo al ancho de la pantalla
    fontWeight: '700',
  },
});

export default Page;
