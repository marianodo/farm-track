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
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
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

    }
  },

  deletedUserData: async (userId: string) => {
    set({ authLoading: true });
    try {
      await axiosInstance.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/database/userData/${userId}`
      );
      
      // Limpiar todo el cache después de borrar los datos del usuario
      const { cacheManager } = await import('../utils/cache');
      await cacheManager.clearAll();
      
      // También limpiar los stores para forzar refresh en la próxima consulta
      const { default: useTypeOfObjectStore } = await import('./typeOfObjectStore');
      const { default: useVariableStore } = await import('./variableStore');
      const { default: usePenStore } = await import('./penStore');
      const { default: useReportStore } = await import('./reportStore');
      const { default: useFieldStore } = await import('./fieldStore');
      
      useTypeOfObjectStore.getState().clearTypeOfObjects();
      useVariableStore.getState().clearVariables();
      usePenStore.getState().clearPens();
      useReportStore.getState().clearReports();
      useFieldStore.getState().clearFields();
      
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

  changePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
  set({ authLoading: true });
  try {
    const userId = useAuthStore.getState().userId;
    await axiosInstance.put(
      `${process.env.EXPO_PUBLIC_API_URL}/users/change-password`,
      {
        userId,
        currentPassword,
        newPassword,
      }
    );
    
    set({ authLoading: false });
    return true;
  } catch (error: any) {
    set({ authLoading: false });
    if (error.response && error.response.data && error.response.data.message) {
      alert(`An error occurred while changing the password: ${error.response.data.message}`);
    } else {
      alert('An error occurred while changing the password.');
    }
    return false;
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
