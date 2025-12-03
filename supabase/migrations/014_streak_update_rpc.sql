-- Atomic streak update function
-- Updates user streak based on completion date logic
CREATE OR REPLACE FUNCTION update_user_streak(
  p_user_id UUID,
  p_today DATE
) RETURNS TABLE (
  current_streak INT,
  longest_streak INT,
  last_completion_date DATE,
  freeze_available BOOLEAN,
  last_freeze_reset_date DATE
) AS $$
DECLARE
  v_existing_streak RECORD;
  v_days_diff INT;
  v_new_current_streak INT;
  v_new_longest_streak INT;
  v_freeze_available BOOLEAN;
  v_last_freeze_reset_date DATE;
  v_days_since_freeze_reset INT;
BEGIN
  -- Get existing streak
  SELECT * INTO v_existing_streak
  FROM streaks
  WHERE user_id = p_user_id;

  -- First-time user
  IF NOT FOUND THEN
    INSERT INTO streaks (
      user_id,
      current_streak,
      longest_streak,
      last_completion_date,
      freeze_available,
      last_freeze_reset_date
    ) VALUES (
      p_user_id,
      1,
      1,
      p_today,
      true,
      NULL
    )
    RETURNING * INTO v_existing_streak;

    RETURN QUERY SELECT
      v_existing_streak.current_streak,
      v_existing_streak.longest_streak,
      v_existing_streak.last_completion_date,
      v_existing_streak.freeze_available,
      v_existing_streak.last_freeze_reset_date;
    RETURN;
  END IF;

  -- Same-day recompletion
  IF v_existing_streak.last_completion_date = p_today THEN
    RETURN QUERY SELECT
      v_existing_streak.current_streak,
      v_existing_streak.longest_streak,
      v_existing_streak.last_completion_date,
      v_existing_streak.freeze_available,
      v_existing_streak.last_freeze_reset_date;
    RETURN;
  END IF;

  -- Calculate days difference
  v_days_diff := p_today - v_existing_streak.last_completion_date;

  v_new_current_streak := v_existing_streak.current_streak;
  v_new_longest_streak := v_existing_streak.longest_streak;
  v_freeze_available := v_existing_streak.freeze_available;
  v_last_freeze_reset_date := v_existing_streak.last_freeze_reset_date;

  -- Check if freeze should be reset (7 days since last freeze use)
  IF v_last_freeze_reset_date IS NOT NULL THEN
    v_days_since_freeze_reset := p_today - v_last_freeze_reset_date;
    IF v_days_since_freeze_reset >= 7 THEN
      v_freeze_available := true;
      v_last_freeze_reset_date := NULL;
    END IF;
  END IF;

  -- Apply streak logic
  IF v_days_diff = 1 THEN
    -- Completed yesterday: increment streak
    v_new_current_streak := v_new_current_streak + 1;
    IF v_new_current_streak > v_new_longest_streak THEN
      v_new_longest_streak := v_new_current_streak;
    END IF;
  ELSIF v_days_diff = 2 AND v_freeze_available THEN
    -- Missed 1 day but freeze available: maintain streak, consume freeze
    v_freeze_available := false;
    v_last_freeze_reset_date := p_today;
  ELSE
    -- Multi-day gap or no freeze: reset to 1
    v_new_current_streak := 1;
  END IF;

  -- Update streak
  UPDATE streaks
  SET
    current_streak = v_new_current_streak,
    longest_streak = v_new_longest_streak,
    last_completion_date = p_today,
    freeze_available = v_freeze_available,
    last_freeze_reset_date = v_last_freeze_reset_date
  WHERE user_id = p_user_id
  RETURNING * INTO v_existing_streak;

  RETURN QUERY SELECT
    v_existing_streak.current_streak,
    v_existing_streak.longest_streak,
    v_existing_streak.last_completion_date,
    v_existing_streak.freeze_available,
    v_existing_streak.last_freeze_reset_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION update_user_streak(UUID, DATE) TO authenticated;
