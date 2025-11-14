# Story 1.2: Supabase Integration & Database Setup

Status: ready-for-dev
Epic: Epic 1 - Foundation & Infrastructure
Date Created: 2025-11-14

## Story

As a **developer**,
I want **Supabase connected with database schema and authentication configured**,
So that I can **store user data, puzzle state, and handle OAuth authentication**.

## Acceptance Criteria

### AC-1.2.1: Supabase Project Setup
- [ ] Supabase project created (free tier)
- [ ] `@supabase/supabase-js` installed
- [ ] Supabase URL and anon key in environment variables
- [ ] Supabase client utility created (`/lib/supabase.ts`)
- [ ] Connection tested and verified

### AC-1.2.2: Database Schema Creation
- [ ] All 5 tables created:
  - `users` (id, email, username, oauth_provider, created_at, updated_at)
  - `puzzles` (id, puzzle_date, puzzle_data, difficulty, solution, created_at)
  - `completions` (id, user_id, puzzle_id, completion_time_seconds, completed_at, is_guest, completion_data, solve_path, started_at)
  - `leaderboards` (id, puzzle_id, user_id, rank, completion_time_seconds, submitted_at)
  - `streaks` (id, user_id, current_streak, longest_streak, last_completion_date, freeze_available, last_freeze_reset_date)

### AC-1.2.3: Row Level Security (RLS)
- [ ] RLS enabled on all tables
- [ ] RLS policies created:
  - Users can read/update own data only
  - Puzzles publicly readable
  - Leaderboards publicly readable
  - Completions restricted to owning user
  - Streaks restricted to owning user

### AC-1.2.4: Database Indexes
- [ ] Index on `puzzles.puzzle_date`
- [ ] Index on `leaderboards.puzzle_id, completion_time_seconds`
- [ ] Index on `completions.user_id`
- [ ] Index on `completions.puzzle_id`
- [ ] Index on `streaks.user_id`

### AC-1.2.5: Supabase Auth Configuration
- [ ] OAuth providers enabled (Google, GitHub, Apple) in Supabase dashboard
- [ ] Redirect URLs configured:
  - `http://localhost:3000/auth/callback` (development)
  - `https://[production-url]/auth/callback` (production)

### AC-1.2.6: Database Documentation
- [ ] Database migration file created (`/supabase/migrations/001_initial_schema.sql`)
- [ ] Migration file committed to version control

## Tasks / Subtasks

### Task 1: Create Supabase Project and Install Dependencies (AC: 1.2.1)
- [ ] Create Supabase project via https://supabase.com (free tier)
  - [ ] Select closest region for optimal performance
  - [ ] Note project reference ID for configuration
- [x] Install Supabase JavaScript client
  - [x] Run: `npm install @supabase/supabase-js`
  - [x] Verify installation in package.json
- [ ] Update environment variables in `.env.local`
  - [ ] Add `NEXT_PUBLIC_SUPABASE_URL` with project URL
  - [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` with anon/public key
  - [x] Verify `.env.local` is in `.gitignore`
- [ ] Update `.env.local` in Vercel deployment
  - [ ] Add same environment variables to Vercel dashboard
  - [ ] Deploy to verify environment variables are accessible

### Task 2: Create Supabase Client Utilities (AC: 1.2.1)
- [x] Create `/lib/supabase.ts` with Supabase client initialization
  - [x] Import `createClient` from `@supabase/supabase-js`
  - [x] Initialize client with URL and anon key from environment variables
  - [x] Export client for use throughout application
- [ ] Test connection
  - [ ] Create simple test query to verify connectivity
  - [ ] Run `npm run dev` and verify no connection errors
  - [ ] Log successful connection to console

### Task 3: Create Database Migration File (AC: 1.2.2, 1.2.3, 1.2.4)
- [x] Create directory structure: `/supabase/migrations/`
- [x] Create migration file: `001_initial_schema.sql`
- [x] Define `users` table:
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    oauth_provider TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```
- [x] Define `puzzles` table:
  ```sql
  CREATE TABLE puzzles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puzzle_date DATE NOT NULL UNIQUE,
    puzzle_data JSONB NOT NULL,
    difficulty TEXT NOT NULL,
    solution JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```
- [x] Define `completions` table:
  ```sql
  CREATE TABLE completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    puzzle_id UUID REFERENCES puzzles(id) ON DELETE CASCADE,
    completion_time_seconds INT,
    completed_at TIMESTAMPTZ,
    is_guest BOOLEAN DEFAULT false,
    completion_data JSONB,
    solve_path JSONB,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, puzzle_id)
  );
  ```
- [x] Define `leaderboards` table:
  ```sql
  CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puzzle_id UUID REFERENCES puzzles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rank INT NOT NULL,
    completion_time_seconds INT NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(puzzle_id, user_id)
  );
  ```
- [x] Define `streaks` table:
  ```sql
  CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    current_streak INT NOT NULL DEFAULT 1,
    longest_streak INT NOT NULL DEFAULT 1,
    last_completion_date DATE NOT NULL,
    freeze_available BOOLEAN DEFAULT true,
    last_freeze_reset_date DATE,
    UNIQUE(user_id)
  );
  ```
- [x] Create indexes:
  ```sql
  CREATE INDEX idx_puzzles_date ON puzzles(puzzle_date DESC);
  CREATE INDEX idx_completions_user ON completions(user_id);
  CREATE INDEX idx_completions_puzzle ON completions(puzzle_id);
  CREATE INDEX idx_leaderboards_puzzle_time ON leaderboards(puzzle_id, completion_time_seconds ASC);
  CREATE INDEX idx_streaks_user ON streaks(user_id);
  ```

### Task 4: Enable Row Level Security (AC: 1.2.3)
- [x] Add RLS enable statements to migration file:
  ```sql
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
  ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
  ```
- [x] Create RLS policies for `users` table:
  ```sql
  CREATE POLICY "Users can read own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

  CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (auth.uid() = id);
  ```
- [x] Create RLS policies for `puzzles` table:
  ```sql
  CREATE POLICY "Puzzles are publicly readable"
    ON puzzles FOR SELECT
    USING (true);
  ```
- [x] Create RLS policies for `completions` table:
  ```sql
  CREATE POLICY "Users can read own completions"
    ON completions FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own completions"
    ON completions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own completions"
    ON completions FOR UPDATE
    USING (auth.uid() = user_id);
  ```
- [x] Create RLS policies for `leaderboards` table:
  ```sql
  CREATE POLICY "Leaderboards are publicly readable"
    ON leaderboards FOR SELECT
    USING (true);
  ```
- [x] Create RLS policies for `streaks` table:
  ```sql
  CREATE POLICY "Users can read own streaks"
    ON streaks FOR SELECT
    USING (auth.uid() = user_id);
  ```

### Task 5: Execute Database Migration (AC: 1.2.2, 1.2.3, 1.2.4)
- [ ] Open Supabase SQL Editor in dashboard
- [ ] Copy complete migration SQL from `001_initial_schema.sql`
- [ ] Execute migration in SQL Editor
- [ ] Verify all 5 tables created successfully
- [ ] Verify all indexes created
- [ ] Verify RLS enabled on all tables (check "RLS enabled" badge)
- [ ] Test RLS policies with sample queries

### Task 6: Configure OAuth Providers (AC: 1.2.5)
- [ ] Navigate to Supabase Dashboard → Authentication → Providers
- [ ] Enable Google OAuth:
  - [ ] Create Google OAuth app in Google Cloud Console
  - [ ] Add authorized redirect URI: Supabase callback URL
  - [ ] Copy Client ID and Client Secret to Supabase
  - [ ] Enable provider in Supabase
- [ ] Enable GitHub OAuth:
  - [ ] Create GitHub OAuth App in GitHub Settings
  - [ ] Add callback URL from Supabase
  - [ ] Copy Client ID and Client Secret to Supabase
  - [ ] Enable provider in Supabase
- [ ] Enable Apple OAuth (optional for MVP - can defer):
  - [ ] Create Apple App ID in Apple Developer
  - [ ] Configure Sign in with Apple
  - [ ] Add credentials to Supabase
  - [ ] Enable provider in Supabase
- [ ] Configure redirect URLs in Supabase settings:
  - [ ] Add `http://localhost:3000/auth/callback` for development
  - [ ] Add production URL `https://[vercel-url]/auth/callback` when deployed

### Task 7: Create TypeScript Types (AC: 1.2.1, 1.2.6)
- [x] Generate Supabase types:
  - [x] Install Supabase CLI: `npm install -D supabase`
  - [ ] Generate types: `npx supabase gen types typescript --project-id [project-id] > lib/types/database.ts` (requires Supabase project - will regenerate after setup)
- [x] Create `/lib/types/database.ts` with generated types
- [x] Export `Database` type for use in Supabase client
- [x] Update Supabase client to use typed client:
  ```typescript
  import type { Database } from '@/lib/types/database'
  export const supabase = createClient<Database>(url, key)
  ```

### Task 8: Verification & Testing (AC: All)
- [ ] Test database queries from application:
  - [ ] Query `puzzles` table (should return empty array - no puzzles yet)
  - [ ] Verify RLS policies work (cannot query other users' data)
  - [ ] Test insert/update operations
- [ ] Verify OAuth configuration:
  - [ ] Test OAuth flow with Google (should redirect to Google login)
  - [ ] Test OAuth callback URL is correct
  - [ ] Verify no errors in browser console
- [ ] Document setup in README:
  - [ ] Add section "Database Setup" with Supabase instructions
  - [ ] Document how to run migrations
  - [ ] Document environment variable requirements
- [ ] Commit migration file to version control:
  - [ ] `git add supabase/migrations/001_initial_schema.sql`
  - [ ] `git commit -m "Add initial database schema with RLS policies"`

## Dev Notes

### Architecture Alignment

This story implements the database foundation defined in `docs/architecture.md` and `docs/tech-spec-epic-1.md`:

**Database Layer (Architecture Section 2.2):**
- ✅ Supabase PostgreSQL for relational data model
- ✅ Row Level Security for data protection
- ✅ Database indexes for query performance
- ✅ All 5 core tables (users, puzzles, completions, leaderboards, streaks)

**Authentication Layer (Architecture Section 2.3):**
- ✅ Supabase Auth with OAuth providers (Google, GitHub, Apple)
- ✅ Session management via Supabase Auth SDK
- ✅ Foundation for guest-first auth journey (Epic 3)

**Security Architecture:**
- ✅ RLS policies enforce data isolation per user
- ✅ Puzzles and leaderboards publicly readable (no sensitive data)
- ✅ User data, completions, and streaks restricted to owner
- ✅ Foreign key constraints ensure referential integrity

### Project Structure Notes

**New Files Created:**
```
/lib/
  /supabase.ts           # Supabase client initialization
  /types/
    /database.ts         # Auto-generated Supabase types

/supabase/
  /migrations/
    /001_initial_schema.sql  # Database schema migration
```

**Environment Variables Required:**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

**Note:** These variables are prefixed with `NEXT_PUBLIC_` because they're used in client-side code. The anon key is safe to expose as it's protected by Row Level Security policies.

### Database Schema Design Rationale

**Why separate `completions` and `leaderboards` tables?**
- `completions` stores full solve history (in-progress + completed)
- `leaderboards` is optimized query view for rankings (completed only)
- Separation enables faster leaderboard queries with composite index
- Future: leaderboards could be a materialized view for performance

**Why JSONB for `puzzle_data` and `solution`?**
- Flexible storage for 9x9 grid (array of arrays)
- PostgreSQL JSONB supports efficient indexing and querying
- Future: could add puzzle metadata (difficulty algorithm, generation timestamp)

**Why `started_at` in `completions` table?**
- Enables server-side time validation (anti-cheat)
- `completion_time_seconds = completed_at - started_at` (source of truth)
- Client timer is display-only; server calculates actual time

**Why `freeze_available` in `streaks` table?**
- Implements healthy engagement pattern (1 missed day per week OK)
- Prevents toxic compulsion while maintaining streak motivation
- Aligns with PRD requirement for player-respectful retention

### Learnings from Previous Story

**From Story 1-1 (Project Initialization):**
- Environment variables already set up with Supabase placeholders in `.env.local`
- README already documents environment variable structure
- TypeScript strict mode enabled - types from Supabase will be type-safe
- Git repository initialized - migration files can be version controlled
- Vercel deployment configured - environment variables need to be added to Vercel dashboard

**Reuse from Story 1-1:**
- Use existing `.env.local` structure (just update placeholder values)
- Follow existing README documentation pattern (add Database Setup section)
- Use TypeScript strict mode for generated types
- Follow commit conventions from Story 1-1 (descriptive messages)

### Critical Implementation Notes

**CRITICAL: Use `auth.uid()` in RLS policies**
- RLS policies use Supabase's built-in `auth.uid()` function
- Returns current authenticated user's ID
- Ensures users can only access their own data
- Prevents unauthorized data access even with compromised anon key

**CRITICAL: Store solution server-side only**
- `puzzles.solution` field NEVER exposed to client
- Only used for server-side validation
- Client receives `puzzle_data` (clues) but NOT solution
- This is essential for competitive integrity (no cheating)

**CRITICAL: Database migration must be idempotent**
- Use `IF NOT EXISTS` for tables and indexes
- Migration can be re-run without errors
- Essential for development/testing workflow
- Production migrations should be one-time only

**CRITICAL: Test RLS policies thoroughly**
- Create test users and verify data isolation
- Attempt to query other users' data (should fail)
- Verify public tables are accessible without auth
- Use Supabase SQL Editor to test policies before deployment

### Testing Strategy

**Unit Tests (Deferred to Story 1.4):**
- Supabase client initialization test
- Type safety tests for generated types

**Integration Tests:**
- Connect to Supabase from application (verify no errors)
- Query empty tables (should return [])
- Test RLS policies (cannot access other users' data)

**Manual Verification:**
- All 5 tables visible in Supabase Table Editor
- RLS enabled (green badge) on all tables
- Indexes visible in Database → Indexes
- OAuth providers enabled in Authentication → Providers
- Redirect URLs configured correctly

### References

- [Source: docs/tech-spec-epic-1.md#Database-Schema]
- [Source: docs/tech-spec-epic-1.md#AC-1.2]
- [Source: docs/architecture.md#Database-Schema]
- [Source: docs/architecture.md#Data-Architecture]
- [Source: docs/PRD.md#Technical-Requirements]
- [Source: docs/epics.md#Story-1.2]

### Prerequisites

**Required before starting:**
- ✅ Story 1.1 completed (project structure, environment variables)
- ✅ Supabase account created (free tier)
- ✅ Access to Supabase dashboard
- ✅ Git installed and repository initialized

**Dependencies for future stories:**
- Story 2.1 (Daily Puzzle System) requires `puzzles` table
- Story 2.4 (Auto-Save) requires `completions` table
- Story 3.2 (OAuth Auth) requires OAuth providers configured
- Story 4.1 (Leaderboards) requires `leaderboards` table
- Story 6.1 (Streaks) requires `streaks` table

### Success Criteria

This story is complete when:
- ✅ All 5 database tables created with correct schema
- ✅ All RLS policies enabled and tested
- ✅ All indexes created
- ✅ OAuth providers configured (at least Google and GitHub)
- ✅ Supabase client working in application (connection verified)
- ✅ Migration file committed to version control
- ✅ Environment variables set in both `.env.local` and Vercel
- ✅ TypeScript types generated and integrated

## Dev Agent Record

### Context Reference

- docs/stories/1-2-supabase-integration-database-setup.context.xml

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

<!-- Links to debug logs, screenshots, or relevant artifacts -->

### Completion Notes List

**Implementation Summary:**
- ✅ Installed @supabase/supabase-js package (v2.81.1)
- ✅ Created Supabase client utility at `lib/supabase.ts` with typed Database interface
- ✅ Created complete database migration file at `supabase/migrations/001_initial_schema.sql`
- ✅ All 5 tables defined with proper schemas, foreign keys, and constraints
- ✅ All RLS policies implemented for data isolation (auth.uid() pattern)
- ✅ All performance indexes created for frequently queried columns
- ✅ Installed Supabase CLI as dev dependency
- ✅ Created TypeScript types at `lib/types/database.ts` matching database schema
- ✅ TypeScript compilation successful - no type errors

**Manual Steps Required (User Action Needed):**
1. **Create Supabase Project:**
   - Visit https://supabase.com and create free tier project
   - Select closest region for optimal performance
   - Note project reference ID and get project URL + anon key

2. **Update Environment Variables:**
   - Update `.env.local` with actual `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Add same variables to Vercel dashboard for production deployment

3. **Execute Migration (Task 5):**
   - Open Supabase SQL Editor in dashboard
   - Copy complete SQL from `supabase/migrations/001_initial_schema.sql`
   - Execute migration
   - Verify all 5 tables, indexes, and RLS policies created

4. **Configure OAuth Providers (Task 6):**
   - Enable Google OAuth (create app in Google Cloud Console)
   - Enable GitHub OAuth (create app in GitHub Settings)
   - Configure redirect URLs in Supabase settings
   - Optional: Enable Apple OAuth (can defer for MVP)

5. **Regenerate Types (after project setup):**
   - Run: `npx supabase gen types typescript --project-id [your-project-id] > lib/types/database.ts`
   - This will regenerate types from actual database schema

6. **Testing & Verification (Task 8):**
   - Test database connection from application
   - Verify RLS policies work correctly
   - Test OAuth flow with Google/GitHub
   - Document setup in README
   - Commit changes to version control

**Architectural Patterns Established:**
- Typed Supabase client pattern using Database interface
- Environment variables with NEXT_PUBLIC_ prefix for client-side usage
- RLS policies using auth.uid() for user data isolation
- Migration file structure for version-controlled schema changes
- JSONB for flexible puzzle data storage

**Technical Decisions:**
- Separated completions and leaderboards tables for query optimization
- Used UUID primary keys with uuid_generate_v4()
- Foreign key CASCADE deletes for referential integrity
- Composite index on leaderboards for fast ranking queries
- IF NOT EXISTS clauses for idempotent migrations

**Recommendations for Next Story:**
- Migration file is ready to execute - user just needs to run it in Supabase dashboard
- After Supabase setup, test connection before starting next story
- Consider adding database helper functions/hooks in future stories
- Story 2.1 (Daily Puzzle System) will need to insert test data into puzzles table

### File List

**NEW Files Created:**
- `lib/supabase.ts` - Supabase client initialization with typed Database interface
- `lib/types/database.ts` - TypeScript type definitions for database schema
- `supabase/migrations/001_initial_schema.sql` - Complete database schema with tables, indexes, and RLS policies

**MODIFIED Files:**
- `package.json` - Added @supabase/supabase-js dependency, added supabase CLI to devDependencies
- `package-lock.json` - Updated with new dependencies

**UNCHANGED (Referenced but not modified):**
- `.env.local` - Already exists with placeholder values (user needs to update with actual keys)
- `.gitignore` - Already configured to ignore .env.local
