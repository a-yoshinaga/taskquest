/*
  # Create user achievements table

  1. New Tables
    - `user_achievements`
      - `user_id` (uuid, foreign key) - References auth.users
      - `achievement_id` (text) - Achievement identifier
      - `unlocked` (boolean, default false) - Whether achievement is unlocked
      - `current_value` (integer, default 0) - Current progress value
      - `updated_at` (timestamptz, default now()) - Last update timestamp
      - Composite primary key: (user_id, achievement_id)

  2. Security
    - Enable RLS on `user_achievements` table
    - Add policies for authenticated users to manage their own achievements
*/

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id text NOT NULL,
  unlocked boolean DEFAULT false,
  current_value integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON user_achievements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievements"
  ON user_achievements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON user_achievements(user_id);

-- Create trigger to automatically update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_achievements_updated_at'
  ) THEN
    CREATE TRIGGER update_user_achievements_updated_at
      BEFORE UPDATE ON user_achievements
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;