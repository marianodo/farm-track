import 'react-native-reanimated';
import '@/i18n';

import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import {
  DefaultTheme as PaperDefaultTheme,
  PaperProvider,
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@/store/authStore';

SplashScreen.preventAutoHideAsync();

const StackLayout = () => {
  const { authenticated } = useAuthStore((state) => ({
    authenticated: state.authenticated,
  }));
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [loaded, error] = useFonts({
    'Pro-Regular': require('../../assets/fonts/Sf-Pro-Regular.otf'),
    'Pro-Bold': require('../../assets/fonts/Sf-Pro-Bold.otf'),
    // Asegúrate de que esta ruta sea correcta
    // 'Sf-Pro-Regular2': require('../../assets/fonts/Sf-Pro-Regular.otf'),
  });

  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        i18n.changeLanguage(savedLanguage);
      }
    };
    loadLanguage();
    console.log('authenticated use', authenticated);
    const inAuthGroup = segments[0] === '(protected)';
    if (!authenticated && inAuthGroup) {
      router.replace('/');
    } else if (authenticated === true) {
      router.replace('/(protected)');
    }
  }, [authenticated, router, segments, i18n]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PaperProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="recoveryPassword/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="register/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="(protected)" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaView>
      </PaperProvider>
    </ThemeProvider>
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StackLayout />
    </SafeAreaProvider>
  );
}
