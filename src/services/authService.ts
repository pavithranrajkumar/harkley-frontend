import { apiRequest } from './api';
import type { ApiResponse, AuthResponse, LoginCredentials, SignupCredentials, UserProfile } from '../types/auth';

const BASE_PATH = 'auth';
class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return apiRequest<AuthResponse>('POST', `${BASE_PATH}/login`, credentials);
  }

  async signup(credentials: SignupCredentials): Promise<ApiResponse<AuthResponse>> {
    return apiRequest<AuthResponse>('POST', `${BASE_PATH}/signup`, credentials);
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiRequest<UserProfile>('GET', `${BASE_PATH}/profile`);
  }

  async logout(): Promise<ApiResponse<null>> {
    return apiRequest<null>('POST', `${BASE_PATH}/logout`);
  }
}

export const authService = new AuthService();
