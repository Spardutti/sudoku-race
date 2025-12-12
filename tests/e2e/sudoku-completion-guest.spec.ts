/**
 * Sudoku Completion E2E Tests - Guest User Flow
 *
 * Tests the complete puzzle completion flow for unauthenticated users.
 *
 * Acceptance Criteria:
 * - AC-1: Guest user can complete a puzzle and see completion time
 * - AC-2: Guest user sees hypothetical rank (what rank they would have if signed in)
 * - AC-3: Guest user can share results via Twitter, WhatsApp, clipboard
 * - AC-4: Guest user sees sign-in prompt with benefits
 * - AC-5: Completion modal displays emoji grid visualization
 */

import { test, expect, type Page } from '@playwright/test';
import { createSolvedGrid } from '../support/fixtures/factories/puzzle.factory';

test.describe('Sudoku Completion - Guest User', () => {
  test.beforeEach(async ({ page }) => {
    // GIVEN: Guest user navigates to puzzle page
    await page.goto('/puzzle');

    // Wait for puzzle to load
    await page.waitForSelector('[data-testid="sudoku-grid"]');
  });

  test('should display completion modal with time when puzzle is completed', async ({ page }) => {
    // GIVEN: Puzzle is loaded and started
    await page.click('[data-testid="start-puzzle-button"]');

    // WHEN: User completes the puzzle with correct solution
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');

    // THEN: Completion modal appears with completion time
    await expect(page.locator('[data-testid="completion-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-time"]')).toContainText(/\d{2}:\d{2}/); // Format: MM:SS
  });

  test('should display hypothetical rank for guest user', async ({ page }) => {
    // GIVEN: Puzzle is completed by guest user
    await page.click('[data-testid="start-puzzle-button"]');
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');

    // THEN: Hypothetical rank is displayed
    await expect(page.locator('[data-testid="completion-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="hypothetical-rank-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="hypothetical-rank-message"]')).toContainText(/rank/i);
  });

  test('should display sign-in prompt for guest user', async ({ page }) => {
    // GIVEN: Puzzle is completed by guest user
    await page.click('[data-testid="start-puzzle-button"]');
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');

    // THEN: Sign-in prompt is displayed with benefits
    await expect(page.locator('[data-testid="completion-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="sign-in-prompt"]')).toBeVisible();
    await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
  });

  test('should display emoji grid visualization in share preview', async ({ page }) => {
    // GIVEN: Puzzle is completed
    await page.click('[data-testid="start-puzzle-button"]');
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');

    // THEN: Emoji grid is displayed in share preview
    await expect(page.locator('[data-testid="completion-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="share-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="share-preview"]')).toContainText(/[🟩🟨🟦]/); // Contains emoji
  });

  test('should copy share text to clipboard when copy button is clicked', async ({ page, context }) => {
    // GIVEN: Puzzle is completed
    await page.click('[data-testid="start-puzzle-button"]');
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // WHEN: User clicks copy to clipboard button
    await page.click('[data-testid="copy-clipboard-button"]');

    // THEN: Share text is copied to clipboard
    await expect(page.locator('[data-testid="copy-clipboard-button"]')).toContainText(/copied/i);

    // Verify clipboard content contains puzzle number and emoji grid
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('Sudoku');
    expect(clipboardText).toMatch(/[🟩🟨🟦]/);
  });

  test('should open Twitter share when Twitter button is clicked', async ({ page, context }) => {
    // GIVEN: Puzzle is completed
    await page.click('[data-testid="start-puzzle-button"]');
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');

    // WHEN: User clicks Twitter share button
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.click('[data-testid="twitter-share-button"]'),
    ]);

    // THEN: Twitter share window opens with correct URL
    await popup.waitForLoadState();
    expect(popup.url()).toContain('twitter.com/intent/tweet');
    await popup.close();
  });

  test('should open WhatsApp share when WhatsApp button is clicked', async ({ page, context }) => {
    // GIVEN: Puzzle is completed
    await page.click('[data-testid="start-puzzle-button"]');
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');

    // WHEN: User clicks WhatsApp share button
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.click('[data-testid="whatsapp-share-button"]'),
    ]);

    // THEN: WhatsApp share window opens with correct URL
    await popup.waitForLoadState();
    expect(popup.url()).toContain('wa.me');
    await popup.close();
  });

  test('should close completion modal when close button is clicked', async ({ page }) => {
    // GIVEN: Completion modal is displayed
    await page.click('[data-testid="start-puzzle-button"]');
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="completion-modal"]')).toBeVisible();

    // WHEN: User clicks close button
    await page.click('[data-testid="completion-modal-close"]');

    // THEN: Modal is closed
    await expect(page.locator('[data-testid="completion-modal"]')).not.toBeVisible();
  });
});

/**
 * Helper function to fill sudoku grid with solved values
 *
 * Fills all empty cells in the grid with values from the solved grid.
 */
async function fillSudokuGrid(page: Page, solvedGrid: number[][]): Promise<void> {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cellSelector = `[data-testid="sudoku-cell-${row}-${col}"]`;
      const cell = page.locator(cellSelector);

      // Check if cell is editable (not a given number)
      const isReadOnly = await cell.getAttribute('aria-readonly');

      if (isReadOnly !== 'true') {
        const value = solvedGrid[row][col];

        // Click cell to select it
        await cell.click();

        // Fill value using number pad or keyboard
        await page.click(`[data-testid="number-pad-${value}"]`);
      }
    }
  }
}
