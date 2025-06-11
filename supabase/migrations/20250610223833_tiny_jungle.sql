/*
  # Add Demo Users for Authentication

  1. New Data
    - Insert demo users for each role type
    - `admin@edu.com` - Administrator account
    - `teacher@edu.com` - Teacher account  
    - `student@edu.com` - Student account
    - `parent@edu.com` - Guardian/Parent account

  2. User Details
    - All users have ACTIVE status
    - Realistic names and phone numbers
    - Created timestamps set to current time
    - Proper role assignments matching the enum values

  3. Security
    - Users table already has RLS enabled
    - Existing policies will apply to these demo users
*/

-- Insert demo users for testing and demonstration
INSERT INTO users (id, email, name, phone, role, status, "createdAt", "updatedAt") VALUES
  (
    gen_random_uuid()::text,
    'admin@edu.com',
    'Administrador Sistema',
    '+1234567890',
    'ADMIN',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    gen_random_uuid()::text,
    'teacher@edu.com',
    'María González',
    '+1234567891',
    'TEACHER',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    gen_random_uuid()::text,
    'student@edu.com',
    'Carlos Rodríguez',
    '+1234567892',
    'STUDENT',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    gen_random_uuid()::text,
    'parent@edu.com',
    'Ana Martínez',
    '+1234567893',
    'GUARDIAN',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (email) DO NOTHING;