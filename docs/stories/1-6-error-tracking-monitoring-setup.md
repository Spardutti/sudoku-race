# Story 1.6: Error Tracking & Monitoring Setup

Status: ready-for-dev

## Story

As a **developer**,
I want **comprehensive error tracking and monitoring infrastructure**,
So that **I can quickly identify and fix issues, ensure reliability, and maintain high performance for users**.

## Acceptance Criteria

### AC-1.6.1: Error Tracking Integration (Sentry)

- [ ] Sentry SDK installed and configured (`@sentry/nextjs`)
- [ ] Sentry initialization in `lib/monitoring/sentry.ts`
- [ ] Error tracking configured for:
  - Client-side JavaScript errors
  - Server Action failures
  - API route errors
  - Real-time connection errors
- [ ] Sentry DSN configured in environment variables
- [ ] Error context includes: userId, puzzleId, action name, stack trace
- [ ] Noisy errors filtered (e.g., ResizeObserver loop errors)
- [ ] Error severity levels configured (critical, high, medium, low)

### AC-1.6.2: Performance Monitoring (Vercel Analytics + Web Vitals)

- [ ] Vercel Analytics integrated (`@vercel/analytics`)
- [ ] Web Vitals tracking implemented (`web-vitals` package)
- [ ] Core Web Vitals monitored:
  - LCP (Largest Contentful Paint) - target <2.5s
  - FID (First Input Delay) - target <100ms
  - CLS (Cumulative Layout Shift) - target <0.1
- [ ] Custom performance metrics tracked:
  - Puzzle completion time
  - Leaderboard load time
  - Real-time update latency
- [ ] Performance data sent to analytics endpoint (`/api/analytics`)

### AC-1.6.3: Structured Logging System

- [ ] Structured logger utility created (`lib/utils/logger.ts`)
- [ ] Log levels implemented: debug, info, warn, error
- [ ] JSON-formatted logs with context (userId, puzzleId, timestamp)
- [ ] Logs include:
  - Puzzle completions (puzzleId, userId, time)
  - Auth events (login, logout, OAuth callback)
  - Real-time connection status
  - Server Action errors
- [ ] Logs exclude: PII, solutions, sensitive data
- [ ] Log output: Console (dev), Vercel Logs (production)

### AC-1.6.4: Real-Time Connection Health Monitoring

- [ ] Real-time health monitoring implemented (`lib/monitoring/realtime-health.ts`)
- [ ] Monitor connection events:
  - `connected` - successful connection
  - `error` - connection failures
  - `CHANNEL_ERROR` - channel-specific errors
- [ ] Connection failures logged to Sentry
- [ ] Connection health metrics tracked:
  - Connection success rate (target >95%)
  - Connection latency (target <1s)
  - Disconnection/reconnection patterns

### AC-1.6.5: Monitoring Dashboard & Alerts (Configuration Only)

- [ ] Key metrics documented for tracking:
  - Uptime (target 99.9%)
  - API error rate (target <0.5%)
  - P95 response time (target <500ms)
  - Real-time connection success (target >95%)
  - Daily Active Users
  - Puzzle completion rate (target >60%)
- [ ] Alert thresholds documented:
  - Critical: Database failures, auth system down
  - High: Error rate >2%, response time >1s
  - Low: Completion rate <40%, signups down >20%
- [ ] Monitoring accessible via:
  - Sentry dashboard (errors, performance)
  - Vercel dashboard (analytics, logs, Web Vitals)
  - Supabase dashboard (database queries, connections)

### AC-1.6.6: Error Handling Patterns

- [ ] Error categories defined and documented:
  - User Errors: Encouraging messages ("Not quite right. Keep trying!")
  - Network Errors: Retry-focused ("Connection lost. Retrying...")
  - Server Errors: Generic ("Something went wrong. Please try again.")
  - Validation Errors: Silent or inline feedback
- [ ] Result<T, E> type implemented for Server Actions
- [ ] Error handling examples added to architecture.md
- [ ] Errors never expose stack traces to users

## Tasks / Subtasks

### Task 1: Install and Configure Sentry (AC: 1.6.1)

- [ ] Install Sentry SDK: `npm install @sentry/nextjs`
- [ ] Run Sentry setup wizard: `npx @sentry/wizard@latest -i nextjs`
- [ ] Create Sentry project in Sentry.io dashboard
- [ ] Configure Sentry DSN in environment variables:
  - `NEXT_PUBLIC_SENTRY_DSN` (public)
  - `SENTRY_AUTH_TOKEN` (CI/CD, optional)
- [ ] Create `lib/monitoring/sentry.ts`:
  - Initialize Sentry with DSN, environment, sample rate
  - Configure `beforeSend` to filter noisy errors
  - Export `captureException` and `captureMessage` helpers
- [ ] Add Sentry to `app/layout.tsx` (client-side initialization)
- [ ] Add Sentry to error boundaries (optional - Next.js handles)
- [ ] Test error capture: Trigger test error, verify in Sentry dashboard
- [ ] Document error severity levels in `docs/architecture.md`

### Task 2: Integrate Vercel Analytics and Web Vitals (AC: 1.6.2)

- [ ] Install Vercel Analytics: `npm install @vercel/analytics`
- [ ] Install Web Vitals: `npm install web-vitals`
- [ ] Add Analytics to `app/layout.tsx`:
  ```typescript
  import { Analytics } from '@vercel/analytics/react'
  <Analytics />
  ```
- [ ] Create `lib/monitoring/web-vitals.ts`:
  - Import `onCLS`, `onFID`, `onLCP`, `onFCP`, `onTTFB` from web-vitals
  - Create `sendToAnalytics` function
  - Send metrics to `/api/analytics` endpoint (optional - can use Vercel directly)
- [ ] Create custom metric tracking functions:
  - `trackPuzzleCompletion(time: number)`
  - `trackLeaderboardLoad(duration: number)`
  - `trackRealtimeLatency(latency: number)`
- [ ] Use `track()` from `@vercel/analytics` for custom events
- [ ] Test metrics: Complete puzzle, check Vercel Analytics dashboard
- [ ] Verify Core Web Vitals tracked automatically

### Task 3: Implement Structured Logging System (AC: 1.6.3)

- [ ] Create `lib/utils/logger.ts` with structured logging:
  - Define `LogLevel` type: 'debug' | 'info' | 'warn' | 'error'
  - Define `LogContext` interface (userId, puzzleId, action, etc.)
  - Implement `logger.info()`, `logger.warn()`, `logger.error()`, `logger.debug()`
  - Output JSON-formatted logs with timestamp
  - Send errors to Sentry in addition to console
- [ ] Add logging to Server Actions:
  - `actions/puzzle.ts`: Log puzzle completions, validation failures
  - `actions/auth.ts`: Log login, logout, OAuth events
  - `actions/leaderboard.ts`: Log leaderboard queries, real-time events
- [ ] Add logging to API routes (if any)
- [ ] Test logging: Trigger various events, check console and Vercel logs
- [ ] Document logging strategy in `docs/architecture.md`
- [ ] Ensure no PII logged (sanitize email, IP addresses)

### Task 4: Add Real-Time Connection Health Monitoring (AC: 1.6.4)

- [ ] Create `lib/monitoring/realtime-health.ts`:
  - Import Supabase client
  - Create `monitorRealtimeHealth()` function
  - Subscribe to system events: 'connected', 'error', channel status
  - Log connection events with `logger.info()`
  - Capture connection errors with Sentry
- [ ] Integrate in leaderboard real-time subscription:
  - Call `monitorRealtimeHealth()` when subscribing
  - Track connection latency (time from event to UI update)
  - Log disconnection/reconnection patterns
- [ ] Track custom metrics:
  - Connection success rate (successful connections / total attempts)
  - Average connection latency
  - Disconnection count per session
- [ ] Test connection health:
  - Subscribe to leaderboard updates
  - Force disconnect (disable network)
  - Verify error logged to Sentry
  - Re-enable network, verify reconnection logged

### Task 5: Configure Monitoring Dashboards and Alerts (AC: 1.6.5)

- [ ] Document key metrics in `docs/architecture.md`:
  - Uptime, API error rate, P95 response time
  - Real-time connection success, DAU, completion rate
- [ ] Configure Sentry alerts (in Sentry dashboard):
  - Critical: >10 errors in 5 minutes
  - High: Error rate >2% in 15 minutes
  - Email notifications to developer
- [ ] Configure Vercel alerts (in Vercel dashboard):
  - Build failures
  - Deployment errors
  - High error rate (optional on free tier)
- [ ] Set up Supabase monitoring (in Supabase dashboard):
  - Query execution time (alert if >100ms sustained)
  - Connection pool usage (alert at >80%)
  - Database size (alert at 80% of 500MB limit)
- [ ] Create monitoring checklist in `docs/architecture.md`:
  - Daily: Check Sentry for new errors
  - Weekly: Review Vercel Analytics (Core Web Vitals, traffic)
  - Monthly: Supabase dashboard (DB size, query performance)
- [ ] Document alert thresholds and escalation process

### Task 6: Implement Error Handling Patterns (AC: 1.6.6)

- [ ] Create `lib/types/result.ts`:
  ```typescript
  export type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E }
  ```
- [ ] Update Server Actions to return Result type:
  - `actions/puzzle.ts`: `completePuzzle()`, `validatePuzzle()`
  - `actions/auth.ts`: `migrateGuestData()`
  - `actions/leaderboard.ts`: `getLeaderboard()`
- [ ] Define error categories in `lib/constants/errors.ts`:
  - User errors (incorrect solution)
  - Network errors (Supabase connection failed)
  - Server errors (internal failures)
  - Validation errors (invalid input)
- [ ] Create error message templates:
  - User: "Not quite right. Keep trying!"
  - Network: "Connection lost. Retrying..."
  - Server: "Something went wrong. Please try again."
- [ ] Add error handling to components:
  - Use toast notifications for user-facing errors
  - Log errors with Sentry (but don't expose to user)
  - Retry logic for network errors (exponential backoff)
- [ ] Test error handling:
  - Trigger each error type
  - Verify correct message displayed
  - Verify error logged (but stack trace not shown)

### Task 7: Integration Testing and Verification (AC: All)

- [ ] Run full application locally
- [ ] Trigger various events to test monitoring:
  - Complete a puzzle (verify logged)
  - Fail authentication (verify error tracked)
  - Load leaderboard (verify performance tracked)
  - Disconnect network (verify real-time error logged)
- [ ] Check Sentry dashboard:
  - Verify errors captured with context
  - Check error grouping and severity
  - Review performance transactions
- [ ] Check Vercel Analytics dashboard:
  - Verify Core Web Vitals tracked
  - Check custom events (puzzle completion)
- [ ] Check Supabase dashboard:
  - No abnormal query patterns
  - Connection pool healthy
- [ ] Run linting: `npm run lint` (0 errors)
- [ ] Run tests: `npm test` (all pass)
- [ ] Run build: `npm run build` (successful)
- [ ] Push to GitHub, verify CI passes
- [ ] Deploy to Vercel, test production monitoring

## Dev Notes

### Architecture Alignment

This story implements the **Monitoring & Observability** architecture defined in `docs/architecture.md` (Section: Monitoring & Observability, lines 1355-1576).

**Key Architecture Decisions:**

**Error Tracking (Architecture Section: Error Tracking):**
- ✅ Sentry integration for client and server errors
- ✅ Structured logging with JSON format
- ✅ Error severity levels (critical, high, medium, low)
- ✅ Context-rich errors (userId, puzzleId, action)
- ✅ Filter noisy errors (ResizeObserver, expected 404s)

**Performance Monitoring (Architecture Section: Performance Monitoring):**
- ✅ Vercel Analytics automatic tracking (Core Web Vitals)
- ✅ Custom metrics (puzzle completion, leaderboard load)
- ✅ Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- ✅ Real-time update latency monitoring

**Real-Time Connection Health (Architecture Section: Real-Time Connection Health):**
- ✅ Monitor connection events (connected, error, channel status)
- ✅ Track connection success rate (>95% target)
- ✅ Log disconnection patterns for debugging

**Logging Strategy (Architecture Section: Logging Strategy):**
- ✅ Structured JSON logs with timestamp
- ✅ Log levels: debug, info, warn, error
- ✅ Context includes: userId, puzzleId, action, duration
- ✅ No PII logged (email, IP sanitized)
- ✅ Production: Vercel Logs (7-day retention)

**Alerting Strategy (Architecture Section: Alerting Strategy):**
- ✅ Critical alerts: Database failures, auth down
- ✅ High-priority: Error rate >2%, response time >1s
- ✅ Low-priority: Completion rate <40%, signups down >20%

### Project Structure Notes

**New Files Created:**
```
/lib/monitoring/
  ├── sentry.ts                # Sentry initialization and helpers
  ├── web-vitals.ts            # Web Vitals tracking
  └── realtime-health.ts       # Real-time connection monitoring

/lib/utils/
  └── logger.ts                # Structured logging utility

/lib/types/
  └── result.ts                # Result<T, E> type for error handling

/lib/constants/
  └── errors.ts                # Error message templates (optional)
```

**Modified Files:**
- `app/layout.tsx` - Add Vercel Analytics component
- `actions/puzzle.ts` - Add logging, return Result type
- `actions/auth.ts` - Add logging, return Result type
- `actions/leaderboard.ts` - Add logging, return Result type
- `.env.local` - Add `NEXT_PUBLIC_SENTRY_DSN`
- `docs/architecture.md` - Update with monitoring implementation details

**Component Organization:**
- Monitoring utilities in `/lib/monitoring/`
- Logging utility in `/lib/utils/`
- Error types in `/lib/types/`
- Centralized error messages in `/lib/constants/`

### Learnings from Previous Story (1.5)

**From Story 1.5 (Design System Foundations):**

**Testing Infrastructure Available (from Story 1.4):**
- ✅ Jest + React Testing Library configured
- ✅ Coverage threshold: 70% minimum enforced
- ✅ Test scripts: `npm test`, `npm run test:watch`, `npm run test:coverage`
- ✅ GitHub Actions CI workflow (lint → test → build)
- ✅ ESLint and Prettier configured

**Testing Patterns to Follow:**
- **Unit Test Pattern**: Pure functions tested in isolation (90%+ coverage)
- **Component Test Pattern**: Behavior testing, not implementation details
- **Coverage Focus**: Test meaningful code (business logic), not third-party libraries
- **Example**: `lib/utils.test.ts` demonstrates comprehensive test patterns

**Build Already Successful:**
- ✅ TypeScript strict mode enabled and working
- ✅ ESLint validation passes
- ✅ Production build generates optimized output
- ✅ No console errors in development

**Design System Patterns:**
- ✅ Tailwind CSS with design tokens (black/white/blue newspaper aesthetic)
- ✅ Component library (Button, Card, Input, Typography)
- ✅ Accessible components (WCAG AA, keyboard navigation, ARIA labels)

[Source: stories/1-5-design-system-foundations-newspaper-aesthetic.md#Dev-Agent-Record]

### Critical Implementation Notes

**CRITICAL: Sentry Error Filtering**

Sentry can get noisy with browser-specific errors. Filter aggressively:

```typescript
// lib/monitoring/sentry.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event, hint) {
    // Filter noisy errors
    const errorValue = event.exception?.values?.[0]?.value || ''

    // Ignore browser-specific errors
    if (errorValue.includes('ResizeObserver')) return null
    if (errorValue.includes('Non-Error promise rejection')) return null

    // Ignore expected errors
    if (event.request?.url?.includes('/api/analytics')) return null

    return event
  }
})
```

**CRITICAL: Performance Monitoring Sample Rate**

Don't track 100% of transactions - it's expensive and noisy:

```typescript
// 10% sample rate for performance (100% for errors)
tracesSampleRate: 0.1
```

**CRITICAL: Structured Logging Format**

Always use JSON format for logs (easier to parse, search, and filter):

```typescript
logger.info('Puzzle completed', {
  userId: 'user-123',
  puzzleId: 'puzzle-456',
  duration: 325, // seconds
  timestamp: new Date().toISOString()
})

// Output:
// {"level":"info","message":"Puzzle completed","userId":"user-123","puzzleId":"puzzle-456","duration":325,"timestamp":"2025-11-10T..."}
```

**CRITICAL: No PII in Logs**

Never log personally identifiable information (GDPR compliance):

```typescript
// ❌ WRONG - Logs email
logger.info('User logged in', { email: 'user@example.com' })

// ✅ CORRECT - Logs user ID only
logger.info('User logged in', { userId: 'user-123' })
```

**CRITICAL: Real-Time Connection Monitoring**

Monitor connection health to catch issues early:

```typescript
// Subscribe to connection events
channel
  .on('system', { event: 'connected' }, () => {
    logger.info('Real-time connected')
  })
  .on('system', { event: 'error' }, (error) => {
    Sentry.captureException(error, { tags: { component: 'realtime' } })
  })
```

### Monitoring Best Practices

**Error Tracking:**
- ✅ Capture exceptions with context (userId, action, puzzleId)
- ✅ Filter noisy errors (browser-specific, expected failures)
- ✅ Set severity levels (critical, high, medium, low)
- ✅ Don't expose stack traces to users

**Performance Monitoring:**
- ✅ Track Core Web Vitals (LCP, FID, CLS)
- ✅ Monitor critical paths (puzzle load, leaderboard, auth)
- ✅ Use sample rate for transactions (10% is sufficient)
- ✅ Track custom business metrics (completion time, share rate)

**Logging:**
- ✅ Use structured JSON format
- ✅ Include context (userId, action, timestamp)
- ✅ Log key events (completions, auth, errors)
- ✅ Don't log PII or sensitive data

**Alerting:**
- ✅ Set thresholds for critical metrics
- ✅ Configure notifications (Sentry, Vercel)
- ✅ Document escalation process
- ✅ Review alerts weekly, tune thresholds

### Testing Approach

**Unit Tests (for utilities):**
- Test `logger.ts`: Verify JSON format, context inclusion
- Test `result.ts`: Verify Result type works with success/error
- Mock Sentry in tests (avoid sending test errors)

**Integration Tests:**
- Test Server Actions return Result type
- Verify errors logged on failure
- Check Sentry context includes userId, action

**Manual Testing:**
- Trigger test error → Check Sentry dashboard
- Complete puzzle → Check Vercel Analytics
- Disconnect network → Verify real-time error logged
- Check Vercel Logs → Verify structured JSON logs

**No E2E tests needed for monitoring (foundation only)**

### Success Criteria

This story is complete when:
- ✅ Sentry integrated and capturing errors
- ✅ Vercel Analytics tracking Core Web Vitals
- ✅ Structured logger implemented and used in Server Actions
- ✅ Real-time connection health monitored
- ✅ Key metrics documented in architecture.md
- ✅ Alert thresholds configured
- ✅ Result<T, E> type implemented
- ✅ Error handling patterns documented
- ✅ ESLint, tests, and build pass in CI/CD
- ✅ Monitoring verified in production

## Dev Agent Record

### Context Reference

- `docs/stories/1-6-error-tracking-monitoring-setup.context.xml`

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

