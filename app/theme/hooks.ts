/**
 * Fast theme hooks - drop-in replacement for the old theme system
 * This file maintains the same API but uses CSS variables for much better performance
 */

// Re-export everything from fast-hooks for backward compatibility
export { useColors, useTheme, useCssVar, useButtonToken, useIconToken } from './fast-hooks';

// Legacy hooks for full backward compatibility
export function useTypography() {
  return {
    'body-default': {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: '400',
    },
    'heading-1': {
      fontSize: '30px',
      lineHeight: '38px',
      fontWeight: '600',
    },
    // Add more typography tokens as needed
  };
}

export function useSpacing() {
  return {
    'spacing-xs': '4px',
    'spacing-sm': '8px',
    'spacing-md': '16px',
    'spacing-lg': '24px',
    'spacing-xl': '32px',
    // Add more spacing tokens as needed
  };
}

export function useThemeAssets() {
  return {
    icons: {},
    images: {}
  };
}