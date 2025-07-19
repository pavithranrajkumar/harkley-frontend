import { apiRequest } from './api';
import type { ApiResponse, AuthResponse, LoginCredentials, SignupCredentials, UserProfile } from '../types/auth';

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return apiRequest<AuthResponse>('POST', '/auth/login', credentials);
  }

  async signup(credentials: SignupCredentials): Promise<ApiResponse<AuthResponse>> {
    return apiRequest<AuthResponse>('POST', '/auth/signup', credentials);
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiRequest<UserProfile>('GET', '/auth/profile');
  }

  async logout(): Promise<ApiResponse<null>> {
    return apiRequest<null>('POST', '/auth/logout');
  }
}

export const authService = new AuthService();
