import React from 'react';
import { Clock, User, BookOpen, FileText, MessageCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'grade' | 'assignment' | 'message' | 'course';
  title: string;
  description: string;
  time: string;
  user?: string;
}

const activityIcons = {
  grade: BookOpen,
  assignment: FileText,
  message: MessageCircle,
  course: User,
};

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'grade',
    title: 'Nueva Calificación Publicada',
    description: 'Examen de Matemáticas - 8.5/10',
    time: 'hace 2 horas',
    user: 'Prof. García'
  },
  {
    id: '2',
    type: 'assignment',
    title: 'Tarea Próxima a Vencer',
    description: 'Informe de Laboratorio de Física vence mañana',
    time: 'hace 4 horas'
  },
  {
    id: '3',
    type: 'message',
    title: 'Nuevo Mensaje',
    description: 'Conferencia de padres y profesores programada',
    time: 'hace 1 día',
    user: 'Ana Martínez'
  },
  {
    id: '4',
    type: 'course',
    title: 'Material de Curso Agregado',
    description: 'Nuevo capítulo subido a la clase de Historia',
    time: 'hace 2 días',
    user: 'Prof. López'
  }
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {mockActivities.map((activity) => {
          const Icon = activityIcons[activity.type];
          return (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                {activity.user && (
                  <p className="text-xs text-gray-500 mt-1">por {activity.user}</p>
                )}
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
            </div>
          );
        })}
      </div>
      
      <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
        Ver Todas las Actividades
      </button>
    </div>
  );
}
