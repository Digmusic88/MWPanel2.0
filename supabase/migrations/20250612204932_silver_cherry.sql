/*
  # Fix RLS policies for courses table

  1. Database Functions
    - Create `get_current_user_id()` function to get the current authenticated user's ID
  
  2. Security Updates
    - Ensure RLS policies work correctly with the new function
    - Fix any issues with course creation permissions for admin users

  This migration fixes the "new row violates row-level security policy" error
  by ensuring the required database function exists and RLS policies work properly.
*/

-- Create the get_current_user_id function that the RLS policies depend on
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid()::text;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;

-- Ensure the courses table has proper RLS policies
-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "admins_can_insert_courses" ON courses;
DROP POLICY IF EXISTS "admins_can_update_courses" ON courses;
DROP POLICY IF EXISTS "admins_can_delete_courses" ON courses;
DROP POLICY IF EXISTS "authenticated_users_can_read_courses" ON courses;

-- Create new RLS policies for courses table
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
      SELECT 1
      FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'ADMIN'::UserRole
    )
  );

CREATE POLICY "admins_can_update_courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'ADMIN'::UserRole
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'ADMIN'::UserRole
    )
  );

CREATE POLICY "admins_can_delete_courses"
  ON courses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'ADMIN'::UserRole
    )
  );

-- Ensure the subjects table has similar fixes
DROP POLICY IF EXISTS "admins_can_insert_subjects" ON subjects;
DROP POLICY IF EXISTS "admins_can_update_subjects" ON subjects;
DROP POLICY IF EXISTS "admins_can_delete_subjects" ON subjects;
DROP POLICY IF EXISTS "authenticated_users_can_read_subjects" ON subjects;

-- Create new RLS policies for subjects table
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
      SELECT 1
      FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'ADMIN'::UserRole
    )
  );

CREATE POLICY "admins_can_update_subjects"
  ON subjects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'ADMIN'::UserRole
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'ADMIN'::UserRole
    )
  );

CREATE POLICY "admins_can_delete_subjects"
  ON subjects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'ADMIN'::UserRole
    )
  );