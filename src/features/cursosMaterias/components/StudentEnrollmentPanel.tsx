import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, UserMinus, ArrowRight, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Subject, StudentEnrollment } from '../../../types/subjects';
import { useSubjects } from '../../../context/SubjectsContext';
import { useUsers } from '../../../context/UsersContext';

interface StudentEnrollmentPanelProps {
  subject: Subject;
  onClose: () => void;
}

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function StudentEnrollmentPanel({ subject, onClose }: StudentEnrollmentPanelProps) {
  const { 
    enrollments, 
    enrollStudent, 
    removeStudent, 
    changeLevelStudent,
    getEnrollmentsBySubject
  } = useSubjects();
  
  const { getUsersByRole } = useUsers();
  
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>(subject.levels[0]?.id || '');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Reset selected group when level changes
  useEffect(() => {
    setSelectedGroup('');
  }, [selectedLevel]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  // Get all students
  const allStudents = getUsersByRole('student').filter(student => student.isActive);
  
  // Get current enrollments for this subject
  const subjectEnrollments = getEnrollmentsBySubject(subject.id);
  
  // Get enrolled student IDs
  const enrolledStudentIds = subjectEnrollments.map(enrollment => enrollment.studentId);
  
  // Filter students based on tab and search
  const filteredStudents = allStudents.filter(student => {
    const isEnrolled = enrolledStudentIds.includes(student.id);
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'enrolled') {
      return isEnrolled && matchesSearch;
    } else {
      return !isEnrolled && matchesSearch;
    }
  });

  // Get available groups for selected level
  const availableGroups = subject.groups.filter(group => 
    group.levelId === selectedLevel && group.currentStudents < group.maxStudents
  );

  // Handle student enrollment
  const handleEnrollStudents = async () => {
    if (!selectedLevel || !selectedGroup || selectedStudents.length === 0) {
      showNotification('error', 'Selecciona nivel, grupo y al menos un estudiante');
      return;
    }

    setIsProcessing(true);
    
    try {
      for (const studentId of selectedStudents) {
        await enrollStudent(
          studentId,
          subject.id,
          selectedLevel,
          selectedGroup,
          'Inscripción manual desde panel de gestión'
        );
      }
      
      setSelectedStudents([]);
      showNotification('success', `${selectedStudents.length} estudiante(s) inscrito(s) exitosamente`);
      setActiveTab('enrolled'); // Switch to enrolled tab to see new enrollments
    } catch (error: any) {
      console.error('Error enrolling students:', error);
      showNotification('error', error.message || 'Error al inscribir estudiantes');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle student removal
  const handleRemoveStudents = async () => {
    if (selectedStudents.length === 0) {
      showNotification('error', 'Selecciona al menos un estudiante');
      return;
    }

    if (!window.confirm(`¿Estás seguro de que quieres eliminar ${selectedStudents.length} estudiante(s) de esta materia?`)) {
      return;
    }

    setIsProcessing(true);
    
    try {
      for (const studentId of selectedStudents) {
        await removeStudent(
          studentId,
          subject.id,
          'Eliminación manual desde panel de gestión'
        );
      }
      
      setSelectedStudents([]);
      showNotification('success', `${selectedStudents.length} estudiante(s) eliminado(s) exitosamente`);
    } catch (error: any) {
      console.error('Error removing students:', error);
      showNotification('error', error.message || 'Error al eliminar estudiantes');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle level change
  const handleChangeLevelStudents = async () => {
    if (!selectedLevel || !selectedGroup || selectedStudents.length === 0) {
      showNotification('error', 'Selecciona nivel, grupo y al menos un estudiante');
      return;
    }

    setIsProcessing(true);
    
    try {
      for (const studentId of selectedStudents) {
        await changeLevelStudent(
          studentId,
          subject.id,
          selectedLevel,
          selectedGroup,
          'Cambio de nivel manual desde panel de gestión'
        );
      }
      
      setSelectedStudents([]);
      showNotification('success', `${selectedStudents.length} estudiante(s) cambiado(s) de nivel exitosamente`);
    } catch (error: any) {
      console.error('Error changing student levels:', error);
      showNotification('error', error.message || 'Error al cambiar nivel de estudiantes');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Select/deselect all visible students
  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };

  // Get enrollment details for a student
  const getStudentEnrollment = (studentId: string): StudentEnrollment | undefined => {
    return subjectEnrollments.find(enrollment => enrollment.studentId === studentId);
  };

  // Get level and group names
  const getLevelName = (levelId: string): string => {
    const level = subject.levels.find(level => level.id === levelId);
    return level?.name || 'Desconocido';
  };

  const getGroupName = (groupId: string): string => {
    const group = subject.groups.find(group => group.id === groupId);
    return group?.name || 'Desconocido';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gestión de Estudiantes
            </h2>
            <p className="text-gray-600">
              {subject.name} ({subject.code})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className="mx-6 mt-4">
            <div className={`rounded-lg p-4 flex items-start gap-3 ${
              notification.type === 'success' ? 'bg-green-50 border border-green-200' :
              notification.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex-shrink-0">
                {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                {notification.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' :
                  notification.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className={`flex-shrink-0 ${
                  notification.type === 'success' ? 'text-green-600 hover:text-green-800' :
                  notification.type === 'error' ? 'text-red-600 hover:text-red-800' :
                  'text-blue-600 hover:text-blue-800'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'enrolled'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('enrolled')}
          >
            Estudiantes Inscritos ({subjectEnrollments.length})
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'available'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('available')}
          >
            Estudiantes Disponibles
          </button>
        </div>

        {/* Search and Actions */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar estudiantes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {activeTab === 'available' && (
              <div className="flex flex-col md:flex-row gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {subject.levels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name} ({level.currentStudents}/{level.maxStudents})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!selectedLevel}
                  >
                    <option value="">Seleccionar grupo</option>
                    {availableGroups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.currentStudents}/{group.maxStudents})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleEnrollStudents}
                    disabled={isProcessing || !selectedLevel || !selectedGroup || selectedStudents.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Inscribir Seleccionados</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'enrolled' && (
              <div className="flex flex-col md:flex-row gap-4">
                {selectedStudents.length > 0 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar a Nivel</label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {subject.levels.map(level => (
                          <option key={level.id} value={level.id}>
                            {level.name} ({level.currentStudents}/{level.maxStudents})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
                      <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!selectedLevel}
                      >
                        <option value="">Seleccionar grupo</option>
                        {availableGroups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name} ({group.currentStudents}/{group.maxStudents})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end space-x-2">
                      <button
                        onClick={handleChangeLevelStudents}
                        disabled={isProcessing || !selectedLevel || !selectedGroup}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Cambiar Nivel</span>
                      </button>
                      
                      <button
                        onClick={handleRemoveStudents}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <UserMinus className="w-4 h-4" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {activeTab === 'enrolled'
                  ? 'No hay estudiantes inscritos en esta materia'
                  : 'No hay estudiantes disponibles para inscribir'}
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    {activeTab === 'enrolled' && (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nivel
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grupo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Asistencia
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map(student => {
                    const enrollment = getStudentEnrollment(student.id);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => toggleStudentSelection(student.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        {activeTab === 'enrolled' && enrollment && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {getLevelName(enrollment.levelId)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getGroupName(enrollment.groupId)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      enrollment.attendance >= 90 ? 'bg-green-600' :
                                      enrollment.attendance >= 75 ? 'bg-yellow-400' :
                                      'bg-red-600'
                                    }`}
                                    style={{ width: `${enrollment.attendance}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm text-gray-600">{Math.round(enrollment.attendance)}%</span>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
