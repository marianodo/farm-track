import * as Localization from 'expo-localization';

import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FormErrors, validateInput } from '@/utils/validation/validationUtils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { rMS, rS, rV } from '@/styles/responsive';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Language } from '@/components/Language';
import { Link } from 'expo-router';
import { TextInput } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useValidationRules } from '@/utils/validation/validationRules';

const { width, height } = Dimensions.get('window');
const Page = () => {
  const { required, minLength, email } = useValidationRules();
  interface FormData {
    email: string;
    password: string;
  }
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formModified, setFormModified] = useState(false);
  const [securePassword, setSecurePassword] = useState(true);
  const [language, setLanguage] = useState(
    Localization.getLocales()[0].languageTag
  );
  const { i18n, t } = useTranslation();
  const changeLanguage = async (lang: string) => {
    await AsyncStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };
  const scrollRef = useRef<KeyboardAwareScrollView>(null);

  const scrollToInput = (reactNode: any) => {
    if (reactNode) {
      scrollRef.current?.scrollToFocusedInput(reactNode);
    }
  };

  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');
  const { onLogin } = useAuth();

  const handleInputChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    setFormModified(true);
  };

  const handleBlur = (name: string) => {
    validateField(name);
  };

  const validateField = (name: string) => {
    const value = formData[name as keyof FormData];
    let fieldErrors: string[] | null = null;

    switch (name) {
      case 'email':
        fieldErrors = validateInput(value, [required, email], t);
        break;
      case 'password':
        fieldErrors = validateInput(value, [required, minLength(8)], t);
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: fieldErrors,
    }));
  };

  const handleSubmit = () => {
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      validateField(key); // Fuerza la validación de cada campo
    });
    const trimmedFormData: FormData = {
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    newErrors.email = validateInput(formData.email, [required, email], t);
    newErrors.password = validateInput(
      formData.password,
      [required, minLength(8)],
      t
    );
    if (!Object.values(newErrors).some((error) => error !== null)) {
      onLogin!(formData.email, formData.password);
      console.log('Formulario válido, enviar datos:', trimmedFormData);
      setFormModified(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Limpio los errores al volver al componente
      setErrors({});
      setFormModified(false);
    }, [])
  );

  useEffect(() => {
    if (formModified) {
      // Revalida todos los campos cuando cambie el idioma y el formulario haya sido modificado
      Object.keys(formData).forEach((key) => validateField(key));
    }
  }, [language, formModified]);

  console.log(language);
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      ref={scrollRef}
      contentInsetAdjustmentBehavior="always"
      scrollEnabled={true}
      enableAutomaticScroll={Platform.OS === 'ios'}
      extraHeight={rV(140)}
      extraScrollHeight={rV(140)}
    >
      <View style={styles.scrollViewContent}>
        <View style={styles.headerContainer}>
          <View style={styles.headerSubContainer}>
            <Image
              source={require('../../assets/images/login-bg-image.png')}
              style={styles.backgroundImage}
            />
            <Image
              source={require('../../assets/images/logo-farm.png')}
              style={styles.logo}
            />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{t('loginView.title')}</Text>
              <Text style={styles.title}>{t('loginView.title2')}</Text>
              <Text style={styles.subtitle}>{t('loginView.subtitle')}</Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.inputContainer,
            {
              marginBottom:
                errors.email &&
                errors.email[0] &&
                errors.password &&
                errors.password[0]
                  ? rS(60)
                  : rS(30),
            },
          ]}
        >
          <TextInput
            placeholder={t('loginView.emailPlaceHolder')}
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            style={styles.inputField}
            mode="outlined"
            autoCapitalize="none"
            activeOutlineColor="transparent"
            textColor="#486732"
            cursorColor="#486732"
            placeholderTextColor="#486732"
            outlineColor="#F1F1F1"
            onBlur={() => handleBlur('email')}
            onFocus={(event) => {
              scrollToInput(event.target);
            }}
            left={
              <TextInput.Icon
                icon="email"
                color="#486732"
                style={{
                  alignSelf: 'center',
                  alignContent: 'center',
                  alignItems: 'center',
                }}
              />
            }
          />
          {errors.email && (
            <Text
              style={{ color: 'red', textAlign: 'center', fontSize: rS(11) }}
            >
              {errors.email[0]}
            </Text>
          )}
          <TextInput
            placeholder={t('loginView.passwordPlaceHolder')}
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            secureTextEntry={securePassword}
            style={styles.inputField}
            mode="outlined"
            autoCapitalize="none"
            activeOutlineColor="transparent"
            textColor="#486732"
            cursorColor="#486732"
            underlineColor="#fff"
            placeholderTextColor="#486732"
            outlineColor="#F1F1F1"
            onBlur={() => handleBlur('password')}
            onFocus={(event) => {
              scrollToInput(event.target);
            }}
            left={<TextInput.Icon icon="lock" color="#486732" />}
            right={
              <TextInput.Icon
                onPress={() => setSecurePassword(!securePassword)}
                icon={securePassword ? 'eye' : 'eye-off'}
                color="#486732"
              />
            }
          />
          {errors.password && (
            <Text
              style={{ color: 'red', textAlign: 'center', fontSize: rS(11) }}
            >
              {errors.password[0]}
            </Text>
          )}
          <Link href="/recoveryPassword" style={styles.forgotPasswordText}>
            {t('loginView.forgotPasswordPlaceHolder')}
          </Link>
        </View>

        <View style={styles.formContainer}>
          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>{t('loginView.loginText')}</Text>
          </TouchableOpacity>
          <View style={styles.flagsContainer}>
            <Pressable
              onPress={() => changeLanguage('es-ES')}
              style={({ pressed }) => ({
                opacity: pressed || language === 'es-ES' ? 1 : 0.5,
              })}
            >
              <Image
                source={require('../../assets/flags/es_spain.png')}
                style={{ height: rS(36), width: rS(36) }}
              />
            </Pressable>
            <Pressable
              onPress={() => changeLanguage('en-US')}
              style={({ pressed }) => ({
                opacity: pressed || language === 'en-US' ? 1 : 0.5,
              })}
            >
              <Image
                source={require('../../assets/flags/united_kingdom.png')}
                style={{ height: rS(36), width: rS(36) }}
              />
            </Pressable>
          </View>
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              {t('loginView.noAccountText')}
            </Text>
            <Pressable
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <Link href="/register" style={styles.registerLink}>
                {t('loginView.signUpText')}
              </Link>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  headerContainer: {
    height: rS(272),
    width: '100%',
    position: 'relative',
    marginBottom: rMS(30),
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerSubContainer: {
    height: rS(300),
    width: width,
    top: rS(-70),
    paddingBottom: rV(25),
  },
  backgroundImage: {
    resizeMode: 'center',
    width: '100%',
    height: '100%',
  },
  logo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -rMS(50) }, { translateY: -rMS(-1) }],
    alignSelf: 'center',
    width: rMS(80),
    height: rMS(79.9),
  },
  titleContainer: {
    top: '84.6%',
    position: 'absolute',
    width: '100%',
  },
  title: {
    fontFamily: 'Pro-Regular',
    fontWeight: '700',
    fontSize: rMS(32),
    textAlign: 'center',
    lineHeight: rMS(37),
    color: '#486732',
  },
  subtitle: {
    fontFamily: 'Pro-Regular',
    fontSize: rMS(15),
    textAlign: 'center',
    lineHeight: rMS(38),
    fontWeight: '400',
    color: '#96A59A',
  },
  inputContainer: {
    height: rV(146),
  },
  formContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerText: {
    color: '#96A59A',
    fontFamily: 'Pro-Regular',
    fontSize: 16,
    marginTop: height * 0.01,
    marginBottom: height * 0.04,
    textAlign: 'center',
    fontWeight: '400',
  },
  inputField: {
    alignSelf: 'center',
    marginVertical: height * 0.01,
    width: width * 0.9,
    height: height * 0.07,
    borderWidth: 1,
    fontSize: width * 0.04,
    fontFamily: 'Pro-Regular',
    color: '#486732',
    borderColor: '#F1F1F1',
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
  },
  forgotPasswordText: {
    alignSelf: 'flex-end',
    color: '#486732',
    fontFamily: 'Pro-Regular',
    fontSize: width * 0.035,
    marginEnd: width * 0.1,
    marginTop: height * 0.01,
    marginBottom: height * 0.04,
    textAlign: 'right',
    fontWeight: '700',
  },
  button: {
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: height * 0.01,
    marginBottom: height * 0.03,
    alignItems: 'center',
    backgroundColor: '#486732',
    width: width * 0.9,
    height: height * 0.06,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  flagsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'center',
    gap: rS(10),
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 10,
    paddingBottom: rV(30),
  },
  registerText: {
    color: '#486732',
    fontFamily: 'Pro-Regular',
    fontSize: width * 0.04,
    fontWeight: '400',
  },
  registerLink: {
    color: '#486732',
    fontFamily: 'Pro-Regular',
    fontSize: width * 0.04,
    fontWeight: '700',
  },
});

export default Page;
