# Bug Fix Story BF-2: Puzzle State Lost During Guest-to-Auth Transition

**Story ID**: BF-2
**Type**: Bug Fix
**Severity**: CRITICAL (Breaks auth conversion funnel)
**Story Key**: BF-2-guest-auth-state-loss
**Status**: ready-for-dev
**Created**: 2025-12-07

---

## User Story Statement

**As a** guest user who has made puzzle progress
**I want** my progress preserved when I sign in
**So that** I don't lose my work and can save it to my account

**Current Behavior**: When guest signs in, ALL progress is lost - puzzle resets to empty state

**Expected Behavior**: All puzzle state persists through guest→auth transition

---

## Bug Description

### Critical Issues

1. **Mid-Puzzle Sign-In**: Guest fills 20 cells → signs in → **ALL CELLS GONE**
2. **Post-Completion Sign-In**: Guest completes puzzle → signs in from modal → **completion lost**

### Root Cause

**Location**: `components/puzzle/PuzzlePageClient.tsx:61,76-77`

```typescript
const userId = initialUserId || null;  // ❌ Static SSR prop, never updates client-side
const isLoading = useStateRestoration(!!userId, puzzle.id);
useAutoSave(false);  // ❌ HARDCODED - auto-save never activates!
```

**The Problem**:
- `initialUserId` is static from server-side render - doesn't detect client-side auth changes
- When user signs in, component doesn't know auth state changed
- `useStateRestoration(false)` only loads from localStorage (guest mode)
- OAuth callback migrates data to server, then clears localStorage
- Page redirects with no localStorage AND component still thinks user is guest
- Result: **No state to restore from**

**Impact**: CRITICAL - Blocks auth conversion, 100% data loss, no workaround

---

## Acceptance Criteria

### AC1: Auth State Reactivity

**Given** puzzle page loaded as guest
**When** user completes OAuth
**Then**:
- ✅ Component detects auth change within 500ms
- ✅ `userId` updates to authenticated user ID
- ✅ `useStateRestoration` re-triggers with authenticated state
- ✅ Server progress loaded via `loadProgress()`
- ✅ Auto-save activates

**Validation**: Replace `initialUserId` with `useAuthState()` hook, verify network request after sign-in

---

### AC2: Mid-Puzzle Progress Preservation

**Given** guest has filled cells, added pencil marks, paused timer
**When** they sign in
**Then** ALL state preserved:
- ✅ Cell entries, pencil marks, timer, solve path, selected cell

**Validation**: Fill 15 cells as guest, sign in, verify all cells remain

---

### AC3: Post-Completion Preservation

**Given** guest completes puzzle
**When** they sign in from CompletionModal
**Then**:
- ✅ Completion status true
- ✅ Time saved to database
- ✅ Leaderboard rank shown
- ✅ Modal re-appears with auth rank

**Validation**: Complete puzzle as guest, sign in from modal, verify completion persists

---

### AC4: Migration Data Completeness

**Given** migration process
**When** migrating localStorage to server
**Then** ALL fields migrated:
- ✅ userEntries, pencilMarks, solvePath, elapsedTime, isPaused, pausedAt, selectedCell

**Validation**: Audit `migrate-guest-data.ts`, verify all fields in `completion_data`

---

### AC5: Auto-Save Activation

**Given** user transitioned to authenticated
**When** they make edits
**Then**:
- ✅ Auto-save triggers (500ms debounce)
- ✅ Network request to saveProgress
- ✅ Database updates

**Validation**: Sign in, make edit, verify network tab shows POST request

---

## Tasks / Subtasks

### Task 1: Replace Static initialUserId with useAuthState

**Subtasks**:
- [ ] Import `useAuthState` in `PuzzlePageClient.tsx`
- [ ] Replace: `const userId = initialUserId` → `const { user } = useAuthState(); const userId = user?.id`
- [ ] Add logging for auth state changes
- [ ] Test sign-in detection

**AC**: AC1 | **Effort**: 30min

---

### Task 2: Fix Hardcoded useAutoSave(false)

**Subtasks**:
- [ ] Change line 77: `useAutoSave(false)` → `useAutoSave(!!userId)`
- [ ] Test auto-save activates after sign-in
- [ ] Verify database receives saves

**AC**: AC5 | **Effort**: 15min

---

### Task 3: Update useStateRestoration for Auth Changes

**Subtasks**:
- [ ] Add `previousAuthRef` to detect auth transitions
- [ ] Force server load when auth changes from false→true
- [ ] Add logging for auth state transitions

**AC**: AC1 | **Effort**: 45min

---

### Task 4: Audit migrate-guest-data Completeness

**Subtasks**:
- [ ] Review current migrated fields
- [ ] Add missing: pencilMarks, solvePath, isPaused, pausedAt, selectedCell
- [ ] Update `completion_data` schema
- [ ] Test all fields appear in database

**AC**: AC4 | **Effort**: 1hr

---

### Task 5: Migration Failure Handling

**Subtasks**:
- [ ] Wrap migration in try-catch
- [ ] Preserve localStorage on failure
- [ ] Redirect with `?migration=failed` param
- [ ] Show retry toast
- [ ] Test error scenario

**AC**: AC4 | **Effort**: 1hr

---

### Task 6: Unit Tests

**Subtasks**:
- [ ] Test: Component with guest→auth transition
- [ ] Test: `useStateRestoration` re-runs on auth change
- [ ] Test: `useAutoSave` activates when authenticated
- [ ] Run: `npm test`

**AC**: All | **Effort**: 1.5hr

---

### Task 7: Integration Test - Guest→Auth Flow

**Subtasks**:
- [ ] Test: Mid-puzzle sign-in preserves state
- [ ] Test: Post-completion sign-in preserves completion
- [ ] Verify migration success
- [ ] All tests passing

**AC**: All | **Effort**: 2hr

---

### Task 8: Manual QA

**Subtasks**:
- [ ] Test mid-puzzle sign-in (AC2)
- [ ] Test post-completion sign-in (AC3)
- [ ] Test auto-save activation (AC5)
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile browsers

**AC**: AC1-5 | **Effort**: 1.5hr

---

## Definition of Done

### Code Quality
- [ ] TypeScript strict mode
- [ ] ESLint passing
- [ ] Logging added

### Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual QA complete
- [ ] Coverage ≥80%

### Functionality
- [ ] Auth state reactive
- [ ] Auto-save activates
- [ ] Mid-puzzle progress preserved
- [ ] Post-completion preserved
- [ ] All state fields migrated

---

## Dev Notes

### Files to Modify

**Primary**:
- `components/puzzle/PuzzlePageClient.tsx` (lines 61, 77)
- `lib/hooks/useStateRestoration.ts` (auth transition detection)
- `lib/auth/migrate-guest-data.ts` (expand fields)

**Tests** (NEW):
- `components/puzzle/__tests__/PuzzlePageClient.auth.test.tsx`
- `lib/hooks/__tests__/useStateRestoration.auth-transition.test.ts`
- `__tests__/integration/guest-to-auth-flow.test.ts`

### Three-Line Fix (Core)

```typescript
// PuzzlePageClient.tsx
const { user } = useAuthState();           // Line 61 - Reactive auth
const userId = user?.id || null;
useAutoSave(!!userId);                     // Line 77 - Enable auto-save
```

### Migration Schema Expansion

Add to `completion_data` JSONB:
- pencilMarks, solvePath, isPaused, pausedAt, selectedCell

---

## References

- **Original**: docs/stories/guest-auth-puzzle-state-persistence.md
- **Auth Hook**: lib/hooks/useAuthState.ts
- **Migration**: lib/auth/migrate-guest-data.ts
- **OAuth Callback**: app/[locale]/(auth)/auth/callback/route.ts

---

## Dev Agent Record

**Agent**: claude-sonnet-4-5-20250929
**Converted from**: guest-auth-puzzle-state-persistence.md

**Root Cause**: Static SSR prop + hardcoded auto-save(false) + migration timing
**Fix**: Replace with reactive `useAuthState` hook

---
