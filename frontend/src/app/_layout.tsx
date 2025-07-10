import 'react-native-reanimated';
import '@/i18n';
import { useLoadFonts } from '@/hooks/useLoadFonts';
import { useLoadLanguage } from '@/hooks/useLoadLanguage';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import useAuthStore from '@/store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NetworkIndicator } from '@/components/NetworkIndicator';

// SplashScreen.preventAutoHideAsync();
const StackLayout = () => {
  //Estoy protegiendo las rutas.

  const colorScheme = useColorScheme();
  const { fontsLoaded } = useLoadFonts();
  useEffect(() => {
    if (fontsLoaded) {
      //   SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PaperProvider>
          <SafeAreaView style={{ flex: 1 }}>
            {/* <StatusBar style={'light'} /> */}
            <Stack
              screenOptions={{
                // statusBarBackgroundColor:
                //   colorScheme === 'dark' ? undefined : undefined,
                statusBarStyle: Platform.OS === 'android' ? 'auto' : undefined,
                animation: Platform.OS === 'android' ? 'fade' : 'default', // Cambia la animación
                gestureEnabled: false,
                presentation:
                  Platform.OS === 'android' ? 'transparentModal' : undefined,
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="(protected)"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(root)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            
            {/* Indicador de red global */}
            <NetworkIndicator />
          </SafeAreaView>
        </PaperProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StackLayout />
    </SafeAreaProvider>
  );
}
