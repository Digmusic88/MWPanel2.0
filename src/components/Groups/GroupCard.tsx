import React from 'react';
import { Users, User, GraduationCap, Calendar, Edit, Trash2, UserPlus, BarChart3, Archive, ArchiveRestore } from 'lucide-react';
import { AcademicGroup } from '../../types/groups';

interface GroupCardProps {
  group: AcademicGroup;
  onEdit: (group: AcademicGroup) => void;
  onDelete: (id: string) => void;
  onViewStudents: (group: AcademicGroup) => void;
  onViewReports: (group: AcademicGroup) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
}

export default function GroupCard({ 
  group, 
  onEdit, 
  onDelete, 
  onViewStudents, 
  onViewReports,
  onArchive,
  onUnarchive 
}: GroupCardProps) {
  const capacityPercentage = (group.currentCapacity / group.maxCapacity) * 100;
  
  const getCapacityColor = () => {
    if (capacityPercentage >= 90) return 'text-red-600 bg-red-50';
    if (capacityPercentage >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getLevelColor = (order: number) => {
    const colors = [
      'bg-pink-100 text-pink-800',    // Infantil
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800'
    ];
    return colors[order % colors.length] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] overflow-hidden ${
      group.isArchived ? 'opacity-75 border-gray-300' : ''
    }`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center">
              {group.name}
              {group.isArchived && (
                <Archive className="w-4 h-4 ml-2 text-gray-400" />
              )}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(group.level.order)}`}>
              <GraduationCap className="w-3 h-3 mr-1" />
              {group.level.name}
            </span>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${group.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {group.isArchived ? 'Archivado' : 
             group.isActive ? 'Activo' : 'Inactivo'}
          </div>
        </div>

        {group.description && (
          <p className="text-sm text-gray-600 mb-4">{group.description}</p>
        )}
      </div>

      {/* Información principal */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Capacidad */}
          <div className={`p-3 rounded-lg border ${getCapacityColor()}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Capacidad</span>
              <span className="text-sm font-bold">
                {group.currentCapacity}/{group.maxCapacity}
              </span>
            </div>
            <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
              <div 
                className="bg-current h-2 rounded-full transition-all duration-300"
                style={{ width: `${capacityPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Tutor */}
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-3 text-gray-400" />
            <div>
              <span className="font-medium">Tutor:</span>
              <span className="ml-1">{group.tutorName || 'No asignado'}</span>
            </div>
          </div>

          {/* Año académico */}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
            <div>
              <span className="font-medium">Año académico:</span>
              <span className="ml-1">{group.academicYear}</span>
            </div>
          </div>

          {/* Fecha de creación */}
          <div className="text-xs text-gray-500">
            Creado: {group.createdAt.toLocaleDateString('es-ES')}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          {!group.isArchived ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onViewStudents(group)}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                title="Ver estudiantes"
              >
                <Users className="w-4 h-4" />
                <span>Estudiantes</span>
              </button>
              
              <button
                onClick={() => onViewReports(group)}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                title="Ver reportes"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Reportes</span>
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Grupo archivado
            </div>
          )}

          <div className="flex space-x-2">
            {!group.isArchived ? (
              <>
                <button
                  onClick={() => onEdit(group)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                  title="Editar grupo"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {onArchive && (
                  <button
                    onClick={() => onArchive(group.id)}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    title="Archivar grupo"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(group.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                  title="Eliminar grupo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              onUnarchive && (
                <button
                  onClick={() => onUnarchive(group.id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                  title="Desarchivar grupo"
                >
                  <ArchiveRestore className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}