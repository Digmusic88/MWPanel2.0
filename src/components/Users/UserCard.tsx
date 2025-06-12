import React from 'react';
import { User, Mail, Phone, Calendar, Clock, Edit, Trash2, UserCheck, UserX, Camera } from 'lucide-react';
import { User as UserType } from '../../types';
import { ImageService } from '../../services/imageService';
import ParentStudentConnection from './ParentStudentConnection';

interface UserCardProps {
  user: UserType;
  onEdit: (user: UserType) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function UserCard({ user, onEdit, onDelete, onToggleStatus }: UserCardProps) {
  const [refreshKey, setRefreshKey] = React.useState(0);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'teacher': return 'Profesor';
      case 'student': return 'Estudiante';
      case 'parent': return 'Padre';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'teacher': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student': return 'bg-green-100 text-green-800 border-green-200';
      case 'parent': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const avatarUrl = ImageService.getAvatarUrl(user);

  const handleConnectionChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] overflow-hidden" key={refreshKey}>
      {/* Header con foto de perfil */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Foto de perfil con botón de cambio */}
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = ImageService.generateDefaultAvatar(user.name);
                }}
              />
              <button
                onClick={() => onEdit(user)}
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all duration-200"
                title="Cambiar foto"
              >
                <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            </div>
            
            {/* Información básica */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 truncate">{user.name}</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>
          
          {/* Estado */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'} shadow-sm`}></div>
            <span className={`text-xs font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {user.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Contenido principal en grid */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-1 gap-3">
          {/* Información de contacto */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-3 text-gray-400" />
              <span className="truncate">{user.email}</span>
            </div>
            
            {user.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>

          {/* Fechas */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-3 text-gray-400" />
              <span>Registrado: {formatDate(user.createdAt)}</span>
            </div>

            {user.lastLogin && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-3 text-gray-400" />
                <span>Último acceso: {formatDateTime(user.lastLogin)}</span>
              </div>
            )}
          </div>

          {/* Información específica por rol */}
          {user.role === 'student' && user.grade && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm">
                <span className="font-medium text-green-800">Grupo Base:</span>
                <span className="text-green-700 ml-2">{user.grade}</span>
              </div>
            </div>
          )}

          {user.role === 'teacher' && user.subjects && user.subjects.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm">
                <span className="font-medium text-blue-800">Materias:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {user.subjects.map((subject, index) => (
                    <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conexiones Padre-Estudiante */}
          {(user.role === 'parent' || user.role === 'student') && (
            <div className="pt-2">
              <ParentStudentConnection 
                user={user} 
                onConnectionChange={handleConnectionChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <button
          onClick={() => onToggleStatus(user.id)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
            user.isActive
              ? 'text-red-600 hover:bg-red-50 hover:shadow-sm'
              : 'text-green-600 hover:bg-green-50 hover:shadow-sm'
          }`}
        >
          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          <span>{user.isActive ? 'Desactivar' : 'Activar'}</span>
        </button>

        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110 hover:shadow-sm"
            title="Editar usuario"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110 hover:shadow-sm"
            title="Eliminar usuario"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
