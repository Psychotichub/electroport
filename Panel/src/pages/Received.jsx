import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createReceived, deleteReceived, fetchMaterials, fetchReceivedByDate, updateReceived } from '../services/userApi'

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  materialName: '',
  quantity: '',
  unit: '',
  supplier: '',
  location: '',
  notes: '',
}

const Received = () => {
  const { user } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [items, setItems] = useState([])
  const [materials, setMaterials] = useState([])
  const [status, setStatus] = useState({ loading: false, error: '', success: '' })
  const [dateFilter, setDateFilter] = useState(emptyForm.date)
  const [editingId, setEditingId] = useState(null)
  const materialUnitMap = useMemo(() => {
    const map = new Map()
    materials.forEach((m) => {
      if (m.materialName && m.unit) map.set(m.materialName, m.unit)
    })
    return map
  }, [materials])

  const load = async (date) => {
    try {
      const targetDate = date || dateFilter || new Date().toISOString().slice(0, 10)
      const [list, mats] = await Promise.all([fetchReceivedByDate(targetDate), fetchMaterials()])
      setItems(list)
      setMaterials(mats)
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
        await updateReceived(editingId, { ...form, quantity: Number(form.quantity) })
        setStatus({ loading: false, error: '', success: 'Received item updated' })
      } else {
        await createReceived({ ...form, quantity: Number(form.quantity) })
        setStatus({ loading: false, error: '', success: 'Received item logged' })
      }
      setForm(emptyForm)
      setEditingId(null)
      await load(dateFilter)
    } catch (error) {
      setStatus({ loading: false, error: error?.response?.data?.message || 'Failed to save item', success: '' })
    }
  }

  const handleEdit = (row) => {
    setEditingId(row._id)
    setForm({
      date: row.date ? String(row.date).slice(0, 10) : emptyForm.date,
      materialName: row.materialName || '',
      quantity: row.quantity || '',
      unit: row.unit || '',
      supplier: row.supplier || '',
      location: row.location || '',
      notes: row.notes || '',
    })
  }

  const handleDelete = async (id) => {
    await deleteReceived(id)
    await load()
  }

  return (
    <div className="stack gap-lg">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Received</p>
            <h1 className="title">Confirm deliveries</h1>
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
              <span>Supplier</span>
              <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="Optional" />
            </label>
            <label className="form-field">
              <span>Location</span>
              <input name="location" value={form.location} onChange={handleChange} placeholder="Optional" />
            </label>
          </div>

          <label className="form-field">
            <span>Notes</span>
            <input name="notes" value={form.notes} onChange={handleChange} placeholder="Optional" />
          </label>

          {status.error ? <p className="error">{status.error}</p> : null}
          {status.success ? <p className="success">{status.success}</p> : null}

          <div className="form-row" style={{ gap: '0.75rem' }}>
            <button className="primary-btn" type="submit" disabled={status.loading}>
              {status.loading ? 'Saving…' : editingId ? 'Update' : 'Save'}
            </button>
            {editingId ? (
              <button
                className="ghost-btn"
                type="button"
                onClick={() => {
                  setEditingId(null)
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
            <p className="eyebrow">Records</p>
            <h2 className="title-sm">Received items</h2>
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
            <span>Supplier</span>
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
                <span>{row.supplier}</span>
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

export default Received

