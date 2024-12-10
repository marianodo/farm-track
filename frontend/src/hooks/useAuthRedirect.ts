import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
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

  useEffect(() => {
    const backAction = () => {
      if (segments[1] === 'home') {
        // cerramos la app solo si estamos en home
        BackHandler.exitApp();
        return true; // para prevenir el comportamiento predeterminado
      } else {
        // Si no estoy en home vuelve para atras
        router.back();
        return true; // para prevenir el comportamiento predeterminado
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    // Limpiamos el listener cuando el componente se desmonte
    return () => {
      backHandler.remove();
    };
  }, [segments, router]);
};
