import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userData = authService.getUserData();

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Redirigir de todas formas
      window.location.href = '/login';
    }
  };

  const getRoleDisplayName = (role) => {
    if (!role) return 'Usuario';
    const r = String(role).toLowerCase();
    if (r === 'admin' || r === 'administrador') return 'Administrador';
    if (r === 'docente' || r === 'd') return 'Docente';
    return String(role);
  };

  const roleShort = authService.getUserRole();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">
                Gestión de Horarios
              </span>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {userData && (
              <div className="flex items-center space-x-4">
                {/* enlaces para administradores */}
                {roleShort === 'admin' && (
                  <div className="flex items-center space-x-3">
                    <Link to="/aulas" className="text-sm text-gray-700 hover:underline">Aulas</Link>
                    <Link to="/materias" className="text-sm text-gray-700 hover:underline">Materias</Link>
                    <Link to="/docentes" className="text-sm text-gray-700 hover:underline">Docentes</Link>
                    <Link to="/grupos" className="text-sm text-gray-700 hover:underline">Grupos</Link>
                    <Link to="/horarios" className="text-sm text-gray-700 hover:underline">Horarios</Link>
                    <Link to="/gestiones" className="text-sm text-gray-700 hover:underline">Gestiones</Link>
                  </div>
                )}

                <div className="text-sm text-gray-700">
                  <span className="font-medium">{userData?.nombre || userData?.correo}</span>
                  <span className="ml-2 text-gray-500">({getRoleDisplayName(roleShort || userData?.rol)})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Abrir menú principal</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            {userData && (
              <>
                <div className="px-3 py-2 text-sm text-gray-700">
                  <div className="font-medium">{userData?.nombre || userData?.correo}</div>
                  <div className="text-gray-500">{getRoleDisplayName(roleShort || userData?.rol)}</div>
                </div>
                {roleShort === 'admin' && (
                  <>
                    <Link to="/aulas" className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Aulas</Link>
                    <Link to="/materias" className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Materias</Link>
                    <Link to="/docentes" className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Docentes</Link>
                    <Link to="/grupos" className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Grupos</Link>
                    <Link to="/horarios" className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Horarios</Link>
                    <Link to="/gestiones" className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Gestiones</Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
