import React from 'react';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ImageService } from '../../services/imageService';

export default function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'teacher': return 'Profesor';
      case 'student': return 'Estudiante';
      case 'parent': return 'Padre';
      default: return role;
    }
  };

  const avatarUrl = ImageService.getAvatarUrl(user);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Búsqueda */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Sección de Usuario */}
        <div className="flex items-center space-x-4">
          {/* Notificaciones */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-110">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Menú de Usuario */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <img
                src={avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  // Fallback si la imagen no carga
                  const target = e.target as HTMLImageElement;
                  target.src = ImageService.generateDefaultAvatar(user.name);
                }}
              />
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}