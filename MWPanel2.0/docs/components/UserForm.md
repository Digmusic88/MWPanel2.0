# UserForm Component

## Descripción

`UserForm` es un componente reutilizable para la creación y edición de usuarios en el sistema educativo. Maneja toda la lógica del formulario, validación, y integración con los diferentes tipos de usuarios (administradores, profesores, estudiantes, padres).

## Características

- **Reutilizable**: Funciona tanto para creación como edición de usuarios
- **Validación completa**: Validación en tiempo real y al envío
- **Campos dinámicos**: Muestra campos específicos según el rol seleccionado
- **Gestión de imágenes**: Integración con el sistema de subida de imágenes
- **Conexiones familiares**: Manejo de relaciones entre padres e hijos
- **Accesibilidad**: Cumple con estándares de accesibilidad web

## Props

### UserFormProps

```typescript
interface UserFormProps {
  /** Usuario a editar (null para modo creación) */
  user?: UserType | null;
  
  /** Modo del formulario */
  mode: 'create' | 'edit';
  
  /** Callback cuando se envía el formulario */
  onSubmit: (userData: Omit<UserType, 'id' | 'createdAt'>) => Promise<void>;
  
  /** Callback cuando se cancela el formulario */
  onCancel: () => void;
  
  /** Estado de carga del formulario */
  isSubmitting?: boolean;
  
  /** Clase CSS adicional */
  className?: string;
}
```

## Uso Básico

### Modo Creación

```tsx
import UserForm from './components/Users/UserForm';

function CreateUserPage() {
  const handleSubmit = async (userData) => {
    try {
      await createUser(userData);
      // Manejar éxito
    } catch (error) {
      // Manejar error
    }
  };

  const handleCancel = () => {
    // Lógica de cancelación
  };

  return (
    <UserForm
      mode="create"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
```

### Modo Edición

```tsx
import UserForm from './components/Users/UserForm';

function EditUserPage({ user }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (userData) => {
    setIsSubmitting(true);
    try {
      await updateUser(user.id, userData);
      // Manejar éxito
    } catch (error) {
      // Manejar error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserForm
      mode="edit"
      user={user}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/users')}
      isSubmitting={isSubmitting}
    />
  );
}
```

## Campos del Formulario

### Campos Básicos (Todos los roles)

- **Nombre Completo** (obligatorio)
- **Email** (obligatorio, validación de formato)
- **Teléfono** (opcional)
- **Rol** (obligatorio)
- **Imagen de Perfil** (opcional)
- **Estado Activo** (checkbox)

### Campos Específicos por Rol

#### Estudiante
- **Grupo Base** (obligatorio)
- **Selector de Padres/Tutores** (opcional)

#### Profesor
- **Materias que Imparte** (obligatorio, selección múltiple)

#### Padre/Tutor
- **Selector de Estudiantes** (obligatorio en creación)
- **Gestor de Conexiones Familiares** (en edición)

#### Administrador
- Solo campos básicos

## Validación

### Reglas de Validación

1. **Nombre**: Obligatorio, no puede estar vacío
2. **Email**: Obligatorio, debe tener formato válido
3. **Grupo Base**: Obligatorio para estudiantes
4. **Materias**: Al menos una materia para profesores
5. **Estudiantes**: Al menos un estudiante para padres (en creación)

### Mensajes de Error

Los errores se muestran debajo de cada campo y incluyen:
- Mensajes descriptivos en español
- Estilo visual consistente
- Limpieza automática al corregir el error

## Integración con Otros Componentes

### ImageUpload
- Manejo de subida de imágenes de perfil
- Validación de formato y tamaño
- Preview en tiempo real

### StudentParentSelector
- Búsqueda dinámica de usuarios
- Selección múltiple
- Creación de nuevos usuarios

### FamilyConnectionManager
- Gestión de conexiones familiares existentes
- Solo en modo edición para padres y estudiantes

## Estados del Componente

### Loading States
- `isSubmitting`: Deshabilita el formulario durante el envío
- `isUploadingImage`: Indica subida de imagen en progreso

### Error States
- Errores de validación por campo
- Error general del formulario
- Manejo de errores de red

## Eventos

### onSubmit
```typescript
onSubmit: (userData: Omit<UserType, 'id' | 'createdAt'>) => Promise<void>
```

Llamado cuando el formulario es válido y se envía. Recibe los datos del usuario sin `id` ni `createdAt`.

### onCancel
```typescript
onCancel: () => void
```

Llamado cuando el usuario cancela la operación.

## Personalización

### Estilos CSS
El componente acepta una prop `className` para personalización adicional:

```tsx
<UserForm
  className="custom-form-styles"
  // ... otras props
/>
```

### Configuración de Roles
Los roles disponibles se configuran en el array `roleOptions`:

```typescript
const roleOptions = [
  { value: 'admin', label: 'Administrador', icon: UserCheck },
  { value: 'teacher', label: 'Profesor', icon: GraduationCap },
  { value: 'student', label: 'Estudiante', icon: User },
  { value: 'parent', label: 'Padre', icon: Home },
];
```

## Accesibilidad

- Labels asociados correctamente con inputs
- Navegación por teclado completa
- Mensajes de error accesibles
- Contraste de colores adecuado
- Indicadores de campos obligatorios

## Testing

### Pruebas Unitarias
```bash
npm test UserForm.test.tsx
```

### Pruebas de Integración
```bash
npm test UserForm.integration.test.tsx
```

### Casos de Prueba Cubiertos
- Renderizado en diferentes modos
- Validación de campos
- Envío de formulario
- Manejo de errores
- Interacción con componentes hijos

## Dependencias

- `react`: ^18.3.1
- `lucide-react`: ^0.344.0
- `../../context/UsersContext`
- `../../services/imageService`
- `../UI/ImageUpload`
- `./StudentParentSelector`
- `./FamilyConnectionManager`

## Consideraciones de Rendimiento

- Validación debounced para evitar re-renders excesivos
- Memoización de funciones de callback
- Lazy loading de componentes complejos
- Optimización de re-renders con React.memo donde sea apropiado

## Roadmap

### Próximas Mejoras
- [ ] Validación asíncrona de email único
- [ ] Autoguardado de borrador
- [ ] Soporte para campos personalizados
- [ ] Integración con sistema de permisos
- [ ] Modo de solo lectura
- [ ] Historial de cambios

### Mejoras de UX
- [ ] Indicador de progreso de guardado
- [ ] Confirmación antes de cancelar con cambios
- [ ] Sugerencias automáticas para campos
- [ ] Validación en tiempo real mejorada
