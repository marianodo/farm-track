import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

export const useLoadFonts = () => {
  const [fontsLoaded, fontsError] = useFonts({
    'Pro-Regular': require('../../assets/fonts/Sf-Pro-Regular.otf'),
    'Pro-Bold': require('../../assets/fonts/Sf-Pro-Bold.otf'),
    'Pro-Medium': require('../../assets/fonts/Sf-Pro-Medium.otf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  return { fontsLoaded, fontsError };
};
