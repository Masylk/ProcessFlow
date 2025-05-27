'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ThemeContextType, ThemeMode, ButtonTokens, InputTokens, BreadcrumbTokens, IconTokens } from '../theme/types';
import { themeRegistry } from '../theme/registry';
import { lightTheme } from '../theme/themes/light';
import { darkTheme } from '../theme/themes/dark';

// Initialize themes
themeRegistry.register(lightTheme);
themeRegistry.register(darkTheme);

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Apply CSS variables directly to document root (much faster than inline styles)
  const applyThemeVariables = useCallback((theme: ThemeMode) => {
    const themeData = themeRegistry.get(theme);
    const root = document.documentElement;
    
    // Apply variables in batch for better performance
    Object.entries(themeData.tokens.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, []);

  const getCssVariable = useCallback((token: keyof (ButtonTokens & InputTokens & BreadcrumbTokens & IconTokens)): string => {
    return `var(--${token})`;
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    if (themeRegistry.exists(mode)) {
      // Temporarily disable transitions for instant switching
      const root = document.documentElement;
      root.style.setProperty('--theme-transition-duration', '0ms');
      
      setCurrentTheme(mode);
      applyThemeVariables(mode);
      localStorage.setItem('theme-mode', mode);
      
      // Re-enable transitions after DOM updates
      requestAnimationFrame(() => {
        root.style.setProperty('--theme-transition-duration', '150ms');
      });
    }
  }, [applyThemeVariables]);

  useEffect(() => {
    // Check system preference and saved theme
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode;
    
    let initialTheme: ThemeMode = 'light';
    if (savedTheme && themeRegistry.exists(savedTheme)) {
      initialTheme = savedTheme;
    } else if (systemPrefersDark) {
      initialTheme = 'dark';
    }
    
    setCurrentTheme(initialTheme);
    applyThemeVariables(initialTheme);

    // Add optimized transition styles
    const style = document.createElement('style');
    style.id = 'theme-transitions';
    style.textContent = `
      :root {
        --theme-transition-duration: 150ms;
      }
      
      /* Only transition essential elements for better performance */
      body,
      .theme-transition,
      [data-theme-transition="true"] {
        transition: 
          background-color var(--theme-transition-duration) ease,
          color var(--theme-transition-duration) ease,
          border-color var(--theme-transition-duration) ease;
      }
      
      /* Exclude performance-sensitive elements */
      svg, svg *,
      canvas,
      video,
      [data-no-transition="true"],
      .no-transition {
        transition: none !important;
      }
      
      /* Optimize icon transitions */
      [class*="icon"], [class*="Icon"] {
        transition: color 50ms ease !important;
      }
    `;
    
    // Remove existing style if it exists
    const existingStyle = document.getElementById('theme-transitions');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
    setIsInitialized(true);

    return () => {
      const styleElement = document.getElementById('theme-transitions');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [applyThemeVariables]);

  useEffect(() => {
    if (!isInitialized) return;
    
    // Update document class for CSS-based theming
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(currentTheme);
  }, [currentTheme, isInitialized]);

  const value: ThemeContextType = {
    currentTheme,
    themes: themeRegistry.getAllThemes(),
    setTheme,
    getCssVariable,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
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