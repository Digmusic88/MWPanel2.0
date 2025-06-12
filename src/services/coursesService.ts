import { supabaseClient } from '../lib/supabaseClient';

export interface Course {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Subject {
  id: string;
  course_id: string;
  name: string;
  credits: number;
  created_at: string;
}

export interface CourseWithSubjects extends Course {
  subjects: Subject[];
}

class CoursesService {
  // Cursos
  async getCourses(): Promise<Course[]> {
    try {
      const { data, error } = await supabaseClient
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error obteniendo cursos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCourses:', error);
      throw error;
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const { data, error } = await supabaseClient
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw new Error(`Error obteniendo curso: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getCourseById:', error);
      throw error;
    }
  }

  async createCourse(courseData: { name: string; description?: string }): Promise<Course> {
    try {
      const { data, error } = await supabaseClient
        .from('courses')
        .insert([courseData])
        .select()
        .single();

      if (error) {
        throw new Error(`Error creando curso: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createCourse:', error);
      throw error;
    }
  }

  async updateCourse(id: string, courseData: { name?: string; description?: string }): Promise<Course> {
    try {
      const { data, error } = await supabaseClient
        .from('courses')
        .update(courseData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error actualizando curso: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateCourse:', error);
      throw error;
    }
  }

  async deleteCourse(id: string): Promise<void> {
    try {
      // Verificar si hay materias asociadas
      const { data: subjects } = await supabaseClient
        .from('subjects')
        .select('id')
        .eq('course_id', id);

      if (subjects && subjects.length > 0) {
        throw new Error(`No se puede eliminar el curso. Tiene ${subjects.length} materia(s) asociada(s).`);
      }

      const { error } = await supabaseClient
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error eliminando curso: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteCourse:', error);
      throw error;
    }
  }

  // Materias
  async getSubjects(): Promise<Subject[]> {
    try {
      const { data, error } = await supabaseClient
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error obteniendo materias: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSubjects:', error);
      throw error;
    }
  }

  async getSubjectsByCourse(courseId: string): Promise<Subject[]> {
    try {
      const { data, error } = await supabaseClient
        .from('subjects')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error obteniendo materias del curso: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSubjectsByCourse:', error);
      throw error;
    }
  }

  async createSubject(subjectData: { course_id: string; name: string; credits: number }): Promise<Subject> {
    try {
      const { data, error } = await supabaseClient
        .from('subjects')
        .insert([subjectData])
        .select()
        .single();

      if (error) {
        throw new Error(`Error creando materia: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createSubject:', error);
      throw error;
    }
  }

  async updateSubject(id: string, subjectData: { name?: string; credits?: number; course_id?: string }): Promise<Subject> {
    try {
      const { data, error } = await supabaseClient
        .from('subjects')
        .update(subjectData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error actualizando materia: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateSubject:', error);
      throw error;
    }
  }

  async deleteSubject(id: string): Promise<void> {
    try {
      const { error } = await supabaseClient
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error eliminando materia: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteSubject:', error);
      throw error;
    }
  }

  // Consultas combinadas
  async getCoursesWithSubjects(): Promise<CourseWithSubjects[]> {
    try {
      const { data, error } = await supabaseClient
        .from('courses')
        .select(`
          *,
          subjects (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error obteniendo cursos con materias: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCoursesWithSubjects:', error);
      throw error;
    }
  }

  // Verificar conexión
  async checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('courses')
        .select('count')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('Error checking connection:', error);
      return false;
    }
  }
}

export const coursesService = new CoursesService();