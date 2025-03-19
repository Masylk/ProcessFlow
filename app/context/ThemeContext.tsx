'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeContextType, ThemeMode, ButtonTokens, InputTokens, BreadcrumbTokens } from '../theme/types';
import { themeRegistry } from '../theme/registry';
import { lightTheme } from '../theme/themes/light';
import { darkTheme } from '../theme/themes/dark';

// Initialize themes
themeRegistry.register(lightTheme);
themeRegistry.register(darkTheme);

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('light');
  const theme = themeRegistry.get(currentTheme);

  const getCssVariable = (token: keyof (ButtonTokens & InputTokens & BreadcrumbTokens)): string => {
    return `var(--${token})`;
  };

  // Pre-compute CSS variables for both themes
  const lightThemeVars = useMemo(() => {
    const lightTheme = themeRegistry.get('light');
    return Object.entries(lightTheme.tokens.colors).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[`--${key}`] = value;
      return acc;
    }, {});
  }, []);

  const darkThemeVars = useMemo(() => {
    const darkTheme = themeRegistry.get('dark');
    return Object.entries(darkTheme.tokens.colors).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[`--${key}`] = value;
      return acc;
    }, {});
  }, []);

  // Combine both theme variables
  const cssVariables = useMemo(() => {
    return currentTheme === 'light' ? lightThemeVars : darkThemeVars;
  }, [currentTheme, lightThemeVars, darkThemeVars]);

  useEffect(() => {
    // Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode;
    
    // Use saved theme if it exists, otherwise use system preference
    if (savedTheme && themeRegistry.exists(savedTheme)) {
      setCurrentTheme(savedTheme);
    } else if (systemPrefersDark) {
      setCurrentTheme('dark');
    }

    // Add transition styles to head
    const style = document.createElement('style');
    style.textContent = `
      :root {
        transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
      }
      
      * {
        transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Update document class
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(currentTheme);
  }, [currentTheme]);

  const value: ThemeContextType = {
    currentTheme,
    themes: themeRegistry.getAllThemes(),
    setTheme: (mode: ThemeMode) => {
      if (themeRegistry.exists(mode)) {
        setCurrentTheme(mode);
        localStorage.setItem('theme-mode', mode);
      }
    },
    getCssVariable,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div style={cssVariables as React.CSSProperties}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 