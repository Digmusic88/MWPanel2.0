import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, Upload, AlertCircle, Loader2, Users, UserCheck, UserX } from 'lucide-react';
import { useUsers } from '../../context/UsersContext';
import UserCard from '../../components/Users/UserCard';
import UserTable from '../../components/Users/UserTable';
import UserModal from '../../components/Users/UserModal';
import ImportModal from '../../components/Users/ImportModal';
import ViewToggle from '../../components/Users/ViewToggle';
import RoleChips from '../../components/Users/RoleChips';
import { User } from '../../types';

type ViewMode = 'grid' | 'list';

export default function UsersManagement() {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus, getUsersByRole, searchUsers, loading, error } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Cargar preferencia de vista desde localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('users_view_mode') as ViewMode;
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
      setViewMode(savedView);
    }
  }, []);

  // Guardar preferencia de vista en localStorage
  const handleViewChange = (view: ViewMode) => {
    setViewMode(view);
    localStorage.setItem('users_view_mode', view);
  };

  const handleCreateUser = () => {
    setModalMode('create');
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      if (modalMode === 'create') {
        await addUser(userData);
      } else if (selectedUser) {
        await updateUser(selectedUser.id, userData);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUser(id);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleImportUsers = async (importedUsers: Omit<User, 'id' | 'createdAt'>[]) => {
    try {
      // Importar usuarios uno por uno para manejar errores individuales
      const results = await Promise.allSettled(
        importedUsers.map(userData => addUser(userData))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (successful > 0) {
        alert(`Se importaron ${successful} usuarios exitosamente.${failed > 0 ? ` ${failed} usuarios fallaron.` : ''}`);
      } else {
        alert('No se pudo importar ningún usuario. Verifica los datos e intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error importing users:', error);
      alert('Error durante la importación. Por favor, intenta nuevamente.');
    }
  };

  // Filtrar usuarios
  const getFilteredUsers = () => {
    let filtered = searchQuery ? searchUsers(searchQuery) : users;

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  // Estadísticas
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: getUsersByRole('admin').length,
    teachers: getUsersByRole('teacher').length,
    students: getUsersByRole('student').length,
    parents: getUsersByRole('parent').length,
  };

  const exportUsers = () => {
    const csvContent = [
      ['Nombre', 'Email', 'Rol', 'Teléfono', 'Estado', 'Fecha Registro'].join(','),
      ...filteredUsers.map(user => [
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.role}"`,
        `"${user.phone || ''}"`,
        `"${user.isActive ? 'Activo' : 'Inactivo'}"`,
        `"${user.createdAt.toLocaleDateString('es-ES')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra todos los usuarios del sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <ViewToggle view={viewMode} onViewChange={handleViewChange} />
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            <span>Importar</span>
          </button>
          <button
            onClick={exportUsers}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
          <button
            onClick={handleCreateUser}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-xl font-bold text-green-600">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2">
            <UserX className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Inactivos</p>
              <p className="text-xl font-bold text-red-600">{stats.inactive}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm text-gray-600">Admins</p>
            <p className="text-xl font-bold text-red-600">{stats.admins}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm text-gray-600">Profesores</p>
            <p className="text-xl font-bold text-blue-600">{stats.teachers}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm text-gray-600">Estudiantes</p>
            <p className="text-xl font-bold text-green-600">{stats.students}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm text-gray-600">Padres</p>
            <p className="text-xl font-bold text-purple-600">{stats.parents}</p>
          </div>
        </div>
      </div>

      {/* Filtros con Chips */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="space-y-4">
          {/* Filtros por Rol */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filtrar por Rol</h3>
            <RoleChips 
              users={users}
              selectedRole={roleFilter}
              onRoleChange={setRoleFilter}
            />
          </div>

          {/* Búsqueda y Filtros Adicionales */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* Búsqueda */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o rol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Filtro de Estado */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Estado:</span>
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'active', label: 'Activos' },
                  { value: 'inactive', label: 'Inactivos' }
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setStatusFilter(status.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      statusFilter === status.value
                        ? 'bg-emerald-100 text-emerald-800 transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista/Tabla de Usuarios */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="ml-2 text-gray-600">Cargando usuarios...</span>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onToggleStatus={toggleUserStatus}
            />
          ))}
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onToggleStatus={toggleUserStatus}
        />
      )}

      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
          <p className="text-gray-600">
            {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza creando tu primer usuario'
            }
          </p>
        </div>
      )}

      {/* Modales */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        mode={modalMode}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportUsers}
      />
    </div>
  );
}