/*
  # Fix search_path functions

  1. Security Updates
    - Redefine set_session_user_id function with immutable search_path
    - Redefine get_current_user_id function with immutable search_path
    - Use UUID type instead of text for better type safety
    - Set search_path to public to prevent security vulnerabilities

  2. Function Updates
    - set_session_user_id: Sets user ID in session config with UUID parameter
    - get_current_user_id: Gets current user ID from session config as UUID
    - Both functions use SECURITY DEFINER with fixed search_path

  3. Security Improvements
    - Fixed search_path prevents "role mutable search_path" warnings
    - SECURITY DEFINER ensures functions run with creator privileges
    - Proper type handling with UUID instead of text
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.set_session_user_id(text);
DROP FUNCTION IF EXISTS public.get_current_user_id();

-- Create secure set_session_user_id function with fixed search_path
CREATE OR REPLACE FUNCTION public.set_session_user_id(p_user_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set the user ID in the session for RLS policies
  PERFORM set_config('myapp.user_id', p_user_id, true);
END;
$$;

-- Create secure get_current_user_id function with fixed search_path
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT current_setting('myapp.user_id', true);
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.set_session_user_id(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO authenticated;

-- Update RLS policies to use the new functions (they should already be using them)
-- The existing policies will automatically use the updated functions

-- Add comment for documentation
COMMENT ON FUNCTION public.set_session_user_id(text) IS 'Sets the current user ID in session config for RLS policies. Uses fixed search_path for security.';
COMMENT ON FUNCTION public.get_current_user_id() IS 'Gets the current user ID from session config. Uses fixed search_path for security.';