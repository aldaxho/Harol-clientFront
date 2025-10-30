import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api, { authService } from '../services/api'

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ aulas: 0, materias: 0, docentes: 0, grupos: 0, horarios: 0 })

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [aulas, materias, docentes, grupos, horarios] = await Promise.all([
          api.get('/aulas').catch(() => ({ data: { data: [] } })),
          api.get('/materias').catch(() => ({ data: { data: [] } })),
          api.get('/docentes').catch(() => ({ data: { data: [] } })),
          api.get('/grupos').catch(() => ({ data: { data: [] } })),
          api.get('/horarios').catch(() => ({ data: { data: [] } })),
        ])

        if (!mounted) return
        setCounts({
          aulas: aulas.data?.data?.length || 0,
          materias: materias.data?.data?.length || 0,
          docentes: docentes.data?.data?.length || 0,
          grupos: grupos.data?.data?.length || 0,
          horarios: horarios.data?.data?.length || 0,
        })
      } catch (err) {
        console.error('Error cargando contadores:', err)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="p-6 rounded-lg">
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-lg text-gray-600">Bienvenido al panel de administración del sistema de gestión de horarios docentes.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
              <StatCard title="Aulas" value={counts.aulas} color="blue" />
              <StatCard title="Materias" value={counts.materias} color="purple" />
              <StatCard title="Docentes" value={counts.docentes} color="green" />
              <StatCard title="Grupos" value={counts.grupos} color="yellow" />
              <StatCard title="Horarios" value={counts.horarios} color="red" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color = 'blue' }) {
  const colors = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  }
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`h-10 w-10 flex items-center justify-center rounded-md bg-gray-100 ${colors[color]}`}></div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
