import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  BookOpen, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Archive, 
  ArchiveRestore,
  AlertCircle, 
  CheckCircle, 
  Loader2,
  X,
  Eye,
  Grid3X3,
  List
} from 'lucide-react';
import { cursosMateriasService, CursoMateria, CursoMateriaInput } from '../../services/cursosMateriasService';

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

const CATEGORIAS = ['Ciencias', 'Humanidades', 'Tecnología', 'Artes', 'Deportes'];

export default function CursosMateriasPage() {
  // Estado principal
  const [cursosMaterias, setCursosMaterias] = useState<CursoMateria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  // Estado de filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Estado de modales
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CursoMateria | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<CursoMateriaInput>({
    nombre: '',
    descripcion: '',
    categoria: CATEGORIAS[0]
  });

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    const subscription = cursosMateriasService.subscribeToChanges((payload) => {
      console.log('Cambio en tiempo real:', payload);
      loadData(); // Recargar datos cuando hay cambios
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar conexión
      const isConnected = await cursosMateriasService.checkConnection();
      if (!isConnected) {
        throw new Error('No se pudo conectar a la base de datos. Verifica tu configuración de Supabase.');
      }

      const data = await cursosMateriasService.getAll();
      setCursosMaterias(data);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Gestión del formulario
  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      nombre: '',
      descripcion: '',
      categoria: CATEGORIAS[0]
    });
    setShowForm(true);
  };

  const handleEdit = (item: CursoMateria) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      categoria: item.categoria
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      showNotification('error', 'El nombre es obligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (editingItem) {
        await cursosMateriasService.update(editingItem.id, formData);
        showNotification('success', 'Curso/Materia actualizado exitosamente');
      } else {
        await cursosMateriasService.create(formData);
        showNotification('success', 'Curso/Materia creado exitosamente');
      }

      setShowForm(false);
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: CursoMateria) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${item.nombre}"?`)) {
      return;
    }

    try {
      await cursosMateriasService.delete(item.id);
      showNotification('success', 'Curso/Materia eliminado exitosamente');
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al eliminar');
    }
  };

  const handleToggleArchive = async (item: CursoMateria) => {
    const action = item.archivado ? 'desarchivar' : 'archivar';
    
    if (!window.confirm(`¿Estás seguro de que quieres ${action} "${item.nombre}"?`)) {
      return;
    }

    try {
      await cursosMateriasService.toggleArchive(item.id, !item.archivado);
      showNotification('success', `Curso/Materia ${item.archivado ? 'desarchivado' : 'archivado'} exitosamente`);
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || `Error al ${action}`);
    }
  };

  // Filtrar datos
  const filteredData = cursosMaterias.filter(item => {
    // Filtro de archivado
    if (showArchived !== item.archivado) return false;
    
    // Filtro de categoría
    if (categoryFilter !== 'all' && item.categoria !== categoryFilter) return false;
    
    // Filtro de búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.nombre.toLowerCase().includes(query) ||
        item.descripcion?.toLowerCase().includes(query) ||
        item.categoria.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Estadísticas
  const stats = {
    total: cursosMaterias.length,
    activos: cursosMaterias.filter(item => !item.archivado).length,
    archivados: cursosMaterias.filter(item => item.archivado).length,
    porCategoria: CATEGORIAS.reduce((acc, cat) => {
      acc[cat] = cursosMaterias.filter(item => item.categoria === cat && !item.archivado).length;
      return acc;
    }, {} as Record<string, number>)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando cursos y materias...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              {notification.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-600" />}
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
              onClick={() => setNotification(null)}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cursos y Materias</h1>
          <p className="text-gray-600">Gestiona el catálogo académico de la institución</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showArchived
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showArchived ? (
              <>
                <Eye className="h-4 w-4 inline mr-2" />
                Ver Activos
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 inline mr-2" />
                Ver Archivados
              </>
            )}
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <span className="text-sm text-red-700">{error}</span>
            <button
              onClick={loadData}
              className="ml-4 text-sm text-red-600 hover:text-red-800 underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Archivados</p>
              <p className="text-2xl font-bold text-orange-600">{stats.archivados}</p>
            </div>
            <Archive className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categorías</p>
              <p className="text-2xl font-bold text-purple-600">{CATEGORIAS.length}</p>
            </div>
            <Filter className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nombre, descripción o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              {CATEGORIAS.map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria} ({stats.porCategoria[categoria] || 0})
                </option>
              ))}
            </select>

            {/* Toggle de vista */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="text-sm font-medium">Tarjetas</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm font-medium">Lista</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {filteredData.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || categoryFilter !== 'all' 
              ? 'No se encontraron resultados' 
              : showArchived 
                ? 'No hay elementos archivados'
                : 'No hay cursos/materias disponibles'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || categoryFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : showArchived
                ? 'Los elementos archivados aparecerán aquí'
                : 'Comienza creando tu primer curso o materia'
            }
          </p>
          {!searchQuery && categoryFilter === 'all' && !showArchived && (
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Crear Primero
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
              {/* Header de la tarjeta */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.nombre}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      item.categoria === 'Ciencias' ? 'bg-blue-100 text-blue-800' :
                      item.categoria === 'Humanidades' ? 'bg-purple-100 text-purple-800' :
                      item.categoria === 'Tecnología' ? 'bg-green-100 text-green-800' :
                      item.categoria === 'Artes' ? 'bg-pink-100 text-pink-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {item.categoria}
                    </span>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.archivado ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.archivado ? 'Archivado' : 'Activo'}
                  </div>
                </div>

                {item.descripcion && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.descripcion}</p>
                )}

                <div className="text-xs text-gray-500">
                  Creado: {new Date(item.creado_en).toLocaleDateString('es-ES')}
                </div>
              </div>

              {/* Acciones */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleArchive(item)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.archivado 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-orange-600 hover:bg-orange-50'
                    }`}
                    title={item.archivado ? 'Desarchivar' : 'Archivar'}
                  >
                    {item.archivado ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.nombre}</div>
                        {item.descripcion && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{item.descripcion}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.categoria === 'Ciencias' ? 'bg-blue-100 text-blue-800' :
                        item.categoria === 'Humanidades' ? 'bg-purple-100 text-purple-800' :
                        item.categoria === 'Tecnología' ? 'bg-green-100 text-green-800' :
                        item.categoria === 'Artes' ? 'bg-pink-100 text-pink-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.archivado ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.archivado ? 'Archivado' : 'Activo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.creado_en).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleArchive(item)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.archivado 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-orange-600 hover:bg-orange-50'
                          }`}
                        >
                          {item.archivado ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal del formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Editar Curso/Materia' : 'Nuevo Curso/Materia'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Matemáticas Avanzadas"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                >
                  {CATEGORIAS.map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción del curso o materia..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}