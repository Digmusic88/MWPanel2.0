/*
  # Fix RLS policies for cursos_materias table

  1. Security Updates
    - Drop existing restrictive policies
    - Create new policies that properly handle user authentication
    - Allow ADMIN and TEACHER roles to manage cursos_materias
    - Allow all authenticated users to read cursos_materias

  2. Policy Changes
    - INSERT: Allow ADMIN and TEACHER roles
    - UPDATE: Allow ADMIN and TEACHER roles  
    - DELETE: Allow ADMIN role only
    - SELECT: Allow all authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "admins_can_insert_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "admins_can_update_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "admins_can_delete_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "authenticated_can_read_cursos_materias" ON cursos_materias;

-- Create helper function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS "UserRole" AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM users 
    WHERE id = get_current_user_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies with proper role-based access

-- Allow authenticated users to read all cursos_materias
CREATE POLICY "authenticated_users_can_read_cursos_materias"
  ON cursos_materias
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow ADMIN and TEACHER roles to insert cursos_materias
CREATE POLICY "admin_teacher_can_insert_cursos_materias"
  ON cursos_materias
  FOR INSERT
  TO authenticated
  WITH CHECK (
    get_current_user_role() IN ('ADMIN', 'TEACHER')
  );

-- Allow ADMIN and TEACHER roles to update cursos_materias
CREATE POLICY "admin_teacher_can_update_cursos_materias"
  ON cursos_materias
  FOR UPDATE
  TO authenticated
  USING (
    get_current_user_role() IN ('ADMIN', 'TEACHER')
  )
  WITH CHECK (
    get_current_user_role() IN ('ADMIN', 'TEACHER')
  );

-- Allow only ADMIN role to delete cursos_materias
CREATE POLICY "admin_can_delete_cursos_materias"
  ON cursos_materias
  FOR DELETE
  TO authenticated
  USING (
    get_current_user_role() = 'ADMIN'
  );