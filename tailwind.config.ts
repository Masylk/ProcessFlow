import type { Config } from 'tailwindcss';

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
  plugins: [],
};

export default config;
