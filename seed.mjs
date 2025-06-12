import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Datos de ejemplo para insertar
const cursosMateriasData = [
  // Ciencias
  {
    nombre: 'Matemáticas Avanzadas',
    descripcion: 'Curso completo de matemáticas para nivel avanzado incluyendo cálculo diferencial e integral',
    categoria: 'Ciencias'
  },
  {
    nombre: 'Física Cuántica',
    descripcion: 'Introducción a los principios fundamentales de la mecánica cuántica',
    categoria: 'Ciencias'
  },
  {
    nombre: 'Química Orgánica',
    descripcion: 'Estudio de los compuestos orgánicos y sus reacciones',
    categoria: 'Ciencias'
  },

  // Humanidades
  {
    nombre: 'Historia Universal',
    descripcion: 'Recorrido por la historia mundial desde la antigüedad hasta la era moderna',
    categoria: 'Humanidades'
  },
  {
    nombre: 'Literatura Clásica',
    descripcion: 'Análisis de las grandes obras literarias de la humanidad',
    categoria: 'Humanidades'
  },
  {
    nombre: 'Filosofía Contemporánea',
    descripcion: 'Estudio del pensamiento filosófico de los siglos XX y XXI',
    categoria: 'Humanidades'
  },

  // Tecnología
  {
    nombre: 'Programación Web Full Stack',
    descripcion: 'Desarrollo completo de aplicaciones web modernas con React, Node.js y bases de datos',
    categoria: 'Tecnología'
  },
  {
    nombre: 'Inteligencia Artificial',
    descripcion: 'Introducción a la IA, machine learning y redes neuronales',
    categoria: 'Tecnología'
  },
  {
    nombre: 'Ciberseguridad',
    descripcion: 'Fundamentos de seguridad informática y protección de sistemas',
    categoria: 'Tecnología'
  }
];

async function verificarConexion() {
  try {
    console.log('🔍 Verificando conexión a Supabase...');
    
    const { data, error } = await supabase
      .from('cursos_materias')
      .select('count')
      .limit(1);

    if (error) {
      throw new Error(`Error de conexión: ${error.message}`);
    }

    console.log('✅ Conexión a Supabase establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a Supabase:', error.message);
    console.error('Verifica que:');
    console.error('1. Las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas');
    console.error('2. La tabla cursos_materias exista en tu base de datos');
    console.error('3. Las políticas RLS permitan insertar datos');
    return false;
  }
}

async function limpiarDatos() {
  try {
    console.log('🧹 Limpiando datos existentes...');
    
    const { error } = await supabase
      .from('cursos_materias')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos los registros

    if (error) {
      console.warn('⚠️  No se pudieron limpiar los datos existentes:', error.message);
      console.log('Continuando con la inserción...');
    } else {
      console.log('✅ Datos existentes limpiados');
    }
  } catch (error) {
    console.warn('⚠️  Error limpiando datos:', error.message);
    console.log('Continuando con la inserción...');
  }
}

async function insertarDatos() {
  try {
    console.log('📚 Insertando cursos y materias...');
    
    const { data, error } = await supabase
      .from('cursos_materias')
      .insert(cursosMateriasData)
      .select();

    if (error) {
      throw new Error(`Error insertando datos: ${error.message}`);
    }

    console.log(`✅ ${data.length} cursos/materias insertados exitosamente`);
    return data;
  } catch (error) {
    console.error('❌ Error insertando datos:', error.message);
    throw error;
  }
}

async function mostrarResumen(datos) {
  console.log('\n📊 Resumen del seed:');
  console.log(`- Total de registros: ${datos.length}`);
  
  // Agrupar por categoría
  const porCategoria = datos.reduce((acc, item) => {
    acc[item.categoria] = (acc[item.categoria] || 0) + 1;
    return acc;
  }, {});

  console.log('- Por categoría:');
  Object.entries(porCategoria).forEach(([categoria, cantidad]) => {
    console.log(`  • ${categoria}: ${cantidad}`);
  });

  console.log('\n📋 Datos insertados:');
  datos.forEach((item, index) => {
    console.log(`${index + 1}. ${item.nombre} (${item.categoria})`);
    if (item.descripcion) {
      console.log(`   ${item.descripcion.substring(0, 80)}${item.descripcion.length > 80 ? '...' : ''}`);
    }
  });
}

async function main() {
  try {
    console.log('🌱 Iniciando seed de cursos y materias...\n');

    // Verificar conexión
    const conectado = await verificarConexion();
    if (!conectado) {
      process.exit(1);
    }

    // Limpiar datos existentes (opcional)
    await limpiarDatos();

    // Insertar nuevos datos
    const datosInsertados = await insertarDatos();

    // Mostrar resumen
    await mostrarResumen(datosInsertados);

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('Ahora puedes abrir la aplicación y ver los datos en la sección "Cursos y Materias"');

  } catch (error) {
    console.error('\n❌ Error durante el seed:', error.message);
    process.exit(1);
  }
}

// Ejecutar el seed
main();