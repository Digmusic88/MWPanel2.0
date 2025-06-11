import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, User, Calendar, FileText, Hash } from 'lucide-react';
import { AcademicGroup, EducationalLevel } from '../../types/groups';
import { useGroups } from '../../context/GroupsContext';
import { useUsers } from '../../context/UsersContext';

interface GroupFormProps {
  group?: AcademicGroup | null;
  mode: 'create' | 'edit';
  onSubmit: (groupData: Omit<AcademicGroup, 'id' | 'createdAt' | 'updatedAt' | 'currentCapacity'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface FormData {
  name: string;
  description: string;
  levelId: string;
  academicYear: string;
  maxCapacity: number;
  tutorId: string;
  isActive: boolean;
}

export default function GroupForm({ group, mode, onSubmit, onCancel, isSubmitting = false }: GroupFormProps) {
  const { levels } = useGroups();
  const { getUsersByRole } = useUsers();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    levelId: '',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    maxCapacity: 30,
    tutorId: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const teachers = getUsersByRole('teacher');

  useEffect(() => {
    if (group && mode === 'edit') {
      setFormData({
        name: group.name,
        description: group.description || '',
        levelId: group.level.id,
        academicYear: group.academicYear,
        maxCapacity: group.maxCapacity,
        tutorId: group.tutorId,
        isActive: group.isActive
      });
    }
  }, [group, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del grupo es obligatorio';
    }

    if (!formData.levelId) {
      newErrors.levelId = 'Debe seleccionar un nivel educativo';
    }

    if (!formData.academicYear.trim()) {
      newErrors.academicYear = 'El año académico es obligatorio';
    }

    if (formData.maxCapacity < 1 || formData.maxCapacity > 50) {
      newErrors.maxCapacity = 'La capacidad debe estar entre 1 y 50 estudiantes';
    }

    if (!formData.tutorId) {
      newErrors.tutorId = 'Debe asignar un tutor responsable';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const selectedLevel = levels.find(l => l.id === formData.levelId);
      const selectedTutor = teachers.find(t => t.id === formData.tutorId);
      
      if (!selectedLevel) {
        throw new Error('Nivel educativo no encontrado');
      }

      const groupData: Omit<AcademicGroup, 'id' | 'createdAt' | 'updatedAt' | 'currentCapacity'> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        level: selectedLevel,
        academicYear: formData.academicYear.trim(),
        maxCapacity: formData.maxCapacity,
        tutorId: formData.tutorId,
        tutorName: selectedTutor?.name,
        isActive: formData.isActive,
        students: group?.students || []
      };

      await onSubmit(groupData);
    } catch (error) {
      console.error('Error saving group:', error);
      setErrors({ general: 'Error al guardar el grupo. Por favor, intenta de nuevo.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error general */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {errors.general}
        </div>
      )}

      {/* Información básica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            Nombre del Grupo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: 10° Grado A"
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <GraduationCap className="w-4 h-4 inline mr-2" />
            Nivel Educativo *
          </label>
          <select
            value={formData.levelId}
            onChange={(e) => setFormData(prev => ({ ...prev, levelId: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
              errors.levelId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Seleccionar nivel</option>
            {levels.filter(level => level.isActive).map(level => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
          {errors.levelId && <p className="text-red-500 text-sm mt-1">{errors.levelId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Año Académico *
          </label>
          <input
            type="text"
            value={formData.academicYear}
            onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
              errors.academicYear ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="2024-2025"
            disabled={isSubmitting}
          />
          {errors.academicYear && <p className="text-red-500 text-sm mt-1">{errors.academicYear}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Hash className="w-4 h-4 inline mr-2" />
            Capacidad Máxima *
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={formData.maxCapacity}
            onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) || 0 }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
              errors.maxCapacity ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.maxCapacity && <p className="text-red-500 text-sm mt-1">{errors.maxCapacity}</p>}
        </div>
      </div>

      {/* Tutor responsable */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="w-4 h-4 inline mr-2" />
          Tutor Responsable *
        </label>
        <select
          value={formData.tutorId}
          onChange={(e) => setFormData(prev => ({ ...prev, tutorId: e.target.value }))}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
            errors.tutorId ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isSubmitting}
        >
          <option value="">Seleccionar tutor</option>
          {teachers.filter(teacher => teacher.isActive).map(teacher => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name} - {teacher.email}
            </option>
          ))}
        </select>
        {errors.tutorId && <p className="text-red-500 text-sm mt-1">{errors.tutorId}</p>}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          placeholder="Descripción opcional del grupo..."
          disabled={isSubmitting}
        />
      </div>

      {/* Estado activo */}
      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          disabled={isSubmitting}
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Grupo Activo
        </label>
        <span className="text-xs text-gray-500">
          Los grupos inactivos no aparecerán en las asignaciones
        </span>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium"
        >
          {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          <span>{isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Grupo' : 'Guardar Cambios'}</span>
        </button>
      </div>
    </form>
  );
}