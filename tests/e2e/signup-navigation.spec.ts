import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

test.use({
  ...(BYPASS && {
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': BYPASS,
    },
  }),
});

test('should navigate to signup page when clicking Sign up link', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);

  await page.getByRole('textbox', { name: '••••••••' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('');
  await page.getByRole('textbox', { name: '••••••••' }).click();

  await page.getByRole('link', { name: 'Sign up' }).click();

  // Wait for navigation and assert the URL contains '/signup'
  await expect(page).toHaveURL(/\/signup$/);
});
