-- Add timer_events JSONB column to completions table
-- Tracks pause/resume events for anti-cheat and leaderboard integrity

ALTER TABLE completions
ADD COLUMN IF NOT EXISTS timer_events JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN completions.timer_events IS 'Array of timer events: {type: "start"|"pause"|"resume"|"complete", timestamp: ISO8601}';
