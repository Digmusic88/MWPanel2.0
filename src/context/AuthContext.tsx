import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

// Demo users for development/testing
const DEMO_USERS = {
  'admin@edu.com': {
    id: 'demo-admin-001',
    name: 'Administrador Demo',
    email: 'admin@edu.com',
    role: 'admin' as const,
    phone: '+34 600 123 001',
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date()
  },
  'ana.rodriguez@edu.com': {
    id: 'demo-admin-002',
    name: 'Ana Rodríguez',
    email: 'ana.rodriguez@edu.com',
    role: 'admin' as const,
    phone: '+34 600 123 005',
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date()
  },
  'teacher@edu.com': {
    id: 'demo-teacher-001',
    name: 'Profesor Demo',
    email: 'teacher@edu.com',
    role: 'teacher' as const,
    phone: '+34 600 123 002',
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date(),
    subjects: ['Matemáticas', 'Física']
  },
  'carlos.martinez@edu.com': {
    id: 'demo-teacher-002',
    name: 'Carlos Martínez',
    email: 'carlos.martinez@edu.com',
    role: 'teacher' as const,
    phone: '+34 600 123 006',
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date(),
    subjects: ['Química', 'Biología', 'Historia']
  },
  'student@edu.com': {
    id: 'demo-student-001',
    name: 'Estudiante Demo',
    email: 'student@edu.com',
    role: 'student' as const,
    phone: '+34 600 123 003',
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date(),
    grade: '10° Grado'
  },
  'maria.gonzalez@edu.com': {
    id: 'demo-student-002',
    name: 'María González',
    email: 'maria.gonzalez@edu.com',
    role: 'student' as const,
    phone: '+34 600 123 007',
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date(),
    grade: '11° Grado'
  },
  'parent@edu.com': {
    id: 'demo-parent-001',
    name: 'Padre Demo',
    email: 'parent@edu.com',
    role: 'parent' as const,
    phone: '+34 600 123 004',
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date(),
    children: ['Estudiante Demo', 'María González']
  },
  'luis.fernandez@edu.com': {
    id: 'demo-parent-002',
    name: 'Luis Fernández',
    email: 'luis.fernandez@edu.com',
    role: 'parent' as const,
    phone: '+34 600 123 008',
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date(),
    children: ['María González']
  }
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role mapping between database enum and application
const DB_TO_APP_ROLE_MAP: Record<string, User['role']> = {
  'ADMIN': 'admin',
  'TEACHER': 'teacher',
  'STUDENT': 'student',
  'GUARDIAN': 'parent'
};

// Helper function to convert database row to User type
// Only includes fields that exist in the actual database schema
const dbRowToUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: DB_TO_APP_ROLE_MAP[row.role] || row.role,
  avatar: row.profile_image || undefined,
  phone: row.phone || undefined,
  createdAt: new Date(row.createdAt),
  isActive: row.status === 'ACTIVE',
  lastLogin: row.lastLogin ? new Date(row.lastLogin) : undefined,
  // Note: grade, subjects, children, and parentId are not stored in the users table
  // They would need to be fetched from separate tables or managed differently
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('edu_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUserId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (userError) {
        console.error('Error loading user profile:', userError);
        return;
      }

      if (!userData) {
        console.error('User profile not found for auth user:', authUserId);
        return;
      }

      const foundUser = dbRowToUser(userData);
      
      // Update last login
      try {
        await supabase
          .from('users')
          .update({ 
            lastLogin: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          .eq('id', foundUser.id);
      } catch (updateError) {
        console.log('Could not update last login:', updateError);
      }

      foundUser.lastLogin = new Date();
      
      // Save user to localStorage and state
      setUser(foundUser);
      localStorage.setItem('edu_user', JSON.stringify(foundUser));
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check for demo users first
      if (email in DEMO_USERS && password === 'demo123') {
        const demoUser = DEMO_USERS[email as keyof typeof DEMO_USERS];
        
        // Update last login
        demoUser.lastLogin = new Date();
        
        // Save user to localStorage and state
        setUser(demoUser);
        localStorage.setItem('edu_user', JSON.stringify(demoUser));
        setIsLoading(false);
        return true;
      }

      // Try Supabase Auth for non-demo users
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          console.error('Supabase authentication error:', error);
          setIsLoading(false);
          return false;
        }

        if (!data.user) {
          console.error('No user returned from Supabase authentication');
          setIsLoading(false);
          return false;
        }

        // User profile will be loaded by the auth state change listener
        setIsLoading(false);
        return true;
      } catch (supabaseError) {
        console.error('Supabase connection error:', supabaseError);
        // Fall back to demo user check if Supabase is unavailable
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    // Check if current user is a demo user
    const isDemoUser = user && user.email in DEMO_USERS;
    
    if (!isDemoUser) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    setUser(null);
    localStorage.removeItem('edu_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}