# Story 2.9: Pause Controls & Manual Start

**Story ID**: 2.9
**Epic**: Epic 2 - Core Puzzle Experience
**Story Key**: 2-9-pause-controls-manual-start
**Status**: ready-for-dev
**Created**: 2025-12-04

---

## User Story Statement

**As a** player
**I want** to pause the puzzle and manually start when I'm ready
**So that** I can take breaks without losing progress and prepare myself before starting the timer

**Value**: Removes pressure to start immediately and allows breaks during long puzzles. Control over timing start and ability to pause for interruptions.

---

## Requirements Context

### User Requirements

**Manual Start:**
- No auto-start on page load
- Welcome message + "Start" button
- Timer begins only when clicked
- Puzzle visible but blurred until started

**Pause:**
- Pause button during play
- On pause: blur grid, pause client + server timers
- Resume button to continue
- Persists across refresh

### Architecture Alignment

**State**: Extend `lib/stores/puzzleStore.ts` with `isPaused`, `isStarted`, `pausedAt`
**Server**: Add pause/resume actions in `actions/puzzle/timer.ts`
**Components**: `StartScreen.tsx`, `PauseOverlay.tsx`, `PauseButton.tsx`

### Dependencies

- ✅ Story 2.2: Grid component
- ✅ Story 2.4: Auto-save + persistence
- ✅ Story 2.5: Timer + server validation

---

## Acceptance Criteria

### AC1: Manual Start Screen
**When** page loads first time
**Then**: Grid blurred (blur(8px)), welcome overlay, "Start" button, timer 00:00, grid non-interactive

### AC2: Start Puzzle
**When** click "Start"
**Then**: Overlay fades, grid unblurs, timer starts, server timer starts (auth), state saved

### AC3: Pause Button
**When** playing
**Then**: Pause button visible, accessible, ARIA labeled

### AC4: Pause Puzzle
**When** click pause
**Then**: Grid blurs, timers stop (client + server), non-interactive, pause overlay, "Resume" button

### AC5: Resume Puzzle
**When** click "Resume"
**Then**: Unblur, timers resume, interactive, state saved

### AC6: Keyboard Shortcut
**When** press 'P'
**Then**: Toggle pause/resume

### AC7: Persistence
**When** refresh
**Then**: Restore correct state (not started / paused / active)

### AC8: Server Timer
**When** start/pause/resume
**Then**: Server tracks events, excludes pause time from total

### AC9: Guest Support
**Then**: Client-side pause works, localStorage persistence

### AC10: Completed Puzzle
**Then**: Skip start screen, no pause button

---

## Tasks / Subtasks

### Task 1: Extend Puzzle Store (AC2,4,5,7,9)
- [ ] Add: `isStarted`, `isPaused`, `pausedAt` to state
- [ ] Add actions: `startPuzzle`, `pausePuzzle`, `resumePuzzle`
- [ ] Persist new fields
- [ ] Test store

**File**: `lib/stores/puzzleStore.ts`

### Task 2: Server Actions (AC4,5,8)
- [ ] Create `pauseTimer(puzzleId)` action
- [ ] Create `resumeTimer(puzzleId)` action
- [ ] Track events in DB (JSONB column on `completions`)
- [ ] Modify validation to exclude pause time
- [ ] Test calculation

**Files**: `actions/puzzle/timer.ts`, `supabase/migrations/20251204_timer_events.sql`

### Task 3: StartScreen Component (AC1,2)
- [ ] Create `components/puzzle/StartScreen.tsx`
- [ ] Welcome message, puzzle number, Start button
- [ ] Overlay with backdrop blur
- [ ] Fade out animation
- [ ] Test

### Task 4: PauseOverlay Component (AC4,5)
- [ ] Create `components/puzzle/PauseOverlay.tsx`
- [ ] "Paused" message, Resume button
- [ ] Match StartScreen styling
- [ ] Test

### Task 5: PauseButton Component (AC3,6)
- [ ] Create `components/puzzle/PauseButton.tsx`
- [ ] Pause icon, ARIA label
- [ ] Test

### Task 6: Modify Timer Hook (AC4,5,8)
- [ ] Update `lib/hooks/useTimer.ts`
- [ ] Respect `isPaused` and `isStarted`
- [ ] Server sync on pause/resume
- [ ] Test

### Task 7: Modify PuzzlePageClient (AC1,2,4,5,6,7,10)
- [ ] Update `components/puzzle/PuzzlePageClient.tsx`
- [ ] Conditional rendering: StartScreen / PauseOverlay / Active
- [ ] Disable grid when paused/not started
- [ ] 'P' key listener
- [ ] Handle completed state
- [ ] Test all transitions

### Task 8: Grid Blur (AC1,4,5)
- [ ] Modify `components/puzzle/SudokuGrid.tsx`
- [ ] Add `isBlurred` prop, apply filter
- [ ] Disable pointer events when blurred
- [ ] Test

### Task 9: Database Migration (AC8)
- [ ] Add `timer_events JSONB` to `completions`
- [ ] Update RLS
- [ ] Test migration

### Task 10: Unit Tests
- [ ] StartScreen, PauseOverlay, PauseButton tests
- [ ] Store tests for pause actions
- [ ] Timer hook pause tests
- [ ] Update PuzzlePageClient tests
- [ ] ≥80% coverage

### Task 11: E2E Tests
- [ ] Load → Start → Timer runs
- [ ] Pause → Blur → Resume
- [ ] Pause → Refresh → Resume
- [ ] 'P' key toggle

### Task 12: Manual Testing
- [ ] Mobile + desktop
- [ ] Blur quality, animations
- [ ] Accessibility
- [ ] Completed puzzle flow

---

## Definition of Done

### Code Quality
- [ ] TypeScript strict, ESLint passes, files <200 LOC

### Testing
- [ ] Unit + E2E passing, ≥80% coverage

### Functionality
- [ ] Start screen, pause/resume, server tracking, keyboard, persistence all work

### UX
- [ ] Blur clear, animations smooth, accessible, newspaper aesthetic

---

## Dev Notes

### Implementation Order
1. Store → Server Actions → Database → Components → Timer Hook → Grid Blur → Integration → Testing

### Technical Decisions

**Manual Start**: Reduces pressure, allows prep (industry standard)
**Blur on Pause**: Clear feedback, prevents "pause and study" cheating
**Server Tracking**: Anti-cheat, leaderboard integrity

**State**:
- `isStarted`: false until Start clicked
- `isPaused`: true when paused
- `pausedAt`: timestamp for duration calc

**Keyboard**: 'P' = Pause (mnemonic, no conflicts)

### Timer Events Schema (JSONB)

```sql
ALTER TABLE completions ADD COLUMN timer_events JSONB DEFAULT '[]';

-- Example:
[
  { "type": "start", "timestamp": "2025-12-04T10:00:00Z" },
  { "type": "pause", "timestamp": "2025-12-04T10:05:00Z" },
  { "type": "resume", "timestamp": "2025-12-04T10:07:00Z" }
]
```

### Active Time Calculation

```typescript
function calculateActiveTime(events: TimerEvent[]): number {
  let totalActive = 0;
  let lastStart: Date | null = null;

  for (const event of events) {
    if (event.type === 'start' || event.type === 'resume') {
      lastStart = event.timestamp;
    } else if (event.type === 'pause' || event.type === 'complete') {
      if (lastStart) {
        totalActive += event.timestamp.getTime() - lastStart.getTime();
        lastStart = null;
      }
    }
  }
  return Math.floor(totalActive / 1000);
}
```

### State Transitions

```
NOT_STARTED → ACTIVE → PAUSED → ACTIVE → COMPLETED
```

### Anti-Cheat

- Track total pause time, flag if > active time
- Alert if pause count > 20
- Consider max pause duration (10 min auto-resume)

### Files to Create

```
components/puzzle/StartScreen.tsx
components/puzzle/PauseOverlay.tsx
components/puzzle/PauseButton.tsx
actions/puzzle/timer.ts
supabase/migrations/20251204_timer_events.sql
```

### Files to Modify

```
lib/stores/puzzleStore.ts
lib/hooks/useTimer.ts
components/puzzle/PuzzlePageClient.tsx
components/puzzle/SudokuGrid.tsx
components/puzzle/PuzzleHeader.tsx
```

### References

- Timer: `components/puzzle/Timer.tsx` (Story 2.5)
- Store: `lib/stores/puzzleStore.ts` (Story 2.4)
- Grid: `components/puzzle/SudokuGrid.tsx` (Story 2.2)
- Architecture: `docs/architecture.md#Timer-Validation`

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5-20250929

### Change Log

- **2025-12-04**: Story created. Pause with blur + timer stop, manual start with welcome screen. Status: ready-for-dev.
