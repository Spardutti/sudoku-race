-- Migration 021: Add function to get stats by difficulty
-- Supports AC-6.1: Side-by-side stats for both difficulties

-- Create function to get stats for a specific difficulty
CREATE OR REPLACE FUNCTION get_user_stats_by_difficulty(
  p_user_id UUID,
  p_difficulty difficulty_level
)
RETURNS TABLE (
  total_count BIGINT,
  avg_time INTEGER,
  best_time INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_count,
    COALESCE(ROUND(AVG(c.completion_time_seconds))::INTEGER, NULL) as avg_time,
    COALESCE(MIN(c.completion_time_seconds)::INTEGER, NULL) as best_time
  FROM completions c
  JOIN puzzles p ON c.puzzle_id = p.id
  WHERE c.user_id = p_user_id
    AND c.is_complete = true
    AND c.completion_time_seconds IS NOT NULL
    AND p.difficulty = p_difficulty;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get combined stats across all difficulties
CREATE OR REPLACE FUNCTION get_user_combined_stats(p_user_id UUID)
RETURNS TABLE (
  total_puzzles BIGINT,
  easy_count BIGINT,
  medium_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_puzzles,
    COUNT(*) FILTER (WHERE p.difficulty = 'easy')::BIGINT as easy_count,
    COUNT(*) FILTER (WHERE p.difficulty = 'medium')::BIGINT as medium_count
  FROM completions c
  JOIN puzzles p ON c.puzzle_id = p.id
  WHERE c.user_id = p_user_id
    AND c.is_complete = true;
END;
$$ LANGUAGE plpgsql STABLE;
