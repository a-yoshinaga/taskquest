/*
  # Add missing columns to tasks table

  1. Changes
    - Add `total_repetitions` column (integer, nullable) - tracks total number of repetitions for recurring tasks
    - Add `completed_repetitions` column (integer, default 0) - tracks how many repetitions have been completed
    - Add `end_date` column (timestamp with time zone, nullable) - tracks when recurring tasks should end

  2. Security
    - No RLS changes needed as these are just additional columns on existing table
*/

-- Add missing columns to tasks table
DO $$
BEGIN
  -- Add total_repetitions column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'total_repetitions'
  ) THEN
    ALTER TABLE tasks ADD COLUMN total_repetitions integer;
  END IF;

  -- Add completed_repetitions column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'completed_repetitions'
  ) THEN
    ALTER TABLE tasks ADD COLUMN completed_repetitions integer DEFAULT 0;
  END IF;

  -- Add end_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE tasks ADD COLUMN end_date timestamptz;
  END IF;
END $$;