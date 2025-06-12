import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AcademicGroup, 
  EducationalLevel, 
  StudentGroupAssignment, 
  StudentSubjectAssignment,
  AssignmentHistory,
  GroupReport,
  LevelProgressReport,
  StudentProgress
} from '../types/groups';
import { useAuth } from './AuthContext';

// Datos de demostración
const DEMO_LEVELS: EducationalLevel[] = [
  {
    id: 'level-0',
    name: 'Educación Infantil',
    description: 'Niveles iniciales de educación infantil (3-6 años)',
    order: 0,
    subjects: [
      {
        id: 'subj-basic-0',
        subjectId: 'basic-skills',
        subjectName: 'Habilidades Básicas',
        levelType: 'basic',
        description: 'Desarrollo de habilidades motoras, sociales y cognitivas básicas',
        prerequisites: [],
        evaluationCriteria: [
          {
            id: 'crit-0-1',
            name: 'Desarrollo motor',
            description: 'Coordinación y habilidades motoras finas y gruesas',
            weight: 30,
            minScore: 50,
            maxScore: 100
          },
          {
            id: 'crit-0-2',
            name: 'Habilidades sociales',
            description: 'Interacción con compañeros y seguimiento de normas',
            weight: 40,
            minScore: 60,
            maxScore: 100
          },
          {
            id: 'crit-0-3',
            name: 'Desarrollo cognitivo',
            description: 'Reconocimiento de formas, colores, números y letras básicas',
            weight: 30,
            minScore: 50,
            maxScore: 100
          }
        ]
      }
    ],
    isActive: true
  },
  {
    id: 'level-1',
    name: 'Educación Primaria',
    description: 'Niveles básicos de educación primaria',
    order: 1,
    subjects: [
      {
        id: 'subj-math-1',
        subjectId: 'math',
        subjectName: 'Matemáticas',
        levelType: 'basic',
        description: 'Matemáticas básicas: suma, resta, multiplicación',
        prerequisites: [],
        evaluationCriteria: [
          {
            id: 'crit-1',
            name: 'Operaciones básicas',
            description: 'Dominio de suma, resta, multiplicación y división',
            weight: 40,
            minScore: 60,
            maxScore: 100
          },
          {
            id: 'crit-2',
            name: 'Resolución de problemas',
            description: 'Capacidad para resolver problemas matemáticos simples',
            weight: 60,
            minScore: 70,
            maxScore: 100
          }
        ]
      }
    ],
    isActive: true
  },
  {
    id: 'level-2',
    name: 'Educación Secundaria',
    description: 'Niveles intermedios de educación secundaria',
    order: 2,
    subjects: [
      {
        id: 'subj-math-2',
        subjectId: 'math',
        subjectName: 'Matemáticas',
        levelType: 'intermediate',
        description: 'Álgebra básica, geometría, estadística',
        prerequisites: ['subj-math-1'],
        evaluationCriteria: [
          {
            id: 'crit-3',
            name: 'Álgebra',
            description: 'Resolución de ecuaciones lineales y cuadráticas',
            weight: 50,
            minScore: 65,
            maxScore: 100
          },
          {
            id: 'crit-4',
            name: 'Geometría',
            description: 'Cálculo de áreas, perímetros y volúmenes',
            weight: 50,
            minScore: 65,
            maxScore: 100
          }
        ]
      }
    ],
    isActive: true
  }
];

const DEMO_GROUPS: AcademicGroup[] = [
  {
    id: 'group-0',
    name: 'Infantil 5 años A',
    description: 'Grupo de educación infantil para niños de 5 años',
    level: DEMO_LEVELS[0], // Educación Infantil
    academicYear: '2024-2025',
    maxCapacity: 20,
    currentCapacity: 1,
    tutorId: 'demo-teacher-001',
    tutorName: 'Profesor Demo',
    isActive: true,
    isArchived: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    students: ['demo-student-001']
  },
  {
    id: 'group-1',
    name: '10° Grado A',
    description: 'Grupo principal de décimo grado',
    level: DEMO_LEVELS[1],
    academicYear: '2024-2025',
    maxCapacity: 30,
    currentCapacity: 2,
    tutorId: 'demo-teacher-001',
    tutorName: 'Profesor Demo',
    isActive: true,
    isArchived: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    students: ['demo-student-001', 'demo-student-002']
  },
  {
    id: 'group-2',
    name: '11° Grado B',
    description: 'Grupo avanzado de undécimo grado',
    level: DEMO_LEVELS[1],
    academicYear: '2024-2025',
    maxCapacity: 28,
    currentCapacity: 0,
    tutorId: 'demo-teacher-002',
    tutorName: 'Carlos Martínez',
    isActive: true,
    isArchived: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    students: []
  },
  {
    id: 'group-archived-1',
    name: '9° Grado C (2023-2024)',
    description: 'Grupo archivado del año académico anterior',
    level: DEMO_LEVELS[1],
    academicYear: '2023-2024',
    maxCapacity: 25,
    currentCapacity: 0,
    tutorId: 'demo-teacher-002',
    tutorName: 'Carlos Martínez',
    isActive: false,
    isArchived: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-06-30'),
    students: []
  }
];

interface GroupsContextType {
  // Grupos
  groups: AcademicGroup[];
  levels: EducationalLevel[];
  groupAssignments: StudentGroupAssignment[];
  subjectAssignments: StudentSubjectAssignment[];
  assignmentHistory: AssignmentHistory[];
  
  // CRUD Grupos
  addGroup: (group: Omit<AcademicGroup, 'id' | 'createdAt' | 'updatedAt' | 'currentCapacity'>) => Promise<void>;
  updateGroup: (id: string, group: Partial<AcademicGroup>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  archiveGroup: (id: string, reason?: string) => Promise<void>;
  unarchiveGroup: (id: string, reason?: string) => Promise<void>;
  
  // CRUD Niveles
  addLevel: (level: Omit<EducationalLevel, 'id'>) => Promise<void>;
  updateLevel: (id: string, level: Partial<EducationalLevel>) => Promise<void>;
  deleteLevel: (id: string) => Promise<void>;
  
  // Asignaciones
  assignStudentToGroup: (studentId: string, groupId: string, notes?: string) => Promise<void>;
  removeStudentFromGroup: (studentId: string, groupId: string, reason: string) => Promise<void>;
  assignStudentToSubjectLevel: (studentId: string, subjectLevelId: string) => Promise<void>;
  updateStudentProgress: (studentId: string, subjectLevelId: string, progress: Partial<StudentProgress>) => Promise<void>;
  
  // Consultas
  getGroupsByLevel: (levelId: string) => AcademicGroup[];
  getStudentsByGroup: (groupId: string) => string[];
  getGroupsByTutor: (tutorId: string) => AcademicGroup[];
  getAvailableGroups: () => AcademicGroup[];
  getActiveGroups: () => AcademicGroup[];
  getArchivedGroups: () => AcademicGroup[];
  
  // Reportes
  generateGroupReport: (groupId: string) => Promise<GroupReport>;
  generateLevelProgressReport: (levelId: string) => Promise<LevelProgressReport>;
  
  // Estado
  loading: boolean;
  error: string | null;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export function GroupsProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<AcademicGroup[]>(DEMO_GROUPS);
  const [levels, setLevels] = useState<EducationalLevel[]>(DEMO_LEVELS);
  const [groupAssignments, setGroupAssignments] = useState<StudentGroupAssignment[]>([]);
  const [subjectAssignments, setSubjectAssignments] = useState<StudentSubjectAssignment[]>([]);
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user: currentUser } = useAuth();

  // CRUD Grupos
  const addGroup = async (groupData: Omit<AcademicGroup, 'id' | 'createdAt' | 'updatedAt' | 'currentCapacity'>) => {
    try {
      setError(null);
      setLoading(true);
      
      const newGroup: AcademicGroup = {
        ...groupData,
        id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        currentCapacity: 0,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setGroups(prev => [...prev, newGroup]);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear el grupo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (id: string, groupData: Partial<AcademicGroup>) => {
    try {
      setError(null);
      setLoading(true);
      
      setGroups(prev => prev.map(group => 
        group.id === id 
          ? { ...group, ...groupData, updatedAt: new Date() }
          : group
      ));
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar el grupo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Verificar si el grupo tiene estudiantes asignados
      const group = groups.find(g => g.id === id);
      if (group && group.currentCapacity > 0) {
        throw new Error('No se puede eliminar un grupo que tiene estudiantes asignados');
      }
      
      setGroups(prev => prev.filter(group => group.id !== id));
      // También eliminar asignaciones relacionadas
      setGroupAssignments(prev => prev.filter(assignment => assignment.groupId !== id));
      
      // Registrar en historial
      const historyEntry: AssignmentHistory = {
        id: `history-${Date.now()}`,
        studentId: '',
        type: 'group',
        fromId: id,
        toId: '',
        reason: 'Grupo eliminado',
        changedBy: currentUser?.id || 'system',
        changedAt: new Date(),
        notes: 'Eliminación de grupo completo'
      };
      setAssignmentHistory(prev => [...prev, historyEntry]);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar el grupo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const archiveGroup = async (id: string, reason?: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const group = groups.find(g => g.id === id);
      if (!group) {
        throw new Error('Grupo no encontrado');
      }
      
      // Verificar si el grupo tiene estudiantes asignados
      if (group.currentCapacity > 0) {
        throw new Error('No se puede archivar un grupo que tiene estudiantes asignados. Primero remueve todos los estudiantes.');
      }
      
      // Archivar grupo
      setGroups(prev => prev.map(g => 
        g.id === id 
          ? { ...g, isArchived: true, isActive: false, updatedAt: new Date() }
          : g
      ));
      
      // Registrar en historial
      const historyEntry: AssignmentHistory = {
        id: `history-${Date.now()}`,
        studentId: '',
        type: 'group',
        fromId: id,
        toId: '',
        reason: reason || 'Grupo archivado',
        changedBy: currentUser?.id || 'system',
        changedAt: new Date(),
        notes: `Grupo ${group.name} archivado`
      };
      setAssignmentHistory(prev => [...prev, historyEntry]);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al archivar el grupo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const unarchiveGroup = async (id: string, reason?: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const group = groups.find(g => g.id === id);
      if (!group) {
        throw new Error('Grupo no encontrado');
      }
      
      if (!group.isArchived) {
        throw new Error('El grupo no está archivado');
      }
      
      // Desarchivar grupo
      setGroups(prev => prev.map(g => 
        g.id === id 
          ? { ...g, isArchived: false, isActive: true, updatedAt: new Date() }
          : g
      ));
      
      // Registrar en historial
      const historyEntry: AssignmentHistory = {
        id: `history-${Date.now()}`,
        studentId: '',
        type: 'group',
        fromId: '',
        toId: id,
        reason: reason || 'Grupo desarchivado',
        changedBy: currentUser?.id || 'system',
        changedAt: new Date(),
        notes: `Grupo ${group.name} desarchivado`
      };
      setAssignmentHistory(prev => [...prev, historyEntry]);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al desarchivar el grupo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Niveles
  const addLevel = async (levelData: Omit<EducationalLevel, 'id'>) => {
    try {
      setError(null);
      const newLevel: EducationalLevel = {
        ...levelData,
        id: `level-${Date.now()}`
      };
      setLevels(prev => [...prev, newLevel]);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear el nivel';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateLevel = async (id: string, levelData: Partial<EducationalLevel>) => {
    try {
      setError(null);
      setLevels(prev => prev.map(level => 
        level.id === id ? { ...level, ...levelData } : level
      ));
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar el nivel';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteLevel = async (id: string) => {
    try {
      setError(null);
      
      // Verificar si hay grupos usando este nivel
      const groupsUsingLevel = groups.filter(group => group.level.id === id);
      if (groupsUsingLevel.length > 0) {
        throw new Error(`No se puede eliminar el nivel. Hay ${groupsUsingLevel.length} grupo(s) usando este nivel`);
      }
      
      setLevels(prev => prev.filter(level => level.id !== id));
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar el nivel';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Asignaciones
  const assignStudentToGroup = async (studentId: string, groupId: string, notes?: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Verificar que el grupo existe
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Grupo no encontrado');
      }
      
      // Verificar que el grupo está activo
      if (!group.isActive) {
        throw new Error('No se puede asignar estudiantes a un grupo inactivo');
      }
      
      // Verificar capacidad del grupo
      if (group.currentCapacity >= group.maxCapacity) {
        throw new Error('El grupo ha alcanzado su capacidad máxima');
      }

      // Verificar que el estudiante no esté ya asignado
      if (group.students.includes(studentId)) {
        throw new Error('El estudiante ya está asignado a este grupo');
      }

      // Verificar que el estudiante existe y está activo
      const allUsers = users || [];
      const student = allUsers.find(u => u.id === studentId && u.role === 'student');
      if (!student) {
        throw new Error('Estudiante no encontrado');
      }
      if (!student.isActive) {
        throw new Error('No se puede asignar un estudiante inactivo');
      }
      // Crear nueva asignación
      const newAssignment: StudentGroupAssignment = {
        id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        studentName: student.name,
        groupId,
        groupName: group.name,
        assignedAt: new Date(),
        assignedBy: currentUser?.id || 'system',
        isActive: true,
        notes
      };

      setGroupAssignments(prev => [...prev, newAssignment]);
      
      // Actualizar grupo
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { 
              ...g, 
              currentCapacity: g.currentCapacity + 1, 
              students: [...g.students, studentId],
              updatedAt: new Date()
            }
          : g
      ));

      // Registrar en historial
      const historyEntry: AssignmentHistory = {
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        type: 'group',
        toId: groupId,
        reason: 'Asignación a grupo',
        changedBy: currentUser?.id || 'system',
        changedAt: new Date(),
        notes
      };
      setAssignmentHistory(prev => [...prev, historyEntry]);

    } catch (err: any) {
      const errorMessage = err.message || 'Error al asignar estudiante al grupo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeStudentFromGroup = async (studentId: string, groupId: string, reason: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Verificar que el grupo existe
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Grupo no encontrado');
      }

      // Verificar que el estudiante está asignado al grupo
      if (!group.students.includes(studentId)) {
        throw new Error('El estudiante no está asignado a este grupo');
      }

      // Obtener información del estudiante para el historial
      const allUsers = users || [];
      const student = allUsers.find(u => u.id === studentId);
      const studentName = student ? student.name : 'Estudiante desconocido';
      // Desactivar asignación
      setGroupAssignments(prev => prev.map(assignment => 
        assignment.studentId === studentId && assignment.groupId === groupId
          ? { ...assignment, isActive: false }
          : assignment
      ));

      // Actualizar grupo
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { 
              ...g, 
              currentCapacity: Math.max(0, g.currentCapacity - 1),
              students: g.students.filter(id => id !== studentId),
              updatedAt: new Date()
            }
          : g
      ));

      // Registrar en historial
      const historyEntry: AssignmentHistory = {
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        type: 'group',
        fromId: groupId,
        toId: '',
        reason,
        changedBy: currentUser?.id || 'system',
        changedAt: new Date(),
        notes: `Estudiante ${studentName} removido del grupo ${group.name}`
      };
      setAssignmentHistory(prev => [...prev, historyEntry]);

    } catch (err: any) {
      const errorMessage = err.message || 'Error al remover estudiante del grupo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const assignStudentToSubjectLevel = async (studentId: string, subjectLevelId: string) => {
    try {
      setError(null);
      
      const newAssignment: StudentSubjectAssignment = {
        id: `subj-assignment-${Date.now()}`,
        studentId,
        subjectLevelId,
        levelType: 'basic', // Se determinaría según el nivel
        assignedAt: new Date(),
        assignedBy: currentUser?.id || 'system',
        progress: {
          id: `progress-${Date.now()}`,
          studentId,
          subjectLevelId,
          currentScore: 0,
          maxScore: 100,
          completedCriteria: [],
          lastUpdated: new Date()
        },
        isActive: true
      };

      setSubjectAssignments(prev => [...prev, newAssignment]);

    } catch (err: any) {
      const errorMessage = err.message || 'Error al asignar estudiante a materia';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateStudentProgress = async (studentId: string, subjectLevelId: string, progressData: any) => {
    try {
      setError(null);
      
      setSubjectAssignments(prev => prev.map(assignment => 
        assignment.studentId === studentId && assignment.subjectLevelId === subjectLevelId
          ? { 
              ...assignment, 
              progress: { 
                ...assignment.progress, 
                ...progressData, 
                lastUpdated: new Date() 
              }
            }
          : assignment
      ));

    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar progreso';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Consultas
  const getGroupsByLevel = (levelId: string) => {
    return groups.filter(group => group.level.id === levelId);
  };

  const getStudentsByGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.students : [];
  };

  const getGroupsByTutor = (tutorId: string) => {
    return groups.filter(group => group.tutorId === tutorId);
  };

  const getAvailableGroups = () => {
    return groups.filter(group => group.currentCapacity < group.maxCapacity && group.isActive);
  };

  const getActiveGroups = () => {
    return groups.filter(group => !group.isArchived);
  };

  const getArchivedGroups = () => {
    return groups.filter(group => group.isArchived);
  };

  // Reportes
  const generateGroupReport = async (groupId: string): Promise<GroupReport> => {
    const group = groups.find(g => g.id === groupId);
    if (!group) throw new Error('Grupo no encontrado');

    return {
      groupId,
      groupName: group.name,
      totalStudents: group.currentCapacity,
      averageProgress: 85, // Simulado
      subjectDistribution: [
        {
          subjectName: 'Matemáticas',
          basic: 5,
          intermediate: 15,
          advanced: 5
        },
        {
          subjectName: 'Ciencias',
          basic: 8,
          intermediate: 12,
          advanced: 5
        }
      ],
      attendanceRate: 92,
      generatedAt: new Date()
    };
  };

  const generateLevelProgressReport = async (levelId: string): Promise<LevelProgressReport> => {
    const level = levels.find(l => l.id === levelId);
    if (!level) throw new Error('Nivel no encontrado');

    const groupsInLevel = getGroupsByLevel(levelId);
    const totalStudents = groupsInLevel.reduce((sum, group) => sum + group.currentCapacity, 0);

    return {
      levelId,
      levelName: level.name,
      totalStudents,
      progressBySubject: [
        {
          subjectName: 'Matemáticas',
          averageScore: 82,
          completionRate: 78,
          studentsAtLevel: {
            basic: 15,
            intermediate: 25,
            advanced: 10
          }
        }
      ],
      generatedAt: new Date()
    };
  };

  return (
    <GroupsContext.Provider value={{
      groups,
      levels,
      groupAssignments,
      subjectAssignments,
      assignmentHistory,
      addGroup,
      updateGroup,
      deleteGroup,
      archiveGroup,
      unarchiveGroup,
      addLevel,
      updateLevel,
      deleteLevel,
      assignStudentToGroup,
      removeStudentFromGroup,
      assignStudentToSubjectLevel,
      updateStudentProgress,
      getGroupsByLevel,
      getStudentsByGroup,
      getGroupsByTutor,
      getAvailableGroups,
      getActiveGroups,
      getArchivedGroups,
      generateGroupReport,
      generateLevelProgressReport,
      loading,
      error
    }}>
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupsContext);
  if (context === undefined) {
    throw new Error('useGroups debe ser usado dentro de un GroupsProvider');
  }
  return context;
}
