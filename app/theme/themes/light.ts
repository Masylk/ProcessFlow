import { Theme } from '../types';

// Import the base theme colors
import baseTheme from '@/theme';

// Create a type for the theme.js color paths
type ThemeColorPath = keyof typeof baseTheme.colors;

// Utility function to get color from theme.js
const getThemeColor = (path: ThemeColorPath): string => {
  return baseTheme.colors[path];
};

export const lightTheme: Theme = {
  name: 'light',
  label: 'Light Mode',
  tokens: {
    colors: {
      // Text colors
      'text-primary': getThemeColor('Gray (light mode)/900'),
      'text-primary_on-brand': getThemeColor('Base/White'),
      'text-secondary': getThemeColor('Gray (light mode)/700'),
      'text-secondary_hover': getThemeColor('Gray (light mode)/800'),
      'text-secondary_on-brand': getThemeColor('Brand/200'),
      'text-tertiary': getThemeColor('Gray (light mode)/600'),
      'text-tertiary_hover': getThemeColor('Gray (light mode)/700'),
      'text-tertiary_on-brand': getThemeColor('Brand/200'),
      'text-quaternary': getThemeColor('Gray (light mode)/500'),
      'text-quaternary_on-brand': getThemeColor('Brand/300'),
      'text-white': getThemeColor('Base/White'),
      'text-disabled': getThemeColor('Gray (light mode)/500'),
      'text-placeholder': getThemeColor('Gray (light mode)/500'),
      'text-placeholder_subtle': getThemeColor('Gray (light mode)/300'),
      'text-brand-primary': getThemeColor('Brand/900'),
      'text-brand-secondary': getThemeColor('Brand/700'),
      'text-brand-tertiary': getThemeColor('Brand/600'),
      'text-brand-tertiary_alt': getThemeColor('Brand/600'),
      'text-error-primary': getThemeColor('Error/600'),
      'text-warning-primary': getThemeColor('Warning/600'),
      'text-success-primary': getThemeColor('Success/600'),

      // Border colors
      'border-primary': getThemeColor('Gray (light mode)/300'),
      'border-secondary': getThemeColor('Gray (light mode)/200'),
      'border-tertiary': getThemeColor('Gray (light mode)/100'),
      'border-disabled': getThemeColor('Gray (light mode)/300'),
      'border-disabled_subtle': getThemeColor('Gray (light mode)/200'),
      'border-brand': getThemeColor('Brand/500'),
      'border-brand_alt': getThemeColor('Brand/600'),
      'border-error': getThemeColor('Error/500'),
      'border-error_subtle': getThemeColor('Error/300'),

      // Base colors
      'base-white': getThemeColor('Base/White'),
      'base-black': getThemeColor('Base/Black'),
      
      // Foreground colors
      'fg-primary': getThemeColor('Gray (light mode)/900'),
      'fg-secondary': getThemeColor('Gray (light mode)/700'),
      'fg-secondary_hover': getThemeColor('Gray (light mode)/800'),
      'fg-tertiary': getThemeColor('Gray (light mode)/600'),
      'fg-tertiary_hover': getThemeColor('Gray (light mode)/700'),
      'fg-quaternary': getThemeColor('Gray (light mode)/500'),
      'fg-quaternary_hover': getThemeColor('Gray (light mode)/600'),
      'fg-quinary': getThemeColor('Gray (light mode)/400'),
      'fg-quinary_hover': getThemeColor('Gray (light mode)/500'),
      'fg-senary': getThemeColor('Gray (light mode)/300'),
      'fg-white': getThemeColor('Base/White'),
      'fg-disabled': getThemeColor('Gray (light mode)/400'),
      'fg-disabled_subtle': getThemeColor('Gray (light mode)/300'),
      'fg-brand-primary': getThemeColor('Brand/600'),
      'fg-brand-primary_alt': getThemeColor('Brand/600'),
      'fg-brand-secondary': getThemeColor('Brand/500'),
      'fg-error-primary': getThemeColor('Error/600'),
      'fg-error-secondary': getThemeColor('Error/500'),
      'fg-warning-primary': getThemeColor('Warning/600'),
      'fg-warning-secondary': getThemeColor('Warning/500'),
      'fg-success-primary': getThemeColor('Success/600'),
      'fg-success-secondary': getThemeColor('Success/500'),

      // Background colors
      'bg-primary': getThemeColor('Base/White'),
      'bg-primary_alt': getThemeColor('Base/White'),
      'bg-primary_hover': getThemeColor('Gray (light mode)/100'),
      'bg-primary-solid': getThemeColor('Gray (light mode)/950'),
      'bg-secondary': getThemeColor('Gray (light mode)/50'),
      'bg-secondary_alt': getThemeColor('Gray (light mode)/50'),
      'bg-secondary_hover': getThemeColor('Gray (light mode)/200'),
      'bg-secondary_subtle': getThemeColor('Gray (light mode)/25'),
      'bg-secondary-solid': getThemeColor('Gray (light mode)/600'),
      'bg-tertiary': getThemeColor('Gray (light mode)/100'),
      'bg-quaternary': getThemeColor('Gray (light mode)/200'),
      'bg-active': getThemeColor('Gray (light mode)/200'),
      'bg-disabled': getThemeColor('Gray (light mode)/100'),
      'bg-disabled_subtle': getThemeColor('Gray (light mode)/50'),
      'bg-overlay': getThemeColor('Gray (light mode)/950'),
      'bg-brand-primary': getThemeColor('Brand/50'),
      'bg-brand-primary_alt': getThemeColor('Brand/50'),
      'bg-brand-secondary': getThemeColor('Brand/100'),
      'bg-brand-solid': getThemeColor('Brand/600'),
      'bg-brand-solid_hover': getThemeColor('Brand/700'),
      'bg-brand-section': getThemeColor('Brand/800'),
      'bg-brand-section_subtle': getThemeColor('Brand/700'),
      'bg-error-primary': getThemeColor('Error/50'),
      'bg-error-secondary': getThemeColor('Error/100'),
      'bg-error-solid': getThemeColor('Error/600'),
      'bg-warning-primary': getThemeColor('Warning/50'),
      'bg-warning-secondary': getThemeColor('Warning/100'),
      'bg-warning-solid': getThemeColor('Warning/600'),
      'bg-success-primary': getThemeColor('Success/50'),
      'bg-success-secondary': getThemeColor('Success/100'),
      'bg-success-solid': getThemeColor('Success/600'),
      
      // Primary button tokens
      'button-primary-bg': getThemeColor('Brand/500'),
      'button-primary-fg': getThemeColor('Base/White'),
      'button-primary-border': getThemeColor('Brand/500'),
      'button-primary-bg-hover': getThemeColor('Brand/600'),
      'button-primary-fg-hover': getThemeColor('Base/White'),
      'button-primary-border-hover': getThemeColor('Brand/600'),
      
      // Secondary button tokens
      'button-secondary-bg': getThemeColor('Base/White'),
      'button-secondary-fg': getThemeColor('Gray (light mode)/700'),
      'button-secondary-border': getThemeColor('Gray (light mode)/300'),
      'button-secondary-bg-hover': getThemeColor('Gray (light mode)/100'),
      'button-secondary-fg-hover': getThemeColor('Gray (light mode)/800'),
      'button-secondary-border-hover': getThemeColor('Gray (light mode)/300'),
      
      // Secondary color button tokens
      'button-secondary-color-bg': getThemeColor('Brand/50'),
      'button-secondary-color-fg': getThemeColor('Brand/500'),
      'button-secondary-color-border': getThemeColor('Brand/100'),
      'button-secondary-color-bg-hover': getThemeColor('Brand/100'),
      'button-secondary-color-fg-hover': getThemeColor('Brand/600'),
      'button-secondary-color-border-hover': getThemeColor('Brand/200'),
      
      // Tertiary button tokens
      'button-tertiary-bg': 'transparent',
      'button-tertiary-fg': getThemeColor('Gray (light mode)/700'),
      'button-tertiary-border': 'transparent',
      'button-tertiary-bg-hover': getThemeColor('Gray (light mode)/100'),
      'button-tertiary-fg-hover': getThemeColor('Gray (light mode)/800'),
      'button-tertiary-border-hover': 'transparent',
      
      // Tertiary color button tokens
      'button-tertiary-color-bg': 'transparent',
      'button-tertiary-color-fg': getThemeColor('Brand/500'),
      'button-tertiary-color-border': 'transparent',
      'button-tertiary-color-bg-hover': getThemeColor('Brand/50'),
      'button-tertiary-color-fg-hover': getThemeColor('Brand/600'),
      'button-tertiary-color-border-hover': 'transparent',
      
      // Destructive button tokens
      // Primary destructive
      'button-destructive-primary-bg': getThemeColor('Error/600'),
      'button-destructive-primary-fg': getThemeColor('Base/White'),
      'button-destructive-primary-border': getThemeColor('Error/600'),
      'button-destructive-primary-bg-hover': getThemeColor('Error/700'),
      'button-destructive-primary-fg-hover': getThemeColor('Base/White'),
      'button-destructive-primary-border-hover': getThemeColor('Error/700'),

      // Secondary destructive
      'button-destructive-secondary-bg': getThemeColor('Base/White'),
      'button-destructive-secondary-fg': getThemeColor('Error/700'),
      'button-destructive-secondary-border': getThemeColor('Error/300'),
      'button-destructive-secondary-bg-hover': getThemeColor('Error/50'),
      'button-destructive-secondary-fg-hover': getThemeColor('Error/800'),
      'button-destructive-secondary-border-hover': getThemeColor('Error/300'),

      // Tertiary destructive
      'button-destructive-tertiary-bg': 'transparent',
      'button-destructive-tertiary-fg': getThemeColor('Error/700'),
      'button-destructive-tertiary-border': 'transparent',
      'button-destructive-tertiary-bg-hover': getThemeColor('Error/50'),
      'button-destructive-tertiary-fg-hover': getThemeColor('Error/800'),
      'button-destructive-tertiary-border-hover': 'transparent',
      
      // Loading spinner
      'button-loading-spinner': getThemeColor('Base/White'),

      // Icon colors
      'icon-default': getThemeColor('Gray (light mode)/600'),
      'icon-default-hover': getThemeColor('Gray (light mode)/800'),
      'icon-primary': getThemeColor('Gray (light mode)/700'),
      'icon-primary-hover': getThemeColor('Gray (light mode)/900'),
      'icon-secondary': getThemeColor('Gray (light mode)/600'),
      'icon-secondary-hover': getThemeColor('Gray (light mode)/800'),
      'icon-tertiary': getThemeColor('Gray (light mode)/600'),
      'icon-tertiary-hover': getThemeColor('Gray (light mode)/800'),
      'icon-success': getThemeColor('Success/600'),
      'icon-success-hover': getThemeColor('Success/700'),
      'icon-warning': getThemeColor('Warning/600'), 
      'icon-warning-hover': getThemeColor('Warning/700'),
      'icon-error': getThemeColor('Error/600'),
      'icon-error-hover': getThemeColor('Error/700'),
      'icon-info': getThemeColor('Brand/600'),
      'icon-info-hover': getThemeColor('Brand/700'),

      // Input field tokens
      // Default input
      'input-bg': getThemeColor('Base/White'),
      'input-fg': getThemeColor('Gray (light mode)/900'),
      'input-border': getThemeColor('Gray (light mode)/300'),
      'input-bg-hover': getThemeColor('Gray (light mode)/50'),
      'input-fg-hover': getThemeColor('Gray (light mode)/900'),
      'input-border-hover': getThemeColor('Gray (light mode)/300'),
      'input-bg-focus': getThemeColor('Base/White'),
      'input-fg-focus': getThemeColor('Gray (light mode)/900'),
      'input-border-focus': getThemeColor('Brand/600'),
      'input-placeholder': getThemeColor('Gray (light mode)/500'),
      'input-label': getThemeColor('Gray (light mode)/700'),
      'input-hint': getThemeColor('Gray (light mode)/600'),
      'input-icon': getThemeColor('Gray (light mode)/500'),
      'input-prefix': getThemeColor('Gray (light mode)/500'),

      // Destructive input
      'input-destructive-bg': getThemeColor('Error/50'),
      'input-destructive-fg': getThemeColor('Gray (light mode)/900'),
      'input-destructive-border': getThemeColor('Error/300'),
      'input-destructive-bg-hover': getThemeColor('Error/50'),
      'input-destructive-fg-hover': getThemeColor('Gray (light mode)/900'),
      'input-destructive-border-hover': getThemeColor('Error/300'),
      'input-destructive-bg-focus': getThemeColor('Base/White'),
      'input-destructive-fg-focus': getThemeColor('Gray (light mode)/900'),
      'input-destructive-border-focus': getThemeColor('Error/500'),
      'input-destructive-label': getThemeColor('Error/700'),
      'input-destructive-hint': getThemeColor('Error/600'),
      'input-destructive-icon': getThemeColor('Error/500'),

      // Disabled input
      'input-disabled-bg': getThemeColor('Gray (light mode)/50'),
      'input-disabled-fg': getThemeColor('Gray (light mode)/500'),
      'input-disabled-border': getThemeColor('Gray (light mode)/200'),
      'input-disabled-placeholder': getThemeColor('Gray (light mode)/500'),
      'input-disabled-label': getThemeColor('Gray (light mode)/500'),

      // Utility colors
      // Gray
      'utility-gray-50': getThemeColor('Gray (light mode)/50'),
      'utility-gray-100': getThemeColor('Gray (light mode)/100'),
      'utility-gray-200': getThemeColor('Gray (light mode)/200'),
      'utility-gray-300': getThemeColor('Gray (light mode)/300'),
      'utility-gray-400': getThemeColor('Gray (light mode)/400'),
      'utility-gray-500': getThemeColor('Gray (light mode)/500'),
      'utility-gray-600': getThemeColor('Gray (light mode)/600'),
      'utility-gray-700': getThemeColor('Gray (light mode)/700'),
      'utility-gray-800': getThemeColor('Gray (light mode)/800'),
      'utility-gray-900': getThemeColor('Gray (light mode)/900'),

      // Brand
      'utility-brand-50': getThemeColor('Brand/50'),
      'utility-brand-50_alt': getThemeColor('Brand/50'),
      'utility-brand-100': getThemeColor('Brand/100'),
      'utility-brand-100_alt': getThemeColor('Brand/100'),
      'utility-brand-200': getThemeColor('Brand/200'),
      'utility-brand-200_alt': getThemeColor('Brand/200'),
      'utility-brand-300': getThemeColor('Brand/300'),
      'utility-brand-300_alt': getThemeColor('Brand/300'),
      'utility-brand-400': getThemeColor('Brand/400'),
      'utility-brand-400_alt': getThemeColor('Brand/400'),
      'utility-brand-500': getThemeColor('Brand/500'),
      'utility-brand-500_alt': getThemeColor('Brand/500'),
      'utility-brand-600': getThemeColor('Brand/600'),
      'utility-brand-600_alt': getThemeColor('Brand/600'),
      'utility-brand-700': getThemeColor('Brand/700'),
      'utility-brand-700_alt': getThemeColor('Brand/700'),
      'utility-brand-800': getThemeColor('Brand/800'),
      'utility-brand-800_alt': getThemeColor('Brand/800'),
      'utility-brand-900': getThemeColor('Brand/900'),
      'utility-brand-900_alt': getThemeColor('Brand/900'),

      // Error
      'utility-error-50': getThemeColor('Error/50'),
      'utility-error-100': getThemeColor('Error/100'),
      'utility-error-200': getThemeColor('Error/200'),
      'utility-error-300': getThemeColor('Error/300'),
      'utility-error-400': getThemeColor('Error/400'),
      'utility-error-500': getThemeColor('Error/500'),
      'utility-error-600': getThemeColor('Error/600'),
      'utility-error-700': getThemeColor('Error/700'),

      // Warning
      'utility-warning-50': getThemeColor('Warning/50'),
      'utility-warning-100': getThemeColor('Warning/100'),
      'utility-warning-200': getThemeColor('Warning/200'),
      'utility-warning-300': getThemeColor('Warning/300'),
      'utility-warning-400': getThemeColor('Warning/400'),
      'utility-warning-500': getThemeColor('Warning/500'),
      'utility-warning-600': getThemeColor('Warning/600'),
      'utility-warning-700': getThemeColor('Warning/700'),

      // Success
      'utility-success-50': getThemeColor('Success/50'),
      'utility-success-100': getThemeColor('Success/100'),
      'utility-success-200': getThemeColor('Success/200'),
      'utility-success-300': getThemeColor('Success/300'),
      'utility-success-400': getThemeColor('Success/400'),
      'utility-success-500': getThemeColor('Success/500'),
      'utility-success-600': getThemeColor('Success/600'),
      'utility-success-700': getThemeColor('Success/700'),

      // Gray Blue
      'utility-gray-blue-50': getThemeColor('Gray blue/50'),
      'utility-gray-blue-100': getThemeColor('Gray blue/100'),
      'utility-gray-blue-200': getThemeColor('Gray blue/200'),
      'utility-gray-blue-300': getThemeColor('Gray blue/300'),
      'utility-gray-blue-400': getThemeColor('Gray blue/400'),
      'utility-gray-blue-500': getThemeColor('Gray blue/500'),
      'utility-gray-blue-600': getThemeColor('Gray blue/600'),
      'utility-gray-blue-700': getThemeColor('Gray blue/700'),

      // Blue Light
      'utility-blue-light-50': getThemeColor('Blue light/50'),
      'utility-blue-light-100': getThemeColor('Blue light/100'),
      'utility-blue-light-200': getThemeColor('Blue light/200'),
      'utility-blue-light-300': getThemeColor('Blue light/300'),
      'utility-blue-light-400': getThemeColor('Blue light/400'),
      'utility-blue-light-500': getThemeColor('Blue light/500'),
      'utility-blue-light-600': getThemeColor('Blue light/600'),
      'utility-blue-light-700': getThemeColor('Blue light/700'),

      // Blue
      'utility-blue-50': getThemeColor('Blue/50'),
      'utility-blue-100': getThemeColor('Blue/100'),
      'utility-blue-200': getThemeColor('Blue/200'),
      'utility-blue-300': getThemeColor('Blue/300'),
      'utility-blue-400': getThemeColor('Blue/400'),
      'utility-blue-500': getThemeColor('Blue/500'),
      'utility-blue-600': getThemeColor('Blue/600'),
      'utility-blue-700': getThemeColor('Blue/700'),

      // Blue Dark
      'utility-blue-dark-50': getThemeColor('Blue dark/50'),
      'utility-blue-dark-100': getThemeColor('Blue dark/100'),
      'utility-blue-dark-200': getThemeColor('Blue dark/200'),
      'utility-blue-dark-300': getThemeColor('Blue dark/300'),
      'utility-blue-dark-400': getThemeColor('Blue dark/400'),
      'utility-blue-dark-500': getThemeColor('Blue dark/500'),
      'utility-blue-dark-600': getThemeColor('Blue dark/600'),
      'utility-blue-dark-700': getThemeColor('Blue dark/700'),

      // Indigo
      'utility-indigo-50': getThemeColor('Indigo/50'),
      'utility-indigo-100': getThemeColor('Indigo/100'),
      'utility-indigo-200': getThemeColor('Indigo/200'),
      'utility-indigo-300': getThemeColor('Indigo/300'),
      'utility-indigo-400': getThemeColor('Indigo/400'),
      'utility-indigo-500': getThemeColor('Indigo/500'),
      'utility-indigo-600': getThemeColor('Indigo/600'),
      'utility-indigo-700': getThemeColor('Indigo/700'),

      // Purple
      'utility-purple-50': getThemeColor('Purple/50'),
      'utility-purple-100': getThemeColor('Purple/100'),
      'utility-purple-200': getThemeColor('Purple/200'),
      'utility-purple-300': getThemeColor('Purple/300'),
      'utility-purple-400': getThemeColor('Purple/400'),
      'utility-purple-500': getThemeColor('Purple/500'),
      'utility-purple-600': getThemeColor('Purple/600'),
      'utility-purple-700': getThemeColor('Purple/700'),

      // Fuchsia
      'utility-fuchsia-50': getThemeColor('Fuchsia/50'),
      'utility-fuchsia-100': getThemeColor('Fuchsia/100'),
      'utility-fuchsia-200': getThemeColor('Fuchsia/200'),
      'utility-fuchsia-300': getThemeColor('Fuchsia/300'),
      'utility-fuchsia-400': getThemeColor('Fuchsia/400'),
      'utility-fuchsia-500': getThemeColor('Fuchsia/500'),
      'utility-fuchsia-600': getThemeColor('Fuchsia/600'),
      'utility-fuchsia-700': getThemeColor('Fuchsia/700'),

      // Pink
      'utility-pink-50': getThemeColor('Pink/50'),
      'utility-pink-100': getThemeColor('Pink/100'),
      'utility-pink-200': getThemeColor('Pink/200'),
      'utility-pink-300': getThemeColor('Pink/300'),
      'utility-pink-400': getThemeColor('Pink/400'),
      'utility-pink-500': getThemeColor('Pink/500'),
      'utility-pink-600': getThemeColor('Pink/600'),
      'utility-pink-700': getThemeColor('Pink/700'),

      // Orange Dark
      'utility-orange-dark-50': getThemeColor('Orange dark/50'),
      'utility-orange-dark-100': getThemeColor('Orange dark/100'),
      'utility-orange-dark-200': getThemeColor('Orange dark/200'),
      'utility-orange-dark-300': getThemeColor('Orange dark/300'),
      'utility-orange-dark-400': getThemeColor('Orange dark/400'),
      'utility-orange-dark-500': getThemeColor('Orange dark/500'),
      'utility-orange-dark-600': getThemeColor('Orange dark/600'),
      'utility-orange-dark-700': getThemeColor('Orange dark/700'),

      // Orange
      'utility-orange-50': getThemeColor('Orange/50'),
      'utility-orange-100': getThemeColor('Orange/100'),
      'utility-orange-200': getThemeColor('Orange/200'),
      'utility-orange-300': getThemeColor('Orange/300'),
      'utility-orange-400': getThemeColor('Orange/400'),
      'utility-orange-500': getThemeColor('Orange/500'),
      'utility-orange-600': getThemeColor('Orange/600'),
      'utility-orange-700': getThemeColor('Orange/700'),

      // Alpha colors
      'alpha-white-10': 'rgba(255, 255, 255, 0.10)',
      'alpha-white-20': 'rgba(255, 255, 255, 0.20)',
      'alpha-white-30': 'rgba(255, 255, 255, 0.30)',
      'alpha-white-40': 'rgba(255, 255, 255, 0.40)',
      'alpha-white-50': 'rgba(255, 255, 255, 0.50)',
      'alpha-white-60': 'rgba(255, 255, 255, 0.60)',
      'alpha-white-70': 'rgba(255, 255, 255, 0.70)',
      'alpha-white-80': 'rgba(255, 255, 255, 0.80)',
      'alpha-white-90': 'rgba(255, 255, 255, 0.90)',
      'alpha-white-100': '#ffffff',
      'alpha-black-10': 'rgba(0, 0, 0, 0.10)',
      'alpha-black-20': 'rgba(0, 0, 0, 0.20)',
      'alpha-black-30': 'rgba(0, 0, 0, 0.30)',
      'alpha-black-40': 'rgba(0, 0, 0, 0.40)',
      'alpha-black-50': 'rgba(0, 0, 0, 0.50)',
      'alpha-black-60': 'rgba(0, 0, 0, 0.60)',
      'alpha-black-70': 'rgba(0, 0, 0, 0.70)',
      'alpha-black-80': 'rgba(0, 0, 0, 0.80)',
      'alpha-black-90': 'rgba(0, 0, 0, 0.90)',
      'alpha-black-100': '#000000',

      // Shadow colors
      'shadow-xs': 'rgba(16, 24, 40, 0.05)',
      'shadow-sm_01': 'rgba(16, 24, 40, 0.10)',
      'shadow-sm_02': 'rgba(16, 24, 40, 0.06)',
      'shadow-md_01': 'rgba(16, 24, 40, 0.10)',
      'shadow-md_02': 'rgba(16, 24, 40, 0.06)',
      'shadow-lg_01': 'rgba(16, 24, 40, 0.08)',
      'shadow-lg_02': 'rgba(16, 24, 40, 0.03)',
      'shadow-xl_01': 'rgba(16, 24, 40, 0.08)',
      'shadow-xl_02': 'rgba(16, 24, 40, 0.03)',
      'shadow-2xl': 'rgba(16, 24, 40, 0.18)',
      'shadow-3xl': 'rgba(16, 24, 40, 0.14)',
      'shadow-skeumorphic-inner': 'rgba(16, 24, 40, 0.05)',
      'shadow-skeumorphic-inner-border': 'rgba(16, 24, 40, 0.18)',
      'shadow-main-centre-md': 'rgba(16, 24, 40, 0.14)',
      'shadow-main-centre-lg': 'rgba(16, 24, 40, 0.18)',
      'shadow-overlay-lg': 'rgba(16, 24, 40, 0.12)',
      'shadow-grid-md': 'rgba(16, 24, 40, 0.08)',

      // Miscellaneous
      'app-store-badge-border': '#a6a6a6',
      'social-icon-fg-x': '#242e36',
      'social-icon-fg-instagram': '#000100',
      'social-icon-fg-apple': getThemeColor('Base/Black'),
      'social-icon-fg-github': getThemeColor('Base/Black'),
      'social-icon-fg-angellist': getThemeColor('Base/Black'),
      'social-icon-fg-tumblr': '#001935',
      'screen-mockup-border': getThemeColor('Gray (light mode)/900'),
      'slider-handle-bg': getThemeColor('Base/White'),
      'slider-handle-border': getThemeColor('Brand/600'),
      'thumbnail-badge-brand-fg': getThemeColor('Brand/700'),
      'thumbnail-badge-success-fg': getThemeColor('Success/700'),
      'toggle-button-fg_disabled': getThemeColor('Gray (light mode)/50'),
      'tooltip-supporting-text': getThemeColor('Gray (light mode)/300'),
      'wysiwyg-editor-icon-fg': getThemeColor('Gray (light mode)/400'),
      'wysiwyg-editor-icon-fg_active': getThemeColor('Gray (light mode)/500'),

      // Breadcrumb tokens
      'breadcrumb-active-bg': getThemeColor('Brand/50'),
      'breadcrumb-active-fg': getThemeColor('Brand/700'),
      'breadcrumb-inactive-fg': getThemeColor('Gray (light mode)/600'),
      'breadcrumb-separator': getThemeColor('Gray (light mode)/400'),
      'breadcrumb-hover-opacity': '0.75',
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
      'shadow-sm': '0px 1px 2px rgba(16, 24, 40, 0.05)',
      'shadow-md': '0px 4px 6px -2px rgba(16, 24, 40, 0.05)',
      'shadow-lg': '0px 8px 8px -4px rgba(16, 24, 40, 0.05)',
    },
  },
  assets: {
    icons: {
      'theme-toggle': '/assets/shared_components/sun.svg',
    },
    images: {},
  },
}; 