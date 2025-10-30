import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { gruposService, materiasService, gestionesService } from '../services/api'

const Grupos = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [materia_sigla, setMateriaSigla] = useState('')
  const [gestion_id, setGestionId] = useState('')
  const [nombre, setNombre] = useState('')
  const [turno, setTurno] = useState('Mañana')
  const [cupo_maximo, setCupoMaximo] = useState(30)
  const [cupo_actual, setCupoActual] = useState(0)
  const [estado, setEstado] = useState('activo')
  const [modalidad, setModalidad] = useState('Presencial')

  const [materias, setMaterias] = useState([])
  const [gestiones, setGestiones] = useState([])

  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const [res, rMat, rGes] = await Promise.all([gruposService.list(), materiasService.list(), gestionesService.list()])
        if (!mounted) return
        setItems(res.data?.data || res.data || [])
        setMaterias(rMat.data?.data || rMat.data || [])
        setGestiones(rGes.data?.data || rGes.data || [])
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Error cargando datos')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const resetForm = () => {
    setMateriaSigla('')
    setGestionId('')
    setNombre('')
    setTurno('Mañana')
    setCupoMaximo(30)
    setCupoActual(0)
    setEstado('activo')
    setModalidad('Presencial')
    setEditingId(null)
    setValidationErrors({})
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setValidationErrors({})
    setSaving(true)
    try {
      const payload = { materia_sigla, gestion_id: Number(gestion_id || 0), nombre, turno, cupo_maximo: Number(cupo_maximo), cupo_actual: Number(cupo_actual), estado, modalidad }
      if (editingId) {
        const res = await gruposService.update(editingId, payload)
        const updated = res.data?.data || res.data || null
        if (updated) setItems((s) => s.map((it) => (it.id === editingId ? updated : it)))
        setSuccessMsg('Grupo actualizado')
      } else {
        const res = await gruposService.create(payload)
        const created = res.data?.data || res.data || null
        if (created) setItems((s) => [created, ...s])
        setSuccessMsg('Grupo creado')
      }
      resetForm()
      setTimeout(() => setSuccessMsg(null), 2500)
    } catch (err) {
      const data = err?.response?.data
      if (data?.errors) setValidationErrors(data.errors)
      else setError(data?.message || err?.message || 'Error guardando grupo')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (g) => {
    setEditingId(g.id)
    setMateriaSigla(g.materia_sigla || g.materia?.sigla || '')
    setGestionId(g.gestion_id || g.gestion?.id || '')
    setNombre(g.nombre || '')
    setTurno(g.turno || 'Mañana')
    setCupoMaximo(g.cupo_maximo ?? 30)
    setCupoActual(g.cupo_actual ?? 0)
    setEstado(g.estado || 'activo')
    setModalidad(g.modalidad || 'Presencial')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar grupo?')) return
    try {
      await gruposService.remove(id)
      setItems((s) => s.filter((it) => it.id !== id))
      setSuccessMsg('Grupo eliminado')
      setTimeout(() => setSuccessMsg(null), 2000)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Error eliminando grupo')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Grupos</h1>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Materia (sigla)</label>
              <input value={materia_sigla} onChange={(e) => setMateriaSigla(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gestión</label>
              <select value={gestion_id} onChange={(e) => setGestionId(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
                <option value="">-- seleccionar --</option>
                {gestiones.map((g) => <option key={g.id} value={g.id}>{g.codigo} - {g.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Turno</label>
              <input value={turno} onChange={(e) => setTurno(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cupo max</label>
              <input type="number" value={cupo_maximo} onChange={(e) => setCupoMaximo(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Modalidad</label>
              <select value={modalidad} onChange={(e) => setModalidad(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
                <option>Presencial</option>
                <option>Virtual</option>
                <option>Híbrida</option>
              </select>
            </div>
            <div className="md:col-span-4 flex items-center gap-3">
              <button disabled={saving} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}</button>
              {editingId && <button type="button" onClick={resetForm} className="px-3 py-2 bg-gray-200 rounded">Cancelar</button>}
              {successMsg && <div className="text-green-600 ml-4">{successMsg}</div>}
            </div>
          </form>

          {error && <div className="text-red-600 mb-4">{error}</div>}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gestión</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turno</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cupo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modalidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && <tr key="loading"><td colSpan={8} className="px-6 py-4 text-center">Cargando...</td></tr>}
                {!loading && items.length === 0 && <tr key="empty"><td colSpan={8} className="px-6 py-4 text-center">No hay grupos.</td></tr>}
                {items.map((g) => (
                  <tr key={g.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.materia_sigla || g.materia?.sigla}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{g.gestion?.codigo || g.gestion_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{g.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{g.turno}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{g.cupo_actual}/{g.cupo_maximo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{g.modalidad}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{g.estado}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="inline-flex gap-2">
                        <button onClick={() => handleEdit(g)} className="px-3 py-1 bg-yellow-500 text-white rounded">Editar</button>
                        <button onClick={() => handleDelete(g.id)} className="px-3 py-1 bg-red-600 text-white rounded">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Grupos
