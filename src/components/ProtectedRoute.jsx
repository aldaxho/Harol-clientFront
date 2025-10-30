import { useEffect, useState } from 'react';
import { authService } from '../services/api';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = authService.isAuthenticated();
        const role = authService.getUserRole();
        
        if (authenticated && role) {
          // Verificar que el token sigue siendo válido
          try {
            await authService.getCurrentUser();
            setIsAuthenticated(true);
            setUserRole(role);
          } catch (error) {
            // Token inválido, limpiar datos
            authService.logout();
            setIsAuthenticated(false);
            setUserRole(null);
          }
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirigir al login
    window.location.href = '/login';
    return null;
  }

  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Acceso Denegado
          </h1>
          <p className="mt-2 text-gray-600">
            No tienes permisos para acceder a esta sección.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Tu rol actual: <span className="font-medium capitalize">{userRole}</span>
          </p>
          <div className="mt-6 space-x-4">
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Volver
            </button>
            <button
              onClick={() => {
                authService.logout();
                window.location.href = '/login';
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
