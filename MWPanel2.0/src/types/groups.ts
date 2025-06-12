// Tipos para el módulo de Grupos y Niveles

export interface AcademicGroup {
  id: string;
  name: string;
  description?: string;
  level: EducationalLevel;
  academicYear: string;
  maxCapacity: number;
  currentCapacity: number;
  tutorId: string;
  tutorName?: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  students: string[]; // IDs de estudiantes
}

export interface EducationalLevel {
  id: string;
  name: string;
  description: string;
  order: number; // Para ordenar niveles (1, 2, 3...)
  subjects: SubjectLevel[];
  isActive: boolean;
}

interface SubjectLevel {
  id: string;
  subjectId: string;
  subjectName: string;
  levelType: 'basic' | 'intermediate' | 'advanced';
  description: string;
  prerequisites: string[]; // IDs de otros SubjectLevel
  evaluationCriteria: EvaluationCriteria[];
}

interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // Peso en la evaluación (0-100)
  minScore: number; // Puntuación mínima para aprobar
  maxScore: number; // Puntuación máxima
}

export interface StudentGroupAssignment {
  id: string;
  studentId: string;
  studentName?: string;
  groupId: string;
  groupName?: string;
  assignedAt: Date;
  assignedBy: string; // ID del usuario que hizo la asignación
  isActive: boolean;
  notes?: string;
}

export interface StudentSubjectAssignment {
  id: string;
  studentId: string;
  studentName?: string;
  subjectLevelId: string;
  subjectName?: string;
  levelType: 'basic' | 'intermediate' | 'advanced';
  assignedAt: Date;
  assignedBy: string;
  progress: StudentProgress;
  isActive: boolean;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  subjectLevelId: string;
  currentScore: number;
  maxScore: number;
  completedCriteria: string[]; // IDs de criterios completados
  lastUpdated: Date;
  notes?: string;
}

export interface AssignmentHistory {
  id: string;
  studentId: string;
  type: 'group' | 'subject';
  fromId?: string; // ID del grupo/nivel anterior
  toId: string; // ID del grupo/nivel nuevo
  reason: string;
  changedBy: string;
  changedAt: Date;
  notes?: string;
}

export interface GroupReport {
  groupId: string;
  groupName: string;
  totalStudents: number;
  averageProgress: number;
  subjectDistribution: {
    subjectName: string;
    basic: number;
    intermediate: number;
    advanced: number;
  }[];
  attendanceRate: number;
  generatedAt: Date;
}

export interface LevelProgressReport {
  levelId: string;
  levelName: string;
  totalStudents: number;
  progressBySubject: {
    subjectName: string;
    averageScore: number;
    completionRate: number;
    studentsAtLevel: {
      basic: number;
      intermediate: number;
      advanced: number;
    };
  }[];
  generatedAt: Date;
}
