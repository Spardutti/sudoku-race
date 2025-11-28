# Architecture - Sudoku Race

## Executive Summary

Sudoku Race is a competitive daily Sudoku platform built with Next.js 16, Supabase, and TypeScript. The architecture prioritizes **competitive integrity** (server-side validation, anti-cheat), **real-time engagement** (live leaderboards via WebSockets), and **viral growth mechanics** (Wordle-style emoji sharing).

**Key Architectural Characteristics:**
- **Modern Full-Stack**: Next.js 16 App Router with Server Actions and Server Components
- **Database-as-a-Service**: Supabase (PostgreSQL + Auth + Realtime)
- **Type-Safe**: End-to-end TypeScript with strict mode
- **Mobile-First**: Tailwind CSS 4, responsive design, WCAG 2.1 AA accessible
- **Scale-Adaptive**: Starts simple, designed to scale to 1,000+ DAU without major rewrites
- **Production-Ready**: Comprehensive monitoring, testing, SEO, and security measures

**Target Scale:**
- **MVP**: 100+ concurrent users, free tier Supabase
- **Growth**: 1,000 DAU, 200 concurrent connections
- **Scale Path**: Clear upgrade path (Supabase Pro, edge caching, CDN)

**Project Initialization:**
- **Starter**: `create-next-app@latest` (Nov 8, 2025)
- **Framework**: Next.js 16.0.1 with App Router
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4 with @tailwindcss/postcss
- **Already Established**: Project structure, path aliases (`@/*`), ESLint configuration

**Document Coverage:**
This architecture document covers: Technology Stack, Implementation Patterns, Data Architecture, Security & Anti-Cheat, Testing Strategy (70% coverage), Performance Optimization, Monitoring & Observability, SEO & Social Sharing, Database Migrations, Rate Limiting, and Deployment Architecture.

---

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| **Framework** | Next.js App Router | 16.0.1 | All | Modern React patterns, SSR/SSG, excellent DX |
| **Language** | TypeScript (strict) | 5.x | All | Type safety, better IDE support, fewer runtime errors |
| **Database** | Supabase (PostgreSQL) | 2.80.0 | 1, 2, 3, 4, 6 | Integrated auth, real-time, RLS, free tier sufficient |
| **Authentication** | Supabase Auth (@supabase/ssr) | Latest | Epic 3 | OAuth (Google/GitHub/Apple), secure cookies, SSR support |
| **Real-Time** | Supabase Realtime | Latest | Epic 4 | <1s latency, PostgreSQL change subscriptions, 200 free connections |
| **API Pattern** | Server Actions + Server Components | - | 2, 3, 4, 6 | Type-safe, simpler than REST, automatic caching |
| **Puzzle Engine** | sudoku-core | 3.0.3 | Epic 2 | TypeScript-native, difficulty levels, generation + validation |
| **Data Fetching** | TanStack Query v5 | Latest | 4, 6 | Caching, background refetch, optimistic updates |
| **State Management** | Zustand + React Context | Latest | 2, 5 | Lightweight, TypeScript-first, localStorage persistence |
| **Forms** | Native + Server Actions | - | 2, 3 | Simple forms, progressive enhancement, no library needed |
| **Testing** | Jest + RTL + Playwright | Latest | Epic 1 | Component tests, E2E critical flows, 70% coverage target |
| **Timer** | Custom Hook + Server Validation | - | Epic 2 | Client display, server source of truth (anti-cheat) |
| **Deployment** | Vercel + GitHub Actions | - | All | Auto-deploy, preview PRs, environment variables, analytics |
| **Components** | shadcn/ui (Radix primitives) | Latest | Epic 1 | Accessible, customizable, copy-paste approach, Tailwind-based |
| **Styling** | Tailwind CSS 4 | 4.x | Epic 1 | Utility-first, newspaper aesthetic customization, fast iteration |
| **Migrations** | Supabase CLI | Latest | All | SQL migrations, version controlled, rollback-friendly |
| **Rate Limiting** | LRU Cache (in-memory) | Latest | 2, 4 | Lightweight, prevents abuse, 3 submissions/min per user |
| **Monitoring** | Sentry + Vercel Analytics | Latest | All | Error tracking, performance monitoring, real-time alerts |
| **SEO** | Next.js Metadata API | Built-in | Epic 5 | OpenGraph, Twitter cards, dynamic OG images, structured data |

---

## Project Structure

```
sudoku-race/
├── app/
│   ├── (auth)/
│   │   └── auth/callback/route.ts        # OAuth callback (Epic 3.2)
│   ├── api/
│   │   ├── og/route.tsx                  # Dynamic OpenGraph images
│   │   └── analytics/route.ts            # Custom analytics endpoint (optional)
│   ├── puzzle/page.tsx                   # Main puzzle page (Epic 2.7)
│   ├── leaderboard/page.tsx              # Leaderboard (Epic 4.1)
│   ├── profile/page.tsx                  # User profile (Epic 3.4)
│   ├── layout.tsx                        # Root layout + metadata
│   ├── page.tsx                          # Home (redirects to /puzzle)
│   ├── providers.tsx                     # React Query + Auth providers
│   ├── sitemap.ts                        # Sitemap generation
│   ├── robots.ts                         # Robots.txt generation
│   └── globals.css                       # Global styles + design tokens
│
├── components/
│   ├── puzzle/
│   │   ├── SudokuGrid.tsx                # 9x9 interactive grid (Epic 2.2)
│   │   ├── NumberPad.tsx                 # Touch-optimized input (Epic 2.3)
│   │   ├── Timer.tsx                     # Live timer display (Epic 2.5)
│   │   └── SubmitButton.tsx              # Validation trigger (Epic 2.6)
│   ├── leaderboard/
│   │   ├── LeaderboardTable.tsx          # Table with personal rank (Epic 4.4)
│   │   ├── LeaderboardLive.tsx           # Real-time wrapper (Epic 4.2)
│   │   └── ShareRankButton.tsx           # Share rank (Epic 4.5)
│   ├── share/
│   │   ├── ShareModal.tsx                # Completion modal (Epic 5.3)
│   │   ├── ShareButtons.tsx              # Twitter/WhatsApp/Clipboard (Epic 5.4)
│   │   └── EmojiGrid.tsx                 # Emoji grid display (Epic 5.2)
│   ├── profile/
│   │   ├── StatsCards.tsx                # Personal statistics (Epic 6.3)
│   │   ├── CompletionCalendar.tsx        # 30-day calendar (Epic 6.4)
│   │   └── StreakDisplay.tsx             # Streak tracking (Epic 6.1/6.2)
│   ├── auth/
│   │   ├── AuthButton.tsx                # Sign in / User dropdown (Epic 3.5)
│   │   ├── OAuthButtons.tsx              # OAuth providers (Epic 3.2)
│   │   └── GuestPrompt.tsx               # Post-completion auth (Epic 3.1)
│   ├── layout/
│   │   ├── Header.tsx                    # Navigation header
│   │   └── Footer.tsx                    # Footer
│   └── ui/                                # shadcn/ui components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── card.tsx
│       ├── dropdown-menu.tsx
│       └── toast.tsx
│
├── actions/
│   ├── puzzle.ts                         # Puzzle Server Actions
│   ├── leaderboard.ts                    # Leaderboard Server Actions
│   ├── auth.ts                           # Auth Server Actions
│   └── streak.ts                         # Streak Server Actions
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser client
│   │   ├── server.ts                     # Server client
│   │   └── middleware.ts                 # Session refresh
│   ├── stores/
│   │   └── puzzle-store.ts               # Zustand (grid, solvePath, auto-save)
│   ├── hooks/
│   │   ├── useTimer.ts                   # Timer with pause detection
│   │   ├── usePuzzle.ts                  # Puzzle state + actions
│   │   ├── useLeaderboard.ts             # React Query wrapper
│   │   ├── useAuth.ts                    # Auth state
│   │   └── useRealtimeLeaderboard.ts     # Real-time subscription
│   ├── utils/
│   │   ├── date-utils.ts                 # UTC handling
│   │   ├── emoji-grid.ts                 # Emoji grid generation (Epic 5.2)
│   │   ├── logger.ts                     # Structured logging
│   │   ├── anti-cheat.ts                 # Validation helpers (Epic 4.3)
│   │   ├── rate-limit.ts                 # Rate limiting (LRU cache)
│   │   └── format.ts                     # Time formatting
│   ├── monitoring/
│   │   ├── sentry.ts                     # Error tracking
│   │   ├── web-vitals.ts                 # Performance monitoring
│   │   └── realtime-health.ts            # Real-time connection monitoring
│   ├── types/
│   │   ├── result.ts                     # Result<T, E> type
│   │   ├── puzzle.ts                     # Puzzle, Cell, SolvePath
│   │   ├── user.ts                       # User, Session
│   │   ├── leaderboard.ts                # LeaderboardEntry
│   │   └── database.ts                   # Supabase generated types
│   ├── constants/
│   │   └── config.ts                     # App constants, feature flags
│   └── sudoku.ts                         # sudoku-core wrapper
│
├── scripts/
│   └── seed-puzzle.ts                    # Daily puzzle generation
│
├── e2e/
│   ├── puzzle-completion.spec.ts         # Complete puzzle flow
│   ├── guest-to-auth.spec.ts             # Session migration
│   ├── leaderboard-realtime.spec.ts      # Real-time updates
│   └── share-flow.spec.ts                # Share emoji grid
│
├── docs/
│   ├── PRD.md                            # Product Requirements
│   ├── epics.md                          # Epic breakdown (32 stories)
│   ├── architecture.md                   # This document
│   └── database-schema.md                # Schema documentation
│
├── supabase/
│   ├── migrations/
│   │   ├── 20250109000000_initial_schema.sql
│   │   ├── 20250109000001_add_streaks.sql
│   │   └── 20250109000002_add_rls_policies.sql
│   └── config.toml                       # Supabase local config
│
├── middleware.ts                         # Session refresh (Epic 3.5)
├── jest.config.js                        # Jest configuration
├── playwright.config.ts                  # Playwright E2E config
├── tailwind.config.ts                    # Tailwind + design tokens
└── tsconfig.json                         # TypeScript strict mode
```

---

## Epic to Architecture Mapping

| Epic | Stories | Key Components | Database Tables | Server Actions | Real-Time |
|------|---------|----------------|-----------------|----------------|-----------|
| **Epic 1: Foundation** | 5 | `app/layout.tsx`, `components/ui/*`, CI workflow | - | - | No |
| **Epic 2: Puzzle** | 7 | `SudokuGrid`, `NumberPad`, `Timer`, `puzzle-store.ts` | `puzzles`, `completions` | `getPuzzleToday`, `validatePuzzle`, `completePuzzle` | No |
| **Epic 3: Auth** | 5 | `AuthButton`, `OAuthButtons`, `auth/callback/route.ts` | `users` | `migrateGuestData` | No |
| **Epic 4: Leaderboard** | 5 | `LeaderboardTable`, `LeaderboardLive` | `leaderboards` | `getLeaderboard`, `getUserRank` | **Yes** (Supabase Realtime) |
| **Epic 5: Social** | 5 | `ShareModal`, `ShareButtons`, `EmojiGrid`, `emoji-grid.ts` | - | - | No |
| **Epic 6: Engagement** | 5 | `StreakDisplay`, `StatsCards`, `CompletionCalendar` | `streaks` | `updateStreak`, `getStreakStats` | No |

---

## Technology Stack Details

### Core Technologies

**Framework & Runtime:**
- **Next.js 16.0.1**: App Router, React 19.2.0, Server Actions, Server Components
- **Node.js**: ≥20.9 (required by Next.js 16)
- **TypeScript 5**: Strict mode enabled, path aliases configured

**Database & Backend:**
- **Supabase**: PostgreSQL database, Auth, Realtime, Storage
  - Free tier: 500MB DB, unlimited API requests, 200 concurrent real-time connections
  - Row Level Security (RLS) for data protection
  - Auto-generated REST API
- **@supabase/supabase-js**: v2.80.0 (JavaScript client)
- **@supabase/ssr**: Latest (Server-Side Rendering package for Next.js)

**Styling & UI:**
- **Tailwind CSS 4**: Utility-first, custom newspaper aesthetic
- **shadcn/ui**: Accessible components (Radix UI primitives + Tailwind)
- **PostCSS**: CSS processing with Tailwind plugin

**State & Data:**
- **Zustand**: Client state (puzzle grid, solve path, selected cell)
- **TanStack Query v5**: Server state, caching, background refetch
- **React Context**: Auth state (low-frequency updates)

**Puzzle Logic:**
- **sudoku-core v3.0.3**: Generation, validation, difficulty analysis

**Testing:**
- **Jest**: Unit/integration tests
- **React Testing Library**: Component tests
- **Playwright**: E2E tests for critical flows
- **@testing-library/jest-dom**: Custom matchers

**Development Tools:**
- **ESLint**: Linting with Next.js config
- **Prettier**: Code formatting (optional, not installed by default)
- **GitHub Actions**: CI/CD pipeline
- **Vercel**: Deployment platform

### Integration Points

**Authentication (Supabase Auth):**
- OAuth Providers: Google, GitHub, Apple
- Session Management: HTTP-only cookies via @supabase/ssr
- Flow: OAuth redirect → `/auth/callback` → session creation → guest data migration

**Real-Time (Supabase Realtime):**
- Protocol: WebSockets (via Supabase client)
- Use Case: Leaderboard live updates
- Subscription: PostgreSQL `INSERT` events on `leaderboards` table
- Fallback: Polling every 5 seconds on connection failure

**Deployment (Vercel):**
- Auto-deploy: Push to `main` branch
- Preview Deployments: Per pull request
- Environment Variables: Supabase URL, Anon Key, OAuth secrets
- Edge Functions: Next.js middleware for session refresh
- Analytics: Vercel Analytics (Core Web Vitals)

**CI/CD (GitHub Actions):**
- Triggers: Push, pull request
- Steps: Install deps → Lint → Test → Build
- Coverage: Upload coverage reports (optional)

---

## Implementation Patterns

### 1. Supabase Client Usage

**CRITICAL: Use correct client for context**

```typescript
// Server Component / Server Action
import { createServerClient } from '@/lib/supabase/server'
const supabase = await createServerClient()

// Client Component
import { createBrowserClient } from '@/lib/supabase/client'
const supabase = createBrowserClient()
```

**Implementation:**

```typescript
// lib/supabase/server.ts
import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerClient() {
  const cookieStore = await cookies()
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        }
      }
    }
  )
}

// lib/supabase/client.ts
import { createBrowserClient as createClient } from '@supabase/ssr'

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 2. Authentication Pattern

**CRITICAL: Always use getUser() in Server Components**

```typescript
// ✅ CORRECT - Server validation
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) throw new Error('Unauthorized')

// ❌ WRONG - Can be spoofed
const { data: { session } } = await supabase.auth.getSession()
```

### 3. Server Action Pattern

**Always return Result<T, E> for mutations**

```typescript
// actions/puzzle.ts
'use server'
import { Result } from '@/lib/types/result'

export async function completePuzzle(
  puzzleId: string,
  solution: number[][]
): Promise<Result<CompletionData>> {
  try {
    // 1. Auth check
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return { success: false, error: new Error('Unauthorized') }
    }

    // 2. Validation
    // 3. Database operations
    // 4. Return success
    return { success: true, data: completionData }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}
```

### 4. Data Fetching Pattern

**Server Components for initial data, Client Components for interactive**

```typescript
// Server Component - app/leaderboard/page.tsx
export default async function LeaderboardPage() {
  const supabase = await createServerClient()
  const { data } = await supabase.from('leaderboards').select('*')
  return <LeaderboardLive initialData={data} />
}

// Client Component - Real-time updates
'use client'
export function LeaderboardLive({ initialData }) {
  const data = useRealtimeLeaderboard(puzzleId, initialData)
  return <LeaderboardTable data={data} />
}
```

### 5. State Management Pattern

**Zustand for UI state, React Query for server state**

```typescript
// Zustand - local state
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePuzzleStore = create()(
  persist(
    (set) => ({
      grid: [],
      updateCell: (row, col, value) => set(state => ({
        grid: updateGrid(state.grid, row, col, value)
      }))
    }),
    { name: 'puzzle-storage' }
  )
)

// React Query - server state
const { data } = useQuery({
  queryKey: ['leaderboard', puzzleId],
  queryFn: () => getLeaderboard(puzzleId)
})
```

### 6. Single Responsibility Principle

**Each function/component does ONE thing**

```typescript
// ✅ CORRECT - Single responsibility
export async function getPuzzleToday() {
  // ONLY gets today's puzzle
}

export async function validatePuzzle(puzzleId, solution) {
  // ONLY validates solution
}

export async function completePuzzle(puzzleId, solvePath) {
  // ONLY completes puzzle
}

// Component - single responsibility
export function SudokuGrid({ puzzle }) {
  // ONLY renders grid
  return <GridComponent />
}
```

### 7. Avoid useEffect - Use Better Patterns

**Extract useEffect to custom hooks or use alternatives**

```typescript
// ❌ WRONG - useEffect in component
export function Timer() {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const interval = setInterval(...)
    return () => clearInterval(interval)
  }, [])
}

// ✅ CORRECT - Custom hook
export function useTimer(startTime: number) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])
  return elapsed
}

// Usage - clean
export function Timer({ startTime }) {
  const elapsed = useTimer(startTime)
  return <span>{formatTime(elapsed)}</span>
}
```

### 8. Comment Policy

**Only critical comments - code should be self-documenting**

```typescript
// ✅ CORRECT - Critical comments only

// CRITICAL: Use getUser() not getSession() - prevents auth spoofing
const { data: { user } } = await supabase.auth.getUser()

// Anti-cheat: Flag completions under 120 seconds for manual review
if (completionTime < 120) {
  flagged_for_review = true
}

// ❌ WRONG - Obvious comments
// Get the user from Supabase
const { data: { user } } = await supabase.auth.getUser()
```

### 9. Accessibility Pattern

**WCAG 2.1 Level AA compliance**

```typescript
// Semantic HTML, ARIA labels, keyboard navigation
<button
  role="gridcell"
  aria-label={`Row ${row + 1}, Column ${col + 1}, ${cell === 0 ? 'empty' : `value ${cell}`}`}
  tabIndex={isSelected ? 0 : -1}
  onKeyDown={handleKeyboardNav}
  className="min-w-[44px] min-h-[44px]" // 44x44px minimum tap target
>
  {cell || ''}
</button>
```

---

## Consistency Rules

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `SudokuGrid.tsx`)
- Utilities: `kebab-case.ts` (e.g., `date-utils.ts`)
- Server Actions: `kebab-case.ts` (e.g., `puzzle.ts`)
- Tests: `ComponentName.test.tsx` (co-located)

**Code:**
- Components: `PascalCase` (e.g., `<SudokuGrid />`)
- Functions: `camelCase` (e.g., `formatTime()`)
- Server Actions: `camelCase` (e.g., `validatePuzzle()`)
- Hooks: `camelCase` with `use` prefix (e.g., `useTimer()`)
- Stores: `camelCase` with `use` prefix (e.g., `usePuzzleStore()`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `MAX_TIME_SECONDS`)

**Database:**
- Tables: `snake_case` (e.g., `leaderboards`)
- Columns: `snake_case` (e.g., `completion_time_seconds`)
- Indexes: `idx_tablename_columns` (e.g., `idx_leaderboards_puzzle_time`)

### Code Organization

**Feature-based structure:**
- Group by feature (puzzle, leaderboard, auth)
- Co-locate tests with components
- Shared utilities in `lib/`
- Server Actions in `actions/`

**Import order:**
1. External packages (react, next)
2. Internal aliases (`@/components`, `@/lib`)
3. Relative imports (`./`, `../`)
4. Types (grouped at end)

### Error Handling

**Implementation:** Story 1.6 (Error Tracking & Monitoring Setup)

**Result Type Pattern:**

All Server Actions MUST return `Result<T, E>` type for consistent, type-safe error handling.

```typescript
// lib/types/result.ts
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

// Helper functions
export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T }
export function isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E }
export function unwrap<T, E>(result: Result<T, E>): T // Throws if failure
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T
```

**Server Action Example:**

```typescript
// actions/puzzle.ts
import { Result } from '@/lib/types/result'
import { logger } from '@/lib/utils/logger'
import { USER_ERRORS, SERVER_ERRORS } from '@/lib/constants/errors'

export async function completePuzzle(
  puzzleId: string,
  solution: number[][]
): Promise<Result<{ correct: boolean; rank?: number }, string>> {
  try {
    // Validation
    if (!isValidSolution(solution)) {
      return { success: false, error: USER_ERRORS.INVALID_MOVE }
    }

    // Business logic
    const correct = checkSolution(puzzleId, solution)
    if (!correct) {
      logger.info('Incorrect puzzle solution', { puzzleId })
      return { success: false, error: USER_ERRORS.INCORRECT_SOLUTION }
    }

    // Save completion
    const rank = await saveCompletion(puzzleId, solution)
    logger.info('Puzzle completed', { puzzleId, rank })

    return { success: true, data: { correct: true, rank } }
  } catch (error) {
    logger.error('Failed to complete puzzle', error as Error, { puzzleId })
    return { success: false, error: SERVER_ERRORS.INTERNAL_ERROR }
  }
}
```

**Client Component Example:**

```typescript
// components/puzzle/PuzzleGrid.tsx
'use client'

import { completePuzzle } from '@/actions/puzzle'
import { toast } from '@/components/ui/toast'

export function PuzzleGrid() {
  const handleSubmit = async () => {
    const result = await completePuzzle(puzzleId, solution)

    if (result.success) {
      // Type-safe access to success data
      toast.success(`Correct! Your rank: #${result.data.rank}`)
    } else {
      // User-friendly error message (never shows stack trace)
      toast.error(result.error)
    }
  }

  return <button onClick={handleSubmit}>Submit</button>
}
```

**Error Categories:**

Error categories defined in `lib/constants/errors.ts`:

| Category | UX Strategy | Examples | Message Template |
|----------|-------------|----------|------------------|
| **User Errors** | Encouraging, actionable | Incorrect solution, invalid move | "Not quite right. Keep trying!" |
| **Network Errors** | Retry-focused, show retry button | API timeout, real-time disconnection | "Connection lost. Retrying..." |
| **Server Errors** | Generic, log details for developer | Database error, unhandled exception | "Something went wrong. Please try again." |
| **Validation Errors** | Silent or inline feedback | Invalid form input, missing field | "Please check your input and try again." |

**Error Constants:**

```typescript
// lib/constants/errors.ts

// User errors (encouraging)
export const USER_ERRORS = {
  INCORRECT_SOLUTION: "Not quite right. Keep trying!",
  INVALID_MOVE: "That move isn't allowed. Try a different number.",
  PUZZLE_ALREADY_COMPLETED: "You've already completed this puzzle!",
}

// Network errors (retry-focused)
export const NETWORK_ERRORS = {
  CONNECTION_LOST: "Connection lost. Retrying...",
  TIMEOUT: "Request timed out. Please try again.",
  REALTIME_DISCONNECTED: "Live updates paused. Reconnecting...",
}

// Server errors (generic, never expose stack traces)
export const SERVER_ERRORS = {
  INTERNAL_ERROR: "Something went wrong. Please try again.",
  DATABASE_ERROR: "Unable to save your progress. Please try again.",
  AUTH_ERROR: "Authentication failed. Please sign in again.",
}

// Helper functions
export function categorizeError(error: Error): ErrorCategory
export function getErrorMessage(category: ErrorCategory, specificMessage?: string): string
export function shouldRetry(category: ErrorCategory): boolean
```

**Error Handling Best Practices:**

1. ✅ **Never expose stack traces to users** - Use generic messages for server errors
2. ✅ **Use Result type for Server Actions** - Type-safe error handling across client/server boundary
3. ✅ **Log errors with context** - Include userId, puzzleId, action name in logs
4. ✅ **Categorize errors appropriately** - User vs Network vs Server errors have different UX
5. ✅ **Show encouraging messages** - "Not quite right" instead of "Error: Invalid input"
6. ❌ **Don't throw exceptions across client/server boundary** - Use Result type instead
7. ❌ **Don't log PII** - Never log email addresses, IP addresses, passwords

### Logging Strategy

**Structured JSON logging:**

```typescript
// lib/utils/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      ...meta,
      timestamp: new Date()
    }))
  },
  error: (message: string, error: Error, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error.message,
      stack: error.stack,
      ...meta,
      timestamp: new Date()
    }))
  }
}

// Usage
logger.info('Puzzle completed', { puzzleId, userId, time })
logger.error('Supabase connection failed', error, { operation: 'fetch' })
```

**What to log:**
- ✅ Puzzle completions (puzzleId, userId, time)
- ✅ Auth events (login, logout, OAuth callback)
- ✅ Real-time connection status
- ✅ Server Action errors
- ❌ Don't log: PII, solutions, sensitive data

---

## Data Architecture

### Database Schema (PostgreSQL)

**Tables:**

1. **users** (extends auth.users)
   - `id` (UUID, FK to auth.users)
   - `username` (TEXT)
   - `email` (TEXT)
   - `oauth_provider` ('google' | 'github' | 'apple')

2. **puzzles**
   - `id` (UUID)
   - `puzzle_date` (DATE, UNIQUE) - UTC date
   - `puzzle_data` (JSONB) - 9x9 array with clues
   - `solution` (JSONB) - Complete solution
   - `difficulty` (TEXT) - 'medium'

3. **completions**
   - `id` (UUID)
   - `user_id` (UUID, FK)
   - `puzzle_id` (UUID, FK)
   - `is_complete` (BOOLEAN)
   - `started_at` (TIMESTAMPTZ)
   - `completed_at` (TIMESTAMPTZ)
   - `completion_time_seconds` (INTEGER) - Auto-calculated
   - `solve_path` (JSONB) - Array of moves
   - `grid_state` (JSONB) - In-progress state
   - `flagged_for_review` (BOOLEAN) - Anti-cheat
   - `pause_count` (INTEGER)

4. **leaderboards**
   - `id` (UUID)
   - `puzzle_id` (UUID, FK)
   - `user_id` (UUID, FK)
   - `rank` (INTEGER)
   - `completion_time_seconds` (INTEGER)
   - `submitted_at` (TIMESTAMPTZ)

5. **streaks**
   - `id` (UUID)
   - `user_id` (UUID, FK, UNIQUE)
   - `current_streak` (INTEGER)
   - `longest_streak` (INTEGER)
   - `last_completion_date` (DATE)
   - `freeze_available` (BOOLEAN)
   - `last_freeze_reset_date` (DATE)

**Indexes:**
- `idx_puzzles_date` on `puzzles(puzzle_date DESC)`
- `idx_completions_user` on `completions(user_id)`
- `idx_completions_puzzle` on `completions(puzzle_id)`
- `idx_leaderboards_puzzle_time` on `leaderboards(puzzle_id, completion_time_seconds ASC)`

**Row Level Security (RLS):**
- Users: Read all, update own
- Puzzles: Read all (public)
- Completions: CRUD own only
- Leaderboards: Read all, insert own
- Streaks: CRUD own only

**Triggers:**
- Auto-calculate `completion_time_seconds` on update
- Auto-flag `flagged_for_review` if time < 120 seconds
- Auto-update `updated_at` timestamps

### Database Migrations

**Migration Tool:** Supabase CLI with SQL migrations

**Migration Workflow:**

```bash
# 1. Create new migration
npx supabase migration new add_pause_detection

# 2. Edit migration file in supabase/migrations/
# Example: 20250110_add_pause_detection.sql

# 3. Test locally
npx supabase db reset  # Resets and applies all migrations
npx supabase db diff   # Shows schema differences

# 4. Apply to production
npx supabase db push --linked  # Pushes to linked project
```

**Migration Files Location:**
```
supabase/
├── migrations/
│   ├── 20250109000000_initial_schema.sql
│   ├── 20250109000001_add_streaks.sql
│   ├── 20250109000002_add_rls_policies.sql
│   └── 20250110000000_add_pause_detection.sql
└── config.toml
```

**Migration Best Practices:**
- **Incremental**: One logical change per migration
- **Idempotent**: Use `IF NOT EXISTS` for tables, `CREATE OR REPLACE` for functions
- **Reversible**: Include rollback steps in comments
- **Tested**: Test locally with `supabase db reset` before production push

**Example Migration:**

```sql
-- Migration: Add pause detection
-- Created: 2025-01-10
-- Description: Track pause events for anti-cheat

-- Forward migration
ALTER TABLE completions
  ADD COLUMN IF NOT EXISTS pause_events JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_completions_pause_events
  ON completions USING gin(pause_events);

-- Rollback (run manually if needed)
-- ALTER TABLE completions DROP COLUMN IF EXISTS pause_events;
-- DROP INDEX IF EXISTS idx_completions_pause_events;
```

**Production Deployment:**
1. Test migration locally
2. Backup production database (Supabase auto-backups daily on Pro plan)
3. Run during low-traffic window (2-4am UTC)
4. Monitor error logs for 30 minutes post-deployment
5. Keep rollback script ready

**Emergency Rollback:**
```bash
# If migration fails, manually execute rollback SQL in Supabase SQL Editor
```

### Data Relationships

```
auth.users (Supabase managed)
    ↓ 1:1
public.users (app data)
    ↓ 1:many
├── completions
├── leaderboards
└── streaks

puzzles
    ↓ 1:many
├── completions
└── leaderboards
```

### TypeScript Types

```typescript
// lib/types/database.ts (generated from Supabase)
export type Database = {
  public: {
    Tables: {
      puzzles: {
        Row: {
          id: string
          puzzle_date: string // YYYY-MM-DD
          puzzle_data: number[][]
          solution: number[][]
          difficulty: 'easy' | 'medium' | 'hard'
          created_at: string
        }
      }
      // ... other tables
    }
  }
}

// Application types
export type SolvePathEntry = {
  row: number
  col: number
  value: number
  timestamp: number
  isCorrection: boolean
}
```

---

## API Contracts

### Server Actions

**Puzzle Actions (`actions/puzzle.ts`):**

```typescript
'use server'

// Get today's puzzle
export async function getPuzzleToday(): Promise<Puzzle>

// Validate solution (intermediate check)
export async function validatePuzzle(
  puzzleId: string,
  solution: number[][]
): Promise<Result<{ correct: boolean }>>

// Complete puzzle (final submission)
export async function completePuzzle(
  puzzleId: string,
  solution: number[][],
  solvePath: SolvePathEntry[]
): Promise<Result<CompletionData>>
```

**Leaderboard Actions (`actions/leaderboard.ts`):**

```typescript
'use server'

// Get leaderboard for puzzle
export async function getLeaderboard(
  puzzleId: string,
  limit?: number
): Promise<LeaderboardEntry[]>

// Get user's rank
export async function getUserRank(
  puzzleId: string,
  userId: string
): Promise<number | null>
```

**Auth Actions (`actions/auth.ts`):**

```typescript
'use server'

// Migrate guest data to authenticated user
export async function migrateGuestData(
  guestData: LocalStorageData
): Promise<Result<void>>
```

**Streak Actions (`actions/streak.ts`):**

```typescript
'use server'

// Update streak after completion
export async function updateStreak(
  userId: string
): Promise<Result<StreakData>>

// Get user's streak stats
export async function getStreakStats(
  userId: string
): Promise<StreakData>
```

### Real-Time Subscriptions

**Leaderboard Updates:**

```typescript
// Client-side subscription
const channel = supabase
  .channel('leaderboard-updates')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'leaderboards',
      filter: `puzzle_id=eq.${puzzleId}`
    },
    (payload) => {
      // Handle new leaderboard entry
    }
  )
  .subscribe()
```

---

## Security Architecture

### Authentication Security

- **OAuth Only**: No password storage, delegated to Google/GitHub/Apple
- **HTTP-only Cookies**: Session tokens not accessible to JavaScript
- **PKCE Flow**: Proof Key for Code Exchange prevents authorization code interception
- **Server Validation**: Always use `getUser()` for auth checks (validates with Supabase server)

### Data Protection

- **Row Level Security (RLS)**: PostgreSQL policies enforce data isolation
- **Input Validation**: Zod schemas validate all Server Action inputs
- **SQL Injection Prevention**: Supabase parameterized queries
- **XSS Protection**: React auto-escapes, DOMPurify for user-generated content

### Anti-Cheat Measures

- **Server-Side Validation**: All puzzle solutions validated on server
- **Server-Side Timing**: Completion time calculated from `started_at` - `completed_at` (server timestamps)
- **Client Time Display-Only**: Timer shown to user can't be manipulated for leaderboard
- **Auto-Flagging**: Completions under 120 seconds flagged for review
- **Pause Detection**: Excessive pauses tracked (future: exclude from leaderboard)

### Rate Limiting & Abuse Prevention

**Supabase Free Tier Limits:**
- Unlimited API requests (but subject to abuse detection)
- 200 concurrent real-time connections
- 500MB database storage

**Application-Level Protection:**

```typescript
// lib/utils/rate-limit.ts
import { LRUCache } from 'lru-cache'

type RateLimitOptions = {
  interval: number // milliseconds
  uniqueTokenPerInterval: number
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit

        return isRateLimited ? reject() : resolve()
      })
  }
}

// Usage in Server Action
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500
})

export async function completePuzzle(puzzleId: string, solution: number[][]) {
  const userId = await getCurrentUserId()

  try {
    await limiter.check(3, userId) // 3 submissions per minute
  } catch {
    return { success: false, error: new Error('Too many attempts. Try again later.') }
  }

  // ... validation logic
}
```

**Protection Strategies:**
- **Submission Rate Limit**: 3 puzzle submissions per minute per user
- **Real-time Connection Limit**: 1 connection per user (disconnect stale connections)
- **Duplicate Submission Prevention**: Check existing completion before accepting
- **IP-Based Fallback**: Rate limit by IP for unauthenticated users

**Monitoring:**
- Track submission failures by user (auto-ban at 50+ failed submissions/day)
- Monitor real-time connection churn (disconnect/reconnect patterns)
- Alert on database query spikes

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # Server-side only
```

**Never commit:** Service role key, OAuth secrets

---

## Testing Strategy

### Testing Philosophy

**Target Coverage:** 70% overall, 90% for critical paths (auth, puzzle validation, leaderboard)

**Testing Pyramid:**
- **70% Unit Tests**: Pure functions, utilities, hooks
- **20% Integration Tests**: Components with Server Actions, database operations
- **10% E2E Tests**: Critical user flows only

### Test Scenarios by Epic

**Epic 1: Foundation (CI/CD, Design System)**
- ✅ Lint passes (ESLint, TypeScript strict)
- ✅ Build succeeds (Next.js production build)
- ✅ shadcn/ui components render without errors

**Epic 2: Puzzle System**
- 🔴 **Critical**: Puzzle validation (correct/incorrect solution)
- 🔴 **Critical**: Timer starts when puzzle loads
- 🔴 **Critical**: Grid state persists to localStorage
- 🟡 **Important**: Number pad input updates grid
- 🟡 **Important**: Auto-save on cell change (debounced)
- 🟢 **Nice-to-have**: Keyboard navigation (arrow keys)

**Epic 3: Authentication**
- 🔴 **Critical**: OAuth flow (Google/GitHub/Apple)
- 🔴 **Critical**: Guest data migration on first auth
- 🔴 **Critical**: Session persists across page reloads
- 🟡 **Important**: Logout clears session
- 🟢 **Nice-to-have**: Auth state displayed in header

**Epic 4: Leaderboard**
- 🔴 **Critical**: Leaderboard displays top 100 by time
- 🔴 **Critical**: User rank shows personal position
- 🔴 **Critical**: Real-time updates on new submission
- 🟡 **Important**: Leaderboard loads in <2 seconds
- 🟢 **Nice-to-have**: Pagination for large leaderboards

**Epic 5: Social Sharing**
- 🔴 **Critical**: Emoji grid generates correctly
- 🔴 **Critical**: Share modal opens on completion
- 🟡 **Important**: Copy to clipboard works
- 🟡 **Important**: Twitter/WhatsApp share URLs correct
- 🟢 **Nice-to-have**: Share animation smooth

**Epic 6: Engagement**
- 🔴 **Critical**: Streak increments on daily completion
- 🔴 **Critical**: Streak resets after missed day
- 🟡 **Important**: Stats cards display accurate data
- 🟡 **Important**: Calendar highlights completion days
- 🟢 **Nice-to-have**: Streak freeze works correctly

### Unit Tests (Jest + React Testing Library)

**What to Test:**
- Pure utility functions (`date-utils.ts`, `format.ts`, `emoji-grid.ts`)
- Custom hooks (`useTimer`, `usePuzzle`, `useAuth`)
- Components with complex logic (not presentational components)

**Example Tests:**

```typescript
// lib/utils/emoji-grid.test.ts
import { generateEmojiGrid } from './emoji-grid'

describe('generateEmojiGrid', () => {
  it('generates 9x9 grid with correct emojis', () => {
    const grid = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      // ... full grid
    ]
    const result = generateEmojiGrid(grid, grid)
    expect(result).toMatch(/🟩{81}/) // All correct
  })

  it('shows incorrect cells as red', () => {
    const puzzle = [[0, 0, 0, ...], ...]
    const solution = [[1, 2, 9, ...], ...] // Wrong number
    const result = generateEmojiGrid(puzzle, solution)
    expect(result).toContain('🟥') // Has incorrect cell
  })
})

// hooks/useTimer.test.ts
import { renderHook, act } from '@testing-library/react'
import { useTimer } from './useTimer'

describe('useTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  it('increments elapsed time every second', () => {
    const startTime = Date.now()
    const { result } = renderHook(() => useTimer(startTime))

    expect(result.current).toBe(0)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current).toBe(1)
  })
})
```

### Integration Tests (React Testing Library)

**What to Test:**
- Components that call Server Actions
- Components with complex state interactions
- Form submissions

**Example Tests:**

```typescript
// components/puzzle/SudokuGrid.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SudokuGrid } from './SudokuGrid'

describe('SudokuGrid', () => {
  it('updates cell when number pad clicked', async () => {
    const puzzle = [[0, 2, 3, ...], ...]
    render(<SudokuGrid puzzle={puzzle} />)

    // Click first cell
    const cell = screen.getByLabelText(/Row 1, Column 1/)
    fireEvent.click(cell)

    // Click number 5 on number pad
    const numberButton = screen.getByRole('button', { name: '5' })
    fireEvent.click(numberButton)

    // Cell should update
    expect(cell).toHaveTextContent('5')
  })

  it('persists grid to localStorage on change', async () => {
    const puzzle = [[0, 2, 3, ...], ...]
    render(<SudokuGrid puzzle={puzzle} />)

    // Make change
    const cell = screen.getByLabelText(/Row 1, Column 1/)
    fireEvent.click(cell)
    const numberButton = screen.getByRole('button', { name: '5' })
    fireEvent.click(numberButton)

    // Check localStorage
    const stored = localStorage.getItem('puzzle-storage')
    expect(stored).toContain('"grid":[[5,2,3')
  })
})
```

### E2E Tests (Playwright)

**Critical Flows Only:**

**1. Complete Puzzle Flow (Guest User)**
```typescript
// e2e/puzzle-completion.spec.ts
import { test, expect } from '@playwright/test'

test('guest user can complete puzzle and see result', async ({ page }) => {
  // Navigate to puzzle page
  await page.goto('/')

  // Wait for puzzle to load
  await expect(page.locator('[data-testid="sudoku-grid"]')).toBeVisible()

  // Solve puzzle (pre-filled solution for test)
  // ... fill in grid ...

  // Submit
  await page.click('[data-testid="submit-button"]')

  // Verify completion modal
  await expect(page.locator('[data-testid="completion-modal"]')).toBeVisible()
  await expect(page.locator('text=/Completed in \\d+:\\d+/')).toBeVisible()

  // Verify share button available
  await expect(page.locator('[data-testid="share-button"]')).toBeVisible()
})
```

**2. Guest to Authenticated User Migration**
```typescript
// e2e/guest-to-auth.spec.ts
test('guest data migrates on first auth', async ({ page }) => {
  // 1. Play as guest
  await page.goto('/')
  // ... solve puzzle ...

  // 2. Authenticate
  await page.click('[data-testid="auth-button"]')
  await page.click('text="Sign in with Google"')
  // ... OAuth flow (mocked in test environment) ...

  // 3. Verify data migrated
  await page.goto('/profile')
  await expect(page.locator('text=/Total Completions: 1/')).toBeVisible()
})
```

**3. Real-time Leaderboard Updates**
```typescript
// e2e/leaderboard-realtime.spec.ts
test('leaderboard updates in real-time', async ({ page, context }) => {
  // Open leaderboard in first tab
  await page.goto('/leaderboard')
  const initialCount = await page.locator('[data-testid="leaderboard-row"]').count()

  // Open puzzle in second tab
  const page2 = await context.newPage()
  await page2.goto('/')
  // ... complete puzzle in page2 ...

  // Verify first tab updates
  await page.waitForSelector(`[data-testid="leaderboard-row"]:nth-child(${initialCount + 1})`)
  const newCount = await page.locator('[data-testid="leaderboard-row"]').count()
  expect(newCount).toBe(initialCount + 1)
})
```

### Test Data Strategy

**Fixtures:**
```typescript
// e2e/fixtures/puzzle.ts
export const TEST_PUZZLE = {
  id: 'test-puzzle-2025-01-10',
  puzzle_date: '2025-01-10',
  puzzle_data: [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    // ... complete puzzle
  ],
  solution: [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    // ... complete solution
  ],
  difficulty: 'medium'
}
```

**Database Seeding (for E2E):**
```typescript
// e2e/setup/seed-db.ts
import { createClient } from '@supabase/supabase-js'

export async function seedTestData() {
  const supabase = createClient(
    process.env.TEST_SUPABASE_URL!,
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!
  )

  // Insert test puzzle
  await supabase.from('puzzles').insert(TEST_PUZZLE)

  // Insert test users
  await supabase.from('users').insert({
    id: 'test-user-1',
    username: 'testuser',
    email: 'test@example.com'
  })
}
```

### CI Test Execution

**GitHub Actions Workflow:**
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test -- --coverage
      - uses: codecov/codecov-action@v3 # Optional

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Coverage Goals

| Layer | Target Coverage | Critical Paths |
|-------|----------------|----------------|
| **Utilities** | 90% | 100% (date-utils, emoji-grid, anti-cheat) |
| **Hooks** | 80% | 100% (useTimer, usePuzzle) |
| **Components** | 60% | 90% (SudokuGrid, AuthButton) |
| **Server Actions** | 90% | 100% (completePuzzle, validatePuzzle) |
| **E2E Flows** | N/A | 100% (4 critical flows) |

---

## Performance Considerations

### Optimization Strategies

**Code Splitting:**
- Dynamic imports for heavy components (`SudokuGrid`, `ShareModal`)
- Route-based code splitting (automatic with Next.js App Router)

**Caching:**
- React Query caching for leaderboards, user stats
- Supabase client-side cache (automatic)
- Next.js static generation for landing pages

**Real-Time Optimization:**
- Filter subscriptions by `puzzle_id` (avoid global subscriptions)
- Client-side leaderboard re-ranking (avoid DB query per update)
- Debounce rapid updates (300ms)

**Database Optimization:**
- Indexes on all foreign keys and query columns
- Composite index on `leaderboards(puzzle_id, completion_time_seconds)`
- RLS policies use indexed columns

**Image Optimization:**
- Next.js Image component for auto-optimization
- WebP format with fallbacks
- Lazy loading for below-the-fold content

**Performance Targets (from PRD):**
- Initial Load: <2 seconds
- Time to Interactive: <3 seconds
- Lighthouse Score: >90 (mobile)
- Real-time Update Latency: <1 second

---

## Monitoring & Observability

### Error Tracking

**Tool:** Sentry (`@sentry/nextjs`)

**Implementation:** Story 1.6 (Error Tracking & Monitoring Setup)

**Configuration Files:**
- `lib/monitoring/sentry.ts` - Sentry initialization with error filtering
- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking (Server Actions, API routes)
- `sentry.edge.config.ts` - Edge runtime error tracking (Middleware)
- `next.config.ts` - Wrapped with `withSentryConfig()` for build-time integration

**Environment Variables:**
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry project DSN (from sentry.io dashboard)
- `SENTRY_ORG` - Sentry organization (optional, for sourcemaps)
- `SENTRY_PROJECT` - Sentry project name (optional, for sourcemaps)

**Usage Examples:**

```typescript
// Basic error capture
import { captureException } from '@/lib/monitoring/sentry'

try {
  await completePuzzle(puzzleId)
} catch (error) {
  captureException(error, {
    userId: 'user-123',
    puzzleId: 'puzzle-456',
    action: 'completePuzzle'
  }, 'high')
  throw error
}

// Set user context after login
import { setUser } from '@/lib/monitoring/sentry'
setUser('user-123') // All subsequent errors include user ID

// Add breadcrumbs for debugging
import { addBreadcrumb } from '@/lib/monitoring/sentry'
addBreadcrumb('user-action', 'Started puzzle', { puzzleId: 'puzzle-456' })
```

**What to Track:**
- ✅ Server Action failures (auth, validation, database)
- ✅ Real-time connection errors
- ✅ Client-side JavaScript errors
- ✅ API timeout errors (Supabase)
- ❌ Don't track: User input validation errors, expected 404s, ResizeObserver errors

**Error Severity Levels:**
- **Critical**: Database connection failures, auth system down (page developer immediately)
- **High**: Error rate >2%, response time >1s, puzzle validation failures (alert within 1 hour)
- **Medium**: Individual errors affecting user experience, real-time connection drops
- **Low**: UI rendering glitches, non-critical feature failures, completion rate <40%

**Error Filtering:**
Sentry filters noisy browser errors automatically:
- ResizeObserver loop errors
- Non-Error promise rejections
- Browser extension errors
- Expected analytics endpoint failures

**Performance Monitoring:**
- Sample rate: 10% of transactions (cost-effective)
- 100% of errors captured
- Automatic transaction tracking for Server Actions and API routes

### Performance Monitoring

**Tool:** Vercel Analytics + Web Vitals

**Metrics to Monitor:**

**1. Core Web Vitals (Automated by Vercel)**
- **LCP (Largest Contentful Paint)**: <2.5s (target: <1.5s)
- **FID (First Input Delay)**: <100ms (target: <50ms)
- **CLS (Cumulative Layout Shift)**: <0.1 (target: <0.05)

**2. Custom Metrics**
```typescript
// lib/monitoring/web-vitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    url: window.location.href
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', body)
  }
}

onCLS(sendToAnalytics)
onFID(sendToAnalytics)
onLCP(sendToAnalytics)
onFCP(sendToAnalytics)
onTTFB(sendToAnalytics)

// Custom business metrics
export function trackPuzzleCompletion(time: number) {
  sendToAnalytics({
    name: 'puzzle_completion_time',
    value: time,
    id: crypto.randomUUID()
  })
}
```

**3. Real-Time Connection Health**
```typescript
// lib/monitoring/realtime-health.ts
export function monitorRealtimeHealth() {
  const channel = supabase.channel('leaderboard-updates')

  channel
    .on('system', { event: 'connected' }, () => {
      logger.info('Real-time connected')
    })
    .on('system', { event: 'error' }, (error) => {
      Sentry.captureException(error, {
        tags: { component: 'realtime' }
      })
    })
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        // Alert or retry logic
      }
    })
}
```

### Key Metrics Dashboard

**Metrics to Track Daily:**

| Metric | Target | Alert Threshold | Source |
|--------|--------|----------------|--------|
| **Uptime** | 99.9% | <99% | Vercel |
| **API Error Rate** | <0.5% | >2% | Sentry |
| **P95 Response Time** | <500ms | >1000ms | Vercel Analytics |
| **Real-time Connection Success** | >95% | <90% | Custom logs |
| **Daily Active Users** | Growth | -20% day-over-day | Vercel Analytics |
| **Puzzle Completion Rate** | >60% | <40% | Database query |
| **Leaderboard Load Time** | <2s | >5s | Web Vitals |

### Logging Strategy

**Structured Logging (from earlier section, expanded):**

```typescript
// lib/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  puzzleId?: string
  action?: string
  duration?: number
  [key: string]: any
}

export const logger = {
  log: (level: LogLevel, message: string, context?: LogContext) => {
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      ...context
    }

    if (level === 'error') {
      console.error(JSON.stringify(logEntry))
      Sentry.captureMessage(message, { level, extra: context })
    } else {
      console.log(JSON.stringify(logEntry))
    }
  },

  info: (message: string, context?: LogContext) =>
    logger.log('info', message, context),

  warn: (message: string, context?: LogContext) =>
    logger.log('warn', message, context),

  error: (message: string, error: Error, context?: LogContext) =>
    logger.log('error', message, { ...context, error: error.message, stack: error.stack }),

  debug: (message: string, context?: LogContext) =>
    logger.log('debug', message, context)
}

// Usage examples
logger.info('Puzzle completed', { userId, puzzleId, duration: 325 })
logger.warn('Real-time connection slow', { latency: 2500 })
logger.error('Database query failed', error, { query: 'getLeaderboard' })
```

**Log Retention:**
- **Development**: Console only (immediate feedback)
- **Production**: Vercel Logs (7 days retention on free tier)
- **Long-term**: Export to external service (optional: CloudWatch, DataDog)

### Alerting Strategy

**Implementation:** Story 1.6 (Error Tracking & Monitoring Setup)

**Critical Alerts (Immediate Action - PagerDuty/Email):**
- Database connection failures (>5 in 5 minutes)
- Auth system down (>10% failure rate)
- Complete site outage (uptime check fails)

**High-Priority Alerts (Check within 1 hour - Slack):**
- Error rate >2% (15-minute window)
- P95 response time >1s (sustained for 10 minutes)
- Real-time connection success <90%

**Low-Priority Alerts (Daily digest - Email):**
- Puzzle completion rate <40%
- New user signups down >20% day-over-day
- Abnormal puzzle difficulty (completion time variance)

**Alert Configuration:**

1. **Sentry Alerts** (configured in Sentry dashboard):
   - Navigate to: Settings → Projects → [your-project] → Alerts
   - Create Issue Alert:
     - Trigger: >10 errors in 5 minutes → Critical
     - Trigger: Error rate >2% in 15 minutes → High
     - Actions: Email notification to developer
   - Performance Alert:
     - Trigger: P95 response time >1s for 10 minutes
     - Actions: Slack notification (if configured)

2. **Vercel Alerts** (configured in Vercel dashboard):
   - Navigate to: Project Settings → Integrations → Notifications
   - Build Failures: Email notification
   - Deployment Errors: Email notification
   - High Error Rate: Alert if >2% (Pro tier feature)

3. **Supabase Monitoring** (configured in Supabase dashboard):
   - Navigate to: Project → Settings → Database → Metrics
   - Query Performance:
     - Alert if sustained queries >100ms
     - Monitor slow query logs
   - Connection Pool:
     - Alert at >80% usage
     - Monitor connection count trends
   - Database Size:
     - Alert at 80% of 500MB limit (free tier)
     - Track growth rate weekly

### Monitoring Dashboards

**Implementation:** Story 1.6 (Error Tracking & Monitoring Setup)

**Key Metrics to Monitor:**

| Metric | Target | Critical Threshold | Dashboard |
|--------|--------|-------------------|-----------|
| Uptime | 99.9% | <99% | Vercel, Sentry |
| API Error Rate | <0.5% | >2% | Sentry |
| P95 Response Time | <500ms | >1s | Sentry, Vercel |
| Real-time Connection Success | >95% | <90% | Custom (lib/monitoring/realtime-health.ts) |
| LCP (Largest Contentful Paint) | <2.5s | >4s | Vercel Analytics |
| FID/INP (Interaction to Next Paint) | <100ms | >300ms | Vercel Analytics |
| CLS (Cumulative Layout Shift) | <0.1 | >0.25 | Vercel Analytics |
| Daily Active Users | Growing | Declining 20%+ | Vercel Analytics |
| Puzzle Completion Rate | >60% | <40% | Custom Analytics |

**Dashboard Access:**

1. **Sentry Dashboard** (sentry.io):
   - Errors & Performance: Issues → Search/Filter
   - Error Rate: Stats → Overview
   - Performance Transactions: Performance → Summary
   - User Impact: Issues → User Feedback
   - Custom Queries: Discover → Build Query

2. **Vercel Dashboard** (vercel.com):
   - Analytics: Project → Analytics Tab
     - Core Web Vitals (LCP, FID/INP, CLS)
     - Page views and unique visitors
     - Top pages by traffic
   - Logs: Project → Logs Tab
     - Filter by log level (info, warn, error)
     - Search by message or context
     - 7-day retention on free tier
   - Deployments: Project → Deployments
     - Build status and errors
     - Deployment logs

3. **Supabase Dashboard** (supabase.com):
   - Database Metrics: Project → Database → Performance
     - Query execution time (>100ms flagged)
     - Connection pool usage
     - Database size and growth
   - Real-time Connections: Project → Database → Realtime
     - Active connections
     - Channel subscriptions
   - Table Editor: Project → Table Editor
     - Data inspection and queries
   - SQL Editor: Project → SQL Editor
     - Custom queries and analytics

**Monitoring Checklist:**

**Daily:**
- ✅ Check Sentry for new critical errors (5 minutes)
- ✅ Review Vercel deployment status (2 minutes)
- ✅ Scan Vercel Logs for error spikes (3 minutes)

**Weekly:**
- ✅ Review Vercel Analytics Core Web Vitals (10 minutes)
- ✅ Check traffic trends and user growth (5 minutes)
- ✅ Review Sentry performance transactions (10 minutes)
- ✅ Check Supabase query performance (5 minutes)
- ✅ Review and tune alert thresholds if needed (5 minutes)

**Monthly:**
- ✅ Deep dive into Sentry error patterns (30 minutes)
- ✅ Analyze Supabase database size and growth (10 minutes)
- ✅ Review and optimize slow queries (30 minutes)
- ✅ Check connection pool usage trends (10 minutes)
- ✅ Export long-term metrics (optional)

**Custom Metrics Dashboard:**

Real-time connection health metrics are tracked in-memory and can be accessed via:

```typescript
import { getConnectionMetrics, checkRealtimeHealth } from '@/lib/monitoring/realtime-health'

// Get current metrics
const metrics = getConnectionMetrics()
console.log('Success Rate:', (metrics.successfulConnections / metrics.totalAttempts) * 100)
console.log('Average Latency:', metrics.averageLatency)

// Run health check
const health = checkRealtimeHealth()
if (!health.healthy) {
  console.warn('Real-time health issues:', health.issues)
}
```

### Database Query Monitoring

**Supabase Dashboard Metrics:**
- Query execution time (flag queries >100ms)
- Connection pool usage (alert at >80%)
- RLS policy performance
- Index hit rate (target: >95%)

**Slow Query Logging:**
```sql
-- Enable slow query logging in Supabase (via SQL Editor)
ALTER DATABASE postgres SET log_min_duration_statement = 100; -- Log queries >100ms
```

---

## SEO & Social Sharing

### Meta Tags & OpenGraph

**Root Layout (`app/layout.tsx`):**
```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sudoku Race - Daily Competitive Sudoku',
  description: 'Solve today\'s Sudoku and compete on the global leaderboard. Daily puzzles, real-time rankings, and share your results.',
  metadataBase: new URL('https://sudokurace.com'),
  openGraph: {
    title: 'Sudoku Race',
    description: 'Daily competitive Sudoku with global leaderboards',
    type: 'website',
    locale: 'en_US',
    url: 'https://sudokurace.com',
    siteName: 'Sudoku Race',
    images: [
      {
        url: '/og-image.png', // 1200x630px
        width: 1200,
        height: 630,
        alt: 'Sudoku Race - Daily Competitive Sudoku'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sudoku Race',
    description: 'Daily competitive Sudoku with global leaderboards',
    images: ['/og-image.png'],
    creator: '@sudokurace' // Update with actual Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}
```

### Dynamic OpenGraph Images

**For Share Results (Epic 5):**
```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const time = searchParams.get('time') || '00:00'
  const rank = searchParams.get('rank') || 'N/A'

  return new ImageResponse(
    (
      <div style={{ display: 'flex', fontSize: 60, background: 'white' }}>
        <div>I completed today's Sudoku in {time}!</div>
        <div>Rank: #{rank}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  )
}

// Usage in ShareModal
const ogUrl = `/api/og?time=${formatTime(time)}&rank=${rank}`
```

### Sitemap

**Static Sitemap (`app/sitemap.ts`):**
```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://sudokurace.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: 'https://sudokurace.com/puzzle',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: 'https://sudokurace.com/leaderboard',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9
    },
    {
      url: 'https://sudokurace.com/profile',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5
    }
  ]
}
```

### Robots.txt

**Static robots.txt (`app/robots.ts`):**
```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/']
    },
    sitemap: 'https://sudokurace.com/sitemap.xml'
  }
}
```

### Social Share URLs

**Twitter Share:**
```typescript
// components/share/ShareButtons.tsx
const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
  `I solved today's Sudoku in ${formatTime(time)}! 🎉\n\n${emojiGrid}\n\nCan you beat my time?`
)}&url=${encodeURIComponent('https://sudokurace.com')}&hashtags=SudokuRace,DailySudoku`
```

**WhatsApp Share:**
```typescript
const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
  `I solved today's Sudoku in ${formatTime(time)}! 🎉\n\n${emojiGrid}\n\nCan you beat my time? https://sudokurace.com`
)}`
```

**Clipboard (with toast feedback):**
```typescript
async function copyToClipboard() {
  const text = `I solved today's Sudoku in ${formatTime(time)}! 🎉\n\n${emojiGrid}\n\nCan you beat my time? https://sudokurace.com`

  await navigator.clipboard.writeText(text)
  toast.success('Copied to clipboard!')
}
```

### Structured Data (JSON-LD)

**For better search results:**
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Sudoku Race',
    description: 'Daily competitive Sudoku with global leaderboards',
    url: 'https://sudokurace.com',
    applicationCategory: 'GameApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  }

  return (
    <html>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Analytics

**Vercel Analytics (automatic):**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Custom Event Tracking (optional):**
```typescript
import { track } from '@vercel/analytics'

// Track key events
track('puzzle_completed', { time, rank })
track('user_signed_in', { provider: 'google' })
track('share_clicked', { platform: 'twitter' })
```

---

## Deployment Architecture

### Vercel Deployment

**Setup:**
1. Connect GitHub repository
2. Auto-deploy on push to `main`
3. Preview deployments for PRs
4. Environment variables configured in Vercel dashboard

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (if needed for admin operations)

**Edge Functions:**
- Middleware runs on Vercel Edge (session refresh)
- Server Actions run on serverless functions

**Analytics:**
- Vercel Analytics (Core Web Vitals, page performance)
- Supabase Dashboard (database queries, connection pool)

### CI/CD Pipeline

**GitHub Actions Workflow (`.github/workflows/ci.yml`):**

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

**Deployment Flow:**
1. Push to `main` → Auto-deploy to production
2. Push to PR → Preview deployment with unique URL
3. Merge PR → Preview deployment promoted to production

---

## Development Environment

### Prerequisites

- Node.js ≥20.9
- npm ≥10.0
- Git
- Supabase account (free tier)
- Vercel account (free tier)

### Setup Commands

```bash
# Clone repository
git clone https://github.com/spardutti/sudoku-race.git
cd sudoku-race

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with Supabase credentials

# Initialize Supabase (if using local development)
npx supabase init
npx supabase start
npx supabase db push

# Run database migrations
# (Execute SQL from docs/database-schema.md in Supabase SQL Editor)

# Seed initial puzzle
npm run seed:puzzle

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "seed:puzzle": "tsx scripts/seed-puzzle.ts"
  }
}
```

### VSCode Settings (Recommended)

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Server Actions Over REST API

**Decision:** Use Next.js Server Actions instead of traditional REST API routes

**Rationale:**
- Type-safe by default (no manual type definitions)
- Simpler code (call like functions, no explicit fetch)
- Automatic caching and revalidation
- Better security (no exposed endpoints)
- All operations are internal (no external API needed for MVP)

**Trade-offs:**
- ✅ Faster development, fewer bugs
- ❌ Can't call from external apps (not needed for MVP)
- ❌ Future mobile app would need REST API or tRPC

**Status:** Accepted

---

### ADR-002: Supabase Over Self-Hosted PostgreSQL

**Decision:** Use Supabase (managed PostgreSQL + Auth + Realtime)

**Rationale:**
- Integrated auth (OAuth, session management)
- Built-in real-time (PostgreSQL change subscriptions)
- Row Level Security (data isolation)
- Free tier sufficient for MVP (500MB, 200 connections)
- Faster time-to-market

**Trade-offs:**
- ✅ Less infrastructure to manage
- ✅ Faster development
- ❌ Vendor lock-in (mitigated: PostgreSQL underneath, portable)
- ❌ Real-time connection limits on free tier (acceptable for MVP)

**Status:** Accepted

---

### ADR-003: Zustand Over Redux

**Decision:** Use Zustand for local state management

**Rationale:**
- Lightweight (1kb vs 13kb for Redux Toolkit)
- Simple API, no boilerplate
- TypeScript-first
- Built-in persistence middleware (localStorage)
- Perfect for puzzle state (grid, selected cell, solve path)

**Trade-offs:**
- ✅ Faster development, less code
- ✅ Easier to learn for AI agents
- ❌ Less ecosystem/middleware (not needed for this project)

**Status:** Accepted

---

### ADR-004: shadcn/ui Over Pre-built Component Library

**Decision:** Use shadcn/ui (copy-paste components) instead of Material UI, Chakra, etc.

**Rationale:**
- Full control over styling (newspaper aesthetic)
- Copy-paste approach (not a dependency)
- Built on Radix UI (accessible by default)
- Tailwind-based (consistent with project)
- Only install what you need

**Trade-offs:**
- ✅ Complete customization
- ✅ No bundle bloat
- ❌ Manual updates (acceptable, components are copied)

**Status:** Accepted

---

### ADR-005: Server-Side Timer Validation

**Decision:** Display timer on client, validate time on server

**Rationale:**
- Anti-cheat requirement (prevent time manipulation)
- Source of truth: `started_at` and `completed_at` server timestamps
- Client timer is display-only (can't affect leaderboard)

**Implementation:**
- Store `started_at` in database when puzzle loads
- Calculate `completion_time_seconds = completed_at - started_at` (server-side)
- Client timer shows elapsed time, but doesn't submit it

**Trade-offs:**
- ✅ Prevents cheating
- ✅ Fair leaderboard
- ❌ Slight complexity (two timer implementations)

**Status:** Accepted

---

### ADR-006: Guest Play with LocalStorage

**Decision:** Allow guest play with localStorage, migrate to DB on auth

**Rationale:**
- Reduce friction (play immediately without signup)
- Preserve progress (localStorage persistence)
- Seamless migration (migrate localStorage → DB in OAuth callback)

**Implementation:**
- Zustand persist middleware saves to localStorage
- On OAuth callback, read localStorage and insert into DB
- Clear localStorage after migration

**Trade-offs:**
- ✅ Lower barrier to entry
- ✅ Better conversion (play first, then auth)
- ❌ Data loss if localStorage cleared (acceptable, can replay)

**Status:** Accepted

---

_Generated by Winston - BMAD Decision Architecture Workflow v1.0_
_Date: 2025-11-09 (Enhanced: 2025-11-10)_
_For: Spardutti_

---

## Document Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-09 | 1.0 | Initial architecture document | Winston |
| 2025-11-10 | 1.1 | Added: Testing Strategy, Monitoring & Observability, Database Migrations, Rate Limiting & Abuse Prevention, SEO & Social Sharing sections | Winston |
