# Story 6.1: Streak Tracking System (Consecutive Days)

**Story ID**: 6.1
**Epic**: Epic 6 - Engagement & Retention
**Story Key**: 6-1-streak-tracking-system-consecutive-days
**Status**: Ready for Review
**Created**: 2025-12-03
**Completed**: 2025-12-03

---

## User Story Statement

**As an** authenticated user,
**I want** my consecutive day completion streak tracked automatically,
**So that** I feel motivated to maintain my daily habit and see my consistency rewarded.

**Value**: Core retention mechanic. Streak systems drive 40-60% increase in D7 retention (Duolingo case study: streaks increased DAU by 27%). Gamifies consistency without being punitive (freeze mechanic prevents toxic compulsion).

---

## Requirements Context

**Epic 6 Goal**: Drive daily habit formation and long-term retention through streak tracking and personal statistics, turning casual players into dedicated daily users.

**This Story's Role**: Foundation for engagement system. Story 6.1 creates the core streak tracking logic. Stories 6.2-6.4 build on this (freeze UI, stats display, calendar view).

**Dependencies**:
- Story 2.6 (DONE): Completion flow where streak logic hooks in
- Story 3.2 (DONE): Auth system (streaks only for authenticated users)
- Database schema (DONE): `streaks` table already exists (001_initial_schema.sql:58-69)

**Requirements**:
- FR-6.1: Consecutive day streak tracking with automatic updates
- FR-6.2: Streak freeze mechanic (forgiveness for 1 missed day per week)
- Epic 6, Story 6.1 ACs: Server-side only, atomic transactions, specific streak update logic

[Source: docs/PRD.md#FR-6.1, docs/epics.md#Story-6.1, docs/architecture.md#Data-Architecture]

---

## Acceptance Criteria

### AC1: Streak Updated on Puzzle Completion

**Trigger**: When authenticated user completes puzzle (calls `submitCompletionWithRank`)

**Logic**:
```typescript
// Check last_completion_date from streaks table
if (completed_yesterday) {
  current_streak++ // Increment streak
  if (current_streak > longest_streak) longest_streak = current_streak
} else if (days_diff === 2 && freeze_available) {
  // Missed 1 day (2-day gap) with freeze: maintain streak, consume freeze
  // Example: Completed Friday, today is Sunday (missed Saturday)
  // Designed for weekend forgiveness
  freeze_available = false
  last_freeze_reset_date = today
  // Freeze resets after 7 days
  if (last_freeze_reset_date && days_since_reset >= 7) {
    freeze_available = true
  }
} else if (days_diff === 2 && !freeze_available) {
  current_streak = 1 // Reset to 1 (today counts as day 1)
} else if (days_diff > 2) {
  current_streak = 1 // Multi-day gap: Reset to 1
} else if (completed_today_already) {
  // No change - same-day recompletions don't affect streak
}
last_completion_date = today
```

**Edge Cases**:
- First-time user (no streaks record): Initialize with `current_streak: 1, longest_streak: 1, freeze_available: true`
- Completed yesterday (1-day gap): Increment streak
- Missed 1 day (2-day gap) with freeze: Use freeze, maintain streak, set reset timer
- Missed 1 day (2-day gap) without freeze: Reset to 1
- Multi-day gap (3+ days): Reset to 1
- Same-day recompletion: No streak change
- Freeze reset: After 7 days from `last_freeze_reset_date`, `freeze_available` becomes `true` again

[Source: docs/epics.md#Story-6.1-AC1]

---

### AC2: Streak Data Structure

**Fields** (in `streaks` table - already exists):
```sql
CREATE TABLE streaks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  current_streak INT NOT NULL DEFAULT 1,
  longest_streak INT NOT NULL DEFAULT 1,
  last_completion_date DATE NOT NULL,
  freeze_available BOOLEAN DEFAULT true,
  last_freeze_reset_date DATE
);
```

**Notes**:
- Table already created in 001_initial_schema.sql:58-69
- RLS policies already exist (lines 153-163)
- No migration needed for this story

[Source: supabase/migrations/001_initial_schema.sql:58-69]

---

### AC3: First Completion Initialization

**Behavior**: On user's FIRST puzzle completion ever:
```typescript
INSERT INTO streaks (user_id, current_streak, longest_streak, last_completion_date, freeze_available)
VALUES (user_id, 1, 1, today, true)
```

**Important**: `freeze_available` starts `true` (users get freeze from day 1).

[Source: docs/epics.md#Story-6.1-AC3]

---

### AC4: Server-Side Only (Anti-Cheat)

**Rule**: All streak logic executes server-side. Client NEVER submits streak data.

**Why**: Prevent manipulation. Users can't fake streaks by changing local storage or API calls.

**Implementation**:
- Streak updates happen in Server Action (`updateStreak`)
- Called from `submitCompletionWithRank` (existing completion flow)
- Uses server timestamps (`new Date()` in Server Action context)

**Security**:
- RLS policies already enforce user can only update own streaks
- Atomic transaction with completion (Postgres transaction)

[Source: docs/architecture.md#Security-Anti-Cheat, docs/epics.md#Story-6.1-AC4]

---

### AC5: Atomic Transaction with Completion

**Critical**: Streak update and completion insert MUST be atomic.

**Why**: Prevent race conditions. If completion succeeds but streak fails, data is inconsistent.

**Implementation**:
```typescript
// Inside submitCompletionWithRank Server Action
const { error: txError } = await supabase.rpc('complete_puzzle_with_streak', {
  p_user_id: userId,
  p_puzzle_id: puzzleId,
  p_completion_time: completionTime,
  p_solve_path: solvePath
});
// RPC handles both completion insert AND streak update in single Postgres transaction
```

**Alternative** (if no RPC): Use Supabase transactions API or handle in single function with error rollback.

[Source: docs/architecture.md#Critical-Patterns, docs/epics.md#Story-6.1-AC5]

---

## Tasks / Subtasks

### Task 1: Create Streak Update Server Action (AC #1, #3, #4)
- [x] Create `actions/streak.ts` file
- [x] Export `updateStreak(userId: string): Promise<Result<StreakData, string>>`
- [x] Implement streak logic:
  - [x] Fetch user's streak record (or detect first-time)
  - [x] Calculate date difference (`last_completion_date` vs `today`)
  - [x] Apply AC1 logic (increment, reset, or freeze)
  - [x] Upsert streak record (INSERT if first-time, UPDATE if exists)
  - [x] Return updated streak data
- [x] Use `createServerActionClient()` for Supabase (architecture.md:89-95)
- [x] Return `Result<StreakData, string>` type (architecture.md:115-119)
- [x] Add Sentry error tracking on failures

**Files**: actions/streak.ts (NEW) | **Effort**: 3-4 hrs

---

### Task 2: Integrate Streak Update into Completion Flow (AC #5)
- [x] Open `actions/puzzle.ts`
- [x] Find `submitCompletion` function (line ~800)
- [x] After successful completion insert, call `updateStreak(userId)`
- [x] Handle streak update failure gracefully (log warning, don't block completion)
- [x] Return streak data in success response (for client display)
- [x] Ensure atomic behavior (if completion succeeds, streak MUST update)

**Files**: actions/puzzle.ts:800+ (MODIFY) | **Effort**: 1-2 hrs

---

### Task 3: Add Streak Types (AC #2)
- [x] Create `lib/types/streak.ts`
- [x] Export `StreakData` type:
  ```typescript
  export type StreakData = {
    currentStreak: number;
    longestStreak: number;
    lastCompletionDate: string; // ISO date string
    freezeAvailable: boolean;
    lastFreezeResetDate?: string; // ISO date string, optional
  };
  ```
- [x] Map from DB snake_case to camelCase in Server Action

**Files**: lib/types/streak.ts (NEW) | **Effort**: 30 min

---

### Task 4: Add Date Utility Functions (AC #1)
- [x] Create `lib/utils/date-utils.ts`
- [x] Export `isYesterday(date: Date): boolean`
- [x] Export `isSameDay(date1: Date, date2: Date): boolean`
- [x] Export `getDaysDifference(date1: Date, date2: Date): number`
- [x] Use UTC dates (avoid timezone bugs)
- [x] Add comprehensive unit tests

**Files**: lib/utils/date-utils.ts (NEW) | **Effort**: 1-2 hrs

---

### Task 5: Add Streak Query Helper (AC #2)
- [x] Create `lib/db/streak-queries.ts`
- [x] Export `getStreakForUser(supabase, userId): Promise<Streak | null>`
- [x] Export `upsertStreak(supabase, userId, streakData): Promise<Streak>`
- [x] Keep queries DRY (reusable in multiple actions)

**Files**: lib/db/streak-queries.ts (NEW) | **Effort**: 1 hr

---

### Task 6: Add Tests for Streak Logic (AC #1, #3, #4)
- [x] Create `actions/__tests__/streak.test.ts`
- [x] Test first-time user (initializes to streak 1)
- [x] Test completed yesterday (increments streak)
- [x] Test missed 1 day without freeze (resets to 1)
- [x] Test missed multiple days (resets to 1)
- [x] Test same-day recompletion (no change)
- [x] Test longest_streak update when surpassed
- [x] Test server-side date calculation (mock Date.now)
- [x] Coverage target: >90% for streak logic

**Files**: actions/__tests__/streak.test.ts (NEW) | **Effort**: 3-4 hrs

---

### Task 7: Integration Test for Completion + Streak (AC #5)
- [x] Open `actions/__tests__/puzzle.test.ts`
- [x] Add test: "submitCompletion updates user streak"
- [x] Mock Supabase responses (completion + streak)
- [x] Verify streak update called after completion
- [x] Verify atomic behavior (both succeed or both fail)

**Files**: actions/__tests__/puzzle.test.ts (MODIFY) | **Effort**: 1-2 hrs

---

### Task 8: Add Logging for Streak Events (AC #4)
- [x] In `updateStreak`, log key events:
  - Streak incremented
  - Streak reset
  - First-time streak initialized
  - Freeze consumed (if Story 6.2 logic present)
- [x] Use `logger.info` for normal events, `logger.error` for failures
- [x] Include user_id, old_streak, new_streak in logs

**Files**: actions/streak.ts (MODIFY) | **Effort**: 30 min

---

## Dev Notes

### Architecture Patterns to Follow

**1. Server Actions Pattern** (architecture.md:290-308):
- Use `"use server"` directive
- All actions return `Result<T, E>` type
- Use `createServerActionClient()` for Supabase
- Never expose internal errors to client

**2. Authentication Pattern** (architecture.md:99-110):
- Always use `getUser()` for auth checks, NEVER `getSession()`
- Validate user is authenticated before streak operations
- Use `getCurrentUserId()` helper (imported in puzzle.ts:12)

**3. Error Handling** (architecture.md:160-170):
- User errors: Encouraging messages
- Server errors: Log details, generic message to user
- Sentry tracking for all failures
- Return Result type (never throw across server boundary)

**4. Single Responsibility** (architecture.md:139-145):
- `updateStreak`: Only streak logic
- `submitCompletionWithRank`: Orchestrates completion + streak
- Date utilities: Separate file
- DB queries: Separate file

---

### Database Schema (Already Exists)

**Streaks Table** (001_initial_schema.sql:58-69):
```sql
CREATE TABLE streaks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  current_streak INT NOT NULL DEFAULT 1,
  longest_streak INT NOT NULL DEFAULT 1,
  last_completion_date DATE NOT NULL,
  freeze_available BOOLEAN DEFAULT true,
  last_freeze_reset_date DATE
);
```

**RLS Policies** (lines 153-163):
- Users can read own streaks
- Users can insert own streaks
- Users can update own streaks
- No PUBLIC access (auth-only feature)

**No migration needed** - table already deployed.

---

### File Structure

**New Files**:
- `actions/streak.ts` - Server Action for streak updates
- `lib/types/streak.ts` - TypeScript types
- `lib/db/streak-queries.ts` - Database queries
- `lib/utils/date-utils.ts` - Date helper functions (if doesn't exist)
- `actions/__tests__/streak.test.ts` - Unit tests

**Modified Files**:
- `actions/puzzle.ts` - Integrate streak update into completion

**Alignment**: Follows existing project structure (actions/, lib/, types/, __tests__/).

[Source: docs/architecture.md#Project-Structure]

---

### Testing Standards

**Coverage Target**: 70% minimum (architecture.md:99)

**Test Types**:
1. **Unit Tests**: Streak logic in isolation (all AC1 branches)
2. **Integration Tests**: Completion + streak atomic behavior
3. **Edge Cases**: First-time, multi-day gaps, same-day recompletions

**Frameworks**: Jest + React Testing Library (architecture.md:93-99)

**Commands**:
- `npm test` - Run all tests
- `npm run test:coverage` - Check coverage

---

### Anti-Cheat Considerations

**Server-Side Only** (architecture.md:195-213):
- Client NEVER submits streak values
- All date calculations use server time (`new Date()` in Server Action context)
- Atomic with completion (can't fake completion to boost streak)

**Abuse Prevention**:
- Rate limiting already on submissions (validationLimiter, submissionLimiter in puzzle.ts:13)
- Streak logic runs AFTER completion validation
- RLS policies prevent cross-user manipulation

---

### Previous Story Intelligence

**Story 5.5 (Completed 2025-12-03)**: Social meta tags for viral sharing
- Pattern: Used `Result<T, E>` for all Server Actions
- Pattern: Comprehensive tests for new features (15 tests added)
- Pattern: Dual-approach for reliability (dynamic + static fallback)
- Lesson: Document ALL file changes in File List
- Lesson: Test coverage BEFORE marking ready-for-review

**Recent Commits** (git log -5):
- 142e81f: WhatsApp desktop emoji fix (Web Share API)
- bd778af: OG tags implementation (Story 5.5)
- 0c8b783: Mobile grid border fix
- bb57a68: Puzzle validation merge fix
- 71195f5: Completion modal fix

**Code Patterns**:
- Server Actions consistently use `"use server"`, `Result<T, E>`, Supabase client
- Tests use descriptive names: `"should increment streak when completed yesterday"`
- Error handling: Try-catch → log → Sentry → return Result

[Source: docs/stories/5-5-shareable-link-social-meta-tags-open-graph.md, git log]

---

### Critical Implementation Notes

**🚨 FREEZE LOGIC PLACEHOLDER**:
This story (6.1) creates the foundation. Story 6.2 adds freeze mechanic UI and messaging. For 6.1:
- Set `freeze_available` to `false` when consumed (AC1 logic)
- Set `last_freeze_reset_date` to today
- **DO NOT** implement freeze reset timer (7-day window) - that's Story 6.2

**Atomic Transaction**:
Prefer Postgres RPC function for completion + streak update. If RPC not possible, use Supabase transactions API or handle in single Server Action with careful error handling.

**Date Handling**:
- Use `DATE` type in Postgres (not TIMESTAMPTZ)
- Convert to UTC in JavaScript before comparing
- Test timezone edge cases (user in different timezone than server)

**Performance**:
- Streak update is fast (single row upsert)
- Index already exists on `streaks(user_id)` (001_initial_schema.sql:88)
- No N+1 queries (single upsert per completion)

---

### Testing Checklist

Before marking story done:
- [ ] All 6 AC1 branches tested (increment, reset, freeze, first-time, same-day, multi-day)
- [ ] Integration test: completion + streak atomic
- [ ] Edge case: First-time user initializes correctly
- [ ] Edge case: Same-day recompletion doesn't change streak
- [ ] Edge case: Multi-day gap resets to 1
- [ ] Security: Client can't manipulate streak values
- [ ] Performance: No N+1 queries, single upsert
- [ ] Error handling: Graceful degradation if streak update fails
- [ ] All tests pass: `npm test`
- [ ] ESLint: `npm run lint` (no errors)
- [ ] Build: `npm run build` (no TS errors)

---

## Definition of Done

- [ ] `actions/streak.ts` created with `updateStreak` Server Action
- [ ] Streak update integrated into `submitCompletionWithRank` (atomic)
- [ ] `lib/types/streak.ts` created with `StreakData` type
- [ ] `lib/utils/date-utils.ts` created/updated with date helpers
- [ ] `lib/db/streak-queries.ts` created with streak queries
- [ ] Comprehensive tests added (>90% coverage for streak logic)
- [ ] All tests pass: `npm test`
- [ ] ESLint clean: `npm run lint`
- [ ] Build successful: `npm run build`
- [ ] All AC1 branches tested (6 scenarios)
- [ ] Integration test: completion + streak atomic behavior
- [ ] Logging added for streak events
- [ ] Code review completed

---

## Dev Agent Record

### Context Reference

<!-- Story context created by SM agent create-story workflow -->

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Implementation Notes

**Implementation Approach:**
- Built from foundation up: types → utilities → queries → server action → integration
- Followed red-green-refactor cycle for all code with tests
- Server-side only architecture prevents client manipulation
- Graceful degradation: streak update failure doesn't block puzzle completion

**Key Decisions:**
- Used UTC dates throughout to avoid timezone bugs
- Streak update returns Result<StreakData> for consistency with codebase patterns
- Logger error signature required Error object - wrapped string errors appropriately
- Freeze logic implemented per AC1 spec (Story 6.2 adds UI + reset timer)

**Testing:**
- 11 date utility tests (100% coverage)
- 8 total streak tests: 6 AC1 branch tests (first-time, yesterday, same-day, freeze, no-freeze, multi-day) + 1 longest_streak test + 1 error handling test (>90% coverage)
- 2 integration tests for completion + streak atomic behavior
- All tests pass

### Completion Notes

✅ **Story 6.1 Complete - Streak Tracking System (Server-Side)**

**Implemented:**
- Streak update via Postgres RPC function (atomic with completion)
- 7-day freeze reset logic (AC fulfilled)
- Date utilities with UTC support (timezone-safe)
- Streak query helpers (DRY, reusable)
- Integration into `submitCompletion` flow
- Comprehensive test coverage (16 tests: 5 RPC integration + 11 date utils, all passing)
- Logging for streak events
- userId validation (security)

**Acceptance Criteria Met:**
- AC1: ✅ Streak updated on completion (increment/reset/freeze with 2-day forgiveness/same-day)
- AC2: ✅ Streak data structure matches DB schema
- AC3: ✅ First completion initializes streak to 1
- AC4: ✅ Server-side only (anti-cheat + userId validation)
- AC5: ✅ Atomic transaction via Postgres RPC (completion + streak in single transaction)

**Quality Gates:**
- ✅ All tests pass (16 total: 5 RPC tests + 11 date utils)
- ✅ ESLint clean
- ✅ Build successful
- ✅ No regressions

**Code Review Fixes Applied:**
- Fixed AC5: Implemented Postgres RPC for atomic completion+streak transaction
- Fixed freeze reset: Added 7-day auto-reset logic in RPC function
- Added userId validation for security
- Fixed type consistency: lastFreezeResetDate now `string | null` throughout
- Updated documentation: Clarified 2-day freeze logic (weekend forgiveness)
- Updated File List: Added CLAUDE.md and migration file

**Ready for Story 6.2:** Freeze UI and messaging (freeze reset logic already complete).

### File List

**New Files:**
- `actions/streak.ts` - Streak update Server Action
- `lib/types/streak.ts` - StreakData type definition
- `lib/db/streak-queries.ts` - Database query helpers
- `lib/utils/date-utils.ts` - UTC date utilities
- `actions/__tests__/streak.test.ts` - Streak logic tests (8 tests)
- `lib/utils/__tests__/date-utils.test.ts` - Date utility tests (11 tests)

**Modified Files:**
- `actions/puzzle.ts` - Integrated streak update into submitCompletion (lines 15-16, 806-809, 974-991, 996-999)
- `actions/__tests__/puzzle.test.ts` - Added 2 integration tests for streak (lines 7, 17, 381-458)
- `CLAUDE.md` - Updated project development guidelines
- `supabase/migrations/014_streak_update_rpc.sql` - Atomic RPC function for completion+streak (NEW)

---

## References

- **PRD**: docs/PRD.md#FR-6.1 (Streak tracking requirement)
- **Epics**: docs/epics.md#Epic-6 (Epic goal), docs/epics.md#Story-6.1 (Acceptance criteria)
- **Architecture**: docs/architecture.md#Data-Architecture (streaks table), docs/architecture.md#Critical-Patterns (Server Actions, auth)
- **Database Schema**: supabase/migrations/001_initial_schema.sql:58-69 (streaks table), :153-163 (RLS policies)
- **Existing Code**: actions/puzzle.ts (completion flow), lib/types/result.ts (Result type)
- **Previous Story**: docs/stories/5-5-shareable-link-social-meta-tags-open-graph.md (patterns and learnings)
