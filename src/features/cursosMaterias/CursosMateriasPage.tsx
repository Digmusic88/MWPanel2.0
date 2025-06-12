import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  BookOpen, 
  Users, 
  Edit, 
  Trash2, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  X,
  Search,
  Filter
} from 'lucide-react';
import { coursesService, Course, Subject, CourseWithSubjects } from '../../services/coursesService';

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface CourseFormData {
  name: string;
  description: string;
}

interface SubjectFormData {
  name: string;
  credits: number;
  course_id: string;
}

export default function CursosMateriasPage() {
  // Estado principal
  const [courses, setCourses] = useState<CourseWithSubjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  // Estado de modales
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Estado de formularios
  const [courseFormData, setCourseFormData] = useState<CourseFormData>({ name: '', description: '' });
  const [subjectFormData, setSubjectFormData] = useState<SubjectFormData>({ name: '', credits: 3, course_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado de filtros
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  // Auto-dismiss notification
  useEffect(() => {
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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar conexión
      const isConnected = await coursesService.checkConnection();
      if (!isConnected) {
        throw new Error('No se pudo conectar a la base de datos. Verifica tu configuración de Supabase.');
      }

      const data = await coursesService.getCoursesWithSubjects();
      setCourses(data);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Gestión de cursos
  const handleCreateCourse = () => {
    setEditingCourse(null);
    setCourseFormData({ name: '', description: '' });
    setShowCourseForm(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseFormData({ name: course.name, description: course.description || '' });
    setShowCourseForm(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormData.name.trim()) {
      showNotification('error', 'El nombre del curso es obligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (editingCourse) {
        await coursesService.updateCourse(editingCourse.id, courseFormData);
        showNotification('success', 'Curso actualizado exitosamente');
      } else {
        await coursesService.createCourse(courseFormData);
        showNotification('success', 'Curso creado exitosamente');
      }

      setShowCourseForm(false);
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al guardar el curso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el curso "${course.name}"?`)) {
      return;
    }

    try {
      await coursesService.deleteCourse(course.id);
      showNotification('success', 'Curso eliminado exitosamente');
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al eliminar el curso');
    }
  };

  // Gestión de materias
  const handleCreateSubject = (course: Course) => {
    setEditingSubject(null);
    setSubjectFormData({ name: '', credits: 3, course_id: course.id });
    setSelectedCourse(course);
    setShowSubjectForm(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectFormData({ 
      name: subject.name, 
      credits: subject.credits, 
      course_id: subject.course_id 
    });
    setSelectedCourse(courses.find(c => c.id === subject.course_id) || null);
    setShowSubjectForm(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectFormData.name.trim()) {
      showNotification('error', 'El nombre de la materia es obligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (editingSubject) {
        await coursesService.updateSubject(editingSubject.id, subjectFormData);
        showNotification('success', 'Materia actualizada exitosamente');
      } else {
        await coursesService.createSubject(subjectFormData);
        showNotification('success', 'Materia creada exitosamente');
      }

      setShowSubjectForm(false);
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al guardar la materia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la materia "${subject.name}"?`)) {
      return;
    }

    try {
      await coursesService.deleteSubject(subject.id);
      showNotification('success', 'Materia eliminada exitosamente');
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al eliminar la materia');
    }
  };

  // Filtrar cursos
  const filteredCourses = courses.filter(course =>
    !searchQuery || 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.subjects.some(subject => 
      subject.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando cursos y materias...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`rounded-lg shadow-lg p-4 flex items-start gap-3 ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' :
            notification.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex-shrink-0">
              {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
              {notification.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-600" />}
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cursos y Materias</h1>
          <p className="text-gray-600">Gestiona los cursos académicos y sus materias</p>
        </div>
        <button
          onClick={handleCreateCourse}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Curso</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <span className="text-sm text-red-700">{error}</span>
            <button
              onClick={loadData}
              className="ml-4 text-sm text-red-600 hover:text-red-800 underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cursos o materias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No se encontraron resultados' : 'No hay cursos disponibles'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza creando tu primer curso académico'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateCourse}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Crear Primer Curso
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Course Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                    {course.description && (
                      <p className="text-gray-600 mt-1">{course.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{course.subjects.length} materias</span>
                      <span>Creado: {new Date(course.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCreateSubject(course)}
                      className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Materia</span>
                    </button>
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div className="p-6">
                {course.subjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No hay materias en este curso</p>
                    <button
                      onClick={() => handleCreateSubject(course)}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Agregar primera materia
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {course.subjects.map(subject => (
                      <div key={subject.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{subject.name}</h4>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleEditSubject(subject)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(subject)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>{subject.credits} créditos</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Creada: {new Date(subject.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Form Modal */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
              </h2>
              <button
                onClick={() => setShowCourseForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Curso *
                </label>
                <input
                  type="text"
                  value={courseFormData.name}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Ingeniería Informática"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción del curso..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCourseForm(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? 'Guardando...' : editingCourse ? 'Actualizar' : 'Crear'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Form Modal */}
      {showSubjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingSubject ? 'Editar Materia' : 'Nueva Materia'}
              </h2>
              <button
                onClick={() => setShowSubjectForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
              {selectedCourse && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Curso:</strong> {selectedCourse.name}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Materia *
                </label>
                <input
                  type="text"
                  value={subjectFormData.name}
                  onChange={(e) => setSubjectFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Programación I"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Créditos Académicos *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={subjectFormData.credits}
                  onChange={(e) => setSubjectFormData(prev => ({ ...prev, credits: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSubjectForm(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? 'Guardando...' : editingSubject ? 'Actualizar' : 'Crear'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}