import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { User as UserType } from '../../types';
import UserForm from './UserForm';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<UserType, 'id' | 'createdAt'>) => void;
  user?: UserType | null;
  mode: 'create' | 'edit';
}

export default function UserModal({ isOpen, onClose, onSave, user, mode }: UserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Maneja el envío del formulario
   */
  const handleFormSubmit = async (userData: Omit<UserType, 'id' | 'createdAt'>) => {
    setIsSubmitting(true);
    try {
      await onSave(userData);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      throw error; // Re-throw para que UserForm pueda manejar el error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <UserForm
            user={user}
            mode={mode}
            onSubmit={handleFormSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
