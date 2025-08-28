import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthContextType, AuthState, LoginCredentials, RegisterData, User } from '@/types/auth';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('smartstudy_token');
        if (token) {
          // In a real app, you'd validate the token with your backend
          const userData = localStorage.getItem('smartstudy_user');
          if (userData) {
            const user = JSON.parse(userData);
            dispatch({ type: 'SET_USER', payload: user });
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data - replace with actual API response
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        name: credentials.email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
        subscription: {
          planId: 'free',
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en',
        },
        stats: {
          totalQuizzes: 0,
          totalQuestions: 0,
          averageScore: 0,
          studyStreak: 0,
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      // Store in localStorage (in real app, store JWT token)
      localStorage.setItem('smartstudy_token', 'mock-jwt-token');
      localStorage.setItem('smartstudy_user', JSON.stringify(mockUser));

      dispatch({ type: 'SET_USER', payload: mockUser });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Login failed. Please check your credentials.' });
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data
      const mockUser: User = {
        id: '1',
        email: data.email,
        name: data.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
        subscription: {
          planId: 'free',
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en',
        },
        stats: {
          totalQuizzes: 0,
          totalQuestions: 0,
          averageScore: 0,
          studyStreak: 0,
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      localStorage.setItem('smartstudy_token', 'mock-jwt-token');
      localStorage.setItem('smartstudy_user', JSON.stringify(mockUser));

      dispatch({ type: 'SET_USER', payload: mockUser });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Registration failed. Please try again.' });
    }
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('smartstudy_token');
    localStorage.removeItem('smartstudy_user');
    dispatch({ type: 'LOGOUT' });
  };

  // Update profile function
  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!state.user) return;

    try {
      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem('smartstudy_user', JSON.stringify(updatedUser));
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile.' });
    }
  };

  // Reset password function
  const resetPassword = async (_email: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, this would send a password reset email
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send reset email.' });
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
