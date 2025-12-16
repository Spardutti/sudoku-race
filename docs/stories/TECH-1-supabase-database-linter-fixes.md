# Story TECH-1: Supabase Database Linter Fixes

**Type:** Technical Improvement
**Epic:** Infrastructure & Quality
**Priority:** Medium
**Estimated Effort:** 2-4 hours

---

## Story

As a **developer maintaining database security and performance**, I want **to resolve all Supabase database linter warnings**, so that **the application has optimal RLS policy performance and proper function security configurations**.

---

## Context

Supabase's database linter identified **16 warnings** across two categories:

1. **Function Search Path Mutable (5 functions)** - Security risk
2. **Auth RLS Initialization Plan (10 RLS policies)** - Performance issue at scale

These warnings represent real technical debt that should be addressed before scaling to larger user bases.

---

## Problem Statement

### Security Issues (5 functions)
Functions without explicit `search_path` settings are vulnerable to search path manipulation attacks. Affected functions:
- `public.get_user_stats_by_difficulty`
- `public.get_user_combined_stats`
- `public.append_timer_event`
- `public.get_user_profile_stats`
- `public.update_user_streak`

### Performance Issues (10 RLS policies)
RLS policies calling `auth.<function>()` without `SELECT` wrapper cause unnecessary re-evaluation for each row, degrading query performance at scale. Affected tables/policies:
- `users`: "Users can update own data", "Users can insert own data"
- `completions`: "Users can read own completions", "Users can insert own completions", "Users can update own completions"
- `streaks`: "Users can read own streaks", "Users can insert own streaks", "Users can update own streaks"
- `leaderboards`: "Users can insert own leaderboard entries", "Users can update own leaderboard entries"

### Additional Security Issue
Auth leaked password protection is currently disabled, allowing users to set compromised passwords.

---

## Acceptance Criteria

### 1. Function Search Path Security
- [ ] All 5 functions updated with explicit `search_path` setting
- [ ] Use `SET search_path = ''` to lock down search path
- [ ] Migration script created and tested
- [ ] Verify functions still work correctly after change

### 2. RLS Policy Performance Optimization
- [ ] All 10 RLS policies updated to wrap `auth.<function>()` calls with `(select ...)`
- [ ] Pattern: `auth.uid() = user_id` → `(select auth.uid()) = user_id`
- [ ] Migration script created with before/after performance comparison
- [ ] Verify RLS policies still enforce correct access control

### 3. Leaked Password Protection
- [ ] Enable HaveIBeenPwned.org integration in Supabase Auth settings
- [ ] Document configuration change
- [ ] Test password creation with known compromised password (should be rejected)

### 4. Verification & Validation
- [ ] Run Supabase database linter again - all warnings resolved
- [ ] No new warnings introduced
- [ ] All existing tests pass
- [ ] Manual smoke test: auth flow, puzzle completion, leaderboard updates

---

## Technical Details

### Function Fix Example
```sql
-- Before
CREATE OR REPLACE FUNCTION get_user_stats_by_difficulty(...)
RETURNS ...
AS $$
  -- function body
$$ LANGUAGE plpgsql;

-- After
CREATE OR REPLACE FUNCTION get_user_stats_by_difficulty(...)
RETURNS ...
SET search_path = ''
AS $$
  -- function body
$$ LANGUAGE plpgsql;
```

### RLS Policy Fix Example
```sql
-- Before (re-evaluates auth.uid() for each row)
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- After (evaluates auth.uid() once per query)
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING ((select auth.uid()) = id);
```

---

## Resources

- [Supabase: Function Search Path Mutable](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Supabase: Auth RLS InitPlan](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan)
- [Supabase: RLS Call Functions with SELECT](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)
- [Supabase: Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

---

## Testing Strategy

### Unit Tests
- Verify functions return correct results after `search_path` change
- Test RLS policies with different auth contexts

### Performance Tests
- Compare query execution plans before/after RLS optimization
- Measure query time with 1,000 and 10,000 row datasets

### Security Tests
- Attempt to create account with compromised password (from HaveIBeenPwned list)
- Verify search path manipulation doesn't affect function behavior

---

## Definition of Done

- [ ] All 16 database linter warnings resolved
- [ ] Migration script created in `supabase/migrations/`
- [ ] Migration applied to development environment
- [ ] All tests pass (unit, integration, E2E)
- [ ] Performance benchmark shows improvement (or no regression)
- [ ] Documentation updated if needed
- [ ] Code reviewed and approved
- [ ] Migration applied to production

---

## Notes

**Priority Rationale:** Medium priority because:
- Security issues are WARN level, not CRITICAL
- Performance issues only manifest at scale (current DAU likely unaffected)
- No user-facing bugs reported related to these issues
- Should be addressed before significant user growth

**Estimated Effort:** 2-4 hours
- 1 hour: Create migration script with all fixes
- 1 hour: Testing and verification
- 1 hour: Code review, documentation, deployment
- 1 hour: Buffer for unexpected issues

---

**Created:** 2025-12-12
**Status:** Backlog
**Labels:** technical-debt, security, performance, database
