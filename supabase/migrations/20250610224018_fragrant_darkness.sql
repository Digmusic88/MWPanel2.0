/*
  # Add demo users for authentication testing

  1. New Data
    - Add demo users for each role type:
      - Admin: admin@edu.com
      - Teacher: teacher@edu.com  
      - Student: student@edu.com
      - Guardian: parent@edu.com
    - All users set to ACTIVE status
    - Proper role assignments matching database enums

  2. Notes
    - These are demo accounts for testing the authentication system
    - All accounts use the same demo credentials as documented in README
    - Uses correct quoted column names for camelCase fields
*/

-- Insert demo users for authentication testing
INSERT INTO users (
  id,
  email,
  name,
  role,
  status,
  phone,
  "createdAt",
  "updatedAt"
) VALUES 
  (
    gen_random_uuid()::text,
    'admin@edu.com',
    'Administrador Demo',
    'ADMIN',
    'ACTIVE',
    '+1234567890',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    gen_random_uuid()::text,
    'teacher@edu.com',
    'Profesor Demo',
    'TEACHER',
    'ACTIVE',
    '+1234567891',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    gen_random_uuid()::text,
    'student@edu.com',
    'Estudiante Demo',
    'STUDENT',
    'ACTIVE',
    '+1234567892',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    gen_random_uuid()::text,
    'parent@edu.com',
    'Padre Demo',
    'GUARDIAN',
    'ACTIVE',
    '+1234567893',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (email) DO NOTHING;