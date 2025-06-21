/*
  # Update tasks table for recurring functionality

  1. Changes
    - Add recurring_type column (daily, weekly, monthly)
    - Add recurring_interval column (number)
    - Add last_completed_date column
    - Add next_due_date column

  2. Notes
    - These columns are nullable to support both regular and recurring tasks
    - Existing tasks will not be affected
*/

DO $$
BEGIN
  -- Add recurring_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'recurring_type'
  ) THEN
    ALTER TABLE tasks ADD COLUMN recurring_type text;
  END IF;

  -- Add recurring_interval column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'recurring_interval'
  ) THEN
    ALTER TABLE tasks ADD COLUMN recurring_interval integer;
  END IF;

  -- Add last_completed_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'last_completed_date'
  ) THEN
    ALTER TABLE tasks ADD COLUMN last_completed_date timestamptz;
  END IF;

  -- Add next_due_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'next_due_date'
  ) THEN
    ALTER TABLE tasks ADD COLUMN next_due_date timestamptz;
  END IF;
END $$;