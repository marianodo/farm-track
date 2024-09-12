import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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

  const onSearchError = React.useCallback((error: PlacesError) => {
    console.log(error);
  }, []);

  const onPlaceSelected = React.useCallback((place: PlaceDetails) => {
    console.log(place);
  }, []);
  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ flexGrow: 1 }}
    >
      <GooglePlacesAutocomplete
        placeholder="Pickup"
        minLength={1}
        styles={{ height: 10 }}
        onFail={(err) => console.error(err)}
        fetchDetails={true}
        disableScroll={true}
        // listViewDisplayed=""
        onPress={(data, details = true) => {
          console.log('data: ', data, details);
        }}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
          language: 'en',
        }}
      />
    </KeyboardAwareScrollView>
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
