import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { aulasService } from '../services/api'

const Aulas = () => {
  const [aulas, setAulas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form
  const [codigo, setCodigo] = useState('')
  const [capacidad, setCapacidad] = useState('')
  const [tipo, setTipo] = useState('Teoría')
  const [estado, setEstado] = useState('activo')
  const [saving, setSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await aulasService.list()
        if (!mounted) return
        const items = res.data?.data || res.data || []
        setAulas(items)
      } catch (err) {
        console.error('Error cargando aulas:', err)
        setError(err?.response?.data?.message || err?.message || 'Error cargando aulas')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const resetForm = () => {
    setCodigo('')
    setCapacidad('')
    setTipo('Teoría')
    setEstado('activo')
    setValidationErrors({})
    setEditingId(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setValidationErrors({})
    setSaving(true)
    try {
      const payload = { codigo, capacidad: Number(capacidad || 0), tipo, estado }
      if (editingId) {
        const res = await aulasService.update(editingId, payload)
        const updated = res.data?.data || res.data || null
        if (updated) setAulas((s) => s.map((it) => (it.id === editingId ? updated : it)))
        setSuccessMsg('Aula actualizada correctamente')
      } else {
        const res = await aulasService.create(payload)
        const created = res.data?.data || res.data || null
        if (created) setAulas((s) => [created, ...s])
        setSuccessMsg('Aula creada correctamente')
      }
      resetForm()
      // limpiar mensaje tras 3s
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      console.error('Error guardando aula:', err)
      const data = err?.response?.data
      if (data?.errors) {
        setValidationErrors(data.errors)
      } else {
        setError(data?.message || err?.message || 'Error guardando aula')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (aula) => {
    setEditingId(aula.id)
    setCodigo(aula.codigo || aula.code || '')
    setCapacidad(aula.capacidad ?? aula.capacity ?? '')
    setTipo(aula.tipo || aula.type || 'Teoría')
    setEstado(aula.estado ?? 'activo')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    resetForm()
  }

  const handleDelete = async (id) => {
    const ok = window.confirm('¿Eliminar aula? Esta acción no se puede deshacer.')
    if (!ok) return
    try {
      await aulasService.remove(id)
      setAulas((s) => s.filter((it) => it.id !== id))
      setSuccessMsg('Aula eliminada')
      setTimeout(() => setSuccessMsg(null), 2500)
    } catch (err) {
      console.error('Error eliminando aula:', err)
      setError(err?.response?.data?.message || err?.message || 'Error eliminando aula')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Gestión de Aulas</h1>

          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Código</label>
              <input value={codigo} onChange={(e) => setCodigo(e.target.value)} required className="mt-1 block w-full border rounded px-3 py-2" />
              {validationErrors.codigo && <p className="text-xs text-red-600 mt-1">{validationErrors.codigo.join(' ')}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Capacidad</label>
              <input value={capacidad} onChange={(e) => setCapacidad(e.target.value)} type="number" min={0} required className="mt-1 block w-full border rounded px-3 py-2" />
              {validationErrors.capacidad && <p className="text-xs text-red-600 mt-1">{validationErrors.capacidad.join(' ')}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
                <option>Teoría</option>
                <option>Práctica</option>
                <option>Laboratorio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div className="md:col-span-4 flex items-center gap-3">
              <button disabled={saving} type="submit" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                {saving ? 'Guardando...' : editingId ? 'Actualizar Aula' : 'Crear Aula'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
              )}
              {successMsg && <div className="text-green-600 ml-4">{successMsg}</div>}
            </div>
          </form>

          {error && <div className="text-red-600 mb-4">{error}</div>}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr key="loading">
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Cargando aulas...</td>
                  </tr>
                )}
                {!loading && aulas.length === 0 && (
                  <tr key="empty">
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No hay aulas.</td>
                  </tr>
                )}
                {aulas.map((a) => (
                  <tr key={a.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.codigo || a.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.capacidad}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.tipo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{String(a.estado)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => handleEdit(a)} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm">Editar</button>
                        <button onClick={() => handleDelete(a.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Eliminar</button>
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

export default Aulas
