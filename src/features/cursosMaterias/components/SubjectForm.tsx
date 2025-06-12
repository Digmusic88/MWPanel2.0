import React, { useState, useEffect } from 'react';
import { BookOpen, Hash, Building, CreditCard, Palette, FileText, Plus, Trash2, Clock, MapPin, User } from 'lucide-react';
import { Subject, SubjectLevel, SubjectGroup, ClassSchedule } from '../../../types/subjects';
import { useUsers } from '../../../context/UsersContext';

interface SubjectFormProps {
  subject?: Subject | null;
  mode: 'create' | 'edit';
  onSubmit: (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface FormData {
  name: string;
  description: string;
  code: string;
  department: string;
  credits: number;
  color: string;
  isActive: boolean;
  levels: SubjectLevel[];
  groups: SubjectGroup[];
}

const DEPARTMENTS = [
  'Ciencias Exactas',
  'Humanidades',
  'Ciencias Sociales',
  'Artes',
  'Educación Física',
  'Idiomas',
  'Tecnología'
];

const COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
];

export default function SubjectForm({ subject, mode, onSubmit, onCancel, isSubmitting = false }: SubjectFormProps) {
  const { getUsersByRole } = useUsers();
  const teachers = getUsersByRole('teacher');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    code: '',
    department: DEPARTMENTS[0],
    credits: 3,
    color: COLORS[0],
    isActive: true,
    levels: [],
    groups: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (subject && mode === 'edit') {
      setFormData({
        name: subject.name,
        description: subject.description,
        code: subject.code,
        department: subject.department,
        credits: subject.credits,
        color: subject.color,
        isActive: subject.isActive,
        levels: subject.levels,
        groups: subject.groups
      });
    }
  }, [subject, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El código es obligatorio';
    }

    if (formData.credits < 1 || formData.credits > 10) {
      newErrors.credits = 'Los créditos deben estar entre 1 y 10';
    }

    if (formData.levels.length === 0) {
      newErrors.levels = 'Debe agregar al menos un nivel';
    }

    // Validar que cada nivel tenga al menos un grupo
    formData.levels.forEach((level, index) => {
      const levelGroups = formData.groups.filter(g => g.levelId === level.id);
      if (levelGroups.length === 0) {
        newErrors[`level_${index}`] = `El nivel "${level.name}" debe tener al menos un grupo`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error saving subject:', error);
      setErrors({ general: 'Error al guardar la materia. Por favor, intenta de nuevo.' });
    }
  };

  // Gestión de niveles
  const addLevel = () => {
    const newLevel: SubjectLevel = {
      id: `level-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      description: '',
      order: formData.levels.length + 1,
      requirements: [],
      maxStudents: 30,
      currentStudents: 0
    };
    setFormData(prev => ({ ...prev, levels: [...prev.levels, newLevel] }));
  };

  const updateLevel = (index: number, field: keyof SubjectLevel, value: any) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.map((level, i) => 
        i === index ? { ...level, [field]: value } : level
      )
    }));
  };

  const removeLevel = (index: number) => {
    const levelId = formData.levels[index].id;
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.filter((_, i) => i !== index),
      groups: prev.groups.filter(group => group.levelId !== levelId)
    }));
  };

  // Gestión de grupos
  const addGroup = (levelId: string) => {
    const newGroup: SubjectGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      levelId,
      teacherId: '',
      teacherName: '',
      schedule: [],
      maxStudents: 25,
      currentStudents: 0,
      students: []
    };
    setFormData(prev => ({ ...prev, groups: [...prev.groups, newGroup] }));
  };

  const updateGroup = (index: number, field: keyof SubjectGroup, value: any) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((group, i) => {
        if (i === index) {
          const updatedGroup = { ...group, [field]: value };
          if (field === 'teacherId') {
            const teacher = teachers.find(t => t.id === value);
            updatedGroup.teacherName = teacher?.name || '';
          }
          return updatedGroup;
        }
        return group;
      })
    }));
  };

  const removeGroup = (index: number) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index)
    }));
  };

  // Gestión de horarios
  const addSchedule = (groupIndex: number) => {
    const newSchedule: ClassSchedule = {
      id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:30',
      classroom: ''
    };
    
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((group, i) => 
        i === groupIndex 
          ? { ...group, schedule: [...group.schedule, newSchedule] }
          : group
      )
    }));
  };

  const updateSchedule = (groupIndex: number, scheduleIndex: number, field: keyof ClassSchedule, value: any) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((group, i) => 
        i === groupIndex 
          ? {
              ...group,
              schedule: group.schedule.map((schedule, j) => 
                j === scheduleIndex ? { ...schedule, [field]: value } : schedule
              )
            }
          : group
      )
    }));
  };

  const removeSchedule = (groupIndex: number, scheduleIndex: number) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((group, i) => 
        i === groupIndex 
          ? { ...group, schedule: group.schedule.filter((_, j) => j !== scheduleIndex) }
          : group
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Crear Nueva Materia' : 'Editar Materia'}
          </h2>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
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
                <BookOpen className="w-4 h-4 inline mr-2" />
                Nombre de la Materia *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Matemáticas Avanzadas"
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-2" />
                Código de la Materia *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: MAT101"
                disabled={isSubmitting}
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Departamento
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isSubmitting}
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Créditos Académicos *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.credits}
                onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.credits ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.credits && <p className="text-red-500 text-sm mt-1">{errors.credits}</p>}
            </div>
          </div>

          {/* Descripción y color */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Descripción de la materia..."
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="w-4 h-4 inline mr-2" />
                Color Identificativo
              </label>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Niveles */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Niveles de la Materia</h3>
              <button
                type="button"
                onClick={addLevel}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isSubmitting}
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Nivel</span>
              </button>
            </div>

            {errors.levels && <p className="text-red-500 text-sm mb-4">{errors.levels}</p>}

            <div className="space-y-6">
              {formData.levels.map((level, levelIndex) => (
                <div key={level.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Nivel {levelIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeLevel(levelIndex)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={isSubmitting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {errors[`level_${levelIndex}`] && (
                    <p className="text-red-500 text-sm mb-4">{errors[`level_${levelIndex}`]}</p>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Nivel</label>
                      <input
                        type="text"
                        value={level.name}
                        onChange={(e) => updateLevel(levelIndex, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Básico, Intermedio, Avanzado"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad Máxima</label>
                      <input
                        type="number"
                        min="1"
                        value={level.maxStudents}
                        onChange={(e) => updateLevel(levelIndex, 'maxStudents', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => addGroup(level.id)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                        disabled={isSubmitting}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Agregar Grupo</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                      value={level.description}
                      onChange={(e) => updateLevel(levelIndex, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descripción del nivel..."
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Grupos del nivel */}
                  <div className="mt-6">
                    <h5 className="font-medium text-gray-900 mb-3">Grupos del Nivel</h5>
                    <div className="space-y-4">
                      {formData.groups
                        .filter(group => group.levelId === level.id)
                        .map((group, groupIndex) => {
                          const actualGroupIndex = formData.groups.findIndex(g => g.id === group.id);
                          return (
                            <div key={group.id} className="border border-gray-300 rounded-lg p-4 bg-white">
                              <div className="flex items-center justify-between mb-4">
                                <h6 className="font-medium text-gray-800">Grupo {groupIndex + 1}</h6>
                                <button
                                  type="button"
                                  onClick={() => removeGroup(actualGroupIndex)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  disabled={isSubmitting}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Grupo</label>
                                  <input
                                    type="text"
                                    value={group.name}
                                    onChange={(e) => updateGroup(actualGroupIndex, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: Grupo A, Grupo B"
                                    disabled={isSubmitting}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Profesor</label>
                                  <select
                                    value={group.teacherId}
                                    onChange={(e) => updateGroup(actualGroupIndex, 'teacherId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isSubmitting}
                                  >
                                    <option value="">Seleccionar profesor</option>
                                    {teachers.filter(t => t.isActive).map(teacher => (
                                      <option key={teacher.id} value={teacher.id}>
                                        {teacher.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={group.maxStudents}
                                    onChange={(e) => updateGroup(actualGroupIndex, 'maxStudents', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isSubmitting}
                                  />
                                </div>
                              </div>

                              {/* Horarios */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-sm font-medium text-gray-700">Horarios</label>
                                  <button
                                    type="button"
                                    onClick={() => addSchedule(actualGroupIndex)}
                                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                    disabled={isSubmitting}
                                  >
                                    + Horario
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {group.schedule.map((schedule, scheduleIndex) => (
                                    <div key={schedule.id} className="flex items-center space-x-2">
                                      <select
                                        value={schedule.dayOfWeek}
                                        onChange={(e) => updateSchedule(actualGroupIndex, scheduleIndex, 'dayOfWeek', parseInt(e.target.value))}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                                        disabled={isSubmitting}
                                      >
                                        {DAYS_OF_WEEK.map(day => (
                                          <option key={day.value} value={day.value}>{day.label}</option>
                                        ))}
                                      </select>

                                      <input
                                        type="time"
                                        value={schedule.startTime}
                                        onChange={(e) => updateSchedule(actualGroupIndex, scheduleIndex, 'startTime', e.target.value)}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                                        disabled={isSubmitting}
                                      />

                                      <span className="text-gray-500">-</span>

                                      <input
                                        type="time"
                                        value={schedule.endTime}
                                        onChange={(e) => updateSchedule(actualGroupIndex, scheduleIndex, 'endTime', e.target.value)}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                                        disabled={isSubmitting}
                                      />

                                      <input
                                        type="text"
                                        value={schedule.classroom}
                                        onChange={(e) => updateSchedule(actualGroupIndex, scheduleIndex, 'classroom', e.target.value)}
                                        placeholder="Aula"
                                        className="px-2 py-1 border border-gray-300 rounded text-sm flex-1"
                                        disabled={isSubmitting}
                                      />

                                      <button
                                        type="button"
                                        onClick={() => removeSchedule(actualGroupIndex, scheduleIndex)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        disabled={isSubmitting}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estado activo */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              disabled={isSubmitting}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Materia Activa
            </label>
            <span className="text-xs text-gray-500">
              Las materias inactivas no aparecerán en las inscripciones
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
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              <span>{isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Materia' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}