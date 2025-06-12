/*
  # Fix RLS policies for cursos_materias table

  1. Security Updates
    - Create/update get_current_user_id function
    - Drop existing RLS policies that are causing violations
    - Create new RLS policies with proper enum type reference

  2. Policy Changes
    - Allow all authenticated users to read cursos_materias
    - Only allow ADMIN users to insert, update, and delete cursos_materias
    - Use proper "UserRole" enum type syntax
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

-- Create new policies with consistent user ID handling and proper enum syntax
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
      AND users.role = 'ADMIN'::"UserRole"
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
      AND users.role = 'ADMIN'::"UserRole"
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'ADMIN'::"UserRole"
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
      AND users.role = 'ADMIN'::"UserRole"
    )
  );