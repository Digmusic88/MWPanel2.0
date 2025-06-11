/*
  # Complete users table setup with demo data

  1. Enums
    - Create UserRole enum (ADMIN, TEACHER, STUDENT, GUARDIAN)
    - Create UserStatus enum (ACTIVE, INACTIVE)

  2. New Tables
    - `users` table with all required columns
      - `id` (text, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `phone` (text, optional)
      - `role` (UserRole enum)
      - `status` (UserStatus enum)
      - `createdAt` (timestamp)
      - `updatedAt` (timestamp)
      - `lastLogin` (timestamp, optional)

  3. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to read their own data
    - Add policies for admins to manage all users
    - Add policies for users to update their own profile (limited fields)

  4. Demo Data
    - Insert demo users for each role type
    - All users set to ACTIVE status
*/

-- Create enums if they don't exist
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'GUARDIAN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  role "UserRole" NOT NULL,
  status "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastLogin" timestamptz
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;

-- Policy for admins to manage all users
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
    )
  );

-- Policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid()::text);

-- Policy for users to update their own data (limited fields)
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::text)
  WITH CHECK (
    id = auth.uid()::text AND
    -- Prevent users from changing their role or critical fields
    role = (SELECT role FROM users WHERE id = auth.uid()::text) AND
    email = (SELECT email FROM users WHERE id = auth.uid()::text)
  );

-- Policy for admins to insert new users
CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (auth.uid())::text 
      AND role = 'ADMIN'::"UserRole"
    )
  );

-- Insert demo users with proper roles and active status
INSERT INTO users (id, name, email, role, phone, status, "createdAt", "updatedAt") VALUES
  (
    gen_random_uuid()::text,
    'Administrador Demo',
    'admin@edu.com',
    'ADMIN',
    '+1234567890',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    gen_random_uuid()::text,
    'Profesor Demo',
    'teacher@edu.com',
    'TEACHER',
    '+1234567891',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    gen_random_uuid()::text,
    'Estudiante Demo',
    'student@edu.com',
    'STUDENT',
    '+1234567892',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    gen_random_uuid()::text,
    'Padre Demo',
    'parent@edu.com',
    'GUARDIAN',
    '+1234567893',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (email) DO NOTHING;