import React, { useState, useEffect } from 'react';
import { X, Users, Search, UserPlus, UserMinus, AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';
import { AcademicGroup } from '../../types/groups';
import { User } from '../../types';
import { useUsers } from '../../context/UsersContext';
import { useGroups } from '../../context/GroupsContext';

interface StudentAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: AcademicGroup;
  onAssignmentChange?: () => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export default function StudentAssignmentModal({ 
  isOpen, 
  onClose, 
  group, 
  onAssignmentChange 
}: StudentAssignmentModalProps) {
  const { getUsersByRole } = useUsers();
  const { assignStudentToGroup, removeStudentFromGroup, groups, updateGroup } = useGroups();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info', text: string } | null>(null);
  const [currentGroup, setCurrentGroup] = useState<AcademicGroup>(group);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true, errors: [], warnings: [] });

  // Actualizar grupo actual cuando cambie el prop o el contexto
  useEffect(() => {
    const updatedGroup = groups.find(g => g.id === group.id);
    if (updatedGroup) {
      setCurrentGroup(updatedGroup);
    }
  }, [groups, group.id]);

  // Obtener estudiantes con validación mejorada
  const allStudents = getUsersByRole('student').filter(student => student.isActive);
  const assignedStudents = allStudents.filter(student => currentGroup.students.includes(student.id));
  const availableStudents = allStudents.filter(student => !currentGroup.students.includes(student.id));

  // Filtrado mejorado de estudiantes disponibles
  const filteredAvailableStudents = availableStudents.filter(student => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      (student.grade && student.grade.toLowerCase().includes(query)) ||
      student.id.toLowerCase().includes(query)
    );
  });

  // Limpiar mensajes automáticamente
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Validación completa de asignaciones
  const validateAssignments = (studentIds: string[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validaciones básicas
    if (studentIds.length === 0) {
      errors.push('Debe seleccionar al menos un estudiante para asignar');
    }

    // Validación de capacidad
    const remainingCapacity = currentGroup.maxCapacity - currentGroup.currentCapacity;
    if (studentIds.length > remainingCapacity) {
      errors.push(`Solo quedan ${remainingCapacity} espacios disponibles en el grupo (intentando asignar ${studentIds.length})`);
    }

    // Validación de duplicados
    const alreadyAssigned = studentIds.filter(id => currentGroup.students.includes(id));
    if (alreadyAssigned.length > 0) {
      const studentNames = alreadyAssigned.map(id => {
        const student = allStudents.find(s => s.id === id);
        return student ? student.name : id;
      }).join(', ');
      errors.push(`Los siguientes estudiantes ya están asignados: ${studentNames}`);
    }

    // Validación de estado del grupo
    if (!currentGroup.isActive) {
      errors.push('No se pueden asignar estudiantes a un grupo inactivo');
    }

    // Advertencias
    if (studentIds.length > 5) {
      warnings.push('Asignando un gran número de estudiantes. Esto puede tomar unos momentos.');
    }

    const finalCapacity = currentGroup.currentCapacity + studentIds.length;
    const capacityPercentage = (finalCapacity / currentGroup.maxCapacity) * 100;
    if (capacityPercentage > 90) {
      warnings.push('El grupo estará cerca de su capacidad máxima tras esta asignación');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  // Actualizar validación cuando cambie la selección
  useEffect(() => {
    if (selectedStudents.length > 0) {
      const result = validateAssignments(selectedStudents);
      setValidationResult(result);
    } else {
      setValidationResult({ isValid: true, errors: [], warnings: [] });
    }
  }, [selectedStudents, currentGroup]);

  const handleAssignStudents = async () => {
    const validation = validateAssignments(selectedStudents);
    
    if (!validation.isValid) {
      setMessage({ 
        type: 'error', 
        text: validation.errors.join('. ') 
      });
      return;
    }

    // Mostrar advertencias si las hay
    if (validation.warnings.length > 0) {
      const proceed = window.confirm(
        `Advertencias:\n${validation.warnings.join('\n')}\n\n¿Desea continuar con la asignación?`
      );
      if (!proceed) return;
    }

    try {
      setIsAssigning(true);
      setMessage({ type: 'info', text: 'Asignando estudiantes...' });
      
      // Asignar estudiantes secuencialmente para mejor control de errores
      const results = [];
      for (const studentId of selectedStudents) {
        try {
          await assignStudentToGroup(studentId, currentGroup.id, 'Asignación manual desde modal de gestión');
          results.push({ studentId, success: true });
        } catch (error) {
          console.error(`Error asignando estudiante ${studentId}:`, error);
          results.push({ studentId, success: false, error: error.message });
        }
      }
      
      // Analizar resultados
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      if (successful.length > 0) {
        setMessage({
          type: successful.length === selectedStudents.length ? 'success' : 'warning',
          text: `${successful.length} de ${selectedStudents.length} estudiante(s) asignado(s) exitosamente${
            failed.length > 0 ? `. ${failed.length} asignaciones fallaron.` : ''
          }`
        });
      } else {
        setMessage({
          type: 'error',
          text: 'No se pudo asignar ningún estudiante. Verifique los datos e intente nuevamente.'
        });
      }
      
      // Limpiar selección solo si hubo éxitos
      if (successful.length > 0) {
        setSelectedStudents([]);
        setSearchQuery('');
      }
      
      // Notificar cambio al componente padre
      onAssignmentChange?.();
      
    } catch (error: any) {
      console.error('Error en asignación masiva:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error inesperado durante la asignación'
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    // Validaciones previas
    if (!currentGroup.students.includes(studentId)) {
      setMessage({
        type: 'error',
        text: `${studentName} no está asignado a este grupo`
      });
      return;
    }

    const confirmMessage = `¿Estás seguro de que quieres remover a ${studentName} del grupo "${currentGroup.name}"?\n\nEsta acción se puede revertir asignando nuevamente al estudiante.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsRemoving(studentId);
      await removeStudentFromGroup(studentId, currentGroup.id, 'Remoción manual desde modal de gestión');
      
      setMessage({
        type: 'success',
        text: `${studentName} removido del grupo exitosamente`
      });
      
      // Notificar cambio al componente padre
      onAssignmentChange?.();
      
    } catch (error: any) {
      console.error('Error removiendo estudiante:', error);
      setMessage({
        type: 'error',
        text: error.message || `Error al remover a ${studentName}`
      });
    } finally {
      setIsRemoving(null);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => {
      const isSelected = prev.includes(studentId);
      if (isSelected) {
        return prev.filter(id => id !== studentId);
      } else {
        // Verificar capacidad antes de agregar
        const remainingCapacity = currentGroup.maxCapacity - currentGroup.currentCapacity;
        if (prev.length >= remainingCapacity) {
          setMessage({
            type: 'warning',
            text: `No se pueden seleccionar más estudiantes. Solo quedan ${remainingCapacity} espacios disponibles.`
          });
          return prev;
        }
        return [...prev, studentId];
      }
    });
  };

  const selectAllVisible = () => {
    const remainingCapacity = currentGroup.maxCapacity - currentGroup.currentCapacity;
    const visibleIds = filteredAvailableStudents.map(s => s.id);
    const toSelect = visibleIds.slice(0, remainingCapacity);
    
    if (toSelect.length < visibleIds.length) {
      setMessage({
        type: 'info',
        text: `Solo se seleccionaron ${toSelect.length} de ${visibleIds.length} estudiantes debido a la capacidad del grupo`
      });
    }
    
    setSelectedStudents(toSelect);
  };

  const clearSelection = () => {
    setSelectedStudents([]);
    setValidationResult({ isValid: true, errors: [], warnings: [] });
  };

  if (!isOpen) return null;

  const remainingCapacity = currentGroup.maxCapacity - currentGroup.currentCapacity;
  const canAssignMore = remainingCapacity > 0 && currentGroup.isActive;
  const capacityPercentage = (currentGroup.currentCapacity / currentGroup.maxCapacity) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header mejorado */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Gestionar Estudiantes</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="font-medium">{currentGroup.name}</span>
              <span className="px-2 py-1 bg-white rounded-full">
                {currentGroup.currentCapacity}/{currentGroup.maxCapacity} estudiantes
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                capacityPercentage >= 90 ? 'bg-red-100 text-red-700' :
                capacityPercentage >= 75 ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {Math.round(capacityPercentage)}% ocupado
              </span>
              {!currentGroup.isActive && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  Grupo Inactivo
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isAssigning || isRemoving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Mensaje de estado mejorado */}
          {message && (
            <div className={`flex items-start space-x-3 text-sm p-4 rounded-lg mb-6 animate-fade-in ${
              message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
              message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
              message.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-700' :
              'bg-blue-50 border border-blue-200 text-blue-700'
            }`}>
              {message.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              {message.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              {message.type === 'warning' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              {message.type === 'info' && <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* Validación en tiempo real */}
          {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
            <div className="mb-6 space-y-2">
              {validationResult.errors.map((error, index) => (
                <div key={`error-${index}`} className="flex items-start space-x-2 text-sm p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              ))}
              {validationResult.warnings.map((warning, index) => (
                <div key={`warning-${index}`} className="flex items-start space-x-2 text-sm p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Estudiantes asignados */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  Estudiantes Asignados
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {assignedStudents.length}
                  </span>
                </h3>
              </div>
              
              {assignedStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium text-lg mb-2">No hay estudiantes asignados</p>
                  <p className="text-sm text-gray-400">
                    Selecciona estudiantes de la lista de disponibles para asignarlos a este grupo
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {assignedStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200 hover:shadow-sm transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                          {student.grade && (
                            <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded mt-1 inline-block">
                              {student.grade}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(student.id, student.name)}
                        disabled={isRemoving === student.id || isAssigning}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remover del grupo"
                      >
                        {isRemoving === student.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <UserMinus className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Estudiantes disponibles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                  Estudiantes Disponibles
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {filteredAvailableStudents.length}
                  </span>
                </h3>
                {filteredAvailableStudents.length > 0 && canAssignMore && (
                  <div className="flex space-x-2">
                    <button
                      onClick={selectAllVisible}
                      disabled={isAssigning || isRemoving}
                      className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      Seleccionar visibles
                    </button>
                    {selectedStudents.length > 0 && (
                      <button
                        onClick={clearSelection}
                        disabled={isAssigning || isRemoving}
                        className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        Limpiar ({selectedStudents.length})
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Búsqueda mejorada */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, grado o ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isAssigning || isRemoving}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Información de capacidad */}
              {!canAssignMore && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3 text-yellow-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {!currentGroup.isActive 
                          ? 'Grupo inactivo'
                          : `Capacidad completa (${currentGroup.maxCapacity} estudiantes)`
                        }
                      </p>
                      <p className="text-sm mt-1">
                        {!currentGroup.isActive 
                          ? 'No se pueden asignar estudiantes a grupos inactivos'
                          : 'Para asignar más estudiantes, primero remueve algunos o aumenta la capacidad del grupo'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de estudiantes disponibles */}
              {filteredAvailableStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium text-lg mb-2">
                    {searchQuery ? 'No se encontraron estudiantes' : 'No hay estudiantes disponibles'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {searchQuery 
                      ? 'Intenta con otros términos de búsqueda o limpia el filtro'
                      : 'Todos los estudiantes activos ya están asignados a este grupo'
                    }
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Limpiar búsqueda
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {filteredAvailableStudents.map(student => {
                    const isSelected = selectedStudents.includes(student.id);
                    const isDisabled = !canAssignMore || isAssigning || isRemoving;
                    
                    return (
                      <div 
                        key={student.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                            : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isDisabled && toggleStudentSelection(student.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => !isDisabled && toggleStudentSelection(student.id)}
                            disabled={isDisabled}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                          />
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                            {student.grade && (
                              <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                                {student.grade}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Botón de asignación mejorado */}
              {selectedStudents.length > 0 && canAssignMore && (
                <div className="space-y-3">
                  <button
                    onClick={handleAssignStudents}
                    disabled={isAssigning || isRemoving || !validationResult.isValid}
                    className="w-full px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-3 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Asignando estudiantes...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Asignar {selectedStudents.length} estudiante{selectedStudents.length !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </button>
                  
                  {validationResult.warnings.length > 0 && (
                    <div className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded p-2">
                      <strong>Advertencias:</strong> {validationResult.warnings.join('. ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center space-x-6">
                <span className="flex items-center space-x-2">
                  <span className="font-medium">Capacidad:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    capacityPercentage >= 90 ? 'bg-red-100 text-red-700' :
                    capacityPercentage >= 75 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {currentGroup.currentCapacity}/{currentGroup.maxCapacity}
                  </span>
                </span>
                
                {selectedStudents.length > 0 && (
                  <span className="text-emerald-600 font-medium">
                    +{selectedStudents.length} seleccionados
                  </span>
                )}
                
                {remainingCapacity > 0 && (
                  <span className="text-blue-600">
                    {remainingCapacity} espacios disponibles
                  </span>
                )}
              </div>
              
              {searchQuery && (
                <div className="text-xs text-gray-500">
                  Mostrando {filteredAvailableStudents.length} de {availableStudents.length} estudiantes disponibles
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              disabled={isAssigning || isRemoving}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}