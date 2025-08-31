import { useEffect, useState } from "react";

interface LocalStorageProviderProps {
  children: React.ReactNode;
  storageKey: string;
  defaultValue: unknown;
  onLoad: (data: unknown) => void;
}

export default function LocalStorageProvider({
  children,
  storageKey,
  onLoad,
}: LocalStorageProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Load data from localStorage on client side
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        onLoad(parsedData);
      }
    } catch (error) {
      console.error(`Error loading from localStorage (${storageKey}):`, error);
    }
  }, [storageKey, onLoad]);

  // Don't render children until we're on the client side
  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}

// Hook for safely accessing localStorage
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const savedValue = localStorage.getItem(key);
      if (savedValue !== null) {
        setValue(JSON.parse(savedValue));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  const setStoredValue = (newValue: T) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [value, setStoredValue] as const;
}
