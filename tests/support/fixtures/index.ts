/**
 * Test Fixtures
 *
 * Fixtures provide auto-setup and auto-cleanup for tests.
 * Use mergeTests to compose multiple fixtures together.
 *
 * Pattern: Pure function → fixture → mergeTests composition
 *
 * Example usage:
 *   import { test, expect } from '../support/fixtures';
 *
 *   test('my test', async ({ page, authenticatedUser }) => {
 *     // authenticatedUser is ready to use, cleanup happens automatically
 *   });
 */

import { test as base } from '@playwright/test';

// Base test export with custom fixtures
export const test = base;

export { expect } from '@playwright/test';
