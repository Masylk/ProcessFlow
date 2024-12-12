import type { Config } from 'tailwindcss';
import { PluginAPI } from 'tailwindcss/types/config';

const myTheme = require('./theme');

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,jsx,ts,tsx}', // Added this line
  ],
  theme: {
    extend: {
      colors: myTheme.colors,
      fontSize: myTheme.fontSize,
      boxShadow: myTheme.boxShadow,
      borderRadius: myTheme.borderRadius,
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Default 'sans' is now Inter
      },
    },
  },
  plugins: [
    function (api: PluginAPI) {
      const { addUtilities } = api;
      addUtilities({
        '.hide-scrollbar': {
          'scrollbar-width': 'none' /* For Firefox */,
          '-ms-overflow-style': 'none' /* For Internet Explorer and Edge */,
        },
        '.hide-scrollbar::-webkit-scrollbar': {
          display: 'none' /* For Chrome, Safari, and Edge */,
        },
      });
    },
  ],
};

export default config;
