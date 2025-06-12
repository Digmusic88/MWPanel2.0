import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Users, BarChart3, Download, AlertCircle, Loader2, X, Archive, ArchiveRestore, CheckCircle, Info } from 'lucide-react';
import { useGroups } from '../../context/GroupsContext';
import { AcademicGroup } from '../../types/groups';
import GroupCard from '../../components/Groups/GroupCard';
import GroupTable from '../../components/Groups/GroupTable';
import GroupForm from '../../components/Groups/GroupForm';
import StudentAssignmentModal from '../../components/Groups/StudentAssignmentModal';
import GroupViewToggle from '../../components/Groups/GroupViewToggle';

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function GroupsManagement() {
  const { 
    groups, 
    levels, 
    addGroup, 
    updateGroup, 
    deleteGroup, 
    archiveGroup,
    unarchiveGroup,
    getGroupsByLevel,
    getActiveGroups,
    getArchivedGroups,
    generateGroupReport,
    loading
  } = useGroups();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedGroup, setSelectedGroup] = useState<AcademicGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showArchived, setShowArchived] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  // Auto-dismiss notification after 5 seconds
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

  const handleCreateGroup = () => {
    setFormMode('create');
    setSelectedGroup(null);
    setIsFormOpen(true);
  };

  const handleEditGroup = (group: AcademicGroup) => {
    setFormMode('edit');
    setSelectedGroup(group);
    setIsFormOpen(true);
  };

  const handleSaveGroup = async (groupData: Omit<AcademicGroup, 'id' | 'createdAt' | 'updatedAt' | 'currentCapacity'>) => {
    try {
      if (formMode === 'create') {
        await addGroup(groupData);
        showNotification('success', 'Grupo creado exitosamente');
      } else if (selectedGroup) {
        await updateGroup(selectedGroup.id, groupData);
        showNotification('success', 'Grupo actualizado exitosamente');
      }
      setIsFormOpen(false);
    } catch (error: any) {
      console.error('Error saving group:', error);
      showNotification('error', error.message || 'Error al guardar el grupo');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.')) {
      try {
        await deleteGroup(id);
        showNotification('success', 'Grupo eliminado exitosamente');
      } catch (error: any) {
        console.error('Error deleting group:', error);
        showNotification('error', error.message || 'Error al eliminar el grupo');
      }
    }
  };

  const handleArchiveGroup = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres archivar este grupo? Nota: No se puede archivar un grupo que tiene estudiantes asignados. Primero debes remover todos los estudiantes manualmente.')) {
      try {
        await archiveGroup(id);
        showNotification('success', 'Grupo archivado exitosamente');
      } catch (error: any) {
        console.error('Error archiving group:', error);
        showNotification('error', error.message || 'Error al archivar el grupo');
      }
    }
  };

  const handleUnarchiveGroup = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres desarchivar este grupo? Volverá a estar disponible para asignaciones.')) {
      try {
        await unarchiveGroup(id);
        showNotification('success', 'Grupo desarchivado exitosamente');
      } catch (error: any) {
        console.error('Error unarchiving group:', error);
        showNotification('error', error.message || 'Error al desarchivar el grupo');
      }
    }
  };

  const handleViewStudents = (group: AcademicGroup) => {
    setSelectedGroup(group);
    setIsStudentModalOpen(true);
  };

  const handleViewReports = async (group: AcademicGroup) => {
    try {
      const report = await generateGroupReport(group.id);
      console.log('Group report:', report);
      // Aquí se abriría un modal de reportes o se navegaría a una página de reportes
      showNotification('info', 'Funcionalidad de reportes en desarrollo');
    } catch (error: any) {
      console.error('Error generating report:', error);
      showNotification('error', error.message || 'Error al generar el reporte');
    }
  };

  // Filtrar grupos
  const getFilteredGroups = () => {
    let filtered = showArchived ? getArchivedGroups() : getActiveGroups();

    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.tutorName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(group => group.level.id === levelFilter);
    }

    if (statusFilter !== 'all') {
      if (!showArchived) {
        filtered = filtered.filter(group => 
          statusFilter === 'active' ? group.isActive : !group.isActive
        );
      }
    }

    return filtered;
  };

  const filteredGroups = getFilteredGroups();

  // Estadísticas
  const stats = {
    total: getActiveGroups().length,
    active: getActiveGroups().filter(g => g.isActive).length,
    inactive: getActiveGroups().filter(g => !g.isActive).length,
    archived: getArchivedGroups().length,
    totalStudents: groups.reduce((sum, group) => sum + group.currentCapacity, 0),
    averageCapacity: getActiveGroups().length > 0 
      ? Math.round((getActiveGroups().reduce((sum, group) => sum + (group.currentCapacity / group.maxCapacity * 100), 0) / getActiveGroups().length))
      : 0
  };

  const exportGroups = () => {
    const csvContent = [
      ['Nombre', 'Nivel', 'Año Académico', 'Tutor', 'Capacidad Actual', 'Capacidad Máxima', 'Estado'],
      ...filteredGroups.map(group => [
        group.name,
        group.level.name,
        group.academicYear,
        group.tutorName || 'Sin asignar',
        group.currentCapacity.toString(),
        group.maxCapacity.toString(),
        group.isActive ? 'Activo' : 'Inactivo'
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `grupos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('success', 'Archivo CSV exportado exitosamente');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando grupos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showArchived ? 'Grupos Archivados' : 'Gestión de Grupos'}
          </h1>
          <p className="text-gray-600 mt-1">
            {showArchived 
              ? 'Administra los grupos archivados del sistema'
              : 'Administra los grupos académicos del sistema'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showArchived
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showArchived ? (
              <>
                <ArchiveRestore className="h-4 w-4 inline mr-2" />
                Ver Activos
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 inline mr-2" />
                Ver Archivados
              </>
            )}
          </button>
          {!showArchived && (
            <button
              onClick={handleCreateGroup}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Grupo
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Grupos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Grupos Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Capacidad Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageCapacity}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar grupos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los niveles</option>
              {levels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>

            {!showArchived && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            )}

            <button
              onClick={exportGroups}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mt-4 flex justify-end">
          <GroupViewToggle view={viewMode} onViewChange={setViewMode} />
        </div>
      </div>

      {/* Groups Display */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showArchived ? 'No hay grupos archivados' : 'No hay grupos disponibles'}
          </h3>
          <p className="text-gray-600 mb-6">
            {showArchived 
              ? 'No se encontraron grupos archivados que coincidan con los filtros aplicados.'
              : searchQuery || levelFilter !== 'all' || statusFilter !== 'all'
                ? 'No se encontraron grupos que coincidan con los filtros aplicados.'
                : 'Comienza creando tu primer grupo académico.'
            }
          </p>
          {!showArchived && !searchQuery && levelFilter === 'all' && statusFilter === 'all' && (
            <button
              onClick={handleCreateGroup}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Crear Primer Grupo
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={handleEditGroup}
              onDelete={handleDeleteGroup}
              onArchive={handleArchiveGroup}
              onUnarchive={handleUnarchiveGroup}
              onViewStudents={handleViewStudents}
              onViewReports={handleViewReports}
              showArchived={showArchived}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <GroupTable
            groups={filteredGroups}
            onEdit={handleEditGroup}
            onDelete={handleDeleteGroup}
            onArchive={handleArchiveGroup}
            onUnarchive={handleUnarchiveGroup}
            onViewStudents={handleViewStudents}
            onViewReports={handleViewReports}
            showArchived={showArchived}
          />
        </div>
      )}

      {/* Modals */}
      {isFormOpen && (
        <GroupForm
          mode={formMode}
          group={selectedGroup}
          onSubmit={handleSaveGroup}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {isStudentModalOpen && selectedGroup && (
        <StudentAssignmentModal
          group={selectedGroup}
          onClose={() => setIsStudentModalOpen(false)}
        />
      )}
    </div>
  );
}
