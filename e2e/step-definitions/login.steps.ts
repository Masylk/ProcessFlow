// @ts-nocheck
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
// const { TEST_USER } = require('./authentication.steps'); // If you want to reuse constants

Given('I am on the login page', async function () {
  await this.page.goto('http://localhost:3000/login');
  await this.page.waitForSelector('text="Log in to Processflow"', { timeout: 10000 });
});

When('I enter a valid email and password', async function () {
  await this.page.fill('input[name="email"]', 'tomaxime0@gmail.com');
  await this.page.fill('input[name="password"]', 'abcd1234');
});

When('I enter a valid email and an incorrect password', async function () {
  await this.page.fill('input[name="email"]', 'tomaxime0@gmail.com');
  await this.page.fill('input[name="password"]', 'wrongpassword123');
});

When('I click the "Log in" button', async function () {
  await this.page.click('button[type="submit"]:has-text("Log in")');
});

When('I click the "Log in" button without entering credentials', async function () {
  await this.page.click('button[type="submit"]:has-text("Log in")');
});

Then('I should be redirected to the dashboard', async function () {
  await this.page.waitForURL('http://localhost:3000/', { timeout: 10000 });
  expect(this.page.url()).toBe('http://localhost:3000/');
});

Then('I should see a welcome message', async function () {
  await this.page.waitForSelector('text="Welcome"', { timeout: 5000 });
});

Then('I should see an error message', async function () {
  await this.page.waitForSelector('[role="alert"], .error, .toast, text*="error"', { timeout: 5000 });
});

Then('I should see validation errors for both email and password', async function () {
  await this.page.waitForSelector('text*="email"', { timeout: 5000 });
  await this.page.waitForSelector('text*="password"', { timeout: 5000 });
});
