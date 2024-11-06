import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import useAuthStore from '@/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
};
