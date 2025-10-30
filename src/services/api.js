import axios from 'axios';

// Base URL para desarrollo local
//const API_BASE_URL = 'http://localhost:8000/api';
const API_BASE_URL = 'http://68.183.173.197:8000/api';
// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Autenticación y helpers ---
export const authService = {
  /**
   * login acepta email/Password en inglés o correo/contraseña en español.
   * Para máxima compatibilidad enviamos ambos pares (email/password y correo/contraseña).
   */
  login: async (emailOrCorreo, passwordOrContrasena) => {
    try {
      const payload = {
        email: emailOrCorreo,
        password: passwordOrContrasena,
        // compatibilidad con backends que esperan claves en español
        correo: emailOrCorreo,
        contraseña: passwordOrContrasena,
      };

      const response = await api.post('/login', payload);
      const body = response.data || {};

      // Extraer token/usuario desde múltiples formas comunes
      const token =
        body?.data?.token || body?.data?.access_token || body?.token || body?.access_token || body?.accessToken || null;

      const usuarioRaw =
        body?.data?.usuario || body?.data?.user || body?.usuario || body?.user || body?.user_data || null;

      // Normalizar usuario para front: mantener raw type y añadir rol legible
      const normalizeUser = (u) => {
        if (!u) return null;
        const rawType = u.type || u.tipo || u.role || u.rol || null;
        // derive short role used by ProtectedRoute ('admin'|'docente'|other)
        let shortRole = null;
        if (rawType) {
          const s = String(rawType).toLowerCase();
          if (s === 'a' || s.includes('admin')) shortRole = 'admin';
          else if (s === 'd' || s.includes('docen') || s.includes('teacher') || s.includes('prof')) shortRole = 'docente';
          else shortRole = s;
        }

        // human-friendly rol for display
        let readable = null;
        if (shortRole === 'admin') readable = 'Administrador';
        else if (shortRole === 'docente') readable = 'Docente';
        else if (rawType) readable = String(rawType);

        return {
          // keep original fields
          ...u,
          // canonical properties
          type: rawType,
          // short normalized role used by logic (admin/docente/...)
          _role: shortRole,
          // readable role for UI
          rol: readable,
          // normalize common name/email keys
          nombre: u.nombre || u.name || u.nombre_completo || u.first_name || null,
          correo: u.email || u.correo || u.email_address || null,
        };
      };

      const usuario = normalizeUser(usuarioRaw);

      if (token) {
        localStorage.setItem('auth_token', token);
        if (usuario) localStorage.setItem('user_data', JSON.stringify(usuario));
        return { success: true, token, usuario, raw: body };
      }

      // Intentar formas alternativas (ej. body.success + body.data)
      if (body?.success && body?.data) {
        const maybeToken = body.data.token || body.data.access_token || null;
        const maybeUser = body.data.usuario || body.data.user || null;
        if (maybeToken) {
          localStorage.setItem('auth_token', maybeToken);
          if (maybeUser) localStorage.setItem('user_data', JSON.stringify(maybeUser));
          return { success: true, token: maybeToken, usuario: maybeUser, raw: body };
        }
      }

      const msg = body?.message || 'Respuesta inesperada del servidor al iniciar sesión';
      throw new Error(msg);
    } catch (error) {
      const serverMsg = error?.response?.data?.message || error?.message || 'Error al iniciar sesión';
      throw serverMsg;
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.warn('Error al cerrar sesión (ignorado):', error?.message || error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/me');
      return response.data?.data || response.data || null;
    } catch (error) {
      throw error.response?.data?.message || 'Error al obtener datos del usuario';
    }
  },

  isAuthenticated: () => !!localStorage.getItem('auth_token'),

  getUserData: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  getUserRole: () => {
    const userData = authService.getUserData();
    if (!userData) return null;
    // prefer the normalized short role stored as _role
    if (userData._role) return userData._role;
    const raw = userData.type || userData.rol || userData.role || null;
    if (!raw) return null;
    const r = String(raw).toLowerCase();
    if (r === 'a' || r.includes('admin')) return 'admin';
    if (r === 'd' || r.includes('docen') || r.includes('teacher') || r.includes('prof')) return 'docente';
    return r;
  },
};

// --- Servicios CRUD para recursos comunes (orientados a objeto) ---
// Usamos una fábrica `resource()` que crea un conjunto de métodos CRUD
// por recurso. De esta forma, los endpoints están centralizados aquí y
// para cambiar el backend **solo** debes modificar `API_BASE_URL` arriba.
const resource = (name) => ({
  list: (params) => api.get(`/${name}`, { params }),
  get: (id) => api.get(`/${name}/${id}`),
  create: (payload) => api.post(`/${name}`, payload),
  update: (id, payload) => api.put(`/${name}/${id}`, payload),
  remove: (id) => api.delete(`/${name}/${id}`),
});

// Instancias orientadas a objeto para cada recurso
export const aulasService = resource('aulas');
export const materiasService = resource('materias');
export const gruposService = resource('grupos');
export const horariosService = resource('horarios');
export const docentesService = resource('docentes');
export const gestionesService = resource('gestiones');

// Agregado un objeto único `API` que contiene todos los servicios (opcional)
// para usar en el código como `API.aulas.list()` si se prefiere ese estilo.
export const API = {
  aulas: aulasService,
  materias: materiasService,
  grupos: gruposService,
  horarios: horariosService,
  docentes: docentesService,
  gestiones: gestionesService,
};

export default api;
