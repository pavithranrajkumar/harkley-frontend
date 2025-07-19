// Base API Response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

// User interface
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

// Authentication Response
export interface AuthResponse {
  user: User;
  token: string;
}

// User Profile (extended user info)
export interface UserProfile extends User {
  createdAt: string;
  updatedAt: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Signup credentials
export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggingOut?: boolean;
}

// Authentication context type
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (credentials: SignupCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuthStatus: () => void;
}
