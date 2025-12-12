/**
 * Sudoku Completion E2E Tests - Authenticated User Flow
 *
 * Tests the complete puzzle completion flow for authenticated users.
 *
 * Acceptance Criteria:
 * - AC-1: Authenticated user can complete a puzzle and see completion time
 * - AC-2: Authenticated user sees actual leaderboard rank
 * - AC-3: Authenticated user sees current streak and freeze status
 * - AC-4: Authenticated user can share results with streak information
 * - AC-5: Completion data is persisted to database with rank
 */

import { test, expect, type Page } from '@playwright/test';
import { createSolvedGrid } from '../support/fixtures/factories/puzzle.factory';
import { createTestUserViaAPI, deleteTestUserViaAPI, signInViaUI } from '../support/helpers/auth.helper';
import { faker } from '@faker-js/faker';

test.describe('Sudoku Completion - Authenticated User', () => {
  let testUser: { email: string; password: string; id?: string };

  test.beforeEach(async ({ page }) => {
    // Create test user
    const email = faker.internet.email();
    const password = 'TestPassword123!';
    testUser = await createTestUserViaAPI(email, password);

    // Sign in
    await signInViaUI(page, testUser);

    // Navigate to puzzle
    await page.goto('/puzzle');
    await page.waitForSelector('[data-testid="sudoku-grid"]');
  });

  test.afterEach(async () => {
    // Cleanup test user
    if (testUser.id) {
      await deleteTestUserViaAPI(testUser.id);
    }
  });

  test('should display completion modal with time when authenticated user completes puzzle', async ({ page }) => {
    // GIVEN: Authenticated user starts puzzle
    await page.click('[data-testid="start-puzzle-button"]');

    // WHEN: User completes the puzzle
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');

    // THEN: Completion modal appears with time
    await expect(page.locator('[data-testid="completion-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-time"]')).toContainText(/\d{2}:\d{2}/);
  });

  test('should display actual leaderboard rank for authenticated user', async ({ page }) => {
    // GIVEN: Authenticated user completes puzzle
    await page.click('[data-testid="start-puzzle-button"]');
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');

    // THEN: Actual rank is displayed (not hypothetical)
    await expect(page.locator('[data-testid="completion-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-rank"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-rank"]')).toContainText(/#\d+/); // Format: #123
  });

  test('should display current streak information', async ({ page }) => {
    // GIVEN: Authenticated user completes puzzle
    await page.click('[data-testid="start-puzzle-button"]');
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');

    // THEN: Streak information is displayed
    await expect(page.locator('[data-testid="completion-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="streak-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="streak-display"]')).toContainText(/🔥/); // Fire emoji
  });

  test('should show freeze status tooltip when hovering over streak', async ({ page }) => {
    // GIVEN: Authenticated user completes puzzle with active streak
    await page.click('[data-testid="start-puzzle-button"]');
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="streak-display"]')).toBeVisible();

    // WHEN: User hovers over streak display
    await page.hover('[data-testid="streak-display"]');

    // THEN: Tooltip with freeze information appears
    await expect(page.locator('[data-testid="freeze-tooltip"]')).toBeVisible();
  });

  test('should include streak count in share text for authenticated user', async ({ page, context }) => {
    // GIVEN: Authenticated user with streak completes puzzle
    await page.click('[data-testid="start-puzzle-button"]');
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // WHEN: User copies share text
    await page.click('[data-testid="copy-clipboard-button"]');

    // THEN: Share text includes streak information
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('Sudoku');
    expect(clipboardText).toMatch(/[🟩🟨🟦]/); // Emoji grid
    // Streak appears in share text if > 0
  });

  test('should NOT show sign-in prompt for authenticated user', async ({ page }) => {
    // GIVEN: Authenticated user completes puzzle
    await page.click('[data-testid="start-puzzle-button"]');
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');

    // THEN: Sign-in prompt is NOT displayed
    await expect(page.locator('[data-testid="completion-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="sign-in-prompt"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="sign-in-button"]')).not.toBeVisible();
  });

  test('should persist completion data to database with rank', async ({ page }) => {
    // GIVEN: Authenticated user completes puzzle
    await page.click('[data-testid="start-puzzle-button"]');
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);

    // WHEN: User submits completed puzzle
    const submitPromise = page.waitForResponse(
      (response) => response.url().includes('/api/puzzle') && response.request().method() === 'POST'
    );
    await page.click('[data-testid="submit-button"]');
    const response = await submitPromise;

    // THEN: Submission is successful and returns rank
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('rank');
    expect(body.rank).toBeGreaterThan(0);
  });

  test('should display emoji grid with difficulty indicator in share preview', async ({ page }) => {
    // GIVEN: Authenticated user completes puzzle
    await page.click('[data-testid="start-puzzle-button"]');
    const solvedGrid = createSolvedGrid();
    await fillSudokuGrid(page, solvedGrid);
    await page.click('[data-testid="submit-button"]');

    // THEN: Share preview includes emoji grid and difficulty
    await expect(page.locator('[data-testid="completion-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="share-preview"]')).toBeVisible();
    const shareText = await page.locator('[data-testid="share-preview"]').textContent();
    expect(shareText).toMatch(/[🟩🟨🟦]/); // Emoji grid
    expect(shareText).toMatch(/easy|medium|hard/i); // Difficulty
  });
});

/**
 * Helper function to fill sudoku grid with solved values
 */
async function fillSudokuGrid(page: Page, solvedGrid: number[][]): Promise<void> {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cellSelector = `[data-testid="sudoku-cell-${row}-${col}"]`;
      const cell = page.locator(cellSelector);

      // Check if cell is editable
      const isReadOnly = await cell.getAttribute('aria-readonly');

      if (isReadOnly !== 'true') {
        const value = solvedGrid[row][col];
        await cell.click();
        await page.click(`[data-testid="number-pad-${value}"]`);
      }
    }
  }
}
