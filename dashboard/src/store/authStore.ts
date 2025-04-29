
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
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
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        // Simulate API call
        return new Promise<boolean>((resolve) => {
          setTimeout(() => {
            const user = mockUsers.find(
              (u) => u.email === email && u.password === password
            );
            
            if (user) {
              // Remove password from user object before storing
              const { password, ...userData } = user;
              const token = `mock-jwt-token-${Date.now()}`;
              
              set({
                token,
                user: userData,
                isAuthenticated: true
              });
              resolve(true);
            } else {
              resolve(false);
            }
          }, 500);
        });
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
        set({
          token: null,
          user: null,
          isAuthenticated: false
        });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
