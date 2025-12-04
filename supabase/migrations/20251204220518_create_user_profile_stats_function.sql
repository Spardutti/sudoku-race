CREATE OR REPLACE FUNCTION get_user_profile_stats(p_user_id UUID)
RETURNS TABLE (
  total_count BIGINT,
  avg_time INTEGER,
  best_time INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_count,
    COALESCE(ROUND(AVG(completion_time_seconds))::INTEGER, NULL) as avg_time,
    COALESCE(MIN(completion_time_seconds)::INTEGER, NULL) as best_time
  FROM completions
  WHERE user_id = p_user_id
    AND is_complete = true
    AND completion_time_seconds IS NOT NULL;
END;
$$ LANGUAGE plpgsql STABLE;
