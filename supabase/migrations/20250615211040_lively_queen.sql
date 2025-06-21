/*
  # Create tasks table

  1. New Tables
    - `tasks`
      - `id` (text, primary key) - Task identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `title` (text) - Task title
      - `description` (text, nullable) - Task description
      - `completed` (boolean, default false) - Completion status
      - `created_at` (timestamptz, default now()) - Creation timestamp
      - `completed_at` (timestamptz, nullable) - Completion timestamp
      - `points` (integer) - Points earned for task
      - `category` (text) - Task category
      - `priority` (text) - Task priority level

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for authenticated users to manage their own tasks
*/

CREATE TABLE IF NOT EXISTS tasks (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  points integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium'
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks(created_at DESC);