import { create } from 'zustand';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

interface AuthState {
  authenticated: boolean | null;
  userId: string | null;
  username: string | null;
  email: string | null;
  token: string | null;
  role: Role | null;
  authLoading: boolean;
  onLogin: (username: string, password: string) => void;
  onLogout: () => void;
  deleted: (id: string) => void;
  register: (username: string, password: string, email: string) => void;
  deletedUserData: (username: string) => void;
  initializedToken: () => void;
  verifiedToken: boolean;
}

const useAuthStore = create<AuthState>((set: any) => ({
  authenticated: null,
  userId: null,
  username: null,
  email: null,
  token: null,
  role: null,
  authLoading: false,
  verifiedToken: false,

  onLogin: async (email: string, password: string) => {
    set({ authLoading: true });
    try {
      const response = await axiosInstance.post(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/login`,
        {
          email,
          password,
        }
      );
      const { accessToken, refreshToken } = response.data;
      if (accessToken && refreshToken) {
        const decodedToken = jwtDecode(accessToken);
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('user', JSON.stringify(decodedToken));
        const userString = await AsyncStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        set({
          verifiedToken: true,
          authenticated: true,
          userId: user.userId,
          username: user.username,
          email: user.email,
          role: user.role,
          token: accessToken,
          authLoading: false,
        });
      }
    } catch (error: any) {
      set({ authLoading: false, verifiedToken: false, authenticated: true });
      if (error.response) {
        return alert(`Login error: ${error.response.data.message}`);
      }
      alert('Ocurrió un error al realizar la solicitud.');
    }
  },

  onLogout: async () => {
    set({ authLoading: true });
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('user');
      await SecureStore.deleteItemAsync('refreshToken');
      set({
        userId: null,
        authLoading: false,
        authenticated: false,
        username: null,
        email: null,
        token: null,
        role: null,
        verifiedToken: false,
      });
    } catch (error) {
      set({ authLoading: false });
      alert(error);
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ authLoading: true });
    try {
      await axiosInstance.post(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/register`,
        {
          username,
          email,
          password,
        }
      );

      set({
        authLoading: false,
      });
      return alert('User created');
    } catch (error: any) {
      set({ authLoading: false });
      if (error.response) {
        return alert(`Login error: ${error.response.data.message}`);
      }
      // alert('Error al registrar el usuario');
    }
  },

  initializedToken: async () => {
    set({ authLoading: true });
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        const decodedToken: any = jwtDecode(accessToken);
        await AsyncStorage.setItem('user', JSON.stringify(decodedToken));
        const userString = await AsyncStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        set({
          token: accessToken,
          authenticated: true,
          authLoading: false,
          userId: user.userId,
          username: user.username,
          email: user.email,
          role: user.role,
        });
      } else {
        set({
          token: null,
          authenticated: false,
          authLoading: false,
          userId: null,
          username: null,
          email: null,
          role: null,
          verifiedToken: false,
        });
      }
    } catch (error) {
      set({ token: null, authenticated: false, authLoading: false });
      console.log(error);
    }
  },

  deletedUserData: async (userId: string) => {
    set({ authLoading: true });
    try {
      await axiosInstance.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/database/userData/${userId}`
      );
      set({
        authLoading: false,
      });
    } catch (error: any) {
      set({ authLoading: false });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error deleting object');
      }
    }
  },

  deleted: async (id: string) => {
    set({ authLoading: true });
    try {
      await axiosInstance.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/users/delete/${id}+1`
      );
      setTimeout(() => {
        set({
          authLoading: false,
        });
      }, 300);
    } catch (error: any) {
      setTimeout(() => {
        set({
          authLoading: false,
        });
      }, 300);
      if (error.response) {
        console.log(error.response.data);
        return alert(`deleted error: ${error.response.data.message}`);
      }
      alert('Error al registrar el usuario');
    }
  },
}));

export const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  async (request) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (accessToken) {
      request.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/refreshToken`,
          {
            refreshToken,
          }
        );
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        await AsyncStorage.setItem('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', newRefreshToken);
        useAuthStore.setState({
          token: accessToken,
          authenticated: true,
        });
        axiosInstance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await AsyncStorage.removeItem('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        useAuthStore.setState({
          token: null,
          authenticated: false,
        });
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default useAuthStore;
