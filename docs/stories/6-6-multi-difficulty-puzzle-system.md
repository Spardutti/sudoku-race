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

- [ ] Create migration: Add `difficulty` enum column to `puzzles` table (`easy`, `medium`, `hard`)
- [ ] Migrate existing puzzles to `difficulty = 'medium'`
- [ ] Add `perfect_day_streak` column to `streaks` table (default: 0)
- [ ] Update `completions` table to include difficulty reference (via `puzzle_id`)
- [ ] Add composite index on `(puzzle_date, difficulty)` for efficient queries
- [ ] Update RLS policies to work with difficulty parameter
- [ ] Test migration rollback

### Task 2: Puzzle Generation Update (AC: 1.1, 1.3)

- [ ] Update `scripts/seed-puzzle.ts` to accept difficulty parameter
- [ ] Generate Easy puzzles with appropriate clue count (45-50 clues for easier solve)
- [ ] Generate Medium puzzles with current clue count (30-35 clues)
- [ ] Update puzzle ID format to include difficulty suffix (`-easy`, `-medium`)
- [ ] Create script to seed both difficulties for next 7 days
- [ ] Verify both puzzles have unique solutions

### Task 3: Server Actions Update (AC: 1.1, 3.1, 3.3, 3.4)

- [ ] Update `actions/puzzle-fetch.ts` to accept difficulty parameter
- [ ] Update `actions/puzzle-submission.ts` to track difficulty
- [ ] Update `actions/puzzle-leaderboard.ts` to filter by difficulty
- [ ] Update `actions/streak.ts` to handle both streak types
- [ ] Update puzzle completion logic to detect Perfect Day completions
- [ ] Ensure real-time subscriptions filter by difficulty

### Task 4: Difficulty Picker Component (AC: 2.1-2.6)

- [ ] Create `components/puzzle/DifficultyPicker.tsx`
- [ ] Design card-based layout with two options (Easy | Medium)
- [ ] Show estimated time ranges for each difficulty
- [ ] Query today's completions to show checkmarks if already completed
- [ ] Add newspaper aesthetic styling
- [ ] Ensure mobile-responsive (44x44px tap targets)
- [ ] Add loading states while querying completion status
- [ ] Write component tests

### Task 5: Leaderboard UI Update (AC: 3.1-3.5)

- [ ] Update `/app/leaderboard/page.tsx` to accept `?difficulty=` query param
- [ ] Add difficulty selector tabs/buttons on leaderboard page
- [ ] Update header to display difficulty ("Easy Leaderboard - Puzzle #42")
- [ ] Update queries to filter by difficulty
- [ ] Ensure real-time updates scoped to selected difficulty
- [ ] Update personal rank display per difficulty
- [ ] Write integration tests for both leaderboards

### Task 6: Streak Logic Implementation (AC: 4.1-4.6)

- [ ] Update `actions/streak.ts` to handle two streak types
- [ ] Simple Streak: Increment if ANY difficulty completed today
- [ ] Perfect Day Streak: Increment if BOTH difficulties completed same day
- [ ] Update streak freeze logic (applies to simple streak only)
- [ ] Update profile display to show both streaks
- [ ] Write unit tests for all streak scenarios

### Task 7: Sharing Update (AC: 5.1-5.4)

- [ ] Update share text template to include difficulty
- [ ] Update share link format: `/puzzle/YYYY-MM-DD/{difficulty}`
- [ ] Ensure OG meta tags include difficulty in title/description
- [ ] Test sharing from both Easy and Medium completions
- [ ] Verify share button appears after each completion independently

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

(To be filled during implementation)

### File List

(To be filled during implementation)
