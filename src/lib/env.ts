// Configuración de variables de entorno
export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;

// Validar que las variables estén configuradas
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltan variables de entorno de Supabase. ' +
    'Asegúrate de configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env'
  );
}