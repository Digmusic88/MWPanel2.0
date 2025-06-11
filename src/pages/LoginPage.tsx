import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const success = await login(email, password);
    if (!success) {
      setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
    }
    
    setIsSubmitting(false);
  };

  const demoAccounts = [
    { role: 'Administrador', email: 'admin@edu.com', password: 'demo123' },
    { role: 'Admin (Ana)', email: 'ana.rodriguez@edu.com', password: 'demo123' },
    { role: 'Profesor', email: 'teacher@edu.com', password: 'demo123' },
    { role: 'Prof. Carlos', email: 'carlos.martinez@edu.com', password: 'demo123' },
    { role: 'Estudiante', email: 'student@edu.com', password: 'demo123' },
    { role: 'Est. María', email: 'maria.gonzalez@edu.com', password: 'demo123' },
    { role: 'Padre', email: 'parent@edu.com', password: 'demo123' },
    { role: 'Padre Luis', email: 'luis.fernandez@edu.com', password: 'demo123' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
      }}>
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{
      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
    }}>
      <div className="max-w-md w-full space-y-8">
        {/* Encabezado con Logo del Colegio */}
        <div className="text-center">
          <div className="mx-auto mb-8 flex justify-center">
            <img
              src="/logo.png"
              alt="Mundo World School"
              className="h-32 w-auto object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Te damos la bienvenida</h2>
          <p className="text-emerald-100 text-lg font-medium">
            Sistema Integral de Gestión Educativa
          </p>
        </div>

        {/* Formulario de Inicio de Sesión */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Ingresa tu correo electrónico"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Ingresa tu contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Cuentas de Demostración */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4 font-medium">Cuentas de Demostración:</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                  className="text-left p-2 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <div className="font-medium text-xs text-gray-900">{account.role}</div>
                  <div className="text-xs text-gray-500 truncate">{account.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-emerald-100 text-sm">
            © 2024 Mundo World School. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}