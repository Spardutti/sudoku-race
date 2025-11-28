-- Add INSERT policy for users table
-- Allows authenticated users to insert their own user record during OAuth callback
-- This fixes the issue where OAuth callback cannot create user records due to RLS

-- Drop existing policies to recreate them with INSERT support
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Recreate policies with INSERT support
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
