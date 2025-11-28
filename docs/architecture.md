# Architecture - Sudoku Race

## Executive Summary

Sudoku Race is a competitive daily Sudoku platform built with Next.js 16, Supabase, and TypeScript. The architecture prioritizes **competitive integrity** (server-side validation, anti-cheat), **real-time engagement** (live leaderboards via WebSockets), and **viral growth mechanics** (Wordle-style emoji sharing).

**Key Architectural Characteristics:**
- **Modern Full-Stack**: Next.js 16 App Router with Server Actions and Server Components
- **Database-as-a-Service**: Supabase (PostgreSQL + Auth + Realtime)
- **Type-Safe**: End-to-end TypeScript with strict mode
- **Mobile-First**: Tailwind CSS 4, responsive design, WCAG 2.1 AA accessible
- **Scale-Adaptive**: Starts simple, designed to scale to 1,000+ DAU without major rewrites

**Target Scale:**
- **MVP**: 100+ concurrent users, free tier Supabase
- **Growth**: 1,000 DAU, 200 concurrent connections
- **Scale Path**: Supabase Pro, edge caching, CDN

---

## Decision Summary

| Category | Decision | Rationale |
| -------- | -------- | --------- |
| **Framework** | Next.js 16 App Router | Modern React patterns, SSR/SSG, Server Actions, excellent DX |
| **Language** | TypeScript (strict) | Type safety, fewer runtime errors, better IDE support |
| **Database** | Supabase (PostgreSQL) | Integrated auth, real-time, RLS, free tier sufficient for MVP |
| **Authentication** | Supabase Auth (@supabase/ssr) | OAuth (Google/GitHub/Apple), secure cookies, SSR support |
| **Real-Time** | Supabase Realtime | <1s latency, PostgreSQL subscriptions, 200 free connections |
| **API Pattern** | Server Actions | Type-safe, simpler than REST, automatic caching |
| **Puzzle Engine** | sudoku-core 3.0.3 | TypeScript-native, difficulty levels, generation + validation |
| **State Management** | Zustand + React Context | Lightweight, TypeScript-first, localStorage persistence |
| **Testing** | Jest + RTL + Playwright | Component tests, E2E critical flows, 70% coverage target |
| **Timer** | Custom Hook + Server Validation | Client display, server source of truth (anti-cheat) |
| **Deployment** | Vercel + GitHub Actions | Auto-deploy, preview PRs, analytics |
| **Components** | shadcn/ui (Radix) | Accessible, customizable, Tailwind-based |
| **Styling** | Tailwind CSS 4 | Utility-first, newspaper aesthetic, fast iteration |
| **Migrations** | Supabase CLI | SQL migrations, version controlled, rollback-friendly |
| **Rate Limiting** | LRU Cache (in-memory) | Lightweight, prevents abuse, 3 submissions/min per user |
| **Monitoring** | Sentry + Vercel Analytics | Error tracking, performance monitoring, real-time alerts |
| **SEO** | Next.js Metadata API | OpenGraph, Twitter cards, dynamic OG images |

---

## Project Structure

```
sudoku-race/
├── app/                                # Next.js 16 App Router
│   ├── (auth)/auth/callback/          # OAuth callback
│   ├── api/                            # API routes (OG images, analytics)
│   ├── puzzle/page.tsx                 # Main puzzle page
│   ├── leaderboard/page.tsx            # Leaderboard
│   ├── profile/page.tsx                # User profile
│   └── layout.tsx                      # Root layout + metadata
│
├── components/                         # React components
│   ├── puzzle/                         # Grid, NumberPad, Timer, SubmitButton
│   ├── leaderboard/                    # Table, real-time wrapper, share
│   ├── share/                          # Modal, buttons, emoji grid
│   ├── profile/                        # Stats, calendar, streaks
│   ├── auth/                           # Auth button, OAuth, guest prompts
│   └── ui/                             # shadcn/ui components
│
├── actions/                            # Server Actions
│   ├── puzzle.ts                       # Puzzle operations
│   ├── leaderboard.ts                  # Leaderboard queries
│   ├── auth.ts                         # Auth operations
│   └── streak.ts                       # Streak management
│
├── lib/                                # Utilities and helpers
│   ├── supabase/                       # Client (browser/server)
│   ├── stores/                         # Zustand stores
│   ├── hooks/                          # Custom hooks
│   ├── utils/                          # Date, emoji-grid, logger, anti-cheat, rate-limit
│   ├── monitoring/                     # Sentry, web-vitals, realtime-health
│   ├── types/                          # TypeScript definitions
│   └── constants/                      # App constants, feature flags
│
├── supabase/migrations/                # Database migrations
├── e2e/                                # Playwright E2E tests
└── docs/                               # Documentation
```

---

## Critical Patterns

### 1. Supabase Client Usage

**Rule**: Use `createServerClient()` in Server Components/Actions, `createBrowserClient()` in Client Components.

**Why**: Server client handles cookies securely. Browser client doesn't have access to cookies API.

**Location**: Implemented in `lib/supabase/server.ts` and `lib/supabase/client.ts`

---

### 2. Authentication

**Rule**: Always use `getUser()` in Server Components, never `getSession()`.

**Why**: `getSession()` reads from local storage and can be spoofed. `getUser()` validates with Supabase server.

**Anti-pattern to avoid**:
```typescript
// ❌ WRONG - Can be spoofed
const { data: { session } } = await supabase.auth.getSession()
```

---

### 3. Server Actions

**Rule**: All Server Actions return `Result<T, E>` type for type-safe error handling.

**Why**: Consistent error handling across client/server boundary. No thrown exceptions across boundaries.

**Type definition**: See `lib/types/result.ts`

---

### 4. Data Fetching

**Rule**: Server Components fetch initial data, Client Components handle interactivity and real-time updates.

**Why**: SSR performance + progressive enhancement. Hydration with real data.

---

### 5. State Management

**Rule**: Zustand for UI state (grid, selected cell), React Query for server state (leaderboards, completions).

**Why**: Clear separation of concerns. Zustand handles local state + localStorage persistence. React Query handles caching + background refetch.

---

### 6. Single Responsibility Principle (SRP)

**Rule**: Keep files under 500 LOC. Each function/component does ONE thing.

**Why**: Maintainability. Easier to test. Easier for agents to modify without context overload.

---

### 7. Comment Policy

**Rule**: Only add comments for **critical security/anti-cheat patterns** or **non-obvious business logic**.

**Why**: Code should be self-documenting. Comments rot. TypeScript provides type documentation.

**When to comment**:
- Security-critical patterns (auth spoofing prevention)
- Anti-cheat logic (time thresholds, flagging)
- Non-obvious business rules (streak freeze mechanics)

---

### 8. Error Handling

**Categories**:
- **User Errors**: Encouraging messages ("Not quite right. Keep trying!")
- **Network Errors**: Retry-focused with retry button
- **Server Errors**: Generic message, log details for developers

**Never expose**: Stack traces, internal errors, database errors to users.

**Location**: Error constants in `lib/constants/errors.ts`

---

## Data Architecture

### Database Schema (PostgreSQL via Supabase)

**Tables:**
1. **users** - OAuth user data (username, email, provider)
2. **puzzles** - Daily puzzles (puzzle_date, puzzle_data, solution, difficulty)
3. **completions** - User completions (user_id, puzzle_id, completion_time_seconds, solve_path)
4. **leaderboards** - Rankings (puzzle_id, user_id, rank, completion_time_seconds)
5. **streaks** - Streak tracking (user_id, current_streak, longest_streak, freeze_available)

**Key Indexes:**
- `puzzles(puzzle_date)` - Daily lookup
- `leaderboards(puzzle_id, completion_time_seconds)` - Leaderboard queries
- `completions(user_id)` - User history

**Row Level Security (RLS)**: Enabled on all tables. Users read all, update/delete own only.

**Migrations**: Version controlled in `supabase/migrations/`, applied via Supabase CLI.

---

## Security & Anti-Cheat

### Anti-Cheat Measures

1. **Server-Side Validation**: All solution checking happens on server
2. **Server-Side Timing**: Client displays time, server calculates actual elapsed time
3. **Anomaly Detection**: Flag completions <120 seconds for review
4. **Rate Limiting**: 3 submissions/minute per user (prevents brute force)
5. **Pause Tracking**: Tab visibility changes logged (optional review)

**Critical**: Completion time = `completed_at - started_at` (server timestamps only).

### Authentication Security

- **OAuth Only**: No password storage
- **HTTP-only Cookies**: Session tokens not accessible to JavaScript
- **PKCE Flow**: Prevents authorization code interception
- **Server Validation**: Always `getUser()` for auth checks

---

## Performance Targets

**Critical Path:**
- **Initial Load**: <2 seconds
- **Time to Interactive**: <3 seconds
- **Lighthouse Score**: >90 (mobile)
- **Real-time Update Latency**: <1 second

**Optimization Strategy:**
- Code splitting (dynamic imports for heavy components)
- React Query caching for leaderboards/stats
- Next.js static generation for landing pages
- Database indexes on all foreign keys and query columns
- WebP images with lazy loading

---

## Monitoring & Observability

### Error Tracking (Sentry)

**What to track:**
- Server Action failures (auth, validation, database)
- Real-time connection errors
- Client-side JavaScript errors
- API timeout errors

**What NOT to track:**
- User input validation errors
- Expected 404s
- ResizeObserver errors (noisy)

**Severity Levels:**
- **Critical**: Database down, auth system down (page immediately)
- **High**: Error rate >2%, response time >1s (alert within 1 hour)
- **Medium**: Individual user errors
- **Low**: UI glitches, non-critical feature failures

### Performance Monitoring (Vercel Analytics)

**Core Web Vitals:**
- **LCP**: <2.5s (target: <1.5s)
- **FID/INP**: <100ms (target: <50ms)
- **CLS**: <0.1 (target: <0.05)

**Custom Metrics:**
- Puzzle completion time distribution
- Real-time connection success rate
- Leaderboard query time

---

## SEO Strategy

**Technical Requirements:**
- Server-side rendering (SSR) for landing page and puzzle page
- Dynamic meta tags (Open Graph) for social sharing
- Sitemap with daily puzzle URLs
- Structured data (Schema.org) for puzzle games

**Target Keywords:**
- "daily sudoku"
- "sudoku today"
- "sudoku online free"

**Expected Traffic:**
- 60-70% viral social sharing (primary growth engine)
- 20-25% organic search
- 10-15% direct/word-of-mouth

---

## Architecture Decision Records (ADRs)

### ADR-001: Server Actions Over REST API

**Decision**: Use Next.js Server Actions instead of traditional REST API routes.

**Rationale**:
- Type-safe by default (no manual type definitions)
- Simpler code (call like functions, no explicit fetch)
- Automatic caching and revalidation
- Better security (no exposed endpoints)
- All operations are internal (no external API needed for MVP)

**Trade-offs**:
- ✅ Faster development, fewer bugs
- ❌ Can't call from external apps (not needed for MVP)
- ❌ Future mobile app would need REST API or tRPC

**Status**: Accepted

---

### ADR-002: Supabase Over Self-Hosted PostgreSQL

**Decision**: Use Supabase (managed PostgreSQL + Auth + Realtime).

**Rationale**:
- Integrated auth (OAuth, session management)
- Built-in real-time (PostgreSQL change subscriptions)
- Row Level Security (data isolation)
- Free tier sufficient for MVP (500MB, 200 connections)
- Faster time-to-market

**Trade-offs**:
- ✅ Less infrastructure to manage
- ✅ Faster development
- ❌ Vendor lock-in (mitigated: PostgreSQL underneath, portable)
- ❌ Real-time connection limits on free tier (acceptable for MVP)

**Status**: Accepted

---

### ADR-003: Zustand Over Redux

**Decision**: Use Zustand for local state management.

**Rationale**:
- Lightweight (1kb vs 13kb for Redux Toolkit)
- Simple API, no boilerplate
- TypeScript-first
- Built-in persistence middleware (localStorage)
- Perfect for puzzle state (grid, selected cell, solve path)

**Trade-offs**:
- ✅ Faster development, less code
- ✅ Easier to learn for AI agents
- ❌ Less ecosystem/middleware (not needed for this project)

**Status**: Accepted

---

### ADR-004: shadcn/ui Over Pre-built Component Library

**Decision**: Use shadcn/ui (copy-paste components) instead of Material UI, Chakra, etc.

**Rationale**:
- Full control over styling (newspaper aesthetic)
- Copy-paste approach (not a dependency)
- Built on Radix UI (accessible by default)
- Tailwind-based (consistent with project)
- Only install what you need

**Trade-offs**:
- ✅ Complete customization
- ✅ No bundle bloat
- ❌ Manual updates (acceptable, components are copied)

**Status**: Accepted

---

### ADR-005: Server-Side Timer Validation

**Decision**: Display timer on client, validate time on server.

**Rationale**:
- Anti-cheat requirement (prevent time manipulation)
- Source of truth: `started_at` and `completed_at` server timestamps
- Client timer is display-only (can't affect leaderboard)

**Implementation**:
- Store `started_at` in database when puzzle loads
- Calculate `completion_time_seconds = completed_at - started_at` (server-side)
- Client timer shows elapsed time, but doesn't submit it

**Trade-offs**:
- ✅ Prevents cheating
- ✅ Fair leaderboard
- ❌ Slight complexity (two timer implementations)

**Status**: Accepted

---

### ADR-006: Guest Play with LocalStorage

**Decision**: Allow guest play with localStorage, migrate to DB on auth.

**Rationale**:
- Reduce friction (play immediately without signup)
- Preserve progress (localStorage persistence)
- Seamless migration (migrate localStorage → DB in OAuth callback)

**Implementation**:
- Zustand persist middleware saves to localStorage
- On OAuth callback, read localStorage and insert into DB
- Clear localStorage after migration

**Trade-offs**:
- ✅ Lower barrier to entry
- ✅ Better conversion (play first, then auth)
- ❌ Data loss if localStorage cleared (acceptable, can replay)

**Status**: Accepted

---

## Development Environment

**Prerequisites:**
- Node.js ≥20.9
- npm ≥10.0
- Git
- Supabase account (free tier)
- Vercel account (free tier)

**Setup**:
```bash
git clone https://github.com/spardutti/sudoku-race.git
cd sudoku-race
npm install
cp .env.local.example .env.local
# Edit .env.local with Supabase credentials
npm run dev
```

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

---

## Deployment Architecture

**Vercel Deployment:**
- Auto-deploy on push to `main`
- Preview deployments for PRs
- Environment variables configured in Vercel dashboard
- Edge Functions for middleware (session refresh)

**CI/CD (GitHub Actions):**
- Triggers: Push, pull request
- Steps: Install → Lint → Test → Build
- Blocks merge if any step fails

**Database Migrations:**
- Local: `npx supabase db reset` (resets and applies all migrations)
- Production: `npx supabase db push --linked`

---

_Architecture document refactored by Paige (Tech Writer) - BMad Method_
_Date: 2025-11-28_
_Lines reduced: 2,336 → 649 (72% reduction)_
