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
import React, { useRef, useState } from 'react';
import { rMS, rS, rV } from '@/styles/responsive';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Link } from 'expo-router';
import { TextInput } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useValidationRules } from '@/utils/validation/validationRules';

const { width, height } = Dimensions.get('window');

const Page = () => {
  const { required, minLength, matchPassword } = useValidationRules();
  interface FormData {
    password: string;
    confirmPassword: string;
  }
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: '',
  });
  const [securePassword1, setSecurePassword1] = useState(true);
  const [securePassword2, setSecurePassword2] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const { t } = useTranslation();

  const scrollRef = useRef<KeyboardAwareScrollView>(null);

  const scrollToInput = (reactNode: any) => {
    if (reactNode) {
      scrollRef.current?.scrollToFocusedInput(reactNode);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleBlur = (name: string) => {
    validateField(name);
  };

  const validateField = (name: string) => {
    const value = formData[name as keyof FormData];
    let fieldErrors: string[] | null = null;

    switch (name) {
      case 'password':
        fieldErrors = validateInput(value, [required, minLength(8)], t);
        break;
      case 'confirmPassword':
        fieldErrors = validateInput(
          value,
          [required, matchPassword(formData.password)],
          t
        );
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
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim(),
    };

    newErrors.password = validateInput(
      formData.password,
      [required, minLength(8)],
      t
    );
    newErrors.confirmPassword = validateInput(
      formData.confirmPassword,
      [required, matchPassword(formData.password)],
      t
    );
    if (!Object.values(newErrors).some((error) => error !== null)) {
      return alert('ok');
    }
    alert('ops!');
  };

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
              source={require('../../../../assets/images/login-bg-image.png')}
              style={styles.backgroundImage}
            />
            <Image
              source={require('../../../../assets/images/logo-farm.png')}
              style={styles.logo}
            />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                {t('recoveryPasswordView.title')}
              </Text>
              <Text style={styles.title}>
                {t('recoveryPasswordView.title2')}
              </Text>
              <Text style={styles.subtitle}>
                {t('recoveryPasswordView.subtitle')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder={t('recoveryPasswordView.newPasswordPlaceHolder')}
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            onBlur={() => handleBlur('password')}
            secureTextEntry={securePassword1}
            style={styles.inputField}
            mode="outlined"
            autoCapitalize="none"
            activeOutlineColor="transparent"
            textColor="#486732"
            cursorColor="#486732"
            underlineColor="#fff"
            placeholderTextColor="#486732"
            selectionColor={Platform.OS == 'ios' ? '#486732' : '#9cdfa3'}
            selectionHandleColor="#486732"
            outlineColor="#F1F1F1"
            onFocus={(event) => {
              scrollToInput(event.target);
            }}
            left={<TextInput.Icon icon="lock" color="#486732" />}
            right={
              <TextInput.Icon
                onPress={() => setSecurePassword1(!securePassword1)}
                icon={securePassword1 ? 'eye' : 'eye-off'}
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
          <TextInput
            placeholder={t(
              'recoveryPasswordView.ConfirmNewPasswordPlaceHolder'
            )}
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
            onBlur={() => handleBlur('confirmPassword')}
            secureTextEntry={securePassword2}
            style={styles.inputField}
            mode="outlined"
            autoCapitalize="none"
            activeOutlineColor="transparent"
            textColor="#486732"
            cursorColor="#486732"
            underlineColor="#fff"
            placeholderTextColor="#486732"
            selectionColor={Platform.OS == 'ios' ? '#486732' : '#9cdfa3'}
            selectionHandleColor="#486732"
            outlineColor="#F1F1F1"
            onFocus={(event) => {
              scrollToInput(event.target);
            }}
            left={<TextInput.Icon icon="lock" color="#486732" />}
            right={
              <TextInput.Icon
                onPress={() => setSecurePassword2(!securePassword2)}
                icon={securePassword2 ? 'eye' : 'eye-off'}
                color="#486732"
              />
            }
          />
          {errors.confirmPassword && (
            <Text
              style={{ color: 'red', textAlign: 'center', fontSize: rS(11) }}
            >
              {errors.confirmPassword[0]}
            </Text>
          )}
        </View>

        <View style={styles.formContainer}>
          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>
              {t('recoveryPasswordView.ChangePasswordText')}
            </Text>
          </TouchableOpacity>
          <Pressable
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Link href="/login" style={styles.registerLink}>
              {t('recoveryPasswordView.BackToStartText')}
            </Link>
          </Pressable>
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
    marginBottom: rMS(30),
  },
  formContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'center',
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
