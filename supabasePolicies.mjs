/**
 * Ejecuta este script una sola vez.
 * Establece políticas RLS amplias para desarrollo.
 * Usa la SERVICE_ROLE_KEY – NO la compartas en el repositorio público.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas');
  console.log('Asegúrate de tener estas variables de entorno configuradas:');
  console.log('- SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔧 Actualizando políticas RLS para cursos_materias...');

try {
  // 1) Asegúrate de que RLS esté activado
  const { error: enableRlsError } = await supabase.rpc('sql', {
    query: 'ALTER TABLE public.cursos_materias ENABLE ROW LEVEL SECURITY;'
  });

  if (enableRlsError && !enableRlsError.message.includes('already enabled')) {
    console.error('❌ Error habilitando RLS:', enableRlsError);
  } else {
    console.log('✅ RLS habilitado en cursos_materias');
  }

  // 2) Elimina políticas antiguas si existieran
  const dropPoliciesQueries = [
    'DROP POLICY IF EXISTS "allow all dev" ON public.cursos_materias;',
    'DROP POLICY IF EXISTS "authenticated_users_can_read_cursos_materias" ON public.cursos_materias;',
    'DROP POLICY IF EXISTS "admin_teacher_can_insert_cursos_materias" ON public.cursos_materias;',
    'DROP POLICY IF EXISTS "admin_teacher_can_update_cursos_materias" ON public.cursos_materias;',
    'DROP POLICY IF EXISTS "admin_can_delete_cursos_materias" ON public.cursos_materias;',
    'DROP POLICY IF EXISTS "admins_can_insert_cursos_materias" ON public.cursos_materias;',
    'DROP POLICY IF EXISTS "admins_can_update_cursos_materias" ON public.cursos_materias;',
    'DROP POLICY IF EXISTS "admins_can_delete_cursos_materias" ON public.cursos_materias;'
  ];

  for (const query of dropPoliciesQueries) {
    const { error } = await supabase.rpc('sql', { query });
    if (error && !error.message.includes('does not exist')) {
      console.warn('⚠️ Advertencia eliminando política:', error.message);
    }
  }

  console.log('✅ Políticas antiguas eliminadas');

  // 3) Política de desarrollo: permite cualquier acción a usuarios autenticados
  const createPolicyQuery = `
    CREATE POLICY "allow all dev"
      ON public.cursos_materias
      FOR ALL
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  `;

  const { error: createPolicyError } = await supabase.rpc('sql', {
    query: createPolicyQuery
  });

  if (createPolicyError) {
    console.error('❌ Error creando política:', createPolicyError);
    process.exit(1);
  }

  console.log('✅ Nueva política "allow all dev" creada');
  console.log('✅ Políticas RLS actualizadas correctamente');
  console.log('');
  console.log('🎉 Ahora puedes usar el CRUD de cursos y materias sin problemas de RLS');
  console.log('');
  console.log('⚠️  IMPORTANTE: Esta es una política de desarrollo amplia.');
  console.log('   Para producción, considera políticas más restrictivas.');

} catch (error) {
  console.error('❌ Error ejecutando script:', error);
  process.exit(1);
}

process.exit(0);