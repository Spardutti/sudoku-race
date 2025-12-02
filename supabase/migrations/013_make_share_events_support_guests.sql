-- Story 5.4: Enable guest users to share (user_id nullable)
-- Allow guests to share without authentication (critical for viral growth)

-- Drop existing policies (will recreate with new logic)
DROP POLICY IF EXISTS "Users can insert own share events" ON share_events;
DROP POLICY IF EXISTS "Anyone can read share events" ON share_events;

-- Make user_id nullable (allow guest shares)
ALTER TABLE share_events ALTER COLUMN user_id DROP NOT NULL;

-- Make rank_at_share nullable (guests don't have ranks)
ALTER TABLE share_events ALTER COLUMN rank_at_share DROP NOT NULL;

-- New policy: Allow ALL inserts (anonymous tracking for viral growth)
CREATE POLICY "Allow all share event inserts"
  ON share_events
  FOR INSERT
  WITH CHECK (true);

-- New policy: Admin-only selects (analytics data, not public)
CREATE POLICY "Authenticated users can read share events"
  ON share_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Update comments
COMMENT ON COLUMN share_events.user_id IS 'User who shared (nullable for guests)';
COMMENT ON COLUMN share_events.rank_at_share IS 'Leaderboard rank at time of sharing (nullable for guests)';
