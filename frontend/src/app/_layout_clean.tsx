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
import { Platform, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import useAuthStore from '@/store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NetworkIndicator } from '@/components/NetworkIndicator';
import useSyncStore from '@/store/syncStore';
import SyncIndicator from '@/components/SyncIndicator';
import ErrorBoundary from '@/components/ErrorBoundary';
import { setupGlobalErrorHandler } from '@/utils/errorHandler';

// Ignorar advertencias específicas
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
  'SplashModule.internalMaybeHideAsync is not a function',
  'UNHANDLED PROMISE REJECTION: TypeError: SplashModule.internalMaybeHideAsync',
  'SplashScreen',
  'SplashModule',
]);

// Interceptar console.error para filtrar errores conocidos
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args.join(' ');
  
  // Ignorar errores específicos de SplashScreen
  if (message.includes('SplashModule') || 
      message.includes('internalMaybeHideAsync') ||
      message.includes('UNHANDLED PROMISE REJECTION: TypeError: SplashModule')) {
    console.log('Suprimiendo error conocido de SplashScreen');
    return;
  }
  
  // Para todos los demás errores, usar el console.error original
  originalConsoleError.apply(console, args);
};

const StackLayout = () => {
  const colorScheme = useColorScheme();
  const { fontsLoaded } = useLoadFonts();
  
  useEffect(() => {
    // No intentar ocultar el SplashScreen manualmente
  }, [fontsLoaded]);
  
  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PaperProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                statusBarStyle: Platform.OS === 'android' ? 'auto' : undefined,
                animation: Platform.OS === 'android' ? 'fade' : 'default',
                gestureEnabled: false,
                headerShown: false,
              }}
            >
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(protected)" options={{ headerShown: false }} />
              <Stack.Screen name="delete-account" />
              <Stack.Screen name="privacy-policy" />
              <Stack.Screen name="+not-found" />
            </Stack>
            
            {/* Indicadores globales */}
            <NetworkIndicator />
            <SyncIndicator />
          </SafeAreaView>
        </PaperProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default function RootLayout() {
  const { setPending } = useSyncStore();

  // Configuración mínima y limpia al iniciar
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting CLEAN app initialization...');
        
        // Solo configurar el error handler global
        setupGlobalErrorHandler();
        
        // Empezar con contadores en 0 (estado limpio)
        setPending(0);
        
        console.log('✅ Clean app initialization completed');
      } catch (error) {
        console.error('❌ Error during clean app initialization:', error);
      }
    };

    initializeApp();
  }, [setPending]);

  useLoadLanguage();
  useAuthRedirect();

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StackLayout />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

