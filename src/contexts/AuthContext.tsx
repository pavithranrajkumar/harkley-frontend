import React, { createContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginFormData } from '../constants/validation';
import { authService } from '../services/authService';
import type { User, AuthState, SignupCredentials, AuthContextType } from '../types/auth';
import { showToast } from '../utils/toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Helper function to set authenticated state
  const setAuthenticatedState = useCallback((user: User, token: string) => {
    setAuthState({
      isAuthenticated: true,
      user,
      token,
      isLoading: false,
    });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, []);

  // Helper function to clear auth state
  const clearAuthState = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // Helper function to handle auth success
  const handleAuthSuccess = useCallback(
    (user: User, token: string, successMessage: string) => {
      setAuthenticatedState(user, token);
      showToast.success(successMessage);

      // Check if there's a redirect path from location state
      const intendedPath = sessionStorage.getItem('intendedPath');

      if (intendedPath && intendedPath !== '/login' && intendedPath !== '/signup') {
        sessionStorage.removeItem('intendedPath');
        navigate(intendedPath);
      } else {
        navigate('/dashboard');
      }
    },
    [setAuthenticatedState, navigate]
  );

  // Helper function to handle auth error
  const handleAuthError = useCallback((error: unknown, defaultMessage: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: false }));
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    showToast.error(errorMessage);
    return { success: false, error: errorMessage };
  }, []);

  const login = async (credentials: LoginFormData): Promise<{ success: boolean; error?: string }> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await authService.login(credentials);

      if (response.success && response.data) {
        const user: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
        };

        handleAuthSuccess(user, response.data.token, 'Successfully logged in!');
        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      return handleAuthError(error, 'Login failed');
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<{ success: boolean; error?: string }> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await authService.signup(credentials);

      if (response.success && response.data) {
        const user: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
        };

        handleAuthSuccess(user, response.data.token, 'Account created successfully!');
        return { success: true };
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      return handleAuthError(error, 'Signup failed');
    }
  };

  const logout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts

    setIsLoggingOut(true);
    try {
      await authService.logout();
      showToast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      showToast.error('Logout failed');
    } finally {
      clearAuthState();
      setIsLoggingOut(false);
      navigate('/login');
    }
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      clearAuthState();
      return;
    }

    try {
      const profileResponse = await authService.getProfile();

      if (profileResponse.success && profileResponse.data) {
        setAuthenticatedState(
          {
            id: profileResponse.data.id,
            email: profileResponse.data.email,
            name: profileResponse.data.name,
          },
          token
        );
      } else {
        clearAuthState();
      }
    } catch {
      clearAuthState();
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    ...authState,
    isLoggingOut,
    login,
    signup,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
