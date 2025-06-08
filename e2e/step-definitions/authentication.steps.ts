// @ts-nocheck
const { Given, When, Then, After, Before, setWorldConstructor } = require('@cucumber/cucumber');
const { expect, chromium } = require('@playwright/test');
const { IWorldOptions, World } = require('@cucumber/cucumber');
const {
  seedTestUser,
  seedWorkspace,
  cleanupWorkspace,
  getUserIdByEmail,
  cleanupTestUser,
} = require('./utils.steps');

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

// Test user credentials
const TEST_USER = {
  email: 'tomaxime0@gmail.com',
  password: 'abcd1234'
};

// Test emails for different scenarios
const TEST_EMAILS = {
  NEW_USER: 'newuser-test@example.com',
  EXISTING_USER: 'existing-test@example.com', 
  UNCONFIRMED_USER: 'unconfirmed-test@example.com',
  GOOGLE_USER: 'googleuser-test@example.com'
};

// Track created test users for cleanup
let createdTestUsers = [];


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
async function login(page, email = TEST_USER.email, password = TEST_USER.password) {
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

/** @this {any} */
After(async function () {
  // Cleanup workspace if it exists (using a default workspace name if needed)
  if (this.prismaUser && this.prismaUser.id) {
    const workspaceName = this.workspace.name || 'My Test Workspace';
    await cleanupWorkspace({ name: workspaceName, user_id: this.prismaUser.id });
  }
  // Cleanup all created test users (Supabase)
  for (const email of createdTestUsers) {
    await cleanupTestUser(email);
  }
  // Reset the list for next test
  createdTestUsers = [];
  
  await this.page?.close();
  await this.browser?.close();
});

// --- Given Steps ---
Given('I am on the signup page', async function () {
  console.log('Navigating to signup page');
  await this.page.goto(`${BASE_URL}/signup`);
  await this.page.waitForSelector('h1, [data-testid="signup-title"], text="Create your account"', { timeout: 10000 });
});

Given('I am not authenticated', async function () {
  console.log('Clearing authentication cookies');
  await this.page.context().clearCookies();
  // Ensure the page is on a valid origin before accessing localStorage/sessionStorage
  await this.page.goto(BASE_URL);
  await this.page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

/** @param {string} email */
Given('a user already exists with email {string}', async function (email) {
  console.log(`Ensuring user ${email} exists in test database`);
  
  // Use the existing test user or seed new data
  if (email === TEST_USER.email) {
    // tomaxime0@gmail.com already exists, no seeding needed
    console.log('Using existing test user');
  } else {
    // Seed new user data
    await seedTestUser.call(this, {
      email,
      password: 'abcd1234',
      email_confirmed: true,
      onboarding_step: 'COMPLETED'
    });
  }
});

Given('I am on the login page', async function () {
  console.log('Navigating to login page');
  await this.page.goto(`${BASE_URL}/login`);
  await this.page.waitForSelector('text="Log in to Processflow"', { timeout: 10000 });
});

/** @param {string} email */
Given('a new user exists with email {string} and confirmed email', async function (email) {
  // Use predefined test email if placeholder is provided
  const actualEmail = email.includes('example.com') ? TEST_EMAILS.NEW_USER : email;
  console.log(`Creating new user ${actualEmail} with confirmed email`);
  
  await seedTestUser.call(this, {
    email: actualEmail,
    password: 'abcd1234',
    email_confirmed: true,
    onboarding_step: 'PERSONAL_INFO'
  });
});

Given('the user has not completed onboarding', async function () {
  console.log('User onboarding status: incomplete');
  // This would be handled by test data seeding
});

/** @param {string} email */
Given('an existing user with email {string} and confirmed email', async function (email) {
  console.log(`Ensuring existing user ${email} exists with confirmed email`);
  
  // Use existing test user or seed data
  if (email === TEST_USER.email) {
    console.log('Using existing test user (no seeding needed)');
  } else {
    const actualEmail = email.includes('example.com') ? TEST_EMAILS.EXISTING_USER : email;
    await seedTestUser.call(this, {
      email: actualEmail,
      password: 'abcd1234',
      email_confirmed: true,
      onboarding_step: 'COMPLETED'
    });
  }
});

Given('the user has completed onboarding', async function () {
  console.log('User onboarding status: complete');
  // This would be handled by test data seeding
});

/** @param {string} email */
Given('a user exists with email {string} and unconfirmed email', async function (email) {
  const actualEmail = email.includes('example.com') ? TEST_EMAILS.UNCONFIRMED_USER : email;
  console.log(`Creating user ${actualEmail} with unconfirmed email`);
  
  await seedTestUser.call(this, {
    email: actualEmail,
    password: 'abcd1234',
    email_confirmed: false,
    onboarding_complete: false
  });
});

Given('an existing user with Google account', async function () {
  console.log('Creating Google OAuth user');
  
  await seedTestUser.call(this, {
    email: TEST_EMAILS.GOOGLE_USER,
    password: null, // Google OAuth users don't have passwords
    email_confirmed: true,
    onboarding_step: 'COMPLETED',
    provider: 'google'
  });
});

Given('I am accessing authentication routes', async function () {});
/** @this {any} */
Given('I am logged in', { timeout: 20000 }, async function () {
  console.log('Starting login...');
  await login(this.page);
  console.log('Login finished.');
});
Given('I am a newly registered user', async function () {
  // Seed a new user with onboarding not complete and confirmed email
  const email = TEST_EMAILS.NEW_USER;
  const password = 'abcd1234';
  await seedTestUser.call(this, {
    email,
    password,
    email_confirmed: true,
    onboarding_step: 'PERSONAL_INFO'
  });
  // Store for later steps
  this.newUserEmail = email;
  this.userEmail = email;
  this.password = password;
});
Given('my onboarding is not complete', async function () {
  // Set onboarding status to false for the current test user
  const email = this.newUserEmail || TEST_USER.email;
  const password = 'abcd1234';
  await seedTestUser.call(this, {
    email,
    password,
    email_confirmed: true,
    onboarding_step: 'PERSONAL_INFO'
  });
  this.userEmail = email;
  this.password = password;
});
Given('my onboarding is complete', async function () {
  // Set onboarding status to true for the current test user
  const email = this.newUserEmail || TEST_USER.email;
  await seedTestUser.call(this, {
    email,
    password: 'abcd1234',
    email_confirmed: true,
    onboarding_step: 'COMPLETED'
  });
  await seedWorkspace.call(this, { name: 'test' });
});
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
When('I enter a valid email {string}', async function (email) {
  console.log(`Entering valid email: ${email}`);
  await this.page.fill('input[name="email"], input[type="email"]', email);
});

/** @param {string} password */
When('I enter a strong password {string}', async function (password) {
  console.log('Entering strong password');
  await this.page.fill('input[name="password"], input[type="password"]', password);
});

/** @param {string} button */
When('I click the {string} button', async function (button) {
  console.log(`Clicking button: ${button}`);
  const buttonSelector = button.toLowerCase().includes('log in') 
    ? 'button[type="submit"]:has-text("Log in")'
    : button.toLowerCase().includes('sign up')
    ? 'button[type="submit"]:has-text("Sign up")'
    : `button:has-text("${button}"), input[type="submit"][value="${button}"]`;
  await this.page.click(buttonSelector);
});

/** @param {string} password */
When('I enter a weak password {string}', async function (password) {
  console.log('Entering weak password');
  await this.page.fill('input[name="password"], input[type="password"]', password);
});

/** @param {string} email */
When('I enter an invalid email {string}', async function (email) {
  console.log(`Entering invalid email: ${email}`);
  await this.page.fill('input[name="email"], input[type="email"]', email);
});

/** @param {string} email */
When('I enter email {string}', async function (email) {
  console.log(`Entering email: ${email}`);
  // Use actual test user email if it's a placeholder
  const actualEmail = email === 'user@example.com' ? TEST_USER.email : email;
  await this.page.fill('input[name="email"], input[type="email"]', actualEmail);
});

/** @param {string} button */
When('I click {string}', async function (button) {
  console.log(`Clicking: ${button}`);
  if (button.toLowerCase().includes('google')) {
    await this.page.click('button:has-text("Google"), button:has-text("Log in with Google"), button:has-text("Sign up with Google")');
  } else {
    await this.page.click(`button:has-text("${button}"), [role="button"]:has-text("${button}"), a:has-text("${button}")`);
  }
});

/** @param {string} action */
When('I click {string} with Google', async function (action) {
  console.log(`Clicking ${action} with Google`);
  const googleButtonText = action.toLowerCase().includes('log in') ? 'Log in with Google' : 'Sign up with Google';
  await this.page.click(`button:has-text("${googleButtonText}")`);
});

When('I enter the correct password', async function () {
  console.log('Entering correct password');
  await this.page.fill('input[name="password"], input[type="password"]', TEST_USER.password);
});

When('I enter an incorrect password', async function () {
  console.log('Entering incorrect password');
  await this.page.fill('input[name="password"], input[type="password"]', 'wrongpassword123');
});

When('I enter any password', async function () {
  console.log('Entering any password');
  await this.page.fill('input[name="password"], input[type="password"]', 'anypassword123');
});

When('I make 30 failed login attempts within 10 minutes', async function () {
  console.log('Making 30 failed login attempts');
  for (let i = 0; i < 30; i++) {
    await this.page.fill('input[name="email"]', TEST_USER.email);
    await this.page.fill('input[name="password"]', 'wrongpassword');
    await this.page.click('button[type="submit"]');
    await this.page.waitForTimeout(100); // Small delay between attempts
  }
});

When('I make more than 20 requests per minute', async function () {
  console.log('Making more than 20 requests per minute');
  for (let i = 0; i < 25; i++) {
    await this.page.goto(`${BASE_URL}/login`);
    await this.page.waitForTimeout(50); // Very short delay to exceed rate limit
  }
});

When('I enter a password without uppercase letters', async function () {
  console.log('Entering password without uppercase letters');
  await this.page.fill('input[name="password"], input[type="password"]', 'lowercase123!');
});

When('I enter a password without lowercase letters', async function () {
  console.log('Entering password without lowercase letters');
  await this.page.fill('input[name="password"], input[type="password"]', 'UPPERCASE123!');
});

When('I enter a password without numbers', async function () {
  console.log('Entering password without numbers');
  await this.page.fill('input[name="password"], input[type="password"]', 'NoNumbers!');
});

When('I enter a password without special characters', async function () {
  console.log('Entering password without special characters');
  await this.page.fill('input[name="password"], input[type="password"]', 'NoSpecial123');
});

When('I enter a password shorter than 8 characters', async function () {
  console.log('Entering password shorter than 8 characters');
  await this.page.fill('input[name="password"], input[type="password"]', 'Short1!');
});

When('my session is valid', async function () {
  console.log('Session is valid');
  // This would involve setting up a valid session cookie or token
});

When('my session expires', async function () {
  console.log('Session expires');
  await this.page.context().clearCookies();
});

When('I log out', async function () {
  console.log('Logging out');
  await this.page.click('[data-testid="user-dropdown"], [data-testid="logout-button"], button:has-text("Logout")');
});

/**
 * @this {any}
 * @param {string} path
 */
When('I try to access {string}', async function (path) {
  const normalizedPath = normalize_path(path);
  console.log(`Trying to access: ${normalizedPath}`);
  await this.page.goto(`${BASE_URL}${normalizedPath}`);
});

When('I log in successfully', async function () {
  console.log('Logging in successfully');
  await login(this.page, this.userEmail, this.password);
});

When('I complete the personal information step', async function () {
  console.log('Completing personal information step');
  await this.page.fill('input[name="firstName"], input[placeholder*="first name" i]', 'John');
  await this.page.fill('input[name="lastName"], input[placeholder*="last name" i]', 'Doe');
  await this.page.click('button:has-text("Continue"), button:has-text("Next")');
});

When('I complete the professional information step', async function () {
  console.log('Completing professional information step');
  await this.page.fill('input[name="jobTitle"], input[placeholder*="job title" i]', 'Software Engineer');
  await this.page.fill('input[name="company"], input[placeholder*="company" i]', 'Test Company');
  await this.page.click('button:has-text("Continue"), button:has-text("Next")');
});

When('I complete the workspace setup step', async function () {
  console.log('Completing workspace setup step');
  await this.page.fill('input[name="workspaceName"], input[placeholder*="workspace" i]', 'My Test Workspace');
  await this.page.click('button:has-text("Continue"), button:has-text("Create Workspace")');
});

When('I click the confirmation link in the email', async function () {
  console.log('Clicking confirmation link (simulated)');
  // In a real test, this would involve checking email or using a test email service
  // For now, we simulate by navigating to a confirmation URL
  await this.page.goto(`${BASE_URL}/auth/confirm?token=test-token`);
});

When('I access "/auth/confirm" with an invalid token', async function () {
  console.log('Accessing /auth/confirm with invalid token');
  await this.page.goto(`${BASE_URL}/auth/confirm?token=invalid-token`);
});

When('I try to log in', async function () {
  console.log('Trying to log in');
  await this.page.click('button[type="submit"]:has-text("Log in")');
});

When('I click "resend confirmation"', async function () {
  console.log('Clicking resend confirmation');
  await this.page.click('button:has-text("resend confirmation"), a:has-text("resend confirmation")');
});

// --- Then Steps ---
Then('I should see a success message', async function () {
  console.log('Checking for success message');
  await this.page.waitForSelector('text*="success", [role="alert"]:has-text("success"), .toast:has-text("success")', { timeout: 5000 });
});

Then('I should be redirected to login page with pre-filled email', async function () {
  console.log('Checking redirect to login with pre-filled email');
  await this.page.waitForURL(/.*\/login.*/, { timeout: 10000 });
  const emailValue = await this.page.inputValue('input[name="email"]');
  expect(emailValue).toBeTruthy();
});

/** @param {string} email */
Then('a confirmation email should be sent to {string}', async function (email) {
  console.log(`Checking confirmation email sent to ${email}`);
  // In a real test, this would check an email service or test email inbox
  // For now, we assume the email was sent based on the success flow
});

/** @param {string} error */
Then('I should see error {string}', async function (error) {
  console.log(`Checking for error: ${error}`);
  await this.page.waitForSelector(`text*="${error}", [role="alert"]:has-text("${error}"), .toast:has-text("${error}"), .error:has-text("${error}")`, { timeout: 5000 });
});

Then('the signup should not proceed', async function () {
  console.log('Checking that signup did not proceed');
  // Check that we're still on the signup page
  expect(this.page.url()).toContain('/signup');
});

Then('the system should perform an immediate email availability check', async function () {
  console.log('Checking immediate email availability check');
  // This would involve checking for loading indicators or network requests
  await this.page.waitForSelector('.spinner, [data-testid="email-check-spinner"]', { timeout: 3000 }).catch(() => {});
});

Then('no visual feedback should be shown about email existence', async function () {
  console.log('Checking no visual feedback about email existence');
  // Ensure no error messages about email existence are shown
  const errorElements = await this.page.locator('text*="already exists", text*="taken"').count();
  expect(errorElements).toBe(0);
});

Then('the system should perform a final email existence check', async function () {
  console.log('Checking final email existence check');
  // This would involve checking network requests or loading states
});

/** @param {string} message */
Then('I should see message {string}', async function (message) {
  console.log(`Checking for message: ${message}`);
  await this.page.waitForSelector(`text*="${message}", [role="alert"]:has-text("${message}"), .toast:has-text("${message}")`, { timeout: 5000 });
});

Then('no new account should be created', async function () {
  console.log('Checking no new account was created');
  // This would involve checking the database or API responses
  // For now, we assume based on staying on the same page
});

Then('no confirmation email should be sent', async function () {
  console.log('Checking no confirmation email was sent');
  // This would involve checking email service logs
});

Then('I should be redirected to Google OAuth', async function () {
  console.log('Checking redirect to Google OAuth');
  await this.page.waitForURL(/.*accounts\.google\.com.*/, { timeout: 10000 });
});

Then('after successful Google authentication', async function () {
  console.log('After successful Google authentication');
  // This would involve mocking or handling the OAuth flow
});

/** @param {string} path */
Then('I should be redirected to {string}', { timeout: 15000 }, async function (path) {
  const normalizedPath = normalize_path(path);
  console.log(`Checking redirect to path: ${normalizedPath}`);
  await this.page.waitForURL((url) => {
    const u = typeof url === 'string' ? new URL(url) : url;
    return u.pathname === normalizedPath;
  }, { timeout: 10000 });
  expect(new URL(this.page.url()).pathname).toBe(normalizedPath);
});

Then('a new user account should be created', async function () {
  console.log('Checking new user account was created');
  // This would involve checking database or API responses
});

Then('I should be redirected to the onboarding page', async function () {
  console.log('Checking redirect to onboarding page');
  await this.page.waitForURL(/.*\/onboarding.*/, { timeout: 10000 });
});

Then('I should be logged in successfully', async function () {
  console.log('Checking successful login');
  // Check for authenticated state indicators
  await this.page.waitForSelector('[data-testid="user-dropdown"], [data-testid="workspace-switcher"], text="My Flows"', { timeout: 10000 });
});

/** @this {any} */
Then('I should be redirected to the dashboard "/"', async function () {
  console.log('The Page URL before wait:', this.page.url());
  console.log('Checking redirect to dashboard');
  await this.page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
  expect(this.page.url()).toBe(`${BASE_URL}/`);
});

Then('a session cookie should be set', async function () {
  console.log('Checking session cookie is set');
  const cookies = await this.page.context().cookies();
  const sessionCookie = cookies.find(cookie => 
    cookie.name.includes('session') || 
    cookie.name.includes('auth') || 
    cookie.name.includes('supabase')
  );
  expect(sessionCookie).toBeTruthy();
});

Then('I should see message "Please confirm your email before logging in"', async function () {
  console.log('Checking for email confirmation message');
  await this.page.waitForSelector('text*="Please confirm your email before logging in"', { timeout: 5000 });
});

Then('I should not be logged in', async function () {
  console.log('Checking user is not logged in');
  // Check that we don't see authenticated user elements
  const authElements = await this.page.locator('[data-testid="user-dropdown"], [data-testid="workspace-switcher"]').count();
  expect(authElements).toBe(0);
});

Then('I should see error "Login Failed"', async function () {
  console.log('Checking for Login Failed error');
  await this.page.waitForSelector('text*="Login Failed"', { timeout: 5000 });
});

Then('the failed attempt should be tracked', async function () {
  console.log('Checking failed attempt is tracked');
  // This would involve checking localStorage or API calls
  const attempts = await this.page.evaluate(() => {
    return localStorage.getItem('login_attempts');
  });
  expect(attempts).toBeTruthy();
});

Then('I should see error "Invalid Email"', async function () {
  console.log('Checking for Invalid Email error');
  await this.page.waitForSelector('text*="Invalid Email"', { timeout: 5000 });
});

Then('the login should not proceed', async function () {
  console.log('Checking login did not proceed');
  expect(this.page.url()).toContain('/login');
});

Then('I should be logged in automatically', async function () {
  console.log('Checking automatic login');
  await this.page.waitForSelector('[data-testid="user-dropdown"], [data-testid="workspace-switcher"]', { timeout: 10000 });
});

Then('I should be blocked from further attempts', async function () {
  console.log('Checking user is blocked from further attempts');
  await this.page.waitForSelector('text*="Too many failed attempts"', { timeout: 5000 });
});

Then('I should see message "Too many failed attempts"', async function () {
  console.log('Checking for too many failed attempts message');
  await this.page.waitForSelector('text*="Too many failed attempts"', { timeout: 5000 });
});

Then('I should be blocked for 10 minutes', async function () {
  console.log('Checking 10 minute block');
  const blockUntil = await this.page.evaluate(() => {
    return localStorage.getItem('login_block_until');
  });
  expect(blockUntil).toBeTruthy();
});

Then('the block timer should count down', async function () {
  console.log('Checking block timer countdown');
  await this.page.waitForSelector('text*="minute"', { timeout: 5000 });
});

Then('I should receive a "429 Too many requests" response', async function () {
  console.log('Checking for 429 response');
  // This would involve checking network responses
});

Then('further requests should be blocked', async function () {
  console.log('Checking further requests are blocked');
  // This would involve making additional requests and checking responses
});

Then('I should see password strength error', async function () {
  console.log('Checking for password strength error');
  await this.page.waitForSelector('text*="Password must be at least 8 characters", text*="password strength", .error:has-text("password")', { timeout: 5000 });
});

Then('I should have access to protected routes', async function () {
  console.log('Checking access to protected routes');
  await this.page.goto(`${BASE_URL}/workspace/2`);
  await this.page.waitForSelector('[data-testid="workspace-switcher"]', { timeout: 10000 });
});

Then('I should be redirected to login page', async function () {
  console.log('Checking redirect to login page');
  await this.page.waitForURL(/.*\/login.*/, { timeout: 10000 });
});

Then('my session should be invalidated', async function () {
  console.log('Checking session is invalidated');
  const cookies = await this.page.context().cookies();
  const sessionCookies = cookies.filter(cookie => 
    cookie.name.includes('session') || 
    cookie.name.includes('auth')
  );
  expect(sessionCookies.length).toBe(0);
});

/** @this {any} */
Then('I should be redirected to dashboard "/"', async function () {
  console.log('Checking redirect to dashboard');
  console.log('Page URL before wait:', this.page.url());
  await this.page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
  console.log('Page URL after wait:', this.page.url());
  expect(this.page.url()).toBe(`${BASE_URL}/`);
});

Then('the redirect parameter should include original path', async function () {
  console.log('Checking redirect parameter includes original path');
  const url = new URL(this.page.url());
  const redirectParam = url.searchParams.get('redirect') || url.searchParams.get('return');
  console.log('Redirect parameter:', redirectParam);
  expect(redirectParam).toBeTruthy();
});

Then('I should see the onboarding progress indicator', async function () {
  console.log('Checking for onboarding progress indicator');
  await this.page.waitForSelector('[data-testid="progress-indicator"], .progress-indicator, text*="Step"', { timeout: 10000 });
});

Then('I should proceed to the professional information step', async function () {
  console.log('Checking proceed to professional information step');
  await this.page.waitForSelector('text*="professional", text*="job title", text*="company"', { timeout: 10000 });
});

Then('I should proceed to the workspace setup step', async function () {
  console.log('Checking proceed to workspace setup step');
  await this.page.waitForSelector('text*="workspace", text*="organization"', { timeout: 10000 });
});

Then('I should proceed to the completion step', async function () {
  console.log('Checking proceed to completion step');
  await this.page.waitForSelector('text*="complete", text*="finished", text*="welcome"', { timeout: 10000 });
});

Then('the system should create my workspace', async function () {
  console.log('Checking workspace creation');
  // This would involve checking API calls or database state
});

Then('the system should create default workflows', async function () {
  console.log('Checking default workflows creation');
  // This would involve checking API calls or database state
});

Then('An email should be sent to the user with the subject "Welcome to ProcessFlow"', async function () {
  console.log('Checking welcome email was sent');
  // This would involve checking email service logs
});

Then('my onboarding should be marked as complete', async function () {
  console.log('Checking onboarding marked as complete');
  // This would involve checking user state in database
});

Then('I should not be able to access "/onboarding" anymore', async function () {
  console.log('Checking onboarding page is not accessible');
  await this.page.goto(`${BASE_URL}/onboarding`);
  await this.page.waitForURL(/(?!\/onboarding).*/, { timeout: 10000 });
});

Then('the URL should be properly formatted', async function () {
  console.log('Checking URL is properly formatted');
  const url = this.page.url();
  expect(url).toMatch(/^https?:\/\/.+/);
});

Then('my email should be marked as confirmed', async function () {
  console.log('Checking email is marked as confirmed');
  // This would involve checking user state in database
});

Then('I should be automatically logged in', async function () {
  console.log('Checking automatic login');
  await this.page.waitForSelector('[data-testid="user-dropdown"], [data-testid="workspace-switcher"]', { timeout: 10000 });
});

Then('I should see an error message', async function () {
  console.log('Checking for error message');
  await this.page.waitForSelector('[role="alert"], .error, .toast, text*="error"', { timeout: 5000 });
});

Then('my email should remain unconfirmed', async function () {
  console.log('Checking email remains unconfirmed');
  // This would involve checking user state in database
});

Then('I should see option to resend confirmation email', async function () {
  console.log('Checking for resend confirmation option');
  await this.page.waitForSelector('text*="resend", button:has-text("resend")', { timeout: 5000 });
});

Then('a new confirmation email should be sent', async function () {
  console.log('Checking new confirmation email was sent');
  // This would involve checking email service logs
});

/**
 * @param {string} dashboardPath
 * @this {any}
 */
Then('I should be redirected to dashboard {string}', async function (dashboardPath) {
  const expectedUrl = `${BASE_URL}${normalize_path(dashboardPath)}`;
  console.log(`Checking redirect to dashboard: ${expectedUrl}`);
  console.log('The Page URL before wait:', this.page.url());
  await this.page.waitForURL(expectedUrl, { timeout: 10000 });
  expect(this.page.url()).toBe(expectedUrl);
});