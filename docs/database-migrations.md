# Database Migrations Guide

**Last Updated:** 2025-11-16
**Story:** 1-9-database-migration-tool-setup
**Tooling:** Supabase CLI v2.58.5

---

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Creating Migrations](#creating-migrations)
4. [Testing Migrations](#testing-migrations)
5. [Deploying to Production](#deploying-to-production)
6. [Rollback Procedures](#rollback-procedures)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Examples](#examples)

---

## Overview

This project uses **Supabase CLI** for database migration management, providing version-controlled schema changes with rollback capabilities and reproducible database setup across environments.

### Migration Workflow Summary

```
Create → Test Locally → Review → Deploy to Production
```

1. **Create** migration file with `npm run migration:new <name>`
2. **Test** locally with `npm run db:reset` (applies all migrations)
3. **Review** schema changes with `npm run db:diff`
4. **Deploy** to production with `npm run db:push`

### Why Use Migrations?

- ✅ **Version Control:** All schema changes tracked in git history
- ✅ **Reproducibility:** Consistent database setup across dev/staging/production
- ✅ **Rollback Safety:** Revert problematic changes without data loss
- ✅ **Team Collaboration:** Clear audit trail of who changed what and when
- ✅ **CI/CD Ready:** Automated deployment pipeline integration

### Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Database Migrations Guide](https://supabase.com/docs/guides/cli/managing-environments)

---

## Setup

### Prerequisites

- Node.js 18+ installed
- Supabase account with project created
- Project cloned locally

### Installation

Supabase CLI is already installed as a dev dependency:

```json
{
  "devDependencies": {
    "supabase": "^2.58.5"
  }
}
```

### Project Initialization

The Supabase project is already initialized. Directory structure:

```
supabase/
├── config.toml           # Supabase configuration
├── migrations/           # SQL migration files
│   ├── 001_initial_schema.sql
│   ├── 002_add_missing_rls_policies.sql
│   └── 003_add_duplicate_check_index.sql
└── .templates/
    └── migration-template.sql  # Template for new migrations
```

### Linking to Remote Project

To link your local environment to the remote Supabase project:

```bash
# Get your project reference from Supabase Dashboard
# Settings → General → Reference ID

npx supabase link --project-ref <your-project-ref>
```

**Security Note:** Link configuration is stored locally and NOT committed to git. Each developer must link individually.

### Environment Configuration

Required environment variables (`.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

See `.env.example` for complete configuration template.

---

## Creating Migrations

### Migration Naming Convention

**Format:** `YYYYMMDDHHMMSS_<description>.sql`

- Timestamp ensures chronological ordering
- Description uses snake_case
- Generated automatically by Supabase CLI

**Examples:**
- `20250116120000_add_pause_detection.sql`
- `20250117093000_create_notifications_table.sql`
- `20250118144500_add_user_preferences_column.sql`

### Creating a New Migration

```bash
# Using npm script (recommended)
npm run migration:new add_pause_detection

# Direct CLI command
npx supabase migration new add_pause_detection
```

This creates a new file in `supabase/migrations/` with a timestamp prefix.

### Migration File Template

Use the template from `supabase/.templates/migration-template.sql`:

```sql
-- Migration: Add pause detection columns
-- Created: 2025-11-16
-- Author: Your Name
-- Description: Add started_at and paused columns to track puzzle timing

-- Forward migration
CREATE TABLE IF NOT EXISTS puzzle_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  puzzle_id UUID REFERENCES puzzles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paused BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_puzzle_sessions_user
  ON puzzle_sessions(user_id);

-- Rollback (run manually if needed)
-- DROP INDEX IF EXISTS idx_puzzle_sessions_user;
-- DROP TABLE IF EXISTS puzzle_sessions;
```

### Idempotent Operations

**Always use idempotent SQL** to safely re-run migrations:

```sql
-- ✅ GOOD - Idempotent
CREATE TABLE IF NOT EXISTS users (...);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;

-- ❌ BAD - Not idempotent (will fail if re-run)
CREATE TABLE users (...);
CREATE INDEX idx_users_email ON users(email);
ALTER TABLE users ADD COLUMN name TEXT;
```

### Rollback Steps

**Every migration must include rollback instructions** in comments:

```sql
-- Forward migration
CREATE TABLE example (id UUID PRIMARY KEY);

-- Rollback (run manually if needed)
-- DROP TABLE IF EXISTS example;
```

**Why comments?**
- Keeps rollback logic with forward migration (single source of truth)
- Manual rollback acceptable for MVP (reduces complexity)
- Emergency rollback via Supabase SQL Editor (no code deployment needed)

---

## Testing Migrations

### Local Testing Workflow

**Critical:** Test ALL migrations locally before production deployment.

#### 1. Start Local Supabase

```bash
npm run db:start
```

This starts:
- PostgreSQL (port 54322)
- API Server (port 54321)
- Studio Dashboard (http://localhost:54323)
- Auth, Realtime, Storage services

#### 2. Apply Migrations

```bash
npm run db:reset
```

This command:
1. Drops the local database
2. Recreates the schema
3. Applies ALL migrations in order
4. Seeds test data (if `supabase/seed.sql` exists)

#### 3. Verify Schema

**Manual verification in Studio:**
1. Open http://localhost:54323
2. Navigate to Table Editor
3. Verify all tables created correctly
4. Check indexes in SQL Editor: `\d+ <table_name>`
5. Verify RLS policies active

**Schema diff check:**
```bash
npm run db:diff
```

Shows differences between local and remote schemas. **Should show no unexpected differences** after applying migrations.

#### 4. Test Application

```bash
npm run dev
```

- Verify database connection works
- Test CRUD operations
- Check RLS policies enforce correctly
- Run integration tests

#### 5. Review Migration Logs

Check terminal output for errors:
```
Applying migration 20250116120000_add_pause_detection.sql...
✅ Migration applied successfully
```

### Testing Checklist

Before committing a migration:

- [ ] Migration file created with descriptive name
- [ ] Tested locally with `npm run db:reset`
- [ ] Verified schema correctness in Studio
- [ ] Ran application tests against local DB
- [ ] Checked for migration errors in logs
- [ ] Reviewed schema diff with `npm run db:diff`
- [ ] Rollback tested (execute rollback SQL manually)
- [ ] Migration file committed to git

---

## Deploying to Production

### Pre-Deployment Checklist

**Before deploying ANY migration to production:**

- [ ] Migration tested locally (see [Testing Checklist](#testing-checklist))
- [ ] All tests passing (`npm test`)
- [ ] Schema diff reviewed (`npm run db:diff`)
- [ ] Backup verified (Supabase auto-backups daily on Free tier)
- [ ] Team notified of deployment window
- [ ] Deployment scheduled during low-traffic window (2-4am UTC recommended)
- [ ] Rollback script prepared (SQL from migration comments)

### Deployment Command

```bash
npm run db:push
```

**What this does:**
1. Connects to remote Supabase project (via link configuration)
2. Applies unapplied migrations in chronological order
3. Updates migration history in Supabase

**Example output:**
```
Applying migration 20250116120000_add_pause_detection.sql...
✅ Migration applied successfully to production
```

### Post-Deployment Verification

**Immediately after deployment:**

1. **Check Supabase Dashboard**
   - Navigate to Table Editor
   - Verify schema changes applied
   - Confirm no error notifications

2. **Verify RLS Policies**
   - Settings → Database → Policies
   - Ensure all policies active

3. **Run Smoke Tests**
   - Login flow
   - Fetch daily puzzle
   - Submit completion
   - Check leaderboard

4. **Monitor Error Logs**
   - Monitor for 30 minutes post-deployment
   - Check Sentry for database errors
   - Review Supabase logs

5. **Check Application Health**
   - Verify Next.js app responding
   - Test critical user flows
   - Monitor response times

### Low-Traffic Deployment Windows

**Recommended deployment times (UTC):**
- **Best:** 2:00 AM - 4:00 AM UTC (lowest user activity)
- **Acceptable:** 6:00 AM - 8:00 AM UTC
- **Avoid:** 12:00 PM - 10:00 PM UTC (peak usage)

**For critical migrations:**
- Schedule maintenance window
- Display banner notification
- Coordinate with team members

---

## Rollback Procedures

### When to Rollback vs. Forward-Fix

**Rollback if:**
- ❌ Migration causes immediate production errors
- ❌ Data integrity compromised
- ❌ Critical functionality broken
- ❌ Performance severely degraded

**Forward-fix if:**
- ✅ Minor issue with low user impact
- ✅ Fix is simple and quick (< 15 minutes)
- ✅ Rollback would cause data loss
- ✅ Issue can be mitigated with feature flag

### Emergency Rollback Procedure

**1. Access Supabase SQL Editor**
   - Login to Supabase Dashboard
   - Navigate to SQL Editor

**2. Execute Rollback SQL**
   - Open the migration file locally
   - Copy rollback SQL from comments
   - Paste into SQL Editor
   - Review carefully before executing
   - Click "Run"

**Example rollback:**
```sql
-- From migration file comments:
DROP INDEX IF EXISTS idx_puzzle_sessions_user;
DROP TABLE IF EXISTS puzzle_sessions;
```

**3. Verify Schema Restored**
   - Check Table Editor
   - Verify problematic table/column removed
   - Test application functionality

**4. Monitor Application**
   - Check error logs for 15 minutes
   - Verify critical flows working
   - Monitor user reports

**5. Post-Rollback Actions**
   - Update migration file if needed
   - Re-test locally with fixes
   - Schedule re-deployment
   - Document incident in retrospective

### Testing Rollback Locally

**Before deploying ANY migration**, test the rollback:

```bash
# 1. Apply migration
npm run db:reset

# 2. Open local SQL Editor (http://localhost:54323)
# 3. Execute rollback SQL from migration comments
# 4. Verify schema reverted

# 5. Re-apply migration
npm run db:reset

# 6. Verify migration works after rollback
```

### Emergency Contacts

**In case of production emergency:**
- Supabase Dashboard: https://supabase.com/dashboard
- SQL Editor: Dashboard → SQL Editor
- Logs: Dashboard → Logs Explorer
- Rollback scripts: `supabase/migrations/*.sql` (comments)

---

## Best Practices

### One Logical Change Per Migration

**✅ GOOD:**
```sql
-- Migration: Add user preferences table
CREATE TABLE user_preferences (...);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

**❌ BAD:**
```sql
-- Migration: Multiple unrelated changes
CREATE TABLE user_preferences (...);
ALTER TABLE puzzles ADD COLUMN difficulty_score INT;
DROP TABLE legacy_data;
```

**Why?** Easier to understand, review, and rollback individual changes.

### Idempotent Operations

Use `IF NOT EXISTS`, `IF EXISTS`, `CREATE OR REPLACE`:

```sql
CREATE TABLE IF NOT EXISTS users (...);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
DROP TABLE IF EXISTS legacy_table;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
```

### Reversible Migrations

**Every migration should include rollback steps:**

```sql
-- Forward
ALTER TABLE users ADD COLUMN phone TEXT;

-- Rollback
-- ALTER TABLE users DROP COLUMN IF EXISTS phone;
```

**For irreversible migrations** (e.g., dropping columns with data):
- Document data backup procedure
- Provide data migration script
- Warn in migration comments

### Testing Before Production

**Never skip local testing:**

```bash
# ALWAYS run this before deploying
npm run db:reset
npm test
npm run db:diff
```

### Descriptive Migration Names

**✅ GOOD:**
- `add_pause_detection_columns`
- `create_notifications_table`
- `add_user_email_index`

**❌ BAD:**
- `migration_1`
- `fix_stuff`
- `update_db`

### Version Control

**ALWAYS:**
- ✅ Commit migration files to git
- ✅ Review migrations in pull requests
- ✅ Never make manual schema changes outside migrations

**NEVER:**
- ❌ Edit existing migration files (create new migrations instead)
- ❌ Commit `.supabase/` directory (link configuration)
- ❌ Hardcode project references in migrations

### Documentation

**Include in every migration:**
```sql
-- Migration: <What changed>
-- Created: <Date>
-- Author: <Your name>
-- Description: <Why this change is needed>
-- Related: Story 1-9, Epic 2, Issue #123
```

---

## Troubleshooting

### Common Migration Errors

#### Error: "relation already exists"

**Cause:** Migration not idempotent (missing `IF NOT EXISTS`)

**Fix:**
```sql
-- ❌ This will fail on re-run
CREATE TABLE users (...);

-- ✅ This is safe to re-run
CREATE TABLE IF NOT EXISTS users (...);
```

#### Error: "column already exists"

**Cause:** Trying to add column that exists

**Fix:**
```sql
-- ❌ Not idempotent
ALTER TABLE users ADD COLUMN email TEXT;

-- ✅ Idempotent (PostgreSQL 9.6+)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
```

#### Error: "cannot connect to database"

**Cause:** Local Supabase not running or link not configured

**Fix:**
```bash
# Start local Supabase
npm run db:start

# Or re-link to remote
npx supabase link --project-ref <your-ref>
```

#### Error: "migration already applied"

**Cause:** Supabase tracks applied migrations; trying to re-apply

**Fix:**
- Check migration history: `npx supabase migration list`
- If intentional rollback needed, use SQL Editor manually
- If accidental, create new migration with fixes

### Connection Issues

#### Docker not running

**Error:** `Cannot connect to Docker daemon`

**Fix:**
```bash
# Check Docker status
docker ps

# Start Docker Desktop (macOS/Windows)
# Or start Docker daemon (Linux)
sudo systemctl start docker
```

#### Port conflicts

**Error:** `Port 54322 already in use`

**Fix:**
1. Stop conflicting service
2. Or edit `supabase/config.toml` to use different ports:
   ```toml
   [db]
   port = 54422  # Changed from 54322
   ```

### Schema Conflicts

#### Remote schema differs from migrations

**Symptom:** `npm run db:diff` shows unexpected differences

**Cause:** Manual changes made in Supabase Dashboard

**Fix:**
1. **Preferred:** Create migration to match dashboard changes
   ```bash
   npx supabase db diff --schema public > supabase/migrations/fix_schema_drift.sql
   ```
2. **Alternative:** Revert dashboard changes, apply migrations only

#### Migration fails on production but works locally

**Possible causes:**
- Production database has data that violates new constraints
- Production PostgreSQL version differs
- RLS policies blocking migration

**Debug:**
1. Check Supabase logs in Dashboard
2. Test migration on production backup/clone
3. Add data migration logic before constraint:
   ```sql
   -- Migrate existing data first
   UPDATE users SET email = 'default@example.com' WHERE email IS NULL;

   -- Then add constraint
   ALTER TABLE users ALTER COLUMN email SET NOT NULL;
   ```

### Rollback Failures

#### Cannot drop table with dependent objects

**Error:** `cannot drop table users because other objects depend on it`

**Fix:**
```sql
-- Use CASCADE to drop dependencies
DROP TABLE IF EXISTS users CASCADE;

-- Or drop dependencies first
DROP VIEW IF EXISTS user_stats;
DROP TABLE IF EXISTS users;
```

#### Data loss concerns

**Problem:** Rollback would delete user data

**Solution:**
1. **Don't rollback** - create forward-fix migration instead
2. Export data before rollback:
   ```sql
   COPY users TO '/tmp/users_backup.csv' CSV HEADER;
   ```
3. Restore data after rollback if needed

---

## Examples

### Example 1: Adding a Table

```sql
-- Migration: Create notifications table
-- Created: 2025-11-16
-- Author: Development Team
-- Description: Add notifications table for user alerts
-- Related: Epic 6 - Engagement & Retention

-- Forward migration
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for user notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Rollback (run manually if needed)
-- DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
-- DROP INDEX IF EXISTS idx_notifications_user_created;
-- DROP TABLE IF EXISTS notifications;
```

### Example 2: Adding a Column

```sql
-- Migration: Add user timezone preference
-- Created: 2025-11-16
-- Author: Development Team
-- Description: Store user timezone for localized notifications
-- Related: Story 6-5 - Notification Timing

-- Forward migration
ALTER TABLE users
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add check constraint for valid timezones
ALTER TABLE users
ADD CONSTRAINT IF NOT EXISTS valid_timezone
CHECK (timezone ~ '^[A-Za-z_]+/[A-Za-z_]+$' OR timezone = 'UTC');

-- Rollback (run manually if needed)
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_timezone;
-- ALTER TABLE users DROP COLUMN IF EXISTS timezone;
```

### Example 3: Creating an Index

```sql
-- Migration: Add composite index for leaderboard queries
-- Created: 2025-11-16
-- Author: Development Team
-- Description: Optimize leaderboard pagination queries
-- Related: Epic 4 - Competitive Leaderboards

-- Forward migration
-- Composite index for ranking queries (puzzle_id + completion_time)
CREATE INDEX IF NOT EXISTS idx_leaderboards_puzzle_time_rank
  ON leaderboards(puzzle_id, completion_time_seconds ASC, rank ASC);

-- Rollback (run manually if needed)
-- DROP INDEX IF EXISTS idx_leaderboards_puzzle_time_rank;
```

### Example 4: Adding RLS Policy

```sql
-- Migration: Add guest user policy for completions
-- Created: 2025-11-16
-- Author: Development Team
-- Description: Allow guest users to insert completions
-- Related: Epic 3 - User Identity & Authentication

-- Forward migration
-- Allow guest users (not authenticated) to insert completions
CREATE POLICY "Guest users can insert completions"
  ON completions FOR INSERT
  WITH CHECK (is_guest = true AND auth.uid() IS NULL);

-- Rollback (run manually if needed)
-- DROP POLICY IF EXISTS "Guest users can insert completions" ON completions;
```

### Example 5: Modifying Existing Schema

```sql
-- Migration: Add pause tracking to completions
-- Created: 2025-11-16
-- Author: Development Team
-- Description: Track puzzle pause events for fair timing
-- Related: Story 2-5 - Timer Implementation

-- Forward migration
-- Add pause tracking columns
ALTER TABLE completions
ADD COLUMN IF NOT EXISTS paused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_pause_duration_seconds INT DEFAULT 0;

-- Add index for paused completions
CREATE INDEX IF NOT EXISTS idx_completions_paused
  ON completions(puzzle_id, paused)
  WHERE paused = true;

-- Backfill existing completions (assume not paused)
UPDATE completions
SET paused = FALSE, total_pause_duration_seconds = 0
WHERE paused IS NULL;

-- Rollback (run manually if needed)
-- DROP INDEX IF EXISTS idx_completions_paused;
-- ALTER TABLE completions DROP COLUMN IF EXISTS total_pause_duration_seconds;
-- ALTER TABLE completions DROP COLUMN IF EXISTS paused;
```

### Example 6: Data Migration

```sql
-- Migration: Migrate legacy puzzle format to JSONB
-- Created: 2025-11-16
-- Author: Development Team
-- Description: Convert old puzzle_data text format to structured JSONB
-- Related: Epic 2 - Core Puzzle Experience

-- Forward migration
-- 1. Add new JSONB column
ALTER TABLE puzzles
ADD COLUMN IF NOT EXISTS puzzle_data_v2 JSONB;

-- 2. Migrate existing data
UPDATE puzzles
SET puzzle_data_v2 = puzzle_data::JSONB
WHERE puzzle_data_v2 IS NULL AND puzzle_data IS NOT NULL;

-- 3. Verify migration (check row count matches)
-- SELECT COUNT(*) FROM puzzles WHERE puzzle_data IS NOT NULL;
-- SELECT COUNT(*) FROM puzzles WHERE puzzle_data_v2 IS NOT NULL;

-- 4. After verification, drop old column (separate migration recommended)
-- ALTER TABLE puzzles DROP COLUMN IF EXISTS puzzle_data;
-- ALTER TABLE puzzles RENAME COLUMN puzzle_data_v2 TO puzzle_data;

-- Rollback (run manually if needed)
-- ALTER TABLE puzzles DROP COLUMN IF EXISTS puzzle_data_v2;
```

---

## Quick Reference

### NPM Scripts

```bash
npm run db:start          # Start local Supabase
npm run db:stop           # Stop local Supabase
npm run db:reset          # Reset database and apply migrations
npm run db:diff           # Show schema differences
npm run db:push           # Deploy migrations to production
npm run migration:new     # Create new migration file
```

### Common Commands

```bash
# Create migration
npm run migration:new add_feature_name

# Test locally
npm run db:start
npm run db:reset
npm test

# Deploy
npm run db:push
```

### File Locations

- **Migrations:** `supabase/migrations/*.sql`
- **Config:** `supabase/config.toml`
- **Template:** `supabase/.templates/migration-template.sql`
- **Docs:** `docs/database-migrations.md` (this file)

---

## Additional Resources

### Official Documentation

- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

### Internal Documentation

- [Architecture Document](./architecture.md) - Database Migrations section
- [Tech Spec Epic 1](./tech-spec-epic-1.md) - Database schema design
- [Database Schema Reference](./database-schema.md) - Complete schema documentation

### Community Resources

- [Supabase Discord](https://discord.supabase.com/)
- [PostgreSQL Slack](https://pgtreats.info/slack-invite)
- [SQL Style Guide](https://www.sqlstyle.guide/)

---

**Last Updated:** 2025-11-16
**Maintained by:** Development Team
**Questions?** Open an issue or ask in team chat
