# sudoku-race - Epic Breakdown

**Author:** Spardutti
**Date:** November 8, 2025
**Project Level:** Medium (Greenfield)
**Target Scale:** 10 DAU → 1,000 DAU (MVP → Growth)

---

## Overview

This document provides the complete epic and story breakdown for **sudoku-race** (Sudoku Daily), decomposing the requirements from the [PRD](./PRD.md) into implementable stories.

### Epic Structure

**6 Epics | 32 Stories Total**

This breakdown delivers the complete MVP through 6 sequential epics:

1. **Foundation & Infrastructure** (5 stories) - Establish technical foundation
2. **Core Puzzle Experience** (7 stories) - Deliver daily Sudoku playing experience
3. **User Identity & Authentication** (5 stories) - Enable guest-to-auth journey
4. **Competitive Leaderboards** (5 stories) - Authentic competitive rankings
5. **Viral Social Mechanics** (5 stories) - Emoji sharing growth engine
6. **Engagement & Retention** (5 stories) - Streaks and stats for habit formation

### Value Delivery Path

- **After Epic 1:** Development environment ready, deployable foundation
- **After Epic 2:** Playable daily Sudoku (guest mode) - CORE VALUE LIVE
- **After Epic 3:** Authenticated users with saved progress
- **After Epic 4:** Competitive leaderboards (core differentiator) - PRODUCT MAGIC LIVE
- **After Epic 5:** Viral sharing enabled - GROWTH ENGINE LIVE
- **After Epic 6:** Complete MVP with retention features

### Key Principles

**Vertical Slicing:** Every story delivers complete, testable functionality across the stack (not horizontal layers)

**Sequential Dependencies:** Stories only depend on previous work (no forward dependencies)

**Single-Session Sized:** Each story completable by one dev agent in focused session (200k context limit)

**BDD Acceptance Criteria:** Given/When/Then format for clarity and testability

---

## Epic 1: Foundation & Infrastructure

**Goal:** Establish technical foundation enabling all subsequent development with deployable infrastructure, core app structure, and design system foundations.

**Value:** Without this foundation, no other epics can proceed. Creates the development environment, deployment pipeline, and core infrastructure that all features depend on.

**Business Impact:** Enables rapid iteration and deployment from day one. Sets quality bar with TypeScript, testing setup, and CI/CD.

---

### Story 1.1: Project Initialization & Core Infrastructure

As a **developer**,
I want a **fully configured Next.js 16 project with TypeScript, deployment pipeline, and core dependencies**,
So that I can **build features on a solid foundation with rapid deployment capabilities**.

**Acceptance Criteria:**

**Given** a new Next.js 16 project with React 19
**When** the project is initialized
**Then** the following are configured and working:
- TypeScript with strict mode enabled
- Tailwind CSS 4 installed and configured
- ESLint and Prettier for code quality
- Git repository with `.gitignore` configured
- Environment variable management (`.env.local` setup)

**And** Vercel deployment pipeline is configured:
- Project connected to Vercel
- Automatic deployments on push to main
- Preview deployments for branches
- Environment variables configured in Vercel

**And** basic project structure exists:
```
/app - Next.js 15+ app directory
/components - Reusable React components
/lib - Utility functions and helpers
/types - TypeScript type definitions
/public - Static assets
```

**And** a "Hello World" page deploys successfully to Vercel

**Prerequisites:** None (Epic 1, Story 1 - foundation starter)

**Technical Notes:**
- Use Next.js 16 with App Router (not Pages Router)
- Enable TypeScript strict mode for type safety
- Configure Tailwind CSS with newspaper aesthetic variables (prepare for Story 1.5)
- Set up environment variables for Supabase (will be used in Story 1.2)
- Vercel free tier sufficient for MVP

---

### Story 1.2: Supabase Integration & Database Setup

As a **developer**,
I want **Supabase connected with database schema and authentication configured**,
So that I can **store user data, puzzle state, and handle OAuth authentication**.

**Acceptance Criteria:**

**Given** Supabase project created (free tier)
**When** integration is complete
**Then** Supabase client is configured in the Next.js app:
- `@supabase/supabase-js` installed
- Supabase URL and anon key in environment variables
- Supabase client utility created (`/lib/supabase.ts`)
- Connection tested and verified

**And** database schema is created with tables:
- `users` (id, email, username, oauth_provider, created_at, updated_at)
- `puzzles` (id, puzzle_date, puzzle_data, difficulty, solution, created_at)
- `completions` (id, user_id, puzzle_id, completion_time_seconds, completed_at, is_guest)
- `leaderboards` (id, puzzle_id, user_id, rank, completion_time_seconds, submitted_at)
- `streaks` (id, user_id, current_streak, longest_streak, last_completion_date, freeze_used)

**And** Supabase Auth is configured:
- OAuth providers enabled (Google, GitHub, Apple) in Supabase dashboard
- Redirect URLs configured for local and production
- Row Level Security (RLS) policies created for data protection

**And** database indexes created for performance:
- Index on `puzzles.puzzle_date` (daily lookup)
- Index on `leaderboards.puzzle_id, completion_time_seconds` (leaderboard queries)
- Index on `completions.user_id` (user history)

**Prerequisites:** Story 1.1 (project structure and environment variables)

**Technical Notes:**
- Use Supabase free tier (500MB database, sufficient for MVP)
- Enable RLS on all tables for security
- Create database migration file for version control
- Document schema in `/docs/database-schema.md` for architecture reference
- OAuth redirect URLs: `http://localhost:3000/auth/callback` (dev) and `https://sudoku-daily.vercel.app/auth/callback` (prod)

---

### Story 1.3: Core App Routing & Layout Structure

As a **user**,
I want **clean navigation and consistent layout across all pages**,
So that I can **easily access the daily puzzle and understand the site structure**.

**Acceptance Criteria:**

**Given** Next.js app directory structure
**When** routing is implemented
**Then** the following routes exist and render:
- `/` - Home page (daily puzzle)
- `/auth/callback` - OAuth callback handler
- `/profile` - User profile (requires auth - placeholder for now)
- `/leaderboard` - Global leaderboard (placeholder for now)

**And** root layout (`/app/layout.tsx`) includes:
- HTML structure with proper meta tags
- Newspaper aesthetic typography (serif headers, sans-serif body)
- Responsive viewport configuration
- Layout persists across page navigation

**And** navigation header component created:
- "Sudoku Daily" branding (newspaper style)
- Navigation links (Today's Puzzle, Leaderboard, Profile)
- Responsive mobile menu (hamburger on small screens)
- Black & white newspaper aesthetic applied

**And** footer component created:
- Links to Privacy Policy, Terms (placeholders)
- "Built with Claude Code" attribution
- Copyright notice

**And** 404 page created with newspaper aesthetic

**Prerequisites:** Story 1.1 (Next.js project structure)

**Technical Notes:**
- Use Next.js App Router layout system
- Create reusable `<Header>` and `<Footer>` components in `/components/layout/`
- Mobile-first responsive design (320px-767px primary)
- Newspaper aesthetic: black & white base with spot color (#1a73e8 for links)
- Set page titles and meta descriptions for SEO

---

### Story 1.4: Testing Infrastructure & CI/CD Quality Gates

As a **developer**,
I want **automated testing and CI/CD quality gates**,
So that I can **catch bugs early and maintain code quality as the project scales**.

**Acceptance Criteria:**

**Given** the Next.js project with Vercel deployment
**When** testing infrastructure is set up
**Then** the following test frameworks are configured:
- Jest for unit testing
- React Testing Library for component testing
- Playwright for E2E testing (optional for MVP, config only)

**And** npm scripts exist:
- `npm test` - Run all unit tests
- `npm run test:watch` - Watch mode for development
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - ESLint check
- `npm run format` - Prettier format

**And** GitHub Actions workflow created (`.github/workflows/ci.yml`):
- Runs on every PR and push to main
- Executes: `npm run lint`, `npm test`, `npm run build`
- Blocks merge if any step fails
- Runs in parallel for speed

**And** example tests exist demonstrating patterns:
- Unit test for utility function
- Component test for reusable UI component
- Tests pass in CI/CD pipeline

**And** coverage threshold configured (70% minimum for MVP)

**Prerequisites:** Story 1.1 (project structure), Story 1.3 (components to test)

**Technical Notes:**
- Jest config in `jest.config.js`
- Test files co-located with components (`ComponentName.test.tsx`)
- Use React Testing Library best practices (test behavior, not implementation)
- Playwright E2E tests deferred to post-MVP (foundation only for now)
- GitHub Actions free tier sufficient for MVP
- Configure coverage reports to exclude test files and config

---

### Story 1.5: Design System Foundations (Newspaper Aesthetic)

As a **designer/developer**,
I want **a design system with newspaper aesthetic components and styles**,
So that I can **build consistent, brand-aligned UI quickly across all features**.

**Acceptance Criteria:**

**Given** Tailwind CSS configured in the project
**When** design system is implemented
**Then** Tailwind config (`tailwind.config.ts`) includes:
- Custom color palette (black, white, spot blue, neutrals)
- Typography scale (serif for headers, sans-serif for body)
- Spacing system based on 8px grid
- Responsive breakpoints (mobile 320-767px, tablet 768-1024px, desktop 1025px+)

**And** design tokens documented:
```typescript
// /lib/design-tokens.ts
colors: {
  primary: '#000000',      // Black
  background: '#FFFFFF',   // White
  accent: '#1a73e8',       // Blue (spot color)
  success: '#0f9d58',      // Green
  neutral: '#757575',      // Gray
}
typography: {
  fontFamily: {
    serif: ['Merriweather', 'Georgia', 'serif'],
    sans: ['Inter', 'system-ui', 'sans-serif'],
  }
}
```

**And** reusable UI components created in `/components/ui/`:
- `<Button>` - Primary, secondary, ghost variants
- `<Card>` - Clean card with newspaper aesthetic
- `<Input>` - Text input with focus states
- `<Typography>` - Heading, body, caption variants

**And** each component has:
- TypeScript props interface
- Accessible attributes (ARIA labels, keyboard support)
- Responsive design
- Unit tests
- Storybook story (optional for MVP - document usage in comments)

**And** example page demonstrating design system usage

**Prerequisites:** Story 1.1 (Tailwind CSS configured), Story 1.3 (layout structure)

**Technical Notes:**
- Use Tailwind CSS custom theme extension (not CSS-in-JS)
- Typography: Merriweather (serif) for headers, Inter (sans-serif) for body
- Components follow radix-ui patterns for accessibility
- Create `/components/ui/index.ts` barrel export for clean imports
- Document component usage in JSDoc comments
- Color contrast meets WCAG AA standards (4.5:1 for text, 3:1 for UI)
- Mobile tap targets minimum 44x44px

---

## Epic 2: Core Puzzle Experience

**Goal:** Deliver the fundamental daily Sudoku playing experience with clean UI, pure challenge validation, and fair timing.

**Value:** This is the core product value - users can play a daily Sudoku puzzle. Without this, there's no product. Establishes the "pure competitive integrity" differentiator (no hints, server-side validation).

**Business Impact:** Core value proposition goes live. Users can experience the product magic: "I did this with MY brain." Enables user testing and feedback collection.

---

### Story 2.1: Daily Puzzle System & Data Management

As a **system administrator**,
I want **a daily puzzle generation and delivery system**,
So that **all users globally receive the same medium-difficulty puzzle each day at midnight UTC**.

**Acceptance Criteria:**

**Given** the Supabase database is configured
**When** the daily puzzle system is implemented
**Then** a puzzle seed script exists (`/scripts/seed-puzzle.ts`):
- Generates or imports a valid Sudoku puzzle
- Validates puzzle has unique solution
- Sets difficulty to "medium"
- Stores in `puzzles` table with `puzzle_date` as today's date (UTC)
- Can be run manually or via cron job

**And** API route created (`/app/api/puzzle/today/route.ts`):
- GET request returns today's puzzle (based on UTC date)
- Response includes: puzzle ID, puzzle grid (9x9 array), clue cells marked as read-only
- Response does NOT include solution (server-side secret)
- Caches response with 1-hour TTL (puzzle doesn't change during day)
- Returns 404 if no puzzle exists for today

**And** server action or API route for validation (`/app/api/puzzle/validate/route.ts`):
- POST request accepts: puzzle ID + user's complete solution
- Validates solution against stored correct solution (server-side only)
- Returns: `{correct: true/false}`
- Does NOT reveal correct answer if wrong
- Rate limited to prevent brute force (max 100 attempts per hour per IP)

**And** Vercel cron job configured (optional for MVP - can seed manually):
- Runs daily at 00:00 UTC
- Seeds next day's puzzle automatically
- Fallback: manual script if cron fails

**And** at least 7 puzzles pre-seeded in database for testing

**Prerequisites:** Story 1.2 (Supabase database schema)

**Technical Notes:**
- Use `sudoku` npm package for puzzle generation (or curated puzzle dataset)
- Store puzzle as JSON array: `[[5,3,0,...], [6,0,0,...], ...]` (0 = empty cell)
- Store solution separately (never exposed to client)
- Puzzle date stored as `DATE` type in UTC
- Create utility function `getTodaysPuzzle()` for reuse
- Consider puzzle difficulty algorithm (target 70-80% completion rate)
- Manual seeding sufficient for MVP; automate post-launch

---

### Story 2.2: Sudoku Grid UI Component (Mobile-Optimized)

As a **player**,
I want **a clean, touch-optimized 9x9 Sudoku grid**,
So that I can **easily select cells and see the puzzle clearly on mobile devices**.

**Acceptance Criteria:**

**Given** today's puzzle is loaded
**When** the grid component renders
**Then** a 9x9 Sudoku grid displays:
- All pre-filled clue numbers shown in distinct style (gray, read-only)
- Empty cells ready for user input
- Grid lines clearly delineate 3x3 subgrids (newspaper aesthetic - thicker borders)
- Cell sizing: minimum 40px × 40px for touch targets (mobile priority)
- Responsive: grid scales to fit viewport on mobile (320px-767px)

**And** cell selection works:
- Tap/click a cell to select it
- Selected cell highlighted with distinct border/background
- Only one cell selected at a time
- Pre-filled clue cells cannot be selected (read-only)
- Visual feedback on tap (immediate response, no lag)

**And** user-entered numbers are visually distinct:
- Different color from clues (black vs gray)
- User can easily distinguish their entries from clues

**And** grid state management:
- Component receives puzzle data as prop
- Component maintains local state for user-entered numbers
- Component emits changes to parent (for auto-save in next story)

**And** accessibility features:
- Keyboard navigation: arrow keys move selection
- Screen reader announces cell position ("Row 3, Column 5")
- Focus indicators visible for keyboard users

**And** component is reusable and tested:
- TypeScript interface for props
- Unit tests for rendering and selection
- No visual errors on mobile (320px width tested)

**Prerequisites:** Story 1.5 (design system foundations), Story 2.1 (puzzle data available)

**Technical Notes:**
- Create `<SudokuGrid>` component in `/components/puzzle/`
- Use CSS Grid for layout (not table)
- Props: `puzzle` (9x9 array), `userEntries` (9x9 array), `selectedCell`, `onCellSelect`, `onNumberChange`
- Mobile-first: Design for touch first, enhance for desktop
- Consider using `touch-action: manipulation` for responsive tap
- Grid styling: newspaper aesthetic (black borders, white background, clean)
- Component should be stateless (controlled component pattern)

---

### Story 2.3: Number Input System (Touch & Keyboard)

As a **player**,
I want **fast, intuitive number input for both mobile and desktop**,
So that I can **efficiently fill the Sudoku grid without friction**.

**Acceptance Criteria:**

**Given** a cell is selected in the Sudoku grid
**When** I interact with the number input system
**Then** on mobile devices:
- Number pad appears below grid (buttons 1-9 + Clear)
- Buttons are large tap targets (minimum 44px × 44px)
- Tapping a number fills the selected cell immediately
- "Clear" button empties the selected cell
- Number pad is sticky/fixed position (stays visible during scroll)

**And** on desktop devices:
- Number keys (1-9) on keyboard input numbers directly
- Backspace/Delete or "0" key clears selected cell
- Number palette also available (optional UI for mouse users)
- Keyboard shortcuts work without selecting input field

**And** input validation:
- Only numbers 1-9 accepted (no other characters)
- Pre-filled clue cells cannot be modified (read-only state)
- Invalid input ignored gracefully (no error messages, just no action)

**And** visual feedback:
- Immediate visual response on input (number appears in cell)
- Selected cell remains highlighted after input
- User can immediately select another cell and continue

**And** undo functionality (nice-to-have for MVP, defer if complex):
- Ctrl+Z / Cmd+Z to undo last entry (optional)

**And** component tested on both platforms:
- Works on iOS Safari (mobile)
- Works on Android Chrome (mobile)
- Works on desktop browsers (Chrome, Safari, Firefox)

**Prerequisites:** Story 2.2 (Sudoku grid component), Story 1.5 (design system buttons)

**Technical Notes:**
- Create `<NumberPad>` component for mobile (1-9 + Clear buttons)
- Use `onKeyDown` event listener for desktop keyboard input
- Number pad should be a fixed/sticky positioned element on mobile
- Desktop: attach keyboard listener to document (global), not input field
- Prevent default behavior for number keys to avoid page scroll
- Consider using React context or state management for input mode
- Touch optimizations: `touch-action`, no 300ms tap delay
- Newspaper aesthetic for number buttons (clean, high contrast)

---

### Story 2.4: Puzzle State Auto-Save & Session Management

As a **player**,
I want **my puzzle progress automatically saved**,
So that **I can leave and return without losing my work**.

**Acceptance Criteria:**

**Given** I am playing today's puzzle (guest or authenticated)
**When** I enter a number in the grid
**Then** my progress is automatically saved:
- For **guest users**: saved to browser localStorage
- For **authenticated users**: saved to Supabase `completions` table (in-progress state)
- Save happens within 500ms of input (debounced)
- No visible "saving..." indicator needed (seamless background save)

**And** on page refresh or return visit:
- Grid state restored from localStorage (guest) or database (auth)
- Timer state restored (elapsed time continues from where left off)
- User can resume exactly where they left off
- Restoration happens before grid renders (no flash of empty grid)

**And** state includes:
- User-entered numbers (9x9 grid)
- Elapsed time (in seconds)
- Completion status (in-progress, completed)
- Puzzle ID (to ensure correct puzzle restored)

**And** localStorage schema (guest users):
```typescript
{
  puzzleId: string,
  userEntries: number[][], // 9x9 array
  elapsedSeconds: number,
  lastSaved: timestamp,
  completed: boolean
}
```

**And** database schema for auth users:
- `completions` table updated with `is_complete: false` for in-progress
- `completion_data` JSON field stores user grid state
- On completion, `is_complete: true` and `completion_time_seconds` recorded

**And** edge cases handled:
- If user starts new puzzle (next day), old state cleared
- If localStorage corrupted, gracefully fail and start fresh
- Authenticated users can resume on different devices (state in DB)

**Prerequisites:** Story 2.2 (grid state management), Story 2.3 (number input triggers save), Story 1.2 (database configured)

**Technical Notes:**
- Use `debounce` (lodash or custom) to avoid excessive saves
- localStorage key: `sudoku-daily-progress-{puzzleId}`
- For auth users, use Supabase upsert (update if exists, insert if new)
- Consider using React Query or SWR for cache invalidation
- Test localStorage quota limits (5MB typically sufficient)
- Handle localStorage disabled (privacy mode) gracefully
- Save timer elapsed time separately from grid state

---

### Story 2.5: Timer Implementation (Auto-Start, Fair Timing)

As a **player**,
I want **accurate timing that starts automatically and tracks fairly**,
So that **my leaderboard time reflects my actual solving speed**.

**Acceptance Criteria:**

**Given** I navigate to today's puzzle
**When** the puzzle page loads
**Then** the timer:
- Starts automatically (no manual start button)
- Displays in MM:SS format (e.g., 12:34)
- Updates every second
- Shows in a prominent but non-obtrusive location (top of grid or header)

**And** timer behavior:
- Starts from 0:00 for new puzzle
- Resumes from saved elapsed time if returning to in-progress puzzle
- Continues running through submit attempts (even if answer wrong)
- Stops when puzzle is correctly completed

**And** fair timing rules:
- Timer pauses when browser tab loses focus (prevents gaming the system)
- Timer resumes when tab regains focus
- Pause/resume events logged (for anti-cheat analysis later)
- Client timer is for display only (server validates actual time)

**And** server-side time tracking:
- API route tracks puzzle start time (when user first loads puzzle)
- API route tracks completion time (when user submits correct solution)
- Server calculates actual elapsed time (completion - start)
- Server time is source of truth for leaderboard (client time ignored)

**And** timer state saved:
- Elapsed time saved with puzzle state (Story 2.4)
- On page refresh, timer resumes from saved time
- Timer state persists in localStorage (guest) or database (auth)

**And** timer display styling:
- Newspaper aesthetic (serif font, clean, high contrast)
- Fixed position (doesn't scroll away)
- Readable on mobile (minimum 16px font size)

**Prerequisites:** Story 2.1 (puzzle API), Story 2.4 (state management)

**Technical Notes:**
- Use `setInterval` for client-side timer (1 second intervals)
- Track start time with `Date.now()` for accuracy
- Use `document.addEventListener('visibilitychange')` for tab focus detection
- Server tracks `started_at` and `completed_at` timestamps in database
- Create timer utility hook (`useTimer`) for reusability
- Consider using Web Workers for timer (optional - prevents main thread blocking)
- Format time with utility function: `formatTime(seconds)` → "MM:SS"

---

### Story 2.6: Solution Validation & Completion Flow

As a **player**,
I want **to submit my solution and receive immediate feedback**,
So that **I know when I've solved the puzzle correctly and can see my completion time**.

**Acceptance Criteria:**

**Given** I have filled the Sudoku grid (all cells have numbers)
**When** I click the "Submit" button
**Then** the solution is validated:
- Client sends complete grid to server API (`POST /api/puzzle/validate`)
- Server compares against stored correct solution
- Server returns `{correct: true/false}` response
- Validation happens server-side only (prevent client manipulation)

**And** if solution is **incorrect**:
- Encouraging message displays: "Not quite right. Keep trying!"
- Timer continues running (no penalty)
- User can modify grid and re-submit (unlimited attempts)
- No indication of which cells are wrong (pure challenge approach)

**And** if solution is **correct**:
- Timer stops
- Completion animation plays (simple, not over-the-top)
- Completion time prominently displayed
- Completion data saved to database:
  - For auth users: `completions` table with `completion_time_seconds`, `completed_at`
  - For guest users: localStorage only (prompt to sign in to save rank)
- Success message: "Solved in {time}! 🎉"

**And** completion flow continues:
- User redirected to completion screen (or modal)
- Shows: completion time, leaderboard rank (if auth), sharing options
- Gentle auth prompt for guests: "Sign in to claim your rank and start your streak!"

**And** server validation includes:
- Check all cells filled (no empty cells)
- Validate rows (1-9 appear once in each row)
- Validate columns (1-9 appear once in each column)
- Validate 3x3 subgrids (1-9 appear once in each subgrid)
- Compare against stored solution for correctness

**And** anti-cheat measures:
- Completion time validated server-side (must be > 60 seconds minimum)
- Suspiciously fast times (<2 minutes) flagged for review
- Rate limiting on submit endpoint (max 100 attempts per hour)

**Prerequisites:** Story 2.1 (validation API), Story 2.5 (timer stops on completion), Story 1.2 (database to store completion)

**Technical Notes:**
- Create `<SubmitButton>` component (disabled until all cells filled)
- Validation logic in `/app/api/puzzle/validate/route.ts`
- Use Supabase RPC function for atomic completion insert + leaderboard update
- Completion animation: simple confetti or checkmark (keep it newspaper aesthetic)
- Store completion with puzzle_id to track which day's puzzle solved
- Guest completion saves to localStorage but not database (convert on auth)

---

### Story 2.7: Puzzle Page Integration & UX Polish

As a **player**,
I want **a polished, cohesive puzzle playing experience**,
So that **I can focus on solving without distraction or confusion**.

**Acceptance Criteria:**

**Given** all puzzle components are built (grid, input, timer, validation)
**When** I visit the home page `/`
**Then** I see a complete puzzle page:
- "Today's Puzzle" header with date (e.g., "November 8, 2025")
- Puzzle number displayed (e.g., "Puzzle #42")
- Timer in prominent location
- Sudoku grid centered and responsive
- Number input system (mobile pad or keyboard instructions)
- "Submit" button (disabled until grid complete)
- Clean newspaper aesthetic throughout

**And** the page layout is:
- Mobile-first responsive (320px-767px primary)
- Grid scales appropriately on all screen sizes
- No horizontal scroll on mobile
- Generous white space (not cramped)
- Fast load time (<2 seconds on 3G)

**And** loading states:
- Skeleton loader while puzzle fetches
- Graceful error if puzzle fails to load ("Today's puzzle is being prepared. Check back in a moment!")
- Retry button if network error

**And** instructions/help (first-time user experience):
- Brief instructions visible on first visit: "Fill the grid so each row, column, and 3x3 box contains 1-9"
- Dismissible tip (don't show again after first visit)
- No hints or helpers (pure challenge approach)

**And** accessibility:
- Semantic HTML (proper heading hierarchy)
- ARIA labels for screen readers
- Keyboard navigation works smoothly
- Focus management (Submit button gets focus when grid complete)
- Color contrast meets WCAG AA (black on white, high contrast)

**And** performance optimizations:
- Puzzle data fetched server-side (Next.js SSR or server component)
- Grid renders without layout shift
- Number input responds within 100ms of tap
- Smooth 60fps interactions

**And** newspaper aesthetic polish:
- Serif typography for headers ("Today's Puzzle")
- Sans-serif for grid numbers (readability)
- Black & white base with spot color accent
- Clean grid lines (thicker for 3x3 subgrids)
- Subtle shadows for depth (optional, keep minimal)

**Prerequisites:** All Epic 2 stories (2.1-2.6)

**Technical Notes:**
- Create main puzzle page at `/app/page.tsx`
- Use Next.js Server Components for initial data fetch
- Compose all components: `<PuzzleHeader>`, `<SudokuGrid>`, `<NumberPad>`, `<SubmitButton>`
- Loading skeleton with same dimensions as grid (prevent layout shift)
- Store "first visit" flag in localStorage to hide instructions on return
- Optimize images and fonts (preload critical fonts)
- Test on slow 3G connection (Chrome DevTools throttling)
- Consider using Intersection Observer for lazy loading (if adding content below fold)

---

## Epic 3: User Identity & Authentication

**Goal:** Enable guest-to-authenticated user journey with seamless session preservation, unlocking persistent features (leaderboards, streaks, stats).

**Value:** Guest play enables viral growth (zero friction to try). Authentication enables retention (leaderboards, streaks). Session preservation ensures no lost progress. This is the gateway to competitive and retention features.

**Business Impact:** Guest-to-auth conversion is critical KPI (target >10%). Authenticated users have 2.5x higher retention. Enables tracking of key metrics (D7, D30 retention).

---

### Story 3.1: Guest Play with Session-Based Progress

As a **first-time visitor**,
I want **to play immediately without signing up**,
So that **I can try the game with zero friction**.

**Acceptance Criteria:**

**Given** I visit the site for the first time (not authenticated)
**When** I play the puzzle
**Then** I can:
- View and interact with today's puzzle (full functionality)
- Enter numbers in the grid
- Submit solutions and get validation
- See my completion time upon solving

**And** my progress is saved in browser session:
- Puzzle state saved to localStorage (Story 2.4 already implemented)
- Timer state saved
- Completion status saved
- No account created, no personal data collected

**And** after completing the puzzle as a guest:
- I see my completion time
- I see a "phantom rank" message: "You'd be #347! Sign in to claim your rank"
- I can view the global leaderboard (but I'm not on it)
- Gentle prompt to sign in: "Save your progress and start your streak!"

**And** limitations clearly communicated:
- Cannot appear on leaderboard without auth
- Cannot track streaks without auth
- Cannot save stats across devices without auth
- Prompt is encouraging, not blocking (never forced to sign up)

**And** guest user experience is:
- Identical to auth experience during gameplay
- No features blocked or nag screens
- Completion is celebrated equally (no "missing out" messaging during solve)
- Auth prompt appears ONLY after completion (not during gameplay)

**Prerequisites:** Story 2.1-2.7 (complete puzzle experience)

**Technical Notes:**
- Check auth state with Supabase: `const { data: { session } } = await supabase.auth.getSession()`
- If no session, allow full puzzle play with localStorage
- Create `<GuestCompletionModal>` component for post-solve prompt
- Show "You'd be #X" by comparing guest time to current leaderboard
- localStorage persists until cleared (even across browser closes)
- Guest completions NOT stored in database (only auth completions persist)
- Design prompt to be non-intrusive (easy to dismiss)

---

### Story 3.2: OAuth Authentication (Google, GitHub, Apple)

As a **guest user**,
I want **one-click authentication via OAuth providers**,
So that **I can save my progress and access persistent features without creating a password**.

**Acceptance Criteria:**

**Given** I am a guest user who wants to authenticate
**When** I click "Sign in" button
**Then** I see authentication options:
- "Continue with Google" button
- "Continue with GitHub" button
- "Continue with Apple" button
- No email/password option (OAuth only for MVP)
- Clean, trustworthy UI (newspaper aesthetic)

**And** OAuth flow works:
- Clicking provider button redirects to provider's auth page
- User grants permission
- User redirected back to site at `/auth/callback` route
- Session established automatically
- User sees logged-in state (profile icon, username)

**And** first-time OAuth users:
- Account created in `users` table
- Username extracted from OAuth provider (email prefix or full name)
- User ID stored (from Supabase Auth)
- OAuth provider recorded (google/github/apple)
- Created timestamp recorded

**And** returning OAuth users:
- Existing account matched by OAuth provider ID
- Session re-established
- User data retrieved from database

**And** error handling:
- If OAuth fails, show error: "Authentication failed. Please try again."
- If callback error, redirect to home with error message
- Network errors handled gracefully

**And** auth state persisted:
- Session cookie set by Supabase Auth
- Session persists across browser sessions
- Logout functionality available (clear session)

**Prerequisites:** Story 1.2 (Supabase Auth configured), Story 3.1 (guest experience)

**Technical Notes:**
- Use Supabase Auth methods: `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Configure OAuth apps in Google Cloud Console, GitHub OAuth Apps, Apple Developer
- Redirect URLs: `http://localhost:3000/auth/callback` (dev), `https://sudoku-daily.vercel.app/auth/callback` (prod)
- Create `/app/auth/callback/route.ts` to handle OAuth callback
- Extract session after callback and redirect to home
- Username derivation: `email.split('@')[0]` or OAuth profile name
- Consider allowing username customization post-signup (defer to growth features)
- Implement sign-out: `supabase.auth.signOut()`

---

### Story 3.3: Session Preservation & Retroactive Save

As a **guest user who completes a puzzle then authenticates**,
I want **my completion time and progress automatically saved to my new account**,
So that **I don't lose my achievement when I sign up**.

**Acceptance Criteria:**

**Given** I completed today's puzzle as a guest (time saved in localStorage)
**When** I authenticate via OAuth
**Then** my guest session data is retroactively saved:
- Completion time from localStorage transferred to database
- Entry created in `completions` table with my new user ID
- Completion time preserved exactly (no loss of achievement)
- Leaderboard entry created with my rank

**And** if I had in-progress puzzle state:
- Partial grid state transferred to database
- Timer elapsed time preserved
- User can resume on any device (now saved server-side)

**And** localStorage cleaned up after migration:
- Guest data migrated to DB
- localStorage state cleared or marked as migrated
- Future saves go to database (auth user flow)

**And** seamless transition:
- User immediately sees their rank on leaderboard after auth
- Completion celebrated: "Your rank: #347 🎉"
- No data loss, no manual re-entry needed

**And** edge cases handled:
- If guest completed but leaderboard already full, still save completion
- If user authenticates before completing puzzle, in-progress state migrated
- If localStorage missing/corrupted, gracefully skip migration

**Prerequisites:** Story 3.1 (guest completions in localStorage), Story 3.2 (OAuth auth), Story 2.4 (state management)

**Technical Notes:**
- Trigger migration on successful auth callback
- Read localStorage in `/auth/callback/route.ts` after session established
- Insert completion with user_id from new auth session
- Use server action or API route to handle migration (avoid client-side DB writes)
- Migration should be atomic (all or nothing)
- Consider race conditions (user auths mid-solve)
- Log migration events for debugging
- Clear localStorage after successful DB insert: `localStorage.removeItem('sudoku-daily-progress-*')`

---

### Story 3.4: User Profile & Account Management

As an **authenticated user**,
I want **a profile page showing my account info and a way to log out**,
So that **I can manage my account and understand what data is saved**.

**Acceptance Criteria:**

**Given** I am an authenticated user
**When** I navigate to `/profile` page
**Then** I see my profile information:
- Username (from OAuth provider)
- Email address (from OAuth provider)
- Account created date
- OAuth provider used (Google/GitHub/Apple icon)
- Total puzzles solved (count from `completions` table)

**And** profile page includes:
- "Logout" button (signs out and redirects to home)
- "Delete Account" button (confirmation required)
- Link to Privacy Policy and Terms (placeholders for MVP)

**And** logout functionality:
- Clicking "Logout" signs out of Supabase session
- Redirects to home page (guest state)
- Session cookie cleared
- User can play as guest after logout

**And** account deletion functionality:
- "Delete Account" button shows confirmation modal
- Confirmation text: "This will permanently delete all your data. Are you sure?"
- On confirm: deletes user record and all associated data (GDPR compliance)
  - `users` table entry
  - `completions` entries
  - `leaderboards` entries
  - `streaks` entry
- After deletion: session cleared, redirected to home
- Deletion is permanent and immediate

**And** profile page design:
- Newspaper aesthetic (consistent with rest of site)
- Responsive mobile layout
- Clear information hierarchy
- Accessible (keyboard navigation, screen reader support)

**And** profile page is protected:
- Redirect to home if not authenticated
- Show sign-in prompt if accessed while logged out

**Prerequisites:** Story 3.2 (auth working), Story 1.3 (route structure)

**Technical Notes:**
- Create `/app/profile/page.tsx` route
- Check auth with `const { data: { session } } = await supabase.auth.getSession()`
- Redirect if no session: `redirect('/')`
- Fetch user data from `users` table
- Count completions: `SELECT COUNT(*) FROM completions WHERE user_id = ?`
- Logout: `await supabase.auth.signOut()` then `redirect('/')`
- Delete account: cascade delete with foreign key constraints OR manual deletion
- Deletion requires authentication check (prevent unauthorized deletes)
- Log account deletions for compliance audit trail

---

### Story 3.5: Auth State Management & UI Indicators

As a **user navigating the site**,
I want **clear indication of my authentication status**,
So that **I know what features I have access to and can easily sign in/out**.

**Acceptance Criteria:**

**Given** I visit any page on the site
**When** the page loads
**Then** the header shows my auth state:
- If **guest**: "Sign In" button in header (opens auth modal or redirects to auth page)
- If **authenticated**: User avatar/icon + username (clickable, opens dropdown)

**And** authenticated user dropdown includes:
- "Profile" link (navigates to `/profile`)
- "Logout" link (signs out)
- "Stats" link (when stats feature exists - future)

**And** auth-specific content adapts:
- Leaderboard shows guest users as "Guest" (cannot claim rank)
- Leaderboard shows auth users with username and rank
- Completion modal for guests includes auth prompt
- Completion modal for auth users shows rank immediately

**And** auth state is checked consistently:
- On app load (check for existing session)
- After OAuth callback (session established)
- On logout (session cleared)
- On navigation (Next.js layout checks session)

**And** auth loading states:
- Brief skeleton while auth state loads (avoid flash of wrong state)
- Smooth transition from loading → guest or loading → authenticated
- No flickering or layout shift

**And** session refresh:
- Supabase session auto-refreshes (built-in)
- User stays logged in across browser sessions (refresh token persists)
- Session expires after inactivity (Supabase default: 1 hour inactive)

**Prerequisites:** Story 3.2 (auth working), Story 1.3 (header component)

**Technical Notes:**
- Check auth in root layout (`/app/layout.tsx`) or create auth context
- Use Supabase `onAuthStateChange` listener for real-time auth updates
- Create `<AuthButton>` component (sign in vs user dropdown)
- Store auth state in React Context or state management (Zustand, Jotai)
- Avatar: use first letter of username or OAuth provider avatar URL
- Dropdown: use headless UI library (Radix UI) for accessibility
- Loading skeleton matches header height (prevent layout shift)
- Test session persistence across page refreshes

---

## Epic 4: Competitive Leaderboards

**Goal:** Deliver authentic competitive rankings with real-time updates and anti-cheat measures, establishing the "pure competitive integrity" core differentiator.

**Value:** Leaderboards are where the "no hints" policy pays off - rankings are authentic and meaningful. This is the product magic: "I did this with MY brain" shows on the leaderboard. Drives competition, social proof, and daily return motivation.

**Business Impact:** Competitive leaderboards are the #1 driver of daily return (per research). Authentic competition differentiates from Good Sudoku (has hints). Leaderboard sharing drives viral growth.

---

### Story 4.1: Global Daily Leaderboard (Top 100 + Personal Rank)

As a **competitive player**,
I want **to see the global rankings for today's puzzle**,
So that **I can compare my performance and feel motivated to improve**.

**Acceptance Criteria:**

**Given** today's puzzle has completions
**When** I view the leaderboard page (`/leaderboard`)
**Then** I see the top 100 players for today's puzzle:
- Rank (#1, #2, #3, ...)
- Username (authenticated users) or "Guest" (for guest completions, if we allow them on board)
- Completion time in MM:SS format (e.g., 12:34)
- Sorted by completion time (fastest first)

**And** if I am authenticated and completed today's puzzle:
- My personal rank is highlighted (even if outside top 100)
- My row has distinct styling (background color, bold text)
- If I'm not in top 100, my rank shown separately: "Your rank: #347"

**And** leaderboard data:
- Fetched from `leaderboards` table
- Filtered by today's puzzle ID
- Ordered by `completion_time_seconds ASC`
- Includes tie-breaking: if times equal, earlier submission timestamp ranks higher

**And** leaderboard updates:
- Real-time updates as new completions come in (Story 4.2 - Supabase real-time)
- New entries animate in smoothly (no jarring re-renders)
- User's rank updates in real-time

**And** empty state:
- If no completions yet: "Be the first to complete today's puzzle!"
- If user hasn't completed: "Complete today's puzzle to see your rank"

**And** mobile responsive:
- Leaderboard table scrollable on mobile
- Compact layout (rank, username, time only)
- Personal rank sticky at top or bottom (always visible)

**And** design:
- Newspaper aesthetic (clean table, serif headers)
- Zebra striping for readability (alternating row colors)
- High contrast (black on white)
- Clear visual hierarchy (rank, name, time)

**Prerequisites:** Story 2.6 (completions saved to DB), Story 3.2 (auth users have usernames), Story 1.2 (leaderboards table)

**Technical Notes:**
- Create `/app/leaderboard/page.tsx` route
- Query leaderboards: `SELECT * FROM leaderboards WHERE puzzle_id = ? ORDER BY completion_time_seconds ASC LIMIT 100`
- Join with users table to get username
- Highlight user: check if `user_id` matches session user
- For personal rank outside top 100, run count query: `SELECT COUNT(*) FROM leaderboards WHERE puzzle_id = ? AND completion_time_seconds < ?`
- Use server component for initial data fetch (SSR)
- Format time: `Math.floor(seconds / 60)}:${seconds % 60}.padStart(2, '0')}`
- Table component: semantic HTML `<table>`, accessible

---

### Story 4.2: Real-Time Leaderboard Updates (Supabase Realtime)

As a **competitive player**,
I want **the leaderboard to update in real-time as others complete the puzzle**,
So that **I can see my rank change live and feel the competitive energy**.

**Acceptance Criteria:**

**Given** I am viewing the leaderboard
**When** another user completes today's puzzle
**Then** the leaderboard updates automatically:
- New completion appears in the list (if in top 100)
- Ranks re-calculate (users may shift down if faster time comes in)
- My personal rank updates if affected
- Update happens within 1-2 seconds of completion (low latency)

**And** real-time updates use Supabase Realtime:
- Subscribe to `leaderboards` table changes
- Filter by today's puzzle ID
- Listen for `INSERT` events (new completions)
- Update client-side leaderboard state when event received

**And** animations for new entries:
- New row fades in or slides in smoothly
- Affected rows shift down with smooth transition
- No jarring "pop" or layout shift
- 60fps smooth animations

**And** optimistic UI updates:
- When user completes puzzle, their rank appears immediately (don't wait for real-time event)
- Use local state update + real-time confirmation
- If real-time fails, graceful fallback to polling (every 5 seconds)

**And** connection handling:
- If real-time connection drops, show status indicator
- Fallback to polling if Supabase Realtime unavailable
- Reconnect automatically when connection restored

**And** performance:
- Only subscribe to today's puzzle (not all leaderboards)
- Unsubscribe when leaving leaderboard page (clean up)
- Debounce rapid updates (if many completions at once)

**Prerequisites:** Story 4.1 (leaderboard UI), Story 1.2 (Supabase configured)

**Technical Notes:**
- Use Supabase Realtime: `supabase.channel('leaderboard').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leaderboards', filter: 'puzzle_id=eq.{puzzleId}' }, handleNewCompletion)`
- Update React state when event received
- Use React Spring or Framer Motion for animations (optional - CSS transitions sufficient)
- Cleanup subscription: `channel.unsubscribe()` on component unmount
- Fallback polling: `setInterval` every 5 seconds if real-time fails
- Test with multiple users completing simultaneously (stress test)

---

### Story 4.3: Server-Side Time Validation & Anti-Cheat

As a **fair player**,
I want **the leaderboard to be authentic with no cheaters**,
So that **rankings reflect real skill and I can trust the competition**.

**Acceptance Criteria:**

**Given** a user submits a completed puzzle
**When** the server processes the completion
**Then** server-side time validation occurs:
- Server calculates actual elapsed time (completion timestamp - start timestamp)
- Server ignores client-submitted time (only for display)
- Server time is source of truth for leaderboard ranking
- Minimum time threshold enforced: must be ≥60 seconds (impossible to solve in <1 minute)

**And** suspiciously fast times are flagged:
- Times <2 minutes (120 seconds) flagged as "needs review"
- Flag stored in `completions` table: `flagged_for_review: boolean`
- Flagged completions still appear on leaderboard (innocent until proven guilty)
- Admin review system planned (defer to post-MVP)

**And** anti-cheat measures:
- Solution validation is server-side only (client cannot manipulate)
- Timer pause events logged (tab visibility changes tracked)
- Excessive pause time may trigger flag (e.g., >10 pauses in one solve)
- Rate limiting prevents brute-force: max 100 submit attempts per hour per IP

**And** server tracks:
- `started_at` timestamp (when puzzle first loaded)
- `completed_at` timestamp (when correct solution submitted)
- `completion_time_seconds` calculated as difference
- `pause_events` JSON array (optional - log pause/resume for analysis)

**And** leaderboard insertion:
- Only verified completions appear on leaderboard
- Leaderboard entry includes: `user_id`, `puzzle_id`, `rank`, `completion_time_seconds`, `submitted_at`
- Rank calculated server-side based on all completions for puzzle
- Ties broken by `submitted_at` (earlier timestamp ranks higher)

**And** guest user handling (if allowing guests on leaderboard):
- Guests cannot appear on leaderboard in MVP (auth required)
- Future: allow guest entries with "Guest #1234" names (defer)

**Prerequisites:** Story 2.5 (timer implementation), Story 2.6 (completion flow), Story 4.1 (leaderboard)

**Technical Notes:**
- Track start time in database: when user first fetches puzzle, insert `completions` record with `started_at`, `is_complete: false`
- On correct submit, update record: `is_complete: true`, `completed_at: NOW()`, calculate `completion_time_seconds`
- Use Supabase RPC or database trigger to calculate rank
- Flagging logic in API route: `if (completionTimeSeconds < 120) { flagged_for_review = true }`
- Admin review interface deferred to post-MVP (for now, just flag)
- Rate limiting: use Vercel rate limiting or custom middleware
- Consider logging IP addresses for anti-cheat analysis (GDPR compliant - anonymize after 30 days)

---

### Story 4.4: Leaderboard UI Polish & Accessibility

As a **player viewing the leaderboard**,
I want **a clean, readable leaderboard that works on all devices**,
So that **I can easily see rankings and compare my performance**.

**Acceptance Criteria:**

**Given** I navigate to the leaderboard page
**When** the leaderboard renders
**Then** the UI includes:
- Page title: "Today's Leaderboard - November 8, 2025" (with puzzle date)
- Puzzle number: "Puzzle #42"
- Total completions count: "154 players have solved today's puzzle"
- Leaderboard table with top 100 (or all if <100)

**And** table design:
- Clean table layout with columns: Rank, Username, Time
- Rank column: #1, #2, #3, ... (numbers with # symbol)
- Username column: left-aligned, readable font (sans-serif)
- Time column: right-aligned, monospace font (e.g., "12:34")
- Zebra striping (alternating row background colors for readability)
- Header row styled distinctly (serif font, bold)

**And** user's personal rank (if authenticated and completed):
- Personal row highlighted (different background color, e.g., light blue)
- Bold text for username and time
- Scroll into view on page load (if in top 100)
- If outside top 100, sticky footer shows: "Your rank: #347 - Time: 18:45"

**And** responsive design:
- Mobile (320px-767px): Compact table, scrollable horizontally if needed
- Tablet/Desktop: Full table width, comfortable spacing
- Personal rank sticky on mobile (always visible)

**And** loading and empty states:
- Skeleton loader while data fetches (prevent layout shift)
- Empty state if no completions: "Be the first to complete today's puzzle!"
- Error state if fetch fails: "Leaderboard temporarily unavailable. Try refreshing."

**And** accessibility:
- Semantic HTML table with `<thead>`, `<tbody>`, `<th>`, `<td>`
- Screen reader announces: "Leaderboard table with {count} entries"
- Keyboard navigation (tab through rows)
- High contrast (WCAG AA compliant)
- Focus indicators for keyboard users

**And** newspaper aesthetic:
- Serif typography for headers
- Sans-serif for table content (readability)
- Black & white base with spot color for personal rank highlight
- Clean borders and spacing
- No clutter, no ads (clean focus on rankings)

**Prerequisites:** Story 4.1 (leaderboard data), Story 4.2 (real-time updates), Story 1.5 (design system)

**Technical Notes:**
- Create `<LeaderboardTable>` component
- Use CSS Grid or HTML table for layout
- Highlight user row with CSS class (`.personal-rank`)
- Scroll to user row: `element.scrollIntoView({ behavior: 'smooth', block: 'center' })`
- Skeleton loader matches table structure (prevents layout shift)
- Responsive: use `overflow-x: auto` for horizontal scroll on small screens
- Test with 0, 10, 100, 1000 entries (stress test rendering)

---

### Story 4.5: Leaderboard Sharing & Social Proof

As a **player who ranks well**,
I want **to share my leaderboard rank**,
So that **I can show off my achievement and invite friends to compete**.

**Acceptance Criteria:**

**Given** I am on the leaderboard (authenticated, completed puzzle)
**When** I view my rank
**Then** I see a "Share Rank" button next to my entry:
- Button displays: "Share 🔗" or share icon
- Clicking opens share options (Twitter/X, WhatsApp, Copy link)

**And** share format includes:
- My rank (#23, #100, etc.)
- My completion time (12:34)
- Today's puzzle number (#42)
- Link to the game
- Encouragement for friends to compete

**Example share text:**
```
I ranked #23 on Sudoku Daily #42! ⏱️ 12:34

Think you can beat me? 👇
[link to sudoku-daily]
```

**And** sharing options:
- Twitter/X: Opens Twitter web intent with pre-filled text
- WhatsApp: Opens WhatsApp share with pre-filled text (mobile only)
- Copy to clipboard: Copies share text

**And** share button placement:
- Next to user's personal rank row (if in top 100)
- In sticky footer (if outside top 100)
- Also available on completion screen (Story 2.6 completion flow)

**And** tracking:
- Log share events (optional analytics)
- Track which channel used (Twitter vs WhatsApp vs clipboard)

**And** design:
- Share button: secondary style (not overly prominent)
- Newspaper aesthetic (clean, minimal icon)
- Mobile-optimized (easy to tap)

**Prerequisites:** Story 4.1 (leaderboard with ranks), Story 4.4 (leaderboard UI)

**Technical Notes:**
- Reuse sharing component from Epic 5 (emoji grid sharing)
- Twitter intent: `https://twitter.com/intent/tweet?text={encodedText}`
- WhatsApp: `https://wa.me/?text={encodedText}`
- Clipboard: `navigator.clipboard.writeText(text)`
- Share text template: dynamic based on rank and time
- Consider Open Graph meta tags for link previews (defer to Story 4.6 or later)

---

## Epic 5: Viral Social Mechanics

**Goal:** Enable organic growth through emoji grid sharing (primary growth engine) modeled after Wordle's proven viral mechanics.

**Value:** Social sharing is the #1 growth driver (expected 60-70% of new users). Emoji grid tells solve journey without spoilers, creates curiosity, and drives clicks. This is how 10 DAU → 1,000 DAU happens.

**Business Impact:** Viral coefficient >1.0 means exponential growth. Sharing rate >30% target. Each share reaches average 100 people (research-backed). This epic unlocks sustainable growth without paid acquisition.

---

### Story 5.1: Solve Path Tracking During Gameplay

As a **system tracking user behavior**,
I want **to record the user's solve path as they fill the grid**,
So that **I can generate an accurate emoji grid showing their solving journey**.

**Acceptance Criteria:**

**Given** a user is playing today's puzzle
**When** they enter a number in a cell
**Then** the system tracks:
- Which cell was filled (row, column)
- What number was entered
- Timestamp of entry
- Whether this was the first entry in this cell or a correction

**And** solve path data structure:
```typescript
{
  cells: [
    { row: 0, col: 2, number: 5, timestamp: 1234567890, isCorrection: false },
    { row: 1, col: 3, number: 7, timestamp: 1234567891, isCorrection: false },
    { row: 0, col: 2, number: 3, timestamp: 1234567892, isCorrection: true }, // Changed cell 0,2
    // ...
  ]
}
```

**And** for each cell in the final grid:
- If cell was filled once and never changed: "first-fill" (green emoji 🟩)
- If cell was changed at least once: "corrected" (yellow emoji 🟨)
- If cell is a pre-filled clue: "clue" (white emoji ⬜)

**And** solve path is saved:
- Stored in `completions` table as JSON field (`solve_path`)
- Saved on successful puzzle completion
- Used to generate emoji grid in Story 5.2

**And** tracking is lightweight:
- Minimal performance impact (simple array push on each entry)
- No network requests during solve (all client-side tracking)
- Batch save on completion (not every keystroke)

**Prerequisites:** Story 2.3 (number input), Story 2.4 (state management)

**Technical Notes:**
- Track solve path in React state: `const [solvePath, setSolvePath] = useState<SolvePathEntry[]>([])`
- On number entry, push to solve path array
- Determine `isCorrection`: check if cell already has entry in solve path
- On completion, include solve path in completion API request
- Store as JSON in database: `solve_path: SolvePathEntry[]`
- Compressed JSON to minimize storage (use JSON.stringify)

---

### Story 5.2: Emoji Grid Generation Algorithm

As a **developer**,
I want **an algorithm that converts solve path into emoji grid**,
So that **users can share their solving journey in a visual, non-spoiler format**.

**Acceptance Criteria:**

**Given** a completed puzzle with solve path data
**When** the emoji grid is generated
**Then** the algorithm:
- Creates a 9×9 grid of emojis
- Maps each cell based on solve path:
  - **🟩 (Green)**: Cell filled once, never changed (correct on first try)
  - **🟨 (Yellow)**: Cell was changed/corrected (modified at least once)
  - **⬜ (White)**: Pre-filled clue from original puzzle (read-only)

**And** the algorithm determines cell status:
- Check if cell (row, col) is a clue in original puzzle → ⬜
- Else, count entries in solve path for that cell:
  - 1 entry → 🟩 (first-fill, never changed)
  - 2+ entries → 🟨 (corrected/changed)

**And** output format:
```
🟩⬜⬜🟨🟨⬜⬜⬜🟩
🟩🟩⬜⬜🟨🟨⬜⬜🟩
🟩🟩🟩⬜⬜🟨🟨⬜🟩
⬜🟩🟩🟩⬜⬜🟨🟨⬜
⬜⬜🟩🟩🟩⬜⬜🟨🟨
⬜⬜⬜🟩🟩🟩⬜⬜🟨
🟨⬜⬜⬜🟩🟩🟩⬜⬜
🟨🟨⬜⬜⬜🟩🟩🟩⬜
🟨🟨🟨⬜⬜⬜🟩🟩🟩
```

**And** the grid is:
- 9 lines of 9 emojis each (no spaces between emojis on same line)
- Preserves visual structure of Sudoku grid
- Readable across all platforms (Twitter, WhatsApp, clipboard)

**And** edge cases handled:
- If solve path missing/corrupted, generate all-green grid (graceful fallback)
- If clues not marked, infer from original puzzle data

**And** algorithm is tested:
- Unit tests for various solve paths
- Test with 0 corrections (all green)
- Test with many corrections (mixed green/yellow)
- Test with clues properly marked as white

**Prerequisites:** Story 5.1 (solve path tracked), Story 2.1 (puzzle data with clues)

**Technical Notes:**
- Create utility function: `generateEmojiGrid(solvePath, originalPuzzle): string`
- Algorithm pseudo-code:
  ```typescript
  for each cell (row, col):
    if originalPuzzle[row][col] !== 0:
      grid[row][col] = '⬜' // Clue
    else:
      entries = solvePath.filter(e => e.row === row && e.col === col)
      grid[row][col] = entries.length === 1 ? '🟩' : '🟨'
  ```
- Join rows with newline: `grid.map(row => row.join('')).join('\n')`
- Test emoji rendering on different platforms (some systems may not support)

---

### Story 5.3: Share Completion Modal with Emoji Grid Preview

As a **player who just completed the puzzle**,
I want **a share modal showing my emoji grid and completion time**,
So that **I can preview before sharing and feel proud of my achievement**.

**Acceptance Criteria:**

**Given** I just completed today's puzzle
**When** the completion modal appears
**Then** I see:
- "Congratulations!" or "Solved!" header
- My completion time prominently displayed: "⏱️ 12:34"
- My leaderboard rank (if authenticated): "You ranked #347!"
- Emoji grid preview (9×9 grid shown exactly as it will be shared)

**And** emoji grid is:
- Displayed in monospace font (preserves grid structure)
- Readable size on mobile (not too small)
- Exactly matches what will be shared (WYSIWYG preview)

**And** modal includes share text preview:
```
Sudoku Daily #42
⏱️ 12:34

🟩⬜⬜🟨🟨⬜⬜⬜🟩
🟩🟩⬜⬜🟨🟨⬜⬜🟩
🟩🟩🟩⬜⬜🟨🟨⬜🟩
...

Play today's puzzle: [link]
```

**And** share buttons below preview:
- "Share to Twitter/X" button
- "Share to WhatsApp" button (mobile only)
- "Copy to Clipboard" button
- Each button clearly labeled with icon

**And** modal behavior:
- Opens automatically on successful completion
- Can be dismissed (X button in corner)
- Can be re-opened from profile/stats page (future)
- Newspaper aesthetic styling

**And** for authenticated users:
- Modal includes rank celebration
- No auth prompt (already authenticated)

**And** for guest users:
- Modal includes gentle prompt: "Sign in to save your rank!"
- Auth buttons below share buttons

**Prerequisites:** Story 5.2 (emoji grid generation), Story 2.6 (completion flow), Story 3.1 (guest vs auth UX)

**Technical Notes:**
- Create `<ShareModal>` component
- Trigger modal on completion: use React state or modal library (Radix UI Dialog)
- Generate emoji grid on completion, pass to modal as prop
- Preview uses `<pre>` tag with monospace font for grid alignment
- Share text template: dynamic based on puzzle number, time, grid, link
- Close modal on dismiss, store dismissed state (don't re-show on refresh)
- Mobile responsive: modal fills screen on small devices

---

### Story 5.4: One-Tap Sharing to Twitter, WhatsApp, Clipboard

As a **player wanting to share my result**,
I want **one-tap sharing to my preferred platform**,
So that **I can quickly share with friends and drive traffic to the game**.

**Acceptance Criteria:**

**Given** I see the share modal with emoji grid preview
**When** I click a share button
**Then** the appropriate action happens:

**Twitter/X:**
- Opens Twitter web intent in new tab
- Pre-filled tweet text includes:
  - Puzzle number ("Sudoku Daily #42")
  - Completion time ("⏱️ 12:34")
  - Emoji grid (9 lines)
  - Link to game
- User can edit before posting
- URL: `https://twitter.com/intent/tweet?text={encodedShareText}`

**WhatsApp:**
- Opens WhatsApp share dialog (mobile) or WhatsApp Web (desktop)
- Pre-filled message same as Twitter
- URL: `https://wa.me/?text={encodedShareText}`
- Only shown on mobile devices (hide on desktop)

**Copy to Clipboard:**
- Copies full share text to clipboard
- Shows confirmation toast: "Copied to clipboard!"
- Works on all platforms (mobile + desktop)
- Uses `navigator.clipboard.writeText()`

**And** share text format:
```
Sudoku Daily #42
⏱️ 12:34

🟩⬜⬜🟨🟨⬜⬜⬜🟩
🟩🟩⬜⬜🟨🟨⬜⬜🟩
🟩🟩🟩⬜⬜🟨🟨⬜🟩
⬜🟩🟩🟩⬜⬜🟨🟨⬜
⬜⬜🟩🟩🟩⬜⬜🟨🟨
⬜⬜⬜🟩🟩🟩⬜⬜🟨
🟨⬜⬜⬜🟩🟩🟩⬜⬜
🟨🟨⬜⬜⬜🟩🟩🟩⬜
🟨🟨🟨⬜⬜⬜🟩🟩🟩

Play today's puzzle: https://sudoku-daily.vercel.app
```

**And** link includes UTM parameters (optional analytics):
- `?utm_source=share&utm_medium=twitter` (or whatsapp, clipboard)
- Helps track viral traffic sources

**And** share action is tracked:
- Log share event (user_id, puzzle_id, channel, timestamp)
- Optional analytics: increment share counter
- Helps calculate sharing rate KPI (target >30%)

**And** error handling:
- If clipboard API fails (permissions), show fallback: "Press Ctrl+C to copy"
- If Twitter/WhatsApp fails to open, show error message
- Graceful degradation on unsupported browsers

**Prerequisites:** Story 5.3 (share modal), Story 5.2 (emoji grid)

**Technical Notes:**
- Twitter intent: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
- WhatsApp: `https://wa.me/?text=${encodeURIComponent(shareText)}`
- Clipboard: `await navigator.clipboard.writeText(shareText)` (requires HTTPS)
- Toast notification: use design system toast or create simple component
- Detect mobile for WhatsApp: `navigator.userAgent` or CSS media queries
- URL encoding: use `encodeURIComponent()` for special characters
- UTM params: append to game URL `?utm_source={channel}`

---

### Story 5.5: Shareable Link & Social Meta Tags (Open Graph)

As a **player sharing a link**,
I want **the link to display rich preview with image and description**,
So that **my friends see an enticing preview and are more likely to click**.

**Acceptance Criteria:**

**Given** someone shares a link to Sudoku Daily
**When** the link is posted on social media (Twitter, WhatsApp, Facebook)
**Then** a rich preview displays:
- Title: "Sudoku Daily - Pure Daily Sudoku Challenge"
- Description: "One puzzle. One day. No hints. Can you beat today's challenge?"
- Image: Open Graph image (branded graphic with newspaper aesthetic)
- URL: https://sudoku-daily.vercel.app

**And** Open Graph meta tags are set in app HTML:
```html
<meta property="og:title" content="Sudoku Daily - Pure Daily Sudoku Challenge" />
<meta property="og:description" content="One puzzle. One day. No hints. Can you beat today's challenge?" />
<meta property="og:image" content="https://sudoku-daily.vercel.app/og-image.png" />
<meta property="og:url" content="https://sudoku-daily.vercel.app" />
<meta property="og:type" content="website" />
```

**And** Twitter Card meta tags:
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Sudoku Daily" />
<meta name="twitter:description" content="One puzzle. One day. No hints." />
<meta name="twitter:image" content="https://sudoku-daily.vercel.app/og-image.png" />
```

**And** Open Graph image (`og-image.png`):
- Size: 1200×630px (Facebook/Twitter recommended)
- Design: Newspaper aesthetic branding
- Includes: "Sudoku Daily" title, tagline, sample emoji grid
- High contrast, readable in thumbnail

**And** meta tags dynamically update (optional for MVP):
- Daily puzzle page could show puzzle-specific OG image
- Defer dynamic OG images to post-MVP (static image sufficient for launch)

**And** link preview tested:
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- WhatsApp preview tested (shares same OG tags)

**Prerequisites:** Story 1.3 (app layout with meta tags), Story 5.4 (sharing URLs)

**Technical Notes:**
- Add meta tags in `/app/layout.tsx` (Next.js metadata API)
- Use Next.js `metadata` export:
  ```typescript
  export const metadata = {
    title: 'Sudoku Daily',
    description: '...',
    openGraph: { title, description, images: ['/og-image.png'], url: '...' },
    twitter: { card: 'summary_large_image', ... }
  }
  ```
- Create OG image in Figma or design tool, export as PNG
- Store in `/public/og-image.png`
- Test with https://metatags.io for preview
- Ensure HTTPS for image URL (required by some platforms)

---

## Epic 6: Engagement & Retention

**Goal:** Drive daily habit formation and long-term retention through streak tracking and personal statistics, turning casual players into dedicated daily users.

**Value:** Streaks and stats are proven retention drivers (69% of successful puzzle games use them per research). Target D7 retention >40%, D30 retention >25%. These features turn "I tried it" into "I play every day."

**Business Impact:** Retention is the difference between 10 DAU and 1,000 DAU. Streaks create daily return motivation. Stats provide sense of progress and mastery. Together they drive the daily ritual behavior (like morning coffee + Sudoku).

---

### Story 6.1: Streak Tracking System (Consecutive Days)

As an **authenticated user**,
I want **my consecutive day completion streak tracked automatically**,
So that **I feel motivated to maintain my daily habit and see my consistency rewarded**.

**Acceptance Criteria:**

**Given** I am an authenticated user
**When** I complete today's puzzle
**Then** my streak is updated:
- If I completed yesterday's puzzle: streak increments by 1
- If I didn't complete yesterday BUT streak freeze available: streak maintained (freeze consumed)
- If I didn't complete yesterday AND no freeze: streak resets to 1
- Current streak saved to `streaks` table

**And** streak data includes:
- `user_id` (foreign key to users table)
- `current_streak` (number of consecutive days)
- `longest_streak` (all-time best streak)
- `last_completion_date` (date of most recent completion, UTC)
- `freeze_available` (boolean - can skip 1 day per 7-day period)

**And** streak calculation logic:
```typescript
function updateStreak(userId, todayDate):
  lastCompletion = getLastCompletionDate(userId)
  yesterday = todayDate - 1 day

  if lastCompletion === yesterday:
    // Completed yesterday, increment streak
    currentStreak += 1
  else if lastCompletion === (todayDate - 2 days) AND freeze_available:
    // Missed yesterday but freeze available
    currentStreak maintained
    freeze_available = false
  else:
    // Missed more than 1 day or no freeze, reset
    currentStreak = 1

  if currentStreak > longest_streak:
    longest_streak = currentStreak

  last_completion_date = todayDate
```

**And** on first completion ever:
- Streak initialized: `current_streak = 1`, `longest_streak = 1`
- Freeze available by default: `freeze_available = true`

**And** freeze reset logic:
- Freeze resets every 7 days (rolling window, not calendar week)
- Track `last_freeze_reset_date`
- If 7 days passed since last reset, `freeze_available = true` again

**And** streak updates happen:
- On successful puzzle completion (trigger in completion API route)
- Server-side only (prevent manipulation)
- Atomic transaction (update streak + save completion together)

**Prerequisites:** Story 2.6 (completion flow), Story 1.2 (streaks table), Story 3.2 (auth users only)

**Technical Notes:**
- Streak logic in `/app/api/puzzle/complete/route.ts` (or server action)
- Use database transaction to ensure atomicity (completion + streak update)
- Calculate date in UTC to avoid timezone issues: `new Date().toISOString().split('T')[0]`
- Upsert streak record: `INSERT ... ON CONFLICT (user_id) DO UPDATE ...`
- Test edge cases: first completion, freeze usage, reset after gap
- Consider background job to reset expired freezes (optional - can reset on next completion)

---

### Story 6.2: Streak Freeze Mechanic (Healthy Engagement)

As an **engaged user with a long streak**,
I want **forgiveness if I miss one day per week**,
So that **life events don't destroy my streak and I don't feel toxic compulsion to play**.

**Acceptance Criteria:**

**Given** I have a current streak of 7+ days
**When** I miss one day (don't complete yesterday's puzzle)
**Then** my streak is preserved IF freeze is available:
- Streak remains unchanged (not reset)
- Freeze is consumed (`freeze_available = false`)
- I'm notified: "Streak freeze used! Your 15-day streak is safe."

**And** if I miss a second day (before freeze resets):
- Streak resets to 1
- I'm notified: "Your streak has been reset. Start a new one today!"

**And** freeze resets after 7 days:
- Freeze becomes available again 7 days after last reset
- Rolling 7-day window (not calendar week)
- User notified when freeze is available again

**And** freeze indicator shown in UI:
- On profile page: "Streak Freeze: Available ✓" or "Streak Freeze: Used (resets in 3 days)"
- On puzzle page (if user opens after missing a day): "Your streak freeze saved your 15-day streak!"

**And** freeze logic prevents toxic compulsion:
- User can miss 1 day per week without anxiety
- Messaging is positive ("Your streak is safe!") not punishing
- No "daily streak" badge or guilt-inducing notifications

**And** edge cases:
- New users get freeze available from day 1
- Freeze can be used at any streak length (no minimum)
- Freeze cannot be "saved up" (max 1 freeze available at a time)

**Prerequisites:** Story 6.1 (streak tracking)

**Technical Notes:**
- Freeze logic already in Story 6.1 streak calculation
- Add freeze reset check: `if (daysSinceLastFreezeReset >= 7) { freeze_available = true }`
- Track `last_freeze_reset_date` in `streaks` table
- UI indicator: read `freeze_available` from streaks table
- Notification on freeze use: return from API `{ streakPreserved: true, freezeUsed: true }`
- Show notification in completion modal or toast

---

### Story 6.3: Personal Statistics Dashboard

As an **authenticated user**,
I want **to see my personal statistics and progress over time**,
So that **I can track my improvement and feel a sense of mastery**.

**Acceptance Criteria:**

**Given** I am authenticated and have completed at least one puzzle
**When** I view my profile page or stats section
**Then** I see the following statistics:

**Core Stats:**
- **Total Puzzles Solved**: Count of all completions
- **Current Streak**: Consecutive days with completions
- **Longest Streak**: All-time best streak
- **Average Completion Time**: Mean of all completion times (MM:SS format)
- **Best Time**: Personal record (fastest completion, MM:SS format)

**And** stats are calculated:
- Total: `SELECT COUNT(*) FROM completions WHERE user_id = ?`
- Average: `SELECT AVG(completion_time_seconds) FROM completions WHERE user_id = ?`
- Best: `SELECT MIN(completion_time_seconds) FROM completions WHERE user_id = ?`
- Streaks: from `streaks` table

**And** stats display design:
- Card layout with newspaper aesthetic
- Each stat in its own card (grid layout, responsive)
- Large numbers (primary stat) with label below
- Visual hierarchy: current streak most prominent

**Example layout:**
```
┌─────────────────┬─────────────────┐
│ Current Streak  │ Longest Streak  │
│      15 days    │     23 days     │
└─────────────────┴─────────────────┘
┌─────────────────┬─────────────────┐
│  Total Solved   │   Best Time     │
│       42        │     08:34       │
└─────────────────┴─────────────────┘
┌──────────────────────────────────┐
│       Average Time: 12:45         │
└──────────────────────────────────┘
```

**And** empty state (no completions):
- "Complete your first puzzle to see your stats!"

**And** stats update in real-time:
- After completing puzzle, stats refresh automatically
- No need to reload page

**Prerequisites:** Story 6.1 (streaks), Story 2.6 (completions data), Story 3.4 (profile page)

**Technical Notes:**
- Add stats section to `/app/profile/page.tsx`
- Fetch stats from API route or server action
- Create `<StatsCard>` component for reusability
- Format time: `formatTime(seconds)` utility
- Cache stats with React Query or SWR (revalidate on completion)
- Use Supabase query with aggregations for performance
- Responsive grid: 2 columns on desktop, 1 column on mobile

---

### Story 6.4: Completion History Calendar View

As an **authenticated user**,
I want **a visual calendar showing which days I completed puzzles**,
So that **I can see my consistency over time and identify gaps**.

**Acceptance Criteria:**

**Given** I am authenticated and viewing my profile/stats page
**When** the completion history calendar renders
**Then** I see a calendar view:
- Shows last 30 days (or current month)
- Each day is a cell in the calendar
- Completed days: highlighted (green or checkmark ✓)
- Missed days: not highlighted (gray or empty)
- Today: distinct styling (border or different color)

**And** calendar shows:
- Day numbers (1-31)
- Completion indicator (✓ or filled circle for completed days)
- Hover shows completion time for that day (optional tooltip)
- Click on day navigates to that day's puzzle (future feature - defer)

**And** calendar design:
- 7-column grid (Sun-Sat or Mon-Sun based on locale)
- Newspaper aesthetic (clean, minimal)
- Responsive: scales on mobile (smaller cells)

**And** data fetched:
- Query `completions` table for last 30 days: `WHERE user_id = ? AND completed_at >= ? ORDER BY completed_at DESC`
- Map completion dates to calendar cells

**And** visual patterns reveal:
- Streaks visible (consecutive filled days)
- Gaps visible (missed days)
- User can quickly assess consistency

**And** empty state:
- If no completions, show empty calendar with encouragement: "Start your daily puzzle habit!"

**Prerequisites:** Story 2.6 (completions data), Story 6.3 (stats page)

**Technical Notes:**
- Use date library (date-fns or Day.js) for calendar logic
- Create `<CompletionCalendar>` component
- CSS Grid for calendar layout: `display: grid; grid-template-columns: repeat(7, 1fr);`
- Map completions to dates: create Set of completion dates for O(1) lookup
- Hover tooltip: use Radix UI Tooltip or custom CSS
- Consider GitHub contribution graph style (minimal, effective)
- Test with different months (28-31 days)

---

### Story 6.5: Engagement Hooks & Notifications (Post-MVP Prep)

As a **product manager**,
I want **notification infrastructure prepared for post-MVP engagement features**,
So that **we can add daily reminders and streak alerts after launch**.

**Acceptance Criteria:**

**Given** the MVP is nearing completion
**When** engagement infrastructure is set up
**Then** the following foundations exist:

**Push Notification Setup (Config Only - No Active Notifications in MVP):**
- Service worker configured for PWA (Progressive Web App)
- Push notification permissions request flow created (hidden/disabled for MVP)
- Infrastructure ready to send notifications post-MVP

**And** notification use cases planned (not implemented):
- **Daily reminder**: "Today's Sudoku is ready!" (9 AM local time)
- **Streak alert**: "Don't break your 15-day streak!" (evening if not completed)
- **Personal best**: "New record! You solved in 08:34" (on completion)
- All notifications optional (user can opt-in/out)

**And** notification settings page created (placeholder):
- `/settings` route with placeholder content
- "Notifications coming soon" message
- Foundation for post-MVP notification preferences

**And** analytics events for engagement tracking:
- Track: daily active users (DAU)
- Track: D7 retention (% returning after 7 days)
- Track: D30 retention (% returning after 30 days)
- Track: sharing rate (% who share after completing)
- Track: guest-to-auth conversion rate

**And** documentation for post-MVP features:
- `/docs/post-mvp-engagement.md` with planned features:
  - Push notifications
  - Email digests (weekly stats summary)
  - Achievements/badges system
  - Friend challenges
  - Difficulty variants (easy/hard puzzles)

**Prerequisites:** All other Epic 6 stories, Story 5.4 (sharing tracking)

**Technical Notes:**
- Service worker: create `/public/sw.js` with basic caching
- PWA manifest: `/public/manifest.json` with app details
- Push API: use Web Push API (defer actual implementation)
- Analytics: use Vercel Analytics (free tier) or Plausible
- Settings page: `/app/settings/page.tsx` with placeholder
- Track events in completion API route and share handlers
- Document planned features for future reference
- Do NOT build actual notification sending (MVP bloat) - foundation only

---

## Review & Next Steps

**Epic Breakdown Complete! ✅**

### Summary

**6 Epics | 32 Stories Total**

- **Epic 1: Foundation & Infrastructure** (5 stories) - Development environment ready
- **Epic 2: Core Puzzle Experience** (7 stories) - Playable daily Sudoku
- **Epic 3: User Identity & Authentication** (5 stories) - Guest-to-auth journey
- **Epic 4: Competitive Leaderboards** (5 stories) - Authentic rankings
- **Epic 5: Viral Social Mechanics** (5 stories) - Emoji sharing growth engine
- **Epic 6: Engagement & Retention** (5 stories) - Streaks and stats

### Coverage Validation

**All 16 Functional Requirements Covered:**
- FR-1.1, FR-1.2 → Epic 2 (Stories 2.1, 2.4)
- FR-2.1, FR-2.2, FR-2.3 → Epic 2 (Stories 2.2, 2.3, 2.6)
- FR-3.1, FR-3.2 → Epic 2 (Stories 2.5, 2.6)
- FR-4.1, FR-4.2, FR-4.3 → Epic 3 (Stories 3.1, 3.2, 3.3, 3.4, 3.5)
- FR-5.1, FR-5.2 → Epic 4 (Stories 4.1, 4.2, 4.3, 4.4, 4.5)
- FR-6.1, FR-6.2 → Epic 6 (Stories 6.1, 6.2)
- FR-7.1, FR-7.2 → Epic 5 (Stories 5.1, 5.2, 5.3, 5.4, 5.5)
- FR-8.1 → Epic 6 (Stories 6.3, 6.4)

**No orphaned requirements. Full traceability achieved.**

### Key Principles Verified

✅ **Epic 1 establishes foundation** - Story 1.1 is project setup
✅ **All stories vertically sliced** - Each delivers complete functionality
✅ **No forward dependencies** - Stories only depend on previous work
✅ **BDD acceptance criteria** - Given/When/Then format throughout
✅ **Single-session sized** - Each story completable by one dev agent

### Value Delivery Milestones

- **After Epic 1:** Ready to code
- **After Epic 2:** Core product value live (playable Sudoku)
- **After Epic 3:** Retention unlocked (auth users can save progress)
- **After Epic 4:** Product magic live (competitive leaderboards with integrity)
- **After Epic 5:** Growth engine live (viral sharing)
- **After Epic 6:** Complete MVP (habit formation features)

---

**Ready for Architecture Phase!**

Next workflow: `/bmad:bmm:workflows:create-architecture`

---

_Epic breakdown created through the BMad Method with collaborative planning between Spardutti and AI Product Manager._

_Designed for 200k context dev agents with autonomous implementation capability._
