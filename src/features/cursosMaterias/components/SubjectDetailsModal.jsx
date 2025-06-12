import React, { useState, useEffect } from 'react';
import { X, Archive, RefreshCw, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function SubjectDetailsModal({ curso, onClose, onRefresh }) {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchMaterias();
  }, [curso]);

  const fetchMaterias = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cursos/${curso.id}/materias?includeArchived=true`);
      
      if (!response.ok) {
        throw new Error(`Error al obtener materias: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMaterias(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching materias:', err);
      setError(err.message || 'Error al cargar las materias');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArchive = async (materia) => {
    try {
      const endpoint = materia.archived 
        ? `/api/materias/${materia.id}/unarchive` 
        : `/api/materias/${materia.id}/archive`;
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const updatedMateria = await response.json();
      
      // Actualizar la lista de materias
      setMaterias(materias.map(m => 
        m.id === updatedMateria.id ? updatedMateria : m
      ));
      
      // Mostrar notificación
      setNotification({
        type: 'success',
        message: materia.archived 
          ? `Materia "${materia.name}" desarchivada correctamente` 
          : `Materia "${materia.name}" archivada correctamente`
      });
      
      // Refrescar datos del padre si es necesario
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error toggling archive status:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Error al cambiar el estado de archivo'
      });
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detalles del Curso</h2>
            <p className="text-gray-600">Información completa y materias asociadas</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Notification */}
        {notification && (
          <div className={`mx-6 mt-4 p-4 rounded-lg flex items-start gap-3 ${
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
        )}
        
        {/* Contenido */}
        <div className="flex-1 overflow-auto p-6">
          {/* Información del curso */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Curso</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nombre</p>
                <p className="text-base text-gray-900">{curso.name}</p>
              </div>
              
              {curso.code && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Código</p>
                  <p className="text-base text-gray-900">{curso.code}</p>
                </div>
              )}
              
              {curso.description && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Descripción</p>
                  <p className="text-base text-gray-900">{curso.description}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
                <p className="text-base text-gray-900">{formatDate(curso.createdAt)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Última Actualización</p>
                <p className="text-base text-gray-900">{formatDate(curso.updatedAt)}</p>
              </div>
              
              {curso.isActive !== undefined && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    curso.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {curso.isActive ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Lista de materias */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Materias Asociadas</h3>
              <button 
                onClick={fetchMaterias}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Cargando materias...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            ) : materias.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">Este curso no tiene materias asociadas.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha de Archivo
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {materias.map(materia => (
                      <tr 
                        key={materia.id} 
                        className={materia.archived ? 'bg-gray-50' : ''}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${materia.archived ? 'text-gray-500' : 'text-gray-900'}`}>
                            {materia.name}
                          </div>
                          {materia.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {materia.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            materia.archived 
                              ? 'bg-gray-100 text-gray-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {materia.archived ? 'Archivada' : 'Activa'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {materia.archived ? formatDate(materia.archivedAt) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleToggleArchive(materia)}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${
                              materia.archived
                                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                          >
                            {materia.archived ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Desarchivar
                              </>
                            ) : (
                              <>
                                <Archive className="w-4 h-4 mr-1" />
                                Archivar
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
