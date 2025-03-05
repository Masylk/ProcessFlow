import { Theme } from '../types';

// Import the base theme colors
import baseTheme from '@/theme';

// Create a type for the theme.js color paths
type ThemeColorPath = keyof typeof baseTheme.colors;

// Utility function to get color from theme.js
const getThemeColor = (path: ThemeColorPath): string => {
  return baseTheme.colors[path];
};

export const darkTheme: Theme = {
  name: 'dark',
  label: 'Dark Mode',
  tokens: {
    colors: {
      // Text colors
      'text-primary': getThemeColor('Gray (dark mode)/50'),
      'text-primary_on-brand': getThemeColor('Gray (dark mode)/50'),
      'text-secondary': getThemeColor('Gray (dark mode)/300'),
      'text-secondary_hover': getThemeColor('Gray (dark mode)/200'),
      'text-secondary_on-brand': getThemeColor('Gray (dark mode)/300'),
      'text-tertiary': getThemeColor('Gray (dark mode)/400'),
      'text-tertiary_hover': getThemeColor('Gray (dark mode)/300'),
      'text-tertiary_on-brand': getThemeColor('Gray (dark mode)/400'),
      'text-quaternary': getThemeColor('Gray (dark mode)/400'),
      'text-quaternary_on-brand': getThemeColor('Gray (dark mode)/400'),
      'text-white': getThemeColor('Base/White'),
      'text-disabled': getThemeColor('Gray (dark mode)/500'),
      'text-placeholder': getThemeColor('Gray (dark mode)/500'),
      'text-placeholder_subtle': getThemeColor('Gray (dark mode)/700'),
      'text-brand-primary': getThemeColor('Gray (dark mode)/50'),
      'text-brand-secondary': getThemeColor('Gray (dark mode)/300'),
      'text-brand-tertiary': getThemeColor('Gray (dark mode)/400'),
      'text-brand-tertiary_alt': getThemeColor('Gray (dark mode)/50'),
      'text-error-primary': getThemeColor('Error/400'),
      'text-warning-primary': getThemeColor('Warning/400'),
      'text-success-primary': getThemeColor('Success/400'),

      // Border colors
      'border-primary': getThemeColor('Gray (dark mode)/700'),
      'border-secondary': getThemeColor('Gray (dark mode)/800'),
      'border-tertiary': getThemeColor('Gray (dark mode)/800'),
      'border-disabled': getThemeColor('Gray (dark mode)/700'),
      'border-disabled_subtle': getThemeColor('Gray (dark mode)/800'),
      'border-brand': getThemeColor('Brand/400'),
      'border-brand_alt': getThemeColor('Gray (dark mode)/700'),
      'border-error': getThemeColor('Error/400'),
      'border-error_subtle': getThemeColor('Error/400'),

      // Base colors
      'base-white': getThemeColor('Base/Black'),
      'base-black': getThemeColor('Base/White'),
      
      // Foreground colors
      'fg-primary': getThemeColor('Base/White'),
      'fg-secondary': getThemeColor('Gray (dark mode)/300'),
      'fg-secondary_hover': getThemeColor('Gray (dark mode)/200'),
      'fg-tertiary': getThemeColor('Gray (dark mode)/400'),
      'fg-tertiary_hover': getThemeColor('Gray (dark mode)/300'),
      'fg-quaternary': getThemeColor('Gray (dark mode)/400'),
      'fg-quaternary_hover': getThemeColor('Gray (dark mode)/300'),
      'fg-quinary': getThemeColor('Gray (dark mode)/500'),
      'fg-quinary_hover': getThemeColor('Gray (dark mode)/400'),
      'fg-senary': getThemeColor('Gray (dark mode)/600'),
      'fg-white': getThemeColor('Base/White'),
      'fg-disabled': getThemeColor('Gray (dark mode)/500'),
      'fg-disabled_subtle': getThemeColor('Gray (dark mode)/600'),
      'fg-brand-primary': getThemeColor('Brand/500'),
      'fg-brand-primary_alt': getThemeColor('Gray (dark mode)/300'),
      'fg-brand-secondary': getThemeColor('Brand/500'),
      'fg-error-primary': getThemeColor('Error/500'),
      'fg-error-secondary': getThemeColor('Error/400'),
      'fg-warning-primary': getThemeColor('Warning/500'),
      'fg-warning-secondary': getThemeColor('Warning/400'),
      'fg-success-primary': getThemeColor('Success/500'),
      'fg-success-secondary': getThemeColor('Success/400'),

      // Background colors
      'bg-primary': getThemeColor('Gray (dark mode)/950'),
      'bg-primary_alt': getThemeColor('Gray (dark mode)/900'),
      'bg-primary_hover': getThemeColor('Gray (dark mode)/800'),
      'bg-primary-solid': getThemeColor('Gray (dark mode)/900'),
      'bg-secondary': getThemeColor('Gray (dark mode)/900'),
      'bg-secondary_alt': getThemeColor('Gray (dark mode)/800'),
      'bg-secondary_hover': getThemeColor('Gray (dark mode)/800'),
      'bg-secondary_subtle': getThemeColor('Gray (dark mode)/900'),
      'bg-secondary-solid': getThemeColor('Gray (dark mode)/600'),
      'bg-tertiary': getThemeColor('Gray (dark mode)/800'),
      'bg-quaternary': getThemeColor('Gray (dark mode)/700'),
      'bg-active': getThemeColor('Gray (dark mode)/800'),
      'bg-disabled': getThemeColor('Gray (dark mode)/800'),
      'bg-disabled_subtle': getThemeColor('Gray (dark mode)/900'),
      'bg-overlay': getThemeColor('Gray (dark mode)/800'),
      'bg-brand-primary': getThemeColor('Brand/500'),
      'bg-brand-primary_alt': getThemeColor('Gray (dark mode)/900'),
      'bg-brand-secondary': getThemeColor('Brand/600'),
      'bg-brand-solid': getThemeColor('Brand/600'),
      'bg-brand-solid_hover': getThemeColor('Brand/500'),
      'bg-brand-section': getThemeColor('Gray (dark mode)/900'),
      'bg-brand-section_subtle': getThemeColor('Gray (dark mode)/800'),
      'bg-error-primary': getThemeColor('Error/500'),
      'bg-error-secondary': getThemeColor('Error/600'),
      'bg-error-solid': getThemeColor('Error/600'),
      'bg-warning-primary': getThemeColor('Warning/500'),
      'bg-warning-secondary': getThemeColor('Warning/600'),
      'bg-warning-solid': getThemeColor('Warning/600'),
      'bg-success-primary': getThemeColor('Success/500'),
      'bg-success-secondary': getThemeColor('Success/600'),
      'bg-success-solid': getThemeColor('Success/600'),
      
      // Button colors
      // Primary button
      'button-primary-fg': getThemeColor('Base/White'),
      'button-primary-fg-hover': getThemeColor('Base/White'),
      'button-primary-bg': getThemeColor('Brand/500'),
      'button-primary-bg-hover': getThemeColor('Brand/700'),
      'button-primary-border': getThemeColor('Brand/500'),
      'button-primary-border-hover': getThemeColor('Brand/700'),

      // Secondary button
      'button-secondary-fg': getThemeColor('Gray (dark mode)/300'),
      'button-secondary-fg-hover': getThemeColor('Gray (dark mode)/100'),
      'button-secondary-bg': getThemeColor('Gray (dark mode)/900'),
      'button-secondary-bg-hover': getThemeColor('Gray (dark mode)/800'),
      'button-secondary-border': getThemeColor('Gray (dark mode)/700'),
      'button-secondary-border-hover': getThemeColor('Gray (dark mode)/700'),
      
      // Secondary color button
      'button-secondary-color-fg': getThemeColor('Gray (dark mode)/300'),
      'button-secondary-color-fg-hover': getThemeColor('Gray (dark mode)/100'),
      'button-secondary-color-bg': getThemeColor('Gray (dark mode)/900'),
      'button-secondary-color-bg-hover': getThemeColor('Gray (dark mode)/800'),
      'button-secondary-color-border': getThemeColor('Gray (dark mode)/700'),
      'button-secondary-color-border-hover': getThemeColor('Gray (dark mode)/700'),
      
      // Tertiary button
      'button-tertiary-bg': 'transparent',
      'button-tertiary-fg': getThemeColor('Gray (dark mode)/400'),
      'button-tertiary-fg-hover': getThemeColor('Gray (dark mode)/200'),
      'button-tertiary-border': 'transparent',
      'button-tertiary-bg-hover': getThemeColor('Gray (dark mode)/800'),
      'button-tertiary-border-hover': 'transparent',
      
      // Tertiary color button
      'button-tertiary-color-bg': 'transparent',
      'button-tertiary-color-fg': getThemeColor('Gray (dark mode)/300'),
      'button-tertiary-color-fg-hover': getThemeColor('Gray (dark mode)/100'),
      'button-tertiary-color-border': 'transparent',
      'button-tertiary-color-bg-hover': getThemeColor('Gray (dark mode)/800'),
      'button-tertiary-color-border-hover': 'transparent',
      
      // Destructive button tokens
      // Primary destructive
      'button-destructive-primary-bg': getThemeColor('Error/600'),
      'button-destructive-primary-fg': getThemeColor('Base/White'),
      'button-destructive-primary-border': getThemeColor('Error/400'),
      'button-destructive-primary-bg-hover': getThemeColor('Error/700'),
      'button-destructive-primary-fg-hover': getThemeColor('Base/White'),
      'button-destructive-primary-border-hover': getThemeColor('Error/400'),

      // Secondary destructive
      'button-destructive-secondary-bg': getThemeColor('Error/950'),
      'button-destructive-secondary-fg': getThemeColor('Error/200'),
      'button-destructive-secondary-border': getThemeColor('Error/800'),
      'button-destructive-secondary-bg-hover': getThemeColor('Error/900'),
      'button-destructive-secondary-fg-hover': getThemeColor('Error/100'),
      'button-destructive-secondary-border-hover': getThemeColor('Error/700'),

      // Tertiary destructive
      'button-destructive-tertiary-bg': 'transparent',
      'button-destructive-tertiary-fg': getThemeColor('Error/300'),
      'button-destructive-tertiary-border': 'transparent',
      'button-destructive-tertiary-bg-hover': getThemeColor('Error/900'),
      'button-destructive-tertiary-fg-hover': getThemeColor('Error/200'),
      'button-destructive-tertiary-border-hover': 'transparent',
      
      // Loading spinner
      'button-loading-spinner': getThemeColor('Base/White'),

      // Input field tokens
      // Default input
      'input-bg': getThemeColor('Gray (dark mode)/950'),
      'input-fg': getThemeColor('Gray (dark mode)/100'),
      'input-border': getThemeColor('Gray (dark mode)/700'),
      'input-bg-hover': getThemeColor('Gray (dark mode)/800'),
      'input-fg-hover': getThemeColor('Gray (dark mode)/50'),
      'input-border-hover': getThemeColor('Gray (dark mode)/600'),
      'input-bg-focus': getThemeColor('Gray (dark mode)/900'),
      'input-fg-focus': getThemeColor('Gray (dark mode)/50'),
      'input-border-focus': getThemeColor('Brand/500'),
      'input-placeholder': getThemeColor('Gray (dark mode)/500'),
      'input-label': getThemeColor('Gray (dark mode)/300'),
      'input-hint': getThemeColor('Gray (dark mode)/400'),
      'input-icon': getThemeColor('Gray (dark mode)/500'),
      'input-prefix': getThemeColor('Gray (dark mode)/500'),

      // Destructive input
      'input-destructive-bg': getThemeColor('Error/950'),
      'input-destructive-fg': getThemeColor('Gray (dark mode)/50'),
      'input-destructive-border': getThemeColor('Error/800'),
      'input-destructive-bg-hover': getThemeColor('Error/900'),
      'input-destructive-fg-hover': getThemeColor('Gray (dark mode)/50'),
      'input-destructive-border-hover': getThemeColor('Error/700'),
      'input-destructive-bg-focus': getThemeColor('Error/950'),
      'input-destructive-fg-focus': getThemeColor('Gray (dark mode)/50'),
      'input-destructive-border-focus': getThemeColor('Error/500'),
      'input-destructive-label': getThemeColor('Error/300'),
      'input-destructive-hint': getThemeColor('Error/400'),
      'input-destructive-icon': getThemeColor('Error/400'),

      // Disabled input
      'input-disabled-bg': getThemeColor('Gray (dark mode)/800'),
      'input-disabled-fg': getThemeColor('Gray (dark mode)/600'),
      'input-disabled-border': getThemeColor('Gray (dark mode)/800'),
      'input-disabled-placeholder': getThemeColor('Gray (dark mode)/600'),
      'input-disabled-label': getThemeColor('Gray (dark mode)/600'),

      // Utility colors
      // Gray
      'utility-gray-50': getThemeColor('Gray (dark mode)/900'),
      'utility-gray-100': getThemeColor('Gray (dark mode)/800'),
      'utility-gray-200': getThemeColor('Gray (dark mode)/700'),
      'utility-gray-300': getThemeColor('Gray (dark mode)/700'),
      'utility-gray-400': getThemeColor('Gray (dark mode)/600'),
      'utility-gray-500': getThemeColor('Gray (dark mode)/500'),
      'utility-gray-600': getThemeColor('Gray (dark mode)/400'),
      'utility-gray-700': getThemeColor('Gray (dark mode)/300'),
      'utility-gray-800': getThemeColor('Gray (dark mode)/200'),
      'utility-gray-900': getThemeColor('Gray (dark mode)/100'),

      // Brand
      'utility-brand-50': getThemeColor('Brand/950'),
      'utility-brand-100': getThemeColor('Brand/900'),
      'utility-brand-200': getThemeColor('Brand/800'),
      'utility-brand-300': getThemeColor('Brand/700'),
      'utility-brand-400': getThemeColor('Brand/600'),
      'utility-brand-500': getThemeColor('Brand/500'),
      'utility-brand-600': getThemeColor('Brand/400'),
      'utility-brand-700': getThemeColor('Brand/300'),
      'utility-brand-800': getThemeColor('Brand/200'),
      'utility-brand-900': getThemeColor('Brand/100'),

      // Error
      'utility-error-50': getThemeColor('Error/950'),
      'utility-error-100': getThemeColor('Error/900'),
      'utility-error-200': getThemeColor('Error/800'),
      'utility-error-300': getThemeColor('Error/700'),
      'utility-error-400': getThemeColor('Error/600'),
      'utility-error-500': getThemeColor('Error/500'),
      'utility-error-600': getThemeColor('Error/400'),
      'utility-error-700': getThemeColor('Error/300'),

      // Warning
      'utility-warning-50': getThemeColor('Warning/950'),
      'utility-warning-100': getThemeColor('Warning/900'),
      'utility-warning-200': getThemeColor('Warning/800'),
      'utility-warning-300': getThemeColor('Warning/700'),
      'utility-warning-400': getThemeColor('Warning/600'),
      'utility-warning-500': getThemeColor('Warning/500'),
      'utility-warning-600': getThemeColor('Warning/400'),
      'utility-warning-700': getThemeColor('Warning/300'),

      // Success
      'utility-success-50': getThemeColor('Success/950'),
      'utility-success-100': getThemeColor('Success/900'),
      'utility-success-200': getThemeColor('Success/800'),
      'utility-success-300': getThemeColor('Success/700'),
      'utility-success-400': getThemeColor('Success/600'),
      'utility-success-500': getThemeColor('Success/500'),
      'utility-success-600': getThemeColor('Success/400'),
      'utility-success-700': getThemeColor('Success/300'),

      // Alpha colors
      'alpha-white-10': 'rgba(12, 17, 29, 0.10)',
      'alpha-white-20': 'rgba(12, 17, 29, 0.20)',
      'alpha-white-30': 'rgba(12, 17, 29, 0.30)',
      'alpha-white-40': 'rgba(12, 17, 29, 0.40)',
      'alpha-white-50': 'rgba(12, 17, 29, 0.50)',
      'alpha-white-60': 'rgba(12, 17, 29, 0.60)',
      'alpha-white-70': 'rgba(12, 17, 29, 0.70)',
      'alpha-white-80': 'rgba(12, 17, 29, 0.80)',
      'alpha-white-90': 'rgba(12, 17, 29, 0.90)',
      'alpha-white-100': getThemeColor('Gray (dark mode)/950'),
      'alpha-black-10': 'rgba(255, 255, 255, 0.10)',
      'alpha-black-20': 'rgba(255, 255, 255, 0.20)',
      'alpha-black-30': 'rgba(255, 255, 255, 0.30)',
      'alpha-black-40': 'rgba(255, 255, 255, 0.40)',
      'alpha-black-50': 'rgba(255, 255, 255, 0.50)',
      'alpha-black-60': 'rgba(255, 255, 255, 0.60)',
      'alpha-black-70': 'rgba(255, 255, 255, 0.70)',
      'alpha-black-80': 'rgba(255, 255, 255, 0.80)',
      'alpha-black-90': 'rgba(255, 255, 255, 0.90)',
      'alpha-black-100': '#ffffff',

      // Shadow colors
      'shadow-xs': 'rgba(12, 17, 29, 0.05)',
      'shadow-sm_01': 'rgba(12, 17, 29, 0.10)',
      'shadow-sm_02': 'rgba(12, 17, 29, 0.06)',
      'shadow-md_01': 'rgba(12, 17, 29, 0.10)',
      'shadow-md_02': 'rgba(12, 17, 29, 0.06)',
      'shadow-lg_01': 'rgba(12, 17, 29, 0.08)',
      'shadow-lg_02': 'rgba(12, 17, 29, 0.03)',
      'shadow-xl_01': 'rgba(12, 17, 29, 0.08)',
      'shadow-xl_02': 'rgba(12, 17, 29, 0.03)',
      'shadow-2xl': 'rgba(12, 17, 29, 0.18)',
      'shadow-3xl': 'rgba(12, 17, 29, 0.14)',
      'shadow-skeumorphic-inner': 'rgba(12, 17, 29, 0.05)',
      'shadow-skeumorphic-inner-border': 'rgba(12, 17, 29, 0.18)',
      'shadow-main-centre-md': 'rgba(12, 17, 29, 0.14)',
      'shadow-main-centre-lg': 'rgba(12, 17, 29, 0.18)',
      'shadow-overlay-lg': 'rgba(12, 17, 29, 0.12)',
      'shadow-grid-md': 'rgba(12, 17, 29, 0.08)',

      // Miscellaneous
      'app-store-badge-border': '#a6a6a6',
      'social-icon-fg-x': getThemeColor('Base/White'),
      'social-icon-fg-instagram': getThemeColor('Base/White'),
      'social-icon-fg-apple': getThemeColor('Base/White'),
      'social-icon-fg-github': getThemeColor('Base/White'),
      'social-icon-fg-angellist': getThemeColor('Base/White'),
      'social-icon-fg-tumblr': getThemeColor('Base/White'),
      'screen-mockup-border': getThemeColor('Gray (dark mode)/700'),
      'slider-handle-bg': getThemeColor('Brand/600'),
      'slider-handle-border': getThemeColor('Gray (dark mode)/900'),
      'thumbnail-badge-brand-fg': getThemeColor('Gray (dark mode)/300'),
      'thumbnail-badge-success-fg': getThemeColor('Gray (dark mode)/300'),
      'toggle-button-fg_disabled': getThemeColor('Gray (dark mode)/600'),
      'tooltip-supporting-text': getThemeColor('Gray (dark mode)/300'),
      'wysiwyg-editor-icon-fg': getThemeColor('Gray (dark mode)/400'),
      'wysiwyg-editor-icon-fg_active': getThemeColor('Base/White'),
    },
    typography: {
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
    },
    spacing: {
      'spacing-xs': '4px',
      'spacing-sm': '8px',
      'spacing-md': '16px',
      'spacing-lg': '24px',
      'spacing-xl': '32px',
    },
    borderRadius: {
      'radius-sm': '4px',
      'radius-md': '8px',
      'radius-lg': '12px',
      'radius-full': '9999px',
    },
    boxShadow: {
      'shadow-sm': '0px 1px 2px rgba(0, 0, 0, 0.3)',
      'shadow-md': '0px 4px 6px -2px rgba(0, 0, 0, 0.3)',
      'shadow-lg': '0px 8px 8px -4px rgba(0, 0, 0, 0.3)',
    },
  },
  assets: {
    icons: {
      'theme-toggle': '/assets/shared_components/moon.svg',
    },
    images: {},
  },
}; 