import { supabaseClient } from '../src/lib/supabaseClient';

interface Course {
  id?: string;
  name: string;
  description: string;
}

interface Subject {
  course_id: string;
  name: string;
  credits: number;
}

async function seedDatabase() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // 1. Crear cursos
    const courses: Course[] = [
      {
        name: 'Ingeniería Informática',
        description: 'Carrera enfocada en el desarrollo de software, sistemas y tecnologías de la información'
      },
      {
        name: 'Administración de Empresas',
        description: 'Formación integral en gestión empresarial, finanzas y estrategia organizacional'
      }
    ];

    console.log('📚 Insertando cursos...');
    const { data: insertedCourses, error: coursesError } = await supabaseClient
      .from('courses')
      .insert(courses)
      .select();

    if (coursesError) {
      throw new Error(`Error insertando cursos: ${coursesError.message}`);
    }

    console.log(`✅ ${insertedCourses?.length} cursos insertados exitosamente`);

    // 2. Crear materias para cada curso
    const subjects: Subject[] = [];

    // Materias para Ingeniería Informática
    const informaticaCourseId = insertedCourses?.find(c => c.name === 'Ingeniería Informática')?.id;
    if (informaticaCourseId) {
      subjects.push(
        { course_id: informaticaCourseId, name: 'Programación I', credits: 4 },
        { course_id: informaticaCourseId, name: 'Estructuras de Datos', credits: 4 },
        { course_id: informaticaCourseId, name: 'Base de Datos', credits: 3 },
        { course_id: informaticaCourseId, name: 'Ingeniería de Software', credits: 4 }
      );
    }

    // Materias para Administración de Empresas
    const administracionCourseId = insertedCourses?.find(c => c.name === 'Administración de Empresas')?.id;
    if (administracionCourseId) {
      subjects.push(
        { course_id: administracionCourseId, name: 'Contabilidad General', credits: 3 },
        { course_id: administracionCourseId, name: 'Marketing', credits: 3 },
        { course_id: administracionCourseId, name: 'Finanzas Corporativas', credits: 4 },
        { course_id: administracionCourseId, name: 'Gestión de Recursos Humanos', credits: 3 }
      );
    }

    console.log('📖 Insertando materias...');
    const { data: insertedSubjects, error: subjectsError } = await supabaseClient
      .from('subjects')
      .insert(subjects)
      .select();

    if (subjectsError) {
      throw new Error(`Error insertando materias: ${subjectsError.message}`);
    }

    console.log(`✅ ${insertedSubjects?.length} materias insertadas exitosamente`);

    // 3. Mostrar resumen
    console.log('\n📊 Resumen del seed:');
    console.log(`- Cursos creados: ${insertedCourses?.length}`);
    console.log(`- Materias creadas: ${insertedSubjects?.length}`);
    
    console.log('\n🎉 Seed completado exitosamente!');
    
    // 4. Mostrar datos insertados
    console.log('\n📋 Datos insertados:');
    for (const course of insertedCourses || []) {
      console.log(`\n📚 Curso: ${course.name}`);
      const courseSubjects = insertedSubjects?.filter(s => s.course_id === course.id) || [];
      for (const subject of courseSubjects) {
        console.log(`  📖 ${subject.name} (${subject.credits} créditos)`);
      }
    }

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

// Función para verificar la conexión
async function checkConnection() {
  try {
    const { data, error } = await supabaseClient
      .from('courses')
      .select('count')
      .limit(1);

    if (error) {
      throw new Error(`Error de conexión: ${error.message}`);
    }

    console.log('✅ Conexión a Supabase establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a Supabase:', error);
    console.error('Verifica que las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas correctamente');
    return false;
  }
}

// Ejecutar seed
async function main() {
  console.log('🔍 Verificando conexión a Supabase...');
  
  const isConnected = await checkConnection();
  if (!isConnected) {
    process.exit(1);
  }

  await seedDatabase();
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { seedDatabase, checkConnection };