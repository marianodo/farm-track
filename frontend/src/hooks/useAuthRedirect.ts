import React, { useEffect } from 'react';
import { useFocusEffect, useRouter, useSegments } from 'expo-router';
import useAuthStore from '@/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler } from 'react-native';
export const useAuthRedirect = () => {
  const { token } = useAuthStore((state) => ({
    token: state.token,
  }));
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    const inAuthGroup =
      segments[0] === '(protected)' ||
      segments[0] === 'createField' ||
      segments[0] === 'editField' ||
      segments[0] === 'pen' ||
      segments[0] === 'report' ||
      segments[0] === 'measurement';
    if (token == null && inAuthGroup) {
      router.replace('/');
    } else if (token !== null && !inAuthGroup) {
      router.replace('/home');
    }
  }, [token, router, segments]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (segments[1] === 'home') {
          // Cerramos la app solo si estamos en home
          BackHandler.exitApp();
          return true; // Prevenimos el comportamiento predeterminado
        } else {
          // Si no estamos en home, volvemos atrás
          router.back();
          return true; // Prevenimos el comportamiento predeterminado
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Limpiamos el listener cuando el componente pierde el foco o se desmonta
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );
};
