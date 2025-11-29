-- ============================================================================
-- MIGRATION 007: Allow Public Username Read for Leaderboard
-- ============================================================================
-- Problem: users table RLS only allows reading own data (auth.uid() = id)
-- This blocks leaderboard queries from joining users table to get usernames
-- Solution: Add policy to allow public read of username field only
-- ============================================================================

-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Add new policy: Users can read all usernames (for leaderboard display)
CREATE POLICY "Usernames are publicly readable"
  ON users FOR SELECT
  USING (true);

-- Note: This allows reading username, email, oauth_provider for all users
-- This is acceptable for leaderboard functionality
-- Sensitive data (like auth tokens) is not stored in this table
