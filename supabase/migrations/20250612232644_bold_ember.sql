/*
  # Fix policies for cursos_materias table
  
  1. Changes
     - Replace references to UserRole enum with string literals
     - Ensure proper quoting of role values
     - Add proper error handling with IF EXISTS/IF NOT EXISTS
  
  2. Security
     - Maintain same security policies for the cursos_materias table
     - Ensure only admins can modify data while all authenticated users can read
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
DROP POLICY IF EXISTS "authenticated_can_read_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "admins_can_insert_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "admins_can_update_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "admins_can_delete_cursos_materias" ON cursos_materias;

-- Create new policies with consistent user ID handling
-- Note: Using string literals instead of enum type references
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cursos_materias' 
    AND policyname = 'authenticated_can_read_cursos_materias'
  ) THEN
    CREATE POLICY "authenticated_can_read_cursos_materias"
      ON cursos_materias
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cursos_materias' 
    AND policyname = 'admins_can_insert_cursos_materias'
  ) THEN
    CREATE POLICY "admins_can_insert_cursos_materias"
      ON cursos_materias
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = get_current_user_id()
          AND users.role = 'ADMIN'
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cursos_materias' 
    AND policyname = 'admins_can_update_cursos_materias'
  ) THEN
    CREATE POLICY "admins_can_update_cursos_materias"
      ON cursos_materias
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = get_current_user_id()
          AND users.role = 'ADMIN'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = get_current_user_id()
          AND users.role = 'ADMIN'
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cursos_materias' 
    AND policyname = 'admins_can_delete_cursos_materias'
  ) THEN
    CREATE POLICY "admins_can_delete_cursos_materias"
      ON cursos_materias
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = get_current_user_id()
          AND users.role = 'ADMIN'
        )
      );
  END IF;
END
$$;