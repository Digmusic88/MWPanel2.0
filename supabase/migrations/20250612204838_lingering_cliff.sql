/*
  # Fix RLS policies for courses and subjects tables

  1. Security Updates
    - Fix get_current_user_id function to work with Supabase auth
    - Update RLS policies to use correct enum type reference
    - Ensure authenticated users can read courses/subjects
    - Only admins can modify courses/subjects

  2. Policy Updates
    - Drop existing problematic policies
    - Create new policies with proper enum type casting
    - Separate policies by operation type for better control
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
      AND role = 'ADMIN'::"UserRole"
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
      AND role = 'ADMIN'::"UserRole"
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = get_current_user_id() 
      AND role = 'ADMIN'::"UserRole"
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
      AND role = 'ADMIN'::"UserRole"
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
      AND role = 'ADMIN'::"UserRole"
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
      AND role = 'ADMIN'::"UserRole"
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = get_current_user_id() 
      AND role = 'ADMIN'::"UserRole"
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
      AND role = 'ADMIN'::"UserRole"
    )
  );