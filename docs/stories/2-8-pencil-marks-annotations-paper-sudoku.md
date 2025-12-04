# Story 2.8: Pencil Marks/Annotations - Paper-Like Note Taking

**Story ID**: 2.8
**Epic**: Epic 2 - Core Puzzle Experience
**Story Key**: 2-8-pencil-marks-annotations-paper-sudoku
**Status**: ready-for-dev
**Created**: 2025-12-04

---

## User Story Statement

**As a** player
**I want** to add small annotation numbers to cells as notes for potential values
**So that** I can visualize solving options just like I would on paper Sudoku

**Value**: Enables classic pencil mark technique for tracking candidate numbers in cells. Essential for solving medium-to-hard puzzles. Keeps it paper-like: simple toggle, manual notation, auto-clear when numbers placed.

---

## Requirements Context

### Epic Context

Story 2.8 extends Epic 2 by adding pencil marks - corner annotations showing candidate values. Builds on number input (Story 2.3) and grid (Story 2.2).

### User Requirements

- Simple toggle between normal and note mode (pencil icon)
- Visual feedback showing current mode
- In note mode, numbers add small corner annotations
- Auto-clear: placing number removes it from row/col/box annotations
- **No** AI hints, auto-fill, or pattern highlights (paper-like only)

### Architecture Alignment

**State Management** (architecture.md):
- Extend `lib/stores/puzzleStore.ts` with pencil marks
- Store as `Record<string, Set<number>>` where key is `${row}-${col}`
- Persist via Zustand middleware

**Component Pattern**:
- NoteModeToggle component for mode switching
- Extend SudokuGrid cell rendering for annotations
- Modify NumberPad/keyboard input to respect mode

### Dependencies

**Upstream** (All Complete):
- ✅ Story 2.2: Grid component with cell rendering
- ✅ Story 2.3: Number input (NumberPad + keyboard)
- ✅ Story 2.4: Zustand store with persistence

**Downstream**: None

---

## Acceptance Criteria

### AC1: Mode Toggle Button

**Given** I'm on the puzzle page
**When** the page renders
**Then**:
- ✅ Toggle button visible in puzzle header (pencil icon)
- ✅ Default mode is "normal"
- ✅ Clear visual state (highlight when active)
- ✅ Accessible (ARIA label, keyboard focus)

---

### AC2: Toggle Note Mode

**Given** note mode inactive
**When** I click toggle button
**Then**:
- ✅ Note mode activates (visual feedback)
- ✅ Number inputs now add pencil marks
- ✅ Clicking again deactivates
- ✅ State persists across refresh

---

### AC3: Add Pencil Marks

**Given** note mode active and cell selected
**When** I input number (1-9)
**Then**:
- ✅ Number appears as small corner annotation
- ✅ Multiple numbers per cell (up to 9)
- ✅ 3x3 micro-grid layout within cell
- ✅ Font size 0.5-0.6rem, lighter color
- ✅ Cell value unaffected
- ✅ Works on clue cells (read-only for values only)

---

### AC4: Remove Pencil Marks

**Given** cell has pencil marks and note mode active
**When** I input number already marked
**Then**:
- ✅ That mark removed (toggle behavior)
- ✅ Other marks unchanged

---

### AC5: Place Number Clears Cell Marks

**Given** cell has pencil marks and note mode inactive
**When** I input number
**Then**:
- ✅ Number placed as cell value
- ✅ All pencil marks in that cell cleared

---

### AC6: Auto-Clear Pencil Marks

**Given** cells have pencil marks
**When** I place number in normal mode
**Then**:
- ✅ Number removed from all marks in same row
- ✅ Number removed from all marks in same column
- ✅ Number removed from all marks in same 3x3 box
- ✅ Auto-clear immediate (<50ms)
- ✅ Other numbers unchanged

---

### AC7: Keyboard Shortcut

**Given** on desktop
**When** I press 'N' key
**Then**:
- ✅ Note mode toggles
- ✅ Visual feedback shows change
- ✅ No interference with other controls

---

### AC8: Persistence

**Given** I have pencil marks and note mode state
**When** I refresh page
**Then**:
- ✅ All pencil marks restored
- ✅ Note mode state restored
- ✅ Auto-clear works after restore

---

### AC9: Clear Cell with Marks

**Given** cell has only pencil marks
**When** I clear cell (Backspace/Clear button)
**Then**:
- ✅ All pencil marks removed
- ✅ Works in both modes

---

## Tasks / Subtasks

### Task 1: Extend Puzzle Store (AC2,3,4,5,6,8)

- [ ] Add to `PuzzleState`: `noteMode: boolean`, `pencilMarks: Record<string, Set<number>>`
- [ ] Add actions: `toggleNoteMode`, `addPencilMark`, `removePencilMark`, `clearCellPencilMarks`, `autoClearPencilMarks`
- [ ] Modify `updateCell` to auto-clear on number placement
- [ ] Add pencilMarks to persistence config
- [ ] Test store actions

**File**: `lib/stores/puzzleStore.ts`

---

### Task 2: Create Toggle Button (AC1,2,7)

- [ ] Create `components/puzzle/NoteModeToggle.tsx`
- [ ] Pencil icon with active/inactive styles
- [ ] ARIA labels and keyboard support
- [ ] Test rendering and toggle behavior

---

### Task 3: Grid Rendering for Marks (AC3,5)

- [ ] Modify `components/puzzle/SudokuGrid.tsx`
- [ ] Add `pencilMarks` prop
- [ ] Render 3x3 grid of small numbers in cells
- [ ] Style: 0.5rem font, gray color, only if no cell value
- [ ] Test rendering

---

### Task 4: Modify Number Input (AC3,4,5)

- [ ] Update `components/puzzle/NumberPad.tsx` with `noteMode` prop
- [ ] Route to pencil mark or cell value based on mode
- [ ] Update `lib/hooks/useKeyboardInput.ts` similarly
- [ ] Test both modes

---

### Task 5: Auto-Clear Logic (AC6)

- [ ] Implement `autoClearPencilMarks` in store
- [ ] Clear from row (9 cells)
- [ ] Clear from column (9 cells)
- [ ] Clear from 3x3 box (9 cells)
- [ ] Call on `updateCell` when value > 0
- [ ] Test performance

---

### Task 6: Integrate Toggle (AC1,2,7)

- [ ] Add `NoteModeToggle` to `PuzzleHeader.tsx`
- [ ] Connect to store
- [ ] Add 'N' key listener
- [ ] Test click and keyboard

---

### Task 7: Clear Cell Marks (AC5,9)

- [ ] Modify `updateCell` to clear marks when value = 0
- [ ] Test with Backspace and Clear button

---

### Task 8: Unit Tests (All ACs)

- [ ] `NoteModeToggle.test.tsx`: rendering, toggle, ARIA
- [ ] `puzzleStore.pencilMarks.test.ts`: actions, auto-clear, persistence
- [ ] Update Grid and NumberPad tests
- [ ] ≥80% coverage

---

### Task 9: Manual Testing (All ACs)

- [ ] Mobile and desktop testing
- [ ] Auto-clear verification
- [ ] Persistence testing
- [ ] Accessibility testing
- [ ] Visual polish

---

## Definition of Done

### Code Quality
- [ ] TypeScript strict, no `any`
- [ ] ESLint passes
- [ ] Files <200 LOC
- [ ] Self-documenting code

### Testing
- [ ] All unit tests passing
- [ ] Coverage ≥80%
- [ ] Manual testing complete

### Functionality
- [ ] Toggle works (click + keyboard)
- [ ] Add/remove pencil marks works
- [ ] Auto-clear works (row/col/box)
- [ ] Persistence works
- [ ] Clear cell works

### UX
- [ ] Readable on mobile and desktop
- [ ] Visual feedback clear
- [ ] Newspaper aesthetic maintained
- [ ] Accessible (ARIA, keyboard)

---

## Dev Notes

### Implementation Order

1. Store (Task 1) - Foundation
2. Grid Rendering (Task 3) - Visual feedback
3. Toggle Button (Task 2) - Mode switching
4. Input Modification (Task 4) - Connect inputs
5. Auto-Clear (Task 5) - Core feature
6. Integration (Tasks 6,7) - Wire together
7. Testing (Task 8,9) - Quality

### Technical Decisions

**Record<string, Set<number>>**: Efficient lookup O(1), Set prevents duplicates, sparse storage

**Auto-Clear**: User requested, matches paper Sudoku, more user-friendly

**Toggle to Remove**: Intuitive UX, common pattern

**'N' Key**: Mnemonic, no conflicts

**Corner Marks Only**: Simpler, sufficient for most techniques

### State Structure Example

```typescript
{
  noteMode: true,
  pencilMarks: {
    "0-0": Set(1, 2, 3),
    "0-1": Set(4, 5),
  },
  userEntries: [[0, 0, 0, 4, ...], ...]
}
```

### Auto-Clear Logic

```typescript
// Box calculation
const boxRow = Math.floor(row / 3) * 3  // 0, 3, or 6
const boxCol = Math.floor(col / 3) * 3  // 0, 3, or 6
// Then iterate boxRow to boxRow+3, boxCol to boxCol+3
```

### Visual Design

**Pencil Marks**: 0.5rem font, text-gray-400, 3x3 grid, gap-0.5

**Toggle Button**: Active bg-gray-200, pencil icon 20x20px, border-2 border-black

### Files to Modify

```
lib/stores/puzzleStore.ts           # Add state
components/puzzle/SudokuGrid.tsx    # Render marks
components/puzzle/NumberPad.tsx     # Respect mode
components/puzzle/NoteModeToggle.tsx # NEW
components/puzzle/PuzzleHeader.tsx  # Add toggle
lib/hooks/useKeyboardInput.ts       # Respect mode
```

### References

- Grid: components/puzzle/SudokuGrid.tsx (Story 2.2)
- Input: components/puzzle/NumberPad.tsx (Story 2.3)
- Store: lib/stores/puzzleStore.ts (Story 2.4)
- Architecture: docs/architecture.md

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5-20250929

### Change Log

- **2025-12-04**: Story created. User requested paper-like pencil marks with simple toggle, auto-clear only, no smart features. Status: ready-for-dev.
