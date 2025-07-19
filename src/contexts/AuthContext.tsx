import React, { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginFormData } from '../constants/validation';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginFormData) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuthStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  const login = async (credentials: LoginFormData): Promise<{ success: boolean; error?: string }> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful login
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        name: 'Demo User',
      };

      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        isLoading: false,
      });

      // Store in localStorage (in real app, you'd store a JWT token)
      localStorage.setItem('user', JSON.stringify(mockUser));

      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Simulate Google OAuth
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful Google login
      const mockUser: User = {
        id: '2',
        email: 'user@gmail.com',
        name: 'Google User',
        avatar: 'https://via.placeholder.com/40',
      };

      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        isLoading: false,
      });

      localStorage.setItem('user', JSON.stringify(mockUser));

      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google login failed',
      };
    }
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
    localStorage.removeItem('user');
    navigate('/login');
  };

  const checkAuthStatus = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          isAuthenticated: true,
          user,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem('user');
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    ...authState,
    login,
    loginWithGoogle,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
