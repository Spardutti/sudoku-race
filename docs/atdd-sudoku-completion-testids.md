# Required data-testid Attributes

Complete list of data-testid attributes required for sudoku completion E2E tests.

---

## Puzzle Page

### Grid and Cells

- `sudoku-grid` - Main sudoku grid container
- `sudoku-cell-{row}-{col}` - Individual sudoku cells (0-8 indexed)
  - Example: `sudoku-cell-0-0`, `sudoku-cell-4-7`
  - Must have `aria-readonly="true"` for given numbers
  - Must have `aria-readonly="false"` for editable cells

### Controls

- `number-pad-{value}` - Number pad buttons (1-9)
  - Example: `number-pad-1`, `number-pad-9`
- `start-puzzle-button` - Start puzzle button
- `submit-button` - Submit completed puzzle button

---

## Completion Modal

### Container

- `completion-modal` - Modal container (Dialog component)
- `completion-modal-close` - Close button or X icon

### Result Display

- `completion-time` - Completion time display (format: MM:SS)
- `user-rank` - Authenticated user rank display (format: #123)
- `hypothetical-rank-message` - Guest user hypothetical rank message
- `streak-display` - Streak count display with fire emoji (🔥)
- `freeze-tooltip` - Freeze status tooltip content

### Share

- `share-preview` - Share text preview container (includes emoji grid)
- `copy-clipboard-button` - Copy to clipboard button
- `twitter-share-button` - Twitter share button
- `whatsapp-share-button` - WhatsApp share button

### Authentication (Guest Only)

- `sign-in-prompt` - Sign-in prompt container
- `sign-in-button` - Sign-in button in completion modal

---

## Login Page (Authenticated Tests)

- `email-input` - Email input field
- `password-input` - Password input field
- `login-button` - Login submit button
- `user-menu` - User menu (appears after successful login)
- `sign-out-button` - Sign out button in user menu

---

## Implementation Examples

### SudokuGrid Component

```tsx
<div data-testid="sudoku-grid">
  {grid.map((row, rowIndex) =>
    row.map((cell, colIndex) => (
      <SudokuCell
        key={`${rowIndex}-${colIndex}`}
        data-testid={`sudoku-cell-${rowIndex}-${colIndex}`}
        aria-readonly={cell.isGiven}
        value={cell.value}
      />
    ))
  )}
</div>
```

### NumberPad Component

```tsx
{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
  <button
    key={num}
    data-testid={`number-pad-${num}`}
    onClick={() => handleNumberClick(num)}
  >
    {num}
  </button>
))}
```

### CompletionModal Component

```tsx
<Dialog open={isOpen} data-testid="completion-modal">
  <DialogContent>
    <button data-testid="completion-modal-close" onClick={onClose}>
      ×
    </button>

    <div data-testid="completion-time">
      {formatTime(completionTime)}
    </div>

    {isAuthenticated ? (
      <>
        <div data-testid="user-rank">#{rank}</div>
        {streakData && (
          <Tooltip>
            <TooltipTrigger>
              <div data-testid="streak-display">
                {streakData.currentStreak} day streak 🔥
              </div>
            </TooltipTrigger>
            <TooltipContent data-testid="freeze-tooltip">
              {freezeStatusMessage}
            </TooltipContent>
          </Tooltip>
        )}
      </>
    ) : (
      <>
        <div data-testid="hypothetical-rank-message">
          Nice time! You'd be rank #{hypotheticalRank} if you signed in
        </div>
        <div data-testid="sign-in-prompt">
          <button data-testid="sign-in-button">Sign In</button>
        </div>
      </>
    )}

    <div data-testid="share-preview">{shareText}</div>

    <button data-testid="copy-clipboard-button">Copy</button>
    <button data-testid="twitter-share-button">Twitter</button>
    <button data-testid="whatsapp-share-button">WhatsApp</button>
  </DialogContent>
</Dialog>
```

### StartScreen Component

```tsx
<button data-testid="start-puzzle-button" onClick={onStart}>
  Start Puzzle
</button>
```

### SubmitButton Component

```tsx
<button data-testid="submit-button" onClick={onSubmit} disabled={!isComplete}>
  Submit
</button>
```

---

## Checklist

- [ ] `sudoku-grid` added to grid container
- [ ] `sudoku-cell-{row}-{col}` added to all 81 cells
- [ ] `aria-readonly` attribute on all cells
- [ ] `number-pad-{1-9}` added to number pad buttons
- [ ] `start-puzzle-button` added to start button
- [ ] `submit-button` added to submit button
- [ ] `completion-modal` added to modal container
- [ ] `completion-modal-close` added to close button
- [ ] `completion-time` added to time display
- [ ] `user-rank` added for authenticated users
- [ ] `hypothetical-rank-message` added for guests
- [ ] `streak-display` added for authenticated streak
- [ ] `freeze-tooltip` added to tooltip content
- [ ] `share-preview` added to share text container
- [ ] `copy-clipboard-button` added to copy button
- [ ] `twitter-share-button` added to Twitter button
- [ ] `whatsapp-share-button` added to WhatsApp button
- [ ] `sign-in-prompt` added for guest users
- [ ] `sign-in-button` added to sign-in button
- [ ] Login page data-testids added (email-input, password-input, login-button)

---

**Total data-testids required:** 20+ attributes across 8 components
