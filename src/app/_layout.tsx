import 'react-native-reanimated';

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

import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

const StackLayout = () => {
  const [loaded, error] = useFonts({
    'Pro-Regular': require('../../assets/fonts/Sf-Pro-Regular.otf'),
    'Pro-Bold': require('../../assets/fonts/Sf-Pro-Bold.otf'),
    // Asegúrate de que esta ruta sea correcta
    // 'Sf-Pro-Regular2': require('../../assets/fonts/Sf-Pro-Regular.otf'),
  });

  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { authState } = useAuth();

  useEffect(() => {
    console.log('authState', authState);
    const inAuthGroup = segments[0] === '(protected)';
    if (!authState?.authenticated && inAuthGroup) {
      router.replace('/');
    } else if (authState?.authenticated === true) {
      router.replace('/(protected)');
    }
  }, [authState, router, segments]);

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
      <AuthProvider>
        <StackLayout />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
