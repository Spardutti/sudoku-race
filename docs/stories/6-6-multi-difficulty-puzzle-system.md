# Story 6.6: Multi-Difficulty Puzzle System

Status: ready-for-dev

## Story

As a **player frustrated with 20+ minute solve times on medium puzzles**,
I want **to choose between Easy and Medium difficulty puzzles each day**,
so that **I can maintain momentum, complete puzzles faster, and return daily without feeling discouraged**.

## Context & Business Impact

**CRITICAL PROBLEM**: User research shows 20+ minute solve times on medium difficulty are killing momentum and preventing daily returns. Players need difficulty choice to match their skill level and available time.

**SOLUTION**: Offer two distinct puzzles daily (Easy + Medium). Players can complete either or both, with:
- Separate leaderboards per difficulty (fair competition)
- Simple streak (complete ANY difficulty = +1 day)
- Perfect Day streak (complete BOTH difficulties same day = bonus streak)
- Scalable architecture for future Hard difficulty

**USER FLOW CHANGE**:
- **Before**: Click "Start Sudoku" → immediately loads medium puzzle
- **After**: Click "Start Sudoku" → difficulty picker → loads chosen puzzle

## Acceptance Criteria

### 1. Daily Puzzle Generation (Two Puzzles Per Day)

- [ ] **AC-1.1**: System generates TWO puzzles each day (one Easy, one Medium) at midnight UTC
- [ ] **AC-1.2**: Each puzzle has unique `puzzle_id` with difficulty indicator (`YYYY-MM-DD-easy`, `YYYY-MM-DD-medium`)
- [ ] **AC-1.3**: Puzzle seed script updated to generate both difficulties
- [ ] **AC-1.4**: Migration preserves existing puzzles as "medium" difficulty with backward compatibility

### 2. Difficulty Picker UI

- [ ] **AC-2.1**: "Start Sudoku" button replaced with difficulty picker showing both options
- [ ] **AC-2.2**: Each option shows difficulty name, estimated time (Easy: 5-10 min, Medium: 10-15 min)
- [ ] **AC-2.3**: Visual indicator if user already completed a difficulty today (checkmark ✓)
- [ ] **AC-2.4**: Both options always available (can play both on same day)
- [ ] **AC-2.5**: Mobile-optimized buttons (44x44px min tap targets)
- [ ] **AC-2.6**: Newspaper aesthetic maintained

### 3. Separate Leaderboards

- [ ] **AC-3.1**: Each difficulty has independent leaderboard (`/leaderboard?difficulty=easy`, `/leaderboard?difficulty=medium`)
- [ ] **AC-3.2**: Leaderboard displays difficulty in header ("Easy Leaderboard - Puzzle #42")
- [ ] **AC-3.3**: Personal rank shown for each difficulty separately
- [ ] **AC-3.4**: Real-time updates work per-difficulty
- [ ] **AC-3.5**: No aggregate leaderboard (keep competition pure per difficulty)

### 4. Streak Logic

- [ ] **AC-4.1**: **Simple Streak**: Complete ANY difficulty (easy OR medium) = +1 streak day
- [ ] **AC-4.2**: **Perfect Day Streak**: New counter for completing BOTH difficulties same day
- [ ] **AC-4.3**: Completing both difficulties same day increments BOTH streaks
- [ ] **AC-4.4**: Completing easy then medium (or vice versa) same day = one simple streak increment
- [ ] **AC-4.5**: Streak freeze applies to simple streak only
- [ ] **AC-4.6**: Profile displays: "Simple Streak: 12 days | Perfect Day Streak: 3 days"

### 5. Sharing with Difficulty

- [ ] **AC-5.1**: Share text includes difficulty: "Sudoku Race Easy #42" or "Sudoku Race Medium #42"
- [ ] **AC-5.2**: Share link includes difficulty parameter: `sudoku-race.com/puzzle/2025-12-09/easy`
- [ ] **AC-5.3**: Emoji grid generation unchanged (same algorithm)
- [ ] **AC-5.4**: Share button shows after each puzzle completion independently

### 6. Profile Stats Display

- [ ] **AC-6.1**: Profile shows stats SIDE-BY-SIDE for both difficulties:
  - Easy Stats: Total Solved, Average Time, Best Time
  - Medium Stats: Total Solved, Average Time, Best Time
  - Combined Stats: Total Puzzles (easy + medium), Simple Streak, Perfect Day Streak
- [ ] **AC-6.2**: Responsive layout (stacked on mobile, side-by-side on desktop)
- [ ] **AC-6.3**: Stats update in real-time after completion

### 7. Completion Calendar

- [ ] **AC-7.1**: Calendar shows difficulty indicators per day:
  - Easy completed: 🟢 (green dot)
  - Medium completed: 🔵 (blue dot)
  - Both completed: 🟣 (purple dot or two dots)
  - None completed: empty/gray
- [ ] **AC-7.2**: Hover tooltip shows which difficulty completed + times
- [ ] **AC-7.3**: Visual distinction for Perfect Day completions

### 8. Data Migration & Backward Compatibility

- [ ] **AC-8.1**: Existing `puzzles` table records marked as "medium" difficulty
- [ ] **AC-8.2**: Existing `completions` table records linked to medium puzzles
- [ ] **AC-8.3**: Existing streaks preserved as simple streaks
- [ ] **AC-8.4**: Perfect Day streak initialized to 0 for all users
- [ ] **AC-8.5**: Migration script is idempotent and reversible

### 9. Future Scalability

- [ ] **AC-9.1**: Database schema supports adding "hard" difficulty without migration
- [ ] **AC-9.2**: UI components accept difficulty as parameter (easy to add third option)
- [ ] **AC-9.3**: Leaderboard queries parameterized by difficulty
- [ ] **AC-9.4**: Code structure allows adding difficulties via config (no hardcoding)

## Tasks / Subtasks

### Task 1: Database Schema Update (AC: 1.1, 1.2, 1.4, 8.1-8.5, 9.1)

- [x] Create migration: Add `difficulty` enum column to `puzzles` table (`easy`, `medium`, `hard`)
- [x] Migrate existing puzzles to `difficulty = 'medium'`
- [x] Add `perfect_day_streak` column to `streaks` table (default: 0)
- [x] Update `completions` table to include difficulty reference (via `puzzle_id`)
- [x] Add composite index on `(puzzle_date, difficulty)` for efficient queries
- [x] Update RLS policies to work with difficulty parameter
- [x] Test migration rollback

### Task 2: Puzzle Generation Update (AC: 1.1, 1.3)

- [x] Update `scripts/seed-puzzle.ts` to accept difficulty parameter
- [x] Generate Easy puzzles with appropriate clue count (45-50 clues for easier solve)
- [x] Generate Medium puzzles with current clue count (30-35 clues)
- [x] Update puzzle ID format to include difficulty suffix (`-easy`, `-medium`)
- [x] Create script to seed both difficulties for next 7 days
- [x] Verify both puzzles have unique solutions

### Task 3: Server Actions Update (AC: 1.1, 3.1, 3.3, 3.4)

- [x] Update `actions/puzzle-fetch.ts` to accept difficulty parameter
- [x] Update `actions/puzzle-submission.ts` to track difficulty
- [x] Update `actions/puzzle-leaderboard.ts` to filter by difficulty
- [x] Update `actions/streak.ts` to handle both streak types
- [x] Update puzzle completion logic to detect Perfect Day completions
- [x] Ensure real-time subscriptions filter by difficulty

### Task 4: Difficulty Picker Component (AC: 2.1-2.6)

- [x] Create `components/puzzle/DifficultyPicker.tsx`
- [x] Design card-based layout with two options (Easy | Medium)
- [x] Show estimated time ranges for each difficulty
- [x] Query today's completions to show checkmarks if already completed
- [x] Add newspaper aesthetic styling
- [x] Ensure mobile-responsive (44x44px tap targets)
- [x] Add loading states while querying completion status
- [x] Write component tests

### Task 5: Leaderboard UI Update (AC: 3.1-3.5)

- [x] Update `/app/leaderboard/page.tsx` to accept `?difficulty=` query param
- [x] Add difficulty selector tabs/buttons on leaderboard page
- [x] Update header to display difficulty ("Easy Leaderboard - Puzzle #42")
- [x] Update queries to filter by difficulty
- [x] Ensure real-time updates scoped to selected difficulty
- [x] Update personal rank display per difficulty
- [ ] Write integration tests for both leaderboards

### Task 6: Streak Logic Implementation (AC: 4.1-4.6)

- [x] Update `actions/streak.ts` to handle two streak types
- [x] Simple Streak: Increment if ANY difficulty completed today
- [x] Perfect Day Streak: Increment if BOTH difficulties completed same day
- [x] Update streak freeze logic (applies to simple streak only)
- [x] Update profile display to show both streaks
- [ ] Write unit tests for all streak scenarios

### Task 7: Sharing Update (AC: 5.1-5.4)

- [x] Update share text template to include difficulty
- [x] Update share link format: `/puzzle/{difficulty}`
- [x] Ensure OG meta tags include difficulty in title/description
- [x] Test sharing from both Easy and Medium completions
- [x] Verify share button appears after each completion independently

### Task 8: Profile Stats Display (AC: 6.1-6.3)

- [ ] Update `app/profile/page.tsx` to query stats by difficulty
- [ ] Create side-by-side layout: Easy | Medium | Combined
- [ ] Display: Total Solved, Average Time, Best Time per difficulty
- [ ] Display combined: Total Puzzles, Simple Streak, Perfect Day Streak
- [ ] Ensure responsive (stacked on mobile)
- [ ] Real-time updates after completion
- [ ] Write component tests

### Task 9: Completion Calendar Update (AC: 7.1-7.3)

- [ ] Update `components/profile/CompletionCalendar.tsx` to show difficulty indicators
- [ ] Implement visual system: 🟢 (easy), 🔵 (medium), 🟣 (both)
- [ ] Add hover tooltip showing difficulty + times
- [ ] Highlight Perfect Day completions distinctly
- [ ] Ensure mobile-responsive
- [ ] Write component tests

### Task 10: Puzzle Store Update (AC: 2.3, 8.1)

- [ ] Update `lib/stores/puzzleStore.ts` to store difficulty
- [ ] Update Zustand state: Add `difficulty: 'easy' | 'medium' | 'hard'`
- [ ] Update localStorage persistence to include difficulty
- [ ] Update puzzle reset logic to clear difficulty
- [ ] Write unit tests for new state

### Task 11: Integration Testing (AC: All)

- [ ] E2E test: Complete Easy puzzle, verify stats/leaderboard
- [ ] E2E test: Complete Medium puzzle, verify stats/leaderboard
- [ ] E2E test: Complete BOTH puzzles same day, verify Perfect Day streak
- [ ] E2E test: Share Easy completion, verify link/text includes difficulty
- [ ] E2E test: Data migration preserves existing completions
- [ ] Test backward compatibility with old puzzle IDs

### Task 12: Documentation & Deployment (AC: 9.1-9.4)

- [ ] Update README with new difficulty system
- [ ] Document how to add Hard difficulty in future (code comments + docs)
- [ ] Run ESLint and fix all errors
- [ ] Run build and fix all TypeScript errors
- [ ] Deploy to staging and test all flows
- [ ] Run production migration (coordinated deploy)

## Dev Notes

### Architecture Patterns

**Database Schema Pattern**:
- Use PostgreSQL ENUM for difficulty (`CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard')`)
- Composite unique constraint on `(puzzle_date, difficulty)` ensures one puzzle per day per difficulty
- Existing RLS policies work unchanged (row-level, not difficulty-specific)

**Puzzle ID Format**:
- **Current**: `2025-12-09`
- **New**: `2025-12-09-easy`, `2025-12-09-medium`
- Backward compatible: Queries can match prefix for date-based lookups

**Streak Calculation Pattern** (from `actions/streak.ts`):
```typescript
// Simple Streak: Check if ANY difficulty completed today
const simpleStreakIncrement = hasEasyToday || hasMediumToday ? 1 : 0;

// Perfect Day Streak: Check if BOTH difficulties completed today
const perfectDayIncrement = hasEasyToday && hasMediumToday ? 1 : 0;
```

**Leaderboard Queries** (from `actions/puzzle-leaderboard.ts`):
- Add WHERE filter: `puzzle_id LIKE '2025-12-09-easy'`
- Real-time subscriptions: Add filter on `puzzle_id` pattern

### Source Tree Components to Touch

**Database**:
- `supabase/migrations/`: New migration file
- Tables: `puzzles`, `completions`, `leaderboards`, `streaks`

**Server Actions** (all in `/actions/`):
- `puzzle-fetch.ts` - Add difficulty parameter
- `puzzle-submission.ts` - Track difficulty
- `puzzle-leaderboard.ts` - Filter by difficulty
- `streak.ts` - Dual streak logic

**Components** (all in `/components/`):
- NEW: `puzzle/DifficultyPicker.tsx`
- UPDATE: `leaderboard/LeaderboardTable.tsx` - Difficulty tabs
- UPDATE: `profile/StatsCard.tsx` - Show both difficulties
- UPDATE: `profile/CompletionCalendar.tsx` - Difficulty indicators
- UPDATE: `share/ShareModal.tsx` - Include difficulty in text

**Stores**:
- `lib/stores/puzzleStore.ts` - Add difficulty to state

**Scripts**:
- `scripts/seed-puzzle.ts` - Generate both difficulties
- NEW: `scripts/seed-multi-difficulty.ts` - Helper script

### Testing Standards Summary

**Unit Tests** (Jest + React Testing Library):
- Streak calculation logic (simple vs perfect day)
- Puzzle store with difficulty state
- DifficultyPicker component (shows completed state)

**Integration Tests** (Playwright):
- Complete easy puzzle flow (picker → play → complete → leaderboard)
- Complete both puzzles same day (verify Perfect Day streak)
- Share with difficulty (verify link format)

**Coverage Target**: 70% minimum (existing standard from Story 1.4)

### Project Structure Notes

**Alignment with Existing Patterns**:
- Server Actions pattern maintained (`Result<T, E>` return type)
- Supabase client usage: `createServerClient()` for actions, `createBrowserClient()` for components
- Zustand persistence middleware for localStorage (already used in `puzzleStore.ts`)
- shadcn/ui components for DifficultyPicker buttons (consistent with existing UI)

**Detected Patterns**:
- Puzzle state management: Zustand store at `lib/stores/puzzleStore.ts`
- Timer logic: Server-side validation in `actions/puzzle-timer.ts`
- Real-time: Supabase subscriptions in leaderboard components
- Streak logic: Centralized in `actions/streak.ts` and `lib/db/streak-queries.ts`

### References

**Architecture**:
- [Source: docs/architecture.md#Database Schema] - PostgreSQL schema with RLS
- [Source: docs/architecture.md#Server Actions] - `Result<T, E>` pattern
- [Source: docs/architecture.md#State Management] - Zustand with localStorage persistence

**PRD**:
- [Source: docs/PRD.md#FR-1.1] - Daily puzzle system requirements
- [Source: docs/PRD.md#FR-6.1] - Streak tracking requirements
- [Source: docs/PRD.md#FR-5.1] - Leaderboard requirements

**Epic**:
- [Source: docs/epics.md#Epic 6] - Engagement & Retention epic
- [Source: docs/epics.md#Story 6.1] - Streak tracking implementation pattern

**Existing Code**:
- [Source: lib/stores/puzzleStore.ts] - Existing puzzle state structure
- [Source: lib/types/streak.ts] - Existing streak data type
- [Source: actions/streak.ts] - Existing streak calculation logic
- [Source: actions/puzzle-leaderboard.ts] - Existing leaderboard queries

### Critical Implementation Notes

**⚠️ ANTI-CHEAT PRESERVATION**:
- Server-side time validation MUST work per-difficulty
- Each puzzle completion tracked separately in `completions` table
- Timer reset between puzzles (don't carry over state)

**⚠️ MIGRATION SAFETY**:
- Run migration during low-traffic window
- Test rollback procedure before production deploy
- Existing puzzle IDs without difficulty suffix treated as "medium"

**⚠️ REAL-TIME SUBSCRIPTIONS**:
- Update Supabase real-time filters to include difficulty
- Prevent cross-difficulty leaderboard updates (performance)

**⚠️ SCALABILITY FOR HARD DIFFICULTY**:
- Do NOT hardcode "easy" and "medium" in components
- Use config array: `DIFFICULTIES = ['easy', 'medium']` (extendable to `['easy', 'medium', 'hard']`)
- DifficultyPicker component should map over config array

## Dev Agent Record

### Context Reference

Project context extracted from:
- PRD: docs/PRD.md
- Architecture: docs/architecture.md
- Epics: docs/epics.md
- Sprint Status: docs/sprint-status.yaml

### Agent Model Used

Claude Sonnet 4.5 (20250929)

### Debug Log References

(To be filled during implementation)

### Completion Notes List

**Task 1 - Database Schema Update**:
- Migration 018: Created difficulty_level ENUM (easy, medium, hard)
- Converted puzzles.difficulty from TEXT to ENUM with backward compatibility
- Added perfect_day_streak column to streaks table
- Updated composite unique constraint (puzzle_date, difficulty)
- Updated TypeScript types in lib/types/database.ts and lib/types/streak.ts
- Created lib/types/difficulty.ts for type exports and ACTIVE_DIFFICULTY_LEVELS config

**Task 2 - Puzzle Generation Update**:
- Updated scripts/seed-puzzle.ts to accept CLI difficulty parameter
- Created scripts/seed-multi-difficulty.ts for bulk seeding both difficulties
- Added npm script: puzzle:seed:multi
- Uses ACTIVE_DIFFICULTY_LEVELS for scalability (easy to add "hard")
- sudoku-core generate() already handles difficulty-appropriate clue counts

**Task 3 - Server Actions Update**:
- Updated actions/puzzle-fetch.ts with difficulty parameter (defaults to "medium")
- Migration 019: Updated update_user_streak RPC with perfect day logic
- RPC checks for both easy+medium completions same day
- Simple streak: ANY difficulty increments
- Perfect Day streak: BOTH difficulties same day increments
- Leaderboard and submission already work per puzzle_id (includes difficulty)

**Task 4 - Difficulty Picker Component**:
- Created components/puzzle/DifficultyPicker.tsx using shadcn Card component
- Created components/puzzle/PuzzlePageWrapper.tsx for difficulty selection flow
- Created actions/puzzle-completion-check.ts to fetch today's completed difficulties
- Updated app/[locale]/puzzle/page.tsx to show picker first (server-side fetch)
- Added i18n translations in messages/en.json and messages/es.json
- Checkmarks show on completed difficulties
- Mobile-responsive (Card padding ensures 44x44px minimum tap targets)
- Newspaper aesthetic maintained (border, clean design)
- Both difficulties always playable (no restrictions)
- Perfect Day message when both completed
- Fixed guest user status tracking: Added difficulty/puzzleDate to puzzleStore
- Guest status reads from localStorage, auth status from DB, merge prioritizes auth

**Task 5 - Leaderboard UI Update**:
- Updated app/[locale]/leaderboard/page.tsx to accept ?difficulty= query param
- Added difficulty selector tabs in LeaderboardHeader component
- Tabs use Link for navigation, active state styling with border-bottom
- Header displays selected difficulty in title
- Queries automatically filter by difficulty (via unique puzzle_id per difficulty)
- Real-time updates scoped to selected difficulty (useLeaderboardQuery uses puzzleId)
- Personal rank display works per difficulty (separate ranks for each)
- Defaults to "medium" for backward compatibility
- Empty state shows difficulty tabs + "Sudoku" message (not "puzzle")
- i18n: Tabs show "Fácil/Medio" in Spanish, "Easy/Medium" in English
- Added "Play" nav link to header (links to /puzzle difficulty picker)

**Task 6 - Streak Logic Implementation**:
- Streak logic already implemented in Migration 020 (update_user_streak RPC)
- Simple Streak (current_streak): Increments when ANY difficulty completed
- Perfect Day Streak (perfect_day_streak): Increments when BOTH easy+medium completed same day
- Streak freeze applies only to simple streak (not perfect day)
- Updated profile to display Perfect Day Streak between Current and Longest
- Added perfectDayStreak to ProfileStats.tsx, StatsDisplay.tsx, ProfilePageClient.tsx
- Translations: "Perfect Day Streak" (EN) / "Racha de Días Perfectos" (ES)
- Migration 019 added perfect_day_streak column (defaults to 0)

**Task 7 - Sharing Update**:
- Updated share-text.ts:40,88 to include difficulty in share text ("Sudoku Race Easy #42")
- Updated buildShareUrl() and getPuzzleUrlWithUTM() to include difficulty in URL path
- Share links now route to /puzzle/{difficulty} instead of root
- Fixed OG metadata visibility: Added full OpenGraph and Twitter card metadata to puzzle pages
- Updated app/[locale]/puzzle/page.tsx:15-34 with complete OG image metadata
- Updated app/[locale]/puzzle/[difficulty]/page.tsx:24-43 with difficulty-specific OG metadata
- Share button already appears independently per completion (CompletionModal.tsx)
- Added tests for difficulty parameter in share URLs (share-text.test.ts:37-47, 184-194)
- All share functions (Twitter, WhatsApp, Clipboard) now pass difficulty to URL generator

### File List

**Created**:
- supabase/migrations/018_add_multi_difficulty_support.sql
- supabase/migrations/019_update_streak_rpc_for_multi_difficulty.sql
- lib/types/difficulty.ts
- scripts/seed-multi-difficulty.ts
- components/puzzle/DifficultyPicker.tsx
- components/puzzle/PuzzlePageWrapper.tsx
- actions/puzzle-completion-check.ts

**Modified**:
- lib/types/database.ts (lines 213, 116, 124, 132, 148, 158, 168, 344)
- lib/types/streak.ts (line 9)
- actions/streak.ts (line 52)
- actions/puzzle-fetch.ts (lines 6, 13, 18, 29, 35, 60)
- scripts/seed-puzzle.ts (lines 8, 19, 60-70, 98, 108)
- package.json (line 22)
- app/[locale]/puzzle/page.tsx (added OG image metadata)
- app/[locale]/puzzle/[difficulty]/page.tsx (added full OG and Twitter metadata)
- lib/utils/share-text.ts (added difficulty param to buildShareUrl, getPuzzleUrlWithUTM, generateEmojiShareText)
- lib/utils/__tests__/share-text.test.ts (added difficulty URL tests)
- messages/en.json (added difficulty picker, leaderboard, perfect day streak translations)
- messages/es.json (added difficulty picker, leaderboard, perfect day streak translations)
- lib/stores/puzzleStore.types.ts (added difficulty, puzzleDate fields)
- lib/stores/puzzleStore.ts (updated setPuzzle, resetPuzzle, persist config)
- components/puzzle/DifficultyPicker.tsx (added guest status merge logic)
- components/puzzle/PuzzlePageClient.tsx (pass difficulty/puzzleDate to setPuzzle)
- app/[locale]/leaderboard/page.tsx (added difficulty query param handling)
- components/leaderboard/LeaderboardHeader.tsx (added difficulty tabs, i18n)
- components/leaderboard/EmptyState.tsx (added difficulty-specific message)
- components/layout/Header.tsx (added "Play" nav link)
- components/profile/StatsDisplay.tsx (added perfectDayStreak display)
- components/profile/ProfileStats.tsx (fetch perfect_day_streak from DB)
- components/profile/ProfilePageClient.tsx (added perfectDayStreak type)
