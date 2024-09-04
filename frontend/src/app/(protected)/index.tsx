import { Button, Text } from 'react-native-paper';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@/store/authStore';
import Loader from '@/components/Loader';
useAuthStore;

export default function HomeScreen() {
  const { onLogout, role, deleted, authLoading } = useAuthStore((state) => ({
    role: state.role,
    onLogout: state.onLogout,
    deleted: state.deleted,
    authLoading: state.authLoading,
  }));
  const { t } = useTranslation();
  const onLogoutPressed = () => {
    onLogout!();
  };

  if (authLoading) {
    return <Loader />;
  }

  return (
    <View style={styles.titleContainer}>
      <Text>Home</Text>
      <Text>Role: {role}</Text>
      <Pressable>
        <Text>{t('language')}</Text>
      </Pressable>
      <Button
        style={{}}
        onPress={onLogoutPressed}
        buttonColor="black"
        textColor="white"
      >
        Logout
      </Button>
      <Button
        style={{}}
        onPress={() => deleted('asdsadsad')}
        buttonColor="black"
        textColor="white"
      >
        Deleted
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
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
