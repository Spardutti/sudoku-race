/**
 * Example E2E Test
 *
 * Demonstrates Playwright test patterns:
 * - Given-When-Then structure
 * - Network-first approach (intercept BEFORE navigation)
 * - data-testid selectors
 * - Explicit assertions
 */

import { test, expect } from '../support/fixtures';

test.describe('Example Test Suite', () => {
  test('should load homepage', async ({ page }) => {
    // GIVEN: User navigates to homepage
    await page.goto('/');

    // THEN: Page loads successfully
    await expect(page).toHaveTitle(/Sudoku/i);
  });

  test('should navigate to puzzle page', async ({ page }) => {
    // GIVEN: User is on homepage
    await page.goto('/');

    // WHEN: User clicks puzzle link
    await page.click('[data-testid="play-button"]');

    // THEN: Puzzle page loads
    await expect(page).toHaveURL(/\/puzzle/);
  });
});
