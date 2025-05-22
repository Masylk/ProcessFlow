const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Chemin vers votre app Next.js
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Gestion des alias de chemins de votre tsconfig.json
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Configuration spécifique pour TypeScript
  // transform: {
  //   '^.+\\.(ts|tsx)$': ['ts-jest', {
  //     tsconfig: 'tsconfig.json',
  //   }],
  // },
  // Patterns des fichiers de test
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  // Ignore e2e tests for Jest
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
  // Couverture de code
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/_*.{js,jsx,ts,tsx}',
    '!app/**/*.stories.{js,jsx,ts,tsx}',
  ],
};

module.exports = createJestConfig(customJestConfig);
