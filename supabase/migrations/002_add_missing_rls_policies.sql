-- Add Missing RLS Policies (Patch)
-- Generated: 2025-11-14
-- Story: 1-2-supabase-integration-database-setup (Review Follow-up)
-- Addresses: Senior Developer Review findings - missing INSERT/UPDATE policies

-- ============================================================================
-- LEADERBOARDS TABLE - ADD INSERT/UPDATE POLICIES
-- ============================================================================

CREATE POLICY "Users can insert own leaderboard entries"
  ON leaderboards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entries"
  ON leaderboards FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STREAKS TABLE - ADD INSERT/UPDATE POLICIES
-- ============================================================================

CREATE POLICY "Users can insert own streaks"
  ON streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- USERS TABLE - DOCUMENTATION CLARIFICATION
-- ============================================================================
-- NOTE: No INSERT policy added for users table
-- User creation is handled exclusively by Supabase Auth service role
-- Service role key bypasses RLS, so no policy needed
-- This is the recommended security pattern for OAuth authentication
