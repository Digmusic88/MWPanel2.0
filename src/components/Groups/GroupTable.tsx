import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Edit, Trash2, Users, BarChart3, Archive, ArchiveRestore, Calendar, User, GraduationCap } from 'lucide-react';
import { AcademicGroup } from '../../types/groups';

interface GroupTableProps {
  groups: AcademicGroup[];
  onEdit: (group: AcademicGroup) => void;
  onDelete: (id: string) => void;
  onViewStudents: (group: AcademicGroup) => void;
  onViewReports: (group: AcademicGroup) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  showArchived?: boolean;
}

type SortField = 'name' | 'level' | 'academicYear' | 'currentCapacity' | 'maxCapacity' | 'tutorName' | 'createdAt' | 'isActive';
type SortDirection = 'asc' | 'desc';

export default function GroupTable({ 
  groups, 
  onEdit, 
  onDelete, 
  onViewStudents, 
  onViewReports,
  onArchive,
  onUnarchive,
  showArchived = false
}: GroupTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedGroups = [...groups].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'level') {
      aValue = a.level.name;
      bValue = b.level.name;
    } else if (sortField === 'createdAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getLevelColor = (order: number) => {
    const colors = [
      'bg-pink-100 text-pink-800',    // Infantil
      'bg-blue-100 text-blue-800',    // Primaria
      'bg-green-100 text-green-800',  // Secundaria
      'bg-purple-100 text-purple-800', // Bachillerato
      'bg-orange-100 text-orange-800'  // Otros
    ];
    return colors[order] || 'bg-gray-100 text-gray-800';
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-900 hover:text-emerald-600 transition-colors group"
    >
      <span>{children}</span>
      <div className="flex flex-col">
        <ChevronUp className={`w-3 h-3 transition-colors ${
          sortField === field && sortDirection === 'asc' ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'
        }`} />
        <ChevronDown className={`w-3 h-3 -mt-1 transition-colors ${
          sortField === field && sortDirection === 'desc' ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'
        }`} />
      </div>
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="name">Grupo</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="level">Nivel</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="academicYear">Año Académico</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="currentCapacity">Capacidad</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="tutorName">Tutor</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="isActive">Estado</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="createdAt">Creado</SortButton>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedGroups.map((group) => (
              <tr key={group.id} className={`hover:bg-gray-50 transition-colors ${group.isArchived ? 'opacity-75' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {group.name}
                        {group.isArchived && (
                          <Archive className="w-4 h-4 ml-2 text-gray-400" />
                        )}
                      </div>
                      {group.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{group.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(group.level.order)}`}>
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {group.level.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {group.academicYear}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCapacityColor(group.currentCapacity, group.maxCapacity)}`}>
                    <Users className="w-4 h-4 mr-1" />
                    {group.currentCapacity}/{group.maxCapacity}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div 
                      className="bg-current h-1 rounded-full transition-all duration-300"
                      style={{ width: `${(group.currentCapacity / group.maxCapacity) * 100}%` }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate max-w-xs">{group.tutorName || 'No asignado'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      group.isArchived ? 'bg-gray-500' : 
                      group.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      group.isArchived ? 'text-gray-600' :
                      group.isActive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {group.isArchived ? 'Archivado' : group.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {group.createdAt.toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {!group.isArchived && (
                      <>
                        <button
                          onClick={() => onViewStudents(group)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="Ver estudiantes"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onViewReports(group)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="Ver reportes"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(group)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 transform hover:scale-110"
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
                    )}
                    {group.isArchived && onUnarchive && (
                      <button
                        onClick={() => onUnarchive(group.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Desarchivar grupo"
                      >
                        <ArchiveRestore className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}