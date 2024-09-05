import { Button, Text } from 'react-native-paper';
import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { rMS, rMV } from '@/styles/responsive';
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
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
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../../../assets/images/tabs/field-selected.png')
                  : require('../../../assets/images/tabs/field-unselected.png')
              }
              style={{ width: rMS(24), height: rMV(23) }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="objects/index"
        options={{
          title: 'Objects',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../../../assets/images/tabs/object-selected.png')
                  : require('../../../assets/images/tabs/object-unselected.png')
              }
              style={{ width: rMS(24), height: rMV(23) }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="variables/index"
        options={{
          title: 'Variables',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../../../assets/images/tabs/variables-selected.png')
                  : require('../../../assets/images/tabs/variables-unselected.png')
              }
              style={{ width: rMS(24), height: rMV(23) }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
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
