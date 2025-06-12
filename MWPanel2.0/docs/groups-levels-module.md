# Módulo de Grupos y Niveles - Documentación Técnica

## Descripción General

El módulo de Grupos y Niveles es un sistema integral para la gestión de grupos académicos, niveles educativos y asignaciones de estudiantes en un entorno educativo. Proporciona funcionalidades completas para administrar la estructura organizacional de una institución educativa.

## Características Principales

### 1. Gestión de Grupos Base
- **Creación y edición de grupos**: Interfaz intuitiva para crear y modificar grupos académicos
- **Asignación de tutores**: Cada grupo tiene un tutor responsable asignado
- **Control de capacidad**: Límites máximos configurables por grupo
- **Gestión de año académico**: Organización por períodos académicos

### 2. Sistema de Niveles Educativos
- **Niveles jerárquicos**: Estructura ordenada de niveles educativos
- **Materias por nivel**: Configuración de materias específicas para cada nivel
- **Tipos de nivel por materia**: Básico, intermedio y avanzado
- **Criterios de evaluación**: Definición de criterios específicos por materia y nivel

### 3. Asignación de Estudiantes
- **Asignación a grupos base**: Gestión de pertenencia a grupos principales
- **Asignación por materias**: Niveles específicos por materia según capacidad del estudiante
- **Cambios dinámicos**: Reasignación flexible entre grupos y niveles
- **Historial completo**: Registro de todos los cambios realizados

### 4. Sistema de Progreso
- **Seguimiento individual**: Monitoreo del progreso de cada estudiante
- **Criterios de evaluación**: Evaluación basada en criterios específicos
- **Puntuaciones**: Sistema de puntuación configurable
- **Actualización en tiempo real**: Progreso actualizable dinámicamente

## Arquitectura Técnica

### Tipos de Datos (TypeScript)

```typescript
interface AcademicGroup {
  id: string;
  name: string;
  description?: string;
  level: EducationalLevel;
  academicYear: string;
  maxCapacity: number;
  currentCapacity: number;
  tutorId: string;
  tutorName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  students: string[];
}

interface EducationalLevel {
  id: string;
  name: string;
  description: string;
  order: number;
  subjects: SubjectLevel[];
  isActive: boolean;
}

interface SubjectLevel {
  id: string;
  subjectId: string;
  subjectName: string;
  levelType: 'basic' | 'intermediate' | 'advanced';
  description: string;
  prerequisites: string[];
  evaluationCriteria: EvaluationCriteria[];
}
```

### Contexto de Estado (React Context)

El módulo utiliza React Context para gestionar el estado global:

- **GroupsContext**: Gestión centralizada de grupos, niveles y asignaciones
- **Operaciones CRUD**: Funciones para crear, leer, actualizar y eliminar
- **Consultas especializadas**: Métodos para obtener datos filtrados
- **Generación de reportes**: Funciones para crear reportes automáticos

### Componentes Principales

#### 1. GroupCard
- **Propósito**: Visualización de información de grupo en formato tarjeta
- **Características**:
  - Indicador visual de capacidad
  - Información del tutor asignado
  - Estado activo/inactivo
  - Acciones rápidas (editar, eliminar, ver estudiantes, reportes)

#### 2. GroupForm
- **Propósito**: Formulario para crear y editar grupos
- **Validaciones**:
  - Nombre obligatorio
  - Nivel educativo requerido
  - Capacidad entre 1-50 estudiantes
  - Tutor responsable obligatorio
- **Características**:
  - Modo creación/edición
  - Validación en tiempo real
  - Integración con usuarios (tutores)

#### 3. StudentAssignmentModal
- **Propósito**: Gestión de asignaciones de estudiantes a grupos
- **Funcionalidades**:
  - Vista dual: estudiantes asignados vs disponibles
  - Búsqueda y filtrado
  - Asignación múltiple
  - Verificación de capacidad
  - Historial de cambios

#### 4. GroupsManagement
- **Propósito**: Página principal de gestión
- **Características**:
  - Dashboard con estadísticas
  - Filtros avanzados
  - Exportación de datos
  - Gestión completa de grupos

## Funcionalidades Implementadas

### 1. CRUD de Grupos
```typescript
// Crear grupo
await addGroup({
  name: "10° Grado A",
  level: selectedLevel,
  academicYear: "2024-2025",
  maxCapacity: 30,
  tutorId: "teacher-id",
  isActive: true
});

// Actualizar grupo
await updateGroup(groupId, {
  maxCapacity: 35,
  description: "Grupo avanzado"
});

// Eliminar grupo
await deleteGroup(groupId);
```

### 2. Asignación de Estudiantes
```typescript
// Asignar estudiante a grupo
await assignStudentToGroup(studentId, groupId, "Asignación inicial");

// Remover estudiante de grupo
await removeStudentFromGroup(studentId, groupId, "Cambio de nivel");
```

### 3. Consultas Especializadas
```typescript
// Grupos por nivel
const groupsByLevel = getGroupsByLevel(levelId);

// Grupos por tutor
const groupsByTutor = getGroupsByTutor(tutorId);

// Grupos disponibles (con capacidad)
const availableGroups = getAvailableGroups();
```

### 4. Generación de Reportes
```typescript
// Reporte de grupo
const groupReport = await generateGroupReport(groupId);

// Reporte de progreso por nivel
const levelReport = await generateLevelProgressReport(levelId);
```

## Integración con Sistema Existente

### 1. Integración con Usuarios
- **Tutores**: Selección de profesores como tutores responsables
- **Estudiantes**: Asignación y gestión de estudiantes en grupos
- **Validaciones**: Verificación de roles y permisos

### 2. Integración con Autenticación
- **Permisos**: Solo administradores pueden gestionar grupos
- **Auditoría**: Registro de quién realiza cada cambio
- **Seguridad**: Validación de permisos en cada operación

### 3. Navegación
- **Sidebar**: Nueva opción "Grupos y Niveles" en el menú de administración
- **Rutas**: Integración con React Router
- **Breadcrumbs**: Navegación contextual

## Características de UX/UI

### 1. Diseño Responsivo
- **Mobile-first**: Optimizado para dispositivos móviles
- **Breakpoints**: Adaptación a diferentes tamaños de pantalla
- **Touch-friendly**: Botones y controles táctiles

### 2. Feedback Visual
- **Estados de carga**: Indicadores durante operaciones
- **Mensajes de éxito/error**: Feedback inmediato al usuario
- **Animaciones**: Transiciones suaves entre estados

### 3. Accesibilidad
- **Navegación por teclado**: Soporte completo
- **Lectores de pantalla**: Etiquetas y roles ARIA
- **Contraste**: Colores con contraste adecuado

## Filtros y Búsqueda

### 1. Filtros Disponibles
- **Por nivel educativo**: Filtrado por nivel específico
- **Por estado**: Activos/inactivos
- **Por capacidad**: Grupos llenos/disponibles
- **Por tutor**: Grupos de un tutor específico

### 2. Búsqueda Avanzada
- **Texto libre**: Búsqueda en nombre, descripción, tutor
- **Búsqueda en tiempo real**: Resultados instantáneos
- **Combinación de filtros**: Múltiples criterios simultáneos

## Reportes y Análisis

### 1. Reporte de Grupo
```typescript
interface GroupReport {
  groupId: string;
  groupName: string;
  totalStudents: number;
  averageProgress: number;
  subjectDistribution: {
    subjectName: string;
    basic: number;
    intermediate: number;
    advanced: number;
  }[];
  attendanceRate: number;
  generatedAt: Date;
}
```

### 2. Reporte de Nivel
```typescript
interface LevelProgressReport {
  levelId: string;
  levelName: string;
  totalStudents: number;
  progressBySubject: {
    subjectName: string;
    averageScore: number;
    completionRate: number;
    studentsAtLevel: {
      basic: number;
      intermediate: number;
      advanced: number;
    };
  }[];
  generatedAt: Date;
}
```

## Exportación de Datos

### 1. Formato CSV
- **Grupos**: Exportación completa de información de grupos
- **Asignaciones**: Listado de estudiantes por grupo
- **Progreso**: Datos de progreso académico

### 2. Campos Exportados
- Nombre del grupo
- Nivel educativo
- Año académico
- Tutor responsable
- Capacidad actual/máxima
- Estado activo/inactivo

## Notificaciones

### 1. Notificaciones Tutor-Padres
- **Cambios de grupo**: Notificación automática cuando un estudiante cambia de grupo
- **Progreso académico**: Alertas sobre cambios en el progreso
- **Capacidad completa**: Notificación cuando un grupo alcanza su capacidad máxima

### 2. Sistema de Alertas
- **Grupos sobrecargados**: Alertas cuando se excede la capacidad
- **Estudiantes sin asignar**: Notificación de estudiantes sin grupo
- **Tutores sin grupos**: Alertas de tutores sin asignaciones

## Pruebas

### 1. Pruebas Unitarias
- **Componentes**: Testing de todos los componentes React
- **Funciones**: Validación de lógica de negocio
- **Contexto**: Pruebas del estado global

### 2. Pruebas de Integración
- **Flujos completos**: Creación, edición y eliminación de grupos
- **Asignaciones**: Procesos de asignación de estudiantes
- **Reportes**: Generación y exportación de datos

## Consideraciones de Rendimiento

### 1. Optimizaciones
- **Memoización**: React.memo en componentes pesados
- **Lazy loading**: Carga diferida de componentes
- **Paginación**: Para listas grandes de grupos/estudiantes

### 2. Gestión de Estado
- **Context optimizado**: Evitar re-renders innecesarios
- **Actualizaciones selectivas**: Solo actualizar datos modificados
- **Cache local**: Almacenamiento temporal de datos frecuentes

## Roadmap Futuro

### 1. Funcionalidades Pendientes
- [ ] Sistema de horarios por grupo
- [ ] Integración con calendario académico
- [ ] Gestión de aulas y recursos
- [ ] Sistema de evaluaciones automáticas
- [ ] Dashboard de progreso en tiempo real

### 2. Mejoras Técnicas
- [ ] API RESTful completa
- [ ] Base de datos optimizada
- [ ] Sistema de cache avanzado
- [ ] Notificaciones push
- [ ] Integración con sistemas externos

## Conclusión

El módulo de Grupos y Niveles proporciona una base sólida para la gestión académica, con una arquitectura escalable y una interfaz de usuario intuitiva. La implementación actual cubre las funcionalidades principales y está preparada para futuras expansiones y mejoras.
