import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { docentesService } from '../services/api'

const Docentes = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [usuario_id, setUsuarioId] = useState('')
  const [ci, setCi] = useState('')
  const [nombreci, setNombreci] = useState('')
  const [especialidad, setEspecialidad] = useState('')
  const [telefono, setTelefono] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await docentesService.list()
        if (!mounted) return
        setItems(res.data?.data || res.data || [])
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Error cargando docentes')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const resetForm = () => {
    setUsuarioId('')
    setCi('')
    setNombreci('')
    setEspecialidad('')
    setTelefono('')
    setEditingId(null)
    setValidationErrors({})
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setValidationErrors({})
    setSaving(true)
    try {
      const payload = { 
        usuario_id: usuario_id && usuario_id.trim() ? Number(usuario_id) : null, 
        ci, 
        nombreci, 
        especialidad, 
        telefono 
      }
      if (editingId) {
        const res = await docentesService.update(editingId, payload)
        const updated = res.data?.data || res.data || null
        if (updated) setItems((s) => s.map((it) => (it.id === editingId ? updated : it)))
        setSuccessMsg('Docente actualizado')
      } else {
        const res = await docentesService.create(payload)
        const created = res.data?.data || res.data || null
        if (created) setItems((s) => [created, ...s])
        setSuccessMsg('Docente creado')
      }
      resetForm()
      setTimeout(() => setSuccessMsg(null), 2500)
    } catch (err) {
      const data = err?.response?.data
      if (data?.errors) setValidationErrors(data.errors)
      else setError(data?.message || err?.message || 'Error guardando docente')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (d) => {
    setEditingId(d.id)
    setUsuarioId(d.usuario_id || d.usuario?.id || '')
    setCi(d.ci || '')
    setNombreci(d.nombreci || d.nombre || '')
    setEspecialidad(d.especialidad || '')
    setTelefono(d.telefono || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar docente?')) return
    try {
      await docentesService.remove(id)
      setItems((s) => s.filter((it) => it.id !== id))
      setSuccessMsg('Docente eliminado')
      setTimeout(() => setSuccessMsg(null), 2000)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Error eliminando docente')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Docentes</h1>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuario ID (opcional)</label>
              <input value={usuario_id} onChange={(e) => setUsuarioId(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CI</label>
              <input value={ci} onChange={(e) => setCi(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
              <input value={nombreci} onChange={(e) => setNombreci(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Especialidad</label>
              <input value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && <tr key="loading"><td colSpan={5} className="px-6 py-4 text-center">Cargando...</td></tr>}
                {!loading && items.length === 0 && <tr key="empty"><td colSpan={5} className="px-6 py-4 text-center">No hay docentes.</td></tr>}
                {items.map((d) => (
                  <tr key={d.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.ci}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.nombreci || d.nombre || d.usuario?.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.especialidad}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.telefono}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="inline-flex gap-2">
                        <button onClick={() => handleEdit(d)} className="px-3 py-1 bg-yellow-500 text-white rounded">Editar</button>
                        <button onClick={() => handleDelete(d.id)} className="px-3 py-1 bg-red-600 text-white rounded">Eliminar</button>
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

export default Docentes
