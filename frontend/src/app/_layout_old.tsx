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
import { initOffline } from '@/offline';
import useSyncStore from '@/store/syncStore';
import SyncIndicator from '@/components/SyncIndicator';
import { warmUpMeasurementData } from '@/offline/warmup';
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

// Configurar manejador global de errores
setupGlobalErrorHandler();

// Interceptar console.error para filtrar errores específicos
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

// No usar SplashScreen aquí ya que está causando errores
// SplashScreen.preventAutoHideAsync();
const StackLayout = () => {
  //Estoy protegiendo las rutas.

  const colorScheme = useColorScheme();
  const { fontsLoaded } = useLoadFonts();
  useEffect(() => {
    // No intentar ocultar el SplashScreen manualmente
    // El sistema lo ocultará automáticamente
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
            <SyncIndicator />
          </SafeAreaView>
        </PaperProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default function RootLayout() {
  const { setPending, setSyncing } = useSyncStore();
  const userId = useAuthStore((s) => s.userId);
  const loadOfflineMeasurementsFromStorage = useReportStore((s) => s.loadOfflineMeasurementsFromStorage);

  // Cargar estado offline al iniciar la aplicación
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Verificar si hubo algún error crítico en el último reinicio
        const lastError = await getLastCriticalError();
        if (lastError) {
          Alert.alert(
            '🚨 Error Crítico Detectado',
            `La aplicación se reinició debido a un error:\n\n${lastError.error}\n\nTime: ${new Date(lastError.timestamp).toLocaleString()}`,
            [
              { text: 'OK', onPress: () => console.log('Critical error alert dismissed') }
            ]
          );
        }
        
        // Cargar estado de sincronización previo
        const savedSyncState = await loadSyncState();
        if (savedSyncState) {
          setPending(savedSyncState.pendingCount);
          setSyncing(savedSyncState.syncing);
          console.log('Restored sync state:', savedSyncState);
        }

        // Cargar mediciones offline
        await loadOfflineMeasurementsFromStorage();
        
        // Forzar carga del token de autenticación
        console.log('Forcing auth token load at app start...');
        const token = await forceLoadToken();
        console.log('Auth token loaded at startup:', token ? 'Success' : 'Failed');

        // Inicializar offline mode
        initOffline(() => process.env.EXPO_PUBLIC_API_URL || '', (syncing, pending) => {
          try {
            setSyncing(syncing);
            setPending(pending);
            
            // Persistir estado de sincronización
            saveSyncState({
              pendingCount: pending,
              syncing: syncing,
              lastSync: new Date().toISOString()
            }).catch(e => console.error('Error saving sync state:', e));
          } catch (e) {
            console.error('Error updating sync state:', e);
          }
        });
      } catch (e) {
        console.error('Error initializing app:', e);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (userId) {
      try {
        warmUpMeasurementData().catch(e => {
          console.error('Error warming up measurement data:', e);
        });
      } catch (e) {
        console.error('Error in warmUpMeasurementData:', e);
      }
    }
  }, [userId]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StackLayout />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
