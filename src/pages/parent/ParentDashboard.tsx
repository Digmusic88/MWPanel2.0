import React from 'react';
import { User, TrendingUp, Calendar, Bell, Users, BookOpen } from 'lucide-react';
import StatCard from '../../components/UI/StatCard';
import RecentActivity from '../../components/UI/RecentActivity';
import { useUsers } from '../../context/UsersContext';
import { useAuth } from '../../context/AuthContext';

export default function ParentDashboard() {
  const { user } = useAuth();
  const { getStudentsByParent } = useUsers();
  
  // Obtener estudiantes conectados al padre actual
  const connectedStudents = user ? getStudentsByParent(user.id) : [];
  const primaryStudent = connectedStudents[0]; // Usar el primer estudiante como principal

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Padres</h1>
          {primaryStudent ? (
            <p className="text-gray-600">Monitorea el progreso académico de {primaryStudent.name}</p>
          ) : (
            <p className="text-gray-600">No hay estudiantes conectados</p>
          )}
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:shadow-lg transition-all">
          Contactar Profesores
        </button>
      </div>

      {/* Información de estudiantes conectados */}
      {connectedStudents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Estudiantes Vinculados ({connectedStudents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedStudents.map((student) => (
              <div key={student.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    {student.grade && (
                      <p className="text-xs text-purple-600 font-medium">{student.grade}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cuadrícula de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Estudiantes Vinculados"
          value={connectedStudents.length.toString()}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Promedio General"
          value={primaryStudent ? "8.7" : "N/A"}
          change={primaryStudent ? { value: 3, type: 'increase' } : undefined}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Tasa de Asistencia"
          value={primaryStudent ? "96%" : "N/A"}
          change={primaryStudent ? { value: 1, type: 'increase' } : undefined}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Mensajes Sin Leer"
          value="2"
          icon={Bell}
          color="yellow"
        />
      </div>

      {/* Cuadrícula de Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rendimiento del Hijo */}
        {primaryStudent ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-green-600" />
              Rendimiento de {primaryStudent.name}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Matemáticas</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">8.5</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Física</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">9.2</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Química</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">8.8</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Historia</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-yellow-600">7.8</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento Académico</h3>
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay estudiantes vinculados</p>
              <p className="text-sm text-gray-400 mt-2">
                Conecta con estudiantes para ver su rendimiento académico
              </p>
            </div>
          </div>
        )}

        {/* Resumen de Asistencia */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asistencia Este Mes</h3>
          {primaryStudent ? (
            <>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Simulación de calendario */}
                {Array.from({ length: 30 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                      i % 7 === 0 || i % 7 === 6
                        ? 'bg-gray-100 text-gray-400' // Fin de semana
                        : Math.random() > 0.9
                        ? 'bg-red-100 text-red-600' // Ausente
                        : Math.random() > 0.95
                        ? 'bg-yellow-100 text-yellow-600' // Tarde
                        : 'bg-green-100 text-green-600' // Presente
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Presente</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Tarde</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Ausente</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay datos de asistencia</p>
            </div>
          )}
        </div>

        {/* Actividad Reciente */}
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Mensajes de Profesores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mensajes Recientes de Profesores</h3>
        {primaryStudent ? (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <img
                src="https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1"
                alt="Profesor"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">Prof. García</h4>
                  <span className="text-xs text-gray-500">hace 2 horas</span>
                </div>
                <p className="text-sm text-gray-700">
                  {primaryStudent.name} mostró un excelente progreso en la clase de matemáticas de hoy. Sus habilidades para resolver problemas están mejorando significativamente.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <img
                src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1"
                alt="Profesor"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">Prof. López</h4>
                  <span className="text-xs text-gray-500">hace 1 día</span>
                </div>
                <p className="text-sm text-gray-700">
                  Conferencia de padres y profesores programada para el próximo martes a las 3:00 PM para discutir el progreso semestral de {primaryStudent.name}.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay mensajes disponibles</p>
            <p className="text-sm text-gray-400 mt-2">
              Los mensajes aparecerán cuando tengas estudiantes vinculados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}