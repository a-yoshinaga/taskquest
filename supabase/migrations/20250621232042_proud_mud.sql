/*
  # Add app_title column to user_profiles table

  1. Changes
    - Add `app_title` column (text, nullable) to `user_profiles` table
    - This allows users to customize their application title/focus

  2. Security
    - No RLS changes needed as this is just an additional column on existing table
*/

-- Add app_title column to user_profiles table
DO $$
BEGIN
  -- Add app_title column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'app_title'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN app_title text;
  END IF;
END $$;