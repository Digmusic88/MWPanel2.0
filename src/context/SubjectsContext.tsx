import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Subject, 
  SubjectLevel, 
  SubjectGroup, 
  StudentEnrollment, 
  SubjectStats,
  EnrollmentAction,
  ClassSchedule
} from '../types/subjects';
import { useAuth } from './AuthContext';
import { useUsers } from './UsersContext';

// Datos de demostración
const DEMO_SUBJECTS: Subject[] = [
  {
    id: 'subj-math-001',
    name: 'Matemáticas',
    description: 'Matemáticas fundamentales y avanzadas',
    code: 'MAT101',
    department: 'Ciencias Exactas',
    credits: 4,
    color: '#3B82F6',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    levels: [
      {
        id: 'level-math-basic',
        name: 'Básico',
        description: 'Matemáticas básicas: aritmética, álgebra elemental',
        order: 1,
        requirements: [],
        maxStudents: 30,
        currentStudents: 15
      },
      {
        id: 'level-math-intermediate',
        name: 'Intermedio',
        description: 'Álgebra, geometría, trigonometría',
        order: 2,
        requirements: ['Matemáticas Básico'],
        maxStudents: 25,
        currentStudents: 12
      },
      {
        id: 'level-math-advanced',
        name: 'Avanzado',
        description: 'Cálculo, estadística avanzada',
        order: 3,
        requirements: ['Matemáticas Intermedio'],
        maxStudents: 20,
        currentStudents: 8
      }
    ],
    groups: [
      {
        id: 'group-math-basic-a',
        name: 'Grupo A',
        levelId: 'level-math-basic',
        teacherId: 'demo-teacher-001',
        teacherName: 'Profesor Demo',
        schedule: [
          {
            id: 'schedule-1',
            dayOfWeek: 1,
            startTime: '08:00',
            endTime: '09:30',
            classroom: 'Aula 101'
          },
          {
            id: 'schedule-2',
            dayOfWeek: 3,
            startTime: '08:00',
            endTime: '09:30',
            classroom: 'Aula 101'
          }
        ],
        maxStudents: 15,
        currentStudents: 8,
        students: []
      },
      {
        id: 'group-math-basic-b',
        name: 'Grupo B',
        levelId: 'level-math-basic',
        teacherId: 'demo-teacher-002',
        teacherName: 'Carlos Martínez',
        schedule: [
          {
            id: 'schedule-3',
            dayOfWeek: 2,
            startTime: '10:00',
            endTime: '11:30',
            classroom: 'Aula 102'
          },
          {
            id: 'schedule-4',
            dayOfWeek: 4,
            startTime: '10:00',
            endTime: '11:30',
            classroom: 'Aula 102'
          }
        ],
        maxStudents: 15,
        currentStudents: 7,
        students: []
      }
    ]
  },
  {
    id: 'subj-physics-001',
    name: 'Física',
    description: 'Física general y aplicada',
    code: 'FIS101',
    department: 'Ciencias Exactas',
    credits: 4,
    color: '#10B981',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    levels: [
      {
        id: 'level-physics-basic',
        name: 'Básico',
        description: 'Mecánica clásica, termodinámica básica',
        order: 1,
        requirements: ['Matemáticas Básico'],
        maxStudents: 25,
        currentStudents: 10
      },
      {
        id: 'level-physics-advanced',
        name: 'Avanzado',
        description: 'Electromagnetismo, física moderna',
        order: 2,
        requirements: ['Física Básico', 'Matemáticas Intermedio'],
        maxStudents: 20,
        currentStudents: 6
      }
    ],
    groups: [
      {
        id: 'group-physics-basic-a',
        name: 'Grupo A',
        levelId: 'level-physics-basic',
        teacherId: 'demo-teacher-002',
        teacherName: 'Carlos Martínez',
        schedule: [
          {
            id: 'schedule-5',
            dayOfWeek: 1,
            startTime: '14:00',
            endTime: '15:30',
            classroom: 'Lab. Física'
          },
          {
            id: 'schedule-6',
            dayOfWeek: 5,
            startTime: '14:00',
            endTime: '15:30',
            classroom: 'Lab. Física'
          }
        ],
        maxStudents: 15,
        currentStudents: 5,
        students: []
      }
    ]
  },
  {
    id: 'subj-chemistry-001',
    name: 'Química',
    description: 'Química general y orgánica',
    code: 'QUI101',
    department: 'Ciencias Exactas',
    credits: 3,
    color: '#8B5CF6',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    levels: [
      {
        id: 'level-chemistry-basic',
        name: 'Básico',
        description: 'Química general, tabla periódica, enlaces',
        order: 1,
        requirements: [],
        maxStudents: 20,
        currentStudents: 8
      }
    ],
    groups: [
      {
        id: 'group-chemistry-basic-a',
        name: 'Grupo A',
        levelId: 'level-chemistry-basic',
        teacherId: 'demo-teacher-002',
        teacherName: 'Carlos Martínez',
        schedule: [
          {
            id: 'schedule-7',
            dayOfWeek: 2,
            startTime: '15:30',
            endTime: '17:00',
            classroom: 'Lab. Química'
          }
        ],
        maxStudents: 20,
        currentStudents: 8,
        students: []
      }
    ]
  },
  {
    id: 'subj-history-001',
    name: 'Historia',
    description: 'Historia universal y nacional',
    code: 'HIS101',
    department: 'Humanidades',
    credits: 3,
    color: '#F59E0B',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    levels: [
      {
        id: 'level-history-basic',
        name: 'Básico',
        description: 'Historia antigua y medieval',
        order: 1,
        requirements: [],
        maxStudents: 30,
        currentStudents: 12
      },
      {
        id: 'level-history-modern',
        name: 'Moderno',
        description: 'Historia moderna y contemporánea',
        order: 2,
        requirements: ['Historia Básico'],
        maxStudents: 25,
        currentStudents: 8
      }
    ],
    groups: [
      {
        id: 'group-history-basic-a',
        name: 'Grupo A',
        levelId: 'level-history-basic',
        teacherId: 'demo-teacher-002',
        teacherName: 'Carlos Martínez',
        schedule: [
          {
            id: 'schedule-8',
            dayOfWeek: 3,
            startTime: '11:30',
            endTime: '13:00',
            classroom: 'Aula 201'
          }
        ],
        maxStudents: 30,
        currentStudents: 12,
        students: []
      }
    ]
  }
];

interface SubjectsContextType {
  // Estado
  subjects: Subject[];
  enrollments: StudentEnrollment[];
  loading: boolean;
  error: string | null;
  
  // CRUD Materias
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  
  // CRUD Niveles
  addLevel: (subjectId: string, level: Omit<SubjectLevel, 'id'>) => Promise<void>;
  updateLevel: (subjectId: string, levelId: string, level: Partial<SubjectLevel>) => Promise<void>;
  deleteLevel: (subjectId: string, levelId: string) => Promise<void>;
  
  // CRUD Grupos
  addGroup: (subjectId: string, group: Omit<SubjectGroup, 'id' | 'currentStudents' | 'students'>) => Promise<void>;
  updateGroup: (subjectId: string, groupId: string, group: Partial<SubjectGroup>) => Promise<void>;
  deleteGroup: (subjectId: string, groupId: string) => Promise<void>;
  
  // Gestión de Inscripciones
  enrollStudent: (studentId: string, subjectId: string, levelId: string, groupId: string, notes?: string) => Promise<void>;
  transferStudent: (studentId: string, fromGroupId: string, toSubjectId: string, toLevelId: string, toGroupId: string, reason?: string) => Promise<void>;
  removeStudent: (studentId: string, subjectId: string, reason?: string) => Promise<void>;
  changeLevelStudent: (studentId: string, subjectId: string, newLevelId: string, newGroupId: string, reason?: string) => Promise<void>;
  
  // Consultas
  getSubjectById: (id: string) => Subject | undefined;
  getEnrollmentsByStudent: (studentId: string) => StudentEnrollment[];
  getEnrollmentsBySubject: (subjectId: string) => StudentEnrollment[];
  getAvailableGroups: (subjectId: string, levelId: string) => SubjectGroup[];
  getSubjectStats: () => SubjectStats;
  
  // Búsqueda y filtros
  searchSubjects: (query: string) => Subject[];
  filterSubjectsByDepartment: (department: string) => Subject[];
}

const SubjectsContext = createContext<SubjectsContextType | undefined>(undefined);

export function SubjectsProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>(DEMO_SUBJECTS);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user: currentUser } = useAuth();
  const { getUsersByRole } = useUsers();

  // Inicializar inscripciones demo
  useEffect(() => {
    const students = getUsersByRole('student');
    const demoEnrollments: StudentEnrollment[] = [];
    
    // Inscribir algunos estudiantes demo
    students.slice(0, 3).forEach((student, index) => {
      // Matemáticas Básico
      demoEnrollments.push({
        id: `enrollment-${student.id}-math-basic`,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        subjectId: 'subj-math-001',
        levelId: 'level-math-basic',
        groupId: index % 2 === 0 ? 'group-math-basic-a' : 'group-math-basic-b',
        enrolledAt: new Date(),
        enrolledBy: currentUser?.id || 'system',
        status: 'active',
        attendance: 85 + Math.random() * 15,
        notes: 'Inscripción automática demo'
      });
      
      // Física Básico para algunos
      if (index < 2) {
        demoEnrollments.push({
          id: `enrollment-${student.id}-physics-basic`,
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          subjectId: 'subj-physics-001',
          levelId: 'level-physics-basic',
          groupId: 'group-physics-basic-a',
          enrolledAt: new Date(),
          enrolledBy: currentUser?.id || 'system',
          status: 'active',
          attendance: 80 + Math.random() * 20,
          notes: 'Inscripción automática demo'
        });
      }
    });
    
    setEnrollments(demoEnrollments);
  }, [currentUser, getUsersByRole]);

  // CRUD Materias
  const addSubject = async (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      setLoading(true);
      
      const newSubject: Subject = {
        ...subjectData,
        id: `subj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setSubjects(prev => [...prev, newSubject]);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear la materia';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateSubject = async (id: string, subjectData: Partial<Subject>) => {
    try {
      setError(null);
      setLoading(true);
      
      setSubjects(prev => prev.map(subject => 
        subject.id === id 
          ? { ...subject, ...subjectData, updatedAt: new Date() }
          : subject
      ));
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar la materia';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Verificar si hay estudiantes inscritos
      const subjectEnrollments = enrollments.filter(e => e.subjectId === id && e.status === 'active');
      if (subjectEnrollments.length > 0) {
        throw new Error(`No se puede eliminar la materia. Hay ${subjectEnrollments.length} estudiante(s) inscrito(s)`);
      }
      
      setSubjects(prev => prev.filter(subject => subject.id !== id));
      setEnrollments(prev => prev.filter(enrollment => enrollment.subjectId !== id));
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar la materia';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Gestión de Inscripciones
  const enrollStudent = async (studentId: string, subjectId: string, levelId: string, groupId: string, notes?: string) => {
    try {
      setError(null);
      
      // Verificar que el estudiante no esté ya inscrito en esta materia
      const existingEnrollment = enrollments.find(e => 
        e.studentId === studentId && e.subjectId === subjectId && e.status === 'active'
      );
      
      if (existingEnrollment) {
        throw new Error('El estudiante ya está inscrito en esta materia');
      }
      
      // Verificar capacidad del grupo
      const subject = subjects.find(s => s.id === subjectId);
      const group = subject?.groups.find(g => g.id === groupId);
      
      if (!group) {
        throw new Error('Grupo no encontrado');
      }
      
      const groupEnrollments = enrollments.filter(e => e.groupId === groupId && e.status === 'active');
      if (groupEnrollments.length >= group.maxStudents) {
        throw new Error('El grupo ha alcanzado su capacidad máxima');
      }
      
      // Obtener información del estudiante
      const students = getUsersByRole('student');
      const student = students.find(s => s.id === studentId);
      
      if (!student) {
        throw new Error('Estudiante no encontrado');
      }
      
      // Crear inscripción
      const newEnrollment: StudentEnrollment = {
        id: `enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        studentName: student.name,
        studentEmail: student.email,
        subjectId,
        levelId,
        groupId,
        enrolledAt: new Date(),
        enrolledBy: currentUser?.id || 'system',
        status: 'active',
        attendance: 100,
        notes
      };
      
      setEnrollments(prev => [...prev, newEnrollment]);
      
      // Actualizar contadores
      updateGroupStudentCount(subjectId, groupId, 1);
      updateLevelStudentCount(subjectId, levelId, 1);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al inscribir estudiante';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const transferStudent = async (studentId: string, fromGroupId: string, toSubjectId: string, toLevelId: string, toGroupId: string, reason?: string) => {
    try {
      setError(null);
      
      // Encontrar inscripción actual
      const currentEnrollment = enrollments.find(e => 
        e.studentId === studentId && e.groupId === fromGroupId && e.status === 'active'
      );
      
      if (!currentEnrollment) {
        throw new Error('Inscripción actual no encontrada');
      }
      
      // Verificar capacidad del grupo destino
      const targetSubject = subjects.find(s => s.id === toSubjectId);
      const targetGroup = targetSubject?.groups.find(g => g.id === toGroupId);
      
      if (!targetGroup) {
        throw new Error('Grupo destino no encontrado');
      }
      
      const targetGroupEnrollments = enrollments.filter(e => e.groupId === toGroupId && e.status === 'active');
      if (targetGroupEnrollments.length >= targetGroup.maxStudents) {
        throw new Error('El grupo destino ha alcanzado su capacidad máxima');
      }
      
      // Si es la misma materia, actualizar inscripción existente
      if (currentEnrollment.subjectId === toSubjectId) {
        setEnrollments(prev => prev.map(enrollment => 
          enrollment.id === currentEnrollment.id
            ? { ...enrollment, levelId: toLevelId, groupId: toGroupId }
            : enrollment
        ));
        
        // Actualizar contadores
        updateGroupStudentCount(currentEnrollment.subjectId, currentEnrollment.groupId, -1);
        updateLevelStudentCount(currentEnrollment.subjectId, currentEnrollment.levelId, -1);
        updateGroupStudentCount(toSubjectId, toGroupId, 1);
        updateLevelStudentCount(toSubjectId, toLevelId, 1);
      } else {
        // Diferente materia: remover de la actual e inscribir en la nueva
        await removeStudent(studentId, currentEnrollment.subjectId, reason);
        await enrollStudent(studentId, toSubjectId, toLevelId, toGroupId, reason);
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al transferir estudiante';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const removeStudent = async (studentId: string, subjectId: string, reason?: string) => {
    try {
      setError(null);
      
      const enrollment = enrollments.find(e => 
        e.studentId === studentId && e.subjectId === subjectId && e.status === 'active'
      );
      
      if (!enrollment) {
        throw new Error('Inscripción no encontrada');
      }
      
      // Marcar como inactiva
      setEnrollments(prev => prev.map(e => 
        e.id === enrollment.id 
          ? { ...e, status: 'dropped' as const, notes: reason }
          : e
      ));
      
      // Actualizar contadores
      updateGroupStudentCount(enrollment.subjectId, enrollment.groupId, -1);
      updateLevelStudentCount(enrollment.subjectId, enrollment.levelId, -1);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al remover estudiante';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const changeLevelStudent = async (studentId: string, subjectId: string, newLevelId: string, newGroupId: string, reason?: string) => {
    try {
      setError(null);
      
      const enrollment = enrollments.find(e => 
        e.studentId === studentId && e.subjectId === subjectId && e.status === 'active'
      );
      
      if (!enrollment) {
        throw new Error('Inscripción no encontrada');
      }
      
      // Verificar capacidad del nuevo grupo
      const subject = subjects.find(s => s.id === subjectId);
      const newGroup = subject?.groups.find(g => g.id === newGroupId);
      
      if (!newGroup) {
        throw new Error('Nuevo grupo no encontrado');
      }
      
      const newGroupEnrollments = enrollments.filter(e => e.groupId === newGroupId && e.status === 'active');
      if (newGroupEnrollments.length >= newGroup.maxStudents) {
        throw new Error('El nuevo grupo ha alcanzado su capacidad máxima');
      }
      
      // Actualizar inscripción
      setEnrollments(prev => prev.map(e => 
        e.id === enrollment.id 
          ? { ...e, levelId: newLevelId, groupId: newGroupId, notes: reason }
          : e
      ));
      
      // Actualizar contadores
      updateGroupStudentCount(subjectId, enrollment.groupId, -1);
      updateLevelStudentCount(subjectId, enrollment.levelId, -1);
      updateGroupStudentCount(subjectId, newGroupId, 1);
      updateLevelStudentCount(subjectId, newLevelId, 1);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cambiar nivel del estudiante';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Funciones auxiliares
  const updateGroupStudentCount = (subjectId: string, groupId: string, delta: number) => {
    setSubjects(prev => prev.map(subject => 
      subject.id === subjectId 
        ? {
            ...subject,
            groups: subject.groups.map(group => 
              group.id === groupId 
                ? { ...group, currentStudents: Math.max(0, group.currentStudents + delta) }
                : group
            )
          }
        : subject
    ));
  };

  const updateLevelStudentCount = (subjectId: string, levelId: string, delta: number) => {
    setSubjects(prev => prev.map(subject => 
      subject.id === subjectId 
        ? {
            ...subject,
            levels: subject.levels.map(level => 
              level.id === levelId 
                ? { ...level, currentStudents: Math.max(0, level.currentStudents + delta) }
                : level
            )
          }
        : subject
    ));
  };

  // Consultas
  const getSubjectById = (id: string) => {
    return subjects.find(subject => subject.id === id);
  };

  const getEnrollmentsByStudent = (studentId: string) => {
    return enrollments.filter(enrollment => enrollment.studentId === studentId && enrollment.status === 'active');
  };

  const getEnrollmentsBySubject = (subjectId: string) => {
    return enrollments.filter(enrollment => enrollment.subjectId === subjectId && enrollment.status === 'active');
  };

  const getAvailableGroups = (subjectId: string, levelId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return [];
    
    return subject.groups.filter(group => 
      group.levelId === levelId && group.currentStudents < group.maxStudents
    );
  };

  const getSubjectStats = (): SubjectStats => {
    const activeSubjects = subjects.filter(s => s.isActive);
    const activeEnrollments = enrollments.filter(e => e.status === 'active');
    
    const subjectsByDepartment: Record<string, number> = {};
    const enrollmentsByLevel: Record<string, number> = {};
    
    subjects.forEach(subject => {
      subjectsByDepartment[subject.department] = (subjectsByDepartment[subject.department] || 0) + 1;
    });
    
    activeEnrollments.forEach(enrollment => {
      const subject = subjects.find(s => s.id === enrollment.subjectId);
      const level = subject?.levels.find(l => l.id === enrollment.levelId);
      if (level) {
        enrollmentsByLevel[level.name] = (enrollmentsByLevel[level.name] || 0) + 1;
      }
    });
    
    return {
      totalSubjects: subjects.length,
      activeSubjects: activeSubjects.length,
      totalEnrollments: activeEnrollments.length,
      averageEnrollmentPerSubject: activeSubjects.length > 0 ? activeEnrollments.length / activeSubjects.length : 0,
      subjectsByDepartment,
      enrollmentsByLevel
    };
  };

  const searchSubjects = (query: string) => {
    if (!query.trim()) return subjects;
    
    const lowercaseQuery = query.toLowerCase();
    return subjects.filter(subject =>
      subject.name.toLowerCase().includes(lowercaseQuery) ||
      subject.code.toLowerCase().includes(lowercaseQuery) ||
      subject.department.toLowerCase().includes(lowercaseQuery) ||
      subject.description.toLowerCase().includes(lowercaseQuery)
    );
  };

  const filterSubjectsByDepartment = (department: string) => {
    if (department === 'all') return subjects;
    return subjects.filter(subject => subject.department === department);
  };

  // CRUD Niveles y Grupos (implementación básica)
  const addLevel = async (subjectId: string, level: Omit<SubjectLevel, 'id'>) => {
    const newLevel: SubjectLevel = {
      ...level,
      id: `level-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setSubjects(prev => prev.map(subject => 
      subject.id === subjectId 
        ? { ...subject, levels: [...subject.levels, newLevel] }
        : subject
    ));
  };

  const updateLevel = async (subjectId: string, levelId: string, level: Partial<SubjectLevel>) => {
    setSubjects(prev => prev.map(subject => 
      subject.id === subjectId 
        ? {
            ...subject,
            levels: subject.levels.map(l => 
              l.id === levelId ? { ...l, ...level } : l
            )
          }
        : subject
    ));
  };

  const deleteLevel = async (subjectId: string, levelId: string) => {
    // Verificar si hay estudiantes en este nivel
    const levelEnrollments = enrollments.filter(e => e.levelId === levelId && e.status === 'active');
    if (levelEnrollments.length > 0) {
      throw new Error(`No se puede eliminar el nivel. Hay ${levelEnrollments.length} estudiante(s) inscrito(s)`);
    }
    
    setSubjects(prev => prev.map(subject => 
      subject.id === subjectId 
        ? { ...subject, levels: subject.levels.filter(l => l.id !== levelId) }
        : subject
    ));
  };

  const addGroup = async (subjectId: string, group: Omit<SubjectGroup, 'id' | 'currentStudents' | 'students'>) => {
    const newGroup: SubjectGroup = {
      ...group,
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      currentStudents: 0,
      students: []
    };
    
    setSubjects(prev => prev.map(subject => 
      subject.id === subjectId 
        ? { ...subject, groups: [...subject.groups, newGroup] }
        : subject
    ));
  };

  const updateGroup = async (subjectId: string, groupId: string, group: Partial<SubjectGroup>) => {
    setSubjects(prev => prev.map(subject => 
      subject.id === subjectId 
        ? {
            ...subject,
            groups: subject.groups.map(g => 
              g.id === groupId ? { ...g, ...group } : g
            )
          }
        : subject
    ));
  };

  const deleteGroup = async (subjectId: string, groupId: string) => {
    // Verificar si hay estudiantes en este grupo
    const groupEnrollments = enrollments.filter(e => e.groupId === groupId && e.status === 'active');
    if (groupEnrollments.length > 0) {
      throw new Error(`No se puede eliminar el grupo. Hay ${groupEnrollments.length} estudiante(s) inscrito(s)`);
    }
    
    setSubjects(prev => prev.map(subject => 
      subject.id === subjectId 
        ? { ...subject, groups: subject.groups.filter(g => g.id !== groupId) }
        : subject
    ));
  };

  return (
    <SubjectsContext.Provider value={{
      subjects,
      enrollments,
      loading,
      error,
      addSubject,
      updateSubject,
      deleteSubject,
      addLevel,
      updateLevel,
      deleteLevel,
      addGroup,
      updateGroup,
      deleteGroup,
      enrollStudent,
      transferStudent,
      removeStudent,
      changeLevelStudent,
      getSubjectById,
      getEnrollmentsByStudent,
      getEnrollmentsBySubject,
      getAvailableGroups,
      getSubjectStats,
      searchSubjects,
      filterSubjectsByDepartment
    }}>
      {children}
    </SubjectsContext.Provider>
  );
}

export function useSubjects() {
  const context = useContext(SubjectsContext);
  if (context === undefined) {
    throw new Error('useSubjects debe ser usado dentro de un SubjectsProvider');
  }
  return context;
}