# E2E Testing Setup with Database Seeding

This document outlines the comprehensive End-to-End (E2E) testing infrastructure for ProcessFlow, including database seeding for consistent authentication testing.

## 📋 Overview

Our E2E testing setup uses:
- **Cucumber.js** with Gherkin feature files for BDD testing
- **Playwright** for browser automation
- **Database seeding** for consistent test data
- **Supabase** for authentication and database management

## 🗂️ Project Structure

```
e2e/
├── features/                    # Gherkin feature files organized by domain
│   ├── authentication/
│   ├── dashboard/
│   ├── editor/
│   ├── login/
│   ├── onboarding/
│   └── read-mode/
├── step-definitions/           # Cucumber step implementations
│   ├── authentication.steps.ts
│   ├── dashboard.steps.ts
│   ├── editor.steps.ts
│   ├── login.steps.ts
│   ├── onboarding.steps.ts
│   └── read-mode.steps.ts
├── seed-test-data.ts          # Database seeding script
├── cleanup-test-data.ts       # Cleanup script for manual use
└── test-data.json             # Generated test data info (auto-created)
```

## 🌱 Database Seeding System

### Purpose
Creates consistent, isolated test data for reliable CI/CD testing, eliminating authentication blockers and ensuring reproducible test environments.

### What Gets Seeded
- **3 Test Users** with different roles:
  - `test-user@processflow-test.com` (ADMIN)
  - `editor-user@processflow-test.com` (EDITOR) 
  - `viewer-user@processflow-test.com` (EDITOR)
- **Test Workspace**: "Test Workspace" with slug `test-workspace`
- **Test Workflow**: "Test Workflow for E2E" with basic block structure
- **Authentication**: Supabase Auth users + PostgreSQL user records

### Test Credentials
```javascript
// Main test user for login tests
Email: test-user@processflow-test.com
Password: TestPassword123!

// Editor test user
Email: editor-user@processflow-test.com  
Password: EditorPassword123!

// Viewer test user
Email: viewer-user@processflow-test.com
Password: ViewerPassword123!
```

## 🚀 Available Scripts

### Development & Testing
```bash
# Seed fresh test data (run before tests)
npm run test:seed

# Run all editor E2E tests (includes automatic seeding)
npm run test:e2e:editor

# Run all E2E tests (includes automatic seeding)
npm run test:e2e

# Manual cleanup of test data
npm run test:cleanup
```

### CI/CD Usage
```bash
# Recommended for CI pipelines
npm run test:e2e:editor
```
This command automatically:
1. Seeds fresh test data
2. Runs all editor tests
3. Uses seeded credentials for authentication

## 🔧 Manual Seeding

### Seed Test Data
```bash
npm run test:seed
```
**Output:**
- Creates test users in Supabase Auth
- Creates user records in PostgreSQL
- Creates test workspace and workflow
- Generates `e2e/test-data.json` with test info

### Cleanup Test Data
```bash
npm run test:cleanup
```
**Purpose:**
- Removes all test users and related data
- Handles foreign key constraints properly
- Safe to run multiple times

## 📝 Using Seeded Data in Tests

### Automatic Loading
Test data is automatically loaded in step definitions:

```typescript
// In step definitions
const { TEST_DATA, TEST_USER } = loadTestData();

// TEST_USER contains:
// { email, password, firstName, lastName, fullName }

// TEST_DATA contains:
// { workspace: {...}, workflow: {...}, urls: {...} }
```

### Login Helper
```typescript
// Login with seeded credentials
await login(page); // Uses TEST_USER.email and TEST_USER.password

// Login with specific credentials  
await login(page, 'custom@email.com', 'password');
```

### Navigation to Editor
```typescript
// Navigate to seeded workflow editor
await page.goto(`${BASE_URL}${TEST_DATA.urls.editor}`);
// Example: /workspace/63/test-workflow-for-e2e--pf-58/edit
```

## 🎯 Writing New Tests

### 1. Feature Files
Create `.feature` files in appropriate domain folders:

```gherkin
Feature: New Feature
  As a user
  I want to test something
  So that I achieve a goal

  Background:
    Given I am a logged-in user
    And I am on the editor page of a workflow

  Scenario: Test scenario
    When I perform an action
    Then I should see expected result
```

### 2. Step Definitions
Add steps to appropriate `.steps.ts` files:

```typescript
Given('I perform an action', async function () {
  // Use this.page for Playwright interactions
  await this.page.click('.some-button');
});

Then('I should see expected result', async function () {
  // Use this.testData for seeded data access
  await this.page.waitForSelector('.expected-element');
});
```

### 3. Browser Lifecycle
Each test automatically gets:
- Fresh browser instance (`this.browser`)
- New page (`this.page`)
- Loaded test data (`this.testData`)
- Automatic cleanup after test

## 🔍 Debugging Tests

### Screenshots
Add debugging screenshots in step definitions:
```typescript
// Take screenshot for debugging
await this.page.screenshot({ path: 'debug-screenshot.png' });
```

### Console Logs
```typescript
// Log current state
console.log('Current URL:', this.page.url());
console.log('Page title:', await this.page.title());
```

### Test Data Inspection
```typescript
// Inspect loaded test data
console.log('Test workspace:', this.testData?.workspace);
console.log('Test workflow:', this.testData?.workflow);
```

## 🛠️ Configuration

### Environment Variables
Required for seeding:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_postgresql_url
```

### Test Base URL
```bash
TEST_BASE_URL=http://localhost:3000  # Default
```

### Playwright Configuration
See `playwright.config.ts` for browser and test configurations.

## 🔒 Security Notes

### Test Environment Only
- Seeded data is designed for **staging/test databases only**
- Never run seeding scripts against production
- Test emails use `@processflow-test.com` domain

### Data Isolation
- Each seeding run cleans up previous test data
- Test data is prefixed/namespaced to avoid conflicts
- Foreign key constraints are properly handled

## 🚨 Troubleshooting

### Common Issues

#### 1. "User already exists" errors
**Solution:** Run cleanup first
```bash
npm run test:cleanup && npm run test:seed
```

#### 2. Authentication failures
**Solution:** Verify test data was seeded
```bash
# Check if test-data.json exists and has recent timestamp
cat e2e/test-data.json
```

#### 3. Test timeouts
**Solution:** Increase timeout in step definitions
```typescript
Given('step name', { timeout: 30000 }, async function () {
  // Your step implementation
});
```

#### 4. Foreign key constraint errors
**Solution:** The seeding script handles this automatically, but if issues persist:
```bash
npm run test:cleanup  # Manual cleanup
```

### Debug Steps
1. Check if dev server is running: `curl -I http://localhost:3000`
2. Verify test data: `cat e2e/test-data.json`
3. Run manual cleanup: `npm run test:cleanup`
4. Re-seed data: `npm run test:seed`
5. Check database directly for test users

## 📊 Test Data Schema

### Generated test-data.json
```json
{
  "seededAt": "2025-06-08T06:25:47.907Z",
  "users": {
    "MAIN_USER": {
      "email": "test-user@processflow-test.com",
      "password": "TestPassword123!",
      "firstName": "Test",
      "lastName": "User",
      "fullName": "Test User"
    }
    // ... other users
  },
  "workspace": {
    "id": 63,
    "slug": "test-workspace", 
    "name": "Test Workspace"
  },
  "workflow": {
    "id": 58,
    "name": "Test Workflow for E2E"
  },
  "urls": {
    "login": "http://localhost:3000/login",
    "editor": "/workspace/63/test-workflow-for-e2e--pf-58/edit"
  }
}
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Setup test data
  run: npm run test:seed

- name: Run E2E tests
  run: npm run test:e2e
```

### Recommended CI Workflow
1. Start development server
2. Run `npm run test:seed` (or use `npm run test:e2e` which includes seeding)
3. Execute tests
4. Collect test artifacts
5. Cleanup happens automatically on next run

## 📚 Best Practices

### Test Writing
- Use descriptive scenario names
- Keep steps focused and atomic
- Leverage the seeded data consistently
- Add appropriate waits for async operations

### Data Management
- Always use seeded credentials for authentication tests
- Don't hardcode workspace/workflow IDs - use `TEST_DATA`
- Run cleanup before important test runs
- Monitor test-data.json for consistency

### Performance
- Seeding runs once per test suite (not per test)
- Browser instances are isolated per scenario
- Cleanup is optimized for foreign key constraints
- Use appropriate timeouts for stability

---

**Questions or Issues?** Check the troubleshooting section or reach out to the development team for assistance with E2E testing setup.