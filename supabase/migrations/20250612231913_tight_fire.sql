/*
  # Fix RLS policies for courses table

  1. Security Updates
    - Ensure get_current_user_id() function exists and works correctly
    - Update courses table policies to work with Supabase auth
    - Ensure admins can manage courses and authenticated users can read them

  2. Changes Made
    - Recreate get_current_user_id function if missing
    - Update courses table policies to work with Supabase auth
    - Ensure proper admin role checking
*/

-- First, ensure we have the get_current_user_id function
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(auth.uid()::text, '');
$$;

-- Drop existing policies for courses table if they exist
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Anyone can read courses" ON courses;
DROP POLICY IF EXISTS "authenticated_users_can_read_courses" ON courses;
DROP POLICY IF EXISTS "admins_can_insert_courses" ON courses;
DROP POLICY IF EXISTS "admins_can_update_courses" ON courses;
DROP POLICY IF EXISTS "admins_can_delete_courses" ON courses;

-- Create new working policies for courses table
-- Only create if they don't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'courses' AND policyname = 'authenticated_users_can_read_courses'
    ) THEN
        CREATE POLICY "authenticated_users_can_read_courses"
          ON courses
          FOR SELECT
          TO authenticated
          USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'courses' AND policyname = 'admins_can_insert_courses'
    ) THEN
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
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'courses' AND policyname = 'admins_can_update_courses'
    ) THEN
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
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'courses' AND policyname = 'admins_can_delete_courses'
    ) THEN
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
    END IF;
END $$;

-- Also fix subjects table policies to be consistent
DROP POLICY IF EXISTS "Admins can manage subjects" ON subjects;
DROP POLICY IF EXISTS "Anyone can read subjects" ON subjects;
DROP POLICY IF EXISTS "authenticated_users_can_read_subjects" ON subjects;
DROP POLICY IF EXISTS "admins_can_insert_subjects" ON subjects;
DROP POLICY IF EXISTS "admins_can_update_subjects" ON subjects;
DROP POLICY IF EXISTS "admins_can_delete_subjects" ON subjects;

-- Create new policies for subjects table if they don't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subjects' AND policyname = 'authenticated_users_can_read_subjects'
    ) THEN
        CREATE POLICY "authenticated_users_can_read_subjects"
          ON subjects
          FOR SELECT
          TO authenticated
          USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subjects' AND policyname = 'admins_can_insert_subjects'
    ) THEN
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
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subjects' AND policyname = 'admins_can_update_subjects'
    ) THEN
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
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subjects' AND policyname = 'admins_can_delete_subjects'
    ) THEN
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
    END IF;
END $$;