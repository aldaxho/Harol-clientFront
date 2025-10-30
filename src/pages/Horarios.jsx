import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { horariosService, aulasService, docentesService, gruposService } from '../services/api'

const Horarios = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [grupo_id, setGrupoId] = useState('')
  const [aula_id, setAulaId] = useState('')
  const [docente_id, setDocenteId] = useState('')
  const [dia, setDia] = useState('Lunes')
  const [hora_inicio, setHoraInicio] = useState('08:00')
  const [hora_fin, setHoraFin] = useState('09:30')

  const [aulas, setAulas] = useState([])
  const [docentes, setDocentes] = useState([])
  const [grupos, setGrupos] = useState([])

  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const [res, rAulas, rDocs, rGr] = await Promise.all([horariosService.list(), aulasService.list(), docentesService.list(), gruposService.list()])
        if (!mounted) return
        setItems(res.data?.data || res.data || [])
        setAulas(rAulas.data?.data || rAulas.data || [])
        setDocentes(rDocs.data?.data || rDocs.data || [])
        setGrupos(rGr.data?.data || rGr.data || [])
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Error cargando horarios')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const resetForm = () => {
    setGrupoId('')
    setAulaId('')
    setDocenteId('')
    setDia('Lunes')
    setHoraInicio('08:00')
    setHoraFin('09:30')
    setEditingId(null)
    setValidationErrors({})
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setValidationErrors({})
    setSaving(true)
    try {
      const payload = { grupo_id: Number(grupo_id || 0), aula_id: Number(aula_id || 0), docente_id: Number(docente_id || 0), dia, hora_inicio, hora_fin }
      if (editingId) {
        const res = await horariosService.update(editingId, payload)
        const updated = res.data?.data || res.data || null
        if (updated) setItems((s) => s.map((it) => (it.id === editingId ? updated : it)))
        setSuccessMsg('Horario actualizado')
      } else {
        const res = await horariosService.create(payload)
        const created = res.data?.data || res.data || null
        if (created) setItems((s) => [created, ...s])
        setSuccessMsg('Horario creado')
      }
      resetForm()
      setTimeout(() => setSuccessMsg(null), 2500)
    } catch (err) {
      const data = err?.response?.data
      if (data?.errors) setValidationErrors(data.errors)
      else setError(data?.message || err?.message || 'Error guardando horario')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (h) => {
    setEditingId(h.id)
    setGrupoId(h.grupo_id || h.grupo?.id || '')
    setAulaId(h.aula_id || h.aula?.id || '')
    setDocenteId(h.docente_id || h.docente?.id || '')
    setDia(h.dia || 'Lunes')
    setHoraInicio(h.hora_inicio || '08:00')
    setHoraFin(h.hora_fin || '09:30')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar horario?')) return
    try {
      await horariosService.remove(id)
      setItems((s) => s.filter((it) => it.id !== id))
      setSuccessMsg('Horario eliminado')
      setTimeout(() => setSuccessMsg(null), 2000)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Error eliminando horario')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Horarios</h1>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Grupo</label>
              <select value={grupo_id} onChange={(e) => setGrupoId(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
                <option value="">-- seleccionar --</option>
                {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre || g.id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Aula</label>
              <select value={aula_id} onChange={(e) => setAulaId(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
                <option value="">-- seleccionar --</option>
                {aulas.map((a) => <option key={a.id} value={a.id}>{a.codigo || a.name || a.id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Docente</label>
              <select value={docente_id} onChange={(e) => setDocenteId(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
                <option value="">-- seleccionar --</option>
                {docentes.map((d) => <option key={d.id} value={d.id}>{d.nombre || d.nombreci || d.usuario?.nombre || d.id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Día</label>
              <select value={dia} onChange={(e) => setDia(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
                <option>Lunes</option>
                <option>Martes</option>
                <option>Miércoles</option>
                <option>Jueves</option>
                <option>Viernes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hora Inicio</label>
              <input type="time" value={hora_inicio} onChange={(e) => setHoraInicio(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hora Fin</label>
              <input type="time" value={hora_fin} onChange={(e) => setHoraFin(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grupo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aula</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Docente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Día / Hora</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && <tr key="loading"><td colSpan={5} className="px-6 py-4 text-center">Cargando...</td></tr>}
                {!loading && items.length === 0 && <tr key="empty"><td colSpan={5} className="px-6 py-4 text-center">No hay horarios.</td></tr>}
                {items.map((h) => (
                  <tr key={h.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{h.grupo?.nombre || h.grupo_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{h.aula?.codigo || h.aula_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{h.docente?.nombre || h.docente_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{h.dia} {h.hora_inicio} - {h.hora_fin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="inline-flex gap-2">
                        <button onClick={() => handleEdit(h)} className="px-3 py-1 bg-yellow-500 text-white rounded">Editar</button>
                        <button onClick={() => handleDelete(h.id)} className="px-3 py-1 bg-red-600 text-white rounded">Eliminar</button>
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

export default Horarios
