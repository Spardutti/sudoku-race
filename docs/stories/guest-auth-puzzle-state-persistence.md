# Story: Persist Puzzle State During Guest-to-Authenticated Transition

**Epic**: Authentication & User Experience
**Priority**: High
**Estimated Effort**: Medium

## Problem Statement

When a user starts a puzzle as a guest and then signs in (either mid-puzzle or after completion via the CompletionModal), the puzzle state is reset and they lose all progress, forcing them to start over. This creates a frustrating user experience and discourages authentication.

### Current Behavior

1. **Mid-Puzzle Sign-In**: Guest starts puzzle → makes progress → clicks "Sign In" → completes OAuth → returns to puzzle → **state is reset, progress lost**
2. **Post-Completion Sign-In**: Guest completes puzzle → CompletionModal shows → clicks "Sign In" → completes OAuth → **completion lost, puzzle reset**

### Root Cause Analysis

**Location**: `components/puzzle/PuzzlePageClient.tsx:61,76`

```typescript
const userId = initialUserId || null;  // Line 61 - SSR prop, never updates
const isLoading = useStateRestoration(!!userId, puzzle.id);  // Line 76
```

**The Issue**:
- `initialUserId` is set once during server-side rendering
- When user signs in client-side, this prop does NOT update
- `useStateRestoration` hook depends on `!!userId` which remains `false`
- After OAuth redirect, the component re-renders but with guest state (no userId)
- Guest localStorage state is already cleared by migration process
- Result: No state to restore from, puzzle appears fresh

**Supporting Evidence**:
- `lib/hooks/useStateRestoration.ts:61-100` - Only loads from server if `isAuthenticated === true`
- `app/[locale]/(auth)/auth/callback/route.ts:149` - Clears localStorage after migration
- OAuth flow doesn't update client-side component props dynamically

---

## Acceptance Criteria

### AC1: Mid-Puzzle Guest-to-Auth Transition Preserves State
**Given** a guest user is actively solving a puzzle
**When** they click "Sign In" and complete authentication
**Then** upon return to the puzzle page, all of the following are preserved:
- Cell entries (`userEntries`)
- Elapsed time (`elapsedTime`)
- Pencil marks (`pencilMarks`)
- Selected cell position (`selectedCell`)
- Timer state (started/paused)
- Solve path history (`solvePath`)

**Validation**:
- [ ] Manual test: Start puzzle as guest, fill 20 cells, sign in, verify cells remain
- [ ] Manual test: Start puzzle, pause timer, sign in, verify timer stays paused with correct elapsed time
- [ ] Manual test: Add pencil marks to 5 cells, sign in, verify all marks preserved

---

### AC2: Post-Completion Auth Transition Preserves Completion
**Given** a guest user completes a puzzle
**When** the CompletionModal appears and they click "Sign In"
**Then** after authentication:
- Completion status remains `true`
- Completion time is preserved and saved to server
- Leaderboard rank is calculated and displayed
- The CompletionModal re-appears showing their authenticated rank
- Puzzle grid shows completed state (not reset)

**Validation**:
- [ ] Manual test: Complete puzzle as guest, sign in from modal, verify completion persists
- [ ] Manual test: Verify rank is calculated and shown after auth
- [ ] Manual test: Navigate away and back, verify puzzle still shows as completed
- [ ] Database check: Verify completion is saved in `completions` table with correct time

---

### AC3: Client-Side Auth State Reactivity
**Given** the puzzle page is loaded
**When** authentication state changes (guest → authenticated OR authenticated → signed out)
**Then** the puzzle component:
- Detects the auth state change within 500ms
- Updates internal `userId` state to reflect current user
- Triggers state restoration from appropriate source (server for auth, localStorage for guest)
- Enables/disables auto-save based on auth status

**Technical Requirements**:
- Replace static `initialUserId` prop with reactive auth state from `useAuthState` hook
- `useStateRestoration` must re-run when auth state changes
- `useAutoSave` must activate/deactivate based on current auth status

**Validation**:
- [ ] Code review: Verify `useAuthState` hook is used instead of `initialUserId` prop
- [ ] Unit test: Mock auth state change, verify `useStateRestoration` is called with new value
- [ ] Manual test: Open puzzle in Tab A, sign in in Tab B, verify Tab A updates auth state

---

### AC4: Migration Flow Maintains State Continuity
**Given** the guest-to-auth migration process
**When** OAuth callback migrates guest data to server
**Then**:
- Guest state is migrated to server BEFORE localStorage is cleared
- Migration includes all state fields (entries, time, marks, solve path)
- Redirect back to puzzle page triggers server state restoration
- No state is lost during the transition

**Technical Requirements**:
- Verify `migrate-guest-data` API includes all necessary fields
- Ensure migration happens atomically (all or nothing)
- Add migration status tracking to detect failures

**Validation**:
- [ ] Code review: Verify migration includes `userEntries`, `pencilMarks`, `solvePath`, `elapsedTime`
- [ ] Manual test: Complete puzzle, sign in, verify server has all data
- [ ] Error test: Simulate migration failure, verify user is notified and state preserved in localStorage

---

### AC5: Auto-Save Activation on Auth Change
**Given** a user transitions from guest to authenticated
**When** the auth state updates
**Then**:
- Auto-save to server is immediately enabled
- Subsequent puzzle edits trigger debounced server saves (500ms)
- Save failures show appropriate user feedback

**Current Bug**: `components/puzzle/PuzzlePageClient.tsx:77` - `useAutoSave(false)` hardcoded

**Validation**:
- [ ] Code review: Verify `useAutoSave(!!userId)` or equivalent reactive logic
- [ ] Manual test: Sign in mid-puzzle, make edit, verify network request to save endpoint
- [ ] Manual test: Disconnect network, make edit, verify error toast appears

---

## Technical Design

### Files to Modify

#### 1. `components/puzzle/PuzzlePageClient.tsx`
**Changes**:
```typescript
// BEFORE (Lines 61, 76-77)
const userId = initialUserId || null;
const isLoading = useStateRestoration(!!userId, puzzle.id);
useAutoSave(false);

// AFTER
const { user } = useAuthState();  // Import from lib/hooks/useAuthState
const userId = user?.id || null;
const isLoading = useStateRestoration(!!userId, puzzle.id);
useAutoSave(!!userId);  // Reactive based on current auth state
```

**Impact**: Makes auth state reactive to client-side changes

---

#### 2. `lib/hooks/useStateRestoration.ts`
**Changes**:
- Add effect dependency on `isAuthenticated` to re-trigger when it changes
- Add logging for auth state transitions
- Handle case where guest state exists but user just authenticated

**Pseudo-code**:
```typescript
useEffect(() => {
  // Existing logic...

  // NEW: If transitioning from guest to auth mid-session
  if (isAuthenticated && !previousAuthRef.current) {
    logger.info("Auth state changed to authenticated, reloading from server");
    // Trigger server load even if local state exists
  }

  previousAuthRef.current = isAuthenticated;
}, [isAuthenticated, puzzleId]); // Add isAuthenticated to deps
```

---

#### 3. `lib/auth/migrate-guest-data.ts`
**Verification Required**: Ensure migration includes ALL fields

Fields to verify:
- ✅ `userEntries` (Line 103)
- ✅ `completionTime`
- ✅ `isCompleted`
- ⚠️ `pencilMarks` - **Check if included**
- ⚠️ `solvePath` - **Check if included**
- ⚠️ `elapsedTime` - **Check if included**
- ⚠️ `isPaused`/`pausedAt` - **Check if included**

**Action**: Add missing fields to `completion_data` JSON object

---

#### 4. `app/[locale]/(auth)/auth/callback/route.ts`
**Potential Enhancement** (Optional):
- Add migration status to redirect URL params
- Pass migrated state as query param for immediate client restoration
- Example: `/?migration=success&puzzleId=abc&restored=true`

---

### Migration Data Schema

**Current** (`completions` table):
```typescript
{
  completion_data: {
    userEntries: number[][]
  }
}
```

**Required** (expanded):
```typescript
{
  completion_data: {
    userEntries: number[][],
    pencilMarks: Record<string, number[]>,
    solvePath: Array<{
      row: number;
      col: number;
      value: number;
      timestamp: number;
      isCorrect: boolean;
    }>,
    elapsedTime: number,
    isPaused: boolean,
    pausedAt: number | null
  }
}
```

---

## Testing Strategy

### Unit Tests

**File**: `lib/hooks/__tests__/useStateRestoration.test.ts` (create if missing)

Tests:
1. When `isAuthenticated` changes from `false` to `true`, hook calls `loadProgress`
2. When `isAuthenticated` is `false`, hook uses localStorage state
3. When migration clears localStorage, authenticated user loads from server
4. When auth state changes mid-session, state is not lost

---

### Integration Tests

**File**: `__tests__/integration/auth-transition.test.ts` (create)

Tests:
1. Complete guest puzzle flow → sign in → verify completion in database
2. Mid-puzzle guest → sign in → verify state restored from server
3. Sign in from CompletionModal → verify modal re-renders with auth rank

---

### Manual Test Checklist

- [ ] **Scenario 1**: Guest solves 50% → signs in → progress preserved
- [ ] **Scenario 2**: Guest completes puzzle → signs in from modal → completion saved
- [ ] **Scenario 3**: Guest pauses timer → signs in → timer state preserved
- [ ] **Scenario 4**: Guest adds pencil marks → signs in → marks preserved
- [ ] **Scenario 5**: Signed-in user in Tab A, sign out in Tab B → Tab A detects logout
- [ ] **Scenario 6**: Network failure during migration → user notified, can retry

---

## Edge Cases

### Edge Case 1: Concurrent Puzzle Edits During Migration
**Scenario**: User makes puzzle edit while OAuth redirect is processing
**Solution**: Queue edits in local state, flush to server after migration completes

### Edge Case 2: Migration Failure
**Scenario**: Server error during `migrate-guest-data` call
**Solution**: Keep localStorage intact, show error toast, allow retry

### Edge Case 3: User Completes Puzzle During OAuth Flow
**Scenario**: User opens puzzle in Tab A, completes in Tab B while Tab A is mid-OAuth
**Solution**: On return to Tab A, detect completion and show CompletionModal

### Edge Case 4: Stale initialUserId on SPA Navigation
**Scenario**: User signs in, navigates to new puzzle, `initialUserId` is from old page load
**Solution**: Use client-side `useAuthState` instead of SSR prop

---

## Success Metrics

**Pre-Implementation Baseline**:
- Auth conversion rate from CompletionModal: ~X% (measure current)
- User complaints about lost progress: Track in support tickets

**Post-Implementation Targets**:
- Zero reports of lost progress after sign-in
- Auth conversion rate increase of 15%+
- 100% of guest completions successfully migrated

---

## Rollback Plan

**If issues arise**:
1. Feature flag: `ENABLE_REACTIVE_AUTH_STATE` (default: true)
2. Revert to SSR `initialUserId` prop if critical bug found
3. Gradual rollout: 10% → 50% → 100% over 3 days

---

## Dependencies

- Requires `useAuthState` hook (already exists: `lib/hooks/useAuthState.ts`)
- Requires `migrate-guest-data` API (already exists: `app/api/auth/migrate-guest-data/route.ts`)
- Database migration if `completion_data` schema changes (if adding new fields)

---

## Out of Scope

- Multi-device sync (guest starts on mobile, continues on desktop as authenticated)
- Offline-first architecture with conflict resolution
- Real-time puzzle collaboration

---

## Implementation Tasks

- [ ] **Task 1**: Replace `initialUserId` prop with `useAuthState` in `PuzzlePageClient`
- [ ] **Task 2**: Make `useAutoSave` reactive to auth state changes
- [ ] **Task 3**: Update `useStateRestoration` to handle mid-session auth changes
- [ ] **Task 4**: Audit and expand `migrate-guest-data` to include all state fields
- [ ] **Task 5**: Add migration failure handling and retry logic
- [ ] **Task 6**: Write unit tests for auth state transitions
- [ ] **Task 7**: Write integration tests for complete guest→auth flow
- [ ] **Task 8**: Manual QA against all acceptance criteria
- [ ] **Task 9**: Add logging/analytics for migration success/failure rates
- [ ] **Task 10**: Update documentation with new auth flow diagrams

---

## Notes

- Current migration process works but has timing issues with localStorage clearing
- The OAuth callback HTML page uses embedded JavaScript to read localStorage - this is a clever approach but fragile
- Consider moving to a more robust client-side migration using service workers or IndexedDB for better reliability
- Auth state reactivity will fix 90% of reported issues with minimal changes
