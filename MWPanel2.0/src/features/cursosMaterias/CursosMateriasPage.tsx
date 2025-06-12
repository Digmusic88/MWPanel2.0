import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, BookOpen, Users, BarChart3, Download, Menu, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useSubjects } from '../../context/SubjectsContext';
import { Subject } from '../../types/subjects';
import SubjectCard from './components/SubjectCard';
import SubjectSidebar from './components/SubjectSidebar';
import SubjectForm from './components/SubjectForm';
import StudentEnrollmentPanel from './components/StudentEnrollmentPanel';

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function CursosMateriasPage() {
  const {
    subjects,
    enrollments,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubjectStats,
    searchSubjects,
    filterSubjectsByDepartment,
    loading,
    error
  } = useSubjects();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEnrollmentPanelOpen, setIsEnrollmentPanelOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const handleCreateSubject = () => {
    setFormMode('create');
    setSelectedSubject(null);
    setIsFormOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setFormMode('edit');
    setSelectedSubject(subject);
    setIsFormOpen(true);
  };

  const handleSaveSubject = async (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (formMode === 'create') {
        await addSubject(subjectData);
        showNotification('success', 'Materia creada exitosamente');
      } else if (selectedSubject) {
        await updateSubject(selectedSubject.id, subjectData);
        showNotification('success', 'Materia actualizada exitosamente');
      }
      setIsFormOpen(false);
    } catch (error: any) {
      console.error('Error saving subject:', error);
      showNotification('error', error.message || 'Error al guardar la materia');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    const subject = subjects.find(s => s.id === id);
    if (!subject) return;

    if (window.confirm(`¿Estás seguro de que quieres eliminar la materia "${subject.name}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteSubject(id);
        showNotification('success', 'Materia eliminada exitosamente');
      } catch (error: any) {
        console.error('Error deleting subject:', error);
        showNotification('error', error.message || 'Error al eliminar la materia');
      }
    }
  };

  const handleViewDetails = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsSidebarOpen(true);
  };

  const handleManageStudents = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsEnrollmentPanelOpen(true);
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  // Filtrar materias
  const getFilteredSubjects = () => {
    let filtered = searchQuery ? searchSubjects(searchQuery) : subjects;
    
    if (departmentFilter !== 'all') {
      filtered = filterSubjectsByDepartment(departmentFilter);
      if (searchQuery) {
        filtered = filtered.filter(subject =>
          subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }
    
    return filtered;
  };

  const filteredSubjects = getFilteredSubjects();

  // Estadísticas
  const stats = getSubjectStats();

  // Obtener departamentos únicos
  const departments = [...new Set(subjects.map(s => s.department))].sort();

  const exportSubjects = () => {
    const csvContent = [
      ['Nombre', 'Código', 'Departamento', 'Créditos', 'Niveles', 'Grupos', 'Estudiantes', 'Estado'],
      ...filteredSubjects.map(subject => {
        const enrollmentCount = subject.levels.reduce((sum, level) => sum + level.currentStudents, 0);
        return [
          `"${subject.name}"`,
          `"${subject.code}"`,
          `"${subject.department}"`,
          subject.credits.toString(),
          subject.levels.length.toString(),
          subject.groups.length.toString(),
          enrollmentCount.toString(),
          subject.isActive ? 'Activa' : 'Inactiva'
        ];
      })
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `materias_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('success', 'Archivo CSV exportado exitosamente');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando materias...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50 relative">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`rounded-lg shadow-lg p-4 flex items-start gap-3 ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' :
            notification.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex-shrink-0">
              {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
              {notification.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' :
                notification.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={dismissNotification}
              className={`flex-shrink-0 ${
                notification.type === 'success' ? 'text-green-600 hover:text-green-800' :
                notification.type === 'error' ? 'text-red-600 hover:text-red-800' :
                'text-blue-600 hover:text-blue-800'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <SubjectSidebar
        subjects={subjects}
        selectedSubject={selectedSubject}
        onSubjectSelect={handleSubjectSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cursos y Materias</h1>
                <p className="text-gray-600">Gestiona las materias académicas del sistema</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={exportSubjects}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
              
              <button
                onClick={handleCreateSubject}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Materia</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Materias</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Materias Activas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeSubjects}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inscripciones</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Promedio por Materia</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageEnrollmentPerSubject)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar materias..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>
          </div>

          {/* Subjects Grid */}
          {filteredSubjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay materias disponibles</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || departmentFilter !== 'all'
                  ? 'No se encontraron materias que coincidan con los filtros aplicados.'
                  : 'Comienza creando tu primera materia académica.'
                }
              </p>
              {!searchQuery && departmentFilter === 'all' && (
                <button
                  onClick={handleCreateSubject}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  Crear Primera Materia
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.map(subject => {
                const enrollmentCount = subject.levels.reduce((sum, level) => sum + level.currentStudents, 0);
                return (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    enrollmentCount={enrollmentCount}
                    onEdit={handleEditSubject}
                    onDelete={handleDeleteSubject}
                    onViewDetails={handleViewDetails}
                    onManageStudents={handleManageStudents}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isFormOpen && (
        <SubjectForm
          mode={formMode}
          subject={selectedSubject}
          onSubmit={handleSaveSubject}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {isEnrollmentPanelOpen && selectedSubject && (
        <StudentEnrollmentPanel
          subject={selectedSubject}
          onClose={() => setIsEnrollmentPanelOpen(false)}
        />
      )}
    </div>
  );
}
