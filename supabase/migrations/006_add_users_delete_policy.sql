-- Add DELETE RLS Policy for Users Table
-- Generated: 2025-11-28
-- Story: 3-4-user-profile-account-management
-- Addresses: GDPR compliance - users can delete their own account

-- ============================================================================
-- USERS TABLE - ADD DELETE POLICY
-- ============================================================================

CREATE POLICY "Users can delete own account"
  ON users FOR DELETE
  USING (auth.uid() = id);

-- ============================================================================
-- COMPLETIONS TABLE - ADD DELETE POLICY
-- ============================================================================

CREATE POLICY "Users can delete own completions"
  ON completions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- LEADERBOARDS TABLE - ADD DELETE POLICY
-- ============================================================================

CREATE POLICY "Users can delete own leaderboard entries"
  ON leaderboards FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STREAKS TABLE - ADD DELETE POLICY
-- ============================================================================

CREATE POLICY "Users can delete own streaks"
  ON streaks FOR DELETE
  USING (auth.uid() = user_id);
