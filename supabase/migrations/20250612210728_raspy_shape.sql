/*
  # Crear tabla cursos_materias

  1. Nueva tabla
    - `cursos_materias` con todos los campos especificados
    - Índices para mejor rendimiento
    - Datos de ejemplo (seed)

  2. Seguridad
    - Habilitar RLS
    - Políticas para lectura (todos los autenticados)
    - Políticas para escritura (solo admins)
*/

-- Crear tabla cursos_materias
CREATE TABLE IF NOT EXISTS public.cursos_materias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  categoria text NOT NULL DEFAULT 'Ciencias',
  archivado boolean NOT NULL DEFAULT false,
  creado_en timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.cursos_materias ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Todos pueden leer cursos_materias"
  ON public.cursos_materias
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo admins pueden insertar cursos_materias"
  ON public.cursos_materias
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'::"UserRole"
    )
  );

CREATE POLICY "Solo admins pueden actualizar cursos_materias"
  ON public.cursos_materias
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'::"UserRole"
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'::"UserRole"
    )
  );

CREATE POLICY "Solo admins pueden eliminar cursos_materias"
  ON public.cursos_materias
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'::"UserRole"
    )
  );

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_cursos_materias_categoria ON public.cursos_materias(categoria);
CREATE INDEX IF NOT EXISTS idx_cursos_materias_archivado ON public.cursos_materias(archivado);
CREATE INDEX IF NOT EXISTS idx_cursos_materias_creado_en ON public.cursos_materias(creado_en);

-- Insertar datos de ejemplo
INSERT INTO public.cursos_materias (nombre, descripcion, categoria) VALUES
  ('Matemáticas Avanzadas', 'Curso completo de matemáticas para nivel avanzado', 'Ciencias'),
  ('Álgebra Lineal', 'Fundamentos de álgebra lineal y matrices', 'Ciencias'),
  ('Cálculo Diferencial', 'Introducción al cálculo diferencial', 'Ciencias'),
  ('Historia Universal', 'Recorrido por la historia mundial desde la antigüedad', 'Humanidades'),
  ('Literatura Clásica', 'Análisis de obras literarias clásicas', 'Humanidades'),
  ('Filosofía Moderna', 'Estudio del pensamiento filosófico moderno', 'Humanidades'),
  ('Programación Web', 'Desarrollo de aplicaciones web modernas', 'Tecnología'),
  ('Base de Datos', 'Diseño y gestión de bases de datos relacionales', 'Tecnología'),
  ('Inteligencia Artificial', 'Introducción a la IA y machine learning', 'Tecnología')
ON CONFLICT DO NOTHING;

-- Conceder permisos
GRANT ALL ON public.cursos_materias TO authenticated;