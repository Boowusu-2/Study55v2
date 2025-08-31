import React, { createContext, useContext, useReducer, useEffect } from "react";

// Types
interface User {
  id: string;
  email: string;
  name: string;
  isPro: boolean;
  avatar?: string;
  subscription?: {
    planId: string;
    status: string;
    startDate: string;
    endDate: string;
  };
  stats?: {
    totalQuizzes: number;
    totalQuestions: number;
    averageScore: number;
    studyStreak: number;
  };
  createdAt?: string;
  lastLoginAt?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "SET_USER"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Create context with default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => ({ success: false, error: "Not initialized" }),
  logout: () => {},
  register: async () => ({ success: false, error: "Not initialized" }),
  resetPassword: async () => ({ success: false, error: "Not initialized" }),
  clearError: () => {},
  updateProfile: async () => ({ success: false, error: "Not initialized" }),
});

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem("studyai_token");
          if (token) {
            // In a real app, you'd validate the token with your backend
            const userData = localStorage.getItem("studyai_user");
            if (userData) {
              const user = JSON.parse(userData);
              dispatch({ type: "SET_USER", payload: user });
            } else {
              dispatch({ type: "LOGOUT" });
            }
          } else {
            dispatch({ type: "SET_LOADING", payload: false });
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        dispatch({ type: "LOGOUT" });
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      dispatch({ type: "SET_LOADING", payload: false });
    }, 3000); // 3 second timeout

    checkAuth();

    return () => clearTimeout(timeoutId);
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data
      const user: User = {
        id: "1",
        email: credentials.email,
        name: credentials.email.split("@")[0],
        isPro: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        stats: {
          totalQuizzes: 0,
          totalQuestions: 0,
          averageScore: 0,
          studyStreak: 0,
        },
        subscription: {
          planId: "free",
          status: "active",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem("studyai_token", "mock_token");
        localStorage.setItem("studyai_user", JSON.stringify(user));
      }

      dispatch({ type: "SET_USER", payload: user });
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      dispatch({ type: "SET_ERROR", payload: "Login failed" });
      return { success: false, error: "Login failed" };
    }
  };

  // Logout function
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("studyai_token");
      localStorage.removeItem("studyai_user");
    }
    dispatch({ type: "LOGOUT" });
  };

  // Register function
  const register = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data
      const user: User = {
        id: "1",
        email: credentials.email,
        name: credentials.email.split("@")[0],
        isPro: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        stats: {
          totalQuizzes: 0,
          totalQuestions: 0,
          averageScore: 0,
          studyStreak: 0,
        },
        subscription: {
          planId: "free",
          status: "active",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem("studyai_token", "mock_token");
        localStorage.setItem("studyai_user", JSON.stringify(user));
      }

      dispatch({ type: "SET_USER", payload: user });
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error);
      dispatch({ type: "SET_ERROR", payload: "Registration failed" });
      return { success: false, error: "Registration failed" };
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would send a password reset email
      console.log(`Password reset email would be sent to: ${email}`);

      return { success: true };
    } catch (error) {
      console.error("Password reset failed:", error);
      dispatch({ type: "SET_ERROR", payload: "Password reset failed" });
      return { success: false, error: "Password reset failed" };
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!state.user) return { success: false, error: "No user logged in" };

      const updatedUser = { ...state.user, ...updates };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem("studyai_user", JSON.stringify(updatedUser));
      }

      dispatch({ type: "SET_USER", payload: updatedUser });
      return { success: true };
    } catch (error) {
      console.error("Profile update failed:", error);
      dispatch({ type: "SET_ERROR", payload: "Profile update failed" });
      return { success: false, error: "Profile update failed" };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    register,
    resetPassword,
    clearError,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Type for the context value
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}
