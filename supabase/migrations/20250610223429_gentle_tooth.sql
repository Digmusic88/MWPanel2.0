/*
  # Seed Demo Users

  1. Demo Users
    - Creates demo users for each role (ADMIN, TEACHER, STUDENT, GUARDIAN)
    - All users have status 'ACTIVE' and password 'demo123' (simulated)
    - Includes realistic names and phone numbers for demonstration

  2. User Data
    - admin@edu.com - Administrator user
    - teacher@edu.com - Teacher user  
    - student@edu.com - Student user
    - parent@edu.com - Guardian/Parent user

  Note: In a real application, passwords would be hashed and stored securely.
  This is for demonstration purposes only.
*/

-- Insert demo users
INSERT INTO users (id, name, email, role, phone, status, "createdAt", "updatedAt") VALUES
  (
    gen_random_uuid()::text,
    'Administrador Sistema',
    'admin@edu.com',
    'ADMIN',
    '+1234567890',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    gen_random_uuid()::text,
    'María García',
    'teacher@edu.com',
    'TEACHER',
    '+1234567891',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    gen_random_uuid()::text,
    'Juan Pérez',
    'student@edu.com',
    'STUDENT',
    '+1234567892',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    gen_random_uuid()::text,
    'Ana Rodríguez',
    'parent@edu.com',
    'GUARDIAN',
    '+1234567893',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (email) DO NOTHING;