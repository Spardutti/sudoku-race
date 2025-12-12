import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load test environment variables from .env.test
dotenv.config({ path: '.env.test' });

/**
 * Playwright configuration for sudoku-race E2E tests
 *
 * Key patterns:
 * - Timeouts: action 15s, navigation 30s, test 60s
 * - Artifacts: failure-only (screenshots, videos, traces)
 * - Workers: parallel in local, serial in CI (Supabase constraint)
 * - Network-first: intercept routes BEFORE navigation
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // Retries: 2 in CI for flake tolerance, 0 locally for fast feedback
  retries: process.env.CI ? 2 : 0,

  // Workers: 1 in CI (shared Supabase), parallel locally
  workers: process.env.CI ? 1 : undefined,

  // Timeouts
  timeout: 60 * 1000, // Test timeout: 60s
  expect: {
    timeout: 15 * 1000, // Assertion timeout: 15s
  },

  use: {
    // Base URL from environment or default to local dev
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Artifacts: failure-only to reduce storage overhead
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Action and navigation timeouts
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
  },

  // Reporters: HTML for local debugging, JUnit for CI integration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  // Browser projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment for multi-browser testing:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Web server: start Next.js dev server if not already running
  webServer: {
    command: 'npm run dev:app',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for Next.js + Supabase startup
  },
});
