import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  MessageCircle, 
  FileText, 
  Settings,
  GraduationCap,
  ClipboardList,
  TrendingUp,
  Upload,
  Bell,
  Home,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigationItems = {
  admin: [
    { icon: LayoutDashboard, label: 'Panel Principal', path: '/admin' },
    { icon: Users, label: 'Gestión de Usuarios', path: '/admin/users' },
    { icon: GraduationCap, label: 'Grupos y Niveles', path: '/admin/groups' },
    { icon: BookOpen, label: 'Cursos y Materias', path: '/admin/courses' },
    { icon: TrendingUp, label: 'Reportes y Análisis', path: '/admin/reports' },
    { icon: Settings, label: 'Configuración', path: '/admin/settings' },
  ],
  teacher: [
    { icon: LayoutDashboard, label: 'Panel Principal', path: '/teacher' },
    { icon: GraduationCap, label: 'Mis Clases', path: '/teacher/classes' },
    { icon: ClipboardList, label: 'Calificaciones', path: '/teacher/grades' },
    { icon: FileText, label: 'Tareas', path: '/teacher/assignments' },
    { icon: Upload, label: 'Recursos', path: '/teacher/resources' },
    { icon: MessageCircle, label: 'Mensajes', path: '/teacher/messages' },
    { icon: Calendar, label: 'Horario', path: '/teacher/schedule' },
  ],
  student: [
    { icon: LayoutDashboard, label: 'Panel Principal', path: '/student' },
    { icon: BookOpen, label: 'Mis Cursos', path: '/student/courses' },
    { icon: TrendingUp, label: 'Mis Calificaciones', path: '/student/grades' },
    { icon: FileText, label: 'Tareas', path: '/student/assignments' },
    { icon: Upload, label: 'Recursos', path: '/student/resources' },
    { icon: MessageCircle, label: 'Mensajes', path: '/student/messages' },
    { icon: Calendar, label: 'Mi Horario', path: '/student/schedule' },
  ],
  parent: [
    { icon: LayoutDashboard, label: 'Panel Principal', path: '/parent' },
    { icon: TrendingUp, label: 'Progreso del Hijo', path: '/parent/progress' },
    { icon: Calendar, label: 'Asistencia', path: '/parent/attendance' },
    { icon: MessageCircle, label: 'Mensajes', path: '/parent/messages' },
    { icon: Bell, label: 'Notificaciones', path: '/parent/notifications' },
    { icon: FileText, label: 'Reportes', path: '/parent/reports' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Cargar estado del sidebar desde localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar_collapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Cerrar sidebar móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Guardar estado del sidebar en localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', JSON.stringify(newState));
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };
  
  if (!user) return null;

  const items = navigationItems[user.role] || [];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Panel Administración';
      case 'teacher': return 'Panel Docentes';
      case 'student': return 'Panel Alumnado';
      case 'parent': return 'Panel Familias';
      default: return role;
    }
  };

  return (
    <>
      {/* Botón de menú móvil */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Abrir menú"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Overlay para móvil */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed lg:relative inset-y-0 left-0 z-40 bg-white shadow-lg border-r border-gray-200 h-full flex flex-col
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isMobileOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header con Logo del Colegio */}
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white relative">
          <div className={`p-6 ${isCollapsed ? 'lg:px-4' : ''}`}>
            {/* Logo del Colegio */}
            <div className={`flex items-center justify-center mb-3`}>
              {/* Logo expandido */}
              <div className={`${isCollapsed ? 'lg:hidden' : ''}`}>
                <img
                  src="/logo.png"
                  alt="Mundo World School"
                  className="h-12 w-auto object-contain mx-auto"
                />
              </div>
              
              {/* Logo colapsado (favicon) */}
              <div className={`hidden ${isCollapsed ? 'lg:block' : ''}`}>
                <img
                  src="/Favicon-web.png"
                  alt="Mundo World School"
                  className="h-12 w-12 object-contain mx-auto"
                />
              </div>
            </div>
            
            {/* Texto del Panel */}
            <div className={`text-center ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="text-emerald-100 text-sm font-medium leading-tight">
                {getRoleLabel(user.role)}
              </p>
            </div>
          </div>

          {/* Botón de Colapso Circular - Solo en desktop */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg items-center justify-center hover:shadow-xl transition-all duration-200 border border-gray-200 group z-10"
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <div className="relative w-4 h-4 flex items-center justify-center">
              <ChevronLeft className={`w-4 h-4 text-gray-600 absolute transition-all duration-300 group-hover:text-emerald-600 ${
                isCollapsed ? 'opacity-0 rotate-180 scale-75' : 'opacity-100 rotate-0 scale-100'
              }`} />
              <ChevronRight className={`w-4 h-4 text-gray-600 absolute transition-all duration-300 group-hover:text-emerald-600 ${
                isCollapsed ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-75'
              }`} />
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`group flex items-center rounded-xl transition-all duration-200 relative ${
                      isCollapsed ? 'lg:px-3 lg:py-3 lg:justify-center px-4 py-3' : 'px-4 py-3 space-x-3'
                    } ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-md border-l-4 border-emerald-500 transform scale-[1.02]'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm hover:transform hover:scale-[1.01]'
                    }`}
                    aria-label={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className={`flex-shrink-0 transition-all duration-200 ${
                      isActive ? 'w-5 h-5 scale-110 text-emerald-600' : 'w-5 h-5 group-hover:scale-110 group-hover:text-emerald-600'
                    }`} />
                    
                    <span className={`font-medium truncate transition-all duration-300 ${
                      isCollapsed ? 'lg:hidden' : ''
                    }`}>
                      {item.label}
                    </span>

                    {/* Tooltip para modo colapsado - Solo desktop */}
                    <div className={`
                      hidden lg:block absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 
                      whitespace-nowrap z-50 pointer-events-none shadow-lg
                      ${isCollapsed ? '' : 'lg:hidden'}
                    `}>
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>

                    {/* Indicador de activo para modo colapsado */}
                    {isCollapsed && isActive && (
                      <div className="hidden lg:block absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-l"></div>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-200 bg-gray-50 ${isCollapsed ? 'lg:hidden' : ''}`}>
          <div className="text-xs text-gray-500 text-center">
            <p className="font-medium">Mundo World School</p>
            <p>© 2024 Todos los derechos reservados</p>
          </div>
        </div>
      </div>
    </>
  );
}
