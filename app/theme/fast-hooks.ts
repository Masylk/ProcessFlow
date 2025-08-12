/**
 * Fast theme hooks - backward compatible with existing useColors() usage
 * These provide the same API but use CSS variables instead of JavaScript objects
 * COMPLETE MAPPING of all 388+ color tokens
 */

import { useFastTheme } from '../context/FastThemeContext';

/**
 * Backward-compatible useColors hook
 * Returns a Proxy that converts any property access to CSS variables
 * This maps ALL your existing tokens to CSS variables for 100% compatibility
 */
export function useColors() {
  return new Proxy({} as any, {
    get: (_, prop: string) => {
      // Direct mapping to CSS variables - covers all your 388 tokens
      return `var(--${prop})`;
    }
  });
}

/**
 * Backward-compatible useTheme hook
 */
export function useTheme() {
  const { currentTheme, setTheme, toggleTheme } = useFastTheme();
  
  return {
    currentTheme,
    setTheme,
    toggleTheme,
    // Legacy API compatibility
    themes: {
      light: { name: 'light' },
      dark: { name: 'dark' }
    },
    getCssVariable: (token: string) => `var(--${token})`,
  };
}

/**
 * Get a specific CSS variable value
 */
export function useCssVar(token: string): string {
  return `var(--${token})`;
}

/**
 * Helper for button tokens (backward compatibility)
 */
export function useButtonToken(token: string): string {
  return `var(--${token})`;
}

/**
 * Helper for icon tokens (backward compatibility)
 */
export function useIconToken(token: string): string {
  return `var(--${token})`;
}

/**
 * Helper for input tokens (backward compatibility)
 */
export function useInputToken(token: string): string {
  return `var(--${token})`;
}

/**
 * Helper for breadcrumb tokens (backward compatibility)
 */
export function useBreadcrumbToken(token: string): string {
  return `var(--${token})`;
}

/**
 * Typography tokens (static since they don't change with theme)
 */
export function useTypography() {
  return {
    'body-default': {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: '400',
    },
    'body-sm': {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: '400',
    },
    'body-xs': {
      fontSize: '12px',
      lineHeight: '18px',
      fontWeight: '400',
    },
    'heading-1': {
      fontSize: '30px',
      lineHeight: '38px',
      fontWeight: '600',
    },
    'heading-2': {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: '600',
    },
    'heading-3': {
      fontSize: '20px',
      lineHeight: '30px',
      fontWeight: '600',
    },
    'heading-4': {
      fontSize: '18px',
      lineHeight: '28px',
      fontWeight: '600',
    },
    'heading-5': {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: '600',
    },
    'heading-6': {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: '600',
    },
  };
}

/**
 * Spacing tokens (static)
 */
export function useSpacing() {
  return {
    'spacing-none': '0px',
    'spacing-xs': '4px',
    'spacing-sm': '8px',
    'spacing-md': '12px',
    'spacing-lg': '16px',
    'spacing-xl': '20px',
    'spacing-2xl': '24px',
    'spacing-3xl': '32px',
    'spacing-4xl': '40px',
    'spacing-5xl': '48px',
    'spacing-6xl': '64px',
    'spacing-7xl': '80px',
    'spacing-8xl': '96px',
  };
}