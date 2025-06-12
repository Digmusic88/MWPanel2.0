/*
  # Create courses and subjects tables

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text, nullable)
      - `created_at` (timestamp)
    
    - `subjects`
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key to courses.id)
      - `name` (text)
      - `credits` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read data
    - Add policies for admins to manage data
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name text NOT NULL,
  credits integer NOT NULL DEFAULT 3,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Policies for courses table
CREATE POLICY "Anyone can read courses"
  ON public.courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage courses"
  ON public.courses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = public.get_current_user_id() 
      AND u.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = public.get_current_user_id() 
      AND u.role = 'ADMIN'
    )
  );

-- Policies for subjects table
CREATE POLICY "Anyone can read subjects"
  ON public.subjects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage subjects"
  ON public.subjects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = public.get_current_user_id() 
      AND u.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = public.get_current_user_id() 
      AND u.role = 'ADMIN'
    )
  );

-- Grant permissions
GRANT ALL ON public.courses TO authenticated;
GRANT ALL ON public.subjects TO authenticated;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_course_id ON public.subjects(course_id);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON public.courses(created_at);
CREATE INDEX IF NOT EXISTS idx_subjects_created_at ON public.subjects(created_at);