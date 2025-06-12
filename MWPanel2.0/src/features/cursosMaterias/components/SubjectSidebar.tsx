import React from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
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
  // Obtener departamentos únicos
  const departments = ['all', ...new Set(subjects.map(s => s.department))].sort();

  // Filtrar materias
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = searchQuery
      ? subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesDepartment = departmentFilter === 'all' || subject.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  return (
    <>
      {/* Sidebar para pantallas grandes */}
      <div 
        className={`bg-white border-r border-gray-200 w-80 h-full overflow-y-auto flex-shrink-0 transition-all duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:block fixed lg:static top-0 left-0 z-20 h-full`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Materias</h2>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de departamento */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Filtrar por Departamento
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => onDepartmentFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los departamentos</option>
              {departments.filter(d => d !== 'all').map(department => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          {/* Lista de materias */}
          <div className="space-y-2">
            {filteredSubjects.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No se encontraron materias</p>
              </div>
            ) : (
              filteredSubjects.map(subject => (
                <button
                  key={subject.id}
                  onClick={() => onSubjectSelect(subject)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedSubject?.id === subject.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-md flex items-center justify-center text-white"
                      style={{ backgroundColor: subject.color }}
                    >
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{subject.name}</div>
                      <div className="text-xs text-gray-500">{subject.code}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Overlay para cerrar el sidebar en móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={onToggle}
        ></div>
      )}

      {/* Botón para abrir el sidebar en móvil */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 left-6 z-10 lg:hidden bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
