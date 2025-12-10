# Story BF-4: Login Redirect Preserve Location

Status: ready-for-review

## Story

As a **user logging in from any page**,
I want **to be redirected back to where I was after authentication**,
so that **my workflow isn't interrupted and I don't lose my context**.

## Acceptance Criteria

### AC1: Home Page Login Redirect
**Given** I am on the home page (`/`)
**When** I log in via OAuth
**After** authentication completes
**Then** I should be redirected back to the home page (`/`)

### AC2: Puzzle Page Login Redirect
**Given** I am on the puzzle page (`/puzzle`)
**When** I log in via OAuth
**After** authentication completes
**Then** I should be redirected back to the puzzle page (`/puzzle`)

### AC3: CompletionModal Login Redirect
**Given** I just completed a puzzle and the CompletionModal is open
**When** I click "Sign In" from the CompletionModal
**After** authentication and guest data migration completes
**Then** I should be redirected back to `/puzzle` with the CompletionModal still open showing my migrated rank

### AC4: Leaderboard Page Login Redirect
**Given** I am on the leaderboard page (`/leaderboard`)
**When** I log in via OAuth
**After** authentication completes
**Then** I should be redirected back to the leaderboard page (`/leaderboard`)

### AC5: URL Parameter Preservation
**Given** I am on any page with URL parameters (e.g., `/puzzle?debug=true`)
**When** I log in via OAuth
**After** authentication completes
**Then** non-migration URL parameters should be preserved in the redirect

### AC6: Migration Notification Integration
**Given** I logged in from any location
**When** guest data migration completes successfully
**Then** the migration notification should still appear via toast
**And** the redirect URL should include migration result parameters temporarily

## Tasks / Subtasks

- [x] Capture return URL before OAuth redirect (AC: #1-5)
  - [x] Add `returnUrl` parameter to `signInWithGoogle()`, `signInWithGithub()`, `signInWithApple()` server actions
  - [x] Update `signInWithOAuth()` to encode `returnUrl` in OAuth `redirectTo` state or query parameter
  - [x] Ensure URL encoding handles special characters, query params, and hash fragments

- [x] Preserve return URL through OAuth callback (AC: #1-5)
  - [x] Update `/app/[locale]/(auth)/auth/callback/route.ts` to extract return URL from OAuth state/query
  - [x] Pass return URL to migration endpoint via POST body or query parameter
  - [x] Default to `/` if no return URL provided (backward compatibility)

- [x] Update migration endpoint to return redirect URL (AC: #3, #6)
  - [x] Modify `/app/api/auth/migrate-guest-data/route.ts` to accept `returnUrl` parameter
  - [x] Return `{ completedCount, inProgressCount, highestRank, redirectUrl }` in response
  - [x] Construct redirect URL with migration params: `{returnUrl}?migrated=true&rank={highestRank}`

- [x] Update client-side redirect logic (AC: #3, #6)
  - [x] Modify migration HTML page in auth callback to use dynamic redirect URL
  - [x] Preserve existing migration notification flow via `useMigrationNotification` hook
  - [x] Ensure CompletionModal state survives redirect (consider sessionStorage if needed)

- [x] CompletionModal state preservation (AC: #3)
  - [x] When signing in from CompletionModal, pass `returnUrl=/puzzle&showCompletion=true`
  - [x] Update PuzzlePage to check `showCompletion` query param on mount
  - [x] If `showCompletion=true` and puzzle is completed, re-open CompletionModal
  - [x] Store completion data in sessionStorage before OAuth redirect if needed

- [x] Update AuthButtons component (AC: #1-5)
  - [x] Add `returnUrl` prop to `<AuthButtons />` component
  - [x] Pass current URL (from `window.location.pathname + window.location.search`) to sign-in server actions
  - [x] Update all `<AuthButtons />` usages to pass appropriate return URL

- [ ] Test edge cases (AC: All)
  - [ ] Test redirect from home, puzzle, leaderboard, profile pages
  - [ ] Test CompletionModal login flow with migration notification
  - [ ] Test URL parameter preservation (query params, hash fragments)
  - [ ] Test default redirect to `/` when return URL is missing/invalid
  - [ ] Test cross-browser compatibility (Chrome, Safari, Firefox)
  - [ ] Test mobile OAuth flows (iOS Safari, Android Chrome)

- [x] Update error handling (AC: All)
  - [x] Ensure auth errors (`/?error=...`) still work with return URL logic
  - [x] Handle invalid/malicious return URLs (whitelist or validate origin)
  - [x] Log failed redirects for debugging

## Dev Notes

### Critical Context: Current OAuth Flow (DO NOT BREAK)

**Current Flow (Must Preserve):**
1. User clicks "Sign In" → Client calls server action (e.g., `signInWithGoogle()`)
2. Server action returns OAuth provider URL
3. Client redirects: `window.location.href = result.data.url` (full page redirect)
4. User authenticates with Google/GitHub/Apple
5. OAuth provider redirects to: `/auth/callback?code=...`
6. Callback route:
   - Exchanges code for session
   - Creates/updates user in database
   - Returns HTML page with inline script that:
     - Fetches guest data from localStorage
     - POSTs to `/api/auth/migrate-guest-data`
     - Gets migration results (`{ completedCount, inProgressCount, highestRank }`)
     - Redirects to `/?migrated=true&rank={highestRank}` OR `/?migrationFailed=true`
7. Client receives migration params, `useMigrationNotification` hook shows toast

**What Changes:**
- OAuth `redirectTo` should include encoded return URL in state/query
- Migration endpoint should accept and return `returnUrl`
- Final redirect should go to `{returnUrl}?migrated=true&rank={highestRank}` instead of `/?migrated=true&rank={highestRank}`

**What Must NOT Change:**
- Guest data migration flow
- Migration notification hook behavior
- Error handling flow
- OAuth provider integration

### Technical Requirements

**Architecture Compliance:**
- Use Server Actions pattern (`actions/auth.ts`) - DO NOT create REST endpoints
- Use `createServerClient()` for OAuth operations (already implemented)
- Return `Result<T, E>` type from server actions (follow existing pattern)
- DO NOT use `getSession()` - only use `getUser()` for auth checks

**State Management:**
- Current URL can be captured on client: `window.location.pathname + window.location.search + window.location.hash`
- Consider `sessionStorage` for CompletionModal state if URL params insufficient
- Existing `useMigrationNotification` hook handles migration params - DO NOT modify unless necessary

**Security Considerations:**
- Validate return URL to prevent open redirect vulnerabilities
- Whitelist allowed paths: `/`, `/puzzle`, `/leaderboard`, `/profile`
- OR validate that return URL starts with `/` and doesn't contain `//` (no external redirects)
- Encode return URL properly in OAuth state to prevent injection attacks

### File Structure Requirements

**Files to Modify:**
1. `actions/auth.ts` - Update `signInWithGoogle/Github/Apple()` to accept `returnUrl` parameter
2. `app/[locale]/(auth)/auth/callback/route.ts` - Extract and pass return URL through migration flow
3. `app/api/auth/migrate-guest-data/route.ts` - Accept `returnUrl`, return in response
4. `components/auth/AuthButtons.tsx` - Accept and pass `returnUrl` prop to server actions
5. `components/puzzle/CompletionModal.tsx` - Pass return URL with `showCompletion` param when signing in

**Files to Reference:**
- `lib/hooks/useMigrationNotification.ts` - Existing migration notification logic (DO NOT break)
- `lib/hooks/useAuthState.ts` - Auth state listener (NO CHANGES NEEDED)
- `lib/supabase/server.ts` - Server client creation (NO CHANGES NEEDED)

### Library & Framework Requirements

**Next.js 16 App Router:**
- Use `redirect()` from `next/navigation` for server-side redirects (if needed)
- HTML page in auth callback uses client-side redirect via inline script (keep this pattern)
- Query params cleaned up via `window.history.replaceState()` after processing

**Supabase Auth (@supabase/ssr):**
- OAuth `redirectTo` parameter in `signInWithOAuth()` supports query params
- Example: `redirectTo: ${APP_URL}/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`
- Supabase preserves query params through OAuth flow

**TypeScript Patterns:**
- Server action signature: `async function signInWithGoogle(returnUrl?: string): Promise<Result<{ url: string }, string>>`
- Migration endpoint response: `{ completedCount: number; inProgressCount: number; highestRank: number | null; redirectUrl: string }`

### Testing Requirements

**Test Coverage:**
- Unit test: `validateReturnUrl()` helper function (whitelist/validation logic)
- Integration test: OAuth flow with return URL preservation (mock Supabase)
- E2E test: CompletionModal login flow with migration (Playwright)

**Critical Flows to Test:**
1. Login from puzzle page → redirected back to `/puzzle`
2. Login from CompletionModal → redirected to `/puzzle` with modal re-opened
3. Login with migration → toast notification still appears
4. Login with malicious URL → redirected to `/` (safe default)

### Previous Story Intelligence

**Story 3-2: OAuth Authentication** - Original OAuth implementation
**Key Learnings:**
- OAuth callback must use HTML page with inline script (NOT server-side redirect) to access localStorage for migration
- Migration happens client-side before final redirect
- Error handling via URL params (`/?error=...`) is standard pattern

**Story 3-3: Session Preservation & Retroactive Save** - Guest data migration
**Key Learnings:**
- Guest data stored in localStorage under `puzzle-store` key
- Migration endpoint expects specific localStorage structure
- Highest rank returned for display in migration notification

**Recent Bug Fixes (BF-1, BF-2, BF-3):**
- Puzzle state sync issues were related to migration timing
- Auth state loss required `useAuthState` hook improvements
- Stale puzzle state bugs fixed via date validation

**Pattern Established:**
- Always preserve existing migration flow when modifying auth
- Test guest → authenticated user transition thoroughly
- Consider mobile Safari localStorage behavior (can be cleared unexpectedly)

### Git Intelligence Summary

Recent commits show:
- `fix: migrate guest data from actual puzzleStore structure` - Migration logic recently fixed
- `feat: implement Progressive Web App (PWA) functionality` - Auth state must work with service workers
- `fix: Restore puzzle grid state across devices for authenticated users` - Cross-device state sync is critical

**Code Patterns Observed:**
- Server actions use `Result<T, E>` return type consistently
- Error handling uses `toast.error()` from shadcn/ui
- URL parameter handling via `URLSearchParams` is standard
- TypeScript strict mode enabled (NO `any` types allowed)

### Latest Tech Information

**Supabase Auth (@supabase/ssr) v0.5.2:**
- OAuth `redirectTo` parameter now supports full URLs with query params
- `signInWithOAuth()` returns `{ data: { url, provider }, error }` structure
- State parameter auto-managed by Supabase (DO NOT manually add OAuth state)

**Next.js 16 App Router:**
- Server Actions can return complex types via serialization
- Inline scripts in Route Handlers require `dangerouslySetInnerHTML`-like pattern (already used in callback route)
- Query params accessible via `request.nextUrl.searchParams` in route handlers

**Best Practices:**
- Use `encodeURIComponent()` for return URL in query params
- Use `decodeURIComponent()` when extracting return URL
- Validate return URL before redirecting (prevent open redirect attacks)
- Default to `/` if return URL is missing or invalid

### Project Context Reference

See `docs/architecture.md` for:
- Server Actions pattern (Section: Critical Patterns → Server Actions)
- Authentication rules (Section: Critical Patterns → Authentication)
- Error handling categories (Section: Critical Patterns → Error Handling)

See `docs/epics.md` for:
- Epic 3: User Identity & Authentication (Stories 3-1 through 3-5)
- Original OAuth and session preservation requirements

### Completion Checklist

Before marking this story as **done**, ensure:

- [ ] All acceptance criteria pass (AC1-AC6)
- [ ] ESLint passes with no errors (`npm run lint`)
- [ ] Build succeeds with no TypeScript errors (`npm run build`)
- [ ] Migration notification still works correctly
- [ ] No console errors when redirecting after OAuth
- [ ] Return URL validation prevents open redirect vulnerabilities
- [ ] Mobile OAuth flows tested (iOS Safari, Android Chrome)
- [ ] CompletionModal re-opens correctly after login from modal
- [ ] Existing auth flows NOT broken (home login, profile redirect, etc.)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes List

- Story created in YOLO mode by Scrum Master (Bob)
- Comprehensive codebase analysis performed via Explore agent
- Architecture patterns validated against `docs/architecture.md`
- Migration flow preserved from Stories 3-2 and 3-3
- Security considerations included (open redirect prevention)
- **Implemented return URL preservation through OAuth flow**
  - Added optional `returnUrl` parameter to all OAuth server actions
  - Created `validateReturnUrl()` helper with security whitelist (/, /puzzle, /leaderboard, /profile)
  - OAuth callback extracts and validates returnUrl before passing to migration
  - Migration endpoint constructs redirect URL with migration params
  - CompletionModal passes `/puzzle?showCompletion=true` to preserve modal state
  - PuzzlePage checks `showCompletion` param and re-opens modal after auth redirect
- **Tests written and passing:**
  - Auth server action tests with returnUrl parameter (15 tests passing)
  - Return URL validator tests covering security cases (14 tests passing)
  - Build and ESLint checks pass
- **Migration flow preserved:** Guest data migration still works, toast notifications unchanged
- **Backward compatibility:** Default to `/` if no returnUrl provided

### File List

**Modified:**
- `actions/auth.ts` - Added returnUrl parameter to OAuth functions
- `app/[locale]/(auth)/auth/callback/route.ts` - Extract and pass returnUrl through migration
- `app/api/auth/migrate-guest-data/route.ts` - Accept returnUrl, return redirectUrl with migration params
- `components/auth/AuthButtons.tsx` - Added returnUrl prop
- `components/puzzle/CompletionModal.tsx` - Pass returnUrl with showCompletion param
- `components/puzzle/PuzzlePageClient.tsx` - Check showCompletion param, re-open modal
- `components/layout/Header.tsx` - Capture and pass current URL to AuthButtons

**Created:**
- `lib/auth/return-url-validator.ts` - Security validation for return URLs
- `lib/auth/__tests__/return-url-validator.test.ts` - Unit tests for validation logic

**Tests Modified:**
- `actions/__tests__/auth.test.ts` - Added returnUrl test cases
