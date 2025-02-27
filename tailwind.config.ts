import type { Config } from 'tailwindcss';
import { PluginAPI } from 'tailwindcss/types/config';

const myTheme = require('./theme');

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,jsx,ts,tsx}',
    // Add the regex to scan dynamic class strings
    {
      raw: `
        cn('font-medium', 'text-sm'); // Example usage
        cn('text-gray-600', 'bg-red-500');
      `,
      extension: 'js',
    },
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: myTheme.colors,
      fontSize: myTheme.colors.fontSize,
      boxShadow: myTheme.colors.boxShadow,
      borderRadius: myTheme.colors.borderRadius,
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Default 'sans' is now Inter
      },
      spacing: myTheme.spacing,
      backgroundColor: {
        'primary-button': 'var(--button-primary-bg)',
        'primary-button-hover': 'var(--button-primary-bg-hover)',
        'secondary-button': 'var(--button-secondary-bg)',
        'secondary-button-hover': 'var(--button-secondary-bg-hover)',
        // ... add other button backgrounds
      },
      textColor: {
        'primary-button-text': 'var(--button-primary-fg)',
        'secondary-button-text': 'var(--button-secondary-fg)',
        'secondary-button-text-hover': 'var(--button-secondary-fg-hover)',
        // ... add other text colors
      },
      borderColor: {
        'primary-button': 'var(--button-primary-border)',
        'secondary-button': 'var(--button-secondary-border)',
        // ... add other border colors
      },
    },
  },
  variants: {
    extend: {
      borderColor: ['focus'],
    },
  },
  plugins: [
    function (api: PluginAPI) {
      const { addUtilities } = api;
      addUtilities({
        '.hide-scrollbar': {
          'scrollbar-width': 'none', /* For Firefox */
          '-ms-overflow-style': 'none', /* For Internet Explorer and Edge */
        },
        '.hide-scrollbar::-webkit-scrollbar': {
          display: 'none', /* For Chrome, Safari, and Edge */
        },
        '.resize-x': {
          resize: 'horizontal',
          overflow: 'auto', // Ensure the content can overflow
        },
        '.custom-border-left-top': {
          position: 'relative',
        },
        '.custom-border-left-top::before': {
          content: '""',
          position: 'absolute',
          top: '-80px',
          left: '50%',
          width: '3px',
          height: 'calc(10% + 80px)',
          backgroundColor: '#98A2B3',
          borderTopLeftRadius: '100px',
          borderBottomLeftRadius: '100px',
          zIndex: '-1',
        },
        '.custom-border-left-top::after': {
          content: '""',
          position: 'absolute',
          top: '-80px',
          left: '50%',
          width: 'calc(50% + 240px)',
          height: '2px',
          backgroundColor: '#98A2B3',
          borderTopLeftRadius: '100px',
          borderTopRightRadius: '100px',
          zIndex: '-1',
        },
        '.custom-border-right-top': {
          position: 'relative',
        },
        '.custom-border-right-top::before': {
          content: '""',
          position: 'absolute',
          top: '-80px',
          right: '50%',
          width: '2px',
          height: 'calc(10% + 80px)',
          backgroundColor: '#98A2B3',
          borderTopRightRadius: '100px',
          borderBottomRightRadius: '100px',
          zIndex: '-1',
        },
        '.custom-border-right-top::after': {
          content: '""',
          position: 'absolute',
          top: '-80px',
          right: '50%',
          width: 'calc(50% + 240px)',
          height: '2px',
          backgroundColor: '#98A2B3',
          borderTopLeftRadius: '100px',
          borderTopRightRadius: '100px',
          zIndex: '-1',
        },
        '.custom-border-middle-top': {
          position: 'relative',
        },
        '.custom-border-middle-top::after': {
          content: '""',
          position: 'absolute',
          top: '-80px',
          left: '0',
          width: 'calc(100% + 240px)' /* Full width */,
          height: '2px',
          backgroundColor: '#98A2B3',
          borderTopLeftRadius: '100px',
          borderTopRightRadius: '100px',
          zIndex: '-1',
        },
        '.custom-border-middle-side': {
          position: 'relative',
        },
        '.custom-border-middle-side::before': {
          content: '""',
          position: 'absolute',
          top: '0px',
          left: '50%',
          transform: 'translateY(-50%)',
          width: '2px',
          height: 'calc(160px)',
          backgroundColor: '#98A2B3',
          borderTopLeftRadius: '100px',
          borderTopRightRadius: '100px',
          zIndex: '-1',
        },
      });
    },
  ],
};

export default config;
