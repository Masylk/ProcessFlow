# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

**E2E Testing:**
- `npm run test:seed` - Seed test data for E2E tests
- `npm run test:e2e` - Run all E2E tests (includes automatic seeding)
- `npm run test:e2e:editor` - Run editor E2E tests (includes automatic seeding)
- `npm run test:cleanup` - Clean up test data manually

**Testing workflows:**
- Access workflows at: `http://localhost:3000/workspace/2`
- E2E test workspace: Use seeded data from `e2e/test-data.json`
- Test credentials: `test-user@processflow-test.com` / `TestPassword123!`

## Architecture

**Tech Stack:**
- Next.js 15 with App Router
- React 18 with TypeScript
- Prisma ORM with PostgreSQL
- Supabase for auth
- ReactFlow for workflow visualization
- Tailwind CSS with custom theming
- Stripe for billing
- Cucumber.js + Playwright for E2E testing

**Core Models:**
- **Workspace** - Contains workflows, folders, users with role-based access
- **Workflow** - Contains blocks organized in paths, supports public sharing
- **Path** - Collection of connected blocks forming workflow sequences
- **Block** - Individual workflow steps (STEP, DELAY, BEGIN, END, LAST, MERGE, PATH)
- **StrokeLine** - Custom connections between blocks with control points

**Key Architectural Patterns:**
- Server Components by default, `"use client"` only when necessary
- Zustand stores for client state management (modal, paths, edit modes)
- API routes follow `/app/api/*` structure
- Server Actions preferred over API routes for mutations
- Theme-aware components using `useColors()` hook from `/app/theme/hooks.ts`

**Frontend Structure:**
- `/[slug]/[flow]/edit/` - Workflow editor with ReactFlow canvas
- `/[slug]/[flow]/read/` - Read-only workflow viewer  
- `/dashboard/` - Workspace management
- Custom ReactFlow blocks in `/edit/components/blocks/`
- Custom ReactFlow edges in `/edit/components/edges/`

**State Management:**
- Edit mode: Multiple Zustand stores for different concerns
- Modal state, path selection, stroke lines, clipboard operations
- SWR for server state synchronization

## Code Standards

**TypeScript:**
- Functions max 50 lines, ideally 20-30
- Single responsibility principle
- Use object parameters for functions with many parameters
- Handle errors gracefully, never expose sensitive errors

**React/Frontend:**
- Functional components only
- Use `useColors()` hook for theme colors
- All pages must be theme-aware
- Self-close components without children
- Use parentheses for multi-line JSX

**Backend:**
- Validate API inputs before processing
- Use async/await consistently
- Sanitize user input before database operations
- Use React Query (TanStack) or SWR for client-side fetching
- Use Server Actions or `getServerSideProps` for server-side fetching
- Use Next.js Middleware for request handling
- Use `useFormState` instead of `useState` for form handling in Server Components

## Testing

**E2E Testing Infrastructure:**
- **Framework:** Cucumber.js with Gherkin feature files + Playwright for browser automation
- **Database Seeding:** Automated test data creation for consistent authentication testing
- **Test Organization:** Feature files organized by domain (authentication, dashboard, editor, etc.)
- **Authentication:** Seeded test users with credentials for reliable login testing
- **CI/CD Ready:** Automated seeding and cleanup for continuous integration

**E2E Test Data:**
- **Seeded Users:** 3 test users with different roles (ADMIN/EDITOR)
- **Test Workspace:** "Test Workspace" with predictable slug and ID
- **Test Workflow:** "Test Workflow for E2E" with basic block structure
- **Data Location:** `e2e/test-data.json` (auto-generated after seeding)
- **Cleanup:** Automatic cleanup before each seeding run

**E2E Testing Workflow:**
1. Run `npm run test:seed` to create fresh test data
2. Tests automatically load seeded credentials from `e2e/test-data.json`
3. Use `loadTestData()` helper in step definitions to access test data
4. All tests use consistent authentication and workspace/workflow IDs
5. Clean slate for each test run ensures reliable CI/CD execution

**Writing E2E Tests:**
- Create `.feature` files in appropriate domain folders under `e2e/features/`
- Implement step definitions in corresponding `.steps.ts` files
- Use `this.page` for Playwright browser interactions
- Use `this.testData` to access seeded workspace/workflow data
- Always start authenticated scenarios with `Given I am a logged-in user`
- Reference seeded URLs: `TEST_DATA.urls.editor` for consistent navigation

**E2E Testing Best Practices:**
- Use seeded test credentials instead of hardcoded values
- Leverage `login(page)` helper for authentication flows
- Take screenshots for debugging: `await page.screenshot({ path: 'debug.png' })`
- Use appropriate timeouts for async operations
- Keep step definitions atomic and reusable across features
- See `/docs/E2E_TESTING_SETUP.md` for comprehensive testing guide