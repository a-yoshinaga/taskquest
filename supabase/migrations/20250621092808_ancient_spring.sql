/*
  # Complete TaskQuest Database Schema Setup

  1. New Tables
    - `tasks` - User tasks with gamification and recurring features
    - `game_stats` - User game statistics and progress  
    - `user_achievements` - User achievement progress

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Indexes and Triggers
    - Performance indexes for common queries
    - Auto-update timestamp triggers
*/

-- Create update function for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create tasks table with all required columns
CREATE TABLE IF NOT EXISTS tasks (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  points integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium',
  recurring_type text,
  recurring_interval integer,
  last_completed_date timestamptz,
  next_due_date timestamptz,
  total_repetitions integer,
  completed_repetitions integer DEFAULT 0,
  end_date timestamptz
);

-- Create game_stats table
CREATE TABLE IF NOT EXISTS game_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level integer DEFAULT 1,
  current_points integer DEFAULT 0,
  total_points integer DEFAULT 0,
  tasks_completed integer DEFAULT 0,
  streak integer DEFAULT 0,
  last_completed_date date,
  updated_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  unlocked boolean DEFAULT false,
  current_value integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DO $$
BEGIN
  -- Tasks policies
  DROP POLICY IF EXISTS "Users can read own tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
  
  CREATE POLICY "Users can read own tasks"
    ON tasks FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own tasks"
    ON tasks FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own tasks"
    ON tasks FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete own tasks"
    ON tasks FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

  -- Game stats policies
  DROP POLICY IF EXISTS "Users can read own game stats" ON game_stats;
  DROP POLICY IF EXISTS "Users can insert own game stats" ON game_stats;
  DROP POLICY IF EXISTS "Users can update own game stats" ON game_stats;
  DROP POLICY IF EXISTS "Users can delete own game stats" ON game_stats;
  
  CREATE POLICY "Users can read own game stats"
    ON game_stats FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own game stats"
    ON game_stats FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own game stats"
    ON game_stats FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete own game stats"
    ON game_stats FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

  -- User achievements policies
  DROP POLICY IF EXISTS "Users can read own achievements" ON user_achievements;
  DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
  DROP POLICY IF EXISTS "Users can update own achievements" ON user_achievements;
  DROP POLICY IF EXISTS "Users can delete own achievements" ON user_achievements;
  
  CREATE POLICY "Users can read own achievements"
    ON user_achievements FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own achievements"
    ON user_achievements FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own achievements"
    ON user_achievements FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete own achievements"
    ON user_achievements FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON user_achievements(user_id);

-- Create triggers for auto-updating timestamps
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_game_stats_updated_at ON game_stats;
  DROP TRIGGER IF EXISTS update_user_achievements_updated_at ON user_achievements;
  
  CREATE TRIGGER update_game_stats_updated_at
    BEFORE UPDATE ON game_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_user_achievements_updated_at
    BEFORE UPDATE ON user_achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;