import React from 'react';
import { BookOpen, TrendingUp, FileText, Calendar } from 'lucide-react';
import StatCard from '../../components/UI/StatCard';
import RecentActivity from '../../components/UI/RecentActivity';

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel del Estudiante</h1>
          <p className="text-gray-600">¡Bienvenido de vuelta, Juan!</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 hover:shadow-lg transition-all">
          Ver Horario
        </button>
      </div>

      {/* Cuadrícula de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Cursos Inscritos"
          value="8"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Promedio General"
          value="8.7"
          change={{ value: 5, type: 'increase' }}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Tareas Pendientes"
          value="4"
          icon={FileText}
          color="yellow"
        />
        <StatCard
          title="Tasa de Asistencia"
          value="96%"
          change={{ value: 2, type: 'increase' }}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Cuadrícula de Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Tareas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Tareas</h3>
          <div className="space-y-3">
            <div className="p-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
              <div className="font-medium text-gray-900">Informe de Laboratorio de Física</div>
              <div className="text-sm text-gray-600">Vence Mañana</div>
              <div className="text-xs text-red-600 mt-1">Prioridad Alta</div>
            </div>
            <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg">
              <div className="font-medium text-gray-900">Conjunto de Problemas de Matemáticas</div>
              <div className="text-sm text-gray-600">Vence en 3 días</div>
              <div className="text-xs text-yellow-600 mt-1">Prioridad Media</div>
            </div>
            <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
              <div className="font-medium text-gray-900">Ensayo de Historia</div>
              <div className="text-sm text-gray-600">Vence en 1 semana</div>
              <div className="text-xs text-green-600 mt-1">Prioridad Baja</div>
            </div>
          </div>
        </div>

        {/* Calificaciones Recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Calificaciones Recientes</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Examen de Matemáticas</div>
                <div className="text-sm text-gray-600">15 Dic, 2024</div>
              </div>
              <div className="text-lg font-bold text-green-600">8.5/10</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Prueba de Física</div>
                <div className="text-sm text-gray-600">12 Dic, 2024</div>
              </div>
              <div className="text-lg font-bold text-blue-600">9.2/10</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Laboratorio de Química</div>
                <div className="text-sm text-gray-600">10 Dic, 2024</div>
              </div>
              <div className="text-lg font-bold text-purple-600">8.8/10</div>
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
