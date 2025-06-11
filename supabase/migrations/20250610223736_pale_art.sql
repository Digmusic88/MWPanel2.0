/*
  # Fix RLS policies and add session management

  1. Security Updates
    - Update RLS policies to work with anonymous authentication
    - Add function to set session user ID for demo purposes
    - Ensure proper access control for CRUD operations

  2. Functions
    - Add set_session_user_id function for demo authentication
    - Add get_current_user_id function for policy checks

  3. Policy Updates
    - Update policies to use session-based user identification
    - Ensure admins can perform all operations
    - Allow users to read their own data
*/

-- Create function to set session user ID (for demo purposes)
CREATE OR REPLACE FUNCTION set_session_user_id(user_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set the user ID in the session for RLS policies
  PERFORM set_config('app.current_user_id', user_id, true);
END;
$$;

-- Create function to get current user ID from session
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Get the user ID from session config
  RETURN current_setting('app.current_user_id', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;

-- Create new policies that work with session-based authentication

-- Policy for admins to manage all users
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = get_current_user_id() AND u.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = get_current_user_id() AND u.role = 'ADMIN'
    )
  );

-- Policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    id = get_current_user_id() OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = get_current_user_id() AND u.role = 'ADMIN'
    )
  );

-- Policy for users to update their own data (limited fields)
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    id = get_current_user_id() OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = get_current_user_id() AND u.role = 'ADMIN'
    )
  )
  WITH CHECK (
    (id = get_current_user_id() AND
     -- Prevent users from changing their role or email
     role = (SELECT role FROM users WHERE id = get_current_user_id()) AND
     email = (SELECT email FROM users WHERE id = get_current_user_id())) OR
    -- Admins can change anything
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = get_current_user_id() AND u.role = 'ADMIN'
    )
  );

-- Policy for admins to insert new users
CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = get_current_user_id() AND u.role = 'ADMIN'
    )
  );

-- Policy for admins to delete users
CREATE POLICY "Admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = get_current_user_id() AND u.role = 'ADMIN'
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT EXECUTE ON FUNCTION set_session_user_id(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;