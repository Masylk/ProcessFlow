// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e', // only run tests in this folder
  timeout: 30 * 1000,
  retries: 0,
  use: {
    headless: true,
    baseURL: 'http://localhost:3000', // adjust to your app
    viewport: { width: 1280, height: 720 },
  },
});
