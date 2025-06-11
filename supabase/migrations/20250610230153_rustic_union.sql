/*
  # Add profile image support to users table

  1. Changes
    - Add profile_image column to users table for storing image URLs
    - Column is optional (nullable) and stores VARCHAR for image URLs
    - Add index for better performance if needed

  2. Notes
    - Using VARCHAR for URL storage (recommended approach)
    - Could be extended to support BLOB for binary storage if needed
    - Images will be stored externally (Cloudinary, etc.) with URLs in database
*/

-- Add profile_image column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'profile_image'
  ) THEN
    ALTER TABLE users ADD COLUMN profile_image text;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN users.profile_image IS 'URL to user profile image stored externally';