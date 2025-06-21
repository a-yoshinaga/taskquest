/*
  # Create users table and authentication setup

  1. New Tables
    - `users` table is automatically created by Supabase Auth
    - We'll reference auth.users in our other tables

  2. Security
    - Authentication is handled by Supabase Auth
    - Email confirmation is disabled for development
*/

-- The users table is automatically created by Supabase Auth
-- We just need to ensure our other tables can reference it properly