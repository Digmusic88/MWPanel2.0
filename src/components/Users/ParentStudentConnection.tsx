import React, { useState } from 'react';
import { Users, Plus, X, Link2, Unlink, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import { User } from '../../types';
import { useUsers } from '../../context/UsersContext';
import ConfirmationModal from '../UI/ConfirmationModal';

interface ParentStudentConnectionProps {
  user: User;
  onConnectionChange?: () => void;
  className?: string;
}

export default function ParentStudentConnection({ 
  user, 
  onConnectionChange,
  className = ''
}: ParentStudentConnectionProps) {
  const { users, getUsersByRole, getStudentsByParent, getParentsByStudent, connectParentStudent, disconnectParentStudent } = useUsers();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    targetUserId: string;
    targetUserName: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    targetUserId: '',
    targetUserName: '',
    isLoading: false
  });

  // Limpiar mensajes después de un tiempo
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleConnect = async () => {
    if (!selectedUserId) return;

    try {
      setIsConnecting(true);
      
      if (user.role === 'parent') {
        await connectParentStudent(user.id, selectedUserId);
        const studentName = users.find(u => u.id === selectedUserId)?.name || 'Estudiante';
        setMessage({ type: 'success', text: `${studentName} conectado exitosamente` });
      } else if (user.role === 'student') {
        await connectParentStudent(selectedUserId, user.id);
        const parentName = users.find(u => u.id === selectedUserId)?.name || 'Padre/Tutor';
        setMessage({ type: 'success', text: `${parentName} conectado exitosamente` });
      }
      
      setSelectedUserId('');
      onConnectionChange?.();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al conectar usuarios' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (targetUserId: string, targetUserName: string) => {
    setConfirmModal({
      isOpen: true,
      targetUserId,
      targetUserName,
      isLoading: false
    });
  };

  const confirmDisconnect = async () => {
    const { targetUserId, targetUserName } = confirmModal;
    
    setConfirmModal(prev => ({ ...prev, isLoading: true }));

    try {
      if (user.role === 'parent') {
        await disconnectParentStudent(user.id, targetUserId);
      } else if (user.role === 'student') {
        await disconnectParentStudent(targetUserId, user.id);
      }
      
      setMessage({ type: 'success', text: `${targetUserName} desconectado exitosamente` });
      onConnectionChange?.();
    } catch (error: any) {
      setConfirmModal({
        isOpen: false,
        targetUserId: '',
        targetUserName: '',
        isLoading: false
      });
    }
  };

  const closeConfirmModal = () => {
    if (!confirmModal.isLoading) {
      setConfirmModal({
        isOpen: false,
        targetUserId: '',
        targetUserName: '',
        isLoading: false
      });
    }
  };

  // Obtener conexiones actuales
  const getConnections = () => {
    if (user.role === 'parent') {
      return getStudentsByParent(user.id);
    } else if (user.role === 'student') {
      return getParentsByStudent(user.id);
    }
    return [];
  };

  // Obtener usuarios disponibles para conectar
  const getAvailableUsers = () => {
    const connections = getConnections();
    const connectedIds = connections.map(c => c.id);

    if (user.role === 'parent') {
      // Padres pueden conectarse con cualquier estudiante que no esté ya conectado con ellos
      return getUsersByRole('student').filter(student => !connectedIds.includes(student.id));
    } else if (user.role === 'student') {
      // Estudiantes pueden conectarse con cualquier padre que no esté ya conectado con ellos
      return getUsersByRole('parent').filter(parent => !connectedIds.includes(parent.id));
    }
    return [];
  };

  const connections = getConnections();
  const availableUsers = getAvailableUsers();
  const targetRole = user.role === 'parent' ? 'estudiantes' : 'padres/tutores';
  const targetSingular = user.role === 'parent' ? 'estudiante' : 'padre/tutor';

  // No mostrar para administradores y profesores
  if (user.role !== 'parent' && user.role !== 'student') {
    return null;
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Mensaje de estado */}
        {message && (
          <div className={`flex items-center space-x-2 text-sm p-3 rounded-lg animate-fade-in ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Conexiones existentes */}
        {connections.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Link2 className="w-4 h-4 mr-2" />
              {user.role === 'parent' ? 'Hijos vinculados' : 'Padres/Tutores vinculados'}
              <span className="text-gray-500 ml-1">({connections.length})</span>
            </h4>
            <div className="space-y-2">
              {connections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{connection.name}</div>
                      <div className="text-sm text-gray-500">{connection.email}</div>
                      {connection.grade && (
                        <div className="text-xs text-green-600 font-medium">{connection.grade}</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnect(connection.id, connection.name)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 transform hover:scale-110 disabled:opacity-50"
                    disabled={confirmModal.isLoading}
                    title={`Desconectar de ${connection.name}`}
                  >
                    <Unlink className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agregar nueva conexión */}
        {availableUsers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <UserPlus className="w-4 h-4 mr-2" />
              Conectar con {targetRole}
            </h4>
            <div className="space-y-3">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                disabled={isConnecting}
              >
                <option value="">Seleccionar {targetSingular}</option>
                {availableUsers.map((availableUser) => (
                  <option key={availableUser.id} value={availableUser.id}>
                    {availableUser.name} - {availableUser.email}
                    {availableUser.grade && ` (${availableUser.grade})`}
                  </option>
                ))}
              </select>
              <button
                onClick={handleConnect}
                disabled={!selectedUserId || isConnecting}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    <span>Conectar {targetSingular}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay usuarios disponibles */}
        {availableUsers.length === 0 && connections.length === 0 && (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium">No hay {targetRole} disponibles</p>
            <p className="text-xs text-gray-400 mt-1">
              {user.role === 'parent' 
                ? 'Todos los estudiantes ya están conectados o no hay estudiantes registrados'
                : 'Todos los padres ya están conectados o no hay padres registrados'
              }
            </p>
          </div>
        )}

        {availableUsers.length === 0 && connections.length > 0 && (
          <div className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>
                {user.role === 'parent' 
                  ? 'Todos los estudiantes disponibles ya están conectados'
                  : 'Todos los padres disponibles ya están conectados'
                }
              </span>
            </div>
          </div>
        )}

        {/* Información adicional para estudiantes con múltiples padres */}
        {user.role === 'student' && connections.length > 1 && (
          <div className="text-xs text-purple-600 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>
                Este estudiante tiene {connections.length} padres/tutores conectados. 
                Todos pueden acceder a la información académica del estudiante.
              </span>
            </div>
          </div>
        )}

        {/* Información adicional para padres con múltiples hijos */}
        {user.role === 'parent' && connections.length > 1 && (
          <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>
                Tienes {connections.length} estudiantes vinculados. 
                Puedes monitorear el progreso académico de todos ellos.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDisconnect}
        title="Confirmar Desvinculación"
        message={`¿Estás seguro de que quieres desvincular a ${confirmModal.targetUserName}? Esta acción eliminará la conexión familiar y puede afectar el acceso a la información académica.`}
        confirmText="Desvincular"
        cancelText="Cancelar"
        type="warning"
        isLoading={confirmModal.isLoading}
      />
    </>
  );
}