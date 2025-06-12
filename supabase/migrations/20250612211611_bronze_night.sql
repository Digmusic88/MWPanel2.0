/*
  # Fix RLS policies for cursos_materias table

  1. Security Updates
    - Update RLS policies to use consistent user ID retrieval
    - Ensure policies work with the authentication system
    - Fix admin role checking for INSERT, UPDATE, DELETE operations
    - Maintain read access for all authenticated users

  2. Changes Made
    - Replace `(uid())::text` with `auth.uid()::text` for consistency
    - Ensure policies align with the users table structure
    - Fix policy conditions to properly check admin role
*/

-- First, ensure we have the get_current_user_id function
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid()::text;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Solo admins pueden insertar cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "Solo admins pueden actualizar cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "Solo admins pueden eliminar cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "Todos pueden leer cursos_materias" ON cursos_materias;

-- Create new policies with consistent user ID handling
CREATE POLICY "authenticated_can_read_cursos_materias"
  ON cursos_materias
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admins_can_insert_cursos_materias"
  ON cursos_materias
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'ADMIN'::UserRole
    )
  );

CREATE POLICY "admins_can_update_cursos_materias"
  ON cursos_materias
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'ADMIN'::UserRole
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'ADMIN'::UserRole
    )
  );

CREATE POLICY "admins_can_delete_cursos_materias"
  ON cursos_materias
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'ADMIN'::UserRole
    )
  );