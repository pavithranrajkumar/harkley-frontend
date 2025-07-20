import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import type { ApiResponse } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Generic API request function
export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: unknown,
  config?: object
): Promise<ApiResponse<T>> => {
  try {
    const requestConfig: {
      method: string;
      url: string;
      data?: unknown;
      headers?: Record<string, string>;
      [key: string]: unknown;
    } = {
      method,
      url: endpoint,
      data,
      ...config,
    };

    // For FormData, we need to completely override the default headers
    if (data instanceof FormData) {
      requestConfig.headers = {
        'Content-Type': 'multipart/form-data',
      };
    }

    const response = await api.request<ApiResponse<T>>(requestConfig);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle axios errors
      const errorMessage = error.response?.data?.message || error.message || 'Request failed';
      throw new Error(errorMessage);
    }

    // Handle other errors
    throw new Error('An unexpected error occurred');
  }
};

export default api;
