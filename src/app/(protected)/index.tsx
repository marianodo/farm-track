import { Button, Text } from 'react-native-paper';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { authState, onLogout } = useAuth();
  const router = useRouter();

  const onLogoutPressed = () => {
    onLogout!();
  };

  return (
    <View style={styles.titleContainer}>
      <Text>Home</Text>
      <Text>Role: {authState?.role}</Text>
      <Pressable>
        <Text>aaaa</Text>
      </Pressable>
      <Button
        style={{}}
        onPress={onLogoutPressed}
        buttonColor="black"
        textColor="white"
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    // flexDirection: 'row',
    height: '100%',
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
