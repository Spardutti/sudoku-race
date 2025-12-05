-- Add atomic append function for timer_events to prevent race conditions
-- Used by pause/resume actions

CREATE OR REPLACE FUNCTION append_timer_event(
  p_user_id UUID,
  p_puzzle_id UUID,
  p_event JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE completions
  SET timer_events = COALESCE(timer_events, '[]'::jsonb) || p_event::jsonb
  WHERE user_id = p_user_id AND puzzle_id = p_puzzle_id;
END;
$$;

COMMENT ON FUNCTION append_timer_event IS 'Atomically appends a timer event to completions.timer_events array, preventing race conditions';
