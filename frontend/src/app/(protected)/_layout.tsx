import { Stack } from 'expo-router';

export default function stackLayout() {
  return (
    <Stack>
      <Stack.Screen name="(stack)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }} // Puedes personalizar el header
      />
    </Stack>
  );
}
