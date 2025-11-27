# Story 2.3: Number Input System (Touch & Keyboard)

**Story ID**: 2.3
**Epic**: Epic 2 - Core Puzzle Experience
**Story Key**: 2-3-number-input-system-touch-keyboard
**Status**: drafted
**Created**: 2025-11-27

---

## User Story Statement

**As a** player
**I want** fast, intuitive number input for both mobile and desktop
**So that** I can efficiently fill the Sudoku grid without friction

**Value**: This story completes the interactive puzzle experience by enabling users to actually input numbers into the grid. Without this, users can only select cells but not solve the puzzle. The dual-mode design (touch number pad for mobile, keyboard input for desktop) ensures optimal UX across all devices.

---

## Requirements Context

### Epic Context

Story 2.3 is the third story in Epic 2 (Core Puzzle Experience), building on the grid component from Story 2.2. This story implements the number input mechanism—the primary interaction method for solving puzzles—with optimized experiences for both mobile (touch number pad) and desktop (keyboard shortcuts).

**Epic 2 Goal**: Deliver the fundamental daily Sudoku playing experience with clean UI, pure challenge validation, and fair timing.

**Story 2.3 Contribution**: Implements dual-mode number input (touch number pad for mobile, keyboard shortcuts for desktop) with validation and immediate visual feedback.

### Functional Requirements Mapping

**From PRD:**
- **FR-2.2** (Number input mechanism) → Touch-optimized number pad (1-9 + Clear) for mobile, keyboard shortcuts for desktop
- **FR-9.1** (Mobile-first responsive) → Number pad with large tap targets (≥44px), fixed position on mobile
- **FR-9.2** (Accessibility) → Keyboard shortcuts work without input field selection, screen reader support

**From Epics (Story 2.3):**
- **Mobile**: Number pad below grid (buttons 1-9 + Clear), large tap targets (≥44px), sticky/fixed position
- **Desktop**: Number keys (1-9) input directly, Backspace/Delete/0 clears cell, optional number palette for mouse users
- **Validation**: Only 1-9 accepted, clue cells cannot be modified, invalid input ignored gracefully
- **Feedback**: Immediate visual response, selected cell remains highlighted, user can continue selecting and inputting

### Architecture Alignment

This story implements patterns from architecture.md:

**Frontend Component Pattern** (architecture.md Section 2.1):
- Component-driven UI structure (`/components/puzzle/NumberPad.tsx`)
- TypeScript strict mode with full type coverage
- Tailwind CSS for newspaper aesthetic styling
- Event-driven interaction (callbacks for number input)

**Input Handling**:
- NumberPad component for mobile (touch-optimized buttons)
- Custom keyboard hook (`useKeyboardInput`) for desktop
- Global keyboard listener attached to document (not input field)
- Prevent default behavior for number keys to avoid page scroll

**Design System Alignment** (Story 1.5):
- Newspaper aesthetic: Clean buttons, high contrast
- Typography: Sans-serif numbers for readability
- Responsive breakpoints: Mobile 320-767px, desktop 1025px+
- Touch optimizations: `touch-action: manipulation`, no 300ms delay

### Previous Story Learnings (Story 2.2)

**From Story 2.2 (Sudoku Grid UI Component):**

- **Grid Component Interface**: Grid exposes callbacks for number input
  - `onNumberChange(row: number, col: number, value: number)` callback ready for use
  - Component located at `components/puzzle/SudokuGrid.tsx`
  - Grid state managed via controlled component pattern

- **Cell Selection State**: Grid manages selected cell
  - `selectedCell: { row: number; col: number } | null` prop
  - Selected cell highlights in blue (#1a73e8)
  - Only one cell selected at a time
  - Clue cells cannot be selected (read-only)

- **Keyboard Navigation**: Grid already handles arrow keys
  - Arrow keys move selection (up, down, left, right)
  - Wraps at grid edges for better UX
  - Keyboard listener attached to grid container
  - **IMPORTANT**: Number input hook must NOT conflict with arrow key navigation

- **Component Testing Patterns**: Follow established testing rigor
  - React Testing Library patterns from Story 2.2
  - 98% coverage achieved in Story 2.2 - maintain this standard
  - Test keyboard events, touch events, accessibility

- **TypeScript Strict Mode**: No `any` types, full type coverage
  - Define clear interfaces for component props
  - Export types for reusability

**Key Takeaway**: Grid component is ready to receive number input via `onNumberChange` callback. Focus on building input mechanism that integrates cleanly with existing grid. Coordinate keyboard listeners carefully to avoid conflicts with arrow key navigation.

### Dependencies

**Upstream Dependencies:**
- ✅ **Story 1.1**: Next.js project structure, TypeScript configuration
- ✅ **Story 1.5**: Design system (Tailwind config, typography, button components)
- ✅ **Story 2.2**: Grid component with `onNumberChange` callback and `selectedCell` state

**Downstream Dependencies:**
- **Story 2.4**: Auto-Save State will trigger on number input
- **Story 2.6**: Solution Validation will use completed grid
- **Story 2.7**: Page Integration will compose NumberPad with Grid

**No Blocking Dependencies**: This story can be implemented immediately.

### Technical Scope

**In Scope:**
- `<NumberPad>` component for mobile (buttons 1-9 + Clear)
- `useKeyboardInput` hook for desktop number input
- Integration with grid's `onNumberChange` callback
- Input validation (only 1-9, clue cells protected)
- Fixed/sticky positioning for mobile number pad
- Keyboard shortcuts (1-9 input, Backspace/Delete/0 clear)
- Accessibility (ARIA labels, keyboard navigation)
- Component unit tests (button clicks, keyboard events)

**Out of Scope (Future Stories):**
- Undo functionality (deferred to post-MVP)
- Grid state persistence (Story 2.4 - Zustand store)
- Solution validation (Story 2.6 - server-side validation)
- Timer integration (Story 2.5 - Timer component)

---

## Acceptance Criteria

### AC1: Number Pad Rendering (Mobile)

**Given** a cell is selected in the grid
**When** the NumberPad component renders on mobile
**Then** the following requirements are met:

- ✅ Component file created: `components/puzzle/NumberPad.tsx`
- ✅ Number pad displays buttons 1-9 in a grid layout
- ✅ "Clear" button included (empties selected cell)
- ✅ Each button is a large tap target (minimum 44x44px)
- ✅ Number pad is sticky/fixed positioned at bottom of screen
- ✅ Number pad stays visible during scroll
- ✅ Newspaper aesthetic applied (clean, high contrast, professional)
- ✅ Number pad only visible on mobile (hidden on desktop ≥1025px)

**Validation:**
- Load puzzle page on mobile viewport (320px-767px)
- Verify number pad visible at bottom
- Verify tap targets meet 44px minimum
- Test scroll behavior (number pad stays fixed)

---

### AC2: Touch Number Input

**Given** a cell is selected and number pad is visible
**When** I tap a number button (1-9)
**Then** the following requirements are met:

- ✅ Number appears in selected cell immediately (<50ms latency)
- ✅ Grid's `onNumberChange` callback fired with correct arguments
- ✅ Selected cell remains highlighted after input
- ✅ User can select another cell and continue inputting
- ✅ Visual feedback on button tap (ripple or pressed state)

**Validation:**
- Select cell, tap number button
- Verify number appears in grid
- Verify selected cell still highlighted
- Test rapid input across multiple cells

---

### AC3: Clear Button

**Given** a cell with a user-entered number is selected
**When** I tap the "Clear" button
**Then** the following requirements are met:

- ✅ Selected cell emptied (value set to 0)
- ✅ Grid's `onNumberChange` callback fired with value = 0
- ✅ Clue cells cannot be cleared (button disabled or no effect when clue selected)
- ✅ Selected cell remains highlighted after clearing

**Validation:**
- Enter number in cell, tap Clear
- Verify cell empties
- Select clue cell, tap Clear
- Verify clue cell unchanged

---

### AC4: Keyboard Input (Desktop)

**Given** a cell is selected and I'm on desktop
**When** I press number keys (1-9) on keyboard
**Then** the following requirements are met:

- ✅ Number appears in selected cell immediately
- ✅ Grid's `onNumberChange` callback fired with correct arguments
- ✅ Keyboard shortcuts work without clicking input field
- ✅ Number keys 1-9 input numbers directly
- ✅ Backspace, Delete, or "0" key clears selected cell
- ✅ preventDefault() applied to number keys (no page scroll)
- ✅ Keyboard listener does NOT interfere with arrow key navigation

**Validation:**
- Select cell, press "5" key
- Verify number 5 appears in cell
- Press Backspace, verify cell clears
- Test arrow keys still work for navigation

---

### AC5: Input Validation

**Given** various input scenarios
**When** I attempt to input numbers
**Then** the following requirements are met:

- ✅ Only numbers 1-9 accepted (other keys ignored)
- ✅ Pre-filled clue cells cannot be modified (read-only state)
- ✅ Invalid input ignored gracefully (no error messages)
- ✅ No cell selected: Number input does nothing (graceful no-op)
- ✅ Typing letters, symbols, or special keys has no effect on grid

**Validation:**
- Select empty cell, press "A" or "!" key
- Verify no change to grid
- Select clue cell, attempt to input number
- Verify clue cell unchanged
- Press number key with no cell selected
- Verify no error or crash

---

### AC6: Accessibility

**Given** the number input system is implemented
**When** a user navigates via keyboard or screen reader
**Then** the following requirements are met:

- ✅ Number pad buttons have ARIA labels: "Number 1", "Number 2", ..., "Clear"
- ✅ Screen reader announces button press
- ✅ Tab navigation moves through number pad buttons
- ✅ Enter or Space key activates focused button
- ✅ Focus indicators visible for keyboard users
- ✅ Keyboard shortcuts accessible without screen reader interference

**Validation:**
- Navigate number pad with Tab key
- Verify focus indicators visible
- Use screen reader to verify button labels
- Press Enter/Space on focused button

---

### AC7: Component Testing

**Given** the NumberPad component is implemented
**When** unit tests are run
**Then** the following requirements are met:

- ✅ Test file created: `components/puzzle/__tests__/NumberPad.test.tsx`
- ✅ Tests verify:
  - Number pad renders 9 number buttons + 1 Clear button
  - Button clicks fire `onNumberChange` callback with correct arguments
  - Clear button calls `onNumberChange` with value = 0
  - Buttons have correct ARIA labels
  - Component hidden on desktop (responsive)
- ✅ All tests passing
- ✅ Coverage ≥80% for component code

**Validation:**
- Run `npm test NumberPad.test.tsx`
- Verify all tests pass
- Check coverage report

---

### AC8: Keyboard Hook Testing

**Given** the `useKeyboardInput` hook is implemented
**When** unit tests are run
**Then** the following requirements are met:

- ✅ Test file created: `lib/hooks/__tests__/useKeyboardInput.test.ts`
- ✅ Tests verify:
  - Number keys (1-9) call `onNumberChange` with correct value
  - Backspace/Delete/0 calls `onNumberChange` with value = 0
  - Other keys ignored (no callback fired)
  - preventDefault() called for number keys
  - Hook cleans up keyboard listener on unmount
- ✅ All tests passing
- ✅ Coverage ≥80% for hook code

**Validation:**
- Run `npm test useKeyboardInput.test.ts`
- Verify all tests pass
- Check coverage report

---

## Tasks / Subtasks

### Task 1: Create NumberPad Component Structure

**Objective**: Set up component file with TypeScript interfaces and button layout

**Subtasks**:
- [ ] Create file: `components/puzzle/NumberPad.tsx`
- [ ] Define TypeScript props interface:
  ```typescript
  interface NumberPadProps {
    onNumberChange: (value: number) => void  // 1-9 for input, 0 for clear
    selectedCell: { row: number; col: number } | null
    isClueCell: boolean  // Disable Clear if clue cell selected
  }
  ```
- [ ] Layout buttons 1-9 in 3x3 grid + Clear button below
- [ ] Apply fixed positioning for mobile (bottom of screen)
- [ ] Apply newspaper aesthetic styling (Tailwind classes)
- [ ] Add JSDoc comment documenting component usage

**Acceptance Criteria**: AC1
**Estimated Effort**: 30 minutes

---

### Task 2: Implement Number Button Click Handlers

**Objective**: Handle button clicks and call `onNumberChange` callback

**Subtasks**:
- [ ] Create button click handler:
  ```typescript
  function handleNumberClick(value: number) {
    if (!selectedCell) return  // No cell selected, no-op
    onNumberChange(value)
  }
  ```
- [ ] Attach handler to each number button (1-9)
- [ ] Add visual feedback on button press (Tailwind active state)
- [ ] Test button clicks fire callback with correct value

**Acceptance Criteria**: AC2
**Estimated Effort**: 20 minutes

---

### Task 3: Implement Clear Button

**Objective**: Clear selected cell when Clear button pressed

**Subtasks**:
- [ ] Create Clear button click handler:
  ```typescript
  function handleClear() {
    if (!selectedCell || isClueCell) return  // No cell or clue cell, no-op
    onNumberChange(0)  // 0 = clear/empty
  }
  ```
- [ ] Disable Clear button when clue cell selected (visual + functional)
- [ ] Add ARIA label: "Clear selected cell"
- [ ] Test Clear button empties user-entered numbers but not clues

**Acceptance Criteria**: AC3
**Estimated Effort**: 15 minutes

---

### Task 4: Apply Responsive Styling

**Objective**: Number pad visible on mobile, hidden on desktop

**Subtasks**:
- [ ] Add responsive classes: `block lg:hidden` (visible mobile, hidden desktop ≥1024px)
- [ ] Apply fixed positioning: `fixed bottom-0 left-0 right-0`
- [ ] Add safe-area padding for mobile notch: `pb-safe`
- [ ] Style buttons with Tailwind:
  - Minimum 44x44px tap targets
  - High contrast (black text, white background, black borders)
  - Newspaper aesthetic
- [ ] Test on mobile (320px) and desktop (1280px)

**Acceptance Criteria**: AC1
**Estimated Effort**: 30 minutes

---

### Task 5: Create Keyboard Input Hook

**Objective**: Enable keyboard shortcuts for desktop number input

**Subtasks**:
- [ ] Create file: `lib/hooks/useKeyboardInput.ts`
- [ ] Define hook interface:
  ```typescript
  interface UseKeyboardInputProps {
    selectedCell: { row: number; col: number } | null
    onNumberChange: (row: number, col: number, value: number) => void
    isClueCell: (row: number, col: number) => boolean
  }

  export function useKeyboardInput({ selectedCell, onNumberChange, isClueCell }: UseKeyboardInputProps) {
    // Hook implementation
  }
  ```
- [ ] Attach keyboard event listener to document:
  ```typescript
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedCell) return

      // Number keys 1-9
      if (e.key >= '1' && e.key <= '9') {
        if (isClueCell(selectedCell.row, selectedCell.col)) return
        e.preventDefault()  // Prevent page scroll
        onNumberChange(selectedCell.row, selectedCell.col, parseInt(e.key))
      }

      // Backspace, Delete, or 0 to clear
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        if (isClueCell(selectedCell.row, selectedCell.col)) return
        e.preventDefault()
        onNumberChange(selectedCell.row, selectedCell.col, 0)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedCell, onNumberChange, isClueCell])
  ```
- [ ] Test keyboard shortcuts work without input field focus

**Acceptance Criteria**: AC4, AC5
**Estimated Effort**: 45 minutes

---

### Task 6: Integrate Hook with Grid Component

**Objective**: Use keyboard hook in puzzle page or grid wrapper

**Subtasks**:
- [ ] Import `useKeyboardInput` hook in puzzle page or grid wrapper
- [ ] Pass required props: `selectedCell`, `onNumberChange`, `isClueCell`
- [ ] Verify keyboard input does NOT interfere with arrow key navigation
- [ ] Test keyboard shortcuts on desktop (1-9 input, Backspace clears)
- [ ] Test arrow keys still work for cell navigation

**Acceptance Criteria**: AC4, AC5
**Estimated Effort**: 20 minutes

---

### Task 7: Write NumberPad Unit Tests

**Objective**: Ensure NumberPad component functionality is tested

**Subtasks**:
- [ ] Create test file: `components/puzzle/__tests__/NumberPad.test.tsx`
- [ ] Test number pad renders 10 buttons (9 numbers + Clear)
- [ ] Test number button click fires `onNumberChange` with correct value
- [ ] Test Clear button fires `onNumberChange` with value = 0
- [ ] Test Clear button disabled when clue cell selected
- [ ] Test buttons have correct ARIA labels
- [ ] Test responsive: component hidden on desktop viewport
- [ ] Run tests: `npm test NumberPad.test.tsx`
- [ ] Verify coverage ≥80%

**Acceptance Criteria**: AC7
**Estimated Effort**: 1 hour

---

### Task 8: Write Keyboard Hook Unit Tests

**Objective**: Ensure keyboard input hook functionality is tested

**Subtasks**:
- [ ] Create test file: `lib/hooks/__tests__/useKeyboardInput.test.ts`
- [ ] Test number keys (1-9) call `onNumberChange` with correct value
- [ ] Test Backspace/Delete/0 call `onNumberChange` with value = 0
- [ ] Test other keys ignored (no callback fired)
- [ ] Test preventDefault() called for number keys
- [ ] Test hook cleans up listener on unmount
- [ ] Test no action when no cell selected
- [ ] Test no action when clue cell selected
- [ ] Run tests: `npm test useKeyboardInput.test.ts`
- [ ] Verify coverage ≥80%

**Acceptance Criteria**: AC8
**Estimated Effort**: 1 hour

---

### Task 9: Create Demo Page for Manual Testing

**Objective**: Build standalone demo page to test number input

**Subtasks**:
- [ ] Create demo page: `app/demo/input/page.tsx`
- [ ] Compose `SudokuGrid` + `NumberPad` + `useKeyboardInput`
- [ ] Implement state management for demo:
  ```typescript
  const [userEntries, setUserEntries] = useState<number[][]>(emptyGrid)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)

  function handleNumberChange(row: number, col: number, value: number) {
    const newEntries = userEntries.map(r => [...r])
    newEntries[row][col] = value
    setUserEntries(newEntries)
  }

  function isClueCell(row: number, col: number): boolean {
    return mockPuzzle[row][col] !== 0
  }

  useKeyboardInput({ selectedCell, onNumberChange: handleNumberChange, isClueCell })
  ```
- [ ] Test on mobile device (number pad visible, touch input works)
- [ ] Test on desktop (keyboard shortcuts work, number pad hidden)
- [ ] Verify integration with grid from Story 2.2

**Acceptance Criteria**: All ACs (manual testing)
**Estimated Effort**: 30 minutes

---

## Definition of Done

### Code Quality
- [ ] TypeScript strict mode compliance (no `any` types)
- [ ] ESLint passes with no errors
- [ ] Code follows project conventions (naming, component structure)
- [ ] Components have JSDoc comments
- [ ] No hardcoded magic numbers (use constants)

### Testing
- [ ] Unit tests written for NumberPad component
- [ ] Unit tests written for useKeyboardInput hook
- [ ] Test coverage ≥80% for new code
- [ ] Manual testing: works on mobile (320px), tablet, desktop
- [ ] Edge cases tested (no cell selected, clue cells, invalid keys)
- [ ] All tests passing in CI/CD pipeline

### Functionality
- [ ] Number pad renders correctly on mobile
- [ ] Touch input fills grid cells
- [ ] Clear button empties cells (except clues)
- [ ] Keyboard shortcuts work on desktop (1-9, Backspace/Delete/0)
- [ ] Input validation prevents invalid input
- [ ] Clue cells protected from modification
- [ ] Keyboard listener does NOT conflict with arrow key navigation

### Accessibility
- [ ] ARIA labels on number pad buttons
- [ ] Tab navigation works through number pad
- [ ] Enter/Space activates focused button
- [ ] Screen reader announces button presses
- [ ] Focus indicators visible
- [ ] Keyboard shortcuts accessible

### Responsiveness
- [ ] Number pad visible on mobile (320-767px)
- [ ] Number pad hidden on desktop (≥1025px)
- [ ] Tap targets ≥44x44px on mobile
- [ ] Fixed positioning keeps number pad visible during scroll
- [ ] Newspaper aesthetic maintained

### Documentation
- [ ] Component props documented in JSDoc
- [ ] Hook parameters and usage documented
- [ ] Demo page shows integration example
- [ ] README updated with number input info (optional)

### Integration
- [ ] NumberPad integrates with Grid component via `onNumberChange`
- [ ] Keyboard hook integrates without conflicting with grid navigation
- [ ] Component ready for state persistence (Story 2.4)
- [ ] Component ready for page integration (Story 2.7)

### Performance
- [ ] Input response time <50ms (immediate feedback)
- [ ] No unnecessary re-renders
- [ ] Keyboard listener cleaned up on unmount

---

## Dev Notes

### Implementation Priorities

1. **Start with NumberPad Component** (Task 1-3)
   - Core mobile input mechanism
   - Foundation for touch interaction
   - Quick task, enables manual testing early

2. **Responsive Styling** (Task 4)
   - Mobile-first requirement
   - Ensures number pad looks good before adding logic

3. **Keyboard Hook** (Task 5-6)
   - Desktop UX enhancement
   - More complex logic, implement after NumberPad works
   - Requires careful coordination with grid's arrow key navigation

4. **Testing** (Task 7-8)
   - Ensure quality before integration
   - High coverage target (≥80%)

5. **Demo Page** (Task 9)
   - Enables end-to-end manual testing
   - Validates integration with grid from Story 2.2

### Project Structure Alignment

This story follows architecture.md structure:

**Files to Create:**
```
components/
  └── puzzle/
      └── NumberPad.tsx                      # Mobile number pad component (NEW)
      └── __tests__/
          └── NumberPad.test.tsx             # NumberPad tests (NEW)
lib/
  └── hooks/
      └── useKeyboardInput.ts                # Desktop keyboard hook (NEW)
      └── __tests__/
          └── useKeyboardInput.test.ts       # Hook tests (NEW)
app/
  └── demo/
      └── input/
          └── page.tsx                       # Demo page (NEW - optional)
```

**Component Pattern** (following design system from Story 1.5):
- Use Tailwind CSS utility classes (no CSS-in-JS)
- Export TypeScript interfaces for props
- Follow stateless component pattern (callbacks for actions)

### Technical Decisions

**Why Separate Hook for Keyboard Input?**
- Separation of concerns: Component handles touch, hook handles keyboard
- Reusability: Hook can be used in different contexts
- Testability: Easier to test component and hook independently
- Desktop-only: Hook only active on desktop, NumberPad only on mobile

**Why Global Keyboard Listener (document)?**
- Keyboard shortcuts should work without input field focus
- Better UX: User doesn't need to click input first
- Matches Sudoku app conventions
- Must coordinate with grid's arrow key listener

**Why Fixed Positioning for Number Pad?**
- Mobile UX: Number pad stays visible during scroll
- No accidental hiding: User always has access to input
- Matches native app patterns (e.g., iOS keyboard)

**Why Controlled Component for NumberPad?**
- State managed by parent (puzzle page or grid wrapper)
- Component is presentation layer only
- Aligns with React best practices
- Ready for Zustand state management in Story 2.4

**Why 0 for Clear (not null)?**
- Consistent with grid's empty cell representation (0 = empty)
- Simplifies callback interface (always passes number)
- Matches puzzle data structure from Story 2.1

### Learnings from Previous Story (Story 2.2)

**Apply Story 2.2 Patterns:**
1. **Testing Rigor**: Aim for ≥80% coverage (Story 2.2 achieved 98%)
2. **Documentation**: Comprehensive JSDoc comments
3. **TypeScript Strict**: No `any` types, full type coverage
4. **Controlled Components**: State managed by parent

**Grid Component Integration** (from Story 2.2):
```typescript
// Grid exposes these props/callbacks
interface SudokuGridProps {
  puzzle: number[][]
  userEntries: number[][]
  selectedCell: { row: number; col: number } | null
  onCellSelect: (row: number, col: number) => void
  onNumberChange: (row: number, col: number, value: number) => void  // ← Use this!
}

// Grid handles arrow key navigation
// NumberPad/hook must NOT interfere with arrow keys
```

**Keyboard Coordination**:
- Grid listens for arrow keys on grid container (`onKeyDown` on `<div role="grid">`)
- Keyboard hook listens for number keys on document
- Both listeners should coexist without conflict
- Test thoroughly to ensure arrow keys still work after adding keyboard hook

### References

- **Grid Component**: components/puzzle/SudokuGrid.tsx (from Story 2.2)
- **Design System**: Established in Story 1.5 (button components, newspaper aesthetic)
- **Tailwind Config**: tailwind.config.ts (responsive breakpoints, design tokens)

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
