# EduPlataforma - Sistema Integral de Gestión Educativa

Una plataforma moderna y completa para la gestión educativa que permite administrar usuarios, cursos, calificaciones, asistencia y comunicación entre todos los actores del proceso educativo.

## 🚀 Características Principales

### Gestión de Usuarios
- **Vista Dual**: Selector de vista entre tarjetas (grid) y tabla con ordenación
- **Filtros Avanzados**: Chips clickeables por rol con contadores dinámicos
- **Búsqueda Inteligente**: Búsqueda en tiempo real por nombre, email o rol
- **Formulario Mejorado**: Lógica condicional para roles con validaciones específicas
- **Relaciones Padre-Hijo**: Gestión completa de vínculos familiares

### Roles de Usuario
- **Administrador**: Gestión completa del sistema
- **Profesor**: Manejo de clases, calificaciones y recursos
- **Estudiante**: Acceso a cursos, tareas y calificaciones
- **Padre**: Seguimiento del progreso académico de sus hijos

### Funcionalidades por Rol

#### Administrador
- Gestión completa de usuarios
- Configuración del sistema
- Reportes y análisis
- Gestión de cursos y materias

#### Profesor
- Gestión de clases asignadas
- Calificaciones y asistencia
- Creación de tareas y recursos
- Comunicación con estudiantes y padres

#### Estudiante
- Visualización de cursos inscritos
- Acceso a tareas y recursos
- Consulta de calificaciones
- Horario personalizado

#### Padre
- Seguimiento del progreso académico
- Comunicación con profesores
- Notificaciones importantes
- Reportes de asistencia

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Iconos**: Lucide React
- **Routing**: React Router DOM
- **Base de Datos**: Supabase
- **Build Tool**: Vite
- **Linting**: ESLint

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone [url-del-repositorio]
cd educational-platform
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

4. Configura tu proyecto de Supabase y actualiza las variables en `.env`:
```
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

5. Ejecuta las migraciones de la base de datos en Supabase

6. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 🗄️ Estructura de la Base de Datos

### Tablas Principales
- `users`: Información de usuarios con roles y estados
- `classes`: Clases y grupos base
- `subjects`: Materias académicas
- `grades`: Calificaciones de estudiantes
- `absences`: Registro de asistencia
- `payments`: Gestión de pagos
- `messages`: Sistema de mensajería
- `timetables`: Horarios de clases

### Enums
- `UserRole`: ADMIN, TEACHER, STUDENT, GUARDIAN
- `UserStatus`: ACTIVE, INACTIVE
- `AbsenceType`: ABSENCE, LATE, EARLY_DEPARTURE
- `PaymentStatus`: PENDING, PAID, OVERDUE, CANCELLED
- `MessageType`: PRIVATE, GROUP, ANNOUNCEMENT

## 🎨 Componentes Principales

### Gestión de Usuarios
- `ViewToggle`: Selector de vista dual (tarjetas/tabla)
- `RoleChips`: Filtros por rol con chips clickeables
- `UserTable`: Vista de tabla con ordenación por columnas
- `UserCard`: Vista de tarjeta responsiva
- `UserModal`: Formulario modal con lógica condicional
- `StudentSelector`: Selector múltiple de estudiantes para padres

### Layout
- `DashboardLayout`: Layout principal con sidebar y header
- `Sidebar`: Navegación lateral adaptativa por rol
- `Header`: Barra superior con búsqueda y perfil

### UI Components
- `StatCard`: Tarjetas de estadísticas
- `RecentActivity`: Lista de actividad reciente

## 🔧 Funcionalidades Implementadas

### Panel de Gestión de Usuarios

#### 1. Selector de Vista Dual
- Toggle switch con iconos de tarjeta/lista
- Persistencia de preferencia en localStorage
- Transiciones suaves entre vistas

#### 2. Filtros con Chips
- Chips clickeables por rol con contadores dinámicos
- Estado visual activo/inactivo
- Deselección para mostrar todos los usuarios

#### 3. Formulario Mejorado para Padres
- Lógica condicional al seleccionar rol "padre"
- Multi-select de estudiantes existentes con búsqueda
- Subformulario para crear nuevos estudiantes
- Validación de al menos 1 estudiante seleccionado

#### 4. Nomenclatura Actualizada
- "Grado" reemplazado por "Grupo Base" en toda la UI
- Consistencia en variables y textos del sistema

#### 5. Visualización de Relaciones
- Indicadores visuales de conexiones padre-hijo
- Chips con nombres de hijos en tarjetas de padres
- Acciones rápidas para gestionar vínculos

## 🚀 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Previsualiza la build de producción
- `npm run lint`: Ejecuta el linter

## 🔐 Autenticación

El sistema incluye un sistema de autenticación simulado con usuarios de demostración:

- **Administrador**: admin@edu.com
- **Profesor**: teacher@edu.com
- **Estudiante**: student@edu.com
- **Padre**: parent@edu.com

Contraseña para todas las cuentas: `demo123`

## 📱 Responsive Design

La aplicación está completamente optimizada para dispositivos móviles y de escritorio, con breakpoints adaptativos y componentes responsivos.

## 🎯 Próximas Funcionalidades

- [ ] Sistema de notificaciones en tiempo real
- [ ] Gestión completa de cursos y materias
- [ ] Calendario integrado
- [ ] Sistema de reportes avanzados
- [ ] Chat en tiempo real
- [ ] Gestión de recursos educativos
- [ ] Sistema de evaluaciones online

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas, contacta a través de:
- Email: soporte@eduplataforma.com
- Issues: [GitHub Issues](link-to-issues)

---

Desarrollado con ❤️ para la comunidad educativa