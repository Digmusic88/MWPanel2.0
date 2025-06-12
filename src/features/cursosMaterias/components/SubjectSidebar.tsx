import React, { useState } from 'react';
import { Search, BookOpen, Users, ChevronDown, ChevronRight, Filter, X } from 'lucide-react';
import { Subject } from '../../../types/subjects';

interface SubjectSidebarProps {
  subjects: Subject[];
  selectedSubject: Subject | null;
  onSubjectSelect: (subject: Subject) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (department: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function SubjectSidebar({
  subjects,
  selectedSubject,
  onSubjectSelect,
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentFilterChange,
  isOpen,
  onToggle
}: SubjectSidebarProps) {
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());

  // Agrupar materias por departamento
  const subjectsByDepartment = subjects.reduce((acc, subject) => {
    if (!acc[subject.department]) {
      acc[subject.department] = [];
    }
    acc[subject.department].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  // Obtener departamentos únicos
  const departments = Object.keys(subjectsByDepartment).sort();

  const toggleDepartment = (department: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(department)) {
      newExpanded.delete(department);
    } else {
      newExpanded.add(department);
    }
    setExpandedDepartments(newExpanded);
  };

  const getSubjectEnrollmentCount = (subject: Subject) => {
    return subject.levels.reduce((sum, level) => sum + level.currentStudents, 0);
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      'Ciencias Exactas': 'text-blue-600',
      'Humanidades': 'text-purple-600',
      'Ciencias Sociales': 'text-green-600',
      'Artes': 'text-pink-600',
      'Educación Física': 'text-orange-600'
    };
    return colors[department] || 'text-gray-600';
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = !searchQuery || 
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || subject.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Materias</h2>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Búsqueda */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar materias..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filtro por departamento */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={departmentFilter}
              onChange={(e) => onDepartmentFilterChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Todos los departamentos</option>
              {departments.map(department => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de materias */}
        <div className="flex-1 overflow-y-auto">
          {filteredSubjects.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No se encontraron materias</p>
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : departmentFilter === 'all' ? (
            // Vista agrupada por departamento
            <div className="p-2">
              {departments.map(department => {
                const departmentSubjects = subjectsByDepartment[department].filter(subject => 
                  !searchQuery || 
                  subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  subject.description.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (departmentSubjects.length === 0) return null;

                const isExpanded = expandedDepartments.has(department);
                const totalEnrollments = departmentSubjects.reduce((sum, subject) => 
                  sum + getSubjectEnrollmentCount(subject), 0
                );

                return (
                  <div key={department} className="mb-2">
                    {/* Header del departamento */}
                    <button
                      onClick={() => toggleDepartment(department)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`font-medium text-sm ${getDepartmentColor(department)}`}>
                          {department}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({departmentSubjects.length})
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{totalEnrollments}</span>
                      </div>
                    </button>

                    {/* Materias del departamento */}
                    {isExpanded && (
                      <div className="ml-4 space-y-1">
                        {departmentSubjects.map(subject => {
                          const enrollmentCount = getSubjectEnrollmentCount(subject);
                          const isSelected = selectedSubject?.id === subject.id;

                          return (
                            <button
                              key={subject.id}
                              onClick={() => onSubjectSelect(subject)}
                              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                                isSelected
                                  ? 'bg-blue-100 border-l-4 border-blue-500 shadow-sm'
                                  : 'hover:bg-gray-50 border-l-4 border-transparent'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: subject.color }}
                                  ></div>
                                  <div>
                                    <div className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                      {subject.name}
                                    </div>
                                    <div className="text-xs text-gray-500">{subject.code}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <Users className="w-3 h-3" />
                                  <span>{enrollmentCount}</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // Vista simple cuando hay filtro de departamento
            <div className="p-2 space-y-1">
              {filteredSubjects.map(subject => {
                const enrollmentCount = getSubjectEnrollmentCount(subject);
                const isSelected = selectedSubject?.id === subject.id;

                return (
                  <button
                    key={subject.id}
                    onClick={() => onSubjectSelect(subject)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-100 border-l-4 border-blue-500 shadow-sm'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        ></div>
                        <div>
                          <div className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                            {subject.name}
                          </div>
                          <div className="text-xs text-gray-500">{subject.code}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{enrollmentCount}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer con estadísticas */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Total materias:</span>
              <span className="font-medium">{subjects.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Activas:</span>
              <span className="font-medium text-green-600">
                {subjects.filter(s => s.isActive).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total inscripciones:</span>
              <span className="font-medium text-blue-600">
                {subjects.reduce((sum, subject) => sum + getSubjectEnrollmentCount(subject), 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}