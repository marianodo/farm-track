import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';

import { useAuth } from '../context/AuthContext';

const Page = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const { onLogin } = useAuth();

  const onSignInPress = async () => {
    onLogin!(username, password);
  };

  const onUserSignInPress = async () => {
    onLogin!('user', 'user');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.header}>Puto</Text>
      <TextInput
        autoCapitalize="none"
        placeholder="admin"
        value={username}
        onChangeText={setUsername}
        style={styles.inputField}
      />
      <TextInput
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.inputField}
      />

      <TouchableOpacity onPress={onSignInPress} style={styles.button}>
        <Text style={{ color: '#fff' }}>Sign in</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onUserSignInPress} style={styles.button}>
        <Text style={{ color: '#fff' }}>Sign in as user</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingHorizontal: '20%',
    justifyContent: 'center',
  },
  header: {
    color: '#fff',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputField: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    color: '#fff',
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
  },
  button: {
    marginVertical: 15,
    alignItems: 'center',
    backgroundColor: '#111233',
    padding: 12,
    borderRadius: 4,
  },
});
export default Page;
