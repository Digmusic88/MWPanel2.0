/*
  # Simplified authentication setup

  1. Tables
    - Ensure users table exists with proper structure
    - Add demo users for testing

  2. Security
    - Disable RLS temporarily for demo purposes
    - Allow anonymous access to users table for demo

  3. Demo Data
    - Insert test users for each role
*/

-- Ensure the users table exists with correct structure
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

-- Disable RLS for demo purposes (in production, you would keep RLS enabled)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Grant access to anonymous users for demo purposes
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;

-- Insert demo users (delete existing ones first to avoid conflicts)
DELETE FROM users WHERE email IN ('admin@edu.com', 'teacher@edu.com', 'student@edu.com', 'parent@edu.com');

INSERT INTO users (id, email, name, phone, role, status, "createdAt", "updatedAt") VALUES
  (
    'demo-admin-001',
    'admin@edu.com',
    'Administrador Sistema',
    '+1234567890',
    'ADMIN',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'demo-teacher-001',
    'teacher@edu.com',
    'María García',
    '+1234567891',
    'TEACHER',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'demo-student-001',
    'student@edu.com',
    'Juan Pérez',
    '+1234567892',
    'STUDENT',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'demo-parent-001',
    'parent@edu.com',
    'Ana Rodríguez',
    '+1234567893',
    'GUARDIAN',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );