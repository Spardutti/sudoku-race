# Story 2.10: Critical UX Bug Fixes & Polish

**Story ID**: 2.10
**Epic**: Epic 2 - Core Puzzle Experience
**Story Key**: 2-10-critical-ux-bug-fixes
**Status**: ready-for-dev
**Created**: 2025-12-04

---

## User Story Statement

**As a** user
**I want** polished, bug-free UI interactions
**So that** the experience feels professional and I can focus on solving puzzles

**Value**: Fixes critical UX bugs affecting OAuth branding, keyboard navigation, and visual feedback. Improves trust and usability.

---

## Bug Summary

This story fixes 4 critical UX bugs:

1. **Google button styling** - Should match official Google branding
2. **Google consent screen** - Shows Supabase ID instead of "Sudoku Race"
3. **Dual focus bug** - Clicking cell + arrow keys creates two highlighted cells
4. **Clue cell focus indicator** - Arrow keys over clue cells lose visual indicator

---

## Requirements Context

### Bug Details

**Bug 1: Google Button Styling**
- Current: Generic blue button with "Continue with Google" text
- Expected: Official Google button (white background, Google logo, proper font)
- Reference: [Google Sign-In Branding Guidelines](https://developers.google.com/identity/branding-guidelines)

**Bug 2: OAuth Consent Screen Branding**
- Current: Shows Supabase project ID in consent screen
- Expected: Shows "Sudoku Race" as app name
- Fix: Configure OAuth app name in Google Cloud Console

**Bug 3: Dual Focus Bug (Desktop)**
- Current: Click cell → highlight appears, press arrow → original highlight stays + new cell highlights
- Expected: Only one cell highlighted at a time
- Root cause: Click sets selection, arrow keys navigate but don't clear focus-visible ring

**Bug 4: Clue Cell Focus Indicator**
- Current: Arrow over clue cell (red/given number) → no visual indicator, appears to "disappear"
- Expected: Clue cells show red border or distinct styling when focused via keyboard
- Root cause: Clue cells have `isSelected` styling that doesn't apply to clues

### Architecture Alignment

**Components affected**:
- `components/auth/AuthButtons.tsx` (Bug 1)
- Google Cloud Console config (Bug 2)
- `components/puzzle/SudokuGrid.tsx` (Bugs 3, 4)

**Patterns to follow**:
- Self-documenting code, minimal comments
- TypeScript strict mode
- Accessibility (ARIA, keyboard support)

### Dependencies

- ✅ Story 2.2: Grid component exists
- ✅ Story 3.2: Google OAuth implemented

---

## Acceptance Criteria

### AC1: Official Google Button Styling

**Given** I'm on a page with Google sign-in
**When** I view the button
**Then**:
- ✅ White background (#FFFFFF)
- ✅ Google "G" logo displayed (colorful, not monochrome)
- ✅ Text: "Sign in with Google" (proper casing, Google font)
- ✅ Border: subtle gray (#dadce0)
- ✅ Hover: light gray background (#f8f9fa)
- ✅ Matches Google branding guidelines
- ✅ Logo SVG inline or from trusted CDN

---

### AC2: OAuth Consent Screen Branding

**Given** I click "Sign in with Google"
**When** Google consent screen loads
**Then**:
- ✅ App name shows "Sudoku Race" (not Supabase ID)
- ✅ App logo displayed (if configured)
- ✅ Consistent branding with app

**Configuration**:
- Update Google Cloud Console → OAuth consent screen → Application name
- Set app logo (optional but recommended)

---

### AC3: Single Cell Focus (Desktop)

**Given** I'm on desktop using mouse + keyboard
**When** I click a cell then press arrow keys
**Then**:
- ✅ Only one cell highlighted at any time
- ✅ Arrow key navigation clears previous highlight
- ✅ Click sets selection correctly
- ✅ No dual focus rings or highlights

**Technical fix**:
- Remove focus-visible ring when selection changes via arrow keys
- Ensure click and keyboard navigation use same selection state

---

### AC4: Clue Cell Keyboard Indicator

**Given** I navigate grid with arrow keys
**When** I land on a clue cell (red/given number)
**Then**:
- ✅ Clue cell shows visual indicator (e.g., red border, subtle background)
- ✅ Clear I'm on that cell
- ✅ Different from user-entry cell selection (maintain distinction)
- ✅ Accessible (ARIA live region announces position)

**Styling**:
- Clue cell selected: `ring-2 ring-red-500` or `border-2 border-red-600`
- Maintain red text color for clue numbers
- Ensure contrast meets WCAG AA (4.5:1)

---

## Tasks / Subtasks

### Task 1: Google Button Redesign (AC1)

- [ ] Update `components/auth/AuthButtons.tsx`
- [ ] Add Google "G" logo SVG (inline or import)
- [ ] Apply official Google button styles:
  - White background, gray border
  - Text: "Sign in with Google"
  - Hover: light gray background
- [ ] Test on mobile + desktop
- [ ] Verify accessibility (ARIA label, focus states)

**File**: `components/auth/AuthButtons.tsx`

---

### Task 2: OAuth Consent Screen Config (AC2)

- [ ] Open Google Cloud Console → APIs & Credentials
- [ ] Navigate to OAuth consent screen
- [ ] Update "Application name" to "Sudoku Race"
- [ ] Add app logo (512x512 PNG recommended)
- [ ] Save and test OAuth flow
- [ ] Document config location in architecture.md

**Note**: This is a config change, not code. Include in DoD checklist.

---

### Task 3: Fix Dual Focus Bug (AC3)

- [ ] Update `components/puzzle/SudokuGrid.tsx`
- [ ] In `handleKeyDown`: Remove focus-visible styling on arrow key nav
- [ ] Option A: Call `blur()` on previously focused element
- [ ] Option B: Set `tabIndex={-1}` on all cells, manage focus manually
- [ ] Test: Click cell → arrow keys → verify single highlight
- [ ] Test on desktop (Firefox, Chrome, Safari)

**File**: `components/puzzle/SudokuGrid.tsx:123-155`

---

### Task 4: Clue Cell Focus Indicator (AC4)

- [ ] Update `SudokuCell` component in `SudokuGrid.tsx`
- [ ] Add conditional styling for clue cells when selected:
  ```tsx
  isSelected && isClue && "ring-2 ring-red-600"
  ```
- [ ] Ensure distinct from user-entry selection (blue ring)
- [ ] Test keyboard navigation over clues
- [ ] Verify ARIA announcements work

**File**: `components/puzzle/SudokuGrid.tsx:42-67`

---

### Task 5: Unit Tests (AC1,3,4)

- [ ] Update `AuthButtons.test.tsx`: Verify button styling, logo presence
- [ ] Update `SudokuGrid.test.tsx`: Test single focus, clue cell indicator
- [ ] Test keyboard navigation sequence
- [ ] ≥80% coverage maintained

---

### Task 6: Manual Testing (All ACs)

- [ ] Bug 1: Google button matches branding guidelines
- [ ] Bug 2: OAuth consent shows "Sudoku Race"
- [ ] Bug 3: No dual focus on desktop
- [ ] Bug 4: Clue cells show indicator on arrow nav
- [ ] Test on mobile + desktop
- [ ] Accessibility check (keyboard, screen reader)

---

## Definition of Done

### Code Quality
- [ ] TypeScript strict, ESLint passes, files <200 LOC

### Testing
- [ ] Unit tests passing, ≥80% coverage

### Functionality
- [ ] Google button styled correctly
- [ ] OAuth consent shows app name
- [ ] Single focus on grid navigation
- [ ] Clue cells show focus indicator

### UX
- [ ] Google button matches official branding
- [ ] Grid navigation smooth and clear
- [ ] Accessible (keyboard, ARIA)

### Configuration
- [ ] Google Cloud Console updated with app name

---

## Dev Notes

### Implementation Order

1. Google Button (Task 1) - Independent, quick win
2. Grid Fixes (Tasks 3, 4) - Related, tackle together
3. OAuth Config (Task 2) - Non-code, document in PR
4. Testing (Tasks 5, 6) - Validation

---

### Technical Details

**Google Button Spec** (from [branding guidelines](https://developers.google.com/identity/branding-guidelines)):

```tsx
// Official Google button styles
<button className="
  flex items-center justify-center gap-3
  bg-white hover:bg-gray-50
  border border-gray-300
  text-gray-700 font-medium
  px-6 py-3 rounded
  transition-colors
">
  <GoogleLogo className="w-5 h-5" />
  <span>Sign in with Google</span>
</button>
```

**Google "G" Logo SVG**:
```svg
<svg viewBox="0 0 48 48">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <!-- Other paths for full color logo -->
</svg>
```

Or use simple approach: text-only button with proper styling.

---

**Dual Focus Bug Fix**:

Root cause: SudokuGrid has `tabIndex={0}` and cells have `focus-visible` styles. Clicking cell triggers selection, but pressing arrow keys doesn't clear browser's focus-visible state.

**Solution**: Remove `focus-visible` ring from cells, rely entirely on `isSelected` state for visual feedback.

```tsx
// Remove this line from SudokuCell:
// "focus-visible:ring-2 focus-visible:ring-accent"

// Keep only isSelected styling
```

---

**Clue Cell Indicator**:

Current code (line 54-55):
```tsx
isSelected && !isClue && "ring-2 ring-accent ring-inset bg-blue-50"
```

Add separate clue styling:
```tsx
isSelected && isClue && "ring-2 ring-red-600 ring-inset"
isSelected && !isClue && "ring-2 ring-accent ring-inset bg-blue-50"
```

---

**Google OAuth Consent Config**:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select project
3. OAuth consent screen → Edit app
4. Update:
   - Application name: "Sudoku Race"
   - Application logo: Upload 512x512 PNG
   - Support email: your email
5. Save → Test OAuth flow

---

### Files to Modify

```
components/auth/AuthButtons.tsx       # Google button redesign
components/puzzle/SudokuGrid.tsx      # Grid focus fixes
```

### References

- Google button: `components/auth/AuthButtons.tsx:31-45`
- Grid component: `components/puzzle/SudokuGrid.tsx`
- OAuth setup: `docs/stories/3-2-oauth-authentication-google-github-apple.md`
- Branding: [Google Identity Guidelines](https://developers.google.com/identity/branding-guidelines)

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5-20250929

### Change Log

- **2025-12-04**: Story created. Bundles 4 UX bugs: Google button styling, OAuth branding, dual focus, clue cell indicator. Status: ready-for-dev.
