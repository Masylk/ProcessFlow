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

**Testing workflows:**
- Access workflows at: `http://localhost:3000/workspace/2`

## Architecture

**Tech Stack:**
- Next.js 15 with App Router
- React 18 with TypeScript
- Prisma ORM with PostgreSQL
- Supabase for auth
- ReactFlow for workflow visualization
- Tailwind CSS with custom theming
- Stripe for billing

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