import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// Demo users for development/testing - synchronized with AuthContext
const DEMO_USERS: User[] = [
  {
    id: 'demo-admin-001',
    name: 'Administrador Demo',
    email: 'admin@edu.com',
    role: 'admin',
    phone: '+34 600 123 001',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: 'demo-admin-002',
    name: 'Ana Rodríguez',
    email: 'ana.rodriguez@edu.com',
    role: 'admin',
    phone: '+34 600 123 005',
    isActive: true,
    createdAt: new Date('2024-01-02'),
    lastLogin: new Date()
  },
  {
    id: 'demo-teacher-001',
    name: 'Profesor Demo',
    email: 'teacher@edu.com',
    role: 'teacher',
    phone: '+34 600 123 002',
    isActive: true,
    createdAt: new Date('2024-01-03'),
    lastLogin: new Date(),
    subjects: ['Matemáticas', 'Física']
  },
  {
    id: 'demo-teacher-002',
    name: 'Carlos Martínez',
    email: 'carlos.martinez@edu.com',
    role: 'teacher',
    phone: '+34 600 123 006',
    isActive: true,
    createdAt: new Date('2024-01-04'),
    lastLogin: new Date(),
    subjects: ['Química', 'Biología', 'Historia']
  },
  {
    id: 'demo-student-001',
    name: 'Estudiante Demo',
    email: 'student@edu.com',
    role: 'student',
    phone: '+34 600 123 003',
    isActive: true,
    createdAt: new Date('2024-01-05'),
    lastLogin: new Date(),
    grade: '10° Grado',
    parentIds: ['demo-parent-001', 'demo-parent-002'] // Ejemplo: estudiante con múltiples padres
  },
  {
    id: 'demo-student-002',
    name: 'María González',
    email: 'maria.gonzalez@edu.com',
    role: 'student',
    phone: '+34 600 123 007',
    isActive: true,
    createdAt: new Date('2024-01-06'),
    lastLogin: new Date(),
    grade: '11° Grado',
    parentIds: ['demo-parent-002'] // Ejemplo: estudiante con un padre
  },
  {
    id: 'demo-student-003',
    name: 'Pedro Sánchez',
    email: 'pedro.sanchez@edu.com',
    role: 'student',
    phone: '+34 600 123 009',
    isActive: true,
    createdAt: new Date('2024-01-09'),
    lastLogin: new Date(),
    grade: '9° Grado',
    parentIds: ['demo-parent-001'] // Ejemplo: estudiante con un padre
  },
  {
    id: 'demo-parent-001',
    name: 'Padre Demo',
    email: 'parent@edu.com',
    role: 'parent',
    phone: '+34 600 123 004',
    isActive: true,
    createdAt: new Date('2024-01-07'),
    lastLogin: new Date(),
    children: ['demo-student-001', 'demo-student-003'] // Ejemplo: padre con múltiples hijos
  },
  {
    id: 'demo-parent-002',
    name: 'Luis Fernández',
    email: 'luis.fernandez@edu.com',
    role: 'parent',
    phone: '+34 600 123 008',
    isActive: true,
    createdAt: new Date('2024-01-08'),
    lastLogin: new Date(),
    children: ['demo-student-001', 'demo-student-002'] // Ejemplo: padre con múltiples hijos
  }
];

interface UsersContextType {
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  getUsersByRole: (role: User['role']) => User[];
  searchUsers: (query: string) => User[];
  getStudentsByParent: (parentId: string) => User[];
  getParentsByStudent: (studentId: string) => User[];
  connectParentStudent: (parentId: string, studentId: string) => Promise<void>;
  disconnectParentStudent: (parentId: string, studentId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

// Role mapping between database enum and application
const DB_TO_APP_ROLE_MAP: Record<string, User['role']> = {
  'ADMIN': 'admin',
  'TEACHER': 'teacher',
  'STUDENT': 'student',
  'GUARDIAN': 'parent'
};

const APP_TO_DB_ROLE_MAP: Record<User['role'], string> = {
  'admin': 'ADMIN',
  'teacher': 'TEACHER',
  'student': 'STUDENT',
  'parent': 'GUARDIAN'
};

// Helper function to check if a user ID is a demo user
const isDemoUser = (id: string): boolean => {
  return id.startsWith('demo-');
};

// Helper function to convert database row to User type
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
  // Note: grade, subjects, children, and parentIds are not stored in the users table
  // They would need to be fetched from separate tables or managed differently
});

// Helper function to convert User type to database insert/update
// Only includes fields that exist in the actual database schema
const userToDbRow = (user: Omit<User, 'id' | 'createdAt'> | Partial<User>) => {
  const dbRow: any = {};
  
  if (user.name !== undefined) dbRow.name = user.name;
  if (user.email !== undefined) dbRow.email = user.email;
  if (user.role !== undefined) dbRow.role = APP_TO_DB_ROLE_MAP[user.role];
  if (user.phone !== undefined) dbRow.phone = user.phone || null;
  if (user.avatar !== undefined) dbRow.profile_image = user.avatar || null;
  if (user.isActive !== undefined) dbRow.status = user.isActive ? 'ACTIVE' : 'INACTIVE';
  
  // Exclude fields that don't exist in the database schema:
  // - grade, subjects, children, parentIds are not columns in the users table
  
  dbRow.updatedAt = new Date().toISOString();
  
  return dbRow;
};

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  // Load users from Supabase
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're using the mock client
      if ((supabase as any).isMock) {
        // Use demo data when in mock mode
        setUsers(DEMO_USERS);
        setLoading(false);
        return;
      }

      // Check if current user is admin
      if (!currentUser || currentUser.role !== 'admin') {
        // For demo purposes, if user is not admin, still show demo users
        setUsers(DEMO_USERS);
        setLoading(false);
        return;
      }

      try {
        const { data, error: supabaseError } = await supabase
          .from('users')
          .select('*')
          .order('createdAt', { ascending: false });

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          // Fall back to demo users if Supabase fails
          setUsers(DEMO_USERS);
          setLoading(false);
          return;
        }

        const formattedUsers = data?.map(dbRowToUser) || [];
        
        // Merge Supabase users with demo users, avoiding duplicates
        const allUsers = [...DEMO_USERS];
        formattedUsers.forEach(user => {
          if (!allUsers.find(demoUser => demoUser.email === user.email)) {
            allUsers.push(user);
          }
        });
        
        setUsers(allUsers);
      } catch (supabaseError) {
        console.error('Supabase connection error:', supabaseError);
        // Fall back to demo users if Supabase is unavailable
        setUsers(DEMO_USERS);
      }
    } catch (err: any) {
      console.error('Error loading users:', err);
      // Always fall back to demo users in case of any error
      setUsers(DEMO_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser]);

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      
      // Create new user with generated ID
      const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...userData,
        createdAt: new Date(),
        lastLogin: undefined
      };

      // Check if we're using the mock client or if it's a demo user
      if ((supabase as any).isMock || isDemoUser(newUser.id)) {
        // Skip Supabase operations in mock mode or for demo users, use local creation only
        setUsers(prev => [newUser, ...prev]);
        return;
      }

      // Check if current user is admin and try Supabase first
      if (currentUser && currentUser.role === 'admin') {
        try {
          const dbData = {
            ...userToDbRow(userData),
            id: newUser.id,
            createdAt: new Date().toISOString(),
          };
          
          const { data, error: supabaseError } = await supabase
            .from('users')
            .insert([dbData])
            .select()
            .single();

          if (supabaseError) {
            console.error('Supabase error:', supabaseError);
            if (supabaseError.code === '23505') {
              throw new Error('Ya existe un usuario con este email.');
            }
            // Fall back to local storage for demo
            console.log('Falling back to local user creation');
          } else {
            const supabaseUser = dbRowToUser(data);
            // Preserve additional fields from userData that aren't in the database
            const completeUser = {
              ...supabaseUser,
              grade: userData.grade,
              subjects: userData.subjects,
              children: userData.children,
              parentIds: userData.parentIds
            };
            setUsers(prev => [completeUser, ...prev]);
            return;
          }
        } catch (supabaseError) {
          console.error('Supabase connection error:', supabaseError);
          // Continue with local creation
        }
      }

      // Add user locally (for demo or fallback)
      setUsers(prev => [newUser, ...prev]);
    } catch (err: any) {
      console.error('Error adding user:', err);
      const errorMessage = err.message || 'Error al crear el usuario. Por favor, intenta de nuevo.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      setError(null);
      
      // Check if it's a demo user - skip Supabase operations for demo users
      if (isDemoUser(id)) {
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, ...userData } : user
        ));
        return;
      }

      // Check if we're using the mock client
      if ((supabase as any).isMock) {
        // Skip Supabase operations in mock mode, use local update only
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, ...userData } : user
        ));
        return;
      }

      // Try Supabase first if user is admin
      if (currentUser && currentUser.role === 'admin') {
        try {
          const dbData = userToDbRow(userData);
          
          const { data, error: supabaseError } = await supabase
            .from('users')
            .update(dbData)
            .eq('id', id)
            .select()
            .maybeSingle();

          if (supabaseError) {
            console.error('Supabase error:', supabaseError);
            if (supabaseError.code === '23505') {
              throw new Error('Ya existe un usuario con este email.');
            }
            // Fall back to local update
            console.log('Falling back to local user update');
          } else {
            if (data) {
              const updatedUser = dbRowToUser(data);
              // Preserve additional fields that aren't in the database
              const currentUser = users.find(u => u.id === id);
              const completeUser = {
                ...updatedUser,
                grade: userData.grade !== undefined ? userData.grade : currentUser?.grade,
                subjects: userData.subjects !== undefined ? userData.subjects : currentUser?.subjects,
                children: userData.children !== undefined ? userData.children : currentUser?.children,
                parentIds: userData.parentIds !== undefined ? userData.parentIds : currentUser?.parentIds
              };
              setUsers(prev => prev.map(user => user.id === id ? completeUser : user));
              return;
            } else {
              // User not found in database, fall back to local update
            }
          }
        } catch (supabaseError) {
          console.error('Supabase connection error:', supabaseError);
          // Continue with local update
        }
      }

      // Update user locally (for demo or fallback)
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...userData } : user
      ));
    } catch (err: any) {
      console.error('Error updating user:', err);
      const errorMessage = err.message || 'Error al actualizar el usuario. Por favor, intenta de nuevo.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setError(null);
      
      // Check if it's a demo user - skip Supabase operations for demo users
      if (isDemoUser(id)) {
        setUsers(prev => prev.filter(user => user.id !== id));
        return;
      }

      // Check if we're using the mock client
      if ((supabase as any).isMock) {
        // Skip Supabase operations in mock mode, use local deletion only
        setUsers(prev => prev.filter(user => user.id !== id));
        return;
      }

      // Try Supabase first if user is admin
      if (currentUser && currentUser.role === 'admin') {
        try {
          const { error: supabaseError } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

          if (supabaseError) {
            console.error('Supabase error:', supabaseError);
            // Fall back to local deletion
            console.log('Falling back to local user deletion');
          } else {
            setUsers(prev => prev.filter(user => user.id !== id));
            return;
          }
        } catch (supabaseError) {
          console.error('Supabase connection error:', supabaseError);
          // Continue with local deletion
        }
      }

      // Delete user locally (for demo or fallback)
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err: any) {
      console.error('Error deleting user:', err);
      const errorMessage = err.message || 'Error al eliminar el usuario. Por favor, intenta de nuevo.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const toggleUserStatus = async (id: string) => {
    try {
      setError(null);
      
      const user = users.find(u => u.id === id);
      if (!user) return;

      // Check if it's a demo user - skip Supabase operations for demo users
      if (isDemoUser(id)) {
        setUsers(prev => prev.map(u => 
          u.id === id ? { ...u, isActive: !u.isActive } : u
        ));
        return;
      }

      // Check if we're using the mock client
      if ((supabase as any).isMock) {
        // Skip Supabase operations in mock mode, use local toggle only
        setUsers(prev => prev.map(u => 
          u.id === id ? { ...u, isActive: !u.isActive } : u
        ));
        return;
      }

      // Try Supabase first if user is admin
      if (currentUser && currentUser.role === 'admin') {
        try {
          const { data, error: supabaseError } = await supabase
            .from('users')
            .update({ 
              status: user.isActive ? 'INACTIVE' : 'ACTIVE',
              updatedAt: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .maybeSingle();

          if (supabaseError) {
            console.error('Supabase error:', supabaseError);
            // Fall back to local toggle
            console.log('Falling back to local status toggle');
          } else {
            if (data) {
              const updatedUser = dbRowToUser(data);
              // Preserve additional fields that aren't in the database
              const currentUser = users.find(u => u.id === id);
              const completeUser = {
                ...updatedUser,
                grade: currentUser?.grade,
                subjects: currentUser?.subjects,
                children: currentUser?.children,
                parentIds: currentUser?.parentIds
              };
              setUsers(prev => prev.map(user => user.id === id ? completeUser : user));
              return;
            } else {
              // User not found in database, fall back to local toggle
            }
          }
        } catch (supabaseError) {
          console.error('Supabase connection error:', supabaseError);
          // Continue with local toggle
        }
      }

      // Toggle status locally (for demo or fallback)
      setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, isActive: !u.isActive } : u
      ));
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      const errorMessage = err.message || 'Error al cambiar el estado del usuario. Por favor, intenta de nuevo.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getUsersByRole = (role: User['role']) => {
    return users.filter(user => user.role === role);
  };

  const searchUsers = (query: string) => {
    if (!query.trim()) return users;
    
    const lowercaseQuery = query.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery) ||
      user.role.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getStudentsByParent = (parentId: string) => {
    const parent = users.find(u => u.id === parentId && u.role === 'parent');
    if (!parent || !parent.children) return [];
    
    return users.filter(user => 
      user.role === 'student' && parent.children!.includes(user.id)
    );
  };

  const getParentsByStudent = (studentId: string) => {
    const student = users.find(u => u.id === studentId && u.role === 'student');
    if (!student || !student.parentIds) return [];
    
    return users.filter(user => 
      user.role === 'parent' && student.parentIds!.includes(user.id)
    );
  };

  const connectParentStudent = async (parentId: string, studentId: string) => {
    try {
      setError(null);
      
      // For demo users or when Supabase is not available, handle locally
      if (isDemoUser(parentId) || isDemoUser(studentId) || (supabase as any).isMock) {
        // Update parent to include student in children array
        setUsers(prev => prev.map(user => {
          if (user.id === parentId && user.role === 'parent') {
            const updatedChildren = [...(user.children || [])];
            if (!updatedChildren.includes(studentId)) {
              updatedChildren.push(studentId);
            }
            return { ...user, children: updatedChildren };
          }
          if (user.id === studentId && user.role === 'student') {
            const updatedParentIds = [...(user.parentIds || [])];
            if (!updatedParentIds.includes(parentId)) {
              updatedParentIds.push(parentId);
            }
            return { ...user, parentIds: updatedParentIds };
          }
          return user;
        }));
        return;
      }

      // For real Supabase users, we would need to implement family_connections table operations
      // For now, fall back to local state management
      setUsers(prev => prev.map(user => {
        if (user.id === parentId && user.role === 'parent') {
          const updatedChildren = [...(user.children || [])];
          if (!updatedChildren.includes(studentId)) {
            updatedChildren.push(studentId);
          }
          return { ...user, children: updatedChildren };
        }
        if (user.id === studentId && user.role === 'student') {
          const updatedParentIds = [...(user.parentIds || [])];
          if (!updatedParentIds.includes(parentId)) {
            updatedParentIds.push(parentId);
          }
          return { ...user, parentIds: updatedParentIds };
        }
        return user;
      }));
      
    } catch (err: any) {
      console.error('Error connecting parent and student:', err);
      const errorMessage = err.message || 'Error al conectar padre y estudiante.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const disconnectParentStudent = async (parentId: string, studentId: string) => {
    try {
      setError(null);
      
      // For demo users or when Supabase is not available, handle locally
      if (isDemoUser(parentId) || isDemoUser(studentId) || (supabase as any).isMock) {
        // Update parent to remove student from children array
        setUsers(prev => prev.map(user => {
          if (user.id === parentId && user.role === 'parent') {
            const updatedChildren = (user.children || []).filter(id => id !== studentId);
            return { ...user, children: updatedChildren };
          }
          if (user.id === studentId && user.role === 'student') {
            const updatedParentIds = (user.parentIds || []).filter(id => id !== parentId);
            return { ...user, parentIds: updatedParentIds };
          }
          return user;
        }));
        return;
      }

      // For real Supabase users, we would need to implement family_connections table operations
      // For now, fall back to local state management
      setUsers(prev => prev.map(user => {
        if (user.id === parentId && user.role === 'parent') {
          const updatedChildren = (user.children || []).filter(id => id !== studentId);
          return { ...user, children: updatedChildren };
        }
        if (user.id === studentId && user.role === 'student') {
          const updatedParentIds = (user.parentIds || []).filter(id => id !== parentId);
          return { ...user, parentIds: updatedParentIds };
        }
        return user;
      }));
      
    } catch (err: any) {
      console.error('Error disconnecting parent and student:', err);
      const errorMessage = err.message || 'Error al desconectar padre y estudiante.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <UsersContext.Provider value={{
      users,
      addUser,
      updateUser,
      deleteUser,
      toggleUserStatus,
      getUsersByRole,
      searchUsers,
      getStudentsByParent,
      getParentsByStudent,
      connectParentStudent,
      disconnectParentStudent,
      loading,
      error
    }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers debe ser usado dentro de un UsersProvider');
  }
  return context;
}