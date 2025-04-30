
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

interface AuthState {
  token: string | null;
  user: User | null;
  role: Role | null;
  authLoading: boolean;
  verifiedToken: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Mock users for hardcoded authentication
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password456'
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      authLoading: false,
      verifiedToken: false,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        set({ authLoading: true });
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              email,
              password,
            }
          );

          console.log(response)
          
          const { accessToken, ...user } = response.data;
          console.log("USER", user)
          set({
            token: accessToken,
            user,
            role: user.role,
            isAuthenticated: true,
            authLoading: false
          });
          document.cookie = `auth-token=${accessToken}; path=/`;
          document.cookie = `user-role=${user.role}; path=/`;
          return true;
        } catch (error) {
          console.log(error)
          set({ authLoading: false });
          return false;
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        // Simulate API call
        return new Promise<boolean>((resolve) => {
          setTimeout(() => {
            const userExists = mockUsers.some((u) => u.email === email);
            
            if (!userExists) {
              // In a real app, you would send this to your API
              const newUser = {
                id: `${mockUsers.length + 1}`,
                name,
                email
              };
              
              const token = `mock-jwt-token-${Date.now()}`;
              
              set({
                token,
                user: newUser,
                isAuthenticated: true
              });
              
              resolve(true);
            } else {
              resolve(false);
            }
          }, 500);
        });
      },
      
      logout: () => {
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        set({
          token: null,
          user: null,
          role: null,
          isAuthenticated: false,
          verifiedToken: false,
          authLoading: false
        });
      },
    }),
    {
      name: 'auth-storage'
    }
  )
);
