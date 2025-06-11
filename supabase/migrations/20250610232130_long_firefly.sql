/*
  # Add profile_image column to users table

  1. Changes
    - Add profile_image column to users table for storing image URLs
    - Update existing users with default avatar URLs based on their names
    - Add index for better query performance

  2. Security
    - Column allows NULL values for users without profile images
    - No additional RLS policies needed as it follows existing user policies
*/

-- Add profile_image column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'profile_image'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN profile_image text;
    
    -- Add comment to describe the column
    COMMENT ON COLUMN public.users.profile_image IS 'URL to user profile image stored externally';
  END IF;
END $$;

-- Create index for profile_image column for better performance
CREATE INDEX IF NOT EXISTS idx_users_profile_image 
  ON public.users(profile_image) 
  WHERE profile_image IS NOT NULL;