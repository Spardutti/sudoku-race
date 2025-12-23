# Story FE.1: Puzzle Reset with Locked Numbers

**Story ID**: FE.1
**Category**: Feature Enhancement (Standalone)
**Story Key**: FE-1-puzzle-reset-lock-numbers
**Status**: ready-for-dev
**Created**: 2025-12-23

---

## User Story Statement

**As a** player working on a puzzle
**I want** to lock numbers I'm confident about and reset the rest
**So that** I can quickly retry different approaches without manually clearing cells or losing my confident placements

**Value**: After submitting with errors, manually clearing dozens of cells is tedious. Players often have some numbers they're certain about. This feature lets them mark those as "locked" and reset everything else with one tap, dramatically improving the error-recovery workflow.

---

## Requirements Context

### User Requirements

**Core Requirements:**
1. **Lock Toggle**: Similar to pencil marks toggle (Story 2.8), allow users to "lock" filled cells
2. **Visual Distinction**: Locked numbers should have different color to stand out
3. **Reset Button**: Clear all unlocked user entries (keep locked + initial clues)
4. **Persistence**: Lock state persists across sessions (database + localStorage, like pencil marks)
5. **Single Story**: Both features are tightly coupled (reset only useful with locks)

### Architecture Alignment

**State Management**:
- Extend `lib/stores/puzzleStore.ts` with lock state
- Store as `Record<string, boolean>` where key is `${row}-${col}`
- Persist via Zustand middleware (localStorage + database)
- Pattern mirrors pencil marks implementation (Story 2.8)

**Component Pattern**:
- LockToggle component for toggling lock mode
- Extend SudokuCell rendering for locked cell visual
- Reset button in PuzzleHeader (near submit button)
- Server Actions for persisting lock state (authenticated users)

### Dependencies

**Upstream** (All Complete):
- ✅ Story 2.2: SudokuGrid component
- ✅ Story 2.4: Zustand store with persistence
- ✅ Story 2.8: Pencil marks (toggle pattern reference)

---

## Acceptance Criteria

### AC1: Lock Toggle Button

**Given** I'm on the puzzle page
**When** the page renders
**Then**:
- Lock toggle button visible in puzzle header (lock icon 🔒)
- Default mode is "normal" (unlock mode)
- Clear visual state (highlight when active)
- Accessible (ARIA label, keyboard focus)

### AC2: Toggle Lock Mode

**Given** lock mode inactive
**When** I click toggle button
**Then**:
- Lock mode activates (visual feedback)
- Clicking filled cells now locks/unlocks them
- Clicking again deactivates lock mode

### AC3: Lock/Unlock Numbers

**Given** lock mode active and a filled cell selected
**When** I click the cell (or press 'L' key)
**Then**:
- Cell becomes locked (visual indicator)
- Clicking locked cell unlocks it (toggle)
- Empty cells cannot be locked
- Initial puzzle clues cannot be locked

### AC4: Visual Distinction for Locked Cells

**Given** a cell is locked
**When** the grid renders
**Then**:
- Locked cell has distinct background color (bg-blue-50)
- Locked number uses slightly bolder font weight
- Clear visual difference from unlocked entries and clues

### AC5: Reset Button Functionality

**Given** I have a mix of locked and unlocked entries
**When** I click the Reset button
**Then**:
- All unlocked user entries cleared
- All locked entries remain unchanged
- Pencil marks in unlocked cells cleared
- Pencil marks in locked cells preserved
- Timer continues running

### AC6: Reset Button Confirmation

**Given** I have unlocked entries
**When** I click Reset button
**Then**:
- Confirmation dialog appears
- "Cancel" closes dialog, no changes
- "Reset" executes reset logic
- If no unlocked entries, show toast: "No unlocked cells to reset"

### AC7: Persistence (LocalStorage)

**Given** I lock cells and refresh (guest user)
**When** page loads
**Then**:
- All locked cells restored with lock state
- Lock mode state restored

### AC8: Persistence (Database)

**Given** I lock cells (authenticated user)
**When** I return on different device
**Then**:
- All locked cells restored with lock state
- Saved via Supabase (cross-device sync)
- Falls back to localStorage if database fails

### AC9: Keyboard Shortcut

**Given** on desktop
**When** I press 'L' key
**Then**:
- If lock mode active + cell selected + cell filled: toggle lock on that cell
- If lock mode inactive: toggle lock mode on/off
- Visual feedback shows change

### AC10: Clear Cell Doesn't Unlock

**Given** a cell is locked
**When** I try to clear it (Backspace/Clear button)
**Then**:
- Cell value remains (locked cells are immutable)
- Optional: toast notification "Unlock cell first to edit"

---

## Tasks / Subtasks

### Task 1: Extend Puzzle Store

- [ ] Add to `PuzzleState`: `lockMode: boolean`, `lockedCells: Record<string, boolean>`
- [ ] Add actions: `toggleLockMode`, `toggleCellLock(row, col)`, `resetUnlockedCells`
- [ ] Modify `updateCell` to prevent editing locked cells
- [ ] Add lockedCells to persistence config
- [ ] Test store actions

**File**: `lib/stores/puzzleStore.ts`

### Task 2: Create Lock Toggle Button

- [ ] Create `components/puzzle/LockToggle.tsx`
- [ ] Lock icon with active/inactive styles
- [ ] ARIA labels and keyboard support
- [ ] Test rendering and toggle behavior

### Task 3: Grid Rendering for Locked Cells

- [ ] Modify `components/puzzle/SudokuCell.tsx`
- [ ] Add `isLocked` prop to cell rendering
- [ ] Apply locked styles: bg-blue-50, font-semibold
- [ ] Test locked vs unlocked vs clue cells

### Task 4: Lock/Unlock Interaction

- [ ] Update `SudokuGrid.tsx` to handle lock toggle clicks
- [ ] Add `onCellLockToggle` callback
- [ ] Implement 'L' key listener in `lib/hooks/useKeyboardInput.ts`
- [ ] Prevent edits to locked cells (show toast or silent ignore)

### Task 5: Reset Button Component

- [ ] Create `components/puzzle/ResetButton.tsx`
- [ ] Reset icon (lucide-react `RotateCcw`)
- [ ] Confirmation dialog using Radix Dialog
- [ ] Wire to `resetUnlockedCells` action
- [ ] Handle edge case: no unlocked cells (show toast)

### Task 6: Reset Logic Implementation

- [ ] Implement `resetUnlockedCells` in store
- [ ] Clear userEntries where `!lockedCells[key]`
- [ ] Clear pencil marks in unlocked cells only
- [ ] Preserve: locked cells, clues, timer
- [ ] Test edge cases: all locked, all unlocked, mixed

### Task 7: Integrate Lock Toggle

- [ ] Add `LockToggle` to `PuzzleHeader.tsx`
- [ ] Position near NoteModeToggle
- [ ] Connect to store

### Task 8: Integrate Reset Button

- [ ] Add `ResetButton` to `PuzzleHeader.tsx`
- [ ] Position near submit button
- [ ] Test UX flow: lock cells → reset → verify

### Task 9: Server Actions for Lock State

- [ ] Add `lockedCells` field to `saveProgress` in `actions/puzzle.ts`
- [ ] Add `lockedCells` to `loadProgress` response
- [ ] Test database persistence

### Task 10: Unit Tests

- [ ] `LockToggle.test.tsx`: rendering, toggle, ARIA
- [ ] `ResetButton.test.tsx`: dialog, confirmation, reset action
- [ ] `puzzleStore.locks.test.ts`: lock actions, reset logic, persistence
- [ ] Update SudokuCell and Grid tests
- [ ] ≥80% coverage

### Task 11: Manual Testing

- [ ] Mobile and desktop testing
- [ ] Lock cells → refresh → verify persistence
- [ ] Lock cells → reset → verify unlocked cleared
- [ ] Visual polish (colors, icons, layout)
- [ ] Accessibility testing

---

## Definition of Done

### Code Quality
- [ ] TypeScript strict, no `any`
- [ ] ESLint passes
- [ ] Build succeeds
- [ ] Files <200 LOC
- [ ] Self-documenting code (NO JSDocs per CLAUDE.md)

### Testing
- [ ] All unit tests passing
- [ ] Coverage ≥80%
- [ ] Manual testing complete

### Functionality
- [ ] Lock toggle works (click + keyboard)
- [ ] Lock/unlock cells works
- [ ] Locked cells visually distinct
- [ ] Reset button works (confirmation + reset)
- [ ] Reset preserves locked cells + clues
- [ ] Persistence works (localStorage + database)

### UX
- [ ] Readable on mobile and desktop
- [ ] Visual feedback clear
- [ ] Newspaper aesthetic maintained
- [ ] Accessible (ARIA, keyboard)

---

## Dev Notes

### Implementation Order

1. Store (Task 1) - Foundation
2. Lock Toggle (Task 2,7) - Mode switching
3. Grid Rendering (Task 3) - Visual feedback
4. Lock Interaction (Task 4) - Wire up locks
5. Reset Logic (Task 6) - Core functionality
6. Reset Button (Task 5,8) - UI for reset
7. Server Actions (Task 9) - Database persistence
8. Testing (Task 10,11) - Quality assurance

### Technical Decisions

**Record<string, boolean>**: Sparse storage, O(1) lookup, JSON serializable

**Reset Preserves Timer**: User choice to retry strategy, not restarting puzzle

**Lock Toggle Pattern**: Consistent UX from Story 2.8 (pencil marks)

**Confirmation Dialog**: Prevent accidental resets

**'L' Key**: Mnemonic, no conflicts, dual behavior (mode OR cell lock)

**Locked Cells Immutable**: Clear expectation, prevents confusion

### State Structure Example

```typescript
{
  lockMode: true,
  lockedCells: {
    "0-0": true,
    "2-5": true,
  },
  userEntries: [[5, 0, 0, ...], ...]
}
```

### Reset Logic

```typescript
resetUnlockedCells() {
  newEntries = userEntries.map((row, r) =>
    row.map((val, c) => {
      const key = `${r}-${c}`;
      const isClue = puzzle[r][c] !== 0;
      const isLocked = lockedCells[key];
      return (isClue || isLocked) ? val : 0;
    })
  );

  newMarks = Object.entries(pencilMarks).reduce((acc, [key, marks]) => {
    if (lockedCells[key]) acc[key] = marks;
    return acc;
  }, {});

  set({ userEntries: newEntries, pencilMarks: newMarks, selectedCell: null });
}
```

### Visual Design

**Locked Cells**:
- Background: `bg-blue-50`
- Font: `font-semibold`
- Optional: Small lock icon (12x12px)

**Lock Toggle**:
- Active: `bg-gray-200 border-2 border-black`
- Icon: lucide-react `Lock` (20x20px)

**Reset Button**:
- Icon: lucide-react `RotateCcw` (20x20px)
- Color: `text-gray-700`

**Confirmation Dialog**:
- Title: "Reset Unlocked Cells?"
- Body: "Locked numbers and clues will be preserved."
- Actions: "Cancel", "Reset"

### Database Schema

**Completions Table**:
```sql
ALTER TABLE completions
ADD COLUMN locked_cells JSONB DEFAULT '{}'::jsonb;
```

Check if grid_state already includes this field before creating migration.

### Files to Create

```
components/puzzle/LockToggle.tsx
components/puzzle/ResetButton.tsx
components/puzzle/__tests__/LockToggle.test.tsx
components/puzzle/__tests__/ResetButton.test.tsx
lib/stores/__tests__/puzzleStore.locks.test.ts
```

### Files to Modify

```
lib/stores/puzzleStore.ts
lib/stores/puzzleStore.types.ts
components/puzzle/SudokuCell.tsx
components/puzzle/SudokuGrid.tsx
components/puzzle/PuzzleHeader.tsx
lib/hooks/useKeyboardInput.ts
actions/puzzle.ts
```

### References

- **Pencil Marks**: docs/stories/2-8-pencil-marks-annotations-paper-sudoku.md
- **State Management**: docs/stories/2-4-puzzle-state-auto-save-session-management.md
- **Architecture**: docs/architecture.md

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5-20250929

### Implementation Plan

Task sequence: Store → Lock Toggle → Grid Rendering → Lock Interaction → Reset Logic → Reset Button → Server Actions → Tests

### Completion Notes

Story created in collaboration with user (Spardutti). User requirements captured. Architecture patterns aligned with existing codebase (Zustand, Supabase). Ready for implementation.

**Key Context for Developer:**
- User frustrated by manual cell clearing after errors
- Wants to preserve confident numbers while retrying
- Lock + Reset are tightly coupled (single story)
- Visual clarity critical (locked cells must stand out)
- Persistence required (cross-device, cross-session)

### Change Log

- **2025-12-23**: Story created by SM agent (Bob) in yolo mode. User: Spardutti. Requirements elicited via discussion. Marked as ready-for-dev.

---
