import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  createDailyReport,
  deleteDailyReport,
  fetchDailyReportsByDate,
  fetchMaterials,
  fetchPanels,
  updateDailyReport,
} from '../services/userApi'

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  materialName: '',
  quantity: '',
  unit: '',
  location: '',
  notes: '',
  panelName: '',
  circuit: '',
}

const DailyReport = () => {
  const { user } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [dateFilter, setDateFilter] = useState(initialForm.date)
  const [items, setItems] = useState([])
  const [materials, setMaterials] = useState([])
  const [panels, setPanels] = useState([])
  const [status, setStatus] = useState({ loading: false, error: '', success: '' })
  const [editingId, setEditingId] = useState(null)
  const [panelCircuits, setPanelCircuits] = useState({})

  const materialUnitMap = useMemo(() => {
    const map = new Map()
    materials.forEach((m) => {
      if (m.materialName && m.unit) map.set(m.materialName, m.unit)
    })
    return map
  }, [materials])

  const normalizeDate = (d) => new Date(d).toLocaleDateString('en-CA')

  const load = async (date) => {
    try {
      const targetDateRaw = date || dateFilter || new Date().toISOString().slice(0, 10)
      const targetDate = normalizeDate(targetDateRaw)
      const [reports, mats, pnl] = await Promise.all([
        fetchDailyReportsByDate(targetDate),
        fetchMaterials(),
        fetchPanels(),
      ])
      setItems(reports)
      setMaterials(mats)
      // dedupe panels by name
      const panelMap = new Map()
      pnl.forEach((p) => {
        const name = (p.panelName || '').trim()
        if (!name) return
        if (!panelMap.has(name)) panelMap.set(name, p)
      })
      const uniquePanels = Array.from(panelMap.values())
      setPanels(uniquePanels)
      const circuitsMap = pnl.reduce((acc, p) => {
        const name = (p.panelName || '').trim()
        if (!name) return acc
        acc[name] = acc[name] || []
        if (p.circuit) acc[name].push(p.circuit)
        return acc
      }, {})
      setPanelCircuits(circuitsMap)
    } catch (error) {
      setStatus({ loading: false, error: error?.response?.data?.message || 'Failed to load data', success: '' })
    }
  }

  useEffect(() => {
    void load(dateFilter)
  }, [dateFilter])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'materialName') {
      const unit = materialUnitMap.get(value) || ''
      setForm((prev) => ({ ...prev, materialName: value, unit }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ loading: true, error: '', success: '' })
    try {
      if (editingId) {
        await updateDailyReport(editingId, { ...form, quantity: Number(form.quantity) })
        setStatus({ loading: false, error: '', success: 'Daily report updated' })
      } else {
        await createDailyReport({ ...form, quantity: Number(form.quantity) })
        setStatus({ loading: false, error: '', success: 'Daily report saved' })
      }
      setForm(initialForm)
      setEditingId(null)
      await load(dateFilter)
    } catch (error) {
      setStatus({
        loading: false,
        error: error?.response?.data?.message || 'Failed to save daily report',
        success: '',
      })
    }
  }

  const handleEdit = (row) => {
    setEditingId(row._id)
    setForm({
      date: row.date ? new Date(row.date).toLocaleDateString('en-CA') : initialForm.date,
      materialName: row.materialName || '',
      quantity: row.quantity || '',
      unit: row.unit || '',
      location: row.location || '',
      notes: row.notes || '',
      panelName: row.panelName || '',
      circuit: row.circuit || '',
    })
  }

  const handleDelete = async (id) => {
    await deleteDailyReport(id)
    await load()
  }

  return (
    <div className="stack gap-lg">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Daily report</p>
            <h1 className="title">Log site work</h1>
            <p className="muted">
              Signed in as <strong>{user?.username}</strong> · {user?.site} · {user?.company}
            </p>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-field">
              <span>Date</span>
              <input type="date" name="date" value={form.date} onChange={handleChange} required />
            </label>
            <label className="form-field">
              <span>Material</span>
              <select name="materialName" value={form.materialName} onChange={handleChange} required>
                <option value="">Select material</option>
                {materials.map((m) => (
                  <option key={m._id || m.materialName} value={m.materialName}>
                    {m.materialName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label className="form-field">
              <span>Quantity</span>
              <input
                type="number"
                min="0"
                step="0.01"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </label>
            <label className="form-field">
              <span>Unit</span>
              <input name="unit" value={form.unit} readOnly placeholder="Auto from material" />
            </label>
          </div>

          <div className="form-row">
            <label className="form-field">
              <span>Panel</span>
              <select name="panelName" value={form.panelName} onChange={handleChange}>
                <option value="">Select panel</option>
                {panels.map((p) => (
                  <option key={p.panelName} value={p.panelName}>
                    {p.panelName}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Circuit</span>
              <select name="circuit" value={form.circuit} onChange={handleChange}>
                <option value="">Select circuit</option>
                {(panelCircuits[form.panelName] || []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label className="form-field">
              <span>Location</span>
              <select name="location" value={form.location} onChange={handleChange} required>
                <option value="">Choose location</option>
                {['Subsol', 'Parter', 'E1', 'E2', 'E3', 'E4', 'E5', 'Exterior', 'Scara'].map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Notes</span>
              <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" />
            </label>
          </div>

          {status.error ? <p className="error">{status.error}</p> : null}
          {status.success ? <p className="success">{status.success}</p> : null}

          <div className="form-row" style={{ gap: '0.75rem' }}>
            <button className="primary-btn" type="submit" disabled={status.loading}>
              {status.loading ? 'Saving…' : editingId ? 'Update report' : 'Save report'}
            </button>
            {editingId ? (
              <button
                className="ghost-btn"
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setForm(initialForm)
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
            <p className="eyebrow">Recent entries</p>
            <h2 className="title-sm">Daily reports</h2>
          </div>
          <div className="form-field" style={{ minWidth: '200px' }}>
            <span>Filter date</span>
            <input
              type="date"
              name="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className="badge">{items.length} records</div>
        </div>
        <div className="table">
          <div className="table__head">
            <span>Material</span>
            <span>Qty</span>
            <span>Panel</span>
            <span>Circuit</span>
            <span>Location</span>
            <span>Notes</span>
            <span />
          </div>
          <div className="table__body">
            {items.map((row) => (
              <div key={row._id} className="table__row">
                <span>{row.materialName}</span>
                <span>
                  {row.quantity} {row.unit}
                </span>
                <span>{row.panelName || '—'}</span>
                <span>{row.circuit || '—'}</span>
                <span>{row.location || '—'}</span>
                <span>{row.notes || '—'}</span>
                <span className="table__actions">
                  <button className="ghost-btn" type="button" onClick={() => handleEdit(row)}>
                    Edit
                  </button>
                  <button className="ghost-btn" type="button" onClick={() => handleDelete(row._id)}>
                    Delete
                  </button>
                </span>
              </div>
            ))}
            {items.length === 0 ? <div className="muted">No entries yet.</div> : null}
          </div>
        </div>
      </section>
    </div>
  )
}

export default DailyReport

