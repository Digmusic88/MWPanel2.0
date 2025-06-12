import React from 'react';
import { User } from '../../types';

interface RoleChipsProps {
  users: User[];
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

const roleLabels = {
  all: 'Todos',
  admin: 'Administradores',
  teacher: 'Profesores',
  student: 'Estudiantes',
  parent: 'Padres'
};

export default function RoleChips({ users, selectedRole, onRoleChange }: RoleChipsProps) {
  const getRoleCount = (role: string) => {
    if (role === 'all') return users.length;
    return users.filter(user => user.role === role).length;
  };

  const roles = ['all', 'admin', 'teacher', 'student', 'parent'] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((role) => {
        const count = getRoleCount(role);
        const isSelected = selectedRole === role;
        
        return (
          <button
            key={role}
            onClick={() => onRoleChange(role)}
            className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all ${
              isSelected
                ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            {roleLabels[role]} ({count})
          </button>
        );
      })}
    </div>
  );
}
