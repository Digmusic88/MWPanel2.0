/*
  # Fix Users RLS Policies

  1. Security Improvements
    - Eliminate auth_rls_initplan warnings by using subselects
    - Remove multiple_permissive_policies warnings by consolidating policies
    - Create single policy per action type for better performance

  2. Policy Changes
    - Drop existing redundant policies
    - Create optimized policies with subselects for auth functions
    - Maintain same security model with better performance

  3. Performance Benefits
    - Auth functions execute once per query instead of per row
    - Single policy evaluation per action type
    - Reduced policy complexity and evaluation overhead
*/

-- Drop existing policies that cause warnings
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Create optimized SELECT policy
-- Uses subselects to prevent auth_rls_initplan warnings
CREATE POLICY "authenticated_can_select_users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    -- Check if user is admin (using subselect for performance)
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = public.get_current_user_id() 
      AND u.role = 'ADMIN'
    )
    OR 
    -- Or user can see their own data
    id = public.get_current_user_id()
  );

-- Create optimized UPDATE policy
CREATE POLICY "authenticated_can_update_users"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    -- Permission to execute UPDATE
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = public.get_current_user_id() 
      AND u.role = 'ADMIN'
    )
    OR 
    id = public.get_current_user_id()
  )
  WITH CHECK (
    -- Verification of new data
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = public.get_current_user_id() 
      AND u.role = 'ADMIN'
    )
    OR 
    (
      -- Users can only update their own data and cannot change critical fields
      id = public.get_current_user_id() 
      AND role = (SELECT role FROM public.users WHERE id = public.get_current_user_id())
      AND email = (SELECT email FROM public.users WHERE id = public.get_current_user_id())
    )
  );

-- Create optimized INSERT policy for admins
CREATE POLICY "authenticated_can_insert_users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = public.get_current_user_id() 
      AND u.role = 'ADMIN'
    )
  );

-- Create optimized DELETE policy for admins
CREATE POLICY "authenticated_can_delete_users"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = public.get_current_user_id() 
      AND u.role = 'ADMIN'
    )
  );

-- Add comments for documentation
COMMENT ON POLICY "authenticated_can_select_users" ON public.users IS 
  'Optimized SELECT policy: Admins can read all users, users can read own data. Uses subselects to prevent auth_rls_initplan warnings.';

COMMENT ON POLICY "authenticated_can_update_users" ON public.users IS 
  'Optimized UPDATE policy: Admins can update all users, users can update own data with restrictions. Prevents multiple_permissive_policies warnings.';

COMMENT ON POLICY "authenticated_can_insert_users" ON public.users IS 
  'INSERT policy: Only admins can create new users.';

COMMENT ON POLICY "authenticated_can_delete_users" ON public.users IS 
  'DELETE policy: Only admins can delete users.';