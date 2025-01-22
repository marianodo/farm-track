import { Redirect } from 'expo-router';
import { Stack } from 'expo-router';
import useAuthStore from '@/store/authStore';

export default function rootLayout() {
  const a = '';
  const { verifiedToken, authLoading, authenticated } = useAuthStore(
    (state) => ({
      verifiedToken: state.verifiedToken,
      authLoading: state.authLoading,
      authenticated: state.authenticated,
    })
  );
  if (authenticated) {
    return <Redirect href="/(protected)/home" />;
  }

  return (
    <Stack>
      <Stack.Screen name="login/index" options={{ headerShown: false }} />
      <Stack.Screen name="register/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="recoveryPassword/index"
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen name="find-ride" options={{ headerShown: false }} />
      <Stack.Screen name="confirm-ride" options={{ headerShown: false }} />
      <Stack.Screen name="book-ride" options={{ headerShown: false }} /> */}
    </Stack>
  );
}
