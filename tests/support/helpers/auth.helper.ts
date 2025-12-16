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
 * Sign in a user via API and set session in browser
 *
 * Creates an authenticated session programmatically for E2E tests.
 * This bypasses OAuth and uses Supabase cookies for SSR.
 */
export async function signInViaUI(
  page: Page,
  user: TestUser,
  options: { waitForNavigation?: boolean } = {}
): Promise<void> {
  const { waitForNavigation = true } = options;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required');
  }

  // Sign in via Supabase Auth API to get session
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to sign in: ${error}`);
  }

  const sessionData = await response.json();

  // Set Supabase session cookies
  const domain = new URL(supabaseUrl).hostname;
  const cookieBase = `sb-${domain.split('.')[0]}`;

  await page.context().addCookies([
    {
      name: `${cookieBase}-auth-token`,
      value: JSON.stringify(sessionData),
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  // Navigate to the app
  if (waitForNavigation) {
    await page.goto('/');
    await page.waitForTimeout(1500); // Wait for auth state to settle
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
  const userId = data.id;

  const publicUserResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      id: userId,
      email,
      username: email.split('@')[0],
      oauth_provider: 'test',
    }),
  });

  if (!publicUserResponse.ok) {
    const errorText = await publicUserResponse.text();
    console.warn(`Failed to create public user entry: ${errorText}`);
  }

  return {
    email,
    password,
    id: userId,
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
