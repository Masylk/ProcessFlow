/**
 * E2E Test Helper Functions
 * Reusable utilities to reduce code duplication in step definitions
 */

import { Page, Locator } from '@playwright/test';
import { TIMEOUTS, SELECTORS, DEBUG_PATHS, TEST_DATA } from './constants';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

/**
 * Page state checks
 */
export async function isOnUnauthorizedPage(page: Page): Promise<boolean> {
  return page.url().includes(SELECTORS.UNAUTHORIZED_PAGE);
}

export async function isOnLoginPage(page: Page): Promise<boolean> {
  return page.url().includes(SELECTORS.LOGIN_PAGE);
}

export async function isOnEditPage(page: Page): Promise<boolean> {
  return page.url().includes(SELECTORS.EDIT_PAGE);
}

/**
 * Check if current page requires skipping (unauthorized or login redirect)
 */
export async function shouldSkipStep(page: Page, stepName: string): Promise<boolean> {
  const currentUrl = page.url();
  
  if (currentUrl.includes(SELECTORS.UNAUTHORIZED_PAGE)) {
    console.log(`⚠️ On unauthorized page - skipping step: ${stepName}`);
    return true;
  }
  
  if (currentUrl.includes(SELECTORS.LOGIN_PAGE)) {
    console.log(`⚠️ Redirected to login page - skipping step: ${stepName}`);
    return true;
  }
  
  return false;
}

/**
 * Element finding with fallback selectors
 */
export async function findElementWithFallbacks(
  page: Page,
  selectors: string[],
  timeout: number = TIMEOUTS.MEDIUM
): Promise<Locator | null> {
  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      await element.waitFor({ timeout, state: 'visible' });
      return element;
    } catch (e) {
      // Continue to next selector
      continue;
    }
  }
  return null;
}

/**
 * Safe element waiting with error handling
 */
export async function waitForElementSafely(
  page: Page,
  selectors: string[],
  timeout: number = TIMEOUTS.MEDIUM
): Promise<boolean> {
  try {
    const element = await findElementWithFallbacks(page, selectors, timeout);
    return element !== null;
  } catch (e) {
    return false;
  }
}

/**
 * Take debug screenshot with standard naming
 */
export async function takeDebugScreenshot(
  page: Page,
  debugPath: string,
  fullPage: boolean = true
): Promise<void> {
  try {
    await page.screenshot({ path: debugPath, fullPage });
    console.log(`📸 Debug screenshot saved: ${debugPath}`);
  } catch (e) {
    console.warn(`⚠️ Failed to take screenshot: ${e}`);
  }
}

/**
 * Log page state for debugging
 */
export async function logPageState(page: Page, context: string = ''): Promise<void> {
  try {
    const url = page.url();
    const title = await page.title();
    console.log(`📍 Page state ${context ? `(${context})` : ''}`);
    console.log(`   URL: ${url}`);
    console.log(`   Title: ${title}`);
  } catch (e) {
    console.warn(`⚠️ Failed to log page state: ${e}`);
  }
}

/**
 * Check for error messages on page
 */
export async function checkForErrors(page: Page): Promise<{ hasError: boolean; errorText: string }> {
  for (const selector of SELECTORS.ERROR_ELEMENTS) {
    try {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        const text = await element.first().textContent();
        if (text && text.trim().length > 0 && 
            (text.toLowerCase().includes('invalid') || 
             text.toLowerCase().includes('wrong') || 
             text.toLowerCase().includes('incorrect') ||
             text.toLowerCase().includes('failed'))) {
          return { hasError: true, errorText: text };
        }
      }
    } catch (e) {
      // Continue checking other selectors
    }
  }
  return { hasError: false, errorText: '' };
}

/**
 * Enhanced login function with better error handling
 */
export async function login(page: Page, email?: string, password?: string): Promise<void> {
  const loginEmail = email || TEST_DATA.DEVELOPMENT_CREDENTIALS.EMAIL;
  const loginPassword = password || TEST_DATA.DEVELOPMENT_CREDENTIALS.PASSWORD;
  
  try {
    console.log('🔐 Starting login process...');
    await page.goto(`${BASE_URL}/login`);
    
    // Wait for login form
    await page.waitForSelector(SELECTORS.EMAIL_INPUT, { timeout: TIMEOUTS.VERY_LONG });
    
    // Fill credentials
    await page.fill(SELECTORS.EMAIL_INPUT, loginEmail);
    await page.fill(SELECTORS.PASSWORD_INPUT, loginPassword);
    
    // Submit form
    await page.locator(SELECTORS.SUBMIT_BUTTON).click({ force: true });
    
    // Wait briefly for form processing
    await page.waitForTimeout(TIMEOUTS.MEDIUM);
    
    // Check for errors
    const { hasError, errorText } = await checkForErrors(page);
    if (hasError) {
      await takeDebugScreenshot(page, DEBUG_PATHS.LOGIN_ERROR);
      throw new Error(`Login failed with error: ${errorText}`);
    }
    
    // Wait for navigation away from login
    try {
      await page.waitForURL(url => {
        const urlString = typeof url === 'string' ? url : url.toString();
        return !urlString.includes('/login');
      }, { timeout: TIMEOUTS.VERY_LONG });
      
      console.log('✅ Login successful');
    } catch (navError) {
      // Check if we're already logged in but still on login page
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        await takeDebugScreenshot(page, DEBUG_PATHS.LOGIN_FINAL);
        throw new Error('Login failed: Still on login page after timeout');
      }
    }
  } catch (error) {
    await logPageState(page, 'login failed');
    await takeDebugScreenshot(page, DEBUG_PATHS.LOGIN_FAILED);
    throw error;
  }
}

/**
 * Get page options with bypass headers if needed
 */
export function getPageOptions() {
  return BYPASS
    ? { extraHTTPHeaders: { 'x-vercel-protection-bypass': BYPASS } }
    : {};
}

/**
 * Click element with fallback selectors
 */
export async function clickWithFallbacks(
  page: Page,
  selectors: string[],
  description: string = 'element'
): Promise<boolean> {
  console.log(`🖱️ Clicking ${description}...`);
  
  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        await element.click();
        console.log(`✅ Successfully clicked ${description} with selector: ${selector}`);
        return true;
      }
    } catch (e) {
      // Continue to next selector
      continue;
    }
  }
  
  console.warn(`⚠️ Could not click ${description} with any of the provided selectors`);
  return false;
}

/**
 * Type text with fallback selectors
 */
export async function typeWithFallbacks(
  page: Page,
  selectors: string[],
  text: string,
  description: string = 'input'
): Promise<boolean> {
  console.log(`⌨️ Typing "${text}" in ${description}...`);
  
  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        await element.fill(text);
        console.log(`✅ Successfully typed in ${description} with selector: ${selector}`);
        return true;
      }
    } catch (e) {
      // Continue to next selector
      continue;
    }
  }
  
  console.warn(`⚠️ Could not type in ${description} with any of the provided selectors`);
  return false;
}

/**
 * Verify element exists with fallback selectors
 */
export async function verifyElementExists(
  page: Page,
  selectors: string[],
  description: string = 'element',
  timeout: number = TIMEOUTS.MEDIUM
): Promise<boolean> {
  console.log(`🔍 Verifying ${description} exists...`);
  
  const element = await findElementWithFallbacks(page, selectors, timeout);
  if (element) {
    console.log(`✅ ${description} found`);
    return true;
  } else {
    console.warn(`⚠️ ${description} not found`);
    await takeDebugScreenshot(page, DEBUG_PATHS.CURRENT_PAGE);
    return false;
  }
}

/**
 * Wait for page to load and stabilize
 */
export async function waitForPageStable(page: Page, timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
  await page.waitForTimeout(1000); // Additional stability wait
}

/**
 * Canvas interaction helpers
 */
export async function panCanvas(page: Page, deltaX: number = 100, deltaY: number = 50): Promise<void> {
  console.log('🖱️ Panning canvas...');
  const canvas = await findElementWithFallbacks(page, SELECTORS.CANVAS);
  
  if (canvas) {
    const box = await canvas.boundingBox();
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      
      await page.mouse.move(centerX, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX + deltaX, centerY + deltaY);
      await page.mouse.up();
      
      console.log('✅ Canvas panned successfully');
    }
  }
}

/**
 * Double click on empty canvas area
 */
export async function doubleClickCanvas(page: Page): Promise<void> {
  console.log('🖱️ Double-clicking canvas...');
  const canvas = await findElementWithFallbacks(page, SELECTORS.CANVAS);
  
  if (canvas) {
    const box = await canvas.boundingBox();
    if (box) {
      // Click in upper-right area which should be empty
      const x = box.x + box.width * 0.8;
      const y = box.y + box.height * 0.2;
      await page.dblclick(x, y);
      console.log('✅ Canvas double-clicked successfully');
    }
  }
}