import React from 'react';
import { Users, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';
import StatCard from '../../components/UI/StatCard';
import RecentActivity from '../../components/UI/RecentActivity';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Resumen general de la plataforma educativa</p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 hover:shadow-lg transition-all">
          Configuración del Sistema
        </button>
      </div>

      {/* Cuadrícula de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Usuarios"
          value="1,247"
          change={{ value: 12, type: 'increase' }}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Cursos Activos"
          value="34"
          change={{ value: 8, type: 'increase' }}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          title="Rendimiento del Sistema"
          value="98.5%"
          change={{ value: 2, type: 'increase' }}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Incidencias Reportadas"
          value="3"
          change={{ value: 25, type: 'decrease' }}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Cuadrícula de Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividad Reciente */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Agregar Nuevo Usuario</div>
              <div className="text-sm text-gray-500">Crear cuenta de administrador, profesor, estudiante o padre</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Crear Curso</div>
              <div className="text-sm text-gray-500">Configurar nuevo curso con materias</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Ver Reportes</div>
              <div className="text-sm text-gray-500">Acceder a análisis y reportes del sistema</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Respaldo del Sistema</div>
              <div className="text-sm text-gray-500">Crear o restaurar respaldo del sistema</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
