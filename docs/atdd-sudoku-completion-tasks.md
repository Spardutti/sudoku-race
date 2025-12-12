# Implementation Tasks

Detailed task breakdown for making E2E tests pass (RED → GREEN).

**Recommended order:** Guest flow → data-testids → share → auth flow → persistence

---

## Task 1: Basic Completion Flow

**Test:** `tests/e2e/sudoku-completion-guest.spec.ts:18`

**Goal:** Guest user completes puzzle and sees completion time

### Subtasks

- [ ] Add `data-testid="sudoku-grid"` to SudokuGrid component
- [ ] Add `data-testid="start-puzzle-button"` to StartScreen component
- [ ] Add `data-testid="sudoku-cell-{row}-{col}"` to each SudokuCell
- [ ] Add `aria-readonly` attribute to cells (true for givens, false for editable)
- [ ] Add `data-testid="number-pad-{value}"` to NumberPad buttons (1-9)
- [ ] Add `data-testid="submit-button"` to SubmitButton component
- [ ] Add `data-testid="completion-modal"` to CompletionModal Dialog
- [ ] Add `data-testid="completion-time"` to completion time display
- [ ] Ensure completion time format is MM:SS
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-guest.spec.ts:18`
- [ ] ✅ Test passes

**Files to modify:**
- `components/puzzle/SudokuGrid.tsx`
- `components/puzzle/SudokuCell.tsx`
- `components/puzzle/StartScreen.tsx`
- `components/puzzle/NumberPad.tsx`
- `components/puzzle/SubmitButton.tsx`
- `components/puzzle/CompletionModal.tsx`

**Effort:** 2-3 hours

---

## Task 2: Hypothetical Rank Display

**Test:** `tests/e2e/sudoku-completion-guest.spec.ts:33`

**Goal:** Guest user sees hypothetical rank message

### Subtasks

- [ ] Add `data-testid="hypothetical-rank-message"` to hypothetical rank section
- [ ] Ensure `getHypotheticalRank` API call works for guest users
- [ ] Display message: "Nice time! You'd be rank #X if you signed in"
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-guest.spec.ts:33`
- [ ] ✅ Test passes

**Files to modify:**
- `components/puzzle/CompletionModal.tsx`
- `actions/leaderboard.ts` (verify getHypotheticalRank exists)

**Effort:** 1-2 hours

---

## Task 3: Sign-In Prompt

**Test:** `tests/e2e/sudoku-completion-guest.spec.ts:46`

**Goal:** Guest user sees sign-in prompt

### Subtasks

- [ ] Add `data-testid="sign-in-prompt"` to sign-in prompt container
- [ ] Add `data-testid="sign-in-button"` to sign-in button
- [ ] Ensure prompt only shows for guest users (`!isAuthenticated`)
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-guest.spec.ts:46`
- [ ] ✅ Test passes

**Files to modify:**
- `components/puzzle/CompletionModal.tsx`

**Effort:** 1 hour

---

## Task 4: Emoji Grid Visualization

**Test:** `tests/e2e/sudoku-completion-guest.spec.ts:58`

**Goal:** Share preview displays emoji grid

### Subtasks

- [ ] Add `data-testid="share-preview"` to share text preview section
- [ ] Ensure `generateEmojiGrid` is called with puzzle and solvePath
- [ ] Display emoji grid in preview (🟩🟨🟦 emojis)
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-guest.spec.ts:58`
- [ ] ✅ Test passes

**Files to modify:**
- `components/puzzle/CompletionModal.tsx`
- `lib/utils/emoji-grid.ts` (verify exists)

**Effort:** 1 hour

---

## Task 5: Copy to Clipboard

**Test:** `tests/e2e/sudoku-completion-guest.spec.ts:70`

**Goal:** Copy share text to clipboard

### Subtasks

- [ ] Add `data-testid="copy-clipboard-button"` to clipboard button
- [ ] Implement `navigator.clipboard.writeText` functionality
- [ ] Show "Copied!" feedback when successful
- [ ] Include puzzle number, time, emoji grid, URL in clipboard text
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-guest.spec.ts:70`
- [ ] ✅ Test passes

**Files to modify:**
- `components/puzzle/CompletionModal.tsx`

**Effort:** 1-2 hours

---

## Task 6: Twitter Share

**Test:** `tests/e2e/sudoku-completion-guest.spec.ts:89`

**Goal:** Open Twitter share window

### Subtasks

- [ ] Add `data-testid="twitter-share-button"` to Twitter button
- [ ] Implement `openTwitterShare` function (Twitter intent URL)
- [ ] Generate share text with emoji grid
- [ ] Handle popup blockers gracefully
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-guest.spec.ts:89`
- [ ] ✅ Test passes

**Files to modify:**
- `components/puzzle/CompletionModal.tsx`
- `lib/utils/share.ts` (verify openTwitterShare exists)

**Effort:** 1 hour

---

## Task 7: WhatsApp Share

**Test:** `tests/e2e/sudoku-completion-guest.spec.ts:104`

**Goal:** Open WhatsApp share window

### Subtasks

- [ ] Add `data-testid="whatsapp-share-button"` to WhatsApp button
- [ ] Implement `openWhatsAppShare` function (WhatsApp URL)
- [ ] Generate share text with emoji grid
- [ ] Handle popup blockers gracefully
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-guest.spec.ts:104`
- [ ] ✅ Test passes

**Files to modify:**
- `components/puzzle/CompletionModal.tsx`
- `lib/utils/share.ts` (verify openWhatsAppShare exists)

**Effort:** 1 hour

---

## Task 8: Close Modal

**Test:** `tests/e2e/sudoku-completion-guest.spec.ts:119`

**Goal:** Close completion modal

### Subtasks

- [ ] Add `data-testid="completion-modal-close"` to close button
- [ ] Ensure clicking close calls `onClose` handler
- [ ] Modal hides when closed
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-guest.spec.ts:119`
- [ ] ✅ Test passes

**Files to modify:**
- `components/puzzle/CompletionModal.tsx`

**Effort:** 30 minutes

---

## Task 9: Authenticated User Rank

**Test:** `tests/e2e/sudoku-completion-authenticated.spec.ts:41`

**Goal:** Authenticated user sees actual rank

### Subtasks

- [ ] Add `data-testid="user-rank"` to rank display
- [ ] Ensure `rank` prop passed to CompletionModal for auth users
- [ ] Display rank in format "#123"
- [ ] Do NOT show hypothetical rank for auth users
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-authenticated.spec.ts:41`
- [ ] ✅ Test passes

**Files to modify:**
- `components/puzzle/CompletionModal.tsx`
- `components/puzzle/PuzzlePageClient.tsx` (pass rank prop)

**Effort:** 1 hour

---

## Task 10: Streak Display

**Test:** `tests/e2e/sudoku-completion-authenticated.spec.ts:54`

**Goal:** Display current streak

### Subtasks

- [ ] Add `data-testid="streak-display"` to streak section
- [ ] Pass `streakData` prop to CompletionModal
- [ ] Display streak count with fire emoji (e.g., "3 day streak 🔥")
- [ ] Only show if `currentStreak > 0`
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-authenticated.spec.ts:54`
- [ ] ✅ Test passes

**Files to modify:**
- `components/puzzle/CompletionModal.tsx`
- `components/puzzle/PuzzlePageClient.tsx` (pass streakData)

**Effort:** 1-2 hours

---

## Task 11: Freeze Tooltip

**Test:** `tests/e2e/sudoku-completion-authenticated.spec.ts:68`

**Goal:** Show freeze status in tooltip

### Subtasks

- [ ] Add `data-testid="freeze-tooltip"` to Tooltip content
- [ ] Wrap streak display with Tooltip component
- [ ] Show appropriate message:
  - "Freeze ready" if `freezeAvailable`
  - "Freeze used to protect streak" if `freezeWasUsed`
  - "Complete tomorrow to maintain streak" otherwise
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-authenticated.spec.ts:68`
- [ ] ✅ Test passes

**Files to modify:**
- `components/puzzle/CompletionModal.tsx`

**Effort:** 1 hour

---

## Task 12: Streak in Share Text

**Test:** `tests/e2e/sudoku-completion-authenticated.spec.ts:81`

**Goal:** Include streak in share text

### Subtasks

- [ ] Pass `streakData.currentStreak` to `generateEmojiShareText`
- [ ] Include streak count in share text if > 0
- [ ] Format: "3 day streak!" or similar
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-authenticated.spec.ts:81`
- [ ] ✅ Test passes

**Files to modify:**
- `lib/utils/share-text.ts` (modify generateEmojiShareText)
- `components/puzzle/CompletionModal.tsx`

**Effort:** 1 hour

---

## Task 13: No Sign-In Prompt for Auth Users

**Test:** `tests/e2e/sudoku-completion-authenticated.spec.ts:97`

**Goal:** Sign-in prompt hidden for auth users

### Subtasks

- [ ] Ensure `isAuthenticated` prop correctly differentiates guest vs auth
- [ ] Conditionally render sign-in prompt: only if `!isAuthenticated`
- [ ] Test verifies prompt NOT visible
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-authenticated.spec.ts:97`
- [ ] ✅ Test passes

**Files to modify:**
- `components/puzzle/CompletionModal.tsx`

**Effort:** 30 minutes

---

## Task 14: Persist Completion Data

**Test:** `tests/e2e/sudoku-completion-authenticated.spec.ts:110`

**Goal:** Save completion with rank to database

### Subtasks

- [ ] Create/update API endpoint `POST /api/puzzle/submit`
- [ ] Accept: puzzleId, completionTime, userId
- [ ] Calculate rank based on completion time vs other users
- [ ] Store completion record in database with rank
- [ ] Return rank in API response
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-authenticated.spec.ts:110`
- [ ] ✅ Test passes

**Files to create/modify:**
- `app/api/puzzle/submit/route.ts` (or similar)
- Database queries for rank calculation
- Supabase migration if needed

**Effort:** 3-4 hours

---

## Task 15: Difficulty in Share Text

**Test:** `tests/e2e/sudoku-completion-authenticated.spec.ts:127`

**Goal:** Include difficulty in share preview

### Subtasks

- [ ] Pass `difficulty` prop to CompletionModal
- [ ] Include difficulty in share text generation
- [ ] Format: "Sudoku #123 (Easy)" or similar
- [ ] Display in share preview
- [ ] Run test: `npm run test:e2e tests/e2e/sudoku-completion-authenticated.spec.ts:127`
- [ ] ✅ Test passes

**Files to modify:**
- `components/puzzle/CompletionModal.tsx`
- `lib/utils/share-text.ts`

**Effort:** 1 hour

---

## Summary

**Total Tasks:** 15
**Estimated Total Effort:** 18-24 hours
**Components to Modify:** 8 files
**New API Endpoints:** 1 (puzzle submission with rank)

**Quick Wins (do first):**
- Tasks 1-3: Basic flow + data-testids (4-6 hours)
- Tasks 4-8: Share functionality (4-5 hours)

**Complex Tasks (do later):**
- Task 14: Database persistence with rank (3-4 hours)
- Task 10-12: Streak logic (3-4 hours)

---

## Progress Tracking

Track completion in your story management system or sprint-status.yaml.

Check off tasks as you complete them and tests pass (GREEN).
