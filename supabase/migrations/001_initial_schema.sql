-- Initial Database Schema for Sudoku Race
-- Generated: 2025-11-14
-- Story: 1-2-supabase-integration-database-setup

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users Table
-- Stores user account information from OAuth providers
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  oauth_provider TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Puzzles Table
-- Stores daily Sudoku puzzles with solutions (solution NEVER exposed to client)
CREATE TABLE IF NOT EXISTS puzzles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  puzzle_date DATE NOT NULL UNIQUE,
  puzzle_data JSONB NOT NULL,
  difficulty TEXT NOT NULL,
  solution JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Completions Table
-- Tracks user progress and completed puzzles (both guest and authenticated)
CREATE TABLE IF NOT EXISTS completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  puzzle_id UUID REFERENCES puzzles(id) ON DELETE CASCADE,
  completion_time_seconds INT,
  completed_at TIMESTAMPTZ,
  is_guest BOOLEAN DEFAULT false,
  completion_data JSONB,
  solve_path JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, puzzle_id)
);

-- Leaderboards Table
-- Optimized view for daily puzzle rankings
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  puzzle_id UUID REFERENCES puzzles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rank INT NOT NULL,
  completion_time_seconds INT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(puzzle_id, user_id)
);

-- Streaks Table
-- Tracks user engagement streaks with freeze mechanic
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak INT NOT NULL DEFAULT 1,
  longest_streak INT NOT NULL DEFAULT 1,
  last_completion_date DATE NOT NULL,
  freeze_available BOOLEAN DEFAULT true,
  last_freeze_reset_date DATE,
  UNIQUE(user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Puzzles: Optimize date-based queries (most recent puzzles first)
CREATE INDEX IF NOT EXISTS idx_puzzles_date ON puzzles(puzzle_date DESC);

-- Completions: Optimize user history queries
CREATE INDEX IF NOT EXISTS idx_completions_user ON completions(user_id);

-- Completions: Optimize puzzle completion lookups
CREATE INDEX IF NOT EXISTS idx_completions_puzzle ON completions(puzzle_id);

-- Leaderboards: Optimize ranking queries (composite index for fast sorting)
CREATE INDEX IF NOT EXISTS idx_leaderboards_puzzle_time ON leaderboards(puzzle_id, completion_time_seconds ASC);

-- Streaks: Optimize user streak lookups
CREATE INDEX IF NOT EXISTS idx_streaks_user ON streaks(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Users Table Policies
-- Users can only read and update their own data
-- NOTE: User INSERT is handled exclusively by Supabase Auth service role (bypasses RLS)
-- No INSERT policy needed - OAuth providers create users via service role key
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Puzzles Table Policies
-- Puzzles are publicly readable (solution is in JSONB but client never requests it)
CREATE POLICY "Puzzles are publicly readable"
  ON puzzles FOR SELECT
  USING (true);

-- Completions Table Policies
-- Users can only access their own completions
CREATE POLICY "Users can read own completions"
  ON completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
  ON completions FOR UPDATE
  USING (auth.uid() = user_id);

-- Leaderboards Table Policies
-- Leaderboards are publicly readable (competitive feature)
CREATE POLICY "Leaderboards are publicly readable"
  ON leaderboards FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own leaderboard entries"
  ON leaderboards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entries"
  ON leaderboards FOR UPDATE
  USING (auth.uid() = user_id);

-- Streaks Table Policies
-- Users can only read and modify their own streak data
CREATE POLICY "Users can read own streaks"
  ON streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON streaks FOR UPDATE
  USING (auth.uid() = user_id);
