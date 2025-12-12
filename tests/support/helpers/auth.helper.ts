/**
 * Authentication Helpers
 *
 * Utilities for authenticating users in E2E tests.
 * Handles Supabase auth flows.
 */

import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  id?: string;
}

/**
 * Sign in a user via UI
 *
 * Navigates to login page and submits credentials.
 * Waits for successful navigation to confirm authentication.
 */
export async function signInViaUI(
  page: Page,
  user: TestUser,
  options: { waitForNavigation?: boolean } = {}
): Promise<void> {
  const { waitForNavigation = true } = options;

  await page.goto('/login');

  // Fill credentials
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);

  // Submit
  await page.click('[data-testid="login-button"]');

  // Wait for navigation to dashboard or home
  if (waitForNavigation) {
    await page.waitForURL(/\/(dashboard|puzzle)/);
  }
}

/**
 * Sign out a user via UI
 */
export async function signOutViaUI(page: Page): Promise<void> {
  // Open user menu
  await page.click('[data-testid="user-menu"]');

  // Click sign out
  await page.click('[data-testid="sign-out-button"]');

  // Wait for redirect to home
  await page.waitForURL('/');
}

/**
 * Check if user is authenticated
 *
 * Returns true if authentication indicators are present.
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.waitFor({ state: 'visible', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Create test user via API
 *
 * Uses Supabase Admin API to create user for testing.
 * Requires SUPABASE_SERVICE_ROLE_KEY in environment.
 */
export async function createTestUserViaAPI(
  email: string,
  password: string
): Promise<TestUser> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for user creation'
    );
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create test user: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    email,
    password,
    id: data.id,
  };
}

/**
 * Delete test user via API
 *
 * Cleans up test user after test completion.
 */
export async function deleteTestUserViaAPI(userId: string): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for user deletion'
    );
  }

  const response = await fetch(
    `${supabaseUrl}/auth/v1/admin/users/${userId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
    }
  );

  if (!response.ok) {
    console.warn(`Failed to delete test user ${userId}: ${response.statusText}`);
  }
}
