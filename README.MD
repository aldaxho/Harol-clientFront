# Management Schedules — Frontend (React + Vite)

Cliente React para la aplicación de gestión de horarios docentes.

Este repositorio contiene la aplicación SPA construida con React, Vite y Tailwind CSS. Está diseñada para comunicarse con un backend Laravel que expone endpoints JSON bajo /api.

## Contenido
- src/ — código fuente React
  - pages/ — vistas: Login.jsx, AdminDashboard.jsx, DocenteHorario.jsx, etc.
  - components/ — componentes reutilizables (Navbar, ProtectedRoute, ...)
  - services/api.js — instancia axios y authService (login, logout, token storage, normalización de roles)
- public/ — archivos estáticos
- scripts/check_api_endpoints.mjs — pequeño script para comprobar qué endpoints /api devuelven JSON

## Requisitos
- Node.js (recomendado >= 22.12.0 or 20.19.x)
  - Nota: El proyecto usa Vite y algunas dependencias podrían mostrar advertencias si tu Node es más viejo o una versión entre parches.
- npm (incluido con Node) o pnpm/yarn si prefieres
- Backend Laravel corriendo en http://localhost:8000 (por defecto)

> Si tu backend corre en otra URL, edita src/services/api.js y cambia API_BASE_URL.

## Instalación (local)
1. Instala dependencias:

powershell
npm install


2. Instala herramientas de desarrollo (si aún no las tienes incluidas):

powershell
npm install -D tailwindcss postcss autoprefixer
# (opcional) si ves errores con @tailwindcss/vite elimina su import en vite.config.js o instálalo


## Scripts útiles
- npm run dev — arranca el servidor de desarrollo Vite (modo HMR)
- npm run build — genera los archivos de producción con Vite
- npm run check:api — ejecuta scripts/check_api_endpoints.mjs para sondear varios endpoints /api y ver si devuelven JSON

## Flujo de autenticación
- El frontend llama POST /api/login con el cuerpo:
  - { correo, contraseña }
- src/services/api.js normaliza respuestas comunes y busca el token en varias ubicaciones (por ejemplo: data.token, access_token, token). Si encuentra token, lo guarda en localStorage.auth_token y guarda user_data en localStorage.user_data.
- Tras login exitoso el frontend muestra un mensaje de éxito y redirige según el rol:
  - Roles normalizados: administrador -> admin, docente/profesor -> docente.
  - Rutas protegidas (archivo src/app.jsx):
    - /admin (requiere role admin) — AdminDashboard.
    - /horario (requiere role docente) — DocenteHorario.
- Las peticiones usan un interceptor axios que añade Authorization: Bearer <token> si localStorage.auth_token existe.
- Si una respuesta devuelve 401 el interceptor limpia localStorage y redirige a /login.

### Ejemplo de respuesta de login aceptada
El frontend espera (o normaliza) alguna de estas formas. Un ejemplo validado que funciona es:

json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "usuario": { "id": 1, "correo": "admin@example.com", "rol": "administrador", "nombre": "Administrador" },
    "token": "<jwt-o-token-aqui>"
  }
}
