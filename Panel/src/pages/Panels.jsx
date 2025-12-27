import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createPanel, deletePanel, fetchPanels, updatePanel } from '../services/userApi'

const emptyForm = { panelName: '', circuit: '' }

const Panels = () => {
  const { user } = useAuth()
  const [panels, setPanels] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState({ loading: false, error: '', success: '' })
  const [editingName, setEditingName] = useState(null)

  const load = async () => {
    try {
      const data = await fetchPanels()
      setPanels(data)
    } catch (error) {
      setStatus({ loading: false, error: error?.response?.data?.message || 'Failed to load panels', success: '' })
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ loading: true, error: '', success: '' })
    try {
      if (editingName) {
        await updatePanel({ originalPanelName: editingName, panelName: form.panelName, circuit: form.circuit })
        setStatus({ loading: false, error: '', success: 'Panel updated' })
      } else {
        await createPanel(form)
        setStatus({ loading: false, error: '', success: 'Panel added' })
      }
      setEditingName(null)
      setForm(emptyForm)
      await load()
    } catch (error) {
      setStatus({
        loading: false,
        error: error?.response?.data?.message || 'Failed to add panel (admin only)',
        success: '',
      })
    }
  }

  const handleDelete = async (name) => {
    await deletePanel(name)
    await load()
  }

  const handleEdit = (p) => {
    setEditingName(p.panelName)
    setForm({ panelName: p.panelName || '', circuit: p.circuit || '' })
  }

  const groupedPanels = useMemo(() => {
    const map = new Map()
    for (const p of panels) {
      const key = (p.panelName || '').trim()
      if (!key) continue
      const existing = map.get(key) || { panelName: key, circuits: [], ref: p }
      if (p.circuit) existing.circuits.push(p.circuit)
      existing.ref = existing.ref || p
      map.set(key, existing)
    }
    return Array.from(map.values()).map((p) => ({
      ...p,
      circuits: p.circuits.sort((a, b) => String(a).localeCompare(String(b))),
    })).sort((a, b) => a.panelName.localeCompare(b.panelName))
  }, [panels])

  const flattenedRows = useMemo(() => {
    const rows = []
    for (const p of groupedPanels) {
      const circuits = p.circuits.length ? p.circuits : ['—']
      circuits.forEach((circuit, idx) => {
        rows.push({
          panelName: idx === 0 ? p.panelName : '',
          circuit,
          ref: p.ref,
        })
      })
    }
    return rows
  }, [groupedPanels])

  return (
    <div className="stack gap-lg">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Panels</p>
            <h1 className="title">Manage panel circuits</h1>
            <p className="muted">
              Admin only. Signed in as <strong>{user?.username}</strong> ({user?.role})
            </p>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-field">
              <span>Panel name</span>
              <input name="panelName" value={form.panelName} onChange={handleChange} required />
            </label>
            <label className="form-field">
              <span>Circuit</span>
              <input name="circuit" value={form.circuit} onChange={handleChange} required />
            </label>
          </div>

          {status.error ? <p className="error">{status.error}</p> : null}
          {status.success ? <p className="success">{status.success}</p> : null}

          <div className="form-row" style={{ gap: '0.75rem' }}>
            <button className="primary-btn" type="submit" disabled={status.loading || user?.role !== 'admin'}>
              {status.loading ? 'Saving…' : editingName ? 'Update panel' : 'Add panel'}
            </button>
            {editingName ? (
              <button
                className="ghost-btn"
                type="button"
                onClick={() => {
                  setEditingName(null)
                  setForm(emptyForm)
                }}
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Catalog</p>
            <h2 className="title-sm">Panels</h2>
          </div>
          <div className="badge">{panels.length} items</div>
        </div>
        <div className="table">
          <div className="table__head">
            <span>Name</span>
            <span>Circuit</span>
            <span />
          </div>
          <div className="table__body">
            {flattenedRows.map((row, idx) => (
              <div key={`${row.panelName || row.ref?.panelName || ''}-${row.circuit}-${idx}`} className="table__row">
                <span>{row.panelName}</span>
                <span>{row.circuit}</span>
                <span className="table__actions">
                  {user?.role === 'admin' ? (
                    <>
                      <button className="ghost-btn" type="button" onClick={() => handleEdit(row.ref || {})}>
                        Edit
                      </button>
                      <button
                        className="ghost-btn"
                        type="button"
                        onClick={() => handleDelete(row.ref?.panelName || row.panelName)}
                      >
                        Delete
                      </button>
                    </>
                  ) : null}
                </span>
              </div>
            ))}
            {panels.length === 0 ? <div className="muted">No panels yet.</div> : null}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Panels

