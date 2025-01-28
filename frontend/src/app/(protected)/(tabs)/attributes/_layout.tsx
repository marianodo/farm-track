import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const AttributesLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="create/index"
            options={{ headerShown: false, title: 'Create Attribute' }}
          />
          <Stack.Screen
            name="edit/[attributeId]"
            options={{ headerShown: false }} // Puedes personalizar el header
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default AttributesLayout;
