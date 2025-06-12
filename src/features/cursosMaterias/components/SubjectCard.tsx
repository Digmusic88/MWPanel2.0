import React from 'react';
import { BookOpen, Users, GraduationCap, Clock, Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { Subject } from '../../../types/subjects';

interface SubjectCardProps {
  subject: Subject;
  enrollmentCount: number;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
  onViewDetails: (subject: Subject) => void;
  onManageStudents: (subject: Subject) => void;
}

export default function SubjectCard({ 
  subject, 
  enrollmentCount, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  onManageStudents 
}: SubjectCardProps) {
  const totalCapacity = subject.levels.reduce((sum, level) => sum + level.maxStudents, 0);
  const currentEnrollments = subject.levels.reduce((sum, level) => sum + level.currentStudents, 0);
  const capacityPercentage = totalCapacity > 0 ? (currentEnrollments / totalCapacity) * 100 : 0;

  const getCapacityColor = () => {
    if (capacityPercentage >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (capacityPercentage >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      'Ciencias Exactas': 'bg-blue-100 text-blue-800',
      'Humanidades': 'bg-purple-100 text-purple-800',
      'Ciencias Sociales': 'bg-green-100 text-green-800',
      'Artes': 'bg-pink-100 text-pink-800',
      'Educación Física': 'bg-orange-100 text-orange-800'
    };
    return colors[department] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] overflow-hidden">
      {/* Header con color de la materia */}
      <div 
        className="h-2"
        style={{ backgroundColor: subject.color }}
      ></div>
      
      <div className="p-6">
        {/* Información principal */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: subject.color }}
              >
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{subject.name}</h3>
                <p className="text-sm text-gray-500">{subject.code}</p>
              </div>
            </div>
            
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDepartmentColor(subject.department)}`}>
              <GraduationCap className="w-3 h-3 mr-1" />
              {subject.department}
            </span>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${subject.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {subject.isActive ? 'Activa' : 'Inactiva'}
          </div>
        </div>

        {/* Descripción */}
        {subject.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{subject.description}</p>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Inscripciones */}
          <div className={`p-3 rounded-lg border ${getCapacityColor()}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Inscripciones</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold">{currentEnrollments}/{totalCapacity}</div>
            <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mt-2">
              <div 
                className="bg-current h-2 rounded-full transition-all duration-300"
                style={{ width: `${capacityPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Niveles */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Niveles</span>
              <GraduationCap className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-blue-800">{subject.levels.length}</div>
            <div className="text-xs text-blue-600 mt-1">
              {subject.groups.length} grupos
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {subject.credits} créditos
            </span>
          </div>
          <span>
            Creada: {subject.createdAt.toLocaleDateString('es-ES')}
          </span>
        </div>

        {/* Niveles disponibles */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Niveles disponibles:</h4>
          <div className="flex flex-wrap gap-2">
            {subject.levels.map((level) => (
              <span 
                key={level.id}
                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {level.name}
                <span className="ml-1 text-gray-500">({level.currentStudents}/{level.maxStudents})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => onViewDetails(subject)}
              className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
              <span>Detalles</span>
            </button>
            
            <button
              onClick={() => onManageStudents(subject)}
              className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              title="Gestionar estudiantes"
            >
              <UserPlus className="w-4 h-4" />
              <span>Estudiantes</span>
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(subject)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
              title="Editar materia"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(subject.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
              title="Eliminar materia"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
