// Tipos para el módulo de Cursos y Materias

export interface Subject {
  id: string;
  name: string;
  description: string;
  code: string; // Código de la materia (ej: MAT101)
  department: string; // Departamento académico
  credits: number; // Créditos académicos
  color: string; // Color para identificación visual
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  levels: SubjectLevel[];
  groups: SubjectGroup[];
}

export interface SubjectLevel {
  id: string;
  name: string; // Básico, Intermedio, Avanzado
  description: string;
  order: number; // Para ordenar niveles
  requirements: string[]; // Requisitos previos
  maxStudents: number; // Capacidad máxima por nivel
  currentStudents: number; // Estudiantes actuales
}

export interface SubjectGroup {
  id: string;
  name: string; // Grupo A, B, C, etc.
  levelId: string; // Nivel al que pertenece
  teacherId: string; // Profesor asignado
  teacherName?: string;
  schedule: ClassSchedule[];
  maxStudents: number;
  currentStudents: number;
  students: StudentEnrollment[];
}

export interface ClassSchedule {
  id: string;
  dayOfWeek: number; // 0-6 (Domingo-Sábado)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  classroom: string;
}

export interface StudentEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  subjectId: string;
  levelId: string;
  groupId: string;
  enrolledAt: Date;
  enrolledBy: string; // ID del usuario que hizo la inscripción
  status: 'active' | 'inactive' | 'completed' | 'dropped';
  grade?: number; // Calificación final
  attendance: number; // Porcentaje de asistencia
  notes?: string;
}

export interface SubjectStats {
  totalSubjects: number;
  activeSubjects: number;
  totalEnrollments: number;
  averageEnrollmentPerSubject: number;
  subjectsByDepartment: Record<string, number>;
  enrollmentsByLevel: Record<string, number>;
}

export interface DragDropData {
  studentId: string;
  sourceSubjectId: string;
  sourceLevelId: string;
  sourceGroupId: string;
  targetSubjectId: string;
  targetLevelId: string;
  targetGroupId: string;
}

export interface EnrollmentAction {
  type: 'enroll' | 'transfer' | 'remove' | 'level_change';
  studentId: string;
  subjectId: string;
  levelId?: string;
  groupId?: string;
  previousLevelId?: string;
  previousGroupId?: string;
  reason?: string;
}
