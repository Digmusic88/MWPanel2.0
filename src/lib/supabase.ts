import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client for demo purposes when environment variables are missing
const createMockClient = () => {
  console.warn('Supabase environment variables not found. Running in demo mode with local data only.');
  
  const mockQueryBuilder = {
    select: (columns?: string) => mockQueryBuilder,
    eq: (column: string, value: any) => mockQueryBuilder,
    or: (query: string) => mockQueryBuilder,
    order: (column: string, options?: any) => Promise.resolve({ data: [], error: { message: 'Demo mode - no database connection' } }),
    maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Demo mode - no database connection' } }),
    single: () => Promise.resolve({ data: null, error: { message: 'Demo mode - no database connection' } }),
    insert: (values: any) => mockQueryBuilder,
    update: (values: any) => mockQueryBuilder,
    delete: () => mockQueryBuilder
  };

  return {
    isMock: true, // Flag to identify mock client
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Demo mode - use demo accounts' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: (table: string) => mockQueryBuilder
  };
};

// Initialize Supabase client or mock client
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

// Database types
interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'GUARDIAN';
          phone: string | null;
          status: 'ACTIVE' | 'INACTIVE';
          createdAt: string;
          updatedAt: string;
          profile_image: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'GUARDIAN';
          phone?: string | null;
          status?: 'ACTIVE' | 'INACTIVE';
          createdAt?: string;
          updatedAt?: string;
          profile_image?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'GUARDIAN';
          phone?: string | null;
          status?: 'ACTIVE' | 'INACTIVE';
          createdAt?: string;
          updatedAt?: string;
          profile_image?: string | null;
        };
      };
      family_connections: {
        Row: {
          id: string;
          parent_id: string;
          student_id: string;
          relationship_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          student_id: string;
          relationship_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          student_id?: string;
          relationship_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
