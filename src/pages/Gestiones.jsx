import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { gestionesService } from '../services/api'

const Gestiones = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [activo, setActivo] = useState(true)

  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await gestionesService.list()
        if (!mounted) return
        setItems(res.data?.data || res.data || [])
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Error cargando gestiones')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const resetForm = () => {
    setCodigo('')
    setNombre('')
    setActivo(true)
    setEditingId(null)
    setValidationErrors({})
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setValidationErrors({})
    setSaving(true)
    try {
      const payload = { codigo, nombre, activo }
      if (editingId) {
        const res = await gestionesService.update(editingId, payload)
        const updated = res.data?.data || res.data || null
        if (updated) setItems((s) => s.map((it) => (it.id === editingId ? updated : it)))
        setSuccessMsg('Gestión actualizada')
      } else {
        const res = await gestionesService.create(payload)
        const created = res.data?.data || res.data || null
        if (created) setItems((s) => [created, ...s])
        setSuccessMsg('Gestión creada')
      }
      resetForm()
      setTimeout(() => setSuccessMsg(null), 2500)
    } catch (err) {
      const data = err?.response?.data
      if (data?.errors) setValidationErrors(data.errors)
      else setError(data?.message || err?.message || 'Error guardando gestión')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (g) => {
    setEditingId(g.id)
    setCodigo(g.codigo || '')
    setNombre(g.nombre || '')
    setActivo(Boolean(g.activo ?? true))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar gestión?')) return
    try {
      await gestionesService.remove(id)
      setItems((s) => s.filter((it) => it.id !== id))
      setSuccessMsg('Gestión eliminada')
      setTimeout(() => setSuccessMsg(null), 2000)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Error eliminando gestión')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Gestiones</h1>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Código</label>
              <input value={codigo} onChange={(e) => setCodigo(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div className="flex items-center gap-3">
              <label className="block text-sm font-medium text-gray-700">Activo</label>
              <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="mt-1" />
            </div>
            <div className="md:col-span-3 flex items-center gap-3">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && <tr key="loading"><td colSpan={4} className="px-6 py-4 text-center">Cargando...</td></tr>}
                {!loading && items.length === 0 && <tr key="empty"><td colSpan={4} className="px-6 py-4 text-center">No hay gestiones.</td></tr>}
                {items.map((g) => (
                  <tr key={g.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.codigo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{g.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{g.activo ? 'Sí' : 'No'}</td>
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

export default Gestiones
