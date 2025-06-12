import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UsersProvider } from './context/UsersContext';
import { GroupsProvider } from './context/GroupsContext';
import { SubjectsProvider } from './context/SubjectsContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/Layout/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import GroupsManagement from './pages/admin/GroupsManagement';
import CursosMateriasPage from './features/cursosMaterias/CursosMateriasPage';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import ParentDashboard from './pages/parent/ParentDashboard';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          user ? <Navigate to={`/${user.role}`} replace /> : <Navigate to="/login" replace />
        }
      />
      
      {/* Rutas de Administrador */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="groups" element={<GroupsManagement />} />
        <Route path="courses" element={<CursosMateriasPage />} />
        <Route path="reports" element={<div className="p-6">Reportes y Análisis (Próximamente)</div>} />
        <Route path="settings" element={<div className="p-6">Configuración del Sistema (Próximamente)</div>} />
      </Route>

      {/* Rutas de Profesor */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="classes" element={<div className="p-6">Mis Clases (Próximamente)</div>} />
        <Route path="grades" element={<div className="p-6">Calificaciones y Asistencia (Próximamente)</div>} />
        <Route path="assignments" element={<div className="p-6">Tareas (Próximamente)</div>} />
        <Route path="resources" element={<div className="p-6">Recursos Educativos (Próximamente)</div>} />
        <Route path="messages" element={<div className="p-6">Mensajes (Próximamente)</div>} />
        <Route path="schedule" element={<div className="p-6">Horario (Próximamente)</div>} />
      </Route>

      {/* Rutas de Estudiante */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<div className="p-6">Mis Cursos (Próximamente)</div>} />
        <Route path="grades" element={<div className="p-6">Mis Calificaciones (Próximamente)</div>} />
        <Route path="assignments" element={<div className="p-6">Tareas (Próximamente)</div>} />
        <Route path="resources" element={<div className="p-6">Recursos Educativos (Próximamente)</div>} />
        <Route path="messages" element={<div className="p-6">Mensajes (Próximamente)</div>} />
        <Route path="schedule" element={<div className="p-6">Mi Horario (Próximamente)</div>} />
      </Route>

      {/* Rutas de Padre */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ParentDashboard />} />
        <Route path="progress" element={<div className="p-6">Progreso del Hijo (Próximamente)</div>} />
        <Route path="attendance" element={<div className="p-6">Asistencia (Próximamente)</div>} />
        <Route path="messages" element={<div className="p-6">Mensajes (Próximamente)</div>} />
        <Route path="notifications" element={<div className="p-6">Notificaciones (Próximamente)</div>} />
        <Route path="reports" element={<div className="p-6">Reportes Académicos (Próximamente)</div>} />
      </Route>

      {/* Ruta catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <UsersProvider>
        <SubjectsProvider>
          <GroupsProvider>
            <Router>
              <AppRoutes />
            </Router>
          </GroupsProvider>
        </SubjectsProvider>
      </UsersProvider>
    </AuthProvider>
  );
}

export default App;
