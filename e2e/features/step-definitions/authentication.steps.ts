// @ts-nocheck
const { Given, When, Then, After, Before, setWorldConstructor } = require('@cucumber/cucumber');
const { expect, chromium } = require('@playwright/test');
const { IWorldOptions, World } = require('@cucumber/cucumber');

/**
 * @typedef {Object} CustomWorld
 * @property {any} browser
 * @property {any} page
 */

/** @type {CustomWorld} */

/**
 * @this {any}
 * @param {any} options
 */
function CustomWorld(options) {
  // You can attach properties to `this` here
  this.browser = null;
  this.page = null;
}
setWorldConstructor(CustomWorld);

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

function getPageOptions() {
  return BYPASS
    ? { extraHTTPHeaders: { 'x-vercel-protection-bypass': BYPASS } }
    : {};
}

/**
 * @param {any} page
 * @param {string} [email]
 * @param {string} [password]
 */
async function login(page, email = 'tomaxime0@gmail.com', password = 'abcd1234') {
  console.log('Navigating to login page:', `${BASE_URL}/login`);
  await page.goto(`${BASE_URL}/login`);
  console.log('Filling email:', email);
  await page.fill('input[name="email"]', email);
  console.log('Filling password');
  await page.fill('input[name="password"]', password);
  console.log('Clicking submit button');
  await page.click('button[type="submit"]');
  console.log('Waiting for dashboard redirect:', `${BASE_URL}/`);
  await page.waitForURL(`${BASE_URL}/`);
  console.log('Login function finished');
}

/**
 * @param {string} path
 * @returns {string}
 */
function normalize_path(path) {
  return path.startsWith('/') ? path : `/${path}`;
}

Before(async function () {
  this.browser = await chromium.launch();
  this.page = await this.browser.newPage(getPageOptions());
});

After(async function () {
  await this.page?.close();
  await this.browser?.close();
});

// --- Given Steps ---
Given('I am on the signup page', async function () {});
Given('I am not authenticated', async function () {});
/** @param {string} email */
Given('a user already exists with email {string}', async function (email) {});
Given('I am on the login page', async function () {});
/** @param {string} email */
Given('a new user exists with email {string} and confirmed email', async function (email) {});
Given('the user has not completed onboarding', async function () {});
/** @param {string} email */
Given('an existing user with email {string} and confirmed email', async function (email) {});
Given('the user has completed onboarding', async function () {});
/** @param {string} email */
Given('a user exists with email {string} and unconfirmed email', async function (email) {});
Given('an existing user with Google account', async function () {});
Given('I am accessing authentication routes', async function () {});
/** @this {any} */
Given('I am logged in', { timeout: 20000 }, async function () {
  console.log('Starting login...');
  await login(this.page);
  console.log('Login finished.');
});
Given('I am a newly registered user', async function () {});
Given('my onboarding is not complete', async function () {});
Given('my onboarding is complete', async function () {});
/** @param {string} url */
Given('I access a URL with encoded spaces {string}', async function (url) {});
/** @param {string} route */
Given('I access an embed route {string}', async function (route) {});
/** @param {string} email */
Given('I have registered with email {string}', async function (email) {});
Given('I received a confirmation email', async function () {});
Given('I have registered but not confirmed my email', async function () {});

// --- When Steps ---
/** @param {string} email */
When('I enter a valid email {string}', async function (email) {});
/** @param {string} password */
When('I enter a strong password {string}', async function (password) {});
/** @param {string} button */
When('I click the {string} button', async function (button) {});
/** @param {string} password */
When('I enter a weak password {string}', async function (password) {});
/** @param {string} email */
When('I enter an invalid email {string}', async function (email) {});
/** @param {string} email */
When('I enter email {string}', async function (email) {});
/** @param {string} button */
When('I click {string}', async function (button) {});
/** @param {string} action */
When('I click {string} with Google', async function (action) {});
When('I enter the correct password', async function () {});
When('I enter an incorrect password', async function () {});
When('I enter any password', async function () {});
When('I make 30 failed login attempts within 10 minutes', async function () {});
When('I make more than 20 requests per minute', async function () {});
When('I enter a password without uppercase letters', async function () {});
When('I enter a password without lowercase letters', async function () {});
When('I enter a password without numbers', async function () {});
When('I enter a password without special characters', async function () {});
When('I enter a password shorter than 8 characters', async function () {});
When('my session is valid', async function () {});
When('my session expires', async function () {});
When('I log out', async function () {});
/**
 * @this {any}
 * @param {string} path
 */
When('I try to access {string}', async function (path) {
  const normalizedPath = normalize_path(path);
  await this.page.goto(`${BASE_URL}${normalizedPath}`);
});
When('I log in successfully', async function () {});
When('I complete the personal information step', async function () {});
When('I complete the professional information step', async function () {});
When('I complete the workspace setup step', async function () {});
When('I click "Continue to Dashboard"', async function () {});
When('I click the confirmation link in the email', async function () {});
When('I access "/auth/confirm" with an invalid token', async function () {});
When('I try to log in', async function () {});
When('I click "resend confirmation"', async function () {});

// --- Then Steps ---
Then('I should see a success message', async function () {});
Then('I should be redirected to login page with pre-filled email', async function () {});
/** @param {string} email */
Then('a confirmation email should be sent to {string}', async function (email) {});
/** @param {string} error */
Then('I should see error {string}', async function (error) {});
Then('the signup should not proceed', async function () {});
Then('the system should perform an immediate email availability check', async function () {});
Then('no visual feedback should be shown about email existence', async function () {});
Then('the system should perform a final email existence check', async function () {});
/** @param {string} message */
Then('I should see message {string}', async function (message) {});
Then('no new account should be created', async function () {});
Then('no confirmation email should be sent', async function () {});
Then('I should be redirected to Google OAuth', async function () {});
Then('after successful Google authentication', async function () {});
/** @param {string} path */
Then('I should be redirected to {string}', async function (path) {});
Then('a new user account should be created', async function () {});
Then('I should be redirected to the onboarding page', async function () {});
Then('I should be logged in successfully', async function () {});
/** @this {any} */
Then('I should be redirected to the dashboard "/"', async function () {
  await this.page.waitForURL(`${BASE_URL}/`);
  expect(this.page.url()).toBe(`${BASE_URL}/`);
});
Then('a session cookie should be set', async function () {});
Then('I should see message "Please confirm your email before logging in"', async function () {});
Then('I should not be logged in', async function () {});
Then('I should see error "Login Failed"', async function () {});
Then('the failed attempt should be tracked', async function () {});
Then('I should see error "Invalid Email"', async function () {});
Then('the login should not proceed', async function () {});
Then('I should be logged in automatically', async function () {});
Then('I should be blocked from further attempts', async function () {});
Then('I should see message "Too many failed attempts"', async function () {});
Then('I should be blocked for 10 minutes', async function () {});
Then('the block timer should count down', async function () {});
Then('I should receive a "429 Too many requests" response', async function () {});
Then('further requests should be blocked', async function () {});
Then('I should see password strength error', async function () {});
Then('I should have access to protected routes', async function () {});
Then('I should be redirected to login page', async function () {});
Then('my session should be invalidated', async function () {});
/** @this {any} */
Then('I should be redirected to dashboard "/"', async function () {
  await this.page.waitForURL(`${BASE_URL}/`);
  expect(this.page.url()).toBe(`${BASE_URL}/`);
});
Then('the redirect parameter should include original path', async function () {});
Then('I should see the onboarding progress indicator', async function () {});
Then('I should proceed to the professional information step', async function () {});
Then('I should proceed to the workspace setup step', async function () {});
Then('I should proceed to the completion step', async function () {});
Then('the system should create my workspace', async function () {});
Then('the system should create default workflows', async function () {});
Then('An email should be sent to the user with the subject "Welcome to ProcessFlow"', async function () {});
Then('my onboarding should be marked as complete', async function () {});
Then('I should not be able to access "/onboarding" anymore', async function () {});
Then('the URL should be properly formatted', async function () {});
// Then('the response should include headers:', async function (dataTable) {});
Then('my email should be marked as confirmed', async function () {});
Then('I should be automatically logged in', async function () {});
Then('I should see an error message', async function () {});
Then('my email should remain unconfirmed', async function () {});
Then('I should see option to resend confirmation email', async function () {});
Then('a new confirmation email should be sent', async function () {});
/**
 * @param {string} dashboardPath
 * @this {any}
 */
Then('I should be redirected to dashboard {string}', async function (dashboardPath) {
  const expectedUrl = `${BASE_URL}${normalize_path(dashboardPath)}`;
  await this.page.waitForURL(expectedUrl);
  expect(this.page.url()).toBe(expectedUrl);
});

/** @this {any} */
After(async function () {
  await this.page?.close();
  await this.browser?.close();
}); 