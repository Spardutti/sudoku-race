-- Create share_events table for tracking social sharing analytics
CREATE TABLE IF NOT EXISTS share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  puzzle_id UUID NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('twitter', 'whatsapp', 'clipboard')),
  rank_at_share INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX idx_share_events_user_id ON share_events(user_id);
CREATE INDEX idx_share_events_puzzle_id ON share_events(puzzle_id);
CREATE INDEX idx_share_events_channel ON share_events(channel);
CREATE INDEX idx_share_events_created_at ON share_events(created_at);

-- Enable Row Level Security
ALTER TABLE share_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own share events
CREATE POLICY "Users can insert own share events"
  ON share_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can read all share events (for analytics)
CREATE POLICY "Anyone can read share events"
  ON share_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Add comment for documentation
COMMENT ON TABLE share_events IS 'Tracks social sharing events for viral growth analytics';
COMMENT ON COLUMN share_events.channel IS 'Share channel: twitter, whatsapp, or clipboard';
COMMENT ON COLUMN share_events.rank_at_share IS 'Users leaderboard rank at time of sharing';
