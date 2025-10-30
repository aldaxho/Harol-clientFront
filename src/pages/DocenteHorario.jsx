import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api, { authService } from '../services/api'

const DocenteHorario = () => {
  const [horarios, setHorarios] = useState([])
  const user = authService.getUserData()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        if (!user?.id) return
        const res = await api.get(`/horarios?docente_id=${user.id}`)
        if (!mounted) return
        setHorarios(res.data?.data || [])
      } catch (err) {
        console.error('Error cargando horarios:', err)
      }
    }
    load()
    return () => { mounted = false }
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="rounded-lg h-auto p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Mi Horario</h1>
              <p className="text-lg text-gray-600 mb-8">Consulta tu horario de clases asignadas.</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Día</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignatura</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aula</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {horarios.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No hay horarios asignados.</td>
                      </tr>
                    )}
                    {horarios.map((h) => (
                      <tr key={h.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {h.hora_inicio} - {h.hora_fin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{h.dia_semana}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{h.materia_nombre || h.materia?.nombre || h.materia_sigla}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{h.aula_codigo || h.aula?.codigo || h.aula_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{h.tipo_clase || h.modalidad || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">Los datos se cargan desde el backend si existen endpoints API compatibles.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocenteHorario
