import React, { createContext, useContext, useReducer, useEffect, useState } from "react";

// Types
interface User {
  id: string;
  email: string;
  name: string;
  isPro: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: "SET_USER"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
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
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [mounted, setMounted] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    setMounted(true);
    
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

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data
      const user: User = {
        id: "1",
        email: credentials.email,
        name: credentials.email.split("@")[0],
        isPro: false,
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
      dispatch({ type: "SET_LOADING", payload: false });
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

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data
      const user: User = {
        id: "1",
        email: credentials.email,
        name: credentials.email.split("@")[0],
        isPro: false,
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
      dispatch({ type: "SET_LOADING", payload: false });
      return { success: false, error: "Registration failed" };
    }
  };

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout,
    register,
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

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
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
}
