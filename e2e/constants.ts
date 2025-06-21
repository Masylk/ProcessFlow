/**
 * E2E Test Constants
 * Centralized constants for timeouts, selectors, and test data
 */

export const TIMEOUTS = {
  SHORT: 1000,
  MEDIUM: 3000,
  LONG: 5000,
  VERY_LONG: 10000,
  NAVIGATION: 15000,
} as const;

export const SELECTORS = {
  // Page states
  UNAUTHORIZED_PAGE: '/unauthorized',
  LOGIN_PAGE: '/login',
  EDIT_PAGE: '/edit',

  // Authentication
  EMAIL_INPUT: 'input[name="email"], input[type="email"]',
  PASSWORD_INPUT: 'input[name="password"], input[type="password"]',
  SUBMIT_BUTTON: 'button[type="submit"]',

  // Error messages
  ERROR_ELEMENTS: [
    '[role="alert"]',
    '.error',
    '.toast',
    '[data-testid="error-message"]',
    '.text-red-500:has-text("Invalid")',
    '.text-red-500:has-text("Wrong")',
    '.text-red-500:has-text("incorrect")',
    '.text-danger'
  ],

  // Workflow header
  WORKFLOW_HEADER: [
    'span:has-text("Test Workflow for E2E")',
    'h1',
    '.workflow-header h1',
    '.workflow-title',
    'span[class*="font"]'
  ],

  // Canvas and ReactFlow
  CANVAS: [
    '.react-flow',
    '[data-testid="rf__wrapper"]',
    '.react-flow__renderer'
  ],

  // Zoom controls
  ZOOM_IN: [
    '.react-flow__controls button[title*="zoom in"]',
    '.zoom-controls .zoom-in',
    'button:has-text("+")'
  ],
  ZOOM_OUT: [
    '.react-flow__controls button[title*="zoom out"]',
    '.zoom-controls .zoom-out',
    'button:has-text("-")'
  ],

  // Blocks
  BLOCKS: {
    STEP: [
      '[data-nodetype="step"]',
      '.step-block',
      '[data-block-type="STEP"]',
      '.react-flow__node[data-nodetype="step"]'
    ],
    BEGIN: [
      '[data-nodetype="begin"]',
      '.begin-block',
      '[data-block-type="BEGIN"]',
      '.react-flow__node[data-nodetype="begin"]'
    ],
    END: [
      '[data-nodetype="end"]',
      '.end-block',
      '[data-block-type="END"]',
      '.react-flow__node[data-nodetype="end"]'
    ],
    MERGE: [
      '[data-nodetype="merge"]',
      '.merge-block',
      '[data-block-type="MERGE"]',
      '.react-flow__node[data-nodetype="merge"]'
    ]
  },

  // Block actions
  BLOCK_MENU: [
    '.three-dots-menu',
    '.block-menu',
    'button[aria-label="Block options"]',
    '.menu-trigger',
    'svg[data-icon="dots-horizontal"]'
  ],

  ADD_BLOCK: [
    '[data-testid="add-block-button"]',
    '.add-block-btn',
    'button:has-text("+")',
    '.add-button',
    '.block-add-button'
  ],

  // Sidebar
  SIDEBAR: [
    '.sidebar',
    '[data-testid="sidebar"]',
    '.editor-sidebar'
  ],

  SIDEBAR_BLOCKS: [
    '.sidebar [data-block-id]',
    '.sidebar .block-item',
    '.sidebar li:has-text("Start")',
    '.sidebar li:has-text("Begin")'
  ],

  // Modal and forms
  MODAL: [
    '.modal',
    '[role="dialog"]',
    '.dialog'
  ],

  INPUT_FIELD: [
    'input[type="text"]',
    'input[placeholder*="title"]',
    'input[placeholder*="name"]',
    'textarea'
  ]
} as const;

export const TEST_DATA = {
  DEFAULT_BLOCK_TITLE: 'Test Step',
  DEFAULT_WORKFLOW_NAME: 'Test Workflow for E2E',
  DEVELOPMENT_CREDENTIALS: {
    EMAIL: 'test-user@processflow-test.com',
    PASSWORD: 'TestPassword123!'
  }
} as const;

export const DEBUG_PATHS = {
  CURRENT_PAGE: 'e2e/debug-current-page.png',
  LOGIN_ERROR: 'e2e/debug-login-error.png',
  LOGIN_FAILED: 'e2e/debug-login-failed.png',
  LOGIN_FINAL: 'e2e/debug-login-final.png',
  LOGIN_STATE: 'e2e/debug-login-state.png',
  NO_BLOCKS: 'e2e/debug-no-blocks.png',
  NO_STEP_BLOCK: 'e2e/debug-no-step-block.png'
} as const;