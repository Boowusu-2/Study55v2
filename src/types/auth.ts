export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription?: {
    planId: string;
    status: 'active' | 'cancelled' | 'expired';
    startDate: string;
    endDate: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    language: string;
  };
  stats: {
    totalQuizzes: number;
    totalQuestions: number;
    averageScore: number;
    studyStreak: number;
  };
  createdAt: string;
  lastLoginAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}
