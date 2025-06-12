/*
  # Fix RLS policies for courses table

  1. Security Updates
    - Drop existing problematic policies
    - Create new working policies for courses table
    - Ensure get_current_user_id() function exists and works correctly
    - Add proper admin role checking

  2. Changes Made
    - Recreate get_current_user_id() function if missing
    - Update courses table policies to work with Supabase auth
    - Ensure admins can manage courses and authenticated users can read them
*/

-- First, ensure we have the get_current_user_id function
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(auth.uid()::text, '');
$$;

-- Drop existing policies for courses table
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Anyone can read courses" ON courses;

-- Create new working policies for courses table
CREATE POLICY "authenticated_users_can_read_courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admins_can_insert_courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = get_current_user_id() 
      AND role = 'ADMIN'::UserRole
    )
  );

CREATE POLICY "admins_can_update_courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = get_current_user_id() 
      AND role = 'ADMIN'::UserRole
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = get_current_user_id() 
      AND role = 'ADMIN'::UserRole
    )
  );

CREATE POLICY "admins_can_delete_courses"
  ON courses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = get_current_user_id() 
      AND role = 'ADMIN'::UserRole
    )
  );

-- Also fix subjects table policies to be consistent
DROP POLICY IF EXISTS "Admins can manage subjects" ON subjects;
DROP POLICY IF EXISTS "Anyone can read subjects" ON subjects;

CREATE POLICY "authenticated_users_can_read_subjects"
  ON subjects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admins_can_insert_subjects"
  ON subjects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = get_current_user_id() 
      AND role = 'ADMIN'::UserRole
    )
  );

CREATE POLICY "admins_can_update_subjects"
  ON subjects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = get_current_user_id() 
      AND role = 'ADMIN'::UserRole
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = get_current_user_id() 
      AND role = 'ADMIN'::UserRole
    )
  );

CREATE POLICY "admins_can_delete_subjects"
  ON subjects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = get_current_user_id() 
      AND role = 'ADMIN'::UserRole
    )
  );