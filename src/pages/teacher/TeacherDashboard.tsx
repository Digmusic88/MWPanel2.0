import React from 'react';
import { BookOpen, Users, FileText, Clock } from 'lucide-react';
import StatCard from '../../components/UI/StatCard';
import RecentActivity from '../../components/UI/RecentActivity';

export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel del Profesor</h1>
          <p className="text-gray-600">¡Bienvenido de vuelta, Prof. García!</p>
        </div>
        <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 hover:shadow-lg transition-all">
          Crear Tarea
        </button>
      </div>

      {/* Cuadrícula de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Mis Clases"
          value="6"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Total de Estudiantes"
          value="142"
          change={{ value: 5, type: 'increase' }}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Calificaciones Pendientes"
          value="23"
          icon={FileText}
          color="yellow"
        />
        <StatCard
          title="Próximas Clases"
          value="8"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Cuadrícula de Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horario de Hoy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Horario de Hoy</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Matemáticas</div>
                <div className="text-sm text-gray-600">Grado 10A</div>
              </div>
              <div className="text-sm font-medium text-blue-600">9:00 AM</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Física</div>
                <div className="text-sm text-gray-600">Grado 11B</div>
              </div>
              <div className="text-sm font-medium text-green-600">11:00 AM</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Matemáticas</div>
                <div className="text-sm text-gray-600">Grado 12A</div>
              </div>
              <div className="text-sm font-medium text-purple-600">2:00 PM</div>
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="font-medium text-gray-900">Calificar Tareas</div>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="font-medium text-gray-900">Tomar Asistencia</div>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="font-medium text-gray-900">Subir Recursos</div>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="font-medium text-gray-900">Programar Clase</div>
          </button>
        </div>
      </div>
    </div>
  );
}
