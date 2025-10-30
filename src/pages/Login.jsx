import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'

export default function Login() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const result = await authService.login(correo, contrasena)
      console.log('[Login] authService.login result:', result)
      console.log('[Login] localStorage auth_token:', localStorage.getItem('auth_token'))
      console.log('[Login] localStorage user_data:', localStorage.getItem('user_data'))

      const token = localStorage.getItem('auth_token')
      if (!token) {
        setError('No se recibió token del servidor. Revisa la respuesta del backend.')
        return
      }

  const usuario = authService.getUserData()
  console.log('[Login] usuario from authService.getUserData():', usuario)
  // prefer normalized role from authService.getUserRole()
  const rol = authService.getUserRole() || usuario?.rol

      
      setSuccess('Inicio de sesión exitoso. Redirigiendo...')
      setTimeout(() => {
        if (rol === 'admin') navigate('/admin')
        else if (rol === 'docente') navigate('/horario')
        else navigate('/')
      }, 700)
    } catch (err) {
      console.error('[Login] login error:', err)
      const msg = typeof err === 'string' ? err : err?.response?.data?.message || err?.message || 'Credenciales incorrectas o error de conexión'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md">
        {/* Card principal */}
        <div className="p-8 bg-white shadow-xl rounded-2xl">
          {/* Logo y título */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7h18M3 12h18M3 17h18" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="mb-1 text-2xl font-bold text-gray-900">Management Schedules</h1>
            <p className="text-sm text-gray-500">Bienvenido de vuelta</p>
          </div>

          {/* Success */}
          {success && (
            <div className="p-3 mb-4 text-green-800 border border-green-200 rounded-lg bg-green-50">
              {success}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="correo" className="block mb-2 text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  id="correo"
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="contrasena" className="block mb-2 text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="contrasena"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full px-4 py-3 pr-12 transition-all border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">Recuérdame</span>
              </label>
              <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 border border-red-200 rounded-lg bg-red-50">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Ingresando...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-sm text-center text-gray-600">
            ¿No tienes acceso?{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
              Contacta al administrador
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}