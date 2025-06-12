import React, { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  useSortable,
  CSS,
} from '@dnd-kit/sortable';
import { 
  Users, 
  UserMinus, 
  GraduationCap, 
  Clock, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  Info,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Subject, StudentEnrollment, SubjectLevel, SubjectGroup } from '../../../types/subjects';
import { useSubjects } from '../../../context/SubjectsContext';
import { useUsers } from '../../../context/UsersContext';

interface StudentEnrollmentPanelProps {
  subject: Subject;
  onClose: () => void;
}

interface DraggedStudent {
  id: string;
  name: string;
  email: string;
  currentLevelId: string;
  currentGroupId: string;
}

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

// Componente para estudiante arrastrable
function DraggableStudent({ 
  student, 
  enrollment, 
  onRemove, 
  onLevelChange,
  subject,
  disabled = false
}: {
  student: any;
  enrollment: StudentEnrollment;
  onRemove: () => void;
  onLevelChange: (newLevelId: string, newGroupId: string) => void;
  subject: Subject;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: enrollment.id,
    disabled,
    data: {
      type: 'student',
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        currentLevelId: enrollment.levelId,
        currentGroupId: enrollment.groupId,
      }
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const currentLevel = subject.levels.find(l => l.id === enrollment.levelId);
  const currentGroup = subject.groups.find(g => g.id === enrollment.groupId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{student.name}</div>
            <div className="text-sm text-gray-500">{student.email}</div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {currentLevel?.name}
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {currentGroup?.name}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Selector de nivel/grupo */}
          <select
            value={`${enrollment.levelId}-${enrollment.groupId}`}
            onChange={(e) => {
              const [levelId, groupId] = e.target.value.split('-');
              onLevelChange(levelId, groupId);
            }}
            className="text-xs border border-gray-300 rounded px-2 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            {subject.levels.map(level => 
              subject.groups
                .filter(group => group.levelId === level.id)
                .map(group => (
                  <option key={`${level.id}-${group.id}`} value={`${level.id}-${group.id}`}>
                    {level.name} - {group.name}
                  </option>
                ))
            )}
          </select>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Remover del curso"
          >
            <UserMinus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente para zona de drop
function DropZone({ 
  level, 
  group, 
  students, 
  subject,
  onStudentRemove,
  onStudentLevelChange,
  isOver = false 
}: {
  level: SubjectLevel;
  group: SubjectGroup;
  students: { student: any; enrollment: StudentEnrollment }[];
  subject: Subject;
  onStudentRemove: (studentId: string) => void;
  onStudentLevelChange: (studentId: string, newLevelId: string, newGroupId: string) => void;
  isOver?: boolean;
}) {
  const capacityPercentage = group.maxStudents > 0 ? (group.currentStudents / group.maxStudents) * 100 : 0;
  
  const getCapacityColor = () => {
    if (capacityPercentage >= 90) return 'border-red-300 bg-red-50';
    if (capacityPercentage >= 75) return 'border-yellow-300 bg-yellow-50';
    return 'border-green-300 bg-green-50';
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[dayOfWeek];
  };

  return (
    <SortableContext items={students.map(s => s.enrollment.id)} strategy={verticalListSortingStrategy}>
      <div className={`border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
        isOver ? 'border-blue-500 bg-blue-50' : getCapacityColor()
      }`}>
        {/* Header del grupo */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-gray-900">
              {level.name} - {group.name}
            </h4>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {group.currentStudents}/{group.maxStudents}
              </span>
              <span className="flex items-center">
                <GraduationCap className="w-4 h-4 mr-1" />
                {group.teacherName}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-sm font-medium ${
              capacityPercentage >= 90 ? 'text-red-600' :
              capacityPercentage >= 75 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {Math.round(capacityPercentage)}% ocupado
            </div>
          </div>
        </div>

        {/* Horarios */}
        {group.schedule.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {group.schedule.map(schedule => (
                <div key={schedule.id} className="flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded">
                  <Clock className="w-3 h-3" />
                  <span>{getDayName(schedule.dayOfWeek)} {schedule.startTime}-{schedule.endTime}</span>
                  <MapPin className="w-3 h-3 ml-1" />
                  <span>{schedule.classroom}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de estudiantes */}
        <div className="space-y-2">
          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No hay estudiantes en este grupo</p>
              <p className="text-xs">Arrastra estudiantes aquí para asignarlos</p>
            </div>
          ) : (
            students.map(({ student, enrollment }) => (
              <DraggableStudent
                key={enrollment.id}
                student={student}
                enrollment={enrollment}
                subject={subject}
                onRemove={() => onStudentRemove(student.id)}
                onLevelChange={(newLevelId, newGroupId) => 
                  onStudentLevelChange(student.id, newLevelId, newGroupId)
                }
              />
            ))
          )}
        </div>
      </div>
    </SortableContext>
  );
}

export default function StudentEnrollmentPanel({ subject, onClose }: StudentEnrollmentPanelProps) {
  const { 
    getEnrollmentsBySubject, 
    removeStudent, 
    changeLevelStudent, 
    transferStudent,
    enrollStudent 
  } = useSubjects();
  const { getUsersByRole } = useUsers();
  
  const [notification, setNotification] = useState<Notification | null>(null);
  const [draggedStudent, setDraggedStudent] = useState<DraggedStudent | null>(null);
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set(subject.levels.map(l => l.id)));
  const [showAvailableStudents, setShowAvailableStudents] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Obtener datos
  const enrollments = getEnrollmentsBySubject(subject.id);
  const allStudents = getUsersByRole('student');
  const enrolledStudentIds = enrollments.map(e => e.studentId);
  const availableStudents = allStudents.filter(s => !enrolledStudentIds.includes(s.id) && s.isActive);

  // Auto-dismiss notification
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const studentData = active.data.current?.student as DraggedStudent;
    if (studentData) {
      setDraggedStudent(studentData);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedStudent(null);

    if (!over || !draggedStudent) return;

    // Determinar el grupo destino
    const targetGroupId = over.id as string;
    const targetGroup = subject.groups.find(g => g.id === targetGroupId);
    
    if (!targetGroup) return;

    // Si es el mismo grupo, no hacer nada
    if (targetGroup.id === draggedStudent.currentGroupId) return;

    try {
      await transferStudent(
        draggedStudent.id,
        draggedStudent.currentGroupId,
        subject.id,
        targetGroup.levelId,
        targetGroup.id,
        'Transferencia por drag and drop'
      );
      
      showNotification('success', `${draggedStudent.name} transferido exitosamente`);
    } catch (error: any) {
      showNotification('error', error.message || 'Error al transferir estudiante');
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;

    if (window.confirm(`¿Estás seguro de que quieres remover a ${student.name} de ${subject.name}?`)) {
      try {
        await removeStudent(studentId, subject.id, 'Removido manualmente');
        showNotification('success', `${student.name} removido de ${subject.name}`);
      } catch (error: any) {
        showNotification('error', error.message || 'Error al remover estudiante');
      }
    }
  };

  const handleLevelChange = async (studentId: string, newLevelId: string, newGroupId: string) => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;

    try {
      await changeLevelStudent(studentId, subject.id, newLevelId, newGroupId, 'Cambio de nivel manual');
      showNotification('success', `Nivel de ${student.name} actualizado`);
    } catch (error: any) {
      showNotification('error', error.message || 'Error al cambiar nivel');
    }
  };

  const handleEnrollStudent = async (studentId: string, levelId: string, groupId: string) => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;

    try {
      await enrollStudent(studentId, subject.id, levelId, groupId, 'Inscripción manual');
      showNotification('success', `${student.name} inscrito en ${subject.name}`);
    } catch (error: any) {
      showNotification('error', error.message || 'Error al inscribir estudiante');
    }
  };

  const toggleLevel = (levelId: string) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(levelId)) {
      newExpanded.delete(levelId);
    } else {
      newExpanded.add(levelId);
    }
    setExpandedLevels(newExpanded);
  };

  // Agrupar estudiantes por nivel y grupo
  const studentsByGroup = enrollments.reduce((acc, enrollment) => {
    const student = allStudents.find(s => s.id === enrollment.studentId);
    if (student) {
      const key = `${enrollment.levelId}-${enrollment.groupId}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({ student, enrollment });
    }
    return acc;
  }, {} as Record<string, { student: any; enrollment: StudentEnrollment }[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestión de Estudiantes</h2>
            <p className="text-gray-600 mt-1">{subject.name} ({subject.code})</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>{enrollments.length} estudiantes inscritos</span>
              <span>{subject.levels.length} niveles</span>
              <span>{subject.groups.length} grupos</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAvailableStudents(!showAvailableStudents)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {showAvailableStudents ? 'Ocultar' : 'Mostrar'} Disponibles ({availableStudents.length})
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mx-6 mt-4 p-4 rounded-lg flex items-center space-x-3 ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
            notification.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
            'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {notification.type === 'info' && <Info className="w-5 h-5" />}
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-current hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel principal - Grupos por nivel */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estudiantes por Nivel y Grupo</h3>
                
                <div className="space-y-6">
                  {subject.levels.map(level => {
                    const levelGroups = subject.groups.filter(g => g.levelId === level.id);
                    const isExpanded = expandedLevels.has(level.id);
                    const levelStudentCount = levelGroups.reduce((sum, group) => {
                      const groupKey = `${level.id}-${group.id}`;
                      return sum + (studentsByGroup[groupKey]?.length || 0);
                    }, 0);

                    return (
                      <div key={level.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Header del nivel */}
                        <button
                          onClick={() => toggleLevel(level.id)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                            <div className="text-left">
                              <h4 className="font-medium text-gray-900">{level.name}</h4>
                              <p className="text-sm text-gray-500">{level.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{levelStudentCount}/{level.maxStudents} estudiantes</span>
                            <span>{levelGroups.length} grupos</span>
                          </div>
                        </button>

                        {/* Grupos del nivel */}
                        {isExpanded && (
                          <div className="p-4 space-y-4">
                            {levelGroups.map(group => {
                              const groupKey = `${level.id}-${group.id}`;
                              const groupStudents = studentsByGroup[groupKey] || [];

                              return (
                                <DropZone
                                  key={group.id}
                                  level={level}
                                  group={group}
                                  students={groupStudents}
                                  subject={subject}
                                  onStudentRemove={handleRemoveStudent}
                                  onStudentLevelChange={handleLevelChange}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Panel de estudiantes disponibles */}
              {showAvailableStudents && (
                <div className="lg:col-span-2 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Estudiantes Disponibles ({availableStudents.length})
                  </h3>
                  
                  {availableStudents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Todos los estudiantes activos ya están inscritos en esta materia</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableStudents.map(student => (
                        <div key={student.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                              {student.grade && (
                                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                                  {student.grade}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Selector de nivel y grupo para inscripción */}
                          <div className="space-y-2">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  const [levelId, groupId] = e.target.value.split('-');
                                  handleEnrollStudent(student.id, levelId, groupId);
                                  e.target.value = '';
                                }
                              }}
                              className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                              defaultValue=""
                            >
                              <option value="">Seleccionar nivel y grupo</option>
                              {subject.levels.map(level => 
                                subject.groups
                                  .filter(group => group.levelId === level.id && group.currentStudents < group.maxStudents)
                                  .map(group => (
                                    <option key={`${level.id}-${group.id}`} value={`${level.id}-${group.id}`}>
                                      {level.name} - {group.name} ({group.currentStudents}/{group.maxStudents})
                                    </option>
                                  ))
                              )}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {draggedStudent ? (
                <div className="p-4 bg-white border border-blue-500 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{draggedStudent.name}</div>
                      <div className="text-sm text-gray-500">{draggedStudent.email}</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}