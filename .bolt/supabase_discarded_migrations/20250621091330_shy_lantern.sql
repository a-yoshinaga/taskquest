/*
  # Create game stats table

  1. New Tables
    - `game_stats`
      - `user_id` (uuid, primary key) - References auth.users
      - `level` (integer, default 1) - User's current level
      - `current_points` (integer, default 0) - Current points for level progression
      - `total_points` (integer, default 0) - Total points earned all time
      - `tasks_completed` (integer, default 0) - Total tasks completed
      - `streak` (integer, default 0) - Current completion streak
      - `last_completed_date` (date, nullable) - Last task completion date
      - `updated_at` (timestamptz, default now()) - Last update timestamp

  2. Security
    - Enable RLS on `game_stats` table
    - Add policies for authenticated users to manage their own stats
*/

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

ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own game stats"
  ON game_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game stats"
  ON game_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game stats"
  ON game_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own game stats"
  ON game_stats
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_game_stats_updated_at
  BEFORE UPDATE ON game_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();