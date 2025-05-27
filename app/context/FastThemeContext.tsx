'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ThemeMode = 'light' | 'dark';

interface FastThemeContextType {
  currentTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const FastThemeContext = createContext<FastThemeContextType | undefined>(undefined);

export function FastThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('light');

  const setTheme = useCallback((theme: ThemeMode) => {
    // INSTANT theme switching - just change one data attribute!
    document.documentElement.setAttribute('data-theme', theme);
    setCurrentTheme(theme);
    localStorage.setItem('theme-mode', theme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [currentTheme, setTheme]);

  useEffect(() => {
    // Initialize theme on mount
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', initialTheme);
    setCurrentTheme(initialTheme);
  }, []);

  return (
    <FastThemeContext.Provider value={{
      currentTheme,
      setTheme,
      toggleTheme,
    }}>
      {children}
    </FastThemeContext.Provider>
  );
}

export function useFastTheme() {
  const context = useContext(FastThemeContext);
  if (context === undefined) {
    throw new Error('useFastTheme must be used within a FastThemeProvider');
  }
  return context;
}