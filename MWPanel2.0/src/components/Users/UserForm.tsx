import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, UserCheck, GraduationCap, Users as UsersIcon, Home, Camera } from 'lucide-react';
import { User as UserType } from '../../types';
import { useUsers } from '../../context/UsersContext';
import { ImageService } from '../../services/imageService';
import ImageUpload from '../UI/ImageUpload';
import ParentStudentConnection from './ParentStudentConnection';

/**
 * Props para el componente UserForm
 */
interface UserFormProps {
  /** Usuario a editar (null para modo creación) */
  user?: UserType | null;
  /** Modo del formulario */
  mode: 'create' | 'edit';
  /** Callback cuando se envía el formulario */
  onSubmit: (userData: Omit<UserType, 'id' | 'createdAt'>) => Promise<void>;
  /** Callback cuando se cancela el formulario */
  onCancel: () => void;
  /** Estado de carga del formulario */
  isSubmitting?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Datos del formulario
 */
interface FormData {
  name: string;
  email: string;
  role: UserType['role'];
  phone: string;
  avatar: string;
  isActive: boolean;
  grade: string;
  subjects: string[];
  parentId: string;
}

/**
 * Opciones de roles disponibles
 */
const roleOptions = [
  { value: 'admin', label: 'Administrador', icon: UserCheck },
  { value: 'teacher', label: 'Profesor', icon: GraduationCap },
  { value: 'student', label: 'Estudiante', icon: User },
  { value: 'parent', label: 'Padre', icon: Home },
];

/**
 * Opciones de grados académicos
 */
const gradeOptions = [
  '1° Grado', '2° Grado', '3° Grado', '4° Grado', '5° Grado',
  '6° Grado', '7° Grado', '8° Grado', '9° Grado', '10° Grado',
  '11° Grado', '12° Grado'
];

/**
 * Opciones de materias para profesores
 */
const subjectOptions = [
  'Matemáticas', 'Física', 'Química', 'Biología', 'Historia',
  'Geografía', 'Literatura', 'Inglés', 'Educación Física', 'Arte'
];

/**
 * Componente reutilizable para formulario de usuario
 * Maneja tanto la creación como la edición de usuarios
 */
export default function UserForm({ 
  user, 
  mode, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  className = ''
}: UserFormProps) {
  const { getUsersByRole } = useUsers();
  
  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: 'student',
    phone: '',
    avatar: '',
    isActive: true,
    grade: '',
    subjects: [],
    parentId: ''
  });

  // Estado de errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estado de carga de imagen
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  /**
   * Inicializa el formulario con los datos del usuario (modo edición)
   * o con valores por defecto (modo creación)
   */
  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '',
        isActive: user.isActive,
        grade: user.grade || '',
        subjects: user.subjects || [],
        parentId: user.parentId || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'student',
        phone: '',
        avatar: '',
        isActive: true,
        grade: '',
        subjects: [],
        parentId: ''
      });
    }
    setErrors({});
  }, [user, mode]);

  /**
   * Maneja la subida de imagen de perfil
   */
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      setIsUploadingImage(true);
      const result = await ImageService.uploadImage(file, user?.id || 'new-user');
      return result.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  /**
   * Maneja el cambio de imagen de perfil
   */
  const handleImageChange = (imageUrl: string | null) => {
    setFormData(prev => ({ ...prev, avatar: imageUrl || '' }));
  };

  /**
   * Valida los campos del formulario
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validación de nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    // Validación de email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validación específica por rol
    if (formData.role === 'student' && !formData.grade) {
      newErrors.grade = 'El grupo base es obligatorio para estudiantes';
    }

    if (formData.role === 'teacher' && formData.subjects.length === 0) {
      newErrors.subjects = 'Debe seleccionar al menos una materia para profesores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Preparar datos del usuario
      const userData: Omit<UserType, 'id' | 'createdAt'> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        phone: formData.phone.trim() || undefined,
        avatar: formData.avatar || undefined,
        isActive: formData.isActive,
        grade: formData.role === 'student' ? formData.grade : undefined,
        subjects: formData.role === 'teacher' ? formData.subjects : undefined,
        parentId: formData.role === 'student' ? formData.parentId || undefined : undefined
      };

      await onSubmit(userData);
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors({ general: 'Error al guardar el usuario. Por favor, intenta de nuevo.' });
    }
  };

  /**
   * Maneja el cambio de materias para profesores
   */
  const handleSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.filter(s => s !== subject)
      }));
    }
  };

  const isLoading = isSubmitting || isUploadingImage;
  const parents = getUsersByRole('parent');

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Error general */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {errors.general}
        </div>
      )}

      {/* Sección de Imagen de Perfil */}
      <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Camera className="w-4 h-4 inline mr-2" />
              Imagen de Perfil
            </label>
            <ImageUpload
              currentImage={formData.avatar}
              onImageChange={handleImageChange}
              onImageUpload={handleImageUpload}
              disabled={isLoading}
              size="lg"
              userId={user?.id || 'new-user'}
              showRemoveButton={true}
            />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Foto de Perfil</h3>
            <p className="text-sm text-gray-600 mb-4">
              Sube una imagen para personalizar el perfil del usuario. 
              Se recomienda una imagen cuadrada de al menos 200x200 píxeles.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Formatos permitidos: JPG, PNG, WebP</p>
              <p>• Tamaño máximo: 2MB</p>
              <p>• Se redimensionará automáticamente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Información Básica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Nombre Completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ingrese el nombre completo"
            disabled={isLoading}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="usuario@ejemplo.com"
            disabled={isLoading}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            placeholder="+34 600 123 456"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UsersIcon className="w-4 h-4 inline mr-2" />
            Rol *
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserType['role'] }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            disabled={isLoading}
          >
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Campos específicos por rol */}
      {formData.role === 'student' && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-800 mb-2">
              <GraduationCap className="w-4 h-4 inline mr-2" />
              Grupo Base *
            </label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                errors.grade ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="">Seleccionar grupo base</option>
              {gradeOptions.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
          </div>

          {/* Selección de padre para estudiantes en modo creación */}
          {mode === 'create' && parents.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-green-800 mb-2">
                Padre/Tutor (Opcional)
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                disabled={isLoading}
              >
                <option value="">Sin padre asignado</option>
                {parents.map(parent => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name} - {parent.email}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {formData.role === 'teacher' && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <label className="block text-sm font-medium text-blue-800 mb-3">
            Materias que Imparte *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto border border-blue-200 rounded-lg p-3 bg-white">
            {subjectOptions.map(subject => (
              <label key={subject} className="flex items-center space-x-2 p-2 hover:bg-blue-50 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={formData.subjects.includes(subject)}
                  onChange={(e) => handleSubjectChange(subject, e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  disabled={isLoading}
                />
                <span className="text-sm">{subject}</span>
              </label>
            ))}
          </div>
          {errors.subjects && <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>}
        </div>
      )}

      {formData.role === 'parent' && (
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-medium text-purple-800 mb-2">Información de Padre/Tutor</h4>
          <p className="text-sm text-purple-700 mb-4">
            Los padres pueden gestionar la información de sus hijos a través del sistema.
            Las conexiones con estudiantes se pueden configurar después de crear el usuario.
          </p>
        </div>
      )}

      {/* Gestión de conexiones para usuarios existentes */}
      {mode === 'edit' && user && (user.role === 'parent' || user.role === 'student') && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3">Gestión de Conexiones Familiares</h4>
          <ParentStudentConnection user={user} />
        </div>
      )}

      {/* Estado Activo */}
      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          disabled={isLoading}
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Usuario Activo
        </label>
        <span className="text-xs text-gray-500">
          Los usuarios inactivos no podrán acceder al sistema
        </span>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium"
        >
          {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          <span>{isLoading ? 'Guardando...' : mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}</span>
        </button>
      </div>
    </form>
  );
}
