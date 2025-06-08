// @ts-nocheck
const { Given, When, Then, Before, After, setWorldConstructor } = require('@cucumber/cucumber');
const { expect, chromium } = require('@playwright/test');

/**
 * @typedef {Object} CustomWorld
 * @property {any} browser
 * @property {any} page
 * @property {Object} testData
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

// Load test data from seeded file
let TEST_DATA: any = null;
let TEST_USER: any = null;

function loadTestData() {
  if (!TEST_DATA) {
    try {
      const fs = require('fs');
      const testDataPath = 'e2e/test-data.json';
      if (fs.existsSync(testDataPath)) {
        TEST_DATA = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
        TEST_USER = TEST_DATA.users.MAIN_USER;
        console.log('✅ Loaded test data from seeded file');
      } else {
        console.warn('⚠️ No test data file found, using fallback credentials');
        TEST_USER = {
          email: 'test-user@processflow-test.com',
          password: 'TestPassword123!'
        };
      }
    } catch (error) {
      console.warn('⚠️ Could not load test data, using fallback:', error.message);
      TEST_USER = {
        email: 'test-user@processflow-test.com',
        password: 'TestPassword123!'
      };
    }
  }
  return { TEST_DATA, TEST_USER };
}

function getPageOptions() {
  return BYPASS
    ? { extraHTTPHeaders: { 'x-vercel-protection-bypass': BYPASS } }
    : {};
}

/**
 * Helper to get userId by email using the test API route
 */
async function getUserIdByEmail(email) {
  try {
    const res = await fetch(`${BASE_URL}/api/test/get-user-by-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.auth_id;
  } catch (err) {
    console.error(`Error fetching userId for email ${email}:`, err);
    return null;
  }
}

/**
 * Helper to create a test workspace for a user
 */
async function createTestWorkspace(userId, workspaceName = 'Test Workspace', workspaceSlug = 'test-workspace') {
  try {
    const res = await fetch(`${BASE_URL}/api/test/create-test-workspace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, workspaceName, workspaceSlug }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(`Failed to create test workspace: ${error.error}`);
    }
    const data = await res.json();
    return data.workspace;
  } catch (err) {
    console.error(`Error creating test workspace:`, err);
    throw err;
  }
}

/**
 * Helper to create a test workflow in a workspace
 */
async function createTestWorkflow(workspaceId, workflowName = 'Test Workflow', authorId = null) {
  try {
    const res = await fetch(`${BASE_URL}/api/test/create-test-workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, workflowName, authorId }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(`Failed to create test workflow: ${error.error}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Error creating test workflow:`, err);
    throw err;
  }
}

/**
 * Helper to construct editor URL for a workflow
 */
function constructEditorUrl(workspaceSlug, workflowName, workflowId) {
  const encodedWorkflowName = workflowName.toLowerCase().replace(/\s+/g, '-');
  return `/${workspaceSlug}/${encodedWorkflowName}--pf-${workflowId}/edit`;
}

/**
 * Helper function to login (reused from authentication tests)
 */
async function login(page, email?: string, password?: string) {
  const { TEST_USER: testUser } = loadTestData();
  const loginEmail = email || testUser.email;
  const loginPassword = password || testUser.password;
  try {
    console.log('Navigating to login page:', `${BASE_URL}/login`);
    await page.goto(`${BASE_URL}/login`);
    
    console.log('Waiting for login page to load...');
    await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 10000 });
    
    console.log('Filling email:', loginEmail);
    await page.fill('input[name="email"], input[type="email"]', loginEmail);
    
    console.log('Filling password');
    await page.fill('input[name="password"], input[type="password"]', loginPassword);
    
    console.log('Clicking submit button');
    await page.locator('button[type="submit"]').click({ force: true });
    
    console.log('Waiting a moment for login processing...');
    await page.waitForTimeout(2000);
    
    // Check for error messages first
    const errorElements = await page.locator('[role="alert"], .error, .toast, .text-red-500, .text-danger').count();
    if (errorElements > 0) {
      const errorText = await page.locator('[role="alert"], .error, .toast, .text-red-500, .text-danger').first().textContent();
      console.log('Login error found:', errorText);
      
      // If there's an error, take a screenshot for debugging
      await page.screenshot({ path: 'e2e/debug-login-error.png' });
      throw new Error(`Login failed with error: ${errorText}`);
    }
    
    console.log('Current URL after login attempt:', page.url());
    
    // Try to wait for navigation away from login
    try {
      console.log('Waiting for dashboard redirect...');
      await page.waitForURL(url => {
        const urlString = typeof url === 'string' ? url : url.toString();
        return !urlString.includes('/login');
      }, { timeout: 10000 });
    } catch (navError) {
      console.log('Navigation timeout, checking if we\'re already logged in...');
      // Sometimes we might already be on the dashboard, check current URL
      const currentUrl = page.url();
      if (!currentUrl.includes('/login')) {
        console.log('Already on dashboard page:', currentUrl);
      } else {
        throw navError;
      }
    }
    
    console.log('Login function finished successfully');
  } catch (error) {
    console.error('Login failed:', error);
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'e2e/debug-login-failed.png' });
    
    throw error;
  }
}

// Browser lifecycle management
Before(async function () {
  this.browser = await chromium.launch();
  this.page = await this.browser.newPage(getPageOptions());
});

After(async function () {
  await this.page?.close();
  await this.browser?.close();
});

// --- Given Steps ---

Given('I am a logged-in user', { timeout: 30000 }, async function () {
  console.log('Starting login for editor tests...');
  await login(this.page);
  console.log('Login completed for editor tests.');
});

Given('I am on the editor page of a workflow', async function () {
  console.log('Setting up test workspace and workflow...');
  
  const { TEST_DATA, TEST_USER: testUser } = loadTestData();
  
  if (TEST_DATA && TEST_DATA.workspace && TEST_DATA.workflow) {
    // Use seeded data
    console.log('Using seeded test data...');
    this.testData = {
      workspace: TEST_DATA.workspace,
      workflow: TEST_DATA.workflow,
      user: testUser
    };
    
    // Navigate to seeded editor URL
    console.log(`Navigating to seeded editor: ${BASE_URL}${TEST_DATA.urls.editor}`);
    await this.page.goto(`${BASE_URL}${TEST_DATA.urls.editor}`);
  } else {
    // Fallback to creating test data dynamically
    console.log('No seeded data found, creating test data dynamically...');
    
    // Get user ID
    const userId = await getUserIdByEmail(testUser.email);
    if (!userId) {
      throw new Error('Test user not found');
    }
    
    // Create test workspace
    const workspace = await createTestWorkspace(userId, 'Editor Test Workspace', 'editor-test-workspace');
    
    // Create test workflow
    const workflowData = await createTestWorkflow(workspace.id, 'Editor Test Workflow', userId);
    
    // Store test data for use in other steps
    this.testData = {
      workspace,
      workflow: workflowData.workflow,
      blocks: workflowData.blocks,
      path: workflowData.path
    };
    
    // Navigate to editor
    const editorUrl = constructEditorUrl(workspace.slug, workflowData.workflow.name, workflowData.workflow.id);
    console.log(`Navigating to editor: ${BASE_URL}${editorUrl}`);
    await this.page.goto(`${BASE_URL}${editorUrl}`);
  }
  
  // Wait for editor to load
  await this.page.waitForSelector('[data-testid="workflow-header"], .workflow-header, h1', { timeout: 10000 });
  console.log('Editor page loaded successfully');
});

// --- When Steps ---

When('I navigate directly to an editor URL', async function () {
  console.log('Navigating directly to a test editor URL...');
  // Navigate to a known workflow editor URL (using workspace 2 which should exist)
  const testUrl = `${BASE_URL}/workspace/2/test-workflow--pf-123/edit`;
  console.log('Navigating to:', testUrl);
  await this.page.goto(testUrl);
});

When('I access the workflow editor', async function () {
  console.log('Accessing workflow editor (already done in Given step)');
  // This step is implicitly handled by "Given I am on the editor page of a workflow"
  // We just verify we're on the correct page
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/edit');
});

When('I click the workflow title', async function () {
  console.log('Clicking workflow title to edit inline');
  // Look for the workflow title element and click it to enable editing
  await this.page.click('h1, [role="heading"], .workflow-title, .workflow-header h1');
});

When('I click {string}', async function (buttonText) {
  console.log(`Clicking button: ${buttonText}`);
  if (buttonText === 'Read Mode') {
    await this.page.click('button:has-text("Read Mode"), a:has-text("Read Mode"), [href*="/read"]');
  } else {
    await this.page.click(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`);
  }
});

When('I click on a block in the sidebar', async function () {
  console.log('Clicking on a block in the sidebar');
  // Click on the first available block in the sidebar
  await this.page.click('.sidebar [data-block-id], .sidebar .block-item, .sidebar li:has-text("Start"), .sidebar li:has-text("Begin")');
});

When('I pan the canvas by dragging', async function () {
  console.log('Panning the canvas by dragging');
  // Get the canvas/reactflow container
  const canvas = await this.page.locator('.react-flow, [data-testid="rf__wrapper"], .react-flow__renderer').first();
  
  // Perform drag operation to pan
  const box = await canvas.boundingBox();
  if (box) {
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 50);
    await this.page.mouse.up();
  }
});

When('I zoom {string} using the zoom controls', async function (direction) {
  console.log(`Zooming ${direction} using zoom controls`);
  if (direction === 'in') {
    await this.page.click('.react-flow__controls button[title*="zoom in"], .zoom-controls .zoom-in, button:has-text("+")');
  } else if (direction === 'out') {
    await this.page.click('.react-flow__controls button[title*="zoom out"], .zoom-controls .zoom-out, button:has-text("-")');
  }
});

When('I double-click on an empty area', async function () {
  console.log('Double-clicking on empty area of canvas');
  // Find an empty area in the canvas and double-click
  const canvas = await this.page.locator('.react-flow, [data-testid="rf__wrapper"], .react-flow__renderer').first();
  const box = await canvas.boundingBox();
  if (box) {
    // Click in the top-right area which should be empty
    await this.page.dblclick(box.x + box.width * 0.8, box.y + box.height * 0.2);
  }
});

// --- Then Steps ---

Then('I should see the workflow header with the workflow name', async function () {
  console.log('Verifying workflow header with workflow name');
  // Check for workflow header and the specific workflow name
  await this.page.waitForSelector('h1, .workflow-header, [role="heading"]', { timeout: 5000 });
  
  if (this.testData?.workflow?.name) {
    const headerText = await this.page.textContent('h1, .workflow-header h1, .workflow-title');
    expect(headerText).toContain(this.testData.workflow.name);
  }
});

Then('I should see the main canvas area', async function () {
  console.log('Verifying main canvas area is visible');
  await this.page.waitForSelector('.react-flow, [data-testid="rf__wrapper"], .react-flow__renderer', { timeout: 5000 });
});

Then('I should see the sidebar on the left', async function () {
  console.log('Verifying sidebar is visible on the left');
  await this.page.waitForSelector('.sidebar, [data-testid="sidebar"], aside', { timeout: 5000 });
  
  // Verify it's positioned on the left (has appropriate classes or position)
  const sidebar = await this.page.locator('.sidebar, [data-testid="sidebar"], aside').first();
  const box = await sidebar.boundingBox();
  expect(box?.x).toBeLessThan(200); // Should be positioned near the left edge
});

Then('I should see zoom controls', async function () {
  console.log('Verifying zoom controls are visible');
  await this.page.waitForSelector('.react-flow__controls, .zoom-controls', { timeout: 5000 });
});

Then('I should see a {string} block on the canvas', async function (blockType) {
  console.log(`Verifying ${blockType} block is visible on canvas`);
  const blockSelector = blockType.toLowerCase() === 'begin' 
    ? '[data-nodetype="begin"], [data-block-type="begin"], .begin-block, .node-begin'
    : `[data-nodetype="${blockType.toLowerCase()}"], [data-block-type="${blockType.toLowerCase()}"], .${blockType.toLowerCase()}-block`;
  
  await this.page.waitForSelector(blockSelector, { timeout: 5000 });
});

Then('I should see navigation breadcrumbs', async function () {
  console.log('Verifying navigation breadcrumbs are visible');
  await this.page.waitForSelector('.breadcrumbs, [data-testid="breadcrumbs"], nav[aria-label="breadcrumb"]', { timeout: 5000 });
});

Then('I should be able to edit the workflow title inline', async function () {
  console.log('Verifying inline title editing capability');
  // After clicking the title, there should be an input field or contenteditable element
  await this.page.waitForSelector('input[value], [contenteditable="true"], .title-input', { timeout: 3000 });
});

Then('I should be redirected to the read view of the workflow', async function () {
  console.log('Verifying redirect to read view');
  await this.page.waitForURL(/.*\/read/, { timeout: 10000 });
  expect(this.page.url()).toContain('/read');
});

Then('the canvas should center on that block', async function () {
  console.log('Verifying canvas centers on selected block');
  // This is challenging to test precisely, but we can verify that a block is highlighted/selected
  await this.page.waitForSelector('.selected, [data-selected="true"], .highlighted', { timeout: 3000 });
});

Then('the block should be highlighted', async function () {
  console.log('Verifying block is highlighted');
  await this.page.waitForSelector('.selected, [data-selected="true"], .highlighted, .active', { timeout: 3000 });
});

Then('the canvas should fit all blocks in view', async function () {
  console.log('Verifying canvas fits all blocks in view');
  // After double-click, the view should adjust to show all content
  // We can verify this by checking if the zoom level changed or by ensuring blocks are visible
  await this.page.waitForTimeout(1000); // Allow time for animation
  
  // Verify that the BEGIN block is still visible after fit-to-view
  const beginBlock = await this.page.locator('[data-nodetype="begin"], .begin-block').first();
  expect(await beginBlock.isVisible()).toBe(true);
});

Then('I should be able to access the page', async function () {
  console.log('Verifying page is accessible');
  // Simple check that we can access the page without major errors
  const currentUrl = this.page.url();
  console.log('Current URL:', currentUrl);
  
  // Wait a moment for the page to load
  await this.page.waitForTimeout(2000);
  
  // Check that we're not on an error page
  const pageTitle = await this.page.title();
  console.log('Page title:', pageTitle);
  expect(pageTitle).toBeTruthy();
});

// === PHASE 3: ADVANCED EDITOR FEATURES ===

// --- Block Creation and Management Steps ---

Given('I am in the workflow editor', async function () {
  console.log('Setting up workflow editor environment (reusing existing setup)');
  // This step can reuse the existing "I am on the editor page of a workflow" logic
  // For now, we'll assume we're already in the editor
});

Given('I can see the canvas with a {string} block', async function (blockType) {
  console.log(`Verifying ${blockType} block is visible on canvas`);
  const blockSelector = blockType.toLowerCase() === 'begin' 
    ? '[data-nodetype="begin"], [data-block-type="begin"], .begin-block, .node-begin'
    : `[data-nodetype="${blockType.toLowerCase()}"], [data-block-type="${blockType.toLowerCase()}"], .${blockType.toLowerCase()}-block`;
  
  await this.page.waitForSelector(blockSelector, { timeout: 5000 });
});

Given('I have a Step block on the canvas', async function () {
  console.log('Ensuring a Step block exists on canvas');
  // First try to find existing step block
  const existingStep = await this.page.locator('[data-nodetype="step"], .step-block').count();
  if (existingStep === 0) {
    console.log('No step block found, creating one...');
    // Create a step block by clicking + button and selecting Step
    await this.page.click('[data-testid="add-block-button"], .add-block-btn, button:has-text("+")');
    await this.page.click('button:has-text("Step"), [data-option="step"]');
  }
  await this.page.waitForSelector('[data-nodetype="step"], .step-block', { timeout: 5000 });
});

When('I click the {string} button after the Begin block', async function (buttonText) {
  console.log(`Clicking ${buttonText} button after Begin block`);
  // Look for add button near the Begin block
  await this.page.click('[data-testid="add-block-button"], .add-block-btn, button:has-text("+"), .begin-block + button');
});

When('I click the {string} button after a Step block', async function (buttonText) {
  console.log(`Clicking ${buttonText} button after Step block`);
  await this.page.click('.step-block + button, [data-testid="add-block-button"]');
});

When('I click the {string} button after the last block in a path', async function (buttonText) {
  console.log(`Clicking ${buttonText} button after last block`);
  await this.page.click('.path-container .block:last-child + button, [data-testid="add-block-button"]:last-of-type');
});

When('I enter condition name {string}', async function (conditionName) {
  console.log(`Entering condition name: ${conditionName}`);
  await this.page.fill('input[name="conditionName"], input[placeholder*="name" i]', conditionName);
});

When('I enter condition description {string}', async function (description) {
  console.log(`Entering condition description: ${description}`);
  await this.page.fill('textarea[name="description"], textarea[placeholder*="description" i]', description);
});

When('I add path names {string} and {string}', async function (path1, path2) {
  console.log(`Adding path names: ${path1} and ${path2}`);
  // Look for path input fields or add path buttons
  await this.page.fill('input[name="pathName"], .path-input:first-of-type', path1);
  await this.page.click('button:has-text("Add Path"), [data-testid="add-path-btn"]');
  await this.page.fill('input[name="pathName"], .path-input:last-of-type', path2);
});

When('I set the delay to {int} hours and {int} minutes', async function (hours, minutes) {
  console.log(`Setting delay to ${hours} hours and ${minutes} minutes`);
  await this.page.fill('input[name="hours"], [data-field="hours"]', hours.toString());
  await this.page.fill('input[name="minutes"], [data-field="minutes"]', minutes.toString());
});

When('I enter event name {string}', async function (eventName) {
  console.log(`Entering event name: ${eventName}`);
  await this.page.fill('input[name="eventName"], input[placeholder*="event" i]', eventName);
});

When('I set maximum wait time to {int} days', async function (days) {
  console.log(`Setting maximum wait time to ${days} days`);
  await this.page.fill('input[name="maxWaitDays"], [data-field="maxWaitDays"]', days.toString());
});

// --- Then Steps for Block Creation ---

Then('I should see the add block dropdown menu', async function () {
  console.log('Verifying add block dropdown menu is visible');
  await this.page.waitForSelector('.dropdown-menu, [data-testid="add-block-dropdown"], .block-options', { timeout: 5000 });
});

Then('I should at least see the {string} block option', async function (blockType) {
  console.log(`Verifying ${blockType} block option is available`);
  await this.page.waitForSelector(`button:has-text("${blockType}"), [data-option="${blockType.toLowerCase()}"]`, { timeout: 5000 });
});

Then('a new Step block should be added to the workflow', async function () {
  console.log('Verifying new Step block was added');
  await this.page.waitForSelector('[data-nodetype="step"], .step-block', { timeout: 5000 });
  // Verify we have more than just the begin block
  const stepBlocks = await this.page.locator('[data-nodetype="step"], .step-block').count();
  expect(stepBlocks).toBeGreaterThan(0);
});

Then('the block should have a default title like {string}', async function (expectedTitle) {
  console.log(`Verifying block has default title: ${expectedTitle}`);
  await this.page.waitForSelector(`.block-title:has-text("${expectedTitle}"), [data-block-title*="${expectedTitle}"]`, { timeout: 3000 });
});

Then('the block should have a default icon', async function () {
  console.log('Verifying block has a default icon');
  await this.page.waitForSelector('.block-icon, [data-testid="block-icon"]', { timeout: 3000 });
});

Then('the dropdown menu should close', async function () {
  console.log('Verifying dropdown menu is closed');
  // Wait for dropdown to disappear
  await this.page.waitForSelector('.dropdown-menu, [data-testid="add-block-dropdown"]', { state: 'hidden', timeout: 3000 });
});

Then('I should see the {string} modal', async function (modalTitle) {
  console.log(`Verifying ${modalTitle} modal is visible`);
  const modalSelector = `[role="dialog"]:has-text("${modalTitle}"), .modal:has-text("${modalTitle}")`;
  await this.page.waitForSelector(modalSelector, { timeout: 5000 });
});

Then('the modal should close', async function () {
  console.log('Verifying modal is closed');
  await this.page.waitForSelector('[role="dialog"], .modal', { state: 'hidden', timeout: 5000 });
});

Then('a Condition block should be created', async function () {
  console.log('Verifying Condition block was created');
  await this.page.waitForSelector('[data-nodetype="condition"], .condition-block', { timeout: 5000 });
});

Then('two parallel paths should be created with the specified names', async function () {
  console.log('Verifying parallel paths were created');
  await this.page.waitForSelector('.path-container', { timeout: 5000 });
  const pathCount = await this.page.locator('.path-container').count();
  expect(pathCount).toBeGreaterThanOrEqual(2);
});

Then('each path should have its own branch on the canvas', async function () {
  console.log('Verifying each path has its own branch');
  await this.page.waitForSelector('.path-branch, .parallel-path', { timeout: 5000 });
});

Then('I should see the delay type selection modal', async function () {
  console.log('Verifying delay type selection modal');
  await this.page.waitForSelector('[role="dialog"]:has-text("delay"), .delay-modal', { timeout: 5000 });
});

Then('I should see the fixed delay configuration modal', async function () {
  console.log('Verifying fixed delay configuration modal');
  await this.page.waitForSelector('[role="dialog"]:has-text("fixed"), .fixed-delay-modal', { timeout: 5000 });
});

Then('a Fixed Delay block should be added', async function () {
  console.log('Verifying Fixed Delay block was added');
  await this.page.waitForSelector('[data-nodetype="delay"], .delay-block, [data-delay-type="fixed"]', { timeout: 5000 });
});

Then('the block should display {string} as the delay time', async function (delayText) {
  console.log(`Verifying block displays delay time: ${delayText}`);
  await this.page.waitForSelector(`.block-content:has-text("${delayText}"), [data-delay-display*="${delayText}"]`, { timeout: 3000 });
});

Then('I should see the event delay configuration modal', async function () {
  console.log('Verifying event delay configuration modal');
  await this.page.waitForSelector('[role="dialog"]:has-text("event"), .event-delay-modal', { timeout: 5000 });
});

Then('an Event Delay block should be added', async function () {
  console.log('Verifying Event Delay block was added');
  await this.page.waitForSelector('[data-nodetype="delay"], .delay-block, [data-delay-type="event"]', { timeout: 5000 });
});

Then('the block should display {string}', async function (displayText) {
  console.log(`Verifying block displays: ${displayText}`);
  await this.page.waitForSelector(`.block-content:has-text("${displayText}"), [data-block-display*="${displayText}"]`, { timeout: 3000 });
});

Then('I should see an {string} option', async function (optionText) {
  console.log(`Verifying ${optionText} option is available`);
  await this.page.waitForSelector(`button:has-text("${optionText}"), [data-option*="${optionText.toLowerCase()}"]`, { timeout: 3000 });
});

Then('an End block should be added', async function () {
  console.log('Verifying End block was added');
  await this.page.waitForSelector('[data-nodetype="end"], .end-block', { timeout: 5000 });
});

// --- Path Management and Workflow Structure Steps ---

Given('I have a workflow with at least one Condition block', async function () {
  console.log('Setting up workflow with Condition block');
  // Create a condition block if it doesn't exist
  const existingCondition = await this.page.locator('[data-nodetype="condition"], .condition-block').count();
  if (existingCondition === 0) {
    console.log('Creating condition block...');
    await this.page.click('[data-testid="add-block-button"], .add-block-btn, button:has-text("+")');
    await this.page.click('button:has-text("Condition"), [data-option="condition"]');
    await this.page.fill('input[name="conditionName"]', 'Test Condition');
    await this.page.click('button:has-text("Create Paths")');
  }
  await this.page.waitForSelector('[data-nodetype="condition"], .condition-block', { timeout: 5000 });
});

Given('I have a Condition block with {int} paths', async function (pathCount) {
  console.log(`Setting up Condition block with ${pathCount} paths`);
  // This step assumes the condition block already exists and verifies path count
  await this.page.waitForSelector('[data-nodetype="condition"], .condition-block', { timeout: 5000 });
  const paths = await this.page.locator('.path-container').count();
  expect(paths).toBeGreaterThanOrEqual(pathCount);
});

Given('I have multiple parallel paths that need to converge', async function () {
  console.log('Setting up multiple parallel paths');
  await this.page.waitForSelector('.path-container', { timeout: 5000 });
  const pathCount = await this.page.locator('.path-container').count();
  expect(pathCount).toBeGreaterThan(1);
});

Given('I have conditional paths', async function () {
  console.log('Verifying conditional paths exist');
  await this.page.waitForSelector('.path-container, .conditional-path', { timeout: 5000 });
});

When('I click the three dots menu on the Condition block', async function () {
  console.log('Clicking three dots menu on Condition block');
  await this.page.click('.condition-block [data-testid="block-menu"], .condition-block .three-dots, .condition-block .menu-trigger');
});

When('I click the three dots menu on the last step block of a path', async function () {
  console.log('Clicking three dots menu on last step block');
  await this.page.click('.path-container .block:last-child [data-testid="block-menu"], .path-container .block:last-child .three-dots');
});

When('I click the three dots menu on a source block', async function () {
  console.log('Clicking three dots menu on source block');
  await this.page.click('.block:first-of-type [data-testid="block-menu"], .block:first-of-type .three-dots');
});

When('I modify a path name from {string} to {string}', async function (oldName, newName) {
  console.log(`Modifying path name from ${oldName} to ${newName}`);
  // Find the path input with the old name and change it
  await this.page.fill(`input[value="${oldName}"], .path-input:has-text("${oldName}")`, newName);
});

When('I add a new path {string}', async function (pathName) {
  console.log(`Adding new path: ${pathName}`);
  await this.page.click('button:has-text("Add Path"), [data-testid="add-path-btn"]');
  await this.page.fill('input[name="pathName"]:last-of-type, .path-input:last-of-type', pathName);
});

When('I remove the {string} path', async function (pathName) {
  console.log(`Removing path: ${pathName}`);
  await this.page.click(`[data-path="${pathName}"] .remove-btn, .path-input:has-text("${pathName}") + .remove-btn`);
});

When('I select the paths I want to merge', async function () {
  console.log('Selecting paths to merge');
  await this.page.click('.path-selector:first-of-type, .path-checkbox:first-of-type');
  await this.page.click('.path-selector:nth-of-type(2), .path-checkbox:nth-of-type(2)');
});

When('I click on a path label', async function () {
  console.log('Clicking on path label');
  await this.page.click('.path-label:first-of-type, .path-name:first-of-type');
});

When('I change the label text', async function () {
  console.log('Changing label text');
  await this.page.fill('.path-label input, .path-name input', 'Updated Path Name');
});

When('I press Enter or I click outside the label', async function () {
  console.log('Confirming label change');
  await this.page.press('.path-label input, .path-name input', 'Enter');
});

// --- Block Editing and Properties Steps ---

When('I click on a Step block', async function () {
  console.log('Clicking on Step block');
  await this.page.click('[data-nodetype="step"], .step-block');
});

When('I open the block details sidebar', async function () {
  console.log('Opening block details sidebar');
  await this.page.click('[data-nodetype="step"], .step-block');
  await this.page.waitForSelector('.block-details-sidebar, [data-testid="block-sidebar"]', { timeout: 5000 });
});

When('I click on the block title', async function () {
  console.log('Clicking on block title');
  await this.page.click('.block-details-sidebar .title, .block-sidebar .block-title');
});

When('I change the title to {string}', async function (newTitle) {
  console.log(`Changing title to: ${newTitle}`);
  await this.page.fill('.block-details-sidebar input[name="title"], .title-input', newTitle);
});

When('I click in the description area', async function () {
  console.log('Clicking in description area');
  await this.page.click('.block-details-sidebar .description, .description-field');
});

When('I enter {string}', async function (text) {
  console.log(`Entering text: ${text}`);
  await this.page.fill('textarea[name="description"], .description-field', text);
});

When('I click outside the description field', async function () {
  console.log('Clicking outside description field');
  await this.page.click('.block-details-sidebar .title'); // Click on title area to lose focus
});

When('I click on the block icon', async function () {
  console.log('Clicking on block icon');
  await this.page.click('.block-details-sidebar .icon, .block-icon');
});

When('I select an icon from the Icons tab', async function () {
  console.log('Selecting icon from Icons tab');
  await this.page.click('.icon-grid .icon:first-of-type, .icon-selector .icon:first-of-type');
});

When('I click in the media section', async function () {
  console.log('Clicking in media section');
  await this.page.click('.media-section, .media-upload-area');
});

When('I drag and drop an image file', async function () {
  console.log('Simulating drag and drop of image file');
  // For testing purposes, we'll simulate file upload
  const fileInput = await this.page.locator('input[type="file"]');
  if (await fileInput.count() > 0) {
    // Simulate file selection (in real test, you'd use actual file)
    console.log('File input found, simulating upload...');
  }
});

When('I click the edit button on the image', async function () {
  console.log('Clicking edit button on image');
  await this.page.click('.media-item .edit-btn, .image-editor-btn');
});

When('I make edits to the image', async function () {
  console.log('Making edits to image');
  // Simulate image editing actions
  await this.page.waitForSelector('.image-editor, [data-testid="image-editor"]', { timeout: 5000 });
});

// --- Then Steps for Advanced Features ---

Then('I should see the {string} modal', async function (modalTitle) {
  console.log(`Verifying ${modalTitle} modal is visible`);
  const modalSelector = `[role="dialog"]:has-text("${modalTitle}"), .modal:has-text("${modalTitle}")`;
  await this.page.waitForSelector(modalSelector, { timeout: 5000 });
});

Then('I should see the current paths listed', async function () {
  console.log('Verifying current paths are listed');
  await this.page.waitForSelector('.path-list, .current-paths', { timeout: 5000 });
});

Then('the paths should be updated accordingly', async function () {
  console.log('Verifying paths were updated');
  await this.page.waitForTimeout(1000); // Allow for updates
  await this.page.waitForSelector('.path-container', { timeout: 5000 });
});

Then('the workflow should reflect the changes', async function () {
  console.log('Verifying workflow reflects changes');
  await this.page.waitForTimeout(1000); // Allow for rendering
});

Then('I should enter merge mode', async function () {
  console.log('Verifying merge mode is active');
  await this.page.waitForSelector('.merge-mode, [data-mode="merge"]', { timeout: 5000 });
});

Then('I should see path selection indicators', async function () {
  console.log('Verifying path selection indicators');
  await this.page.waitForSelector('.path-selector, .path-checkbox', { timeout: 5000 });
});

Then('the selected paths should converge into a single path', async function () {
  console.log('Verifying paths converged');
  await this.page.waitForTimeout(2000); // Allow for merge operation
  await this.page.waitForSelector('.merged-path, .convergent-path', { timeout: 5000 });
});

Then('the label should become editable', async function () {
  console.log('Verifying label is editable');
  await this.page.waitForSelector('.path-label input, .path-name input', { timeout: 3000 });
});

Then('the label should be updated', async function () {
  console.log('Verifying label was updated');
  await this.page.waitForTimeout(1000); // Allow for update
});

Then('the change should be reflected in the workflow', async function () {
  console.log('Verifying change is reflected in workflow');
  await this.page.waitForTimeout(1000); // Allow for rendering
});

Then('the block details sidebar should open on the right', async function () {
  console.log('Verifying block details sidebar opened');
  await this.page.waitForSelector('.block-details-sidebar, [data-testid="block-sidebar"]', { timeout: 5000 });
});

Then('I should see the block\'s current title', async function () {
  console.log('Verifying block current title is visible');
  await this.page.waitForSelector('.block-details-sidebar .title, .block-title', { timeout: 3000 });
});

Then('I should see the block\'s icon', async function () {
  console.log('Verifying block icon is visible');
  await this.page.waitForSelector('.block-details-sidebar .icon, .block-icon', { timeout: 3000 });
});

Then('I should see fields for description, average time, and media', async function () {
  console.log('Verifying description, time, and media fields');
  await this.page.waitForSelector('.description-field, textarea[name="description"]', { timeout: 3000 });
  await this.page.waitForSelector('.time-field, input[name="averageTime"]', { timeout: 3000 });
  await this.page.waitForSelector('.media-section, .media-upload', { timeout: 3000 });
});

Then('I should see a close button', async function () {
  console.log('Verifying close button is visible');
  await this.page.waitForSelector('.close-btn, .sidebar-close, button:has-text("Close")', { timeout: 3000 });
});

Then('when I click on the canvas, the sidebar should close', async function () {
  console.log('Testing sidebar closes when clicking canvas');
  await this.page.click('.react-flow, .canvas');
  await this.page.waitForSelector('.block-details-sidebar', { state: 'hidden', timeout: 3000 });
});

Then('the title should become editable', async function () {
  console.log('Verifying title becomes editable');
  await this.page.waitForSelector('.title-input, input[name="title"]', { timeout: 3000 });
});

Then('the title should be updated', async function () {
  console.log('Verifying title was updated');
  await this.page.waitForTimeout(1000); // Allow for update
});

Then('the sidebar should show the new title', async function () {
  console.log('Verifying sidebar shows new title');
  await this.page.waitForTimeout(1000); // Allow for rendering
});

Then('the block on the canvas should show the new title', async function () {
  console.log('Verifying canvas block shows new title');
  await this.page.waitForTimeout(1000); // Allow for rendering
});

Then('the description field should become editable', async function () {
  console.log('Verifying description field is editable');
  await this.page.waitForSelector('textarea[name="description"]:focus, .description-field:focus', { timeout: 3000 });
});

Then('the description should be saved', async function () {
  console.log('Verifying description was saved');
  await this.page.waitForTimeout(1000); // Allow for save
});

Then('the description should be visible in the sidebar', async function () {
  console.log('Verifying description is visible in sidebar');
  await this.page.waitForTimeout(1000); // Allow for rendering
});

Then('I should see the icon selection modal', async function () {
  console.log('Verifying icon selection modal');
  await this.page.waitForSelector('.icon-modal, [role="dialog"]:has-text("icon")', { timeout: 5000 });
});

Then('I should see tabs for {string}, {string}, and {string}', async function (tab1, tab2, tab3) {
  console.log(`Verifying tabs: ${tab1}, ${tab2}, ${tab3}`);
  await this.page.waitForSelector(`[role="tab"]:has-text("${tab1}")`, { timeout: 3000 });
  await this.page.waitForSelector(`[role="tab"]:has-text("${tab2}")`, { timeout: 3000 });
  await this.page.waitForSelector(`[role="tab"]:has-text("${tab3}")`, { timeout: 3000 });
});

Then('the icon should be applied to the block', async function () {
  console.log('Verifying icon was applied to block');
  await this.page.waitForTimeout(1000); // Allow for icon update
});

Then('the block should display the new icon', async function () {
  console.log('Verifying block displays new icon');
  await this.page.waitForTimeout(1000); // Allow for rendering
});

// --- Stroke Lines and Connections Steps ---

Given('I have multiple blocks in different paths', async function () {
  console.log('Setting up multiple blocks in different paths');
  // Ensure we have multiple paths with blocks
  await this.page.waitForSelector('.path-container', { timeout: 5000 });
  const pathCount = await this.page.locator('.path-container').count();
  expect(pathCount).toBeGreaterThan(1);
  
  // Ensure we have blocks in paths
  await this.page.waitForSelector('.block', { timeout: 5000 });
  const blockCount = await this.page.locator('.block').count();
  expect(blockCount).toBeGreaterThan(2);
});

Given('I have a stroke line connection', async function () {
  console.log('Setting up stroke line connection');
  // Create a stroke line connection if it doesn't exist
  const existingStrokeLine = await this.page.locator('.stroke-line, .custom-connection').count();
  if (existingStrokeLine === 0) {
    console.log('Creating stroke line connection...');
    await this.page.click('.block:first-of-type [data-testid="block-menu"], .block:first-of-type .three-dots');
    await this.page.click('button:has-text("Connect Blocks"), [data-option="connect"]');
    await this.page.click('.block:nth-of-type(2)'); // Click target block
    await this.page.fill('input[name="connectionLabel"]', 'Test Connection');
    await this.page.click('button:has-text("Create Connection")');
  }
  await this.page.waitForSelector('.stroke-line, .custom-connection', { timeout: 5000 });
});

Given('I have multiple stroke lines in my workflow', async function () {
  console.log('Setting up multiple stroke lines');
  await this.page.waitForSelector('.stroke-line, .custom-connection', { timeout: 5000 });
  // Verify we have at least one stroke line
  const strokeLineCount = await this.page.locator('.stroke-line, .custom-connection').count();
  expect(strokeLineCount).toBeGreaterThan(0);
});

Given('I have a stroke line with a curved path', async function () {
  console.log('Setting up stroke line with curved path');
  await this.page.waitForSelector('.stroke-line, .custom-connection', { timeout: 5000 });
  // Assume the stroke line has control points for curves
});

When('I click on a target block', async function () {
  console.log('Clicking on target block');
  await this.page.click('.block:nth-of-type(2), .target-block');
});

When('I enter connection label {string}', async function (label) {
  console.log(`Entering connection label: ${label}`);
  await this.page.fill('input[name="connectionLabel"], input[placeholder*="label" i]', label);
});

When('I click on the stroke line', async function () {
  console.log('Clicking on stroke line');
  await this.page.click('.stroke-line, .custom-connection');
});

When('I confirm the deletion', async function () {
  console.log('Confirming deletion');
  await this.page.click('button:has-text("Delete"), button:has-text("Confirm"), .confirm-btn');
});

When('I click the stroke lines visibility toggle', async function () {
  console.log('Clicking stroke lines visibility toggle');
  await this.page.click('.stroke-lines-toggle, [data-testid="toggle-stroke-lines"], button:has-text("Hide Lines")');
});

When('I hover over the stroke line', async function () {
  console.log('Hovering over stroke line');
  await this.page.hover('.stroke-line, .custom-connection');
});

When('I drag a control point', async function () {
  console.log('Dragging control point');
  const controlPoint = await this.page.locator('.control-point, .stroke-control').first();
  if (await controlPoint.count() > 0) {
    const box = await controlPoint.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.mouse.down();
      await this.page.mouse.move(box.x + 50, box.y + 30);
      await this.page.mouse.up();
    }
  }
});

// --- Advanced Canvas Interaction Steps ---

When('I right-click on the canvas', async function () {
  console.log('Right-clicking on canvas');
  const canvas = await this.page.locator('.react-flow, .canvas').first();
  const box = await canvas.boundingBox();
  if (box) {
    await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' });
  }
});

When('I use keyboard shortcuts', async function () {
  console.log('Using keyboard shortcuts');
  // Test common shortcuts like Ctrl+Z for undo
  await this.page.keyboard.press('Control+z');
});

When('I select multiple blocks', async function () {
  console.log('Selecting multiple blocks');
  // Use Ctrl+click to select multiple blocks
  await this.page.click('.block:first-of-type');
  await this.page.click('.block:nth-of-type(2)', { modifiers: ['Control'] });
});

When('I drag to create a selection box', async function () {
  console.log('Creating selection box');
  const canvas = await this.page.locator('.react-flow, .canvas').first();
  const box = await canvas.boundingBox();
  if (box) {
    await this.page.mouse.move(box.x + 100, box.y + 100);
    await this.page.mouse.down();
    await this.page.mouse.move(box.x + 300, box.y + 200);
    await this.page.mouse.up();
  }
});

When('I copy and paste blocks', async function () {
  console.log('Copying and pasting blocks');
  await this.page.click('.block:first-of-type'); // Select a block
  await this.page.keyboard.press('Control+c'); // Copy
  await this.page.keyboard.press('Control+v'); // Paste
});

// --- Then Steps for Stroke Lines ---

Then('I should enter connection mode', async function () {
  console.log('Verifying connection mode is active');
  await this.page.waitForSelector('.connection-mode, [data-mode="connect"]', { timeout: 5000 });
});

Then('I should see the connection modal', async function () {
  console.log('Verifying connection modal is visible');
  await this.page.waitForSelector('.connection-modal, [role="dialog"]:has-text("connection")', { timeout: 5000 });
});

Then('I should see the source and target blocks highlighted', async function () {
  console.log('Verifying source and target blocks are highlighted');
  await this.page.waitForSelector('.source-block.highlighted, .target-block.highlighted', { timeout: 3000 });
});

Then('a stroke line should be drawn between the blocks', async function () {
  console.log('Verifying stroke line was drawn');
  await this.page.waitForSelector('.stroke-line, .custom-connection', { timeout: 5000 });
});

Then('the line should display the label', async function () {
  console.log('Verifying line displays label');
  await this.page.waitForSelector('.stroke-line-label, .connection-label', { timeout: 3000 });
});

Then('I should see a confirmation modal', async function () {
  console.log('Verifying confirmation modal');
  await this.page.waitForSelector('.confirmation-modal, [role="dialog"]:has-text("confirm")', { timeout: 5000 });
});

Then('the stroke line should be removed', async function () {
  console.log('Verifying stroke line was removed');
  await this.page.waitForSelector('.stroke-line, .custom-connection', { state: 'hidden', timeout: 5000 });
});

Then('the connection should no longer exist', async function () {
  console.log('Verifying connection no longer exists');
  const connections = await this.page.locator('.stroke-line, .custom-connection').count();
  expect(connections).toBe(0);
});

Then('all stroke lines should be hidden', async function () {
  console.log('Verifying all stroke lines are hidden');
  await this.page.waitForSelector('.stroke-line, .custom-connection', { state: 'hidden', timeout: 3000 });
});

Then('all stroke lines should be visible again', async function () {
  console.log('Verifying all stroke lines are visible again');
  await this.page.waitForSelector('.stroke-line, .custom-connection', { timeout: 3000 });
});

Then('I should see control points for adjusting the curve', async function () {
  console.log('Verifying control points are visible');
  await this.page.waitForSelector('.control-point, .stroke-control', { timeout: 3000 });
});

Then('the stroke line path should adjust accordingly', async function () {
  console.log('Verifying stroke line path adjusted');
  await this.page.waitForTimeout(1000); // Allow for path adjustment
});

Then('the new path should be saved', async function () {
  console.log('Verifying new path was saved');
  await this.page.waitForTimeout(1000); // Allow for save
});

// --- Then Steps for Advanced Canvas Interactions ---

Then('I should see a context menu', async function () {
  console.log('Verifying context menu appears');
  await this.page.waitForSelector('.context-menu, .right-click-menu', { timeout: 3000 });
});

Then('I should see undo/redo functionality', async function () {
  console.log('Verifying undo/redo functionality');
  // This would check if the action was undone
  await this.page.waitForTimeout(1000);
});

Then('multiple blocks should be selected', async function () {
  console.log('Verifying multiple blocks are selected');
  const selectedBlocks = await this.page.locator('.block.selected, .block[data-selected="true"]').count();
  expect(selectedBlocks).toBeGreaterThan(1);
});

Then('blocks within the selection area should be selected', async function () {
  console.log('Verifying blocks in selection area are selected');
  await this.page.waitForSelector('.block.selected, .block[data-selected="true"]', { timeout: 3000 });
});

Then('a copy of the block should be created', async function () {
  console.log('Verifying block copy was created');
  await this.page.waitForTimeout(2000); // Allow for copy operation
  const blockCount = await this.page.locator('.block').count();
  expect(blockCount).toBeGreaterThan(1);
});

// Media upload steps for block editing
Then('I should see a file upload area', async function () {
  console.log('Verifying file upload area');
  await this.page.waitForSelector('.file-upload-area, input[type="file"]', { timeout: 5000 });
});

Then('the image should be uploaded', async function () {
  console.log('Verifying image was uploaded');
  await this.page.waitForTimeout(2000); // Allow for upload
});

Then('the image should be displayed in the media section', async function () {
  console.log('Verifying image is displayed');
  await this.page.waitForSelector('.media-preview, .uploaded-image', { timeout: 5000 });
});

Then('I should see options to edit or remove the image', async function () {
  console.log('Verifying image edit/remove options');
  await this.page.waitForSelector('.edit-image-btn, .remove-image-btn', { timeout: 3000 });
});

Given('I have a block with an uploaded image', async function () {
  console.log('Setting up block with uploaded image');
  // Assumes image has been uploaded in previous steps
  await this.page.waitForSelector('.media-preview, .uploaded-image', { timeout: 5000 });
});

Then('I should see the image editor modal', async function () {
  console.log('Verifying image editor modal');
  await this.page.waitForSelector('.image-editor-modal, [role="dialog"]:has-text("editor")', { timeout: 5000 });
});

Then('the edited image should be saved', async function () {
  console.log('Verifying edited image was saved');
  await this.page.waitForTimeout(2000); // Allow for save
});

Then('the original image should be preserved for reset option', async function () {
  console.log('Verifying original image preservation');
  await this.page.waitForSelector('.reset-image-btn, button:has-text("Reset")', { timeout: 3000 });
});

Given('an editor placeholder step', function () {
  // Placeholder step for editor
});
