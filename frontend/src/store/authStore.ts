import { create } from 'zustand';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

import { useTranslation } from 'react-i18next';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

interface AuthState {
  authenticated: boolean | null;
  username: string | null;
  email: string | null;
  role: Role | null;
  authLoading: boolean;
  onLogin: (username: string, password: string) => void;
  onLogout: () => void;
  register: (username: string, password: string, email: string) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  authenticated: null,
  username: null,
  email: null,
  role: null,
  authLoading: false,

  onLogin: async (email: string, password: string) => {
    set({ authLoading: true });
    console.log('entre');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      const { accessToken, refreshToken } = response.data;
      const decodedToken: any = jwtDecode(accessToken);

      set({
        authenticated: decodedToken.isVerified,
        username: decodedToken.username,
        email: decodedToken.email,
        role: decodedToken.role,
        authLoading: false,
      });

      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
    } catch (error: any) {
      set({ authLoading: false });
      if (error.response) {
        return alert(`Login error: ${error.response.data.message}`);
      }
      alert('Ocurrió un error al realizar la solicitud.');
    }
  },

  onLogout: async () => {
    set({
      authenticated: false,
      username: null,
      email: null,
      role: null,
    });

    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  },

  register: async () => {},
}));

export default useAuthStore;
