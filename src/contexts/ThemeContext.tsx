import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

// Create context with default value
const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("studyai_theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to system preference
      setTheme("system");
    }
  }, []);

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem("studyai_theme", theme);

    // Apply theme to document
    const root = document.documentElement;

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setIsDark(systemTheme === "dark");
      root.classList.toggle("dark", systemTheme === "dark");
      root.classList.toggle("light", systemTheme === "light");
    } else {
      setIsDark(theme === "dark");
      root.classList.toggle("dark", theme === "dark");
      root.classList.toggle("light", theme === "light");
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      document.documentElement.classList.toggle("dark", e.matches);
      document.documentElement.classList.toggle("light", !e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
