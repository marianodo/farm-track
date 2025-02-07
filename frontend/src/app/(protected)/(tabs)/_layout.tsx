import { Button, Text } from 'react-native-paper';
import { Pressable, StyleSheet, View } from 'react-native';
import { rMS, rMV } from '@/styles/responsive';

import { Colors } from '@/constants/Colors';
import { Image } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@/store/authStore';
import { Redirect } from 'expo-router';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { verifiedToken, authLoading, authenticated } = useAuthStore(
    (state) => ({
      verifiedToken: state.verifiedToken,
      authLoading: state.authLoading,
      authenticated: state.authenticated,
    })
  );
  if (!authenticated) {
    return <Redirect href="/(root)/login" />;
  }
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarLabelStyle: {
            color: '#486732',
            fontSize: rMV(10), // Tamaño del texto
            fontFamily: 'Pro-Regular',
            fontWeight: 500, // Peso del texto
          },
          tabBarStyle: {
            height: rMV(66), // Aquí defines la altura deseada
            paddingBottom: rMS(5), // Ajusta el relleno para centrar el ícono si es necesario
            paddingTop: rMS(6),
          },
        }}
      >
        <Tabs.Screen
          name="home/index"
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('../../../../assets/images/tabs/field-selected.png')
                    : require('../../../../assets/images/tabs/field-unselected.png')
                }
                style={{ width: rMS(24), height: rMV(23) }}
                resizeMode="contain"
              />
            ),
          }}
        />
        {/* <Tabs.Screen
          name="(stack)"
          options={{
            href: null,
            title: t('tabs.home'),
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('../../../../assets/images/tabs/field-selected.png')
                    : require('../../../../assets/images/tabs/field-unselected.png')
                }
                style={{ width: rMS(24), height: rMV(23) }}
                resizeMode="contain"
              />
            ),
          }}
        /> */}
        {/* <Tabs.Screen name="createField" options={{ href: null }} /> */}
        <Tabs.Screen
          name="objects/index"
          options={{
            title: t('tabs.objects'),
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('../../../../assets/images/tabs/object-selected.png')
                    : require('../../../../assets/images/tabs/object-unselected.png')
                }
                style={{ width: rMS(24), height: rMV(23) }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="attributes/index"
          options={{
            headerShown: false,
            title: t('tabs.attributes'),
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('../../../../assets/images/tabs/variables-selected.png')
                    : require('../../../../assets/images/tabs/variables-unselected.png')
                }
                style={{ width: rMS(24), height: rMV(23) }}
                resizeMode="contain"
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    // flexDirection: 'row',
    height: '10%',
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
