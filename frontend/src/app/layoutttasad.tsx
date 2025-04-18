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
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Entypo from '@expo/vector-icons/Entypo';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
// SplashScreen.setOptions({
//   duration: 1000,
//   fade: true,
// });

const StackLayout = () => {
  const { fontsLoaded } = useLoadFonts();
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync(Entypo.font);
        // Artificially delay for two seconds to simulate a slow loading
        // experience. Remove this if you copy and paste the code!
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // if (appIsReady) {
  useAuthRedirect();
  useLoadLanguage();
  // }
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
              <Stack.Screen
                name="recoveryPassword/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="register/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="editField/[id]"
                options={{ headerShown: false }} // Puedes personalizar el header
              />
              <Stack.Screen
                name="pen/[fieldId]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="pen/editPen/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="pen/createPen/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="pen/editVariable/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="pen/editTypeObject/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="report/[reportId]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="report/createReport/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="report/editReport/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="measurement/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="measurement/editMeasurement/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="measurement/createMeasurement/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="createField/index"
                options={{ headerShown: false }}
              />
            </Stack>
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
