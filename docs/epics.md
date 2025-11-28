# sudoku-race - Epic Breakdown

**Project Level:** Medium (Greenfield)
**Target Scale:** 10 DAU → 1,000 DAU (MVP → Growth)

---

## Overview

**6 Epics | 32 Stories Total**

This breakdown delivers the complete MVP through 6 sequential epics:

1. **Foundation & Infrastructure** (5 stories) - Technical foundation
2. **Core Puzzle Experience** (7 stories) - Daily Sudoku playing experience
3. **User Identity & Authentication** (5 stories) - Guest-to-auth journey
4. **Competitive Leaderboards** (5 stories) - Authentic competitive rankings
5. **Viral Social Mechanics** (5 stories) - Emoji sharing growth engine
6. **Engagement & Retention** (5 stories) - Streaks and stats for habit formation

**Value Delivery Path:**
- **After Epic 1:** Development environment ready, deployable foundation
- **After Epic 2:** Playable daily Sudoku (guest mode) - CORE VALUE LIVE
- **After Epic 3:** Authenticated users with saved progress
- **After Epic 4:** Competitive leaderboards - PRODUCT MAGIC LIVE
- **After Epic 5:** Viral sharing enabled - GROWTH ENGINE LIVE
- **After Epic 6:** Complete MVP with retention features

---

## Epic 1: Foundation & Infrastructure

**Goal**: Establish technical foundation enabling all subsequent development with deployable infrastructure, core app structure, and design system foundations.

---

### Story 1.1: Project Initialization & Core Infrastructure

As a **developer**, I want a **fully configured Next.js 16 project with TypeScript, deployment pipeline, and core dependencies**, so that I can **build features on a solid foundation with rapid deployment capabilities**.

**Acceptance Criteria:**

- TypeScript strict mode enabled
- Tailwind CSS 4 installed and configured
- ESLint and Prettier configured
- Git repository with .gitignore
- Environment variable management (.env.local setup)
- Vercel deployment pipeline configured (auto-deploy on push, preview deployments)
- Basic project structure: `/app`, `/components`, `/lib`, `/types`, `/public`
- "Hello World" page deploys successfully to Vercel

---

### Story 1.2: Supabase Integration & Database Setup

As a **developer**, I want **Supabase connected with database schema and authentication configured**, so that I can **store user data, puzzle state, and handle OAuth authentication**.

**Acceptance Criteria:**

- Supabase client configured (URL and anon key in environment variables)
- Database schema created:
  - `users` (id, email, username, oauth_provider, created_at)
  - `puzzles` (id, puzzle_date, puzzle_data, difficulty, solution)
  - `completions` (id, user_id, puzzle_id, completion_time_seconds, solve_path)
  - `leaderboards` (id, puzzle_id, user_id, rank, completion_time_seconds)
  - `streaks` (id, user_id, current_streak, longest_streak, freeze_available)
- Supabase Auth configured (OAuth providers: Google, GitHub, Apple)
- Row Level Security (RLS) policies created
- Database indexes created for performance (puzzle_date, puzzle_id + completion_time, user_id)

---

### Story 1.3: Core App Routing & Layout Structure

As a **user**, I want **clean navigation and consistent layout across all pages**, so that I can **easily access the daily puzzle and understand the site structure**.

**Acceptance Criteria:**

- Routes exist: `/` (home), `/auth/callback` (OAuth), `/profile`, `/leaderboard`
- Root layout includes HTML structure with proper meta tags
- Navigation header component (branding, links, responsive mobile menu)
- Footer component (privacy, terms, copyright)
- 404 page created
- Newspaper aesthetic applied (black & white, serif headers, sans-serif body)

---

### Story 1.4: Testing Infrastructure & CI/CD Quality Gates

As a **developer**, I want **automated testing and CI/CD quality gates**, so that I can **catch bugs early and maintain code quality as the project scales**.

**Acceptance Criteria:**

- Test frameworks configured: Jest, React Testing Library, Playwright (config only for E2E)
- npm scripts: `test`, `test:watch`, `test:coverage`, `lint`, `format`
- GitHub Actions workflow created (runs on every PR and push to main)
- CI executes: lint, test, build (blocks merge if any step fails)
- Example tests demonstrating patterns (unit, component)
- Coverage threshold configured (70% minimum)

---

### Story 1.5: Design System Foundations (Newspaper Aesthetic)

As a **designer/developer**, I want **a design system with newspaper aesthetic components and styles**, so that I can **build consistent, brand-aligned UI quickly across all features**.

**Acceptance Criteria:**

- Tailwind config includes custom color palette, typography scale, spacing system
- Design tokens documented (colors, fonts, spacing)
- Reusable UI components created: `<Button>`, `<Card>`, `<Input>`, `<Typography>`
- Each component has TypeScript props, accessible attributes, responsive design, unit tests
- Newspaper aesthetic: Merriweather (serif headers), Inter (body), black/white/spot blue
- Color contrast meets WCAG AA (4.5:1 for text)
- Mobile tap targets minimum 44x44px

---

## Epic 2: Core Puzzle Experience

**Goal**: Deliver the fundamental daily Sudoku playing experience with clean UI, pure challenge validation, and fair timing.

---

### Story 2.1: Daily Puzzle System & Data Management

As a **system administrator**, I want **a daily puzzle generation and delivery system**, so that **all users globally receive the same medium-difficulty puzzle each day at midnight UTC**.

**Acceptance Criteria:**

- Puzzle seed script exists (generates/imports valid Sudoku, validates unique solution, stores in `puzzles` table)
- API route created: GET `/api/puzzle/today` returns today's puzzle (no solution exposed)
- API route for validation: POST `/api/puzzle/validate` validates solution server-side
- Response caching (1-hour TTL)
- Rate limiting (max 100 attempts per hour per IP)
- At least 7 puzzles pre-seeded for testing

---

### Story 2.2: Sudoku Grid UI Component (Mobile-Optimized)

As a **player**, I want **a clean, touch-optimized 9x9 Sudoku grid**, so that I can **easily select cells and see the puzzle clearly on mobile devices**.

**Acceptance Criteria:**

- 9x9 grid displays with pre-filled clues (read-only, distinct style)
- Grid lines delineate 3x3 subgrids (newspaper aesthetic)
- Cell sizing: minimum 40px × 40px for touch targets
- Grid responsive (scales to fit viewport on mobile 320px-767px)
- Cell selection works (tap/click, highlighted, only one selected at a time)
- User-entered numbers visually distinct from clues
- Accessibility: keyboard navigation (arrow keys), screen reader support, focus indicators

---

### Story 2.3: Number Input System (Touch & Keyboard)

As a **player**, I want **fast, intuitive number input for both mobile and desktop**, so that I can **efficiently fill the Sudoku grid without friction**.

**Acceptance Criteria:**

- **Mobile**: Number pad appears (buttons 1-9 + Clear), large tap targets (44x44px min), sticky position
- **Desktop**: Number keys (1-9) input directly, Backspace/Delete clears cell
- Input validation: only 1-9 accepted, clues cannot be modified
- Immediate visual feedback on input
- Works on iOS Safari, Android Chrome, desktop browsers

---

### Story 2.4: Puzzle State Auto-Save & Session Management

As a **player**, I want **my puzzle progress automatically saved**, so that **I can leave and return without losing my work**.

**Acceptance Criteria:**

- Progress auto-saves on number entry:
  - **Guest users**: localStorage
  - **Auth users**: Supabase `completions` table
- Save happens within 500ms (debounced)
- On page refresh, grid state restored (including timer elapsed time)
- State includes: user entries (9x9 grid), elapsed time, completion status, puzzle ID
- Auth users can resume on different devices

---

### Story 2.5: Timer Implementation (Auto-Start, Fair Timing)

As a **player**, I want **accurate timing that starts automatically and tracks fairly**, so that **my leaderboard time reflects my actual solving speed**.

**Acceptance Criteria:**

- Timer starts automatically when puzzle page loads
- Displays in MM:SS format, updates every second
- Starts from 0:00 for new puzzle, resumes from saved time if returning
- Continues running through submit attempts, stops when correctly completed
- Timer pauses when browser tab loses focus, resumes when tab regains focus
- Server tracks `started_at` and `completed_at` timestamps (server time is source of truth)
- Timer state saved with puzzle state

---

### Story 2.6: Solution Validation & Completion Flow

As a **player**, I want **to submit my solution and receive immediate feedback**, so that **I know when I've solved the puzzle correctly and can see my completion time**.

**Acceptance Criteria:**

- "Submit" button triggers server validation
- **If incorrect**: Encouraging message ("Not quite right. Keep trying!"), timer continues, unlimited attempts
- **If correct**: Timer stops, completion animation, time displayed, completion saved to DB (auth users)
- Server validation checks: all cells filled, rows/columns/3x3 subgrids valid, matches stored solution
- Anti-cheat: completion time >60 seconds minimum, <120 seconds flagged for review
- Completion flow continues to modal showing time, rank (auth), sharing options

---

### Story 2.7: Puzzle Page Integration & UX Polish

As a **player**, I want **a polished, cohesive puzzle playing experience**, so that **I can focus on solving without distraction or confusion**.

**Acceptance Criteria:**

- Complete puzzle page with:
  - "Today's Puzzle" header with date and puzzle number
  - Timer in prominent location
  - Sudoku grid centered and responsive
  - Number input system (mobile pad or keyboard instructions)
  - "Submit" button (disabled until grid complete)
- Mobile-first responsive, no horizontal scroll, fast load (<2 seconds on 3G)
- Loading skeleton while puzzle fetches
- Brief instructions on first visit (dismissible)
- Accessibility: semantic HTML, ARIA labels, keyboard navigation, WCAG AA compliance
- Newspaper aesthetic applied throughout

---

## Epic 3: User Identity & Authentication

**Goal**: Enable guest-to-authenticated user journey with seamless session preservation, unlocking persistent features (leaderboards, streaks, stats).

---

### Story 3.1: Guest Play with Session-Based Progress

As a **first-time visitor**, I want **to play immediately without signing up**, so that **I can try the game with zero friction**.

**Acceptance Criteria:**

- Guest users can play full puzzle (view, interact, submit, see completion time)
- Progress saved in localStorage (puzzle state, timer, completion status)
- After completion: "You'd be #347! Sign in to claim your rank" message
- Gentle auth prompt (not blocking, appears only after completion)
- Limitations communicated (no leaderboard ranking, no streaks without auth)

---

### Story 3.2: OAuth Authentication (Google, GitHub, Apple)

As a **guest user**, I want **one-click authentication via OAuth providers**, so that **I can save my progress and access persistent features without creating a password**.

**Acceptance Criteria:**

- Auth options: Google, GitHub, Apple (no email/password)
- OAuth flow: redirect to provider → grant permission → redirect to `/auth/callback` → session established
- First-time users: account created in `users` table (username from OAuth, provider recorded)
- Returning users: existing account matched, session re-established
- Error handling (OAuth fails, callback error, network errors)
- Auth state persisted (session cookie, logout functionality)

---

### Story 3.3: Session Preservation & Retroactive Save

As a **guest user who completes a puzzle then authenticates**, I want **my completion time and progress automatically saved to my new account**, so that **I don't lose my achievement when I sign up**.

**Acceptance Criteria:**

- Guest completion data (from localStorage) migrated to database on auth
- Completion time preserved exactly, leaderboard entry created with rank
- In-progress puzzle state transferred to database
- localStorage cleaned up after migration
- Seamless transition (user sees rank immediately after auth)
- Edge cases handled (guest completed already, no localStorage data)

---

### Story 3.4: User Profile & Account Management

As an **authenticated user**, I want **a profile page showing my account info and a way to log out**, so that **I can manage my account and understand what data is saved**.

**Acceptance Criteria:**

- Profile page (`/profile`) shows: username, email, account created date, OAuth provider, total puzzles solved
- "Logout" button (signs out, redirects to home)
- "Delete Account" button (confirmation required, GDPR compliance, deletes all user data)
- Profile page protected (redirect if not authenticated)
- Newspaper aesthetic applied

---

### Story 3.5: Auth State Management & UI Indicators

As a **user navigating the site**, I want **clear indication of my authentication status**, so that **I know what features I have access to and can easily sign in/out**.

**Acceptance Criteria:**

- Header shows auth state:
  - **Guest**: "Sign In" button
  - **Auth**: User avatar/icon + username (dropdown with Profile, Logout links)
- Auth state checked on app load, after OAuth callback, on logout, on navigation
- Loading states (skeleton while auth loads, no flicker)
- Session auto-refreshes (Supabase built-in)

---

## Epic 4: Competitive Leaderboards

**Goal**: Deliver authentic competitive rankings with real-time updates and anti-cheat measures, establishing the "pure competitive integrity" core differentiator.

---

### Story 4.1: Global Daily Leaderboard (Top 100 + Personal Rank)

As a **competitive player**, I want **to see the global rankings for today's puzzle**, so that **I can compare my performance and feel motivated to improve**.

**Acceptance Criteria:**

- Leaderboard page (`/leaderboard`) shows top 100 players for today's puzzle
- Displays: rank (#1, #2, ...), username, completion time (MM:SS format)
- Sorted by completion time (fastest first), ties broken by submission timestamp
- Auth users: personal rank highlighted (even if outside top 100)
- Empty state ("Be the first to complete today's puzzle!")
- Mobile responsive (scrollable table, compact layout)
- Newspaper aesthetic (clean table, zebra striping)

---

### Story 4.2: Real-Time Leaderboard Updates (Supabase Realtime)

As a **competitive player**, I want **the leaderboard to update in real-time as others complete the puzzle**, so that **I can see my rank change live and feel the competitive energy**.

**Acceptance Criteria:**

- Leaderboard updates automatically when another user completes puzzle
- Updates within 1-2 seconds using Supabase Realtime
- Subscribed to `leaderboards` table changes (filtered by today's puzzle ID)
- New entries animate in smoothly (fade/slide in, 60fps)
- Optimistic UI updates (user's completion appears immediately)
- Graceful fallback to polling (every 5 seconds) if real-time connection drops
- Connection handling (status indicator if disconnected, auto-reconnect)

---

### Story 4.3: Server-Side Time Validation & Anti-Cheat

As a **fair player**, I want **the leaderboard to be authentic with no cheaters**, so that **rankings reflect real skill and I can trust the competition**.

**Acceptance Criteria:**

- Server calculates actual elapsed time (`completed_at - started_at`, server timestamps only)
- Client-submitted time ignored (display only, not source of truth)
- Minimum time threshold enforced (≥60 seconds)
- Times <120 seconds flagged for review (`flagged_for_review: true` in completions table)
- Rate limiting (max 100 submit attempts per hour per IP)
- Server tracks: `started_at`, `completed_at`, `completion_time_seconds`, `pause_events` (optional)
- Only authenticated users appear on leaderboard

---

### Story 4.4: Leaderboard UI Polish & Accessibility

As a **player viewing the leaderboard**, I want **a clean, readable leaderboard that works on all devices**, so that **I can easily see rankings and compare my performance**.

**Acceptance Criteria:**

- Page title with puzzle date and number, total completions count
- Table design: clean columns (Rank, Username, Time), zebra striping, serif header, monospace times
- Personal rank highlighted (different background, bold text)
- If outside top 100: sticky footer shows "Your rank: #347 - Time: 18:45"
- Responsive design (mobile compact, scrollable)
- Loading skeleton, empty state, error state
- Accessibility: semantic table, screen reader support, keyboard navigation, WCAG AA

---

### Story 4.5: Leaderboard Sharing & Social Proof

As a **player who ranks well**, I want **to share my leaderboard rank**, so that **I can show off my achievement and invite friends to compete**.

**Acceptance Criteria:**

- "Share Rank" button next to personal rank
- Share format: rank, completion time, puzzle number, link, encouragement text
- Share options: Twitter/X, WhatsApp, Copy to clipboard
- Share text example: "I ranked #23 on Sudoku Daily #42! ⏱️ 12:34. Think you can beat me? [link]"
- Tracking: log share events, track channel used

---

## Epic 5: Viral Social Mechanics

**Goal**: Enable organic growth through emoji grid sharing (primary growth engine) modeled after Wordle's proven viral mechanics.

---

### Story 5.1: Solve Path Tracking During Gameplay

As a **system tracking user behavior**, I want **to record the user's solve path as they fill the grid**, so that **I can generate an accurate emoji grid showing their solving journey**.

**Acceptance Criteria:**

- Track for each cell entry: row, column, number entered, timestamp, isCorrection (first entry or change)
- Solve path data structure stored as JSON array
- For each cell in final grid:
  - First-fill (never changed): green 🟩
  - Corrected (changed at least once): yellow 🟨
  - Pre-filled clue: white ⬜
- Solve path saved in `completions` table on successful completion

---

### Story 5.2: Emoji Grid Generation Algorithm

As a **developer**, I want **an algorithm that converts solve path into emoji grid**, so that **users can share their solving journey in a visual, non-spoiler format**.

**Acceptance Criteria:**

- Algorithm creates 9×9 emoji grid based on solve path
- Mapping: 🟩 (first-fill), 🟨 (corrected), ⬜ (clue)
- Output format: 9 lines of 9 emojis (no spaces), preserves Sudoku structure
- Edge cases handled (missing solve path → all-green fallback)
- Unit tests for various solve paths

---

### Story 5.3: Share Completion Modal with Emoji Grid Preview

As a **player who just completed the puzzle**, I want **a share modal showing my emoji grid and completion time**, so that **I can preview before sharing and feel proud of my achievement**.

**Acceptance Criteria:**

- Modal opens automatically on completion
- Displays: "Congratulations!", completion time, leaderboard rank (if auth), emoji grid preview
- Emoji grid in monospace font (WYSIWYG preview)
- Share text preview shown
- Share buttons below preview (Twitter, WhatsApp, Copy)
- Modal dismissible (X button), newspaper aesthetic
- For guests: auth prompt included ("Sign in to save your rank!")

---

### Story 5.4: One-Tap Sharing to Twitter, WhatsApp, Clipboard

As a **player wanting to share my result**, I want **one-tap sharing to my preferred platform**, so that **I can quickly share with friends and drive traffic to the game**.

**Acceptance Criteria:**

- **Twitter/X**: Opens web intent with pre-filled tweet (puzzle number, time, emoji grid, link)
- **WhatsApp**: Opens share dialog (mobile) or WhatsApp Web (desktop)
- **Copy to Clipboard**: Copies full text, shows confirmation toast ("Copied!")
- Share text format consistent across channels
- UTM parameters in link (optional analytics): `?utm_source=share&utm_medium={channel}`
- Share action tracked (user_id, puzzle_id, channel, timestamp)
- Error handling (clipboard API fails, Twitter/WhatsApp fails to open)

---

### Story 5.5: Shareable Link & Social Meta Tags (Open Graph)

As a **player sharing a link**, I want **the link to display rich preview with image and description**, so that **my friends see an enticing preview and are more likely to click**.

**Acceptance Criteria:**

- Open Graph meta tags set: title, description, image, URL, type
- Twitter Card meta tags set: card type (summary_large_image), title, description, image
- OG image created (1200×630px, newspaper aesthetic, includes branding + sample emoji grid)
- Link preview tested (Twitter Card Validator, Facebook Sharing Debugger)

---

## Epic 6: Engagement & Retention

**Goal**: Drive daily habit formation and long-term retention through streak tracking and personal statistics, turning casual players into dedicated daily users.

---

### Story 6.1: Streak Tracking System (Consecutive Days)

As an **authenticated user**, I want **my consecutive day completion streak tracked automatically**, so that **I feel motivated to maintain my daily habit and see my consistency rewarded**.

**Acceptance Criteria:**

- Streak updated on puzzle completion:
  - Completed yesterday: streak increments
  - Missed yesterday + freeze available: streak maintained, freeze consumed
  - Missed yesterday + no freeze: streak resets to 1
- Streak data: `current_streak`, `longest_streak`, `last_completion_date`, `freeze_available`
- On first completion: streak initialized to 1, freeze available by default
- Streak updates server-side only (prevent manipulation), atomic transaction with completion

---

### Story 6.2: Streak Freeze Mechanic (Healthy Engagement)

As an **engaged user with a long streak**, I want **forgiveness if I miss one day per week**, so that **life events don't destroy my streak and I don't feel toxic compulsion to play**.

**Acceptance Criteria:**

- If user misses one day + freeze available: streak preserved, freeze consumed, user notified ("Streak freeze used!")
- If user misses second day (before freeze resets): streak resets, user notified ("Your streak has been reset.")
- Freeze resets after 7 days (rolling window)
- Freeze indicator in UI ("Streak Freeze: Available ✓" or "Used, resets in 3 days")
- Messaging positive, not punishing
- New users get freeze from day 1, max 1 freeze at a time

---

### Story 6.3: Personal Statistics Dashboard

As an **authenticated user**, I want **to see my personal statistics and progress over time**, so that **I can track my improvement and feel a sense of mastery**.

**Acceptance Criteria:**

- Stats displayed: Total Puzzles Solved, Current Streak, Longest Streak, Average Time, Best Time
- Stats calculated from database (count, avg, min from completions + streaks table)
- Card layout with newspaper aesthetic (grid, responsive)
- Empty state ("Complete your first puzzle to see your stats!")
- Stats update in real-time after completion

---

### Story 6.4: Completion History Calendar View

As an **authenticated user**, I want **a visual calendar showing which days I completed puzzles**, so that **I can see my consistency over time and identify gaps**.

**Acceptance Criteria:**

- Calendar shows last 30 days (7-column grid)
- Completed days highlighted (green or checkmark ✓), missed days not highlighted
- Today distinct styling (border/different color)
- Hover shows completion time for that day (optional tooltip)
- Newspaper aesthetic (clean, minimal)
- Responsive (scales on mobile, smaller cells)
- Empty state ("Start your daily puzzle habit!")

---

### Story 6.5: Engagement Hooks & Notifications (Post-MVP Prep)

As a **product manager**, I want **notification infrastructure prepared for post-MVP engagement features**, so that **we can add daily reminders and streak alerts after launch**.

**Acceptance Criteria:**

- Service worker configured for PWA (push notification permissions flow created but hidden/disabled)
- Notification use cases planned (not implemented): daily reminder, streak alert, personal best
- Notification settings page created (`/settings` placeholder)
- Analytics events tracked: DAU, D7 retention, D30 retention, sharing rate, guest-to-auth conversion
- Documentation created (`/docs/post-mvp-engagement.md`) with planned features
- **Do NOT implement actual notification sending** (foundation only)

---

## Coverage Validation

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

---

_Epic breakdown refactored by Paige (Tech Writer) - BMad Method_
_Date: 2025-11-28_
_Lines reduced: 2,037 → 873 (57% reduction)_
