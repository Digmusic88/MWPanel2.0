import { createClient } from '@supabase/supabase-js';
import { env } from '../lib/env';

// Cliente de Supabase
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export interface CursoMateria {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  archivado: boolean;
  creado_en: string;
}

export interface CursoMateriaInput {
  nombre: string;
  descripcion?: string;
  categoria: string;
  archivado?: boolean;
}

class CursosMateriasService {
  // Verificar conexión a Supabase
  async checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cursos_materias')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Error verificando conexión:', error);
      return false;
    }
  }

  // Obtener todos los cursos/materias
  async getAll(): Promise<CursoMateria[]> {
    try {
      const { data, error } = await supabase
        .from('cursos_materias')
        .select('*')
        .order('creado_en', { ascending: false });

      if (error) {
        throw new Error(`Error obteniendo cursos/materias: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  }

  // Obtener por ID
  async getById(id: string): Promise<CursoMateria | null> {
    try {
      const { data, error } = await supabase
        .from('cursos_materias')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw new Error(`Error obteniendo curso/materia: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  }

  // Crear nuevo curso/materia
  async create(data: CursoMateriaInput): Promise<CursoMateria> {
    try {
      const { data: result, error } = await supabase
        .from('cursos_materias')
        .insert([data])
        .select()
        .single();

      if (error) {
        throw new Error(`Error creando curso/materia: ${error.message}`);
      }

      return result;
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  // Actualizar curso/materia
  async update(id: string, data: Partial<CursoMateriaInput>): Promise<CursoMateria> {
    try {
      const { data: result, error } = await supabase
        .from('cursos_materias')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error actualizando curso/materia: ${error.message}`);
      }

      return result;
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  // Eliminar curso/materia
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cursos_materias')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error eliminando curso/materia: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  // Archivar/desarchivar
  async toggleArchive(id: string, archivado: boolean): Promise<CursoMateria> {
    try {
      const { data: result, error } = await supabase
        .from('cursos_materias')
        .update({ archivado })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error ${archivado ? 'archivando' : 'desarchivando'} curso/materia: ${error.message}`);
      }

      return result;
    } catch (error) {
      console.error('Error en toggleArchive:', error);
      throw error;
    }
  }

  // Filtrar por categoría
  async getByCategory(categoria: string): Promise<CursoMateria[]> {
    try {
      const { data, error } = await supabase
        .from('cursos_materias')
        .select('*')
        .eq('categoria', categoria)
        .order('creado_en', { ascending: false });

      if (error) {
        throw new Error(`Error obteniendo cursos/materias por categoría: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error en getByCategory:', error);
      throw error;
    }
  }

  // Obtener categorías únicas
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('cursos_materias')
        .select('categoria')
        .not('categoria', 'is', null);

      if (error) {
        throw new Error(`Error obteniendo categorías: ${error.message}`);
      }

      // Extraer categorías únicas
      const categories = [...new Set(data?.map(item => item.categoria) || [])];
      return categories.sort();
    } catch (error) {
      console.error('Error en getCategories:', error);
      throw error;
    }
  }

  // Buscar por texto
  async search(query: string): Promise<CursoMateria[]> {
    try {
      const { data, error } = await supabase
        .from('cursos_materias')
        .select('*')
        .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%,categoria.ilike.%${query}%`)
        .order('creado_en', { ascending: false });

      if (error) {
        throw new Error(`Error buscando cursos/materias: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error en search:', error);
      throw error;
    }
  }

  // Suscribirse a cambios en tiempo real
  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('cursos_materias_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cursos_materias'
        },
        callback
      )
      .subscribe();
  }
}

export const cursosMateriasService = new CursosMateriasService();