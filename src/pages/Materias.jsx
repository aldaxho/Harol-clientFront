import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { materiasService } from '../services/api'

const Materias = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [sigla, setSigla] = useState('')
  const [nombre, setNombre] = useState('')
  const [nivel, setNivel] = useState('Pregrado')
  const [semestre, setSemestre] = useState(1)
  const [creditos, setCreditos] = useState(4)
  const [estado, setEstado] = useState('activo')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await materiasService.list()
        if (!mounted) return
        setItems(res.data?.data || res.data || [])
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Error cargando materias')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const resetForm = () => {
    setSigla('')
    setNombre('')
    setNivel('Pregrado')
    setSemestre(1)
    setCreditos(4)
    setEstado('activo')
    setEditingId(null)
    setValidationErrors({})
    setSuccessMsg(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setValidationErrors({})
    setSaving(true)
    try {
      const payload = { sigla, nombre, nivel, semestre: Number(semestre), creditos: Number(creditos), estado }
      if (editingId) {
        const res = await materiasService.update(editingId, payload)
        const updated = res.data?.data || res.data || null
        if (updated) setItems((s) => s.map((it) => (String(it.id) === String(editingId) ? updated : it)))
        setSuccessMsg('Materia actualizada')
      } else {
        const res = await materiasService.create(payload)
        const created = res.data?.data || res.data || null
        if (created) setItems((s) => [created, ...s])
        setSuccessMsg('Materia creada')
      }
      resetForm()
      setTimeout(() => setSuccessMsg(null), 2500)
    } catch (err) {
      const data = err?.response?.data
      if (data?.errors) setValidationErrors(data.errors)
      else setError(data?.message || err?.message || 'Error guardando materia')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (m) => {
    // Asegurar que el ID esté disponible antes de proceder
    if (!m || (!m.id && !m.sigla)) {
      console.error('Error: Materia sin ID válido:', m)
      return
    }
    
    const id = m.id || m.sigla // Usar ID o sigla como fallback
    setEditingId(id)
    setSigla(m.sigla || '')
    setNombre(m.nombre || '')
    setNivel(m.nivel || 'Pregrado')
    setSemestre(m.semestre ?? 1)
    setCreditos(m.creditos ?? 4)
    setEstado(m.estado || 'activo')
    setValidationErrors({})
    setSuccessMsg(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar materia?')) return
    try {
      await materiasService.remove(id)
      setItems((s) => s.filter((it) => it.id !== id))
      setSuccessMsg('Materia eliminada')
      setTimeout(() => setSuccessMsg(null), 2000)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Error eliminando materia')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Materias</h1>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sigla</label>
              <input value={sigla} onChange={(e) => setSigla(e.target.value)} required className="mt-1 block w-full border rounded px-3 py-2" />
              {validationErrors.sigla && <p className="text-xs text-red-600">{validationErrors.sigla.join(' ')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nivel</label>
              <input value={nivel} onChange={(e) => setNivel(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Semestre</label>
              <input type="number" min={1} value={semestre} onChange={(e) => setSemestre(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Créditos</label>
              <input type="number" min={0} value={creditos} onChange={(e) => setCreditos(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div className="md:col-span-4 flex items-center gap-3">
              <button disabled={saving} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                {saving ? 'Guardando...' : (editingId !== null ? 'Actualizar' : 'Crear')}
              </button>
              {editingId !== null && <button type="button" onClick={resetForm} className="px-3 py-2 bg-gray-200 rounded">Cancelar</button>}
              {successMsg && <div className="text-green-600 ml-4">{successMsg}</div>}
            </div>
          </form>

          {error && <div className="text-red-600 mb-4">{error}</div>}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sigla</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semestre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creditos</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && <tr key="loading"><td colSpan={5} className="px-6 py-4 text-center">Cargando...</td></tr>}
                {!loading && items.length === 0 && <tr key="empty"><td colSpan={5} className="px-6 py-4 text-center">No hay materias.</td></tr>}
                {items.map((m) => (
                  <tr key={m.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.sigla}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{m.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{m.semestre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{m.creditos}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="inline-flex gap-2">
                        <button onClick={() => handleEdit(m)} className="px-3 py-1 bg-yellow-500 text-white rounded">Editar</button>
                        <button onClick={() => handleDelete(m.id)} className="px-3 py-1 bg-red-600 text-white rounded">Eliminar</button>
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

export default Materias
