import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import useAuthStore from '@/store/authStore';

const Index = () => {
  const { verifiedToken, authLoading, authenticated, initializedToken } =
    useAuthStore((state) => ({
      verifiedToken: state.verifiedToken,
      authLoading: state.authLoading,
      authenticated: state.authenticated,
      initializedToken: state.initializedToken,
    }));

  useEffect(() => {
    initializedToken();
  }, [authenticated]);

  if (authLoading) {
    return null; // Aca se podria poner un loader.
  }

  if (!authenticated) {
    return <Redirect href="/(root)/login" />;
  }

  return <Redirect href="/(protected)/(tabs)/home" />;
};

export default Index;
