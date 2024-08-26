import * as Localization from 'expo-localization';

import {
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useRef, useState } from 'react';
import { rMS, rMV, rS, rV } from '@/styles/responsive';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Link } from 'expo-router';
import { TextInput } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const RegisterView = () => {
  const [securePassword, setSecurePassword] = useState(true);
  const { t } = useTranslation();

  const scrollRef = useRef<KeyboardAwareScrollView>(null);

  const scrollToInput = (reactNode: any) => {
    if (reactNode) {
      scrollRef.current?.scrollToFocusedInput(reactNode);
    }
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSignInPress = async () => {
    alert('Ok');
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
          <Image
            source={require('../../../assets/images/logo-farm.png')}
            style={styles.logo}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t('registerView.title')}</Text>
            <Text style={styles.subtitle}>{t('registerView.subtitle')}</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder={t('registerView.namePlaceHolder')}
            value={username}
            onChangeText={setUsername}
            style={styles.inputField}
            mode="outlined"
            autoCapitalize="none"
            activeOutlineColor="transparent"
            textColor="#486732"
            cursorColor="#486732"
            placeholderTextColor="#486732"
            outlineColor="#F1F1F1"
            onFocus={(event) => {
              scrollToInput(event.target);
            }}
            left={
              <TextInput.Icon
                icon="account"
                color="#486732"
                style={{
                  alignSelf: 'center',
                  alignContent: 'center',
                  alignItems: 'center',
                }}
              />
            }
          />
          <TextInput
            placeholder={t('registerView.emailPlaceHolder')}
            value={password}
            onChangeText={setPassword}
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
            onFocus={(event) => {
              scrollToInput(event.target);
            }}
            left={<TextInput.Icon icon="email" color="#486732" />}
            right={
              <TextInput.Icon
                onPress={() => setSecurePassword(!securePassword)}
                icon={securePassword ? 'eye' : 'eye-off'}
                color="#486732"
              />
            }
          />
          <TextInput
            placeholder={t('registerView.passwordPlaceHolder')}
            value={password}
            onChangeText={setPassword}
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
          <TextInput
            placeholder={t('registerView.confirmPasswordPlaceHolder')}
            value={password}
            onChangeText={setPassword}
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
        </View>

        <View style={styles.formContainer}>
          <TouchableOpacity onPress={onSignInPress} style={styles.button}>
            <Text style={styles.buttonText}>
              {t('registerView.signUpText')}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              {t('registerView.alreadyHaveAccountText')}
            </Text>
            <Pressable
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <Link href="/" style={styles.registerLink}>
                {t('registerView.loginText')}
              </Link>
            </Pressable>
          </View>
          <ImageBackground
            source={require('../../../assets/images/register-bg-image.jpg')}
            resizeMode="cover"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              right: 0,
              top: 10,
              zIndex: -1,
            }}
          />
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
    display: 'flex',
    height: rV(215),
    width: '100%',
    alignItems: 'center',
    gap: rMV(20),
  },

  backgroundImage: {
    resizeMode: 'center',
    width: '100%',
    height: '100%',
  },
  logo: {
    marginTop: rMV(30),
    alignSelf: 'center',
    width: rMS(80),
    height: rMS(79.9),
  },
  titleContainer: {
    display: 'flex',
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
    lineHeight: rMS(28),
    fontWeight: '400',
    color: '#96A59A',
  },
  inputContainer: {
    height: rV(254),
    marginTop: rMV(6),
  },
  formContainer: {
    position: 'relative',
    zIndex: 1,
    marginTop: rMV(2),
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

export default RegisterView;
