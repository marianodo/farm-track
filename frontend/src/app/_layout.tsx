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
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image, StyleSheet, View } from 'react-native';
import useAuthStore from '@/store/authStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
const StackLayout = () => {
  const { fontsLoaded } = useLoadFonts();
  const colorScheme = useColorScheme();

  useLoadLanguage();

  useAuthRedirect();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PaperProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Stack>
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
