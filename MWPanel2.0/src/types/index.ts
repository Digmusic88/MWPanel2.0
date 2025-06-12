export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  avatar?: string;
  phone?: string;
  createdAt: Date;
  isActive: boolean;
  lastLogin?: Date;
  grade?: string; // Renombrado de "grado" a "grupo base" en UI
  subjects?: string[]; // Para profesores
  children?: string[]; // Para padres - IDs de estudiantes conectados
  parentIds?: string[]; // Para estudiantes - IDs de múltiples padres conectados
}

interface Course {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  students: string[];
  startDate: Date;
  endDate: Date;
  color: string;
}

interface Subject {
  id: string;
  name: string;
  courseId: string;
  teacherId: string;
  description: string;
}

interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  value: number;
  maxValue: number;
  description: string;
  date: Date;
  teacherId: string;
}

interface Attendance {
  id: string;
  studentId: string;
  subjectId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'justified';
  notes?: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  teacherId: string;
  dueDate: Date;
  maxPoints: number;
  submissions: AssignmentSubmission[];
  resources: string[];
}

interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  files: string[];
  submittedAt: Date;
  grade?: number;
  feedback?: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface EducationalResource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'link' | 'image';
  url: string;
  subjectId: string;
  uploadedBy: string;
  uploadedAt: Date;
}
