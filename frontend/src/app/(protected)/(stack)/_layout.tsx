import { Stack } from 'expo-router';

export default function stackLayout() {
  return (
    <Stack>
      <Stack.Screen name="createField/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="editField/[id]"
        options={{ headerShown: false }} // Puedes personalizar el header
      />
      <Stack.Screen name="pen/[fieldId]" options={{ headerShown: false }} />
      <Stack.Screen name="report/[reportId]" options={{ headerShown: false }} />
      <Stack.Screen
        name="pen/createPen/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="attributes/create/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="attributes/edit/[attributeId]"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="report/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="report/createReport/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="pen/editPen/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="pen/editTypeObject/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="pen/editVariable/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="report/editReport/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="measurement/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="measurement/createMeasurement/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="measurement/editMeasurement/index"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
