import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          course_id: string;
          name: string;
          credits: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          name: string;
          credits: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          name?: string;
          credits?: number;
          created_at?: string;
        };
      };
    };
  };
}